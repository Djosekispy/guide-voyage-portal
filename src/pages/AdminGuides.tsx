import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, Star, Eye, Trash2 } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { Guide } from "@/lib/firestore";

const AdminGuides = () => {
  const { userData, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && userData?.userType !== 'admin') {
      navigate('/');
    }
  }, [userData, loading, navigate]);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const guidesSnap = await getDocs(collection(db, "guides"));
        const guidesData = guidesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Guide[];
        setGuides(guidesData);
        setFilteredGuides(guidesData);
      } catch (error) {
        console.error("Erro ao buscar guias:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os guias",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userData?.userType === 'admin') {
      fetchGuides();
    }
  }, [userData, toast]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredGuides(
        guides.filter(guide =>
          guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guide.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guide.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    } else {
      setFilteredGuides(guides);
    }
  }, [searchTerm, guides]);

  const handleDeleteGuide = async (guideId: string) => {
    if (!confirm("Tem certeza que deseja excluir este guia?")) return;

    try {
      await deleteDoc(doc(db, "guides", guideId));
      setGuides(guides.filter(g => g.id !== guideId));
      toast({
        title: "Sucesso",
        description: "Guia excluído com sucesso"
      });
    } catch (error) {
      console.error("Erro ao excluir guia:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o guia",
        variant: "destructive"
      });
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 lg:ml-64 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Gerenciar Guias</h1>
              <p className="text-muted-foreground mt-2">
                Visualize e gerencie todos os guias turísticos
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pesquisar Guias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, cidade ou especialidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guias Cadastrados ({filteredGuides.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Especialidades</TableHead>
                      <TableHead>Avaliação</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGuides.map((guide) => (
                      <TableRow key={guide.id}>
                        <TableCell className="font-medium">{guide.name}</TableCell>
                        <TableCell>{guide.city}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {guide.specialties?.slice(0, 2).map((specialty, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                            {guide.specialties && guide.specialties.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{guide.specialties.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{guide.rating?.toFixed(1) || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{guide.phone || "-"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/guia/perfil?id=${guide.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGuide(guide.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
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
    </div>
  );
};

export default AdminGuides;
