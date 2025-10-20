import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { resetPassword, resendVerificationCode } from "@/api/auth";
import { Lock, Eye, EyeOff, ArrowLeft, KeyRound } from "lucide-react";

export function ResetPassword() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Pegar email do state da navegação
  const email = location.state?.email || "";

  useEffect(() => {
    // Se não tiver email, redirecionar para forgot-password
    if (!email) {
      toast({
        title: "Erro",
        description: "Email não encontrado. Por favor, solicite a recuperação novamente.",
        variant: "destructive",
      });
      navigate("/forgot-password");
    }
  }, [email, navigate, toast]);

  useEffect(() => {
    // Countdown para reenviar código
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    // Focar no primeiro input ao montar
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Permitir apenas números
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Mover para o próximo input se digitou um número
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace: voltar para o input anterior
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);

    // Focar no último input preenchido ou no próximo vazio
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const codeString = code.join("");
    if (codeString.length !== 6) {
      toast({
        title: "Erro",
        description: "Por favor, digite o código completo de 6 dígitos",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter no mínimo 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email, codeString, newPassword);

      toast({
        title: "Sucesso!",
        description: "Senha redefinida com sucesso!",
      });

      // Redirecionar para login
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Código inválido ou expirado",
        variant: "destructive",
      });
      // Limpar código
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setIsResending(true);

    try {
      await resendVerificationCode(email);

      toast({
        title: "Código reenviado!",
        description: "Verifique seu email para o novo código",
      });

      // Iniciar countdown de 60 segundos
      setCountdown(60);

      // Limpar código atual
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao reenviar código",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 shadow-xl">
          <CardHeader className="text-center px-4 sm:px-6 pt-6 pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold">
              Redefinir Senha
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-2">
              Digite o código enviado para
              <br />
              <strong className="text-foreground">{email}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Inputs do código */}
              <div>
                <Label className="text-sm mb-2 block">Código de verificação</Label>
                <div className="flex justify-center gap-2">
                  {code.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-14 text-center text-2xl font-bold"
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>

              {/* Nova senha */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm sm:text-base">
                  Nova senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 text-sm sm:text-base"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirmar senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm sm:text-base">
                  Confirmar senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite a senha novamente"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-11 text-sm sm:text-base"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Botão de redefinir */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 h-11 text-base"
                disabled={isLoading || code.join("").length !== 6}
              >
                {isLoading ? "Redefinindo..." : "Redefinir senha"}
              </Button>

              {/* Botão de reenviar */}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Não recebeu o código?
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResend}
                  disabled={isResending || countdown > 0}
                  className="text-sm"
                >
                  {isResending
                    ? "Reenviando..."
                    : countdown > 0
                    ? `Reenviar em ${countdown}s`
                    : "Reenviar código"}
                </Button>
              </div>

              {/* Botão voltar */}
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/login")}
                className="w-full"
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para o login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
