// js/app.js
import { fetchCrimeData } from './api.js';
import { initTrendChart, updateTrendChart } from './charts/trendChart.js';
import { initWeeklyChart, updateWeeklyChart } from './charts/weeklyChart.js';

// 全局状态管理
let currentView = 'trend';

// 统一的视图渲染调度器
async function renderCurrentView() {
    const selectedType = document.getElementById("crime-type-select").value;
    const chartArea = document.getElementById("chart-area");
    const loadingSpinner = document.getElementById("loading-spinner");
    const titleObj = document.getElementById("chart-title");

    // 更新标题并显示加载状态
    titleObj.innerText = currentView === 'trend'
        ? `1. 历年犯罪数量演变趋势 (${selectedType})`
        : `2. 一周内犯罪高发规律 (${selectedType})`;

    chartArea.style.opacity = 0.3;
    loadingSpinner.style.display = "block";

    // 拉取数据
    const data = await fetchCrimeData(currentView, selectedType);

    // 数据加载完毕，恢复 UI
    loadingSpinner.style.display = "none";
    chartArea.style.opacity = 1;

    // 根据当前视图分发 Update 逻辑
    if (currentView === 'trend') {
        updateTrendChart(data);
    } else if (currentView === 'weekly') {
        updateWeeklyChart(data);
    }
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

            // 切换视图时，必须重新初始化对应的 SVG 画布
            if (currentView === 'trend') {
                initTrendChart("#chart-area");
            } else if (currentView === 'weekly') {
                initWeeklyChart("#chart-area");
            }

            // 渲染数据
            renderCurrentView();
        });
    });

    // 3. 初始启动加载
    initTrendChart("#chart-area");
    renderCurrentView();
});