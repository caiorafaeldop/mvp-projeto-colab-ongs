import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Package,
  AlertCircle,
  X,
  Minus,
} from "lucide-react";
import {
  getMyProducts,
  deleteProduct,
  toggleProductAvailability,
  updateProductStock,
  Product,
} from "@/api/store";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MyProductsSkeleton } from "@/components/skeletons/MyProductsSkeleton";

export function MyProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getMyProducts();
      if (response.success) {
        setProducts(response.products);
      } else {
        throw new Error("Erro ao carregar produtos");
      }
    } catch (error: unknown) {
      console.error("Error loading products:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Erro ao carregar produtos";
      setError(errorMessage);

      // Se for erro 401, mostra mensagem específica
      if (
        (error as { response?: { status?: number } })?.response?.status === 401
      ) {
        toast({
          title: "Erro de Autenticação",
          description:
            "Você precisa estar logado como organização para acessar esta página.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) {
      return;
    }

    try {
      const response = await deleteProduct(productId);
      if (response.success) {
        toast({
          title: "Sucesso!",
          description: "Produto excluído com sucesso!",
        });
        loadProducts();
      } else {
        throw new Error("Erro ao excluir produto");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Erro ao excluir produto";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleToggleAvailability = async (productId: string) => {
    try {
      const response = await toggleProductAvailability(productId);
      if (response.success) {
        toast({
          title: "Sucesso!",
          description: response.message,
        });
        loadProducts();
      } else {
        throw new Error("Erro ao alterar disponibilidade");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Erro ao alterar disponibilidade";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      const response = await updateProductStock(productId, newStock);
      if (response.success) {
        toast({
          title: "Sucesso!",
          description: "Estoque atualizado com sucesso!",
        });
        loadProducts();
      } else {
        throw new Error("Erro ao atualizar estoque");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Erro ao atualizar estoque";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  if (isLoading) {
    return <MyProductsSkeleton />;
  }

  // Verifica se o usuário é uma organização
  if (user && user.userType !== "organization") {
    return (
      <div className="container mx-auto py-8">
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Acesso Restrito
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Esta página é exclusiva para organizações. Você precisa ter uma
              conta de organização para acessar esta funcionalidade.
            </p>
            <Button asChild>
              <Link to="/loja">Voltar para a Loja</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostra erro se houver
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Erro ao Carregar Produtos
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={loadProducts}>Tentar Novamente</Button>
              <Button variant="outline" asChild>
                <Link to="/loja">Voltar para a Loja</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Meus Produtos
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Gerencie os produtos da sua organização
            </p>
          </div>
          <Button asChild>
            <Link to="/create-product">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Link>
          </Button>
        </div>

        {products.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum produto cadastrado
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Comece criando seu primeiro produto para vender na nossa
                plataforma.
              </p>
              <Button asChild>
                <Link to="/create-product">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Produto
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product._id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={product.images[0] || "/img/placeholder-cause.jpg"}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <Badge
                    variant={product.isActive ? "default" : "secondary"}
                    className="absolute top-2 right-2"
                  >
                    {product.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteProduct(product._id)}
                    className="absolute top-2 left-2 h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2">
                    {product.name}
                  </CardTitle>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-pink-600">
                      {formatPrice(product.price)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Estoque:</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStock(product._id, Math.max(0, product.stock - 1))}
                          className="h-6 w-6 p-0"
                          disabled={product.stock <= 0}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-medium min-w-[2ch] text-center">
                          {product.stock}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStock(product._id, product.stock + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                    {product.description}
                  </p>
                  <Separator className="mb-4" />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <Link to={`/produto/${product._id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <Link to={`/edit-product/${product._id}`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAvailability(product._id)}
                      className="flex-1"
                    >
                      {product.isActive ? (
                        <>
                          <ToggleLeft className="w-4 h-4 mr-1" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <ToggleRight className="w-4 h-4 mr-1" />
                          Ativar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
