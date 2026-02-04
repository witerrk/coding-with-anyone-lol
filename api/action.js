import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
    // 1. LISTOWANIE PLIKÓW
    if (req.method === 'GET' && req.query.list === 'true') {
        try {
            const { blobs } = await list();
            return res.status(200).json(blobs);
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    // 2. ZAPISYWANIE PLIKÓW
    if (req.method === 'POST') {
        try {
            const { name, content } = JSON.parse(req.body);
            const blob = await put(name, content, {
                access: 'public',
                addRandomSuffix: false,
            });
            return res.status(200).json(blob);
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
    
    return res.status(405).send("Method not allowed");
}