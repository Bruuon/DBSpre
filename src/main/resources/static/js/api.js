// js/api.js

export async function fetchCrimeData(view, type) {
    // 根据 view 动态决定路由
    let endpoint = '/api/analysis/trend';
    if (view === 'weekly') endpoint = '/api/analysis/weekly';
    if (view === 'hourly') endpoint = '/api/analysis/hourly';
    if (view === 'heatmap') endpoint = '/api/analysis/heatmap';
    if (view === 'arrest') endpoint = '/api/analysis/arrest-rate';
    if (view === 'school') endpoint = '/api/analysis/school';
    if (view === 'matrix') endpoint = '/api/analysis/matrix';
    if (view === 'radar') endpoint = '/api/analysis/radar';
    if (view === 'dayType') endpoint = '/api/analysis/day-type';
    if (view === 'stream') endpoint = '/api/analysis/stream';
    if (view === 'location') endpoint = '/api/analysis/location';
    if (view === 'severity') endpoint = '/api/analysis/severity';
    if (view === 'cooling') endpoint = '/api/analysis/cooling-period';
    if (view === 'arrestGap') endpoint = '/api/analysis/arrest-gap';
    if (view === 'districtStructure') endpoint = '/api/analysis/district-structure';
    if (view === 'locationRisk') endpoint = '/api/analysis/location-risk';
    if (view === 'quadrant') endpoint = '/api/analysis/quadrant';

    try {
        const url = (view === 'arrest'
                            || view === 'matrix'
                            || view === 'radar'
                            || view === 'dayType'
                            || view === 'stream'
                            || view === 'location'
                            || view === 'severity'
                            || view === 'districtStructure'
                            || view === 'locationRisk')
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