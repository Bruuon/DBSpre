// js/api.js

export async function fetchCrimeData(view, type) {
    // 根据 view 动态决定路由
    let endpoint = '/api/analysis/trend';
    if (view === 'weekly') endpoint = '/api/analysis/weekly';
    if (view === 'hourly') endpoint = '/api/analysis/hourly';
    if (view === 'heatmap') endpoint = '/api/analysis/heatmap'; // 新增热力图路由
    if (view === 'arrest') endpoint = '/api/analysis/arrest-rate'; // 新增
    if (view === 'school') endpoint = '/api/analysis/school'; // 新增
    if (view === 'matrix') endpoint = '/api/analysis/matrix';
    if (view === 'radar') endpoint = '/api/analysis/radar';
    if (view === 'dayType') endpoint = '/api/analysis/day-type';
    if (view === 'stream') endpoint = '/api/analysis/stream';

    try {
        const url = (view === 'arrest' || view === 'matrix' || view === 'radar' || view === 'dayType' || view === 'stream')
            ? endpoint : `${endpoint}?type=${type}`;
        const response = await fetch(url);
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