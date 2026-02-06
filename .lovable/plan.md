
# Kế Hoạch: Trang Documentation Tổng Hợp PPLP & FUN Money

## Mục tiêu
Tạo trang `/documentation` hoàn chỉnh, trực quan với phong cách **Cyan Fresh** để hiển thị toàn bộ thông tin hợp nhất từ tất cả tài liệu về PPLP và FUN Money.

---

## 1. Cấu trúc trang

```text
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER (Sticky - Cyan gradient)                                   │
│  Logo | Navigation | BSCScan Link                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  HERO SECTION (Cyan gradient background)                           │
│  "PPLP Documentation" | "Nền Kinh Tế Ánh Sáng 5D"                  │
│  Quick Stats: 16 Platforms | 5 Pillars | 60+ Actions               │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TAB NAVIGATION (6 tabs - Icon + Label)                            │
│  [Overview] [Minting] [Platforms] [Scoring] [Security] [API]       │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TAB 1: OVERVIEW                                                    │
│  ├── PPLP là gì? (Definition)                                      │
│  ├── FUN Money & Camly Coin                                        │
│  ├── 5 Trụ Cột Ánh Sáng (Visual Cards)                             │
│  ├── System Architecture Diagram                                   │
│  └── Data Flow Visualization                                       │
│                                                                     │
│  TAB 2: MINTING                                                    │
│  ├── Minting Formula: amountAtomic = base × Q × I × K × Ux        │
│  ├── Cascading 99% Distribution (4 pools)                          │
│  ├── Token Lifecycle (LOCKED → ACTIVATED → FLOWING)                │
│  ├── Epoch System & Caps                                           │
│  └── Settlement Lanes (Fast/Review/Auto-approve)                   │
│                                                                     │
│  TAB 3: PLATFORMS                                                  │
│  ├── 16 Platforms Grid                                             │
│  ├── Platform Pool Allocation Chart                                │
│  └── Actions by Platform (Expandable)                              │
│                                                                     │
│  TAB 4: SCORING                                                    │
│  ├── Light Score Formula                                           │
│  ├── Unity Multiplier (Ux) Table                                  │
│  ├── Quality Signals by Platform                                   │
│  ├── Tier System (0-3)                                             │
│  └── Reputation Decay Rules                                        │
│                                                                     │
│  TAB 5: SECURITY                                                   │
│  ├── Anti-Fraud (K multiplier)                                     │
│  ├── Anti-Collusion Rules                                          │
│  ├── Rate Limiting                                                 │
│  ├── Circuit Breakers                                              │
│  ├── Emergency Pause                                               │
│  └── Governance Timelock                                           │
│                                                                     │
│  TAB 6: API & ENGINE                                               │
│  ├── 12 API Endpoints                                              │
│  ├── 8 Database Tables                                             │
│  ├── EIP-712 Signature                                             │
│  └── Multi-sig Attestation                                         │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  FOOTER (Cyan gradient)                                            │
│  Contract Address | Version Info | Links                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Chi tiết các Section

### 2.1. Hero Section
- Background: `bg-gradient-to-br from-cyan-500/20 via-cyan-100 to-sky-100`
- Title: "PPLP Documentation" với `text-gradient-ocean`
- Subtitle: "Proof of Pure Love Protocol - Nền Kinh Tế Ánh Sáng 5D"
- Stats badges:
  - 16 Platforms
  - 60+ Actions
  - 5 Pillars
  - 5M FUN/Day Cap

### 2.2. Tab 1: Overview
**Components cần tạo:**
- `ProtocolDefinition` - Giải thích PPLP, FUN Money, Camly Coin
- `PillarsOverview` - 5 trụ cột với icons và weights
- `ArchitectureDiagram` - Sơ đồ 6 thành phần hệ thống
- `DataFlowDiagram` - User Action → Evidence → Score → Mint → Distribute

### 2.3. Tab 2: Minting
**Components cần tạo:**
- `MintingFormula` - Công thức với giải thích chi tiết
- `CascadingDistribution` - 4-tier flow (sử dụng lại DistributionFormula)
- `TokenLifecycle` - LOCKED → ACTIVATED → FLOWING → RECYCLED
- `EpochSystem` - Epoch duration, caps, rollover rules
- `SettlementLanes` - Fast Lane, Review Lane, Auto-approve

### 2.4. Tab 3: Platforms
**Components cần tạo:**
- `PlatformGrid` - 16 platforms với icons và pool allocation
- `PoolAllocationChart` - Pie/Bar chart hiển thị phân bổ pool
- `ActionsExpander` - Accordion cho actions theo platform

### 2.5. Tab 4: Scoring
**Components cần tạo:**
- `LightScoreFormula` - 0.25×S + 0.20×T + 0.20×H + 0.20×C + 0.15×U
- `UnityMultiplierTable` - Bảng mapping U score → Ux
- `QualitySignals` - Các signals theo platform
- `TierSystem` - Tier 0-3 với requirements
- `ReputationDecay` - 5%/tháng sau 30 ngày inactive

### 2.6. Tab 5: Security
**Components cần tạo:**
- `FraudPenalties` - BOT, SYBIL, COLLUSION, SPAM, WASH
- `AntiCollusionRules` - witnessUniqueness, graphDistance
- `RateLimiting` - Global + per-user limits
- `CircuitBreakers` - 100M/giờ, 500M/ngày
- `EmergencyPause` - Roles, triggers, cooldown
- `GovernanceTimelock` - 48h requirement

### 2.7. Tab 6: API & Engine
**Components cần tạo:**
- `APIEndpoints` - 12 endpoints với descriptions
- `DatabaseSchema` - 8 tables với columns
- `SignatureFlow` - EIP-712 explanation
- `MultisigAttestation` - Threshold 1-5 attesters

---

## 3. Styling - Cyan Fresh Theme

### Color Palette
```css
/* Primary Cyan tones */
bg-cyan-50, bg-cyan-100, bg-cyan-500, bg-cyan-600
text-cyan-600, text-cyan-700, text-cyan-800
border-cyan-200, border-cyan-300, border-cyan-400

