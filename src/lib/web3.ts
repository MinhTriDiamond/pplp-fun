import { Contract, BrowserProvider, keccak256, toUtf8Bytes } from 'ethers';

// Contract storage key
const CONTRACT_ADDRESS_KEY = 'fun_money_contract_address';

// Default contract address
export const DEFAULT_FUN_MONEY_ADDRESS = '0x1aa8DE8B1E4465C6d729E8564893f8EF823a5ff2';

// Get current contract address (from localStorage or default)
export function getFunMoneyAddress(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(CONTRACT_ADDRESS_KEY) || DEFAULT_FUN_MONEY_ADDRESS;
  }
  return DEFAULT_FUN_MONEY_ADDRESS;
}

// Set contract address
export function setFunMoneyAddress(address: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONTRACT_ADDRESS_KEY, address);
  }
}

// Legacy export for compatibility
export const FUN_MONEY_ADDRESS = getFunMoneyAddress();

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
  
  // Validation functions
  'function isAttester(address) view returns (bool)',
  'function threshold() view returns (uint256)',
  'function epochMinted() view returns (uint256)',
  'function epochCap() view returns (uint256)',
  'function getActionInfo(bytes32 actionHash) view returns (bool exists, uint256 version)',
  
  // Write functions
  'function lockWithPPLP(address recipient, uint256 amount, bytes32 actionHash, uint256 nonce, uint256 deadline, bytes[] signatures) external',
  
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

// Check if contract exists at address
export async function checkContractExists(provider: BrowserProvider, address: string): Promise<{
  exists: boolean;
  code: string;
}> {
  try {
    const code = await provider.getCode(address);
    return {
      exists: code !== '0x' && code !== '0x0' && code.length > 2,
      code
    };
  } catch {
    return { exists: false, code: '0x' };
  }
}

// Validate Ethereum address format
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
