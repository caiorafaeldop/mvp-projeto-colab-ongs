import { useEffect, useMemo, useState } from "react";
import { getPublicTopDonors, type TopDonor } from "@/api/topDonors";
import { DonationsSkeleton } from "@/components/skeletons/DonationsSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/useToast";
import { Heart, CreditCard, Repeat, ExternalLink, Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 pt-2 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 py-2 relative z-10">
        <div className="flex flex-col gap-8">
          {/* Donation Form + Image */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Donation Form */}
            <div className="lg:w-2/3 w-full">
              <h2 className="text-3xl lg:text-5xl font-extrabold leading-tight lg:leading-[1.15] pb-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent mb-8 animate-fade-in">
                Faça sua Doação
              </h2>

              <Card className="mb-6 bg-white/80 backdrop-blur-xl border-0 shadow-2xl hover:shadow-pink-200/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Heart className="w-6 h-6 text-pink-500 animate-pulse" />
                    Tipo de Doação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={donationType} onValueChange={(v) => setDonationType(v as "single" | "recurring")}>
                    <div className={`flex items-center space-x-2 p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${donationType === "single" ? "border-pink-400 bg-gradient-to-br from-pink-50 to-pink-100/50 shadow-lg shadow-pink-200/50" : "border-gray-200 bg-white hover:bg-gray-50 hover:border-pink-300"}`}>
                      <RadioGroupItem value="single" id="single" />
                      <label htmlFor="single" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          <span className="font-bold text-lg">Doação Única</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Faça uma doação pontual via Mercado Pago</p>
                      </label>
                    </div>
                    <div className={`flex items-center space-x-2 p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${donationType === "recurring" ? "border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100/50 shadow-lg shadow-purple-200/50" : "border-gray-200 bg-white hover:bg-gray-50 hover:border-purple-300"}`}>
                      <RadioGroupItem value="recurring" id="recurring" />
                      <label htmlFor="recurring" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Repeat className="w-5 h-5" />
                          <span className="font-bold text-lg">Doação Recorrente (Assinatura)</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Apoie mensalmente de forma automática</p>
                      </label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const val = parseFloat(customAmount || amount || "0");
                if (!donorEmail) {
                  toast({ title: "Email obrigatório", description: "Informe seu email para continuar.", variant: "destructive" });
                  return;
                }
                if (isNaN(val) || val < 1) {
                  toast({ title: "Valor inválido", description: "Mínimo R$ 1,00.", variant: "destructive" });
                  return;
                }
                setIsSubmitting(true);
                setPaymentUrl("");
                try {
                  const payload = {
                    amount: val,
                    donorName: donorName || undefined,
                    donorEmail,
                    donorPhone: donorPhone || undefined,
                    donorDocument: donorDocument || undefined,
                    message: message || undefined,
                  };
                  let response: any;
                  if (donationType === "single") response = await createSingleDonation(payload);
                  else response = await createRecurringDonation(payload);
                  if (response?.success) {
                    const url = response.data?.paymentUrl || response.data?.subscriptionUrl;
                    if (url) {
                      setPaymentUrl(url);
                      toast({ title: "Link de pagamento gerado!", description: "Clique no botão abaixo para finalizar sua doação no Mercado Pago." });
                    } else {
                      throw new Error("URL de pagamento não retornada");
                    }
                  } else {
                    throw new Error(response?.message || "Erro ao processar doação");
                  }
                } catch (err: any) {
                  toast({ title: "Erro ao processar doação", description: err?.message || "Tente novamente.", variant: "destructive" });
                } finally {
                  setIsSubmitting(false);
                }
              }}>
                <Card className="mb-6 bg-white/80 backdrop-blur-xl border-0 shadow-2xl hover:shadow-purple-200/50 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl">Valor da Doação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {predefinedAmounts.map((v) => {
                        const selected = amount === String(v);
                        return (
                          <Button
                            key={v}
                            type="button"
                            variant="ghost"
                            onClick={() => { setAmount(String(v)); setCustomAmount(""); }}
                            className={`h-16 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${selected ? "bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white shadow-xl shadow-purple-300/60 scale-105" : "bg-gradient-to-br from-white to-gray-50 hover:from-pink-50 hover:to-purple-50 border-2 border-gray-200 hover:border-pink-300 text-gray-700"}`}
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
                          className="pl-12 h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-200/50 transition-all duration-300"
                        />
                      </div>
                    </div>
                    {donationType === "recurring" && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300/50 rounded-2xl p-5 shadow-md">
                        <p className="text-sm text-blue-800 leading-relaxed"><strong className="text-blue-900">💳 Doação Recorrente Mensal:</strong> Você será cobrado automaticamente todo mês no valor selecionado.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="mb-6 bg-white/80 backdrop-blur-xl border-0 shadow-2xl hover:shadow-indigo-200/50 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl">Seus Dados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="donorName" className="text-sm font-semibold text-gray-700 mb-2 block">Nome (opcional)</label>
                        <Input id="donorName" value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Seu nome" className="h-12 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-200/50 transition-all" />
                      </div>
                      <div>
                        <label htmlFor="donorEmail" className="text-sm font-semibold text-gray-700 mb-2 block">Email *</label>
                        <Input id="donorEmail" type="email" required value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} placeholder="seu@email.com" className="h-12 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-200/50 transition-all" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="donorPhone" className="text-sm font-semibold text-gray-700 mb-2 block">Telefone (opcional)</label>
                        <Input id="donorPhone" value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} placeholder="(11) 99999-9999" className="h-12 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-200/50 transition-all" />
                      </div>
                      <div>
                        <label htmlFor="donorDocument" className="text-sm font-semibold text-gray-700 mb-2 block">CPF (opcional)</label>
                        <Input id="donorDocument" value={donorDocument} onChange={(e) => setDonorDocument(e.target.value)} placeholder="000.000.000-00" className="h-12 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-200/50 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="message" className="text-sm font-semibold text-gray-700 mb-2 block">Mensagem (opcional)</label>
                      <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Deixe uma mensagem de apoio..." rows={3} className="rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-200/50 transition-all resize-none" />
                    </div>
                  </CardContent>
                </Card>

                {!paymentUrl ? (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-700 text-white font-bold text-xl py-7 shadow-2xl shadow-purple-300/50 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-6 h-6 mr-2 animate-spin" />Processando...</>
                    ) : (
                      <><Heart className="w-6 h-6 mr-2 animate-pulse" />{donationType === "single" ? "Gerar Link de Pagamento" : "Criar Assinatura"}</>
                    )}
                  </Button>
                ) : (
                  <Card className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-0 shadow-2xl shadow-green-200/50 animate-fade-in">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div className="text-green-600">
                          <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                            <Heart className="w-12 h-12 text-green-600 animate-pulse" />
                          </div>
                          <h3 className="text-2xl font-bold text-green-700">Link de Pagamento Gerado!</h3>
                          <p className="text-base mt-2 text-green-600">Clique no botão abaixo para finalizar sua doação no Mercado Pago</p>
                        </div>
                        <Button 
                          type="button" 
                          onClick={() => window.open(paymentUrl, "_blank")} 
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl py-7 shadow-xl shadow-green-300/50 rounded-2xl transition-all duration-300 transform hover:scale-[1.02]"
                        >
                          <ExternalLink className="w-6 h-6 mr-2" />Abrir Mercado Pago
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </form>
            </div>

            {/* Desktop Image - Shows only on desktop */}
            <div className="hidden lg:block lg:w-1/3">
              <div className="w-full sticky top-4">
                <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-4 shadow-2xl border-0">
                  <img
                    src="/img/For%C3%A7aeEsperan%C3%A7a.png"
                    alt="Força e Esperança"
                    className="w-full h-auto object-contain max-w-lg mx-auto rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Donors Section - Full Width */}
          <div className="w-full">
            <div className="p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-0">
              <div className="text-center mb-10">
                <h4 className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent mb-4">
                  🏆 Principais Doadores
                </h4>
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                  Agradecemos aos doadores que ajudaram a transformar vidas com generosidade e solidariedade.
                </p>
              </div>

              {donors.length === 0 ? (
                <div className="text-center text-gray-500">Sem registros para {month.toString().padStart(2, "0")}/{year}.</div>
              ) : (
                <div className={onlyPodium ? "flex flex-col items-center" : "flex flex-col lg:flex-row gap-8"}>
                  {/* Top Donors Podium */}
                  <div className={onlyPodium ? "w-full lg:w-2/3 xl:w-1/2 mx-auto" : "lg:w-1/2 w-full"}>
                    <div className="flex justify-center items-end space-x-6 mb-8">
                      {/* 2º lugar - Prata */}
                      {podium.second && (
                        <div className="flex flex-col items-center transform hover:scale-105 transition-all duration-300">
                          <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-2xl shadow-2xl border-4 border-white mb-2 ring-4 ring-gray-300/40">
                              {initials(podium.second.donorName)}
                            </div>
                            <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg border-2 border-white">🥈</div>
                          </div>
                          <div className="bg-gradient-to-t from-gray-300 to-gray-100 rounded-t-2xl px-6 py-8 w-28 text-center shadow-xl">
                            <p className="font-bold text-gray-800 text-lg">2º</p>
                          </div>
                          <div className="text-center mt-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-md">
                            <p className="font-bold text-gray-900 text-sm">{podium.second.donorName}</p>
                            <p className="text-xs text-gray-600 font-semibold mt-1">R$ {podium.second.donatedAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      )}

                      {/* 1º lugar - Ouro */}
                      {podium.first && (
                        <div className="flex flex-col items-center transform hover:scale-110 transition-all duration-300">
                          <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-3xl shadow-2xl border-4 border-white mb-2 ring-4 ring-yellow-400/60 animate-pulse">
                              {initials(podium.first.donorName)}
                            </div>
                            <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center text-3xl font-bold shadow-xl border-2 border-white">🥇</div>
                          </div>
                          <div className="bg-gradient-to-t from-yellow-400 to-yellow-200 rounded-t-2xl px-8 py-10 w-36 text-center shadow-2xl">
                            <p className="font-extrabold text-yellow-900 text-2xl">1º</p>
                          </div>
                          <div className="text-center mt-4 bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg">
                            <p className="font-bold text-gray-900 text-base">{podium.first.donorName}</p>
                            <p className="text-sm text-gray-600 font-semibold mt-1">R$ {podium.first.donatedAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      )}

                      {/* 3º lugar - Bronze */}
                      {podium.third && (
                        <div className="flex flex-col items-center transform hover:scale-105 transition-all duration-300">
                          <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-2xl shadow-2xl border-4 border-white mb-2 ring-4 ring-orange-400/40">
                              {initials(podium.third.donorName)}
                            </div>
                            <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg border-2 border-white">🥉</div>
                          </div>
                          <div className="bg-gradient-to-t from-orange-300 to-orange-100 rounded-t-2xl px-6 py-6 w-28 text-center shadow-xl">
                            <p className="font-bold text-orange-800 text-lg">3º</p>
                          </div>
                          <div className="text-center mt-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-md">
                            <p className="font-bold text-gray-900 text-sm">{podium.third.donorName}</p>
                            <p className="text-xs text-gray-600 font-semibold mt-1">R$ {podium.third.donatedAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Other Donors */}
                  {!onlyPodium && (
                    <div className="lg:w-1/2 w-full">
                      <div className="mb-6 text-center">
                        <h5 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-2">
                          💝 Outros Doadores
                        </h5>
                        <p className="text-sm text-gray-600">Gratidão a todos que apoiam nossa causa</p>
                      </div>
                      <ul className="space-y-3">
                        {podium.others.map((d, idx) => (
                          <li 
                            key={d.id || `${d.donorName}-${idx}`} 
                            className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-pink-50/80 via-purple-50/60 to-indigo-50/80 border-2 border-pink-200/50 hover:border-purple-300 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                          >
                            <div className="flex items-center">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center mr-4 text-white font-bold text-lg shadow-lg">
                                {initials(d.donorName)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{d.donorName}</p>
                                <p className="text-sm text-gray-600 font-semibold">R$ {d.donatedAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                              </div>
                            </div>
                            <div className="text-right bg-white/80 rounded-xl px-4 py-2 shadow-sm">
                              <p className="font-bold text-purple-700 text-lg">{(d.topPosition ?? idx + 4)}º</p>
                              <p className="text-xs text-gray-500 font-medium">Posição</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}