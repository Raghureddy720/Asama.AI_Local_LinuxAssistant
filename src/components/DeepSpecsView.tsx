import React from 'react';
import {
  Cpu,
  Layers,
  Thermometer,
  ShieldCheck,
  CheckCircle,
  Zap,
  Terminal,
  Activity,
  Server,
  FileCode,
} from 'lucide-react';
import { HardwareData } from '../types/hardware';

interface DeepSpecsViewProps {
  hardwareData: HardwareData;
  onAskQuestion: (q: string) => void;
}

export const DeepSpecsView: React.FC<DeepSpecsViewProps> = ({ hardwareData, onAskQuestion }) => {
  const { cpu, memory, storage, gpu, os } = hardwareData;

  const pciDevices = [
    { bus: '00:00.0', type: 'Host Bridge', name: 'Intel Corporation 13th Gen Core Processor Host Bridge/DRAM Registers' },
    { bus: '00:01.0', type: 'PCI Express Root Port', name: 'Intel Corporation 13th Gen Core Processor PCIe Root Port #1' },
    { bus: '01:00.0', type: 'VGA / 3D Controller', name: `${gpu.vendor} Corporation AD106M [${gpu.model}] (rev a1)` },
    { bus: '00:0e.0', type: 'RAID bus controller', name: 'Intel Corporation Volume Management Device NVMe Controller' },
    { bus: '02:00.0', type: 'Non-Volatile memory controller', name: `${storage.disks[0]?.model || 'Samsung NVMe'} Express Controller` },
    { bus: '00:14.0', type: 'USB controller', name: 'Intel Corporation Alder Lake-P PCH USB 3.2 Gen 2x1 (xHCI) Controller' },
    { bus: '00:14.3', type: 'Network controller', name: 'Intel Corporation Wi-Fi 6E AX211 160MHz (rev 11)' },
    { bus: '00:1f.3', type: 'Audio device', name: 'Intel Corporation Alder Lake PCH-P High Definition Audio Controller' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-6 h-6 text-cyan-400" />
          <span>Deep System Architecture & Specs</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Detailed Linux hardware topology, sysfs parameters, kernel drivers, and PCIe subsystem mappings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Cache & Instruction Set Hierarchy */}
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold text-zinc-100 text-base">Cache & Instruction Extensions</h2>
          </div>

          <div className="space-y-3">
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">L1 Instruction & Data Cache</span>
                <span className="font-mono text-cyan-300 font-bold">{cpu.cacheL1}</span>
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">Ultra-low latency per-core execution register cache</div>
            </div>

            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">L2 Mid-Level Unified Cache</span>
                <span className="font-mono text-cyan-300 font-bold">{cpu.cacheL2}</span>
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">Dedicated cache shared between hyperthreaded execution pipelines</div>
            </div>

            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">L3 Last-Level Smart Cache</span>
                <span className="font-mono text-cyan-300 font-bold">{cpu.cacheL3}</span>
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">Monolithic low-latency shared pool across all 14 cores</div>
            </div>
          </div>

          <div className="mt-5">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Detected CPU Hardware Flags & Extensions
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {['fpu', 'vme', 'de', 'pse', 'tsc', 'msr', 'pae', 'mce', 'cx8', 'apic', 'sep', 'vmx (VT-x)', 'avx2', 'fma', 'sse4_2', 'aes-ni'].map((flag) => (
                <span key={flag} className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {flag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Memory Subsystem Details */}
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold text-zinc-100 text-base">Physical Memory Banks (DMI / SMBIOS)</h2>
          </div>

          <div className="space-y-3">
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-200">Slot 1 (Bank 0 / DIMM 0)</span>
                <span className="font-mono text-emerald-400 font-medium">16 GB DDR5 Installed</span>
              </div>
              <div className="mt-1 text-[11px] text-zinc-400 font-mono">
                Speed: {memory.speedMhz} MT/s • Voltage: 1.1V • Form Factor: {memory.formFactor}
              </div>
            </div>

            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-200">Slot 2 (Bank 1 / DIMM 1)</span>
                <span className="font-mono text-emerald-400 font-medium">16 GB DDR5 Installed</span>
              </div>
              <div className="mt-1 text-[11px] text-zinc-400 font-mono">
                Speed: {memory.speedMhz} MT/s • Voltage: 1.1V • Form Factor: {memory.formFactor}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-1">
                <CheckCircle className="w-4 h-4 text-indigo-400" />
                <span>Interleaved Dual-Channel Mode Confirmed</span>
              </div>
              <p className="text-zinc-400 text-[11px]">
                Both memory channels are active with symmetrical density (16GB + 16GB), giving full 128-bit memory bus throughput.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Linux PCIe Device Tree (lspci) */}
      <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-semibold text-zinc-100 text-base">Linux PCI Bus Tree (lspci Enumeration)</h2>
              <div className="text-xs text-zinc-400">Subsystem hardware devices reported via Linux sysfs</div>
            </div>
          </div>
          <button
            onClick={() => onAskQuestion('What GPU does my laptop have?')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
          >
            <span>Ask About GPU Controller</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 font-mono text-[11px]">
                <th className="pb-2 font-medium">PCI Slot</th>
                <th className="pb-2 font-medium">Class / Type</th>
                <th className="pb-2 font-medium">Device Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {pciDevices.map((dev, idx) => (
                <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-2.5 font-mono text-cyan-400 pr-4">{dev.bus}</td>
                  <td className="py-2.5 font-medium text-zinc-300 pr-4">{dev.type}</td>
                  <td className="py-2.5 text-zinc-400">{dev.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
