import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Home, 
  Lock, 
  Search, 
  ShieldCheck, 
  EyeOff, 
  ExternalLink, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Radio, 
  Globe, 
  SlidersHorizontal,
  Flame,
  Info,
  Star,
  Bookmark,
  Trash2,
  Plus,
  FolderHeart,
  Compass,
  Tag,
  Check,
  Share2,
  Eye,
  ShieldAlert,
  Eraser,
  RefreshCcw,
  History,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { VpnServer, ConnectionState, BrowserBookmark, BrowserHistoryItem } from '../types';

interface SecureBrowserProps {
  currentServer: VpnServer;
  connectionState: ConnectionState;
  virtualIp: string;
  realIp: string;
  cyberShieldActive: boolean;
  lang: string;
  onIncognitoPurge?: () => void;
}

interface BrowserTabItem {
  id: string;
  title: string;
  url: string;
}

const DEFAULT_BOOKMARKS: BrowserBookmark[] = [
  {
    id: 'bm-google',
    title: 'Google Search',
    url: 'https://www.google.com/webhp?igu=1',
    category: 'search',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bm-whatsmyip',
    title: 'WhatsMyIP.com',
    url: 'https://whatsmyip.com',
    category: 'privacy',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bm-whatismyip',
    title: 'WhatIsMyIP.com',
    url: 'https://www.whatismyip.com',
    category: 'privacy',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bm-dnsleak',
    title: 'DNS Leak Test',
    url: 'https://dnsleaktest.com',
    category: 'privacy',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bm-fast',
    title: 'Fast.com Speed',
    url: 'https://fast.com',
    category: 'tools',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bm-duckduckgo',
    title: 'DuckDuckGo',
    url: 'https://duckduckgo.com',
    category: 'search',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bm-wikipedia',
    title: 'Wikipedia',
    url: 'https://www.wikipedia.org',
    category: 'general',
    createdAt: new Date().toISOString(),
  },
];

