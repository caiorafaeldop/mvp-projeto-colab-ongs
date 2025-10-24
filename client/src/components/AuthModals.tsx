import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useAuth } from "@/contexts/AuthContext";
import { loginUser, registerUser } from "@/api/auth";
import { Loader2, Eye, EyeOff } from "lucide-react";

export function AuthModals() {
  const { showLoginModal, showRegisterModal, openLoginModal, openRegisterModal, closeLoginModal, closeRegisterModal } = useAuthModal();
  const { toast } = useToast();
  const { login } = useAuth();

  // Auth form states
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [registerStep, setRegisterStep] = useState<"form" | "verify">("form");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  return (
    <>
      {/* Modal de Registro */}
      <Dialog open={showRegisterModal} onOpenChange={(open) => {
        if (open) {
          openRegisterModal();
        } else {
          closeRegisterModal();
          setRegisterStep("form");
        }
      }}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Lado Esquerdo - Imagem */}
            <div className="hidden md:block bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 p-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-300/20 to-purple-300/20"></div>
              <div className="relative h-full flex flex-col items-center justify-center">
                <img
                  src="/img/For%C3%A7aeEsperan%C3%A7a.png"
                  alt="Força e Esperança"
                  className="w-full max-w-sm object-contain mb-6"
                />
                <div className="text-center">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {registerStep === "form" ? "Apoie Mensalmente" : "Verifique seu Email"}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {registerStep === "form" 
                      ? "Sua contribuição recorrente faz a diferença na vida de quem precisa"
                      : "Estamos quase lá! Confirme seu email para continuar"}
                  </p>
                </div>
              </div>
            </div>

            {/* Lado Direito - Formulário ou Verificação */}
            <div className="p-8">
              {registerStep === "form" ? (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      Criar Conta
                    </DialogTitle>
                    <p className="text-sm text-gray-600 mt-3">
                      Para criar uma assinatura, você precisa de uma conta. Isso é necessário para que você possa gerenciar ou cancelar sua assinatura depois.
                    </p>
                  </DialogHeader>
                  <div className="space-y-4 py-6">
                    <div>
                      <Label htmlFor="reg-email" className="text-sm font-semibold">Email</Label>
                      <Input 
                        id="reg-email" 
                        type="email" 
                        value={authEmail} 
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="mt-1.5 h-10"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-password" className="text-sm font-semibold">Senha</Label>
                      <div className="relative">
                        <Input 
                          id="reg-password" 
                          type={showPassword ? "text" : "password"}
                          value={authPassword} 
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="••••••••"
                          className="mt-1.5 h-10 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-1.5 h-10 px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
                    </div>
                    <div>
                      <Label htmlFor="reg-password-confirm" className="text-sm font-semibold">Confirmar Senha</Label>
                      <div className="relative">
                        <Input 
                          id="reg-password-confirm" 
                          type={showPasswordConfirm ? "text" : "password"}
                          value={authPasswordConfirm} 
                          onChange={(e) => setAuthPasswordConfirm(e.target.value)}
                          placeholder="••••••••"
                          className="mt-1.5 h-10 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-1.5 h-10 px-3 hover:bg-transparent"
                          onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        >
                          {showPasswordConfirm ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="text-center pt-2">
                      <button 
                        type="button"
                        onClick={() => {
                          closeRegisterModal();
                          openLoginModal();
                        }}
                        className="text-sm text-gray-600 hover:text-purple-600 font-medium"
                      >
                        Já tem uma conta? <span className="text-purple-600 font-semibold">Entrar</span>
                      </button>
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline" 
                      onClick={closeRegisterModal} 
                      className="w-full sm:w-auto h-12 text-base"
                      disabled={isRegistering}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={async () => {
                        if (!authEmail || !authPassword || !authPasswordConfirm) {
                          toast({ title: "Campos obrigatórios", description: "Preencha todos os campos.", variant: "destructive" });
                          return;
                        }
                        if (authPassword !== authPasswordConfirm) {
                          toast({ title: "Senhas não conferem", description: "As senhas devem ser iguais.", variant: "destructive" });
                          return;
                        }
                        if (authPassword.length < 8) {
                          toast({ title: "Senha muito curta", description: "A senha deve ter no mínimo 8 caracteres.", variant: "destructive" });
                          return;
                        }

                        setIsRegistering(true);
                        try {
                          const response = await registerUser({
                            email: authEmail,
                            password: authPassword,
                            name: authEmail.split('@')[0], // Nome temporário baseado no email
                            phone: "", // Telefone vazio
                            userType: "donor"
                          });

                          if (response.success && response.data) {
                            login(response.data.user, response.data.accessToken);
                            closeRegisterModal();
                            setAuthEmail("");
                            setAuthPassword("");
                            setAuthPasswordConfirm("");
                            toast({ title: "Conta criada!", description: `Bem-vindo, ${response.data.user.name}!` });
                          } else {
                            throw new Error(response.message || "Erro ao criar conta");
                          }
                        } catch (error: any) {
                          toast({ 
                            title: "Erro ao criar conta", 
                            description: error.message || "Tente novamente mais tarde.", 
                            variant: "destructive" 
                          });
                        } finally {
                          setIsRegistering(false);
                        }
                      }} 
                      disabled={isRegistering}
                      className="w-full sm:w-auto h-12 text-base bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    >
                      {isRegistering ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Criando...</>
                      ) : (
                        "Criar Conta"
                      )}
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      Verificar Email
                    </DialogTitle>
                    <p className="text-sm text-gray-600 mt-3">
                      Enviamos um código de verificação para <strong>{authEmail}</strong>
                    </p>
                  </DialogHeader>
                  <div className="space-y-5 py-6">
                    <div>
                      <Label htmlFor="verify-code" className="text-base font-semibold">Código de Verificação</Label>
                      <Input 
                        id="verify-code" 
                        value={verificationCode} 
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="000000"
                        className="mt-2 h-16 text-center text-3xl tracking-widest font-bold"
                        maxLength={6}
                      />
                    </div>
                    <button 
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      onClick={() => {
                        toast({ title: "Código reenviado!", description: `Enviamos um novo código para ${authEmail}` });
                      }}
                    >
                      Reenviar código
                    </button>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setRegisterStep("form")} 
                      className="w-full sm:w-auto h-12 text-base"
                    >
                      Voltar
                    </Button>
                    <Button 
                      onClick={() => {
                        if (!verificationCode || verificationCode.length !== 6) {
                          toast({ title: "Código inválido", description: "Digite o código de 6 dígitos.", variant: "destructive" });
                          return;
                        }
                        // TODO: Verificar código e criar conta
                        closeRegisterModal();
                        setRegisterStep("form");
                        toast({ title: "Conta criada!", description: "Agora você pode criar sua assinatura." });
                      }} 
                      className="w-full sm:w-auto h-12 text-base bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    >
                      Verificar
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Login */}
      <Dialog open={showLoginModal} onOpenChange={(open) => {
        if (open) {
          openLoginModal();
        } else {
          closeLoginModal();
        }
      }}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Lado Esquerdo - Imagem */}
            <div className="hidden md:block bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 p-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-300/20 to-purple-300/20"></div>
              <div className="relative h-full flex flex-col items-center justify-center">
                <img
                  src="/img/For%C3%A7aeEsperan%C3%A7a.png"
                  alt="Força e Esperança"
                  className="w-full max-w-sm object-contain mb-6"
                />
                <div className="text-center">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Gerencie sua Assinatura
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Acesse sua conta para visualizar, alterar ou cancelar sua doação recorrente
                  </p>
                </div>
              </div>
            </div>

            {/* Lado Direito - Formulário */}
            <div className="p-8">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Entrar
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-3">
                  Entre para gerenciar sua assinatura
                </p>
              </DialogHeader>
              <div className="space-y-4 py-6">
                <div>
                  <Label htmlFor="login-email" className="text-sm font-semibold">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    value={authEmail} 
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="mt-1.5 h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password" className="text-sm font-semibold">Senha</Label>
                  <div className="relative">
                    <Input 
                      id="login-password" 
                      type={showPassword ? "text" : "password"}
                      value={authPassword} 
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="mt-1.5 h-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-1.5 h-10 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  <button className="text-xs text-purple-600 hover:text-purple-700 mt-1 font-medium">
                    Esqueci minha senha
                  </button>
                </div>
                <div className="text-center pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      closeLoginModal();
                      openRegisterModal();
                    }}
                    className="text-sm text-gray-600 hover:text-purple-600 font-medium"
                  >
                    Não tem uma conta? <span className="text-purple-600 font-semibold">Criar conta</span>
                  </button>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={closeLoginModal} 
                  className="w-full sm:w-auto h-12 text-base"
                  disabled={isLoggingIn}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={async () => {
                    if (!authEmail || !authPassword) {
                      toast({ title: "Campos obrigatórios", description: "Preencha email e senha.", variant: "destructive" });
                      return;
                    }

                    setIsLoggingIn(true);
                    try {
                      const response = await loginUser({ email: authEmail, password: authPassword });
                      
                      if (response.success && response.data) {
                        login(response.data.user, response.data.accessToken);
                        closeLoginModal();
                        setAuthEmail("");
                        setAuthPassword("");
                        toast({ title: "Login realizado!", description: `Bem-vindo de volta, ${response.data.user.name}!` });
                      } else {
                        throw new Error(response.message || "Erro ao fazer login");
                      }
                    } catch (error: any) {
                      toast({ 
                        title: "Erro no login", 
                        description: error.message || "Verifique suas credenciais e tente novamente.", 
                        variant: "destructive" 
                      });
                    } finally {
                      setIsLoggingIn(false);
                    }
                  }} 
                  disabled={isLoggingIn}
                  className="w-full sm:w-auto h-12 text-base bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  {isLoggingIn ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Entrando...</>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
