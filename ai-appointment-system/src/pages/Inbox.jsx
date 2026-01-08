import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, MoreVertical, Phone, Video, Filter } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';

const Inbox = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000); // Polling inbox
        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/chat/conversations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
                setLoading(false);
            }
        } catch (error) {
            console.error("Fetch inbox error", error);
        }
    };

    // Filter conversations based on search
    const filteredConversations = conversations.filter(conv =>
        conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-100px)] bg-slate-50 p-4 pt-0">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden h-full flex ring-1 ring-slate-900/5">
                {/* Sidebar List */}
                <div className={`w-full md:w-96 border-r border-slate-100 flex flex-col bg-slate-50/30 backdrop-blur-sm ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-slate-100/80 bg-white/50 backdrop-blur-xl sticky top-0 z-10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-2xl text-slate-900 tracking-tight">Mesajlar</h2>
                            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-indigo-600">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Sohbetlerde ara..."
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all shadow-sm placeholder:text-slate-400 font-medium"
                            />
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4 animate-pulse">
                                        <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0" />
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-4 bg-slate-200 rounded w-3/4" />
                                            <div className="h-3 bg-slate-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <MessageCircle className="w-8 h-8 text-slate-300" />
                                </div>
                                <p className="font-medium text-slate-600">Sohbet bulunamadı</p>
                                <p className="text-sm mt-1">Henüz hiç mesajınız yok.</p>
                            </div>
                        ) : (
                            <div className="p-3 space-y-1">
                                {filteredConversations.map((conv) => (
                                    <div
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-200 ${selectedConversation?.id === conv.id
                                                ? 'bg-indigo-600 shadow-md shadow-indigo-500/20'
                                                : 'hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 transition-transform group-hover:scale-105 ${selectedConversation?.id === conv.id
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600'
                                                }`}>
                                                {conv.user.name.charAt(0)}
                                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h4 className={`font-bold truncate ${selectedConversation?.id === conv.id ? 'text-white' : 'text-slate-900'
                                                        }`}>
                                                        {conv.user.name}
                                                    </h4>
                                                    <span className={`text-[10px] whitespace-nowrap font-medium ${selectedConversation?.id === conv.id ? 'text-indigo-200' : 'text-slate-400'
                                                        }`}>
                                                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className={`text-sm truncate font-medium ${selectedConversation?.id === conv.id ? 'text-indigo-100' : 'text-slate-500'
                                                    }`}>
                                                    {conv.messages[0] ? conv.messages[0].content : 'Yeni sohbet'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 flex flex-col bg-white ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    {selectedConversation ? (
                        <ChatWindow
                            conversationId={selectedConversation.id}
                            salonId={selectedConversation.salonId}
                            salonName={selectedConversation.user.name}
                            isOwner={true}
                            onClose={() => setSelectedConversation(null)}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
                            <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 animate-bounce">
                                <MessageCircle className="w-12 h-12 text-indigo-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Hoşgeldiniz!</h3>
                            <p className="max-w-xs text-center text-slate-500">
                                Müşterilerinizle iletişime geçmek için sol taraftan bir sohbet seçin.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Inbox;
