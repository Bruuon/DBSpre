// js/api.js

export async function fetchCrimeData(view, type) {
    // 根据 view 动态决定路由
    let endpoint = '/api/analysis/trend';
    if (view === 'weekly') endpoint = '/api/analysis/weekly';
    if (view === 'hourly') endpoint = '/api/analysis/hourly';
    if (view === 'heatmap') endpoint = '/api/analysis/heatmap'; // 新增热力图路由
    if (view === 'arrest') endpoint = '/api/analysis/arrest-rate'; // 新增

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
        return [];
    }
}