

# 🔐 Kế Hoạch: Tính Năng Đăng Ký/Đăng Nhập + Lịch Sử Mint

## 📊 Tóm Tắt

Thêm hệ thống authentication đầy đủ:
1. **Đăng ký/Đăng nhập** bằng email + password
2. **Profiles table** lưu thông tin user (tên, avatar, ví mặc định)
3. **Mint history table** lưu chi tiết từng giao dịch mint
4. **Gating logic** - User xem tự do, yêu cầu đăng nhập khi nhấn "Mint FUN"

---

## 🗄️ Database Schema

### Bảng 1: `profiles` - Thông tin User

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  preferred_wallet TEXT,  -- Địa chỉ ví mặc định
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: User chỉ xem/sửa profile của mình
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"  
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Bảng 2: `mint_history` - Lịch Sử Mint

```sql
CREATE TABLE public.mint_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Transaction info
  tx_hash TEXT NOT NULL,
  chain_id INTEGER DEFAULT 97,  -- BSC Testnet
  contract_address TEXT NOT NULL,
  
  -- Mint details
  recipient_address TEXT NOT NULL,
  action_type TEXT NOT NULL,
  platform_id TEXT NOT NULL,
  amount_atomic TEXT NOT NULL,  -- Store as text to preserve precision
  amount_formatted TEXT NOT NULL,
  
  -- Scoring data
  light_score INTEGER,
  unity_score INTEGER,
  integrity_k DECIMAL(5,4),
  evidence_hash TEXT,
  
  -- Multipliers
  multiplier_q DECIMAL(5,2),
  multiplier_i DECIMAL(5,2),
  multiplier_k DECIMAL(5,4),
  multiplier_ux DECIMAL(5,2),
  
  -- Timestamps
  minted_at TIMESTAMPTZ DEFAULT NOW(),
  block_number BIGINT,
  
  -- Status
  status TEXT DEFAULT 'confirmed'  -- pending, confirmed, failed
);

-- RLS: User chỉ xem lịch sử mint của mình
ALTER TABLE public.mint_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mint history"
  ON public.mint_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mint history"
  ON public.mint_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Trigger: Tự động tạo Profile khi đăng ký

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 📁 Danh Sách File Cần Thay Đổi

| File | Thay đổi |
|------|----------|
| **DATABASE** | Migration tạo `profiles` + `mint_history` + trigger |
| `src/pages/Auth.tsx` | **TẠO MỚI** - Trang đăng ký/đăng nhập |
| `src/hooks/useAuth.ts` | **TẠO MỚI** - Hook quản lý auth state |
| `src/hooks/useMintHistory.ts` | **TẠO MỚI** - Hook lưu/đọc lịch sử mint |
| `src/components/auth/AuthModal.tsx` | **TẠO MỚI** - Modal đăng nhập dạng popup |
| `src/components/auth/UserMenu.tsx` | **TẠO MỚI** - Dropdown user (avatar, logout) |
| `src/App.tsx` | Thêm route `/auth`, wrap AuthProvider |
| `src/components/simulator/MintButton.tsx` | Thêm logic kiểm tra đăng nhập trước khi mint |
| `src/pages/Simulator.tsx` | Thay WalletConnect bằng UserMenu khi đã login |
| `src/pages/Index.tsx` | Thêm nút Login/UserMenu vào navbar |

---

## 🔄 Luồng Hoạt Động

### A) Đăng Ký/Đăng Nhập

```text
1. User truy cập /simulator
         ↓
2. Xem tự do, tương tác các sliders
         ↓
3. Click "MINT FUN MONEY"
         ↓
4. Kiểm tra: Đã đăng nhập?
   ├── CÓ → Tiếp tục flow mint bình thường
   └── CHƯA → Hiện AuthModal (popup)
                 ↓
         User đăng ký/đăng nhập
                 ↓
         Tự động tiếp tục mint
```

### B) Lưu Lịch Sử Mint

```text
1. Mint thành công → Nhận txHash
         ↓
2. Gọi useMintHistory.saveMint({
     txHash, actionType, platformId, 
     amount, lightScore, unityScore, 
     multipliers...
   })
         ↓
