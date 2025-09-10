import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowRight, Heart, ShoppingCart, Gem } from "lucide-react";

export function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 pt-10 md:pt-7 bg-gray-50">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="flex justify-center">
          <img
            src="/img/redeFemininaCapa.jpg"
            alt="Rede Feminina de Combate ao Câncer"
            className="w-3/4 md:w-1/2 max-h-96 object-cover rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent !leading-tight">
            Rede Feminina de Combate <br /> ao Câncer
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Acolhemos pessoas com câncer em tratamento no Hospital Laureano (João Pessoa, PB), assim como seus familiares, oferecendo serviços de apoio assistencial, proteção, enfrentamento e fortalecimento, com o objetivo de promover a melhoria da qualidade de vida.
          </p>
        </div>

        <Card className="shadow-2xl border-none bg-white rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl md:text-3xl font-semibold flex items-center justify-center gap-3">
              <ShoppingCart className="w-7 h-7 text-pink-600" />
              Nossa Loja Solidária
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Produtos feitos com carinho, para uma causa nobre.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-10">
            <Button
              asChild
              className="group relative px-12 py-6 text-lg font-semibold text-white bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <Link to="/loja" className="flex items-center">
                Ver Produtos
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center transition-all duration-300 bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-pink-500 to-pink-700 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Compra com Causa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                100% do arrecadado é revertido para apoiar as atividades da RFCC.PB.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center transition-all duration-300 bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-pink-500 to-pink-700 rounded-lg flex items-center justify-center mb-4">
                <Gem className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Produtos Especiais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                Calçados para oferecer conforto e estilo.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center transition-all duration-300 bg-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-pink-500 to-pink-700 rounded-lg flex items-center justify-center mb-4">
                <ArrowRight className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Impacto Direto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                Sua doação e compra se transforma em apoio, esperança e cuidado para muitas pessoas.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
