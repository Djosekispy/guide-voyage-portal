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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { DEFAULT_GUIDE_DATA } from '@/mock/deafultProvider';
import { createUser as createUserInFirestore } from '@/lib/firestore';
import { createWalletBalance } from '@/lib/firestore';
import { db } from "@/lib/firebase";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { Search, Trash2, Plus, AlertCircle } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Firebase config for secondary app (user creation without affecting current session)
const firebaseConfig = {
  apiKey: "AIzaSyBsQ3339Z_UadiOsKsPGdOp0LHEuMqsOEU",
  authDomain: "kilemba-df33a.firebaseapp.com",
  projectId: "kilemba-df33a",
  storageBucket: "kilemba-df33a.appspot.com",
  messagingSenderId: "877784344083",
  appId: "1:877784344083:web:da5492792babbf52f3c1e6"
};

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
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: 'tourist' as 'tourist' | 'guide' | 'admin'
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userFormError, setUserFormError] = useState("");

  useEffect(() => {
    if (!loading && userData?.userType !== 'admin') {
      navigate('/');
    }
  }, [userData, loading, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const usersData = usersSnap.docs.map(d => {
          const data = d.data() as any;
          return {
            uid: d.id,
            name: data.name || "",
            email: data.email || "",
            userType: (data.userType as UserData['userType']) || 'tourist',
            phone: data.phone || '',
            city: data.city || '',
          } as UserData;
        });
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
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        (user.name || '').toLowerCase().includes(term) ||
        (user.email || '').toLowerCase().includes(term)
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
      // If we changed to guide, ensure the guides document exists
      if (newType === 'guide') {
        const changedUser = users.find(u => u.uid === uid);
        if (changedUser) await ensureGuideDocIfNeeded(uid, changedUser.name, changedUser.email);
      }
    } catch (error) {
      console.error("Erro ao atualizar tipo de usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o tipo de usuário",
        variant: "destructive"
      });
    }
  };

  // Ensure that when changing a user to 'guide' we create a 'guides' doc if it doesn't exist
  const ensureGuideDocIfNeeded = async (uid: string, name: string, email: string) => {
    try {
      const guideRef = doc(db, 'guides', uid);
      const guideSnap = await getDoc(guideRef);
      if (!guideSnap.exists()) {
        await setDoc(guideRef, {
          id: uid,
          uid,
          name,
          email,
          phone: '',
          city: '',
          ...DEFAULT_GUIDE_DATA,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        // Ensure wallet exists for guide
        try {
          await createWalletBalance({
            guideId: uid,
            guideName: name,
            totalEarnings: 0,
            currentBalance: 0,
            totalWithdrawn: 0,
            pendingWithdrawal: 0,
          });
        } catch (err) {
          // ignore if exists or fails
        }
      }
    } catch (err) {
      console.error('Erro ao garantir documento de guia:', err);
    }
  };

  const handleCreateUser = async () => {
    setUserFormError("");

    // Validações
    if (!userFormData.name.trim()) {
      setUserFormError("Nome é obrigatório");
      return;
    }

    if (!userFormData.email.trim()) {
      setUserFormError("Email é obrigatório");
      return;
    }

    if (!userFormData.password) {
      setUserFormError("Senha é obrigatória");
      return;
    }

    if (userFormData.password.length < 6) {
      setUserFormError("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (userFormData.password !== userFormData.confirmPassword) {
      setUserFormError("As senhas não correspondem");
      return;
    }

    try {
      setIsCreatingUser(true);
      
      // Create a secondary Firebase app to create users without affecting admin session
      const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
      const secondaryAuth = getAuth(secondaryApp);

      try {
        // Criar usuário no Firebase Auth usando a instância secundária
        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth,
          userFormData.email,
          userFormData.password
        );

        const userId = userCredential.user.uid;

        // Sign out from secondary auth immediately
        await secondaryAuth.signOut();

        // Criar documento no Firestore para o usuário (usar helper)
        await createUserInFirestore(userId, {
          email: userFormData.email,
          name: userFormData.name,
          userType: userFormData.userType,
          phone: '',
          city: '',
          isActive: true
        });

        // If creating guide, also create a guide profile
        if (userFormData.userType === 'guide') {
          try {
            await setDoc(doc(db, 'guides', userId), {
              ...DEFAULT_GUIDE_DATA,
              id: userId,
              uid: userId,
              name: userFormData.name,
              email: userFormData.email,
              phone: '',
              city: '',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            // Create wallet for new guide
            await createWalletBalance({
              guideId: userId,
              guideName: userFormData.name,
              totalEarnings: 0,
              currentBalance: 0,
              totalWithdrawn: 0,
              pendingWithdrawal: 0,
            });
          } catch (err) {
            console.error('Error creating guide profile after user creation:', err);
          }
        }

        // Adicionar à lista local
        setUsers([...users, {
          uid: userId,
          email: userFormData.email,
          name: userFormData.name,
          userType: userFormData.userType,
          phone: '',
          city: '',
        }]);

        toast({
          title: "Sucesso",
          description: `Usuário '${userFormData.name}' criado com sucesso!`
        });

        // Resetar formulário
        setUserFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          userType: 'tourist'
        });
        setShowCreateUserDialog(false);
      } finally {
        // Always delete the secondary app
        await deleteApp(secondaryApp);
      }
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      if (error.code === 'auth/email-already-in-use') {
        setUserFormError("Este email já está registrado");
      } else if (error.code === 'auth/invalid-email') {
        setUserFormError("Email inválido");
      } else {
        setUserFormError(error.message || "Erro ao criar usuário");
      }
    } finally {
      setIsCreatingUser(false);
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

            <div className="flex justify-end">
              <Button onClick={() => setShowCreateUserDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Novo Usuário
              </Button>
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

      {/* Create User Dialog */}
      <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para criar uma nova conta de usuário
            </DialogDescription>
          </DialogHeader>

          {userFormError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{userFormError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome Completo</label>
              <Input
                placeholder="Ex: João Silva"
                value={userFormData.name}
                onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                disabled={isCreatingUser}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="Ex: admin@guidevoyage.com"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                disabled={isCreatingUser}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                disabled={isCreatingUser}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar Senha</label>
              <Input
                type="password"
                placeholder="Confirme a senha"
                value={userFormData.confirmPassword}
                onChange={(e) => setUserFormData({ ...userFormData, confirmPassword: e.target.value })}
                disabled={isCreatingUser}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Usuário</label>
              <Select value={userFormData.userType} onValueChange={(value) => setUserFormData({...userFormData, userType: value as any})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tourist">Turista</SelectItem>
                  <SelectItem value="guide">Guia</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateUserDialog(false)}
              disabled={isCreatingUser}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={isCreatingUser}
            >
              {isCreatingUser ? "Criando..." : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
