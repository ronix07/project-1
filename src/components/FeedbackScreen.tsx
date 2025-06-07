import React from 'react';
import { CheckCircle, TrendingUp, Brain, Heart, ArrowRight } from 'lucide-react';
import { SessionData } from '../types';

interface FeedbackScreenProps {
  sessionData: SessionData;
  onContinue: () => void;
}

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ sessionData, onContinue }) => {
  const emotionInsights = [
    {
      metric: 'Authenticity',
      value: sessionData.emotions.authenticity,
      insight: sessionData.emotions.authenticity > 80 
        ? 'You expressed yourself genuinely and openly.' 
        : 'Consider being more open in future conversations.',
      icon: Heart,
      color: 'from-pink-500 to-rose-500'
    },
    {
      metric: 'Engagement',
      value: sessionData.emotions.engagement,
      insight: sessionData.emotions.engagement > 75 
        ? 'You showed strong interest and participation.' 
        : 'Try to engage more actively with the questions.',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      metric: 'Confidence',
      value: sessionData.emotions.confidence,
      insight: sessionData.emotions.confidence > 70 
        ? 'You demonstrated self-assurance in your responses.' 
        : 'Building confidence will enhance your future growth.',
      icon: Brain,
      color: 'from-purple-500 to-indigo-500'
    }
  ];

  const getGrade = (value: number) => {
    if (value >= 90) return 'A+';
    if (value >= 80) return 'A';
    if (value >= 70) return 'B+';
    if (value >= 60) return 'B';
    return 'C+';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Level {sessionData.level} Complete!
          </h2>
          <p className="text-xl text-gray-400">
            Here's what we learned about you in this session
          </p>
        </div>

        {/* AI Response */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8">
          <h3 className="text-2xl font-semibold text-white mb-4">AI Agent Insights</h3>
          <p className="text-gray-300 text-lg leading-relaxed">
            "{sessionData.aiResponse}"
          </p>
        </div>

        {/* Emotion Analysis */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {emotionInsights.map((insight) => (
            <div key={insight.metric} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${insight.color} rounded-lg flex items-center justify-center`}>
                  <insight.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {getGrade(insight.value)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {Math.round(insight.value)}%
                  </div>
                </div>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">{insight.metric}</h4>
              <p className="text-gray-400 text-sm">{insight.insight}</p>
            </div>
          ))}
        </div>

        {/* Detailed Feedback */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8">
          <h3 className="text-2xl font-semibold text-white mb-4">Detailed Analysis</h3>
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            {sessionData.feedback}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-green-400 mb-3">Strengths Identified</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Thoughtful self-reflection
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Clear communication skills
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  Emotional awareness
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-blue-400 mb-3">Growth Opportunities</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-blue-400 mr-2" />
                  Expand comfort zone
                </li>
                <li className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-blue-400 mr-2" />
                  Develop leadership skills
                </li>
                <li className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-blue-400 mr-2" />
                  Build strategic thinking
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={onContinue}
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
          >
            <span>Continue Journey</span>
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
};