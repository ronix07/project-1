import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Camera, CameraOff, Volume2, VolumeX, Bot, User } from 'lucide-react';
import { SessionData, EmotionData } from '../types';
import { TavusService, VideoAnalysis } from '../services/tavusService';
import { ElevenLabsService } from '../services/elevenLabsService';
import { SpeechRecognitionService, SpeechRecognitionResult } from '../services/speechRecognitionService';

interface VoiceInteractionScreenProps {
  level: number;
  onComplete: (sessionData: SessionData) => void;
}

const levelQuestions = {
  1: [
    "Hello! I'm your AI mentor. Let's start by getting to know you better. Tell me about your core values - what principles guide your daily decisions?",
    "That's fascinating. How would your closest friends describe your personality? What would they say are your strongest traits?",
    "I'd love to hear more about your journey. What experiences have shaped who you are today?"
  ],
  2: [
    "Now let's explore your emotional intelligence. How do you typically handle stress or difficult emotions when they arise?",
    "Can you describe a time when you had to navigate a challenging interpersonal situation? How did you approach it?",
    "What role does empathy play in your relationships with others?"
  ],
  3: [
    "Let's talk about your future aspirations. What are your biggest goals and dreams for the years ahead?",
    "How do you personally define success in your life? What does it look like to you?",
    "What obstacles or challenges do you anticipate on your path to achieving these goals?"
  ],
  4: [
    "I'd like to understand your resilience. Tell me about a significant challenge you've overcome in your life.",
    "How do you typically adapt when plans don't go as expected? Can you give me an example?",
    "What have been your most important learning experiences, and how have they changed you?"
  ],
  5: [
    "This is our final conversation. Looking ahead to the timeframe you specified, where do you see yourself?",
    "What kind of person do you want to become? What qualities do you want to develop?",
    "What legacy do you want to leave behind? How do you want to be remembered?"
  ]
};

