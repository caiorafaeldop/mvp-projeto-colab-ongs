import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Heart, ShoppingCart, Gem } from "lucide-react";

export function Home() {
  return (
    <div className="flex items-center justify-center p-4 pt-16 md:pt-24">
      <div className="w-full max-w-5xl mx-auto">
        
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent !leading-tight">
            Rede Feminina de Combate ao Câncer
          </h1>

          <p className="text-lg md:text-xl text-foreground max-w-3xl mx-auto leading-relaxed">
            Somos uma plataforma voltada para divulgar produtos e doações de
            projetos sem fins lucrativos. Conectamos ONGs com pessoas que querem
            fazer a diferença, começando com a Casa de Apoio às Mulheres com
            Câncer e expandindo para outras organizações que transformam vidas.
          </p>

        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl font-semibold flex items-center justify-center gap-2">
              <ShoppingCart className="w-6 h-6 text-pink-500" />
              Nossa Loja Solidária
            </CardTitle>
            <CardDescription className="text-base">
              Produtos feitos com carinho, para uma causa nobre.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center space-y-8 pb-12">
            <Button
              asChild
              className="group relative px-10 py-7 text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 active:from-pink-700 active:to-purple-800 border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <Link to="/loja">
                Ver Produtos
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="text-center transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-card-foreground">Compra com Causa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                100% do lucro é revertido para apoiar as atividades da Rede Feminina.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <Gem className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-card-foreground">Produtos Especiais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Calçados para oferecer conforto e estilo.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-card-foreground">Impacto Direto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sua doação e compra se transforma em apoio, esperança e cuidado para muitas mulheres.
              </p>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}