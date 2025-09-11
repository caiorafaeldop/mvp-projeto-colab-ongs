import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, User, Settings, ShoppingCart, Heart, Package, Instagram, MessageCircle, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/useMobile";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const isMobile = useIsMobile();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isOrganization = user?.userType === "organization";

  return (
    <header className="fixed top-0 z-50 w-full bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto flex h-20 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-4">
            <div className="relative">
              <img
                src="/img/logo_rfcc.jpg"
                alt="Logo da Rede Feminina de Combate ao Câncer"
                className="h-14 w-14 object-cover rounded-full border-3 border-pink-100 shadow-lg transition-transform hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-pink-600 leading-tight">
                RFCC.PB
              </span>
              <span className="text-sm text-pink-600 font-medium hidden md:block">
                Rede Feminina de Combate ao Câncer
              </span>
            </div>
          </Link>

          {/* Social Media Icons - Desktop and Mobile */}
          <div className="flex items-center gap-2 ml-8">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-pink-600 hover:text-pink-700 hover:bg-pink-50"
              asChild
            >
              <a href="https://www.instagram.com/redefemininajpa/" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </a>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              asChild
            >
              <a href="https://api.whatsapp.com/send?phone=558332415373&text=Rede+Feminina+&fbclid=PAZXh0bgNhZW0CMTEAAaeqbKcY131CVjGNS4pxBdk2hCnkmILMCOobBAfbgv0rHmhtH13F0tyO5OhKng_aem_wcJSEVgTkEEvoAKNXSIVRA" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                <span className="sr-only">WhatsApp</span>
              </a>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              asChild
            >
              <a href="mailto:nucleocolabufpb@gmail.com">
                <Mail className="h-4 w-4" />
                <span className="sr-only">Email</span>
              </a>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/"
              className="text-gray-700 font-medium transition-all duration-200 hover:text-pink-600 hover:scale-105 px-3 py-2 rounded-lg hover:bg-pink-50"
              style={({ isActive }) =>
                isActive
                  ? { color: "#DB2777", backgroundColor: "#FDF2F8", fontWeight: "600" }
                  : undefined
              }
            >
              Sobre Nós
            </NavLink>
            <NavLink
              to="/loja"
              className="text-gray-700 font-medium transition-all duration-200 hover:text-pink-600 hover:scale-105 px-3 py-2 rounded-lg hover:bg-pink-50"
              style={({ isActive }) => (isActive ? { color: "#DB2777", backgroundColor: "#FDF2F8", fontWeight: "600" } : undefined)}
            >
              Bazar Solidário
            </NavLink>
            <Button
              asChild
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-full font-medium transition-all duration-200"
            >
              <Link to="/donations">
                Faça uma doação
              </Link>
            </Button>
            {isAuthenticated && isOrganization && (
              <NavLink
                to="/create-product"
                className="text-gray-700 font-medium transition-all duration-200 hover:text-pink-600 hover:scale-105 px-3 py-2 rounded-lg hover:bg-pink-50"
                style={({ isActive }) => (isActive ? { color: "#DB2777", backgroundColor: "#FDF2F8", fontWeight: "600" } : undefined)}
              >
                Meus Produtos
              </NavLink>
            )}
          </nav>
          {/* Mobile Menu Button */}
          {isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => {
                    const aboutSection = document.getElementById('about-section');
                    if (aboutSection) {
                      aboutSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="flex items-center"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Sobre Nós
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/loja" className="flex items-center">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Bazar Solidário
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/donations" className="flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Faça uma doação
                  </Link>
                </DropdownMenuItem>
                {isAuthenticated && isOrganization && (
                  <DropdownMenuItem asChild>
                    <Link to="/create-product" className="flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Meus Produtos
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="https://www.instagram.com/redefemininajpa/" target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="https://api.whatsapp.com/send?phone=558332415373&text=Rede+Feminina+&fbclid=PAZXh0bgNhZW0CMTEAAaeqbKcY131CVjGNS4pxBdk2hCnkmILMCOobBAfbgv0rHmhtH13F0tyO5OhKng_aem_wcJSEVgTkEEvoAKNXSIVRA" target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="mailto:nucleocolabufpb@gmail.com" className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {user?.name}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/login" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Entrar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/register" className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Cadastrar
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Desktop User Info and Menu */}
          {!isMobile && (
            <>
              {isAuthenticated && user && (
                <span className="hidden md:inline-block text-sm font-medium text-foreground">
                  Olá, {user.name.split(" ")[0]}
                </span>
              )}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user ? (
                            getInitials(user.name)
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isOrganization && (
                      <DropdownMenuItem asChild>
                        <Link to="/create-product" className="cursor-pointer">
                          <Package className="mr-2 h-4 w-4" />
                          <span>Criar Produto</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configurações</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/login">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Login</span>
                  </Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
