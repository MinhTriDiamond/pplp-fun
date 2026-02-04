

# PPLP Simulator Dashboard - Implementation Plan

## Mục tiêu
Xây dựng giao diện Simulator để test và demonstrate PPLP Scoring Engine, cho phép người dùng nhập parameters và xem kết quả mint FUN Money real-time.

---

## 1. Tạo trang Simulator (`/simulator`)

### 1.1 Route Setup
- Thêm route `/simulator` vào App.tsx
- Tạo file `src/pages/Simulator.tsx`

### 1.2 Layout
- Header với navigation back to home
- Main content area với 3 panels

---

## 2. Action Selector Panel

### 2.1 Platform Dropdown
- Hiển thị 14 platforms từ Policy JSON
- Icon + tên cho mỗi platform
- Khi chọn platform, load available actions

### 2.2 Action Type Dropdown  
- Dynamic list based on selected platform
- Hiển thị base reward cho mỗi action
- Tooltip với thresholds required

---

## 3. Pillar Scores Input Panel

### 3.1 Five Pillar Sliders
- **S (Service)**: Slider 0-100, màu gold
- **T (Truth)**: Slider 0-100, màu blue
- **H (Healing)**: Slider 0-100, màu pink
- **C (Contribution)**: Slider 0-100, màu green
- **U (Unity)**: Slider 0-100, màu purple

### 3.2 Real-time Light Score Display
- Tính `0.25*S + 0.20*T + 0.20*H + 0.20*C + 0.15*U`
- Hiển thị với visual indicator (pass/fail threshold)
- Radar chart visualization

---

## 4. Unity Signals Panel

### 4.1 Toggle Switches
- Collaboration (checkbox)
- Beneficiary Confirmed (checkbox)
- Community Endorsement (checkbox)
- Bridge Value (checkbox)
- Partner Attested (checkbox)
- Witness Count (number input)

### 4.2 Unity Score & Multiplier Display
- Show calculated Unity Score (0-100)
- Show resulting Ux multiplier (0.5 - 2.5)
- Visual mapping indicator

---

## 5. User Profile Simulator

### 5.1 Tier Selector
- Radio buttons: Tier 0, 1, 2, 3
- Show tier requirements
- Show max Ux cap per tier

### 5.2 Integrity Settings
- Anti-Sybil Score slider (0.0 - 1.0)
- Has Stake checkbox
- Show resulting K multiplier

### 5.3 Active Platforms
- Checkbox list of all platforms
- Show cross-platform bonus preview

---

## 6. Results Panel (Real-time)

### 6.1 Scoring Breakdown
- Light Score với 5 pillars breakdown (radar chart)
- Unity Score với signals breakdown
- Multipliers table: Q, I, K, Ux

### 6.2 Mint Calculation
- Base Reward (từ action config)
- Formula display: `BR × Q × I × K × Ux`
- Final Amount in FUN Money (highlighted)

### 6.3 Decision Display
- AUTHORIZE (green checkmark)
- REJECT (red X với reasons)
- REVIEW_HOLD (yellow với reason)

### 6.4 Threshold Checker
- List all required thresholds
- Green check or red X for each
- Failed reasons if any

---

## 7. Components to Create

| File | Purpose |
|------|---------|
| `src/pages/Simulator.tsx` | Main simulator page |
| `src/components/simulator/PlatformSelector.tsx` | Platform & action dropdowns |
| `src/components/simulator/PillarSliders.tsx` | 5 pillar input sliders |
| `src/components/simulator/UnitySignals.tsx` | Unity toggle switches |
| `src/components/simulator/UserProfileSim.tsx` | Tier & integrity settings |
| `src/components/simulator/ScoringResults.tsx` | Results display |
| `src/components/simulator/MintPreview.tsx` | Final mint amount preview |
| `src/components/simulator/RadarChart.tsx` | 5 pillars radar visualization |

---

## 8. Technical Implementation

### 8.1 State Management
```typescript
interface SimulatorState {
  platformId: PlatformId | null;
  actionType: string | null;
  pillarScores: PillarScores;
  unitySignals: Partial<UnitySignals>;
  userTier: 0 | 1 | 2 | 3;
  antiSybilScore: number;
  hasStake: boolean;
  activePlatforms: PlatformId[];
}
```

### 8.2 Real-time Calculation
- useEffect hook watching all inputs
- Call `scoreAction()` on every change
- Debounce for performance

### 8.3 Styling
- Use existing Tailwind config (spiritual theme)
- Card-based layout với shadows
- Smooth animations on value changes
- Mobile responsive

---

## 9. Landing Page Updates

### 9.1 "Launch Simulator" Button
- Link to `/simulator` route
- Already exists in nav, just needs routing

### 9.2 CTA Section
- "Bat dau ngay" button links to simulator

---

## 10. Expected Output

Sau khi implement, con sẽ có:

- Giao diện đẹp để test PPLP Engine
- Visualize 5 Pillars với radar chart
- Real-time mint calculation
- Demo được cho team/investors
- Foundation cho FUN Wallet Earn UI sau này

---

## Timeline Estimate

| Task | Time |
|------|------|
| Route setup + page scaffold | 15 min |
| Platform/Action selector | 30 min |
| Pillar sliders + chart | 45 min |
| Unity signals panel | 30 min |
| User profile simulator | 30 min |
| Results + mint preview | 45 min |
| Polish + responsive | 30 min |
| **Total** | ~4 hours |

