// js/charts/weeklyChart.js

let svg, x, y, xAxisGroup, yAxisGroup, yGridGroup;
const margin = {top: 30, right: 30, bottom: 50, left: 80};
let width, height;
const weekMap = {1: "周日", 2: "周一", 3: "周二", 4: "周三", 5: "周四", 6: "周五", 7: "周六"};

export function initWeeklyChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove();

    width = 850 - margin.left - margin.right;
    height = 450 - margin.top - margin.bottom;

    svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    x = d3.scaleBand().range([0, width]).padding(0.3);
    y = d3.scaleLinear().range([height, 0]);

    xAxisGroup = svg.append("g").attr("transform", `translate(0,${height})`).attr("class", "axis");
    yAxisGroup = svg.append("g").attr("class", "axis");
    yGridGroup = svg.append("g").attr("class", "grid");
}

export function updateWeeklyChart(data) {
    if (!data || data.length === 0) return;
    const transitionDuration = 800;

    x.domain(data.map(d => weekMap[d.dayOfWeek]));
    y.domain([0, d3.max(data, d => d.count) * 1.1]);

    xAxisGroup.transition().duration(transitionDuration).call(d3.axisBottom(x));
    yAxisGroup.transition().duration(transitionDuration).call(d3.axisLeft(y));
    yGridGroup.transition().duration(transitionDuration).call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

    // 数据绑定
    const bars = svg.selectAll(".bar")
        .data(data, d => d.dayOfWeek); // 使用 dayOfWeek 作为 key，保证动画准确对应

    // 移除多余的柱子
    bars.exit()
        .transition().duration(transitionDuration)
        .attr("y", height)
        .attr("height", 0)
        .remove();

    // 渲染新柱子并与已有柱子合并更新
    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(weekMap[d.dayOfWeek]))
        .attr("width", x.bandwidth())
        .attr("y", height) // 初始在底部
        .attr("height", 0)
        .merge(bars) // 合并 enter 和 update 的选集
        .transition().duration(transitionDuration)
        .attr("x", d => x(weekMap[d.dayOfWeek]))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.count))
        .attr("height", d => height - y(d.count));
}