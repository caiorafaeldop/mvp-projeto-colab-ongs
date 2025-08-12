import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, ArrowRight, Heart, Users, Building2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { handleButtonClick } from "@/api/home";

export function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePinkButtonClick = async () => {
    console.log("Pink button clicked - starting interaction");
    setIsLoading(true);

    try {
      const response = await handleButtonClick({ action: "pink_button_click" });
      console.log("Button click response:", response);

      toast({
        title: "Success!",
        description: "Pink button clicked successfully!",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error handling button click:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800">
            <Building2 className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-pink-700 dark:text-pink-300">
              Plataforma para ONGs
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Rede Feminina de Combate ao Câncer
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Somos uma plataforma voltada para divulgar produtos e doações de
            projetos sem fins lucrativos. Conectamos ONGs com pessoas que querem
            fazer a diferença, começando com a Casa de Apoio às Mulheres com
            Câncer e expandindo para outras organizações que transformam vidas.
          </p>
        </div>

        {/* Main Card */}
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-white/20 shadow-xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl font-semibold flex items-center justify-center gap-2">
              <Heart className="w-6 h-6 text-pink-500" />
              Faça Parte da Mudança
            </CardTitle>
            <CardDescription className="text-base">
              Explore nossa plataforma e descubra como você pode contribuir com
              causas importantes
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center space-y-8 pb-12">
            {/* Main Pink Button */}
            <Button
              onClick={handlePinkButtonClick}
              disabled={isLoading}
              className="group relative px-8 py-6 text-lg font-semibold text-white bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 active:from-pink-600 active:to-pink-800 border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 min-w-[200px]"
            >
              <div className="flex items-center gap-3">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 group-hover:animate-pulse" />
                    Conectar Agora!
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-300/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>

            {/* Additional Info */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Nossa plataforma oferece:
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full">
                  Marketplace Solidário
                </span>
                <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full">
                  Sistema de Doações
                </span>
                <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full">
                  Transparência Total
                </span>
                <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full">
                  Impacto Real
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-white/20 hover:bg-white/70 dark:hover:bg-gray-900/70 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">ONGs Verificadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Trabalhamos apenas com organizações verificadas e transparentes
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-white/20 hover:bg-white/70 dark:hover:bg-gray-900/70 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">Causas Importantes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Apoiamos causas que realmente fazem a diferença na sociedade
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-white/20 hover:bg-white/70 dark:hover:bg-gray-900/70 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">Comunidade Ativa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Conectamos doadores, voluntários e organizações em uma só
                plataforma
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
