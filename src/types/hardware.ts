export interface CPUInfo {
  model: string;
  architecture: string;
  cores: number;
  threads: number;
  baseClockGhz: number;
  boostClockGhz: number;
  cacheL1: string;
  cacheL2: string;
  cacheL3: string;
  currentUsagePercent: number;
  temperatureC: number;
  governor: string;
  flags: string[];
}

export interface MemoryInfo {
  totalGb: number;
  usedGb: number;
  freeGb: number;
  availableGb: number;
  type: string; // e.g. DDR5, DDR4
  speedMhz: number;
  formFactor: string; // SO-DIMM / DIMM
  slotsUsed: number;
  totalSlots: number;
  channelConfig: string; // Dual Channel / Single Channel
  isUpgradeable: boolean;
  maxSupportedGb: number;
  upgradeNotes: string;
}

export interface DiskDevice {
  name: string;
  model: string;
  type: 'NVMe SSD' | 'SATA SSD' | 'HDD' | 'eMMC';
  sizeGb: number;
  usedGb: number;
  freeGb: number;
  mountPoint: string;
  health: 'Healthy (SMART Good)' | 'Warning' | 'Critical';
  temperatureC: number;
  readSpeedMb: number;
  writeSpeedMb: number;
  trimSupported: boolean;
}

export interface StorageInfo {
  totalGb: number;
  usedGb: number;
  freeGb: number;
  disks: DiskDevice[];
}

export interface GPUInfo {
  vendor: 'NVIDIA' | 'AMD' | 'Intel' | 'Other';
  model: string;
  vramGb: number;
  driverVersion: string;
  cudaCoresOrComputeUnits?: number;
  cudaSupported: boolean;
  openClSupported: boolean;
  temperatureC: number;
  utilizationPercent: number;
  powerDrawWatts: number;
}

export interface OSInfo {
  distribution: string;
  version: string;
  kernel: string;
  hostname: string;
  uptimeHours: number;
  arch: string;
  initSystem: string;
  desktopEnvironment: string;
}

export interface HardwareData {
  os: OSInfo;
  cpu: CPUInfo;
  memory: MemoryInfo;
  storage: StorageInfo;
  gpu: GPUInfo;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  relatedCategory?: 'cpu' | 'memory' | 'storage' | 'gpu' | 'os' | 'general';
  codeSnippets?: { command: string; explanation: string }[];
}

export interface BackendStatus {
  isLive: boolean;
  url: string;
  lastChecked: string;
  pingMs: number | null;
  mode: 'DEMO' | 'LIVE';
  errorMessage?: string;
}
