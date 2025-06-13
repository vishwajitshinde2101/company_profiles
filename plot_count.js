const fs = require('fs').promises;
const jsonFilePath = './Pune/Mulshi/all_village_data_missed_Mulshi.json';
async function countPlotsAndExtractVillageNames() {
  try {
    const jsonData = await fs.readFile(jsonFilePath, 'utf8');
    const villageData = JSON.parse(jsonData);
    const villageInfo = {};
    Object.keys(villageData).forEach(villageCode => {
      const plots = villageData[villageCode];
      const plotCount = plots.length;
      const gisInfo = plots[0].gisinfo;
      const villageNameMatch = gisInfo.match(/Village\s*:\s*\S+\s+([^\s,]+)/);
      let villageName = "Unknown";
      if (villageNameMatch && villageNameMatch[1]) {
        villageName = villageNameMatch[1];
      }
      villageInfo[villageCode] = {
        villageName: villageName,
        plotCount: plotCount
      };
    });
    console.log("Village information with plot counts:", villageInfo);
  } catch (err) {
    console.error("Error handling JSON file:", err.message);
  }
}
countPlotsAndExtractVillageNames();
