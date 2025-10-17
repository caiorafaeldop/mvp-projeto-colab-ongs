import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, ShoppingBag, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import api from "@/api/api";
import { FormSkeleton } from "@/components/skeletons/FormSkeleton";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrls: string[];
  stock: number;
}

export function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    category: "",
    imageUrls: [""],
    stock: 0,
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await api.get(`/api/products/${id}`);
        if (response.data.success) {
          const product = response.data.data;
          setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price || 0,
            category: product.category || "",
            imageUrls: product.imageUrls?.length > 0 ? product.imageUrls : [""],
            stock: product.stock || 0,
          });
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar o produto",
          variant: "destructive",
        });
        navigate("/create-product");
      } finally {
        const t = setTimeout(() => setInitializing(false), 200);
        return () => clearTimeout(t);
      }
    };
    if (id) {
      loadProduct();
    }
  }, [id, navigate, toast]);

  const categories = [
    { value: "calçados", label: "Calçados", gradient: "from-blue-500 to-cyan-500" },
    { value: "decoração", label: "Decoração", gradient: "from-purple-500 to-pink-500" },
    { value: "roupas", label: "Roupas", gradient: "from-pink-500 to-rose-500" },
    { value: "acessórios", label: "Acessórios", gradient: "from-amber-500 to-orange-500" },
    { value: "livros", label: "Livros", gradient: "from-indigo-500 to-blue-500" },
    { value: "outros", label: "Outros", gradient: "from-green-500 to-emerald-500" },
  ];

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File, index: number) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("image", file);
      const response = await api.post("/api/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        const newImageUrls = [...formData.imageUrls];
        newImageUrls[index] = response.data.url;
        setFormData((prev) => ({ ...prev, imageUrls: newImageUrls }));
        toast({ title: "Sucesso", description: "Imagem enviada com sucesso!" });
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
      setIsLoading(false);
    }
  };

  const handleImageChange = (index: number, file: File | null) => {
    if (file) handleImageUpload(file, index);
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ""] }));
  };

  const removeImageField = (index: number) => {
    if (formData.imageUrls.length > 1) {
      const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, imageUrls: newImageUrls }));
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    setIsLoading(true);
    try {
      await api.delete(`/api/products/${id}`);
      toast({ title: "Sucesso!", description: "Produto excluído com sucesso!" });
      navigate("/create-product");
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao excluir produto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: "Erro", description: "Nome do produto é obrigatório", variant: "destructive" });
      return;
    }
    if (!formData.description.trim()) {
      toast({ title: "Erro", description: "Descrição do produto é obrigatória", variant: "destructive" });
      return;
    }
    if (formData.price <= 0) {
      toast({ title: "Erro", description: "Preço deve ser maior que zero", variant: "destructive" });
      return;
    }
    if (!formData.category) {
      toast({ title: "Erro", description: "Categoria é obrigatória", variant: "destructive" });
      return;
    }
    if (formData.stock < 0) {
      toast({ title: "Erro", description: "Estoque não pode ser negativo", variant: "destructive" });
      return;
    }
    const imageUrls = formData.imageUrls.filter((img) => img.trim() !== "");
    if (imageUrls.length === 0) {
      toast({ title: "Erro", description: "Pelo menos uma imagem é obrigatória", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      if (!isAuthenticated || !user) {
        toast({ title: "Erro", description: "Usuário não autenticado. Faça login novamente.", variant: "destructive" });
        navigate("/login");
        return;
      }
      const payload = { ...formData, imageUrls };
      const response = await api.put(`/api/products/${id}`, payload);
      if (response.data.success) {
        toast({ title: "Sucesso!", description: "Produto atualizado com sucesso!" });
        navigate("/create-product");
      } else {
        throw new Error("Erro ao atualizar produto");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar produto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      {initializing ? (
        <FormSkeleton fields={10} />
      ) : (
        <div className="container mx-auto py-6 px-4">
          <div className="grid lg:grid-cols-[400px_1fr] gap-8 items-start max-w-7xl mx-auto">
            {/* Coluna Esquerda - Texto */}
            <div className="space-y-6 lg:sticky lg:top-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 px-4 py-2 text-sm font-medium text-pink-700">
                ✏️ Editar produto do bazar
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Editar<br />Produto
                </span>
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Atualize as informações do produto para manter seu bazar sempre organizado.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/loja")}
                className="bg-gradient-to-r from-pink-600 to-purple-600 text-white border-0 hover:from-pink-700 hover:to-purple-700 w-full"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Ir para o Bazar
              </Button>
            </div>

            {/* Coluna Direita - Formulário */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-3xl blur opacity-20"></div>
              <Card className="relative border-0 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 h-64 w-64 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 h-64 w-64 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 rounded-full blur-3xl"></div>

                <CardHeader className="relative pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      Informações do Produto
                    </CardTitle>
                    <Button variant="destructive" type="button" onClick={handleDelete} disabled={isLoading}>
                      <Trash2 className="w-4 h-4 mr-2" /> Excluir
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="relative">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Coluna Esquerda - Nome e Descrição */}
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Nome do Produto *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="Digite o nome do produto"
                            className="border-2 border-pink-200 focus:border-pink-500 transition-colors"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Descrição *</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder="Descreva o produto detalhadamente"
                            className="border-2 border-pink-200 focus:border-pink-500 transition-colors"
                            rows={12}
                            required
                          />
                        </div>
                      </div>

                      {/* Coluna Direita - Imagens, Preço, Estoque, Categoria */}
                      <div className="space-y-6">
                        <Label className="font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Imagens *</Label>
                        <div className="space-y-3">
                          {formData.imageUrls.map((imageUrl, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <Input
                                type="file"
                                accept="image/png, image/jpeg"
                                onChange={(e) => handleImageChange(index, (e.target.files as FileList)?.[0] || null)}
                                className="flex-1 border-2 border-pink-200 focus:border-pink-500 transition-colors"
                              />
                              {formData.imageUrls.length > 1 && (
                                <Button type="button" variant="outline" size="icon" onClick={() => removeImageField(index)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                              {imageUrl && (
                                <img src={imageUrl} alt={`Imagem ${index + 1}`} className="w-16 h-16 object-cover rounded-md" />
                              )}
                            </div>
                          ))}
                          <Button type="button" variant="outline" onClick={addImageField} className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Imagem
                          </Button>
                        </div>

                        {/* Preço e Estoque */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price" className="font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Preço (R$) *</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              min="0"
                              value={formData.price}
                              onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                              placeholder="0,00"
                              className="border-2 border-pink-200 focus:border-pink-500 transition-colors"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="stock" className="font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Estoque *</Label>
                            <Input
                              id="stock"
                              type="number"
                              min="0"
                              value={formData.stock}
                              onChange={(e) => handleInputChange("stock", parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="border-2 border-pink-200 focus:border-pink-500 transition-colors"
                              required
                            />
                          </div>
                        </div>

                        {/* Categoria */}
                        <div className="space-y-2">
                          <Label htmlFor="category" className="font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Categoria *</Label>
                          <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                            <SelectTrigger className="border-2 border-pink-200 focus:border-pink-500 transition-colors">
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="button" variant="outline" onClick={() => navigate("/create-product")} className="flex-1">
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg">
                        {isLoading ? "Salvando..." : "💾 Salvar Alterações"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

export default EditProduct;
