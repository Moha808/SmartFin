import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Bell, Lock, Shield, Moon, Globe, Save, Key, Eye, EyeOff, Users, Copy, Check } from 'lucide-react';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { updateProfile, updatePassword } from 'firebase/auth';
import { db, auth } from '../config/firebase';

export const Settings: React.FC = () => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');

  // Status/Feedback messages
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);

  // Profile fields state
  const [fullName, setFullName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState('USD ($)');

  // Notifications state
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    weeklyReports: true,
    unusualSpending: true,
    newFeatures: true
  });

  // Password fields state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Gemini API Key state
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Load settings from Firestore and LocalStorage
  useEffect(() => {
    if (!currentUser) return;

    const loadSettings = async () => {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.phone) setPhone(data.phone);
          if (data.currency) setCurrency(data.currency);
          if (data.notifications) {
            setNotifications(prev => ({ ...prev, ...data.notifications }));
          }
        }
        
        if (currentUser.familyId) {
          const q = query(collection(db, 'users'), where('familyId', '==', currentUser.familyId));
          const snap = await getDocs(q);
          const members = snap.docs.map(d => d.data());
          setFamilyMembers(members);
        }
      } catch (err) {
        console.error("Error loading user preferences: ", err);
      }
    };

    loadSettings();

    // Load API Key
    const savedKey = localStorage.getItem('gemini_api_key') || '';
    setApiKey(savedKey);
  }, [currentUser]);

  // Alert dismiss helper
  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Save profile changes (auth display name + firestore preferences)
  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      // 1. Update Firebase Auth Profile
      if (fullName !== currentUser.displayName && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: fullName
        });
      }

      // 2. Save phone & currency in Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        phone,
        currency,
        updatedAt: Date.now()
      }, { merge: true });

      showStatus('success', 'Profile settings updated successfully!');
    } catch (err: any) {
      console.error(err);
      showStatus('error', err.message || 'Error updating profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save notifications preferences
  const handleSaveNotifications = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        notifications,
        updatedAt: Date.now()
      }, { merge: true });

      showStatus('success', 'Notification preferences saved!');
    } catch (err: any) {
      console.error(err);
      showStatus('error', err.message || 'Error saving notification preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  // Update password
  const handleUpdatePassword = async () => {
    if (!auth.currentUser) return;
    if (!newPassword) {
      showStatus('error', 'Please enter a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showStatus('error', 'Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      showStatus('error', 'Password must be at least 6 characters long.');
      return;
    }

    setIsSaving(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      setNewPassword('');
      setConfirmPassword('');
      showStatus('success', 'Password updated successfully!');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        showStatus('error', 'Security reauthentication required. Please log out, log back in, and try again.');
      } else {
        showStatus('error', err.message || 'Error updating password.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Save Preferences (Dark Mode toggle is instant, but Gemini Key requires saving)
  const handleSavePreferences = () => {
    try {
      if (apiKey.trim()) {
        localStorage.setItem('gemini_api_key', apiKey.trim());
      } else {
        localStorage.removeItem('gemini_api_key');
      }
      showStatus('success', 'Preferences and Gemini Key saved successfully!');
    } catch (err) {
      showStatus('error', 'Error saving preferences.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Account Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your profile, preferences, and security</p>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl text-sm font-medium border animate-in fade-in duration-200 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/20' 
            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border-rose-200/20'
        }`}>
          {statusMessage.text}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 space-y-1">
          {[
            { id: 'profile', icon: User, label: 'Profile' },
            { id: 'family', icon: Users, label: 'Family' },
            { id: 'notifications', icon: Bell, label: 'Notifications' },
            { id: 'security', icon: Lock, label: 'Security' },
            { id: 'preferences', icon: Globe, label: 'Preferences' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setStatusMessage(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-finance text-white shadow-md shadow-finance/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="card dark:bg-slate-900 dark:border-slate-800">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-finance to-emerald-500 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-sm">
                      <span className="text-3xl font-bold text-white">
                        {currentUser?.displayName?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{currentUser?.displayName}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{currentUser?.email}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="px-2.5 py-1 bg-finance/10 text-finance text-xs font-semibold rounded-full">Pro Plan</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-finance/50 focus:border-finance text-sm transition-all text-slate-800 dark:text-slate-100" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={currentUser?.email || ''} 
                      disabled
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000" 
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-finance/50 focus:border-finance text-sm transition-all text-slate-800 dark:text-slate-100" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Currency</label>
                    <select 
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-finance/50 focus:border-finance text-sm transition-all text-slate-800 dark:text-slate-200 bg-white"
                    >
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving || !fullName}
                    className="flex items-center gap-2 bg-finance hover:bg-finance-dark text-white px-6 py-2.5 rounded-xl transition-colors font-medium shadow-sm shadow-finance/20 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'family' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Family Workspace</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Manage your family members and sharing settings.</p>

                {currentUser?.role === 'owner' && (
                  <div className="bg-finance/10 border border-finance/20 rounded-xl p-6 mb-6">
                    <h4 className="text-finance-dark dark:text-finance font-bold mb-2">Invite Code</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Share this code with your spouse or children so they can join your family space.</p>
                    
                    <div className="flex items-center gap-3">
                      <code className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-100 text-lg text-center tracking-widest">
                        {currentUser?.familyId || 'Loading...'}
                      </code>
                      <button 
                        onClick={() => {
                          if (currentUser?.familyId) {
                            navigator.clipboard.writeText(currentUser.familyId);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }
                        }}
                        className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                        title="Copy Code"
                      >
                        {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-4">Family Members</h4>
                  <div className="space-y-3">
                    {familyMembers.map((member, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-finance text-white flex items-center justify-center font-bold text-sm">
                            {member.displayName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white text-sm">{member.displayName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{member.role}</p>
                          </div>
                        </div>
                        {member.uid === currentUser?.uid && (
                          <span className="text-xs font-medium text-finance bg-finance/10 px-2 py-1 rounded-full">You</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Notification Preferences</h3>
                {[
                  { key: 'budgetAlerts', title: 'Budget Alerts', desc: 'Get notified when you approach or exceed your budget limits.' },
                  { key: 'weeklyReports', title: 'Weekly Reports', desc: "Receive a weekly summary of your family's finances." },
                  { key: 'unusualSpending', title: 'Unusual Spending', desc: 'AI alerts for unusually high transactions.' },
                  { key: 'newFeatures', title: 'New Features', desc: 'Updates about new SmartFin features and improvements.' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{item.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={(notifications as any)[item.key]} 
                        onChange={(e) => setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-finance/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-finance"></div>
                    </label>
                  </div>
                ))}

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={handleSaveNotifications}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-finance hover:bg-finance-dark text-white px-6 py-2.5 rounded-xl transition-colors font-medium shadow-sm shadow-finance/20 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Notification Preferences'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/10 rounded-xl">
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">Your account authentication is active. Password security can be managed below.</p>
                </div>
                
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 6 characters" 
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-finance/50 focus:border-finance text-sm transition-all text-slate-800 dark:text-slate-100" 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password" 
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-finance/50 focus:border-finance text-sm transition-all text-slate-800 dark:text-slate-100" 
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={handleUpdatePassword}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-finance hover:bg-finance-dark text-white px-6 py-2.5 rounded-xl transition-colors font-medium shadow-sm shadow-finance/20 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Updating...' : 'Change Password'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">App Preferences</h3>
                
                {/* Dark Mode toggle */}
                <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">Dark Mode</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enable dark mode for the application layout</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={theme === 'dark'}
                      onChange={toggleTheme}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-finance/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-finance"></div>
                  </label>
                </div>
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Gemini AI API Key</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Required to hook the AI assistant up to the real Gemini LLM model.</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-xs text-slate-600 dark:text-slate-400 space-y-2 border border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-700 dark:text-slate-200">How to get your free Gemini API Key:</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Go to the <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-finance font-bold hover:underline">Google AI Studio</a>.</li>
                      <li>Log in with your Google account.</li>
                      <li>Click the blue <span className="font-bold">"Get API key"</span> button on the top left.</li>
                      <li>Click <span className="font-bold">"Create API key"</span>, choose your project, and copy the generated key.</li>
                      <li>Paste the key below and save. It will be stored securely on your device.</li>
                    </ol>
                  </div>

                  <div className="max-w-xl space-y-3">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your API Key</label>
                    <div className="relative">
                      <input 
                        type={showApiKey ? "text" : "password"} 
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AIzaSy..." 
                        className="w-full pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-finance/50 focus:border-finance text-sm transition-all text-slate-800 dark:text-slate-100 font-mono" 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={handleSavePreferences}
                    className="flex items-center gap-2 bg-finance hover:bg-finance-dark text-white px-6 py-2.5 rounded-xl transition-colors font-medium shadow-sm shadow-finance/20"
                  >
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
