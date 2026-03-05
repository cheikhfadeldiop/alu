const fs = require('fs');
try {
    const raw = fs.readFileSync('tmp/all_cats.json', 'utf16le'); // Try utf16le if it failed before
    const cats = JSON.parse(raw);
    const tree = {};
    cats.forEach(c => {
        if (!tree[c.parent]) tree[c.parent] = [];
        tree[c.parent].push({ id: c.id, name: c.name, slug: c.slug, count: c.count });
    });
    console.log(JSON.stringify(tree, null, 2));
} catch (e) {
    try {
        const raw = fs.readFileSync('tmp/all_cats.json', 'utf8');
        const cats = JSON.parse(raw);
        const tree = {};
        cats.forEach(c => {
            if (!tree[c.parent]) tree[c.parent] = [];
            tree[c.parent].push({ id: c.id, name: c.name, slug: c.slug, count: c.count });
        });
        console.log(JSON.stringify(tree, null, 2));
    } catch (e2) {
        console.error('Failed to read as utf8 or utf16le');
    }
}
