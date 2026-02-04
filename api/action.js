import { put, list, del } from '@vercel/blob';

export default async function handler(req, res) {
    try {
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            return res.status(500).json({ error: "Token missing" });
        }

        // 1. LISTOWANIE
        if (req.method === 'GET' && req.query.list === 'true') {
            const { blobs } = await list();
            return res.status(200).json(blobs);
        }

        // 2. ZAPISYWANIE / TWORZENIE
        if (req.method === 'POST') {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const { name, content } = body;
            if (!name) return res.status(400).json({ error: "No name" });

            const safeContent = (content === "" || content === undefined) ? " " : content;
            const blob = await put(name, safeContent, {
                access: 'public',
                addRandomSuffix: false,
                allowOverwrite: true
            });
            return res.status(200).json(blob);
        }

        // 3. USUWANIE (NOWOŚĆ)
        if (req.method === 'DELETE') {
            const { url, name } = req.query;
            
            // Blokada usuwania index.html na poziomie serwera (bezpieczeństwo!)
            if (name === 'index.html') {
                return res.status(403).json({ error: "Cannot delete index.html" });
            }

            await del(url);
            return res.status(200).json({ success: true });
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
    return res.status(405).end();
}
