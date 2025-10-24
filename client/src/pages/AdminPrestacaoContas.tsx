import { useEffect, useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import { PrestacaoConta, PrestacaoContasApi, ColunaConfig, LinhaData } from "@/api/prestacaoContas";
import { Plus, Trash2, Edit, Save, X, GripVertical, Columns } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Componente otimizado para cabeçalho de coluna arrastável
const SortableColumnHeader = memo(({ 
  col, 
  onEdit, 
  onRemove 
}: { 
  col: ColunaConfig; 
  onEdit: (col: ColunaConfig) => void;
  onRemove: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: col.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    minWidth: col.largura,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className="p-2 border-r border-white/20 text-white font-bold text-sm relative"
    >
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <button
            className="cursor-grab active:cursor-grabbing text-white/70 hover:text-white"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <span>{col.nome}</span>
        </div>
        <span className="text-xs opacity-75">({col.tipo})</span>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-white hover:bg-white/20"
            onClick={() => onEdit(col)}
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-white hover:bg-red-500/50"
            onClick={() => onRemove(col.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </th>
  );
});

SortableColumnHeader.displayName = "SortableColumnHeader";

// Componente otimizado para linha arrastável
const SortableRow = memo(({ 
  linha, 
  linhaIdx, 
  colunas, 
  onUpdateCell, 
  onRemove 
}: { 
  linha: LinhaData; 
  linhaIdx: number;
  colunas: ColunaConfig[];
  onUpdateCell: (linhaIdx: number, colId: string, value: string) => void;
  onRemove: (linhaIdx: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: linhaIdx });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b hover:bg-gray-50">
      <td className="p-1 border-r">
        <div className="flex items-center gap-1">
          <button
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(linhaIdx)}
            className="text-red-600 hover:bg-red-50 h-6 w-6 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
      {colunas.map((col) => (
        <td key={col.id} className="p-1 border-r">
          <Input
            type={col.tipo === "number" ? "number" : col.tipo === "date" ? "date" : "text"}
            value={linha[col.id] || ""}
            onChange={(e) => onUpdateCell(linhaIdx, col.id, e.target.value)}
            className="border-0 focus-visible:ring-1"
            step={col.tipo === "number" ? "0.01" : undefined}
          />
        </td>
      ))}
    </tr>
  );
});

SortableRow.displayName = "SortableRow";

export default function AdminPrestacaoContas() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [planilhas, setPlanilhas] = useState<PrestacaoConta[]>([]);
  const [planilhaAtiva, setPlanilhaAtiva] = useState<PrestacaoConta | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Helper para capitalizar o nome do mês
  const getNomeMes = (mes: number) => {
    const nome = new Date(2000, mes - 1).toLocaleString('pt-BR', { month: 'long' });
    return nome.charAt(0).toUpperCase() + nome.slice(1);
  };
  
  // Estado local da planilha em edição
  const [titulo, setTitulo] = useState("");
  const [descricaoPlanilha, setDescricaoPlanilha] = useState("");
  const [origemRecurso, setOrigemRecurso] = useState("");
  const [valorTotalRecurso, setValorTotalRecurso] = useState<number | undefined>(undefined);
  const [saldoConta, setSaldoConta] = useState<number | undefined>(undefined);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState<number | undefined>(undefined);
  const [usarPeriodo, setUsarPeriodo] = useState(false);
  const [mesInicial, setMesInicial] = useState<number | undefined>(undefined);
  const [mesFinal, setMesFinal] = useState<number | undefined>(undefined);
  const [mostrarTotal, setMostrarTotal] = useState(true);
  const [colunas, setColunas] = useState<ColunaConfig[]>([]);
  const [linhas, setLinhas] = useState<LinhaData[]>([]);
  
  // Dialogs
  const [dialogColuna, setDialogColuna] = useState(false);
  const [dialogNovaPlanilha, setDialogNovaPlanilha] = useState(false);
  const [dialogExcluir, setDialogExcluir] = useState(false);
  const [planilhaParaExcluir, setPlanilhaParaExcluir] = useState<PrestacaoConta | null>(null);
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
    setDescricaoPlanilha(planilha.descricaoPlanilha || "");
    setOrigemRecurso(planilha.origemRecurso || "");
    setValorTotalRecurso(planilha.valorTotalRecurso);
    setSaldoConta(planilha.saldoConta);
    setAno(planilha.ano);
    setMes(planilha.mes);
    
    // Carregar período se existir
    if (planilha.mesInicial && planilha.mesFinal) {
      setUsarPeriodo(true);
      setMesInicial(planilha.mesInicial);
      setMesFinal(planilha.mesFinal);
    } else {
      setUsarPeriodo(false);
      setMesInicial(undefined);
      setMesFinal(undefined);
    }
    
    setMostrarTotal(planilha.mostrarTotal);
    setColunas(planilha.colunas || []);
    // Garantir que cada linha tenha um ID único
    const linhasComId = (planilha.linhas || []).map((linha, idx) => ({
      ...linha,
      _rowId: linha._rowId || `row_${Date.now()}_${idx}`
    }));
    setLinhas(linhasComId);
  };

  const criarNovaPlanilha = () => {
    setTitulo("Prestação de Contas " + new Date().getFullYear());
    setDescricaoPlanilha("");
    setOrigemRecurso("");
    setValorTotalRecurso(undefined);
    setSaldoConta(undefined);
    setAno(new Date().getFullYear());
    setMes(undefined);
    setUsarPeriodo(false);
    setMesInicial(undefined);
    setMesFinal(undefined);
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
    setLinhas([{ _rowId: `row_${Date.now()}` }]); // Uma linha vazia com ID
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

    // Validar período se estiver usando
    if (usarPeriodo) {
      if (!mesInicial || !mesFinal) {
        toast({
          title: "Erro",
          description: "Informe o mês inicial e final do período",
          variant: "destructive",
        });
        return;
      }
      if (mesInicial > mesFinal) {
        toast({
          title: "Erro",
          description: "O mês inicial não pode ser maior que o mês final",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const payload: any = {
        titulo,
        descricaoPlanilha: descricaoPlanilha.trim() || undefined,
        origemRecurso: origemRecurso.trim() || undefined,
        valorTotalRecurso: valorTotalRecurso || undefined,
        saldoConta: saldoConta || undefined,
        ano,
        mostrarTotal,
        colunas,
        linhas,
        colunasTotal: colunas.filter(c => c.somavel).map(c => c.id),
      };

      // Se estiver usando período, enviar mesInicial e mesFinal
      if (usarPeriodo && mesInicial && mesFinal) {
        payload.mesInicial = mesInicial;
        payload.mesFinal = mesFinal;
      } else {
        // Caso contrário, enviar apenas mes (retrocompatibilidade)
        payload.mes = mes === 0 ? undefined : mes;
      }

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

  const confirmarExclusao = (planilha: PrestacaoConta) => {
    setPlanilhaParaExcluir(planilha);
    setDialogExcluir(true);
  };

  const excluirPlanilha = async () => {
    if (!planilhaParaExcluir) return;

    try {
      await PrestacaoContasApi.delete(planilhaParaExcluir.id);
      toast({
        title: "Excluído!",
        description: "Planilha excluída com sucesso",
      });
      
      // Se a planilha excluída era a ativa, limpar
      if (planilhaAtiva?.id === planilhaParaExcluir.id) {
        setPlanilhaAtiva(null);
        setEditMode(false);
      }
      
      setDialogExcluir(false);
      setPlanilhaParaExcluir(null);
      loadPlanilhas();
    } catch (e: any) {
      toast({
        title: "Erro",
        description: e?.message || "Falha ao excluir planilha",
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

  const adicionarLinha = () => {
    setLinhas([...linhas, { _rowId: `row_${Date.now()}` }]);
  };

  // Drag and Drop handlers
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEndColunas = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = colunas.findIndex((col) => col.id === active.id);
      const newIndex = colunas.findIndex((col) => col.id === over.id);

      setColunas(arrayMove(colunas, oldIndex, newIndex));
    }
  };

  const handleDragEndLinhas = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString());
      const newIndex = parseInt(over.id.toString());

      setLinhas(arrayMove(linhas, oldIndex, newIndex));
    }
  };

  // Callbacks otimizados para evitar re-renderizações
  const handleEditColumn = useCallback((col: ColunaConfig) => {
    setColunaEdit(col);
    setColNome(col.nome);
    setColTipo(col.tipo);
    setColSomavel(col.somavel || false);
    setColLargura(col.largura || 150);
    setDialogColuna(true);
  }, []);

  const handleRemoveColumn = useCallback((id: string) => {
    if (!confirm("Remover esta coluna?")) return;
    setColunas(prev => prev.filter(c => c.id !== id));
    // Remover dados da coluna de todas as linhas
    setLinhas(prev => prev.map(linha => {
      const { [id]: _, ...resto } = linha;
      return resto;
    }));
  }, []);

  const handleUpdateCell = useCallback((linhaIdx: number, colId: string, value: string) => {
    setLinhas(prev => {
      const novasLinhas = [...prev];
      novasLinhas[linhaIdx] = { ...novasLinhas[linhaIdx], [colId]: value };
      return novasLinhas;
    });
  }, []);

  const handleRemoveRow = useCallback((linhaIdx: number) => {
    setLinhas(prev => prev.filter((_, i) => i !== linhaIdx));
  }, []);

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
        
        {/* Seletor de Planilhas - somente quando não está editando */}
        {!editMode && planilhas.length > 0 && (
          <CardContent className="border-b">
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Planilhas Disponíveis ({planilhas.length})</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {planilhas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPlanilhaAtiva(p);
                      carregarPlanilha(p);
                    }}
                    className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                      planilhaAtiva?.id === p.id
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-pink-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{p.titulo}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          Ano {p.ano}
                          {p.mesInicial && p.mesFinal ? (
                            <> - {getNomeMes(p.mesInicial)}/{getNomeMes(p.mesFinal)}</>
                          ) : p.mes ? (
                            <> - {getNomeMes(p.mes)}</>
                          ) : null}
                        </p>
                        {p.descricaoPlanilha && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {p.descricaoPlanilha}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmarExclusao(p);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        )}
        
        {editMode && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Prestação de Contas 2025"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Input
                  value={descricaoPlanilha}
                  onChange={(e) => setDescricaoPlanilha(e.target.value)}
                  placeholder="Descrição breve sobre esta planilha..."
                />
              </div>
              <div className="space-y-2">
                <Label>Origem do Recurso (opcional)</Label>
                <Input
                  value={origemRecurso}
                  onChange={(e) => setOrigemRecurso(e.target.value)}
                  placeholder="Ex: Convênio Federal, Doações, Emendas Parlamentares..."
                />
              </div>
              <div className="space-y-2">
                <Label>Valor Total do Recurso (opcional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={valorTotalRecurso || ""}
                  onChange={(e) => setValorTotalRecurso(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Saldo em Conta (opcional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={saldoConta || ""}
                  onChange={(e) => setSaldoConta(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Ano *</Label>
                <Input
                  type="number"
                  value={ano}
                  onChange={(e) => setAno(parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Seleção de Período */}
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={usarPeriodo}
                  onCheckedChange={(checked) => {
                    setUsarPeriodo(checked);
                    if (!checked) {
                      setMesInicial(undefined);
                      setMesFinal(undefined);
                    } else {
                      setMes(undefined);
                    }
                  }}
                />
                <Label>Planilha com período (múltiplos meses)</Label>
              </div>

              {!usarPeriodo ? (
                <div className="space-y-2">
                  <Label>Mês (opcional)</Label>
                  <Select 
                    value={mes?.toString() || "0"} 
                    onValueChange={(v) => setMes(v === "0" ? undefined : parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os meses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Todos os meses</SelectItem>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <SelectItem key={m} value={m.toString()}>
                          {getNomeMes(m)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mês Inicial *</Label>
                    <Select 
                      value={mesInicial?.toString() || "0"} 
                      onValueChange={(v) => setMesInicial(v === "0" ? undefined : parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o mês" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Selecione...</SelectItem>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                          <SelectItem key={m} value={m.toString()}>
                            {getNomeMes(m)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mês Final *</Label>
                    <Select 
                      value={mesFinal?.toString() || "0"} 
                      onValueChange={(v) => setMesFinal(v === "0" ? undefined : parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o mês" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Selecione...</SelectItem>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                          <SelectItem key={m} value={m.toString()}>
                            {getNomeMes(m)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEndColunas}
                >
                  <thead>
                    <tr className="bg-gradient-to-r from-pink-600 to-purple-600">
                      <th className="p-2 border-r border-white/20 text-white font-bold text-xs">Ações</th>
                      <SortableContext
                        items={colunas.map((col) => col.id)}
                        strategy={horizontalListSortingStrategy}
                      >
                        {colunas.map((col) => (
                          <SortableColumnHeader 
                            key={col.id} 
                            col={col} 
                            onEdit={handleEditColumn}
                            onRemove={handleRemoveColumn}
                          />
                        ))}
                      </SortableContext>
                    </tr>
                  </thead>
                </DndContext>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEndLinhas}
                >
                  <tbody>
                    <SortableContext
                      items={linhas.map((_, idx) => idx)}
                      strategy={verticalListSortingStrategy}
                    >
                      {linhas.map((linha, linhaIdx) => (
                        <SortableRow 
                          key={linha._rowId || linhaIdx} 
                          linha={linha} 
                          linhaIdx={linhaIdx}
                          colunas={colunas}
                          onUpdateCell={handleUpdateCell}
                          onRemove={handleRemoveRow}
                        />
                      ))}
                    </SortableContext>
                  </tbody>
                </DndContext>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : planilhaAtiva ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {planilhaAtiva.titulo} - Ano {planilhaAtiva.ano}
              {planilhaAtiva.mesInicial && planilhaAtiva.mesFinal ? (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  (
                  {getNomeMes(planilhaAtiva.mesInicial)}
                  {' até '}
                  {getNomeMes(planilhaAtiva.mesFinal)}
                  )
                </span>
              ) : planilhaAtiva.mes ? (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({getNomeMes(planilhaAtiva.mes)})
                </span>
              ) : null}
            </CardTitle>
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
                  setDescricaoPlanilha("");
                  setAno(new Date().getFullYear());
                  setMes(undefined);
                  setUsarPeriodo(false);
                  setMesInicial(undefined);
                  setMesFinal(undefined);
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

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={dialogExcluir} onOpenChange={setDialogExcluir}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-700 mb-2">
              Tem certeza que deseja excluir a planilha?
            </p>
            {planilhaParaExcluir && (
              <div className="bg-gray-50 p-3 rounded-lg border mt-3">
                <p className="font-semibold text-sm">{planilhaParaExcluir.titulo}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Ano {planilhaParaExcluir.ano}
                  {planilhaParaExcluir.mesInicial && planilhaParaExcluir.mesFinal ? (
                    <> - {getNomeMes(planilhaParaExcluir.mesInicial)}/{getNomeMes(planilhaParaExcluir.mesFinal)}</>
                  ) : planilhaParaExcluir.mes ? (
                    <> - {getNomeMes(planilhaParaExcluir.mes)}</>
                  ) : null}
                </p>
                {planilhaParaExcluir.descricaoPlanilha && (
                  <p className="text-xs text-gray-500 mt-1">{planilhaParaExcluir.descricaoPlanilha}</p>
                )}
              </div>
            )}
            <p className="text-sm text-red-600 mt-3 font-medium">
              ⚠️ Esta ação não pode ser desfeita!
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogExcluir(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={excluirPlanilha}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Planilha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
