import React from 'react';
import { Italic as Crystal, TrendingUp, Star, Target, Download, Share } from 'lucide-react';
import { User, Prediction } from '../types';

interface PredictionScreenProps {
  user: User;
  prediction: Prediction;
  onRestart: () => void;
}

export const PredictionScreen: React.FC<PredictionScreenProps> = ({ user, prediction, onRestart }) => {
  const futureAge = user.age + user.yearsToPredict;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-5xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg shadow-purple-500/30">
            <Crystal className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Your Future Self
          </h1>
          <p className="text-xl text-gray-400 mb-2">
            Based on our AI analysis, here's who you'll be in {user.yearsToPredict} years
          </p>
          <p className="text-gray-500">
            {user.name} at age {futureAge}
          </p>
        </div>

        {/* Main Prediction Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Your Future Vision</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                In {user.yearsToPredict} years, you will have transformed into a {prediction.careerStage} with 
                significantly enhanced emotional intelligence and leadership capabilities. Your journey of 
                self-discovery and growth will have shaped you into someone who impacts others positively.
              </p>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-1" />
                  <span className="text-white font-semibold">Confidence Score: {prediction.confidenceScore}%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{futureAge}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Future You</h3>
                <p className="text-purple-300">{prediction.careerStage}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Predictions */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Personality Development */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Personality Growth</h3>
            </div>
            <ul className="space-y-3">
              {prediction.personalityDevelopment.map((trait, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3" />
                  <span className="text-gray-300">{trait}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Emotional Intelligence */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mr-3">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Emotional Intelligence</h3>
            </div>
            <p className="text-gray-300 mb-4">{prediction.emotionalIntelligence}</p>
            <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-lg p-4 border border-pink-500/30">
              <p className="text-pink-300 text-sm">
                Your EQ will be one of your greatest assets, enabling deeper connections and leadership success.
              </p>
            </div>
          </div>
        </div>

        {/* Growth Roadmap */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">Your Growth Roadmap</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prediction.growthRoadmap.map((milestone, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <span className="text-green-400 text-sm font-semibold">
                    Year {Math.ceil((index + 1) * (user.yearsToPredict / prediction.growthRoadmap.length))}
                  </span>
                </div>
                <p className="text-gray-300 text-sm">{milestone}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg">
            <Download className="w-5 h-5 mr-2" />
            Download Report
          </button>
          
          <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg">
            <Share className="w-5 h-5 mr-2" />
            Share Results
          </button>
          
          <button
            onClick={onRestart}
            className="inline-flex items-center px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
          >
            Start New Journey
          </button>
        </div>
      </div>
    </div>
  );
};