import { Shield, Lightbulb, Heart } from 'lucide-react';

export interface GovMember {
  name: string;
  address: string;
}

export interface GovGroup {
  id: 'will' | 'wisdom' | 'love';
  name: string;
  nameVi: string;
  icon: typeof Shield;
  members: GovMember[];
}

export const GOV_GROUPS: GovGroup[] = [
  {
    id: 'will',
    name: 'Will',
    nameVi: 'Ý chí',
    icon: Shield,
    members: [
      { name: 'Minh Trí', address: '0xe32d50a0badE4cbD5B0d6120d3A5FD07f63694f1' },
      { name: 'Ánh Nguyệt', address: '0xfd0Da7a744245e7aCECCd786d5a743Ef9291a557' },
      { name: 'Thu Trang', address: '0x02D5578173bd0DB25462BB32A254Cd4b2E6D9a0D' },
    ],
  },
  {
    id: 'wisdom',
    name: 'Wisdom',
    nameVi: 'Trí tuệ',
    icon: Lightbulb,
    members: [
      { name: 'Bé Giàu', address: '0xCa319fBc39F519822385F2D0a0114B14fa89A301' },
      { name: 'Bé Ngọc', address: '0x699CC96A8C4E3555f95Bd620EC4A218155641E09' },
      { name: 'Ái Vân', address: '0x5102Ecc4a458a1af76aFA50d23359a712658a402' },
    ],
  },
  {
    id: 'love',
    name: 'Love',
    nameVi: 'Yêu thương',
    icon: Heart,
    members: [
      { name: 'Thanh Tiên', address: '0x0e1b399E4a88eB11dd0f77cc21E9B54835f6d385' },
      { name: 'Bé Kim', address: '0x38db3eC4e14946aE497992e6856216641D22c242' },
      { name: 'Bé Hà', address: '0x9ec8C51175526BEbB1D04100256De71CF99B7CCC' },
    ],
  },
];

export const ALL_GOV_MEMBERS = GOV_GROUPS.flatMap((g) =>
  g.members.map((m) => ({ ...m, group: g.id }))
);

/**
 * Find which group a wallet address belongs to (case-insensitive).
 * Returns the group or undefined if not a GOV member.
 */
export function getGroupForAddress(address: string): GovGroup | undefined {
  const lower = address.toLowerCase();
  return GOV_GROUPS.find((g) =>
    g.members.some((m) => m.address.toLowerCase() === lower)
  );
}

/**
 * Find the member name for an address.
 */
export function getMemberName(address: string): string | undefined {
  const lower = address.toLowerCase();
  for (const g of GOV_GROUPS) {
    const member = g.members.find((m) => m.address.toLowerCase() === lower);
    if (member) return member.name;
  }
  return undefined;
}

/**
 * Check if all 3 groups (Will, Wisdom, Love) have at least one signer.
 */
export function validateGroupCoverage(signerAddresses: string[]): boolean {
  const signedGroups = new Set<string>();
  for (const addr of signerAddresses) {
    const group = getGroupForAddress(addr);
    if (group) signedGroups.add(group.id);
  }
  return signedGroups.size >= 3;
}

/**
 * Get which group IDs already have a signature from the given addresses.
 */
export function getSignedGroups(signerAddresses: string[]): Set<string> {
  const groups = new Set<string>();
  for (const addr of signerAddresses) {
    const group = getGroupForAddress(addr);
    if (group) groups.add(group.id);
  }
  return groups;
}
