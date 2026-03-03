# Security Audit

Datum auditu: 2026-03-03  
Scope: `rubbish-collection` (Next.js app, embed route, lokální XLSX parser, CI/CD)

## 1. Co bylo ověřeno

- Závislosti: `npm audit` (prod i full) bez nálezů.
- Historie commitů: regex scan + Gitleaks scan celé historie (`13 commits scanned`, `no leaks found`).
- Runtime hlavičky: ověřeno přes `curl` na `/` a `/embed` (CSP + další security headers).
- Build pipeline: `npm run lint`, `npm run typecheck`, `npm run build` je zelené.

## 2. Provedený hardening

- Přidán runtime proxy hardening: [`src/proxy.ts`](../src/proxy.ts)
  - `Content-Security-Policy`
  - `Referrer-Policy`
  - `X-Content-Type-Options`
  - `Permissions-Policy`
  - `Strict-Transport-Security` (jen production)
  - Oddělené `frame-ancestors`:
    - `/` a ostatní stránky: `'none'`
    - `/embed`: `NEXT_PUBLIC_EMBED_FRAME_ANCESTORS` (default `*`)
- Vypnuto odhalení frameworku hlavičkou `x-powered-by`: [`next.config.ts`](../next.config.ts)
- `exceljs` přesunut do `devDependencies` (není potřeba v runtime deployi).
- Přidány open-source guardrails:
  - `SECURITY.md`
  - `Dependabot` (`.github/dependabot.yml`)
  - CI security workflow (`.github/workflows/security.yml`)
  - CI secret scan (`.github/workflows/secret-scan.yml`)

## 3. Aktuální findings

### F-01: `dangerouslySetInnerHTML` pro JSON-LD
- Severity: Low
- Stav: Accepted risk
- Kontext: Použito pouze pro interně generovaný JSON-LD bez uživatelského vstupu.
- Poznámka: Pokud by se do JSON-LD někdy dostal nevalidovaný externí text, riziko se zvyšuje.

### F-02: Embed povolen pro všechny domény (`*`) ve výchozím nastavení
- Severity: Low/Medium (podle požadavků)
- Stav: Mitigated by configuration
- Mitigace: v produkci nastavit `NEXT_PUBLIC_EMBED_FRAME_ANCESTORS` na konkrétní whitelist domén.

## 4. Doporučení před otevřením repository

1. V GitHubu zapnout branch protection (`main`), required checks, a zakázat force-push.
2. Zapnout GitHub Secret Scanning a Dependabot alerts na úrovni repozitáře.
3. Nastavit `NEXT_PUBLIC_EMBED_FRAME_ANCESTORS` na konkrétní domény (ne `*`).
4. Ve Vercelu omezit oprávnění projektu na minimum a zapnout 2FA pro maintainery.

## 5. Závěr

Runtime i CI hardening je po tomto průchodu výrazně lepší a bez zjevných vysokých rizik.  
Největší zbývající rizika jsou procesní (repo governance, nastavení domén pro embed), ne aplikační exploity.
