// js/charts/trendChart.js

let svg, x, y, xAxisGroup, yAxisGroup, yGridGroup, linePath;
const margin = {top: 30, right: 30, bottom: 50, left: 80};
let width, height;

// 1. 初始化图表骨架 (仅执行一次)
export function initTrendChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove(); // 清空容器

    width = 850 - margin.left - margin.right;
    height = 450 - margin.top - margin.bottom;

    svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    x = d3.scaleLinear().range([0, width]);
    y = d3.scaleLinear().range([height, 0]);

    // 预留占位元素
    xAxisGroup = svg.append("g").attr("transform", `translate(0,${height})`).attr("class", "axis");
    yAxisGroup = svg.append("g").attr("class", "axis");
    yGridGroup = svg.append("g").attr("class", "grid");
    linePath = svg.append("path").attr("class", "line");
}

// 2. 更新图表数据与触发动画
export function updateTrendChart(data) {
    if (!data || data.length === 0) return;

    const transitionDuration = 800;

    // 更新比例尺
    x.domain(d3.extent(data, d => d.year));
    y.domain([0, d3.max(data, d => d.count) * 1.1]);

    // 动画更新坐标轴与网格
    xAxisGroup.transition().duration(transitionDuration)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(data.length));
    yAxisGroup.transition().duration(transitionDuration)
        .call(d3.axisLeft(y));
    yGridGroup.transition().duration(transitionDuration)
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

    // 动画更新折线
    const lineGenerator = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.count))
        .curve(d3.curveMonotoneX);

    linePath.datum(data)
        .transition().duration(transitionDuration)
        .attr("d", lineGenerator);
}