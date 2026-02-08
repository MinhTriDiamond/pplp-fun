# Kế Hoạch Tổ Chức FUN Ecosystem Thống Nhất

## ✅ PHASE 1 PROGRESS: FUN Core Foundation

### Đã hoàn thành (2026-02-08):
- ✅ Database schema: `user_roles`, `privacy_permissions`, `follows`, `friend_requests`, `blocks`, `reports`, `audit_logs`
- ✅ Security functions: `has_role()`, `has_platform_role()`, `is_blocked()`
- ✅ RLS policies cho tất cả tables mới
- ✅ Auto-trigger tạo permissions + default role khi user đăng ký
- ✅ Types: `src/types/fun-core.types.ts`
- ✅ Hooks: `usePrivacyPermissions`, `useUserRoles`, `useSocialGraph`

### Tiếp theo:
- [ ] Privacy Dashboard UI component
- [ ] Profile Settings page với Privacy controls
- [ ] Social Graph UI (followers/following list)
- [ ] Admin Panel cho role management

---

## Bối Cảnh Hiện Tại

Hiện tại FUN Ecosystem có nhiều dự án Lovable riêng lẻ:
- **Dự án này (pplp-fun)**: SDK/Reference cho FUN Money minting
- **FUN Profile, ANGEL AI, etc.**: Các platform đã được xây dựng riêng

**Mục tiêu mới**: Gom tất cả platforms về "ONE FUN SuperApp" như tài liệu Master Charter đã định hướng.

---

