import { Link, NavLink } from "react-router-dom";
import { ThemeToggle } from "./ui/theme-toggle";
import { Button } from "./ui/button";
import { User, LogOut, Settings, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const activeLinkStyle = {
  color: "var(--pink-600, #DB2777)",
  fontWeight: "600",
};

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isOrganization = user?.userType === "organization";

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/img/logoRedeFeminina.jpg"
              alt="Logo da Rede Feminina de Combate ao Câncer"
              className="h-10 w-10 object-contain rounded-full"
            />
            <span className="hidden sm:inline-block font-bold text-lg"></span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/loja"
            className="text-muted-foreground transition-colors hover:text-foreground"
            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
          >
            Bazar
          </NavLink>
          <NavLink
            to="/donations"
            className="text-muted-foreground transition-colors hover:text-foreground"
            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
          >
            Doações
          </NavLink>
          {isAuthenticated && isOrganization && (
            <NavLink
              to="/create-product"
              className="text-muted-foreground transition-colors hover:text-foreground"
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            >
              Meus Produtos
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user && (
            <span className="hidden md:inline-block text-sm font-medium text-foreground">
              Olá, {user.name.split(' ')[0]}
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
                        getUserInitials(user.name)
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
                  onClick={handleLogout}
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
        </div>
      </div>
    </header>
  );
}
