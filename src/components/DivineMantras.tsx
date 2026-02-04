import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDivineMantras } from "@/lib/pplp-engine";

export function DivineMantras() {
  const mantras = getDivineMantras();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mantras.length);
  };
  
  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + mantras.length) % mantras.length);
  };
  
  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Decorative elements */}
      <div className="absolute -top-4 -left-4 w-8 h-8 text-gold opacity-30">
        <Quote className="w-full h-full" />
      </div>
      <div className="absolute -bottom-4 -right-4 w-8 h-8 text-gold opacity-30 rotate-180">
        <Quote className="w-full h-full" />
      </div>
      
      {/* Mantra display */}
      <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-elegant">
        <div className="min-h-[100px] flex items-center justify-center">
          <p className="mantra-text text-center text-xl md:text-2xl leading-relaxed">
            {mantras[currentIndex]}
          </p>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrev}
            className="rounded-full hover:bg-gold/10 hover:text-gold"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          {/* Dots indicator */}
          <div className="flex gap-2">
            {mantras.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? "bg-primary w-6" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="rounded-full hover:bg-gold/10 hover:text-gold"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Mantra number */}
        <div className="absolute top-4 right-4 text-xs text-muted-foreground">
          {currentIndex + 1} / {mantras.length}
        </div>
      </div>
    </div>
  );
}
