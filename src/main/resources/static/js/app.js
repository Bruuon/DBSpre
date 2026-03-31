// js/app.js
import { fetchCrimeData } from './api.js';
import { initTrendChart, updateTrendChart } from './charts/trendChart.js';
import { initWeeklyChart, updateWeeklyChart } from './charts/weeklyChart.js';
import { initHourlyChart, updateHourlyChart } from './charts/hourlyChart.js'; // 引入新模块
import { initHeatmapChart, updateHeatmapChart } from './charts/heatmapChart.js'; // 新增
import {initArrestChart, updateArrestChart } from "./charts/arrestChart.js";
import { initSchoolChart, updateSchoolChart } from "./charts/schoolChart.js";
import { initMatrixChart, updateMatrixChart } from './charts/matrixChart.js';
import { initRadarChart, updateRadarChart } from './charts/radarChart.js';

// 全局状态管理
let currentView = 'trend';
let cachedArrestData = null; // 【优化 1】新增全局缓存变量
let cachedMatrixData = null;
let cachedRadarData = null;

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
        'radar': `8. 芝加哥典型警区犯罪基因画像 (商业区 vs 高危区 vs 夜生活区)`
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
    } else {
        // 其他视图：每次都显示 Loading 并发起网络请求
        chartArea.style.opacity = 0.3;
        loadingSpinner.style.display = "block";
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
}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    const crimeTypeSelect = document.getElementById("crime-type-select");
    const navTabs = document.querySelectorAll(".nav-tab");

    // 1. 监听下拉菜单切换 (不需要重新 init 图表，只 update)
    crimeTypeSelect.addEventListener("change", () => {
        renderCurrentView();
    });

    // 2. 监听顶部导航栏切换 (需要销毁旧图表，重新 init 新图表)
    navTabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            if (e.target.classList.contains("active")) return; // 点击当前已激活的 tab 无响应

            // UI 高亮切换
            navTabs.forEach(t => t.classList.remove("active"));
            e.target.classList.add("active");

            // 更新状态
            currentView = e.target.getAttribute("data-view");

            // 路由对应的初始化逻辑
            if (currentView === 'trend') initTrendChart("#chart-area");
            else if (currentView === 'weekly') initWeeklyChart("#chart-area");
            else if (currentView === 'hourly') initHourlyChart("#chart-area");
            else if (currentView === 'heatmap') initHeatmapChart("#chart-area");
            else if (currentView === 'arrest') initArrestChart("#chart-area");
            else if (currentView === 'school') initSchoolChart("#chart-area");
            else if (currentView === 'matrix') initMatrixChart("#chart-area");
            else if (currentView === 'radar') initRadarChart("#chart-area");

            // 渲染数据
            renderCurrentView();
        });
    });

    // 3. 初始启动加载
    initTrendChart("#chart-area");
    renderCurrentView();
});