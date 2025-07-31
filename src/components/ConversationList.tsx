import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Conversation } from '@/lib/firestore';

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  currentUserId: string;
  guideId?: string;
  guideName?: string;
  guidePhotoURL?: string;
}

export const ConversationList = ({ 
  conversations,
  onSelectConversation,
  currentUserId,
  guideId,
  guideName,
  guidePhotoURL
}: ConversationListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conversation => {
    const otherParticipantIndex = conversation.participantIds.findIndex(id => id !== currentUserId);
    const otherParticipantName = conversation.participantNames[otherParticipantIndex];
    return otherParticipantName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold mb-4">Conversas</h2>
        <Input
          placeholder="Buscar conversas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa iniciada'}
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherParticipantIndex = conversation.participantIds.findIndex(id => id !== currentUserId);
            const otherParticipantName = conversation.participantNames[otherParticipantIndex];
            const otherParticipantPhoto = currentUserId === conversation.participantIds[0] 
              ? conversation.guidePhotoURL 
              : conversation.userPhotoURL;

            return (
              <div
                key={conversation.id}
                className="p-4 border-b hover:bg-muted/50 cursor-pointer flex items-center"
                onClick={() => onSelectConversation(conversation)}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={otherParticipantPhoto} alt={otherParticipantName} />
                  <AvatarFallback>{otherParticipantName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-semibold truncate">{otherParticipantName}</h3>
                    <span className="text-xs text-muted-foreground">
                      {format(conversation.lastMessageTimestamp?.toDate() || new Date(), 'dd/MM', { locale: pt })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                </div>
                {conversation.unreadCount > 0 && (
                  <div className="ml-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};