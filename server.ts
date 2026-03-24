import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function autoScroll(page: any) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const maxScrolls = 100;
      let scrolls = 0;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        scrolls++;
        if (totalHeight >= scrollHeight || scrolls >= maxScrolls) {
          clearInterval(timer);
          resolve(true);
        }
      }, 150);
    });
  });
}

async function startServer() {
  const hasActualContent = (htmlStr: string) => {
  const $ = cheerio.load(htmlStr);
  const seriesSelectors = ['.chapter-list', '.list-chapter', '#chapterlist', '.wp-manga-chapter', '.list-chapters', '.chapters', '.chapter-name', '.listing-chapters_wrap', '.manga-info-chapters', '.series-chapter-list'];
  const chapterSelectors = ['.chapter-content', '.read-content', '.vung-doc', '.page-break', '.reading-content', '.reader-area', '.wp-manga-chapter-img', '.entry-content', '#readerarea', '.manga-reading-content'];
  return $(seriesSelectors.join(', ')).length > 0 || $(chapterSelectors.join(', ')).length > 0 || $('img').length > 3;
};

const isCloudflareBlocked = (htmlStr: string) => {
  if (hasActualContent(htmlStr)) return false;
  const $ = cheerio.load(htmlStr);
  const title = $('title').text();
  const bodyText = $('body').text();
  return title.includes('Just a moment...') || 
         title.includes('Attention Required! | Cloudflare') ||
         bodyText.includes('checking your browser') ||
         bodyText.includes('DDoS protection') ||
         bodyText.includes('Please stand by, while we are checking your browser');
};

const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/proxy-image", async (req, res) => {
    const { url, referer, cookies } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    if (url.startsWith('data:image/')) {
      try {
        const matches = url.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return res.status(400).json({ error: "Invalid base64 image" });
        }
        const buffer = Buffer.from(matches[2], 'base64');
        res.set('Content-Type', `image/${matches[1]}`);
        res.set('Cache-Control', 'public, max-age=31536000');
        return res.send(buffer);
      } catch (error) {
        return res.status(500).json({ error: "Failed to parse base64 image" });
      }
    }
    
    try {
      const headers: any = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': (referer as string) || url,
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      };

      if (cookies && typeof cookies === 'string') {
        headers['Cookie'] = cookies;
      }

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers
      });
      
      res.set('Content-Type', response.headers['content-type']);
      res.set('Cache-Control', 'public, max-age=31536000');
      res.send(response.data);
    } catch (error: any) {
      if (error.response && [403, 503].includes(error.response.status)) {
        console.log(`Axios failed with ${error.response.status} for ${url}, trying Puppeteer fallback...`);
        try {
          const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          });
          const page = await browser.newPage();
          
          const headers: any = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': (referer as string) || url,
          };
          await page.setExtraHTTPHeaders(headers);
          
          if (cookies && typeof cookies === 'string') {
            try {
              const urlObj = new URL(url);
              const cookieArray = cookies.split(';').map(c => {
                const [name, ...rest] = c.trim().split('=');
                return { name, value: rest.join('='), domain: urlObj.hostname };
              });
              await page.setCookie(...cookieArray);
            } catch (e) {
              console.error("Failed to parse cookies for Puppeteer:", e);
            }
          }
          
          const viewSource = await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
          if (!viewSource) throw new Error("No response from Puppeteer");
          
          const buffer = await viewSource.buffer();
          const contentType = viewSource.headers()['content-type'] || 'image/jpeg';
          await browser.close();
          
          res.set('Content-Type', contentType);
          res.set('Cache-Control', 'public, max-age=31536000');
          return res.send(buffer);
        } catch (puppeteerError: any) {
          console.error("Puppeteer fallback error:", puppeteerError.message);
        }
      }
      console.error("Proxy image error:", error.message);
      res.status(500).json({ error: "Failed to fetch image" });
    }
  });

  // Proxy for auto-import (example: fetching RSS or scraping)
  app.get("/api/import/rss", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL is required" });
    try {
      const response = await axios.get(url as string);
      res.send(response.data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch RSS" });
    }
  });

  app.get("/api/scrape/auto", async (req, res) => {
    const { url, cookies, userAgent } = req.query;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const urlString = url as string;

    // Check if it's a direct image URL first
    if (/\.(jpe?g|png|gif|webp|avif|bmp|tiff?|jfif|svg)(\?.*)?$/i.test(urlString)) {
      return res.json({
        type: 'chapter',
        url: urlString,
        images: [urlString],
        title: urlString.split('/').pop()?.split('?')[0] || 'Image'
      });
    }

    let browser;
    try {
      // Small random delay to mimic human behavior
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox", 
          "--disable-setuid-sandbox",
          "--disable-web-security",
          "--disable-features=IsolateOrigins,site-per-process",
          "--disable-blink-features=AutomationControlled",
          "--ignore-certificate-errors"
        ]
      });

      const page = await browser.newPage();
      await page.setCacheEnabled(true);
      
      // Set User Agent
      const sanitizedUserAgent = (userAgent as string || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36')
        .replace(/[^\x20-\x7E]/g, '')
        .trim();
      await page.setUserAgent(sanitizedUserAgent);

      // Set Referer and other headers
      try {
        const origin = new URL(urlString).origin;
        await page.setExtraHTTPHeaders({
          'Referer': origin,
          'Accept-Language': 'en-US,en;q=0.9'
        });
      } catch (e) { /* ignore invalid URL */ }

      // Set Cookies if provided
      if (cookies) {
        const urlObj = new URL(url as string);
        const domain = urlObj.hostname;
        const cookieList = (cookies as string).split(';').map(pair => {
          const [name, ...value] = pair.trim().split('=');
          return {
            name,
            value: value.join('='),
            domain: '.' + (domain.startsWith('www.') ? domain.substring(4) : domain),
            path: '/'
          };
        }).filter(c => c.name && c.value);
        
        if (cookieList.length > 0) {
          await page.setCookie(...cookieList);
        }
      }

      // Navigate to URL with retry logic for aborted requests
      try {
        const response = await page.goto(urlString, {
          waitUntil: "domcontentloaded",
          timeout: 45000
        });

        if (response && !response.ok() && response.status() !== 304) {
          console.warn(`[Scraper] Initial navigation returned status ${response.status()}`);
        }
      } catch (e: any) {
        console.warn(`[Scraper] Initial navigation failed: ${e.message}. Retrying with minimal wait...`);
        try {
          await page.goto(urlString, {
            waitUntil: "load",
            timeout: 30000
          });
        } catch (retryError: any) {
          // If it's still aborted, it might be a direct file or a very aggressive block
          if (!retryError.message.includes('ERR_ABORTED')) {
            throw retryError;
          }
          console.warn(`[Scraper] Retry also aborted. Continuing to see if content loaded anyway.`);
        }
      }

      // Check for Cloudflare challenge
      let initialHtml = await page.content();
      let isCloudflare = isCloudflareBlocked(initialHtml);

      let finalPage = page;

      if (isCloudflare) {
        console.log("Cloudflare detected on target URL. Opening a new page to the origin to solve it...");
        
        const originPage = await browser.newPage();
        await originPage.setCacheEnabled(true);
        await originPage.setUserAgent(sanitizedUserAgent);
        try {
          const origin = new URL(urlString).origin;
          await originPage.setExtraHTTPHeaders({
            'Referer': origin,
            'Accept-Language': 'en-US,en;q=0.9'
          });
          
          if (cookies) {
            const urlObj = new URL(origin);
            const domain = urlObj.hostname;
            const cookieList = (cookies as string).split(';').map(pair => {
              const [name, ...value] = pair.trim().split('=');
              return { 
                name, 
                value: value.join('='), 
                domain: '.' + (domain.startsWith('www.') ? domain.substring(4) : domain),
                path: '/'
              };
            }).filter(c => c.name && c.value);
            if (cookieList.length > 0) {
              await originPage.setCookie(...cookieList);
            }
          }

          await originPage.goto(origin, { waitUntil: 'domcontentloaded', timeout: 30000 });
          
          console.log("Waiting for challenge to resolve on origin page...");
          await new Promise(resolve => setTimeout(resolve, 12000));
          
          // Try to click the "I am human" checkbox if it exists
          try {
            const frames = originPage.frames();
            for (const frame of frames) {
              if (frame.url().includes('cloudflare')) {
                const checkbox = await frame.$('input[type="checkbox"]');
                if (checkbox) {
                  await checkbox.click();
                  await new Promise(resolve => setTimeout(resolve, 5000));
                }
              }
            }
          } catch (e) {
            console.log("Failed to interact with Cloudflare checkbox on origin:", e);
          }
          
          // Wait a bit more
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Extract cookies from the solved origin page
          const solvedCookies = await originPage.cookies();
          console.log(`Extracted ${solvedCookies.length} cookies from solved page.`);
          
          // Apply cookies to a new page with cache enabled
          console.log("Opening a new page with cookies and cache to load the target URL...");
          await page.close(); // Close the original page
          
          finalPage = await browser.newPage();
          await finalPage.setCacheEnabled(true);
          await finalPage.setUserAgent(sanitizedUserAgent);
          
          if (solvedCookies.length > 0) {
            await finalPage.setCookie(...solvedCookies);
          }
          
        } catch (e: any) {
          console.log("Error solving challenge on origin page:", e.message);
        } finally {
          await originPage.close();
        }
        
        // Navigate to the target URL with the new page
        try {
          await finalPage.goto(urlString, { waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch (e: any) {
          console.log("Error loading target URL on new page:", e.message);
        }
      }

      // Wait for network to settle
      try {
        await finalPage.waitForNetworkIdle({ timeout: 15000 });
      } catch (e) {
        console.log("Network idle timeout, continuing anyway...");
      }

      // Wait a bit more for dynamic content
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Auto scroll to trigger lazy loading
      await autoScroll(finalPage);
      
      // Wait another 2s after scroll for images to actually load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get HTML content after scrolling
      let html = await finalPage.content();
      
      // Get the final cookies to return to the client
      let finalCookies = await finalPage.cookies();
      let cookieString = finalCookies.map(c => `${c.name}=${c.value}`).join('; ');
      
      // Check if we are still on a Cloudflare page
      if (isCloudflareBlocked(html)) {
        console.log("Still on Cloudflare page. Closing old page and opening a new page with cookies and cache...");
        
        try {
          await finalPage.close();
          const retryPage = await browser.newPage();
          await retryPage.setUserAgent(sanitizedUserAgent);
          await retryPage.setCacheEnabled(true);
          
          if (finalCookies.length > 0) {
            await retryPage.setCookie(...finalCookies);
          }
          
          await retryPage.goto(urlString, { waitUntil: 'domcontentloaded', timeout: 30000 });
          
          console.log("Waiting for challenge to resolve on retry page...");
          await new Promise(resolve => setTimeout(resolve, 15000));
          
          // Try to click the "I am human" checkbox if it exists
          try {
            const frames = retryPage.frames();
            for (const frame of frames) {
              if (frame.url().includes('cloudflare')) {
                const checkbox = await frame.$('input[type="checkbox"]');
                if (checkbox) {
                  await checkbox.click();
                  await new Promise(resolve => setTimeout(resolve, 5000));
                }
              }
            }
          } catch (e) {
            console.log("Failed to interact with Cloudflare checkbox on retry page:", e);
          }
          
          await new Promise(resolve => setTimeout(resolve, 10000));
          await autoScroll(retryPage);
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          html = await retryPage.content();
          finalCookies = await retryPage.cookies();
          cookieString = finalCookies.map(c => `${c.name}=${c.value}`).join('; ');
          await retryPage.close();
        } catch (e) {
          console.log("Retry page failed:", e);
        }
        
        if (isCloudflareBlocked(html)) {
          console.log("Puppeteer failed to bypass Cloudflare. Trying axios fallback...");
          try {
            const response = await axios.get(urlString, {
              headers: {
                'User-Agent': sanitizedUserAgent,
                'Cookie': (cookies as string) || '',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
              },
              timeout: 15000
            });
            html = response.data;
            if (isCloudflareBlocked(html)) {
              throw new Error("Axios fallback also blocked.");
            }
            console.log("Axios fallback succeeded!");
            cookieString = (cookies as string) || '';
          } catch (axiosError: any) {
            console.log("Axios fallback failed:", axiosError.message);
            throw new Error("Failed to bypass Cloudflare protection. Please try providing fresh cookies from your browser.");
          }
        }
      }

      const $ = cheerio.load(html);
      
      // Try to detect page type with more aggressive selectors
      let type = 'unknown';
      const seriesSelectors = [
        '.chapter-list', '.list-chapter', '#chapterlist', '.wp-manga-chapter', 
        '.list-chapters', '.chapters', '.chapter-name', '.listing-chapters_wrap',
        '.manga-info-chapters', '.series-chapter-list'
      ];
      const chapterSelectors = [
        '.chapter-content', '.read-content', '.vung-doc', '.page-break', 
        '.reading-content', '.reader-area', '.wp-manga-chapter-img',
        '.entry-content', '#readerarea', '.manga-reading-content'
      ];
      const listSelectors = [
        '.list-story', '.item-list', '.series-list', '.manga-item', 
        '.list-manga', '.grid-manga', '.manga-box', '.manga-list-wrapper',
        '.latest-updates', '.manga-grid'
      ];

      if ($(seriesSelectors.join(', ')).length > 0) type = 'series';
      else if ($(chapterSelectors.join(', ')).length > 0) type = 'chapter';
      else if ($(listSelectors.join(', ')).length > 0) type = 'list';
      
      // Fallback detection based on common elements
      if (type === 'unknown') {
        if ($('a[href*="chapter"]').length > 8) type = 'series';
        else if ($('img[src*="chapter"], img[data-src*="chapter"]').length > 3) type = 'chapter';
        else if ($('a[href*="manga/"]').length > 8 || $('a[href*="series/"]').length > 8) type = 'list';
      }

      const data: any = { type, url, cookies: cookieString };

      if (type === 'series' || $('h1').length > 0) {
        data.title = $('h1').first().text().trim() || 
                     $('.story-info-right h1, .post-title, .entry-title, .title, .manga-title').first().text().trim();
        data.description = $('.story-info-right-description, .description, .summary, .post-content, .synopsis, .manga-excerpt, .manga-summary').text().trim();
        
        const coverSelectors = [
          '.info-image img', '.cover img', '.manga-info-pic img', 
          '.post-thumbnail img', '.thumb img', '.manga-poster img',
          '.summary_image img', '.manga-thumb img'
        ];
        
        const coverEl = $(coverSelectors.join(', ')).first();
        data.coverImage = coverEl.attr('data-src') || coverEl.attr('data-lazy-src') || coverEl.attr('src');
        
        // Resolve cover image
        if (data.coverImage) {
          try {
            data.coverImage = new URL(data.coverImage.trim(), url as string).href;
          } catch (e) { /* ignore */ }
        }

        // Chapters - handle multiple common structures
        const chapters: any[] = [];
        const chLinkSelectors = [
          '.chapter-list a', '.list-chapter a', '#chapterlist a', 
          '.wp-manga-chapter a', '.list-chapters a', '.chapters a',
          '.chapter-name a', '.ch-link', '.chapter-link', '.manga-chapters a'
        ];

        $(chLinkSelectors.join(', ')).each((i, el) => {
          const href = $(el).attr('href');
          const text = $(el).text().trim() || $(el).attr('title');
          if (href && (href.includes('chapter') || href.includes('read') || href.includes('ep-') || /chapter|chap|ep|episode/i.test(href))) {
            try {
              const absoluteUrl = new URL(href, url as string).href;
              // Avoid duplicates
              if (!chapters.find(c => c.url === absoluteUrl)) {
                chapters.push({
                  title: text || `Chapter ${chapters.length + 1}`,
                  url: absoluteUrl,
                  chapterNumber: 0
                });
              }
            } catch (e) { /* ignore */ }
          }
        });
        
        // Fallback: If no chapters found with specific selectors, search all links
        if (chapters.length === 0) {
          $('a').each((i, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().trim() || $(el).attr('title') || '';
            if (href && (href.includes('chapter') || href.includes('read') || href.includes('ep-') || /chapter|chap|ep|episode/i.test(href) || /chapter|chap|ep|episode/i.test(text))) {
              try {
                const absoluteUrl = new URL(href, url as string).href;
                // Avoid duplicates and self-links
                if (!chapters.find(c => c.url === absoluteUrl) && absoluteUrl !== url) {
                  chapters.push({
                    title: text || `Chapter ${chapters.length + 1}`,
                    url: absoluteUrl,
                    chapterNumber: 0
                  });
                }
              } catch (e) { /* ignore */ }
            }
          });
        }

        if (chapters.length > 0) {
          data.type = 'series';
          // Try to extract chapter number from title if possible, otherwise use index
          data.chapters = chapters.reverse().map((ch, idx) => {
            const numMatch = ch.title.match(/(\d+(\.\d+)?)/);
            return { 
              ...ch, 
              chapterNumber: numMatch ? parseFloat(numMatch[1]) : idx + 1 
            };
          });
        }
      }

      if (type === 'list' || $(listSelectors.join(', ')).length > 0) {
        const series: any[] = [];
        const itemSelectors = [
          '.list-story .item', '.item-list .item', '.series-list .item', 
          '.manga-item', '.list-manga .item', '.grid-manga .item',
          '.manga-box', '.entry-item', '.manga-card', '.manga-item-wrapper'
        ];

        $(itemSelectors.join(', ')).each((i, el) => {
          const link = $(el).find('a').filter((i, a) => $(a).text().trim().length > 0).first();
          const title = link.text().trim() || $(el).find('h3, h2, .title').first().text().trim();
          const href = link.attr('href') || $(el).find('a').first().attr('href');
          const cover = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
          
          if (href && title && !href.includes('category') && !href.includes('tag')) {
            try {
              const absoluteUrl = new URL(href, url as string).href;
              if (!series.find(s => s.url === absoluteUrl)) {
                series.push({
                  title,
                  url: absoluteUrl,
                  coverImage: cover ? new URL(cover.trim(), url as string).href : null
                });
              }
            } catch (e) { /* ignore */ }
          }
        });
        if (series.length > 0) {
          data.type = 'list';
          data.series = series;
        }
      }

      if (type === 'chapter' || $(chapterSelectors.join(', ')).length > 0) {
        const images: string[] = [];
        // Prioritize high-quality attributes often used for lazy loading
        const imgSelectors = [
          '.chapter-content img', '.read-content img', '.vung-doc img', 
          '.page-break img', '.reading-content img', '.wp-manga-chapter-img img',
          '.reader-area img', '.entry-content img', '#readerarea img',
          '.manga-reading-content img', '.canvas-container img', '.chapter-video-frame img',
          '.rd-cnt img', '.reader-main img', '.chapter-img img'
        ];
        
        console.log(`[Scraper] Attempting to find images for chapter. Selectors: ${imgSelectors.length}`);
        
        $(imgSelectors.join(', ')).each((i, el) => {
          // Priority list for attributes that usually contain the high-res image
          const src = $(el).attr('data-original') || 
                      $(el).attr('data-src') || 
                      $(el).attr('data-lazy-src') || 
                      $(el).attr('data-src-img') ||
                      $(el).attr('data-full-url') ||
                      $(el).attr('data-srcset') ||
                      $(el).attr('src');

          if (src && !src.includes('logo') && !src.includes('banner') && !src.includes('avatar') && !src.includes('icon') && !src.includes('ads')) {
            try {
              // Handle srcset (take the first URL)
              const cleanSrc = src.split(' ')[0].trim();
              const absoluteUrl = new URL(cleanSrc, url as string).href;
              // Filter out common tracking pixels or tiny icons
              if (!absoluteUrl.includes('pixel') && !absoluteUrl.includes('analytics') && !absoluteUrl.includes('doubleclick') && !absoluteUrl.includes('google-analytics')) {
                images.push(absoluteUrl);
              }
            } catch (e) { /* ignore */ }
          }
        });
        
        // If still no images, try a broader search for all images in the body
        if (images.length === 0) {
          console.log(`[Scraper] No images found with specific selectors. Trying broad search...`);
          $('img').each((i, el) => {
            const src = $(el).attr('data-original') || $(el).attr('data-src') || $(el).attr('src');
            if (src && !src.includes('logo') && !src.includes('banner') && !src.includes('avatar') && !src.includes('icon') && !src.includes('ads')) {
              try {
                const absoluteUrl = new URL(src.trim(), url as string).href;
                if (!absoluteUrl.includes('pixel') && !absoluteUrl.includes('analytics')) {
                  images.push(absoluteUrl);
                }
              } catch (e) { /* ignore */ }
            }
          });
        }
        
        console.log(`[Scraper] Found ${images.length} images for chapter.`);
        
        if (images.length > 0) {
          data.type = 'chapter';
          data.images = [...new Set(images)];
        } else {
          // If no images, try to extract text content for novels
          const textSelectors = [
            '.chapter-content', '.read-content', '.reading-content', '.entry-content',
            '#readerarea', '.manga-reading-content', '.text-left', '.novel-content',
            '#chapter-content', '.cha-words', '.chapter-body', '.epcontent'
          ];
          
          let textContent = '';
          for (const selector of textSelectors) {
            const el = $(selector);
            if (el.length > 0) {
              // Get HTML to preserve basic formatting like paragraphs and breaks
              textContent = el.html() || '';
              break;
            }
          }
          
          // Fallback: get all paragraphs in the main body if no specific container found
          if (!textContent) {
            const paragraphs = $('p').map((i, el) => `<p>${$(el).text()}</p>`).get().join('\n');
            if (paragraphs.length > 500) { // Arbitrary threshold to ensure it's actual content
              textContent = paragraphs;
            }
          }
          
          if (textContent && textContent.length > 200) {
            data.type = 'chapter';
            data.content = textContent;
            console.log(`[Scraper] Found text content for novel chapter (${textContent.length} chars).`);
          }
        }
      }

      res.json(data);
    } catch (error: any) {
      console.error("Auto scraping failed:", error.message);
      res.status(500).json({ 
        error: "Failed to scrape website", 
        details: error.message,
        code: error.code
      });
    } finally {
      if (browser) await browser.close();
    }
  });

  // Translation Proxy using Gemini API
  app.post("/api/translate", async (req, res) => {
    const { text, target } = req.body;
    if (!text || !target) {
      return res.status(400).json({ error: "Text and target language are required" });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured");
      }
      
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate the following text to ${target}. Only return the translated text, nothing else.\n\nText: ${text}`,
      });
      
      res.json({ translatedText: response.text?.trim() || text });
    } catch (error: any) {
      console.error("Translation error:", error.message);
      res.status(500).json({ error: "Failed to translate text" });
    }
  });

  // Storj Presigned URL Endpoint
  app.post("/api/storj-presign", async (req, res) => {
    try {
      const { filename, contentType } = req.body;
      if (!filename || !contentType) {
        return res.status(400).json({ error: "Filename and contentType are required" });
      }

      const accessKeyId = process.env.STORJ_ACCESS_KEY_ID;
      const secretAccessKey = process.env.STORJ_SECRET_ACCESS_KEY;
      const bucketName = process.env.STORJ_BUCKET_NAME;
      const endpoint = process.env.STORJ_ENDPOINT;
      const publicUrl = process.env.STORJ_PUBLIC_URL;

      if (!accessKeyId || !secretAccessKey || !bucketName || !endpoint || !publicUrl) {
        return res.status(500).json({ error: "Storj credentials not fully configured" });
      }

      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

      const s3 = new S3Client({
        region: "auto",
        endpoint: endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });

      const key = `manga/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const command = new PutObjectCommand({ Bucket: bucketName, Key: key, ContentType: contentType });
      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
      const url = `${publicUrl.replace(/\/$/, '')}/${key}`;

      res.json({ uploadUrl, url });
    } catch (error: any) {
      console.error("Storj Presign Error:", error.message);
      res.status(500).json({ error: "Failed to generate presigned URL" });
    }
  });

  app.post("/api/storj-presign-batch", async (req, res) => {
    try {
      const { files } = req.body; // Array of { filename, contentType }
      if (!files || !Array.isArray(files)) {
        return res.status(400).json({ error: "Files array is required" });
      }

      const accessKeyId = process.env.STORJ_ACCESS_KEY_ID;
      const secretAccessKey = process.env.STORJ_SECRET_ACCESS_KEY;
      const bucketName = process.env.STORJ_BUCKET_NAME;
      const endpoint = process.env.STORJ_ENDPOINT;
      const publicUrl = process.env.STORJ_PUBLIC_URL;

      if (!accessKeyId || !secretAccessKey || !bucketName || !endpoint || !publicUrl) {
        return res.status(500).json({ error: "Storj credentials not fully configured" });
      }

      const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

      const s3 = new S3Client({
        region: "auto",
        endpoint: endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });

      const results = await Promise.all(files.map(async (f: any) => {
        const key = `manga/${Date.now()}-${f.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const command = new PutObjectCommand({ Bucket: bucketName, Key: key, ContentType: f.contentType });
        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        const url = `${publicUrl.replace(/\/$/, '')}/${key}`;
        return { uploadUrl, url, filename: f.filename };
      }));

      res.json({ results });
    } catch (error: any) {
      console.error("Storj Batch Presign Error:", error.message);
      res.status(500).json({ error: "Failed to generate batch presigned URLs" });
    }
  });

  // Storj Presigned GET URL Endpoint
  app.get("/api/storj-get-url", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: "URL is required" });
      }

      const accessKeyId = process.env.STORJ_ACCESS_KEY_ID;
      const secretAccessKey = process.env.STORJ_SECRET_ACCESS_KEY;
      const bucketName = process.env.STORJ_BUCKET_NAME;
      const endpoint = process.env.STORJ_ENDPOINT;

      if (!accessKeyId || !secretAccessKey || !bucketName || !endpoint) {
        return res.status(500).json({ error: "Storj credentials not configured" });
      }

      const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

      const s3 = new S3Client({
        region: "auto",
        endpoint: endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      let key = url;
      try {
        const parsedUrl = new URL(url);
        let pathname = parsedUrl.pathname;
        if (pathname.startsWith(`/${bucketName}/`)) {
          key = pathname.substring(bucketName.length + 2);
        } else if (pathname.startsWith('/')) {
          key = pathname.substring(1);
        }
      } catch (e) {
        // Ignore parsing errors, use url as key
      }

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
      res.json({ url: signedUrl });
    } catch (error: any) {
      console.error("Storj Get Presign Error:", error.message);
      res.status(500).json({ error: "Failed to generate presigned GET URL" });
    }
  });

  // Storj Direct Image Proxy Endpoint
  app.get("/api/storj-image", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== 'string') {
        return res.status(400).send("URL is required");
      }

      const accessKeyId = process.env.STORJ_ACCESS_KEY_ID;
      const secretAccessKey = process.env.STORJ_SECRET_ACCESS_KEY;
      const bucketName = process.env.STORJ_BUCKET_NAME;
      const endpoint = process.env.STORJ_ENDPOINT;

      if (!accessKeyId || !secretAccessKey || !bucketName || !endpoint) {
        return res.status(500).send("Storj credentials not configured");
      }

      const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");

      let key = url;
      try {
        const parsedUrl = new URL(url);
        let pathname = parsedUrl.pathname;
        // If the URL contains the bucket name, strip it to get the key
        if (pathname.startsWith(`/${bucketName}/`)) {
          key = pathname.substring(bucketName.length + 2);
        } else if (pathname.startsWith('/')) {
          key = pathname.substring(1);
        }
      } catch (e) {
        // Ignore parsing errors, use url as key
      }

      console.log(`Proxying Storj image: ${url} -> Key: ${key} (Bucket: ${bucketName})`);

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const s3 = new S3Client({
        region: "auto",
        endpoint: endpoint,
        forcePathStyle: true,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      const response = await s3.send(command);
      
      if (response.ContentType) {
        res.set('Content-Type', response.ContentType);
      }
      res.set('Cache-Control', 'public, max-age=31536000');
      
      // The Body is a stream in Node.js
      if (response.Body) {
        const stream = response.Body as any;
        stream.pipe(res);
        stream.on('error', (err: any) => {
          console.error("Stream error:", err);
          if (!res.headersSent) {
            res.status(500).send("Error streaming image");
          } else {
            res.end();
          }
        });
      } else {
        res.status(404).send("Image not found");
      }
    } catch (error: any) {
      console.error("Storj Image Proxy Error:", error.message);
      res.status(500).send("Failed to fetch image from Storj");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
