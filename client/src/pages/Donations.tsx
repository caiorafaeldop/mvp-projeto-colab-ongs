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
import { Heart, CreditCard, Repeat, Loader2 } from "lucide-react";
import { createSingleDonation, createRecurringDonation } from "@/api/donations";

function monthYearOf(date: Date) {
  return { month: date.getMonth() + 1, year: date.getFullYear() };
}

function initials(name: string) {
  const parts = (name || "").trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Donations() {
  const { month, year } = useMemo(() => monthYearOf(new Date()), []);
  const [donors, setDonors] = useState<TopDonor[]>([]);
  const [loading, setLoading] = useState(true);
  // Donation form state (aligned with landing page)
  const [donationType, setDonationType] = useState<"single" | "recurring">("single");
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorDocument, setDonorDocument] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const { toast } = useToast();
  const predefinedAmounts = [10, 25, 50, 100, 200];
  
  // Auth modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showVerifyEmailModal, setShowVerifyEmailModal] = useState(false);
  const [showManageSubscriptionModal, setShowManageSubscriptionModal] = useState(false);
  const [showDonorInfoModal, setShowDonorInfoModal] = useState(false);
  
  // Auth form states
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [registerStep, setRegisterStep] = useState<"form" | "verify">("form");
  
  // Subscription data (mock)
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [donorInfoStep, setDonorInfoStep] = useState<"form" | "success">("form");

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
  const onlyPodium = podium.others.length === 0 && donors.length > 0;

  if (loading) {
    return <DonationsSkeleton />;
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
            onClick={() => setShowLoginModal(true)}
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

              <form onSubmit={(e) => {
                e.preventDefault();
                const val = parseFloat(customAmount || amount || "0");
                if (isNaN(val) || val < 1) {
                  toast({ title: "Valor inválido", description: "Mínimo R$ 1,00.", variant: "destructive" });
                  return;
                }
                
                // Se for doação recorrente, abre modal de registro
                if (donationType === "recurring") {
                  setShowRegisterModal(true);
                  return;
                }
                
                // Se for doação única, abre modal para preencher informações
                setShowDonorInfoModal(true);
                setDonorInfoStep("form");
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
                    Adicione suas informações
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
                          } catch (err: any) {
                            toast({ title: "Erro ao processar doação", description: err?.message || "Tente novamente.", variant: "destructive" });
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
        
        {/* Modal de Registro (para doação recorrente) */}
        <Dialog open={showRegisterModal} onOpenChange={(open) => {
          setShowRegisterModal(open);
          if (!open) setRegisterStep("form");
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
                        <Input 
                          id="reg-password" 
                          type="password" 
                          value={authPassword} 
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="••••••••"
                          className="mt-1.5 h-10"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
                      </div>
                      <div>
                        <Label htmlFor="reg-password-confirm" className="text-sm font-semibold">Confirmar Senha</Label>
                        <Input 
                          id="reg-password-confirm" 
                          type="password" 
                          value={authPasswordConfirm} 
                          onChange={(e) => setAuthPasswordConfirm(e.target.value)}
                          placeholder="••••••••"
                          className="mt-1.5 h-10"
                          required
                        />
                      </div>
                      <div className="text-center pt-2">
                        <button 
                          type="button"
                          onClick={() => {
                            setShowRegisterModal(false);
                            setShowLoginModal(true);
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
                        onClick={() => setShowRegisterModal(false)} 
                        className="w-full sm:w-auto h-12 text-base"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={() => {
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
                          // TODO: Enviar email de verificação
                          setRegisterStep("verify");
                          toast({ title: "Código enviado!", description: `Enviamos um código para ${authEmail}` });
                        }} 
                        className="w-full sm:w-auto h-12 text-base bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                      >
                        Criar Conta
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
                          setShowRegisterModal(false);
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

        {/* Modal de Verificação de Email - REMOVIDO (agora é parte do registro) */}
        <Dialog open={showVerifyEmailModal} onOpenChange={setShowVerifyEmailModal} style={{display: 'none'}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Verificar Email</DialogTitle>
              <p className="text-sm text-gray-600 mt-2">
                Enviamos um código de verificação para <strong>{authEmail}</strong>
              </p>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="verify-code">Código de Verificação</Label>
                <Input 
                  id="verify-code" 
                  value={verificationCode} 
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  className="mt-1 text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowVerifyEmailModal(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  // TODO: Implementar verificação
                  setShowVerifyEmailModal(false);
                  toast({ title: "Email verificado!", description: "Agora você pode criar sua assinatura." });
                }} 
                className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600"
              >
                Verificar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Login */}
        <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
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
                    <Input 
                      id="login-password" 
                      type="password" 
                      value={authPassword} 
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1.5 h-10"
                    />
                    <button className="text-xs text-purple-600 hover:text-purple-700 mt-1 font-medium">
                      Esqueci minha senha
                    </button>
                  </div>
                  <div className="text-center pt-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowLoginModal(false);
                        setShowRegisterModal(true);
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
                    onClick={() => setShowLoginModal(false)} 
                    className="w-full sm:w-auto h-12 text-base"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => {
                      // TODO: Implementar login
                      setShowLoginModal(false);
                      setUserSubscription({ amount: 50, status: "active", nextBilling: "15/11/2025" });
                      setShowManageSubscriptionModal(true);
                    }} 
                    className="w-full sm:w-auto h-12 text-base bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  >
                    Entrar
                  </Button>
                </DialogFooter>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Gerenciar Assinatura */}
        <Dialog open={showManageSubscriptionModal} onOpenChange={setShowManageSubscriptionModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Gerenciar Assinatura</DialogTitle>
            </DialogHeader>
            {userSubscription ? (
              <div className="space-y-6 py-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-600">Status</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      {userSubscription.status === "active" ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className="text-sm font-semibold text-gray-600">Valor Mensal</span>
                    <p className="text-3xl font-bold text-purple-700">R$ {userSubscription.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Próxima Cobrança</span>
                    <p className="text-lg font-semibold text-gray-800">{userSubscription.nextBilling}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-purple-500 text-purple-600 hover:bg-purple-50"
                    onClick={() => {
                      // TODO: Implementar alteração
                      toast({ title: "Em breve", description: "Funcionalidade em desenvolvimento." });
                    }}
                  >
                    Alterar Valor da Assinatura
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      // TODO: Implementar cancelamento
                      if (confirm("Tem certeza que deseja cancelar sua assinatura?")) {
                        setUserSubscription(null);
                        setShowManageSubscriptionModal(false);
                        toast({ title: "Assinatura cancelada", description: "Sua assinatura foi cancelada com sucesso." });
                      }
                    }}
                  >
                    Cancelar Assinatura
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-600">Você não possui assinatura ativa.</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowManageSubscriptionModal(false)} className="w-full">
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}