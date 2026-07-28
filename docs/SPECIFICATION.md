# rubbish-collection: Detailní specifikace

## 1. Cíl produktu
Aplikace řeší orientaci v ročním rozpisu svozu odpadů pro obec Lípa.

Hlavní požadavky:
- udržovat čitelný, verzovaný datový model podle oficiálního rozpisu,
- na první obrazovce zobrazit nejbližší svoz (včetně více druhů ve stejný den),
- nabídnout přehledný kalendář ve třech pohledech: den, týden, měsíc,
- nasazení přes Vercel s automatickým deploymentem z GitHubu.

## 2. Scope (MVP)
- Jedna obec (Lípa), jeden publikovaný dataset za rok.
- Admin workflow: 1x ročně aktualizovat a zkontrolovat JSON, commitnout ho a nechat automaticky nasadit.
- Bez veřejného uploadu souboru na serveru (záměrně kvůli bezpečnosti).

## 3. Technologická volba
Zvoleno: **Next.js App Router (TypeScript)**.

Důvody:
- bezproblémový Vercel hosting,
- jednoduché statické generování,
- dobrá dlouhodobá udržovatelnost,
- nízká složitost pro požadovaný scope.

## 4. Architektura
- `src/data/collections-2026.json`: zdrojový dataset verzovaný v repozitáři.
- `src/lib/waste-types.ts`: datové typy.
- `src/lib/waste-data.ts`: načtení datasetu a výběr kategorií zobrazených domácnosti.
- `src/components/WasteCalendar.tsx`: kompozice hero sekce a denního, týdenního a měsíčního kalendáře.
- `src/components/hooks/useWasteCalendarController.ts`: stav výběru data, navigace a model hero sekce.
- `src/components/WasteCalendar.module.css`: responzivní vizuální styl.

## 5. Aktualizace datasetu
Nový roční dataset se připraví podle oficiálního rozpisu se stejným kontraktem jako aktuální JSON. Před publikací se kontroluje formát datumů `YYYY-MM-DD`, existence odkazovaných kategorií, duplicity a úplnost proti zdroji. Aplikace za běhu ani při buildu nezpracovává tabulkové soubory.

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
- Jednoduchá obnova: roční dataset je samostatný verzovaný JSON bez runtime závislosti na tabulkovém parseru.

## 9. Release workflow
1. Aktualizovat roční JSON podle oficiálního rozpisu.
2. Zkontrolovat datový kontrakt, duplicity a úplnost.
3. `npm run lint && npm run typecheck && npm run build && npm test`.
4. Commit + push do `main`.
5. Vercel automaticky vytvoří deployment.

## 10. Budoucí rozšíření
- Více obcí přes route segment (`/obec/[slug]`).
- Admin stránka pro upload a validaci (s autentizací).
- Export do `.ics` pro osobní kalendáře.
- Push notifikace den před svozem.
