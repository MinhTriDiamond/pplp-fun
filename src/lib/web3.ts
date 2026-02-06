import { Contract, BrowserProvider, keccak256, toUtf8Bytes } from 'ethers';

// Contract addresses
export const FUN_MONEY_ADDRESS = '0x1aa8DE8B1E4465C6d729E8564893f8EF823a5ff2';

// Minimal ABI for FUN Money contract
export const FUN_MONEY_ABI = [
  // Read functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function nonces(address user) view returns (uint256)',
  'function paused() view returns (bool)',
  
  // Write functions
  'function lockWithPPLP(address recipient, uint256 amount, bytes32 actionHash, uint256 nonce, uint256 deadline, bytes signature) external',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Locked(address indexed recipient, uint256 amount, bytes32 actionHash)'
];

// BSC Testnet config
export const BSC_TESTNET_CONFIG = {
  chainId: 97,
  name: 'BSC Testnet',
  rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  explorerUrl: 'https://testnet.bscscan.com',
  explorerTxUrl: (txHash: string) => `https://testnet.bscscan.com/tx/${txHash}`
};

// Create contract instance
export function getFunMoneyContract(provider: BrowserProvider) {
  return new Contract(FUN_MONEY_ADDRESS, FUN_MONEY_ABI, provider);
}

// Get contract with signer for write operations
export async function getFunMoneyContractWithSigner(provider: BrowserProvider) {
  const signer = await provider.getSigner();
  return new Contract(FUN_MONEY_ADDRESS, FUN_MONEY_ABI, signer);
}

// Helper to get nonce for an address
export async function getNonce(provider: BrowserProvider, address: string): Promise<bigint> {
  const contract = getFunMoneyContract(provider);
  return await contract.nonces(address);
}

// Helper to get FUN balance
export async function getFunBalance(provider: BrowserProvider, address: string): Promise<bigint> {
  const contract = getFunMoneyContract(provider);
  return await contract.balanceOf(address);
}

// Helper to create action hash
export function createActionHash(actionType: string): string {
  return keccak256(toUtf8Bytes(actionType));
}

// Format FUN amount for display (18 decimals)
export function formatFunDisplay(amountAtomic: bigint): string {
  const decimals = 18n;
  const whole = amountAtomic / (10n ** decimals);
  const fraction = amountAtomic % (10n ** decimals);
  
  if (fraction === 0n) {
    return `${whole.toLocaleString()} FUN`;
  }
  
  // Show 2 decimal places
  const fractionStr = fraction.toString().padStart(Number(decimals), '0').slice(0, 2);
  return `${whole.toLocaleString()}.${fractionStr} FUN`;
}
