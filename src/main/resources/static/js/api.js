// js/api.js

/**
 * 获取犯罪数据
 * @param {string} view - 当前视图 ('trend' 或 'weekly')
 * @param {string} type - 犯罪类型 (例如 'ALL', 'THEFT')
 * @returns {Promise<Array>} 返回解析后的数据数组
 */
export async function fetchCrimeData(view, type) {
    const endpoint = view === 'trend' ? '/api/analysis/trend' : '/api/analysis/weekly';

    try {
        const response = await fetch(`${endpoint}?type=${type}`);
        const result = await response.json();

        if (result.status === 'success') {
            return result.data;
        } else {
            console.error('获取数据失败:', result.message);
            return [];
        }
    } catch (error) {
        console.error('网络请求错误:', error);
        return []; // 发生错误时返回空数组，避免阻塞程序
    }
}