3. Insert vào bảng mint_history
         ↓
4. User có thể xem lịch sử trong Profile (future)
```

---

## 🎨 Giao Diện

### Trang /auth

```text
┌─────────────────────────────────────────────────┐
│                                                  │
│              ✨ FUN Ecosystem                    │
│                                                  │
│   ┌─────────────────────────────────────────┐   │
│   │  [📧 Đăng Nhập]    [📝 Đăng Ký]       │   │
│   ├─────────────────────────────────────────┤   │
│   │                                          │   │
│   │   Email                                  │   │
│   │   [________________________]             │   │
│   │                                          │   │
│   │   Mật khẩu                               │   │
│   │   [________________________]             │   │
│   │                                          │   │
│   │   [      ĐĂNG NHẬP      ]                │   │
│   │                                          │   │
│   │   ─────── hoặc ───────                   │   │
│   │                                          │   │
│   │   Chưa có tài khoản? Đăng ký ngay       │   │
│   └─────────────────────────────────────────┘   │
│                                                  │
└─────────────────────────────────────────────────┘
```

### AuthModal (Popup khi click Mint)

```text
┌──────────────────────────────────────┐
│    ×    Đăng nhập để Mint FUN       │
├──────────────────────────────────────┤
│                                       │
│  Bạn cần đăng nhập để mint tokens    │
│                                       │
│   Email                               │
│   [________________________]          │
│                                       │
│   Mật khẩu                            │
│   [________________________]          │
│                                       │
│   [      ĐĂNG NHẬP      ]             │
│                                       │
│   Chưa có tài khoản? Đăng ký         │
└──────────────────────────────────────┘
```

### UserMenu (Khi đã đăng nhập)

```text
┌───────────────────┐
│  👤 user@email    ▼ │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  👤 Profile       │
│  📜 Mint History  │
│  ─────────────── │
│  🚪 Đăng xuất    │
└───────────────────┘
```

---

## ✅ Chi Tiết Kỹ Thuật

### 1. `src/hooks/useAuth.ts`

```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}
```

Sử dụng `supabase.auth.onAuthStateChange` để theo dõi trạng thái auth.

### 2. `src/hooks/useMintHistory.ts`

```typescript
interface MintHistoryHook {
  history: MintRecord[];
  loading: boolean;
  saveMint: (data: MintData) => Promise<void>;
  fetchHistory: () => Promise<void>;
}
```

### 3. Cập nhật `MintButton.tsx`

```typescript
// Trước khi mint
const handleMint = () => {
  if (!user) {
    setShowAuthModal(true);  // Hiện popup đăng nhập
    return;
  }
  
  // Tiếp tục flow mint bình thường...
};

// Sau khi mint thành công
if (receipt.hash) {
  await saveMint({
    txHash: receipt.hash,
    actionType,
    platformId,
    ...
  });
}
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Email confirmation**: Mặc định Supabase yêu cầu xác nhận email. Trong quá trình test, có thể tắt trong settings nếu cần.

2. **RLS Policies**: Tất cả bảng đều có RLS, user chỉ truy cập được data của mình.

3. **Trigger tự động tạo profile**: Khi user đăng ký, profile sẽ được tạo tự động.

4. **Wallet vẫn độc lập**: Auth bằng email/password, kết nối ví MetaMask vẫn riêng biệt.

---

## ✅ Tiêu Chí Hoàn Thành

1. ✅ Trang `/auth` với form đăng ký/đăng nhập
2. ✅ Modal popup khi click Mint mà chưa đăng nhập
3. ✅ UserMenu dropdown với avatar + logout
4. ✅ Bảng `profiles` lưu thông tin user
5. ✅ Bảng `mint_history` lưu lịch sử giao dịch
6. ✅ Trigger tự động tạo profile khi đăng ký
7. ✅ RLS policies bảo mật data
8. ✅ Hook `useAuth` quản lý auth state
9. ✅ Hook `useMintHistory` lưu/đọc lịch sử
10. ✅ Lưu mint history sau mỗi giao dịch thành công

