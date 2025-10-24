import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Calendar, DollarSign, Eye } from "lucide-react";
import { PrestacaoConta, PrestacaoContasApi, ColunaConfig, LinhaData } from "@/api/prestacaoContas";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function PrestacaoContas() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = !!isAuthenticated && user?.userType === "organization";

  // Helper para capitalizar o nome do mês
  const getNomeMes = (mes: number) => {
    const nome = new Date(2000, mes - 1).toLocaleString('pt-BR', { month: 'long' });
    return nome.charAt(0).toUpperCase() + nome.slice(1);
  };
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planilhas, setPlanilhas] = useState<PrestacaoConta[]>([]);
  const [planilhaAtiva, setPlanilhaAtiva] = useState<PrestacaoConta | null>(null);

  useEffect(() => {
    const loadPlanilhas = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await PrestacaoContasApi.list();
        setPlanilhas(data || []);
        // Seleciona a primeira planilha por padrão
        if (data && data.length > 0) {
          setPlanilhaAtiva(data[0]);
        }
      } catch (e: any) {
        setError(e?.message || "Falha ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };
    loadPlanilhas();
  }, []);

  const formatValue = (value: any, tipo: string) => {
    if (value === null || value === undefined || value === "") return "-";
    
    if (tipo === "number") {
      const num = parseFloat(value);
      if (isNaN(num)) return value;
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(num);
    }
    
    if (tipo === "date" && value) {
      try {
        const date = new Date(value);
        return new Intl.DateTimeFormat("pt-BR").format(date);
      } catch {
        return value;
      }
    }
    
    return value;
  };

  const calcularTotal = (coluna: ColunaConfig, linhas: LinhaData[]) => {
    if (!coluna.somavel) return null;
    
    const total = linhas.reduce((acc, linha) => {
      const valor = parseFloat(linha[coluna.id]);
      return acc + (isNaN(valor) ? 0 : valor);
    }, 0);
    
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(total);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !planilhaAtiva) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-red-600 mb-4">{error || "Nenhuma planilha disponível"}</p>
              {isAdmin && (
                <Button asChild>
                  <Link to="/admin?tab=prestacao">Criar Planilha</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header Section com Design Moderno */}
      <section className="relative bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        {/* Decoração de fundo */}
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
          {/* Botão Admin */}
          {isAdmin && (
            <div className="flex justify-end mb-6">
              <Button asChild size="sm" variant="secondary" className="gap-2 shadow-lg hover:shadow-xl transition-all">
                <Link to="/admin?tab=prestacao">
                  <FileText className="w-4 h-4" /> Gerenciar Planilhas
                </Link>
              </Button>
            </div>
          )}

          {/* Seletor de Planilhas Moderno */}
          {planilhas.length > 1 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-3 justify-center">
                {planilhas.map((planilha) => {
                  const isActive = planilhaAtiva?.id === planilha.id;
                  return (
                    <button
                      key={planilha.id}
                      onClick={() => setPlanilhaAtiva(planilha)}
                      className={`group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        isActive
                          ? "bg-white text-purple-700 shadow-xl scale-105"
                          : "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:scale-105"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isActive ? "bg-purple-600 animate-pulse" : "bg-white/50"}`}></div>
                        <div className="text-left">
                          <div className="font-semibold text-sm">{planilha.titulo}</div>
                          <div className={`text-xs ${isActive ? "text-purple-600/70" : "text-white/70"}`}>
                            {planilha.ano}
                            {planilha.mesInicial && planilha.mesFinal
                              ? ` • ${getNomeMes(planilha.mesInicial).slice(0, 3)}/${getNomeMes(planilha.mesFinal).slice(0, 3)}`
                              : planilha.mes
                              ? ` • ${getNomeMes(planilha.mes).slice(0, 3)}`
                              : ""}
                          </div>
                        </div>
                      </div>
                      {isActive && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Título e Informações */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold shadow-lg">
              <FileText className="w-4 h-4" />
              Transparência Financeira
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
              {planilhaAtiva.titulo}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-4 text-white/90">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">
                  Ano {planilhaAtiva.ano}
                  {planilhaAtiva.mesInicial && planilhaAtiva.mesFinal ? (
                    <> • {getNomeMes(planilhaAtiva.mesInicial)} - {getNomeMes(planilhaAtiva.mesFinal)}</>
                  ) : planilhaAtiva.mes ? (
                    <> • {getNomeMes(planilhaAtiva.mes)}</>
                  ) : null}
                </span>
              </div>
              
              {planilhaAtiva.linhas && planilhaAtiva.linhas.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                  <Eye className="w-5 h-5" />
                  <span className="font-medium">{planilhaAtiva.linhas.length} registros</span>
                </div>
              )}
            </div>

            {planilhaAtiva.descricaoPlanilha && (
              <p className="text-lg text-white/90 leading-relaxed max-w-3xl mx-auto px-4 bg-white/10 backdrop-blur-sm rounded-xl py-4">
                {planilhaAtiva.descricaoPlanilha}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Table Section - Design Moderno */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto">
          {/* Card com estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total de Registros */}
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Registros</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {planilhaAtiva.linhas?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Geral (se houver colunas somáveis) */}
            {planilhaAtiva.colunas.some(col => col.somavel) && (
              <Card className="bg-white shadow-lg hover:shadow-xl transition-all border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Valor Total</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">
                        {(() => {
                          const colunaSomavel = planilhaAtiva.colunas.find(c => c.somavel);
                          return colunaSomavel ? calcularTotal(colunaSomavel, planilhaAtiva.linhas) : "R$ 0,00";
                        })()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Período */}
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Período</p>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      {planilhaAtiva.mesInicial && planilhaAtiva.mesFinal ? (
                        <>{getNomeMes(planilhaAtiva.mesInicial)} - {getNomeMes(planilhaAtiva.mesFinal)}</>
                      ) : planilhaAtiva.mes ? (
                        getNomeMes(planilhaAtiva.mes)
                      ) : (
                        "Ano Completo"
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{planilhaAtiva.ano}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela principal com design moderno */}
          <Card className="bg-white shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 border-none">
                      {planilhaAtiva.colunas.map((col, idx) => (
                        <TableHead
                          key={col.id}
                          className={`font-bold text-white text-sm uppercase tracking-wider py-4 ${
                            col.tipo === "number" ? "text-right" : "text-left"
                          } ${idx !== planilhaAtiva.colunas.length - 1 ? "border-r border-white/10" : ""}`}
                          style={{ minWidth: col.largura || 150 }}
                        >
                          {col.nome}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planilhaAtiva.linhas.map((linha, idx) => (
                      <TableRow
                        key={idx}
                        className={`transition-all hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        {planilhaAtiva.colunas.map((col, colIdx) => (
                          <TableCell
                            key={col.id}
                            className={`py-4 text-sm ${
                              col.tipo === "number" 
                                ? "text-right font-semibold text-gray-900" 
                                : "text-left text-gray-700"
                            } ${colIdx !== planilhaAtiva.colunas.length - 1 ? "border-r border-gray-100" : ""}`}
                          >
                            {formatValue(linha[col.id], col.tipo)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    
                    {/* Linha TOTAL com destaque */}
                    {planilhaAtiva.mostrarTotal && (
                      <TableRow className="bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 border-t-4 border-purple-600">
                        {planilhaAtiva.colunas.map((col, idx) => {
                          const total = calcularTotal(col, planilhaAtiva.linhas);
                          return (
                            <TableCell
                              key={col.id}
                              className={`py-5 text-base font-bold ${
                                total 
                                  ? "text-purple-700 text-right text-xl" 
                                  : idx === 0 
                                  ? "text-purple-900 uppercase tracking-wider" 
                                  : "text-gray-400"
                              }`}
                            >
                              {idx === 0 && !total ? "TOTAL GERAL" : total || ""}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Rodapé com informações */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-lg text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Atualizado em {new Date().toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PrestacaoContas;
