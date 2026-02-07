import type { TypedDataDomain, TypedDataField } from "ethers";
import { verifyTypedData } from "ethers";
import { getFunMoneyAddress, BSC_TESTNET_CONFIG } from "./web3";

/**
 * EIP-712 Type Structure for PureLoveProof (PPLP)
 * 
 * MUST match exactly with the contract's PPLP_TYPEHASH:
 * keccak256("PureLoveProof(address user,bytes32 actionHash,uint256 amount,bytes32 evidenceHash,uint256 nonce)")
 */
export const PPLP_TYPES: Record<string, TypedDataField[]> = {
  PureLoveProof: [
    { name: "user", type: "address" },
    { name: "actionHash", type: "bytes32" },
    { name: "amount", type: "uint256" },
    { name: "evidenceHash", type: "bytes32" },
    { name: "nonce", type: "uint256" },
  ],
};

/**
 * PPLP data structure matching contract requirements
 */
export interface PPLPData {
  user: string;           // The user receiving the mint
  actionHash: string;     // keccak256(actionType) - bytes32
  amount: bigint;         // Amount in atomic units (18 decimals)
  evidenceHash: string;   // Evidence hash (proof of action) - bytes32
  nonce: bigint;          // User's current nonce from contract
}

/**
 * Build EIP-712 domain dynamically so it always matches:
 * - the currently configured contract address (Settings)
 * - the target chain
 *
 * IMPORTANT: The `version` MUST match the deployed contract's EIP-712 domain.
 * Deployed contract: FUNMoneyProductionV1_2_1 on BSC Testnet
 * Contract constructor: EIP712("FUN Money", "1.2.1")
 */
export function getEip712Domain(): TypedDataDomain {
  return {
    name: "FUN Money",
    version: "1.2.1", // Must match deployed contract v1.2.1 EIP-712 domain
    chainId: BSC_TESTNET_CONFIG.chainId,
    verifyingContract: getFunMoneyAddress(),
  };
}

/**
 * Create typed data for EIP-712 signing
 * Field order and names MUST match PPLP_TYPEHASH in contract exactly
 */
export function createPPLPTypedData(data: PPLPData) {
  return {
    domain: getEip712Domain(),
    types: PPLP_TYPES,
    primaryType: "PureLoveProof" as const,
    message: {
      user: data.user,
      actionHash: data.actionHash,
      amount: data.amount.toString(),
      evidenceHash: data.evidenceHash,
      nonce: data.nonce.toString(),
    },
  };
}

/**
 * Sign PPLP data using MetaMask EIP-712
 */
export async function signPPLP(signer: any, data: PPLPData): Promise<string> {
  const typedData = createPPLPTypedData(data);
  return await signer.signTypedData(typedData.domain, typedData.types, typedData.message);
}

/**
 * Verify a PPLP signature off-chain
 * Returns the recovered signer address
 */
export function verifyPPLPSignature(data: PPLPData, signature: string): string {
  const typedData = createPPLPTypedData(data);
  
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
