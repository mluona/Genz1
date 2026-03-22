export default async function handler(req: any, res: any) {
  res.status(501).json({
    error:
      "Auto-import (Scraping) is not supported on Vercel out of the box because it requires a full browser (Puppeteer). Please use the AI Studio preview or a VPS to use the scraper.",
  });
}
