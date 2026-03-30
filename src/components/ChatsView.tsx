import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from '../firebase';
import { useAuth } from '../App';
import { Send, User, ChevronLeft, Search, MoreVertical, Phone, Video, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ChatsView() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort in memory by lastMessageAt desc
      chatsData.sort((a, b) => {
        const dateA = a.lastMessageAt?.toMillis?.() || a.lastMessageAt?.seconds || 0;
        const dateB = b.lastMessageAt?.toMillis?.() || b.lastMessageAt?.seconds || 0;
        return dateB - dateA;
      });

      setChats(chatsData);
      setLoading(false);
    }, (error: any) => {
      console.error('Error fetching chats:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, 'chats', chatId, 'messages')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort in memory by createdAt asc
      messagesData.sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() || a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.toMillis?.() || b.createdAt?.seconds || 0;
        return dateA - dateB;
      });

      setMessages(messagesData);
      setTimeout(scrollToBottom, 100);
    });

    return unsubscribe;
  }, [chatId, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        chatId,
        senderId: user.uid,
        text: messageText,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: messageText,
        lastMessageAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const activeChat = chats.find(c => c.id === chatId);

  return (
    <div className="h-[calc(100vh-120px)] flex bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Sidebar: Chat List */}
      <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${chatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 space-y-4">
          <h2 className="text-xl font-bold">Chats</h2>
          <IndexErrorAlert errorLink={indexError} className="mb-2" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-12 h-12 bg-gray-100 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : chats.length > 0 ? (
            chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => navigate(`/chats/${chat.id}`)}
                className={`w-full p-4 flex gap-3 items-center hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                  chatId === chat.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-sm truncate">
                      {chat.productTitle}
                    </h3>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {chat.lastMessageAt ? formatDistanceToNow(chat.lastMessageAt.toDate()) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-10 px-4">
              <p className="text-gray-400 text-sm">No chats yet. Start a conversation from a product page!</p>
            </div>
          )}
        </div>
      </div>

      {/* Main: Chat Window */}
      <div className={`flex-1 flex flex-col ${!chatId ? 'hidden md:flex bg-gray-50 items-center justify-center' : 'flex'}`}>
        {chatId && activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/chats')} className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">{activeChat.productTitle}</h3>
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Phone className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Video className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                      msg.senderId === user.uid
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className={`text-[10px] mt-1 block ${msg.senderId === user.uid ? 'text-blue-100' : 'text-gray-400'}`}>
                      {msg.createdAt ? formatDistanceToNow(msg.createdAt.toDate()) : ''}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none px-2 py-1 text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-200 mx-auto">
              <MessageCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Your Messages</h3>
              <p className="text-sm text-gray-500">Select a chat to start messaging.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
