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

// ABI for FUN Money Production v1.2.1 contract (matching deployed contract on BSC Testnet)
export const FUN_MONEY_ABI = [
  // Read functions - Basic ERC20
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function nonces(address user) view returns (uint256)',
  
  // Read functions - PPLP specific (v1.2.1 naming convention)
  'function pauseTransitions() view returns (bool)',  // NOT paused()
  'function isAttester(address) view returns (bool)',
  'function attesterThreshold() view returns (uint256)',  // NOT threshold()
  'function epochMintCap() view returns (uint256)',  // NOT epochCap()
  'function epochs(uint256) view returns (uint256)',  // epoch data
  'function epochDuration() view returns (uint256)',
  'function actions(bytes32) view returns (bool exists, uint256 version, bool deprecated)',
  'function guardianGov() view returns (address)',
  'function communityPool() view returns (address)',
  'function alloc(address) view returns (uint256 locked, uint256 activated)',
  'function totalActivated() view returns (uint256)',
  
  // Write functions
  'function lockWithPPLP(address recipient, uint256 amount, bytes32 actionHash, uint256 nonce, uint256 deadline, bytes[] signatures) external',
  'function activate(uint256 amount) external',
  'function claim(uint256 amount) external',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Locked(address indexed recipient, uint256 amount, bytes32 actionHash)',
  'event Activated(address indexed user, uint256 amount)',
  'event Claimed(address indexed user, uint256 amount)'
];

// BSC Testnet config
export const BSC_TESTNET_CONFIG = {
  chainId: 97,
  name: 'BSC Testnet',
  rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  explorerUrl: 'https://testnet.bscscan.com',
  explorerTxUrl: (txHash: string) => `https://testnet.bscscan.com/tx/${txHash}`
};

// Create contract instance - always fetch fresh address
export function getFunMoneyContract(provider: BrowserProvider) {
  const address = getFunMoneyAddress(); // Dynamic fetch
  return new Contract(address, FUN_MONEY_ABI, provider);
}

// Get contract with signer for write operations
export async function getFunMoneyContractWithSigner(provider: BrowserProvider) {
  const signer = await provider.getSigner();
  const address = getFunMoneyAddress(); // Dynamic fetch
  return new Contract(address, FUN_MONEY_ABI, signer);
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
