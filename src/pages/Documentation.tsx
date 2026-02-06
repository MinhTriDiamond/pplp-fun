import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocsHero } from "@/components/docs/DocsHero";
import { OverviewTab } from "@/components/docs/OverviewTab";
import { MintingTab } from "@/components/docs/MintingTab";
import { PlatformsTab } from "@/components/docs/PlatformsTab";
import { ScoringTab } from "@/components/docs/ScoringTab";
import { SecurityTab } from "@/components/docs/SecurityTab";
import { ApiTab } from "@/components/docs/ApiTab";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { CONTRACT_INFO, DOCS_STATS } from "@/data/docs-data";
import { 
  BookOpen, Coins, Layers, Calculator, Shield, Code
} from "lucide-react";

const Documentation = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <DocsHero />
      
      {/* Main Content with Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full flex flex-wrap justify-center gap-1 bg-cyan-50 p-2 rounded-xl mb-8">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="minting"
              className="flex items-center gap-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
            >
              <Coins className="w-4 h-4" />
              <span className="hidden sm:inline">Minting</span>
            </TabsTrigger>
            <TabsTrigger 
              value="platforms"
              className="flex items-center gap-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Platforms</span>
            </TabsTrigger>
            <TabsTrigger 
              value="scoring"
              className="flex items-center gap-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Scoring</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security"
              className="flex items-center gap-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger 
              value="api"
              className="flex items-center gap-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-white"
            >
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">API</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          
          <TabsContent value="minting">
            <MintingTab />
          </TabsContent>
          
          <TabsContent value="platforms">
            <PlatformsTab />
          </TabsContent>
          
          <TabsContent value="scoring">
            <ScoringTab />
          </TabsContent>
          
          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>
          
          <TabsContent value="api">
            <ApiTab />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Footer */}
      <footer className="py-12 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-white/90">
                Contract: <code className="font-mono text-xs">{CONTRACT_INFO.address.slice(0, 10)}...{CONTRACT_INFO.address.slice(-8)}</code>
              </p>
              <p className="text-xs text-white/70 mt-1">
                Policy {DOCS_STATS.policyVersion} • Contract {DOCS_STATS.contractVersion}
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-white/80">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/simulator" className="hover:text-white transition-colors">Simulator</Link>
              <Link to="/contract-docs" className="hover:text-white transition-colors">Contract</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Documentation;
