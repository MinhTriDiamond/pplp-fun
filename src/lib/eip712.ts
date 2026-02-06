import type { TypedDataDomain, TypedDataField } from "ethers";
import { getFunMoneyAddress, BSC_TESTNET_CONFIG } from "./web3";

// PPLP type structure
export const PPLP_TYPES: Record<string, TypedDataField[]> = {
  PPLP: [
    { name: "recipient", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "actionHash", type: "bytes32" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
};

// PPLP data structure
export interface PPLPData {
  recipient: string;
  amount: bigint;
  actionHash: string;
  nonce: bigint;
  deadline: bigint;
}

/**
 * Build EIP-712 domain dynamically so it always matches:
 * - the currently configured contract address (Settings)
 * - the target chain
 *
 * IMPORTANT: The `version` MUST match the deployed contract's EIP-712 domain.
 * We're targeting FUNMoneyProductionV1_2_1 on BSC Testnet.
 */
export function getEip712Domain(): TypedDataDomain {
  return {
    name: "FUN Money",
    version: "1.3.0", // Must match contract's EIP-712 domain version
    chainId: BSC_TESTNET_CONFIG.chainId,
    verifyingContract: getFunMoneyAddress(),
  };
}

// Create typed data for signing
export function createPPLPTypedData(data: PPLPData) {
  return {
    domain: getEip712Domain(),
    types: PPLP_TYPES,
    primaryType: "PPLP" as const,
    message: {
      recipient: data.recipient,
      amount: data.amount.toString(),
      actionHash: data.actionHash,
      nonce: data.nonce.toString(),
      deadline: data.deadline.toString(),
    },
  };
}

// Calculate deadline (N hours from now)
export function getDeadline(hoursFromNow: number = 1): bigint {
  const now = Math.floor(Date.now() / 1000);
  return BigInt(now + hoursFromNow * 3600);
}

// Sign PPLP data using MetaMask
export async function signPPLP(signer: any, data: PPLPData): Promise<string> {
  const typedData = createPPLPTypedData(data);

  // Use signTypedData from ethers Signer
  return await signer.signTypedData(typedData.domain, typedData.types, typedData.message);
}

