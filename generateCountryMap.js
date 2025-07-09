const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

// Load Excel
const workbook = xlsx.readFile(
  path.join(__dirname, "./assets/Country_Codes.xlsx")
);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);

// Convert to map
const countryMap = {};
data.forEach((row) => {
  if (row.Country && row.Code) {
    countryMap[row.Country.toLowerCase().trim()] =
      row.Code.toUpperCase().trim();
  }
});

// Save to JSON
fs.writeFileSync(
  path.join(__dirname, "countryMap.json"),
  JSON.stringify(countryMap, null, 2)
);

console.log("✅ countryMap.json generated successfully.");
