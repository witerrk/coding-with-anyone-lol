import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
    // Nagłówki CORS, żeby przeglądarka nie blokowała zapytań
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 1. LISTOWANIE
        if (req.method === 'GET' && req.query.list === 'true') {
            const { blobs } = await list();
            return res.status(200).json(blobs);
        }

        // 2. TWORZENIE / ZAPISYWANIE
        if (req.method === 'POST') {
            let data;
            // Vercel czasem sam parsuje body, sprawdzamy to:
            if (typeof req.body === 'string') {
                data = JSON.parse(req.body);
            } else {
                data = req.body;
            }

            const { name, content } = data;

            if (!name) {
                return res.status(400).json({ error: "Missing filename" });
            }

            const blob = await put(name, content || "", {
                access: 'public',
                addRandomSuffix: false,
            });

            return res.status(200).json(blob);
        }
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: error.message });
    }

    return res.status(405).json({ error: "Method not allowed" });
}
