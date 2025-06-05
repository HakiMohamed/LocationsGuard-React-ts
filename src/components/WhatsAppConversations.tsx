import React, { useEffect, useState } from 'react';
import { whatsappService, WhatsAppConversation, WhatsAppMessage, SendMessagePayload } from '../services/whatsapp.service';
import { ArrowPathIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

function getTimestampValue(ts: any): number {
  if (typeof ts === 'object' && ts !== null && typeof ts.low === 'number') {
    return ts.low;
  }
  if (typeof ts === 'number') {
    return ts;
  }
  return 0;
}

function getDisplayName(conv: any): string {
  if (!conv.name) return conv.chatId;
  if (typeof conv.name === 'string') return conv.name;
  if (typeof conv.name.status === 'string') return conv.name.status;
  if (typeof conv.name.status === 'object' && conv.name.status !== null && typeof conv.name.status.status === 'string') {
    return conv.name.status.status;
  }
  return conv.chatId;
}

const WhatsAppConversations: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const data = await whatsappService.getConversations();
      setConversations(data);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleSelectChat = async (chatId: string) => {
    const conv = conversations.find(c => c.chatId === chatId);
    setSelectedConversation(conv);
    setSelectedChatId(chatId);
    setLoading(true);
    try {
      const data = await whatsappService.getMessages(chatId);
      setMessages(data.messages);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatId || sendingMessage) return;
    
    setSendingMessage(true);
    try {
      // Envoyer le message via le service
      let payload: SendMessagePayload = {
        number: selectedChatId.replace(/\D/g, ''),
        message: newMessage
      };
      await whatsappService.sendMessage(payload);
      
      // Ajouter le message envoyé à la liste locale
      const sentMessage: WhatsAppMessage = {
        id: Date.now().toString(), // ID temporaire
        content: newMessage,
        fromMe: true,
        timestamp: { low: Math.floor(Date.now() / 1000) }
      };
      
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      
      // Faire défiler vers le bas pour voir le nouveau message
      setTimeout(() => {
        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
      
      // Rafraîchir les conversations pour mettre à jour le dernier message
      await loadConversations();
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Conversations</h3>
        <button
          onClick={loadConversations}
          disabled={loadingConversations}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${loadingConversations ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations found
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {conversations.map(conv => (
                <li
                  key={conv.chatId}
                  className={`p-4 cursor-pointer transition-colors ${selectedChatId === conv.chatId ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                  onClick={() => handleSelectChat(conv.chatId)}
                >
                  <div className="flex items-center space-x-3">
                    {conv.profilePicture ? (
                      <img src={conv.profilePicture} alt="Profile" className="h-10 w-10 rounded-full" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getDisplayName(conv)}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].content : 'No messages'}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedChatId ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-gray-200 flex items-center">
                {selectedConversation?.profilePicture ? (
                  <img 
                    src={selectedConversation.profilePicture} 
                    alt="Profile" 
                    className="h-10 w-10 rounded-full mr-3" 
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900">
                    {getDisplayName(selectedConversation)}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {selectedConversation?.chatId}
                  </p>
                </div>
              </div>
              
              {/* Messages List */}
              <div 
                id="messages-container"
                className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4"
              >
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.fromMe ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200'}`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.fromMe ? 'text-indigo-100' : 'text-gray-500'}`}>
                          {new Date(getTimestampValue(msg.timestamp) * 1000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No messages in this conversation
                  </div>
                )}
              </div>
              
              {/* Message Input Form */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={sendingMessage}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                    className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingMessage ? (
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    ) : (
                      <PaperAirplaneIcon className="h-5 w-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConversations;