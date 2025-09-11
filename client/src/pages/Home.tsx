import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowRight, Heart, ShoppingCart, Users, Target, Phone, MapPin, Mail, Clock } from "lucide-react";

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative pt-2 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 items-center">
            {/* Image - First on mobile, second on desktop */}
            <div className="relative order-1 lg:order-2">
              <div className="relative z-10">
                <img
                  src="/img/redeFemininaCapa.jpg"
                  alt="Rede Feminina de Combate ao Câncer"
                  className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 rounded-2xl -z-10"></div>
            </div>
            
            {/* Text Content - Second on mobile, first on desktop */}
            <div className="space-y-8 order-2 lg:order-1 text-center lg:text-left">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-sm font-medium">
                  <Heart className="w-4 h-4" />
                  Desde 1963 fazendo a diferença 
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent !leading-tight">
                  Rede Feminina de 
                  <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent"> Combate ao Câncer</span>
                </h1>
                
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Acolhemos pessoas com câncer em tratamento no Hospital Laureano (João Pessoa, PB), 
                  oferecendo apoio assistencial, proteção e fortalecimento para promover a melhoria da qualidade de vida.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link to="/donations" className="flex items-center justify-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Fazer Doação
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-pink-600 text-pink-600 hover:bg-pink-50 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                >
                  <Link to="/loja" className="flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Bazar Solidário
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4">
              Nosso Impacto
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Há mais de 60 anos transformando vidas e oferecendo esperança
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200">
              <div className="w-16 h-16 mx-auto bg-pink-600 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-pink-600 mb-2">1000+</h3>
              <p className="text-gray-700 font-medium">Pessoas Atendidas</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="w-16 h-16 mx-auto bg-purple-600 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-purple-600 mb-2">60+</h3>
              <p className="text-gray-700 font-medium">Anos de Dedicação</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-blue-600 mb-2">24h</h3>
              <p className="text-gray-700 font-medium">Apoio Disponível</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4">
              Como Você Pode Ajudar
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Existem várias formas de contribuir com nossa causa e fazer a diferença na vida de quem precisa
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-pink-100">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                  <ShoppingCart className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Bazar Solidário
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Produtos feitos com carinho, 100% da renda revertida para nossa causa
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  asChild
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 text-lg font-semibold rounded-xl transition-all duration-300"
                >
                  <Link to="/loja" className="flex items-center justify-center">
                    Ver Produtos
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-purple-100">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Doações
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Contribua diretamente para manter nossos serviços funcionando
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  asChild
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold rounded-xl transition-all duration-300"
                >
                  <Link to="/donations" className="flex items-center justify-center">
                    Fazer Doação
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section id="about-section" className="py-16 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4">
              Rede Feminina de Combate ao Câncer
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Somos uma Organização não Governamental (ONG), sem fins lucrativos, criada em 1962 que presta serviço de assistência e apoio aos pacientes portadores de câncer em tratamento no Hospital Napoleão Laureano.
            </p>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto mt-4 leading-relaxed">
              Tudo isso é possível graças a nossa equipe de voluntariados composta de aproximadamente 200 pessoas (voluntários efetivos) e também por meio da sociedade civil (voluntários colaboradores), que contribui através de doações de natureza variada.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 mx-auto bg-pink-600 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Telefone</h3>
              <p className="text-gray-600 font-medium">☆️ (083) 3241-5373</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 mx-auto bg-pink-600 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Endereço</h3>
              <p className="text-gray-600 font-medium">📍 Av. Doze de Outubro, 858 - Jaguaribe, João Pessoa</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 mx-auto bg-pink-600 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Horário</h3>
              <div className="text-gray-600 text-sm space-y-1">
                <p>Segunda a quinta: 8h às 17h</p>
                <p>Sexta: 7h às 12:30h</p>
                <p>Sábados e domingos: fechado</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      {/* <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4">
              Entre em Contato
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Estamos aqui para ajudar. Entre em contato conosco para mais informações
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
              <div className="w-12 h-12 mx-auto bg-pink-600 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Telefone</h3>
              <p className="text-gray-600">(83) 3216-7200</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
              <div className="w-12 h-12 mx-auto bg-pink-600 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">contato@rfcc.org.br</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
              <div className="w-12 h-12 mx-auto bg-pink-600 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Endereço</h3>
              <p className="text-gray-600">João Pessoa, PB</p>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
