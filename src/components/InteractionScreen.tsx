import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Camera, CameraOff, Send, Bot } from 'lucide-react';
import { SessionData, EmotionData } from '../types';

interface InteractionScreenProps {
  level: number;
  onComplete: (sessionData: SessionData) => void;
}

const levelQuestions = {
  1: [
    "Tell me about your core values. What principles guide your daily decisions?",
    "How would your closest friends describe your personality?",
    "What experiences have shaped who you are today?"
  ],
  2: [
    "How do you typically handle stress or difficult emotions?",
    "Describe a time when you had to navigate a challenging interpersonal situation.",
    "What role does empathy play in your relationships?"
  ],
  3: [
    "What are your biggest aspirations for the future?",
    "How do you define success in your life?",
    "What obstacles do you anticipate on your path to achieving your goals?"
  ],
  4: [
    "Tell me about a significant challenge you've overcome.",
    "How do you adapt when plans don't go as expected?",
    "What have been your most important learning experiences?"
  ],
  5: [
    "Where do you see yourself in the timeframe you specified?",
    "What kind of person do you want to become?",
    "What legacy do you want to leave behind?"
  ]
};

export const InteractionScreen: React.FC<InteractionScreenProps> = ({ level, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [responses, setResponses] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [emotions, setEmotions] = useState<EmotionData>({
    happiness: 75,
    confidence: 68,
    stress: 25,
    engagement: 85,
    authenticity: 90
  });

  const questions = levelQuestions[level as keyof typeof levelQuestions] || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Simulate emotion changes
  useEffect(() => {
    const interval = setInterval(() => {
      setEmotions(prev => ({
        happiness: Math.max(40, Math.min(100, prev.happiness + (Math.random() - 0.5) * 10)),
        confidence: Math.max(30, Math.min(100, prev.confidence + (Math.random() - 0.5) * 8)),
        stress: Math.max(0, Math.min(60, prev.stress + (Math.random() - 0.5) * 12)),
        engagement: Math.max(50, Math.min(100, prev.engagement + (Math.random() - 0.5) * 6)),
        authenticity: Math.max(60, Math.min(100, prev.authenticity + (Math.random() - 0.5) * 4))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleResponseSubmit = () => {
    if (!userResponse.trim()) return;

    const newResponses = [...responses, userResponse];
    setResponses(newResponses);
    setUserResponse('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Complete the session
      const sessionData: SessionData = {
        level,
        transcript: newResponses.join(' | '),
        emotions,
        aiResponse: generateAIResponse(newResponses),
        feedback: generateFeedback(newResponses, emotions),
        timestamp: new Date()
      };
      onComplete(sessionData);
    }
  };

  const generateAIResponse = (responses: string[]): string => {
    const insights = [
      "I'm impressed by your self-awareness and thoughtful responses.",
      "Your answers reveal a strong foundation for future growth.",
      "I can see genuine authenticity in how you express yourself.",
      "Your perspective shows both wisdom and curiosity."
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  };

  const generateFeedback = (responses: string[], emotions: EmotionData): string => {
    return `Based on our conversation, you demonstrate ${emotions.authenticity > 80 ? 'high' : 'moderate'} authenticity and ${emotions.engagement > 75 ? 'strong' : 'good'} engagement. Your emotional stability appears ${emotions.stress < 30 ? 'excellent' : 'good'}.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Level {level} - AI Conversation
          </h2>
          <p className="text-gray-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6">
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl h-80 flex items-center justify-center overflow-hidden">
                {cameraOn ? (
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <Bot className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-white text-lg">AI Agent Active</p>
                        <p className="text-gray-400 text-sm">Analyzing expressions and emotions</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <CameraOff className="w-16 h-16 mx-auto mb-4" />
                    <p>Camera is off</p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setCameraOn(!cameraOn)}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    cameraOn 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {cameraOn ? <Camera className="w-5 h-5 text-white" /> : <CameraOff className="w-5 h-5 text-white" />}
                </button>
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {isRecording ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-white" />}
                </button>
              </div>
            </div>

            {/* Conversation Area */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="mb-6">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 flex-1">
                    <p className="text-white">{currentQuestion}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                  rows={3}
                />
                <button
                  onClick={handleResponseSubmit}
                  disabled={!userResponse.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Emotion Panel */}
          <div className="space-y-6">
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
                  {responses.length} responses recorded
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};