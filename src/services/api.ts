import { HardwareData, CPUInfo, MemoryInfo, StorageInfo, GPUInfo, BackendStatus } from '../types/hardware';

// Demo Linux Workstation Hardware Data (clearly labelled as simulated demo profile)
export const DEMO_HARDWARE: HardwareData = {
  os: {
    distribution: 'Ubuntu Linux (Demo Profile)',
    version: '24.04 LTS (Noble Numbat)',
    kernel: '6.8.0-45-generic',
    hostname: 'thinkpad-linux-demo',
    uptimeHours: 42.6,
    arch: 'x86_64',
    initSystem: 'systemd 255.4',
    desktopEnvironment: 'GNOME 46.0 (Wayland)',
  },
  cpu: {
    model: '13th Gen Intel(R) Core(TM) i7-13700H',
    architecture: 'x86_64 (Raptor Lake)',
    cores: 14,
    threads: 20,
    baseClockGhz: 2.4,
    boostClockGhz: 5.0,
    cacheL1: '1.2 MB',
    cacheL2: '11.5 MB',
    cacheL3: '24.0 MB Smart Cache',
    currentUsagePercent: 24,
    temperatureC: 48,
    governor: 'powersave (intel_pstate)',
    flags: ['fpu', 'vme', 'de', 'pse', 'tsc', 'msr', 'pae', 'mce', 'cx8', 'apic', 'sep', 'vmx', 'avx2', 'fma'],
  },
  memory: {
    totalGb: 32.0,
    usedGb: 11.4,
    freeGb: 6.8,
    availableGb: 20.6,
    type: 'DDR5 SDRAM',
    speedMhz: 5200,
    formFactor: 'SO-DIMM',
    slotsUsed: 2,
    totalSlots: 2,
    channelConfig: 'Dual-Channel (2x 16GB)',
    isUpgradeable: true,
    maxSupportedGb: 64,
    upgradeNotes: 'Both SO-DIMM slots are replaceable. Max upgrade: 2x 32GB DDR5-5200.',
  },
  storage: {
    totalGb: 1024,
    usedGb: 382,
    freeGb: 642,
    disks: [
      {
        name: 'nvme0n1',
        model: 'Samsung SSD 990 PRO 1TB',
        type: 'NVMe SSD',
        sizeGb: 1000,
        usedGb: 382,
        freeGb: 618,
        mountPoint: '/ (root), /home',
        health: 'Healthy (SMART Good)',
        temperatureC: 41,
        readSpeedMb: 7450,
        writeSpeedMb: 6900,
        trimSupported: true,
      },
      {
        name: 'sda',
        model: 'Secondary Backup Data Storage (Ext4)',
        type: 'SATA SSD',
        sizeGb: 24,
        usedGb: 0,
        freeGb: 24,
        mountPoint: '/mnt/storage',
        health: 'Healthy (SMART Good)',
        temperatureC: 34,
        readSpeedMb: 550,
        writeSpeedMb: 520,
        trimSupported: true,
      }
    ],
  },
  gpu: {
    vendor: 'NVIDIA',
    model: 'NVIDIA GeForce RTX 4070 Laptop GPU',
    vramGb: 8.0,
    driverVersion: '550.67 (NVIDIA Proprietary Driver)',
    cudaCoresOrComputeUnits: 4608,
    cudaSupported: true,
    openClSupported: true,
    temperatureC: 46,
    utilizationPercent: 8,
    powerDrawWatts: 35,
  },
  lastUpdated: new Date().toLocaleTimeString(),
};

// State manager for current active backend configuration
const DEFAULT_BACKEND_URL = 'http://localhost:8000';

export class HardwareApiService {
  private static backendUrl: string = localStorage.getItem('hw_backend_url') || DEFAULT_BACKEND_URL;
  private static status: BackendStatus = {
    isLive: false,
    url: HardwareApiService.backendUrl,
    lastChecked: new Date().toLocaleTimeString(),
    pingMs: null,
    mode: 'DEMO',
  };

