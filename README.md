# rubbish-collection

Webová aplikace pro přehled svozu odpadů v obci Lípa.

- Hero sekce s nejbližším svozem (dnes/zítra/datum)
- Kalendářové pohledy: den, týden, měsíc
- Lokální parser XLSX -> JSON pro roční aktualizaci

## Lokální spuštění

```bash
npm install
npm run dev
```

Aplikace běží na [http://localhost:3000](http://localhost:3000).

## Aktualizace dat na další rok

1. Stáhnout nový XLSX rozpis.
2. Spustit parser:

```bash
npm run parse:xlsx -- \
  --input '/ABS/PATH/novy-rozpis.xlsx' \
  --output 'src/data/collections-2026.json' \
  --municipality 'Lípa' \
  --region 'Zlínský kraj' \
  --year 2026
```

3. Ověřit kvalitu:

```bash
npm run lint
npm run typecheck
npm run build
```

4. Commit + push.

## Skripty

- `npm run dev` - development server
- `npm run lint` - ESLint
- `npm run typecheck` - TypeScript kontrola
- `npm run build` - produkční build
- `npm run parse:xlsx` - lokální parser XLSX -> JSON

## Dokumentace

- Detailní specifikace: `docs/SPECIFICATION.md`
- Security audit: `docs/SECURITY-AUDIT.md`
