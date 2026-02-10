
const https = require('https');

const url = "https://tveapi.acan.group/myapiv2/getEPGAll/lacrtv/json";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("EPG Data found items:", json.allitems ? json.allitems.length : 0);
            if (json.allitems) {
                // EPG items often have channel info
                const channelIds = new Set();
                json.allitems.forEach(item => {
                    if (item.chaine_id) channelIds.add(item.chaine_id);
                    // Also check for other fields that might contain IDs
                });
                console.log("Unique channel IDs in EPG:", channelIds.size);
                console.log("IDs:", Array.from(channelIds));
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
        }
    });

}).on("error", (err) => { console.log("Error: " + err.message); });
