

# Tich hop Mint Requests & Sign vao Simulator

## Van de 1: /mint-requests khong hoat dong tren ban publish

Route `/mint-requests` da ton tai trong code va hoat dong binh thuong tren ban preview. Ban publish (`pplp-fun.lovable.app`) chua duoc cap nhat. **Con chi can bam "Publish"** de deploy code moi len ban live.

## Van de 2: Them tab Mint Requests va Sign vao /simulator

Hien tai trang `/simulator` la layout 3 cot (inputs ben trai, results ben phai) khong co tabs. Se them he thong tab o cap trang de nguoi dung co the chuyen giua 3 che do:

### Cau truc tab moi trong Simulator

| Tab | Noi dung | Muc dich |
|-----|----------|----------|
| Simulator | Giao dien hien tai (PillarSliders, UnitySignals, UserProfile, ScoringResults, MintPreview, MintButton) | Attester 1 cau hinh PPLP va tao Mint Request |
| Mint Requests | Danh sach pending requests + tim kiem theo ID | Xem tat ca request dang cho |
| Sign / Ky | Chi tiet request + ky EIP-712 + gui giao dich | Attester 2/3 ky va gui giao dich |

### Chi tiet ky thuat

**File can sua: `src/pages/Simulator.tsx`**

- Them `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` tu `@/components/ui/tabs`
- Tab "Simulator": giu nguyen toan bo layout hien tai (grid 3 cot, cards, scoring)
- Tab "Mint Requests": nhung noi dung tuong tu trang `/mint-requests` (danh sach pending, tim kiem)
- Tab "Sign": khi chon 1 request -> hien thi chi tiet, tien trinh chu ky, nut ky/gui

Logic tu trang `MintRequests.tsx` va hook `useMintRequests` se duoc tai su dung. Khong tao component moi, chi nhung truc tiep vao Simulator voi cac tab.

**Khong thay doi gi khac** - route `/mint-requests` van giu nguyen de Attester co the truy cap doc lap.

### Giao dien

Tab bar se dat ngay duoi header, tren khu vuc main content:

```text
[< Trang chu]  PPLP Simulator                [UserMenu] [WalletConnect]
-----------------------------------------------------------------------
  [ Simulator ]  [ Mint Requests ]  [ Sign ]
-----------------------------------------------------------------------
  (Noi dung thay doi theo tab)
```

### Cac file can sua

| File | Thay doi |
|------|----------|
| `src/pages/Simulator.tsx` | Them 3 tab (Simulator, Mint Requests, Sign), nhung logic tu useMintRequests |

