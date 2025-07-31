import { ConversationList } from '@/components/ConversationList';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { ChatUI } from '@/components/ui/ChatUI';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation } from '@/lib/firestore';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { createConversation, getConversationsForUser } from '@/lib/firestore';
import { Button } from '@/components/ui/button';

export default function MessagesPage() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
     const guideId = searchParams.get('guideId');
     const guideName = searchParams.get('guideName');
      const guidePhotoURL = searchParams.get('guidePhotoURL');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.uid) return;

    const loadConversations = async () => {
      try {
        setLoading(true);
        const userConversations = await getConversationsForUser(user.uid);
        setConversations(userConversations);

        // Verifica se há parâmetros para iniciar nova conversa
        if (guideId) {
          // Verifica se já existe conversa com este guia
          const existingConversation = userConversations.find(conv => 
            conv.participantIds.includes(guideId)
          );

          if (existingConversation) {
            setSelectedConversation(existingConversation);
          } else {
            // Cria nova conversa
            const newConversationId = await createConversation(
              user.uid,
              user.displayName || 'Usuário',
              user.photoURL || undefined,
              guideId,
              guideName || 'Guia',
              guidePhotoURL
            );

            // Atualiza a lista de conversas
            const updatedConversations = await getConversationsForUser(user.uid);
            setConversations(updatedConversations);

            // Seleciona a nova conversa
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
  }, [user, searchParams]);

  const handleBackToList = () => {
    setSelectedConversation(null);
    // Limpa o estado de navegação para evitar recriação de conversa
    navigate('/mensagens', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p>Carregando conversas...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="flex h-[calc(100vh-64px)] px-4">
        {/* Lista de conversas */}
        <div className={`${selectedConversation ? 'hidden md:block md:w-1/3 lg:w-1/4' : 'w-full'} border-r`}>
          <ConversationList 
            conversations={conversations}
            onSelectConversation={setSelectedConversation}
            currentUserId={user?.uid || ''}
          />
        </div>
        
        {/* Área de chat */}
        {selectedConversation ? (
          <div className={`${selectedConversation ? 'w-full md:w-2/3 lg:w-3/4' : 'hidden'}`}>
            <ChatUI 
              conversation={selectedConversation}
              currentUserId={user?.uid || ''}
              onBack={handleBackToList}
            />
          </div>
        ) : (
          <div className="hidden md:flex md:w-2/3 lg:w-3/4 items-center justify-center bg-muted/50">
            <div className="text-center p-8">
              <h3 className="text-xl font-semibold mb-2">Selecione uma conversa</h3>
              <p className="text-muted-foreground mb-4">
                Escolha uma conversa existente ou inicie uma nova para começar a trocar mensagens.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/guias')}
              >
                Encontrar um guia
              </Button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}