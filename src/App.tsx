import React, { useState, useEffect, useRef } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as fbSignOut, 
  User 
} from 'firebase/auth';
import { 
  auth, 
  googleProvider, 
  testConnection, 
  getUserProfile, 
  syncUserProfile, 
  recordVpnSession, 
  recordInvoice,
  getUserSessions,
  UserProfileData 
} from './firebase';
import { 
  ConnectionState, 
  VpnServer, 
  TunnelProtocol, 
  VpnStats, 
  ThreatLog, 
  AppNotification, 
  SupportedLanguage 
} from './types';
import { GLOBAL_SERVERS } from './data/servers';
import { TRANSLATIONS } from './locales/i18n';
import { Header } from './components/Header';
import { VpnTunnelController } from './components/VpnTunnelController';
import { ServerListModal } from './components/ServerListModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AiNetworkAuditor } from './components/AiNetworkAuditor';
import { SecureBrowser } from './components/SecureBrowser';
import { SubscriptionModal } from './components/SubscriptionModal';
import { BiometricModal } from './components/BiometricModal';
import { BiometricLoginModal } from './components/BiometricLoginModal';
import { SettingsModal } from './components/SettingsModal';
import { 
  Shield, 
  Globe2, 
  BarChart3, 
  BrainCircuit, 
  Settings as SettingsIcon, 
  Compass,
  Fingerprint
} from 'lucide-react';

