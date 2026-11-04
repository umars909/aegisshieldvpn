import React, { useState } from 'react';
import { 
  BarChart3, 
  ArrowDown, 
  ArrowUp, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Gauge, 
  Play, 
  RefreshCw,
  HardDrive,
  FileCheck
} from 'lucide-react';
import { VpnStats, ThreatLog } from '../types';

interface AnalyticsDashboardProps {
  stats: VpnStats;
  totalUploadLifetime: number;
  totalDownloadLifetime: number;
  threatLogs: ThreatLog[];
  recentSessions: any[];
  isConnected: boolean;
  activeProtocol: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  stats,
  totalUploadLifetime,
  totalDownloadLifetime,
  threatLogs,
  recentSessions,
  isConnected,
  activeProtocol,
}) => {
  const [speedTestRunning, setSpeedTestRunning] = useState(false);
  const [speedTestProgress, setSpeedTestProgress] = useState(0);
  const [testedDownload, setTestedDownload] = useState<number | null>(null);
  const [testedUpload, setTestedUpload] = useState<number | null>(null);
  const [testedPing, setTestedPing] = useState<number | null>(null);
  const [testedJitter, setTestedJitter] = useState<number | null>(null);

  // Speed test simulation sequence
  const runSpeedTest = () => {
    if (speedTestRunning) return;
    setSpeedTestRunning(true);
    setSpeedTestProgress(5);
    setTestedDownload(null);
    setTestedUpload(null);

    const interval = setInterval(() => {
      setSpeedTestProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setSpeedTestRunning(false);
          setTestedDownload(Math.floor(180 + Math.random() * 95));
          setTestedUpload(Math.floor(75 + Math.random() * 45));
          setTestedPing(Math.floor(14 + Math.random() * 8));
          setTestedJitter(Math.floor(1 + Math.random() * 3));
          return 100;
        }
        return prev + 15;
      });
    }, 250);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0.00 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(2)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase font-mono">Lifetime Download</span>
            <ArrowDown className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-bold font-mono text-white">
              {formatBytes(totalDownloadLifetime + stats.bytesDownloaded)}
            </p>
            <p className="text-[11px] text-cyan-400/80 mt-0.5">Encrypted payload</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase font-mono">Lifetime Upload</span>
            <ArrowUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-bold font-mono text-white">
              {formatBytes(totalUploadLifetime + stats.bytesUploaded)}
            </p>
            <p className="text-[11px] text-emerald-400/80 mt-0.5">Shielded upstream</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase font-mono">Threats Blocked</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-bold font-mono text-white">
              {stats.threatsBlocked + threatLogs.length}
            </p>
            <p className="text-[11px] text-amber-400/80 mt-0.5">Trackers & malware</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase font-mono">Tunnel Latency</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-bold font-mono text-white">
              {isConnected ? `${stats.jitterMs + 18}ms` : 'N/A'}
            </p>
            <p className="text-[11px] text-purple-400/80 mt-0.5">{activeProtocol}</p>
          </div>
        </div>

      </div>

      {/* Speed Test & Benchmark Pod */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center">
              <Gauge className="w-5 h-5 text-emerald-400 mr-2" />
              Real-Time Network Speed & Latency Benchmark
            </h3>
            <p className="text-xs text-slate-400">
              Measure encrypted tunnel throughput against local ISP baseline
            </p>
          </div>
          <button
            onClick={runSpeedTest}
            disabled={speedTestRunning}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md shadow-emerald-500/20"
          >
            {speedTestRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Benchmarking ({speedTestProgress}%)</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Speed Test</span>
              </>
            )}
          </button>
        </div>

        {/* Speed Gauge / Progress */}
        {speedTestRunning && (
          <div className="mt-4">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 transition-all duration-300" 
                style={{ width: `${speedTestProgress}%` }}
              />
            </div>
            <p className="text-center font-mono text-xs text-emerald-400 mt-2">
              Injecting 256-bit AES packets to measure latency jitter...
            </p>
          </div>
        )}

        {/* Speed Results Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Download</span>
            <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">
              {testedDownload ? `${testedDownload} Mbps` : isConnected ? `${stats.currentDownloadSpeed.toFixed(1)} Mbps` : '—'}
            </span>
            <span className="text-[10px] text-slate-500">4K UltraHD Ready</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Upload</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
              {testedUpload ? `${testedUpload} Mbps` : isConnected ? `${stats.currentUploadSpeed.toFixed(1)} Mbps` : '—'}
            </span>
            <span className="text-[10px] text-slate-500">Unmetered Uplink</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Ping Latency</span>
            <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
              {testedPing ? `${testedPing} ms` : isConnected ? `${stats.jitterMs + 16} ms` : '—'}
            </span>
            <span className="text-[10px] text-slate-500">Low-Latency Gaming</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Packet Jitter</span>
            <span className="text-xl font-bold font-mono text-purple-400 mt-1 block">
              {testedJitter ? `${testedJitter} ms` : '1.8 ms'}
            </span>
            <span className="text-[10px] text-slate-500">0% Packet Loss</span>
          </div>
        </div>

      </div>

      {/* CyberShield Threat Intelligence Log */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center">
              <ShieldCheck className="w-5 h-5 text-amber-400 mr-2" />
              CyberShield Real-Time Blocked Threat Stream
            </h3>
            <p className="text-xs text-slate-400">DNS-level filtration against trackers, phishing, and ad-networks</p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {threatLogs.length} Attacks Quarantined
          </span>
        </div>

        <div className="divide-y divide-slate-800/60 mt-2 max-h-60 overflow-y-auto">
          {threatLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <div>
                  <span className="font-mono font-bold text-slate-200">{log.domain}</span>
                  <span className="text-[10px] text-slate-500 block">
                    {new Date(log.timestamp).toLocaleTimeString()} • DNS Sinkhole Applied
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {log.category}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  BLOCKED
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connection Session History */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center">
              <Clock className="w-5 h-5 text-cyan-400 mr-2" />
              Recent Secure Session Records
            </h3>
            <p className="text-xs text-slate-400">Synchronized private session ledger (Zero-Logs encrypted)</p>
          </div>
          <span className="text-xs font-mono text-slate-500">Auto-purged after 30 days</span>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase font-mono text-[10px]">
                <th className="py-2.5">Server Node</th>
                <th className="py-2.5">Virtual IP</th>
                <th className="py-2.5">Protocol</th>
                <th className="py-2.5">Duration</th>
                <th className="py-2.5">Bandwidth</th>
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {recentSessions.map((s, idx) => (
                <tr key={s.id || idx} className="hover:bg-slate-800/30">
                  <td className="py-2.5 text-white font-sans font-medium">{s.serverCity || 'Frankfurt'}, {s.serverCountry || 'Germany'}</td>
                  <td className="py-2.5 text-slate-400">{s.virtualIp || '185.220.101.5'}</td>
                  <td className="py-2.5 text-emerald-400">{s.protocol || 'WireGuard'}</td>
                  <td className="py-2.5 text-slate-400">{s.durationSeconds ? `${Math.floor(s.durationSeconds / 60)}m` : 'Active'}</td>
                  <td className="py-2.5 text-cyan-400">{formatBytes(s.bytesDown || 45000000)}</td>
                  <td className="py-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      SECURED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
