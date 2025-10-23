import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import { PrestacaoConta, PrestacaoContasApi, ColunaConfig, LinhaData } from "@/api/prestacaoContas";
import { Plus, Trash2, Edit, Save, X, ArrowUp, ArrowDown, Columns } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function AdminPrestacaoContas() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [planilhas, setPlanilhas] = useState<PrestacaoConta[]>([]);
  const [planilhaAtiva, setPlanilhaAtiva] = useState<PrestacaoConta | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Estado local da planilha em edição
  const [titulo, setTitulo] = useState("");
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState<number | undefined>(undefined);
  const [mostrarTotal, setMostrarTotal] = useState(true);
  const [colunas, setColunas] = useState<ColunaConfig[]>([]);
  const [linhas, setLinhas] = useState<LinhaData[]>([]);
  
  // Dialogs
  const [dialogColuna, setDialogColuna] = useState(false);
  const [dialogNovaPlanilha, setDialogNovaPlanilha] = useState(false);
  const [colunaEdit, setColunaEdit] = useState<ColunaConfig | null>(null);
  
  // Form coluna
  const [colNome, setColNome] = useState("");
  const [colTipo, setColTipo] = useState<"text" | "number" | "date">("text");
  const [colSomavel, setColSomavel] = useState(false);
  const [colLargura, setColLargura] = useState(150);

  useEffect(() => {
    loadPlanilhas();
  }, []);

  const loadPlanilhas = async () => {
    try {
      setLoading(true);
      const data = await PrestacaoContasApi.list();
      setPlanilhas(data || []);
      if (data && data.length > 0 && !planilhaAtiva) {
        setPlanilhaAtiva(data[0]);
        carregarPlanilha(data[0]);
      }
    } catch (e: any) {
      toast({
        title: "Erro ao carregar",
        description: e?.message || "Falha ao carregar planilhas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarPlanilha = (planilha: PrestacaoConta) => {
    setTitulo(planilha.titulo);
    setAno(planilha.ano);
    setMes(planilha.mes);
    setMostrarTotal(planilha.mostrarTotal);
    setColunas(planilha.colunas || []);
    setLinhas(planilha.linhas || []);
  };

  const criarNovaPlanilha = () => {
    setTitulo("Prestação de Contas " + new Date().getFullYear());
    setAno(new Date().getFullYear());
    setMes(undefined);
    setMostrarTotal(true);
    
    // Template baseado na imagem fornecida
    const templateColunas: ColunaConfig[] = [
      { id: "item", nome: "ITEM", tipo: "text", largura: 100 },
      { id: "credor", nome: "CREDOR", tipo: "text", largura: 250 },
      { id: "cnpj", nome: "CNPJ/CPF", tipo: "text", largura: 180 },
      { id: "natureza", nome: "NATUREZA", tipo: "text", largura: 200 },
      { id: "licitacao", nome: "LICITAÇÃO", tipo: "text", largura: 120 },
      { id: "chob", nome: "CH/OB", tipo: "text", largura: 100 },
      { id: "data", nome: "DATA", tipo: "date", largura: 120 },
      { id: "titulo", nome: "TÍTULO DE CRÉDITO", tipo: "text", largura: 150 },
      { id: "dataEmissao", nome: "DATA", tipo: "date", largura: 120 },
      { id: "valor", nome: "VALORES", tipo: "number", largura: 150, somavel: true },
    ];
    
    setColunas(templateColunas);
    setLinhas([{}]); // Uma linha vazia
    setPlanilhaAtiva(null);
    setEditMode(true);
    setDialogNovaPlanilha(false);
  };

  const salvarPlanilha = async () => {
    if (!titulo.trim()) {
      toast({
        title: "Erro",
        description: "Título é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (colunas.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma coluna",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        titulo,
        ano,
        mes: mes === 0 ? undefined : mes,
        mostrarTotal,
        colunas,
        linhas,
        colunasTotal: colunas.filter(c => c.somavel).map(c => c.id),
      };

      console.log("[salvarPlanilha] Payload:", JSON.stringify(payload, null, 2));

      if (planilhaAtiva) {
        await PrestacaoContasApi.update(planilhaAtiva.id, payload);
        toast({
          title: "Atualizado!",
          description: "Planilha atualizada com sucesso",
        });
      } else {
        const nova = await PrestacaoContasApi.create(payload);
        setPlanilhaAtiva(nova);
        toast({
          title: "Criado!",
          description: "Planilha criada com sucesso",
        });
      }

      setEditMode(false);
      loadPlanilhas();
    } catch (e: any) {
      console.error("[salvarPlanilha] Erro completo:", e);
      console.error("[salvarPlanilha] Erro response data:", JSON.stringify(e?.response?.data, null, 2));
      console.error("[salvarPlanilha] Erro status:", e?.response?.status);
      console.error("[salvarPlanilha] Erro message:", e?.message);
      toast({
        title: "Erro",
        description: e?.response?.data?.message || e?.message || "Falha ao salvar",
        variant: "destructive",
      });
    }
  };

  const adicionarColuna = () => {
    if (!colNome.trim()) {
      toast({
        title: "Erro",
        description: "Nome da coluna é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const novaColuna: ColunaConfig = {
      id: `col_${Date.now()}`,
      nome: colNome,
      tipo: colTipo,
      largura: colLargura,
      somavel: colSomavel,
    };

    if (colunaEdit) {
      // Editando coluna existente
      setColunas(colunas.map(c => c.id === colunaEdit.id ? { ...novaColuna, id: colunaEdit.id } : c));
    } else {
      // Nova coluna
      setColunas([...colunas, novaColuna]);
    }

    setDialogColuna(false);
    resetFormColuna();
  };

  const resetFormColuna = () => {
    setColNome("");
    setColTipo("text");
    setColSomavel(false);
    setColLargura(150);
    setColunaEdit(null);
  };

  const removerColuna = (id: string) => {
    if (!confirm("Remover esta coluna?")) return;
    setColunas(colunas.filter(c => c.id !== id));
    // Remover dados da coluna de todas as linhas
    setLinhas(linhas.map(linha => {
      const { [id]: _, ...resto } = linha;
      return resto;
    }));
  };

  const adicionarLinha = () => {
    setLinhas([...linhas, {}]);
  };

  const removerLinha = (index: number) => {
    if (!confirm("Remover esta linha?")) return;
    setLinhas(linhas.filter((_, i) => i !== index));
  };

  const atualizarCelula = (linhaIdx: number, colunaId: string, valor: any) => {
    const novasLinhas = [...linhas];
    novasLinhas[linhaIdx] = {
      ...novasLinhas[linhaIdx],
      [colunaId]: valor,
    };
    setLinhas(novasLinhas);
  };

  const moverColuna = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= colunas.length) return;
    
    const newColunas = [...colunas];
    [newColunas[index], newColunas[newIndex]] = [newColunas[newIndex], newColunas[index]];
    setColunas(newColunas);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gerenciador de Planilhas</CardTitle>
            <div className="flex items-center gap-2">
              {!editMode ? (
                <>
                  <Button onClick={() => setDialogNovaPlanilha(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Planilha
                  </Button>
                  {planilhaAtiva && (
                    <Button
                      onClick={() => {
                        carregarPlanilha(planilhaAtiva);
                        setEditMode(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button onClick={salvarPlanilha} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button onClick={() => setEditMode(false)} variant="outline" size="sm">
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        {editMode && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Prestação de Contas 2025"
                />
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Input
                  type="number"
                  value={ano}
                  onChange={(e) => setAno(parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Mês (opcional)</Label>
                <Select value={mes?.toString() || "0"} onValueChange={(v) => setMes(v === "0" ? undefined : parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Todos os meses</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <SelectItem key={m} value={m.toString()}>
                        {new Date(2000, m - 1).toLocaleString('pt-BR', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={mostrarTotal}
                onCheckedChange={setMostrarTotal}
              />
              <Label>Mostrar linha de TOTAL</Label>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Área da Planilha */}
      {editMode ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Editar Planilha</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    setDialogColuna(true);
                    resetFormColuna();
                  }}
                  size="sm"
                  variant="outline"
                >
                  <Columns className="w-4 h-4 mr-2" />
                  Adicionar Coluna
                </Button>
                <Button onClick={adicionarLinha} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Linha
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-pink-600 to-purple-600">
                    <th className="p-2 border-r border-white/20 text-white font-bold text-xs">Ações</th>
                    {colunas.map((col, idx) => (
                      <th
                        key={col.id}
                        className="p-2 border-r border-white/20 text-white font-bold text-sm"
                        style={{ minWidth: col.largura }}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span>{col.nome}</span>
                          <span className="text-xs opacity-75">({col.tipo})</span>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-white hover:bg-white/20"
                              onClick={() => moverColuna(idx, "up")}
                              disabled={idx === 0}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-white hover:bg-white/20"
                              onClick={() => moverColuna(idx, "down")}
                              disabled={idx === colunas.length - 1}
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-white hover:bg-white/20"
                              onClick={() => {
                                setColunaEdit(col);
                                setColNome(col.nome);
                                setColTipo(col.tipo);
                                setColSomavel(col.somavel || false);
                                setColLargura(col.largura || 150);
                                setDialogColuna(true);
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-white hover:bg-red-500/50"
                              onClick={() => removerColuna(col.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((linha, linhaIdx) => (
                    <tr key={linhaIdx} className="border-b hover:bg-gray-50">
                      <td className="p-1 border-r">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removerLinha(linhaIdx)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                      {colunas.map((col) => (
                        <td key={col.id} className="p-1 border-r">
                          <Input
                            type={col.tipo === "number" ? "number" : col.tipo === "date" ? "date" : "text"}
                            value={linha[col.id] || ""}
                            onChange={(e) => atualizarCelula(linhaIdx, col.id, e.target.value)}
                            className="border-0 focus-visible:ring-1"
                            step={col.tipo === "number" ? "0.01" : undefined}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : planilhaAtiva ? (
        <Card>
          <CardHeader>
            <CardTitle>{planilhaAtiva.titulo} - Ano {planilhaAtiva.ano}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-pink-600 to-purple-600">
                    {planilhaAtiva.colunas.map((col) => (
                      <th
                        key={col.id}
                        className="p-3 border-r border-white/20 text-white font-bold text-sm"
                        style={{ minWidth: col.largura }}
                      >
                        {col.nome}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {planilhaAtiva.linhas.map((linha, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      {planilhaAtiva.colunas.map((col) => (
                        <td key={col.id} className="p-2 border-r text-sm">
                          {linha[col.id] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            Nenhuma planilha selecionada. Crie uma nova planilha para começar.
          </CardContent>
        </Card>
      )}

      {/* Dialog para adicionar/editar coluna */}
      <Dialog open={dialogColuna} onOpenChange={setDialogColuna}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{colunaEdit ? "Editar Coluna" : "Nova Coluna"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Coluna *</Label>
              <Input
                value={colNome}
                onChange={(e) => setColNome(e.target.value)}
                placeholder="Ex: CREDOR, CNPJ/CPF, VALORES"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Dado *</Label>
              <Select value={colTipo} onValueChange={(v: any) => setColTipo(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="date">Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Largura (pixels)</Label>
              <Input
                type="number"
                value={colLargura}
                onChange={(e) => setColLargura(parseInt(e.target.value))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={colSomavel}
                onCheckedChange={setColSomavel}
                disabled={colTipo !== "number"}
              />
              <Label>Somar no total (apenas para números)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogColuna(false)}>
              Cancelar
            </Button>
            <Button onClick={adicionarColuna}>
              {colunaEdit ? "Salvar Alterações" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para nova planilha */}
      <Dialog open={dialogNovaPlanilha} onOpenChange={setDialogNovaPlanilha}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Planilha</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Você deseja criar uma planilha em branco ou usar o template baseado na Relação de Pagamentos?
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={criarNovaPlanilha} className="w-full">
                Usar Template (Recomendado)
              </Button>
              <Button
                onClick={() => {
                  setTitulo("Nova Planilha");
                  setAno(new Date().getFullYear());
                  setMes(undefined);
                  setMostrarTotal(true);
                  setColunas([]);
                  setLinhas([{}]);
                  setPlanilhaAtiva(null);
                  setEditMode(true);
                  setDialogNovaPlanilha(false);
                }}
                variant="outline"
                className="w-full"
              >
                Criar em Branco
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
