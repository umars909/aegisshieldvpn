export type TunnelProtocol = 
  | 'WireGuard' 
  | 'OpenVPN-UDP' 
  | 'OpenVPN-TCP' 
  | 'IKEv2' 
  | 'Stealth (Shadowsocks)';

export type ConnectionState = 
  | 'disconnected' 
  | 'connecting' 
  | 'connected' 
  | 'disconnecting' 
  | 'quarantined';

export interface VpnServer {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  city: string;
  flag: string;
  region: 'Americas' | 'Europe' | 'Asia Pacific' | 'Middle East & Africa';
  ip: string;
  ping: number;
  load: number; // 0-100%
  p2p: boolean;
  streaming: boolean;
  disklessRamOnly: boolean;
  premiumOnly: boolean;
  coordinates: [number, number]; // [lat, lng]
}

export interface UserSubscription {
  plan: 'trial' | 'monthly' | '1-year' | '2-year';
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  trialEndsAt: string;
  renewsAt: string;
  autoRenew: boolean;
  priceFormatted: string;
  billingCycle: string;
}

export interface VpnStats {
  bytesDownloaded: number;
  bytesUploaded: number;
  currentDownloadSpeed: number; // in Mbps
  currentUploadSpeed: number; // in Mbps
  sessionDurationSeconds: number;
  threatsBlocked: number;
  packetLossPercent: number;
  jitterMs: number;
}

export interface ThreatLog {
  id: string;
  domain: string;
  category: 'malware' | 'tracker' | 'phishing' | 'telemetry_leak';
  timestamp: string;
  status: 'blocked';
}

export interface SecurityAuditResult {
  score: number;
  cipherName: string;
  keyExchange: string;
  dnsLeakStatus: 'Protected' | 'Leaking' | 'Unknown';
  webrtcStatus: 'Shielded' | 'Vulnerable';
  ipv6LeakStatus: 'Nullified (Safe)' | 'Exposed';
  ramServerVerified: boolean;
  aiAnalysisText?: string;
  recommendedServerId?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
}

export interface BrowserBookmark {
  id: string;
  title: string;
  url: string;
  category?: 'privacy' | 'search' | 'tools' | 'general';
  createdAt: string;
}

export interface BrowserHistoryItem {
  id: string;
  title: string;
  url: string;
  displayUrl?: string;
  visitedAt: string;
  isIncognito?: boolean;
}

export type SupportedLanguage = 'en' | 'es' | 'de' | 'fr' | 'ja' | 'zh' | 'ar';
