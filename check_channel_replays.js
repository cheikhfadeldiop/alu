
const https = require('https');

const url = "https://tveapi.acan.group/myapiv2/alauneByChaine/50004/json";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("Channel 50004 replays count:", json.allitems ? json.allitems.length : 0);
            if (json.allitems && json.allitems.length > 0) {
                console.log("First item slug:", json.allitems[0].slug);
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
        }
    });

}).on("error", (err) => { console.log("Error: " + err.message); });
