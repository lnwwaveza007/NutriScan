import React, { useState, useEffect } from 'react';
import { Utensils, Flame, ChevronLeft, Loader2, CheckCircle, Info } from 'lucide-react';
import { AppView, DayLog, FoodLogEntry, NutritionalInfo, UserProfile } from './types';
import { getTodayLog, saveLogEntry, getUserProfile, saveUserProfile } from './services/storage';
import { analyzeFoodImage } from './services/gemini';
import { StatsOverview } from './components/StatsOverview';
import { ScanButton } from './components/ScanButton';
import { Onboarding } from './components/Onboarding';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [todayLog, setTodayLog] = useState<DayLog>({ date: '', entries: [], totalCalories: 0 });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<NutritionalInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dailyGoal, setDailyGoal] = useState<number>(2000);

  useEffect(() => {
    // Check for user profile
    const profile = getUserProfile();
    if (!profile) {
      setView(AppView.ONBOARDING);
    } else {
      setDailyGoal(profile.dailyCalorieGoal);
      // Load logs
      const log = getTodayLog();
      setTodayLog(log);
    }
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => {
    saveUserProfile(profile);
    setDailyGoal(profile.dailyCalorieGoal);
    const log = getTodayLog();
    setTodayLog(log);
    setView(AppView.DASHBOARD);
  };

  const handleImageSelect = (base64: string) => {
    setCurrentImage(base64);
    setView(AppView.ANALYZING);
    analyzeImage(base64);
  };

  const analyzeImage = async (base64: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeFoodImage(base64);
      setAnalysisResult(result);
      setView(AppView.RESULT);
    } catch (e) {
      setError("Could not analyze image. Please try again.");
      setView(AppView.DASHBOARD); // Return to dashboard on error for now
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveEntry = () => {
    if (analysisResult) {
      const newEntry: FoodLogEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        image: currentImage,
        info: analysisResult,
      };
      const updatedLog = saveLogEntry(newEntry);
      setTodayLog(updatedLog);
      setView(AppView.DASHBOARD);
      setAnalysisResult(null);
      setCurrentImage(null);
    }
  };

  const handleCancel = () => {
    setView(AppView.DASHBOARD);
    setAnalysisResult(null);
    setCurrentImage(null);
  };

  if (view === AppView.ONBOARDING) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-800">
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <Flame className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">NutriScan AI</h1>
            </div>
            <div className="text-xs font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6">
        
        {/* VIEW: DASHBOARD */}
        {view === AppView.DASHBOARD && (
          <div className="space-y-8 animate-fade-in">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                    <Info className="w-4 h-4" /> {error}
                </div>
            )}
            
            <StatsOverview todayLog={todayLog} recentLogs={{}} dailyGoal={dailyGoal} />

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-gray-400" />
                Today's Meals
              </h3>
              
              {todayLog.entries.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm">No meals tracked yet.</p>
                  <p className="text-gray-400 text-xs mt-1">Tap the camera button to start.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayLog.entries.slice().reverse().map((entry) => (
                    <div key={entry.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center">
                        {entry.image && (
                            <img src={entry.image} alt={entry.info.foodName} className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{entry.info.foodName}</h4>
                            <p className="text-xs text-gray-500 truncate">{entry.info.portionEstimate}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                                <span className="font-medium text-emerald-600">{entry.info.calories} kcal</span>
                                <span>P: {entry.info.protein}g</span>
                                <span>C: {entry.info.carbs}g</span>
                                <span>F: {entry.info.fat}g</span>
                            </div>
                        </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <ScanButton onImageSelect={handleImageSelect} />
          </div>
        )}

        {/* VIEW: ANALYZING */}
        {view === AppView.ANALYZING && (
          <div className="flex flex-col items-center justify-center pt-20 space-y-6 animate-pulse">
            <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <Loader2 className="absolute inset-0 m-auto text-primary w-10 h-10 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Analyzing your food...</h2>
            <p className="text-gray-500 text-center max-w-xs px-4">
              Our AI is strictly evaluating portion sizes and ingredients for accuracy.
            </p>
          </div>
        )}

        {/* VIEW: RESULT */}
        {view === AppView.RESULT && analysisResult && (
          <div className="animate-fade-in pb-20">
            <button 
                onClick={handleCancel}
                className="mb-4 text-sm text-gray-500 flex items-center gap-1 hover:text-gray-900"
            >
                <ChevronLeft className="w-4 h-4" /> Cancel
            </button>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Image Header */}
                <div className="relative h-56 bg-gray-100">
                    {currentImage && <img src={currentImage} alt="Analyzed Food" className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h2 className="text-2xl font-bold">{analysisResult.foodName}</h2>
                        <p className="opacity-90 text-sm font-medium">{analysisResult.portionEstimate}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    
                    {/* Calories */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                        <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">Estimated Energy</p>
                            <p className="text-4xl font-black text-gray-900 mt-1">{analysisResult.calories} <span className="text-lg font-medium text-gray-500">kcal</span></p>
                        </div>
                        <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide">
                            AI Verified
                        </div>
                    </div>

                    {/* Macros Grid */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-blue-50 p-3 rounded-xl">
                            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Protein</p>
                            <p className="text-xl font-bold text-gray-900">{analysisResult.protein}g</p>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-xl">
                            <p className="text-xs text-amber-600 font-bold uppercase mb-1">Carbs</p>
                            <p className="text-xl font-bold text-gray-900">{analysisResult.carbs}g</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-xl">
                            <p className="text-xs text-red-600 font-bold uppercase mb-1">Fat</p>
                            <p className="text-xl font-bold text-gray-900">{analysisResult.fat}g</p>
                        </div>
                    </div>

                    {/* Reasoning */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                            <Info className="w-4 h-4 text-primary" /> Analysis Notes
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {analysisResult.reasoning}
                        </p>
                    </div>

                    {/* Actions */}
                    <button 
                        onClick={handleSaveEntry}
                        className="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-5 h-5" />
                        Log Meal
                    </button>
                </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
