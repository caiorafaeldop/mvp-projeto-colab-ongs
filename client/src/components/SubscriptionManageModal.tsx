import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getMySubscription, 
  cancelMySubscription 
} from "@/api/donations";
import { 
  ExternalLink,
  Loader2, 
  AlertCircle,
  X,
  DollarSign,
  Calendar
} from "lucide-react";

interface SubscriptionManageModalProps {
  open: boolean;
  onClose: () => void;
}

export function SubscriptionManageModal({ open, onClose }: SubscriptionManageModalProps) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  // Estados
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Carregar assinatura ao abrir o modal
  useEffect(() => {
    if (open && isAuthenticated) {
      loadSubscription();
    }
  }, [open, isAuthenticated]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const response = await getMySubscription();
      if (response?.data?.success && response.data.data) {
        setSubscription(response.data.data);
      } else {
        setSubscription(null);
      }
    } catch (error: any) {
      console.error("Erro ao carregar assinatura:", error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManageExternal = () => {
    // Link para gerenciar assinatura no Mercado Pago
    if (subscription?.subscriptionUrl) {
      window.open(subscription.subscriptionUrl, '_blank');
    } else {
      // Fallback: página de assinaturas do MP
      window.open('https://www.mercadopago.com.br/subscriptions', '_blank');
    }
  };

  const handleCancel = async () => {
    if (!subscription?.subscriptionId) return;
    
    if (!confirm("Tem certeza que deseja cancelar sua assinatura? Esta ação não pode ser desfeita.")) {
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await cancelMySubscription(subscription.subscriptionId);
      if (response?.data?.success) {
        toast({
          title: "Assinatura cancelada",
          description: "Sua assinatura foi cancelada com sucesso.",
        });
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cancelar assinatura",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      authorized: { label: "Ativa", variant: "default" },
      approved: { label: "Ativa", variant: "default" },
      paused: { label: "Pausada", variant: "secondary" },
      cancelled: { label: "Cancelada", variant: "destructive" },
      pending: { label: "Pendente", variant: "outline" },
    };
    const config = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getFrequencyLabel = (frequency: string) => {
    const frequencyMap: Record<string, string> = {
      monthly: "Mensal",
      weekly: "Semanal",
      yearly: "Anual",
    };
    return frequencyMap[frequency] || frequency;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
                  Gerencie sua Contribuição
                </h3>
                <p className="text-gray-700 text-sm">
                  Controle total sobre sua doação recorrente
                </p>
              </div>
            </div>
          </div>

          {/* Lado Direito - Conteúdo */}
          <div className="p-8">
            {!isAuthenticated ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Login Necessário
                  </DialogTitle>
                </DialogHeader>
                <div className="py-8 text-center">
                  <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-6">
                    Você precisa estar logado para gerenciar sua assinatura.
                  </p>
                  <Button
                    onClick={onClose}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  >
                    Fechar
                  </Button>
                </div>
              </>
            ) : loading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-purple-600 mb-4" />
                <p className="text-gray-600">Carregando informações da assinatura...</p>
              </div>
            ) : !subscription ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Sem Assinatura Ativa
                  </DialogTitle>
                </DialogHeader>
                <div className="py-8 text-center">
                  <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-6">
                    Você ainda não possui uma assinatura ativa.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Crie uma doação recorrente para ajudar mensalmente!
                  </p>
                  <Button
                    onClick={onClose}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  >
                    Criar Assinatura
                  </Button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Gerenciar Assinatura
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Status da Assinatura */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Status da Assinatura</CardTitle>
                        {getStatusBadge(subscription.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Valor */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">Valor:</span>
                        </div>
                        <span className="font-bold">{formatCurrency(subscription.amount || 0)}</span>
                      </div>

                      {/* Frequência */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">Frequência:</span>
                        </div>
                        <span className="font-bold">{getFrequencyLabel(subscription.frequency)}</span>
                      </div>

                      {/* ID da Assinatura */}
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500">
                          ID: {subscription.subscriptionId}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ações */}
                  <div className="space-y-2">
                    {subscription.status !== "cancelled" && (
                      <>
                        <Button
                          onClick={handleManageExternal}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Gerenciar no Mercado Pago
                        </Button>

                        <p className="text-xs text-gray-500 text-center px-4">
                          Para pausar, alterar valor ou atualizar cartão, use o painel do Mercado Pago
                        </p>

                        <Button
                          onClick={handleCancel}
                          disabled={actionLoading}
                          className="w-full"
                          variant="destructive"
                        >
                          {actionLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <X className="w-4 h-4 mr-2" />
                          )}
                          Cancelar Assinatura
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full"
                    disabled={actionLoading}
                  >
                    Fechar
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
