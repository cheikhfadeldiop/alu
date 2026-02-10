
const https = require('https');

const url = "https://tveapi.acan.group/myapiv2/alaunesliders/lacrtv/json";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.allitems && json.allitems.length > 0) {
                console.log("First item title:", json.allitems[0].title);
                console.log("First item rel:", json.allitems[0].relatedItems);
                console.log("Last item title:", json.allitems[json.allitems.length - 1].title);
                console.log("Last item rel:", json.allitems[json.allitems.length - 1].relatedItems);
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
        }
    });

}).on("error", (err) => { console.log("Error: " + err.message); });
