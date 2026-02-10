
const https = require('https');

const url = "https://tveapi.acan.group/myapiv2/appdetails/lacrtv/json";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log('Error parsing JSON:', e.message);
        }
    });
}).on('error', (err) => {
    console.log('Error:', err.message);
});
