import { put, list, del } from '@vercel/blob';

// Rozpoznawanie typu pliku dla przeglądarki
function getContentType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const types = {
        'html': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg'
    };
    return types[ext] || 'text/plain';
}

export default async function handler(req, res) {
    try {
        if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(500).end();

        // LISTOWANIE PLIKÓW
        if (req.method === 'GET' && req.query.list === 'true') {
            const { blobs } = await list();
            return res.status(200).json(blobs);
        }

        // ZAPISYWANIE I TWORZENIE
        if (req.method === 'POST') {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const { name, content } = body;
            if (!name) return res.status(400).end();

            const blob = await put(name, content || " ", {
                access: 'public',
                addRandomSuffix: false,
                allowOverwrite: true,
                cacheControlMaxAge: 0,
                contentType: getContentType(name)
            });
            return res.status(200).json(blob);
        }

        // USUWANIE
        if (req.method === 'DELETE') {
            const { url, name } = req.query;
            if (name === 'index.html') return res.status(403).end();
            await del(url);
            return res.status(200).json({ success: true });
        }
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}
