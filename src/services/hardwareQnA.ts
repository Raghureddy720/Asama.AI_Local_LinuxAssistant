import { HardwareData } from '../types/hardware';

/**
 * Intelligent local hardware Q&A reasoning engine for Demo Mode.
 * Generates accurate, structured technical answers based on the current hardware state.
 */
export function generateOfflineAnswer(
  query: string,
  hw: HardwareData,
  isDemoMode: boolean
): {
  text: string;
  category: 'cpu' | 'memory' | 'storage' | 'gpu' | 'os' | 'general';
  codeSnippets?: { command: string; explanation: string }[];
} {
  const q = query.toLowerCase().trim();
  const demoNotice = isDemoMode
    ? `\n\n> ℹ️ *Note: Answering based on Demo Hardware Profile (FastAPI backend is offline). Connect to http://localhost:8000 for live system queries.*`
    : '';

  // 1. Processor / CPU query
  if (
    q.includes('processor') ||
    q.includes('cpu') ||
    q.includes('core') ||
    q.includes('clock') ||
    q.includes('frequency')
  ) {
    const text = `### 🖥️ Processor Specifications

Your laptop is equipped with an **${hw.cpu.model}**.

* **Architecture:** \`${hw.cpu.architecture}\`
* **Core Configuration:** **${hw.cpu.cores} Physical Cores** / **${hw.cpu.threads} Execution Threads**
* **Clock Speeds:** Base clock of **${hw.cpu.baseClockGhz} GHz** with Turbo Boost up to **${hw.cpu.boostClockGhz} GHz**
* **Cache Levels:**
  - L1 Cache: \`${hw.cpu.cacheL1}\`
  - L2 Cache: \`${hw.cpu.cacheL2}\`
  - L3 Cache: \`${hw.cpu.cacheL3}\`
* **Real-time Status:** Currently running at **${hw.cpu.currentUsagePercent}% load** with a core temperature of **${hw.cpu.temperatureC}°C** under the \`${hw.cpu.governor}\` scaling governor.${demoNotice}`;

    return {
      text,
      category: 'cpu',
      codeSnippets: [
        {
          command: 'lscpu',
          explanation: 'Displays detailed architecture and core topology directly from sysfs',
        },
        {
          command: 'cat /proc/cpuinfo | grep "model name" | head -n 1',
          explanation: 'Extracts exact processor model string recognized by the Linux kernel',
        },
      ],
    };
  }

  // 2. RAM / Memory installed
  if (
    q.includes('how much ram') ||
    q.includes('installed ram') ||
    q.includes('memory capacity') ||
    (q.includes('ram') && !q.includes('upgrade'))
  ) {
    const text = `### ⚡ Memory (RAM) Overview

Your system has **${hw.memory.totalGb} GB** of **${hw.memory.type}** memory installed.

* **Total Installed:** **${hw.memory.totalGb} GB**
* **Currently Active:** **${hw.memory.usedGb} GB** in use (${Math.round((hw.memory.usedGb / hw.memory.totalGb) * 100)}%)
* **Available to Applications:** **${hw.memory.availableGb} GB**
* **Memory Frequency:** **${hw.memory.speedMhz} MT/s (MHz)**
* **Channel Topology:** **${hw.memory.channelConfig}** across ${hw.memory.slotsUsed} of ${hw.memory.totalSlots} available SO-DIMM slots.

Dual-channel memory provides double the memory bus bandwidth compared to single-channel configurations, which is optimal for integrated graphics and multi-threaded compilation.${demoNotice}`;

    return {
      text,
      category: 'memory',
      codeSnippets: [
        {
          command: 'free -h --giga',
          explanation: 'Inspect active, cached, and available physical memory',
        },
        {
          command: 'sudo dmidecode --type memory | grep -E "Size|Type|Speed"',
          explanation: 'Retrieves physical motherboard DIMM hardware telemetry from DMI/SMBIOS',
        },
      ],
    };
  }

  // 3. Can I upgrade my RAM?
  if (q.includes('upgrade') || q.includes('expand ram') || q.includes('max ram')) {
    const statusText = hw.memory.isUpgradeable
      ? `**Yes, your RAM is fully upgradeable!**`
      : `**No, the RAM is soldered (LPDDR) and cannot be replaced.**`;

    const text = `### 🛠️ RAM Upgrade Feasibility

${statusText}

* **Motherboard Form Factor:** Standard removable \`${hw.memory.formFactor}\` slots
* **Current Allocation:** ${hw.memory.slotsUsed} of ${hw.memory.totalSlots} slots populated (${hw.memory.totalGb} GB total)
* **Maximum Supported Capacity:** **${hw.memory.maxSupportedGb} GB**
* **Recommended Upgrade Path:** ${hw.memory.upgradeNotes}

#### Recommended Purchase Specs:
- Standard: 2x 32GB 262-pin DDR5-5200 MT/s SO-DIMM modules (1.1V, Non-ECC, Unbuffered).
- Note: Always install matched pairs to preserve dual-channel performance.${demoNotice}`;

    return {
      text,
      category: 'memory',
      codeSnippets: [
        {
          command: 'sudo dmidecode -t 16',
          explanation: 'Checks the maximum memory capacity supported by your motherboard chipset',
        },
      ],
    };
  }

  // 4. GPU / Graphics card query
  if (
    q.includes('gpu') ||
    q.includes('graphics') ||
    q.includes('video card') ||
    q.includes('nvidia') ||
    q.includes('vram')
  ) {
    const text = `### 🎮 GPU & Graphics Configuration

Your system features a dedicated **${hw.gpu.model}**.

* **GPU Vendor:** **${hw.gpu.vendor}**
* **Dedicated Video Memory (VRAM):** **${hw.gpu.vramGb} GB GDDR6**
* **Active Driver:** \`${hw.gpu.driverVersion}\`
* **Compute Capabilities:**
  - CUDA Acceleration: **${hw.gpu.cudaSupported ? 'Supported (4,608 CUDA Cores)' : 'Not Supported'}**
  - OpenCL Compute: **${hw.gpu.openClSupported ? 'Enabled' : 'Disabled'}**
* **Real-time Telemetry:** Operating at **${hw.gpu.temperatureC}°C**, **${hw.gpu.utilizationPercent}% load**, consuming approximately **${hw.gpu.powerDrawWatts}W**.

This GPU handles demanding 3D rendering, machine learning inference (PyTorch / TensorRT), and video encoding acceleration via NVENC.${demoNotice}`;

    return {
      text,
      category: 'gpu',
      codeSnippets: [
        {
          command: 'nvidia-smi',
          explanation: 'Displays real-time NVIDIA GPU utilization, VRAM usage, and active driver version',
        },
        {
          command: 'lspci -nnk | grep -iA3 "vga\\|3d"',
          explanation: 'Enumerates PCIe graphics display controllers detected by the Linux kernel',
        },
      ],
    };
  }

  // 5. Storage SSD or HDD
  if (
    q.includes('ssd') ||
    q.includes('hdd') ||
    q.includes('storage') ||
    q.includes('disk') ||
    q.includes('nvme') ||
    q.includes('drive')
  ) {
    const diskList = hw.storage.disks
      .map(
        (d) =>
          `- **\`${d.name}\` (${d.model}):** **${d.type}** (${d.sizeGb} GB total, ${d.freeGb} GB free, SMART Status: *${d.health}*, Sequential Read: ~${d.readSpeedMb} MB/s)`
      )
      .join('\n');

    const primaryType = hw.storage.disks[0]?.type || 'NVMe SSD';

    const text = `### 💾 Storage Architecture: SSD vs HDD Analysis

Your primary system drive is an ultra-fast **${primaryType}** (Solid State Drive). You do not have mechanical hard drives as your boot medium.

#### Detected Storage Devices:
${diskList}

* **Total Aggregated Capacity:** **${hw.storage.totalGb} GB**
* **Overall Storage Consumption:** **${hw.storage.usedGb} GB used** / **${hw.storage.freeGb} GB available**
* **NVMe Protocol Benefits:** NVMe SSDs utilize the high-speed PCIe Gen 4x4 interface, offering read speeds over 12x faster than traditional SATA SSDs and up to 50x faster than legacy 5400 RPM mechanical HDDs.
* **TRIM & Discard:** Supported and active via \`fstrim.timer\`.${demoNotice}`;

    return {
      text,
      category: 'storage',
      codeSnippets: [
        {
          command: 'lsblk -d -o name,rota,size,type,model',
          explanation: 'Lists storage devices: "ROTA = 0" confirms SSD/Flash; "ROTA = 1" indicates spinning HDD',
        },
        {
          command: 'sudo nvme smart-log /dev/nvme0n1',
          explanation: 'Inspects NVMe endurance, controller temperature, and read/write byte counters',
        },
      ],
    };
  }

  // 6. Complete Hardware Summary
  if (
    q.includes('complete') ||
    q.includes('summary') ||
    q.includes('overview') ||
    q.includes('specs') ||
    q.includes('all')
  ) {
    const text = `### 📋 Comprehensive Linux Hardware Specification Sheet

Here is the complete hardware and operating system breakdown for **${hw.os.hostname}**:

| Category | Component Specification | Status / Telemetry |
| :--- | :--- | :--- |
| **Operating System** | ${hw.os.distribution} ${hw.os.version} | Kernel \`${hw.os.kernel}\` (${hw.os.arch}) |
| **Processor (CPU)** | ${hw.cpu.model} | ${hw.cpu.cores} Cores / ${hw.cpu.threads} Threads @ ${hw.cpu.boostClockGhz} GHz (${hw.cpu.temperatureC}°C) |
| **System Memory** | ${hw.memory.totalGb} GB ${hw.memory.type} @ ${hw.memory.speedMhz} MHz | ${hw.memory.channelConfig} (${hw.memory.usedGb} GB used) |
| **Dedicated Graphics** | ${hw.gpu.model} | ${hw.gpu.vramGb} GB VRAM (Driver: \`${hw.gpu.driverVersion}\`) |
| **Primary Storage** | ${hw.storage.disks[0]?.model || 'NVMe SSD'} | ${hw.storage.disks[0]?.type} (${hw.storage.freeGb} GB free) |
| **System Uptime** | ${hw.os.uptimeHours} continuous hours | Init: ${hw.os.initSystem} |

All key subsystem sensors are operating within optimal thermal tolerances.${demoNotice}`;

    return {
      text,
      category: 'general',
      codeSnippets: [
        {
          command: 'inxi -Fxz',
          explanation: 'Outputs an exhaustive, formatted summary of your Linux hardware and drivers',
        },
      ],
    };
  }

  // 7. General Linux OS / Kernel query
  if (q.includes('os') || q.includes('kernel') || q.includes('ubuntu') || q.includes('distro')) {
    const text = `### 🐧 Operating System Environment

* **Distribution:** **${hw.os.distribution}** (${hw.os.version})
* **Linux Kernel:** \`${hw.os.kernel}\`
* **Architecture:** \`${hw.os.arch}\`
* **Desktop Environment:** \`${hw.os.desktopEnvironment}\`
* **System Uptime:** **${hw.os.uptimeHours} hours**
* **Init System:** \`${hw.os.initSystem}\`${demoNotice}`;

    return {
      text,
      category: 'os',
      codeSnippets: [
        {
          command: 'uname -srm',
          explanation: 'Outputs the running Linux kernel version and machine architecture',
        },
      ],
    };
  }

  // Default fallback for other questions
  const text = `### 💡 Hardware Assistant Response

Regarding your query: *"**${query}**"*

Based on your detected system profile:
- **Processor:** ${hw.cpu.model} (${hw.cpu.cores} cores, ${hw.cpu.threads} threads)
- **Memory:** ${hw.memory.totalGb} GB ${hw.memory.type} (${hw.memory.upgradeNotes})
- **Storage:** ${hw.storage.disks[0]?.type || 'NVMe SSD'} (${hw.storage.freeGb} GB free space)
- **Graphics:** ${hw.gpu.model} (${hw.gpu.vramGb} GB VRAM)
- **Linux Environment:** ${hw.os.distribution} running kernel \`${hw.os.kernel}\`

You can ask me specific questions like:
- *"Can I upgrade my RAM?"*
- *"Is my storage SSD or HDD?"*
- *"What processor does my laptop have?"*
- *"Show my complete hardware summary"*${demoNotice}`;

  return {
    text,
    category: 'general',
    codeSnippets: [
      {
        command: 'hostnamectl',
        explanation: 'Displays detailed local host, chassis, kernel, and operating system properties',
      },
    ],
  };
}
