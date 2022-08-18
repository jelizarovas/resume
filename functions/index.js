//adopted from https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/

const puppeteer = require("puppeteer");
const path = require("path");
const person = require("../src/api/person.json");

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
    body { background-color: white}
      .navbar { border: 0px} 
      #print-button {display: none}
      @page:first {margin-top: 0;}
      `,
  });

  // await page.screenshot({
  //   path: "../public/pdf/resume_thumb.png",
  // });

  const now = new Date();

  const pdf = await page.pdf({
    path: path.join("../public/pdf", "Arnas Jelizarovas Resume EN.pdf"),
    format: "letter",
    displayHeaderFooter: true,
    printBackground: true,
    // scale: 0.8,
    margin: {
      top: 35,
      right: 35,
      bottom: 45,
      left: 25,
    },
    headerTemplate: `
    <div style="color: lightgray; font-size: 8px;  text-align: center; width: 90%;  margin-left: auto;  margin-right: auto; display: flex; justify-content: space-between;">
      <span>${person.displayName} Resume</span> <div>Phone:${person.phoneNumber}, Email: ${person.email}</div>
      
    </div>
  `,
    footerTemplate: `
          <div style="color: lightgray; font-size: 8px; padding-top: 5px; text-align: center; width: 90%;  margin-left: auto;  margin-right: auto; display: flex; justify-content: space-between;">
            <span>This resume was written in Typescript and React, generated with Puppeteer on ${now.toLocaleDateString()}, <a href="https://github.com/jelizarovas/resume" style="color: lightgray;" target="_blank">source</a></span> <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span> </div>
            
          </div>
        `,
  });

  await browser.close();

  return pdf;
}

printPDF();
