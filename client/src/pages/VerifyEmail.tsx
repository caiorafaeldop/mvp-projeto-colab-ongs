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
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { verifyEmailCode, resendVerificationCode } from "@/api/auth";
import { Mail, ArrowLeft } from "lucide-react";

export function VerifyEmail() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
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
    // Se não tiver email, redirecionar para login
    if (!email) {
      toast({
        title: "Erro",
        description: "Email não encontrado. Por favor, faça o registro novamente.",
        variant: "destructive",
      });
      navigate("/login");
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

  const handleVerify = async (e: React.FormEvent) => {
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

    setIsLoading(true);

    try {
      const response = await verifyEmailCode(email, codeString);
      
      toast({
        title: "Sucesso!",
        description: "Email verificado com sucesso! Você já está logado.",
      });

      // Salvar token no localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      // Redirecionar para home (já logado)
      setTimeout(() => {
        navigate("/");
        window.location.reload(); // Recarregar para atualizar estado de autenticação
      }, 1500);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Código inválido ou expirado",
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
        description: error instanceof Error ? error.message : "Erro ao reenviar código",
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
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold">
              Verifique seu Email
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-2">
              Enviamos um código de 6 dígitos para
              <br />
              <strong className="text-foreground">{email}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-6">
            <form onSubmit={handleVerify} className="space-y-6">
              {/* Inputs do código */}
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

              {/* Botão de verificar */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 h-11 text-base"
                disabled={isLoading || code.join("").length !== 6}
              >
                {isLoading ? "Verificando..." : "Verificar Email"}
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
