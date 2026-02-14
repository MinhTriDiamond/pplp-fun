

# Nang cap Multi-Sig: GOV-Community (Will + Wisdom + Love)

## Mo ta

Chuyen tu mo hinh "3 chu ky bat ky" sang mo hinh "1 chu ky tu moi nhom trong 3 nhom": **Will** (Y chi), **Wisdom** (Tri tue), **Love** (Yeu thuong). Moi nhom co 3 thanh vien co dinh. Contract van giu threshold = 3, nhung ung dung se dam bao 3 chu ky den tu 3 nhom khac nhau.

## Cau truc 3 nhom

```text
WILL (Y chi, Ky thuat)          WISDOM (Tri tue, Tam nhin)         LOVE (Yeu thuong, Nhan ai)
+---------------------------+   +---------------------------+   +---------------------------+
| Minh Tri   0xe32d...94f1 |   | Be Giau  0xCa31...a301  |   | Thanh Tien 0x0e1b...d385 |
| Anh Nguyet 0xfd0D...a557 |   | Be Ngoc  0x699C...1E09  |   | Be Kim     0x38db...c242 |
| Thu Trang  0x02D5...a0D  |   | Ai Van   0x5102...a402  |   | Be Ha      0x9ec8...7CCC |
+---------------------------+   +---------------------------+   +---------------------------+

Ky hop le: 1 tu WILL + 1 tu WISDOM + 1 tu LOVE = 3 chu ky
```

## Chi tiet ky thuat

### 1. Tao file cau hinh `src/config/gov-groups.ts`

Dinh nghia 3 nhom voi dia chi vi thanh vien:

- Kieu `GovGroup` gom: id, name, nameVi, icon, members (ten + dia chi)
- Kieu `GovMember` gom: name, address, group
- Ham `getGroupForAddress(address)` -> tra ve nhom cua vi
- Ham `validateGroupCoverage(signerAddresses[])` -> kiem tra du 3 nhom chua
- Hang so `GOV_GROUPS` va `ALL_GOV_MEMBERS`

### 2. Cap nhat `MultiSigMintFlow.tsx`

**Thay doi giao dien:**
- Tab "Tao": giu nguyen, them hien thi "Yeu cau: 1 WILL + 1 WISDOM + 1 LOVE"
- Tab "Ky": thay the danh sach Slot 1/2/3 bang 3 khoi nhom:
  - Khoi WILL: hien thi 3 thanh vien, danh dau ai da ky (xanh), ai chua (xam)
  - Khoi WISDOM: tuong tu
  - Khoi LOVE: tuong tu
- Tab "Gui": kiem tra `validateGroupCoverage` truoc khi cho gui

**Thay doi logic:**
- Truoc khi ky: kiem tra vi thuoc nhom nao, kiem tra nhom do da co nguoi ky chua
- Neu nhom da co chu ky -> bao loi "Nhom [ten nhom] da co nguoi ky roi"
- `isReady` = validateGroupCoverage(cac dia chi da ky) thay vi chi dem so luong

### 3. Cap nhat `MintRequestsTab.tsx`

- Import gov-groups config
- Hien thi chu ky theo nhom thay vi Slot 1/2/3
- Kiem tra nhom truoc khi cho ky
- Validate group coverage truoc khi cho gui giao dich

### 4. Cap nhat `MintRequests.tsx` (trang doc lap)

- Tuong tu MintRequestsTab: hien thi theo nhom, validate group coverage

### 5. Cap nhat `useMintRequests.ts`

- Trong `addSignature`: them kiem tra group coverage (khong cho 2 nguoi cung nhom ky)

## Luu y

- Smart Contract khong biet ve nhom - chi kiem tra du 3 chu ky hop le tu Attester
- Tat ca validation nhom thuc hien o tang ung dung (frontend + database hook)
- Neu sau nay them/bot thanh vien, chi can sua file `gov-groups.ts`
- Cac dia chi phai trung voi dia chi da dang ky Attester tren contract

## Cac file can tao/sua

| File | Thay doi |
|------|----------|
| `src/config/gov-groups.ts` | **Moi** - Dinh nghia 3 nhom va cac ham validate |
| `src/components/simulator/MultiSigMintFlow.tsx` | Sua - Hien thi theo nhom, validate nhom |
| `src/components/simulator/MintRequestsTab.tsx` | Sua - Hien thi theo nhom, validate nhom |
| `src/pages/MintRequests.tsx` | Sua - Hien thi theo nhom, validate nhom |
| `src/hooks/useMintRequests.ts` | Sua - Them group validation khi addSignature |

