
# Kế hoạch: Tạo trang Contract Documentation cho FUN Money

## Mục tiêu
- Tạo trang web mới `/contract-docs` hiển thị giải thích chi tiết tất cả **20 Read Functions** và **12 Write Functions** của FUN Money Smart Contract
- Thiết kế theo phong cách vibrant mới, dễ đọc, có thể tra cứu nhanh
- Bao gồm thông tin chi tiết: tên hàm, mô tả, parameters, return values, và ví dụ sử dụng

---

## 1. Phân tích 32 Functions từ ảnh và source code

### 20 Read Contract Functions (Miễn phí - chỉ đọc dữ liệu)

| # | Function | Mô tả |
|---|----------|-------|
| 1 | `MAX_SIGS` | Số lượng chữ ký tối đa cho multisig (hằng số) |
| 2 | `PPLP_TYPEHASH` | Hash định danh EIP-712 cho cấu trúc PPLP (dùng để verify signatures) |
| 3 | `actions(bytes32)` | Tra cứu action đã đăng ký theo keccak256 hash (trả về version, deprecated status) |
| 4 | `alloc(address)` | Xem số token Locked và Activated của một địa chỉ |
| 5 | `attesterThreshold` | Số chữ ký attester tối thiểu để mint được FUN |
| 6 | `balanceOf(address)` | Số dư FUN có thể chuyển tự do (đã CLAIM) của địa chỉ |
| 7 | `communityPool` | Địa chỉ Community Pool (nhận 99% token) |
| 8 | `decimals` | Số thập phân của token (18) |
| 9 | `epochDuration` | Độ dài mỗi epoch tính bằng giây |
| 10 | `epochMintCap` | Giới hạn mint tối đa mỗi epoch (atomic) |
| 11 | `epochs(uint256)` | Thông tin epoch: thời gian, tổng mint, số actions |
| 12 | `guardianGov` | Địa chỉ Guardian Governance (có quyền admin) |
| 13 | `isAttester(address)` | Kiểm tra địa chỉ có phải Attester hợp lệ không |
| 14 | `name` | Tên token ("FUN Money") |
| 15 | `nonces(address)` | Nonce hiện tại của địa chỉ (chống replay attack) |
| 16 | `pauseTransitions` | Trạng thái pause của hệ thống (true/false) |
| 17 | `symbol` | Symbol token ("FUN") |
| 18 | `totalActivated` | Tổng số token đang ở trạng thái ACTIVATED |
| 19 | `totalLocked` | Tổng số token đang ở trạng thái LOCKED |
| 20 | `totalSupply` | Tổng cung token hiện tại |

### 12 Write Contract Functions (Tốn gas - thay đổi state)

| # | Function | Mô tả |
|---|----------|-------|
| 1 | `activate(uint256)` | Chuyển token từ LOCKED sang ACTIVATED |
| 2 | `approve(address, uint256)` | Phê duyệt địa chỉ khác được chi tiêu token của mình (ERC-20) |
| 3 | `claim(uint256)` | Rút token từ ACTIVATED vào ví cá nhân (FLOWING) |
| 4 | `govDeprecateAction(string)` | Vô hiệu hóa một action type (chỉ Gov) |
| 5 | `govPauseTransitions(bool)` | Pause/Unpause toàn hệ thống (chỉ Gov) |
| 6 | `govRecycleExcessToCommunity(uint256)` | Chuyển token dư về Community Pool (chỉ Gov) |
| 7 | `govRegisterAction(string, uint256)` | Đăng ký action type mới với version (chỉ Gov) |
| 8 | `govSetAttester(address, bool)` | Thêm/xóa Attester (chỉ Gov) |
| 9 | `govSetAttesterThreshold(uint256)` | Đặt số chữ ký tối thiểu (chỉ Gov) |
| 10 | `lockWithPPLP(...)` | Mint token mới vào trạng thái LOCKED (cần chữ ký Attester) |
| 11 | `transfer(address, uint256)` | Chuyển token cho địa chỉ khác (ERC-20) |
| 12 | `transferFrom(address, address, uint256)` | Chuyển token thay mặt người khác (ERC-20) |

---

## 2. Cấu trúc trang mới

### 2.1 File mới: `src/pages/ContractDocs.tsx`

Layout trang:
- Header với nút Back và title "FUN Money Contract Documentation"
- Link tới BSCScan contract
- 2 Tabs: "Read Functions" và "Write Functions"
- Mỗi function hiển thị trong Card với:
  - Tên hàm + icon loại (Read/Write)
  - Function Selector (hex)
  - Mô tả tiếng Việt dễ hiểu
  - Parameters (nếu có)
  - Return Values
  - Ví dụ sử dụng

### 2.2 Cập nhật `src/App.tsx`
- Thêm route `/contract-docs`

### 2.3 Cập nhật `src/pages/Index.tsx`
- Thêm link điều hướng tới trang Contract Docs

---

## 3. Chi tiết kỹ thuật

### 3.1 Data Structure cho Functions

```typescript
interface ContractFunction {
  name: string;
  selector: string; // 0x...
  type: 'read' | 'write';
  category: 'token' | 'lifecycle' | 'governance' | 'system';
  description: string;
  descriptionVi: string;
  parameters?: {
    name: string;
    type: string;
    description: string;
  }[];
  returns?: {
    name: string;
    type: string;
    description: string;
  }[];
  example?: string;
  note?: string;
}
```

### 3.2 Component Structure

