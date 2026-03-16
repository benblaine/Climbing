/**
 * thecrag.com scraper for South African climbing areas.
 *
 * Usage:
 *   cd scripts/scraper
 *   npm install
 *   npx playwright install chromium
 *   npx tsx scrape-thecrag.ts
 *
 * Outputs: scraped-data.json
 * Then run: npx tsx seed-database.ts
 */

import { chromium, type Page } from "playwright";
import { parseAreaPage, parseRoutesFromCragPage } from "./parsers.js";
import { writeFileSync, existsSync, readFileSync } from "fs";

const BASE_URL = "https://www.thecrag.com";

// South African climbing areas to scrape
const TARGET_AREAS = [
  "/climbing/south-africa/western-cape/montagu",
  "/climbing/south-africa/western-cape/cape-town",
  "/climbing/south-africa/mpumalanga/waterval-boven",
  "/climbing/south-africa/western-cape/cederberg",
  "/climbing/south-africa/western-cape/rocklands",
  "/climbing/south-africa/kwazulu-natal",
  "/climbing/south-africa/free-state/clarens",
];

interface ScrapedData {
  areas: Array<{
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    url: string;
    crags: Array<{
      name: string;
      description: string;
      latitude: number;
      longitude: number;
      url: string;
      routes: Array<{
        name: string;
        grade: string;
        grade_sort: number;
        style: string;
        pitches: number;
        length_meters: number | null;
        description: string;
        first_ascensionist: string;
        first_ascent_date: string;
        thecrag_id: string;
      }>;
    }>;
  }>;
}

const PROGRESS_FILE = "scrape-progress.json";
const OUTPUT_FILE = "scraped-data.json";

function loadProgress(): Set<string> {
  if (existsSync(PROGRESS_FILE)) {
    const data = JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
    return new Set(data.completed ?? []);
  }
  return new Set();
}

function saveProgress(completed: Set<string>) {
  writeFileSync(
    PROGRESS_FILE,
    JSON.stringify({ completed: Array.from(completed) }, null, 2)
  );
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(page: Page, url: string): Promise<string> {
  console.log(`  Fetching: ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await delay(2000 + Math.random() * 2000); // 2-4s random delay
  return await page.content();
}

async function main() {
  console.log("Starting thecrag.com scraper for South Africa...\n");

  const completed = loadProgress();
  const data: ScrapedData = existsSync(OUTPUT_FILE)
    ? JSON.parse(readFileSync(OUTPUT_FILE, "utf-8"))
    : { areas: [] };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    for (const areaPath of TARGET_AREAS) {
      if (completed.has(areaPath)) {
        console.log(`Skipping already-scraped area: ${areaPath}`);
        continue;
      }

      console.log(`\n=== Scraping area: ${areaPath} ===`);

      const areaHtml = await fetchPage(page, `${BASE_URL}${areaPath}`);
      const areaInfo = parseAreaPage(areaHtml, areaPath);

      const area = {
        name: areaInfo.name ?? areaPath.split("/").pop() ?? "Unknown",
        description: areaInfo.description ?? "",
        latitude: areaInfo.latitude ?? 0,
        longitude: areaInfo.longitude ?? 0,
        url: areaPath,
        crags: [] as ScrapedData["areas"][0]["crags"],
      };

      // Get sub-area (crag) links from the area page
      const subAreaLinks = (areaInfo.subareas ?? [])
        .filter(
          (link) =>
            link.startsWith(areaPath + "/") &&
            link.split("/").length <= areaPath.split("/").length + 2
        )
        .slice(0, 30); // Limit to 30 crags per area

      console.log(`  Found ${subAreaLinks.length} sub-areas`);

      for (const cragPath of subAreaLinks) {
        if (completed.has(cragPath)) {
          console.log(`  Skipping already-scraped crag: ${cragPath}`);
          continue;
        }

        try {
          const cragHtml = await fetchPage(page, `${BASE_URL}${cragPath}`);
          const { cragInfo, routes } = parseRoutesFromCragPage(
            cragHtml,
            cragPath
          );

          const crag = {
            name: cragInfo.name ?? cragPath.split("/").pop() ?? "Unknown",
            description: cragInfo.description ?? "",
            latitude: cragInfo.latitude ?? area.latitude,
            longitude: cragInfo.longitude ?? area.longitude,
            url: cragPath,
            routes,
          };

          area.crags.push(crag);
          completed.add(cragPath);
          saveProgress(completed);

          console.log(
            `  Crag: ${crag.name} - ${routes.length} routes found`
          );
        } catch (err) {
          console.error(`  Error scraping ${cragPath}:`, err);
        }
      }

      // If area had no sub-areas, try to parse routes directly from area page
      if (area.crags.length === 0) {
        const { cragInfo, routes } = parseRoutesFromCragPage(
          areaHtml,
          areaPath
        );
        if (routes.length > 0) {
          area.crags.push({
            name: cragInfo.name ?? area.name,
            description: cragInfo.description ?? "",
            latitude: cragInfo.latitude ?? area.latitude,
            longitude: cragInfo.longitude ?? area.longitude,
            url: areaPath,
            routes,
          });
        }
      }

      data.areas.push(area);
      completed.add(areaPath);
      saveProgress(completed);

      // Save progress after each area
      writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
      console.log(`  Saved area: ${area.name} with ${area.crags.length} crags`);
    }
  } finally {
    await browser.close();
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));

  // Print summary
  let totalRoutes = 0;
  let totalCrags = 0;
  for (const area of data.areas) {
    totalCrags += area.crags.length;
    for (const crag of area.crags) {
      totalRoutes += crag.routes.length;
    }
  }

  console.log(`\n=== Scraping Complete ===`);
  console.log(`Areas: ${data.areas.length}`);
  console.log(`Crags: ${totalCrags}`);
  console.log(`Routes: ${totalRoutes}`);
  console.log(`Output: ${OUTPUT_FILE}`);
  console.log(`\nNext step: npx tsx seed-database.ts`);
}

main().catch(console.error);
