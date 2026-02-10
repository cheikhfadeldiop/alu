
const https = require('https');

const url = "https://tveapi.acan.group/myapiv2/listLiveTV/lacrtv/json";

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("Channels found:", json.allitems ? json.allitems.length : 0);
            if (json.allitems && json.allitems.length > 0) {
                console.log("First 5 channels:");
                json.allitems.slice(0, 5).forEach(c => {
                    console.log(`ID: ${c.id}, Title: ${c.title}, Name: ${c.name || 'N/A'}`);
                });
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
            console.log("Raw data:", data.substring(0, 200));
        }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