```text
src/pages/ContractDocs.tsx
|-- Header (Back button + Title + BSCScan link)
|-- Tabs (Read / Write)
    |-- FunctionCard (repeated for each function)
        |-- Name + Selector
        |-- Description (Vietnamese)
        |-- Parameters accordion
        |-- Returns accordion
        |-- Example code block
        |-- Notes/Warnings
```

### 3.3 Styling
- Sử dụng theme vibrant mới (cyan, violet gradients)
- Read functions: Badge màu xanh lá (green-500)
- Write functions: Badge màu hồng/cam (orange-500)
- Governance functions: Badge màu tím (violet-500)
- Token lifecycle: Badge màu xanh biển (cyan-500)

---

## 4. Nội dung giải thích chi tiết

### Read Functions - Giải thích tiếng Việt

1. **MAX_SIGS** - Số lượng chữ ký tối đa được hỗ trợ trong hệ thống multisig (hằng số bất biến)

2. **PPLP_TYPEHASH** - Hash EIP-712 dùng để xác thực chữ ký off-chain của Attesters

3. **actions(bytes32)** - Tra cứu thông tin action type đã đăng ký. Trả về version và trạng thái deprecated

4. **alloc(address)** - Xem chi tiết phân bổ token của một địa chỉ: bao nhiêu đang Locked, bao nhiêu đã Activated

5. **attesterThreshold** - Số chữ ký Attester tối thiểu cần để thực hiện mint. Ví dụ: nếu = 2, cần ít nhất 2 Attesters ký

6. **balanceOf(address)** - Số FUN có thể chuyển tự do. Đây là số dư thực sự sau khi đã CLAIM

7. **communityPool** - Địa chỉ ví Community Pool - nơi nhận 99% token và token thu hồi

8. **decimals** - Số thập phân = 18 (1 FUN = 10^18 atomic units)

9. **epochDuration** - Thời gian mỗi epoch (mặc định 86400 giây = 1 ngày)

10. **epochMintCap** - Giới hạn mint mỗi epoch để kiểm soát lạm phát

11. **epochs(uint256)** - Thông tin chi tiết của epoch theo ID: thời gian, tổng mint, số actions

12. **guardianGov** - Địa chỉ có quyền quản trị cao nhất (Guardian Governance)

13. **isAttester(address)** - Kiểm tra một địa chỉ có phải Attester được ủy quyền không

14. **name** - Tên đầy đủ của token: "FUN Money"

15. **nonces(address)** - Nonce hiện tại của mỗi địa chỉ, tăng sau mỗi lần mint để chống replay

16. **pauseTransitions** - Nếu = true, hệ thống đang tạm dừng mọi thao tác mint/transfer

17. **symbol** - Ký hiệu token: "FUN"

18. **totalActivated** - Tổng số FUN đang ở trạng thái Activated (chưa claim vào ví)

19. **totalLocked** - Tổng số FUN đang ở trạng thái Locked (mới mint, chưa activate)

20. **totalSupply** - Tổng cung FUN đã được mint (bao gồm cả locked, activated, và flowing)

### Write Functions - Giải thích tiếng Việt

1. **activate(uint256)** - Chuyển token từ LOCKED sang ACTIVATED. Đây là bước 2 trong quy trình sở hữu FUN

2. **approve(address, uint256)** - Cho phép địa chỉ khác chi tiêu một lượng FUN nhất định từ ví của bạn

3. **claim(uint256)** - Rút token ACTIVATED vào số dư chính. Đây là bước 3 - token giờ có thể chuyển tự do

4. **govDeprecateAction(string)** - Vô hiệu hóa một loại action, không cho mint với action đó nữa (chỉ Gov)

5. **govPauseTransitions(bool)** - Tạm dừng/mở lại toàn bộ hệ thống trong trường hợp khẩn cấp (chỉ Gov)

6. **govRecycleExcessToCommunity(uint256)** - Thu hồi token dư thừa về Community Pool (chỉ Gov)

7. **govRegisterAction(string, uint256)** - Đăng ký loại action mới để có thể mint FUN (chỉ Gov)

8. **govSetAttester(address, bool)** - Thêm (true) hoặc xóa (false) một địa chỉ khỏi danh sách Attester (chỉ Gov)

9. **govSetAttesterThreshold(uint256)** - Thay đổi số chữ ký tối thiểu cần để mint (chỉ Gov)

10. **lockWithPPLP(...)** - Function chính để mint FUN mới. Cần chữ ký EIP-712 từ Attester. Token vào trạng thái LOCKED

11. **transfer(address, uint256)** - Chuyển FUN từ ví bạn sang địa chỉ khác (tiêu chuẩn ERC-20)

12. **transferFrom(address, address, uint256)** - Chuyển FUN thay mặt người khác (cần approve trước)

---

## 5. Các file cần tạo/sửa

| File | Hành động |
|------|-----------|
| `src/pages/ContractDocs.tsx` | Tạo mới - Trang documentation chính |
| `src/data/contract-functions.ts` | Tạo mới - Data 32 functions với giải thích |
| `src/components/contract/FunctionCard.tsx` | Tạo mới - Component hiển thị mỗi function |
| `src/App.tsx` | Sửa - Thêm route /contract-docs |
| `src/pages/Index.tsx` | Sửa - Thêm link điều hướng |

---

## 6. Kết quả mong đợi

Sau khi implement:
- Trang `/contract-docs` hiển thị đầy đủ 32 functions
- Giải thích tiếng Việt dễ hiểu cho người không chuyên
- Có thể tra cứu nhanh theo category
- Link trực tiếp tới BSCScan để test functions
- Thiết kế đẹp, phù hợp với theme vibrant mới của ứng dụng
