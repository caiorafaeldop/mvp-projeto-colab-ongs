import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Testimonial, TestimonialApi } from "@/api/testimonial";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import { Pencil, Trash2, Plus, Eye, EyeOff, RefreshCw, Save, GripVertical, Upload } from "lucide-react";
import api from "@/api/api";

export default function AdminTestimonials() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.userType === "organization";
  const { toast } = useToast();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [depoimento, setDepoimento] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [ordem, setOrdem] = useState(0);
  const [ativo, setAtivo] = useState(true);

  // Drag and drop
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    loadTestimonials();
  }, [isAuthenticated, isAdmin]);

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const data = await TestimonialApi.list();
      setTestimonials(data.sort((a, b) => a.ordem - b.ordem));
    } catch (error) {
      console.error("Erro ao carregar depoimentos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os depoimentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append("image", file);

      const response = await api.post("/api/upload", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setFotoUrl(response.data.url);
        toast({
          title: "Sucesso",
          description: "Imagem enviada com sucesso!",
        });
      } else {
        throw new Error("Erro ao enviar imagem");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar imagem",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const openCreateDialog = () => {
    setEditingTestimonial(null);
    setNome("");
    setCargo("");
    setDepoimento("");
    setFotoUrl("");
    setOrdem(0);
    setAtivo(true);
    setDialogOpen(true);
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setNome(testimonial.nome);
    setCargo(testimonial.cargo);
    setDepoimento(testimonial.depoimento);
    setFotoUrl(testimonial.fotoUrl || "");
    setOrdem(testimonial.ordem);
    setAtivo(testimonial.ativo);
    setDialogOpen(true);
  };

  const saveTestimonial = async () => {
    if (!nome.trim() || !cargo.trim() || !depoimento.trim()) {
      toast({
        title: "Atenção",
        description: "Nome, cargo e depoimento são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        nome: nome.trim(),
        cargo: cargo.trim(),
        depoimento: depoimento.trim(),
        fotoUrl: fotoUrl.trim() || undefined,
        ordem: Number(ordem) || 0,
        ativo,
      };

      if (editingTestimonial?.id) {
        const updated = await TestimonialApi.update(editingTestimonial.id, payload);
        setTestimonials((prev) =>
          prev.map((x) => (x.id === updated.id ? updated : x)).sort((a, b) => a.ordem - b.ordem)
        );
        toast({
          title: "Sucesso",
          description: "Depoimento atualizado com sucesso!",
        });
      } else {
        const created = await TestimonialApi.create(payload);
        setTestimonials((prev) => [...prev, created].sort((a, b) => a.ordem - b.ordem));
        toast({
          title: "Sucesso",
          description: "Depoimento criado com sucesso!",
        });
      }

      setDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar depoimento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o depoimento",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (testimonial: Testimonial) => {
    try {
      const updated = await TestimonialApi.toggleActive(testimonial.id);
      setTestimonials((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast({
        title: "Sucesso",
        description: `Depoimento ${updated.ativo ? "ativado" : "desativado"} com sucesso!`,
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

  const deleteTestimonial = async (testimonial: Testimonial) => {
    if (!confirm(`Tem certeza que deseja deletar o depoimento de "${testimonial.nome}"?`)) return;

    try {
      await TestimonialApi.delete(testimonial.id);
      setTestimonials((prev) => prev.filter((x) => x.id !== testimonial.id));
      toast({
        title: "Sucesso",
        description: "Depoimento deletado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao deletar depoimento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar o depoimento",
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
    setTestimonials((prev) => reorder(prev, dragIndex, idx));
    setOrderDirty(true);
    setDragIndex(null);
  };

  const persistOrder = async () => {
    setSavingOrder(true);
    try {
      const updates = testimonials.map((t, i) => ({ id: t.id, ordem: i + 1 }));
      const changes = updates.filter(
        (u) => (testimonials.find((t) => t.id === u.id)?.ordem ?? 0) !== u.ordem
      );

      await Promise.all(changes.map((u) => TestimonialApi.update(u.id, { ordem: u.ordem })));

      setTestimonials((prev) =>
        prev.map((t) => ({ ...t, ordem: updates.find((u) => u.id === t.id)!.ordem }))
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">💬 Gerenciar Depoimentos</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadTestimonials} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Depoimento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingTestimonial ? "Editar Depoimento" : "Novo Depoimento"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Maria Silva"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cargo">Cargo/Função *</Label>
                      <Input
                        id="cargo"
                        value={cargo}
                        onChange={(e) => setCargo(e.target.value)}
                        placeholder="Ex: Voluntária"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="depoimento">Depoimento *</Label>
                    <Textarea
                      id="depoimento"
                      value={depoimento}
                      onChange={(e) => setDepoimento(e.target.value)}
                      placeholder="Digite o depoimento completo..."
                      rows={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fotoUrl">Foto (URL ou Upload)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="fotoUrl"
                        value={fotoUrl}
                        onChange={(e) => setFotoUrl(e.target.value)}
                        placeholder="https://exemplo.com/foto.jpg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingImage}
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingImage ? "Enviando..." : "Upload"}
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                    </div>
                    {fotoUrl && (
                      <div className="mt-2">
                        <img
                          src={fotoUrl}
                          alt="Preview"
                          className="h-20 w-20 object-cover rounded-full"
                        />
                      </div>
                    )}
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
                  <Button onClick={saveTestimonial}>Salvar</Button>
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
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum depoimento cadastrado. Clique em "Novo Depoimento" para começar.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Foto</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Depoimento</TableHead>
                <TableHead className="w-20">Ordem</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-32">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((testimonial, idx) => (
                <TableRow
                  key={testimonial.id}
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
                  <TableCell>
                    {testimonial.fotoUrl ? (
                      <img
                        src={testimonial.fotoUrl}
                        alt={testimonial.nome}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">Sem foto</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{testimonial.nome}</TableCell>
                  <TableCell>{testimonial.cargo}</TableCell>
                  <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                    {testimonial.depoimento}
                  </TableCell>
                  <TableCell>{testimonial.ordem}</TableCell>
                  <TableCell>
                    <Badge variant={testimonial.ativo ? "default" : "secondary"}>
                      {testimonial.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleActive(testimonial)}
                        title={testimonial.ativo ? "Desativar" : "Ativar"}
                      >
                        {testimonial.ativo ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(testimonial)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTestimonial(testimonial)}
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
  );
}
