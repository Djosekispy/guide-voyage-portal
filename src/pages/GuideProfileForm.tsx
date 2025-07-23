import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";

const GuideProfileForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    city: "",
    phone: "",
    description: "",
    experience: "",
    price: "",
    languages: [] as string[],
    specialties: [] as string[]
  });
  
  const [newLanguage, setNewLanguage] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const guideData = {
        ...formData,
        uid: user.uid,
        email: user.email,
        photoURL: user.photoURL || "",
        createdAt: new Date(),
        approved: false, // Requer aprovação
        rating: 0,
        reviewCount: 0
      };

      await setDoc(doc(db, "guides", user.uid), guideData);
      
      toast({
        title: "Perfil criado com sucesso!",
        description: "Seu perfil de guia foi enviado para aprovação.",
      });
      
      navigate("/guia/dashboard");
    } catch (error) {
      console.error("Error creating guide profile:", error);
      toast({
        title: "Erro ao criar perfil",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Complete seu perfil de Guia
              </CardTitle>
              <p className="text-muted-foreground text-center">
                Preencha as informações para se tornar um guia verificado
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      Experiência
                    </label>
                    <Input
                      value={formData.experience}
                      onChange={(e) => handleInputChange("experience", e.target.value)}
                      placeholder="Ex: 5 anos"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preço por dia (em Kwanzas)
                  </label>
                  <Input
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="Ex: 80.000 Kz/dia"
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
                    placeholder="Conte sobre sua experiência e especialidades..."
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
                      placeholder="Ex: História, Natureza, Gastronomia"
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

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Criando perfil..." : "Criar Perfil de Guia"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GuideProfileForm;