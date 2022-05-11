//adopted from https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/

const puppeteer = require("puppeteer");
const path = require("path");

async function printPDF() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1400, height: 1080 },
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
  //   const pdf = await page.pdf({ format: 'A4' });
  await page.addStyleTag({
    content: `.nav { display: none} 
      .navbar { border: 0px} 
      #print-button {display: none}
      `,
  });

  const pdf = await page.pdf({
    path: path.join("../public/pdf", "Arnas Jelizarovas Resume EN.pdf"),
    format: "letter",
    displayHeaderFooter: true,
    // scale: 0.8,
    margin: {
      top: 30,
      right: 35,
      bottom: 100,
      left: 25,
    },
    footerTemplate: `
          <div style="color: lightgray; border-top: solid lightgray 1px; font-size: 10px; padding-top: 5px; text-align: center; width: 100%;">
            <span>Written in Typescript and React, generated with Puppeteer</span> - <span class="pageNumber"></span>
            <a href="https://jelizarovas.com" target="_blank">jelizarovas.com</a>
          </div>
        `,
  });
  await browser.close();

  return pdf;
}

printPDF();
