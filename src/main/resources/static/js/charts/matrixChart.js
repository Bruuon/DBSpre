let svg, xScale, yScale, sizeScale, colorScale, tooltip;
const margin = {top: 40, right: 80, bottom: 60, left: 180};
let width, height;

export function initMatrixChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove();

    width = 850 - margin.left - margin.right;
    height = 650 - margin.top - margin.bottom;

    svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 比例尺初始化
    xScale = d3.scaleBand().range([0, width]).padding(0.1);
    yScale = d3.scaleBand().range([0, height]).padding(0.1);
    sizeScale = d3.scaleSqrt().range([2, 18]); // 气泡半径 2px ~ 18px
    // 颜色比例尺：RdYlGn (红-黄-绿)，0%为红，100%为绿
    colorScale = d3.scaleLinear()
        .domain([0, 50, 100])
        .range(["#BF4646", "#E9B63B", "#7EACB5"]);

    tooltip = d3.select("#tooltip");

    // 添加坐标轴占位容器
    svg.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
    svg.append("g").attr("class", "y-axis");

    // 替换为使用 class
    svg.append("text").attr("x", width + 20).attr("y", -20).text("逮捕率说明:").attr("class", "matrix-legend-title");
    svg.append("text").attr("x", width + 20).attr("y", 0).text("🔴 低 (<20%)").attr("class", "matrix-legend-low");
    svg.append("text").attr("x", width + 20).attr("y", 20).text("🟡 中 (40~60%)").attr("class", "matrix-legend-mid");
    svg.append("text").attr("x", width + 20).attr("y", 40).text("🟢 高 (>80%)").attr("class", "matrix-legend-high");
}

export function updateMatrixChart(data) {
    if (!data || data.length === 0) return;

    // 1. 数据预处理：找出总案发量 Top 10 的犯罪类型
    const typeTotals = d3.rollup(data, v => d3.sum(v, d => d.count), d => d.type);
    const top10Types = Array.from(typeTotals, ([type, count]) => ({type, count}))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(d => d.type);

    // 过滤出只包含 Top 10 类型的数据
    const filteredData = data.filter(d => top10Types.includes(d.type));

    // 2. 更新比例尺 Domain
    const hours = d3.range(0, 24); // [0, 1, 2... 23]
    xScale.domain(hours);
    yScale.domain(top10Types); // Y轴按照案件总量从大到小排列
    sizeScale.domain([0, d3.max(filteredData, d => d.count)]);

    const t = d3.transition().duration(1000);

    // 3. 更新坐标轴
    svg.select(".x-axis").transition(t).call(d3.axisBottom(xScale).tickFormat(d => d + "时"));
    svg.select(".y-axis").transition(t).call(d3.axisLeft(yScale));

    // 4. 气泡绑定与渲染
    const bubbles = svg.selectAll(".bubble")
        .data(filteredData, d => `${d.type}-${d.hour}`);

    bubbles.exit().transition(t).attr("r", 0).remove();

    bubbles.enter().append("circle")
        .attr("class", "bubble")
        .attr("cx", d => xScale(d.hour) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.type) + yScale.bandwidth() / 2)
        .attr("r", 0) // 初始半径为0，用于进场动画
        .attr("fill", d => colorScale(d.arrestRate))
        .attr("opacity", 0.8)
        .merge(bubbles)
        .on("mouseover", function(event, d) {
            tooltip.style("opacity", 1)
                .html(`<strong>${d.type}</strong><br>时段: ${d.hour}:00 - ${d.hour+1}:00<br>案发数量: ${d.count.toLocaleString()} 起<br>逮捕率: <span style="color:${colorScale(d.arrestRate)}"><b>${d.arrestRate.toFixed(1)}%</b></span>`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("opacity", 0);
        })
        .transition(t)
        .attr("cx", d => xScale(d.hour) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.type) + yScale.bandwidth() / 2)
        .attr("r", d => sizeScale(d.count))
        .attr("fill", d => colorScale(d.arrestRate));
}