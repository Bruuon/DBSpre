let svg, xScale, yScale, colorScale, tooltip;
const margin = {top: 40, right: 30, bottom: 60, left: 180};
const width = 850 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export function initDayTypeChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove();

    svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    xScale = d3.scaleBand().range([0, width]).domain(weekDays).padding(0.05);
    yScale = d3.scaleBand().range([0, height]).padding(0.05);

    // 🎨 核心配色：奶油白 -> 拿铁色 -> 赤红 (莫兰迪色系)
    colorScale = d3.scaleLinear()
        .range(["#FFF4EA", "#ECD5BC", "#BF4646"]);

    tooltip = d3.select("#tooltip");

    svg.append("g").attr("class", "axis").call(d3.axisLeft(yScale));
    svg.append("g").attr("class", "axis").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale));
}

export function updateDayTypeChart(data) {
    if (!data || data.length === 0) return;

    // 1. 筛选 Top 10 类型
    const typeTotals = d3.rollup(data, v => d3.sum(v, d => d.count), d => d.type);
    const top10 = Array.from(typeTotals).sort((a,b) => b[1] - a[1]).slice(0, 10).map(d => d[0]);

    const filtered = data.filter(d => top10.includes(d.type));
    yScale.domain(top10);
    colorScale.domain([0, d3.max(filtered, d => d.count) * 0.5, d3.max(filtered, d => d.count)]);

    svg.select(".axis").transition().duration(800).call(d3.axisLeft(yScale));

    const cells = svg.selectAll(".matrix-cell").data(filtered, d => d.type + d.dayOfWeek);

    cells.exit().remove();

    cells.enter().append("rect")
        .attr("class", "matrix-cell")
        .attr("x", d => xScale(weekDays[d.dayOfWeek - 1]))
        .attr("y", d => yScale(d.type))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", "#FFF4EA")
        .merge(cells)
        .on("mouseover", function(event, d) {
            tooltip.style("opacity", 1)
                .html(`<strong>${d.type}</strong><br>${weekDays[d.dayOfWeek-1]}<br>数量: ${d.count.toLocaleString()}`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0))
        .transition().duration(1000)
        .style("fill", d => colorScale(d.count));
}