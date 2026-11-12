import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Terminal,
  Cpu,
  Database,
  HardDrive,
  Gamepad2,
  AlertCircle,
  HelpCircle,
  ArrowUp,
  Radio,
} from 'lucide-react';
import { ChatMessage, HardwareData, BackendStatus } from '../types/hardware';
import { HardwareApiService } from '../services/api';
import { generateOfflineAnswer } from '../services/hardwareQnA';

interface ChatViewProps {
  hardwareData: HardwareData;
  backendStatus: BackendStatus;
  initialQuestion?: string;
  onClearInitialQuestion?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  hardwareData,
  backendStatus,
  initialQuestion,
  onClearInitialQuestion,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `### 👋 Welcome to your Local Linux Hardware Assistant!

I can analyze your system architecture, verify component models, check RAM upgrade limits, and help diagnose Linux performance bottlenecks.

Click any question below or type your inquiry to get started:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      relatedCategory: 'general',
      codeSnippets: [
        {
          command: 'inxi -Fxz',
          explanation: 'Inspect complete system hardware profile on Linux',
        },
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestedQuestions = [
    'What processor does my laptop have?',
    'How much RAM is installed?',
    'Can I upgrade my RAM?',
    'What GPU does my laptop have?',
    'Is my storage SSD or HDD?',
    'Show my complete hardware summary.',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle passed-in initial question (e.g. from Dashboard quick-button)
  useEffect(() => {
    if (initialQuestion) {
      handleSendMessage(initialQuestion);
      onClearInitialQuestion?.();
    }
  }, [initialQuestion]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    setErrorMessage(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput('');
    setIsLoading(true);

    try {
      // 1. Try FastAPI endpoint POST /api/v1/chat first
      const { answer, isDemo } = await HardwareApiService.sendChatMessage(textToSend);

      if (answer && !isDemo) {
        // Real response from live FastAPI backend!
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          relatedCategory: 'general',
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        // Backend is unreachable or returned empty -> use intelligent offline reasoning engine
        // Add a realistic thinking delay
        await new Promise((r) => setTimeout(r, 600));

        const offlineResult = generateOfflineAnswer(
          textToSend,
          hardwareData,
          backendStatus.mode === 'DEMO'
        );

        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: offlineResult.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          relatedCategory: offlineResult.category,
          codeSnippets: offlineResult.codeSnippets,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error processing query';
      setErrorMessage(`Failed to fetch AI response: ${msg}. Showing local intelligence.`);

      // Provide local answer even if network threw
      const fallbackResult = generateOfflineAnswer(textToSend, hardwareData, true);
      const assistantMsg: ChatMessage = {
        id: `asst-fallback-${Date.now()}`,
        sender: 'assistant',
        text: fallbackResult.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        relatedCategory: fallbackResult.category,
        codeSnippets: fallbackResult.codeSnippets,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: `### 🔄 Chat reset. How can I assist you with your Linux hardware?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        relatedCategory: 'general',
      },
    ]);
  };

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'cpu':
        return { label: 'CPU Architecture', icon: Cpu, color: 'text-cyan-400 bg-cyan-950/40 border-cyan-700/40' };
      case 'memory':
        return { label: 'Memory / RAM', icon: Database, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-700/40' };
      case 'storage':
        return { label: 'Storage & Drives', icon: HardDrive, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-700/40' };
      case 'gpu':
        return { label: 'GPU & Graphics', icon: Gamepad2, color: 'text-purple-400 bg-purple-950/40 border-purple-700/40' };
      default:
        return { label: 'Hardware Telemetry', icon: Sparkles, color: 'text-zinc-400 bg-zinc-800/60 border-zinc-700/40' };
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-61px)] max-w-5xl mx-auto w-full">
      {/* Top chat banner */}
      <div className="px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <span>Hardware Intelligence Agent</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  backendStatus.mode === 'LIVE'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {backendStatus.mode === 'LIVE' ? 'FastAPI Chat API' : 'Demo Local Engine'}
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">Ask any question about CPU, RAM upgradeability, storage type, or GPU.</p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 hover:bg-zinc-800 rounded-md border border-zinc-700/50 transition-colors"
          title="Reset Conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="mx-6 mt-3 p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-300 flex items-center gap-2 shrink-0">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Chat Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((message) => {
          const isUser = message.sender === 'user';
          const badge = getCategoryBadge(message.relatedCategory);
          const BadgeIcon = badge.icon;

          return (
            <div
              key={message.id}
              className={`flex gap-3 md:gap-4 max-w-4xl mx-auto ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                  isUser
                    ? 'bg-gradient-to-tr from-cyan-600 to-indigo-600 shadow-md shadow-cyan-500/10'
                    : 'bg-zinc-800 border border-zinc-700 text-cyan-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble Content */}
              <div
                className={`flex-1 rounded-2xl p-4 md:p-5 text-sm leading-relaxed border transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-950/40 to-indigo-950/30 border-cyan-800/50 text-zinc-100 max-w-xl ml-auto'
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-200 shadow-lg'
                }`}
              >
                {/* Assistant Message Header */}
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${badge.color}`}>
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                      <span className="text-[11px] text-zinc-500">{message.timestamp}</span>
                    </div>

                    <button
                      onClick={() => handleCopyText(message.id, message.text)}
                      className="text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Formatted Text Content */}
                <div className="prose prose-invert prose-sm max-w-none space-y-2 whitespace-pre-wrap font-sans">
                  {message.text}
                </div>

                {/* Command snippets if available */}
                {message.codeSnippets && message.codeSnippets.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-zinc-800 space-y-2">
                    <div className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Recommended Linux Terminal Commands</span>
                    </div>

                    {message.codeSnippets.map((snippet, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 flex items-center justify-between gap-2"
                      >
                        <div className="font-mono text-xs text-cyan-300 truncate">
                          $ {snippet.command}
                        </div>
                        <button
                          onClick={() => handleCopyText(`cmd-${message.id}-${sIdx}`, snippet.command)}
                          className="shrink-0 text-xs px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-mono flex items-center gap-1"
                          title="Copy command to clipboard"
                        >
                          {copiedId === `cmd-${message.id}-${sIdx}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Copy</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {isUser && (
                  <div className="text-[10px] text-zinc-400 text-right mt-1 font-mono">
                    {message.timestamp}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 md:gap-4 max-w-4xl mx-auto">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-cyan-400">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-zinc-400 flex items-center gap-3">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Analyzing Linux hardware telemetry...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Strip & Input Bar */}
      <div className="p-4 bg-zinc-900/90 border-t border-zinc-800/80 backdrop-blur-md shrink-0 space-y-3">
        {/* Suggested Question Chips (Requirement 3) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] text-zinc-500 font-semibold shrink-0 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Suggested:</span>
          </span>
          {suggestedQuestions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(question)}
              disabled={isLoading}
              className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 shrink-0 whitespace-nowrap transition-all hover:border-cyan-500/50"
            >
              {question}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="relative rounded-xl bg-zinc-950 border border-zinc-700 focus-within:border-cyan-500/80 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all shadow-inner">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about CPU, RAM upgradeability, SSD vs HDD, GPU, or Linux commands (Press Enter to send)..."
            rows={2}
            className="w-full bg-transparent p-3 pr-24 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none"
          />

          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-2">
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
              title="Send message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
          <span>Shift + Enter for new line • Enter to send</span>
          <span className="font-mono">
            Mode: {backendStatus.mode === 'LIVE' ? 'Connected to FastAPI' : 'Demo Local Engine Active'}
          </span>
        </div>
      </div>
    </div>
  );
};
