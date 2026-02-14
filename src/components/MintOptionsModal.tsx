import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Gamepad2, 
  Link2, 
  BookOpen, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface MintOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TESTNET_INFO = {
  network: "BNB Smart Chain Testnet",
  chainId: 97,
  rpc: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  explorer: "https://testnet.bscscan.com",
  faucet: "https://testnet.bnbchain.org/faucet-smart"
};

export function MintOptionsModal({ isOpen, onClose }: MintOptionsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-white border-amber-200 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-xl sm:text-2xl">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-gradient-rainbow">MINT FUN MONEY</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </DialogTitle>
          <p className="text-center text-cyan-600 mt-1 text-sm">
            Chọn phương thức để trải nghiệm mint FUN Money
          </p>
        </DialogHeader>
        
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          {/* Simulator Option */}
          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-cyan-200 bg-gradient-to-b from-cyan-50 to-white cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="inline-flex rounded-full p-3 bg-cyan-100 mb-3 group-hover:bg-cyan-200 transition-colors">
                <Gamepad2 className="h-6 w-6 text-cyan-600" />
              </div>
              
              <h3 className="font-display text-base font-bold text-cyan-700 mb-1">
                🎮 SIMULATOR
              </h3>
              
              <p className="text-xs text-cyan-600/80 mb-3">
                Demo tính toán FUN Money offline, không cần ví crypto
              </p>
              
              <ul className="text-xs text-left text-cyan-600/70 mb-3 space-y-0.5 hidden sm:block">
                <li>✓ Chọn Platform & Action</li>
                <li>✓ Điều chỉnh 5 Trụ Cột</li>
                <li>✓ Xem Mint Preview</li>
                <li>✓ Miễn phí 100%</li>
              </ul>
              <Link to="/simulator" onClick={onClose}>
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                  Thử Ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Testnet Option */}
          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-amber-200 bg-gradient-to-b from-amber-50 to-white cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="inline-flex rounded-full p-3 bg-amber-100 mb-3 group-hover:bg-amber-200 transition-colors">
                <Link2 className="h-6 w-6 text-amber-600" />
              </div>
              
              <h3 className="font-display text-base font-bold text-amber-700 mb-1">
                🔗 TESTNET
              </h3>
              
              <p className="text-xs text-amber-600/80 mb-3">
                Mint FUN thật trên BSC Testnet với ví MetaMask
              </p>
              
              <ul className="text-xs text-left text-amber-600/70 mb-3 space-y-0.5 hidden sm:block">
                <li>✓ Chain ID: {TESTNET_INFO.chainId}</li>
                <li>✓ Lấy tBNB miễn phí</li>
                <li>✓ Deploy & Test Contract</li>
                <li>✓ Verify trên BSCScan</li>
              </ul>
              <a 
                href={TESTNET_INFO.faucet} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                  Lấy tBNB
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
          
          {/* Documentation Option */}
          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-violet-200 bg-gradient-to-b from-violet-50 to-white cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="inline-flex rounded-full p-3 bg-violet-100 mb-3 group-hover:bg-violet-200 transition-colors">
                <BookOpen className="h-6 w-6 text-violet-600" />
              </div>
              
              <h3 className="font-display text-base font-bold text-violet-700 mb-1">
                📖 HƯỚNG DẪN
              </h3>
              
              <p className="text-xs text-violet-600/80 mb-3">
                Chi tiết cách deploy và mint FUN Money trên blockchain
              </p>
              
              <ul className="text-xs text-left text-violet-600/70 mb-3 space-y-0.5 hidden sm:block">
                <li>✓ Cài MetaMask</li>
                <li>✓ Deploy bằng Remix</li>
                <li>✓ Verify Contract</li>
                <li>✓ Test Functions</li>
              </ul>
              <Link to="/contract-docs" onClick={onClose}>
                <Button className="w-full bg-violet-500 hover:bg-violet-600 text-white">
                  Đọc Guide
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        {/* Testnet Info */}
        <div className="mt-4 p-3 bg-gradient-to-r from-cyan-50 via-amber-50 to-violet-50 rounded-xl border border-amber-100 hidden sm:block">
          <h4 className="font-semibold text-amber-700 mb-2 text-center text-sm">
            📋 Thông Tin BSC Testnet
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="text-center p-2 bg-white/80 rounded-lg">
              <div className="text-cyan-600/70">Network</div>
              <div className="font-mono text-cyan-700">BSC Testnet</div>
            </div>
            <div className="text-center p-2 bg-white/80 rounded-lg">
              <div className="text-cyan-600/70">Chain ID</div>
              <div className="font-mono text-cyan-700">{TESTNET_INFO.chainId}</div>
            </div>
            <div className="text-center p-2 bg-white/80 rounded-lg">
              <div className="text-cyan-600/70">Symbol</div>
              <div className="font-mono text-cyan-700">tBNB</div>
            </div>
            <div className="text-center p-2 bg-white/80 rounded-lg">
              <a 
                href={TESTNET_INFO.explorer} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-600 hover:text-amber-700 flex items-center justify-center gap-1"
              >
                BSCScan <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
