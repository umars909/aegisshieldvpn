import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Activity, 
  Flame, 
  Film, 
  HardDrive, 
  Check, 
  Globe2,
  Sparkles,
  MapPin
} from 'lucide-react';
import { VpnServer } from '../types';
import { GLOBAL_SERVERS } from '../data/servers';

interface ServerListModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedServer: VpnServer;
  onSelectServer: (server: VpnServer) => void;
  isConnected: boolean;
}

export const ServerListModal: React.FC<ServerListModalProps> = ({
  isOpen,
  onClose,
  selectedServer,
  onSelectServer,
  isConnected,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [filterP2p, setFilterP2p] = useState(false);
  const [filterStreaming, setFilterStreaming] = useState(false);
  const [filterRamOnly, setFilterRamOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  if (!isOpen) return null;

  const filteredServers = GLOBAL_SERVERS.filter((server) => {
    const matchesSearch = 
      server.name.toLowerCase().includes(search.toLowerCase()) ||
      server.city.toLowerCase().includes(search.toLowerCase()) ||
      server.country.toLowerCase().includes(search.toLowerCase());
    
    const matchesRegion = selectedRegion === 'All' || server.region === selectedRegion;
    const matchesP2p = !filterP2p || server.p2p;
    const matchesStreaming = !filterStreaming || server.streaming;
    const matchesRam = !filterRamOnly || server.disklessRamOnly;

    return matchesSearch && matchesRegion && matchesP2p && matchesStreaming && matchesRam;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Global High-Speed Server Network</h2>
              <p className="text-xs text-slate-400">
                35+ bare-metal 10Gbps nodes • RAM-only diskless architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 bg-slate-950/50 space-y-3">
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by country, city, or node name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Quick Map / List Switcher */}
            <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'map' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                World Map
              </button>
            </div>
          </div>

          {/* Region Tabs & Feature Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Europe', 'Americas', 'Asia Pacific', 'Middle East & Africa'].map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedRegion === region
                      ? 'bg-slate-800 text-emerald-400 font-bold border border-emerald-500/30'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-1.5 text-xs">
              <button
                onClick={() => setFilterP2p(!filterP2p)}
                className={`px-2.5 py-1 rounded-lg border transition-all flex items-center space-x-1 ${
                  filterP2p ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>P2P</span>
              </button>
              <button
                onClick={() => setFilterStreaming(!filterStreaming)}
                className={`px-2.5 py-1 rounded-lg border transition-all flex items-center space-x-1 ${
                  filterStreaming ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Film className="w-3 h-3" />
                <span>Streaming</span>
              </button>
              <button
                onClick={() => setFilterRamOnly(!filterRamOnly)}
                className={`px-2.5 py-1 rounded-lg border transition-all flex items-center space-x-1 ${
                  filterRamOnly ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <HardDrive className="w-3 h-3" />
                <span>RAM-Only</span>
              </button>
            </div>
          </div>

        </div>

        {/* Content Area: List View or Map View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {viewMode === 'list' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredServers.map((server) => {
                const isSelected = selectedServer.id === server.id;

                return (
                  <button
                    key={server.id}
                    onClick={() => {
                      onSelectServer(server);
                      onClose();
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950/60 hover:bg-slate-800/70 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <span className="text-3xl shrink-0">{server.flag}</span>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                            {server.city}, {server.country}
                          </p>
                          {isSelected && (
                            <span className="shrink-0 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-black uppercase">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{server.name}</p>
                        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 mt-1">
                          <span className="flex items-center text-emerald-400">
                            <Activity className="w-2.5 h-2.5 mr-0.5" />
                            {server.ping}ms
                          </span>
                          <span>•</span>
                          <span className={server.load > 70 ? 'text-amber-400' : 'text-slate-400'}>
                            {server.load}% load
                          </span>
                          <span>•</span>
                          <span className="text-slate-500">{server.ip}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 ml-2">
                      <div className="flex flex-col items-end space-y-1">
                        {server.streaming && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            4K Stream
                          </span>
                        )}
                        {server.p2p && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            P2P Ready
                          </span>
                        )}
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                        isSelected 
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                          : 'border-slate-700 text-transparent group-hover:border-slate-500'
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Interactive World Map Canvas Visualizer */
            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-6 min-h-[380px] flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center">
                      <MapPin className="w-4 h-4 text-emerald-400 mr-1.5" />
                      Global Mesh Latency Topology
                    </h3>
                    <p className="text-xs text-slate-400">Click a node to reroute your tunnel instantaneously</p>
                  </div>
                  <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/40">
                    Routing: {selectedServer.city} ({selectedServer.ping}ms)
                  </div>
                </div>

                {/* Simulated World Coordinates Canvas */}
                <div className="relative w-full h-64 mt-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
                  {/* Continental outline stylized markers */}
                  {GLOBAL_SERVERS.map((srv) => {
                    // Approximate lat/lng to container %:
                    // Lat: 85 (top) to -85 (bottom) => (85 - lat) / 170 * 100
                    // Lng: -180 (left) to 180 (right) => (lng + 180) / 360 * 100
                    const top = Math.max(8, Math.min(92, ((75 - srv.coordinates[0]) / 130) * 100));
                    const left = Math.max(5, Math.min(95, ((srv.coordinates[1] + 170) / 350) * 100));
                    const isCur = selectedServer.id === srv.id;

                    return (
                      <button
                        key={srv.id}
                        onClick={() => {
                          onSelectServer(srv);
                          onClose();
                        }}
                        style={{ top: `${top}%`, left: `${left}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer`}
                        title={`${srv.city}, ${srv.country} (${srv.ping}ms)`}
                      >
                        <div className={`relative flex items-center justify-center transition-all ${
                          isCur ? 'scale-125' : 'hover:scale-110'
                        }`}>
                          {isCur && (
                            <span className="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />
                          )}
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] ${
                            isCur 
                              ? 'bg-emerald-400 border-white text-slate-950 shadow-lg shadow-emerald-500/50' 
                              : 'bg-slate-800 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950'
                          }`}>
                            •
                          </div>
                          <span className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-950/90 text-white font-mono text-[10px] px-2 py-0.5 rounded border border-slate-800 whitespace-nowrap transition-opacity pointer-events-none z-30">
                            {srv.flag} {srv.city} ({srv.ping}ms)
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative z-10 mt-4 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Selected: <strong className="text-white">{selectedServer.name}</strong> ({selectedServer.ip})</span>
                <span className="font-mono text-emerald-400">10Gbps Dedicated Uplink</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>{filteredServers.length} servers available matching filters</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
