
const https = require('https');

const url = "https://tveapi.acan.group/myapiv2/relatedItems/lacrtv/29225/json";

https.get(url, (res) => {
    let data = '';
    console.log("Status Code:", res.statusCode);
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log("Response length:", data.length);
        if (data.length > 0) {
            console.log("Response start:", data.substring(0, 100));
            try {
                const json = JSON.parse(data);
                console.log("Allitems count:", json.allitems ? json.allitems.length : 0);
            } catch (e) {
                console.error("Parse error:", e.message);
            }
        } else {
            console.log("Empty response received.");
        }
    });

}).on("error", (err) => { console.log("Error: " + err.message); });
