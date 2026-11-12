import React from 'react';
import {
  Cpu,
  Database,
  HardDrive,
  Gamepad2,
  Terminal,
  Activity,
  Zap,
  Layers,
  Thermometer,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { HardwareData, BackendStatus } from '../types/hardware';

interface DashboardViewProps {
  hardwareData: HardwareData;
  backendStatus: BackendStatus;
  onRefresh: () => void;
  isRefreshing: boolean;
  onAskQuestion: (question: string) => void;
  onNavigateToTab: (tab: 'dashboard' | 'chat' | 'specs' | 'diagnostics' | 'api') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  hardwareData,
  backendStatus,
  onRefresh,
  isRefreshing,
  onAskQuestion,
  onNavigateToTab,
}) => {
  const { cpu, memory, storage, gpu, os } = hardwareData;

  const ramUsedPercentage = Math.round((memory.usedGb / memory.totalGb) * 100);
  const storageUsedPercentage = Math.round((storage.usedGb / storage.totalGb) * 100);

  const suggestedQuestions = [
    'What processor does my laptop have?',
    'How much RAM is installed?',
    'Can I upgrade my RAM?',
    'What GPU does my laptop have?',
    'Is my storage SSD or HDD?',
    'Show my complete hardware summary.',
  ];

  const isDemo = backendStatus.mode === 'DEMO';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Hardware Assistant MVP
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium ${
                  isDemo
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                }`}
              >
                {isDemo ? 'SIMULATED DEMO TELEMETRY' : 'LIVE HOST TELEMETRY'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Uptime: <strong className="text-zinc-200">{os.uptimeHours} hrs</strong></span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Your Personal Hardware Intelligence Assistant
          </h1>
          <p className="mt-2 text-sm md:text-base text-zinc-400 max-w-3xl leading-relaxed">
            Real-time Linux system diagnosis, component telemetry, and intelligent AI answers for hardware upgrades, architecture queries, and performance profiling.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-800/80">
            <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/80">
              <div className="text-[11px] text-zinc-500 font-medium">Processor</div>
              <div className="text-sm font-bold text-zinc-200 truncate">{cpu.model.split('@')[0]}</div>
              <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{cpu.cores}C / {cpu.threads}T • {cpu.boostClockGhz} GHz</div>
            </div>

            <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/80">
              <div className="text-[11px] text-zinc-500 font-medium">System RAM</div>
              <div className="text-sm font-bold text-zinc-200">{memory.totalGb} GB {memory.type}</div>
              <div className="text-[10px] text-indigo-400 font-mono mt-0.5">{memory.speedMhz} MT/s • {memory.channelConfig.split(' ')[0]}</div>
            </div>

            <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/80">
              <div className="text-[11px] text-zinc-500 font-medium">Primary Disk</div>
              <div className="text-sm font-bold text-zinc-200">{storage.disks[0]?.type || 'NVMe SSD'}</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{storage.freeGb} GB Free of {storage.totalGb} GB</div>
            </div>

            <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/80">
              <div className="text-[11px] text-zinc-500 font-medium">Graphics</div>
              <div className="text-sm font-bold text-zinc-200 truncate">{gpu.model.replace('NVIDIA GeForce ', '')}</div>
              <div className="text-[10px] text-purple-400 font-mono mt-0.5">{gpu.vramGb} GB VRAM • CUDA Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Questions Quick Launcher */}
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Ask AI About Your Hardware
            </h3>
          </div>
          <button
            onClick={() => onNavigateToTab('chat')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
          >
            <span>Open AI Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onAskQuestion(q)}
              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-cyan-950/60 hover:text-cyan-200 hover:border-cyan-700/60 text-zinc-300 border border-zinc-700/60 transition-all text-left flex items-center gap-2 group"
            >
              <span>{q}</span>
              <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Main 5 Hardware Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* 1. CPU Card */}
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 shadow-lg relative flex flex-col justify-between hover:border-zinc-700 transition-all">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-zinc-100 text-base">CPU Processor</h2>
                  <div className="text-xs text-zinc-400 font-mono">{cpu.architecture}</div>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${isDemo ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50' : 'bg-zinc-800 text-zinc-400'}`}>
                {isDemo ? 'Demo Data' : 'Live'}
              </span>
            </div>

            <div className="mt-4">
              <div className="font-semibold text-sm text-zinc-200">{cpu.model}</div>
            </div>

            {/* CPU Stats */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-zinc-500 block text-[11px]">Cores / Threads</span>
                <span className="font-bold text-zinc-200 text-sm">{cpu.cores} Cores / {cpu.threads} Threads</span>
              </div>
              <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-zinc-500 block text-[11px]">Clock Speeds</span>
                <span className="font-bold text-zinc-200 text-sm">{cpu.baseClockGhz} - {cpu.boostClockGhz} GHz</span>
              </div>
              <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-zinc-500 block text-[11px]">L3 Smart Cache</span>
                <span className="font-mono text-zinc-200 font-semibold">{cpu.cacheL3}</span>
              </div>
              <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-zinc-500 block text-[11px]">Temperature</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5" />
                  {cpu.temperatureC}°C (Optimal)
                </span>
              </div>
            </div>

            {/* Load Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">Current CPU Load</span>
                <span className="font-mono font-semibold text-cyan-400">{cpu.currentUsagePercent}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${cpu.currentUsagePercent}%` }}
                />
              </div>
              <div className="mt-1.5 text-[10px] text-zinc-500 font-mono">
                Governor: {cpu.governor}
              </div>
            </div>
          </div>

          <button
            onClick={() => onAskQuestion('What processor does my laptop have?')}
            className="mt-4 w-full py-2 px-3 bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-zinc-700/60 transition-colors"
          >
            <span>Ask AI About CPU Details</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>

        {/* 2. RAM Card */}
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 shadow-lg relative flex flex-col justify-between hover:border-zinc-700 transition-all">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-zinc-100 text-base">RAM Memory</h2>
                  <div className="text-xs text-zinc-400 font-mono">{memory.type} @ {memory.speedMhz} MHz</div>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${isDemo ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50' : 'bg-zinc-800 text-zinc-400'}`}>
                {isDemo ? 'Demo Data' : 'Live'}
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold text-white">{memory.totalGb}</span>
                <span className="text-sm font-semibold text-zinc-400 ml-1">GB Installed</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {memory.channelConfig}
              </span>
            </div>

            {/* Memory breakdown */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-zinc-500 block text-[11px]">Used Memory</span>
                <span className="font-bold text-zinc-200 text-sm">{memory.usedGb} GB ({ramUsedPercentage}%)</span>
              </div>
              <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-zinc-500 block text-[11px]">Available Memory</span>
                <span className="font-bold text-emerald-400 text-sm">{memory.availableGb} GB Free</span>
              </div>
              <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-zinc-500 block text-[11px]">Slots Populated</span>
                <span className="font-semibold text-zinc-200">{memory.slotsUsed} of {memory.totalSlots} Slots ({memory.formFactor})</span>
              </div>
              <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-zinc-500 block text-[11px]">Upgrade Limit</span>
                <span className="font-semibold text-indigo-300">Up to {memory.maxSupportedGb} GB Max</span>
              </div>
            </div>

            {/* RAM Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">RAM Allocation</span>
                <span className="font-mono font-semibold text-indigo-400">{ramUsedPercentage}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${ramUsedPercentage}%` }}
                />
              </div>
              <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{memory.upgradeNotes}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onAskQuestion('Can I upgrade my RAM?')}
            className="mt-4 w-full py-2 px-3 bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-zinc-700/60 transition-colors"
          >
            <span>Ask AI: Can I upgrade my RAM?</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>

        {/* 3. Storage Card */}
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 shadow-lg relative flex flex-col justify-between hover:border-zinc-700 transition-all">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-zinc-100 text-base">Storage Drives</h2>
                  <div className="text-xs text-zinc-400 font-mono">{storage.disks.length} Physical Device(s)</div>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${isDemo ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50' : 'bg-zinc-800 text-zinc-400'}`}>
                {isDemo ? 'Demo Data' : 'Live'}
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold text-white">{storage.totalGb}</span>
                <span className="text-sm font-semibold text-zinc-400 ml-1">GB Total</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {storage.disks[0]?.type || 'NVMe SSD'}
              </span>
            </div>

            {/* Storage Progress */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">Capacity Used</span>
                <span className="font-mono text-zinc-300">{storage.usedGb} GB / {storage.totalGb} GB</span>
              </div>
              <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${storageUsedPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                <span>Free: <strong className="text-emerald-400">{storage.freeGb} GB</strong></span>
                <span>{storageUsedPercentage}% full</span>
              </div>
            </div>

            {/* Disks list */}
            <div className="mt-3 space-y-2">
              {storage.disks.map((disk, idx) => (
                <div key={idx} className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/70 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200 truncate">{disk.name}</span>
                    <span className="text-[10px] font-mono bg-zinc-800 text-cyan-300 px-1.5 py-0.5 rounded">
                      {disk.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 truncate">{disk.model}</div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-500">
                    <span>Mount: <code className="text-zinc-300">{disk.mountPoint}</code></span>
                    <span className="text-emerald-400 font-medium">{disk.health}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onAskQuestion('Is my storage SSD or HDD?')}
            className="mt-4 w-full py-2 px-3 bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-zinc-700/60 transition-colors"
          >
            <span>Ask AI: Is my storage SSD or HDD?</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>

        {/* 4. GPU Card */}
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 shadow-lg relative flex flex-col justify-between hover:border-zinc-700 transition-all">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-zinc-100 text-base">GPU Graphics</h2>
                  <div className="text-xs text-zinc-400 font-mono">{gpu.vendor}</div>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${isDemo ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50' : 'bg-zinc-800 text-zinc-400'}`}>
                {isDemo ? 'Demo Data' : 'Live'}
              </span>
            </div>

            <div className="mt-4">
              <div className="font-semibold text-sm text-zinc-200">{gpu.model}</div>
            </div>

            {/* GPU stats */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-zinc-500 block text-[11px]">Dedicated VRAM</span>
                <span className="font-bold text-zinc-100 text-sm">{gpu.vramGb} GB GDDR6</span>
              </div>
              <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-zinc-500 block text-[11px]">Compute Acceleration</span>
                <span className="font-semibold text-purple-300">
                  {gpu.cudaSupported ? 'CUDA & OpenCL' : 'OpenCL'}
                </span>
              </div>
              <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-zinc-500 block text-[11px]">GPU Temperature</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5" />
                  {gpu.temperatureC}°C
                </span>
              </div>
              <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-zinc-500 block text-[11px]">Power Draw</span>
                <span className="font-semibold text-zinc-200 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  {gpu.powerDrawWatts} W
                </span>
              </div>
            </div>

            <div className="mt-4 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60 text-xs">
              <span className="text-zinc-500 block text-[11px]">Active Driver</span>
              <span className="font-mono text-zinc-300 text-[11px] truncate block mt-0.5">
                {gpu.driverVersion}
              </span>
            </div>
          </div>

          <button
            onClick={() => onAskQuestion('What GPU does my laptop have?')}
            className="mt-4 w-full py-2 px-3 bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-zinc-700/60 transition-colors"
          >
            <span>Ask AI About GPU & VRAM</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>

        {/* 5. Operating System Card */}
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 shadow-lg relative flex flex-col justify-between hover:border-zinc-700 transition-all md:col-span-2 lg:col-span-2">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-zinc-100 text-base">Operating System Environment</h2>
                  <div className="text-xs text-zinc-400">{os.distribution} {os.version}</div>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${isDemo ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50' : 'bg-zinc-800 text-zinc-400'}`}>
                {isDemo ? 'Demo Data' : 'Live'}
              </span>
            </div>

            {/* OS detailed breakdown grid */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/60">
                <span className="text-zinc-500 block text-[11px]">Linux Kernel</span>
                <span className="font-mono font-semibold text-zinc-200 truncate block mt-0.5">{os.kernel}</span>
              </div>
              <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/60">
                <span className="text-zinc-500 block text-[11px]">Hostname</span>
                <span className="font-mono font-semibold text-zinc-200 truncate block mt-0.5">{os.hostname}</span>
              </div>
              <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/60">
                <span className="text-zinc-500 block text-[11px]">Architecture</span>
                <span className="font-mono font-semibold text-cyan-300 truncate block mt-0.5">{os.arch}</span>
              </div>
              <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/60">
                <span className="text-zinc-500 block text-[11px]">Desktop Environment</span>
                <span className="font-semibold text-zinc-200 truncate block mt-0.5">{os.desktopEnvironment}</span>
              </div>
            </div>

            <div className="mt-3 bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-zinc-300">Init System: <strong className="font-mono text-zinc-200">{os.initSystem}</strong></span>
              </div>
              <div className="text-zinc-500 font-mono text-[11px]">
                System Uptime: {os.uptimeHours} Hours
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => onAskQuestion('Show my complete hardware summary.')}
              className="flex-1 py-2 px-3 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-cyan-500/40 transition-colors"
            >
              <span>Ask AI: Show Complete Hardware Summary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateToTab('specs')}
              className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
            >
              View Full Sysfs Hierarchy
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
