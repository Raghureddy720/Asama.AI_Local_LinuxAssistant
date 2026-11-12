import React, { useState } from 'react';
import {
  X,
  Server,
  Play,
  CheckCircle,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Code,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { BackendStatus } from '../types/hardware';
import { HardwareApiService, DEMO_HARDWARE } from '../services/api';

interface ApiInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendStatus: BackendStatus;
  onHealthUpdated: (newStatus: BackendStatus) => void;
}

export const ApiInspectorModal: React.FC<ApiInspectorModalProps> = ({
  isOpen,
  onClose,
  backendStatus,
  onHealthUpdated,
}) => {
  const [urlInput, setUrlInput] = useState(HardwareApiService.getBackendUrl());
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/v1/health');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<number | null>(null);
  const [testPing, setTestPing] = useState<number | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const endpoints = [
    { method: 'GET', path: '/api/v1/health', desc: 'System health and API availability' },
    { method: 'GET', path: '/api/v1/hardware', desc: 'Complete hardware telemetry data' },
    { method: 'GET', path: '/api/v1/hardware/cpu', desc: 'CPU processor model, cores & load' },
    { method: 'GET', path: '/api/v1/hardware/memory', desc: 'RAM capacity, slots & upgradeability' },
    { method: 'GET', path: '/api/v1/hardware/storage', desc: 'Disk layout, SSD/NVMe vs HDD detection' },
    { method: 'GET', path: '/api/v1/hardware/gpu', desc: 'GPU model, VRAM & CUDA drivers' },
    { method: 'POST', path: '/api/v1/chat', desc: 'AI hardware assistant Q&A query' },
  ];

  const handleSaveAndTest = async () => {
    HardwareApiService.setBackendUrl(urlInput);
    setIsTesting(true);
    const updatedStatus = await HardwareApiService.checkHealth();
    setIsTesting(false);
    onHealthUpdated(updatedStatus);
  };

  const handleRunEndpointTest = async (ep: { method: string; path: string }) => {
    setSelectedEndpoint(ep.path);
    setIsTesting(true);
    setTestResponse(null);
    setTestStatus(null);
    setTestPing(null);

    const start = performance.now();
    const fullUrl = `${urlInput.trim().replace(/\/$/, '')}${ep.path}`;

    try {
      const options: RequestInit = {
        method: ep.method,
        headers: { 'Accept': 'application/json' },
      };

      if (ep.method === 'POST') {
        options.headers = { ...options.headers, 'Content-Type': 'application/json' };
        options.body = JSON.stringify({ question: 'What processor does my laptop have?' });
      }

      const res = await fetch(fullUrl, { ...options, signal: AbortSignal.timeout(3000) });
      const elapsed = Math.round(performance.now() - start);
      setTestPing(elapsed);
      setTestStatus(res.status);

      const json = await res.json();
      setTestResponse(JSON.stringify(json, null, 2));
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - start);
      setTestPing(elapsed);
      setTestStatus(0);

      // Provide demo representation if backend is offline
      let mockPayload: unknown = { status: 'mock_demo_preview', message: 'FastAPI server not responding' };
      if (ep.path === '/api/v1/health') mockPayload = { status: 'offline', mode: 'demo_fallback' };
      if (ep.path === '/api/v1/hardware') mockPayload = DEMO_HARDWARE;
      if (ep.path === '/api/v1/hardware/cpu') mockPayload = DEMO_HARDWARE.cpu;
      if (ep.path === '/api/v1/hardware/memory') mockPayload = DEMO_HARDWARE.memory;
      if (ep.path === '/api/v1/hardware/storage') mockPayload = DEMO_HARDWARE.storage;
      if (ep.path === '/api/v1/hardware/gpu') mockPayload = DEMO_HARDWARE.gpu;
      if (ep.path === '/api/v1/chat') mockPayload = { response: 'Demo response: CPU is 13th Gen Intel Core i7-13700H' };

      const errorText = err instanceof Error ? err.message : 'Connection refused';
      setTestResponse(`// Connection to ${fullUrl} failed: ${errorText}\n// Showing expected response payload schema:\n\n${JSON.stringify(mockPayload, null, 2)}`);
    } finally {
      setIsTesting(false);
    }
  };

  const sampleFastApiCode = `# Sample FastAPI Backend (main.py)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Hardware Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatQuery(BaseModel):
    question: str

@app.get("/api/v1/health")
def health():
    return {"status": "ok", "service": "hardware-assistant"}

@app.get("/api/v1/hardware")
def get_hardware():
    # Return detected Linux hardware or integrate with lscpu/free/lsblk
    return {"status": "success"}

# Start server:
# uvicorn main:app --reload --port 8000
`;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-zinc-100 flex items-center gap-2">
                <span>FastAPI Backend & API Inspector</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    backendStatus.mode === 'LIVE'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {backendStatus.mode === 'LIVE' ? 'Connected' : 'Demo Mode Active'}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Connect and test live FastAPI endpoints defined in the assignment specifications.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* URL Configuration Row */}
          <div className="bg-zinc-950/70 p-4 rounded-xl border border-zinc-800/80 space-y-3">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>FastAPI Backend Base URL</span>
              <span className="text-[11px] font-normal text-zinc-500">Default: http://localhost:8000</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="http://localhost:8000"
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleSaveAndTest}
                disabled={isTesting}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>

            {backendStatus.mode === 'DEMO' ? (
              <div className="text-xs text-amber-300/90 bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/50 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Demo Mode is active.</strong> The FastAPI server at{' '}
                  <code className="font-mono text-amber-200">{urlInput}</code> is currently not reachable from your browser.
                  The app is displaying realistic simulated Linux telemetry so you can preview all features without breaking.
                </span>
              </div>
            ) : (
              <div className="text-xs text-emerald-300/90 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/50 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Connected to live FastAPI backend!</strong> Telemetry and chat queries are being routed directly to{' '}
                  <code className="font-mono text-emerald-200">{backendStatus.url}</code> (Ping: {backendStatus.pingMs}ms).
                </span>
              </div>
            )}
          </div>

          {/* Endpoint Testing Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Endpoints List */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Specification Endpoints (Click to Test)
              </h3>
              <div className="space-y-1.5">
                {endpoints.map((ep) => (
                  <button
                    key={ep.path}
                    onClick={() => handleRunEndpointTest(ep)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex items-center justify-between ${
                      selectedEndpoint === ep.path
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200'
                        : 'bg-zinc-950/50 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded ${
                            ep.method === 'GET'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                          }`}
                        >
                          {ep.method}
                        </span>
                        <span className="font-mono font-semibold">{ep.path}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1">{ep.desc}</div>
                    </div>

                    <Play className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>

            {/* Test Response Output Box */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Endpoint Response Inspector
                </h3>
                {testPing !== null && (
                  <span className="text-[11px] font-mono text-zinc-400">
                    Status: <strong className={testStatus === 200 ? 'text-emerald-400' : 'text-amber-400'}>{testStatus === 0 ? 'Connection Error' : testStatus}</strong> • {testPing}ms
                  </span>
                )}
              </div>

              <div className="flex-1 bg-zinc-950 rounded-xl border border-zinc-800 p-3 font-mono text-xs text-zinc-300 overflow-y-auto max-h-72 min-h-48 whitespace-pre">
                {isTesting ? (
                  <div className="text-cyan-400 animate-pulse flex items-center gap-2 h-full justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing HTTP request...</span>
                  </div>
                ) : testResponse ? (
                  testResponse
                ) : (
                  <span className="text-zinc-600">
                    Select any endpoint on the left to test live HTTP connectivity and inspect the JSON response payload.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick FastAPI Starter Reference */}
          <div className="bg-zinc-950/80 rounded-xl border border-zinc-800 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>Running the FastAPI Backend on your Local Machine</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sampleFastApiCode);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="text-[11px] px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded flex items-center gap-1 font-mono"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy main.py'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-zinc-400 bg-zinc-900/90 p-3 rounded-lg overflow-x-auto border border-zinc-800">
              {sampleFastApiCode}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
