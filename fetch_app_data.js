
const https = require('https');

const url = "https://tveapi.acan.group/myapiv2/listAndroid/lacrtv/json";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("App Data found items:", json.allitems ? json.allitems.length : 0);
            if (json.allitems) {
                json.allitems.forEach(item => {
                    console.log(`- Item: ${item.title}, Type: ${item.type}, Feed: ${item.feed_url}`);
                });
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
        }
    });

}).on("error", (err) => { console.log("Error: " + err.message); });
