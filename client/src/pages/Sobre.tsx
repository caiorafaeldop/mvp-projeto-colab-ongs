import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Quote, HelpCircle, FileText } from "lucide-react";

export function Sobre() {
  // Simple rotating gallery (autoplay) – color placeholders (no photos yet)
  const gallerySlides = [
    { bg: "from-pink-200 to-pink-400" },
    { bg: "from-purple-200 to-purple-400" },
    { bg: "from-indigo-200 to-indigo-400" },
    { bg: "from-blue-200 to-blue-400" },
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
  
  // Dados serão integrados depois pelo painel/admin e APIs. Mantemos estruturas vazias e placeholders visuais.
  const depoimentos: Array<{ nome: string; papel: string; texto: string }> = [];
  const faqs: Array<{ q: string; a: string }> = [];
  type PrestacaoItem = { categoria: string; valor: number; cor?: string };
  const prestacaoResumo: PrestacaoItem[] = [];
  const anoPrestacao = new Date().getFullYear();
  const totalPrestacao = prestacaoResumo.reduce((acc, i) => acc + i.valor, 0);
  const formatBRL = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

  return (
    <div className="space-y-20">
      {/* Galeria de fotos no topo (auto-rotating) - modernizado */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 via-purple-50/30 to-indigo-50/20 p-8 md:p-12">
        <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-pink-200/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-purple-200/20 blur-3xl" />
        
        <div className="relative grid md:grid-cols-2 gap-10 items-center">
          {/* Texto ao lado das fotos */}
          <div className="order-2 md:order-1 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-1.5 text-sm font-medium text-pink-700">
              ✨ Transformando vidas desde 1963
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Juntos por vidas
                <br />
                mais fortes
              </span>
            </h1>
            <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
              Acolhimento, prevenção e esperança para quem enfrenta o câncer. Faça parte dessa rede de apoio,
              participe das ações e conheça o Bazar solidário.
            </p>
          </div>

          {/* Carrossel de cores (sem fotos) */}
          <div className="order-1 md:order-2">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-25"></div>
              <Card className="relative w-full overflow-hidden border-0 shadow-2xl">
                <CardContent className="p-0">
                  <Carousel opts={{ loop: true }} setApi={setCarouselApi}>
                    <CarouselContent>
                      {gallerySlides.map((s, idx) => (
                        <CarouselItem key={idx}>
                          <div className="aspect-[16/9] w-full overflow-hidden">
                            <div className={`h-full w-full bg-gradient-to-br ${s.bg} transition-all duration-500`} />
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
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-purple-400 rounded-full"></div>
            <Quote className="w-7 h-7 text-purple-600" />
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Depoimentos
            </h2>
            <div className="h-1 w-12 bg-gradient-to-r from-purple-400 to-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
          </p>
        </div>
        
        <div className="relative">
          {depoimentos.length > 0 ? (
            <Carousel className="px-10">
              <CarouselContent>
                {depoimentos.map((d, idx) => (
                  <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
                    <div className="h-full p-1">
                      <Card className="h-full bg-gradient-to-br from-white via-purple-50/20 to-pink-50/30 border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <CardTitle className="text-lg font-bold text-gray-900">{d.nome}</CardTitle>
                              <CardDescription className="text-purple-600 font-medium">{d.papel}</CardDescription>
                            </div>
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <Quote className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 leading-relaxed italic">"{d.texto}"</p>
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
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-indigo-400 rounded-full"></div>
            <HelpCircle className="w-7 h-7 text-indigo-600" />
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Dúvidas Frequentes
            </h2>
            <div className="h-1 w-12 bg-gradient-to-r from-indigo-400 to-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {faqs.length > 0 ? (
            <Card className="border-indigo-100 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((f, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-indigo-50 last:border-0">
                      <AccordionTrigger className="px-6 py-5 text-left hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent transition-all duration-200 text-lg font-semibold">
                        {f.q}
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-5 text-gray-700 bg-gradient-to-br from-indigo-50/30 to-transparent">
                        {f.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-indigo-100">
              <CardContent className="py-8 text-center text-gray-600">
                Nenhuma dúvida frequente cadastrada ainda.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Prestação de Contas - ULTRA modernizado e visual */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-pink-400 rounded-full"></div>
            <FileText className="w-7 h-7 text-pink-600" />
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              Prestação de Contas
            </h2>
            <div className="h-1 w-12 bg-gradient-to-r from-pink-400 to-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
          </p>
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
              {prestacaoResumo.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {prestacaoResumo.map((r) => {
                    const pct = totalPrestacao > 0 ? Math.round((r.valor / totalPrestacao) * 100) : 0;
                    const cor = r.cor || "from-pink-500 to-pink-600";
                    return (
                      <div key={r.categoria} className="group relative">
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
