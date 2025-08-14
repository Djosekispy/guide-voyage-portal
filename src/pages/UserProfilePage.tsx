import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Save, User, Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  photoURL?: string;
  userType: 'tourist' | 'guide';
  createdAt?: Date;
  updatedAt?: Date;
}

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState<UserProfile>({
    uid: "",
    name: "",
    email: "",
    phone: "",
    city: "",
    userType: "tourist"
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({...profileData});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;
      
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data() as UserProfile;
          setProfileData(data);
          setFormData(data);
        } else {
          const basicProfile = {
            uid: user.uid,
            name: user.displayName || "",
            email: user.email || "",
            phone: "",
            city: "",
            photoURL: user.photoURL || "",
            userType: "tourist"
          } as UserProfile;
          setProfileData(basicProfile);
          setFormData(basicProfile);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar seus dados. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, toast]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditClick = () => {
    setFormData({...profileData});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({...profileData});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedProfile = {
        ...formData,
        updatedAt: new Date()
      };

      await setDoc(doc(db, "users", user.uid), updatedProfile);
      setProfileData(updatedProfile);
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar suas alterações.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Carregando seu perfil...
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Acesso não autorizado
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p>Você precisa estar logado para acessar esta página.</p>
                <Button 
                  onClick={() => navigate('/login')} 
                  className="mt-4"
                >
                  Fazer Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-2xl">
                  {isEditing ? "Editar Perfil" : "Meu Perfil"}
                </CardTitle>
                <p className="text-muted-foreground">
                  {isEditing ? "Atualize suas informações" : "Visualize suas informações"}
                </p>
              </div>
              
              {!isEditing && (
                <Button 
                  variant="outline" 
                  onClick={handleEditClick}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
              )}
            </CardHeader>
            
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nome Completo
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <Input
                      value={formData.email}
                      type="email"
                      disabled
                      className="opacity-70 cursor-not-allowed"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Para alterar seu email, entre em contato com o suporte.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Telefone
                    </label>
                    <Input
                      value={formData.phone || ""}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+244 xxx xxx xxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Cidade
                    </label>
                    <Input
                      value={formData.city || ""}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Ex: Luanda"
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="w-40 gap-2" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Salvando..."
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Salvar
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                // Modo de visualização
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{profileData.name}</h2>
                      <p className="text-muted-foreground">Turista</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <span>{profileData.email}</span>
                    </div>

                    {profileData.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <span>{profileData.phone}</span>
                      </div>
                    )}

                    {profileData.city && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <span>{profileData.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;