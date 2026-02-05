import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowRight, Sparkles, Users, Coins } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-light" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-300/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "-1.5s" }} />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
          <span className="text-foreground">Nền Kinh Tế</span>
          <br />
          <span className="text-gradient-ocean">
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
            <div className="p-2 rounded-lg bg-cyan-100">
              <Sparkles className="h-5 w-5 text-cyan-500" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold">14</div>
              <div className="text-xs text-muted-foreground">Platforms</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-lg bg-violet-100">
              <Users className="h-5 w-5 text-violet-500" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold">5</div>
              <div className="text-xs text-muted-foreground">Pillars of Light</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-lg bg-green-100">
              <Coins className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold">5M</div>
              <div className="text-xs text-muted-foreground">FUN/Day Cap</div>
            </div>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" variant="gradient-rainbow">
            Khám Phá Simulator
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Button size="lg" variant="gradient-ocean">
            Đọc Whitepaper
          </Button>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
