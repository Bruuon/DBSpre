// js/charts/hourlyChart.js

let svg, x, y, xAxisGroup, yAxisGroup, yGridGroup, areaPath, linePath;
const margin = {top: 30, right: 30, bottom: 50, left: 80};
let width, height;

export function initHourlyChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove();

    width = 850 - margin.left - margin.right;
    height = 450 - margin.top - margin.bottom;

    svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 24小时是连续的线性比例尺，范围 0-23
    x = d3.scaleLinear().range([0, width]);
    y = d3.scaleLinear().range([height, 0]);

    xAxisGroup = svg.append("g").attr("transform", `translate(0,${height})`).attr("class", "axis");
    yAxisGroup = svg.append("g").attr("class", "axis");
    yGridGroup = svg.append("g").attr("class", "grid");

    // 面积填充路径
    areaPath = svg.append("path")
        .attr("fill", "#3498db")
        .attr("fill-opacity", 0.3)
        .attr("stroke", "none");

    // 顶部线条路径
    linePath = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "#2980b9")
        .attr("stroke-width", 2.5);
}

export function updateHourlyChart(data) {
    if (!data || data.length === 0) return;

    const transitionDuration = 800;

    // x 轴固定 0 到 23 点
    x.domain([0, 23]);
    y.domain([0, d3.max(data, d => d.count) * 1.1]);

    // x 轴 ticks 定为 24 个，并格式化为 "xx时"
    xAxisGroup.transition().duration(transitionDuration)
        .call(d3.axisBottom(x).ticks(24).tickFormat(d => d + "时"));

    yAxisGroup.transition().duration(transitionDuration)
        .call(d3.axisLeft(y));
    yGridGroup.transition().duration(transitionDuration)
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

    // 面积生成器
    const areaGenerator = d3.area()
        .x(d => x(d.hour))
        .y0(height) // 底部固定在图表最下沿
        .y1(d => y(d.count))
        .curve(d3.curveMonotoneX);

    // 折线生成器
    const lineGenerator = d3.line()
        .x(d => x(d.hour))
        .y(d => y(d.count))
        .curve(d3.curveMonotoneX);

    areaPath.datum(data)
        .transition().duration(transitionDuration)
        .attr("d", areaGenerator);

    linePath.datum(data)
        .transition().duration(transitionDuration)
        .attr("d", lineGenerator);
}