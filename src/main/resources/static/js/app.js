// js/app.js
import { fetchCrimeData } from './api.js';
import { initTrendChart, updateTrendChart } from './charts/trendChart.js';
import { initWeeklyChart, updateWeeklyChart } from './charts/weeklyChart.js';
import { initHourlyChart, updateHourlyChart } from './charts/hourlyChart.js'; // 引入新模块
import { initHeatmapChart, updateHeatmapChart } from './charts/heatmapChart.js'; // 新增
import { initArrestChart, updateArrestChart } from "./charts/arrestChart.js";
import { initSchoolChart, updateSchoolChart } from "./charts/schoolChart.js";
import { initMatrixChart, updateMatrixChart } from './charts/matrixChart.js';
import { initRadarChart, updateRadarChart } from './charts/radarChart.js';
import { initDayTypeChart, updateDayTypeChart } from './charts/dayTypeChart.js';
import { initStreamChart, updateStreamChart } from './charts/streamChart.js';
import { initLocationChart, updateLocationChart } from './charts/locationChart.js';
import { initSeverityChart, updateSeverityChart } from './charts/severityChart.js';
import { initCoolingChart, updateCoolingChart } from './charts/coolingChart.js';
import { initArrestGapChart, updateArrestGapChart } from './charts/arrestGapChart.js';
import { initDistStructChart, updateDistStructChart } from './charts/distStructChart.js';
import { initLocRiskChart, updateLocRiskChart } from './charts/locRiskChart.js';
import { initQuadrantChart, updateQuadrantChart } from './charts/quadrantChart.js';

// 全局状态管理
let currentView = 'trend';
let cachedArrestData = null;
let cachedMatrixData = null;
let cachedRadarData = null;
let cachedDayTypeData = null;
let cachedStreamData = null;
let cachedLocationData = null;
let cachedSeverityData = null;
let cachedDistStructData = null;
let cachedLocRiskData = null;
let cachedQuadrantData = null;

