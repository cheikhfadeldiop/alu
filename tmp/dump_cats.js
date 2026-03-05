const https = require('https');
const fs = require('fs');

https.get('https://actu.crtv.cm/wp-json/wp/v2/categories?per_page=100', (res) => {
    let raw = '';
    res.on('data', (d) => raw += d);
    res.on('end', () => {
        try {
            const JSON_DATA = JSON.parse(raw);
            fs.writeFileSync('tmp/full_cats_raw.json', JSON.stringify(JSON_DATA, null, 2));
            const summary = JSON_DATA.map(c => ({ id: c.id, name: c.name, parent: c.parent, count: c.count, slug: c.slug }));
            console.log("Found: " + summary.length);
            const parentIds = Array.from(new Set(summary.map(s => s.parent)));
            console.log("Unique Parents: " + parentIds.join(", "));
            summary.forEach(s => {
                if (s.parent === 0) console.log("Parent: " + s.name + " (" + s.id + ") count:" + s.count);
                else console.log("  Child: " + s.name + " -> Parent:" + s.parent);
            });
        } catch (e) {
            console.error("JSON Error: " + e.message);
        }
    });
});
