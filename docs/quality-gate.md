# FUN Ecosystem — Quality Gate Checklist

> Mỗi lần release phải pass toàn bộ checklist bên dưới trước khi deploy lên production.

---

## 1. Spec Clarity ✅

- [ ] Mỗi task có mô tả rõ ràng, không mơ hồ
- [ ] Acceptance criteria được viết trước khi bắt đầu code
- [ ] Edge cases được liệt kê và xử lý
- [ ] API contract (request/response) được document

---

## 2. UI / Microcopy 🌟

- [ ] Microcopy tích cực, nâng năng lượng, hướng giải pháp
- [ ] Không dùng ngôn ngữ tiêu cực hoặc đe dọa (ví dụ: "bạn đã sai", "không được phép")
- [ ] Error messages có gợi ý cách khắc phục
- [ ] Thống nhất ngôn ngữ (VI hoặc EN) trong cùng 1 flow
- [ ] Design tokens và semantic colors được sử dụng (không hardcode màu)
- [ ] Responsive trên mobile, tablet, desktop

---

## 3. Security 🔒

- [ ] Auth required cho mọi endpoint nhạy cảm
- [ ] RLS policies đúng cho mọi table mới/sửa
- [ ] Input validation cả client-side và server-side (Zod schema)
- [ ] Rate limiting cho endpoints quan trọng (auth, wallet, events)
- [ ] Không lưu PII trong event properties
- [ ] Không lưu secret/API key trong code (dùng environment variables)
- [ ] SQL injection protection (không raw SQL, dùng parameterized queries)
- [ ] CORS headers đúng cho edge functions

---

## 4. QA — Core Flows ✅

- [ ] **Auth**: Register → verify email → login → logout → login lại
- [ ] **Profile**: Xem → sửa display_name, bio, avatar → username setup
- [ ] **Privacy**: Toggle từng permission → verify audit log được tạo
- [ ] **Events**: Track event → verify event xuất hiện trong admin dashboard
- [ ] **Wallet** (khi có): Transfer → verify balance cập nhật → idempotency check
- [ ] **Module Switcher**: Navigate giữa các modules không bị lỗi auth

---

## 5. Audit Log 📋

- [ ] Permission changes được ghi vào `audit_logs`
- [ ] Wallet transactions được ghi đầy đủ (amount, from, to, trace_id)
- [ ] Admin actions (role change, report review) được ghi log
- [ ] Audit log không thể bị user xóa (RLS chỉ cho INSERT + SELECT)

---

## 6. Data Integrity 🗄️

- [ ] Idempotency key cho mọi money-moving endpoint
- [ ] Database constraints (UNIQUE, NOT NULL, CHECK) đúng
- [ ] Foreign key relationships đúng
- [ ] Default values hợp lý cho mọi column
- [ ] Migration có thể rollback (xem phần 7)

---

## 7. Rollback Plan 🔄

Trước mỗi release, chuẩn bị:

- [ ] **Schema rollback SQL**: Reverse migration script sẵn sàng
- [ ] **Data backup**: Snapshot data quan trọng (profiles, wallet balances)
- [ ] **Feature flag**: Tính năng mới có thể tắt mà không cần redeploy
- [ ] **Communication**: Thông báo cho team trước khi deploy

### Template Rollback

```sql
-- Rollback template: [FEATURE_NAME]
-- Date: [YYYY-MM-DD]
-- Author: [NAME]

-- Step 1: Revert schema changes
-- ALTER TABLE public.xxx DROP COLUMN IF EXISTS yyy;

-- Step 2: Revert RLS policies
-- DROP POLICY IF EXISTS "policy_name" ON public.xxx;

-- Step 3: Revert functions/triggers
-- DROP FUNCTION IF EXISTS public.xxx();
-- DROP TRIGGER IF EXISTS xxx ON public.yyy;
```

---

## 8. Documentation 📝

- [ ] README cập nhật nếu có thay đổi setup
- [ ] SDK docs cập nhật nếu có API mới
- [ ] CHANGELOG entry cho release

---

## Release Checklist Summary

| Category | Owner | Status |
|----------|-------|--------|
| Spec Clarity | PM/Dev | ⬜ |
| UI/Microcopy | Designer/Dev | ⬜ |
| Security | Dev | ⬜ |
| QA Core Flows | QA/Dev | ⬜ |
| Audit Log | Dev | ⬜ |
| Data Integrity | Dev | ⬜ |
| Rollback Plan | Dev/Ops | ⬜ |
| Documentation | Dev | ⬜ |

> **Rule**: Không deploy nếu bất kỳ mục nào còn ⬜ chưa được check.
