// src/pages/ProductDetail.tsx (VERSÃO CORRIGIDA E COMPLETA)

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { getProductById, getWhatsAppLink, Product, deleteProduct, updateProductStock, getProducts } from "@/api/store";
import { ArrowLeft, Edit, Trash2, Package, ShoppingBag } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { ProductDetailSkeleton } from "@/components/skeletons/ProductDetailSkeleton";
import { ProductModal } from "@/components/ProductModal";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export function ProductDetail() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newStock, setNewStock] = useState<number>(0);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.userType === "organization";

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

        // Carregar produtos relacionados
        const productsResponse = await getProducts();
        if (productsResponse.success) {
          const allProducts = productsResponse.data || [];
          const related = allProducts
            .filter((p: any) => p.id !== id)
            .slice(0, 6)
            .map((item: any) => ({
              _id: item.id,
              images: item.imageUrls?.length > 0 ? item.imageUrls : ["/placeholder-cause.jpg"],
              name: item.name,
              category: item.category,
              price: item.price,
              description: item.description || "",
              stock: item.stock || 0,
            }));
          setRelatedProducts(related);
        }
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

  useEffect(() => {
    loadProduct();
  }, [id, navigate, toast]);

  const handleWhatsAppClick = async () => {
    if (!product) return;

    try {
      const phone = "558332415373";
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

  const handleDelete = async () => {
    if (!product || !id) return;

    if (!window.confirm("Tem certeza que deseja excluir este produto?")) {
      return;
    }

    try {
      const response = await deleteProduct(id);
      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Produto excluído com sucesso!",
        });
        navigate("/loja");
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

  const handleEditClick = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalSuccess = () => {
    loadProduct(); // Recarrega o produto após edição
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
    return (
      <div className="container mx-auto py-8">
        <p>Produto não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Botão Voltar */}
      <div className="mb-6">
        <Button 
          onClick={() => navigate("/loja")}
          className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Voltar para o Bazar
        </Button>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Coluna Esquerda - Imagens */}
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-pink-100 bg-white">
            <div className="w-full h-[500px] flex items-center justify-center bg-gray-50">
              <img
                src={product.images[currentImageIndex] || "/img/placeholder-cause.jpg"}
                alt={product.name}
                className="w-full h-full object-contain object-center"
                loading="eager"
              />
            </div>
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`rounded-xl overflow-hidden border-3 transition-all transform hover:scale-105 bg-white ${
                    index === currentImageIndex
                      ? "border-pink-500 ring-2 ring-pink-300 scale-105"
                      : "border-gray-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="w-full h-20 flex items-center justify-center bg-gray-50">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-contain object-center"
                      loading="lazy"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Coluna Direita - Informações */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-3xl blur opacity-20"></div>
          <Card className="relative border-0 shadow-2xl">
            <CardContent className="p-8 space-y-6">
              {/* Título e Preço */}
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  {product.name}
                </h1>
                <div className="flex items-center justify-between">
                  <span className="text-5xl font-bold text-pink-600">
                    {formatPrice(product.price)}
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    product.stock > 0 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {product.stock > 0 ? `${product.stock} em estoque` : "Esgotado"}
                  </span>
                </div>
              </div>

              {/* Categoria */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100">
                <span className="text-sm font-semibold text-purple-700">
                  📦 {product.category}
                </span>
              </div>

              {/* Descrição */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Controles Admin ou Botão WhatsApp */}
              {isAdmin ? (
                <div className="space-y-4 pt-4 border-t-2 border-pink-100">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Controles de Administrador
                  </h3>
                  
                  {/* Campo de Estoque */}
                  <div>
                    <Label htmlFor="stock" className="font-semibold text-gray-700">
                      Quantidade em Estoque
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={newStock}
                      onChange={(e) => setNewStock(Number(e.target.value))}
                      className="border-2 border-pink-200 focus:border-pink-500 mt-2"
                    />
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      onClick={handleDelete}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      onClick={handleEditClick}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Produto
                    </Button>
                    
                    <Button
                      onClick={handleUpdateStock}
                      disabled={isUpdatingStock || newStock === product.stock}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      {isUpdatingStock ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg py-6 shadow-lg"
                  disabled={product.stock === 0}
                  onClick={handleWhatsAppClick}
                >
                  <FaWhatsapp className="w-6 h-6 mr-3" />
                  {product.stock > 0 ? "Tenho Interesse (WhatsApp)" : "Produto Esgotado"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Carrossel de Produtos Relacionados */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Outros Produtos
          </h2>
          
          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {relatedProducts.map((relatedProduct) => (
                <CarouselItem key={relatedProduct._id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Link to={`/produto/${relatedProduct._id}`}>
                    <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img 
                          src={relatedProduct.images[0] || "/placeholder-cause.jpg"}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg line-clamp-1 mb-2">{relatedProduct.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-pink-600">
                            {formatPrice(relatedProduct.price)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {relatedProduct.category}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4" />
            <CarouselNext className="-right-4" />
          </Carousel>
        </div>
      )}

      {/* Modal de Edição */}
      <ProductModal
        open={modalOpen}
        onClose={handleModalClose}
        productId={id || null}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
