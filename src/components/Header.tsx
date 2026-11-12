import React, { useState } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  Server,
  Share2,
  Clock,
  Radio,
} from 'lucide-react';
import { BackendStatus, HardwareData } from '../types/hardware';

interface HeaderProps {
  backendStatus: BackendStatus;
  hardwareData: HardwareData;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenApiModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  backendStatus,
  hardwareData,
  isRefreshing,
  onRefresh,
  onOpenApiModal,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySummary = () => {
    const summary = `--- Linux Hardware Summary (${backendStatus.mode === 'DEMO' ? 'Demo Profile' : 'Live Host'}) ---
Host: ${hardwareData.os.hostname} (${hardwareData.os.distribution} - ${hardwareData.os.kernel})
CPU: ${hardwareData.cpu.model} (${hardwareData.cpu.cores}C/${hardwareData.cpu.threads}T @ ${hardwareData.cpu.boostClockGhz}GHz)
RAM: ${hardwareData.memory.totalGb} GB ${hardwareData.memory.type} @ ${hardwareData.memory.speedMhz}MHz (${hardwareData.memory.channelConfig})
GPU: ${hardwareData.gpu.model} (${hardwareData.gpu.vramGb} GB VRAM)
Primary Disk: ${hardwareData.storage.disks[0]?.model || 'SSD'} (${hardwareData.storage.disks[0]?.type}) - ${hardwareData.storage.freeGb}GB Free
Uptime: ${hardwareData.os.uptimeHours} hrs`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-20">
      {/* Prominent Demo Mode Alert Banner when backend is offline */}
      {backendStatus.mode === 'DEMO' && (
        <div className="bg-amber-950/60 border-b border-amber-800/50 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="font-semibold text-amber-300">DEMO MODE ACTIVE:</strong> FastAPI backend at{' '}
              <code className="bg-amber-900/50 px-1.5 py-0.5 rounded text-amber-100 font-mono">
                {backendStatus.url}
              </code>{' '}
              is unreachable. Displaying simulated ThinkPad Linux hardware telemetry. Mock values are never presented as real detected hardware.
            </span>
          </div>
          <button
            onClick={onOpenApiModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium shrink-0 ml-3 transition-colors"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Connect Backend</span>
          </button>
        </div>
      )}

      {/* Main Bar */}
      <div className="px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                backendStatus.mode === 'LIVE'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60'
                  : 'bg-amber-950/60 text-amber-300 border border-amber-700/60'
              }`}
            >
              <Radio className={`w-3 h-3 ${backendStatus.mode === 'LIVE' ? 'animate-pulse text-emerald-400' : 'text-amber-400'}`} />
              {backendStatus.mode === 'LIVE' ? 'Live Telemetry' : 'Demo Profile'}
            </span>
            <span className="text-zinc-500 text-xs hidden sm:inline">•</span>
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
              Host: <strong className="text-zinc-300">{hardwareData.os.hostname}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Last refreshed status */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Synced: {hardwareData.lastUpdated}</span>
          </div>

          {/* Copy specs summary */}
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700 transition-colors"
            title="Copy hardware report to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy Specs</span>
              </>
            )}
          </button>

          {/* Refresh Hardware Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
              isRefreshing
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-900/30'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Scanning...' : 'Refresh Hardware'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
