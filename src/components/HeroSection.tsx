import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowRight, Sparkles, Users, Coins } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-light" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
          <span className="text-foreground">Nền Kinh Tế</span>
          <br />
          <span className="bg-gradient-spiritual bg-clip-text text-transparent">
            Ánh Sáng 5D
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Proof of Pure Love Protocol — Giao thức chứng minh đóng góp Ánh Sáng, 
          tạo giá trị thật, và phân phối FUN Money công bằng cho cộng đồng Hợp Nhất.
        </p>
        
        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          <div className="flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-lg bg-gold/10">
              <Sparkles className="h-5 w-5 text-gold" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold">14</div>
              <div className="text-xs text-muted-foreground">Platforms</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-lg bg-purple/10">
              <Users className="h-5 w-5 text-purple" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold">5</div>
              <div className="text-xs text-muted-foreground">Pillars of Light</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-lg bg-earth/10">
              <Coins className="h-5 w-5 text-earth" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold">5M</div>
              <div className="text-xs text-muted-foreground">FUN/Day Cap</div>
            </div>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="bg-gradient-spiritual hover:opacity-90 text-white shadow-gold">
            Khám Phá Simulator
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/5">
            Đọc Whitepaper
          </Button>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
