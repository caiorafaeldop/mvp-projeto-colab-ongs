import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { isStaticMode, STATIC_UNAVAILABLE_MESSAGE } from "@/lib/dataMode";

type RequireBackendProps = {
  children: React.ReactNode;
  /** Mensagem opcional sobrepondo o texto padrão de indisponibilidade. */
  message?: string;
  /** Caminho de redirecionamento (default: "/"). */
  redirectTo?: string;
};

/**
 * Guarda de rota: bloqueia páginas que dependem do backend (login, admin,
 * profile, settings, fluxos de doação, etc.) quando o app está rodando em
 * modo `static`. Mostra toast informativo e redireciona para a home.
 */
export function RequireBackend({
  children,
  message,
  redirectTo = "/",
}: RequireBackendProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const blocked = isStaticMode();

  useEffect(() => {
    if (!blocked) return;
    toast({
      title: "Indisponível no momento",
      description: message ?? STATIC_UNAVAILABLE_MESSAGE,
      variant: "destructive",
    });
    navigate(redirectTo, { replace: true });
  }, [blocked, message, navigate, redirectTo, toast]);

  if (blocked) return null;
  return <>{children}</>;
}