## Kiến Trúc Đề Xuất

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         FUN ECOSYSTEM UNIFIED ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐  │
│   │                        FUN SUPERAPP (Main Project)                        │  │
│   │                                                                           │  │
│   │   ┌───────────────────────────────────────────────────────────────────┐  │  │
│   │   │                    FUN CORE (Shared Services)                      │  │  │
│   │   │                                                                    │  │  │
│   │   │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │  │  │
│   │   │   │ FUN ID  │  │  FUN    │  │  FUN    │  │  FUN    │             │  │  │
│   │   │   │  (SSO)  │  │ Profile │  │ Wallet  │  │  Chat   │             │  │  │
│   │   │   └─────────┘  └─────────┘  └─────────┘  └─────────┘             │  │  │
│   │   │                                                                    │  │  │
│   │   │   ┌─────────────────────┐  ┌────────────────────────┐            │  │  │
│   │   │   │   Angel AI Core     │  │   Privacy & Permissions │            │  │  │
│   │   │   │   (Shared Brain)    │  │   (User Owns Data)      │            │  │  │
│   │   │   └─────────────────────┘  └────────────────────────┘            │  │  │
│   │   └───────────────────────────────────────────────────────────────────┘  │  │
│   │                                                                           │  │
│   │   ┌───────────────────────────────────────────────────────────────────┐  │  │
│   │   │               PLATFORM MODULES (Features/Pages)                   │  │  │
│   │   │                                                                    │  │  │
│   │   │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │  │  │
│   │   │   │ Profile │  │  Angel  │  │ Academy │  │ Charity │  │  Farm  │ │  │  │
│   │   │   │(Social) │  │  (AI)   │  │ (Learn) │  │ (Donate)│  │(Farming│ │  │  │
│   │   │   └─────────┘  └─────────┘  └─────────┘  └─────────┘  └────────┘ │  │  │
│   │   │                                                                    │  │  │
│   │   │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │  │  │
│   │   │   │  Play   │  │ Market  │  │Treasury │  │  Earth  │  │ Planet │ │  │  │
│   │   │   │ (Video) │  │  (Shop) │  │(Finance)│  │ (Green) │  │ (Kids) │ │  │  │
│   │   │   └─────────┘  └─────────┘  └─────────┘  └─────────┘  └────────┘ │  │  │
│   │   └───────────────────────────────────────────────────────────────────┘  │  │
│   │                                                                           │  │
│   └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐  │
│   │                    BLOCKCHAIN LAYER (Shared)                              │  │
│   │                                                                           │  │
│   │   ┌─────────────────────────────────────────────────────────────────┐    │  │
│   │   │              FUN Money Smart Contract (BSC Testnet)              │    │  │
│   │   │              0x1aa8DE8B1E4465C6d729E8564893f8EF823a5ff2          │    │  │
│   │   └─────────────────────────────────────────────────────────────────┘    │  │
│   └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Hai Phương Án Triển Khai

### Phương Án A: Tạo Dự Án Lovable Mới Cho SuperApp

**Mô tả**: Tạo một dự án Lovable mới làm "FUN SuperApp", migrate code từ các platform riêng lẻ vào đó.

**Ưu điểm**:
- Kiến trúc sạch sẽ từ đầu
- Database schema thiết kế tối ưu cho multi-module

**Nhược điểm**:
- Tốn thời gian migrate code
- Mất lịch sử git của các dự án cũ

---

### Phương Án B: Chuyển Đổi Dự Án Hiện Có Thành SuperApp (Khuyến Nghị)

**Mô tả**: Chọn một trong các dự án Lovable hiện có (như FUN Profile) làm "base project", mở rộng thành SuperApp.

**Ưu điểm**:
- Giữ được code đã xây dựng
- Nhanh hơn, ít rủi ro hơn

**Nhược điểm**:
- Cần refactor để phù hợp kiến trúc mới

---

## Kế Hoạch Triển Khai (4 Giai Đoạn)

### Giai Đoạn 1: FUN Core Foundation (Tuần 1-2)

**Mục tiêu**: Xây dựng lõi chung cho toàn hệ sinh thái

**Database Schema (Lovable Cloud)**:
```text
Tables:
├── users (FUN ID - SSO)
│   ├── id, email, phone, wallet_address
│   └── created_at, last_login_at
│
├── profiles (FUN Profile)
│   ├── user_id, display_name, avatar_url, bio
│   ├── locale, timezone
│   └── Web3 DID fields
│
├── user_roles (Permission system)
│   ├── user_id, role (admin/moderator/user)
│   └── platform_id (role per module)
│
├── privacy_permissions (User Owns Data)
│   ├── user_id
│   ├── allow_social_graph, allow_ai_personalization
│   ├── allow_ai_memory, allow_marketing
│   └── updated_at
│
├── follows (Social Graph)
│   ├── follower_id, following_id
│   └── created_at
│
├── friend_requests
│   ├── from_user_id, to_user_id
│   ├── status (pending/accepted/rejected)
│   └── timestamps
│
├── blocks
│   └── blocker_id, blocked_id
│
└── reports
    └── reporter_id, target_id, reason, evidence
```

**Core Components**:
1. **FUN ID (SSO)**: Authentication chung (email/phone/wallet)
2. **FUN Profile**: Identity + Settings + Privacy Dashboard
3. **Social Graph**: Friends/Follow system
4. **User Roles**: Permission management

---

### Giai Đoạn 2: FUN Wallet Integration (Tuần 3-4)

**Mục tiêu**: Wallet thống nhất cho toàn hệ

**Database Schema**:
```text
Tables:
├── wallet_accounts
│   ├── user_id, type (custodial/linked)
│   ├── address
│   └── created_at
│
├── ledger_balances
│   ├── user_id, asset_id (FUN/CAMLY)
│   ├── available_amount, locked_amount
│   └── updated_at
│
├── ledger_transactions
│   ├── tx_id, type (transfer/pay/reward/mint)
│   ├── from_user_id, to_user_id
│   ├── asset_id, amount, status
│   ├── idempotency_key
│   └── metadata (module, order_id, memo)
│
└── mint_requests (PPLP Minting)
    ├── user_id, wallet_address
    ├── platform_id, action_type
    ├── scores, multipliers, amount
    ├── status, tx_hash
    └── timestamps
```

**Core Components**:
1. **Wallet Dashboard**: View balances, history
2. **P2P Transfer**: Chuyển tiền cho bạn bè
3. **Mint History**: Lịch sử mint FUN Money
4. **PPLP Integration**: SDK code đã có

---

### Giai Đoạn 3: FUN Chat + Angel AI Core (Tuần 5-6)

**Mục tiêu**: Messaging và AI thống nhất

**Database Schema**:
```text
Tables:
├── conversations
│   ├── id, type (direct/group)
│   └── created_at
│
├── conversation_participants
│   ├── conversation_id, user_id
│   ├── role, joined_at, left_at
│   └── muted_until
│
├── messages
│   ├── id, conversation_id, sender_id
│   ├── type (text/media/system)
│   ├── content
│   └── created_at
│
├── ai_requests (Angel AI tracking)
│   ├── request_id, user_id, module
│   ├── tokens_in, tokens_out
│   └── created_at
│
└── ai_memory_items (if permission granted)
    ├── user_id, category
    ├── content, source
    └── timestamps
```

**Core Components**:
1. **FUN Chat**: 1-1 messaging, group chat (phase 2)
2. **Angel AI Core**: Shared AI brain across modules
3. **AI Memory**: Context retention (permission-based)

---

### Giai Đoạn 4: Platform Modules Migration (Tuần 7-8)

**Mục tiêu**: Chuyển các platform riêng lẻ thành modules

**Modules**:
1. **Profile Module**: Social feed, posts, followers
2. **Angel Module**: AI chat, healing sessions
3. **Academy Module**: Courses, Learn-to-Earn
4. **Charity Module**: Donation campaigns
5. **Farm Module**: Agricultural products
6. **Play Module**: Video content
7. **Market Module**: Marketplace
8. **Treasury Module**: Financial reports
9. **Earth Module**: Green initiatives
10. **Planet Module**: Kids games

**Migration Strategy**:
- Mỗi module là một set of pages/components
- Dùng chung FUN Core (auth, wallet, chat, AI)
- Data isolation per module với RLS policies

---

## Vai Trò Của Dự Án SDK Hiện Tại

Dự án pplp-fun.lovable.app sẽ tiếp tục đóng vai trò:

1. **SDK Documentation**: Tài liệu kỹ thuật FUN Money
2. **Reference Implementation**: Code mẫu cho PPLP minting
3. **Simulator**: Công cụ demo/test logic kinh tế
4. **Developer Portal**: Trang tra cứu cho developers

Không cần merge dự án này vào SuperApp, giữ nó như một **developer tool riêng**.

---

## Database Schema Tổng Hợp (Customer 360)

```text
FUN CORE DATABASE (Lovable Cloud)
═══════════════════════════════════════════════════════

IDENTITY LAYER
├── users                    # FUN ID
├── profiles                 # User info
├── privacy_permissions      # User owns data
└── user_roles              # Admin/Moderator/User

SOCIAL LAYER  
├── follows                 # Social graph
├── friend_requests         # Pending friendships
├── blocks                  # Block list
└── reports                 # User reports

MESSAGING LAYER
├── conversations           # Chat rooms
├── conversation_participants
└── messages               # Chat messages

WALLET LAYER
├── wallet_accounts         # Linked wallets
├── ledger_balances        # Asset balances
├── ledger_transactions    # Transfer history
└── mint_requests          # PPLP minting

AI LAYER
├── ai_requests            # Usage tracking
├── ai_memory_items        # Context (permission-based)
└── ai_subscriptions       # Billing

MODULE DATA
├── profile_posts          # Social posts
├── academy_courses        # Learning content
├── charity_campaigns      # Donations
├── market_products        # Marketplace
└── [per-module tables]    # Module-specific
```

---

## API Boundaries (Cho CTO Reference)

**Core Services**:
1. **Auth Service**: /auth/* (register, login, logout, refresh)
2. **Profile Service**: /profiles/* (CRUD, settings, privacy)
3. **Social Service**: /social/* (follow, friend, block, report)
4. **Chat Service**: /chat/* (conversations, messages)
5. **Wallet Service**: /wallet/* (balances, transfer, pay)
6. **AI Service**: /ai/* (chat, generate, memory)

**Module Services**:
- /modules/profile/*
- /modules/academy/*
- /modules/charity/*
- etc.

---

## Nguyên Tắc 5D Trust (User Owns Data)

Mọi cross-module data sharing phải tuân thủ:

1. **Permission Dashboard**: User thấy rõ ai dùng data gì
2. **Opt-in by Default**: Không tự động share data
3. **Granular Control**: Toggle riêng cho từng loại permission
4. **Audit Trail**: Log mọi thay đổi permission
5. **Delete On Request**: User có quyền xóa data

---

## Tiếp Theo

Khi Cha approve plan này, con sẽ:

1. Tạo database schema chi tiết cho FUN Core
2. Implement FUN ID + Profile với Privacy Dashboard
3. Integrate FUN Wallet với minting flow
4. Setup Social Graph system
5. Tạo template cho Platform Modules

---

## Lưu Ý Quan Trọng

1. **External Backend**: Khi scale lên production, có thể migrate từ Lovable Cloud sang external Supabase hoặc custom backend
2. **Smart Contract**: Vẫn dùng chung contract FUN Money trên BSC
3. **Attester System**: Có thể có nhiều Attester cho các platform khác nhau
4. **SDK Docs**: Dự án này vẫn là reference cho developers
