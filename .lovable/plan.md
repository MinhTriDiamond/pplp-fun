

# Đánh giá Kế hoạch Light Score 5 Trụ Cột từ ANGEL AI

## 1. Nhận xét tổng quan

Kế hoạch của Cha Lovable (ANGEL AI) rất chi tiết và bám sát tài liệu gốc. Tuy nhiên, cần đối chiếu với **hệ thống hiện tại trong codebase này** để tránh xung đột.

## 2. Hiện trạng codebase này vs Kế hoạch ANGEL AI

```text
┌──────────────────────────────────────────────────────────────────┐
│  Kế hoạch ANGEL AI tham chiếu         │  Codebase này có gì     │
├──────────────────────────────────────────────────────────────────┤
│ bảng pplp_light_levels                │ ❌ Không tồn tại        │
│ bảng light_score_ledger               │ ❌ Không tồn tại        │
│ bảng features_user_day                │ ❌ Không tồn tại        │
│ bảng pplp_fraud_signals               │ ❌ Không tồn tại        │
│ bảng user_wallet_addresses            │ ❌ Không tồn tại        │
│ LS-Math v1.0 scoring engine           │ ❌ Không có (chỉ có     │
│                                       │    pplp-engine.ts dùng  │
│                                       │    S/T/H/C/U pillars)   │
│ UnifiedLightScore.tsx                 │ ❌ Không tồn tại        │
│ src/lib/scoring-engine.ts             │ ❌ Không tồn tại        │
│ Behavior Sequence Engine              │ ❌ Không tồn tại        │
│ Anti-fraud 10 lớp                     │ ❌ Chỉ có concept trong │
│                                       │    policy JSON           │
│ useOnChainTransactions                │ ❌ Không tồn tại        │
│ PPLP 5 pillars S/T/H/C/U             │ ✅ Có (pplp-engine.ts)  │
│ Simulator UI                          │ ✅ Có (RadarChart, etc) │
│ profiles table                        │ ✅ Có                   │
│ events table                          │ ✅ Có                   │
│ wallet_accounts table                 │ ✅ Có                   │
└──────────────────────────────────────────────────────────────────┘
```

## 3. Đánh giá kế hoạch

### Điểm mạnh
- Phân tích rõ ràng sự khác biệt PPLP (triết lý) vs Light Score (thực thi)
- Công thức dimension scoring chi tiết và hợp lý
- Giữ nguyên PPLP engine hiện tại, bổ sung Light Score song song
- Cron job daily cho scoring phù hợp thực tế

### Vấn đề cần lưu ý
1. **Kế hoạch tham chiếu nhiều bảng/module chưa tồn tại** trong codebase này (light_score_ledger, features_user_day, pplp_fraud_signals, user_wallet_addresses). Phần "Đã có" trong đánh giá hiện trạng phản ánh một project khác, không phải project này.
2. **Thang điểm**: Tài liệu gốc dùng 0-100 mỗi trụ, tổng tối đa 500 (chưa trừ penalty). Nhưng cấp độ lại là 0-800+. Kế hoạch ANGEL AI dùng `user_dimension_scores.total_light_score` nhưng không nói rõ công thức tổng: tổng trực tiếp (max 500) hay nhân trọng số rồi scale lên (max 100 → cần scale x10 để ra thang 1000).
3. **Identity Score**: Phụ thuộc profiles table -- hợp lý vì đã có. Nhưng "wallet linked" cần bảng riêng mà chưa có.
4. **On-chain Score**: Cần dữ liệu blockchain thật. Trong simulator thì mock được, nhưng production cần oracle/indexer.
5. **Edge function cron**: Cần pg_cron + pg_net extensions.

## 4. Đề xuất điều chỉnh cho codebase này

### Phase 1A -- Simulator-first (không cần DB)
Vì codebase này đang là **simulator** (test & mint), nên làm simulator Light Score trước:

1. **`src/types/light-score.types.ts`** -- Types mới cho 5 dimension
2. **`src/lib/light-score-engine.ts`** -- Pure functions tính 5 dimensions, risk penalty, decay, streak, total score, level
3. **Cập nhật Simulator UI** -- Thêm tab "Light Score" trong `/simulator` với 5 sliders mới, radar chart 5 chiều mới, level badge, penalty/decay/streak controls
4. **Giữ nguyên tab PPLP hiện tại** -- Song song, không thay thế

### Phase 1B -- Database (khi cần persistence)
- Tạo bảng `user_dimension_scores` 
- Edge function `compute-dimensions`
- Hook `useDimensionScores`

## 5. Kết luận

Kế hoạch ANGEL AI **đúng hướng** nhưng được viết cho một codebase khác có nhiều bảng và module hơn. Với project này, nên **bắt đầu từ simulator** (Phase 1A) trước, rồi mới thêm DB persistence (Phase 1B).

Con muốn Cha triển khai Phase 1A (Light Score Simulator) trước không?

