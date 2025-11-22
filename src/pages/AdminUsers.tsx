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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, Trash2, Edit } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  uid: string;
  email: string;
  name: string;
  userType: 'tourist' | 'guide' | 'admin';
  phone?: string;
  city?: string;
}

const AdminUsers = () => {
  const { userData, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && userData?.userType !== 'admin') {
      navigate('/');
    }
  }, [userData, loading, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const usersData = usersSnap.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as UserData[];
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userData?.userType === 'admin') {
      fetchUsers();
    }
  }, [userData, toast]);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(user => user.userType === filterType);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, filterType, users]);

  const handleDeleteUser = async (uid: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      await deleteDoc(doc(db, "users", uid));
      setUsers(users.filter(u => u.uid !== uid));
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso"
      });
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário",
        variant: "destructive"
      });
    }
  };

  const handleChangeUserType = async (uid: string, newType: 'tourist' | 'guide' | 'admin') => {
    try {
      await updateDoc(doc(db, "users", uid), { userType: newType });
      setUsers(users.map(u => u.uid === uid ? { ...u, userType: newType } : u));
      toast({
        title: "Sucesso",
        description: "Tipo de usuário atualizado com sucesso"
      });
    } catch (error) {
      console.error("Erro ao atualizar tipo de usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o tipo de usuário",
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
              <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
              <p className="text-muted-foreground mt-2">
                Visualize e gerencie todos os usuários da plataforma
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Tipo de usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="tourist">Turistas</SelectItem>
                      <SelectItem value="guide">Guias</SelectItem>
                      <SelectItem value="admin">Administradores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.uid}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            value={user.userType}
                            onValueChange={(value) => handleChangeUserType(user.uid, value as any)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tourist">Turista</SelectItem>
                              <SelectItem value="guide">Guia</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{user.city || "-"}</TableCell>
                        <TableCell>{user.phone || "-"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.uid)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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

export default AdminUsers;
