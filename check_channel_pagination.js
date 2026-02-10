
const https = require('https');

const url = "https://tveapi.acan.group/myapiv2/alauneByChaine/50004/json";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.allitems && json.allitems.length > 0) {
                const lastItem = json.allitems[json.allitems.length - 1];
                console.log("Last item relatedItems:", lastItem.relatedItems);
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
        }
    });

}).on("error", (err) => { console.log("Error: " + err.message); });
