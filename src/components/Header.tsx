import { Link, NavLink } from "react-router-dom";
import { ThemeToggle } from "./ui/theme-toggle";
import { Button } from "./ui/button";
import { User } from "lucide-react"; 
const activeLinkStyle = {
  color: 'var(--pink-600, #DB2777)',
  fontWeight: '600',
};

export function Header() {
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
            <span className="hidden sm:inline-block font-bold text-lg">
              
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink 
            to="/loja" 
            className="text-muted-foreground transition-colors hover:text-foreground"
            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
          >
            Loja
          </NavLink>
          <NavLink 
            to="/donations" 
            className="text-muted-foreground transition-colors hover:text-foreground"
            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
          >
            Doações
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/login">
              <User className="h-5 w-5" />
              <span className="sr-only">Login</span>
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}