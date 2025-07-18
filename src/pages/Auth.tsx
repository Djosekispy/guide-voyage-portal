import { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "tourist", // tourist or guide
    phone: "",
    city: ""
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login data:", loginData);
    // Implementar lógica de login com Firebase
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("As senhas não coincidem");
      return;
    }
    console.log("Register data:", registerData);
    // Implementar lógica de registro com Firebase
  };

  return (
    <div className="min-h-screen pt-24 py-12 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Bem-vindo!
            </h1>
            <p className="text-muted-foreground">
              Entre em sua conta ou crie uma nova para começar sua jornada
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Acesso à Plataforma</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="register">Criar Conta</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">E-mail</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="login-email"
                          name="email"
                          type="email"
                          required
                          value={loginData.email}
                          onChange={handleLoginChange}
                          placeholder="seu@email.com"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="login-password">Senha</Label>
                      <div className="relative mt-2">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="login-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={loginData.password}
                          onChange={handleLoginChange}
                          placeholder="Sua senha"
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      Entrar
                    </Button>

                    <div className="text-center">
                      <Button variant="link" className="text-sm">
                        Esqueceu sua senha?
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* User Type Selection */}
                    <div>
                      <Label>Tipo de Conta</Label>
                      <RadioGroup
                        value={registerData.userType}
                        onValueChange={(value) => setRegisterData(prev => ({ ...prev, userType: value }))}
                        className="flex gap-6 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="tourist" id="tourist" />
                          <Label htmlFor="tourist">Turista</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="guide" id="guide" />
                          <Label htmlFor="guide">Guia Turístico</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="register-name">Nome Completo</Label>
                      <div className="relative mt-2">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="register-name"
                          name="name"
                          type="text"
                          required
                          value={registerData.name}
                          onChange={handleRegisterChange}
                          placeholder="Seu nome completo"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="register-email">E-mail</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="register-email"
                          name="email"
                          type="email"
                          required
                          value={registerData.email}
                          onChange={handleRegisterChange}
                          placeholder="seu@email.com"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="register-phone">Telefone</Label>
                        <Input
                          id="register-phone"
                          name="phone"
                          type="tel"
                          required
                          value={registerData.phone}
                          onChange={handleRegisterChange}
                          placeholder="(11) 99999-9999"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="register-city">Cidade</Label>
                        <div className="relative mt-2">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            id="register-city"
                            name="city"
                            type="text"
                            required
                            value={registerData.city}
                            onChange={handleRegisterChange}
                            placeholder="Sua cidade"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="register-password">Senha</Label>
                      <div className="relative mt-2">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="register-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          placeholder="Crie uma senha segura"
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="register-confirm-password">Confirmar Senha</Label>
                      <div className="relative mt-2">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="register-confirm-password"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={registerData.confirmPassword}
                          onChange={handleRegisterChange}
                          placeholder="Confirme sua senha"
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      Criar Conta
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Ao criar uma conta, você concorda com nossos{" "}
                      <Button variant="link" className="p-0 h-auto text-xs">
                        Termos de Uso
                      </Button>{" "}
                      e{" "}
                      <Button variant="link" className="p-0 h-auto text-xs">
                        Política de Privacidade
                      </Button>
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;