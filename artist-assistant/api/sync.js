const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join('/tmp', 'artist_data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getUserFile = (userId) => path.join(DATA_DIR, `user_${userId}.json`);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const pathParts = req.url.split('/').filter(Boolean);
    const userId = pathParts[1];
    const module = pathParts[2];

    if (!userId || !module) {
        return res.status(400).json({ success: false, error: '缺少参数' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { data } = req.body;
        const filePath = getUserFile(userId);

        let fullData = {};
        if (fs.existsSync(filePath)) {
            fullData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        fullData[module] = data;
        fs.writeFileSync(filePath, JSON.stringify(fullData, null, 2), 'utf8');

        res.json({ success: true, message: `${module} 同步成功` });
    } catch (err) {
        console.error('Sync error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};