import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface Settings {
  siteName?: string;
  contactEmail?: string;
  currency?: string;
  defaultLanguage?: string;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'settings', 'site');
      const snap = await getDoc(docRef);
      if (snap.exists()) setSettings(snap.data() as Settings);
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Não foi possível carregar configurações', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'settings', 'site'), { ...settings, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: 'Sucesso', description: 'Configurações salvas' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Não foi possível salvar configurações', variant: 'destructive' });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 lg:ml-64 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Configurações</h1>
              <p className="text-muted-foreground mt-2">Ajustes gerais do site</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm">Nome do Site</label>
                    <Input value={settings.siteName || ''} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm">Email de Contato</label>
                    <Input value={settings.contactEmail || ''} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm">Moeda</label>
                    <Input value={settings.currency || 'Kz'} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm">Idioma Padrão</label>
                    <Input value={settings.defaultLanguage || 'pt-PT'} onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })} />
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={handleSave}>Salvar Configurações</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
