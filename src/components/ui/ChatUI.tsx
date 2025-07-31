import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  sendMessage, 
  getMessagesForConversation, 
  subscribeToMessages,
  markMessagesAsRead,
  Conversation,
  Message
} from '@/lib/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface ChatUIProps {
  conversation: Conversation;
  currentUserId: string;
  onBack: () => void;
}

export const ChatUI = ({ conversation, currentUserId, onBack }: ChatUIProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Obter o outro participante da conversa
  const otherParticipantIndex = conversation.participantIds.findIndex(id => id !== currentUserId);
  const otherParticipantName = conversation.participantNames[otherParticipantIndex];
  const otherParticipantPhoto = currentUserId === conversation.participantIds[0] 
    ? conversation.guidePhotoURL 
    : conversation.userPhotoURL;

  useEffect(() => {
    // Carregar mensagens iniciais
    const loadMessages = async () => {
      const initialMessages = await getMessagesForConversation(conversation.id);
      setMessages(initialMessages);
      scrollToBottom();
      
      // Marcar mensagens como lidas
      if (initialMessages.some(m => !m.isRead && m.receiverId === currentUserId)) {
        await markMessagesAsRead(conversation.id, currentUserId);
      }
    };

    loadMessages();

    // Configurar listener em tempo real
    const unsubscribe = subscribeToMessages(conversation.id, (updatedMessages) => {
      setMessages(updatedMessages);
      scrollToBottom();
      
      // Marcar novas mensagens como lidas
      if (updatedMessages.some(m => !m.isRead && m.receiverId === currentUserId)) {
        markMessagesAsRead(conversation.id, currentUserId);
      }
    });

    return () => unsubscribe();
  }, [conversation.id, currentUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const receiverId = conversation.participantIds.find(id => id !== currentUserId);
    if (!receiverId) return;

    await sendMessage(
      conversation.id,
      currentUserId,
      user?.displayName || 'Usuário',
      user?.photoURL,
      receiverId,
      newMessage
    );

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho do chat */}
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={otherParticipantPhoto} alt={otherParticipantName} />
          <AvatarFallback>{otherParticipantName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{otherParticipantName}</h3>
          <p className="text-xs text-muted-foreground">
            {conversation.participantIds.includes(currentUserId) ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${message.senderId === currentUserId 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'}`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${message.senderId === currentUserId ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {format(message.timestamp?.toDate() || new Date(), 'HH:mm', { locale: pt })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};