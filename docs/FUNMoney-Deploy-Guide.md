# 🚀 Hướng Dẫn Deploy FUN Money Smart Contract

## Mục Lục
1. [Chuẩn bị](#1-chuẩn-bị)
2. [Cài đặt MetaMask](#2-cài-đặt-metamask)
3. [Thêm BSC Testnet](#3-thêm-bsc-testnet)
4. [Lấy BNB Testnet](#4-lấy-bnb-testnet)
5. [Mở Remix IDE](#5-mở-remix-ide)
6. [Tạo File Contract](#6-tạo-file-contract)
7. [Compile Contract](#7-compile-contract)
8. [Deploy Contract](#8-deploy-contract)
9. [Verify trên BSCScan](#9-verify-trên-bscscan)
10. [Test Functions](#10-test-functions)

---

## 1. Chuẩn Bị

### Yêu cầu:
- ✅ Máy tính có trình duyệt Chrome/Firefox/Brave
- ✅ Kết nối internet ổn định
- ✅ Có sẵn code Smart Contract FUN Money v1.3.0

### Thời gian dự kiến: 30-45 phút

---

## 2. Cài Đặt MetaMask

### Bước 2.1: Cài Extension
1. Mở trình duyệt Chrome
2. Truy cập: **https://metamask.io/download/**
3. Click **"Install MetaMask for Chrome"**
4. Click **"Add to Chrome"** → **"Add extension"**

### Bước 2.2: Tạo Wallet
1. Click icon MetaMask (hình con cáo) trên thanh extension
2. Click **"Get Started"**
3. Chọn **"Create a Wallet"**
4. Đặt mật khẩu (ít nhất 8 ký tự) → Click **"Create"**
5. **⚠️ QUAN TRỌNG**: Ghi lại 12 từ Secret Recovery Phrase ra giấy
6. Xác nhận lại các từ theo thứ tự → Click **"Confirm"**

### Bước 2.3: Kiểm tra
- Wallet đã sẵn sàng khi thấy giao diện với địa chỉ ví (0x...)

---

## 3. Thêm BSC Testnet

### Bước 3.1: Mở Network Settings
1. Click icon MetaMask
2. Click vào **dropdown mạng** ở trên cùng (mặc định là "Ethereum Mainnet")
3. Click **"Add network"** (hoặc "Show/hide test networks" nếu chưa thấy)

### Bước 3.2: Thêm mạng thủ công
Click **"Add a network manually"** và điền:

| Field | Giá trị |
|-------|---------|
| **Network Name** | `BNB Smart Chain Testnet` |
| **New RPC URL** | `https://data-seed-prebsc-1-s1.binance.org:8545/` |
| **Chain ID** | `97` |
| **Currency Symbol** | `tBNB` |
| **Block Explorer URL** | `https://testnet.bscscan.com` |

### Bước 3.3: Lưu và chuyển mạng
1. Click **"Save"**
2. Chọn **"BNB Smart Chain Testnet"** từ dropdown

---

## 4. Lấy BNB Testnet (Miễn phí)

### Bước 4.1: Copy địa chỉ ví
1. Click icon MetaMask
2. Click vào địa chỉ ví (0x...) để copy

### Bước 4.2: Truy cập Faucet
1. Mở tab mới, truy cập: **https://testnet.bnbchain.org/faucet-smart**
2. Hoặc backup: **https://www.bnbchain.org/en/testnet-faucet**

### Bước 4.3: Nhận BNB
1. Paste địa chỉ ví vào ô input
2. Hoàn thành captcha (nếu có)
3. Click **"Give me BNB"** hoặc **"Get Funded"**
4. Chờ 30 giây - 1 phút

### Bước 4.4: Kiểm tra
- Mở MetaMask, số dư sẽ hiện **0.3 - 0.5 tBNB**
- Đủ để deploy nhiều contract

> **💡 Mẹo**: Nếu faucet không hoạt động, thử faucet khác:
> - https://faucet.quicknode.com/binance-smart-chain/bnb-testnet

---

## 5. Mở Remix IDE

### Bước 5.1: Truy cập Remix
1. Mở tab mới
2. Truy cập: **https://remix.ethereum.org**

### Bước 5.2: Làm quen giao diện

```
┌─────────────────────────────────────────────────────────────┐
│  📁 File Explorer  │  📝 Editor Area          │  Terminal   │
│  (bên trái)       │  (chính giữa)             │  (bên dưới) │
│                   │                           │             │
│  contracts/       │  // Code hiển thị ở đây   │  Logs...    │
│  scripts/         │                           │             │
│  tests/           │                           │             │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────┐
│ Sidebar Icons:   │
│ 📁 File Explorer │
│ 🔍 Search        │
│ ⚙️ Solidity      │  ← Compiler
│ 🚀 Deploy        │  ← Deploy & Run
│ 🧪 Tests         │
└──────────────────┘
```

---

## 6. Tạo File Contract

### Bước 6.1: Tạo file mới
1. Trong **File Explorer** (bên trái)
2. Click icon **"Create New File"** (📄+)
3. Đặt tên: `FUNMoney.sol`
4. Nhấn Enter

### Bước 6.2: Paste code
1. Mở file `FUNMoney.sol` vừa tạo
2. Xóa hết nội dung mặc định (nếu có)
3. **Copy toàn bộ code Smart Contract FUN Money** của con
4. **Paste vào editor**

### Bước 6.3: Kiểm tra
- Đảm bảo code bắt đầu bằng `// SPDX-License-Identifier: MIT`
- Không có lỗi syntax (sẽ thấy dấu ❌ đỏ nếu có lỗi)

---

## 7. Compile Contract

### Bước 7.1: Mở Solidity Compiler
1. Click icon **⚙️ Solidity Compiler** trên sidebar (icon thứ 3)

### Bước 7.2: Cấu hình Compiler

| Setting | Giá trị |
|---------|---------|
| **Compiler Version** | `0.8.20+commit.a1b79de6` |
| **Language** | Solidity |
| **EVM Version** | default (paris) |
| **Enable Optimization** | ✅ Checked |
| **Optimization Runs** | `200` |

### Bước 7.3: Compile
1. Click nút **"Compile FUNMoney.sol"** (màu xanh)
2. Chờ 5-10 giây

### Bước 7.4: Kiểm tra kết quả
- ✅ **Thành công**: Thấy checkmark xanh ✓ bên cạnh tên file
- ❌ **Lỗi**: Đọc error message và sửa code

> **Lỗi thường gặp:**
> - `ParserError`: Thiếu dấu `;` hoặc `}`
> - `TypeError`: Sai tên biến hoặc function
> - `DeclarationError`: Khai báo trùng tên

---

## 8. Deploy Contract

### Bước 8.1: Mở Deploy Panel
1. Click icon **🚀 Deploy & Run Transactions** trên sidebar (icon thứ 4)

### Bước 8.2: Cấu hình Environment

| Setting | Giá trị |
|---------|---------|
| **Environment** | `Injected Provider - MetaMask` |
| **Account** | Sẽ tự hiện địa chỉ ví của con |
| **Gas Limit** | `3000000` (giữ mặc định) |
| **Value** | `0` |

### Bước 8.3: Kết nối MetaMask
1. MetaMask sẽ popup yêu cầu kết nối
2. Chọn account → Click **"Next"**
3. Click **"Connect"**

### Bước 8.4: Chọn Contract
- Trong dropdown **"Contract"**, chọn: `FUNMoneyProductionV1_3_0`
- (Hoặc tên contract chính trong code của con)

### Bước 8.5: Điền Constructor Parameters

Con cần chuẩn bị 4 địa chỉ ví (có thể dùng cùng 1 địa chỉ để test):

```
┌─────────────────────────────────────────────────────────────┐
│ Constructor Parameters:                                      │
├─────────────────────────────────────────────────────────────┤
│ _gov:        [Địa chỉ ví Guardian Governance]               │
│ _community:  [Địa chỉ ví Community Pool]                    │
│ attesters:   ["0x...", "0x..."]  ← Mảng các attester        │
│ threshold:   2  ← Số chữ ký cần thiết                       │
└─────────────────────────────────────────────────────────────┘
```

**Ví dụ (dùng địa chỉ của con để test):**
```
_gov: 0xYourWalletAddress
_community: 0xYourWalletAddress
attesters: ["0xYourWalletAddress"]
threshold: 1
```

### Bước 8.6: Deploy
1. Kiểm tra lại tất cả parameters
2. Click nút **"Deploy"** (màu cam)
3. MetaMask popup → Kiểm tra gas fee
4. Click **"Confirm"**

### Bước 8.7: Chờ xác nhận
- Chờ 10-30 giây
- Xem transaction trong Terminal của Remix
- Khi thấy **"✓ contract deployed"** → Thành công!

### Bước 8.8: Lưu Contract Address
1. Trong panel **"Deployed Contracts"** (bên dưới)
2. Click icon **copy** bên cạnh tên contract
3. **⚠️ LƯU ĐỊA CHỈ NÀY LẠI** - Đây là địa chỉ contract của con

---

## 9. Verify trên BSCScan

### Bước 9.1: Mở BSCScan
1. Truy cập: **https://testnet.bscscan.com**
2. Paste địa chỉ contract vào thanh tìm kiếm
3. Nhấn Enter

### Bước 9.2: Verify Contract
1. Click tab **"Contract"**
2. Click **"Verify and Publish"**

### Bước 9.3: Điền thông tin

| Field | Giá trị |
|-------|---------|
| **Contract Address** | [Địa chỉ contract] |
| **Compiler Type** | `Solidity (Single file)` |
| **Compiler Version** | `v0.8.20+commit.a1b79de6` |
| **License** | `MIT` |

### Bước 9.4: Paste Source Code
1. Paste toàn bộ code Solidity
2. Nếu dùng optimization: chọn **"Yes"** với **200 runs**

### Bước 9.5: Điền Constructor Arguments
1. Encode constructor parameters (ABI-encoded)
2. Có thể dùng tool: https://abi.hashex.org/

### Bước 9.6: Submit
- Click **"Verify and Publish"**
- Chờ 1-2 phút
- ✅ Thành công: Thấy checkmark xanh trên contract

---

## 10. Test Functions

### Bước 10.1: Trong Remix
Sau khi deploy, trong panel **"Deployed Contracts"**:

1. **Mở rộng contract** bằng cách click vào tên
2. Sẽ thấy danh sách tất cả functions

### Bước 10.2: Test Read Functions (miễn phí)

| Function | Mô tả | Kết quả mong đợi |
|----------|-------|------------------|
| `name` | Tên token | "FUN Money" |
| `symbol` | Symbol | "FUN" |
| `decimals` | Số thập phân | 18 |
| `totalSupply` | Tổng cung | 0 (ban đầu) |
| `paused` | Trạng thái pause | false |
| `guardianGov` | Địa chỉ governance | [Địa chỉ đã set] |
| `communityPool` | Địa chỉ community | [Địa chỉ đã set] |

### Bước 10.3: Test Write Functions (tốn gas)

1. **govRegisterAction**: Đăng ký action mới
   ```
   name: "meditation"
   version: 1
   ```
   → Click → Confirm trong MetaMask

2. **govPauseTransitions**: Test pause
   ```
   paused: true
   ```
   → Kiểm tra bằng `pauseTransitions()` → Phải trả về `true`

3. **govPauseTransitions**: Unpause
   ```
   paused: false
   ```

### Bước 10.4: Xem Events
1. Sau mỗi transaction, xem trong **Terminal** của Remix
2. Hoặc xem trên BSCScan → Tab **"Events"**

---

## 📋 Checklist Sau Deploy

- [ ] Contract đã deploy thành công
- [ ] Đã lưu địa chỉ contract
- [ ] Đã verify trên BSCScan
- [ ] Test `name()` trả về "FUN Money"
- [ ] Test `symbol()` trả về "FUN"
- [ ] Test `guardianGov()` trả về đúng địa chỉ
- [ ] Test `communityPool()` trả về đúng địa chỉ
- [ ] Test `govRegisterAction()` hoạt động
- [ ] Test `paused()` trả về false

---

## 🆘 Troubleshooting

### Lỗi: "Gas estimation failed"
- **Nguyên nhân**: Parameters sai hoặc logic revert
- **Cách sửa**: Kiểm tra lại constructor parameters

### Lỗi: "Insufficient funds"
- **Nguyên nhân**: Không đủ BNB
- **Cách sửa**: Lấy thêm BNB từ faucet

### Lỗi: "Nonce too high"
- **Nguyên nhân**: MetaMask cache cũ
- **Cách sửa**: Settings → Advanced → Reset Account

### Lỗi: "Contract creation failed"
- **Nguyên nhân**: Code quá lớn hoặc lỗi logic
- **Cách sửa**: Tăng gas limit hoặc kiểm tra code

---

## 🎉 Hoàn Thành!

Chúc mừng con đã deploy thành công FUN Money Smart Contract!

### Bước tiếp theo:
1. **Testnet**: Test kỹ tất cả functions
2. **Audit**: Gửi code cho auditor review
3. **Mainnet**: Deploy lên BSC Mainnet sau khi audit pass

---

## 📚 Tài Liệu Tham Khảo

- [Remix IDE Docs](https://remix-ide.readthedocs.io/)
- [BSC Testnet Docs](https://docs.bnbchain.org/docs/getting-started/bsc-testnet)
- [Solidity Docs](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

---

*Tài liệu này được tạo cho FUN Money v1.3.0 - Proof of Pure Love Protocol*
