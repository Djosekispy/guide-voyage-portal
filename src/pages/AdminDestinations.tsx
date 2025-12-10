import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Search } from 'lucide-react';

interface Destination {
  id?: string;
  name: string;
  country?: string;
  description?: string;
  images?: string[];
}

export default function AdminDestinations() {
  const { toast } = useToast();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filtered, setFiltered] = useState<Destination[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [form, setForm] = useState<Destination>({ name: '', country: '', description: '', images: [] });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'destinations'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Destination[];
      setDestinations(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Não foi possível carregar destinos', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!search) return setFiltered(destinations);
    const term = search.toLowerCase();
    setFiltered(destinations.filter(d => d.name.toLowerCase().includes(term) || (d.country || '').toLowerCase().includes(term)));
  }, [search, destinations]);

  const openCreate = () => { setEditing(null); setForm({ name: '', country: '', description: '', images: [] }); setShowDialog(true); };

  const handleSave = async () => {
    try {
      if (editing && editing.id) {
        await updateDoc(doc(db, 'destinations', editing.id), { ...form, updatedAt: serverTimestamp() });
        toast({ title: 'Sucesso', description: 'Destino atualizado' });
      } else {
        await addDoc(collection(db, 'destinations'), { ...form, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast({ title: 'Sucesso', description: 'Destino criado' });
      }
      setShowDialog(false);
      await load();
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Não foi possível salvar destino', variant: 'destructive' });
    }
  };

  const handleEdit = (d: Destination) => { setEditing(d); setForm({ name: d.name, country: d.country || '', description: d.description || '', images: d.images || [] }); setShowDialog(true); };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Excluir destino?')) return;
    try {
      await deleteDoc(doc(db, 'destinations', id));
      toast({ title: 'Sucesso', description: 'Destino excluído' });
      await load();
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Não foi possível excluir destino', variant: 'destructive' });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 lg:ml-64 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Gerenciar Destinos</h1>
              <p className="text-muted-foreground mt-2">Destinos apresentados na plataforma</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pesquisar Destinos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" placeholder="Buscar por nome ou país" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <Button onClick={openCreate}>Criar Destino</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Destinos ({filtered.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>País</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(d => (
                      <TableRow key={d.id}>
                        <TableCell>{d.name}</TableCell>
                        <TableCell>{d.country || '-'}</TableCell>
                        <TableCell>{d.description || '-'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(d)}><Edit className="h-4 w-4"/></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Destino' : 'Criar Destino'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-sm">Nome</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">País</label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Descrição</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? 'Salvar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
