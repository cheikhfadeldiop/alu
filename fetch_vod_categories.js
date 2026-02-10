
const https = require('https');
const fs = require('fs');

const url = "https://tveapi.acan.group/myapiv2/listChannelsCategories/lacrtv/json";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        fs.writeFileSync('vod_categories.json', data);
        console.log('Saved to vod_categories.json');
    });
}).on('error', (err) => {
    console.log('Error:', err.message);
});
