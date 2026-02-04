import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
    try {
        // Sprawdzenie tokena
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            return res.status(500).json({ error: "BLOB_READ_WRITE_TOKEN is missing" });
        }

        // GET: Listowanie plików
        if (req.method === 'GET' && req.query.list === 'true') {
            const { blobs } = await list();
            return res.status(200).json(blobs);
        }

        // POST: Zapis/Tworzenie
        if (req.method === 'POST') {
            let body;
            try {
                body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            } catch (e) {
                return res.status(400).json({ error: "Invalid JSON" });
            }

            const { name, content } = body;
            if (!name) return res.status(400).json({ error: "Filename required" });

            const blob = await put(name, content || "", {
                access: 'public',
                addRandomSuffix: false,
            });
            return res.status(200).json(blob);
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
