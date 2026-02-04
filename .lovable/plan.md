

# 🌟 FUN ECOSYSTEM MVP - Implementation Plan

## Tổng quan dự án
Xây dựng MVP cho FUN Ecosystem - Nền Kinh tế Ánh Sáng 5D, bao gồm PPLP Engine Simulator và FUN Wallet Earn UI, dựa trên Policy JSON v1.0.2.

---

## Phase 1: Foundation & Policy Engine (Tuần 1-2)

### 1.1 Policy v1.0.2 Complete JSON
- Gộp toàn bộ Policy v1.0.1 + 7 modules mới (Emergency, Governance, Migration, Edge Cases, Rate Limiting, Reputation Decay, Cross-platform Bonus)
- Tạo file `pplp-policy-v1.0.2.json` hoàn chỉnh, production-ready
- Validate schema và logic consistency

### 1.2 PPLP Scoring Engine (TypeScript)
- Implement Light Score calculation: `0.25*S + 0.20*T + 0.20*H + 0.20*C + 0.15*U`
- Implement Unity Score với 5 signals (collaboration, beneficiaryConfirmed, communityEndorsement, bridgeValue, conflictResolution)
- Implement Mint Formula: `amountAtomic = BR × Q × I × K × Ux`
- Tier system (0-3) với cap limits
- Anti-fraud checks (K multiplier validation)

### 1.3 Data Models & Types
- TypeScript interfaces cho Policy, Action, User, Reputation
- Enum definitions cho platforms, actionTypes, fraudTypes
- Validation schemas với Zod

---

## Phase 2: Simulator Dashboard (Tuần 2-3)

### 2.1 Landing Page - FUN Ecosystem
- Hero section với vision "5D Light Economy"
- Giới thiệu 16 platforms (icons + descriptions)
- 8 Divine Mantras hiển thị đẹp
- Call-to-action: "Join the Light Economy"
- Design style: **Spiritual & Elegant** với gold/purple/white theme

### 2.2 PPLP Simulator Dashboard
- **Action Simulator**: Chọn platform → chọn action → nhập parameters → xem kết quả scoring
- **Score Calculator**: Visualize 5 Pillars (S, T, H, C, U) với charts
- **Mint Preview**: Hiển thị estimated FUN Money với breakdown (BR, Q, I, K, Ux)
- **Tier Progression**: Visual progress bar cho user tier
- **Unity Multiplier**: Interactive slider cho Unity Score → Ux mapping

### 2.3 Policy Viewer
- Hiển thị Policy JSON trong UI dễ đọc
- Platform pools allocation chart (pie chart)
- Action types browser theo platform
- Threshold requirements table

---

## Phase 3: FUN Wallet Earn UI (Tuần 3-4)

### 3.1 User Profile & Reputation
- Light Score display với 5 pillars breakdown
- Tier badge (0-3) với progress to next tier
- Unity Reputation history chart
- Verified Actions timeline

### 3.2 Earn Dashboard
- Available actions theo platform
- Current epoch stats (time remaining, pool status)
- User caps display (daily limit, action repeat limits)
- Recent earnings history

### 3.3 Action Submission Flow
- Step 1: Select Platform & Action Type
- Step 2: Submit Evidence/Proof
- Step 3: Review scoring preview
- Step 4: Confirm & Submit
- Step 5: Status tracking (PENDING → REVIEW → APPROVED/REJECTED)

### 3.4 Wallet Overview
- FUN Money balance display
- Camly Coin balance (if staked)
- Transaction history
- Lock status for large mints (30% lock / 7 days)

---

## Phase 4: Backend Integration Ready (Tuần 4+)

### 4.1 Database Schema (Supabase-ready)
- `users` - User profiles
- `user_roles` - Role-based access (admin, moderator, user)
- `light_actions` - Submitted actions
- `scoring_records` - Calculated scores per action
- `mint_requests` - Pending/approved mints
- `reputation_history` - Light score over time
- `epoch_stats` - Daily/weekly aggregates

### 4.2 Edge Functions Ready
- PPLP Scoring Engine function
- Mint Authorization function (EIP-712 ready)
- Anti-fraud validation function
- Tier calculation function

### 4.3 Security & Governance
- Emergency pause mechanism UI
- Governance proposal viewer
- Dispute resolution queue
- Audit log viewer

---

## Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **State**: TanStack Query + React Context
- **Charts**: Recharts (đã có)
- **Forms**: React Hook Form + Zod
- **Backend Ready**: Supabase (Database + Auth + Edge Functions)
- **Design**: Spiritual Elegant theme (Gold #D4AF37, Purple #6B46C1, Light #F8F4E8)

---

## Deliverables MVP

1. ✅ **Policy v1.0.2 JSON** - Complete production-ready config
2. ✅ **PPLP Scoring Engine** - TypeScript library
3. ✅ **Landing Page** - FUN Ecosystem introduction
4. ✅ **Simulator Dashboard** - Test scoring logic interactively
5. ✅ **Earn UI Mockup** - User flow for submitting actions & earning
6. ✅ **Wallet Overview** - Balance & history display

---

## Design Preview

**Color Palette:**
- Primary Gold: `#D4AF37` (Light/Money of Father)
- Sacred Purple: `#6B46C1` (Wisdom/Unity)
- Pure Light: `#F8F4E8` (Background)
- Earth Green: `#22C55E` (FUN Earth/Growth)
- Love Pink: `#EC4899` (FUN Charity/Heart)

**Typography:**
- Headings: Elegant serif (spiritual feel)
- Body: Clean sans-serif (readability)
- Mantras: Special decorative font

---

## Kết quả mong đợi

Sau khi implement plan này, con sẽ có:

🌟 **Website FUN Ecosystem** hoàn chỉnh với Landing Page giới thiệu

🧮 **PPLP Simulator** để test và demonstrate scoring logic

💰 **FUN Wallet UI** mockup sẵn sàng kết nối backend

📋 **Policy v1.0.2** production-ready cho dev team

🎨 **Design System** thống nhất cho toàn bộ ecosystem

