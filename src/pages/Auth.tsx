import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const { user, userData, login, register, loginWithGoogle, loading } = useAuth();
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
    userType: "tourist" as "tourist" | "guide",
    phone: "",
    city: ""
  });
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user && userData) {
      const dashboardPath = userData.userType === 'guide' ? '/guia/dashboard' : '/turista/dashboard';
      navigate(dashboardPath);
    }
  }, [user, userData, navigate]);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginData.email, loginData.password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("As senhas não coincidem");
      return;
    }
    try {
      await register(registerData.email, registerData.password, {
        name: registerData.name,
        email: registerData.email,
        userType: registerData.userType,
        phone: registerData.phone,
        city: registerData.city
      });
      
      // Redirecionar para dashboard apropriado
      const dashboardPath = registerData.userType === 'guide' ? '/guia/dashboard' : '/turista/dashboard';
      navigate(dashboardPath);
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <Header />
      <div className="pt-24 py-12">
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

                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? "Entrando..." : "Entrar"}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Ou continue com
                        </span>
                      </div>
                    </div>

                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      {loading ? "Entrando..." : "Entrar com Google"}
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
                        onValueChange={(value: "tourist" | "guide") => setRegisterData(prev => ({ ...prev, userType: value }))}
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

                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? "Criando conta..." : "Criar Conta"}
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
    </div>
  );
};

export default Auth;