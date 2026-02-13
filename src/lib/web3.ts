import { Contract, BrowserProvider, keccak256, toUtf8Bytes } from 'ethers';

// Contract storage key
const CONTRACT_ADDRESS_KEY = 'fun_money_contract_address';

// Default contract address
export const DEFAULT_FUN_MONEY_ADDRESS = '0x39A1b047D5d143f8874888cfa1d30Fb2AE6F0CD6';

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

/**
 * ABI for FUN Money Production v1.2.1 contract
 * 
 * CRITICAL: The lockWithPPLP function signature:
 * lockWithPPLP(address user, string action, uint256 amount, bytes32 evidenceHash, bytes[] sigs)
 * 
 * - `action` is a STRING (not bytes32!) - contract hashes it internally
 * - `nonce` is NOT passed - contract reads from nonces[user] internally
 */
export const FUN_MONEY_ABI = [
  // Read functions - Basic ERC20
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function nonces(address user) view returns (uint256)',
  
  // Read functions - PPLP specific (v1.2.1 naming convention)
  'function pauseTransitions() view returns (bool)',
  'function isAttester(address) view returns (bool)',
  'function attesterThreshold() view returns (uint256)',
  'function epochMintCap() view returns (uint256)',
  'function epochs(bytes32) view returns (uint64 start, uint256 minted)',
  'function epochDuration() view returns (uint256)',
  'function actions(bytes32) view returns (bool allowed, uint32 version, bool deprecated)',
  'function guardianGov() view returns (address)',
  'function communityPool() view returns (address)',
  'function alloc(address) view returns (uint256 locked, uint256 activated)',
  
  // Write functions - CORRECT signature matching contract v1.2.1
  'function lockWithPPLP(address user, string action, uint256 amount, bytes32 evidenceHash, bytes[] sigs) external',
  'function activate(uint256 amount) external',
  'function claim(uint256 amount) external',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event PureLoveAccepted(address indexed user, bytes32 indexed action, uint256 amount, uint32 version)',
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
  const address = getFunMoneyAddress();
  return new Contract(address, FUN_MONEY_ABI, provider);
}

// Get contract with signer for write operations
export async function getFunMoneyContractWithSigner(provider: BrowserProvider) {
  const signer = await provider.getSigner();
  const address = getFunMoneyAddress();
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

// Helper to create action hash (same as contract does internally)
export function createActionHash(actionType: string): string {
  return keccak256(toUtf8Bytes(actionType));
}

/**
 * Create evidence hash from action metadata
 * This proves the action details that were attested
 */
export function createEvidenceHash(data: {
  actionType: string;
  timestamp: number;
  pillars?: Record<string, number>;
  metadata?: Record<string, unknown>;
}): string {
  const json = JSON.stringify(data);
  return keccak256(toUtf8Bytes(json));
}

// Format FUN amount for display (18 decimals)
export function formatFunDisplay(amountAtomic: bigint): string {
  const decimals = 18n;
  const whole = amountAtomic / (10n ** decimals);
  const fraction = amountAtomic % (10n ** decimals);
  
  if (fraction === 0n) {
    return `${whole.toLocaleString()} FUN`;
  }
  
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

// Get allocation (locked + activated) for a user address
export async function getAllocation(provider: BrowserProvider, address: string): Promise<{
  locked: bigint;
  activated: bigint;
}> {
  const contract = getFunMoneyContract(provider);
  const result = await contract.alloc(address);
  return { 
    locked: result[0] ?? result.locked ?? 0n, 
    activated: result[1] ?? result.activated ?? 0n 
  };
}

// Activate tokens: LOCKED → ACTIVATED
export async function activateTokens(provider: BrowserProvider, amount: bigint): Promise<string> {
  const contract = await getFunMoneyContractWithSigner(provider);
  const tx = await contract.activate(amount);
  const receipt = await tx.wait();
  return receipt.hash;
}

// Claim tokens: ACTIVATED → FLOWING (ERC20 balance)
export async function claimTokens(provider: BrowserProvider, amount: bigint): Promise<string> {
  const contract = await getFunMoneyContractWithSigner(provider);
  const tx = await contract.claim(amount);
  const receipt = await tx.wait();
  return receipt.hash;
}
