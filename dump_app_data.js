
const https = require('https');
const fs = require('fs');

const url = "https://tveapi.acan.group/myapiv2/appdetails/lacrtv/json";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        fs.writeFileSync('app_data_full.json', data);
        console.log('Saved to app_data_full.json');
    });
}).on('error', (err) => {
    console.log('Error:', err.message);
});
