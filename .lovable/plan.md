
# Kế Hoạch: Chuyển Đổi Sang Phong Cách Tươi Sáng Hào Quang Vũ Trụ

## Mục Tiêu
Chuyển tất cả tiêu đề, đề mục từ màu tối sang màu tươi sáng rực rỡ, tạo hiệu ứng "tỏa sáng hào quang vũ trụ" cho toàn bộ trang web.

---

## 1. Các Vị Trí Cần Sửa

### 1.1. Trang Index (`src/pages/Index.tsx`)
| Dòng | Hiện tại | Chuyển sang |
|------|----------|-------------|
| 21 | `text-foreground` (nav links) | `text-cyan-600` |

### 1.2. Hero Section (`src/components/HeroSection.tsx`)
| Dòng | Hiện tại | Chuyển sang |
|------|----------|-------------|
| 21 | `text-foreground` (Nền Kinh Tế) | `text-gradient-rainbow` hoặc `text-cyan-600` |
| 35, 45, 55 | `text-foreground` (stats numbers) | Màu tương ứng với icon |

### 1.3. Pillars Section (`src/components/PillarsSection.tsx`)
| Dòng | Hiện tại | Chuyển sang |
|------|----------|-------------|
| 62 | "5 Trụ Cột" không có gradient | Thêm `text-gradient-rainbow` |
| 88 | `font-display text-lg font-semibold` (namevi) | Thêm màu sáng |

### 1.4. Platforms Section (`src/components/PlatformsSection.tsx`)
| Dòng | Hiện tại | Chuyển sang |
|------|----------|-------------|
| 15 | "Hợp Nhất" không có màu | Thêm `text-cyan-600` hoặc gradient |

### 1.5. Documentation Tabs - Overview (`src/components/docs/OverviewTab.tsx`)
| Dòng | Hiện tại | Chuyển sang |
|------|----------|-------------|
| 39 | `text-foreground` (PPLP strong) | `text-cyan-600` |
| 84 | `text-foreground` (pillar nameVi) | `text-cyan-700` |
| 91 | `text-foreground` (pillar nameVi) | Màu tương ứng pillar |
| 118 | `text-foreground` (architecture names) | `text-cyan-700` |

### 1.6. Documentation Tabs - Security (`src/components/docs/SecurityTab.tsx`)
| Dòng | Hiện tại | Chuyển sang |
|------|----------|-------------|
| 156 | `text-red-600` (Circuit Breakers CardTitle) | `text-amber-600` (cảnh báo nhẹ nhàng hơn) |
| 192 | `text-red-600` (Emergency Pause CardTitle) | `text-amber-600` |
| 84, 97, 110 | `text-foreground` (Anti-collusion titles) | `text-violet-600`, `text-cyan-600`, `text-amber-600` |

### 1.7. Documentation Tabs - Scoring (`src/components/docs/ScoringTab.tsx`)
- Kiểm tra các `text-foreground` và chuyển sang màu sáng tương ứng

### 1.8. Documentation Tabs - API (`src/components/docs/ApiTab.tsx`)
- Kiểm tra các `text-foreground` và chuyển sang màu sáng

### 1.9. Distribution Formula (`src/components/contract/DistributionFormula.tsx`)
| Dòng | Hiện tại | Chuyển sang |
|------|----------|-------------|
| 191, 274, 285, 299 | `text-foreground` (flow names, section titles) | Màu sáng tương ứng |

### 1.10. Contract Docs (`src/pages/ContractDocs.tsx`)
| Dòng | Hiện tại | Chuyển sang |
|------|----------|-------------|
| 87, 104 | `text-foreground` (section titles) | `text-cyan-700` |

### 1.11. Data file (`src/data/docs-data.ts`)
- Không thay đổi (chỉ data, không phải style)

---

## 2. Bảng Màu Tươi Sáng Mới

```text
Tiêu đề chính:       text-gradient-rainbow hoặc text-gradient-ocean
Tiêu đề phụ:         text-cyan-600 / text-cyan-700
CardTitle:           text-cyan-700 (thay vì text-cyan-700 giữ nguyên)
Cảnh báo Security:   text-amber-600 (thay vì text-red-600)
Strong text:         text-cyan-600 / text-violet-600
Pillar names:        Giữ màu tương ứng từng pillar (pink, cyan, yellow, green, violet)
Architecture:        text-cyan-700
Stats numbers:       Màu tương ứng icon
```

---

## 3. Các File Cần Sửa

| File | Số lượng thay đổi | Mô tả |
|------|-------------------|-------|
| `src/pages/Index.tsx` | 1 | Nav hover color |
| `src/components/HeroSection.tsx` | 4 | Hero title, stats |
| `src/components/PillarsSection.tsx` | 2 | Section title, card names |
| `src/components/PlatformsSection.tsx` | 1 | "Hợp Nhất" text |
| `src/components/MantrasSection.tsx` | 1 | Section title |
| `src/components/docs/OverviewTab.tsx` | 5+ | Strong text, names |
| `src/components/docs/SecurityTab.tsx` | 6+ | CardTitles, headings |
| `src/components/docs/ScoringTab.tsx` | 4+ | Titles, headings |
| `src/components/docs/ApiTab.tsx` | 3+ | Headings |
| `src/components/docs/MintingTab.tsx` | 3+ | Headings |
| `src/components/docs/PlatformsTab.tsx` | 2+ | Headings |
| `src/components/contract/DistributionFormula.tsx` | 5+ | Flow names, titles |
| `src/pages/ContractDocs.tsx` | 2 | Section titles |

---

## 4. Kết Quả Mong Đợi

Sau khi hoàn thành:
- Tất cả tiêu đề sẽ có màu tươi sáng (cyan, violet, pink, green, amber)
- Không còn `text-foreground` cho các tiêu đề chính
- `text-red-600` trong Security sẽ chuyển sang `text-amber-600` (cảnh báo nhẹ nhàng)
- Toàn bộ giao diện tỏa sáng hào quang vũ trụ với gradient rainbow và ocean
- Giữ nguyên chức năng, chỉ thay đổi màu sắc

---

## 5. Chi Tiết Kỹ Thuật

### Thay đổi chính:
- `text-foreground` → `text-cyan-600` / `text-cyan-700` / `text-violet-600`
- `text-red-600` (Security warnings) → `text-amber-600` / `text-amber-500`
- Thêm `text-gradient-rainbow` cho tiêu đề section chính
- Stats numbers: dùng màu tương ứng với icon (cyan-600, violet-600, green-600)

### Nguyên tắc màu:
- Cyan: Tiêu đề chính, thông tin trung tính
- Violet: Governance, Unity, staking
- Pink: User, Love, Service
- Green: Success, Contribution, flowing
- Amber: Cảnh báo nhẹ (thay vì đỏ)
- Yellow: Healing, Sparkles
