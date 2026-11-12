import React from 'react';
import {
  LayoutDashboard,
  MessageSquareCode,
  Cpu,
  CheckCircle2,
  Server,
  Activity,
  Laptop,
  Terminal,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { BackendStatus } from '../types/hardware';

interface SidebarProps {
  currentTab: 'dashboard' | 'chat' | 'specs' | 'diagnostics' | 'api';
  onSelectTab: (tab: 'dashboard' | 'chat' | 'specs' | 'diagnostics' | 'api') => void;
  backendStatus: BackendStatus;
  onRefreshHealth: () => void;
  onOpenApiModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  backendStatus,
  onRefreshHealth,
  onOpenApiModal,
}) => {
  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'Overview',
    },
    {
      id: 'chat' as const,
      label: 'AI Hardware Q&A',
      icon: MessageSquareCode,
      badge: 'Assistant',
    },
    {
      id: 'specs' as const,
      label: 'Deep System Specs',
      icon: Cpu,
    },
    {
      id: 'diagnostics' as const,
      label: 'Diagnostics & Health',
      icon: CheckCircle2,
    },
    {
      id: 'api' as const,
      label: 'FastAPI Inspector',
      icon: Server,
      badge: backendStatus.mode === 'LIVE' ? 'Live' : 'Demo',
    },
  ];

  return (
    <aside className="w-64 bg-zinc-900/90 backdrop-blur-md border-r border-zinc-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30">
      <div>
        {/* Logo and Brand */}
        <div className="p-5 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/10 border border-cyan-400/20">
              <Laptop className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base text-zinc-100 tracking-tight flex items-center gap-1.5">
                Hardware Assistant
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Terminal className="w-3 h-3 text-cyan-400" />
                <span>Linux Hardware AI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-cyan-400' : 'text-zinc-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : item.badge === 'Live'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Backend Status Card at Bottom of Sidebar */}
      <div className="p-3 m-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  backendStatus.isLive ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  backendStatus.isLive ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              ></span>
            </span>
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              {backendStatus.mode === 'LIVE' ? 'FastAPI Connected' : 'Demo Mode Active'}
            </span>
          </div>

          <button
            onClick={onRefreshHealth}
            title="Check backend health"
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-[11px] text-zinc-400 font-mono truncate">
          {backendStatus.url}
        </div>

        {backendStatus.mode === 'DEMO' ? (
          <div className="text-[11px] text-amber-300/90 bg-amber-950/30 p-2 rounded-md border border-amber-800/40">
            Backend offline. Showing simulated Linux hardware profile.
          </div>
        ) : (
          <div className="text-[11px] text-emerald-400/90 bg-emerald-950/30 p-1.5 rounded-md border border-emerald-800/40 flex items-center justify-between">
            <span>Ping: {backendStatus.pingMs}ms</span>
            <span className="text-[10px] text-emerald-300">HTTP 200 OK</span>
          </div>
        )}

        <button
          onClick={onOpenApiModal}
          className="w-full flex items-center justify-center gap-1.5 text-xs py-1.5 px-2 bg-zinc-800/90 hover:bg-zinc-700/90 text-zinc-200 rounded-md border border-zinc-700/60 font-medium transition-colors"
        >
          <Server className="w-3 h-3 text-cyan-400" />
          <span>Configure Backend</span>
        </button>
      </div>
    </aside>
  );
};
