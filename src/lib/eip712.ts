import { TypedDataDomain, TypedDataField } from 'ethers';
import { FUN_MONEY_ADDRESS } from './web3';

// EIP-712 Domain for FUN Money contract
export const EIP712_DOMAIN: TypedDataDomain = {
  name: 'FUN Money',
  version: '1.3.0',
  chainId: 97, // BSC Testnet
  verifyingContract: FUN_MONEY_ADDRESS
};

// PPLP type structure
export const PPLP_TYPES: Record<string, TypedDataField[]> = {
  PPLP: [
    { name: 'recipient', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'actionHash', type: 'bytes32' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ]
};

// PPLP data structure
export interface PPLPData {
  recipient: string;
  amount: bigint;
  actionHash: string;
  nonce: bigint;
  deadline: bigint;
}

// Create typed data for signing
export function createPPLPTypedData(data: PPLPData) {
  return {
    domain: EIP712_DOMAIN,
    types: PPLP_TYPES,
    primaryType: 'PPLP' as const,
    message: {
      recipient: data.recipient,
      amount: data.amount.toString(),
      actionHash: data.actionHash,
      nonce: data.nonce.toString(),
      deadline: data.deadline.toString()
    }
  };
}

// Calculate deadline (1 hour from now)
export function getDeadline(hoursFromNow: number = 1): bigint {
  const now = Math.floor(Date.now() / 1000);
  return BigInt(now + hoursFromNow * 3600);
}

// Sign PPLP data using MetaMask
export async function signPPLP(
  signer: any,
  data: PPLPData
): Promise<string> {
  const typedData = createPPLPTypedData(data);
  
  // Use signTypedData from ethers Signer
  const signature = await signer.signTypedData(
    typedData.domain,
    typedData.types,
    typedData.message
  );
  
  return signature;
}
