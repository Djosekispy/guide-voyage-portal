import { ConversationList } from '@/components/ConversationList';
import Header from '@/components/Header';
import { ChatUI } from '@/components/ui/ChatUI';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation } from '@/lib/firestore';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createConversation, getConversationsForUser } from '@/lib/firestore';
import { MessageSquare } from 'lucide-react';
import GuideSidebar from '@/components/GuideSidebar';

export default function GuideMessages() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const guideId = searchParams.get('guideId');
  const guideName = searchParams.get('guideName');
  const guidePhotoURL = searchParams.get('guidePhotoURL');

  useEffect(() => {
    if (!user?.uid) return;

    const loadConversations = async () => {
      try {
        setLoading(true);
        const userConversations = await getConversationsForUser(user.uid);
        setConversations(userConversations);

        if (guideId) {
          const existingConversation = userConversations.find(conv => 
            conv.participantIds.includes(guideId)
          );

          if (existingConversation) {
            setSelectedConversation(existingConversation);
          } else {
            const newConversationId = await createConversation(
              user.uid,
              user.displayName || 'Usuário',
              user.photoURL || undefined,
              guideId,
              guideName || 'Guia',
              guidePhotoURL
            );

            const updatedConversations = await getConversationsForUser(user.uid);
            setConversations(updatedConversations);

            const newConversation = updatedConversations.find(conv => conv.id === newConversationId);
            if (newConversation) {
              setSelectedConversation(newConversation);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar conversas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [user, guideId, guideName, guidePhotoURL]);

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <GuideSidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center h-[calc(100vh-64px)]">
          <p>Carregando conversas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <GuideSidebar />
      
      <div className="flex-1 lg:ml-64">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">Mensagens</h1>
          <p className="text-muted-foreground">Gerencie suas conversas com turistas</p>
        </div>

        <div className="flex h-[calc(100vh-180px)]">
          {/* Lista de conversas - Sidebar esquerda */}
          <div className={`${selectedConversation ? 'hidden md:block md:w-1/3 lg:w-1/4' : 'w-full'} border-r bg-background`}>
            {conversations.length > 0 ? (
              <ConversationList 
                conversations={conversations}
                onSelectConversation={setSelectedConversation}
                currentUserId={user?.uid || ''}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma conversa ainda</h3>
                <p className="text-muted-foreground">
                  Quando turistas entrarem em contato, as conversas aparecerão aqui.
                </p>
              </div>
            )}
          </div>
          
          {/* Área de chat - Conteúdo direito */}
          {selectedConversation ? (
            <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
              <ChatUI 
                conversation={selectedConversation}
                currentUserId={user?.uid || ''}
                onBack={handleBackToList}
              />
            </div>
          ) : (
            <div className="hidden md:flex md:w-2/3 lg:w-3/4 items-center justify-center bg-muted/30">
              <div className="text-center p-8">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Selecione uma conversa</h3>
                <p className="text-muted-foreground">
                  Escolha uma conversa na lista para ver as mensagens
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
