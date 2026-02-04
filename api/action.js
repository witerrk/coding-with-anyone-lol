import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
    // LISTOWANIE
    if (req.method === 'GET' && req.query.list === 'true') {
        try {
            const { blobs } = await list();
            return res.status(200).json(blobs);
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    // TWORZENIE I ZAPISYWANIE (POST)
    if (req.method === 'POST') {
        try {
            const body = JSON.parse(req.body);
            const { name, content } = body;
            
            if (!name) return res.status(400).send("Name is required");

            const blob = await put(name, content, {
                access: 'public',
                addRandomSuffix: false, // Nadpisuje jeśli plik o tej nazwie istnieje
            });
            return res.status(200).json(blob);
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
    
    return res.status(405).send("Method not allowed");
}
