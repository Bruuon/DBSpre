let svg, g, x, y;
const margin = {top: 20, right: 60, bottom: 40, left: 100};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

export function initCoolingChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove();

    svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    x = d3.scaleLinear().range([0, width]);
    y = d3.scaleBand().range([0, height]).padding(0.2);

    // 坐标轴占位
    svg.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
    svg.append("g").attr("class", "y-axis");
}

export function updateCoolingChart(data) {
    if (!data || data.length === 0) return;

    // 更新比例尺
    x.domain([0, d3.max(data, d => d.avgMinutes)]);
    y.domain(data.map(d => `警区 ${d.district}`));

    // 绘制坐标轴
    svg.select(".x-axis").transition().duration(500).call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "m"));
    svg.select(".y-axis").transition().duration(500).call(d3.axisLeft(y));

    // 绑定数据
    const bars = svg.selectAll(".bar").data(data, d => d.district);

    bars.exit().remove();

    const enterBars = bars.enter().append("rect")
        .attr("class", "bar")
        .attr("y", d => y(`警区 ${d.district}`))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", 0) // 初始宽度为0用于动画
        .attr("fill", d => d.avgMinutes < 60 ? "#A04747" : "#758A93"); // 压力大的变红

    // 更新动画
    enterBars.merge(bars)
        .transition().duration(800)
        .attr("width", d => x(d.avgMinutes))
        .attr("y", d => y(`警区 ${d.district}`))
        .attr("fill", d => d.avgMinutes < 60 ? "#A04747" : "#EDDCC6");

    // 添加数值标签
    const labels = svg.selectAll(".label").data(data, d => d.district);
    labels.exit().remove();
    labels.enter().append("text")
        .attr("class", "label")
        .merge(labels)
        .transition().duration(800)
        .attr("x", d => x(d.avgMinutes) + 5)
        .attr("y", d => y(`警区 ${d.district}`) + y.bandwidth()/2 + 5)
        .text(d => Math.round(d.avgMinutes) + "m")
        .style("font-size", "12px");
}