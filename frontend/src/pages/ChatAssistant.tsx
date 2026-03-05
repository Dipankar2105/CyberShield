import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Shield, Loader2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { chatWithAI } from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm CyberShield AI, your cybersecurity assistant. I can help you with:\n\n• Identifying scam patterns and phishing attempts\n• Understanding digital arrest fraud\n• Online safety best practices\n• How to report cybercrime in India\n• Password and account security tips\n\nHow can I help you stay safe today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const data = await chatWithAI(trimmed, history);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again. If the issue persists, the AI service may be temporarily unavailable.",
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared. How can I help you with cybersecurity today?",
    }]);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-12rem)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">AI Cybersecurity Assistant</h1>
          <p className="text-sm text-slate-400">Ask questions about scams, phishing, and online safety</p>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center px-3 py-2 text-sm text-slate-400 hover:text-red-400 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-red-500/30 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              msg.role === 'user'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-cyan-500/10 border border-cyan-500/20 text-slate-200'
                : 'bg-slate-900/50 border border-slate-800 text-slate-300'
            }`}>
              {msg.content.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < msg.content.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-800 text-slate-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3">
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 pt-4">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all outline-none text-sm"
              placeholder="Ask about scams, phishing, online safety..."
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="flex items-center justify-center w-12 h-12 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2 text-center">
          Powered by CyberShield AI • For cybersecurity guidance only
        </p>
      </div>
    </div>
  );
}
