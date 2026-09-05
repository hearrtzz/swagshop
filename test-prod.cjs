const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3001');
  await new Promise(r => setTimeout(r, 1000));
  const html = await page.$eval('#root', el => el.innerHTML);
  console.log('ROOT HTML LENGTH:', html.length);
  if (html.length < 100) console.log(html);
  await browser.close();
  process.exit(0);
})();
