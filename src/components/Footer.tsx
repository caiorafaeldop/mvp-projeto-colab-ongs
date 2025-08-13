import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex h-16 items-center justify-center">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {currentYear} Rede Feminina de Combate ao Câncer.
          <br className="sm:hidden" /> 
          Feito com <Heart className="inline-block h-4 w-4 text-pink-500 align-middle" /> por nossa equipe.
        </p>
      </div>
    </footer>
  );
}