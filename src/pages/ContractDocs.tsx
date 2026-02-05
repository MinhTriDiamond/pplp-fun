import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, BookOpen, Zap, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { FunctionCard } from "@/components/contract/FunctionCard";
import { readFunctions, writeFunctions, CONTRACT_ADDRESS, BSCSCAN_URL } from "@/data/contract-functions";

const ContractDocs = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Trang chủ
              </Button>
            </Link>
            <Logo size="sm" />
          </div>
          
          <a 
            href={BSCSCAN_URL} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              BSCScan
            </Button>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-cyan-50/50 via-white to-violet-50/50">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-cyan-500" />
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gradient-ocean">
              FUN Money Contract Documentation
            </h1>
          </div>
          
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Tài liệu chi tiết về 32 functions của FUN Money Smart Contract trên BSC Testnet. 
            Giải thích dễ hiểu bằng tiếng Việt cho cả người không chuyên.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge variant="outline" className="px-3 py-1 text-sm font-mono">
              📍 {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
            </Badge>
            <Badge className="bg-green-100 text-green-700 border-0">
              <Eye className="w-3 h-3 mr-1" />
              20 Read Functions
            </Badge>
            <Badge className="bg-orange-100 text-orange-700 border-0">
              <Zap className="w-3 h-3 mr-1" />
              12 Write Functions
            </Badge>
          </div>
        </div>
      </section>

      {/* Functions Tabs */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="read" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="read" className="gap-2">
                <Eye className="w-4 h-4" />
                Read ({readFunctions.length})
              </TabsTrigger>
              <TabsTrigger value="write" className="gap-2">
                <Zap className="w-4 h-4" />
                Write ({writeFunctions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="read" className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Read Contract Functions
                </h2>
                <p className="text-muted-foreground text-sm">
                  Các hàm chỉ đọc dữ liệu, không tốn gas, không thay đổi state blockchain
                </p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {readFunctions.map((func) => (
                  <FunctionCard key={func.name} func={func} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="write" className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Write Contract Functions
                </h2>
                <p className="text-muted-foreground text-sm">
                  Các hàm thay đổi state blockchain, yêu cầu gas và chữ ký từ ví
                </p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {writeFunctions.map((func) => (
                  <FunctionCard key={func.name} func={func} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Token Lifecycle Diagram */}
      <section className="py-12 bg-gradient-to-r from-cyan-50 via-violet-50 to-pink-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-gradient-rainbow">
            Token Lifecycle Flow
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm border border-violet-100 w-full md:w-auto">
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-violet-600">1</span>
                </div>
                <h3 className="font-semibold text-violet-700">LOCKED</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  lockWithPPLP()
                </p>
                <p className="text-xs text-muted-foreground">
                  Token mới mint
                </p>
              </div>

              <div className="text-2xl text-muted-foreground hidden md:block">→</div>
              <div className="text-2xl text-muted-foreground md:hidden">↓</div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm border border-cyan-100 w-full md:w-auto">
                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-cyan-600">2</span>
                </div>
                <h3 className="font-semibold text-cyan-700">ACTIVATED</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  activate()
                </p>
                <p className="text-xs text-muted-foreground">
                  Sẵn sàng claim
                </p>
              </div>

              <div className="text-2xl text-muted-foreground hidden md:block">→</div>
              <div className="text-2xl text-muted-foreground md:hidden">↓</div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm border border-green-100 w-full md:w-auto">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-green-600">3</span>
                </div>
                <h3 className="font-semibold text-green-700">FLOWING</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  claim()
                </p>
                <p className="text-xs text-muted-foreground">
                  Chuyển tự do
                </p>
              </div>

              <div className="text-2xl text-muted-foreground hidden md:block">→</div>
              <div className="text-2xl text-muted-foreground md:hidden">↓</div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm border border-pink-100 w-full md:w-auto">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-pink-600">♻️</span>
                </div>
                <h3 className="font-semibold text-pink-700">RECYCLED</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  30 ngày inactive
                </p>
                <p className="text-xs text-muted-foreground">
                  Về Community Pool
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-white/80">
            FUN Money Smart Contract v1.3.0 • BSC Testnet • {new Date().getFullYear()}
          </p>
          <a 
            href={BSCSCAN_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-white hover:text-white/90 underline mt-2 inline-block"
          >
            Xem source code trên BSCScan →
          </a>
        </div>
      </footer>
    </div>
  );
};

export default ContractDocs;
