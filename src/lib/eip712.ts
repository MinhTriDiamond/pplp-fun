import type { TypedDataDomain, TypedDataField } from "ethers";
import { verifyTypedData } from "ethers";
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
 * Deployed contract: FUNMoneyProductionV1_2_1 on BSC Testnet
 * Contract source shows version "1.2.1" in EIP-712 domain
 */
export function getEip712Domain(): TypedDataDomain {
  return {
    name: "FUN Money",
    version: "1.2.1", // Must match deployed contract v1.2.1 EIP-712 domain
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

/**
 * Verify a PPLP signature off-chain
 * Returns the recovered signer address
 */
export function verifyPPLPSignature(data: PPLPData, signature: string): string {
  const typedData = createPPLPTypedData(data);
  
  // Recover the signer address from the signature
  return verifyTypedData(
    typedData.domain,
    typedData.types,
    typedData.message,
    signature
  );
}

/**
 * Debug info for signature verification
 */
export interface SignatureDebugInfo {
  domain: TypedDataDomain;
  message: Record<string, string>;
  signature: string;
  recoveredAddress: string;
  expectedAddress: string;
  isValid: boolean;
}

/**
 * Verify signature and return debug info
 */
export function verifyPPLPSignatureWithDebug(
  data: PPLPData,
  signature: string,
  expectedAddress: string
): SignatureDebugInfo {
  const typedData = createPPLPTypedData(data);
  
  let recoveredAddress = "";
  let isValid = false;
  
  try {
    recoveredAddress = verifyTypedData(
      typedData.domain,
      typedData.types,
      typedData.message,
      signature
    );
    isValid = recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (err) {
    recoveredAddress = `Error: ${(err as Error).message}`;
    isValid = false;
  }
  
  return {
    domain: typedData.domain,
    message: typedData.message as Record<string, string>,
    signature,
    recoveredAddress,
    expectedAddress,
    isValid,
  };
}
