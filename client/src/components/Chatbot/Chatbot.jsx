import { useState, useRef, useEffect } from 'react';

const MAX_HISTORY = 10; // Giới hạn lịch sử gửi lên server

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Chào bạn, mình là trợ lý ảo của MVD Photoshop. Mình có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const allMessages = [...messages, userMessage];
      // Chỉ gửi tối đa MAX_HISTORY messages gần nhất để tránh vượt token limit
      const trimmedHistory = allMessages.length > MAX_HISTORY 
        ? allMessages.slice(-MAX_HISTORY) 
        : allMessages;
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: trimmedHistory }),
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Lỗi server (${response.status})`);
      }
      
      const data = await response.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      } else {
        throw new Error('Không nhận được phản hồi từ AI');
      }
    } catch (err) {
      if (err.name === 'AbortError') return; // Ignore cancelled requests
      
      console.error('Chatbot error:', err);
      const errorMessage = err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')
        ? 'Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng và thử lại.'
        : err.message?.includes('token') || err.message?.includes('limit')
          ? 'Cuộc hội thoại quá dài. Bạn hãy bắt đầu cuộc trò chuyện mới nhé!'
          : 'Xin lỗi, hệ thống đang gặp chút sự cố. Vui lòng thử lại sau nhé!';
      
      setMessages(prev => [...prev, { role: 'model', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([
      { role: 'model', content: 'Chào bạn, mình là trợ lý ảo của MVD Photoshop. Mình có thể giúp gì cho bạn hôm nay?' }
    ]);
    setInput('');
  };

  // Format message content - basic markdown-like formatting
  const formatContent = (content) => {
    if (!content) return '';
    return content
      .split('\n')
      .map((line, i) => {
        // Bold text
        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return `<span key="${i}">${formatted}</span>`;
      })
      .join('<br/>');
  };

  return (
    <div className="fixed bottom-24 right-6 w-[350px] max-w-[calc(100vw-48px)] h-[500px] max-h-[70vh] glass-panel rounded-2xl flex flex-col overflow-hidden z-[2000] animate-[slideUp_0.3s_ease] shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="p-4 bg-accent/10 border-b border-glass flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-bg-main font-bold">
            MVD
          </div>
          <div>
            <h3 className="font-bold text-accent">MVD Assistant</h3>
            <p className="text-xs text-text-secondary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* New Chat Button */}
          {messages.length > 1 && (
            <button 
              onClick={handleNewChat} 
              className="text-text-secondary hover:text-accent transition-colors p-1" 
              title="Cuộc trò chuyện mới"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
            </button>
          )}
          <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-accent text-bg-main rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}
              dangerouslySetInnerHTML={{ __html: msg.role === 'model' ? formatContent(msg.content) : msg.content }}
            />
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-white p-3 rounded-2xl rounded-tl-none text-sm flex gap-1 items-center h-[44px]">
              <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-glass bg-bg-main/50 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..." 
          className="flex-1 bg-white/5 border border-glass rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isLoading}
          className="w-10 h-10 rounded-full bg-accent text-bg-main flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-accent-hover"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
