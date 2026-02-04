import { put, list } from '@vercel/blob';

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

        // 2. TWORZENIE / ZAPISYWANIE (Z NADPISYWANIEM)
        if (req.method === 'POST') {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const { name, content } = body;

            if (!name) return res.status(400).json({ error: "Filename required" });

            const safeContent = (content === "" || content === undefined) ? " " : content;

            // TUTAJ POPRAWKA:
            const blob = await put(name, safeContent, {
                access: 'public',
                addRandomSuffix: false, // Stała nazwa pliku
                allowOverwrite: true    // WYMUSZENIE NADPISANIA
            });
            
            return res.status(200).json(blob);
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (error) {
        console.error("Vercel Blob Error:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
