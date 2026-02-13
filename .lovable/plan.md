
# Cap Nhat Dia Chi Contract FUN Money

## Tong Quan

Thay the dia chi contract cu `0x1aa8DE8B1E4465C6d729E8564893f8EF823a5ff2` bang dia chi moi `0x39A1b047D5d143f8874888cfa1d30Fb2AE6F0CD6` tren toan bo he thong.

## Danh Sach File Can Cap Nhat

Tong cong **8 file**, chia thanh 2 nhom:

### Nhom 1: Source Code (anh huong truc tiep den ung dung)

| File | So cho can thay |
|------|-----------------|
| `src/lib/web3.ts` | 1 (DEFAULT_FUN_MONEY_ADDRESS) |
| `src/data/docs-data.ts` | 2 (CONTRACT_INFO.address + bscscanUrl) |
| `src/data/contract-functions.ts` | 1 (CONTRACT_ADDRESS) |

### Nhom 2: SDK Documentation (tai lieu tham chieu)

| File | So cho can thay |
|------|-----------------|
| `docs/FUN-Money-SDK-v1.0/01-ARCHITECTURE.md` | 2 |
| `docs/FUN-Money-SDK-v1.0/04-CONTRACT-INTEGRATION.md` | 4 |
| `docs/FUN-Money-SDK-v1.0/06-USER-TOKEN-LIFECYCLE.md` | 1 |
| `docs/FUN-Money-SDK-v1.0/07-ERROR-HANDLING.md` | 1 |
| `docs/FUN-Money-SDK-v1.0/code/lib/web3-config.ts` | 1 |

## Cach Thuc Hien

Thay the tat ca `0x1aa8DE8B1E4465C6d729E8564893f8EF823a5ff2` thanh `0x39A1b047D5d143f8874888cfa1d30Fb2AE6F0CD6` trong 8 file tren. Khong thay doi logic, chi thay dia chi.

**Luu y:** Nguoi dung da luu dia chi cu trong localStorage (key `fun_money_contract_address`) se tu dong duoc ghi de khi su dung Contract Settings UI. Default address se la dia chi moi ngay lap tuc.
