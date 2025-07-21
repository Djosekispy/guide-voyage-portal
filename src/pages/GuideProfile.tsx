
import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { User, Languages, MapPin, Phone, Mail, Camera } from "lucide-react";

const GuideProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm({
    defaultValues: {
      name: "Carlos Mendes",
      email: "carlos@kilemba.com",
      phone: "+244 923 456 789",
      city: "Luanda",
      languages: ["Português", "Inglês"],
      specialties: ["História", "Cultura", "Natureza"],
      experience: "5",
      description: "Guia turístico experiente em Luanda com paixão pela história e cultura angolana."
    }
  });

  const onSubmit = (data: any) => {
    console.log(data);
    setIsEditing(false);
  };

  const languages = ["Português", "Inglês", "Francês", "Espanhol", "Alemão"];
  const specialties = ["História", "Cultura", "Natureza", "Aventura", "Gastronomia", "Arte", "Arquitetura"];
  const cities = ["Luanda", "Benguela", "Huambo", "Lobito", "Lubango", "Malanje", "Namibe"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais e profissionais</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Photo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Foto do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <User className="h-16 w-16 text-gray-400" />
              </div>
              <Button variant="outline" size="sm">
                Alterar Foto
              </Button>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>Mantenha seus dados atualizados</CardDescription>
                </div>
                <Button 
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancelar" : "Editar"}
                </Button>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing}
                                className={!isEditing ? "bg-muted" : ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="email"
                                disabled={!isEditing}
                                className={!isEditing ? "bg-muted" : ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing}
                                className={!isEditing ? "bg-muted" : ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <Select disabled={!isEditing} value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className={!isEditing ? "bg-muted" : ""}>
                                  <SelectValue placeholder="Selecione uma cidade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cities.map((city) => (
                                  <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Anos de Experiência</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number"
                                disabled={!isEditing}
                                className={!isEditing ? "bg-muted" : ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {isEditing && (
                      <div className="flex gap-4">
                        <Button type="submit" className="flex-1">
                          Salvar Alterações
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Languages and Specialties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    Idiomas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {["Português", "Inglês"].map((lang) => (
                      <div key={lang} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span>{lang}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Especialidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {["História", "Cultura", "Natureza"].map((specialty) => (
                      <div key={specialty} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span>{specialty}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideProfile;
