import { useEffect, useState } from "react";
import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllTourPackages, createTourPackage, updateTourPackage, deleteTourPackage, TourPackage } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Search } from "lucide-react";

export default function AdminPackages() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [filtered, setFiltered] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<TourPackage | null>(null);
  const [form, setForm] = useState({ title: "", price: "", duration: "", location: "" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getAllTourPackages();
      setPackages(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Não foi possível carregar pacotes', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!search) return setFiltered(packages);
    const term = search.toLowerCase();
    setFiltered(packages.filter(p => (p.title || '').toLowerCase().includes(term) || (p.guideName || '').toLowerCase().includes(term) || (p.location || '').toLowerCase().includes(term)));
  }, [search, packages]);

  const openCreate = () => { setEditing(null); setForm({ title: '', price: '', duration: '', location: '' }); setShowDialog(true); };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateTourPackage(editing.id, { title: form.title, price: Number(form.price), duration: form.duration, location: form.location });
        toast({ title: 'Sucesso', description: 'Pacote atualizado' });
      } else {
        await createTourPackage({ title: form.title, price: Number(form.price), duration: form.duration, location: form.location, guideId: '', guideName: '', description: '', maxGroupSize: 1, includes: [], excludes: [], itinerary: [], images: [], isActive: true, rating: 0, reviewCount: 0 });
        toast({ title: 'Sucesso', description: 'Pacote criado' });
      }
      setShowDialog(false);
      await load();
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Não foi possível salvar pacote', variant: 'destructive' });
    }
  };

  const handleEdit = (p: TourPackage) => {
    setEditing(p);
    setForm({ title: p.title || '', price: String(p.price || 0), duration: p.duration || '', location: p.location || '' });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir pacote?')) return;
    try {
      await deleteTourPackage(id);
      toast({ title: 'Sucesso', description: 'Pacote excluído' });
      await load();
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Não foi possível excluir pacote', variant: 'destructive' });
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
              <h1 className="text-3xl font-bold">Gerenciar Pacotes</h1>
              <p className="text-muted-foreground mt-2">Crie, edite e remova pacotes turísticos</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pesquisar Pacotes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" placeholder="Buscar por título, guia ou local" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <Button onClick={openCreate}>Criar Pacote</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pacotes ({filtered.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Guia</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(p => (
                      <TableRow key={p.id}>
                        <TableCell>{p.title}</TableCell>
                        <TableCell>{p.guideName || '-'}</TableCell>
                        <TableCell>{p.location || '-'}</TableCell>
                        <TableCell>{p.price?.toFixed?.(0) ?? p.price} Kz</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}><Edit className="h-4 w-4"/></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
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
            <DialogTitle>{editing ? 'Editar Pacote' : 'Criar Pacote'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-sm">Título</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Preço</label>
              <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Duração</label>
              <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Local</label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
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
