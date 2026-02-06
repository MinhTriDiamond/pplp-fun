import { DOCS_STATS, CONTRACT_INFO } from "@/data/docs-data";
import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, Cpu, Layers, Coins } from "lucide-react";
import { Link } from "react-router-dom";

export function DocsHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-cyan-100 to-sky-100" />
      <div className="absolute top-20 left-1/4 w-64 h-64 bg-cyan-300/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-sky-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "-2s" }} />
      
      {/* Header Navigation */}
      <nav className="relative z-20 bg-white/80 backdrop-blur-lg border-b border-cyan-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-cyan-600 transition-colors">
              Home
            </Link>
            <Link to="/simulator" className="text-sm text-muted-foreground hover:text-cyan-600 transition-colors">
              Simulator
            </Link>
            <Link to="/contract-docs" className="text-sm text-muted-foreground hover:text-cyan-600 transition-colors">
              Contract
            </Link>
          </div>
          
          <Button 
            size="sm" 
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
            asChild
          >
            <a href={CONTRACT_INFO.bscscanUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-1" />
              BSCScan
            </a>
          </Button>
        </div>
      </nav>
      
      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 text-center">
        <Badge className="mb-4 bg-cyan-100 text-cyan-700 border-cyan-300">
          Policy {DOCS_STATS.policyVersion} • Contract {DOCS_STATS.contractVersion}
        </Badge>
        
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          <span className="text-gradient-ocean">PPLP</span>
          {" "}Documentation
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Proof of Pure Love Protocol — Tài liệu kỹ thuật tổng hợp về 
          Nền Kinh Tế Ánh Sáng 5D và hệ thống FUN Money
        </p>
        
        {/* Stats Grid */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-cyan-200 shadow-sm">
            <div className="p-2 rounded-lg bg-cyan-100">
              <Layers className="w-5 h-5 text-cyan-600" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-foreground">{DOCS_STATS.platforms}</div>
              <div className="text-xs text-muted-foreground">Platforms</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-cyan-200 shadow-sm">
            <div className="p-2 rounded-lg bg-violet-100">
              <BookOpen className="w-5 h-5 text-violet-600" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-foreground">{DOCS_STATS.pillars}</div>
              <div className="text-xs text-muted-foreground">Pillars</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-cyan-200 shadow-sm">
            <div className="p-2 rounded-lg bg-green-100">
              <Cpu className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-foreground">{DOCS_STATS.actions}+</div>
              <div className="text-xs text-muted-foreground">Actions</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-cyan-200 shadow-sm">
            <div className="p-2 rounded-lg bg-amber-100">
              <Coins className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-foreground">{DOCS_STATS.dailyCap}</div>
              <div className="text-xs text-muted-foreground">Daily Cap</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
