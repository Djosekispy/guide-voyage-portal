import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ArrowLeft, Edit, Save, User, MapPin, Phone, Mail, Star, Languages } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import { Guide, updateGuideProfile } from "@/lib/firestore";
import Footer from "@/components/Footer";

const GuideProfilePage = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState<Guide>({
    id: "",
    uid: "",
    name: "",
    email: "",
    phone: "",
    city: "",
    description: "",
    experience: 0,
    pricePerHour: 0,
    languages: [],
    specialties: [],
    rating: 0,
    reviewCount: 0,
    isActive: true,
    photoURL: "",
    createdAt: null,
    updatedAt: null
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Guide>({...profileData});
  const [newLanguage, setNewLanguage] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuideProfile = async () => {
      if (!user?.uid) return;
      
      try {
        const guideRef = doc(db, "guides", user.uid);
        const guideSnap = await getDoc(guideRef);
        
        if (guideSnap.exists()) {
          const data = {
            id: guideSnap.id,
            ...guideSnap.data()
          } as Guide;
          setProfileData(data);
          setFormData(data);
        }
      } catch (error) {
        console.error("Error fetching guide profile:", error);
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar seus dados. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuideProfile();
  }, [user, toast]);

  const handleInputChange = (field: keyof Guide, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage("");
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
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
      const guideData = {
        ...formData,
        updatedAt: new Date()
      };

      await updateGuideProfile(user.uid,guideData)
      setProfileData(guideData);
      
      toast({
        title: "Perfil atualizado com sucesso!",
        description: "Suas alterações foram salvas.",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating guide profile:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Tente novamente mais tarde.",
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

  if (!userData || userData.userType !== 'guide') {
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
                <p>Você precisa ser um guia para acessar esta página.</p>
                <Button 
                  onClick={() => navigate('/')} 
                  className="mt-4"
                >
                  Voltar para a página inicial
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
                  {/* Campos editáveis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Cidade
                      </label>
                      <Input
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Ex: Luanda"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Telefone
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+244 xxx xxx xxx"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Experiência (anos)
                      </label>
                      <Input
                        value={formData.experience}
                        onChange={(e) => handleInputChange("experience", e.target.value)}
                        placeholder="Ex: 5"
                        type="number"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Preço por dia (Kz)
                    </label>
                    <Input
                      value={formData.pricePerHour}
                      onChange={(e) => handleInputChange("pricePerHour", e.target.value)}
                      placeholder="Ex: 80000"
                      type="number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Descrição
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Conte sobre sua experiência..."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Idiomas
                    </label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="Ex: Português"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                      />
                      <Button type="button" onClick={addLanguage}>
                        Adicionar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.languages.map((language) => (
                        <Badge key={language} variant="secondary" className="flex items-center gap-1">
                          {language}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeLanguage(language)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Especialidades
                    </label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        placeholder="Ex: História, Natureza"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                      />
                      <Button type="button" onClick={addSpecialty}>
                        Adicionar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="flex items-center gap-1">
                          {specialty}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeSpecialty(specialty)}
                          />
                        </Badge>
                      ))}
                    </div>
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
                // Visualização normal do perfil
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{profileData.name}</h2>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{profileData.city || "Cidade não informada"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{profileData.phone || "Telefone não informado"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{profileData.email}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-muted-foreground" />
                      <span>{profileData.experience} anos de experiência</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Preço/dia:</span>
                      <span className="font-medium">{profileData.pricePerHour ? `${profileData.pricePerHour} Kz` : "Não informado"}</span>
                    </div>
                  </div>

                  {profileData.description && (
                    <div>
                      <h3 className="font-medium mb-2">Sobre mim</h3>
                      <p className="text-muted-foreground">{profileData.description}</p>
                    </div>
                  )}

                  {profileData.languages.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Languages className="w-4 h-4" />
                        Idiomas
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profileData.languages.map((language) => (
                          <Badge key={language} variant="secondary">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profileData.specialties.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Especialidades</h3>
                      <div className="flex flex-wrap gap-2">
                        {profileData.specialties.map((specialty) => (
                          <Badge key={specialty} variant="outline">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default GuideProfilePage;