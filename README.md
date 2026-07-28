# rubbish-collection

Webová aplikace pro přehled svozu odpadů v obci Lípa.

- Hero sekce s nejbližším svozem (dnes/zítra/datum)
- Kalendářové pohledy: den, týden, měsíc
- Verzovaný JSON dataset pro roční rozpis svozu

## Lokální spuštění

```bash
npm install
cp .env.example .env.local
npm run dev
```

Aplikace běží na [http://localhost:3000](http://localhost:3000).

## Aktualizace dat na další rok

1. Podle oficiálního rozpisu vytvořit nový `src/data/collections-YYYY.json` se stejným datovým kontraktem jako aktuální dataset.
2. Zkontrolovat, že každé datum má formát `YYYY-MM-DD`, používá pouze existující ID kategorií a že události ani kategorie nejsou duplicitní.
3. Přepnout import datasetu v `src/lib/waste-data.ts` na nový rok.
4. Ověřit kvalitu:

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

5. Commit + push.

## Skripty

- `npm run dev` - development server
- `npm run lint` - ESLint
- `npm run typecheck` - TypeScript kontrola
- `npm run build` - produkční build
- `npm test` - automatické testy
- `npm run audit:policy` - plný npm audit s úzkou, verzovanou bezpečnostní výjimkou

## Security hardening

- Runtime security hlavičky a CSP jsou v [`src/proxy.ts`](src/proxy.ts).
- Pro embed routu nastavte v produkci `NEXT_PUBLIC_EMBED_FRAME_ANCESTORS` na whitelist domén místo `*`.
- CI security guardrails:
  - Plný dependency audit, lint, typecheck, test a build: `.github/workflows/security.yml`
  - Secret scan (Gitleaks): `.github/workflows/secret-scan.yml`
  - Dependabot: `.github/dependabot.yml`
  - Policy a disclosure: `SECURITY.md`

### Dočasná audit výjimka

`npm run audit:policy` vždy kontroluje produkční i úplný dependency strom. Produkční strom musí být bez nálezů. V devDependencies je dočasně povoleno pouze advisory [`GHSA-mh99-v99m-4gvg`](https://github.com/advisories/GHSA-mh99-v99m-4gvg) na přesné cestě `node_modules/minimatch/node_modules/brace-expansion`; odvozené npm nálezy musí vést pouze k tomuto advisory. Jakýkoli jiný advisory, jiná instalační cesta nebo produkční nález CI zastaví.

Výjimka existuje proto, že ESLint 9 a pluginy dodané s Next.js 16.2.12 stále používají `minimatch@3`, jehož API není kompatibilní s opraveným `brace-expansion@5`. Nucený globální override proto nepoužíváme. Výjimku odstranit, jakmile kompatibilní ESLint/Next.js plugin stack přestane zranitelnou cestu instalovat.

## Dokumentace

- Detailní specifikace: `docs/SPECIFICATION.md`
