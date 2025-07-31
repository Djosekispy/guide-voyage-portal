import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Conversation, getConversation } from '@/lib/firestore';
import { ChatUI } from '@/components/ui/ChatUI';

export const ChatPage = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!conversationId || !user?.uid) return;

    const loadConversation = async () => {
      try {
        setLoading(true);
        const conv = await getConversation(conversationId);
        
        if (!conv) {
          setError('Conversa não encontrada');
          return;
        }

        if (!conv.participantIds.includes(user.uid)) {
          setError('Você não tem permissão para acessar esta conversa');
          return;
        }

        setConversation(conv);
      } catch (err) {
        console.error('Erro ao carregar conversa:', err);
        setError('Ocorreu um erro ao carregar a conversa');
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, user?.uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Carregando conversa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => navigate('/mensagens')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para mensagens
        </Button>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Nenhuma conversa selecionada</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ChatUI 
        conversation={conversation}
        currentUserId={user?.uid || ''}
        onBack={() => navigate('/mensagens')}
      />
    </div>
  );
};