export default function App() {
  // Theme & Language
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('aegis_theme') !== 'light';
  });
  const [lang, setLang] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('aegis_lang') as SupportedLanguage) || 'en';
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<'tunnel' | 'servers' | 'analytics' | 'ai' | 'browser'>('tunnel');

  // Connection Tunnel State
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [selectedServer, setSelectedServer] = useState<VpnServer>(GLOBAL_SERVERS[0]);
  const [protocol, setProtocol] = useState<TunnelProtocol>('WireGuard');
  const [killSwitchActive, setKillSwitchActive] = useState<boolean>(true);
  const [cyberShieldActive, setCyberShieldActive] = useState<boolean>(true);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  // Network Telemetry
  const [realIp] = useState<string>('73.189.24.112'); // Realistic consumer ISP address
  const [virtualIp, setVirtualIp] = useState<string>(GLOBAL_SERVERS[0].ip);
  const [stats, setStats] = useState<VpnStats>({
    bytesDownloaded: 0,
    bytesUploaded: 0,
    currentDownloadSpeed: 0,
    currentUploadSpeed: 0,
    sessionDurationSeconds: 0,
    threatsBlocked: 142,
    packetLossPercent: 0,
    jitterMs: 1.4,
  });

  // Lifetime Analytics
  const [totalDownloadLifetime, setTotalDownloadLifetime] = useState<number>(14200000000); // ~14.2 GB
  const [totalUploadLifetime, setTotalUploadLifetime] = useState<number>(3100000000);   // ~3.1 GB
  const [recentSessions, setRecentSessions] = useState<any[]>([
    {
      id: 'sess-01',
      serverCity: 'Frankfurt',
      serverCountry: 'Germany',
      virtualIp: '185.220.101.5',
      protocol: 'WireGuard',
      durationSeconds: 3840,
      bytesDown: 1420000000,
      startedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'sess-02',
      serverCity: 'Zurich',
      serverCountry: 'Switzerland',
      virtualIp: '194.187.249.2',
      protocol: 'WireGuard',
      durationSeconds: 1920,
      bytesDown: 820000000,
      startedAt: new Date(Date.now() - 172800000).toISOString(),
    }
  ]);

  // Blocked Threats Stream
  const [threatLogs, setThreatLogs] = useState<ThreatLog[]>([
    { id: 'th-1', domain: 'telemetry.doubleclick.net', category: 'tracker', timestamp: new Date(Date.now() - 300000).toISOString(), status: 'blocked' },
    { id: 'th-2', domain: 'api-analytics.segment.io', category: 'tracker', timestamp: new Date(Date.now() - 1200000).toISOString(), status: 'blocked' },
    { id: 'th-3', domain: 'malicious-payload-drop.org', category: 'malware', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'blocked' },
    { id: 'th-4', domain: 'crypto-miner-worker.js', category: 'malware', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'blocked' },
  ]);

  // User Auth & Subscription
  const [user, setUser] = useState<any | null>(null);
  const [activePlan, setActivePlan] = useState<'trial' | 'monthly' | '1-year' | '2-year'>('trial');
  
  // Offline & Sync
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'AegisShield Military Guard Active',
      message: 'Zero-Logs RAM cluster verified. Real IP protected against ISP inspection.',
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: 'notif-2',
      title: '7-Day Free Trial Activated',
      message: 'Enjoy unlimited 10Gbps bandwidth across 60+ countries.',
      type: 'info',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      read: false,
    }
  ]);

  // Modals
  const [showServerModal, setShowServerModal] = useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [showBiometricModal, setShowBiometricModal] = useState<boolean>(false);
  const [showBiometricLoginModal, setShowBiometricLoginModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Firebase connection check
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile) {
            setActivePlan(profile.subscriptionPlan || 'trial');
            setKillSwitchActive(profile.killSwitch ?? true);
            setCyberShieldActive(profile.cyberShield ?? true);
            setBiometricEnabled(profile.biometricEnabled ?? false);
            setProtocol((profile.protocol as TunnelProtocol) || 'WireGuard');
          } else {
            // First time profile creation
            const newProfile: UserProfileData = {
              userId: currentUser.uid,
              email: currentUser.email || 'user@example.com',
              displayName: currentUser.displayName || 'Security Operator',
              photoURL: currentUser.photoURL || undefined,
              subscriptionPlan: 'trial',
              subscriptionStatus: 'trial',
              trialEndsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
              protocol: 'WireGuard',
              killSwitch: true,
              cyberShield: true,
              biometricEnabled: false,
              totalUploadBytes: 0,
              totalDownloadBytes: 0,
              threatsBlocked: 0,
              lastConnectedServer: selectedServer.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await syncUserProfile(newProfile);
          }

          // Fetch sessions
          const dbSessions = await getUserSessions(currentUser.uid);
          if (dbSessions && dbSessions.length > 0) {
            setRecentSessions(dbSessions);
          }
        } catch (e) {
          console.error('Error hydrating profile from Firestore:', e);
        }
      }
    });

    return () => unsubscribe();
  }, [selectedServer.id]);

  // Monitor Online/Offline Status & Auto-Sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (pendingSyncCount > 0 && user && !user.isBiometric) {
        // Auto-sync queued changes
        syncUserProfile({
          userId: user.uid,
          email: user.email || 'user@example.com',
          displayName: user.displayName || 'Security Operator',
          subscriptionPlan: activePlan,
          subscriptionStatus: activePlan === 'trial' ? 'trial' : 'active',
          trialEndsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
          protocol,
          killSwitch: killSwitchActive,
          cyberShield: cyberShieldActive,
          biometricEnabled,
          totalUploadBytes: totalUploadLifetime + stats.bytesUploaded,
          totalDownloadBytes: totalDownloadLifetime + stats.bytesDownloaded,
          threatsBlocked: stats.threatsBlocked,
          lastConnectedServer: selectedServer.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setPendingSyncCount(0);
        addNotification({
          title: 'Cloud Auto-Sync Complete',
          message: 'All offline settings and usage metrics synchronized with secure database.',
          type: 'success',
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      addNotification({
        title: 'Offline Mode Activated',
        message: 'No internet detected. Local encryption cache and settings remain active.',
        type: 'warning',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSyncCount, user, activePlan, protocol, killSwitchActive, cyberShieldActive, biometricEnabled, totalUploadLifetime, totalDownloadLifetime, stats, selectedServer]);

  // Live Bandwidth & Session Ticker
  useEffect(() => {
    if (connectionState === 'connected') {
      sessionTimerRef.current = setInterval(() => {
        setStats((prev) => {
          const downloadBurst = Math.floor(85 + Math.random() * 65); // 85-150 Mbps
          const uploadBurst = Math.floor(35 + Math.random() * 25);   // 35-60 Mbps
          const bytesDownChunk = (downloadBurst * 1024 * 1024) / 8;
          const bytesUpChunk = (uploadBurst * 1024 * 1024) / 8;

          return {
            ...prev,
            sessionDurationSeconds: prev.sessionDurationSeconds + 1,
            currentDownloadSpeed: downloadBurst,
            currentUploadSpeed: uploadBurst,
            bytesDownloaded: prev.bytesDownloaded + bytesDownChunk,
            bytesUploaded: prev.bytesUploaded + bytesUpChunk,
          };
        });
      }, 1000);
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
      setStats((prev) => ({
        ...prev,
        currentDownloadSpeed: 0,
        currentUploadSpeed: 0,
      }));
    }

    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [connectionState]);

  // CyberShield random blocked tracker simulation
  useEffect(() => {
    if (connectionState === 'connected' && cyberShieldActive) {
      const threatTimer = setInterval(() => {
        if (Math.random() > 0.4) {
          const mockTrackers = [
            'pixel.facebook.com',
            'adservice.google.com',
            'analytics.tiktok.com',
            'telemetry.crashlytics.com',
            'cdn-ad-network.biz',
            'stats.appsflyer.com'
          ];
          const chosenDomain = mockTrackers[Math.floor(Math.random() * mockTrackers.length)];
          const newThreat: ThreatLog = {
            id: `th-${Date.now()}`,
            domain: chosenDomain,
            category: 'tracker',
            timestamp: new Date().toISOString(),
            status: 'blocked',
          };
          setThreatLogs((prev) => [newThreat, ...prev.slice(0, 19)]);
          setStats((prev) => ({ ...prev, threatsBlocked: prev.threatsBlocked + 1 }));
        }
      }, 7000);
      return () => clearInterval(threatTimer);
    }
  }, [connectionState, cyberShieldActive]);

  const addNotification = (item: { title: string; message: string; type: 'info' | 'success' | 'warning' | 'alert' }) => {
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      ...item,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev.slice(0, 15)]);
  };

  // One-Click Connection Toggle
  const handleToggleConnection = () => {
    if (connectionState === 'quarantined') {
      // Reset from quarantine
      setConnectionState('disconnected');
      addNotification({
        title: 'Kill Switch Disengaged',
        message: 'System firewall rules restored. Network traffic unblocked.',
        type: 'info',
      });
      return;
    }

    if (connectionState === 'connected') {
      // Disconnecting
      setConnectionState('disconnecting');
      setTimeout(() => {
        setConnectionState('disconnected');
        setVirtualIp(selectedServer.ip);

        // Record completed session
        const sessionRecord = {
          id: `sess-${Date.now()}`,
          serverId: selectedServer.id,
          serverCity: selectedServer.city,
          serverCountry: selectedServer.country,
          virtualIp: selectedServer.ip,
          protocol,
          durationSeconds: stats.sessionDurationSeconds,
          bytesDown: stats.bytesDownloaded,
          bytesUp: stats.bytesUploaded,
          startedAt: new Date(Date.now() - stats.sessionDurationSeconds * 1000).toISOString(),
          endedAt: new Date().toISOString(),
        };

        setRecentSessions((prev) => [sessionRecord, ...prev]);
        setTotalDownloadLifetime((prev) => prev + stats.bytesDownloaded);
        setTotalUploadLifetime((prev) => prev + stats.bytesUploaded);

        if (user && isOnline && !user.isBiometric) {
          recordVpnSession(user.uid, sessionRecord);
        } else {
          setPendingSyncCount((c) => c + 1);
        }

        addNotification({
          title: 'VPN Tunnel Terminated',
          message: `Disconnected from ${selectedServer.city}. Duration: ${Math.floor(stats.sessionDurationSeconds / 60)}m.`,
          type: 'info',
        });
      }, 800);
    } else {
      // Connecting
      setConnectionState('connecting');
      setTimeout(() => {
        setConnectionState('connected');
        setVirtualIp(selectedServer.ip);
        setStats((prev) => ({
          ...prev,
          sessionDurationSeconds: 0,
          bytesDownloaded: 0,
          bytesUploaded: 0,
        }));

        addNotification({
          title: `Secured via ${selectedServer.city} (${protocol})`,
          message: `Virtual IP ${selectedServer.ip} assigned. Military-grade 256-bit encryption active.`,
          type: 'success',
        });
      }, 1200);
    }
  };

  // Simulate Kill Switch fail-safe drop
  const handleSimulateKillSwitchTrigger = async () => {
    setConnectionState('quarantined');
    setStats((prev) => ({
      ...prev,
      currentDownloadSpeed: 0,
      currentUploadSpeed: 0,
    }));

    addNotification({
      title: '🚨 KILL SWITCH ACTIVATED',
      message: 'Socket traffic abruptly interrupted! Firewall blocked all unencrypted outgoing packets.',
      type: 'alert',
    });

    // Dispatch simulated security alert email via backend
    try {
      await fetch('/api/send-email-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || 'usahran3@gmail.com',
          type: 'kill_switch_triggered',
        }),
      });
    } catch {
      // ignore
    }
  };

  // Google Sign-In with Firebase Auth
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      addNotification({
        title: 'Authentication Verified',
        message: 'Google Sign-In successful. Device synchronized with cloud vault.',
        type: 'success',
      });
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      addNotification({
        title: 'Signed Out',
        message: 'Cloud profile detached. Operating in guest anonymous mode.',
        type: 'info',
      });
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    }
  };

  // Handle Biometric Login Success
  const handleBiometricLoginSuccess = (bioUser: any) => {
    setUser(bioUser);
    setBiometricEnabled(true);
    addNotification({
      title: 'Biometric Login Verified',
      message: `Signed in as ${bioUser.displayName} via hardware security enclave.`,
      type: 'success',
    });
  };

  // Handle plan upgrade success
  const handleUpgradeSuccess = (newPlan: string, invoice: any) => {
    setActivePlan(newPlan as any);
    if (user && isOnline && !user.isBiometric) {
      recordInvoice(user.uid, invoice);
      syncUserProfile({
        userId: user.uid,
        email: user.email || 'user@example.com',
        displayName: user.displayName || 'Security Operator',
        subscriptionPlan: newPlan as any,
        subscriptionStatus: 'active',
        trialEndsAt: new Date(Date.now() + 365 * 86400000).toISOString(),
        protocol,
        killSwitch: killSwitchActive,
        cyberShield: cyberShieldActive,
        biometricEnabled,
        totalUploadBytes: totalUploadLifetime,
        totalDownloadBytes: totalDownloadLifetime,
        threatsBlocked: stats.threatsBlocked,
        lastConnectedServer: selectedServer.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    addNotification({
      title: 'Subscription Confirmed',
      message: `Upgraded to ${newPlan.toUpperCase()} plan. Thank you for securing your digital freedom!`,
      type: 'success',
    });
  };

  return (
    <div 
      className={`min-h-screen flex flex-col font-['Plus_Jakarta_Sans'] transition-colors duration-200 ${
        darkMode ? 'dark bg-slate-950 text-slate-100' : 'light-theme bg-slate-50 text-slate-900'
      }`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      
      {/* Top Application Header */}
      <Header
        connectionState={connectionState}
        darkMode={darkMode}
        onToggleDarkMode={() => {
          const next = !darkMode;
          setDarkMode(next);
          localStorage.setItem('aegis_theme', next ? 'dark' : 'light');
        }}
        lang={lang}
        onChangeLang={(newLang) => {
          setLang(newLang);
          localStorage.setItem('aegis_lang', newLang);
        }}
        biometricEnabled={biometricEnabled}
        onOpenBiometric={() => setShowBiometricModal(true)}
        onOpenBiometricLogin={() => setShowBiometricLoginModal(true)}
        user={user}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        notifications={notifications}
        onOpenSubscription={() => setShowSubscriptionModal(true)}
        activePlan={activePlan}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Navigation Bar Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex flex-wrap gap-1.5 sm:gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('tunnel')}
              className={`flex items-center space-x-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'tunnel' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Connect</span>
            </button>

            <button
              onClick={() => setActiveTab('servers')}
              className={`flex items-center space-x-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'servers' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe2 className="w-4 h-4" />
              <span>{t.servers}</span>
            </button>

            <button
              onClick={() => setActiveTab('browser')}
              className={`flex items-center space-x-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'browser' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{t.browser || 'Secure Browser & Google'}</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'analytics' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t.analytics}</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center space-x-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'ai' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>CyberShield AI</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab 1: One-Click Connection Tunnel Controller */}
        {activeTab === 'tunnel' && (
          <div className="space-y-8 animate-fadeIn">
            <VpnTunnelController
              connectionState={connectionState}
              onToggleConnection={handleToggleConnection}
              selectedServer={selectedServer}
              onOpenServerModal={() => setShowServerModal(true)}
              protocol={protocol}
              onSelectProtocol={(p) => setProtocol(p)}
              killSwitchActive={killSwitchActive}
              onToggleKillSwitch={() => setKillSwitchActive(!killSwitchActive)}
              cyberShieldActive={cyberShieldActive}
              onToggleCyberShield={() => setCyberShieldActive(!cyberShieldActive)}
              stats={stats}
              realIp={realIp}
              virtualIp={virtualIp}
              lang={lang}
              onSimulateKillSwitchTrigger={handleSimulateKillSwitchTrigger}
              onOpenAuditModal={() => setShowSettingsModal(true)}
            />

            {/* Quick Analytics & Security Cards Under Tunnel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div 
                onClick={() => setActiveTab('browser')}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                      Google & Browser
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">Encrypted private web portal</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('servers')}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      Global 10Gbps Mesh
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">35+ RAM-only nodes</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('analytics')}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                      Live Telemetry
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">Benchmark speed & logs</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('ai')}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                      CyberShield AI
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">Cryptographic leak audit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Servers List & World Map */}
        {activeTab === 'servers' && (
          <div className="animate-fadeIn">
            <ServerListModal
              isOpen={true}
              onClose={() => setActiveTab('tunnel')}
              selectedServer={selectedServer}
              onSelectServer={(srv) => {
                setSelectedServer(srv);
                if (connectionState === 'connected') {
                  setVirtualIp(srv.ip);
                }
              }}
              isConnected={connectionState === 'connected'}
            />
          </div>
        )}

        {/* Tab 3: Secure Web Browser & Google Search */}
        {activeTab === 'browser' && (
          <div className="animate-fadeIn">
            <SecureBrowser
              currentServer={selectedServer}
              connectionState={connectionState}
              virtualIp={virtualIp}
              realIp={realIp}
              cyberShieldActive={cyberShieldActive}
              lang={lang}
              onIncognitoPurge={() => {
                addNotification({
                  title: '🕵️ Incognito Session Wiped',
                  message: 'Cookies and session storage traces were purged automatically upon exiting the browser.',
                  type: 'info',
                });
              }}
            />
          </div>
        )}

        {/* Tab 4: Detailed Analytics & Benchmark Dashboard */}
        {activeTab === 'analytics' && (
          <div className="animate-fadeIn">
            <AnalyticsDashboard
              stats={stats}
              totalUploadLifetime={totalUploadLifetime}
              totalDownloadLifetime={totalDownloadLifetime}
              threatLogs={threatLogs}
              recentSessions={recentSessions}
              isConnected={connectionState === 'connected'}
              activeProtocol={protocol}
            />
          </div>
        )}

        {/* Tab 5: CyberShield AI Intelligence Auditor */}
        {activeTab === 'ai' && (
          <div className="animate-fadeIn">
            <AiNetworkAuditor
              serverInfo={selectedServer}
              protocol={protocol}
              killSwitchActive={killSwitchActive}
              virtualIp={virtualIp}
              cyberShieldActive={cyberShieldActive}
            />
          </div>
        )}

      </main>

      {/* Floating Server Quick-Modal (when opened from Pod) */}
      <ServerListModal
        isOpen={showServerModal}
        onClose={() => setShowServerModal(false)}
        selectedServer={selectedServer}
        onSelectServer={(srv) => {
          setSelectedServer(srv);
          if (connectionState === 'connected') {
            setVirtualIp(srv.ip);
          }
        }}
        isConnected={connectionState === 'connected'}
      />

      {/* Subscription & Payment Checkout Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        currentPlan={activePlan}
        onUpgradeSuccess={handleUpgradeSuccess}
        userEmail={user?.email || undefined}
      />

      {/* Biometric Enrollment Modal */}
      <BiometricModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        biometricEnabled={biometricEnabled}
        onToggleBiometric={(enabled) => setBiometricEnabled(enabled)}
      />

      {/* Biometric Login Modal for Seamless Sign-In */}
      <BiometricLoginModal
        isOpen={showBiometricLoginModal}
        onClose={() => setShowBiometricLoginModal(false)}
        onBiometricSuccess={handleBiometricLoginSuccess}
        lang={lang}
        onGoogleSignIn={handleGoogleSignIn}
      />

      {/* Settings & Zero-Logs Audit Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        protocol={protocol}
        onSelectProtocol={(p) => setProtocol(p)}
        killSwitchActive={killSwitchActive}
        onToggleKillSwitch={() => setKillSwitchActive(!killSwitchActive)}
        cyberShieldActive={cyberShieldActive}
        onToggleCyberShield={() => setCyberShieldActive(!cyberShieldActive)}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)}
        onForceSync={() => {
          if (user && !user.isBiometric) {
            syncUserProfile({
              userId: user.uid,
              email: user.email || 'user@example.com',
              displayName: user.displayName || 'Security Operator',
              subscriptionPlan: activePlan,
              subscriptionStatus: activePlan === 'trial' ? 'trial' : 'active',
              trialEndsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
              protocol,
              killSwitch: killSwitchActive,
              cyberShield: cyberShieldActive,
              biometricEnabled,
              totalUploadBytes: totalUploadLifetime + stats.bytesUploaded,
              totalDownloadBytes: totalDownloadLifetime + stats.bytesDownloaded,
              threatsBlocked: stats.threatsBlocked,
              lastConnectedServer: selectedServer.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            setPendingSyncCount(0);
          }
        }}
        pendingSyncCount={pendingSyncCount}
      />

    </div>
  );
}
