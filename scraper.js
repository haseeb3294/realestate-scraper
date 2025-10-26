const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

async function scrapePropertyData(url) {
  try {
    const isLocal = !process.env.AWS_REGION;

    const executablePath = isLocal
      ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
      : await chromium.executablePath();

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // ✅ Extract details from the page
    const data = await page.evaluate(() => {
      const getText = (selector) =>
        document.querySelector(selector)?.innerText?.trim() || null;

      const title =
        getText("h1") ||
        getText(".property-info-address") ||
        document.title ||
        "No title found";

      const description =
        document.querySelector("meta[name='description']")?.content ||
        getText(".property-description") ||
        null;

      const images = Array.from(document.querySelectorAll("img"))
        .map((img) => img.src)
        .filter(
          (src) =>
            src &&
            src.startsWith("http") &&
            !src.includes("svg") &&
            !src.includes("logo")
        );

      const price =
        getText(".property-price") ||
        getText(".property-info-price") ||
        getText("[data-testid='listing-details__price']") ||
        null;

      const address =
        getText(".property-address") ||
        getText(".property-info-address") ||
        getText("[data-testid='listing-details__address']") ||
        null;

      return { title, description, price, address, images };
    });

    await browser.close();
    return { url, ...data };
  } catch (error) {
    console.error("Scraping failed:", error);
    return { error: error.message };
  }
}

module.exports = { scrapePropertyData };
