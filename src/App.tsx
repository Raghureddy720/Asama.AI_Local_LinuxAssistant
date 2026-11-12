import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ChatView } from './components/ChatView';
import { DeepSpecsView } from './components/DeepSpecsView';
import { DiagnosticsView } from './components/DiagnosticsView';
import { ApiInspectorModal } from './components/ApiInspectorModal';
import { HardwareApiService, DEMO_HARDWARE } from './services/api';
import { HardwareData, BackendStatus } from './types/hardware';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'chat' | 'specs' | 'diagnostics' | 'api'>('dashboard');
  const [hardwareData, setHardwareData] = useState<HardwareData>(DEMO_HARDWARE);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(HardwareApiService.getStatus());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | undefined>(undefined);

  // Probe backend on mount
  const checkBackendHealth = useCallback(async () => {
    const status = await HardwareApiService.checkHealth();
    setBackendStatus(status);
    return status;
  }, []);

  const fetchHardwareData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const { data, isDemo } = await HardwareApiService.getHardware();
      setHardwareData(data);
      setBackendStatus((prev) => ({
        ...prev,
        isLive: !isDemo,
        mode: isDemo ? 'DEMO' : 'LIVE',
        lastChecked: new Date().toLocaleTimeString(),
      }));
    } catch {
      // Keep demo data safely
    } finally {
      setTimeout(() => setIsRefreshing(false), 450);
    }
  }, []);

  useEffect(() => {
    checkBackendHealth().then(() => {
      fetchHardwareData();
    });
  }, [checkBackendHealth, fetchHardwareData]);

  const handleAskQuestionFromAnywhere = (question: string) => {
    setPendingQuestion(question);
    setCurrentTab('chat');
  };

  const handleSelectTab = (tab: 'dashboard' | 'chat' | 'specs' | 'diagnostics' | 'api') => {
    if (tab === 'api') {
      setIsApiModalOpen(true);
    } else {
      setCurrentTab(tab);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        backendStatus={backendStatus}
        onRefreshHealth={checkBackendHealth}
        onOpenApiModal={() => setIsApiModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-zinc-950">
        {/* Global Header */}
        <Header
          backendStatus={backendStatus}
          hardwareData={hardwareData}
          isRefreshing={isRefreshing}
          onRefresh={fetchHardwareData}
          onOpenApiModal={() => setIsApiModalOpen(true)}
        />

        {/* Tab View Container */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              hardwareData={hardwareData}
              backendStatus={backendStatus}
              onRefresh={fetchHardwareData}
              isRefreshing={isRefreshing}
              onAskQuestion={handleAskQuestionFromAnywhere}
              onNavigateToTab={handleSelectTab}
            />
          )}

          {currentTab === 'chat' && (
            <ChatView
              hardwareData={hardwareData}
              backendStatus={backendStatus}
              initialQuestion={pendingQuestion}
              onClearInitialQuestion={() => setPendingQuestion(undefined)}
            />
          )}

          {currentTab === 'specs' && (
            <DeepSpecsView
              hardwareData={hardwareData}
              onAskQuestion={handleAskQuestionFromAnywhere}
            />
          )}

          {currentTab === 'diagnostics' && (
            <DiagnosticsView
              hardwareData={hardwareData}
              onAskQuestion={handleAskQuestionFromAnywhere}
            />
          )}
        </main>
      </div>

      {/* FastAPI Inspector & Configuration Modal */}
      <ApiInspectorModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        backendStatus={backendStatus}
        onHealthUpdated={(updated) => {
          setBackendStatus(updated);
          fetchHardwareData();
        }}
      />
    </div>
  );
}
