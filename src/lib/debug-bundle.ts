import type { TypedDataDomain } from "ethers";

/**
 * Debug Bundle - Collects all mint parameters for troubleshooting
 * Updated for Smart Contract v1.2.1 PureLoveProof structure
 */
export interface MintDebugBundle {
  // Timestamp
  timestamp: string;
  
  // Network info
  network: {
    chainId: number;
    expectedChainId: number;
    isCorrect: boolean;
  };
  
  // Contract info
  contract: {
    address: string;
    exists: boolean;
  };
  
  // Wallet info
  wallet: {
    address: string;
    isAttester: boolean | null;
  };
  
  // Action info
  action: {
    type: string;         // The action string (e.g., "DONATE")
    hash: string;         // keccak256(actionType) - bytes32
    isRegistered: boolean | null;
  };
  
  // PPLP parameters (matching contract v1.2.1)
  pplp: {
    user: string;           // Changed from "recipient"
    amount: string;
    amountFormatted: string;
    evidenceHash: string;   // NEW - replaces deadline
    nonce: string;
    // Removed: deadline, deadlineFormatted
  };
  
  // EIP-712 domain
  domain: TypedDataDomain;
  
  // Signature
  signature: {
    value: string;
    recoveredAddress: string;
    expectedAddress: string;
    isValid: boolean;
  };
  
  // Preflight result
  preflight: {
    success: boolean;
    revertData: string | null;
    decodedError: string | null;
  };
  
  // Error (if any)
  error: {
    code: string | number | null;
    message: string | null;
    shortMessage: string | null;
    data: string | null;
  } | null;
}

/**
 * Create initial debug bundle with default values
 */
export function createInitialDebugBundle(): MintDebugBundle {
  return {
    timestamp: new Date().toISOString(),
    network: {
      chainId: 0,
      expectedChainId: 97,
      isCorrect: false,
    },
    contract: {
      address: "",
      exists: false,
    },
    wallet: {
      address: "",
      isAttester: null,
    },
    action: {
      type: "",
      hash: "",
      isRegistered: null,
    },
    pplp: {
      user: "",
      amount: "0",
      amountFormatted: "0 FUN",
      evidenceHash: "",
      nonce: "0",
    },
    domain: {
      name: "",
      version: "",
      chainId: 0,
      verifyingContract: "",
    },
    signature: {
      value: "",
      recoveredAddress: "",
      expectedAddress: "",
      isValid: false,
    },
    preflight: {
      success: false,
      revertData: null,
      decodedError: null,
    },
    error: null,
  };
}

/**
 * Format debug bundle as copyable JSON string
 */
export function formatDebugBundle(bundle: MintDebugBundle): string {
  return JSON.stringify(bundle, null, 2);
}

/**
 * Decode common revert errors from FUN Money contract v1.2.1
 */
export function decodeRevertError(data: string | null): string {
  if (!data || data === "0x") {
    return "No revert data (silent revert or require(false))";
  }
  
  const selector = data.slice(0, 10).toLowerCase();
  
  // Standard Solidity errors
  const standardErrors: Record<string, string> = {
    "0x08c379a0": "Error(string)",
    "0x4e487b71": "Panic(uint256)",
    "0x": "Empty revert data",
  };
  
  if (standardErrors[selector]) {
    if (selector === "0x08c379a0" && data.length > 10) {
      try {
        const hexString = data.slice(10);
        const length = parseInt(hexString.slice(64, 128), 16);
        const messageHex = hexString.slice(128, 128 + length * 2);
        const message = Buffer.from(messageHex, 'hex').toString('utf8');
        return `Revert: "${message}"`;
      } catch {
        return "Error(string) - Could not decode message";
      }
    }
    return standardErrors[selector];
  }
  
  // Contract v1.2.1 specific require() messages (short strings)
  const requireMessages: Record<string, string> = {
    // From source code analysis
    "NOT_GOV": "Caller is not governance",
    "PAUSED": "Transitions are paused",
    "SIG_LIMIT": "Too many signatures (max 5)",
    "ACTION_INVALID": "Action not allowed or deprecated",
    "EPOCH_CAP": "Epoch mint cap exceeded",
    "SIGS_LOW": "Not enough valid attester signatures",
    "LOCK_LOW": "Insufficient locked amount",
    "ACT_LOW": "Insufficient activated amount",
  };
  
  // Try to match the error string if it's a simple require
  for (const [key, desc] of Object.entries(requireMessages)) {
    if (data.toLowerCase().includes(Buffer.from(key).toString('hex').toLowerCase())) {
      return `require() failed: ${key} - ${desc}`;
    }
  }
  
  return `Unknown error selector: ${selector}`;
}

/**
 * Format evidence hash for display (truncated)
 */
export function formatEvidenceHash(hash: string): string {
  if (!hash || hash.length < 20) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}
