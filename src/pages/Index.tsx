import { Link } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { PlatformsSection } from "@/components/PlatformsSection";
import { PillarsSection } from "@/components/PillarsSection";
import { MantrasSection } from "@/components/MantrasSection";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="sm" />
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#platforms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Platforms
            </a>
            <a href="#pillars" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              5 Pillars
            </a>
            <a href="#mantras" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Mantras
            </a>
            <Link to="/documentation" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </Link>
          </div>
          
          <Button size="sm" variant="gradient-rainbow">
            Launch Simulator
          </Button>
        </div>
      </nav>
      
      {/* Hero */}
      <HeroSection />
      
      {/* Platforms */}
      <div id="platforms">
        <PlatformsSection />
      </div>
      
      {/* Pillars */}
      <div id="pillars">
        <PillarsSection />
      </div>
      
      {/* Mantras */}
      <div id="mantras">
        <MantrasSection />
      </div>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-ocean text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Sẵn sàng tham gia Nền Kinh Tế Ánh Sáng?
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8">
            Khám phá PPLP Simulator để hiểu cách hệ thống tính điểm và phân phối FUN Money.
          </p>
          <Button size="lg" variant="gradient-rainbow">
            Bắt đầu ngay
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
            </div>
            
            <p className="text-sm text-white/80">
              © 2026 FUN Ecosystem. Nền Kinh Tế Ánh Sáng 5D.
            </p>
            
            <div className="flex items-center gap-4 text-sm text-white/80">
              <Link to="/documentation" className="hover:text-white transition-colors">Documentation</Link>
              <Link to="/simulator" className="hover:text-white transition-colors">Simulator</Link>
              <Link to="/contract-docs" className="hover:text-white transition-colors">Contract Docs</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
