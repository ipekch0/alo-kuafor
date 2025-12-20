import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Paperclip, Smile } from 'lucide-react';
import axios from 'axios';

const ChatWidget = ({ salonId, salonName, user, whatsappEnabled, salonPhone }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversationId, setConversationId] = useState(null);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Initialize Chat
    useEffect(() => {
        if (isOpen && user) {
            fetchConversation();
        }
    }, [isOpen, user]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversation = async () => {
        try {
            setLoading(true);
            // First, try to start/get conversation
            const res = await axios.post('/api/chat/conversations', {
                salonId
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setConversationId(res.data.id);

            // Then fetch messages
            const msgRes = await axios.get(`/api/chat/conversations/${res.data.id}/messages`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMessages(msgRes.data);
        } catch (err) {
            console.error('Chat Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversationId) return;

        const tempMsg = {
            id: Date.now(),
            content: newMessage,
            senderType: 'USER',
            createdAt: new Date().toISOString()
        };

        setMessages([...messages, tempMsg]);
        setNewMessage('');

        try {
            const res = await axios.post('/api/chat/messages', {
                conversationId,
                content: tempMsg.content
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Update with real message from server (optional)
        } catch (err) {
            console.error('Send Error:', err);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-4 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                                    {salonName?.[0] || 'S'}
                                </div>
                                <div>
                                    <h3 className="font-semibold">{salonName || 'Salon'}</h3>
                                    <div className="flex items-center gap-1.5 opacity-90">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        <span className="text-xs">Çevrimiçi</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-full transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4">
                            {!user && (
                                <div className="text-center p-4 bg-amber-50 text-amber-800 rounded-lg text-sm">
                                    Sohbet etmek için giriş yapmalısınız.
                                </div>
                            )}

                            {user && loading && messages.length === 0 && (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${msg.senderType === 'USER'
                                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-br-none'
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                            }`}
                                    >
                                        <p>{msg.content}</p>
                                        <div className={`text-[10px] mt-1 text-right ${msg.senderType === 'USER' ? 'text-white/70' : 'text-gray-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area or WhatsApp CTA */}
                        {whatsappEnabled ? (
                            <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-3">
                                <a
                                    href={`https://wa.me/${salonPhone?.replace(/\D/g, '')}?text=Merhaba, randevu hakkında bilgi almak istiyorum.`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-200"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    WhatsApp ile Bağlan
                                </a>
                                <p className="text-xs text-center text-slate-400">
                                    Salonla doğrudan WhatsApp üzerinden görüşün.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                                <button type="button" className="p-2 text-gray-400 hover:text-amber-600 transition">
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Mesajınızı yazın..."
                                    className="flex-1 bg-gray-50 border-none rounded-full px-4 py-2.5 text-sm focus:ring-1 focus:ring-amber-500/50 focus:bg-white transition"
                                    disabled={!user}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || !user}
                                    className="p-2.5 bg-amber-600 text-white rounded-full hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-amber-600/20"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl hover:shadow-amber-600/30 transition-all duration-300"
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
