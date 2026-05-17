/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Camera, 
  History, 
  Droplets, 
  Settings,
  Flame,
  Target,
  Zap,
  TrendingUp,
  Salad,
  LogOut,
  User,
  Shield,
  Database,
  Search,
  Calculator,
  Moon,
  Sun
} from 'lucide-react';
import { Login } from './components/Login';
import { ImageUpload } from './components/ImageUpload';
import { MealHistory } from './components/MealHistory';
import { MealDetails } from './components/MealDetails';
import { HydrationTracker } from './components/HydrationTracker';
import { ReverseSearch } from './components/ReverseSearch';
import { ManualNutritionEntry } from './components/ManualNutritionEntry';
import { ConfirmationModal } from './components/ConfirmationModal';
import { CalorieChart } from './components/CalorieChart';
import { MealRecord } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

interface LocalUser {
  email: string;
  displayName?: string;
}

type Tab = 'dashboard' | 'analyze' | 'history' | 'hydration' | 'search' | 'settings';

export default function App() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<MealRecord | null>(null);
  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);
  const [isClearAllDataModalOpen, setIsClearAllDataModalOpen] = useState(false);

  // Account Management State
  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nutrismart_dark_mode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('nutrismart_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    const session = localStorage.getItem('nutrismart_session');
    if (session) {
      const userData = JSON.parse(session);
      setUser(userData);
      setDisplayName(userData.displayName || '');
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      setMeals([]);
      return;
    }

    const savedMeals = JSON.parse(localStorage.getItem(`nutrismart_meals_${user.email}`) || '[]');
    setMeals(savedMeals);
  }, [user]);

  const stats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todayMeals = meals.filter(m => m.timestamp >= today);
    
    return {
      calories: todayMeals.reduce((acc, m) => acc + m.analysis.totalNutrition.calories, 0),
      protein: todayMeals.reduce((acc, m) => acc + m.analysis.totalNutrition.protein, 0),
      carbs: todayMeals.reduce((acc, m) => acc + m.analysis.totalNutrition.carbs, 0),
      fat: todayMeals.reduce((acc, m) => acc + m.analysis.totalNutrition.fat, 0),
      count: todayMeals.length
    };
  }, [meals]);

  const handleAnalysisComplete = async (record: MealRecord) => {
    if (!user) return;
    
    try {
      const { id, ...data } = record;
      const newMeal = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        userId: user.email,
        timestamp: Date.now()
      };
      
      const updatedMeals = [newMeal, ...meals];
      setMeals(updatedMeals);
      localStorage.setItem(`nutrismart_meals_${user.email}`, JSON.stringify(updatedMeals));
      
      setSelectedMeal(newMeal);
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Error saving meal:", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdateLoading(true);
    setUpdateMessage(null);
    try {
      const updatedUser = { ...user, displayName };
      setUser(updatedUser);
      localStorage.setItem('nutrismart_session', JSON.stringify(updatedUser));
      
      const users = JSON.parse(localStorage.getItem('nutrismart_users') || '{}');
      if (users[user.email]) {
        users[user.email].displayName = displayName;
        localStorage.setItem('nutrismart_users', JSON.stringify(users));
      }
      
      setUpdateMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setUpdateMessage({ type: 'error', text: error.message });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdateLoading(true);
    setUpdateMessage(null);
    try {
      const users = JSON.parse(localStorage.getItem('nutrismart_users') || '{}');
      if (users[user.email] && users[user.email].password === currentPassword) {
        users[user.email].password = newPassword;
        localStorage.setItem('nutrismart_users', JSON.stringify(users));
        setUpdateMessage({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setUpdateMessage({ type: 'error', text: 'Incorrect current password.' });
      }
    } catch (error: any) {
      setUpdateMessage({ type: 'error', text: error.message });
    } finally {
      setUpdateLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-500">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-white"
        >
          <Salad size={64} />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('nutrismart_session');
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleClearHistory = () => {
    if (!user) return;
    localStorage.removeItem(`nutrismart_meals_${user.email}`);
    setMeals([]);
    setUpdateMessage({ type: 'success', text: 'Meal history cleared successfully!' });
  };

  const handleClearAllData = () => {
    if (!user) return;
    localStorage.removeItem(`nutrismart_meals_${user.email}`);
    setMeals([]);
    setUpdateMessage({ type: 'success', text: 'Meal history cleared successfully!' });
  };

  const NavItem = ({ id, icon: Icon, label, color, onClick }: { id: Tab | 'logout', icon: any, label: string, color: string, onClick?: () => void }) => (
    <button
      onClick={onClick || (() => setActiveTab(id as Tab))}
      className={cn(
        "flex flex-col items-center gap-0.5 md:gap-1 p-2 md:p-3 rounded-2xl transition-all duration-500 group relative flex-1 md:flex-none",
        activeTab === id && id !== 'logout'
          ? `text-white shadow-xl ${color}` 
          : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
      )}
    >
      <Icon size={20} className={cn("md:w-6 md:h-6 transition-transform duration-500", activeTab === id && id !== 'logout' ? "scale-110" : "group-hover:scale-110")} />
      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{label}</span>
      {activeTab === id && id !== 'logout' && (
        <motion.div 
          layoutId="nav-active"
          className="absolute inset-0 rounded-2xl -z-10"
        />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans pb-32 md:pb-0 md:pl-28 overflow-x-hidden transition-colors duration-300">
      {/* Sidebar Navigation (Desktop) */}
      <nav className="fixed left-0 top-0 bottom-0 w-28 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 hidden md:flex flex-col items-center py-6 gap-6 overflow-y-auto scrollbar-hide z-40 shadow-2xl shadow-slate-200/50 dark:shadow-none">
        <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[24px] text-white shadow-2xl shadow-emerald-200 mb-2 transform hover:rotate-6 transition-transform cursor-pointer shrink-0">
          <Salad size={36} />
        </div>
        <div className="flex flex-col gap-4">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Home" color="bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-200" />
          <NavItem id="analyze" icon={Camera} label="Analyze" color="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200" />
          <NavItem id="search" icon={Search} label="Search" color="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200" />
          <NavItem id="history" icon={History} label="History" color="bg-gradient-to-br from-orange-400 to-pink-500 shadow-orange-200" />
          <NavItem id="settings" icon={Settings} label="Settings" color="bg-gradient-to-br from-slate-600 to-slate-800 shadow-slate-200" />
          <NavItem id="hydration" icon={Droplets} label="Water" color="bg-gradient-to-br from-blue-400 to-cyan-500 shadow-blue-200" />
        </div>
        <div className="mt-auto flex flex-col gap-4 pb-6">
          <NavItem id="logout" icon={LogOut} label="Logout" color="bg-red-500" onClick={handleLogout} />
        </div>
      </nav>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-800 flex justify-between items-center p-2 md:hidden z-40 rounded-[24px] shadow-2xl shadow-slate-200/50 dark:shadow-none">
        <NavItem id="dashboard" icon={LayoutDashboard} label="Home" color="bg-indigo-600" />
        <NavItem id="analyze" icon={Camera} label="Analyze" color="bg-emerald-600" />
        <NavItem id="search" icon={Search} label="Search" color="bg-blue-600" />
        <NavItem id="history" icon={History} label="History" color="bg-orange-500" />
        <NavItem id="settings" icon={Settings} label="Settings" color="bg-slate-800" />
        <button onClick={handleLogout} className="flex flex-col items-center gap-0.5 p-2 text-slate-400 flex-1">
          <LogOut size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Exit</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">NutriSmart</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">AI-Powered Nutrition Intelligence</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <User size={20} />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Logged in as</div>
                <div className="text-sm font-black text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{displayName || user.email}</div>
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Stats Overview */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/10 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-700" />
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="p-4 bg-gradient-to-br from-orange-400 to-pink-500 text-white rounded-[20px] shadow-xl shadow-orange-200 group-hover:rotate-12 transition-transform">
                    <Flame size={28} />
                  </div>
                  <span className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Calories</span>
                </div>
                <div className="text-5xl font-black text-slate-800 dark:text-white relative z-10 tabular-nums">{stats.calories}</div>
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-3 relative z-10 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  Today's total intake
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-700" />
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="p-4 bg-gradient-to-br from-emerald-400 to-teal-600 text-white rounded-[20px] shadow-xl shadow-emerald-200 group-hover:rotate-12 transition-transform">
                    <Target size={28} />
                  </div>
                  <span className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Protein</span>
                </div>
                <div className="text-5xl font-black text-slate-800 dark:text-white relative z-10 tabular-nums">{stats.protein}g</div>
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-3 relative z-10 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Building muscle
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-700" />
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="p-4 bg-gradient-to-br from-blue-400 to-indigo-600 text-white rounded-[20px] shadow-xl shadow-blue-200 group-hover:rotate-12 transition-transform">
                    <Zap size={28} />
                  </div>
                  <span className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Carbs</span>
                </div>
                <div className="text-5xl font-black text-slate-800 dark:text-white relative z-10 tabular-nums">{stats.carbs}g</div>
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-3 relative z-10 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Energy levels
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/10 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-700" />
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="p-4 bg-gradient-to-br from-purple-400 to-fuchsia-600 text-white rounded-[20px] shadow-xl shadow-purple-200 group-hover:rotate-12 transition-transform">
                    <TrendingUp size={28} />
                  </div>
                  <span className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Fats</span>
                </div>
                <div className="text-5xl font-black text-slate-800 dark:text-white relative z-10 tabular-nums">{stats.fat}g</div>
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-3 relative z-10 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  Healthy fats
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                <CalorieChart records={meals} />
                
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">Recent Activity</h2>
                    <button 
                      onClick={() => setActiveTab('history')}
                      className="text-emerald-600 font-bold text-sm hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <MealHistory records={meals.slice(0, 3)} onSelect={setSelectedMeal} />
                </section>

                <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 dark:bg-slate-800/50 rounded-full -mr-24 -mt-24 opacity-50 group-hover:scale-150 transition-transform duration-1000" />
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 md:p-4 bg-gradient-to-br from-slate-600 to-slate-800 text-white rounded-[16px] md:rounded-[20px] shadow-xl shadow-slate-200 dark:shadow-none group-hover:rotate-12 transition-transform">
                        <Settings size={24} className="md:w-7 md:h-7" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white">App Settings</h3>
                        <p className="text-slate-400 dark:text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest">Manage your preferences</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('settings')}
                      className="w-full sm:w-auto px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-black hover:bg-slate-800 hover:text-white dark:hover:bg-slate-700 transition-all"
                    >
                      Open
                    </button>
                  </div>
                </section>

                <section className="bg-emerald-900 rounded-[40px] p-10 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-4">Analyze Your Meal</h2>
                    <p className="text-emerald-100/80 mb-8 max-w-md">
                      Get instant nutritional breakdown and AI-powered health suggestions by simply taking a photo.
                    </p>
                    <button 
                      onClick={() => setActiveTab('analyze')}
                      className="px-8 py-4 bg-white text-emerald-900 rounded-2xl font-black hover:bg-emerald-50 transition-all shadow-xl"
                    >
                      Start Analysis
                    </button>
                  </div>
                  <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-800 rounded-full blur-3xl opacity-50" />
                  <div className="absolute right-10 top-10 text-emerald-400/20">
                    <Camera size={160} />
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                <HydrationTracker userEmail={user.email} />
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Health Tip</h3>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-800 dark:text-emerald-300 text-sm leading-relaxed">
                    "Try adding more leafy greens to your lunch to increase fiber intake and improve digestion. Fiber helps you feel full longer!"
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analyze' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-4">Meal Analysis</h2>
              <p className="text-slate-500 dark:text-slate-400">Upload a photo of your food for AI-powered nutrition insights</p>
            </div>
            <ImageUpload onAnalysisComplete={handleAnalysisComplete} />
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-4">Meal History</h2>
                <p className="text-slate-500 dark:text-slate-400">Track your nutritional journey over time</p>
              </div>
              {meals.length > 0 && (
                <button
                  onClick={() => setIsClearHistoryModalOpen(true)}
                  className="px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  Clear History
                </button>
              )}
            </div>
            <MealHistory records={meals} onSelect={setSelectedMeal} />
          </motion.div>
        )}

        {activeTab === 'hydration' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-4">Hydration Tracker</h2>
              <p className="text-slate-500 dark:text-slate-400">Stay hydrated for optimal health and performance</p>
            </div>
            <HydrationTracker userEmail={user.email} />
          </motion.div>
        )}

        {activeTab === 'search' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 max-w-5xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-4">Macro Discovery</h2>
              <p className="text-slate-500 dark:text-slate-400">Find the perfect meal by macros or goals</p>
            </div>
            <div className="grid grid-cols-1 gap-12">
              <ManualNutritionEntry />
              <ReverseSearch />
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="mb-12">
              <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-4">Settings</h2>
              <p className="text-slate-500 dark:text-slate-400">Manage your profile, security, and local data</p>
            </div>
            
            <div className="space-y-8">
              {updateMessage && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "p-4 rounded-[24px] text-center font-black text-sm shadow-xl",
                    updateMessage.type === 'success' ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-red-500 text-white shadow-red-200"
                  )}
                >
                  {updateMessage.text}
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  {/* Appearance Section */}
                  <section className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                        {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
                      </div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white">Appearance</h3>
                    </div>
                    <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-2xl transition-colors duration-500",
                          isDarkMode ? "bg-indigo-500 text-white" : "bg-orange-100 text-orange-600"
                        )}>
                          {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        <div>
                          <div className="font-black text-slate-800 dark:text-white">Dark Mode</div>
                          <div className="text-xs font-bold text-slate-400 dark:text-slate-500">Switch between light and dark themes</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={cn(
                          "w-16 h-8 rounded-full relative transition-all duration-500 p-1",
                          isDarkMode ? "bg-indigo-600" : "bg-slate-200"
                        )}
                      >
                        <motion.div 
                          animate={{ x: isDarkMode ? 32 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                        >
                          {isDarkMode ? <Moon size={12} className="text-indigo-600" /> : <Sun size={12} className="text-orange-500" />}
                        </motion.div>
                      </button>
                    </div>
                  </section>

                  {/* Profile Section */}
                  <section className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                        <User size={24} />
                      </div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white">Profile Settings</h3>
                    </div>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Display Name</label>
                        <input 
                          type="text" 
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-800 dark:text-white"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={updateLoading}
                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 dark:shadow-none disabled:opacity-50"
                      >
                        Update Profile
                      </button>
                    </form>
                  </section>

                  {/* Security Section */}
                  <section className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                        <Shield size={24} />
                      </div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white">Security</h3>
                    </div>
                    <form onSubmit={handleChangePassword} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Current Password</label>
                          <input 
                            type="password" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-800 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">New Password</label>
                          <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-800 dark:text-white"
                          />
                        </div>
                      </div>
                      <button 
                        type="submit"
                        disabled={updateLoading}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none disabled:opacity-50"
                      >
                        Change Password
                      </button>
                    </form>
                  </section>
                </div>

                <div className="space-y-8">
                  {/* Account Info */}
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
                        <User size={40} />
                      </div>
                      <div className="text-lg font-black text-slate-800 dark:text-white truncate">{displayName || user.email}</div>
                      <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Active Account</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <Database size={16} className="text-slate-400 dark:text-slate-500" />
                          <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Local Sync</span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-50 dark:bg-red-950/20 p-8 rounded-[40px] border border-red-100 dark:border-red-900/30 space-y-6">
                    <h4 className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-widest text-center">Danger Zone</h4>
                    <button 
                      onClick={() => setIsClearAllDataModalOpen(true)}
                      className="w-full py-4 bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 rounded-2xl font-black hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100 dark:border-red-900/30"
                    >
                      Clear All History
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-200 dark:shadow-none flex items-center justify-center gap-2"
                    >
                      <LogOut size={20} />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {selectedMeal && (
        <MealDetails 
          record={selectedMeal} 
          onClose={() => setSelectedMeal(null)} 
        />
      )}

      <ConfirmationModal
        isOpen={isClearHistoryModalOpen}
        onClose={() => setIsClearHistoryModalOpen(false)}
        onConfirm={handleClearHistory}
        title="Clear Meal History?"
        message="This will permanently delete all your tracked meals. This action cannot be undone."
        confirmLabel="Clear History"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={isClearAllDataModalOpen}
        onClose={() => setIsClearAllDataModalOpen(false)}
        onConfirm={handleClearAllData}
        title="Clear All History?"
        message="This will permanently delete all your tracked meals. Your account and water logs will remain intact."
        confirmLabel="Clear History"
        variant="danger"
      />
    </div>
  );
}
