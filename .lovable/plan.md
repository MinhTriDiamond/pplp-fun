
# Kế hoạch: Gắn Link URL cho Platforms + Thêm Camly Coin

## Mục tiêu
- Gắn link URL cho 11 platforms hiện tại để user có thể click vào card và truy cập trực tiếp
- Thêm platform mới **Camly Coin** vào hệ sinh thái

---

## 1. Danh sách Platform + URL

| Platform | URL |
|----------|-----|
| FUN PROFILE | https://fun.rich |
| FUN FARM | https://farm.fun.rich |
| FUN TREASURY | https://treasury.fun.rich |
| FUN PLAY | https://play.fun.rich |
| FUN WALLET | https://wallet.fun.rich |
| FUN PLANET | https://planet.fun.rich |
| FUN CHARITY | https://charity.fun.rich |
| FUN GREEN EARTH | https://greenearth-fun.lovable.app |
| FUN ACADEMY | https://academy.fun.rich |
| CAMLY COIN | https://camly.co |
| ANGEL AI | https://angel.fun.rich |

---

## 2. Các file cần chỉnh sửa

### 2.1 Thêm Type mới
**File:** `src/types/pplp.types.ts`
- Thêm `'CAMLY_COIN'` vào PlatformId type

### 2.2 Thêm URL mapping
**File:** `src/lib/platform-icons.ts`
- Thêm object `platformUrls: Record<PlatformId, string>` chứa URL cho từng platform
- Thêm icon cho CAMLY_COIN (sử dụng icon `Coins` hoặc tương tự)
- Thêm color cho CAMLY_COIN

### 2.3 Cập nhật Policy JSON
**File:** `src/config/pplp-policy-v1.0.2.json`
- Thêm platform "CAMLY_COIN" với thông tin:
  - name: "Camly Coin — Token of Unity"
  - description: "Token quan trọng trong FUN Ecosystem, stake để boost integrity"
  - icon: "coins"
  - actions: STAKE, HOLD_REWARD, LIQUIDITY_PROVIDE

### 2.4 Cập nhật PlatformCard component
**File:** `src/components/PlatformCard.tsx`
- Thêm prop `url: string`
- Wrap card trong thẻ `<a href={url} target="_blank">` để click mở tab mới

### 2.5 Cập nhật PlatformsSection
**File:** `src/components/PlatformsSection.tsx`
- Truyền URL từ mapping vào mỗi PlatformCard

### 2.6 Cập nhật PlatformSelector (Simulator)
**File:** `src/components/simulator/PlatformSelector.tsx`
- Tự động load CAMLY_COIN từ policy nên không cần sửa nhiều

---

## 3. Chi tiết kỹ thuật

### 3.1 Platform URLs Object
```typescript
export const platformUrls: Record<PlatformId, string> = {
  FUN_PROFILE: "https://fun.rich",
  FUN_FARM: "https://farm.fun.rich",
  FUN_PLAY: "https://play.fun.rich",
  FUN_WALLET: "https://wallet.fun.rich",
  FUN_PLANET: "https://planet.fun.rich",
  FUN_CHARITY: "https://charity.fun.rich",
  FUN_EARTH: "https://greenearth-fun.lovable.app",
  FUN_ACADEMY: "https://academy.fun.rich",
  ANGEL_AI: "https://angel.fun.rich",
  CAMLY_COIN: "https://camly.co",
  // Các platform chưa có URL riêng
  FUN_TRADING: "https://trading.fun.rich",
  FUN_INVEST: "https://invest.fun.rich",
  FUN_LEGAL: "https://legal.fun.rich",
  FUN_MARKET: "https://market.fun.rich",
  FUNLIFE: "https://life.fun.rich",
};
```

### 3.2 PlatformCard cập nhật
```tsx
<a href={url} target="_blank" rel="noopener noreferrer">
  <Card className="group cursor-pointer transition-all ...">
    {/* existing content */}
  </Card>
</a>
```

### 3.3 CAMLY_COIN trong Policy JSON
```json
"CAMLY_COIN": {
  "name": "Camly Coin — Token of Unity",
  "description": "Token quan trọng trong FUN Ecosystem, stake để boost K",
  "icon": "coins",
  "actions": {
    "STAKE": {
      "baseRewardAtomic": "0",
      "thresholds": { "T": 70, "minLightScore": 60, "minK": 0.6 },
      "multipliers": { "Q": [1.0, 1.0], "I": [1.0, 1.0], "K": [0.6, 1.0] },
      "note": "Staking CAMLY không mint FUN trực tiếp, nhưng boost K multiplier"
    },
    "LIQUIDITY_PROVIDE": {
      "baseRewardAtomic": "100000000000000000000",
      "thresholds": { "T": 80, "minLightScore": 65, "minK": 0.75, "minU": 60 },
      "multipliers": { "Q": [1.0, 2.0], "I": [1.0, 3.0], "K": [0.75, 1.0] }
    }
  }
}
```

---

## 4. Lưu ý quan trọng

1. **FUN TREASURY**: Không có trong policy hiện tại - Cha sẽ map nó vào FUN_WALLET hoặc tạo mới tùy con muốn
2. **External Links**: Tất cả link sẽ mở trong tab mới (`target="_blank"`) với `rel="noopener noreferrer"` để bảo mật
3. **Fallback**: Platform nào chưa có URL sẽ dùng placeholder hoặc không có link

---

## 5. Kết quả mong đợi

Sau khi implement:
- ✅ User click vào bất kỳ platform card nào sẽ mở trang tương ứng
- ✅ Camly Coin xuất hiện trong danh sách 16 platforms
- ✅ Simulator có thể chọn Camly Coin để test scoring
- ✅ Giao diện đẹp, responsive, có hiệu ứng hover

