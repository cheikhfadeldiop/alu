
const https = require('https');
const fs = require('fs');

const url = "https://tveapi.acan.group/myapiv2/listChannelsByChaine/lacrtv/50006/json";

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        fs.writeFileSync('sport_shows.json', data);
        console.log('Saved to sport_shows.json');
    });
}).on('error', (err) => {
    console.log('Error:', err.message);
});
