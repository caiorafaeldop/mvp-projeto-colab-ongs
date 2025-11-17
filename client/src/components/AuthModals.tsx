import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  loginUser,
  registerUser,
  verifyEmailCode,
  sendVerificationCode,
} from "@/api/auth";
import { Loader2, Eye, EyeOff } from "lucide-react";

export function AuthModals() {
  const {
    showLoginModal,
    showRegisterModal,
    openLoginModal,
    openRegisterModal,
    closeLoginModal,
    closeRegisterModal,
  } = useAuthModal();
  const { toast } = useToast();
  const { login } = useAuth();

  // Auth form states
  const [authFirstName, setAuthFirstName] = useState("");
  const [authLastName, setAuthLastName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [registerStep, setRegisterStep] = useState<"form" | "verify">("form");
  const [loginStep, setLoginStep] = useState<"form" | "verify">("form");
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [pendingVerificationName, setPendingVerificationName] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  return (
    <>
      {/* Modal de Registro */}
      <Dialog
        open={showRegisterModal}
        onOpenChange={(open) => {
          if (open) {
            openRegisterModal();
          } else {
            closeRegisterModal();
            setRegisterStep("form");
          }
        }}
      >
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
                    {registerStep === "form"
                      ? "Apoie Mensalmente"
                      : "Verifique seu Email"}
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
                      Para criar uma assinatura, você precisa de uma conta. Isso
                      é necessário para que você possa gerenciar ou cancelar sua
                      assinatura depois.
                    </p>
                  </DialogHeader>
                  <div className="space-y-3 py-4">
                    {/* Nome e Sobrenome lado a lado */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label
                          htmlFor="reg-firstname"
                          className="text-xs font-semibold"
                        >
                          Nome
                        </Label>
                        <Input
                          id="reg-firstname"
                          type="text"
                          value={authFirstName}
                          onChange={(e) => setAuthFirstName(e.target.value)}
                          placeholder="Nome"
                          className="mt-1 h-9"
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="reg-lastname"
                          className="text-xs font-semibold"
                        >
                          Sobrenome
                        </Label>
                        <Input
                          id="reg-lastname"
                          type="text"
                          value={authLastName}
                          onChange={(e) => setAuthLastName(e.target.value)}
                          placeholder="Sobrenome"
                          className="mt-1 h-9"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="reg-email"
                        className="text-xs font-semibold"
                      >
                        Email
                      </Label>
                      <Input
                        id="reg-email"
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="mt-1 h-9"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="reg-password"
                        className="text-xs font-semibold"
                      >
                        Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="••••••••"
                          className="mt-1 h-9 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-1 h-9 px-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-3.5 w-3.5 text-gray-500" />
                          ) : (
                            <Eye className="h-3.5 w-3.5 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Mínimo 8 caracteres
                      </p>
                    </div>
                    <div>
                      <Label
                        htmlFor="reg-password-confirm"
                        className="text-xs font-semibold"
                      >
                        Confirmar Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="reg-password-confirm"
                          type={showPasswordConfirm ? "text" : "password"}
                          value={authPasswordConfirm}
                          onChange={(e) =>
                            setAuthPasswordConfirm(e.target.value)
                          }
                          placeholder="••••••••"
                          className="mt-1 h-9 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-1 h-9 px-2 hover:bg-transparent"
                          onClick={() =>
                            setShowPasswordConfirm(!showPasswordConfirm)
                          }
                        >
                          {showPasswordConfirm ? (
                            <EyeOff className="h-3.5 w-3.5 text-gray-500" />
                          ) : (
                            <Eye className="h-3.5 w-3.5 text-gray-500" />
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
                        Já tem uma conta?{" "}
                        <span className="text-purple-600 font-semibold">
                          Entrar
                        </span>
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
                        if (
                          !authFirstName ||
                          !authLastName ||
                          !authEmail ||
                          !authPassword ||
                          !authPasswordConfirm
                        ) {
                          toast({
                            title: "Campos obrigatórios",
                            description: "Preencha todos os campos.",
                            variant: "destructive",
                          });
                          return;
                        }
                        if (authPassword !== authPasswordConfirm) {
                          toast({
                            title: "Senhas não conferem",
                            description: "As senhas devem ser iguais.",
                            variant: "destructive",
                          });
                          return;
                        }
                        if (authPassword.length < 8) {
                          toast({
                            title: "Senha muito curta",
                            description:
                              "A senha deve ter no mínimo 8 caracteres.",
                            variant: "destructive",
                          });
                          return;
                        }

                        setIsRegistering(true);
                        try {
                          const fullName = `${authFirstName.trim()} ${authLastName.trim()}`;
                          const response = await registerUser({
                            name: fullName,
                            email: authEmail,
                            password: authPassword,
                            phone: "",
                            userType: "common",
                          });

                          if (response.success) {
                            // Login automático após registro
                            const { accessToken, refreshToken, user } =
                              response.data;

                            // Salvar tokens e fazer login
                            await login({
                              user,
                              accessToken,
                              refreshToken,
                            });

                            // Limpar formulário
                            setAuthEmail("");
                            setAuthPassword("");
                            setAuthPasswordConfirm("");
                            setAuthFirstName("");
                            setAuthLastName("");

                            // Fechar modal
                            closeRegisterModal();

                            toast({
                              title: "✅ Conta criada com sucesso!",
                              description: `Bem-vindo(a), ${user.name}!`,
                            });
                          } else {
                            throw new Error(
                              response.message || "Erro ao criar conta"
                            );
                          }
                        } catch (error: any) {
                          toast({
                            title: "Erro ao criar conta",
                            description:
                              error.message || "Tente novamente mais tarde.",
                            variant: "destructive",
                          });
                        } finally {
                          setIsRegistering(false);
                        }
                      }}
                      disabled={isRegistering}
                      className="w-full sm:w-auto h-12 text-base bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Criando...
                        </>
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
                      Enviamos um código de verificação para{" "}
                      <strong>{authEmail}</strong>
                    </p>
                  </DialogHeader>
                  <div className="space-y-5 py-6">
                    <div>
                      <Label
                        htmlFor="verify-code"
                        className="text-base font-semibold"
                      >
                        Código de Verificação
                      </Label>
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
                      onClick={async () => {
                        try {
                          await sendVerificationCode(authEmail);
                          toast({
                            title: "Código reenviado!",
                            description: `Enviamos um novo código para ${authEmail}`,
                          });
                        } catch (error: any) {
                          toast({
                            title: "Erro ao reenviar",
                            description: error.message,
                            variant: "destructive",
                          });
                        }
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
                      onClick={async () => {
                        if (
                          !verificationCode ||
                          verificationCode.length !== 6
                        ) {
                          toast({
                            title: "Código inválido",
                            description: "Digite o código de 6 dígitos.",
                            variant: "destructive",
                          });
                          return;
                        }

                        setIsVerifying(true);
                        try {
                          // VERIFICAR CÓDIGO NO BACKEND usando função centralizada
                          const data = await verifyEmailCode(
                            authEmail,
                            verificationCode
                          );

                          if (!data.success) {
                            throw new Error(
                              data.message || "Código inválido ou expirado"
                            );
                          }

                          // SUCESSO - Conta criada e verificada
                          closeRegisterModal();
                          setRegisterStep("form");
                          setVerificationCode("");
                          setAuthEmail("");
                          setAuthPassword("");
                          setAuthPasswordConfirm("");
                          setAuthFirstName("");
                          setAuthLastName("");

                          toast({
                            title: "✅ Conta criada com sucesso!",
                            description: "Faça login agora para entrar.",
                          });

                          // Abrir modal de login
                          setTimeout(() => {
                            openLoginModal();
                          }, 500);
                        } catch (error: any) {
                          toast({
                            title: "❌ Código incorreto",
                            description:
                              error.message ||
                              "Verifique o código e tente novamente.",
                            variant: "destructive",
                          });
                        } finally {
                          setIsVerifying(false);
                        }
                      }}
                      disabled={isVerifying}
                      className="w-full sm:w-auto h-12 text-base bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        "Verificar"
                      )}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Login */}
      <Dialog
        open={showLoginModal}
        onOpenChange={(open) => {
          if (open) {
            openLoginModal();
          } else {
            closeLoginModal();
            setLoginStep("form");
            setVerificationCode("");
          }
        }}
      >
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
                    Acesse sua conta para visualizar, alterar ou cancelar sua
                    doação recorrente
                  </p>
                </div>
              </div>
            </div>

            {/* Lado Direito - Formulário */}
            <div className="p-8">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {loginStep === "verify" ? "Verificar Email" : "Entrar"}
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-3">
                  {loginStep === "verify"
                    ? "Digite o código de 6 dígitos enviado para seu email"
                    : "Ao entrar na sua conta, é possível gerenciar sua assinatura"}
                </p>
              </DialogHeader>
              <div className="space-y-4 py-6">
                {loginStep === "verify" ? (
                  // Tela de Verificação
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-800">
                        📧 Código enviado para{" "}
                        <strong>{pendingVerificationEmail}</strong>
                      </p>
                    </div>
                    <div>
                      <Label
                        htmlFor="verify-code"
                        className="text-xs font-semibold"
                      >
                        Código de Verificação
                      </Label>
                      <Input
                        id="verify-code"
                        type="text"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) =>
                          setVerificationCode(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="000000"
                        className="mt-1 h-9 text-center text-2xl tracking-widest font-bold"
                      />
                    </div>
                  </>
                ) : (
                  // Tela de Login Normal
                  <>
                    <div>
                      <Label
                        htmlFor="login-email"
                        className="text-xs font-semibold"
                      >
                        Email ou Usuário
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder=""
                        className="mt-1 h-9"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="login-password"
                        className="text-xs font-semibold"
                      >
                        Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="mt-1 h-9 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-1 h-9 px-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-3.5 w-3.5 text-gray-500" />
                          ) : (
                            <Eye className="h-3.5 w-3.5 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      <button className="text-xs text-purple-600 hover:text-purple-700 mt-0.5 font-medium">
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
                        Não tem uma conta?{" "}
                        <span className="text-purple-600 font-semibold">
                          Criar conta
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-3">
                {loginStep === "verify" ? (
                  // Botões da tela de verificação
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setLoginStep("form")}
                      className="w-full sm:w-auto h-12 text-base"
                      disabled={isVerifying}
                    >
                      Voltar
                    </Button>
                    <Button
                      onClick={async () => {
                        if (verificationCode.length !== 6) {
                          toast({
                            title: "Código inválido",
                            description: "Digite os 6 dígitos do código.",
                            variant: "destructive",
                          });
                          return;
                        }

                        setIsVerifying(true);
                        try {
                          // Usar função centralizada
                          const data = await verifyEmailCode(
                            pendingVerificationEmail,
                            verificationCode
                          );

                          if (data.success) {
                            toast({
                              title: "✅ Conta verificada com sucesso!",
                              description: "Faça login agora para entrar.",
                            });
                            setVerificationCode("");
                            setLoginStep("form");
                            // Abrir modal de login automaticamente
                            setTimeout(() => {
                              openLoginModal();
                            }, 500);
                          } else {
                            throw new Error(data.message || "Código inválido");
                          }
                        } catch (error: any) {
                          toast({
                            title: "Erro na verificação",
                            description:
                              error.message || "Código inválido ou expirado.",
                            variant: "destructive",
                          });
                        } finally {
                          setIsVerifying(false);
                        }
                      }}
                      disabled={isVerifying}
                      className="w-full sm:w-auto h-12 text-base bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        "Verificar"
                      )}
                    </Button>
                  </>
                ) : (
                  // Botões da tela de login normal
                  <>
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
                          toast({
                            title: "Campos obrigatórios",
                            description: "Preencha email e senha.",
                            variant: "destructive",
                          });
                          return;
                        }

                        setIsLoggingIn(true);
                        try {
                          const response = await loginUser({
                            email: authEmail,
                            password: authPassword,
                          });

                          // Se email não verificado, mostrar tela de verificação
                          if (response.emailNotVerified) {
                            setPendingVerificationEmail(
                              response.data?.email || authEmail
                            );
                            setPendingVerificationName(
                              response.data?.name || ""
                            );
                            setLoginStep("verify");

                            // Reenviar código automaticamente
                            try {
                              await sendVerificationCode(authEmail);
                              toast({
                                title: "📧 Verifique seu email",
                                description:
                                  "Enviamos um código de verificação. Confira sua caixa de entrada.",
                              });
                            } catch (e) {
                              toast({
                                title: "📧 Verificação necessária",
                                description:
                                  "Insira o código de verificação enviado para seu email.",
                              });
                            }
                            return;
                          }

                          if (response.success && response.data) {
                            login(
                              response.data.user,
                              response.data.accessToken
                            );
                            closeLoginModal();
                            setAuthEmail("");
                            setAuthPassword("");
                            toast({
                              title: "Login realizado!",
                              description: `Bem-vindo de volta, ${response.data.user.name}!`,
                            });
                          } else {
                            throw new Error(
                              response.message || "Erro ao fazer login"
                            );
                          }
                        } catch (error: any) {
                          toast({
                            title: "Erro no login",
                            description:
                              error.message ||
                              "Verifique suas credenciais e tente novamente.",
                            variant: "destructive",
                          });
                        } finally {
                          setIsLoggingIn(false);
                        }
                      }}
                      disabled={isLoggingIn}
                      className="w-full sm:w-auto h-12 text-base bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
