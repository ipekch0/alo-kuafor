import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles, User, Calendar, Users, Briefcase, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { aiApi } from '../api/aiApi';

const AIChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: 'Merhaba! Ben AI Randevu Asistanınız. Size nasıl yardımcı olabilirim? Randevu oluşturabilir, uzmanlarımız hakkında bilgi verebilir veya hizmetlerimizi sorgulayabilirim.',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId] = useState(`session_${Date.now()}`);
    const [aiStatus, setAiStatus] = useState({ configured: false, status: 'checking' });
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Check AI status on mount
    useEffect(() => {
        checkAIStatus();
    }, []);

    const checkAIStatus = async () => {
        const status = await aiApi.checkStatus();
        setAiStatus(status);
    };

    // Quick action buttons
    const quickActions = [
        { icon: Calendar, text: 'Randevu almak istiyorum', color: 'purple' },
        { icon: Users, text: 'Çalışanlarınızı görebilir miyim?', color: 'blue' },
        { icon: Briefcase, text: 'Hangi hizmetleri sunuyorsunuz?', color: 'green' },
    ];

    const handleQuickAction = (text) => {
        setInputText(text);
        handleSend(text);
    };

    const handleSend = async (quickText = null) => {
        const messageText = quickText || inputText;
        if (!messageText.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: messageText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        try {
            // Call real AI API
            const response = await aiApi.sendMessage(messageText, sessionId);

            // Add bot response
            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: response.message,
                timestamp: new Date(),
                action: response.action,
                actionResult: response.actionResult,
                employees: response.employees,
                services: response.services
            };

            setMessages(prev => [...prev, botMessage]);

            // If appointment was created, show success message
            if (response.action?.action === 'create_appointment' && response.actionResult) {
                const successMessage = {
                    id: Date.now() + 2,
                    type: 'bot',
                    text: `✅ Randevunuz başarıyla oluşturuldu!\n\n📅 Tarih: ${new Date(response.actionResult.dateTime).toLocaleString('tr-TR')}\n👤 Müşteri: ${response.actionResult.customer.name}\n💼 Hizmet: ${response.actionResult.service.name}\n${response.actionResult.employee ? `👨‍⚕️ Uzman: ${response.actionResult.employee.name}` : ''}`,
                    timestamp: new Date(),
                    isSuccess: true
                };
                setMessages(prev => [...prev, successMessage]);
            }

        } catch (error) {
            console.error('AI Hatası:', error);

            // Show error message
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: aiStatus.configured
                    ? 'Üzgünüm, şu anda bir hata oluştu. Lütfen tekrar deneyin.'
                    : '⚠️ AI servisi henüz yapılandırılmamış. Lütfen sistem yöneticisine GEMINI_API_KEY ayarlamasını söyleyin.',
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClearHistory = async () => {
        try {
            await aiApi.clearHistory(sessionId);
            setMessages([{
                id: Date.now(),
                type: 'bot',
                text: 'Konuşma geçmişi temizlendi. Size nasıl yardımcı olabilirim?',
                timestamp: new Date()
            }]);
        } catch (error) {
            console.error('Temizleme hatası:', error);
        }
    };

    // Format message text with basic markdown support
    const formatMessage = (text) => {
        if (!text) return '';

        // Convert **bold** to <strong>
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Convert *italic* to <em>
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Convert line breaks
        text = text.replace(/\n/g, '<br/>');

        return text;
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-lg shadow-purple-500/30 transition-all ${isOpen ? 'hidden' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    }`}
            >
                <div className="relative">
                    <Bot className="w-8 h-8" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${aiStatus.configured ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                    </span>
                </div>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-purple-900/50 overflow-hidden flex flex-col h-[600px]"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-slate-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Bot className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold flex items-center gap-2">
                                        AI Asistan
                                        <Sparkles className="w-3 h-3 text-yellow-400" />
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full animate-pulse ${aiStatus.configured ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                        <span className="text-xs text-gray-400">
                                            {aiStatus.configured ? 'Çevrimiçi' : 'Yapılandırma Gerekli'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleClearHistory}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                    title="Konuşmayı temizle"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex items-start gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'user' ? 'bg-pink-500/20 text-pink-400' : msg.isError ? 'bg-red-500/20 text-red-400' : msg.isSuccess ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                                        }`}>
                                        {msg.type === 'user' ? <User className="w-5 h-5" /> :
                                            msg.isError ? <AlertCircle className="w-5 h-5" /> :
                                                msg.isSuccess ? <CheckCircle className="w-5 h-5" /> :
                                                    <Bot className="w-5 h-5" />}
                                    </div>
                                    <div className={`max-w-[80%] p-3 rounded-2xl ${msg.type === 'user'
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-tr-none'
                                        : msg.isError
                                            ? 'bg-red-900/30 text-red-200 rounded-tl-none border border-red-700/50'
                                            : msg.isSuccess
                                                ? 'bg-green-900/30 text-green-200 rounded-tl-none border border-green-700/50'
                                                : 'bg-slate-800 text-gray-200 rounded-tl-none border border-slate-700'
                                        }`}>
                                        <div
                                            className="text-sm leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                                        />
                                        <div className="text-xs opacity-50 mt-1">
                                            {msg.timestamp?.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-purple-400/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-purple-400/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-purple-400/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Quick Actions - Show when no messages from user yet */}
                            {messages.length === 1 && (
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-400 text-center mb-2">Hızlı Aksiyonlar:</p>
                                    {quickActions.map((action, index) => (
                                        <motion.button
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => handleQuickAction(action.text)}
                                            className={`w-full p-3 rounded-xl bg-${action.color}-500/10 border border-${action.color}-500/30 hover:bg-${action.color}-500/20 transition-all flex items-center gap-3 text-left group`}
                                        >
                                            <action.icon className={`w-5 h-5 text-${action.color}-400`} />
                                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                                {action.text}
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-slate-900/50 border-t border-slate-700/50">
                            <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-xl p-2 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Bir şeyler yazın..."
                                    className="flex-1 bg-transparent text-white placeholder-gray-500 px-2 py-1 focus:outline-none"
                                    disabled={isTyping}
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!inputText.trim() || isTyping}
                                    className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatAssistant;
