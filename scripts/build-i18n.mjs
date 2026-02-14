import path from "node:path";
import fs from "fs-extra";
import { load as loadHtml } from "cheerio";

const ROOT = path.resolve(".");
const SRC_INDEX = path.join(ROOT, "index.html");
const DIST_DIR = path.join(ROOT, "dist");
const LOCALES_DIR = path.join(ROOT, "locales");

const SUPPORTED_LOCALES = [
  "en", // default
  "es",
  "fr",
  "de",
  "ar",
  "zh",
  "ru",
  "pt",
  "hi",
  "ja",
];

const RTL_LOCALES = new Set(["ar", "he", "fa", "ur"]);

async function ensureDirs() {
  await fs.ensureDir(DIST_DIR);
}

async function readIndexTemplate() {
  if (!(await fs.pathExists(SRC_INDEX))) {
    throw new Error(`index.html not found at ${SRC_INDEX}`);
  }
  return fs.readFile(SRC_INDEX, "utf8");
}

async function loadTranslations(locale) {
  const filePath = path.join(LOCALES_DIR, `${locale}.json`);
  if (!(await fs.pathExists(filePath))) return {};
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`[i18n] Failed to parse ${filePath}:`, e.message);
    return {};
  }
}

function isExternalUrl(url) {
  return /^(?:[a-z]+:)?\/\//i.test(url);
}

function shouldSkipUrl(url) {
  if (!url) return true;
  if (isExternalUrl(url)) return true;
  if (url.startsWith("#")) return true;
  if (url.startsWith("data:")) return true;
  if (url.startsWith("mailto:") || url.startsWith("tel:")) return true;
  return false;
}

function rewriteAssetUrls($) {
  const mappings = [
    ['link[rel="stylesheet"][href]', "href"],
    ['link[rel="icon"][href]', "href"],
    ['link[rel="preload"][href]', "href"],
    ['link[rel="prefetch"][href]', "href"],
    ["script[src]", "src"],
    ["img[src]", "src"],
    ["source[src]", "src"],
  ];

  for (const [selector, attr] of mappings) {
    $(selector).each((_, el) => {
      const current = $(el).attr(attr);
      if (shouldSkipUrl(current)) return;
      const normalized = current
        .replace(/^\.\//, "")
        .replace(/^\//, "")
        .replace(/\\/g, "/");
      $(el).attr(attr, `../${normalized}`);
    });
  }
}

function applyTranslations($, translations, locale) {
  // html lang and dir
  $("html").attr("lang", locale);
  $("html").attr("dir", RTL_LOCALES.has(locale) ? "rtl" : "ltr");

  // Document title
  if (translations["document.title"]) {
    const title = String(translations["document.title"]);
    const titleEl = $("head > title");
    if (titleEl.length) titleEl.text(title);
    else $("head").append(`<title>${title}</title>`);
  }

  // Canonical and hreflang alternates
  $('link[rel="alternate"]').remove();
  $('link[rel="canonical"]').remove();

  const siteBase = process.env.SITE_BASE_URL
    ? String(process.env.SITE_BASE_URL).replace(/\/$/, "")
    : null;
  if (siteBase) {
    $("head").append(`<link rel="canonical" href="${siteBase}/${locale}/" />`);
  }
  for (const code of SUPPORTED_LOCALES) {
    // From a localized page (in /<locale>/index.html), link to sibling locales relatively
    $("head").append(
      `<link rel="alternate" hreflang="${code}" href="../${code}/" />`
    );
  }
  // x-default to default locale
  $("head").append(
    `<link rel="alternate" hreflang="x-default" href="../en/" />`
  );

  // All text replacements are handled by data-i18n/data-i18n-html/data-i18n-attr keys
}

function applyKeyedTranslations($, translations) {
  const keys = translations.keys || {};
  for (const [key, value] of Object.entries(keys)) {
    const text = String(value);
    $(`[data-i18n='${key}']`).each((_, el) => {
      $(el).text(text);
    });
    $(`[data-i18n-html='${key}']`).each((_, el) => {
      $(el).html(text);
    });
  }
}

function applyKeyedAttrTranslations($, translations) {
  const keys = translations.keys || {};
  $("[data-i18n-attr]").each((_, el) => {
    const mapping = ($(el).attr("data-i18n-attr") || "").trim();
    if (!mapping) return;
    mapping.split(";").forEach((pair) => {
      const [attrNameRaw, keyRaw] = pair.split(":");
      const attrName = (attrNameRaw || "").trim();
      const key = (keyRaw || "").trim();
      if (!attrName || !key) return;
      if (Object.prototype.hasOwnProperty.call(keys, key)) {
        $(el).attr(attrName, String(keys[key]));
      }
    });
  });
}

async function writeLocalizedPage(locale, templateHtml, translations) {
  const $ = loadHtml(templateHtml);

  applyTranslations($, translations, locale);
  applyKeyedTranslations($, translations);
  applyKeyedAttrTranslations($, translations);
  rewriteAssetUrls($);

  const outDir = path.join(DIST_DIR, locale);
  const outFile = path.join(outDir, "index.html");
  await fs.ensureDir(outDir);
  await fs.writeFile(outFile, $.html(), "utf8");
}

async function copyStaticAssets() {
  // Copy top-level assets once to dist/
  const copies = [
    ["style.css", "style.css"],
    ["js", "js"],
    ["images", "images"],
    ["logos", "logos"],
    ["svg", "svg"],
    ["Religion-icons", "Religion-icons"],
    ["Post-Donation.html", "Post-Donation.html"],
  ];
  for (const [src, dest] of copies) {
    const srcPath = path.join(ROOT, src);
    if (await fs.pathExists(srcPath)) {
      await fs.copy(srcPath, path.join(DIST_DIR, dest));
    }
  }
}

async function writeRootRedirect() {
  const indexPath = path.join(DIST_DIR, "index.html");
  const localesArray = JSON.stringify(SUPPORTED_LOCALES);
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Redirecting…</title><meta http-equiv="refresh" content="0; url=./en/"/></head><body><script>(function(){try{var supported=${localesArray};var nav=(navigator.languages&&navigator.languages[0])||navigator.language||'en';var short=(nav||'en').slice(0,2).toLowerCase();var target=supported.includes(short)?short:'en';location.replace('./'+target+'/');}catch(e){location.replace('./en/');}})();</script></body></html>`;
  await fs.writeFile(indexPath, html, "utf8");
}

async function buildAll() {
  await ensureDirs();
  const template = await readIndexTemplate();
  await fs.emptyDir(DIST_DIR);

  await copyStaticAssets();

  for (const locale of SUPPORTED_LOCALES) {
    const translations = await loadTranslations(locale);
    await writeLocalizedPage(locale, template, translations);
  }

  await writeRootRedirect();
  console.log(
    `[i18n] Build complete. Open dist/en/ or use \"npm run preview\".`
  );
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
