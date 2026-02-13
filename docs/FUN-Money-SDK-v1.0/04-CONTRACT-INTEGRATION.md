# 🔗 Contract Integration - Tích Hợp Smart Contract FUN Money

## Contract Info

| Property | Value |
|----------|-------|
| **Contract Address** | `0x39A1b047D5d143f8874888cfa1d30Fb2AE6F0CD6` |
| **Network** | BSC Testnet (Chain ID: 97) |
| **Version** | FUNMoneyProductionV1_2_1 |
| **EIP-712 Domain Version** | `1.2.1` |

---

## 1. Contract ABI

```typescript
export const FUN_MONEY_ABI = [
  // ===== READ FUNCTIONS =====
  
  // Basic ERC20
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function nonces(address user) view returns (uint256)',
  
  // PPLP specific
  'function pauseTransitions() view returns (bool)',
  'function isAttester(address) view returns (bool)',
  'function attesterThreshold() view returns (uint256)',
  'function epochMintCap() view returns (uint256)',
  'function epochDuration() view returns (uint256)',
  'function epochs(bytes32) view returns (uint64 start, uint256 minted)',
  'function actions(bytes32) view returns (bool allowed, uint32 version, bool deprecated)',
  'function guardianGov() view returns (address)',
  'function communityPool() view returns (address)',
  'function alloc(address) view returns (uint256 locked, uint256 activated)',
  
  // ===== WRITE FUNCTIONS =====
  
  // Core minting function
  'function lockWithPPLP(address user, string action, uint256 amount, bytes32 evidenceHash, bytes[] sigs) external',
  
  // Token lifecycle (user calls)
  'function activate(uint256 amount) external',
  'function claim(uint256 amount) external',
  
  // ===== EVENTS =====
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event PureLoveAccepted(address indexed user, bytes32 indexed action, uint256 amount, uint32 version)',
  'event Activated(address indexed user, uint256 amount)',
  'event Claimed(address indexed user, uint256 amount)'
];
```

---

## 2. EIP-712 Configuration

### Domain

```typescript
const EIP712_DOMAIN = {
  name: "FUN Money",
  version: "1.2.1",  // ⚠️ CRITICAL: Must match exactly!
  chainId: 97,       // BSC Testnet
  verifyingContract: "0x39A1b047D5d143f8874888cfa1d30Fb2AE6F0CD6"
};
```

### PureLoveProof Type

```typescript
const PPLP_TYPES = {
  PureLoveProof: [
    { name: "user", type: "address" },       // Recipient address
    { name: "actionHash", type: "bytes32" }, // keccak256(actionType)
    { name: "amount", type: "uint256" },     // Amount in atomic
    { name: "evidenceHash", type: "bytes32" }, // Evidence hash
    { name: "nonce", type: "uint256" }       // From contract
  ]
};
```

### TypeHash (Reference)

```solidity
// In Solidity contract:
bytes32 constant PPLP_TYPEHASH = keccak256(
  "PureLoveProof(address user,bytes32 actionHash,uint256 amount,bytes32 evidenceHash,uint256 nonce)"
);
```

---

## 3. Creating Signatures

### Step-by-Step Process

