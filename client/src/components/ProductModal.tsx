import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import api from "@/api/api";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrls: string[];
  stock: number;
}

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  productId?: string | null;
  onSuccess?: () => void;
}

export function ProductModal({ open, onClose, productId, onSuccess }: ProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    category: "",
    imageUrls: [""],
    stock: 0,
  });
  const { toast } = useToast();
  const isEditing = !!productId;

  const categories = [
    { value: "calçados", label: "Calçados" },
    { value: "decoração", label: "Decoração" },
    { value: "roupas", label: "Roupas" },
    { value: "acessórios", label: "Acessórios" },
    { value: "livros", label: "Livros" },
    { value: "outros", label: "Outros" },
  ];

  // Carregar produto se estiver editando
  useEffect(() => {
    if (productId && open) {
      const loadProduct = async () => {
        try {
          const response = await api.get(`/api/products/${productId}`);
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
        }
      };
      loadProduct();
    } else if (!productId) {
      // Resetar form se for criar novo
      setFormData({
        name: "",
        description: "",
        price: 0,
        category: "",
        imageUrls: [""],
        stock: 0,
      });
    }
  }, [productId, open, toast]);

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
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar imagem",
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

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) {
      return;
    }

    setIsLoading(true);
    try {
      await api.delete(`/api/products/${productId}`);
      toast({
        title: "Sucesso!",
        description: "Produto excluído com sucesso!",
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir produto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const filteredImageUrls = formData.imageUrls.filter((img) => img.trim() !== "");
    
    if (!formData.name.trim() || !formData.description.trim() || formData.price <= 0 || 
        !formData.category || formData.stock < 0 || filteredImageUrls.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        stock: formData.stock,
        imageUrls: filteredImageUrls,
      };

      if (isEditing) {
        await api.put(`/api/products/${productId}`, productData);
        toast({
          title: "Sucesso!",
          description: "Produto atualizado com sucesso!",
        });
      } else {
        await api.post("/api/products", productData);
        toast({
          title: "Sucesso!",
          description: "Produto criado com sucesso!",
        });
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: isEditing ? "Erro ao atualizar produto" : "Erro ao criar produto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            {isEditing ? "Editar Produto" : "Criar Novo Produto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Coluna Esquerda */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Nome do Produto *
                </Label>
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
                <Label htmlFor="description" className="font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Descrição *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descreva o produto detalhadamente"
                  className="border-2 border-pink-200 focus:border-pink-500 transition-colors"
                  rows={6}
                  required
                />
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-4">
              <Label className="font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Imagens *
              </Label>
              <div className="space-y-3">
                {formData.imageUrls.map((imageUrl, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={(e) => handleImageChange(index, (e.target.files as FileList)[0])}
                      className="flex-1 border-2 border-pink-200 focus:border-pink-500 transition-colors text-sm"
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
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addImageField}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Imagem
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Preço (R$) *
                  </Label>
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
                  <Label htmlFor="stock" className="font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Estoque *
                  </Label>
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

              <div className="space-y-2">
                <Label htmlFor="category" className="font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Categoria *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
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

          <div className="flex gap-3 pt-4">
            {isEditing && (
              <Button
                type="button"
                onClick={handleDelete}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg"
            >
              {isLoading ? (isEditing ? "Salvando..." : "Criando...") : (isEditing ? "💾 Salvar Alterações" : "✨ Criar Produto")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
