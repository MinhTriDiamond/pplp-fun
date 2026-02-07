# 🐛 Error Handling - Debug & Troubleshooting

## Common Error Codes

### Contract Reverts

| Error | Ý Nghĩa | Nguyên Nhân | Giải Pháp |
|-------|---------|-------------|-----------|
| `SIGS_LOW` | Không đủ chữ ký hợp lệ | Wallet không phải Attester hoặc signature sai | Kiểm tra isAttester(), verify signature off-chain |
| `ACTION_INVALID` | Action không hợp lệ | Action chưa đăng ký hoặc đã deprecated | Gọi govRegisterAction() để đăng ký |
| `PAUSED` | Contract tạm dừng | pauseTransitions() = true | Đợi Governance unpause |
| `EPOCH_CAP` | Đạt giới hạn epoch | Mint quá 5M FUN trong ngày | Đợi epoch mới (mỗi 24h) |
| `NOT_GOV` | Không phải governance | Gọi hàm gov* mà không phải guardian | Dùng đúng wallet governance |
| `LOCK_LOW` | Không đủ locked | Activate nhiều hơn số locked | Kiểm tra alloc().locked |
| `ACT_LOW` | Không đủ activated | Claim nhiều hơn số activated | Kiểm tra alloc().activated |

### MetaMask Errors

| Code | Ý Nghĩa | Giải Pháp |
|------|---------|-----------|
| `4001` | User từ chối | Hiển thị thông báo friendly |
| `4100` | Unauthorized | Request permission lại |
| `4200` | Unsupported method | Kiểm tra MetaMask version |
| `4900` | Disconnected | Request reconnect |
| `4901` | Chain disconnected | Switch chain |
| `-32603` | Internal error | Retry hoặc check RPC |

---

## Debug Checklist

```typescript
// ===== PRE-MINT DEBUG CHECKLIST =====

async function debugBeforeMint(
  provider: BrowserProvider,
  signerAddress: string,
  recipientAddress: string,
  actionType: string
): Promise<void> {
  const contractAddress = "0x1aa8DE8B1E4465C6d729E8564893f8EF823a5ff2";
  const contract = new Contract(contractAddress, FUN_MONEY_ABI, provider);
  
  console.group('🔍 Pre-Mint Debug');
  
  // 1. Network
  const network = await provider.getNetwork();
  console.log('Chain ID:', Number(network.chainId), '(expect: 97)');
  if (Number(network.chainId) !== 97) {
    console.error('❌ Wrong network! Switch to BSC Testnet');
  }
  
  // 2. Contract exists
  const code = await provider.getCode(contractAddress);
  console.log('Contract exists:', code !== '0x' && code.length > 2);
  
  // 3. Contract not paused
  const paused = await contract.pauseTransitions();
  console.log('Paused:', paused, paused ? '❌' : '✅');
  
  // 4. Signer is attester
  const isAttester = await contract.isAttester(signerAddress);
  console.log('Is Attester:', isAttester, isAttester ? '✅' : '❌');
  
  // 5. Threshold
  const threshold = await contract.attesterThreshold();
  console.log('Threshold:', Number(threshold), Number(threshold) === 1 ? '✅' : '⚠️ Multi-sig required');
  
  // 6. Action registered
  const actionHash = keccak256(toUtf8Bytes(actionType));
  const actionInfo = await contract.actions(actionHash);
  console.log('Action exists:', actionInfo[0], actionInfo[0] ? '✅' : '❌');
  console.log('Action version:', Number(actionInfo[1]));
  console.log('Action deprecated:', actionInfo[2], actionInfo[2] ? '❌' : '✅');
  
  // 7. Recipient nonce
  const nonce = await contract.nonces(recipientAddress);
  console.log('Recipient nonce:', Number(nonce));
  
  // 8. EIP-712 domain check
  console.log('EIP-712 Domain:', {
    name: "FUN Money",
    version: "1.2.1", // CRITICAL!
    chainId: 97,
    verifyingContract: contractAddress
  });
  
  console.groupEnd();
}
```

---

## Debug Bundle Structure

Khi mint thất bại, thu thập toàn bộ thông tin vào debug bundle:

```typescript
interface MintDebugBundle {
  timestamp: string;
  
  network: {
    chainId: number;
    expectedChainId: number;
    isCorrect: boolean;
  };
  
  contract: {
    address: string;
    exists: boolean;
  };
  
  wallet: {
    address: string;
    isAttester: boolean | null;
  };
  
  action: {
    type: string;
    hash: string;
    isRegistered: boolean | null;
  };
  
  pplp: {
    user: string;
    amount: string;
    amountFormatted: string;
    evidenceHash: string;
    nonce: string;
  };
  
  domain: {
    name: string;
    version: string;  // Must be "1.2.1"
    chainId: number;
    verifyingContract: string;
  };
  
  signature: {
    value: string;
    recoveredAddress: string;
    expectedAddress: string;
    isValid: boolean;
  };
  
  preflight: {
    success: boolean;
    revertData: string | null;
    decodedError: string | null;
  };
  
  error: {
    code: string | number | null;
    message: string | null;
    shortMessage: string | null;
    data: string | null;
  } | null;
}
```

---

## Decoding Revert Errors