```typescript
import { keccak256, toUtf8Bytes, verifyTypedData } from 'ethers';

// Step 1: Prepare data
const recipientAddress = "0x7d037462503bea2f61cDB9A482aAc72a8f4F3f0f";
const actionType = "CONTENT_CREATE";
const amount = BigInt("100000000000000000000"); // 100 FUN
const evidenceData = {
  actionType,
  timestamp: Math.floor(Date.now() / 1000),
  pillars: { S: 85, T: 80, H: 75, C: 90, U: 88 }
};

// Step 2: Create hashes
const actionHash = keccak256(toUtf8Bytes(actionType));
const evidenceHash = keccak256(toUtf8Bytes(JSON.stringify(evidenceData)));

// Step 3: Get nonce FROM RECIPIENT (not signer!)
const nonce = await contract.nonces(recipientAddress);

// Step 4: Prepare typed data
const typedData = {
  domain: {
    name: "FUN Money",
    version: "1.2.1",
    chainId: 97,
    verifyingContract: contractAddress
  },
  types: {
    PureLoveProof: [
      { name: "user", type: "address" },
      { name: "actionHash", type: "bytes32" },
      { name: "amount", type: "uint256" },
      { name: "evidenceHash", type: "bytes32" },
      { name: "nonce", type: "uint256" }
    ]
  },
  primaryType: "PureLoveProof",
  message: {
    user: recipientAddress,
    actionHash: actionHash,
    amount: amount.toString(),
    evidenceHash: evidenceHash,
    nonce: nonce.toString()
  }
};

// Step 5: Sign with MetaMask (Attester wallet)
const signature = await signer.signTypedData(
  typedData.domain,
  typedData.types,
  typedData.message
);

// Step 6: Verify signature off-chain (optional but recommended)
const recoveredAddress = verifyTypedData(
  typedData.domain,
  typedData.types,
  typedData.message,
  signature
);

console.log('Signer:', recoveredAddress);
console.log('Is valid:', recoveredAddress === await signer.getAddress());
```

---

## 4. Calling lockWithPPLP

### Function Signature

```solidity
function lockWithPPLP(
    address user,        // Recipient who receives tokens
    string action,       // Action STRING (not hash!)
    uint256 amount,      // Amount in atomic units
    bytes32 evidenceHash,// Hash of evidence
    bytes[] sigs         // Array of signatures
) external
```

### JavaScript Call

```typescript
// ⚠️ CRITICAL: Get contract with signer (Attester wallet)
const contract = new Contract(contractAddress, FUN_MONEY_ABI, signer);

// Call lockWithPPLP
const tx = await contract.lockWithPPLP(
  recipientAddress,      // user = RECIPIENT (not signer!)
  "CONTENT_CREATE",      // action = STRING (not hash!)
  amount,                // amount in atomic
  evidenceHash,          // bytes32
  [signature]            // sigs = ARRAY of signatures
);

// Wait for confirmation
const receipt = await tx.wait();
console.log('TX Hash:', receipt.hash);
console.log('Block:', receipt.blockNumber);
```

---

## 5. Common Mistakes to Avoid

### ❌ Wrong: Passing actionHash instead of string

```typescript
// WRONG!
await contract.lockWithPPLP(user, actionHash, amount, evidenceHash, [sig]);
```

### ✅ Correct: Pass action string

```typescript
// CORRECT!
await contract.lockWithPPLP(user, "CONTENT_CREATE", amount, evidenceHash, [sig]);
```

---

### ❌ Wrong: Using signer's nonce

```typescript
// WRONG!
const nonce = await contract.nonces(signerAddress);
```

### ✅ Correct: Use recipient's nonce

```typescript
// CORRECT!
const nonce = await contract.nonces(recipientAddress);
```

---

### ❌ Wrong: Passing signature directly

```typescript
// WRONG!
await contract.lockWithPPLP(user, action, amount, evidenceHash, signature);
```

### ✅ Correct: Wrap in array

```typescript
// CORRECT!
await contract.lockWithPPLP(user, action, amount, evidenceHash, [signature]);
```

---

### ❌ Wrong: Wrong EIP-712 version

```typescript
// WRONG!
const domain = { name: "FUN Money", version: "1.0.0", ... };
```

### ✅ Correct: Version must be "1.2.1"

```typescript
// CORRECT!
const domain = { name: "FUN Money", version: "1.2.1", ... };
```

---

## 6. Helper Functions

### Create Action Hash

```typescript
import { keccak256, toUtf8Bytes } from 'ethers';

function createActionHash(actionType: string): string {
  return keccak256(toUtf8Bytes(actionType));
}

// Usage
const hash = createActionHash("CONTENT_CREATE");
// "0x7b8d3e5f..."
```

### Create Evidence Hash

