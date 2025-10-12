
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Palette, 
  Globe, 
  Shield, 
  HelpCircle,
  FileText,
  LogOut,
  Mail
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ui/theme-provider";

export function Settings() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  // const [emailNotifications, setEmailNotifications] = useState(true);
  // const [pushNotifications, setPushNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <SettingsIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Acesso Necessário
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Você precisa estar logado para acessar as configurações.
            </p>
            <Link to="/login">
              <Button>Fazer Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = user.userType === "admin";

  // Admin: ações ficam numa página dedicada. Aqui somente um atalho.

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Configurações
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Personalize sua experiência e gerencie suas preferências
          </p>
        </div>

        {/* Configurações da Conta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Configurações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" defaultValue={user.name} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" defaultValue={user.email} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" type="tel" defaultValue={user.phone || ""} />
              </div>
              
              <div className="space-y-2">
                <Label>Tipo de Conta</Label>
                <div className="pt-2">
                  <Badge variant={isAdmin ? "default" : "secondary"}>
                    {isAdmin ? "Administrador" : "Usuário Comum"}
                  </Badge>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex flex-row gap-4">
  <Button variant="outline" className="w-full md:w-auto">
    <Lock className="w-4 h-4 mr-2" />
    Alterar Senha
  </Button>

</div>
          </CardContent>
        </Card>

        {/* Preferências do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Preferências do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Tema Escuro</p>
                <p className="text-sm text-gray-500">
                  Ative o modo escuro para uma experiência mais confortável
                </p>
              </div>
              <Switch 
                checked={theme === "dark"} 
                onCheckedChange={handleThemeToggle}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Idioma</p>
                <p className="text-sm text-gray-500">
                  Selecione seu idioma preferido
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Globe className="w-4 h-4 mr-2" />
                Português (BR)
              </Button>
            </div>
          </CardContent>
        </Card>

      

        {/* Configurações Administrativas (apenas para admins) */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Configurações Administrativas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Como administrador, você pode gerenciar os Colaboradores e os Doadores em uma página dedicada.
              </p>
              <Button onClick={() => navigate("/admin")} className="w-full sm:w-auto">
                Gerenciamento
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ajuda e Suporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Ajuda e Suporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <p className="font-medium">Central de Ajuda</p>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Precisa de ajuda? Entre em contato conosco
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  nucleocolabufpb@gmail.com
                </Button>
              </div>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Termos de Uso
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Política de Privacidade
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações da Conta */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Sair da Conta
                </p>
                <p className="text-sm text-gray-500">
                  Desconecte-se de sua conta atual
                </p>
              </div>
              <Button 
                variant="outline" 
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair da Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
