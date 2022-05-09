//adopted from https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/

const puppeteer = require('puppeteer')
const path = require('path')

async function printPDF() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/', {waitUntil: 'networkidle0'});
//   const pdf = await page.pdf({ format: 'A4' });
 const pdf = await page.pdf({ path: path.join("./", "hn.pdf"), format: "a4" });
  await browser.close();

  console.log(typeof pdf)
  return pdf
}

printPDF()