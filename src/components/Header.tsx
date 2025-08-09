import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    console.log("Navigating to home page");
    navigate("/");
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-6">
          <nav className="flex items-center space-x-6">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Login
            </Button>
            <div
              className="text-xl font-bold cursor-pointer hover:text-pink-500 transition-colors duration-200"
              onClick={handleHomeClick}
            >
              Home
            </div>
            <Button variant="ghost" onClick={() => navigate("/marketplace")}>
              Marketplace
            </Button>
            <Button variant="ghost" onClick={() => navigate("/donations")}>
              Doações
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
