
const https = require('https');
const fs = require('fs');

const url = "https://tveapi.acan.group/myapiv2/listAndroid/lacrtv/json";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        fs.writeFileSync('list_android.json', data);
        console.log('Saved to list_android.json');
    });
}).on('error', (err) => {
    console.log('Error:', err.message);
});
