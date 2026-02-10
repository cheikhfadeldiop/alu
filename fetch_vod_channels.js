
const https = require('https');
const fs = require('fs');

const url = "https://tveapi.acan.group/myapiv2/listChannels/lacrtv/json";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        fs.writeFileSync('full_channels_vod.json', data);
        console.log('Saved to full_channels_vod.json');
    });
}).on('error', (err) => {
    console.log('Error:', err.message);
});