export const VoiceInteractionScreen: React.FC<VoiceInteractionScreenProps> = ({ level, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userTranscript, setUserTranscript] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{speaker: 'ai' | 'user', text: string}>>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [emotions, setEmotions] = useState<EmotionData>({
    happiness: 75,
    confidence: 68,
    stress: 25,
    engagement: 85,
    authenticity: 90
  });

  // Service instances
  const tavusService = useRef<TavusService | null>(null);
  const elevenLabsService = useRef<ElevenLabsService | null>(null);
  const speechService = useRef<SpeechRecognitionService | null>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentTranscriptRef = useRef<string>('');

  const questions = levelQuestions[level as keyof typeof levelQuestions] || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize Tavus service
        tavusService.current = new TavusService('4f6e653f859e4f0fa0aba96b27ccf855');
        
        // Initialize ElevenLabs service
        elevenLabsService.current = new ElevenLabsService('sk_2689c1b088ab2cfaa6ff59bfca30af9c69d00302b52f0b26');
        
        // Initialize Speech Recognition
        speechService.current = new SpeechRecognitionService();

        // Start camera and video analysis
        if (cameraOn && videoRef.current) {
          const stream = await tavusService.current.initializeCamera();
          await tavusService.current.startVideoAnalysis(videoRef.current, handleVideoAnalysis);
        }

        // Speak the first question
        if (currentQuestion) {
          await speakQuestion(currentQuestion);
        }
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    };

    initializeServices();

    return () => {
      // Cleanup
      tavusService.current?.stopVideoAnalysis();
      elevenLabsService.current?.stopCurrentAudio();
      speechService.current?.stopListening();
    };
  }, []);

  // Handle video analysis results
  const handleVideoAnalysis = (analysis: VideoAnalysis) => {
    setEmotions(analysis.emotions);
  };

  // Speak AI question
  const speakQuestion = async (question: string) => {
    if (!elevenLabsService.current) return;
    
    setIsSpeaking(true);
    setConversationHistory(prev => [...prev, { speaker: 'ai', text: question }]);
    
    try {
      await elevenLabsService.current.speakText(question);
    } catch (error) {
      console.error('Error speaking question:', error);
    } finally {
      setIsSpeaking(false);
      // Start listening for user response after AI finishes speaking
      startListening();
    }
  };

  // Start listening for user speech
  const startListening = () => {
    if (!speechService.current || !micOn) return;

    setIsListening(true);
    currentTranscriptRef.current = '';
    
    speechService.current.startListening(
      (result: SpeechRecognitionResult) => {
        if (result.isFinal) {
          currentTranscriptRef.current += result.transcript + ' ';
          setUserTranscript(currentTranscriptRef.current);
        } else {
          setUserTranscript(currentTranscriptRef.current + result.transcript);
        }
      },
      () => {
        // On speech end
        if (currentTranscriptRef.current.trim()) {
          handleUserResponse(currentTranscriptRef.current.trim());
        }
        setIsListening(false);
      }
    );
  };

  // Stop listening
  const stopListening = () => {
    if (speechService.current) {
      speechService.current.stopListening();
      setIsListening(false);
    }
  };

  // Handle user response
  const handleUserResponse = async (response: string) => {
    if (!response.trim()) return;

    // Add user response to conversation
    setConversationHistory(prev => [...prev, { speaker: 'user', text: response }]);
    setUserTranscript('');

    // Move to next question or complete session
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      
      // Wait a moment then ask next question
      setTimeout(async () => {
        const nextQuestion = questions[currentQuestionIndex + 1];
        await speakQuestion(nextQuestion);
      }, 2000);
    } else {
      // Complete the session
      completeSession();
    }
  };

  // Complete the session
  const completeSession = () => {
    const transcript = conversationHistory
      .map(item => `${item.speaker.toUpperCase()}: ${item.text}`)
      .join('\n');

    const sessionData: SessionData = {
      level,
      transcript,
      emotions,
      aiResponse: generateAIResponse(),
      feedback: generateFeedback(),
      timestamp: new Date()
    };

    onComplete(sessionData);
  };

  const generateAIResponse = (): string => {
    const insights = [
      "I'm impressed by your thoughtful responses and genuine self-reflection throughout our conversation.",
      "Your answers reveal a strong foundation for personal growth and a clear understanding of your values.",
      "I can sense your authenticity and commitment to personal development in how you express yourself.",
      "Your perspective demonstrates both emotional maturity and a genuine curiosity about your future potential."
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  };

  const generateFeedback = (): string => {
    return `Based on our voice conversation and video analysis, you demonstrate ${emotions.authenticity > 80 ? 'exceptional' : 'strong'} authenticity and ${emotions.engagement > 75 ? 'high' : 'good'} engagement levels. Your emotional stability and confidence show great potential for future growth.`;
  };

  // Toggle camera
  const toggleCamera = async () => {
    setCameraOn(!cameraOn);
    if (!cameraOn && videoRef.current && tavusService.current) {
      try {
        const stream = await tavusService.current.initializeCamera();
        await tavusService.current.startVideoAnalysis(videoRef.current, handleVideoAnalysis);
      } catch (error) {
        console.error('Error starting camera:', error);
      }
    } else if (cameraOn && tavusService.current) {
      tavusService.current.stopVideoAnalysis();
    }
  };

  // Toggle microphone
  const toggleMic = () => {
    setMicOn(!micOn);
    if (micOn && isListening) {
      stopListening();
    }
  };

  // Manual start/stop listening
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Level {level} - Voice Conversation
          </h2>
          <p className="text-gray-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6">
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl h-96 overflow-hidden">
                {cameraOn ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover rounded-xl"
                    autoPlay
                    muted
                    playsInline
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <CameraOff className="w-16 h-16 mx-auto mb-4" />
                      <p>Camera is off</p>
                    </div>
                  </div>
                )}

                {/* AI Status Overlay */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-blue-400" />
                    <span className="text-white text-sm">
                      {isSpeaking ? 'AI Speaking...' : isListening ? 'Listening...' : 'Ready'}
                    </span>
                    {(isSpeaking || isListening) && (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>

                {/* Recording Indicator */}
                {isListening && (
                  <div className="absolute top-4 right-4 bg-red-500/80 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-white text-sm">Recording</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={toggleCamera}
                  className={`p-4 rounded-full transition-all duration-300 ${
                    cameraOn 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {cameraOn ? <Camera className="w-6 h-6 text-white" /> : <CameraOff className="w-6 h-6 text-white" />}
                </button>

                <button
                  onClick={toggleMic}
                  className={`p-4 rounded-full transition-all duration-300 ${
                    micOn 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {micOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
                </button>

                <button
                  onClick={toggleListening}
                  disabled={!micOn || isSpeaking}
                  className={`p-4 rounded-full transition-all duration-300 ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-purple-600 hover:bg-purple-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                </button>

                <button
                  className={`p-4 rounded-full transition-all duration-300 ${
                    isSpeaking 
                      ? 'bg-blue-500 animate-pulse' 
                      : 'bg-gray-600'
                  }`}
                  disabled
                >
                  {isSpeaking ? <Volume2 className="w-6 h-6 text-white" /> : <VolumeX className="w-6 h-6 text-white" />}
                </button>
              </div>
            </div>

            {/* Conversation Display */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Conversation</h3>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {conversationHistory.map((item, index) => (
                  <div key={index} className={`flex ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      item.speaker === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white/10 text-gray-300'
                    }`}>
                      <div className="flex items-center space-x-2 mb-1">
                        {item.speaker === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                        <span className="text-xs opacity-75">
                          {item.speaker === 'user' ? 'You' : 'AI Mentor'}
                        </span>
                      </div>
                      <p className="text-sm">{item.text}</p>
                    </div>
                  </div>
                ))}
                
                {/* Current user transcript */}
                {userTranscript && (
                  <div className="flex justify-end">
                    <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-blue-600/50 text-white border-2 border-blue-400">
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="w-4 h-4" />
                        <span className="text-xs opacity-75">You (speaking...)</span>
                      </div>
                      <p className="text-sm">{userTranscript}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="space-y-6">
            {/* Real-time Emotions */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Real-time Analysis</h3>
              <div className="space-y-4">
                {Object.entries(emotions).map(([emotion, value]) => (
                  <div key={emotion}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 capitalize">{emotion}</span>
                      <span className="text-white">{Math.round(value)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          emotion === 'stress' 
                            ? 'bg-gradient-to-r from-red-500 to-orange-500'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Progress</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
                <p className="text-gray-400 text-sm">
                  {conversationHistory.filter(item => item.speaker === 'user').length} responses recorded
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">How it works</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  AI asks questions via voice
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Speak your response naturally
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                  Camera analyzes your emotions
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-pink-400 rounded-full mr-2"></div>
                  AI provides personalized feedback
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};