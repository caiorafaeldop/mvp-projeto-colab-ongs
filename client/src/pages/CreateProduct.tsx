import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ArrowLeft, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import api from "@/api/api";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrls: string[];
  stock: number;
}

export function CreateProduct() {
  const [isLoading, setIsLoading] = useState(false);
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
  const { user, isAuthenticated } = useAuth(); // Corrigido: useAuth correto

  const categories = [
    { value: "calçados", label: "Calçados" },
    { value: "decoração", label: "Decoração" },
    { value: "roupas", label: "Roupas" },
    { value: "acessórios", label: "Acessórios" },
    { value: "livros", label: "Livros" },
    { value: "outros", label: "Outros" },
  ];

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        const newImageUrls = [...formData.imageUrls];
        newImageUrls[index] = response.data.url;
        setFormData((prev) => ({
          ...prev,
          imageUrls: newImageUrls,
        }));
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
        description:
          error instanceof Error ? error.message : "Erro ao enviar imagem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (index: number, file: File | null) => {
    if (file) {
      handleImageUpload(file, index);
    }
  };

  const addImageField = () => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ""],
    }));
  };

  const removeImageField = (index: number) => {
    if (formData.imageUrls.length > 1) {
      const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        imageUrls: newImageUrls,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do produto é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Erro",
        description: "Descrição do produto é obrigatória",
        variant: "destructive",
      });
      return;
    }

    if (formData.price <= 0) {
      toast({
        title: "Erro",
        description: "Preço deve ser maior que zero",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Erro",
        description: "Categoria é obrigatória",
        variant: "destructive",
      });
      return;
    }

    if (formData.stock < 0) {
      toast({
        title: "Erro",
        description: "Estoque não pode ser negativo",
        variant: "destructive",
      });
      return;
    }

    const filteredImageUrls = formData.imageUrls.filter(
      (img) => img.trim() !== ""
    );
    if (filteredImageUrls.length === 0) {
      toast({
        title: "Erro",
        description: "Pelo menos uma imagem é obrigatória",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Verifica autenticação
      if (!isAuthenticated || !user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado. Faça login novamente.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        stock: formData.stock,
        imageUrls: filteredImageUrls, // Corrigido: usa imageUrls (plural)
      };

      const response = await api.post("/api/products", productData); // Sem header manual, interceptor cuida

      if (response.data.success) {
        toast({
          title: "Sucesso!",
          description: "Produto criado com sucesso!",
        });
        navigate("/create-product"); // Ajustado para ir para create-product, como no botão Voltar
      } else {
        throw new Error("Erro ao criar produto");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao criar produto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/loja")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Bazar
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Criar Novo Produto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Digite o nome do produto"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Descreva o produto detalhadamente"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      handleInputChange(
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0,00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Estoque *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      handleInputChange(
                        "stock",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label>Imagens *</Label>
                <div className="space-y-3">
                  {formData.imageUrls.map((imageUrl, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={(e) =>
                          handleImageChange(
                            index,
                            (e.target.files as FileList)[0]
                          )
                        }
                        className="flex-1"
                      />
                      {formData.imageUrls.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeImageField(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={`Imagem ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addImageField}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Imagem
                  </Button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/create-product")}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Criando..." : "Criar Produto"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

export default CreateProduct;