/* Gradients */
bg-gradient-to-r from-cyan-500 to-blue-500
bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-100

/* Accent colors for variety */
violet (Pillars), green (Success), pink (User), amber (Warning)
```

### Design Elements
- Cards: `bg-white/80 backdrop-blur-sm border-cyan-200 shadow-lg`
- Tabs: `bg-cyan-50 hover:bg-cyan-100 data-[state=active]:bg-cyan-500`
- Icons: `text-cyan-500` primary, various colors for categories
- Buttons: `bg-cyan-500 hover:bg-cyan-600 text-white`
- Section dividers: `bg-gradient-to-r from-transparent via-cyan-300 to-transparent`

---

## 4. Các file cần tạo

| File | Mô tả |
|------|-------|
| `src/pages/Documentation.tsx` | Trang chính với 6 tabs |
| `src/components/docs/DocsHero.tsx` | Hero section |
| `src/components/docs/OverviewTab.tsx` | Tab Overview content |
| `src/components/docs/MintingTab.tsx` | Tab Minting content |
| `src/components/docs/PlatformsTab.tsx` | Tab Platforms content |
| `src/components/docs/ScoringTab.tsx` | Tab Scoring content |
| `src/components/docs/SecurityTab.tsx` | Tab Security content |
| `src/components/docs/ApiTab.tsx` | Tab API & Engine content |
| `src/data/docs-data.ts` | Data structures cho tất cả nội dung |

### File cần sửa
| File | Thay đổi |
|------|----------|
| `src/App.tsx` | Thêm route `/documentation` |
| `src/pages/Index.tsx` | Thêm link Documentation vào nav + footer |

---

## 5. Nội dung chi tiết từ tài liệu

### 5.1. Minting Formula
```
amountAtomic = baseRewardAtomic × Q × I × K × Ux
```
- **Q (Quality)**: 0.5 - 3.0
- **I (Impact)**: 0.5 - 5.0  
- **K (Integrity)**: 0.0 - 1.0
- **Ux (Unity)**: 0.5 - 2.5

### 5.2. Light Score
```
LightScore = 0.25×S + 0.20×T + 0.20×H + 0.20×C + 0.15×U
```
- S (Service): 25%
- T (Truth): 20%
- H (Healing): 20%
- C (Contribution): 20%
- U (Unity): 15%

### 5.3. Platform Pools (từ Policy v1.0.2)
```
FUN_ACADEMY: 1,000,000 FUN
FUN_CHARITY: 750,000 FUN
FUN_EARTH: 750,000 FUN
FUNLIFE: 500,000 FUN
... (16 platforms)
```

### 5.4. Anti-Fraud K Multipliers
```
BOT: K = 0.0, Ban 30 days
SYBIL: K = 0.0, Ban 60 days
COLLUSION: K = 0.2, Review, Ban 14 days
SPAM: K = 0.3, Reject, Ban 7 days
WASH: K = 0.0, Review, Ban 30 days
```

### 5.5. Circuit Breakers
```
maxMintPerHourAtomic: 100,000,000 FUN
maxMintPerDayAtomic: 500,000,000 FUN
Action on break: PAUSE_AND_ALERT
```

### 5.6. API Endpoints
```
POST /v1/action/submit
POST /v1/mint/request
GET /v1/user/{id}/reputation
POST /v1/fraud/signals
... (12 endpoints)
```

### 5.7. Database Tables
```
users, actions, scores, mint_requests,
attestations, epochs, fraud_signals, reputation_history
```

---

## 6. Tính năng đặc biệt

### 6.1. Interactive Elements
- Hover tooltips cho các thuật ngữ kỹ thuật
- Expandable sections cho nội dung dài
- Copy-to-clipboard cho code snippets
- Anchor links cho deep-linking

### 6.2. Visual Diagrams
- Architecture diagram với icons
- Token lifecycle flow animation
- Pool allocation pie chart (recharts)
- Tier progression visualization

### 6.3. Mobile Responsive
- Tab navigation chuyển thành dropdown trên mobile
- Cards stack vertically
- Collapsible sections cho nội dung dài

---

## 7. Kết quả mong đợi

Sau khi implement:
- Trang `/documentation` với 6 tabs chứa toàn bộ thông tin
- Phong cách Cyan Fresh tươi sáng, chuyên nghiệp
- Responsive trên mọi thiết bị
- Dễ navigate với anchor links
- Tích hợp data từ tất cả tài liệu đã cung cấp
- Links đến Contract Docs và Simulator
