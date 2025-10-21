import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Quote, HelpCircle, FileText } from "lucide-react";
import { Testimonial, TestimonialApi } from "@/api/testimonial";
import { FAQ, FAQApi } from "@/api/faq";
import { PrestacaoConta, PrestacaoContasApi } from "@/api/prestacaoContas";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export function Sobre() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = !!isAuthenticated && user?.userType === "organization";
  // Galeria com imagens reais (proporção 16:9)
  const images = [
    "/img/img1_sobre.jpg",
    "/img/img2_sobre.jpg",
    "/img/img3_sobre.jpg",
  ];
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  useEffect(() => {
    if (!carouselApi) return;
    const id = setInterval(() => {
      try {
        carouselApi.scrollNext();
      } catch {
        // no-op
      }
    }, 3500);
    return () => clearInterval(id);
  }, [carouselApi]);
  
  // Estados carregados via API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [depoimentos, setDepoimentos] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [prestacaoResumo, setPrestacaoResumo] = useState<PrestacaoConta[]>([]);

  const anoPrestacao = new Date().getFullYear();
  const totalPrestacao = prestacaoResumo.reduce((acc, i) => acc + (i.valor || 0), 0);
  const formatBRL = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [tst, fq, pc] = await Promise.all([
          TestimonialApi.list(true),
          FAQApi.list(true),
          // Endpoint público não filtra por ano; carregamos tudo (ou ajuste para organizationId/startDate)
          PrestacaoContasApi.list(),
        ]);
        setDepoimentos((tst || []).sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)));
        setFaqs((fq || []).sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)));
        setPrestacaoResumo(pc || []);
      } catch (e: any) {
        setError(e?.message || "Falha ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };
    loadAll();
  }, []);

  return (
    <div className="space-y-12 md:space-y-20">
      {/* Galeria de fotos no topo (auto-rotating) - modernizado */}
      <section className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-pink-50 via-purple-50/30 to-indigo-50/20 p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="absolute -top-20 -right-20 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-pink-200/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-purple-200/20 blur-3xl" />
        
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
          {/* Texto ao lado das fotos */}
          <div className="order-2 md:order-1 space-y-3 sm:space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-pink-700">
              ✨ Transformando vidas desde 1963
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Juntos por vidas
                <br />
                mais fortes
              </span>
            </h1>
            <p className="text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto md:mx-0">
              Acolhimento, prevenção e esperança para quem enfrenta o câncer. Faça parte dessa rede de apoio,
              participe das ações e conheça o Bazar solidário.
            </p>
          </div>

          {/* Carrossel com imagens */}
          <div className="order-1 md:order-2">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-25"></div>
              <Card className="relative w-full overflow-hidden border-0 shadow-2xl">
                <CardContent className="p-0">
                  <Carousel opts={{ loop: true }} setApi={setCarouselApi}>
                    <CarouselContent>
                      {images.map((src, idx) => (
                        <CarouselItem key={idx}>
                          <div className="aspect-[16/9] w-full overflow-hidden">
                            <img
                              src={src}
                              alt={`Galeria Sobre ${idx + 1}`}
                              className="w-full h-full object-cover"
                              draggable={false}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 bg-white/90 hover:bg-white" />
                    <CarouselNext className="right-2 bg-white/90 hover:bg-white" />
                  </Carousel>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos - modernizado */}
      <section className="space-y-6 md:space-y-8 px-2 sm:px-4">
        <div className="text-center space-y-2 sm:space-y-3 relative">
          {isAdmin && (
            <div className="absolute right-0 top-0 hidden sm:block">
              <Link to="/admin?tab=depoimentos">
                <Button size="sm" variant="outline" className="gap-2 text-xs sm:text-sm">
                  <Quote className="w-3 h-3 sm:w-4 sm:h-4" /> Adicionar depoimento
                </Button>
              </Link>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <div className="h-1 w-8 sm:w-12 bg-gradient-to-r from-transparent to-purple-400 rounded-full"></div>
            <Quote className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Depoimentos
            </h2>
            <div className="h-1 w-8 sm:w-12 bg-gradient-to-r from-purple-400 to-transparent rounded-full"></div>
          </div>
          {error ? (
            <p className="text-red-600 max-w-2xl mx-auto text-sm sm:text-base">{error}</p>
          ) : (
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">Depoimentos de pessoas impactadas pela causa.</p>
          )}
        </div>
        
        <div className="relative">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-2 sm:px-6">
              {[0,1,2].map((i) => (
                <Card key={i} className="h-full border-purple-100">
                  <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 sm:h-4 w-32 sm:w-40" />
                        <Skeleton className="h-2 sm:h-3 w-20 sm:w-24" />
                      </div>
                      <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-2 sm:h-3 w-full" />
                      <Skeleton className="h-2 sm:h-3 w-11/12" />
                      <Skeleton className="h-2 sm:h-3 w-4/5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : depoimentos.length > 0 ? (
            <Carousel className="px-2 sm:px-10">
              <CarouselContent>
                {depoimentos.map((d, idx) => (
                  <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
                    <div className="h-full p-1">
                      <Card className="h-full bg-gradient-to-br from-white via-purple-50/20 to-pink-50/30 border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
                          <div className="flex items-start justify-between gap-2 sm:gap-3">
                            <div className="flex-1">
                              <CardTitle className="text-base sm:text-lg font-bold text-gray-900">{d.nome}</CardTitle>
                              {d.cargo ? (
                                <CardDescription className="text-purple-600 font-medium text-xs sm:text-sm">{d.cargo}</CardDescription>
                              ) : null}
                            </div>
                            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden ring-2 ring-purple-200">
                              {d.fotoUrl ? (
                                <img 
                                  src={d.fotoUrl} 
                                  alt={d.nome}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback para ícone se a imagem falhar
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = '<svg class="h-6 w-6 sm:h-7 sm:w-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 12a1 1 0 011-1h6a1 1 0 110 2H9a1 1 0 01-1-1zm0-4a1 1 0 011-1h6a1 1 0 110 2H9a1 1 0 01-1-1zm8 8a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z"/></svg>';
                                    }
                                  }}
                                />
                              ) : (
                                <Quote className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-0">
                          <p className="text-gray-700 leading-relaxed italic text-sm sm:text-base">"{d.depoimento}"</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-4 bg-white shadow-lg" />
              <CarouselNext className="-right-4 bg-white shadow-lg" />
            </Carousel>
          ) : (
            <Card className="max-w-2xl mx-auto border-purple-100">
              <CardContent className="py-8 text-center text-gray-600">
                Nenhum depoimento disponível ainda.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Dúvidas Frequentes (FAQ) - modernizado */}
      <section className="space-y-6 md:space-y-8 px-2 sm:px-4">
        <div className="text-center space-y-2 sm:space-y-3 relative">
          {isAdmin && (
            <div className="absolute right-0 top-0 hidden sm:block">
              <Link to="/admin?tab=faqs">
                <Button size="sm" variant="outline" className="gap-2 text-xs sm:text-sm">
                  <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Adicionar dúvida
                </Button>
              </Link>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <div className="h-1 w-8 sm:w-12 bg-gradient-to-r from-transparent to-indigo-400 rounded-full"></div>
            <HelpCircle className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Dúvidas Frequentes
            </h2>
            <div className="h-1 w-8 sm:w-12 bg-gradient-to-r from-indigo-400 to-transparent rounded-full"></div>
          </div>
          {error ? (
            <p className="text-red-600 max-w-2xl mx-auto text-sm sm:text-base">{error}</p>
          ) : (
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">Perguntas e respostas mais comuns.</p>
          )}
        </div>
        
        <div className="max-w-4xl mx-auto px-2">
          {isLoading ? (
            <Card className="border-indigo-100">
              <CardContent className="p-0">
                <div className="divide-y divide-indigo-50">
                  {[0,1,2].map((i) => (
                    <div key={i} className="px-4 sm:px-6 py-4 sm:py-5 space-y-2 sm:space-y-3">
                      <Skeleton className="h-3 sm:h-4 w-3/4" />
                      <div className="space-y-2">
                        <Skeleton className="h-2 sm:h-3 w-full" />
                        <Skeleton className="h-2 sm:h-3 w-5/6" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : faqs.length > 0 ? (
            <Card className="border-indigo-100 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((f) => (
                    <AccordionItem key={f.id} value={`item-${f.id}`} className="border-b border-indigo-50 last:border-0">
                      <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 text-left hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent transition-all duration-200 text-sm sm:text-base md:text-lg font-semibold">
                        {f.pergunta}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 sm:px-6 pb-4 sm:pb-5 text-sm sm:text-base text-gray-700 bg-gradient-to-br from-indigo-50/30 to-transparent">
                        {f.resposta}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-indigo-100">
              <CardContent className="py-6 sm:py-8 text-center text-gray-600 text-sm sm:text-base">
                Nenhuma dúvida frequente cadastrada ainda.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Prestação de Contas - ULTRA modernizado e visual */}
      <section className="space-y-6 md:space-y-8 px-2 sm:px-4">
        <div className="text-center space-y-2 sm:space-y-3 relative">
          {isAdmin && (
            <div className="absolute right-0 top-0 hidden sm:block">
              <Link to="/admin">
                <Button size="sm" variant="outline" className="gap-2 text-xs sm:text-sm">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4" /> Adicionar lançamento
                </Button>
              </Link>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <div className="h-1 w-8 sm:w-12 bg-gradient-to-r from-transparent to-pink-400 rounded-full"></div>
            <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-pink-600" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              Prestação de Contas
            </h2>
            <div className="h-1 w-12 bg-gradient-to-r from-pink-400 to-transparent rounded-full"></div>
          </div>
          {error ? (
            <p className="text-red-600 max-w-2xl mx-auto">{error}</p>
          ) : (
            <p className="text-gray-600 max-w-2xl mx-auto">Lançamentos financeiros e resumo anual.</p>
          )}
        </div>

        {/* Card principal com visual moderno */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 via-white to-rose-50 p-1">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-pink-200/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-rose-200/20 blur-3xl" />
          
          <Card className="relative border-0 shadow-2xl">
            <CardHeader className="pb-6 bg-gradient-to-r from-pink-600 to-rose-600 text-white">
              <div className="space-y-2">
                <CardTitle className="text-2xl md:text-3xl">Resumo Anual {anoPrestacao}</CardTitle>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm opacity-90">Total movimentado:</span>
                  <span className="text-3xl md:text-4xl font-bold">{formatBRL(totalPrestacao)}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              {/* Grid de categorias com visual impressionante */}
              {isLoading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[0,1].map((i) => (
                    <Card key={i} className="border-0 shadow-lg overflow-hidden">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-6 w-40" />
                          </div>
                          <Skeleton className="h-14 w-14 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-5 w-10" />
                          </div>
                          <Skeleton className="h-3 w-full rounded-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : prestacaoResumo.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {prestacaoResumo.map((r) => {
                    const pct = totalPrestacao > 0 ? Math.round((r.valor / totalPrestacao) * 100) : 0;
                    const cor = "from-pink-500 to-pink-600";
                    return (
                      <div key={`${r.id}-${r.categoria}`} className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                        <Card className="relative border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                          <div className={`absolute top-0 right-0 h-32 w-32 bg-gradient-to-br ${cor} opacity-10 rounded-bl-full`}></div>
                          <CardContent className="p-6 relative">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground mb-1">{r.categoria}</p>
                                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                  {formatBRL(r.valor)}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Percentual do total</span>
                                <span className={`font-bold bg-gradient-to-r ${cor} bg-clip-text text-transparent text-lg`}>
                                  {pct}%
                                </span>
                              </div>
                              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`absolute top-0 left-0 h-full bg-gradient-to-r ${cor} rounded-full transition-all duration-1000 ease-out`}
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-pink-100">
                  <CardContent className="py-8 text-center text-gray-600">
                    Nenhum lançamento de prestação de contas disponível ainda.
                  </CardContent>
                </Card>
              )}

              {/* Nota informativa removida conforme solicitado */}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default Sobre;
