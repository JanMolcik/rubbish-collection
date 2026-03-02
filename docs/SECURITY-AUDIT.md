# Security Audit (MVP)

Datum auditu: 2026-03-02  
Scope: `rubbish-collection` (Next.js frontend + lokální parser)

## 1. Threat model
### Assety
- Integrita harmonogramu svozu (`src/data/collections-2026.json`).
- Dostupnost webu.
- CI/CD integrita (GitHub -> Vercel).

### Útočné vektory
- Zlomyslný `.xlsx` vstup při parsování.
- Supply-chain zranitelnost npm balíků.
- Chybná konfigurace deploymentu/secretů.
- XSS přes nekontrolovaný text z parseru.

## 2. Aktuální bezpečnostní rozhodnutí
- Žádný veřejný upload xlsx na serveru.
- Parsování pouze lokálně administrátorem.
- Výstup je statický JSON commitnutý do repozitáře.
- `xlsx` knihovna nebyla použita kvůli neopraveným high CVE; parser používá `exceljs`.

## 3. Findings
### F-01: Riziko importu z nedůvěryhodného XLSX
- Severity: Medium
- Stav: Mitigated (procesně)
- Popis: Spreadsheet může obsahovat škodlivý obsah nebo extrémní data pro DoS při parsování.
- Mitigace:
  - parsovat pouze soubory z oficiálního zdroje obce,
  - parser spouštět lokálně mimo produkční server,
  - vstupní soubor neukládat jako veřejně přístupný upload.

### F-02: Supply-chain npm závislostí
- Severity: Medium
- Stav: Mitigated (technicky + procesně)
- Popis: Riziko zranitelností v transitive dependencies.
- Mitigace:
  - pravidelně spouštět `npm audit`,
  - držet lockfile ve verzování,
  - při high CVE aktualizovat/nahrazovat knihovny před release.

### F-03: Neautorizované změny harmonogramu
- Severity: Medium
- Stav: Open (organizační)
- Popis: Nechtěná změna JSON nebo parseru může způsobit špatná data uživatelům.
- Mitigace:
  - branch protection na GitHubu,
  - vyžadovat review aspoň jednou osobou,
  - povinné CI (`lint`, `typecheck`, `build`) před merge.

## 4. Hardening checklist
- [x] Žádné runtime API endpointy pro upload parser vstupu.
- [x] Žádná práce s `dangerouslySetInnerHTML`.
- [x] Statický rendering bez server-side práce s cizími daty.
- [x] `npm audit` bez known vulnerabilities v aktuálním lockfile.
- [ ] Zapnout branch protection + required status checks.
- [ ] Zapnout Dependabot alerts + updates.
- [ ] Přidat SRI/CSP hlavičky (volitelné hardening zlepšení).

## 5. Doporučení pro production
1. Vercel environment bez citlivých secretů (projekt je statický).
2. Na GitHubu vynutit 2FA pro maintainery.
3. V CI přidat krok `npm audit --omit=dev` a fail při high severity.
4. Zaveďte jednoduchý „data sanity check“ (např. validace rozsahu dat v cílovém roce).

## 6. Závěr
MVP je z hlediska expozice útoku nízkorizikové, protože:
- neobsahuje veřejný upload,
- neobsahuje serverové endpointy,
- publikuje pouze statická data.

Největší zbývající riziko je procesní (integrita změn v repozitáři), nikoli aplikační runtime exploit.
