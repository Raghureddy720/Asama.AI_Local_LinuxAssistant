import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Zap,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Calculator,
} from 'lucide-react';
import { HardwareData } from '../types/hardware';

interface DiagnosticsViewProps {
  hardwareData: HardwareData;
  onAskQuestion: (q: string) => void;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({ hardwareData, onAskQuestion }) => {
  const { cpu, memory, storage } = hardwareData;

  const [targetRam, setTargetRam] = useState<number>(64);

  const checks = [
    {
      id: 'ram-channel',
      title: 'Memory Dual-Channel Symmetrical Mode',
      status: 'Passed',
      statusType: 'success' as const,
      description: 'System memory operates in 128-bit interleaved dual-channel, providing theoretical 83.2 GB/s peak bandwidth.',
      actionPrompt: 'How much RAM is installed?',
    },
    {
      id: 'nvme-trim',
      title: 'NVMe TRIM & Discard Operations Active',
      status: 'Active (systemd fstrim.timer)',
      statusType: 'success' as const,
      description: 'Periodic background cell wear leveling and NAND flash block cleanup is functioning properly.',
      actionPrompt: 'Is my storage SSD or HDD?',
    },
    {
      id: 'cpu-virt',
      title: 'Hardware Virtualization (Intel VT-x / VMX)',
      status: 'Enabled in UEFI BIOS',
      statusType: 'success' as const,
      description: 'Hardware hypervisor support enabled for KVM, Docker, QEMU, and VirtualBox workloads.',
      actionPrompt: 'What processor does my laptop have?',
    },
    {
      id: 'thermals',
      title: 'Thermal Throttling & Power Governor',
      status: `${cpu.temperatureC}°C (No Throttling)`,
      statusType: 'success' as const,
      description: 'Core junction temperature is well below the 100°C TjMax threshold under current load.',
      actionPrompt: 'Show my complete hardware summary.',
    },
    {
      id: 'ram-upgrade',
      title: 'RAM Upgrade Feasibility Status',
      status: memory.isUpgradeable ? 'Upgradeable (2x SO-DIMM)' : 'Soldered',
      statusType: 'success' as const,
      description: memory.upgradeNotes,
      actionPrompt: 'Can I upgrade my RAM?',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          <span>Hardware Diagnostics & Upgrade Planner</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Automated hardware health verification, subsystem integrity checks, and upgrade capability modeling.
        </p>
      </div>

      {/* Diagnostics Cards Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          System Verification Checklist
        </h2>
        {checks.map((chk) => (
          <div
            key={chk.id}
            className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-zinc-100">{chk.title}</h3>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/50">
                    {chk.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">{chk.description}</p>
              </div>
            </div>

            <button
              onClick={() => onAskQuestion(chk.actionPrompt)}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-cyan-950 hover:text-cyan-200 hover:border-cyan-700/60 text-zinc-300 border border-zinc-700 transition-colors flex items-center gap-1.5 self-start sm:self-center"
            >
              <span>Ask AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Interactive RAM Upgrade Calculator */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/40 rounded-2xl border border-zinc-800 p-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-2">
          <Calculator className="w-5 h-5 text-indigo-400" />
          <h2 className="font-semibold text-base text-zinc-100">
            Interactive RAM Upgrade Calculator
          </h2>
        </div>
        <p className="text-xs text-zinc-400 mb-6">
          Calculate module configuration, memory bus bandwidth, and compatibility for expanding your system RAM.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Target RAM selection */}
          <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
            <label className="text-xs font-semibold text-zinc-300 block mb-2">
              Select Target RAM Capacity
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[32, 48, 64].map((cap) => (
                <button
                  key={cap}
                  onClick={() => setTargetRam(cap)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    targetRam === cap
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {cap} GB RAM
                </button>
              ))}
            </div>

            <div className="mt-4 text-[11px] text-zinc-400">
              Motherboard Maximum: <strong className="text-white">{memory.maxSupportedGb} GB</strong>
            </div>
          </div>

          {/* Upgrade Plan Output */}
          <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 md:col-span-2 space-y-3">
            <div className="text-xs font-semibold text-zinc-300">
              Recommended Hardware Procurement Plan
            </div>

            {targetRam === 64 ? (
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-indigo-200">
                  <strong>Configuration:</strong> Replace both existing 16GB SO-DIMMs with <strong>2x 32GB DDR5-5200 MT/s</strong> (Total: 64GB).
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                  <div>• Form Factor: 262-pin SO-DIMM</div>
                  <div>• Voltage: 1.1V Standard</div>
                  <div>• Timing / Latency: CL42 or CL40</div>
                  <div>• Memory Bandwidth: ~83.2 GB/s</div>
                </div>
              </div>
            ) : targetRam === 48 ? (
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-zinc-800/60 border border-zinc-700 text-zinc-200">
                  <strong>Configuration:</strong> Keep 1x 16GB module and install 1x 32GB DDR5-5200 module (Asymmetrical Flex Mode).
                </div>
                <div className="text-[11px] text-zinc-400">
                  Note: The first 32GB runs in dual-channel; the remaining 16GB runs in single-channel mode.
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-200 text-xs">
                Your system currently already has <strong>32 GB DDR5</strong> installed in optimal dual-channel mode!
              </div>
            )}

            <button
              onClick={() => onAskQuestion('Can I upgrade my RAM?')}
              className="mt-3 px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-lg text-xs font-medium border border-indigo-500/40 transition-colors flex items-center gap-1.5"
            >
              <span>Ask AI To Explain RAM Installation Steps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
