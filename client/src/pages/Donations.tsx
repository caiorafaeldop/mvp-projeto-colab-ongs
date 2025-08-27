import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, Users, Target, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { getDonationCause } from "@/api/donations";

export function Donations() {
  const [cause, setCause] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadCause();
  }, []);

  const loadCause = async () => {
    try {
      setIsLoading(true);
      const response = await getDonationCause();
      setCause(response.cause);
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Erro ao carregar informações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const calculateProgress = () => {
    if (!cause) return 0;
    return Math.min((cause.raised / cause.goal) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] p-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800">
            <Heart className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-pink-700 dark:text-pink-300">
              Faça a diferença
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            {cause?.title || "Rede Feminina de Combate Ao Câncer"}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {cause?.subtitle ||
              "Apoiando mulheres em tratamento contra o câncer com amor, cuidado e esperança"}
          </p>
        </div>

        <Card className="overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 shadow-xl">
          <div className="relative h-64 md:h-80">
            <img
              src={cause?.mainImage || "/placeholder-cause.jpg"}
              alt={cause?.title || "Casa de Apoio"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-2xl font-bold mb-2">Nossa Missão</h2>
              <p className="text-sm opacity-90">
                Oferecendo suporte integral durante o tratamento
              </p>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {cause?.description ||
                  `
                  Nossa casa de apoio oferece um ambiente acolhedor e seguro para mulheres que enfrentam o câncer.
                  Proporcionamos hospedagem, alimentação, apoio psicológico e acompanhamento durante todo o tratamento.
                  Cada doação nos ajuda a manter este espaço de esperança e cura funcionando.
                `}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center backdrop-blur-sm bg-white/70 dark:bg-gray-900/70">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {cause?.stats?.womenHelped || "150+"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Mulheres ajudadas
              </p>
            </CardContent>
          </Card>

          <Card className="text-center backdrop-blur-sm bg-white/70 dark:bg-gray-900/70">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {cause?.stats?.donors || "89"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Doadores ativos
              </p>
            </CardContent>
          </Card>

          <Card className="text-center backdrop-blur-sm bg-white/70 dark:bg-gray-900/70">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {cause?.stats?.yearsActive || "5"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Anos de atividade
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Meta de Arrecadação Mensal
            </CardTitle>
            <CardDescription>
              Ajude-nos a manter nossos serviços funcionando
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Arrecadado</span>
              <span>
                {formatCurrency(cause?.raised || 12500)} de{" "}
                {formatCurrency(cause?.goal || 25000)}
              </span>
            </div>
            <Progress value={calculateProgress()} className="h-3" />
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Math.round(calculateProgress())}% da meta alcançada
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            onClick={() => navigate("/become-donor")}
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg"
          >
            <Heart className="w-5 h-5 mr-2" />
            Tornar-se Doador
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Sua doação recorrente faz toda a diferença
          </p>
        </div>
      </div>
    </div>
  );
}
