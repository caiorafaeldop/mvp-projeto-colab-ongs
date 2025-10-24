import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminApi, Supporter, TopDonor } from "@/api/admin";
import { Navigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import api from "@/api/api";
import AdminFAQ from "./AdminFAQ";
import AdminTestimonials from "./AdminTestimonials";
import AdminPrestacaoContas from "./AdminPrestacaoContas";

export default function AdminPanel() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = useMemo(() => user?.userType === "organization", [user]);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "apoiadores";
  const [isTabChanging, setIsTabChanging] = useState(false);

  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [currentTopDonors, setCurrentTopDonors] = useState<TopDonor[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Supporter form state
  const [supName, setSupName] = useState("");
  const [supImageUrl, setSupImageUrl] = useState("");
  const [supWebsite, setSupWebsite] = useState("");
  const [supOrder, setSupOrder] = useState(0);
  const [supVisible, setSupVisible] = useState(true);

  // Top Donor simple form (only name and amount per request)
  const [tdName, setTdName] = useState("");
  const [tdAmountText, setTdAmountText] = useState("");
  const [addingDonor, setAddingDonor] = useState(false);
  const [editingDonor, setEditingDonor] = useState<TopDonor | null>(null);
  const [donorDialogOpen, setDonorDialogOpen] = useState(false);
  const [viewingDonor, setViewingDonor] = useState<TopDonor | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Supporter Dialog state (create/edit)
  const [supDialogOpen, setSupDialogOpen] = useState(false);
  const [editingSupporter, setEditingSupporter] = useState<Supporter | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [supRefreshing, setSupRefreshing] = useState(false);
  // Donor period selection
  const now = new Date();
  const [selMonth, setSelMonth] = useState<number>(now.getMonth() + 1);
  const [selYear, setSelYear] = useState<number>(now.getFullYear());
  const [donorsRefreshing, setDonorsRefreshing] = useState(false);
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Load supporters on mount/auth
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    (async () => {
      setLoading(true);
      try {
        const s = await AdminApi.listSupporters();
        setSupporters(s);
      } catch (e) {
        console.error("AdminPanel load supporters error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, isAdmin]);

  // Load donors when period changes
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    (async () => {
      try {
        const t = await AdminApi.listTopDonorsPublicByPeriod(selYear, selMonth, 10);
        setCurrentTopDonors(t);
      } catch (e) {
        console.error("AdminPanel load donors error", e);
      }
    })();
  }, [isAuthenticated, isAdmin, selMonth, selYear]);

  // Efeito para simular loading na troca de tabs
  useEffect(() => {
    setIsTabChanging(true);
    const timer = setTimeout(() => {
      setIsTabChanging(false);
    }, 300); // 300ms de delay para transição suave
    return () => clearTimeout(timer);
  }, [activeTab]);

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
        setSupImageUrl(response.data.url);
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

  const openCreateSupporter = () => {
    setEditingSupporter(null);
    setSupName(""); setSupImageUrl(""); setSupWebsite(""); setSupOrder(0); setSupVisible(true);
    setSupDialogOpen(true);
  };

  const openEditSupporter = (s: Supporter) => {
    setEditingSupporter(s);
    setSupName(s.name || "");
    setSupImageUrl(s.imageUrl || "");
    setSupWebsite(s.website || "");
    setSupOrder(s.order ?? 0);
    setSupVisible(s.visible ?? true);
    setSupDialogOpen(true);
  };

  const saveSupporter = async () => {
    if (!supName.trim()) return;
    const payload = {
      name: supName.trim(),
      imageUrl: supImageUrl.trim() || undefined,
      website: supWebsite.trim() || undefined,
      order: Number(supOrder) || 0,
      visible: !!supVisible,
    } as Partial<Supporter>;
    if (editingSupporter?.id) {
      const updated = await AdminApi.updateSupporter(editingSupporter.id, payload);
      setSupporters((prev) => prev.map(x => x.id === updated.id ? updated : x).sort((a,b)=>(a.order||0)-(b.order||0)));
    } else {
      const saved = await AdminApi.createSupporter(payload);
      setSupporters((prev) => [...prev, saved].sort((a,b)=>(a.order||0)-(b.order||0)));
    }
    setSupDialogOpen(false);
  };

  const toggleSupporterVisible = async (s: Supporter) => {
    const updated = await AdminApi.updateSupporter(s.id, { visible: !s.visible });
    setSupporters((prev) => prev.map(x => x.id===s.id ? updated : x));
  };

  const deleteSupporter = async (s: Supporter) => {
    await AdminApi.deleteSupporter(s.id);
    setSupporters((prev) => prev.filter(x => x.id !== s.id));
  };

  // Drag and drop reorder helpers
  function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed as T);
    return result;
  }
  const onDragStartSup = (idx: number) => setDragIndex(idx);
  const onDragOverSup = (e: React.DragEvent) => e.preventDefault();
  const onDropSup = (idx: number) => {
    if (dragIndex === null) return;
    setSupporters(prev => {
      const next = reorder(prev, dragIndex, idx);
      return next;
    });
    setOrderDirty(true);
    setDragIndex(null);
  };

  const refreshSupporters = async () => {
    setSupRefreshing(true);
    try {
      const s = await AdminApi.listSupporters();
      setSupporters(s);
    } catch (e) {
      console.error("refreshSupporters error", e);
    } finally {
      setSupRefreshing(false);
    }
  };
  const persistOrder = async () => {
    setSavingOrder(true);
    try {
      const updates = supporters.map((s, i) => ({ id: s.id, order: i + 1 }));
      const changes = updates.filter(u => (supporters.find(s=>s.id===u.id)?.order ?? 0) !== u.order);
      await Promise.all(changes.map(u => AdminApi.updateSupporter(u.id, { order: u.order })));
      setSupporters(prev => prev.map(s => ({ ...s, order: updates.find(u=>u.id===s.id)!.order })));
      setOrderDirty(false);
    } finally {
      setSavingOrder(false);
    }
  };

  // donor add logic moved inline with selected period

  function parseDecimalBR(input: string): number {
    // remove thousands separator and normalize decimal comma to dot
    const normalized = input.replace(/\./g, "").replace(",", ".");
    return Number(normalized);
  }

  function formatCurrencyBR(input: string): string {
    // Keep only digits
    const digits = input.replace(/\D/g, "");
    if (!digits) return "";
    const intPart = digits.slice(0, -2) || "0";
    const decPart = digits.slice(-2).padStart(2, "0");
    // Remove leading zeros but keep a single zero if number is 0
    const intNoLeading = intPart.replace(/^0+(?!$)/, "");
    const intWithSeparators = intNoLeading.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${intWithSeparators},${decPart}`;
  }

  const openEditDonor = (donor: TopDonor) => {
    setEditingDonor(donor);
    setTdName(donor.donorName);
    setTdAmountText(donor.donatedAmount.toFixed(2).replace(".", ","));
    setDonorDialogOpen(true);
  };

  const openViewDonor = (donor: TopDonor) => {
    setViewingDonor(donor);
    setViewDialogOpen(true);
  };

  const handleAddTopDonor = async () => {
    const name = tdName.trim();
    const amount = parseDecimalBR(tdAmountText.trim());
    if (!name) {
      toast({ title: "Atenção", description: "Informe o nome do doador.", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({ title: "Atenção", description: "Informe um valor válido maior que zero.", variant: "destructive" });
      return;
    }
    setAddingDonor(true);
    try {
      const payload = {
        donorName: name,
        donatedAmount: amount,
        donationType: 'total' as const,
        referenceMonth: selMonth,
        referenceYear: selYear,
        donationDate: new Date().toISOString(),
      };
      await AdminApi.createTopDonor(payload);
      const refreshed = await AdminApi.listTopDonorsPublicByPeriod(selYear, selMonth, 10);
      setCurrentTopDonors(refreshed);
      setTdName("");
      setTdAmountText("");
      toast({ title: "Sucesso", description: "Doador adicionado." });
    } catch (e) {
      toast({ title: "Erro", description: "Falha ao adicionar doador.", variant: "destructive" });
    } finally {
      setAddingDonor(false);
    }
  };

  const handleSaveDonor = async () => {
    if (!editingDonor) return;
    const name = tdName.trim();
    const amount = parseDecimalBR(tdAmountText.trim());
    if (!name) {
      toast({ title: "Atenção", description: "Informe o nome do doador.", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({ title: "Atenção", description: "Informe um valor válido maior que zero.", variant: "destructive" });
      return;
    }
    try {
      // Delete old and create new (since there's no update endpoint)
      await AdminApi.deleteTopDonor(editingDonor.id);
      const payload = {
        donorName: name,
        donatedAmount: amount,
        donationType: 'total' as const,
        referenceMonth: selMonth,
        referenceYear: selYear,
        donationDate: new Date().toISOString(),
      };
      await AdminApi.createTopDonor(payload);
      const refreshed = await AdminApi.listTopDonorsPublicByPeriod(selYear, selMonth, 10);
      setCurrentTopDonors(refreshed);
      setTdName("");
      setTdAmountText("");
      setEditingDonor(null);
      setDonorDialogOpen(false);
      toast({ title: "Sucesso", description: "Doador atualizado." });
    } catch (e) {
      toast({ title: "Erro", description: "Falha ao atualizar doador.", variant: "destructive" });
    }
  };

  const deleteTopDonor = async (t: TopDonor) => {
    try {
      await AdminApi.deleteTopDonor(t.id);
      const refreshed = await AdminApi.listTopDonorsPublicByPeriod(selYear, selMonth, 10);
      setCurrentTopDonors(refreshed);
      toast({ title: "Removido", description: "Doador removido com sucesso." });
    } catch (e) {
      toast({ title: "Erro", description: "Falha ao remover doador.", variant: "destructive" });
    }
  };

  // removed donor alias UI per request

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Painel do Administrador</h1>
        {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsList>
          <TabsTrigger value="apoiadores" asChild>
            <Link to="/admin?tab=apoiadores">Apoiadores</Link>
          </TabsTrigger>
          <TabsTrigger value="doadores" asChild>
            <Link to="/admin?tab=doadores">Doadores</Link>
          </TabsTrigger>
          <TabsTrigger value="faqs" asChild>
            <Link to="/admin?tab=faqs">FAQs</Link>
          </TabsTrigger>
          <TabsTrigger value="depoimentos" asChild>
            <Link to="/admin?tab=depoimentos">Depoimentos</Link>
          </TabsTrigger>
          <TabsTrigger value="prestacao" asChild>
            <Link to="/admin?tab=prestacao">Prestação de Contas</Link>
          </TabsTrigger>
        </TabsList>

        {isTabChanging ? (
          <div className="mt-4 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <>
        <TabsContent value="apoiadores" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{supporters.length}</Badge>
              <span className="text-sm text-muted-foreground">apoiadores cadastrados</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refreshSupporters} disabled={supRefreshing}>{supRefreshing ? "Atualizando..." : "Atualizar"}</Button>
              <Button variant="outline" size="sm" onClick={persistOrder} disabled={!orderDirty || savingOrder}>{savingOrder ? "Salvando..." : "Salvar ordem"}</Button>
              <Dialog open={supDialogOpen} onOpenChange={setSupDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateSupporter}>Adicionar Apoiador</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSupporter ? "Editar Apoiador" : "Novo Apoiador"}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Nome</Label>
                    <Input value={supName} onChange={e=>setSupName(e.target.value)} placeholder="Empresa ou pessoa" />
                  </div>
                  <div>
                    <Label>Imagem do Apoiador</Label>
                    <Input 
                      type="file" 
                      accept="image/png, image/jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      disabled={uploadingImage}
                    />
                    {uploadingImage && <p className="text-sm text-muted-foreground mt-1">Enviando imagem...</p>}
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input value={supWebsite} onChange={e=>setSupWebsite(e.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <Label>Ordem</Label>
                    <Input type="number" value={supOrder} onChange={e=>setSupOrder(parseInt(e.target.value||"0",10))} />
                  </div>
                  <div className="flex items-center gap-2 md:col-span-2">
                    <Switch id="visible" checked={supVisible} onCheckedChange={setSupVisible} />
                    <Label htmlFor="visible">Visível</Label>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Pré-visualização</Label>
                    <div className="w-full h-40 bg-gray-50 rounded flex items-center justify-center overflow-hidden">
                      {supImageUrl ? (
                        <img src={supImageUrl} alt="Pré-visualização" className="max-h-40 object-contain" />
                      ) : (
                        <div className="text-sm text-muted-foreground">Sem imagem</div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setSupDialogOpen(false)} variant="outline">Cancelar</Button>
                  <Button onClick={saveSupporter}>{editingSupporter ? "Salvar alterações" : "Adicionar"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="w-full h-32" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-16" />
                        <Skeleton className="h-9 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supporters
              .slice()
              .sort((a,b)=> (a.order||0)-(b.order||0))
              .map((s, idx) => (
              <Card key={s.id} className="overflow-hidden" draggable onDragStart={() => onDragStartSup(idx)} onDragOver={onDragOverSup} onDrop={() => onDropSup(idx)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="truncate">{s.name}</CardTitle>
                    <Badge variant={s.visible ? "default" : "secondary"}>{s.visible ? "Visível" : "Oculto"}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="w-full h-32 bg-gray-50 rounded flex items-center justify-center overflow-hidden">
                    {s.imageUrl ? (
                      <img src={s.imageUrl} alt={s.name} className="max-h-32 object-contain" />
                    ) : (
                      <div className="text-sm text-muted-foreground">Sem imagem</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="truncate w-2/3">
                      {s.website ? (
                        <a href={s.website} target="_blank" rel="noreferrer" className="text-pink-600 hover:underline truncate inline-block max-w-full">{s.website}</a>
                      ) : (
                        <span className="text-muted-foreground">Sem site</span>
                      )}
                    </div>
                    <Badge variant="outline">ordem {s.order ?? 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch checked={s.visible} onCheckedChange={() => toggleSupporterVisible(s)} />
                      <span className="text-sm">{s.visible ? "Mostrar" : "Ocultar"}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleSupporterVisible(s)}
                        title={s.visible ? "Ocultar" : "Mostrar"}
                      >
                        {s.visible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditSupporter(s)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSupporter(s)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </TabsContent>

        <TabsContent value="doadores" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Adicionar doador</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={String(selMonth)} onValueChange={(v)=>setSelMonth(parseInt(v,10))}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Mês" /></SelectTrigger>
                    <SelectContent>
                      {monthNames.map((name, idx) => (
                        <SelectItem key={idx} value={String(idx+1)}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={String(selYear)} onValueChange={(v)=>setSelYear(parseInt(v,10))}>
                    <SelectTrigger className="w-[120px]"><SelectValue placeholder="Ano" /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 6 }).map((_,i)=>{
                        const y = now.getFullYear() - 2 + i;
                        return <SelectItem key={y} value={String(y)}>{y}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-2">
                <Label>Nome do doador</Label>
                <Input value={tdName} onChange={e=>setTdName(e.target.value)} placeholder="Ex.: Ana Souza" />
              </div>
              <div>
                <Label>Valor doado</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9.,]*"
                  value={tdAmountText}
                  onChange={(e)=>{
                    const formatted = formatCurrencyBR(e.target.value);
                    setTdAmountText(formatted);
                  }}
                  onKeyDown={(e)=>{
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!addingDonor) handleAddTopDonor();
                    }
                  }}
                  placeholder="Digite o valor (R$ 1.234,56)"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={addingDonor}
                  onClick={handleAddTopDonor}
                >
                  {addingDonor ? "Adicionando..." : "Adicionar"}
                </Button>
                <Button variant="outline" disabled={donorsRefreshing} onClick={async ()=>{
                  setDonorsRefreshing(true);
                  try {
                    const refreshed = await AdminApi.listTopDonorsPublicByPeriod(selYear, selMonth, 10);
                    setCurrentTopDonors(refreshed);
                  } finally {
                    setDonorsRefreshing(false);
                  }
                }}>{donorsRefreshing ? "Atualizando..." : "Atualizar"}</Button>
              </div>
              <div className="md:col-span-4 text-sm text-muted-foreground">O ranking é calculado automaticamente após criar/alterar/deletar.</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Top doadores ({monthNames[selMonth-1]} / {selYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posição</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="w-[140px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTopDonors
                    .slice()
                    .sort((a,b)=> (a.topPosition ?? 999) - (b.topPosition ?? 999))
                    .map(t => {
                      const medal = t.topPosition === 1 ? '🥇' : t.topPosition === 2 ? '🥈' : t.topPosition === 3 ? '🥉' : '';
                      return (
                        <TableRow key={t.id}>
                          <TableCell>{medal} {t.topPosition ?? '-'}</TableCell>
                          <TableCell>{t.donorName}</TableCell>
                          <TableCell>R$ {t.donatedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openViewDonor(t)}
                                title="Visualizar"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditDonor(t)}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteTopDonor(t)}
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
          </>
        )}

        <TabsContent value="faqs" className="mt-4">
          <AdminFAQ />
        </TabsContent>

        <TabsContent value="depoimentos" className="mt-4">
          <AdminTestimonials />
        </TabsContent>

        <TabsContent value="prestacao" className="mt-4">
          <AdminPrestacaoContas />
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição de Doador */}
      <Dialog open={donorDialogOpen} onOpenChange={setDonorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Doador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do doador</Label>
              <Input value={tdName} onChange={e => setTdName(e.target.value)} placeholder="Ex.: Ana Souza" />
            </div>
            <div>
              <Label>Valor doado</Label>
              <Input
                type="text"
                inputMode="decimal"
                pattern="[0-9.,]*"
                value={tdAmountText}
                onChange={(e) => {
                  const formatted = formatCurrencyBR(e.target.value);
                  setTdAmountText(formatted);
                }}
                placeholder="Digite o valor (R$ 1.234,56)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDonorDialogOpen(false);
              setEditingDonor(null);
              setTdName("");
              setTdAmountText("");
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveDonor}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Visualização de Doador */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Doador</DialogTitle>
          </DialogHeader>
          {viewingDonor && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Nome</Label>
                <p className="text-lg font-semibold">{viewingDonor.donorName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Valor Doado</Label>
                <p className="text-lg font-semibold">
                  R$ {viewingDonor.donatedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Posição no Ranking</Label>
                <p className="text-lg font-semibold">
                  {viewingDonor.topPosition === 1 ? '🥇' : viewingDonor.topPosition === 2 ? '🥈' : viewingDonor.topPosition === 3 ? '🥉' : ''} 
                  {viewingDonor.topPosition ?? '-'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Período</Label>
                <p className="text-lg font-semibold">
                  {viewingDonor.referenceMonth}/{viewingDonor.referenceYear}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
