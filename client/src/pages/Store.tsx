/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ProductModal } from "@/components/ProductModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Plus, Edit } from "lucide-react";
import { getProducts, Product } from "@/api/store";
import { useToast } from "@/hooks/useToast";
import { useIsMobile } from "@/hooks/useMobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const { toast} = useToast();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const isAdmin = user?.userType === "organization";

  const categories = [
    { value: "all", label: "Todas as categorias", gradient: "from-gray-500 to-gray-600" },
    { value: "calçados", label: "Calçados", gradient: "from-blue-500 to-cyan-500" },
    { value: "decoração", label: "Decoração", gradient: "from-purple-500 to-pink-500" },
    { value: "roupas", label: "Roupas", gradient: "from-pink-500 to-rose-500" },
    { value: "acessórios", label: "Acessórios", gradient: "from-amber-500 to-orange-500" },
    { value: "outros", label: "Outros", gradient: "from-green-500 to-emerald-500" },
  ];

  const getCategoryGradient = (category: string) => {
    const cat = categories.find(c => c.value === category.toLowerCase());
    return cat?.gradient || "from-gray-500 to-gray-600";
  };

  // Load products on mount
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await getProducts();
      if (response.success) {
        // Transforma os dados para o formato esperado pelo frontend
        const transformedProducts = (response.data || []).map(
          (item: any) => ({
            _id: item.id,
            images:
              item.imageUrls?.length > 0
                ? item.imageUrls
                : ["/placeholder-cause.jpg"],
            name: item.name,
            category: item.category ? item.category.toLowerCase() : "outros", // normaliza para lowercase
            price: item.price,
            description: item.description || "",
            stock: item.stock || 0,
          })
        );
        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
      } else {
        throw new Error("Erro ao carregar produtos");
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar produtos",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível buscar os produtos. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [toast]);

  const handleCreateProduct = () => {
    setEditingProductId(null);
    setModalOpen(true);
  };

  const handleEditProduct = (productId: string) => {
    setEditingProductId(productId);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingProductId(null);
  };

  const handleModalSuccess = () => {
    loadProducts(); // Recarrega produtos após criar/editar
  };

  // Função para normalizar texto (remove acentos e converte para minúscula)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Combined search and category filtering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      let results: Product[] = products || [];

      // Aplica busca client-side com matching parcial e insensível a caso/acentos
      if (searchTerm.trim()) {
        setIsSearching(true);
        const normalizedSearchTerm = normalizeText(searchTerm.trim());
        
        results = results.filter((product) => {
          const normalizedProductName = normalizeText(product.name);
          return normalizedProductName.includes(normalizedSearchTerm);
        });
        
        setIsSearching(false);
      }

      // Aplica filtro de categoria nos resultados
      if (selectedCategory !== "all") {
        results = results.filter(
          (product) => product.category === selectedCategory
        );
      }

      setFilteredProducts(results);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, products]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const ProductSkeleton = () => (
    <Card className="animate-pulse">
      <div className={`bg-gray-200 dark:bg-gray-700 rounded-t-lg ${isMobile ? 'h-40' : 'h-48'}`}></div>
      <CardContent className={`${isMobile ? 'p-2' : 'p-4'}`}>
        <div className={`bg-gray-200 dark:bg-gray-700 rounded mb-2 ${isMobile ? 'h-4' : 'h-6'}`}></div>
        <div className={`bg-gray-200 dark:bg-gray-700 rounded w-1/2 ${isMobile ? 'h-3' : 'h-4'}`}></div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-2 md:py-4 px-2 sm:px-3 md:px-6">
      <div className="text-center mb-4 md:mb-8 px-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent !leading-tight">
          Bazar Solidário
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 mt-2">
          Produtos que apoiam uma grande causa!
        </p>
      </div>

      <Card className="mb-4 md:mb-8 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:gap-4 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm sm:text-base"
              />
            </div>
            <div className="w-full md:w-64 flex-shrink-0">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="h-9 sm:h-10">
                  <Filter className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                  <SelectValue placeholder="Filtrar por categoria" />
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
            {isAdmin && (
              <Button 
                onClick={handleCreateProduct}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg h-9 sm:h-10 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                Criar Produto
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading || isSearching ? (
        // Skeleton Grid - Responsivo
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-6">
          {[...Array(isMobile ? 4 : 8)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        // Products Grid - Responsivo para mobile
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-6">
          {filteredProducts.map((product) => {
            const gradient = getCategoryGradient(product.category);
            return (
            <div key={product._id} className="group relative">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300`}></div>
              <Card
                className="relative overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0"
                style={{ zIndex: 1 }}
              >
                <div className="relative m-2 sm:m-3 w-full" style={{ paddingBottom: '100%' }}>
                  <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-2xl opacity-30`}></div>
                  <div className="absolute inset-0 overflow-hidden rounded-2xl border-2 border-transparent">
                    {isAdmin && (
                      <Button
                        size="icon"
                        className="absolute top-1 right-1 sm:top-2 sm:right-2 z-20 h-7 w-7 sm:h-9 sm:w-9 bg-white/90 hover:bg-white text-purple-600 shadow-lg"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEditProduct(product._id);
                        }}
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    )}
                    <Carousel
                      opts={{
                        loop: true,
                      }}
                      className="w-full h-full"
                    >
                      <CarouselContent className="w-full h-full">
                        {product.images.map((image, index) => (
                          <CarouselItem key={index} className="w-full h-full">
                            <div className="w-full h-full">
                              <img
                                src={image}
                                alt={`${product.name} ${index + 1}`}
                                className="w-full h-full object-cover rounded-2xl"
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {product.images.length > 1 && !isMobile && (
                        <>
                          <CarouselPrevious className="left-2" />
                          <CarouselNext className="right-2" />
                        </>
                      )}
                    </Carousel>
                  </div>
                </div>
                <Link to={`/produto/${product._id}`}>
                <CardContent className="flex-grow flex flex-col justify-between p-2 sm:p-3 md:p-4">
                  <div>
                    <div className="relative inline-block mb-1 sm:mb-2">
                      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-10 rounded-lg`}></div>
                      <div className={`relative flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border-2 border-transparent bg-gradient-to-r ${gradient} bg-clip-border`}>
                        <div className="absolute inset-0 bg-white dark:bg-gray-900 rounded-md m-[2px]"></div>
                        <span className="relative font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent text-[10px] sm:text-xs">
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white my-1 sm:my-2 line-clamp-2 text-xs sm:text-sm md:text-lg leading-tight">
                      {product.name}
                    </h3>
                  </div>
                  <span className="font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent text-sm sm:text-base md:text-xl">
                    {formatPrice(product.price)}
                  </span>
                </CardContent>
              </Link>
            </Card>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Tente ajustar os filtros de busca.
          </p>
        </div>
      )}

      {/* Modal de Criar/Editar Produto */}
      <ProductModal
        open={modalOpen}
        onClose={handleModalClose}
        productId={editingProductId}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
