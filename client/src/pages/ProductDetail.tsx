// src/pages/ProductDetail.tsx (VERSÃO CORRIGIDA E COMPLETA)

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/useToast";
import { getProductById, getWhatsAppLink, Product } from "@/api/store";
import { ArrowLeft, Heart, Share2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export function ProductDetail() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const response = await getProductById(id);
        if (response.success && response.product) {
          setProduct(response.product);
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
      // You can replace this with a real phone number or get it from user settings
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
