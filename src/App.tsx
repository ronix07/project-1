import React, { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RegistrationScreen } from './components/RegistrationScreen';
import { LevelSelector } from './components/LevelSelector';
import { VoiceInteractionScreen } from './components/VoiceInteractionScreen';
import { FeedbackScreen } from './components/FeedbackScreen';
import { PredictionScreen } from './components/PredictionScreen';
import { User, SessionData, Prediction, AppState } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionData[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('futureYouUser');
    const savedLevel = localStorage.getItem('futureYouCurrentLevel');
    const savedCompleted = localStorage.getItem('futureYouCompletedLevels');
    const savedHistory = localStorage.getItem('futureYouSessionHistory');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setAppState('level-select');
    }
    if (savedLevel) {
      setCurrentLevel(parseInt(savedLevel));
    }
    if (savedCompleted) {
      setCompletedLevels(JSON.parse(savedCompleted));
    }
    if (savedHistory) {
      setSessionHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save data to localStorage
  const saveData = () => {
    if (user) localStorage.setItem('futureYouUser', JSON.stringify(user));
    localStorage.setItem('futureYouCurrentLevel', currentLevel.toString());
    localStorage.setItem('futureYouCompletedLevels', JSON.stringify(completedLevels));
    localStorage.setItem('futureYouSessionHistory', JSON.stringify(sessionHistory));
  };

  const handleStart = () => {
    setAppState('registration');
  };

  const handleRegistrationComplete = (userData: User) => {
    setUser(userData);
    setAppState('level-select');
    saveData();
  };

  const handleLevelSelect = (level: number) => {
    setSelectedLevel(level);
    setAppState('interaction');
  };

  const handleSessionComplete = (data: SessionData) => {
    setSessionData(data);
    const newHistory = [...sessionHistory, data];
    setSessionHistory(newHistory);
    
    if (!completedLevels.includes(data.level)) {
      const newCompleted = [...completedLevels, data.level];
      setCompletedLevels(newCompleted);
      
      if (data.level === currentLevel && currentLevel < 5) {
        setCurrentLevel(currentLevel + 1);
      }
    }
    
    setAppState('feedback');
    saveData();
  };

  const handleFeedbackContinue = () => {
    if (completedLevels.length === 5) {
      setAppState('prediction');
    } else {
      setAppState('level-select');
    }
  };

  const generatePrediction = (): Prediction => {
    const predictions: Prediction = {
      careerStage: "Senior Leadership Professional",
      personalityDevelopment: [
        "Enhanced emotional intelligence and empathy",
        "Stronger decision-making capabilities under pressure",
        "Improved ability to inspire and motivate others",
        "Greater self-awareness and authenticity",
        "Advanced communication and conflict resolution skills"
      ],
      emotionalIntelligence: "You will have developed exceptional emotional intelligence, allowing you to navigate complex interpersonal dynamics with ease and lead with both confidence and compassion.",
      growthRoadmap: [
        "Develop advanced leadership skills through challenging projects",
        "Build a strong professional network and mentoring relationships",
        "Expand expertise through continuous learning and education",
        "Take on increasing levels of responsibility and impact",
        "Establish yourself as a thought leader in your field",
        "Create lasting positive change in your organization and community"
      ],
      confidenceScore: 92
    };
    return predictions;
  };

  const handleRestart = () => {
    // Clear all data
    localStorage.removeItem('futureYouUser');
    localStorage.removeItem('futureYouCurrentLevel');
    localStorage.removeItem('futureYouCompletedLevels');
    localStorage.removeItem('futureYouSessionHistory');
    
    // Reset state
    setUser(null);
    setCurrentLevel(1);
    setCompletedLevels([]);
    setSessionHistory([]);
    setSessionData(null);
    setSelectedLevel(null);
    setAppState('welcome');
  };

  // Render current screen
  switch (appState) {
    case 'welcome':
      return <WelcomeScreen onStart={handleStart} />;
    
    case 'registration':
      return <RegistrationScreen onComplete={handleRegistrationComplete} />;
    
    case 'level-select':
      return (
        <LevelSelector
          currentLevel={currentLevel}
          completedLevels={completedLevels}
          onSelectLevel={handleLevelSelect}
        />
      );
    
    case 'interaction':
      if (!selectedLevel) return null;
      return (
        <VoiceInteractionScreen
          level={selectedLevel}
          onComplete={handleSessionComplete}
        />
      );
    
    case 'feedback':
      if (!sessionData) return null;
      return (
        <FeedbackScreen
          sessionData={sessionData}
          onContinue={handleFeedbackContinue}
        />
      );
    
    case 'prediction':
      if (!user) return null;
      return (
        <PredictionScreen
          user={user}
          prediction={generatePrediction()}
          onRestart={handleRestart}
        />
      );
    
    default:
      return <WelcomeScreen onStart={handleStart} />;
  }
}

export default App;