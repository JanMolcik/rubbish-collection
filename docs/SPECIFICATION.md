# rubbish-collection: Detailní specifikace

## 1. Cíl produktu
Aplikace řeší orientaci v ročním rozpisu svozu odpadů pro obec Lípa.

Hlavní požadavky:
- z `.xlsx` vygenerovat čitelný datový model,
- na první obrazovce zobrazit nejbližší svoz (včetně více druhů ve stejný den),
- nabídnout přehledný kalendář ve třech pohledech: den, týden, měsíc,
- nasazení přes Vercel s automatickým deploymentem z GitHubu.

## 2. Scope (MVP)
- Jedna obec (Lípa), jeden publikovaný dataset za rok.
- Admin workflow: 1x ročně spustit parser lokálně, commitnout JSON, deploy proběhne automaticky.
- Bez veřejného uploadu souboru na serveru (záměrně kvůli bezpečnosti).

## 3. Technologická volba
Zvoleno: **Next.js App Router (TypeScript)**.

Důvody:
- bezproblémový Vercel hosting,
- jednoduché statické generování,
- dobrá dlouhodobá udržovatelnost,
- nízká složitost pro požadovaný scope.

## 4. Architektura
- `scripts/parse-xlsx.ts`: lokální parser `.xlsx -> JSON`.
- `src/data/collections-2026.json`: výstup parseru, verzovaný v repozitáři.
- `src/lib/waste-types.ts`: datové typy.
- `src/lib/waste-data.ts`: načtení datasetu.
- `src/components/waste-collection-app.tsx`: UI logika (hero + day/week/month kalendář).
- `src/components/waste-collection-app.module.css`: výrazný vizuální styl.

## 5. Parser: pravidla a heuristiky
Parser je navržen generic/reusable pro variabilní pozice buněk:
- načte všechny textové/datumové buňky,
- detekuje rok z obsahu (`rok 2026`, explicitní datumy) nebo z `--year`,
- hledá datumové tokeny (`d.m.`, `d.m.yyyy`, Excel date serial),
- pro každé datum hledá nejvhodnější popisek odpadu podle blízkosti v mřížce,
- používá aliasy pro známé kategorie (`SKO`, `NO`, `plast`, `sklo`, `papír`, `oleje`, `kov`),
- odfiltruje dekorativní texty a metadata,
- normalizuje výstup do unikátních dní a kategorií,
- ukládá jen datumy cílového roku.

CLI příklad:

```bash
npm run parse:xlsx -- \
  --input '/Users/janmo/Downloads/Lípa.xlsx' \
  --output 'src/data/collections-2026.json' \
  --municipality 'Lípa' \
  --region 'Zlínský kraj' \
  --year 2026
```

## 6. Datový kontrakt
Dataset (`WasteDataset`) obsahuje:
- `municipality`, `region`, `year`, `sourceFile`, `generatedAt`, `parserVersion`,
- `categories[]`: `{ id, name, color }`,
- `events[]`: `{ date: YYYY-MM-DD, categories: string[] }`.

## 7. UX/UI požadavky
- Hero sekce: nejbližší svoz + relativní text (dnes/zítra/den v týdnu).
- Kalendář:
  - `Den`: detail jednoho dne,
  - `Týden`: 7 dní s položkami,
  - `Měsíc`: plná mřížka 7xN.
- Zřetelná vizuální hierarchie:
  - výrazná typografie,
  - barevně odlišené typy odpadu,
  - jasné zvýraznění dneška.
- Mobil: responzivní layout + horizontální scroll měsíční mřížky.

## 8. Nefunkční požadavky
- Build bez chyb (`lint`, `typecheck`, `build`).
- Statický obsah (nízká latence, minimální provozní riziko).
- Jednoduchá obnova: parser lze spustit opakovaně i při změně layoutu xlsx.

## 9. Release workflow
1. Aktualizovat roční XLSX.
2. Spustit parser a zkontrolovat JSON.
3. `npm run lint && npm run typecheck && npm run build`.
4. Commit + push do `main`.
5. Vercel automaticky vytvoří deployment.

## 10. Budoucí rozšíření
- Více obcí přes route segment (`/obec/[slug]`).
- Admin stránka pro upload a validaci (s autentizací).
- Export do `.ics` pro osobní kalendáře.
- Push notifikace den před svozem.
