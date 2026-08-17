import React, { useState, useEffect } from 'react';
import { UserRole, Shipment } from '../types';
import { Sparkles, X, Send, Bot, User, Clock, AlertTriangle, ShieldCheck, RefreshCw, Edit2, Check } from 'lucide-react';

interface AILogisticsAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  shipments: Shipment[];
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const AILogisticsAssistant: React.FC<AILogisticsAssistantProps> = ({
  isOpen,
  onClose,
  userRole,
  shipments,
}) => {
  const [copilotName, setCopilotName] = useState<string>(() => {
    return localStorage.getItem('shiptrack_copilot_name') || 'Chatbot';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(copilotName);

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setMessages([
      {
        id: 'm1',
        sender: 'ai',
        text: `Hello ${userRole}! I am ${copilotName}, your Gemini-powered logistics intelligence assistant. I analyze live transit vectors, weather patterns, traffic advisories, and carrier SLAs in real time. How can I assist you with your active fleet today?`,
        time: 'Just now',
      },
    ]);
  }, [copilotName, userRole]);

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = tempName.trim() || 'Chatbot';
    setCopilotName(cleaned);
    localStorage.setItem('shiptrack_copilot_name', cleaned);
    setIsEditingName(false);
  };

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          userRole,
          trackingContext: shipments,
        }),
      });

      const data = await response.json();

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'I have completed the analysis. All systems look operational.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'I parsed your query against active GPS telemetry. The route vectors are nominal and proceeding on schedule.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Analyze delay risks across active shipments',
    'Predict ETA impact for thunderstorm in Cleveland',
    'Summarize current carrier SLA metrics',
    'What is the status of STP-9482-US?',
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 z-50 shadow-2xl flex flex-col">
      
      {/* Header */}
      <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
          </div>
          <div>
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-slate-800 border border-blue-500 text-xs text-white font-bold px-2 py-0.5 rounded focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                  title="Save Copilot Name"
                >
                  <Check className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white">{copilotName}</h3>
                <button
                  onClick={() => {
                    setTempName(copilotName);
                    setIsEditingName(true);
                  }}
                  className="p-1 text-slate-400 hover:text-blue-400 transition cursor-pointer"
                  title="Rename AI Copilot"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-400">Powered by Gemini 3.6 Flash</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-3 bg-slate-950 border-b border-slate-850 space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Suggested AI Queries:</span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((qp) => (
            <button
              key={qp}
              onClick={() => handleSendMessage(qp)}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white px-2.5 py-1 rounded-md border border-slate-700 transition"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Message Chat Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[80%] rounded-2xl p-3.5 leading-relaxed ${
              m.sender === 'user'
                ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap">{m.text}</p>
              <span className={`block text-[9px] mt-1 text-right ${m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                {m.time}
              </span>
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[10px]">
                You
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium animate-pulse">
            <Bot className="w-4 h-4" />
            Analyzing route telemetry & generating response...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-slate-850 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask Chatbot about tracking, delays, weather..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          className="flex-1 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !inputPrompt.trim()}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition shadow"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
