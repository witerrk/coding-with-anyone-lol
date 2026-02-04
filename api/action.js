import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
    // Obsługa CORS dla bezpieczeństwa
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // Sprawdzenie czy token w ogóle istnieje
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            return res.status(500).json({ error: "Missing BLOB_READ_WRITE_TOKEN" });
        }

        // 1. LISTOWANIE PLIKÓW
        if (req.method === 'GET' && req.query.list === 'true') {
            const { blobs } = await list();
            return res.status(200).json(blobs);
        }

        // 2. TWORZENIE / ZAPISYWANIE
        if (req.method === 'POST') {
            const { name, content } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

            if (!name) return res.status(400).json({ error: "No filename provided" });

            const blob = await put(name, content || "", {
                access: 'public',
                addRandomSuffix: false,
            });

            return res.status(200).json(blob);
        }
    } catch (error) {
        console.error("Vercel Blob Error:", error);
        return res.status(500).json({ error: error.message });
    }

    return res.status(405).json({ error: "Method not allowed" });
}
