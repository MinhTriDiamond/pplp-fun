

# Ke Hoach Trien Khai: Migration Prompt B + Quality Gate Prompt F

## Tong Quan

Con da chon:
- **Monorepo** (Option A): Xay du an hien tai thanh FUN SuperApp
- **Migration cho Prompt B**: Bo sung `username` column + `events` table
- **Edge Functions**: Lam API layer cho cac endpoint nhay cam
- **Prompt F**: Tao `docs/quality-gate.md`

Ke hoach gom **4 phan chinh**, thuc hien trong 1 phien lam viec.

---

## Phan 1: Quality Gate (Prompt F)

Tao file `docs/quality-gate.md` lam kim chi nam cho moi lan release.

**Noi dung:**
- Spec clarity checklist
- UI microcopy rules (tich cuc, nang nang luong)
- Security checks (auth, rate limit, injection)
- QA pass cho core flows (auth, profile, wallet, events)
- Audit log requirement cho permissions + wallet
- Rollback plan template

---

## Phan 2: Database Migration (Prompt B bo sung)

### 2.1 Them `username` vao `profiles`

```text
profiles table changes:
  + username TEXT UNIQUE
  + CHECK constraint: username ~ '^[a-z0-9_]{4,20}$'
  + Validation trigger kiem tra reserved keywords
  + Index on username
```

**Reserved keywords** (14 tu): admin, support, fun, wallet, treasury, academy, play, farm, charity, planet, angel, ai, greenearth, camly

**Logic validation:**
- Tao function `validate_username()` dung trigger (khong dung CHECK vi can logic phuc tap)
- Tu dong reject username trung voi reserved list
- Username lowercase, khong dau, khong khoang trang, 4-20 ky tu

### 2.2 Tao `events` table

```text
events table (moi):
  id          UUID PRIMARY KEY
  event_name  TEXT NOT NULL
  timestamp   TIMESTAMPTZ DEFAULT now()
  fun_user_id UUID REFERENCES auth.users
  anon_id     TEXT           -- for pre-login tracking
  module      TEXT           -- 'fun-profile', 'fun-academy', etc.
  platform    TEXT           -- 'web', 'ios', 'android'
  app_version TEXT
  trace_id    TEXT
  properties  JSONB DEFAULT '{}'
  created_at  TIMESTAMPTZ DEFAULT now()
```

**RLS policies:**
- User co the INSERT events cua minh
- User co the SELECT events cua minh
- Admin co the SELECT tat ca events

**Index:** `(fun_user_id, created_at DESC)`, `(event_name)`, `(module)`

### 2.3 Cap nhat RLS cho profiles

Them policy cho phep user khac xem profile theo username (public profile lookup):
- `GET /profiles/{username}` can SELECT policy cho phep authenticated users xem profile cua nhau

---

## Phan 3: Edge Function - Events Ingestion

Tao edge function `events-ingest` xu ly batch events.

**Path:** `supabase/functions/events-ingest/index.ts`

**Logic:**
1. Nhan POST request voi body `{ events: [...] }` (toi da 50 events/batch)
2. Validate moi event theo envelope schema
3. Kiem tra khong co PII trong properties (basic check)
4. Insert batch vao `events` table
5. Tra ve `{ success: true, count: N }`

**Security:**
- Require authenticated user (Bearer token)
- Rate limit: check so events/user/minute bang query count
- Error format: `{ code, message, trace_id }`

---

## Phan 4: Frontend Components

### 4.1 Username Setup

**File:** `src/hooks/useUsername.ts`
- Hook de validate + update username
- Client-side validation: regex `^[a-z0-9_]{4,20}$` + reserved keywords check
- Kiem tra username availability qua Supabase query

**File:** `src/components/settings/UsernameForm.tsx`
- Form nhap username voi real-time validation
- Hien thi trang thai: available / taken / invalid / reserved
- Tich hop vao Settings page (tab moi hoac trong ProfileForm)

### 4.2 Events Client SDK

**File:** `src/lib/fun-sdk/events.ts`
- `ingestEvents(events[])` - goi edge function
- `trackEvent(name, properties, module)` - helper don gian
- Auto-attach: `fun_user_id`, `platform: 'web'`, `app_version`, `trace_id`

### 4.3 Global Navigation (Module Switcher)

**File:** `src/components/layout/FunNavbar.tsx`
- Top navigation bar chung "FUN Ecosystem"
- Module switcher dropdown voi cac platform (Profile, Academy, Play, Charity, Farm...)
- Hien thi user avatar + username
- Link den Settings, Wallet (placeholder), Chat (placeholder)

**File:** `src/components/layout/ModuleSwitcher.tsx`
- Dropdown/popover hien thi danh sach modules
- Icon + ten + trang thai (active/coming soon) cho moi module
- Dung `PlatformId` type da co

### 4.4 Admin Events Dashboard (Basic)

**File:** `src/pages/admin/Events.tsx`
- Bang hien thi latest events (admin only)
- Filter theo: event_name, module, user
- Auto-refresh

### 4.5 Cap nhat App.tsx Routes

Them routes moi:
- `/admin/events` - Events dashboard (admin only)
- Thay doi global nav tren tat ca pages

---

## Chi Tiet Ky Thuat

### Folder Structure sau khi hoan thanh

```text
src/
  components/
    layout/
      FunNavbar.tsx          (NEW - global nav)
      ModuleSwitcher.tsx     (NEW - module switcher)
    settings/
      ProfileForm.tsx        (UPDATE - them username)
      PrivacyDashboard.tsx   (existing)
      UsernameForm.tsx       (NEW)
  hooks/
    useUsername.ts            (NEW)
    useEvents.ts             (NEW)
  lib/
    fun-sdk/
      events.ts              (NEW - events client)
      index.ts               (NEW - SDK barrel export)
  pages/
    admin/
      Events.tsx             (NEW)
docs/
  quality-gate.md            (NEW - Prompt F)
supabase/
  functions/
    events-ingest/
      index.ts               (NEW)
  migrations/
    ...new_migration.sql     (NEW - username + events)
```

### Thu Tu Thuc Hien

1. Tao `docs/quality-gate.md` (Prompt F)
2. Chay database migration (username + events + RLS)
3. Tao edge function `events-ingest`
4. Tao `useUsername` hook + `UsernameForm` component
5. Tao events SDK client (`fun-sdk/events.ts`)
6. Tao `FunNavbar` + `ModuleSwitcher`
7. Tao admin Events page
8. Cap nhat routes + tich hop global nav
9. Cap nhat `plan.md`

