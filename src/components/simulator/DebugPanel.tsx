import { useState } from "react";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import type { MintDebugBundle } from "@/lib/debug-bundle";
import { formatDebugBundle } from "@/lib/debug-bundle";

interface DebugPanelProps {
  debugBundle: MintDebugBundle | null;
  className?: string;
}

export function DebugPanel({ debugBundle, className = "" }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!debugBundle) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatDebugBundle(debugBundle));
      setCopied(true);
      toast.success("Đã copy Debug Info!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không thể copy");
    }
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <AlertTriangle className="w-3 h-3 text-amber-500" />;
    return status 
      ? <CheckCircle2 className="w-3 h-3 text-green-500" />
      : <XCircle className="w-3 h-3 text-red-500" />;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Chi tiết kỹ thuật (Debug)
          </Button>
        </CollapsibleTrigger>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-1 text-xs"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          Copy Debug Info
        </Button>
      </div>

      <CollapsibleContent className="mt-2 space-y-3">
        {/* Network */}
        <DebugSection title="Network">
          <DebugRow 
            label="Chain ID" 
            value={`${debugBundle.network.chainId} (expect: ${debugBundle.network.expectedChainId})`}
            status={debugBundle.network.isCorrect}
          />
        </DebugSection>

        {/* Contract */}
        <DebugSection title="Contract">
          <DebugRow 
            label="Address" 
            value={debugBundle.contract.address}
            mono
          />
          <DebugRow 
            label="Exists" 
            value={debugBundle.contract.exists ? "Yes" : "No"}
            status={debugBundle.contract.exists}
          />
        </DebugSection>

        {/* Wallet */}
        <DebugSection title="Wallet">
          <DebugRow 
            label="Address" 
            value={debugBundle.wallet.address}
            mono
          />
          <DebugRow 
            label="Is Attester" 
            value={debugBundle.wallet.isAttester === null ? "Unknown" : debugBundle.wallet.isAttester ? "Yes" : "No"}
            status={debugBundle.wallet.isAttester}
          />
        </DebugSection>

        {/* Action */}
        <DebugSection title="Action">
          <DebugRow 
            label="Type" 
            value={debugBundle.action.type}
          />
          <DebugRow 
            label="Hash" 
            value={debugBundle.action.hash}
            mono
          />
          <DebugRow 
            label="Registered" 
            value={debugBundle.action.isRegistered === null ? "Unknown" : debugBundle.action.isRegistered ? "Yes" : "No"}
            status={debugBundle.action.isRegistered}
          />
        </DebugSection>

        {/* PPLP Parameters */}
        <DebugSection title="PPLP Parameters">
          <DebugRow label="Recipient" value={debugBundle.pplp.recipient} mono />
          <DebugRow label="Amount (atomic)" value={debugBundle.pplp.amount} mono />
          <DebugRow label="Amount (FUN)" value={debugBundle.pplp.amountFormatted} />
          <DebugRow label="Nonce" value={debugBundle.pplp.nonce} mono />
          <DebugRow label="Deadline" value={debugBundle.pplp.deadlineFormatted} />
        </DebugSection>

        {/* EIP-712 Domain */}
        <DebugSection title="EIP-712 Domain">
          <DebugRow label="Name" value={debugBundle.domain.name as string} />
          <DebugRow 
            label="Version" 
            value={debugBundle.domain.version as string}
            highlight
          />
          <DebugRow label="Chain ID" value={String(debugBundle.domain.chainId)} mono />
          <DebugRow label="Verifying Contract" value={debugBundle.domain.verifyingContract as string} mono />
        </DebugSection>

        {/* Signature */}
        <DebugSection title="Signature Verification">
          <DebugRow 
            label="Signature" 
            value={debugBundle.signature.value ? `${debugBundle.signature.value.slice(0, 20)}...${debugBundle.signature.value.slice(-8)}` : "Not signed"} 
            mono
          />
          <DebugRow 
            label="Recovered Address" 
            value={debugBundle.signature.recoveredAddress}
            mono
          />
          <DebugRow 
            label="Expected Address" 
            value={debugBundle.signature.expectedAddress}
            mono
          />
          <DebugRow 
            label="Signature Valid" 
            value={debugBundle.signature.isValid ? "✓ Match" : "✗ Mismatch"}
            status={debugBundle.signature.isValid}
          />
        </DebugSection>

        {/* Preflight */}
        <DebugSection title="Preflight Check">
          <DebugRow 
            label="Status" 
            value={debugBundle.preflight.success ? "Success" : "Failed"}
            status={debugBundle.preflight.success}
          />
          {debugBundle.preflight.revertData && (
            <DebugRow 
              label="Revert Data" 
              value={debugBundle.preflight.revertData}
              mono
            />
          )}
          {debugBundle.preflight.decodedError && (
            <DebugRow 
              label="Decoded Error" 
              value={debugBundle.preflight.decodedError}
              highlight
            />
          )}
        </DebugSection>

        {/* Error (if any) */}
        {debugBundle.error && (
          <DebugSection title="Error Details" variant="error">
            <DebugRow label="Code" value={String(debugBundle.error.code || "N/A")} />
            <DebugRow label="Short Message" value={debugBundle.error.shortMessage || "N/A"} />
            <DebugRow label="Message" value={debugBundle.error.message || "N/A"} />
            {debugBundle.error.data && (
              <DebugRow label="Data" value={debugBundle.error.data} mono />
            )}
          </DebugSection>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Sub-components
function DebugSection({ 
  title, 
  children, 
  variant = "default" 
}: { 
  title: string; 
  children: React.ReactNode; 
  variant?: "default" | "error";
}) {
  return (
    <div className={`p-2 rounded-lg border ${
      variant === "error" 
        ? "bg-red-50 border-red-200" 
        : "bg-muted/30 border-border/50"
    }`}>
      <div className="text-xs font-semibold text-muted-foreground mb-1">
        {title}
      </div>
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
}

function DebugRow({ 
  label, 
  value, 
  mono = false, 
  status, 
  highlight = false 
}: { 
  label: string; 
  value: string; 
  mono?: boolean;
  status?: boolean | null;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-muted-foreground shrink-0 w-28">{label}:</span>
      <span className={`flex-1 break-all ${mono ? "font-mono" : ""} ${highlight ? "text-amber-600 font-semibold" : ""}`}>
        {value}
      </span>
      {status !== undefined && (
        <span className="shrink-0">
          {status === null ? (
            <Badge variant="outline" className="text-xs px-1">?</Badge>
          ) : status ? (
            <Badge className="bg-green-100 text-green-700 text-xs px-1">✓</Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700 text-xs px-1">✗</Badge>
          )}
        </span>
      )}
    </div>
  );
}
