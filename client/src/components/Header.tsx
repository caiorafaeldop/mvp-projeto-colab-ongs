import { Link, NavLink } from "react-router-dom";
import { Button } from "./ui/button";
import { User, LogOut, Settings, Package, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/useMobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

const activeLinkStyle = {
  color: "var(--pink-600, #DB2777)",
  fontWeight: "600",
};

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
  };
  // comentario
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
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/img/logoRedeFeminina.jpg"
              alt="Logo da Rede Feminina de Combate ao Câncer"
              className="h-10 w-10 object-contain rounded-full"
            />
            <span className="font-bold text-sm sm:text-xl md:text-lg text-pink-600">
              RFCC.PB
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
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
          {/* Mobile Menu Button */}
          {isMobile && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col space-y-4">
                  <SheetClose asChild>
                    <NavLink
                      to="/loja"
                      className="flex items-center p-3 text-lg font-medium text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-muted"
                      style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                      onClick={closeSheet}
                    >
                      Bazar
                    </NavLink>
                  </SheetClose>
                  <SheetClose asChild>
                    <NavLink
                      to="/donations"
                      className="flex items-center p-3 text-lg font-medium text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-muted"
                      style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                      onClick={closeSheet}
                    >
                      Doações
                    </NavLink>
                  </SheetClose>
                  {isAuthenticated && isOrganization && (
                    <SheetClose asChild>
                      <NavLink
                        to="/create-product"
                        className="flex items-center p-3 text-lg font-medium text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-muted"
                        style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                        onClick={closeSheet}
                      >
                        Meus Produtos
                      </NavLink>
                    </SheetClose>
                  )}
                  
                  {/* User Section in Mobile Menu */}
                  {isAuthenticated && user && (
                    <>
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center gap-3 p-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </div>
                      </div>
                      
                      {isOrganization && (
                        <SheetClose asChild>
                          <Link 
                            to="/create-product" 
                            className="flex items-center gap-3 p-3 text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-muted"
                            onClick={closeSheet}
                          >
                            <Package className="h-4 w-4" />
                            <span>Criar Produto</span>
                          </Link>
                        </SheetClose>
                      )}
                      
                      <SheetClose asChild>
                        <Link 
                          to="/profile" 
                          className="flex items-center gap-3 p-3 text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-muted"
                          onClick={closeSheet}
                        >
                          <User className="h-4 w-4" />
                          <span>Perfil</span>
                        </Link>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Link 
                          to="/settings" 
                          className="flex items-center gap-3 p-3 text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-muted"
                          onClick={closeSheet}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Configurações</span>
                        </Link>
                      </SheetClose>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          closeSheet();
                        }}
                        className="flex items-center gap-3 p-3 text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-muted w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sair</span>
                      </button>
                    </>
                  )}
                  
                  {!isAuthenticated && (
                    <SheetClose asChild>
                      <Link 
                        to="/login" 
                        className="flex items-center gap-3 p-3 text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-muted"
                        onClick={closeSheet}
                      >
                        <User className="h-4 w-4" />
                        <span>Login</span>
                      </Link>
                    </SheetClose>
                  )}
                </div>
              </SheetContent>
            </Sheet>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}
