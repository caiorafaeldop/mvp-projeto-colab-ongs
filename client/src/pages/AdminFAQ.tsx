import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FAQ, FAQApi } from "@/api/faq";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import { Pencil, Trash2, Plus, Eye, EyeOff, RefreshCw, Save, GripVertical } from "lucide-react";

export default function AdminFAQ() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.userType === "organization";
  const { toast } = useToast();

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

  // Form state
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [ordem, setOrdem] = useState(0);
  const [ativo, setAtivo] = useState(true);

  // Drag and drop
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    loadFAQs();
  }, [isAuthenticated, isAdmin]);

  const loadFAQs = async () => {
    setLoading(true);
    try {
      const data = await FAQApi.list();
      setFaqs(data.sort((a, b) => a.ordem - b.ordem));
    } catch (error) {
      console.error("Erro ao carregar FAQs:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as FAQs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const openCreateDialog = () => {
    setEditingFAQ(null);
    setPergunta("");
    setResposta("");
    setOrdem(0);
    setAtivo(true);
    setDialogOpen(true);
  };

  const openEditDialog = (faq: FAQ) => {
    setEditingFAQ(faq);
    setPergunta(faq.pergunta);
    setResposta(faq.resposta);
    setOrdem(faq.ordem);
    setAtivo(faq.ativo);
    setDialogOpen(true);
  };

  const saveFAQ = async () => {
    if (!pergunta.trim() || !resposta.trim()) {
      toast({
        title: "Atenção",
        description: "Pergunta e resposta são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        pergunta: pergunta.trim(),
        resposta: resposta.trim(),
        ordem: Number(ordem) || 0,
        ativo,
      };

      if (editingFAQ?.id) {
        const updated = await FAQApi.update(editingFAQ.id, payload);
        setFaqs((prev) =>
          prev.map((x) => (x.id === updated.id ? updated : x)).sort((a, b) => a.ordem - b.ordem)
        );
        toast({
          title: "Sucesso",
          description: "FAQ atualizada com sucesso!",
        });
      } else {
        const created = await FAQApi.create(payload);
        setFaqs((prev) => [...prev, created].sort((a, b) => a.ordem - b.ordem));
        toast({
          title: "Sucesso",
          description: "FAQ criada com sucesso!",
        });
      }

      setDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar FAQ:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a FAQ",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (faq: FAQ) => {
    try {
      const updated = await FAQApi.toggleActive(faq.id);
      setFaqs((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast({
        title: "Sucesso",
        description: `FAQ ${updated.ativo ? "ativada" : "desativada"} com sucesso!`,
      });
    } catch (error) {
      console.error("Erro ao alternar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status",
        variant: "destructive",
      });
    }
  };

  const deleteFAQ = async (faq: FAQ) => {
    if (!confirm(`Tem certeza que deseja deletar a FAQ: "${faq.pergunta}"?`)) return;

    try {
      await FAQApi.delete(faq.id);
      setFaqs((prev) => prev.filter((x) => x.id !== faq.id));
      toast({
        title: "Sucesso",
        description: "FAQ deletada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao deletar FAQ:", error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a FAQ",
        variant: "destructive",
      });
    }
  };

  // Drag and drop reorder
  function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed as T);
    return result;
  }

  const onDragStart = (idx: number) => setDragIndex(idx);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (idx: number) => {
    if (dragIndex === null) return;
    setFaqs((prev) => reorder(prev, dragIndex, idx));
    setOrderDirty(true);
    setDragIndex(null);
  };

  const persistOrder = async () => {
    setSavingOrder(true);
    try {
      const updates = faqs.map((faq, i) => ({ id: faq.id, ordem: i + 1 }));
      const changes = updates.filter(
        (u) => (faqs.find((f) => f.id === u.id)?.ordem ?? 0) !== u.ordem
      );

      await Promise.all(changes.map((u) => FAQApi.update(u.id, { ordem: u.ordem })));

      setFaqs((prev) =>
        prev.map((f) => ({ ...f, ordem: updates.find((u) => u.id === f.id)!.ordem }))
      );
      setOrderDirty(false);
      toast({
        title: "Sucesso",
        description: "Ordem salva com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar ordem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a ordem",
        variant: "destructive",
      });
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Painel do Administrador</h1>
        {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      </div>

      <Tabs defaultValue="faqs" className="w-full">
        <TabsList>
          <TabsTrigger value="apoiadores" asChild>
            <Link to="/admin?tab=apoiadores">Apoiadores</Link>
          </TabsTrigger>
          <TabsTrigger value="doadores" asChild>
            <Link to="/admin?tab=doadores">Doadores</Link>
          </TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="depoimentos" asChild>
            <Link to="/admin?tab=depoimentos">Depoimentos</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faqs" className="mt-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">📋 Gerenciar FAQs</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadFAQs} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova FAQ
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingFAQ ? "Editar FAQ" : "Nova FAQ"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pergunta">Pergunta *</Label>
                      <Input
                        id="pergunta"
                        value={pergunta}
                        onChange={(e) => setPergunta(e.target.value)}
                        placeholder="Ex: Como faço para doar?"
                      />
                    </div>
                    <div>
                      <Label htmlFor="resposta">Resposta *</Label>
                      <Textarea
                        id="resposta"
                        value={resposta}
                        onChange={(e) => setResposta(e.target.value)}
                        placeholder="Digite a resposta completa..."
                        rows={6}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ordem">Ordem</Label>
                        <Input
                          id="ordem"
                          type="number"
                          value={ordem}
                          onChange={(e) => setOrdem(Number(e.target.value))}
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-8">
                        <input
                          type="checkbox"
                          id="ativo"
                          checked={ativo}
                          onChange={(e) => setAtivo(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="ativo">Ativo</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={saveFAQ}>Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {orderDirty && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
              <span className="text-sm text-yellow-800">
                Você alterou a ordem. Clique em "Salvar Ordem" para persistir as mudanças.
              </span>
              <Button size="sm" onClick={persistOrder} disabled={savingOrder}>
                <Save className="h-4 w-4 mr-2" />
                {savingOrder ? "Salvando..." : "Salvar Ordem"}
              </Button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              ))}
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma FAQ cadastrada. Clique em "Nova FAQ" para começar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Pergunta</TableHead>
                  <TableHead>Resposta</TableHead>
                  <TableHead className="w-20">Ordem</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map((faq, idx) => (
                  <TableRow
                    key={faq.id}
                    onDragOver={onDragOver}
                    onDrop={() => onDrop(idx)}
                  >
                    <TableCell>
                      <div
                        draggable
                        onDragStart={() => onDragStart(idx)}
                        className="cursor-move"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">
                      {faq.pergunta}
                    </TableCell>
                    <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                      {faq.resposta}
                    </TableCell>
                    <TableCell>{faq.ordem}</TableCell>
                    <TableCell>
                      <Badge variant={faq.ativo ? "default" : "secondary"}>
                        {faq.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleActive(faq)}
                          title={faq.ativo ? "Desativar" : "Ativar"}
                        >
                          {faq.ativo ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(faq)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteFAQ(faq)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
