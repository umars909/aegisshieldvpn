import React from 'react';
import { 
  Power, 
  ShieldCheck, 
  ShieldAlert, 
  Radio, 
  ArrowDown, 
  ArrowUp, 
  Lock, 
  Unlock, 
  Activity, 
  SlidersHorizontal,
  Flame,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ConnectionState, VpnServer, TunnelProtocol, VpnStats } from '../types';
import { TRANSLATIONS } from '../locales/i18n';

interface VpnTunnelControllerProps {
  connectionState: ConnectionState;
  onToggleConnection: () => void;
  selectedServer: VpnServer;
  onOpenServerModal: () => void;
  protocol: TunnelProtocol;
  onSelectProtocol: (p: TunnelProtocol) => void;
  killSwitchActive: boolean;
  onToggleKillSwitch: () => void;
  cyberShieldActive: boolean;
  onToggleCyberShield: () => void;
  stats: VpnStats;
  realIp: string;
  virtualIp: string;
  lang: string;
  onSimulateKillSwitchTrigger: () => void;
  onOpenAuditModal: () => void;
}

export const VpnTunnelController: React.FC<VpnTunnelControllerProps> = ({
  connectionState,
  onToggleConnection,
  selectedServer,
  onOpenServerModal,
  protocol,
  onSelectProtocol,
  killSwitchActive,
  onToggleKillSwitch,
  cyberShieldActive,
  onToggleCyberShield,
  stats,
  realIp,
  virtualIp,
  lang,
  onSimulateKillSwitchTrigger,
  onOpenAuditModal,
}) => {
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  // Format seconds to HH:MM:SS
  const formatDuration = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';
  const isDisconnecting = connectionState === 'disconnecting';
  const isQuarantined = connectionState === 'quarantined';

  return (
    <div className="w-full max-w-4xl mx-auto">
      
      {/* Top Banner Status */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border transition-all duration-300 shadow-sm">
          {isConnected ? (
            <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-950/40 border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{t.connectedProtected}</span>
              <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">AES-256-GCM</span>
            </div>
          ) : isQuarantined ? (
            <div className="flex items-center space-x-2 text-rose-400 bg-rose-950/40 border-rose-500/30">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>{t.quarantined}</span>
            </div>
          ) : isConnecting ? (
            <div className="flex items-center space-x-2 text-cyan-400 bg-cyan-950/40 border-cyan-500/30">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>{t.connecting}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-slate-400 bg-slate-900 border-slate-800">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span>{t.unprotected}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Connection Pod */}
      <div className="relative rounded-3xl p-6 sm:p-10 border transition-all duration-300 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 border-slate-800/80 shadow-2xl">
        
        {/* Glow ambient effect when connected */}
        {isConnected && (
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 blur-xl opacity-70 pointer-events-none -z-10" />
        )}
        {isQuarantined && (
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-rose-500/20 to-amber-500/20 blur-xl opacity-70 pointer-events-none -z-10" />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Left Column: Location & Virtual IP Card */}
          <div className="space-y-4 text-center lg:text-left">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                {t.location}
              </span>
              <button
                onClick={onOpenServerModal}
                className="mt-1 flex items-center justify-center lg:justify-start space-x-3 w-full p-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition-all text-left cursor-pointer group"
              >
                <span className="text-3xl">{selectedServer.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-base font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                      {selectedServer.city}, {selectedServer.country}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span className="flex items-center text-emerald-400 font-mono">
                      <Activity className="w-3 h-3 mr-1" /> {selectedServer.ping}ms
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">{selectedServer.load}% load</span>
                  </div>
                </div>
                <SlidersHorizontal className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
              </button>
            </div>

            {/* IP Masking telemetry display */}
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">
                  {t.maskedIp}
                </span>
                <span className={`text-xs font-mono font-bold block truncate mt-0.5 ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isConnected ? virtualIp : 'Offline (Hidden)'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">
                  {t.realIp}
                </span>
                <span className="text-xs font-mono font-bold block truncate mt-0.5 text-slate-400">
                  {isConnected ? '•••• Masked ••••' : realIp}
                </span>
              </div>
            </div>

            {/* Protocol selector pill */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                {t.protocol}
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(['WireGuard', 'OpenVPN-UDP', 'Stealth (Shadowsocks)'] as TunnelProtocol[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => onSelectProtocol(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                      protocol === p 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold' 
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {p.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Center Column: The Big One-Click Connection Button */}
          <div className="flex flex-col items-center justify-center text-center">
            
            <div className="relative flex items-center justify-center">
              
              {/* Outer Pulsing Waves when connected */}
              {isConnected && (
                <>
                  <div className="absolute w-56 h-56 rounded-full border border-emerald-500/20 animate-ping opacity-40 pointer-events-none" />
                  <div className="absolute w-48 h-48 rounded-full border border-teal-500/30 animate-pulse pointer-events-none" />
                </>
              )}

              {/* Connecting radar ring */}
              {isConnecting && (
                <div className="absolute w-44 h-44 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin pointer-events-none" />
              )}

              {/* Huge One-Click Power Button */}
              <button
                onClick={onToggleConnection}
                disabled={isConnecting || isDisconnecting}
                className={`relative w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 shadow-2xl cursor-pointer ${
                  isConnected 
                    ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-slate-950 shadow-emerald-500/40 hover:shadow-emerald-500/60 ring-8 ring-emerald-500/10'
                    : isQuarantined
                    ? 'bg-gradient-to-tr from-rose-600 to-amber-600 text-white shadow-rose-500/40 ring-8 ring-rose-500/10'
                    : 'bg-gradient-to-tr from-slate-800 to-slate-700 text-slate-300 hover:from-slate-700 hover:to-slate-600 shadow-slate-950 ring-8 ring-slate-800/40'
                }`}
              >
                {isConnected ? (
                  <>
                    <Power className="w-12 h-12 stroke-[2.5]" />
                    <span className="text-[11px] font-black tracking-widest uppercase mt-1">
                      {t.disconnect}
                    </span>
                  </>
                ) : isConnecting ? (
                  <>
                    <Radio className="w-10 h-10 animate-spin text-cyan-300" />
                    <span className="text-[10px] font-bold tracking-widest uppercase mt-1 text-cyan-200">
                      SECURING...
                    </span>
                  </>
                ) : isQuarantined ? (
                  <>
                    <ShieldAlert className="w-12 h-12 animate-bounce text-white" />
                    <span className="text-[10px] font-black tracking-widest uppercase mt-1">
                      RESET TUNNEL
                    </span>
                  </>
                ) : (
                  <>
                    <Power className="w-12 h-12 stroke-[2.5] text-emerald-400" />
                    <span className="text-[11px] font-black tracking-widest uppercase mt-1 text-white">
                      {t.quickConnect}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Session duration counter */}
            <div className="mt-4 font-mono text-center">
              <span className="text-xs text-slate-400 block uppercase tracking-wider">
                {t.sessionTime}
              </span>
              <span className={`text-xl font-bold tracking-widest ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
                {formatDuration(stats.sessionDurationSeconds)}
              </span>
            </div>

          </div>

          {/* Right Column: Real-Time Live Bandwidth Throughput & Security Toggles */}
          <div className="space-y-4 text-center lg:text-right">
            
            {/* Live throughput meters */}
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <div className="flex items-center space-x-1 text-cyan-400 text-xs font-semibold">
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Download</span>
                </div>
                <div className="mt-1">
                  <span className="text-lg font-mono font-bold text-white">
                    {isConnected ? stats.currentDownloadSpeed.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1 font-mono">Mbps</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <div className="flex items-center space-x-1 text-emerald-400 text-xs font-semibold">
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </div>
                <div className="mt-1">
                  <span className="text-lg font-mono font-bold text-white">
                    {isConnected ? stats.currentUploadSpeed.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1 font-mono">Mbps</span>
                </div>
              </div>
            </div>

            {/* Kill Switch Toggle */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${killSwitchActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    {killSwitchActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{t.killSwitch}</p>
                    <p className="text-[10px] text-slate-400 leading-tight">Block leak if drop occurs</p>
                  </div>
                </div>
                <button
                  onClick={onToggleKillSwitch}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    killSwitchActive ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      killSwitchActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Kill Switch simulation button */}
              {isConnected && killSwitchActive && (
                <button
                  onClick={onSimulateKillSwitchTrigger}
                  className="mt-2.5 w-full py-1 text-[11px] font-mono rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  title="Test that your network is safely quarantined if the tunnel fails"
                >
                  <Flame className="w-3 h-3" />
                  <span>Test Fail-Safe Drop</span>
                </button>
              )}
            </div>

            {/* CyberShield Ad/Tracker Blocker Toggle */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${cyberShieldActive ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{t.cyberShield}</p>
                    <p className="text-[10px] text-slate-400 leading-tight">{stats.threatsBlocked} threats neutralized</p>
                  </div>
                </div>
                <button
                  onClick={onToggleCyberShield}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    cyberShieldActive ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      cyberShieldActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Trust & Verification Badges */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <button
              onClick={onOpenAuditModal}
              className="flex items-center space-x-1.5 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">{t.zeroLogs} (RAM-Only Diskless)</span>
            </button>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline font-mono text-[11px] text-slate-500">
              Audit Hash: 0x9f4a...e12d (Passed)
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              ChaCha20-Poly1305
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Curve25519 ECDH
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
