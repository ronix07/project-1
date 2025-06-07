import React from 'react';
import { Play, Lock, CheckCircle } from 'lucide-react';

interface LevelSelectorProps {
  currentLevel: number;
  completedLevels: number[];
  onSelectLevel: (level: number) => void;
}

const levels = [
  {
    id: 1,
    title: "Personal Foundations",
    description: "Explore your core values, beliefs, and personality traits",
    duration: "15-20 minutes",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    title: "Emotional Intelligence",
    description: "Assess your emotional awareness and interpersonal skills",
    duration: "20-25 minutes",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: 3,
    title: "Goals & Ambitions",
    description: "Discuss your aspirations and what drives you forward",
    duration: "25-30 minutes",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: 4,
    title: "Challenges & Growth",
    description: "Examine how you handle obstacles and adapt to change",
    duration: "20-25 minutes",
    color: "from-orange-500 to-red-500"
  },
  {
    id: 5,
    title: "Future Vision",
    description: "Final deep dive into your future self and potential",
    duration: "30-35 minutes",
    color: "from-indigo-500 to-purple-600"
  }
];

export const LevelSelector: React.FC<LevelSelectorProps> = ({ 
  currentLevel, 
  completedLevels, 
  onSelectLevel 
}) => {
  const getStatusIcon = (levelId: number) => {
    if (completedLevels.includes(levelId)) {
      return <CheckCircle className="w-6 h-6 text-green-400" />;
    } else if (levelId <= currentLevel) {
      return <Play className="w-6 h-6 text-white" />;
    } else {
      return <Lock className="w-6 h-6 text-gray-500" />;
    }
  };

  const isAccessible = (levelId: number) => levelId <= currentLevel;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Choose Your Level</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Progress through each level to unlock deeper insights about your future self
          </p>
        </div>

        <div className="grid gap-6">
          {levels.map((level) => {
            const completed = completedLevels.includes(level.id);
            const accessible = isAccessible(level.id);
            
            return (
              <div
                key={level.id}
                className={`relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 transition-all duration-300 ${
                  accessible 
                    ? 'hover:bg-white/15 hover:scale-[1.02] cursor-pointer' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => accessible && onSelectLevel(level.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${level.color} rounded-full flex items-center justify-center shadow-lg`}>
                      {getStatusIcon(level.id)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        Level {level.id}: {level.title}
                      </h3>
                      <p className="text-gray-400 mb-2">{level.description}</p>
                      <span className="text-sm text-gray-500">{level.duration}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {completed && (
                      <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full border border-green-500/30">
                        Completed
                      </span>
                    )}
                    {!completed && accessible && (
                      <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full border border-blue-500/30">
                        Available
                      </span>
                    )}
                    {!accessible && (
                      <span className="inline-block px-3 py-1 bg-gray-500/20 text-gray-500 text-sm rounded-full border border-gray-500/30">
                        Locked
                      </span>
                    )}
                  </div>
                </div>

                {level.id === currentLevel && !completed && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-400">
            Complete all levels to unlock your future prediction
          </p>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {levels.map((level) => (
                <div
                  key={level.id}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    completedLevels.includes(level.id)
                      ? 'bg-green-400'
                      : level.id <= currentLevel
                      ? 'bg-blue-400'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};