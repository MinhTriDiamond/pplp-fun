import type { TypedDataDomain } from "ethers";

/**
 * Debug Bundle - Collects all mint parameters for troubleshooting
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
    type: string;
    hash: string;
    isRegistered: boolean | null;
  };
  
  // PPLP parameters
  pplp: {
    recipient: string;
    amount: string;
    amountFormatted: string;
    nonce: string;
    deadline: string;
    deadlineFormatted: string;
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
      recipient: "",
      amount: "0",
      amountFormatted: "0",
      nonce: "0",
      deadline: "0",
      deadlineFormatted: "",
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
 * Decode common revert errors
 */
export function decodeRevertError(data: string | null): string {
  if (!data || data === "0x") {
    return "No revert data (silent revert or require(false))";
  }
  
  // Try to decode common error selectors
  const selector = data.slice(0, 10).toLowerCase();
  
  const knownErrors: Record<string, string> = {
    "0x08c379a0": "Error(string)", // Standard revert with message
    "0x4e487b71": "Panic(uint256)", // Panic error
    "0x": "Empty revert data",
  };
  
  if (knownErrors[selector]) {
    // For Error(string), try to decode the message
    if (selector === "0x08c379a0" && data.length > 10) {
      try {
        // Skip selector (4 bytes) + offset (32 bytes) + length (32 bytes)
        // Then decode the string
        const hexString = data.slice(10);
        const offset = parseInt(hexString.slice(0, 64), 16) * 2;
        const length = parseInt(hexString.slice(64, 128), 16);
        const messageHex = hexString.slice(128, 128 + length * 2);
        const message = Buffer.from(messageHex, 'hex').toString('utf8');
        return `Revert: "${message}"`;
      } catch {
        return "Error(string) - Could not decode message";
      }
    }
    return knownErrors[selector];
  }
  
  // Check for custom error selectors from FUN Money contract
  const customErrors: Record<string, string> = {
    "0xa1c9d7d3": "InvalidSignature()",
    "0x7dc4a293": "DeadlineExpired()",
    "0x3ee5aeb5": "NonceAlreadyUsed()",
    "0x82b42900": "ActionNotRegistered()",
    "0x8baa579f": "EpochCapExceeded()",
  };
  
  if (customErrors[selector]) {
    return customErrors[selector];
  }
  
  return `Unknown error selector: ${selector}`;
}

/**
 * Format deadline as human readable
 */
export function formatDeadline(deadline: bigint | string): string {
  const ts = typeof deadline === "bigint" ? Number(deadline) : Number(deadline);
  const date = new Date(ts * 1000);
  const now = Date.now();
  const diffMs = ts * 1000 - now;
  
  if (diffMs < 0) {
    return `EXPIRED (${date.toLocaleString()})`;
  }
  
  const diffMins = Math.floor(diffMs / 60000);
  return `${date.toLocaleString()} (in ${diffMins} minutes)`;
}
