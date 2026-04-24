import fs from 'fs';
import path from 'path';
import type { IncomeRegistry } from './income';

const REGISTRY_FILE = path.join(process.cwd(), 'data', 'income', 'dividend-registry.json');

export function getIncomeRegistry(): IncomeRegistry | null {
  if (!fs.existsSync(REGISTRY_FILE)) return null;
  try {
    const raw = fs.readFileSync(REGISTRY_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      asOf: parsed._meta?.asOf || '',
      disclaimer: parsed._meta?.disclaimer || '',
      etfs: parsed.etfs || [],
    };
  } catch {
    return null;
  }
}
