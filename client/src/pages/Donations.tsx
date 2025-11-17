import { useEffect, useMemo, useState } from "react";
import { getPublicTopDonors, type TopDonor } from "@/api/topDonors";
import { DonationsSkeleton } from "@/components/skeletons/DonationsSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { Heart, CreditCard, Repeat, Loader2, Copy, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import { createSingleDonation, createRecurringDonation } from "@/api/donations";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { SubscriptionManageModal } from "@/components/SubscriptionManageModal";

function monthYearOf(date: Date) {
  return { month: date.getMonth() + 1, year: date.getFullYear() };
}

// removed unused helper

export function Donations() {
  const PIX_KEY = "00020126360014BR.GOV.BCB.PIX0114222228790001595204000053039865802BR5901N6001C62100506RFCCPB6304DB62";
  const { month, year } = useMemo(() => monthYearOf(new Date()), []);
  const [donors, setDonors] = useState<TopDonor[]>([]);
  const [loading, setLoading] = useState(true);
  // Donation form state (aligned with landing page)
  const [donationType, setDonationType] = useState<"single" | "recurring">("single");
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const donorEmail = "";
  const [donorPhone, setDonorPhone] = useState("");
  const donorDocument = "";
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [copiedPix, setCopiedPix] = useState(false);
  const { toast } = useToast();
  const predefinedAmounts = [10, 25, 50, 100, 200];
  
  // Auth modals
  const [showManageSubscriptionModal, setShowManageSubscriptionModal] = useState(false);
  const [showDonorInfoModal, setShowDonorInfoModal] = useState(false);
  
  const { isAuthenticated, user } = useAuth();
  const { openLoginModal, openRegisterModal } = useAuthModal();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await getPublicTopDonors(year, month, 10);
        if (mounted) setDonors(list);
      } catch (e) {
        console.warn("Falha ao carregar top doadores públicos", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [month, year]);

  const podium = useMemo(() => {
    const sorted = [...donors].sort((a, b) => (a.topPosition ?? 999) - (b.topPosition ?? 999));
    return {
      first: sorted[0],
      second: sorted[1],
      third: sorted[2],
      others: sorted.slice(3),
    };
  }, [donors]);
  // removed unused variable

  if (loading) {
    return <DonationsSkeleton />;
  }

  async function handleCopyPix() {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(PIX_KEY);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = PIX_KEY;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedPix(true);
      toast({ title: "Chave PIX copiada!", description: "Cole no app do seu banco para pagar.", });
      setTimeout(() => setCopiedPix(false), 1800);
    } catch {
      toast({ title: "Falha ao copiar", description: "Copie manualmente a chave abaixo.", variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 py-6 relative z-10 max-w-7xl">
        {/* Header com botão de gerenciar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              ❤️ Faça sua Doação
            </h2>
            <p className="text-sm text-gray-600 mt-1">Apoie a Rede Feminina de Combate ao Câncer</p>
          </div>
          <Button
            onClick={() => {
              if (isAuthenticated) {
                setShowManageSubscriptionModal(true);
              } else {
                openLoginModal();
              }
            }}
            variant="outline"
            className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 font-semibold"
          >
            Gerenciar Assinatura
          </Button>
        </div>

        {/* Layout em Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Formulário */}
          <div className="lg:col-span-2 space-y-4">

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="w-5 h-5 text-pink-500" />
                    Tipo de Doação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={donationType} onValueChange={(v) => setDonationType(v as "single" | "recurring")}>
                    <div className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${donationType === "single" ? "border-pink-400 bg-pink-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                      <RadioGroupItem value="single" id="single" />
                      <label htmlFor="single" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          <span className="font-semibold text-sm">Doação Única</span>
                        </div>
                      </label>
                    </div>
                    <div className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${donationType === "recurring" ? "border-purple-400 bg-purple-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                      <RadioGroupItem value="recurring" id="recurring" />
                      <label htmlFor="recurring" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Repeat className="w-4 h-4" />
                          <span className="font-semibold text-sm">Doação Recorrente</span>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const val = parseFloat(customAmount || amount || "0");
                if (isNaN(val) || val < 1) {
                  toast({ title: "Valor inválido", description: "Mínimo R$ 1,00.", variant: "destructive" });
                  return;
                }
                
                // Se for doação recorrente
                if (donationType === "recurring") {
                  // Se NÃO estiver logado, abre modal de registro
                  if (!isAuthenticated) {
                    openRegisterModal();
                    return;
                  }
                  
                  // Se estiver logado, abre modal para preencher informações (igual doação única)
                  setShowDonorInfoModal(true);
                  return;
                }
                
                // Se for doação única, abre modal para preencher informações
                setShowDonorInfoModal(true);
              }}>
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Valor da Doação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                      {predefinedAmounts.map((v) => {
                        const selected = amount === String(v);
                        return (
                          <Button
                            key={v}
                            type="button"
                            variant="ghost"
                            onClick={() => { setAmount(String(v)); setCustomAmount(""); }}
                            className={`h-12 rounded-lg font-semibold text-sm transition-all ${selected ? "bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-md" : "bg-white hover:bg-pink-50 border-2 border-gray-200 hover:border-pink-300 text-gray-700"}`}
                          >
                            R$ {v}
                          </Button>
                        );
                      })}
                    </div>
                    <div>
                      <label htmlFor="customAmount" className="text-sm font-semibold text-gray-700 mb-2 block">Ou insira outro valor</label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 select-none font-semibold text-lg">R$</span>
                        <Input 
                          id="customAmount" 
                          type="number" 
                          min="1" 
                          step="0.01" 
                          placeholder="0,00" 
                          value={customAmount} 
                          onChange={(e) => { setCustomAmount(e.target.value); setAmount(""); }} 
                          className="pl-12 h-10 text-base rounded-lg border-2 border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200/50 transition-all"
                        />
                      </div>
                    </div>
                    {donationType === "recurring" && (
                      <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
                        <p className="text-xs text-blue-800"><strong>💳 Recorrente:</strong> Cobrança automática mensal.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-base py-3 shadow-lg rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processando...</>
                  ) : (
                    <><Heart className="w-5 h-5 mr-2" />{donationType === "single" ? "Gerar Link de Pagamento" : "Criar Assinatura"}</>  
                  )}
                </Button>
              </form>
          </div>

          {/* Coluna Direita - Top Doadores */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  🏆 Top Doadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {donors.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center">Sem doadores este mês</p>
                ) : (
                  <div className="space-y-3">
                    {[podium.first, podium.second, podium.third].filter(Boolean).map((d, idx) => {
                      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
                      const bgColor = idx === 0 ? 'from-yellow-100 to-amber-100' : idx === 1 ? 'from-gray-100 to-gray-200' : 'from-orange-100 to-amber-100';
                      return d ? (
                        <div key={d.id} className={`p-3 rounded-lg bg-gradient-to-br ${bgColor} border border-gray-200`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{medal}</span>
                            <span className="font-bold text-sm truncate">{d.donorName}</span>
                          </div>
                          <p className="text-xs text-gray-600 font-semibold">R$ {d.donatedAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                        </div>
                      ) : null;
                    })}
                    {podium.others.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Outros doadores</p>
                        {podium.others.slice(0, 5).map((d, idx) => (
                          <div key={d.id || idx} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                            <span className="text-xs font-medium text-gray-700 truncate">{d.donorName}</span>
                            <span className="text-xs text-gray-500 ml-2">R$ {d.donatedAmount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* PIX - QR Code e Chave - Modernizado */}
        <div className="mt-6 lg:mt-8">
          <Card className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 backdrop-blur-sm border-0 shadow-xl overflow-hidden relative">
            {/* Efeito decorativo de fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-200/20 to-purple-200/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            
            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Pagamento Instantâneo via PIX
                    </CardTitle>
                    <p className="text-xs text-gray-600 mt-0.5">Rápido, seguro e sem taxas</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                {/* QR Code Section */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative bg-white p-5 rounded-2xl shadow-2xl border-4 border-purple-100 hover:border-purple-200 transition-all duration-300 hover:scale-105">
                      <QRCode 
                        value={PIX_KEY} 
                        style={{ width: "100%", height: "auto", maxWidth: "220px" }} 
                        level="M"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-lg">📱</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">Escaneie com a câmera do seu banco</p>
                  </div>
                </div>

                {/* Chave PIX Section */}
                <div className="flex flex-col justify-center space-y-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-purple-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Copy className="w-4 h-4 text-white" />
                      </div>
                      <Label htmlFor="pix-key" className="text-sm font-bold text-gray-700">Chave PIX Copia e Cola</Label>
                    </div>
                    
                    <div className="relative">
                      <Input
                        id="pix-key"
                        readOnly
                        value={PIX_KEY}
                        onFocus={(e) => e.currentTarget.select()}
                        className="text-xs font-mono bg-gray-50 border-2 border-gray-200 focus:border-purple-400 pr-3 py-3 h-auto transition-all"
                      />
                    </div>
                    
                    <Button 
                      type="button" 
                      onClick={handleCopyPix}
                      className={`w-full mt-3 h-12 font-semibold text-base transition-all duration-300 ${
                        copiedPix 
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" 
                          : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      } text-white shadow-lg hover:shadow-xl hover:scale-105`}
                    >
                      {copiedPix ? (
                        <>
                          <span className="mr-2">✓</span>
                          Chave Copiada!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5 mr-2" />
                          Copiar Chave PIX
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center">
                        <span className="text-base">💡</span>
                      </div>
                      <div className="text-xs text-gray-700 space-y-1">
                        <p className="font-semibold text-purple-900">Como funciona:</p>
                        <p>1. Escaneie o QR Code ou copie a chave</p>
                        <p>2. Cole no app do seu banco</p>
                        <p>3. Confirme o pagamento</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MODAIS */}
        
        {/* Modal de Informações do Doador (Doação Única) */}
        <Dialog open={showDonorInfoModal} onOpenChange={(open) => {
          if (!open) {
            setPaymentUrl("");
            setDonorName("");
            setDonorPhone("");
            setMessage("");
          }
          setShowDonorInfoModal(open);
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
                      Sua Generosidade Transforma Vidas
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Cada doação faz a diferença na luta contra o câncer
                    </p>
                  </div>
                </div>
              </div>

              {/* Lado Direito - Formulário */}
              <div className="p-8">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Só mais uma coisinha...
                  </DialogTitle>
                  <p className="text-sm text-gray-600 mt-3">
                    {donationType === "recurring" ? "Configure sua doação recorrente" : "Adicione suas informações"}
                  </p>
                </DialogHeader>
                <div className="space-y-4 py-6">
                  <div>
                    <Label htmlFor="donor-name" className="text-sm font-semibold">Nome *</Label>
                    <Input 
                      id="donor-name" 
                      value={donorName} 
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Seu nome"
                      className="mt-1.5 h-10"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="donor-phone" className="text-sm font-semibold">Telefone (opcional)</Label>
                    <Input 
                      id="donor-phone" 
                      value={donorPhone} 
                      onChange={(e) => setDonorPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="mt-1.5 h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="donor-message" className="text-sm font-semibold">Mensagem (opcional)</Label>
                    <Textarea 
                      id="donor-message" 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Deixe uma mensagem..."
                      rows={2}
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <DialogFooter className="flex-col gap-3">
                  {!paymentUrl ? (
                    <div className="flex gap-3 w-full">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowDonorInfoModal(false)}
                        className="flex-1 h-12 text-base"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={async () => {
                          if (!donorName || donorName.trim() === "") {
                            toast({ title: "Nome obrigatório", description: "Informe seu nome para continuar.", variant: "destructive" });
                            return;
                          }
                          
                          setIsSubmitting(true);
                          try {
                            const val = parseFloat(customAmount || amount || "0");
                            
                            // Se for doação recorrente
                            if (donationType === "recurring") {
                              const payload = {
                                amount: val,
                                donorName: donorName.trim() || user?.name || "Doador",
                                donorEmail: user?.email || "",
                                donorPhone: donorPhone || undefined,
                                message: message || undefined,
                                frequency: "monthly" as const,
                              };
                              const response = await createRecurringDonation(payload);
                              
                              const responseData = response?.data;
                              
                              if (responseData?.success) {
                                const url = responseData.data?.subscriptionUrl;
                                if (url) {
                                  setPaymentUrl(url);
                                  toast({ title: "Assinatura criada!", description: "Clique no botão para acessar o pagamento." });
                                } else {
                                  throw new Error("URL de checkout não retornada");
                                }
                              } else {
                                throw new Error(responseData?.message || "Erro ao criar assinatura");
                              }
                            } else {
                              // Doação única
                              const payload = {
                                amount: val,
                                donorName: donorName.trim(),
                                donorEmail: donorEmail || undefined,
                                donorPhone: donorPhone || undefined,
                                donorDocument: donorDocument || undefined,
                                message: message || undefined,
                              };
                              const response = await createSingleDonation(payload);
                              
                              const responseData = response?.data;
                              
                              if (responseData?.success) {
                                const url = responseData.data?.paymentUrl;
                                if (url) {
                                  setPaymentUrl(url);
                                  toast({ title: "Link gerado!", description: "Clique no botão para acessar." });
                                } else {
                                  throw new Error("URL de pagamento não retornada");
                                }
                              } else {
                                throw new Error(responseData?.message || "Erro ao processar doação");
                              }
                            }
                          } catch (err: unknown) {
                            const message = err instanceof Error ? err.message : "Tente novamente.";
                            toast({ title: "Erro ao processar", description: message, variant: "destructive" });
                          } finally {
                            setIsSubmitting(false);
                          }
                        }}
                        disabled={isSubmitting}
                        className="flex-1 h-12 text-base bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                      >
                        {isSubmitting ? (
                          <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Enviando...</>
                        ) : (
                          "Enviar"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        window.open(paymentUrl, "_blank");
                        setShowDonorInfoModal(false);
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-base py-6"
                    >
                      Acessar Link de Pagamento
                    </Button>
                  )}
                </DialogFooter>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
      
      {/* Modal de Gerenciamento de Assinatura */}
      <SubscriptionManageModal 
        open={showManageSubscriptionModal} 
        onClose={() => setShowManageSubscriptionModal(false)} 
      />
    </div>
  );
}

export default Donations;
