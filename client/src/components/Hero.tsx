import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  name?: string;
  title?: string;
  description?: string;
}

export default function Hero({ 
  name = "Your Name",
  title = "Creative Developer & Designer",
  description = "Crafting beautiful digital experiences with modern technologies"
}: HeroProps) {
  const scrollToPortfolio = () => {
    const element = document.querySelector("#portfolio");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-8" data-testid="section-hero">
      <div className="max-w-5xl mx-auto text-center space-y-8 py-20">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold text-foreground text-glow animate-float" data-testid="text-hero-name">
            {name}
          </h1>
          <p className="text-2xl md:text-3xl text-primary font-semibold" data-testid="text-hero-title">
            {title}
          </p>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-description">
            {description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Button 
            size="lg" 
            className="glow-effect-sm"
            onClick={scrollToPortfolio}
            data-testid="button-view-work"
          >
            View My Work
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => {
              const element = document.querySelector("#contact");
              if (element) element.scrollIntoView({ behavior: "smooth" });
            }}
            data-testid="button-get-in-touch"
          >
            Get In Touch
          </Button>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <button 
            onClick={scrollToPortfolio}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-scroll-indicator"
          >
            <ChevronDown className="h-8 w-8 animate-pulse-glow" />
          </button>
        </div>
      </div>
    </section>
  );
}
