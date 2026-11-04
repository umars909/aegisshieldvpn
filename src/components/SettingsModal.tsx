import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Bell, 
  Cloud, 
  FileCheck2, 
  Fingerprint, 
  Check, 
  HardDrive,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { TunnelProtocol } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  protocol: TunnelProtocol;
  onSelectProtocol: (p: TunnelProtocol) => void;
  killSwitchActive: boolean;
  onToggleKillSwitch: () => void;
  cyberShieldActive: boolean;
  onToggleCyberShield: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  onForceSync: () => void;
  pendingSyncCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  protocol,
  onSelectProtocol,
  killSwitchActive,
  onToggleKillSwitch,
  cyberShieldActive,
  onToggleCyberShield,
  notificationsEnabled,
  onToggleNotifications,
  onForceSync,
  pendingSyncCount,
}) => {
  const [activeTab, setActiveTab] = useState<'protocols' | 'zerologs' | 'offline'>('protocols');
  const [syncing, setSyncing] = useState(false);

  if (!isOpen) return null;

  const handleSync = async () => {
    setSyncing(true);
    await onForceSync();
    setTimeout(() => setSyncing(false), 800);
  };

  const protocolsList: { id: TunnelProtocol; name: string; cipher: string; desc: string; bestFor: string }[] = [
    {
      id: 'WireGuard',
      name: 'WireGuard® Next-Gen',
      cipher: 'ChaCha20-Poly1305 (Noise IK)',
      desc: 'Extremely streamlined modern codebase with high bandwidth efficiency and instant connection times.',
      bestFor: 'Gaming, 4K streaming, mobile battery longevity',
    },
    {
      id: 'OpenVPN-UDP',
      name: 'OpenVPN (UDP Mode)',
      cipher: 'AES-256-GCM / SHA-512',
      desc: 'The open-source gold standard with hardened packet forward secrecy.',
      bestFor: 'General browsing and balanced security',
    },
    {
      id: 'OpenVPN-TCP',
      name: 'OpenVPN (TCP Mode)',
      cipher: 'AES-256-GCM (Port 443)',
      desc: 'Mimics regular HTTPS traffic to bypass restrictive firewalls and ISP throttles.',
      bestFor: 'Unstable networks and restrictive Wi-Fi',
    },
    {
      id: 'Stealth (Shadowsocks)',
      name: 'Stealth Obfuscation',
      cipher: 'AEAD ChaCha20 + TLS Scramble',
      desc: 'Disguises VPN headers as randomized packets, bypassing Deep Packet Inspection (DPI).',
      bestFor: 'Strict censorship regimes and hotel networks',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Security & Network Preferences</h3>
            <p className="text-xs text-slate-400">Military-grade cryptographic parameters & Zero-Logs controls</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 px-6 pt-2 bg-slate-950/40">
          {[
            { id: 'protocols', label: 'Tunnel Protocols', icon: Cpu },
            { id: 'zerologs', label: 'Zero-Logs Audit', icon: FileCheck2 },
            { id: 'offline', label: 'Offline Sync & Cache', icon: Cloud },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeTab === 'protocols' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Choose the encryption algorithm and packet transmission protocol for all active tunnel traffic:
              </p>
              <div className="space-y-3">
                {protocolsList.map((p) => {
                  const isSelected = protocol === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectProtocol(p.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                        isSelected
                          ? 'bg-slate-800/80 border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-white">{p.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {p.cipher}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{p.desc}</p>
                        <p className="text-[11px] text-emerald-400 font-mono mt-1">
                          Recommended: {p.bestFor}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                        isSelected ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'zerologs' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Independently Verified Zero-Logs Guarantee</span>
                </div>
                <p>
                  AegisShield VPN operates on 100% diskless RAM-only infrastructure. All server nodes boot an ephemeral Linux kernel into volatile RAM. No hard disk drives or solid-state storage exist on our server clusters.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500">Audit Status:</span>
                  <span className="text-emerald-400 font-bold">UNQUALIFIED PASS (Clean)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500">Auditor Firm:</span>
                  <span className="text-white">Cure53 & SecuLabs International</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500">Hardware Profile:</span>
                  <span className="text-white">Diskless RAM-Only (PXE Ephemeral Boot)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-500">IP Traffic Logs:</span>
                  <span className="text-rose-400 font-bold">NONE (0 Bytes Kept)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Audit Signature Hash:</span>
                  <span className="text-slate-400 truncate max-w-[200px]">0x7b8c...4e91</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'offline' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Offline Data Storage & Sync Queue</h4>
                    <p className="text-xs text-slate-400">
                      Settings, saved servers, and session summaries are cached offline.
                    </p>
                  </div>
                  <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    <span>Sync Now</span>
                  </button>
                </div>

                <div className="pt-2 text-xs text-slate-400 font-mono space-y-1">
                  <div className="flex justify-between">
                    <span>Pending Cloud Sync Queue:</span>
                    <span className="text-white font-bold">{pendingSyncCount} operations</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Local Cache Provider:</span>
                    <span className="text-emerald-400">LocalStorage + IndexedDB</span>
                  </div>
                </div>
              </div>

              {/* Notification preferences */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Daily Security Reminders & Push Alerts</p>
                  <p className="text-[11px] text-slate-400">Receive alerts when connected to unencrypted public Wi-Fi</p>
                </div>
                <button
                  onClick={onToggleNotifications}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Save & Close
          </button>
        </div>

      </div>
    </div>
  );
};
