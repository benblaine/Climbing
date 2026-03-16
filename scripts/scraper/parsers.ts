import * as cheerio from "cheerio";

export interface ScrapedArea {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  url: string;
  subareas: string[]; // URLs to crag pages
}

export interface ScrapedCrag {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  approach: string;
  area_url: string;
  url: string;
  routes: ScrapedRoute[];
}

export interface ScrapedRoute {
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
}

// SA grade to sort value
const SA_GRADES: Record<string, number> = {};
for (let i = 1; i <= 40; i++) SA_GRADES[String(i)] = i;

export function gradeToSort(grade: string): number {
  const cleaned = grade.trim();
  if (SA_GRADES[cleaned]) return SA_GRADES[cleaned];
  const num = parseInt(cleaned);
  if (!isNaN(num) && num >= 1 && num <= 40) return num;
  return 0;
}

export function parseAreaPage(html: string, url: string): Partial<ScrapedArea> {
  const $ = cheerio.load(html);

  const name = $("h1").first().text().trim();
  const description = $('meta[name="description"]').attr("content") || "";

  // Try to extract coordinates from the page
  let latitude = 0;
  let longitude = 0;

  // thecrag embeds coordinates in JSON-LD or in data attributes
  const jsonLd = $('script[type="application/ld+json"]').html();
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd);
      if (data.geo) {
        latitude = parseFloat(data.geo.latitude);
        longitude = parseFloat(data.geo.longitude);
      }
    } catch {
      // ignore parse errors
    }
  }

  // Also try meta tags
  if (!latitude) {
    const geoLat = $('meta[property="place:location:latitude"]').attr("content");
    const geoLng = $('meta[property="place:location:longitude"]').attr("content");
    if (geoLat && geoLng) {
      latitude = parseFloat(geoLat);
      longitude = parseFloat(geoLng);
    }
  }

  // Extract sub-area links
  const subareas: string[] = [];
  $("a[href*='/climbing/']").each((_, el) => {
    const href = $(el).attr("href");
    if (href && href.startsWith("/climbing/") && !subareas.includes(href)) {
      subareas.push(href);
    }
  });

  return { name, description, latitude, longitude, url, subareas };
}

export function parseRoutesFromCragPage(
  html: string,
  cragUrl: string
): { cragInfo: Partial<ScrapedCrag>; routes: ScrapedRoute[] } {
  const $ = cheerio.load(html);

  const name = $("h1").first().text().trim();
  const description = $('meta[name="description"]').attr("content") || "";

  let latitude = 0;
  let longitude = 0;

  const jsonLd = $('script[type="application/ld+json"]').html();
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd);
      if (data.geo) {
        latitude = parseFloat(data.geo.latitude);
        longitude = parseFloat(data.geo.longitude);
      }
    } catch {
      // ignore
    }
  }

  if (!latitude) {
    const geoLat = $('meta[property="place:location:latitude"]').attr("content");
    const geoLng = $('meta[property="place:location:longitude"]').attr("content");
    if (geoLat && geoLng) {
      latitude = parseFloat(geoLat);
      longitude = parseFloat(geoLng);
    }
  }

  const routes: ScrapedRoute[] = [];

  // thecrag lists routes in a table or as route cards
  // Try table rows first
  $("tr.route, .route-row, [data-nodeid]").each((_, el) => {
    const $el = $(el);
    const routeName =
      $el.find(".route-name, .name, td:first-child a").first().text().trim();
    const grade = $el.find(".grade, .rateYDS, td.grade").first().text().trim();
    const nodeId = $el.attr("data-nodeid") || $el.find("a").attr("href") || "";

    if (routeName && grade) {
      routes.push({
        name: routeName,
        grade,
        grade_sort: gradeToSort(grade),
        style: detectStyle($el.text()),
        pitches: extractPitches($el.text()),
        length_meters: extractLength($el.text()),
        description: "",
        first_ascensionist: $el.find(".fa, .first-ascent").text().trim(),
        first_ascent_date: "",
        thecrag_id: nodeId,
      });
    }
  });

  // If no routes found in table, try route list items
  if (routes.length === 0) {
    $(".route-item, .climb-item, li[data-id]").each((_, el) => {
      const $el = $(el);
      const routeName = $el.find("a, .name").first().text().trim();
      const grade = $el.find(".grade").first().text().trim();

      if (routeName) {
        routes.push({
          name: routeName,
          grade: grade || "?",
          grade_sort: gradeToSort(grade),
          style: "sport",
          pitches: 1,
          length_meters: null,
          description: "",
          first_ascensionist: "",
          first_ascent_date: "",
          thecrag_id: $el.attr("data-id") || "",
        });
      }
    });
  }

  return {
    cragInfo: { name, description, latitude, longitude, url: cragUrl },
    routes,
  };
}

function detectStyle(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("trad")) return "trad";
  if (lower.includes("boulder")) return "boulder";
  if (lower.includes("mixed")) return "mixed";
  return "sport";
}

function extractPitches(text: string): number {
  const match = text.match(/(\d+)\s*pitch/i);
  return match ? parseInt(match[1]) : 1;
}

function extractLength(text: string): number | null {
  const match = text.match(/(\d+)\s*m\b/i);
  return match ? parseInt(match[1]) : null;
}