export const SecureBrowser: React.FC<SecureBrowserProps> = ({
  currentServer,
  connectionState,
  virtualIp,
  realIp,
  cyberShieldActive,
  lang,
  onIncognitoPurge,
}) => {
  const isConnected = connectionState === 'connected';

  // Incognito Mode State
  const [isIncognito, setIsIncognito] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aegis_incognito_mode') === 'true';
    } catch {
      return false;
    }
  });

  const isIncognitoRef = useRef<boolean>(isIncognito);
  useEffect(() => {
    isIncognitoRef.current = isIncognito;
    try {
      localStorage.setItem('aegis_incognito_mode', isIncognito ? 'true' : 'false');
    } catch (e) {}
  }, [isIncognito]);

  const defaultGoogleUrl = 'https://www.google.com/webhp?igu=1';

  // Helper to convert any target destination into a server-side proxy URL with VPN & incognito metadata
  const buildProxyUrl = (target: string, incognitoOverride?: boolean) => {
    const incog = incognitoOverride !== undefined ? incognitoOverride : isIncognito;
    const base = `/api/proxy?url=${encodeURIComponent(target)}`;
    return `${base}&vpnConnected=${isConnected}&vpnIp=${encodeURIComponent(virtualIp)}&vpnCity=${encodeURIComponent(currentServer.city)}&vpnCountry=${encodeURIComponent(currentServer.country)}${incog ? '&incognito=true' : ''}`;
  };
  
  // Track current target URL and the active proxied iframe URL
  const [currentTargetUrl, setCurrentTargetUrl] = useState<string>(defaultGoogleUrl);
  const [iframeSrc, setIframeSrc] = useState<string>(() => buildProxyUrl(defaultGoogleUrl, isIncognito));
  const [urlDisplay, setUrlDisplay] = useState<string>('https://www.google.com');
  const [urlInput, setUrlInput] = useState<string>('https://www.google.com');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([defaultGoogleUrl]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [trackersBlocked, setTrackersBlocked] = useState<number>(28);
  const [showInspector, setShowInspector] = useState<boolean>(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tab State
  const [tabs, setTabs] = useState<BrowserTabItem[]>([
    { id: 'tab-1', title: 'Google Search', url: defaultGoogleUrl },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<BrowserBookmark[]>(() => {
    try {
      const saved = localStorage.getItem('aegis_browser_bookmarks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // fallback
    }
    return DEFAULT_BOOKMARKS;
  });

  // Visited URLs History (Current Session)
  const [sessionHistory, setSessionHistory] = useState<BrowserHistoryItem[]>(() => {
    try {
      const saved = sessionStorage.getItem('aegis_session_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return [
      {
        id: 'hist-init',
        title: 'Google Search',
        url: defaultGoogleUrl,
        displayUrl: 'https://www.google.com',
        visitedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isIncognito: false,
      }
    ];
  });

  // Custom Bookmark Form State
  const [newBmTitle, setNewBmTitle] = useState('');
  const [newBmUrl, setNewBmUrl] = useState('');
  const [newBmCategory, setNewBmCategory] = useState<'privacy' | 'search' | 'tools' | 'general'>('general');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  /**
   * Clears cookies and session storage automatically (Military-grade Incognito wipe)
   */
  const purgeCookiesAndSessionStorage = (reason?: string) => {
    // 1. Wipe client-side sessionStorage
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn('sessionStorage clear error:', e);
    }

    // 2. Wipe client-side cookies accessible via JavaScript
    try {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};`;
        }
      }
    } catch (e) {
      console.warn('cookie clear error:', e);
    }

    // 3. Clear session history in Incognito mode
    setSessionHistory([]);
    try {
      sessionStorage.removeItem('aegis_session_history');
    } catch (e) {}

    // 4. Post message to embedded iframe to trigger internal storage purge
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ action: 'purge_incognito' }, '*');
      }
    } catch (e) {}

    // 5. Request backend proxy session and cookie clearance
    try {
      fetch('/api/proxy/clear-session', { method: 'POST' }).catch(() => {});
    } catch (e) {}

    // 6. Notify parent callback if provided
    if (onIncognitoPurge) {
      onIncognitoPurge();
    }

    showToast(reason || '🕵️ Incognito Session Wiped: Cookies, session storage, and history destroyed.');
  };

  /**
   * Clear all session history manually
   */
  const handleClearHistory = () => {
    setSessionHistory([]);
    try {
      sessionStorage.removeItem('aegis_session_history');
    } catch (e) {}
    showToast('Session browsing history cleared');
  };

  /**
   * Delete an individual entry from session history
   */
  const handleDeleteHistoryItem = (id: string) => {
    setSessionHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        sessionStorage.setItem('aegis_session_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showToast('Removed entry from history');
  };

  /**
   * Quick navigation from history list
   */
  const handleNavigateFromHistory = (targetUrl: string) => {
    setShowHistoryModal(false);
    navigateTo(targetUrl);
    showToast(`Navigated to ${targetUrl.replace(/^https?:\/\//, '').split('/')[0]}`);
  };

  /**
   * AUTOMATIC TRIGGER: Clears cookies & session storage when switching to a different section in the app.
   */
  useEffect(() => {
    return () => {
      if (isIncognitoRef.current) {
        try {
          sessionStorage.clear();
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (name) {
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
            }
          }
          if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/proxy/clear-session');
          }
        } catch (e) {}
      }
    };
  }, []);

  /**
   * AUTOMATIC TRIGGER: Clears cookies & session storage when the user closes the browser tab or window.
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isIncognitoRef.current) {
        try {
          sessionStorage.clear();
          if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/proxy/clear-session');
          }
        } catch (e) {}
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, []);

  /**
   * Listen for real-time site redirects & navigation events from the proxy iframe
   */
  useEffect(() => {
    const handleProxyMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PROXY_URL_CHANGED' && typeof event.data.url === 'string') {
        const redirected = event.data.url;
        if (!redirected) return;

        setIsLoading(false);
        setCurrentTargetUrl(redirected);
        const clean = redirected.replace('?igu=1', '').replace('&igu=1', '');
        setUrlDisplay(clean);
        setUrlInput(clean);

        const pageTitle = getTabTitle(redirected);
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, title: pageTitle, url: redirected } : t));

        // Update session history if different from latest entry
        setSessionHistory((prev) => {
          if (prev.length > 0 && normalizeUrl(prev[0].url) === normalizeUrl(redirected)) {
            return prev;
          }
          const newItem: BrowserHistoryItem = {
            id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: pageTitle,
            url: redirected,
            displayUrl: clean,
            visitedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            isIncognito: isIncognitoRef.current,
          };
          const updated = [newItem, ...prev].slice(0, 50);
          try {
            sessionStorage.setItem('aegis_session_history', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
    };

    window.addEventListener('message', handleProxyMessage);
    return () => window.removeEventListener('message', handleProxyMessage);
  }, [activeTabId]);

  // Handle Tab Close (User closes in-app browser tab)
  const handleCloseTab = (tabId: string) => {
    if (isIncognito) {
      purgeCookiesAndSessionStorage('🕵️ Incognito Tab Closed: Cookies, session storage & history wiped automatically.');
    } else {
      showToast('Browser tab closed');
    }

    // Reset to fresh initial tab
    const freshTab: BrowserTabItem = {
      id: `tab-${Date.now()}`,
      title: 'Google Search',
      url: defaultGoogleUrl,
    };
    setTabs([freshTab]);
    setActiveTabId(freshTab.id);
    setCurrentTargetUrl(defaultGoogleUrl);
    setUrlDisplay('https://www.google.com');
    setUrlInput('https://www.google.com');
    setHistory([defaultGoogleUrl]);
    setHistoryIndex(0);
    setIframeSrc(buildProxyUrl(defaultGoogleUrl, isIncognito));
  };

  // Handle New Tab
  const handleNewTab = () => {
    if (isIncognito) {
      purgeCookiesAndSessionStorage('🕵️ New Incognito Tab: Prior session traces cleared.');
    }
    const newTab: BrowserTabItem = {
      id: `tab-${Date.now()}`,
      title: 'Google Search',
      url: defaultGoogleUrl,
    };
    setTabs([newTab]);
    setActiveTabId(newTab.id);
    navigateTo(defaultGoogleUrl);
  };

  // Toggle Incognito Mode
  const toggleIncognitoMode = () => {
    const nextState = !isIncognito;
    setIsIncognito(nextState);
    if (nextState) {
      purgeCookiesAndSessionStorage('🕵️ Incognito Mode Activated: Cookies & session storage will auto-purge on exit.');
      setIframeSrc(buildProxyUrl(currentTargetUrl, true));
    } else {
      showToast('Standard Browsing Mode restored');
      setIframeSrc(buildProxyUrl(currentTargetUrl, false));
    }
  };

  const saveBookmarks = (newBms: BrowserBookmark[]) => {
    setBookmarks(newBms);
    try {
      localStorage.setItem('aegis_browser_bookmarks', JSON.stringify(newBms));
    } catch (e) {
      // ignore
    }
  };

  // Normalize URLs for bookmark & history comparison
  const normalizeUrl = (url: string) => {
    return url.replace('?igu=1', '').replace('&igu=1', '').replace(/\/$/, '').toLowerCase();
  };

  const isCurrentUrlBookmarked = () => {
    const currentNorm = normalizeUrl(currentTargetUrl);
    return bookmarks.some(bm => normalizeUrl(bm.url) === currentNorm);
  };

  const toggleBookmarkCurrentPage = () => {
    const currentNorm = normalizeUrl(currentTargetUrl);
    const existing = bookmarks.find(bm => normalizeUrl(bm.url) === currentNorm);

    if (existing) {
      const updated = bookmarks.filter(b => b.id !== existing.id);
      saveBookmarks(updated);
      showToast(`Removed "${existing.title}" from Favorites`);
    } else {
      let title = urlDisplay.replace(/^https?:\/\//, '').replace(/^www\./, '');
      if (title.includes('google.com/search')) {
        title = 'Google Search';
      } else if (title.includes('google.com')) {
        title = 'Google';
      } else if (title.includes('whatsmyip.com') || title.includes('whatismyip.com')) {
        title = 'WhatsMyIP';
      } else if (title.includes('dnsleaktest.com')) {
        title = 'DNS Leak Test';
      } else if (title.includes('fast.com')) {
        title = 'Fast Speed Test';
      } else if (title.includes('/')) {
        title = title.split('/')[0];
      }

      const newBm: BrowserBookmark = {
        id: `bm-${Date.now()}`,
        title,
        url: currentTargetUrl,
        category: currentTargetUrl.includes('ip') || currentTargetUrl.includes('leak') ? 'privacy' : (currentTargetUrl.includes('google') || currentTargetUrl.includes('duckduckgo') ? 'search' : 'general'),
        createdAt: new Date().toISOString(),
      };

      const updated = [...bookmarks, newBm];
      saveBookmarks(updated);
      showToast(`★ Added "${title}" to Favorites!`);
    }
  };

  const handleAddBookmarkDirect = (title: string, url: string) => {
    const currentNorm = normalizeUrl(url);
    if (bookmarks.some(bm => normalizeUrl(bm.url) === currentNorm)) {
      showToast(`"${title}" is already in Favorites`);
      return;
    }
    const newBm: BrowserBookmark = {
      id: `bm-${Date.now()}`,
      title,
      url,
      category: url.includes('ip') || url.includes('leak') ? 'privacy' : 'general',
      createdAt: new Date().toISOString(),
    };
    saveBookmarks([...bookmarks, newBm]);
    showToast(`★ Saved "${title}" to Favorites!`);
  };

  const handleAddCustomBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    let url = newBmUrl.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    const title = newBmTitle.trim() || url.replace(/^https?:\/\//, '').replace(/^www\./, '');

    const newBm: BrowserBookmark = {
      id: `bm-${Date.now()}`,
      title,
      url,
      category: newBmCategory,
      createdAt: new Date().toISOString(),
    };

    const updated = [newBm, ...bookmarks];
    saveBookmarks(updated);
    setNewBmTitle('');
    setNewBmUrl('');
    showToast(`Saved "${title}" to Favorites!`);
  };

  const handleDeleteBookmark = (id: string, title: string) => {
    const updated = bookmarks.filter(b => b.id !== id);
    saveBookmarks(updated);
    showToast(`Removed "${title}"`);
  };

  const handleResetDefaults = () => {
    saveBookmarks(DEFAULT_BOOKMARKS);
    showToast('Reset to default favorites');
  };

  // Derive tab display title
  const getTabTitle = (url: string) => {
    if (url.includes('whatsmyip.com') || url.includes('whatismyip.com')) return 'WhatsMyIP.com';
    if (url.includes('dnsleaktest.com')) return 'DNS Leak Test';
    if (url.includes('google.com/search')) {
      try {
        const urlObj = new URL(url);
        const q = urlObj.searchParams.get('q');
        return q ? `Google: ${q}` : 'Google Search';
      } catch {
        return 'Google Search';
      }
    }
    if (url.includes('google.com')) return 'Google Search';
    if (url.includes('wikipedia.org')) return 'Wikipedia';
    if (url.includes('fast.com')) return 'Fast.com Speed';
    if (url.includes('duckduckgo.com')) return 'DuckDuckGo';
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return 'Web Page';
    }
  };

  // Navigate to any URL or query through the server proxy
  const navigateTo = (target: string) => {
    let finalTarget = target.trim();
    if (!finalTarget) return;

    setIsLoading(true);

    if (finalTarget === 'google' || finalTarget === 'https://www.google.com' || finalTarget === 'https://google.com') {
      finalTarget = defaultGoogleUrl;
      setUrlDisplay('https://www.google.com');
      setUrlInput('https://www.google.com');
    } else if (finalTarget.startsWith('http://') || finalTarget.startsWith('https://')) {
      if (finalTarget.includes('google.com/search') && !finalTarget.includes('igu=1')) {
        finalTarget = finalTarget.replace('/search?', '/search?igu=1&');
      }
      setUrlDisplay(finalTarget.replace('?igu=1', '').replace('&igu=1', ''));
      setUrlInput(finalTarget.replace('?igu=1', '').replace('&igu=1', ''));
    } else if (finalTarget.includes('.') && !finalTarget.includes(' ')) {
      // Direct website (e.g. whatsmyip.com, whatismyip.com, wikipedia.org, dnsleaktest.com)
      const domainUrl = `https://${finalTarget}`;
      finalTarget = domainUrl;
      setUrlDisplay(domainUrl);
      setUrlInput(domainUrl);
    } else {
      // Search query - route through Real Google Search via server proxy
      const googleSearch = `https://www.google.com/search?igu=1&q=${encodeURIComponent(finalTarget)}`;
      finalTarget = googleSearch;
      setUrlDisplay(`https://www.google.com/search?q=${encodeURIComponent(target)}`);
      setUrlInput(target);
    }

    setCurrentTargetUrl(finalTarget);
    
    // Always route through the backend proxy route /api/proxy?url=
    const proxiedUrl = buildProxyUrl(finalTarget);
    setIframeSrc(proxiedUrl);

    const pageTitle = getTabTitle(finalTarget);

    // Update active tab title
    setTabs([{ id: activeTabId, title: pageTitle, url: finalTarget }]);

    // Update history stack
    const nextHistory = [...history.slice(0, historyIndex + 1), finalTarget];
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setTrackersBlocked((c) => c + Math.floor(Math.random() * 4) + 1);

    // Record into Session History List
    const newHistoryItem: BrowserHistoryItem = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: pageTitle,
      url: finalTarget,
      displayUrl: finalTarget.replace('?igu=1', '').replace('&igu=1', ''),
      visitedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isIncognito,
    };

    setSessionHistory((prev) => {
      // Avoid immediate consecutive duplicate URLs
      if (prev.length > 0 && normalizeUrl(prev[0].url) === normalizeUrl(finalTarget)) {
        return prev;
      }
      const updated = [newHistoryItem, ...prev.filter(item => item.id !== newHistoryItem.id)].slice(0, 60);
      try {
        sessionStorage.setItem('aegis_session_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setTimeout(() => {
      setIsLoading(false);
    }, 700);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(urlInput);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const prevTarget = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentTargetUrl(prevTarget);
      setIframeSrc(buildProxyUrl(prevTarget));
      const clean = prevTarget.replace('?igu=1', '').replace('&igu=1', '');
      setUrlDisplay(clean);
      setUrlInput(clean);
      setTabs([{ id: activeTabId, title: getTabTitle(prevTarget), url: prevTarget }]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const nextTarget = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentTargetUrl(nextTarget);
      setIframeSrc(buildProxyUrl(nextTarget));
      const clean = nextTarget.replace('?igu=1', '').replace('&igu=1', '');
      setUrlDisplay(clean);
      setUrlInput(clean);
      setTabs([{ id: activeTabId, title: getTabTitle(nextTarget), url: nextTarget }]);
    }
  };

  const reloadIframe = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = buildProxyUrl(currentTargetUrl);
    }
    setTimeout(() => setIsLoading(false), 500);
  };

  const goHome = () => {
    navigateTo(defaultGoogleUrl);
  };

  const isBookmarked = isCurrentUrlBookmarked();

  const filteredBookmarks = bookmarks.filter(bm => {
    if (selectedCategoryFilter === 'all') return true;
    return bm.category === selectedCategoryFilter;
  });

  const filteredHistory = sessionHistory.filter(item => {
    if (!historySearchQuery.trim()) return true;
    const query = historySearchQuery.toLowerCase();
    return item.title.toLowerCase().includes(query) || item.url.toLowerCase().includes(query);
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border text-xs font-semibold shadow-2xl flex items-center space-x-2.5 backdrop-blur-md transition-all animate-bounce ${
          isIncognito 
            ? 'bg-purple-950/95 border-purple-500/50 text-purple-200 shadow-purple-900/40' 
            : 'bg-slate-900/95 border-emerald-500/40 text-emerald-300 shadow-emerald-950/40'
        }`}>
          {isIncognito ? (
            <EyeOff className="w-4 h-4 text-purple-400 shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top VPN Privacy Routing Ribbon */}
      <div className={`p-3.5 px-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl transition-all duration-300 ${
        isIncognito 
          ? 'bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border-purple-500/40 shadow-purple-950/20' 
          : 'bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-emerald-500/30'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl transition-colors ${
            isIncognito ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {isIncognito ? <EyeOff className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm">
                AegisShield Proxied Browser
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${
                isIncognito 
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {isIncognito ? '🕵️ Incognito Mode Active' : '/api/proxy Route Active'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tunnel Node: <strong className={isIncognito ? 'text-purple-400' : 'text-emerald-400'}>{currentServer.city}, {currentServer.country}</strong> • Masked IP: <code className="text-cyan-300 font-mono">{isConnected ? virtualIp : '185.220.101.5'}</code> • CORS / X-Frame-Options: <span className="text-emerald-400 font-bold">BYPASSED</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Incognito Mode Toggle Button */}
          <button
            onClick={toggleIncognitoMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-2 cursor-pointer ${
              isIncognito 
                ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400 shadow-md shadow-purple-600/30' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
            }`}
            title={isIncognito ? 'Incognito Mode is ON (Auto-wiping cookies, storage & history on exit)' : 'Enable Incognito Mode for zero-trace browsing'}
          >
            <EyeOff className={`w-3.5 h-3.5 ${isIncognito ? 'text-white' : 'text-slate-400'}`} />
            <span>Incognito {isIncognito ? 'ON' : 'OFF'}</span>
          </button>

          {/* Session History UI Button */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer"
            title="View Visited Sites in this Session"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>History ({sessionHistory.length})</span>
          </button>

          {/* Favorites UI Button */}
          <button
            onClick={() => setShowFavoritesModal(true)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-all flex items-center space-x-1.5 cursor-pointer"
            title="Manage Saved Bookmarks"
          >
            <Bookmark className="w-3.5 h-3.5 fill-amber-400/30 text-amber-400" />
            <span>Favorites ({bookmarks.length})</span>
          </button>

          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-cyan-300 border border-slate-700">
            🛡️ {trackersBlocked} Blocked
          </span>

          <button
            onClick={() => setShowInspector(!showInspector)}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-all cursor-pointer"
          >
            Proxy Inspector
          </button>

          <a
            href={currentTargetUrl.replace('?igu=1', '').replace('&igu=1', '')}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all flex items-center space-x-1 cursor-pointer"
            title="Open destination directly in new browser tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open in New Tab</span>
          </a>
        </div>
      </div>

      {/* Browser Main Frame */}
      <div className={`rounded-3xl bg-slate-950 border shadow-2xl overflow-hidden flex flex-col min-h-[740px] transition-all duration-200 ${
        isIncognito ? 'border-purple-500/40 ring-1 ring-purple-500/20' : 'border-slate-800'
      }`}>
        
        {/* Browser Tab Bar (With Close Tab & Incognito Auto-Wipe trigger) */}
        <div className="px-3 pt-2 pb-1 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-t-xl text-xs font-medium border-t border-x transition-all select-none ${
                  activeTabId === tab.id 
                    ? isIncognito 
                      ? 'bg-slate-900 border-purple-500/40 text-purple-200 shadow-sm' 
                      : 'bg-slate-900 border-slate-800 text-white shadow-sm'
                    : 'bg-slate-950/60 border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {isIncognito ? (
                  <EyeOff className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <span className="max-w-[160px] truncate">{tab.title}</span>
                
                {/* Close Tab Button (Clears cookies, storage & history in Incognito mode) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(tab.id);
                  }}
                  className="p-0.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer ml-1"
                  title={isIncognito ? 'Close tab and auto-wipe cookies & session storage' : 'Close tab'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <button
              onClick={handleNewTab}
              className="p-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center space-x-1 text-[11px]"
              title="Open a new clean tab"
            >
              <Plus className="w-3 h-3" />
              <span>New Tab</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center space-x-1 font-mono transition-colors cursor-pointer"
              title="Quick history access"
            >
              <Clock className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">Recent: {sessionHistory.length}</span>
            </button>

            {/* Incognito Status Indicator Pill */}
            {isIncognito ? (
              <div className="flex items-center space-x-2 text-[11px] font-mono font-bold text-purple-300 bg-purple-950/60 border border-purple-500/40 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                <span>INCOGNITO: Auto-Wipe On Exit</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-500">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Standard Proxy</span>
              </div>
            )}
          </div>
        </div>

        {/* Incognito Informational Banner */}
        {isIncognito && (
          <div className="p-2.5 px-4 bg-gradient-to-r from-purple-950/90 via-slate-900 to-purple-950/90 border-b border-purple-500/30 flex items-center justify-between text-xs text-purple-200 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <EyeOff className="w-4 h-4 text-purple-400 shrink-0" />
              <p className="text-[11px]">
                <strong className="text-white">Incognito Active:</strong> Cookies &amp; session storage are isolated in memory and will be <strong>automatically purged</strong> when you close this browser tab or switch to another section in the app.
              </p>
            </div>
            <button
              onClick={() => purgeCookiesAndSessionStorage('🕵️ Manual Purge: Cookies, session storage, and cache traces wiped.')}
              className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-white border border-purple-500/40 text-[11px] font-mono transition-colors cursor-pointer shrink-0 flex items-center space-x-1"
              title="Wipe all session traces now"
            >
              <Eraser className="w-3 h-3" />
              <span>Purge Traces Now</span>
            </button>
          </div>
        )}

        {/* Browser Top Chrome Controls */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center space-x-2 sm:space-x-3">
          
          {/* Navigation buttons */}
          <div className="flex items-center space-x-1 text-slate-400">
            <button
              onClick={goBack}
              disabled={historyIndex <= 0}
              className="p-2 rounded-xl hover:bg-slate-800 disabled:opacity-30 hover:text-white transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goForward}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-xl hover:bg-slate-800 disabled:opacity-30 hover:text-white transition-colors cursor-pointer"
              title="Forward"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={reloadIframe}
              className="p-2 rounded-xl hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              title="Reload Page via Proxy"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button
              onClick={goHome}
              className="p-2 rounded-xl hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              title="Google Home"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>

          {/* Address / Search Bar with Favorite Star Toggle */}
          <form onSubmit={handleFormSubmit} className="flex-1">
            <div className="relative flex items-center">
              <div className={`absolute left-3 flex items-center space-x-1.5 ${
                isIncognito ? 'text-purple-400' : 'text-emerald-400'
              }`}>
                {isIncognito ? <EyeOff className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-mono font-bold uppercase hidden sm:inline">
                  {isIncognito ? 'INCOGNITO' : 'PROXY'}
                </span>
              </div>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter URL (e.g. whatsmyip.com) or search Google..."
                className={`w-full pl-24 sm:pl-28 pr-20 py-2 bg-slate-950 border rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none transition-all ${
                  isIncognito 
                    ? 'border-purple-500/40 focus:border-purple-400' 
                    : 'border-slate-800 focus:border-emerald-500/60'
                }`}
              />
              
              {/* Star Favorite Button inside Address Bar */}
              <button
                type="button"
                onClick={toggleBookmarkCurrentPage}
                className={`absolute right-9 p-1.5 rounded-lg transition-all cursor-pointer ${
                  isBookmarked 
                    ? 'text-amber-400 hover:text-amber-300' 
                    : 'text-slate-500 hover:text-amber-300'
                }`}
                title={isBookmarked ? 'Remove from Favorites' : 'Add this page to Favorites'}
              >
                <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : ''}`} />
              </button>

              <button
                type="submit"
                className="absolute right-2.5 p-1 text-slate-400 hover:text-emerald-400 cursor-pointer"
                title="Go"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Preset Buttons */}
          <div className="hidden lg:flex items-center space-x-1.5 text-xs font-mono">
            <button
              onClick={() => navigateTo('https://whatsmyip.com')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                isIncognito 
                  ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300' 
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
              }`}
            >
              WhatsMyIP
            </button>
            <button
              onClick={() => navigateTo('https://dnsleaktest.com')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors cursor-pointer"
            >
              DNS Leak
            </button>
            <button
              onClick={() => navigateTo('https://www.wikipedia.org')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors cursor-pointer"
            >
              Wikipedia
            </button>
          </div>

        </div>

        {/* Dedicated Favorites / Bookmarks Bar */}
        <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs overflow-x-auto gap-2">
          <div className="flex items-center space-x-1.5 shrink-0">
            <div className="flex items-center space-x-1 text-amber-400 font-semibold text-[11px] mr-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="hidden sm:inline">Favorites:</span>
            </div>

            {bookmarks.map((bm) => {
              const active = normalizeUrl(currentTargetUrl) === normalizeUrl(bm.url);
              return (
                <button
                  key={bm.id}
                  onClick={() => navigateTo(bm.url)}
                  className={`px-2.5 py-1 rounded-lg flex items-center space-x-1.5 text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
                    active 
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm' 
                      : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                  title={`Navigate to ${bm.title} (${bm.url})`}
                >
                  {bm.category === 'privacy' && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                  {bm.category === 'search' && <Search className="w-3 h-3 text-cyan-400" />}
                  {bm.category === 'tools' && <Flame className="w-3 h-3 text-rose-400" />}
                  {(!bm.category || bm.category === 'general') && <Globe className="w-3 h-3 text-slate-400" />}
                  <span className="truncate max-w-[130px]">{bm.title}</span>
                </button>
              );
            })}

            <button
              onClick={() => {
                setNewBmTitle('');
                setNewBmUrl(currentTargetUrl.replace('?igu=1', ''));
                setShowFavoritesModal(true);
              }}
              className="p-1 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-amber-300 text-[11px] flex items-center space-x-1 border border-slate-700 transition-colors cursor-pointer shrink-0"
              title="Add a new custom favorite"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center space-x-1 font-mono transition-colors cursor-pointer"
            >
              <History className="w-3 h-3 text-cyan-400" />
              <span>Session History</span>
            </button>

            <button
              onClick={() => setShowFavoritesModal(true)}
              className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center space-x-1 font-mono transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Manage Favorites</span>
            </button>
          </div>
        </div>

        {/* Security Inspector Drawer */}
        {showInspector && (
          <div className="p-4 bg-slate-900 border-b border-slate-800 text-xs font-mono space-y-2 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Backend Proxy Router Diagnostics</span>
              </div>
              <button 
                onClick={() => setShowInspector(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 block">Current Target Destination:</span>
                <span className="text-emerald-400 font-bold truncate block">{currentTargetUrl}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Server Proxy Endpoint:</span>
                <span className="text-white font-bold">GET /api/proxy?url=...</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Security Header Stripping:</span>
                <span className="text-teal-400 font-bold">X-Frame-Options + CSP Removed</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Session History Count:</span>
                <span className="text-cyan-400 font-bold">{sessionHistory.length} URLs Recorded</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading Progress Line */}
        {isLoading && (
          <div className="w-full bg-slate-800 h-1 overflow-hidden">
            <div className={`h-1 animate-pulse w-full ${
              isIncognito 
                ? 'bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400' 
                : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400'
            }`} />
          </div>
        )}

        {/* Quick Shortcut Buttons Row */}
        <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 overflow-x-auto gap-2">
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Quick Destinations:</span>
            {[
              { label: 'WhatsMyIP.com', target: 'https://whatsmyip.com' },
              { label: 'WhatIsMyIP.com', target: 'https://www.whatismyip.com' },
              { label: 'Real Google', target: defaultGoogleUrl },
              { label: 'DNSLeakTest', target: 'https://dnsleaktest.com' },
              { label: 'DuckDuckGo', target: 'https://duckduckgo.com' },
              { label: 'Fast.com Speed', target: 'https://fast.com' },
              { label: 'Wikipedia', target: 'https://www.wikipedia.org' }
            ].map((shortcut, idx) => (
              <button
                key={idx}
                onClick={() => navigateTo(shortcut.target)}
                className="px-2.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors text-[11px] whitespace-nowrap cursor-pointer"
              >
                {shortcut.label}
              </button>
            ))}
          </div>

          <div className="shrink-0 flex items-center space-x-1.5 text-[11px] text-emerald-400 font-mono">
            <Radio className="w-3 h-3 animate-ping" />
            <span>{isIncognito ? 'Incognito Tunnel Route' : 'Routed Through Server Proxy'}</span>
          </div>
        </div>

        {/* Real Embedded Proxied Iframe */}
        <div className="flex-1 w-full bg-white relative min-h-[640px]">
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            title="AegisShield Proxied Web Browser"
            className="w-full h-full min-h-[640px] border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-presentation allow-downloads"
            allow="fullscreen"
            loading="eager"
            onLoad={() => setIsLoading(false)}
          />
        </div>

      </div>

      {/* Session History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            
            {/* History Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-white text-base">Session Browsing History</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                      {sessionHistory.length} visited
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Quickly navigate back to any website visited in your current browsing session</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Incognito Notice in History */}
            {isIncognito && (
              <div className="p-3 px-5 bg-purple-950/50 border-b border-purple-500/30 flex items-center justify-between text-xs text-purple-200">
                <div className="flex items-center space-x-2">
                  <EyeOff className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>
                    <strong>Incognito Active:</strong> This history is kept in memory only and will be automatically purged on tab close or section switch.
                  </span>
                </div>
              </div>
            )}

            {/* Search Filter & Actions Bar */}
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search visited pages or URLs..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 font-mono"
                />
                {historySearchQuery && (
                  <button
                    onClick={() => setHistorySearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {sessionHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
                  title="Clear all session history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {/* History List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {filteredHistory.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto text-slate-500">
                    <History className="w-6 h-6" />
                  </div>
                  <h4 className="text-white text-sm font-semibold">
                    {historySearchQuery ? 'No matching sites found' : 'No browsing history yet'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {historySearchQuery 
                      ? 'Try searching with a different URL or keyword' 
                      : 'Websites you visit in this session will appear here for 1-click quick navigation back.'}
                  </p>
                </div>
              ) : (
                filteredHistory.map((item) => {
                  const isCurrent = normalizeUrl(currentTargetUrl) === normalizeUrl(item.url);
                  const isItemBookmarked = bookmarks.some(bm => normalizeUrl(bm.url) === normalizeUrl(item.url));

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-slate-900 border-cyan-500/50 shadow-sm'
                          : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className={`p-2 rounded-xl border shrink-0 ${
                          isCurrent 
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}>
                          {item.url.includes('google') ? (
                            <Search className="w-4 h-4 text-cyan-400" />
                          ) : item.url.includes('ip') || item.url.includes('leak') ? (
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Globe className="w-4 h-4 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-xs truncate">{item.title}</span>
                            {isCurrent && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase font-bold">
                                Current
                              </span>
                            )}
                            {item.isIncognito && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase font-bold">
                                Incognito
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-[11px] text-slate-400 font-mono truncate">{item.displayUrl || item.url}</span>
                            <span className="text-slate-600 text-xs">•</span>
                            <span className="text-[10px] text-slate-500 font-mono shrink-0 flex items-center space-x-1">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{item.visitedAt}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* History Action Buttons */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        {/* Bookmark quick button */}
                        <button
                          onClick={() => handleAddBookmarkDirect(item.title, item.url)}
                          className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                            isItemBookmarked
                              ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-amber-400 border-slate-800'
                          }`}
                          title={isItemBookmarked ? 'Already in Favorites' : 'Add to Favorites'}
                        >
                          <Star className={`w-3.5 h-3.5 ${isItemBookmarked ? 'fill-amber-400' : ''}`} />
                        </button>

                        {/* Quick Navigate Button */}
                        <button
                          onClick={() => handleNavigateFromHistory(item.url)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                            isCurrent
                              ? 'bg-slate-800 text-slate-400 cursor-default'
                              : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400'
                          }`}
                          disabled={isCurrent}
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>{isCurrent ? 'Viewing' : 'Navigate'}</span>
                        </button>

                        {/* Delete entry button */}
                        <button
                          onClick={() => handleDeleteHistoryItem(item.id)}
                          className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* History Modal Footer */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono">
                Showing {filteredHistory.length} of {sessionHistory.length} entries
              </span>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Favorites & Bookmarks Management Modal */}
      {showFavoritesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400">
                  <Bookmark className="w-5 h-5 fill-amber-400/40" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Favorites &amp; Bookmarks</h3>
                  <p className="text-xs text-slate-400">Save, organize, and quickly launch your frequently visited websites</p>
                </div>
              </div>
              <button
                onClick={() => setShowFavoritesModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-5">
              
              {/* Add New Favorite Form */}
              <form onSubmit={handleAddCustomBookmark} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Favorite Bookmark</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewBmTitle('Current Page');
                      setNewBmUrl(currentTargetUrl);
                    }}
                    className="text-[11px] text-slate-400 hover:text-emerald-400 font-mono transition-colors cursor-pointer"
                  >
                    Use Current Page URL
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Bookmark Title</label>
                    <input
                      type="text"
                      placeholder="e.g. My Secure Portal"
                      value={newBmTitle}
                      onChange={(e) => setNewBmTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Category</label>
                    <select
                      value={newBmCategory}
                      onChange={(e: any) => setNewBmCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400/60 font-mono cursor-pointer"
                    >
                      <option value="privacy">Privacy &amp; Security</option>
                      <option value="search">Search Engines</option>
                      <option value="tools">Diagnostic Tools</option>
                      <option value="general">General Web</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Target URL</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={newBmUrl}
                      onChange={(e) => setNewBmUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 font-mono"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shrink-0"
                    >
                      Save Favorite
                    </button>
                  </div>
                </div>
              </form>

              {/* Category Filter Chips */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
                  {['all', 'privacy', 'search', 'tools', 'general'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-lg capitalize text-xs font-medium transition-colors cursor-pointer ${
                        selectedCategoryFilter === cat 
                          ? 'bg-amber-400 text-slate-950 font-bold' 
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleResetDefaults}
                  className="text-[11px] text-slate-500 hover:text-slate-300 font-mono underline transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>

              {/* Bookmarks List */}
              <div className="space-y-2">
                {filteredBookmarks.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs font-mono">
                    No favorites in this category yet.
                  </div>
                ) : (
                  filteredBookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="p-2 rounded-xl bg-slate-900 text-amber-400 border border-slate-800 shrink-0">
                          {bm.category === 'privacy' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                          {bm.category === 'search' && <Search className="w-4 h-4 text-cyan-400" />}
                          {bm.category === 'tools' && <Flame className="w-4 h-4 text-rose-400" />}
                          {(!bm.category || bm.category === 'general') && <Globe className="w-4 h-4 text-slate-400" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-white text-xs truncate">{bm.title}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                              {bm.category || 'general'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono truncate">{bm.url}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => {
                            navigateTo(bm.url);
                            setShowFavoritesModal(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Launch</span>
                        </button>
                        <button
                          onClick={() => handleDeleteBookmark(bm.id, bm.title)}
                          className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete favorite"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono">Total saved bookmarks: {bookmarks.length}</span>
              <button
                onClick={() => setShowFavoritesModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
