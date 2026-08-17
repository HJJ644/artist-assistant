const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join('/tmp', 'artist_data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getUserFile = (userId) => path.join(DATA_DIR, `user_${userId}.json`);

const getDefaultData = () => ({
    orders: [],
    settings: { depositRatio: 20, feeSettings: { usages: [], urgents: [], publics: [] }, platforms: [] },
    materials: [],
    shops: [],
    feeCategories: [],
    categories: [],
    warehouseProducts: []
});

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const pathParts = req.url.split('/').filter(Boolean);
    const userId = pathParts[1];

    if (!userId) {
        return res.status(400).json({ success: false, error: '缺少 userId 参数' });
    }

    const filePath = getUserFile(userId);

    if (req.method === 'GET') {
        try {
            if (fs.existsSync(filePath)) {
                const rawData = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(rawData);
                const defaultData = getDefaultData();
                Object.keys(defaultData).forEach(key => {
                    if (!(key in data)) {
                        data[key] = defaultData[key];
                    }
                });
                return res.json({ success: true, data });
            } else {
                return res.json({ success: true, data: getDefaultData() });
            }
        } catch (err) {
            console.error('GET error:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    if (req.method === 'POST') {
        try {
            const { data } = req.body;
            if (!data) {
                return res.status(400).json({ success: false, error: '缺少 data 字段' });
            }
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            return res.json({ success: true, message: '保存成功' });
        } catch (err) {
            console.error('POST error:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
};