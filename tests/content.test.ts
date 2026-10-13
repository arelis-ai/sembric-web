import { describe, expect, it } from 'vitest';
import { ROUTES } from '../src/routes';
import { markdownPath } from '../src/site';
import { readDist } from './helpers';

// Every product statement must be verifiable in the Sembric repository. These patterns catch the claims a marketing
// site drifts into: certifications, customer proof, prices and statements that open commercial gates are closed.
const FORBIDDEN: [RegExp, string][] = [
  [/\bSOC ?2\b|ISO ?27001|ISO ?42001|HIPAA|FedRAMP|PCI[- ]DSS/i, 'compliance certification'],
  [/\bGDPR[- ]compliant\b|\bEU AI Act compliant\b/i, 'compliance claim'],
  [/trusted by|used by (leading|hundreds|thousands)|our customers (love|say)|testimonial|case stud/i, 'customer proof'],
  [/\$\s?\d|€\s?\d|per (seat|month)\b|per user per|free trial|pricing (plans?|tiers?|page)|plans start/i, 'pricing'],
  [/\bgenerally available now\b|\bnow generally available\b|\bGA release\b/i, 'availability beyond pilot'],
  [/immutable (retention|audit|archive)/i, 'immutable retention claim'],
  [/sembric (ingests|copies|transforms)|we (ingest|copy|transform) your/i, 'ingestion'],
  [/agents? (can|may) (send|run|write) (sql|queries)/i, 'agent SQL'],
  [/\b(cross-tenant|failover|customer-scale load)\b[^.]*\b(tested|verified|proven|passed)\b/i, 'open commercial gate'],
  [/\b\d{2,3}% of (companies|enterprises|organizations)\b/i, 'unsourced statistic'],
];

describe('content claims', () => {
  for (const route of ROUTES) {
    it(`${route.path} makes no unverifiable claims`, () => {
      const text = readDist(markdownPath(route.path).slice(1));
      for (const [pattern, label] of FORBIDDEN) expect(text, `${label}: ${pattern}`).not.toMatch(pattern);
    });
  }

  it('states the pilot status and the limits of cost controls', () => {
    const home = readDist('index.md');
    const security = readDist('security.md');
    expect(home).toMatch(/available for pilots/i);
    expect(security).toMatch(/not invoice limits/i);
    expect(security).toMatch(/not complementary suppression/i);
    expect(security).toMatch(/What we don’t claim yet/);
  });
});