```typescript
function decodeRevertError(data: string | null): string {
  if (!data || data === "0x") {
    return "No revert data (silent revert or require(false))";
  }
  
  const selector = data.slice(0, 10).toLowerCase();
  
  // Standard Solidity errors
  if (selector === "0x08c379a0") {
    // Error(string) - decode message
    try {
      const hexString = data.slice(10);
      const length = parseInt(hexString.slice(64, 128), 16);
      const messageHex = hexString.slice(128, 128 + length * 2);
      const message = Buffer.from(messageHex, 'hex').toString('utf8');
      return `Revert: "${message}"`;
    } catch {
      return "Error(string) - Could not decode";
    }
  }
  
  if (selector === "0x4e487b71") {
    // Panic(uint256)
    const code = parseInt(data.slice(10), 16);
    const panicMessages: Record<number, string> = {
      0x01: "Assertion failed",
      0x11: "Arithmetic overflow",
      0x12: "Division by zero",
      0x21: "Invalid enum value",
      0x22: "Storage corruption",
      0x31: "Pop on empty array",
      0x32: "Array out of bounds",
      0x41: "Out of memory",
      0x51: "Invalid internal function"
    };
    return panicMessages[code] || `Panic(${code})`;
  }
  
  // Contract-specific short strings
  const knownErrors: Record<string, string> = {
    "NOT_GOV": "Caller is not governance",
    "PAUSED": "Transitions are paused",
    "SIG_LIMIT": "Too many signatures (max 5)",
    "ACTION_INVALID": "Action not allowed or deprecated",
    "EPOCH_CAP": "Epoch mint cap exceeded",
    "SIGS_LOW": "Not enough valid attester signatures",
    "LOCK_LOW": "Insufficient locked amount",
    "ACT_LOW": "Insufficient activated amount"
  };
  
  // Try to find known error in data
  for (const [key, desc] of Object.entries(knownErrors)) {
    if (data.toLowerCase().includes(
      Buffer.from(key).toString('hex').toLowerCase()
    )) {
      return `require() failed: ${key} - ${desc}`;
    }
  }
  
  return `Unknown error selector: ${selector}`;
}
```

---

## Preflight Check (Dry-Run)

Trước khi gửi transaction thật, dùng `estimateGas` để kiểm tra:

```typescript
async function preflightMint(
  contract: Contract,
  user: string,
  action: string,
  amount: bigint,
  evidenceHash: string,
  signature: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Dry run với estimateGas
    await contract.lockWithPPLP.estimateGas(
      user,
      action,
      amount,
      evidenceHash,
      [signature]
    );
    
    return { success: true };
    
  } catch (err: any) {
    const revertData = err.data || err.info?.error?.data;
    const decoded = decodeRevertError(revertData);
    
    return {
      success: false,
      error: decoded
    };
  }
}
```

---

## Signature Verification Off-Chain

Luôn verify signature trước khi gửi transaction:

```typescript
import { verifyTypedData } from 'ethers';

function verifySignatureBeforeMint(
  pplpData: PPLPData,
  signature: string,
  expectedSigner: string
): { isValid: boolean; recoveredAddress: string } {
  const typedData = createPPLPTypedData(pplpData);
  
  try {
    const recoveredAddress = verifyTypedData(
      typedData.domain,
      typedData.types,
      typedData.message,
      signature
    );
    
    const isValid = recoveredAddress.toLowerCase() === expectedSigner.toLowerCase();
    
    if (!isValid) {
      console.error('Signature mismatch!');
      console.error('Recovered:', recoveredAddress);
      console.error('Expected:', expectedSigner);
      console.error('Domain version:', typedData.domain.version);
    }
    
    return { isValid, recoveredAddress };
    
  } catch (err) {
    console.error('Signature verification failed:', err);
    return { isValid: false, recoveredAddress: 'Error' };
  }
}
```

---

## Common Issues & Solutions

### Issue 1: "execution reverted" without message

**Nguyên nhân**: Contract revert với require() đơn giản hoặc ABI không khớp.

**Giải pháp**:
1. Chạy debug checklist
2. Verify signature off-chain
3. Check nonce lấy từ đúng recipient
4. Check EIP-712 version = "1.2.1"

---

### Issue 2: "SIGS_LOW" error

**Nguyên nhân**: 
- Wallet không phải Attester
- Signature invalid
- EIP-712 domain version sai

**Giải pháp**:
1. Kiểm tra `isAttester(walletAddress)` = true
2. Verify signature với `verifyTypedData()`
3. Đảm bảo domain version = "1.2.1"

---

### Issue 3: "ACTION_INVALID" error

**Nguyên nhân**:
- Action chưa được đăng ký
- Action đã deprecated

**Giải pháp**:
1. Kiểm tra `actions(actionHash)` trả về `(true, version, false)`
2. Nếu chưa đăng ký: Governance gọi `govRegisterAction()`

---

### Issue 4: Nonce mismatch

**Nguyên nhân**: Lấy nonce từ signer thay vì recipient

**Giải pháp**:
```typescript
// ✅ ĐÚNG: Nonce từ RECIPIENT
const nonce = await contract.nonces(recipientAddress);

// ❌ SAI: Nonce từ signer
// const nonce = await contract.nonces(signerAddress);
```

---

## Logging Best Practices

```typescript
// Log format for debugging
function logMintAttempt(params: {
  recipient: string;
  action: string;
  amount: string;
  signer: string;
}) {
  console.group(`🚀 Mint Attempt ${new Date().toISOString()}`);
  console.log('Recipient:', params.recipient);
  console.log('Action:', params.action);
  console.log('Amount:', params.amount);
  console.log('Signer:', params.signer);
  console.groupEnd();
}

function logMintSuccess(txHash: string) {
  console.log(`✅ Mint Success: ${txHash}`);
}

function logMintError(err: any, bundle: MintDebugBundle) {
  console.group('❌ Mint Failed');
  console.error('Error:', err.message);
  console.log('Debug Bundle:', JSON.stringify(bundle, null, 2));
  console.groupEnd();
}
```

---

*Tiếp theo: [08-SECURITY-CHECKLIST.md](./08-SECURITY-CHECKLIST.md)*
