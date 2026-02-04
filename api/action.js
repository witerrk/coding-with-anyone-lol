import { put, list, del } from '@vercel/blob';

function getContentType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const types = { 'html': 'text/html', 'css': 'text/css', 'js': 'application/javascript' };
    return types[ext] || 'text/plain';
}

export default async function handler(req, res) {
    try {
        if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(500).end();

        if (req.method === 'GET' && req.query.list === 'true') {
            const { blobs } = await list();
            return res.status(200).json(blobs);
        }

        if (req.method === 'POST') {
            const { name, content } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const blob = await put(name, content || " ", {
                access: 'public',
                addRandomSuffix: false, // NAZWY BĘDĄ CZYSTE
                allowOverwrite: true,
                cacheControlMaxAge: 0,
                contentType: getContentType(name)
            });
            return res.status(200).json(blob);
        }

        if (req.method === 'DELETE') {
            const { url, name } = req.query;
            if (name === 'index.html') return res.status(403).end();
            await del(url);
            return res.status(200).json({ success: true });
        }
    } catch (e) { return res.status(500).json({ error: e.message }); }
}