// 统一的视图渲染调度器
async function renderCurrentView() {
    const selectedType = document.getElementById("crime-type-select").value;
    const chartArea = document.getElementById("chart-area");
    const loadingSpinner = document.getElementById("loading-spinner");
    const titleObj = document.getElementById("chart-title");

    // 动态生成标题
    const titleMap = {
        'trend': `1. 历年犯罪数量演变趋势 (${selectedType})`,
        'weekly': `2. 一周内犯罪高发规律 (${selectedType})`,
        'hourly': `3. 一天 24 小时犯罪时段分布 (${selectedType})`,
        'heatmap': `4. 芝加哥地区犯罪分布热力图 (${selectedType})`,
        'arrest': `5. 不同类型犯罪逮捕率排名 (全局对比)`,
        'school': `6. 校园犯罪占比及高发时段分析 (${selectedType})`,
        'matrix': `7. 芝加哥犯罪时空深度画像 (气泡大小=案发量，颜色=逮捕率)`,
        'radar': `8. 芝加哥典型警区犯罪基因画像 (商业区 vs 高危区 vs 夜生活区)`,
        'dayType': `9. 工作日 vs 周末犯罪分布画像 (颜色深浅=案发强度)`,
        'stream': `10. 芝加哥宏观犯罪生态演变史 (河流图)`,
        'location': `11. 街道 / 停车场 / 交通站点 犯罪结构画像对比`,
        'severity': `12. 芝加哥整体治安风险等级构成 (重罪 vs 轻罪比例)`,
        'cooling': `13. 全城警区治安压力排行 - ${selectedType} (平均发案间隔)`,
        'arrestGap': `14. 逮捕 vs 未逮捕案件 24 小时分布差异 (${selectedType})`,
        'districtStructure': '15. 典型警区犯罪基因画像对比 (百分比堆叠视角)',
        'locationRisk': '16. 典型地点场景犯罪风险画像对比',
        'quadrant': '7. 工作日 vs 周末 / 白天 vs 夜间 犯罪叠加效应深度画像',
    };
    titleObj.innerText = titleMap[currentView];

    let data;

    // 核心逻辑：获取数据
    if (currentView === 'arrest') {
        if (!cachedArrestData) {
            // 只有首次加载时显示 Loading 并发起网络请求
            chartArea.style.opacity = 0.3;
            loadingSpinner.style.display = "block";
            cachedArrestData = await fetchCrimeData('arrest', 'ALL');
        }
        data = cachedArrestData; // 使用缓存
    } else if (currentView === 'matrix') { // 新增矩阵的缓存逻辑
        if (!cachedMatrixData) {
            chartArea.style.opacity = 0.3;
            loadingSpinner.style.display = "block";
            cachedMatrixData = await fetchCrimeData('matrix', 'ALL');
        }
        data = cachedMatrixData;
    } else if (currentView === 'radar') {
        if (!cachedRadarData) {
            chartArea.style.opacity = 0.3;
            loadingSpinner.style.display = "block";
            cachedRadarData = await fetchCrimeData('radar', 'ALL');
        }
        data = cachedRadarData;
    } else if (currentView === 'dayType') {
        if (!cachedDayTypeData) {
            chartArea.style.opacity = 0.3;
            loadingSpinner.style.display = "block";
            cachedDayTypeData = await fetchCrimeData('dayType', 'ALL');
        }
        data = cachedDayTypeData;
    } else if (currentView === 'stream') {
        if (!cachedStreamData) {
            chartArea.style.opacity = 0.3;
            loadingSpinner.style.display = "block";
            cachedStreamData = await fetchCrimeData('stream', 'ALL');
        }
        data = cachedStreamData;
    } else if (currentView === 'location') {
        if (!cachedLocationData) {
            chartArea.style.opacity = 0.3;
            loadingSpinner.style.display = "block";
            cachedLocationData = await fetchCrimeData('location', 'ALL');
        }
        data = cachedLocationData;
    } else if (currentView === 'severity') {
        if (!cachedSeverityData) {
            chartArea.style.opacity = 0.3;
            loadingSpinner.style.display = "block";
            cachedSeverityData = await fetchCrimeData('severity', 'ALL');
        }
        data = cachedSeverityData;
    } else if (currentView === 'districtStructure') {
        if (!cachedDistStructData) {
            chartArea.style.opacity = 0.3;
            loadingSpinner.style.display = "block";
            cachedDistStructData = await fetchCrimeData('districtStructure', 'ALL');
        }
        data = cachedDistStructData;
    } else if (currentView === 'locationRisk') {
        if (!cachedLocRiskData) {
            chartArea.style.opacity = 0.3;
            loadingSpinner.style.display = "block";
            cachedLocRiskData = await fetchCrimeData('locationRisk', 'ALL');
        }
        data = cachedLocRiskData;
    } else if (currentView === 'quadrant') {
        if (!cachedQuadrantData) {
            chartArea.style.opacity = 0.3;
            loadingSpinner.style.display = "block";
            cachedQuadrantData = await fetchCrimeData('quadrant', 'ALL');
        }
        data = cachedQuadrantData;
    } else {
        // 动态切片视图：每次都显示 Loading 并发起网络请求
        // chartArea.style.opacity = 0.3;
        // loadingSpinner.style.display = "block";
        data = await fetchCrimeData(currentView, selectedType);
    }

    // 数据获取完毕，统一关闭 Loading 恢复 UI
    loadingSpinner.style.display = "none";
    chartArea.style.opacity = 1;

    // 根据当前视图分发 Update 逻辑
    if (currentView === 'trend') updateTrendChart(data);
    else if (currentView === 'weekly') updateWeeklyChart(data);
    else if (currentView === 'hourly') updateHourlyChart(data);
    else if (currentView === 'heatmap') updateHeatmapChart(data);
    else if (currentView === 'arrest') updateArrestChart(data, selectedType);
    else if (currentView === 'school') updateSchoolChart(data);
    else if (currentView === 'matrix') updateMatrixChart(data);
    else if (currentView === 'radar') updateRadarChart(data);
    else if (currentView === 'dayType') updateDayTypeChart(data);
    else if (currentView === 'stream') updateStreamChart(data);
    else if (currentView === 'location') updateLocationChart(data);
    else if (currentView === 'severity') updateSeverityChart(data);
    else if (currentView === 'cooling') updateCoolingChart(data);
    else if (currentView === 'arrestGap') updateArrestGapChart(data);
    else if (currentView === 'districtStructure') updateDistStructChart(data);
    else if (currentView === 'locationRisk') updateLocRiskChart(data);
    else if (currentView === 'quadrant') updateQuadrantChart(data);

}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    const crimeTypeSelect = document.getElementById("crime-type-select");
    const dynamicSelect = document.getElementById("dynamic-view-select");
    const globalSelect = document.getElementById("global-view-select");
    const filterGroup = document.getElementById("filter-control-group"); // 获取过滤器容器，用于控制透明度

    // 1. 监听犯罪类型切换 (只有在动态切片下才有意义)
    crimeTypeSelect.addEventListener("change", () => {
        renderCurrentView();
    });

    // 统一的下拉菜单切换处理函数
    function switchView(newView, isGlobal) {
        currentView = newView;

        // 【核心交互联动】
        if (isGlobal) {
            // 如果选了全局视野，清空动态切片的值
            dynamicSelect.value = "";
            // 禁用并让“聚焦类型”变暗，因为全局视野看的是大盘，不接受单类型过滤
            filterGroup.style.opacity = "0.4";
            crimeTypeSelect.disabled = true;
        } else {
            // 如果选了动态切片，清空全局视野的值
            globalSelect.value = "";
            // 恢复“聚焦类型”的高亮与可用状态
            filterGroup.style.opacity = "1";
            crimeTypeSelect.disabled = false;
        }

        // 路由对应的初始化逻辑
        if (currentView === 'trend') initTrendChart("#chart-area");
        else if (currentView === 'weekly') initWeeklyChart("#chart-area");
        else if (currentView === 'hourly') initHourlyChart("#chart-area");
        else if (currentView === 'heatmap') initHeatmapChart("#chart-area");
        else if (currentView === 'school') initSchoolChart("#chart-area");
        else if (currentView === 'arrest') initArrestChart("#chart-area");
        else if (currentView === 'matrix') initMatrixChart("#chart-area");
        else if (currentView === 'radar') initRadarChart("#chart-area");
        else if (currentView === 'dayType') initDayTypeChart("#chart-area");
        else if (currentView === 'stream') initStreamChart("#chart-area");
        else if (currentView === 'location') initLocationChart("#chart-area");
        else if (currentView === 'severity') initSeverityChart("#chart-area");
        else if (currentView === 'cooling') initCoolingChart("#chart-area");
        else if (currentView === 'arrestGap') initArrestGapChart("#chart-area");
        else if (currentView === 'districtStructure') initDistStructChart("#chart-area");
        else if (currentView === 'locationRisk') initLocRiskChart("#chart-area");
        else if (currentView === 'quadrant') initQuadrantChart("#chart-area");

        // 渲染数据
        renderCurrentView();
    }

    // 2. 监听动态切片下拉框
    dynamicSelect.addEventListener("change", (e) => switchView(e.target.value, false));

    // 3. 监听全局视野下拉框
    globalSelect.addEventListener("change", (e) => switchView(e.target.value, true));

    // 4. 初始启动加载
    initTrendChart("#chart-area");
    renderCurrentView();
});