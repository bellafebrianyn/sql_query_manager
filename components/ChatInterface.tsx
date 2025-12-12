import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertTriangle } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your SQL Project Assistant. I have read your Excel sheet. Ask me anything like:\n\n* \"How do I find a user in MTR_ACCALS?\"\n* \"Give me the update query for killing a login.\"\n* \"What tables are used in the Finance project?\"",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(userMsg.text);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I encountered an error connecting to the AI service. Please check your API Key configuration.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
              ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white shadow-sm'}`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            
            <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[75%] 
              ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              <div className={`rounded-2xl px-6 py-4 shadow-sm text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-white text-slate-800 border border-slate-200 rounded-tr-none' 
                  : msg.isError 
                    ? 'bg-red-50 text-red-800 border border-red-100 rounded-tl-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}>
                {msg.isError && <AlertTriangle className="w-4 h-4 inline mr-2 mb-0.5" />}
                {msg.role === 'model' ? (
                  <div className="prose prose-sm prose-slate max-w-none prose-pre:bg-slate-900 prose-pre:text-slate-50">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
              <span className="text-[10px] text-slate-400 px-2">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-4xl mx-auto">
             <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
               <Sparkles className="w-4 h-4 animate-pulse" />
             </div>
             <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-6 py-4 shadow-sm flex items-center gap-2">
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0 z-20">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your queries (e.g., 'How to update project A?')..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-5 pr-14 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="max-w-4xl mx-auto mt-2 text-center">
             <p className="text-[10px] text-slate-400">AI can make mistakes. Always verify the SQL before executing.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
