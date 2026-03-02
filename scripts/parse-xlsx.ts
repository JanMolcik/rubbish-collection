#!/usr/bin/env tsx

import fs from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";

type KnownCategory = {
  id: string;
  name: string;
  color: string;
  patterns: RegExp[];
};

type ParsedCell = {
  row: number;
  col: number;
  text: string;
  normalized: string;
  dates: string[];
  isDateOnly: boolean;
  isDecorative: boolean;
  isGeneric: boolean;
  knownCategory?: KnownCategory;
};

type ParsedCategory = {
  id: string;
  name: string;
  color: string;
};

type ParsedDataset = {
  municipality: string;
  region: string;
  year: number;
  sourceFile: string;
  generatedAt: string;
  parserVersion: string;
  categories: ParsedCategory[];
  events: Array<{
    date: string;
    categories: string[];
  }>;
};

const KNOWN_CATEGORIES: KnownCategory[] = [
  {
    id: "komunalni-odpad",
    name: "Komunální odpad",
    color: "#ce5a3a",
    patterns: [/\bsko\b/i, /komun[aá]ln/i, /sm[eě]sn/i],
  },
  {
    id: "plasty",
    name: "Plasty",
    color: "#2e6ee8",
    patterns: [/plast/i],
  },
  {
    id: "papir",
    name: "Papír",
    color: "#a57b4d",
    patterns: [/pap[ií]r/i],
  },
  {
    id: "sklo",
    name: "Sklo",
    color: "#1c8f6a",
    patterns: [/skl[oa]/i],
  },
  {
    id: "kovy",
    name: "Kovové obaly",
    color: "#525f7f",
    patterns: [/kov/i, /plech/i],
  },
  {
    id: "oleje",
    name: "Jedlé oleje a tuky",
    color: "#b48a26",
    patterns: [/olej/i, /tuk/i],
  },
  {
    id: "nebezpecny-odpad",
    name: "Nebezpečný odpad",
    color: "#7f2f75",
    patterns: [/nebezpe/i, /\bno\b/i],
  },
  {
    id: "bioodpad",
    name: "Bioodpad",
    color: "#4f8f2f",
    patterns: [/bio/i],
  },
  {
    id: "objemny-odpad",
    name: "Objemný odpad",
    color: "#8f6a2f",
    patterns: [/objemn/i],
  },
  {
    id: "textil",
    name: "Textil",
    color: "#3f5f8f",
    patterns: [/textil/i],
  },
];

const DECORATIVE_PATTERNS = [
  /term[ií]ny/i,
  /^rok\s*\d{4}$/i,
  /zpracovala/i,
  /ve\s+zl[ií]n[eě]/i,
  /^obec/i,
  /svoz\s+to/i,
];

const GENERIC_PATTERNS = [/^svoz\b/i, /po\s+cel[yý]\s+rok/i, /\d+x\s+za/i];

const DATE_PATTERN_SOURCE = String.raw`(\d{1,2})\s*[.\/-]\s*(\d{1,2})(?:\s*[.\/-]\s*(\d{2,4}))?\.?`;

function createDatePattern(flags = "g"): RegExp {
  return new RegExp(DATE_PATTERN_SOURCE, flags);
}

