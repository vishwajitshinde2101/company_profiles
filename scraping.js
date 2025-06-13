const puppeteer = require("puppeteer");
const fs = require("fs");
const villageList =  [
  '272500060309800000'
];
let counter = 0;
console.log("__________________________________________________________________________________________________________________________________");
const dist = "Pune";
const tal = "Mulshi";
const apiUrl = 'https://mahabhunakasha.mahabhumi.gov.in/rest/VillageMapService/kidelistFromGisCodeMH';
const plotInfoApiUrl = 'https://mahabhunakasha.mahabhumi.gov.in/rest/MapInfo/getPlotInfo';
async function scrapeVillageData() {
  let browser;
  const villageData = {};
  try {
    browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto("https://mahabhunakasha.mahabhumi.gov.in/27/index.html", {waitUntil: 'networkidle2'});
    await page.waitForSelector("#level_0");
    await page.select("#level_0", "27");
    await page.waitForSelector("#level_1");
    await page.select("#level_1", "R");
    // District Code
    await page.waitForSelector("#level_2");
    await page.select("#level_2", "25");
    //Taluka Code
    await page.waitForSelector("#level_3");
    await page.select("#level_3", "06");
    for (const villageValue of villageList) {
      await page.waitForSelector("#level_4");
      await page.select("#level_4", villageValue);
      console.log(`Village selected: ${villageValue}`);
      try {
        console.log(`Waiting for API response for village: ${villageValue}`);
        const response = await page.waitForResponse(apiUrl, {timeout: 10000});
        if (response.ok()) {
          const data = await response.json();
          console.log("data ::",data);
          if (!villageData[villageValue]) {
            villageData[villageValue] = [];
          }
          let counterVillage = 0;
          for (const surveyNumber of data) {
            await page.evaluate((surveyNumber) => {
              document.querySelector("#surveyNo").value = surveyNumber;
            }, surveyNumber);
            await page.click("#surveyDivButton");
            console.log("Clicked plot number:", surveyNumber);
            const plotInfoResponse = await page.waitForResponse(plotInfoApiUrl, {timeout: 10000});
            if (plotInfoResponse.ok()) {
              const plotInfoData = await plotInfoResponse.json();
              console.log("Received plot info data for survey number:", surveyNumber);
              console.log("Received plot number Village Wise  ::", counterVillage++);
              console.log("Received plot number Total ::", counter++);
              console.log("----------------------------------------------------------------");
              villageData[villageValue].push(plotInfoData);
              // await sleep(200);
            } else {
              console.error("Plot info API call failed:", plotInfoResponse.status(), plotInfoResponse.statusText());
            }
          }
        } else {
          console.error("Village API call failed:", response.status(), response.statusText());
        }
      } catch (error) {
        console.error("Error processing village data:", error);
      }
      console.log(`Processing completed for village: ${villageValue}`);
      await sleep(5000);
      console.log(`______________________________________________________________________________________________________________________________________________`);
    }
    const dirPath = `./${dist}/${tal}`;
    fs.mkdirSync(dirPath, {recursive: true});
    const jsonFilePath = `${dirPath}/all_village_data_missed_${tal}.json`;
    fs.writeFileSync(jsonFilePath, JSON.stringify(villageData, null, 2));
    console.log(`All village data saved to JSON file: ${jsonFilePath}`);
  } catch (error) {
    console.error("Error occurred in Puppeteer script:", error);
  } finally {
    if (browser) {
      await browser.close();
      console.log("Browser closed.");
    }
  }
}
scrapeVillageData();
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
