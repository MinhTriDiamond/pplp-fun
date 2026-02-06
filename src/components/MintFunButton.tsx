import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles } from "lucide-react";
import { MintOptionsModal } from "@/components/MintOptionsModal";

interface MintFunButtonProps {
  size?: "sm" | "default" | "lg" | "xl";
  className?: string;
}

export function MintFunButton({ size = "lg", className = "" }: MintFunButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    default: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-12 py-6 text-2xl"
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className={`
          ${sizeClasses[size]}
          font-bold
          bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500
          hover:from-amber-500 hover:via-yellow-600 hover:to-orange-600
          text-white
          shadow-2xl shadow-yellow-500/30
          hover:shadow-yellow-500/50
          hover:scale-105
          transition-all duration-300
          animate-pulse-glow
          border-0
          ${className}
        `}
      >
        <Coins className="mr-2 h-5 w-5" />
        MINT FUN MONEY
        <Sparkles className="ml-2 h-5 w-5" />
      </Button>
      
      <MintOptionsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
