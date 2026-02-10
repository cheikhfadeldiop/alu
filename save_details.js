
const https = require('https');
const fs = require('fs');

const url = "https://tveapi.acan.group/myapiv2/alaunesliders/lacrtv/json";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.allitems && json.allitems.length > 0) {
                let out = "";
                json.allitems.forEach((item, idx) => {
                    out += `Item ${idx}: ${item.title}\n`;
                    out += `  Related: ${item.relatedItems}\n`;
                    out += `  Feed: ${item.feed_url}\n\n`;
                });
                fs.writeFileSync('item_details.txt', out);
                console.log("Saved item_details.txt");
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
        }
    });

}).on("error", (err) => { console.log("Error: " + err.message); });
