// src/pages/ProductDetail.tsx (VERSÃO CORRIGIDA E COMPLETA)

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { getProductById, getWhatsAppLink, Product, deleteProduct, updateProductStock } from "@/api/store";
import { ArrowLeft, Edit, Trash2, Package } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { ProductDetailSkeleton } from "@/components/skeletons/ProductDetailSkeleton";

export function ProductDetail() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newStock, setNewStock] = useState<number>(0);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const response = await getProductById(id);
        if (response.success && response.data) {
          const apiProduct = response.data;
          const productData = {
            _id: apiProduct.id,
            images: apiProduct.imageUrls || ["/img/placeholder-cause.jpg"],
            name: apiProduct.name,
            description: apiProduct.description,
            price: apiProduct.price,
            stock: apiProduct.stock || 1,
            category: apiProduct.category || "Outros",
            isActive: apiProduct.isAvailable,
            organizationId: apiProduct.organizationId,
            createdAt: apiProduct.createdAt,
            updatedAt: apiProduct.updatedAt,
          };
          setProduct(productData);
          setNewStock(productData.stock);
        } else {
          throw new Error("Produto não encontrado.");
        }
      } catch (error) {
        toast({
          title: "Erro",
          description:
            error instanceof Error
              ? error.message
              : "Não foi possível carregar o produto.",
          variant: "destructive",
        });
        navigate("/loja");
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();
  }, [id, navigate, toast]);

  const handleWhatsAppClick = async () => {
    if (!product) return;

    try {
      const phone = "5583988083711";
      const response = await getWhatsAppLink(product._id, phone);

      if (response.success) {
        window.open(response.whatsappLink, "_blank");
      } else {
        throw new Error("Erro ao gerar link do WhatsApp");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao abrir WhatsApp",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStock = async () => {
    if (!product || !id) return;

    try {
      setIsUpdatingStock(true);
      const response = await updateProductStock(id, newStock);
      
      if (response.success) {
        setProduct({ ...product, stock: newStock });
        toast({
          title: "Sucesso!",
          description: "Estoque atualizado com sucesso.",
        });
      } else {
        throw new Error("Erro ao atualizar estoque");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao atualizar estoque",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!product || !id) return;

    if (!confirm("Tem certeza que deseja excluir este produto?")) {
      return;
    }

    try {
      const response = await deleteProduct(id);
      
      if (response.success) {
        toast({
          title: "Sucesso!",
          description: "Produto excluído com sucesso.",
        });
        navigate("/create-product");
      } else {
        throw new Error("Erro ao excluir produto");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao excluir produto",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = () => {
    navigate(`/create-product?edit=${id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }
  if (!product) {
    return <div>Produto não encontrado</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link to="/loja">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para a Loja
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* ====================================================================== */}
        {/* ===== ESTE É O BLOCO QUE PRECISA SER GARANTIDO NO SEU CÓDIGO ===== */}
        {/* Coluna de Imagens */}
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden shadow-lg">
            <img
              src={
                product.images[currentImageIndex] ||
                "/img/placeholder-cause.jpg"
              }
              alt={product.name}
              className="w-full h-[450px] object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex
                      ? "border-pink-500 scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        {/* ====================================================================== */}

        {/* Coluna de Informações e Compra */}
        <div className="flex flex-col">
          <Card className="flex-grow flex flex-col">
            <CardHeader>
              <CardTitle className="text-3xl lg:text-4xl font-bold pt-4">
                {product.name}
              </CardTitle>
              <div className="flex justify-between items-center pt-4">
                <div className="text-4xl font-bold text-pink-600">
                  {formatPrice(product.price)}
                </div>
                <span className="text-sm font-medium text-green-600">
                  {product.stock > 0
                    ? `${product.stock} em estoque`
                    : "Fora de estoque"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {product.description}
              </p>
              <div className="mt-auto">
                <Separator className="my-6" />
                
                {/* Admin Controls */}
                {isAuthenticated && user?.userType === "organization" ? (
                  <div className="space-y-4">
                    {/* Stock Update */}
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor="stock">Quantidade em Estoque</Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={newStock}
                          onChange={(e) => setNewStock(Number(e.target.value))}
                        />
                      </div>
                      <Button
                        onClick={handleUpdateStock}
                        disabled={isUpdatingStock || newStock === product.stock}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        {isUpdatingStock ? "Atualizando..." : "Atualizar"}
                      </Button>
                    </div>
                    
                    {/* Admin Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={handleEditProduct}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Produto
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={handleDeleteProduct}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Produto
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Regular User WhatsApp Button */
                  <Button
                    size="lg"
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-7"
                    disabled={product.stock === 0}
                    onClick={handleWhatsAppClick}
                  >
                    <FaWhatsapp className="w-6 h-6 mr-3" />
                    {product.stock > 0
                      ? "Tenho Interesse (WhatsApp)"
                      : "Produto Esgotado"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
