import React, { useState } from 'react';
import { ActivityLevel, UserProfile } from '../types';
import { Ruler, Weight, User, Activity, Target, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    gender: 'male',
    activityLevel: ActivityLevel.SEDENTARY,
  });

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { weight, height, age, gender, activityLevel, targetWeight } = formData;
    
    if (!weight || !height || !age || !gender || !activityLevel || targetWeight === undefined) return;

    // Mifflin-St Jeor Equation
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += gender === 'male' ? 5 : -161;

    const tdee = bmr * activityLevel;
    
    let goal = tdee;
    if (targetWeight < weight) {
      // Weight loss: ~0.5kg per week = -500kcal/day
      goal = tdee - 500;
    } else if (targetWeight > weight) {
      // Weight gain
      goal = tdee + 300;
    }

    // Safety floors: 1200 for women, 1500 for men
    const minCalories = gender === 'female' ? 1200 : 1500;
    goal = Math.max(Math.round(goal), minCalories);

    onComplete({
      ...(formData as UserProfile),
      dailyCalorieGoal: goal
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center p-6 animate-fade-in">
      <div className="max-w-md mx-auto w-full">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-gray-900 mb-2 text-primary">NutriScan AI</h1>
            <p className="text-gray-500">Strict tracking for real results.</p>
        </div>

        <h2 className="text-xl font-bold mb-6 text-gray-800">Tell us about yourself</h2>

        <form onSubmit={calculateAndSubmit} className="space-y-5">
            {/* Gender */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => handleChange('gender', 'male')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.gender === 'male' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-400'}`}
                >
                    <User className="w-6 h-6" />
                    <span className="font-bold">Male</span>
                </button>
                <button
                    type="button"
                    onClick={() => handleChange('gender', 'female')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.gender === 'female' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-400'}`}
                >
                    <User className="w-6 h-6" />
                    <span className="font-bold">Female</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                        <Ruler className="w-3 h-3" /> Height (cm)
                    </label>
                    <input 
                        type="number" 
                        required
                        className="w-full bg-transparent text-2xl font-bold text-gray-900 focus:outline-none" 
                        placeholder="175"
                        onChange={(e) => handleChange('height', Number(e.target.value))}
                    />
                </div>
                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                        <User className="w-3 h-3" /> Age
                    </label>
                    <input 
                        type="number" 
                        required
                        className="w-full bg-transparent text-2xl font-bold text-gray-900 focus:outline-none" 
                        placeholder="25"
                        onChange={(e) => handleChange('age', Number(e.target.value))}
                    />
                </div>
            </div>

            {/* Current Weight */}
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                    <Weight className="w-3 h-3" /> Current Weight (kg)
                </label>
                <input 
                    type="number" 
                    required
                    step="0.1"
                    className="w-full bg-transparent text-2xl font-bold text-gray-900 focus:outline-none" 
                    placeholder="70.5"
                    onChange={(e) => handleChange('weight', Number(e.target.value))}
                />
            </div>

            {/* Target Weight */}
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                    <Target className="w-3 h-3" /> Target Weight (kg)
                </label>
                <input 
                    type="number" 
                    required
                    step="0.1"
                    className="w-full bg-transparent text-2xl font-bold text-gray-900 focus:outline-none" 
                    placeholder="65.0"
                    onChange={(e) => handleChange('targetWeight', Number(e.target.value))}
                />
            </div>

             {/* Activity */}
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                    <Activity className="w-3 h-3" /> Activity Level
                </label>
                <select 
                    className="w-full bg-transparent font-medium text-gray-900 focus:outline-none"
                    onChange={(e) => handleChange('activityLevel', Number(e.target.value))}
                    value={formData.activityLevel}
                >
                    <option value={ActivityLevel.SEDENTARY}>Sedentary (Office job)</option>
                    <option value={ActivityLevel.LIGHTLY_ACTIVE}>Light (1-3 days/week)</option>
                    <option value={ActivityLevel.MODERATELY_ACTIVE}>Moderate (3-5 days/week)</option>
                    <option value={ActivityLevel.VERY_ACTIVE}>Active (6-7 days/week)</option>
                </select>
            </div>

            <button 
                type="submit"
                className="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-4"
            >
                Generate Plan <ArrowRight className="w-5 h-5" />
            </button>
        </form>
      </div>
    </div>
  );
};
