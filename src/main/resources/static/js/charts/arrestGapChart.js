let svg, x, y, lineArrested, lineNonArrested;

// 稍微调大 right margin，给右上角的图例留出空间
const margin = {top: 30, right: 100, bottom: 50, left: 80};
const width = 850 - margin.left - margin.right;
const height = 450 - margin.top - margin.bottom;

export function initArrestGapChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove();

    svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    x = d3.scaleLinear().range([0, width]);
    y = d3.scaleLinear().range([height, 0]);

    svg.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${height})`);
    svg.append("g").attr("class", "y-axis axis");

    // 初始化两条曲线，增加发光效果类名和基础样式
    lineArrested = svg.append("path")
        .attr("class", "line")
        .style("stroke", "#A04747");

    lineNonArrested = svg.append("path")
        .attr("class", "line")
        .style("stroke", "#EDDCC6");

    // =========================================
    // 新增：静态图例 (Legend) 渲染逻辑
    // =========================================

    // 创建图例容器，定位到图表右上角
    const legend = svg.append("g")
        .attr("class", "legend-group")
        .attr("transform", `translate(${width - 80}, 0)`);

    // 1. "未逮捕" 图例项 (浅沙色)
    legend.append("line")
        .attr("x1", 0)
        .attr("y1", 10)
        .attr("x2", 24)
        .attr("y2", 10)
        .style("stroke", "#EDDCC6")
        .style("stroke-width", "3px");

    legend.append("text")
        .attr("x", 32)
        .attr("y", 14)
        .text("未逮捕")
        .style("font-size", "12px")
        .style("fill", "var(--text-body)"); // 复用 CSS 变量

    // 2. "逮捕" 图例项 (赭红色)
    legend.append("line")
        .attr("x1", 0)
        .attr("y1", 34)
        .attr("x2", 24)
        .attr("y2", 34)
        .style("stroke", "#A04747")
        .style("stroke-width", "3px");

    legend.append("text")
        .attr("x", 32)
        .attr("y", 38)
        .text("逮捕")
        .style("font-size", "12px")
        .style("fill", "var(--text-body)");
}

export function updateArrestGapChart(data) {
    if (!data || data.length === 0) return;

    x.domain([0, 23]);
    // 动态计算 Y 轴最大值
    y.domain([0, d3.max(data, d => Math.max(d.arrestedCount, d.nonArrestedCount)) * 1.1]);

    const lineGenA = d3.line().x(d => x(d.hour)).y(d => y(d.arrestedCount)).curve(d3.curveMonotoneX);
    const lineGenN = d3.line().x(d => x(d.hour)).y(d => y(d.nonArrestedCount)).curve(d3.curveMonotoneX);

    // 坐标轴动画过渡
    svg.select(".x-axis").transition().duration(800).call(d3.axisBottom(x).ticks(12).tickFormat(d => d + ":00"));
    svg.select(".y-axis").transition().duration(800).call(d3.axisLeft(y));

    // 数据线动画过渡
    lineArrested.datum(data).transition().duration(800).attr("d", lineGenA);
    lineNonArrested.datum(data).transition().duration(800).attr("d", lineGenN);
}