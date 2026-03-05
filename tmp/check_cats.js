const https = require('https');

https.get('https://actu.crtv.cm/wp-json/wp/v2/categories?per_page=100', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const categories = JSON.parse(data);
            const summary = categories.map(c => ({
                id: c.id,
                name: c.name,
                parent: c.parent,
                slug: c.slug,
                count: c.count
            }));
            console.log(JSON.stringify(summary, null, 2));
        } catch (e) {
            console.error('Error parsing JSON:', e);
        }
    });
}).on('error', (err) => {
    console.error('Error fetching categories:', err);
});
