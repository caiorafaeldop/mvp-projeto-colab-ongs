import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header Section */}
      <section className="relative pt-8 pb-12 md:pb-16 px-3 sm:px-4 md:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-4 md:space-y-6">
            {isAdmin && (
              <div className="flex justify-end mb-4">
                <Button asChild size="sm" variant="outline" className="gap-2">
                  <Link to="/admin?tab=prestacao">
                    <FileText className="w-4 h-4" /> Gerenciar Planilha
                  </Link>
                </Button>
              </div>
            )}
            
            <div className="inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-xs sm:text-sm font-semibold shadow-sm ring-1 ring-pink-200/50">
              <FileText className="w-3 h-3 md:w-4 md:h-4" />
              Transparência e Responsabilidade
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold !leading-tight">
              <span className="block bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {planilhaAtiva.titulo}
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Ano {planilhaAtiva.ano}{planilhaAtiva.mes ? ` - ${new Date(2000, planilhaAtiva.mes - 1).toLocaleString('pt-BR', { month: 'long' })}` : ""}
            </p>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 ring-1 ring-black/5">
            <CardHeader className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
              <CardTitle className="text-2xl md:text-3xl">{planilhaAtiva.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-pink-600 to-purple-600">
                      {planilhaAtiva.colunas.map((col) => (
                        <TableHead
                          key={col.id}
                          className="font-bold text-white text-center border-r border-white/20"
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
                        className="hover:bg-gray-50/50 transition-colors border-b"
                      >
                        {planilhaAtiva.colunas.map((col) => (
                          <TableCell
                            key={col.id}
                            className={`border-r text-sm ${
                              col.tipo === "number" ? "text-right font-semibold" : ""
                            }`}
                          >
                            {formatValue(linha[col.id], col.tipo)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    
                    {/* Linha TOTAL */}
                    {planilhaAtiva.mostrarTotal && (
                      <TableRow className="bg-gradient-to-r from-pink-100 to-purple-100 font-bold border-t-2 border-pink-600">
                        {planilhaAtiva.colunas.map((col, idx) => {
                          const total = calcularTotal(col, planilhaAtiva.linhas);
                          return (
                            <TableCell
                              key={col.id}
                              className={`text-center text-lg ${
                                total ? "text-pink-700 font-bold text-right" : ""
                              }`}
                            >
                              {idx === 0 && !total ? "TOTAL" : total || ""}
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
        </div>
      </section>
    </div>
  );
}

export default PrestacaoContas;
