import { useCallback, useEffect, useState } from "react";
import { AdminApi, CarouselSectionSettings, CarouselSlide } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import { Pencil, Trash2, Plus, Eye, EyeOff, RefreshCw, Upload } from "lucide-react";
import api from "@/api/api";
import { DONATION_CAROUSEL_FALLBACK_SLIDES } from "@/lib/donationCarouselFallback";

let hasShownMissingCarouselEndpointToast = false;

const DEFAULT_CAROUSEL_SECTION_SETTINGS: CarouselSectionSettings = {
  title: "Sua solidariedade transforma uma vida.",
  subtitle:
    "Doação de cabelo se transforma em uma bela peruca para elevar a autoestima de quem tanto precisa.",
};

export default function AdminCarouselSlides() {
  const { toast } = useToast();

  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [endpointMissing, setEndpointMissing] = useState(false);
  const [importingFallback, setImportingFallback] = useState(false);
  const [loadingSectionSettings, setLoadingSectionSettings] = useState(false);
  const [savingSectionSettings, setSavingSectionSettings] = useState(false);

  const [sectionTitle, setSectionTitle] = useState(DEFAULT_CAROUSEL_SECTION_SETTINGS.title);
  const [sectionSubtitle, setSectionSubtitle] = useState(DEFAULT_CAROUSEL_SECTION_SETTINGS.subtitle);

  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [altText, setAltText] = useState("");
  const [order, setOrder] = useState(0);
  const [visible, setVisible] = useState(true);

  const loadSlides = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AdminApi.listCarouselSlides();
      setEndpointMissing(false);
      setSlides(data.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Erro ao carregar slides:", error);

      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        setEndpointMissing(true);
        setSlides([]);
        if (!hasShownMissingCarouselEndpointToast) {
          toast({
            title: "Área de Slides indisponível",
            description: "Não conseguimos abrir os slides agora. Tente novamente em instantes.",
            variant: "destructive",
          });
          hasShownMissingCarouselEndpointToast = true;
        }
        return;
      }

      toast({
        title: "Erro",
        description: "Não foi possível carregar os slides.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadSectionSettings = useCallback(async () => {
    setLoadingSectionSettings(true);
    try {
      const settings = await AdminApi.getCarouselSectionSettings();
      setSectionTitle(settings.title || DEFAULT_CAROUSEL_SECTION_SETTINGS.title);
      setSectionSubtitle(settings.subtitle || DEFAULT_CAROUSEL_SECTION_SETTINGS.subtitle);
      setEndpointMissing(false);
    } catch (error) {
      console.error("Erro ao carregar configuração de texto dos slides:", error);

      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        setEndpointMissing(true);
        if (!hasShownMissingCarouselEndpointToast) {
          toast({
            title: "Área de Slides indisponível",
            description: "Não conseguimos abrir os slides agora. Tente novamente em instantes.",
            variant: "destructive",
          });
          hasShownMissingCarouselEndpointToast = true;
        }
        return;
      }

      toast({
        title: "Erro",
        description: "Não foi possível carregar o título e subtítulo da seção.",
        variant: "destructive",
      });
    } finally {
      setLoadingSectionSettings(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSlides();
    loadSectionSettings();
  }, [loadSectionSettings, loadSlides]);

  const importFallbackSlides = async () => {
    if (endpointMissing) {
      toast({
        title: "Área de Slides indisponível",
        description: "No momento não foi possível importar as fotos do site.",
        variant: "destructive",
      });
      return;
    }

    setImportingFallback(true);
    try {
      const result = await AdminApi.importDefaultCarouselSlides();

      toast({
        title: "Sucesso",
        description: `Importação concluída. Novos: ${result.created}, atualizados: ${result.updated}, sem alteração: ${result.unchanged}.`,
      });

      await loadSlides();
    } catch (error) {
      console.error("Erro ao importar fallback:", error);
      toast({
        title: "Erro",
        description: "Não foi possível importar as fotos atuais do site.",
        variant: "destructive",
      });
    } finally {
      setImportingFallback(false);
    }
  };

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
        setImageUrl(response.data.url);
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
    setEditingSlide(null);
    setImageUrl("");
    setCaption("");
    setAltText("");
    setOrder(0);
    setVisible(true);
    setDialogOpen(true);
  };

  const openEditDialog = (slide: CarouselSlide) => {
    setEditingSlide(slide);
    setImageUrl(slide.imageUrl || "");
    setCaption(slide.caption || "");
    setAltText(slide.altText || "");
    setOrder(slide.order || 0);
    setVisible(slide.visible ?? true);
    setDialogOpen(true);
  };

  const saveSlide = async () => {
    if (!imageUrl.trim()) {
      toast({
        title: "Atenção",
        description: "A imagem do slide é obrigatória",
        variant: "destructive",
      });
      return;
    }

    try {
      const normalizedCaption = caption.trim();
      const normalizedAltText = altText.trim();

      const payload = {
        imageUrl: imageUrl.trim(),
        caption: normalizedCaption ? normalizedCaption : null,
        altText: normalizedAltText ? normalizedAltText : null,
        order: Number(order) || 0,
        visible,
      } as Partial<CarouselSlide>;

      if (editingSlide?.id) {
        const updated = await AdminApi.updateCarouselSlide(editingSlide.id, payload);
        setSlides((prev) =>
          prev.map((x) => (x.id === updated.id ? updated : x)).sort((a, b) => a.order - b.order)
        );
        toast({
          title: "Sucesso",
          description: "Slide atualizado com sucesso!",
        });
      } else {
        const created = await AdminApi.createCarouselSlide(payload);
        setSlides((prev) => [...prev, created].sort((a, b) => a.order - b.order));
        toast({
          title: "Sucesso",
          description: "Slide criado com sucesso!",
        });
      }

      setDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar slide:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o slide",
        variant: "destructive",
      });
    }
  };

  const saveSectionSettings = async () => {
    const normalizedTitle = sectionTitle.trim();
    const normalizedSubtitle = sectionSubtitle.trim();

    if (!normalizedTitle) {
      toast({
        title: "Atenção",
        description: "O título da seção é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!normalizedSubtitle) {
      toast({
        title: "Atenção",
        description: "O subtítulo da seção é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setSavingSectionSettings(true);
    try {
      const saved = await AdminApi.updateCarouselSectionSettings({
        title: normalizedTitle,
        subtitle: normalizedSubtitle,
      });

      setSectionTitle(saved.title);
      setSectionSubtitle(saved.subtitle);

      toast({
        title: "Sucesso",
        description: "Texto principal da seção atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar configuração de texto dos slides:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o título e subtítulo da seção.",
        variant: "destructive",
      });
    } finally {
      setSavingSectionSettings(false);
    }
  };

  const toggleVisible = async (slide: CarouselSlide) => {
    try {
      const updated = await AdminApi.updateCarouselSlide(slide.id, { visible: !slide.visible });
      setSlides((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      toast({
        title: "Sucesso",
        description: `Slide ${updated.visible ? "ativado" : "desativado"} com sucesso!`,
      });
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do slide",
        variant: "destructive",
      });
    }
  };

  const deleteSlide = async (slide: CarouselSlide) => {
    if (!confirm("Tem certeza que deseja excluir este slide?")) return;

    try {
      await AdminApi.deleteCarouselSlide(slide.id);
      setSlides((prev) => prev.filter((x) => x.id !== slide.id));
      toast({
        title: "Sucesso",
        description: "Slide removido com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao excluir slide:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o slide",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Slides da Página de Doações</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Gerencie as imagens que aparecem na vitrine de doações.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadSlides} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Slide
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{editingSlide ? "Editar Slide" : "Novo Slide"}</DialogTitle>
                  <DialogDescription>
                    Escolha a imagem, edite a legenda exibida na página e defina a posição em que o slide deve aparecer.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="slide-image">Imagem do Slide *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="slide-image"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Cole a URL da imagem ou envie um arquivo"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingImage}
                        onClick={() => document.getElementById("carousel-slide-upload")?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingImage ? "Enviando..." : "Enviar foto"}
                      </Button>
                      <input
                        id="carousel-slide-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="slide-caption">Legenda exibida na página (opcional)</Label>
                      <Input
                        id="slide-caption"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Ex: Entrega de kits escolares"
                      />
                    </div>
                    <div>
                      <Label htmlFor="slide-alt">Texto alternativo da imagem (acessibilidade)</Label>
                      <Input
                        id="slide-alt"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="Ex: Voluntários entregando cestas (não aparece como legenda)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="slide-order">Posição de exibição</Label>
                      <Input
                        id="slide-order"
                        type="number"
                        value={order}
                        onChange={(e) => setOrder(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-8">
                      <input
                        type="checkbox"
                        id="slide-visible"
                        checked={visible}
                        onChange={(e) => setVisible(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="slide-visible">Mostrar este slide no site</Label>
                    </div>
                  </div>

                  <div>
                    <Label>Como vai aparecer</Label>
                    <div className="mt-2 rounded-lg border p-3">
                      {imageUrl ? (
                        <div className="space-y-2">
                          <img
                            src={imageUrl}
                            alt={altText || caption || "Slide"}
                            className="h-40 w-full object-contain rounded bg-gray-50"
                          />
                          {caption && <p className="text-sm text-muted-foreground">{caption}</p>}
                        </div>
                      ) : (
                        <div className="h-32 flex items-center justify-center text-sm text-muted-foreground bg-gray-50 rounded">
                          Nenhuma imagem selecionada
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveSlide}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-4 rounded-lg border bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Texto de destaque da seção</p>
          <p className="mt-1 text-xs text-slate-600">
            Este título e subtítulo aparecem acima das imagens na página de doações.
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3">
            <div>
              <Label htmlFor="section-title">Título</Label>
              <Input
                id="section-title"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="Ex: Sua solidariedade transforma uma vida."
                disabled={endpointMissing || loadingSectionSettings || savingSectionSettings}
              />
            </div>
            <div>
              <Label htmlFor="section-subtitle">Subtítulo</Label>
              <Textarea
                id="section-subtitle"
                value={sectionSubtitle}
                onChange={(e) => setSectionSubtitle(e.target.value)}
                placeholder="Ex: Doação de cabelo se transforma em uma bela peruca..."
                rows={3}
                disabled={endpointMissing || loadingSectionSettings || savingSectionSettings}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={saveSectionSettings}
                disabled={endpointMissing || loadingSectionSettings || savingSectionSettings}
              >
                {savingSectionSettings ? "Salvando..." : "Salvar texto da seção"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-lg border bg-slate-50 p-3 text-sm text-slate-700">
          <p className="font-medium">Passo a passo rápido</p>
          <p className="mt-1">1) Clique em "Novo Slide". 2) Envie uma imagem. 3) Escreva um texto (opcional). 4) Salve.</p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="secondary">Total: {slides.length}</Badge>
          <Badge variant="secondary">Visíveis: {slides.filter((slide) => slide.visible).length}</Badge>
          <Badge variant="secondary">Ocultos: {slides.filter((slide) => !slide.visible).length}</Badge>
        </div>

        {!loading && (endpointMissing || slides.length === 0) && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-amber-900">Fotos que já estão no site</p>
                <p className="text-xs text-amber-800 mt-1">
                  Se quiser, você pode usar estas imagens como ponto de partida e depois editar cada slide.
                </p>
              </div>
              {!endpointMissing && (
                <Button size="sm" variant="outline" onClick={importFallbackSlides} disabled={importingFallback}>
                  {importingFallback ? "Importando..." : "Usar fotos atuais"}
                </Button>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {DONATION_CAROUSEL_FALLBACK_SLIDES.map((slide) => (
                <div key={slide.imageUrl} className="rounded border bg-white p-1">
                  <img
                    src={slide.imageUrl}
                    alt={slide.altText}
                    className="h-20 w-full object-cover rounded"
                  />
                  <p className="mt-1 text-[10px] text-slate-600 truncate">{slide.caption}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {endpointMissing && !loading ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Não conseguimos abrir a área de Slides agora. Tente novamente em alguns minutos.
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <Skeleton className="h-14 w-24" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-28" />
              </div>
            ))}
          </div>
        ) : slides.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum slide cadastrado. Clique em "Novo Slide" para começar.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Imagem</TableHead>
                <TableHead>Texto</TableHead>
                <TableHead className="w-20">Posição</TableHead>
                <TableHead className="w-24">Exibição</TableHead>
                <TableHead className="w-64">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slides
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((slide) => (
                  <TableRow key={slide.id}>
                    <TableCell>
                      <img
                        src={slide.imageUrl}
                        alt={slide.altText || slide.caption || "Slide"}
                        className="h-14 w-24 object-cover rounded border"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{slide.caption || "Sem texto"}</p>
                        {slide.altText && (
                          <p className="text-xs text-muted-foreground">Alt/acessibilidade: {slide.altText}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{slide.order}</TableCell>
                    <TableCell>
                      <Badge variant={slide.visible ? "default" : "secondary"}>
                        {slide.visible ? "No ar" : "Oculto"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => toggleVisible(slide)}
                          title={slide.visible ? "Ocultar slide" : "Mostrar slide"}
                        >
                          {slide.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="hidden sm:inline">{slide.visible ? "Ocultar" : "Mostrar"}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => openEditDialog(slide)}
                          title="Editar slide"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="hidden sm:inline">Editar</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1"
                          onClick={() => deleteSlide(slide)}
                          title="Excluir slide"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Excluir</span>
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
