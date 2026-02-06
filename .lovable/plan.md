
# Kế Hoạch: Sửa Lỗi Contract Không Tồn Tại

## Nguyên Nhân Gốc

Địa chỉ contract `0x1aa8DE8B1E4465C6d729E8564893f8EF823a5ff2` trên BSC Testnet có thể:
- Chưa được deploy
- Đã bị xóa hoặc không còn hoạt động
- Hoặc là địa chỉ placeholder chưa được cập nhật

Khi gọi hàm `paused()` (selector `0x5c975abb`), blockchain trả về dữ liệu trống → ethers.js báo "execution reverted (no data present)".

---

## Giải Pháp

### 1. Thêm Kiểm Tra Contract Tồn Tại

Trước khi gọi các hàm validation, kiểm tra địa chỉ có code không:

```typescript
// src/lib/mint-validator.ts
const code = await provider.getCode(FUN_MONEY_ADDRESS);
if (code === '0x') {
  return {
    canMint: false,
    issues: ['Contract không tồn tại tại địa chỉ này'],
    details: [{
      key: 'contract',
      label: 'Contract Exists',
      labelVi: 'Contract tồn tại',
      passed: false,
      value: 'Not Deployed',
      hint: 'Cần deploy contract hoặc cập nhật địa chỉ đúng'
    }]
  };
}
```

---

### 2. Thêm Cấu Hình Contract Address

Cho phép người dùng nhập địa chỉ contract mới từ Settings:

```text
┌─────────────────────────────────────────────────────────────────────┐
│                     Contract Configuration                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FUN Money Contract Address:                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 0x1aa8DE8B1E4465C6d729E8564893f8EF823a5ff2                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Status: ⚠️ No code at this address                                │
│                                                                     │
│  [ Update Address ]                                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3. Cải Thiện Error Messages

Thay vì chỉ hiển thị "Lỗi kết nối - Failed", hiển thị cụ thể:

| Tình huống | Message hiển thị |
|------------|------------------|
| Contract không tồn tại | "❌ Contract chưa được deploy tại địa chỉ này" |
| Network sai | "❌ Vui lòng chuyển sang BSC Testnet (Chain ID: 97)" |
| ABI không khớp | "❌ ABI không tương thích với contract" |

---

## Các File Cần Sửa

| File | Thay Đổi |
|------|----------|
| `src/lib/mint-validator.ts` | Thêm kiểm tra `getCode()` trước khi validate |
| `src/lib/web3.ts` | Thêm helper `checkContractExists()` |
| `src/components/simulator/MintValidationPanel.tsx` | Cải thiện UI hiển thị lỗi |
| `src/components/simulator/ContractSettings.tsx` | Tạo mới - cho phép cấu hình địa chỉ |

---

## Hướng Dẫn Tiếp Theo Cho Con

Sau khi sửa, con cần:

1. **Xác minh contract đã deploy:** 
   - Truy cập https://testnet.bscscan.com/address/0x1aa8DE8B1E4465C6d729E8564893f8EF823a5ff2
   - Kiểm tra tab "Contract" có code không

2. **Nếu chưa deploy:**
   - Làm theo hướng dẫn trong `docs/FUNMoney-Deploy-Guide.md`
   - Sau khi deploy, copy địa chỉ mới và cập nhật vào app

3. **Nếu đã deploy:**
   - Copy đúng địa chỉ từ BSCScan
   - Cập nhật vào Contract Settings trong Simulator

---

## Kết Quả Mong Đợi

Sau khi implement:
- Hiển thị rõ ràng khi contract không tồn tại
- Cho phép cập nhật địa chỉ contract từ UI
- Hướng dẫn cụ thể các bước cần làm tiếp theo
- Không còn lỗi mơ hồ "execution reverted"
