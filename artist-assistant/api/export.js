const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join('/tmp', 'artist_data');
const getUserFile = (userId) => path.join(DATA_DIR, `user_${userId}.json`);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const pathParts = req.url.split('/').filter(Boolean);
    const userId = pathParts[1];

    if (!userId) {
        return res.status(400).json({ success: false, error: '缺少 userId' });
    }

    try {
        const filePath = getUserFile(userId);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, error: '用户数据不存在' });
        }

        const fullData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const orders = fullData.orders || [];

        if (orders.length === 0) {
            return res.json({ success: true, csv: '暂无数据' });
        }

        const headers = ['订单号', '企划名称', '平台', '支付方式', '实付金额', '状态', '下单时间', '截稿日期'];
        let csv = headers.join(',') + '\n';
        orders.forEach(o => {
            const row = [
                o.orderNo || '',
                o.name || '',
                o.platform || '',
                o.payment || '',
                o.totalText || '0.00',
                o.status || 'pending',
                o.orderDate || '',
                o.endDate || ''
            ];
            csv += row.join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=排单数据_${Date.now()}.csv`);
        res.send('\uFEFF' + csv);
    } catch (err) {
        console.error('Export error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};