function normalizeText(value: string): string {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function toSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function excelSerialToDate(serial: number): Date {
  const base = new Date(Date.UTC(1899, 11, 30));
  const millis = serial * 24 * 60 * 60 * 1000;
  return new Date(base.getTime() + millis);
}

function formatIsoDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function detectKnownCategory(text: string): KnownCategory | undefined {
  return KNOWN_CATEGORIES.find((category) =>
    category.patterns.some((pattern) => pattern.test(text)),
  );
}

function isDecorativeLabel(text: string): boolean {
  return DECORATIVE_PATTERNS.some((pattern) => pattern.test(text));
}

function isGenericLabel(text: string): boolean {
  return GENERIC_PATTERNS.some((pattern) => pattern.test(text));
}

function extractYearHints(text: string): number[] {
  const years = text.match(/\b(20\d{2})\b/g) ?? [];
  return years
    .map((year) => Number(year))
    .filter((year) => year >= 2000 && year <= 2100);
}

function parseDateToken(token: string, defaultYear: number): string | null {
  const match = token.match(/(\d{1,2})\s*[.\/-]\s*(\d{1,2})(?:\s*[.\/-]\s*(\d{2,4}))?/);
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  let year = defaultYear;

  if (match[3]) {
    const parsedYear = Number(match[3]);
    year = parsedYear < 100 ? 2000 + parsedYear : parsedYear;
  }

  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return formatIsoDate(date);
}

function extractDateTokens(text: string, defaultYear: number): string[] {
  const tokens: string[] = [];
  for (const match of text.matchAll(createDatePattern())) {
    const parsed = parseDateToken(match[0], defaultYear);
    if (parsed) {
      tokens.push(parsed);
    }
  }
  return Array.from(new Set(tokens));
}

function normalizeCategoryLabel(text: string): string {
  return normalizeText(
    text
      .replace(/^term[ií]ny\s+svozu\s+/i, "")
      .replace(/^svoz\s+/i, "")
      .replace(/\s+\d+x\s+za.*$/i, "")
      .replace(/\s+po\s+cel[yý]\s+rok.*$/i, "")
      .replace(/\s+zvony.*$/i, "")
      .replace(/\s{2,}/g, " "),
  );
}

function chooseBestLabel(
  dateCell: ParsedCell,
  labels: ParsedCell[],
  knownOnly: boolean,
): ParsedCell | null {
  let best: ParsedCell | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const label of labels) {
    if (knownOnly && !label.knownCategory) {
      continue;
    }

    if (label.col > dateCell.col && label.row >= dateCell.row) {
      continue;
    }

    const rowDistance = dateCell.row - label.row;
    const colDistance = Math.abs(dateCell.col - label.col);
    const manhattan = Math.abs(rowDistance) + colDistance;

    if (manhattan > 18) {
      continue;
    }

    let score = 120 - manhattan * 6;

    if (label.row === dateCell.row && label.col < dateCell.col) {
      score += 70;
    }

    if (label.col === dateCell.col && label.row < dateCell.row) {
      score += 35;
    }

    if (label.col <= 2) {
      score += 18;
    }

    if (rowDistance >= 0 && rowDistance <= 2) {
      score += 16;
    }

    if (label.knownCategory) {
      score += 40;
    }

    if (label.isDecorative && !label.knownCategory) {
      score -= 120;
    }

    if (label.isGeneric) {
      score -= 20;
    }

    if (label.row > dateCell.row) {
      score -= 55;
    }

    if (score > bestScore) {
      best = label;
      bestScore = score;
    }
  }

  return bestScore >= 0 ? best : null;
}

function toCellText(value: ExcelJS.CellValue): string {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (value instanceof Date) {
    return formatIsoDate(new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())));
  }

  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") {
      return value.text;
    }

    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((segment) => segment.text).join("");
    }

    if ("result" in value && value.result != null) {
      return String(value.result);
    }
  }

  return String(value);
}

function readArgs() {
  const args = process.argv.slice(2);
  const argMap = new Map<string, string>();

  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (!key.startsWith("--")) {
      continue;
    }

    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      argMap.set(key, "true");
      continue;
    }

    argMap.set(key, value);
    index += 1;
  }

  const input = argMap.get("--input") ?? argMap.get("-i");
  const output = argMap.get("--output") ?? argMap.get("-o");

  if (!input || !output) {
    throw new Error(
      "Missing required args. Example: npm run parse:xlsx -- --input /path/file.xlsx --output src/data/collections-2026.json",
    );
  }

  return {
    input,
    output,
    municipality: argMap.get("--municipality") ?? "Lípa",
    region: argMap.get("--region") ?? "Zlínský kraj",
    forcedYear: argMap.get("--year") ? Number(argMap.get("--year")) : undefined,
  };
}

