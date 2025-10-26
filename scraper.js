import puppeteer from "puppeteer";

export async function scrapePropertyData(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  // Extract data from the page
  const data = await page.evaluate(() => {
    const getText = (selector) =>
      document.querySelector(selector)?.innerText?.trim() || null;

    const title =
      getText("h1") ||
      getText(".property-info-address") ||
      getText("meta[property='og:title']") ||
      document.title;

    const description =
      document.querySelector("meta[name='description']")?.content ||
      getText(".property-description") ||
      null;

    // Collect image URLs
    const imageElements = document.querySelectorAll("img");
    const images = Array.from(imageElements)
      .map((img) => img.src)
      .filter((src) => src && src.startsWith("http"));

    // Collect additional property info
    const price = getText(".property-price") || getText(".property-info-price");
    const address =
      getText(".property-address") || getText(".property-info-address") || null;

    return { title, description, price, address, images };
  });

  await browser.close();
  return { url, ...data };
}
