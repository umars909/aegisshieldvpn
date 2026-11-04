import React, { useState } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Moon, 
  Sun, 
  Globe, 
  Fingerprint, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  CloudCheck, 
  CloudOff, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { SupportedLanguage, AppNotification, ConnectionState } from '../types';
import { TRANSLATIONS } from '../locales/i18n';

interface HeaderProps {
  connectionState: ConnectionState;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  lang: SupportedLanguage;
  onChangeLang: (lang: SupportedLanguage) => void;
  biometricEnabled: boolean;
  onOpenBiometric: () => void;
  onOpenBiometricLogin: () => void;
  user: any;
  onSignIn: () => void;
  onSignOut: () => void;
  isOnline: boolean;
  pendingSyncCount: number;
  notifications: AppNotification[];
  onOpenSubscription: () => void;
  activePlan: string;
}

export const Header: React.FC<HeaderProps> = ({
  connectionState,
  darkMode,
  onToggleDarkMode,
  lang,
  onChangeLang,
  biometricEnabled,
  onOpenBiometric,
  onOpenBiometricLogin,
  user,
  onSignIn,
  onSignOut,
  isOnline,
  pendingSyncCount,
  notifications,
  onOpenSubscription,
  activePlan,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-colors duration-200 border-slate-800/80 bg-slate-950/90 dark:border-slate-800/80 dark:bg-slate-950/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Security Badge */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              {connectionState === 'connected' ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400 animate-pulse" />
              ) : connectionState === 'quarantined' ? (
                <ShieldAlert className="w-6 h-6 text-rose-400" />
              ) : (
                <Shield className="w-6 h-6 text-cyan-400" />
              )}
            </div>
            {connectionState === 'connected' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-slate-950 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                Aegis<span className="text-emerald-400">Shield</span>
              </span>
              <span className="text-[10px] font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                MIL-SPEC
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Offline / Cloud Sync Status */}
          <div 
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isOnline 
                ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300' 
                : 'bg-amber-950/40 border-amber-800/40 text-amber-300'
            }`}
            title={isOnline ? 'Online - Cloud Sync Active' : `Offline Mode - ${pendingSyncCount} changes queued`}
          >
            {isOnline ? (
              <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <CloudOff className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden md:inline font-mono">
              {isOnline ? t.syncedStatus : t.offlineStatus}
            </span>
          </div>

          {/* Subscription Free Trial Badge / Upgrade Button */}
          <button
            onClick={onOpenSubscription}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 border border-amber-500/30 text-amber-300 transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="capitalize">{activePlan === 'trial' ? '7-Day Trial' : `${activePlan} Plan`}</span>
          </button>

          {/* Biometric Shield / Login Button */}
          <button
            onClick={user ? onOpenBiometric : onOpenBiometricLogin}
            className={`p-2 rounded-lg border transition-all ${
              biometricEnabled || user?.isBiometric
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/20' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={biometricEnabled ? 'Biometric Lock Active' : 'Biometric Authentication (Touch / Face ID)'}
          >
            <Fingerprint className="w-4 h-4" />
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all flex items-center space-x-1 text-xs cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase font-mono text-[11px] font-bold">{lang}</span>
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-50">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'es', label: 'Español' },
                  { code: 'de', label: 'Deutsch' },
                  { code: 'fr', label: 'Français' },
                  { code: 'ja', label: '日本語' },
                  { code: 'zh', label: '简体中文' },
                  { code: 'ar', label: 'العربية' },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      onChangeLang(item.code as SupportedLanguage);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 cursor-pointer ${
                      lang === item.code ? 'text-emerald-400 font-bold bg-slate-800/60' : 'text-slate-300'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="font-mono text-[10px] text-slate-500 uppercase">{item.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Push Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white">Security & Account Alerts</span>
                  </div>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto mt-2">
                  {notifications.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-start space-x-3">
                      {item.type === 'alert' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-200">{item.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.message}</p>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Login Options */}
          <div className="relative">
            {user ? (
              <div>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1 rounded-full border border-emerald-500/30 hover:border-emerald-500/60 transition-all bg-slate-900 cursor-pointer"
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-7 h-7 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50">
                    <div className="pb-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{user.displayName || 'Authorized User'}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      {user.isBiometric && (
                        <span className="mt-1 inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          <Fingerprint className="w-3 h-3 mr-1" /> Biometric Passkey
                        </span>
                      )}
                    </div>
                    <div className="py-2 text-xs text-slate-300 space-y-1">
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Subscription:</span>
                        <span className="font-semibold text-emerald-400 uppercase">{activePlan}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Zero-Logs ID:</span>
                        <span className="font-mono text-[10px] text-slate-400 truncate max-w-[100px]">{user.uid}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onSignOut();
                        setShowUserMenu(false);
                      }}
                      className="w-full mt-2 pt-2 border-t border-slate-800 flex items-center space-x-2 text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowLoginMenu(!showLoginMenu)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>

                {showLoginMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 space-y-1">
                    <button
                      onClick={() => {
                        setShowLoginMenu(false);
                        onOpenBiometricLogin();
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-slate-800 text-left text-xs text-white flex items-center space-x-2.5 transition-colors cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <Fingerprint className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold">Biometric Login</p>
                        <p className="text-[10px] text-slate-400">Fingerprint & Face ID</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowLoginMenu(false);
                        onSignIn();
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-slate-800 text-left text-xs text-white flex items-center space-x-2.5 transition-colors cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold">Google Sign-In</p>
                        <p className="text-[10px] text-slate-400">OAuth Firebase Auth</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