```typescript
function createEvidenceHash(data: {
  actionType: string;
  timestamp: number;
  pillars?: Record<string, number>;
  metadata?: Record<string, unknown>;
}): string {
  const json = JSON.stringify(data);
  return keccak256(toUtf8Bytes(json));
}

// Usage
const evidenceHash = createEvidenceHash({
  actionType: "CONTENT_CREATE",
  timestamp: 1707312000,
  pillars: { S: 85, T: 80, H: 75, C: 90, U: 88 }
});
```

### Get Nonce

```typescript
async function getNonce(
  provider: BrowserProvider, 
  userAddress: string
): Promise<bigint> {
  const contract = new Contract(contractAddress, FUN_MONEY_ABI, provider);
  return await contract.nonces(userAddress);
}
```

### Check Contract Exists

```typescript
async function checkContractExists(
  provider: BrowserProvider, 
  address: string
): Promise<boolean> {
  const code = await provider.getCode(address);
  return code !== '0x' && code !== '0x0' && code.length > 2;
}
```

---

## 7. Pre-Mint Validation Checklist

```typescript
async function validateBeforeMint(
  provider: BrowserProvider,
  attesterAddress: string,
  actionType: string
): Promise<{ canMint: boolean; issues: string[] }> {
  const contract = new Contract(contractAddress, FUN_MONEY_ABI, provider);
  const issues: string[] = [];
  
  // 1. Check contract exists
  const exists = await checkContractExists(provider, contractAddress);
  if (!exists) issues.push('Contract not deployed');
  
  // 2. Check not paused
  const paused = await contract.pauseTransitions();
  if (paused) issues.push('Contract is paused');
  
  // 3. Check is attester
  const isAttester = await contract.isAttester(attesterAddress);
  if (!isAttester) issues.push('Wallet is not an attester');
  
  // 4. Check threshold
  const threshold = await contract.attesterThreshold();
  if (Number(threshold) > 1) {
    issues.push(`Need ${threshold} signatures (multi-sig)`);
  }
  
  // 5. Check action registered
  const actionHash = createActionHash(actionType);
  const actionInfo = await contract.actions(actionHash);
  if (!actionInfo[0]) {
    issues.push(`Action "${actionType}" not registered`);
  }
  
  return {
    canMint: issues.length === 0,
    issues
  };
}
```

---

## 8. Full Integration Example

```typescript
async function mintFunMoney(
  signer: JsonRpcSigner,
  recipientAddress: string,
  actionType: string,
  amount: bigint,
  evidence: object
): Promise<string> {
  const contractAddress = "0x39A1b047D5d143f8874888cfa1d30Fb2AE6F0CD6";
  const contract = new Contract(contractAddress, FUN_MONEY_ABI, signer);
  
  // 1. Create hashes
  const actionHash = createActionHash(actionType);
  const evidenceHash = createEvidenceHash({
    actionType,
    timestamp: Math.floor(Date.now() / 1000),
    ...evidence
  });
  
  // 2. Get nonce for RECIPIENT
  const nonce = await contract.nonces(recipientAddress);
  
  // 3. Prepare EIP-712 data
  const typedData = {
    domain: {
      name: "FUN Money",
      version: "1.2.1",
      chainId: 97,
      verifyingContract: contractAddress
    },
    types: {
      PureLoveProof: [
        { name: "user", type: "address" },
        { name: "actionHash", type: "bytes32" },
        { name: "amount", type: "uint256" },
        { name: "evidenceHash", type: "bytes32" },
        { name: "nonce", type: "uint256" }
      ]
    },
    message: {
      user: recipientAddress,
      actionHash,
      amount: amount.toString(),
      evidenceHash,
      nonce: nonce.toString()
    }
  };
  
  // 4. Sign with Attester wallet
  const signature = await signer.signTypedData(
    typedData.domain,
    typedData.types,
    typedData.message
  );
  
  // 5. Call contract
  const tx = await contract.lockWithPPLP(
    recipientAddress,
    actionType,      // STRING!
    amount,
    evidenceHash,
    [signature]      // ARRAY!
  );
  
  // 6. Wait for confirmation
  const receipt = await tx.wait();
  
  return receipt.hash;
}
```

---

*Tiếp theo: [05-ADMIN-DASHBOARD.md](./05-ADMIN-DASHBOARD.md)*
