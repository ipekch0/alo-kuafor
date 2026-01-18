import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Store, X, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';

const ChatWindow = ({ conversationId, salonId, salonName, onClose, isOwner = false }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const [activeConversationId, setActiveConversationId] = useState(conversationId);

    // If no conversationId yet (first message), we need to Create or Find one
    useEffect(() => {
        const initChat = async () => {
            if (activeConversationId) {
                fetchMessages(activeConversationId);
            } else if (salonId) {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return;

                    const res = await fetch('/api/chat/conversations', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    const existing = data.find(c => c.salon.id === parseInt(salonId));
                    if (existing) {
                        setActiveConversationId(existing.id);
                    } else {
                        setLoading(false);
                    }
                } catch (error) {
                    console.error("Sohbet başlatılırken hata", error);
                }
            }
        };
        initChat();

        const interval = setInterval(() => {
            if (activeConversationId) fetchMessages(activeConversationId);
        }, 3000);
        return () => clearInterval(interval);
    }, [activeConversationId, salonId]);

    const fetchMessages = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/chat/conversations/${id}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                setLoading(false);
                if (messages.length !== data.length) {
                    scrollToBottom();
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const token = localStorage.getItem('token');
        let convId = activeConversationId;

        // Create conversation if new
        if (!convId) {
            try {
                const res = await fetch('/api/chat/conversations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ salonId })
                });
                const data = await res.json();
                convId = data.id;
                setActiveConversationId(convId);
            } catch (err) {
                console.error("Konuşma oluşturulurken başarısız", err);
                return;
            }
        }

        try {
            const res = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ conversationId: convId, content: newMessage })
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages(convId);
                scrollToBottom();
            }
        } catch (err) {
            console.error("Mesaj gönderme başarısız", err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#FAFAFA] relative">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                            {salonName ? salonName.charAt(0) : 'S'}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{salonName || 'Sohbet'}</h3>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Çevrimiçi
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {onClose && (
                        <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scroll-smooth">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-b-indigo-600"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 pb-20">
                        <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                            <span className="text-4xl">👋</span>
                        </div>
                        <p className="font-medium text-slate-600">Sohbet Başlatın</p>
                        <p className="text-sm">İlk mesajı göndererek iletişime geçin.</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = isOwner ? msg.senderType === 'SALON' : msg.senderType === 'USER';
                        const showAvatar = true; // Simplified for now, could be intelligent group check

                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`flex items-end gap-3 max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white ${isMe ? 'bg-indigo-100 hidden' : 'bg-white'
                                        }`}>
                                        {isMe ? null : <User className="w-4 h-4 text-slate-600" />}
                                    </div>

                                    <div className={`
                                        relative px-5 py-3.5 shadow-sm text-[15px] leading-relaxed
                                        ${isMe
                                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl rounded-br-sm'
                                            : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-bl-sm'
                                        }
                                    `}>
                                        {msg.content}
                                        <div className={`text-[10px] mt-1.5 flex items-center gap-1 font-medium ${isMe ? 'text-indigo-100/80 justify-end' : 'text-slate-400'
                                            }`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {isMe && <span className="opacity-80">✓✓</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-5 border-t border-slate-100">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-3">
                    <button type="button" className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors">
                        <Paperclip className="w-5 h-5" />
                    </button>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Bir mesaj yazın..."
                            className="w-full pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 text-slate-700"
                        />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-amber-500 transition-colors">
                            <Smile className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:transform-none"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
