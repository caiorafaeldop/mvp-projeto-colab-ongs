/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { getProducts, searchProducts, Product } from "@/api/store";
import { useToast } from "@/hooks/useToast";
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
  const { toast } = useToast();

  const categories = [
    { value: "all", label: "Todas as categorias" },
    { value: "calçados", label: "Calçados" },
    { value: "decoração", label: "Decoração" },
    { value: "roupas", label: "Roupas" },
    { value: "acessórios", label: "Acessórios" },
    { value: "outros", label: "Outros" },
  ];

  // Load products on mount
  useEffect(() => {
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
    loadProducts();
  }, [toast]);

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
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
      <CardContent className="p-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent !leading-tight">
          Bazar Solidário
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
          Produtos que apoiam uma grande causa!
        </p>
      </div>

      <Card className="mb-8 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar pelo nome do produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <div className="md:w-64">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="h-10">
                  <Filter className="w-4 h-4 mr-2" />
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
          </div>
        </CardContent>
      </Card>

      {isLoading || isSearching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              className="overflow-hidden h-full flex flex-col group cursor-pointer hover:shadow-xl transition-shadow duration-300"
              style={{ zIndex: 1 }}
            >
              <div className="relative h-60 overflow-hidden">
                <Carousel
                  opts={{
                    loop: true,
                  }}
                  className="w-full h-full"
                >
                  <CarouselContent className="w-full h-full">
                    {product.images.map((image, index) => (
                      <CarouselItem key={index} className="w-full h-full">
                        <img
                          src={image || "/placeholder-cause.jpg"}
                          alt={`${product.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {product.images.length > 1 && (
                    <>
                      <CarouselPrevious
                        className="left-2 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800"
                        style={{ pointerEvents: "auto" }}
                      />
                      <CarouselNext
                        className="right-2 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800"
                        style={{ pointerEvents: "auto" }}
                      />
                    </>
                  )}
                </Carousel>
              </div>
              <Link to={`/produto/${product._id}`} key={product._id}>
                <CardContent className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </span>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white my-2 line-clamp-2">
                      {product.name}
                    </h3>
                  </div>
                  <span className="text-xl font-bold text-pink-600">
                    {formatPrice(product.price)}
                  </span>
                </CardContent>
              </Link>
            </Card>
          ))}
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
    </div>
  );
}
