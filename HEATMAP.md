# Heatmap Planning — seedwave

## Identity
| Field | Value |
|-------|-------|
| **Repository** | heyns1000/seedwave |
| **Sector** | Core Platform / Seedwave Engine |
| **Heat Status** | 🔴 HOT — source of truth for all 31 sectors |
| **Priority** | HIGH |
| **Layer** | GitHub / Vercel / Node |

## Purpose
The canonical Seedwave platform repository. Contains `api/index.js` with the complete `FAA_ZONE_INDEX_SUMMARY_DATA` — all 31 sector definitions, pricing data, glyph registry, payout tiers, and region maps. Also contains the master sector portal HTML template in `public/sectors/agriculture-biotech/`. The upstream source for all sector portal fills.

## Source Files of Record
- `api/index.js` — 31-sector registry + pricing
- `public/sectors/agriculture-biotech/agrichain/paypal/pricing.html` — master portal template
- `vercel.json` — routing pattern for all sector deployments

## Local Ecosystem Link
Source of truth: this GitHub repo. All sector portal fills derived from this repo.

## Activity Snapshot
| Last Commit | Branch Count | Stack |
|-------------|--------------|-------|
| Active | Multiple | Node.js / Express / HTML |

## Sector Fill Plan
n/a — master platform repo

## Sync Checklist
- [x] Branch `claude/review-repos-heatmap-planning-nLDYK` created
- [ ] All 12 filled sector portals cross-referenced with api/index.js data
- [ ] OmniGrid ecosystem_config.yaml updated
- [ ] VaultMesh 9s pulse sync confirmed

```json
{
  "heatmap_version": "1.0",
  "generated": "2026-05-14",
  "sector": "core-platform",
  "heat": "HOT",
  "priority": "HIGH",
  "fill_status": "ACTIVE",
  "sector_count": 31
}
```
