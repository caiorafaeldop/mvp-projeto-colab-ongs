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

  if (loading) {
    return <DonationsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pt-2">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col gap-8">
          {/* Donation Form + Image */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Donation Form */}
            <div className="lg:w-2/3 w-full">
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-6">Faça sua Doação</h2>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    Tipo de Doação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={donationType} onValueChange={(v) => setDonationType(v as "single" | "recurring")}>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="single" id="single" />
                      <label htmlFor="single" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          <span className="font-semibold">Doação Única</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Faça uma doação pontual via Mercado Pago</p>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="recurring" id="recurring" />
                      <label htmlFor="recurring" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Repeat className="w-4 h-4" />
                          <span className="font-semibold">Doação Recorrente (Assinatura)</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Apoie mensalmente de forma automática</p>
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
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Valor da Doação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {predefinedAmounts.map((v) => (
                        <Button key={v} type="button" variant={amount === String(v) ? "default" : "outline"} onClick={() => { setAmount(String(v)); setCustomAmount(""); }} className="h-16">
                          R$ {v}
                        </Button>
                      ))}
                    </div>
                    <div>
                      <label htmlFor="customAmount" className="text-sm font-medium">Ou insira outro valor</label>
                      <Input id="customAmount" type="number" min="1" step="0.01" placeholder="R$ 0,00" value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setAmount(""); }} />
                    </div>
                    {donationType === "recurring" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-700"><strong>Doação Recorrente Mensal:</strong> Você será cobrado automaticamente todo mês no valor selecionado.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Seus Dados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="donorName" className="text-sm font-medium">Nome (opcional)</label>
                        <Input id="donorName" value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Seu nome" />
                      </div>
                      <div>
                        <label htmlFor="donorEmail" className="text-sm font-medium">Email *</label>
                        <Input id="donorEmail" type="email" required value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} placeholder="seu@email.com" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="donorPhone" className="text-sm font-medium">Telefone (opcional)</label>
                        <Input id="donorPhone" value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} placeholder="(11) 99999-9999" />
                      </div>
                      <div>
                        <label htmlFor="donorDocument" className="text-sm font-medium">CPF (opcional)</label>
                        <Input id="donorDocument" value={donorDocument} onChange={(e) => setDonorDocument(e.target.value)} placeholder="000.000.000-00" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="message" className="text-sm font-medium">Mensagem (opcional)</label>
                      <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Deixe uma mensagem de apoio..." rows={3} />
                    </div>
                  </CardContent>
                </Card>

                {!paymentUrl ? (
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-lg py-6">
                    {isSubmitting ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processando...</>) : (<><Heart className="w-5 h-5 mr-2" />{donationType === "single" ? "Gerar Link de Pagamento" : "Criar Assinatura"}</>)}
                  </Button>
                ) : (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div className="text-green-600">
                          <Heart className="w-12 h-12 mx-auto mb-2" />
                          <h3 className="text-xl font-bold">Link de Pagamento Gerado!</h3>
                          <p className="text-sm mt-2">Clique no botão abaixo para finalizar sua doação no Mercado Pago</p>
                        </div>
                        <Button type="button" onClick={() => window.open(paymentUrl, "_blank")} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-6">
                          <ExternalLink className="w-5 h-5 mr-2" />Abrir Mercado Pago
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </form>
            </div>

            {/* Desktop Image - Shows only on desktop */}
            <div className="hidden lg:block lg:w-1/3">
              <div className="w-full">
                <img
                  src="/img/For%C3%A7aeEsperan%C3%A7a.png"
                  alt="Força e Esperança"
                  className="w-full h-auto object-contain max-w-lg mx-auto"
                />
              </div>
            </div>
          </div>

          {/* Donors Section - Full Width */}
          <div className="w-full">
            <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-100">
              <h4 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-6 text-center">Principais Doadores</h4>
              <p className="text-sm text-gray-600 mb-8 text-center">Agradecemos aos doadores que ajudaram a transformar vidas.</p>

              {donors.length === 0 ? (
                <div className="text-center text-gray-500">Sem registros para {month.toString().padStart(2, "0")}/{year}.</div>
              ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Top Donors Podium */}
                  <div className="lg:w-1/2 w-full">
                    <div className="flex justify-center items-end space-x-4 mb-8">
                      {/* 2º lugar - Prata */}
                      {podium.second && (
                        <div className="flex flex-col items-center">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-gray-300 mb-2">
                              {initials(podium.second.donorName)}
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">🥈</div>
                          </div>
                          <div className="bg-gradient-to-t from-gray-200 to-gray-100 rounded-t-lg px-4 py-6 w-24 text-center shadow-md">
                            <p className="font-bold text-gray-800 text-sm">2º</p>
                          </div>
                          <div className="text-center mt-2">
                            <p className="font-semibold text-gray-900">{podium.second.donorName}</p>
                            <p className="text-xs text-gray-600">R$ {podium.second.donatedAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      )}

                      {/* 1º lugar - Ouro */}
                      {podium.first && (
                        <div className="flex flex-col items-center">
                          <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl border-4 border-yellow-400 mb-2">
                              {initials(podium.first.donorName)}
                            </div>
                            <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">🥇</div>
                          </div>
                          <div className="bg-gradient-to-t from-yellow-300 to-yellow-200 rounded-t-lg px-6 py-8 w-28 text-center shadow-lg">
                            <p className="font-bold text-yellow-800 text-lg">1º</p>
                          </div>
                          <div className="text-center mt-2">
                            <p className="font-semibold text-gray-900">{podium.first.donorName}</p>
                            <p className="text-xs text-gray-600">R$ {podium.first.donatedAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      )}

                      {/* 3º lugar - Bronze */}
                      {podium.third && (
                        <div className="flex flex-col items-center">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-orange-400 mb-2">
                              {initials(podium.third.donorName)}
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">🥉</div>
                          </div>
                          <div className="bg-gradient-to-t from-orange-200 to-orange-100 rounded-t-lg px-4 py-4 w-24 text-center shadow-md">
                            <p className="font-bold text-orange-800 text-sm">3º</p>
                          </div>
                          <div className="text-center mt-2">
                            <p className="font-semibold text-gray-900">{podium.third.donorName}</p>
                            <p className="text-xs text-gray-600">R$ {podium.third.donatedAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Other Donors */}
                  <div className="lg:w-1/2 w-full">
                    <h5 className="text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4 text-center">Agradecemos a todos os doadores que apoiam nossa causa</h5>
                    <ul className="space-y-3">
                      {podium.others.map((d, idx) => (
                        <li key={d.id || `${d.donorName}-${idx}`} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-pink-300 flex items-center justify-center mr-3 text-white font-bold">
                              {initials(d.donorName)}
                            </div>
                            <div>
                              <p className="font-semibold">{d.donorName}</p>
                              <p className="text-sm text-gray-600">R$ {d.donatedAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-pink-700">{(d.topPosition ?? idx + 4)}º</p>
                            <p className="text-xs text-gray-500">Posição</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}