  public static getBackendUrl(): string {
    return this.backendUrl;
  }

  public static setBackendUrl(url: string) {
    this.backendUrl = url.trim().replace(/\/$/, '');
    localStorage.setItem('hw_backend_url', this.backendUrl);
  }

  public static getStatus(): BackendStatus {
    return { ...this.status };
  }

  /**
   * Health check to detect if FastAPI server is up
   */
  public static async checkHealth(): Promise<BackendStatus> {
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${this.backendUrl}/api/v1/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const pingMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        this.status = {
          isLive: true,
          url: this.backendUrl,
          lastChecked: new Date().toLocaleTimeString(),
          pingMs,
          mode: 'LIVE',
        };
        return this.status;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Connection refused';
      this.status = {
        isLive: false,
        url: this.backendUrl,
        lastChecked: new Date().toLocaleTimeString(),
        pingMs: null,
        mode: 'DEMO',
        errorMessage: errorMsg,
      };
      return this.status;
    }
  }

  /**
   * Fetch complete hardware summary
   */
  public static async getHardware(): Promise<{ data: HardwareData; isDemo: boolean }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(`${this.backendUrl}/api/v1/hardware`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const liveData = await response.json();
        this.status.isLive = true;
        this.status.mode = 'LIVE';
        return {
          data: {
            ...liveData,
            lastUpdated: new Date().toLocaleTimeString(),
          },
          isDemo: false,
        };
      }
    } catch {
      // Fallback to DEMO mode if backend is not reachable
    }

    // Return Demo Data with randomized slight fluctuation for realistic preview
    const fluctuatedCpuUsage = Math.min(95, Math.max(8, DEMO_HARDWARE.cpu.currentUsagePercent + Math.floor(Math.random() * 9) - 4));
    const fluctuatedCpuTemp = Math.min(85, Math.max(40, DEMO_HARDWARE.cpu.temperatureC + Math.floor(Math.random() * 5) - 2));

    const demoCopy: HardwareData = {
      ...DEMO_HARDWARE,
      cpu: {
        ...DEMO_HARDWARE.cpu,
        currentUsagePercent: fluctuatedCpuUsage,
        temperatureC: fluctuatedCpuTemp,
      },
      lastUpdated: new Date().toLocaleTimeString(),
    };

    return { data: demoCopy, isDemo: true };
  }

  /**
   * Fetch specific component endpoints
   */
  public static async getCpu(): Promise<CPUInfo> {
    try {
      const res = await fetch(`${this.backendUrl}/api/v1/hardware/cpu`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch {
      // Demo fallback
    }
    return DEMO_HARDWARE.cpu;
  }

  public static async getMemory(): Promise<MemoryInfo> {
    try {
      const res = await fetch(`${this.backendUrl}/api/v1/hardware/memory`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch {
      // Demo fallback
    }
    return DEMO_HARDWARE.memory;
  }

  public static async getStorage(): Promise<StorageInfo> {
    try {
      const res = await fetch(`${this.backendUrl}/api/v1/hardware/storage`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch {
      // Demo fallback
    }
    return DEMO_HARDWARE.storage;
  }

  public static async getGpu(): Promise<GPUInfo> {
    try {
      const res = await fetch(`${this.backendUrl}/api/v1/hardware/gpu`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch {
      // Demo fallback
    }
    return DEMO_HARDWARE.gpu;
  }

  /**
   * Send question to FastAPI /api/v1/chat endpoint
   */
  public static async sendChatMessage(question: string): Promise<{ answer: string; isDemo: boolean }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${this.backendUrl}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ question, query: question }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return {
          answer: data.response || data.answer || data.message || JSON.stringify(data),
          isDemo: false,
        };
      }
    } catch {
      // Backend is unavailable
    }

    return {
      answer: '', // Signals caller to use the offline intelligent responder
      isDemo: true,
    };
  }
}
