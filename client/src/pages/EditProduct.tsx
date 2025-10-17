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

  // Carregar produto existente
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
        setTimeout(() => setInitializing(false), 200);
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

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) {
      return;
    }

    setIsLoading(true);
    try {
      await api.delete(`/api/products/${id}`);
      toast({
        title: "Sucesso!",
        description: "Produto excluído com sucesso!",
      });
      navigate("/create-product");
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao excluir produto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        imageUrls: filteredImageUrls,
      };

      const response = await api.put(`/api/products/${id}`, productData);

      if (response.data.success) {
        toast({
          title: "Sucesso!",
          description: "Produto atualizado com sucesso!",
        });
        navigate("/create-product");
      } else {
        throw new Error("Erro ao atualizar produto");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao atualizar produto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg"
                >
                  {isLoading ? "Salvando..." : "💾 Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
        </div>
      )}
    </ProtectedRoute>
  );
} 
export default EditProduct;
