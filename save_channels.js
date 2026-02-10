
const https = require('https');
const fs = require('fs');

const url = "https://tveapi.acan.group/myapiv2/listLiveTV/lacrtv/json";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        fs.writeFileSync('full_channels.json', data);
        console.log("Saved full_channels.json");
    });
}).on("error", (err) => { console.log("Error: " + err.message); });
