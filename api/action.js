import { put, list, del } from '@vercel/blob';

// Funkcja pomocnicza do rozpoznawania typu pliku
function getContentType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const types = {
        'html': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'svg': 'image/svg+xml'
    };
    return types[ext] || 'text/plain';
}

export default async function handler(req, res) {
    try {
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            return res.status(500).json({ error: "Token missing" });
        }

        if (req.method === 'GET' && req.query.list === 'true') {
            const { blobs } = await list();
            return res.status(200).json(blobs);
        }

        if (req.method === 'POST') {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const { name, content } = body;
            if (!name) return res.status(400).json({ error: "No name" });

            const safeContent = (content === "" || content === undefined) ? " " : content;

            // KLUCZOWA ZMIANA: Dodajemy contentType i cacheControlMaxAge
            const blob = await put(name, safeContent, {
                access: 'public',
                addRandomSuffix: false,
                allowOverwrite: true,
                cacheControlMaxAge: 0,
                contentType: getContentType(name) // To sprawia, że HTML to HTML, a nie plik do pobrania
            });
            return res.status(200).json(blob);
        }

        if (req.method === 'DELETE') {
            const { url, name } = req.query;
            if (name === 'index.html') return res.status(403).json({ error: "Forbidden" });
            await del(url);
            return res.status(200).json({ success: true });
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
    return res.status(405).end();
}
