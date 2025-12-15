import { useEffect, useState } from "react";
import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getAllTourPackages, updateTourPackage, deleteTourPackage, TourPackage, getAllGuides, Guide } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Search, Eye } from "lucide-react";

export default function AdminPackages() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [filtered, setFiltered] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editing, setEditing] = useState<TourPackage | null>(null);
  const [viewing, setViewing] = useState<TourPackage | null>(null);
  const [form, setForm] = useState({ 
    title: "", 
    price: "", 
    duration: "", 
    location: "",
    description: "",
    maxGroupSize: "1"
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [packagesData, guidesData] = await Promise.all([
        getAllTourPackages(),
        getAllGuides()
      ]);
      setPackages(packagesData);
      setGuides(guidesData);
      setFiltered(packagesData);
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Não foi possível carregar pacotes', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!search) return setFiltered(packages);
    const term = search.toLowerCase();
    setFiltered(packages.filter(p => 
      (p.title || '').toLowerCase().includes(term) || 
      (p.guideName || '').toLowerCase().includes(term) || 
      (p.location || '').toLowerCase().includes(term)
    ));
  }, [search, packages]);

  const handleSave = async () => {
    if (!editing) return;
    
    try {
      await updateTourPackage(editing.id, { 
        title: form.title, 
        price: Number(form.price), 
        duration: form.duration, 
        location: form.location,
        description: form.description,
        maxGroupSize: Number(form.maxGroupSize) || 1
      });
      toast({ title: 'Sucesso', description: 'Pacote atualizado' });
      setShowDialog(false);
      await load();
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Não foi possível salvar pacote', variant: 'destructive' });
    }
  };

  const handleEdit = (p: TourPackage) => {
    setEditing(p);
    setForm({ 
      title: p.title || '', 
      price: String(p.price || 0), 
      duration: p.duration || '', 
      location: p.location || '',
      description: p.description || '',
      maxGroupSize: String(p.maxGroupSize || 1)
    });
    setShowDialog(true);
  };

  const handleView = (p: TourPackage) => {
    setViewing(p);
    setShowViewDialog(true);
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

  const formatCurrency = (value: number) => {
    return value?.toLocaleString("pt-AO", { 
      style: "currency", 
      currency: "AOA",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }) || '0 Kz';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 lg:ml-64 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Gerenciar Pacotes</h1>
              <p className="text-muted-foreground mt-2">
                Visualize, edite e remova pacotes turísticos criados pelos guias
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pesquisar Pacotes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="pl-10" 
                      placeholder="Buscar por título, guia ou local" 
                      value={search} 
                      onChange={(e) => setSearch(e.target.value)} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pacotes ({filtered.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filtered.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum pacote encontrado. Os guias podem criar pacotes através do painel de guia.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Guia</TableHead>
                        <TableHead>Local</TableHead>
                        <TableHead>Duração</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.title}</TableCell>
                          <TableCell>{p.guideName || '-'}</TableCell>
                          <TableCell>{p.location || '-'}</TableCell>
                          <TableCell>{p.duration || '-'}</TableCell>
                          <TableCell>{formatCurrency(p.price)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleView(p)}>
                                <Eye className="h-4 w-4"/>
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}>
                                <Edit className="h-4 w-4"/>
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Pacote</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preço (Kz)</Label>
                <Input 
                  type="number"
                  value={form.price} 
                  onChange={(e) => setForm({ ...form, price: e.target.value })} 
                />
              </div>
              <div>
                <Label>Máx. Participantes</Label>
                <Input 
                  type="number"
                  value={form.maxGroupSize} 
                  onChange={(e) => setForm({ ...form, maxGroupSize: e.target.value })} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duração</Label>
                <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              </div>
              <div>
                <Label>Local</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewing?.title}</DialogTitle>
          </DialogHeader>

          {viewing && (
            <div className="space-y-4">
              {viewing.images && viewing.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {viewing.images.slice(0, 4).map((img, i) => (
                    <img key={i} src={img} alt={`Imagem ${i+1}`} className="w-full h-32 object-cover rounded" />
                  ))}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Guia:</span> {viewing.guideName || '-'}
                </div>
                <div>
                  <span className="font-medium">Local:</span> {viewing.location || '-'}
                </div>
                <div>
                  <span className="font-medium">Duração:</span> {viewing.duration || '-'}
                </div>
                <div>
                  <span className="font-medium">Preço:</span> {formatCurrency(viewing.price)}
                </div>
                <div>
                  <span className="font-medium">Máx. Participantes:</span> {viewing.maxGroupSize || 1}
                </div>
                <div>
                  <span className="font-medium">Avaliação:</span> {viewing.rating?.toFixed(1) || 'N/A'} ({viewing.reviewCount || 0} avaliações)
                </div>
              </div>

              <div>
                <span className="font-medium">Descrição:</span>
                <p className="text-muted-foreground mt-1">{viewing.description || 'Sem descrição'}</p>
              </div>

              {viewing.includes && viewing.includes.length > 0 && (
                <div>
                  <span className="font-medium">Inclui:</span>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                    {viewing.includes.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}

              {viewing.itinerary && viewing.itinerary.length > 0 && (
                <div>
                  <span className="font-medium">Itinerário:</span>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground mt-1">
                    {viewing.itinerary.map((item, i) => <li key={i}>{item}</li>)}
                  </ol>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}