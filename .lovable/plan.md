

# Kế hoạch: Thêm Section "Công Thức Phân Phối FUN Money" vào Contract Docs

## Mục tiêu
Thêm section mới vào trang `/contract-docs` giải thích chi tiết **cơ chế Cascading 99%** với các thuật ngữ chính xác từ bảng tính mới.

---

## 1. Nội dung từ bảng tính (thuật ngữ chính xác)

### Bảng 1: Mint FUN Money - Flow cơ bản (3 tầng)

| FLOW | NHẬN | PHÂN PHỐI 99% | GIỮ |
|------|------|---------------|-----|
| **Community Genesis Pool** | 100% | 100% × 99% = 99% | 1% |
| **FUN Platform Pool** | 99% | 99% × 99% = 98,01% | 0,99% |
| **FUN Partner Pool** | 98,01% | - | - |

### Bảng 2: Flow chi tiết (4 tầng - có User)

| FLOW | NHẬN | PHÂN PHỐI 99% | GIỮ |
|------|------|---------------|-----|
| **Community Genesis Pool** | 100,00% | 100% × 99% = 99,00% | 1,00% |
| **FUN Platform Pool** | 99,00% | 99% × 99% = 98,01% | 0,99% |
| **FUN Partner Pool** | 98,01% | 98,01% × 99% = 97,03% | 0,98% |
| **User** | 98,01% × 99% | N/A | N/A |

### Bảng 3: Ví dụ cụ thể - MINT 1.000 FUN

| FLOW | MINT 1.000 FUN | PHÂN PHỐI 99% | GIỮ |
|------|----------------|---------------|-----|
| **Community Genesis Pool** | 1.000 FUN | 100% × 99% = 990 FUN | 10 FUN |
| **FUN Platform Pool** | 990 FUN | 99% × 99% = 980,1 FUN | 9,9 FUN |
| **FUN Partner Pool** | 980,1 FUN | 98,01% × 99% = 970,3 FUN | 9,8 FUN |
| **User** | 970,3 FUN | - | - |

---

## 2. Thiết kế Section mới

### Vị trí
Đặt **sau** section "Token Lifecycle Flow" và **trước** Footer

### Layout

```text
┌─────────────────────────────────────────────────────────────┐
│           💰 Công Thức Phân Phối FUN Money                  │
│                  (Cascading 99%)                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📋 Mô tả ngắn về cơ chế...                                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ TAB 1: Flow 3 Tầng | TAB 2: Flow 4 Tầng | TAB 3: VD │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Table hiển thị theo tab đang chọn]                       │
│                                                             │
│  💡 Key insights                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Chi tiết kỹ thuật

### 3.1 Component mới: `DistributionFormula.tsx`

```typescript
// src/components/contract/DistributionFormula.tsx

interface DistributionRow {
  flow: string;
  flowVi: string;
  receive: string;
  distributeFormula: string;
  distributeResult: string;
  keep: string;
  color: string;
}

// Bảng 1: Flow 3 tầng
const basicFlow: DistributionRow[] = [
  { 
    flow: "Community Genesis Pool", 
    flowVi: "Pool Khởi Nguồn Cộng Đồng",
    receive: "100%", 
    distributeFormula: "100% × 99% =", 
    distributeResult: "99%", 
    keep: "1%",
    color: "violet" 
  },
  { 
    flow: "FUN Platform Pool", 
    flowVi: "Pool Nền Tảng FUN",
    receive: "99%", 
    distributeFormula: "99% × 99% =", 
    distributeResult: "98,01%", 
    keep: "0,99%",
    color: "cyan" 
  },
  { 
    flow: "FUN Partner Pool", 
    flowVi: "Pool Đối Tác FUN",
    receive: "98,01%", 
    distributeFormula: "-", 
    distributeResult: "-", 
    keep: "-",
    color: "green" 
  },
];

// Bảng 2: Flow 4 tầng
const fullFlow: DistributionRow[] = [
  { flow: "Community Genesis Pool", ... keep: "1,00%", ... },
  { flow: "FUN Platform Pool", ... keep: "0,99%", ... },
  { flow: "FUN Partner Pool", ... keep: "0,98%", ... },
  { flow: "User", ... keep: "N/A", ... },
];

// Bảng 3: Ví dụ 1.000 FUN
const exampleFlow = [...];
```

### 3.2 Styling
- Section background: `bg-gradient-to-b from-amber-50/50 via-white to-green-50/50`
- Header gradient: `text-gradient-rainbow`
- Tabs: Sử dụng shadcn/ui Tabs component (3 tabs)
- Table: shadcn/ui Table với styling vibrant
- Row colors theo tầng:
  - Community Genesis Pool: `bg-violet-50 border-l-4 border-violet-400`
  - FUN Platform Pool: `bg-cyan-50 border-l-4 border-cyan-400`
  - FUN Partner Pool: `bg-green-50 border-l-4 border-green-400`
  - User: `bg-pink-50 border-l-4 border-pink-400`

### 3.3 Tab Headers
- Tab 1: "Flow 3 Tầng" 
- Tab 2: "Flow 4 Tầng"
- Tab 3: "Ví Dụ 1.000 FUN"

---

## 4. Các file cần tạo/sửa

| File | Hành động |
|------|-----------|
| `src/components/contract/DistributionFormula.tsx` | **Tạo mới** - Component hiển thị 3 bảng phân phối với tabs |
| `src/pages/ContractDocs.tsx` | **Sửa** - Import và thêm DistributionFormula component sau Token Lifecycle |

---

## 5. Nội dung giải thích tiếng Việt

### Tiêu đề section
**"Công Thức Phân Phối FUN Money (Cascading 99%)"**

### Mô tả ngắn
> Mỗi tầng trong hệ thống nhận FUN và phân phối 99% cho tầng tiếp theo, giữ lại 1% để vận hành. Điều này đảm bảo:
> - 💚 Phần lớn giá trị (~97%) về tay người đóng góp thực sự
> - 🏛️ Mỗi tầng có nguồn lực (~1%) để phát triển và vận hành
> - ♻️ Dòng chảy liên tục, công bằng, không tắc nghẽn

### Giải thích các Pool (thuật ngữ chính xác)
1. **Community Genesis Pool**: Pool khởi nguồn - nhận 100% từ minting ban đầu
2. **FUN Platform Pool**: Pool của từng nền tảng (VD: FUN Academy, FUN Charity...)
3. **FUN Partner Pool**: Pool của đối tác kinh doanh trong hệ sinh thái
4. **User**: Người dùng cuối thực hiện hành động Ánh Sáng

---

## 6. Kết quả mong đợi

Sau khi implement:
- ✅ Section mới với 3 tabs hiển thị 3 bảng phân phối
- ✅ Tab 1: Flow cơ bản 3 tầng
- ✅ Tab 2: Flow đầy đủ 4 tầng có User
- ✅ Tab 3: Ví dụ cụ thể với 1.000 FUN
- ✅ Sử dụng đúng thuật ngữ: Community Genesis Pool, FUN Platform Pool, FUN Partner Pool, User
- ✅ Thiết kế vibrant, responsive, phù hợp với theme hiện tại
- ✅ Tích hợp seamless vào trang Contract Docs

