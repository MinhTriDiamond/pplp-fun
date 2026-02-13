

# Multi-Sig Mint: Thu thap chu ky tu 3 thiet bi khac nhau

## Van de

Contract yeu cau 3 chu ky Attester (`attesterThreshold = 3`), nhung 3 vi nam tren 3 thiet bi cua 3 nguoi khac nhau. Khong the ky tuan tu tren 1 trinh duyet.

## Giai phap: Mint Request qua Database

Tao he thong "Mint Request" luu tru tren database, noi moi Attester tu thiet bi rieng co the mo request, ky EIP-712, va luu chu ky. Khi du 3/3 chu ky, bat ky Attester nao cung co the gui giao dich len blockchain.

## Luong hoat dong

```text
Attester 1 (Thiet bi A)             Database              Attester 2 (Thiet bi B)
      |                                |                         |
      |-- Tao Mint Request ----------->|                         |
      |   (action, amount, recipient,  |                         |
      |    evidenceHash, nonce)         |                         |
      |                                |                         |
      |-- Ky EIP-712 + luu sig1 ------>|                         |
      |                                |                         |
      |                                |<-- Mo request, ky sig2 -|
      |                                |                         |
      |                                |         Attester 3 (Thiet bi C)
      |                                |                  |
      |                                |<-- Ky sig3 ------|
      |                                |                  |
      |<-- Du 3/3! Gui giao dich ------|                  |
      |   lockWithPPLP(..., [s1,s2,s3])|                  |
```

## Chi tiet ky thuat

### 1. Database: Bang `mint_requests` va `mint_signatures`

**Bang `mint_requests`:**
- `id` (uuid, PK)
- `created_by` (text - dia chi vi tao request)
- `recipient` (text - dia chi nguoi nhan FUN)
- `action_type` (text - vd: "DONATE")
- `action_hash` (text - keccak256 cua action)
- `amount_atomic` (text - so luong token)
- `evidence_hash` (text - hash bang chung)
- `nonce` (text - nonce cua recipient tu contract)
- `platform_id` (text)
- `threshold` (int - so chu ky can thiet, vd: 3)
- `status` (text: pending / ready / submitted / confirmed)
- `tx_hash` (text, nullable)
- `scoring_metadata` (jsonb - lightScore, unityScore, multipliers)
- `created_at`, `expires_at`

**Bang `mint_signatures`:**
- `id` (uuid, PK)
- `request_id` (uuid, FK -> mint_requests)
- `signer_address` (text - dia chi vi da ky)
- `signature` (text - chu ky EIP-712)
- `signed_at` (timestamp)
- Unique constraint: (request_id, signer_address) - moi vi chi ky 1 lan

RLS: Cho phep moi authenticated user doc/ghi (vi Attester xac thuc qua vi, khong qua Supabase auth). Hoac dung public access voi kiem tra on-chain.

### 2. Component: `MultiSigMintFlow.tsx`

Giao dien moi thay the flow cu trong Simulator khi threshold > 1:

**Tab 1 - Tao Request (Attester 1):**
- Hien thi thong tin PPLP (action, amount, recipient)
- Nut "Tao Mint Request" -> luu vao DB + tu dong ky sig1
- Hien thi Request ID de chia se cho cac Attester khac

**Tab 2 - Ky Request (Attester 2, 3):**
- Nhap Request ID hoac chon tu danh sach "Pending Requests"
- Hien thi chi tiet request (action, amount, recipient)
- Nut "Ky voi vi cua toi" -> ky EIP-712 + luu sig vao DB
- Hien thi tien trinh: 1/3, 2/3, 3/3

**Tab 3 - Gui giao dich (khi du 3/3):**
- Tu dong hien thi khi du threshold chu ky
- Nut "Gui len Blockchain" -> goi lockWithPPLP voi 3 chu ky
- Hien thi ket qua va tx hash

### 3. Cap nhat `MintButton.tsx`

- Doc `attesterThreshold` tu contract
- Neu threshold = 1: giu nguyen luong cu (1 chu ky, gui ngay)
- Neu threshold > 1: chuyen sang `MultiSigMintFlow`

### 4. Cap nhat `mint-validator.ts`

- Khi threshold > 1: thay doi message tu "loi" thanh "thong tin"
- Hien thi: "Can 3 chu ky - su dung Multi-Sig Mint Flow"
- Van cho phep `canMint = true`

### 5. Trang `/mint-requests` (tuy chon)

Trang rieng de Attester 2 va 3 truy cap, xem danh sach request dang cho, va ky. Thuan tien hon viec phai vao Simulator.

## Cac file can tao/sua

| File | Thay doi |
|------|----------|
| Migration SQL | **Moi** - Tao bang `mint_requests` va `mint_signatures` |
| `src/components/simulator/MultiSigMintFlow.tsx` | **Moi** - Giao dien thu thap multi-sig |
| `src/hooks/useMintRequests.ts` | **Moi** - Hook CRUD mint requests va signatures |
| `src/components/simulator/MintButton.tsx` | Sua - Phan luong theo threshold |
| `src/lib/mint-validator.ts` | Sua - Xu ly threshold > 1 |
| `src/pages/Simulator.tsx` | Sua - Tich hop MultiSigMintFlow |
| `src/App.tsx` | Sua - Them route `/mint-requests` (neu can) |

## Cach su dung (huong dan cho 3 Attester)

1. **Attester 1** (tren thiet bi A): Vao `/simulator`, cau hinh PPLP, bam "Tao Mint Request". He thong tu dong ky sig1 va tao Request ID.
2. **Attester 1** gui Request ID cho **Attester 2** va **Attester 3** (qua tin nhan, email...).
3. **Attester 2** (tren thiet bi B): Vao `/simulator` hoac `/mint-requests`, nhap Request ID, xem chi tiet, bam "Ky".
4. **Attester 3** (tren thiet bi C): Tuong tu, nhap Request ID va ky.
5. Khi du 3/3 chu ky, bat ky Attester nao cung bam "Gui giao dich" de mint on-chain.

## Luu y quan trong

- Tat ca 3 chu ky phai ky cung mot bo du lieu (user, actionHash, amount, evidenceHash, nonce)
- Nonce doc 1 lan tu contract khi tao request va luu vao DB
- Request co thoi han (vd: 24 gio) de tranh nonce bi thay doi
- Moi vi chi duoc ky 1 lan cho moi request
- He thong kiem tra `isAttester()` truoc khi cho ky
