import { format } from "date-fns";

export type TeamLevelRow = {
  level: number;
  totalMembers: number;
};

export type TeamMemberRow = {
  userId: string;
  name: string;
  contactNo: string;
  email: string;
  registrationDate: string;
  status: "Active" | "Inactive";
};

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number, i: number): T {
  return arr[(seed + i * 17) % arr.length]!;
}

const firstNames = [
  "Ganesh",
  "Vikram",
  "Testing",
  "Priya",
  "Rahul",
  "Anita",
  "Suresh",
  "Kavita",
  "Manoj",
  "Deepa",
];
const lastNames = ["Ji", "Singh", "Kumar", "Sharma", "Verma", "Patel", "Reddy", "Nair"];

/** Demo level tree: count and totals vary by subtree root id. */
export function getDemoLevelRows(rootKey: string): TeamLevelRow[] {
  const seed = hashSeed(rootKey);
  const levelCount = 5 + (seed % 6);
  return Array.from({ length: levelCount }, (_, idx) => {
    const level = idx + 1;
    const totalMembers = 4 + ((seed + level * 31) % 18);
    return { level, totalMembers };
  });
}

function fakeUserId(seed: number, row: number): string {
  const n = 20000 + ((seed + row * 997) % 80000);
  const prefixes = ["MRDS", "FWY", "FIN"];
  return `${pick(prefixes, seed, row)}${n}`;
}

/** Demo members for a level under a subtree root. */
export function getDemoMembersForLevel(rootKey: string, level: number): TeamMemberRow[] {
  const seed = hashSeed(`${rootKey}|L${level}`);
  const count = 10;
  const base = new Date(2024, 0, 15);
  return Array.from({ length: count }, (_, i) => {
    const fn = pick(firstNames, seed, i);
    const ln = pick(lastNames, seed, i + 3);
    const userId = fakeUserId(seed, i + level * 100);
    const reg = new Date(base.getTime() + ((seed + i) % 500) * 86400000);
    const active = i === 0;
    return {
      userId,
      name: `${fn} ${ln}`,
      contactNo: `+91 ${90000 + ((seed + i) % 100000)}${1000 + ((seed + i * 7) % 9000)}`,
      email: `${userId.toLowerCase()}@demo.finwy.app`,
      registrationDate: format(reg, "yyyy-MM-dd HH:mm:ss"),
      status: active ? "Active" : "Inactive",
    };
  });
}