async function main() {
  const { input, output, municipality, region, forcedYear } = readArgs();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(input);

  const yearHints: number[] = [];
  const cells: ParsedCell[] = [];

  for (const worksheet of workbook.worksheets) {
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const raw = normalizeText(toCellText(cell.value));
        if (!raw) {
          return;
        }

        yearHints.push(...extractYearHints(raw));

        if (cell.value instanceof Date) {
          const date = new Date(
            Date.UTC(
              cell.value.getFullYear(),
              cell.value.getMonth(),
              cell.value.getDate(),
            ),
          );

          cells.push({
            row: rowNumber,
            col: colNumber,
            text: raw,
            normalized: raw.toLowerCase(),
            dates: [formatIsoDate(date)],
            isDateOnly: true,
            isDecorative: false,
            isGeneric: false,
          });

          return;
        }

        if (typeof cell.value === "number" && cell.value > 25000 && cell.value < 70000) {
          const parsed = excelSerialToDate(cell.value);
          cells.push({
            row: rowNumber,
            col: colNumber,
            text: raw,
            normalized: raw.toLowerCase(),
            dates: [formatIsoDate(parsed)],
            isDateOnly: true,
            isDecorative: false,
            isGeneric: false,
          });

          return;
        }

        cells.push({
          row: rowNumber,
          col: colNumber,
          text: raw,
          normalized: raw.toLowerCase(),
          dates: [],
          isDateOnly: false,
          isDecorative: isDecorativeLabel(raw),
          isGeneric: isGenericLabel(raw),
          knownCategory: detectKnownCategory(raw),
        });
      });
    });
  }

  const discoveredYear =
    forcedYear ??
    (yearHints.length
      ? yearHints.sort((a, b) =>
          yearHints.filter((hint) => hint === b).length -
          yearHints.filter((hint) => hint === a).length,
        )[0]
      : new Date().getFullYear());

  for (const cell of cells) {
    if (!cell.isDateOnly) {
      const parsedDates = extractDateTokens(cell.text, discoveredYear);
      if (!parsedDates.length) {
        continue;
      }

      const tokenless = normalizeText(cell.text.replace(createDatePattern(), "").replace(/[;,]/g, ""));
      cell.dates = parsedDates;
      cell.isDateOnly = tokenless.length === 0;
    }
  }

  const labelCells = cells.filter((cell) => !cell.isDateOnly);
  const knownLabelCells = labelCells.filter((cell) => cell.knownCategory);
  const dateCells = cells.filter((cell) => cell.dates.length > 0);

  const categoryById = new Map<string, ParsedCategory>();
  const eventsByDate = new Map<string, Set<string>>();

  function ensureCategory(label: ParsedCell | null): ParsedCategory | null {
    if (!label) {
      return null;
    }

    if (label.knownCategory) {
      const category = {
        id: label.knownCategory.id,
        name: label.knownCategory.name,
        color: label.knownCategory.color,
      };

      categoryById.set(category.id, category);
      return category;
    }

    const normalizedName = normalizeCategoryLabel(label.text);
    if (!normalizedName || normalizedName.length < 3) {
      return null;
    }

    const id = toSlug(normalizedName);
    if (!id || id === "svoz") {
      return null;
    }

    const category = categoryById.get(id) ?? {
      id,
      name: normalizedName,
      color: "#6a6f85",
    };

    categoryById.set(id, category);
    return category;
  }

  for (const dateCell of dateCells) {
    const directLabel = chooseBestLabel(dateCell, labelCells, false);
    const contextKnown = chooseBestLabel(dateCell, knownLabelCells, true);

    const chosenLabel =
      directLabel?.knownCategory
        ? directLabel
        : directLabel?.isGeneric || directLabel?.isDecorative || !directLabel
          ? contextKnown ?? directLabel
          : directLabel;

    const category = ensureCategory(chosenLabel ?? null);
    if (!category) {
      continue;
    }

    for (const date of dateCell.dates) {
      if (Number(date.slice(0, 4)) !== discoveredYear) {
        continue;
      }

      const categoriesForDate = eventsByDate.get(date) ?? new Set<string>();
      categoriesForDate.add(category.id);
      eventsByDate.set(date, categoriesForDate);
    }
  }

  const events = Array.from(eventsByDate.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, categories]) => ({
      date,
      categories: Array.from(categories).sort((left, right) => left.localeCompare(right)),
    }));

  const categoryOrder = new Map(KNOWN_CATEGORIES.map((category, index) => [category.id, index]));
  const categories = Array.from(categoryById.values()).sort((left, right) => {
    const leftRank = categoryOrder.get(left.id) ?? 999;
    const rightRank = categoryOrder.get(right.id) ?? 999;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return left.name.localeCompare(right.name, "cs");
  });

  const dataset: ParsedDataset = {
    municipality,
    region,
    year: discoveredYear,
    sourceFile: path.basename(input),
    generatedAt: new Date().toISOString(),
    parserVersion: "1.0.0",
    categories,
    events,
  };

  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");

  console.log(`Parsed workbook: ${path.basename(input)}`);
  console.log(`Detected year: ${discoveredYear}`);
  console.log(`Categories: ${categories.length}`);
  console.log(`Event days: ${events.length}`);
  console.log(`Output: ${output}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
