let svg, x0, x1, y, colorScale, tooltip;
const margin = {top: 40, right: 40, bottom: 60, left: 80};
const width = 850 - margin.left - margin.right;
const height = 550 - margin.top - margin.bottom;

// 地点名称汉化映射
const locationMap = {
    'STREET': '🛣️ 城市街道',
    'PARKING LOT/GARAGE(NON.RESID.)': '🅿️ 商业停车场',
    'CTA TRAIN': '🚇 轨道交通 (CTA)'
};

// 严格复用莫兰迪色板进行类型区分
const morandiColors = ["#D8A25E", "#C66E52", "#A04747", "#758A93", "#ECD5BC"];

export function initLocationChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove();

    svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    tooltip = d3.select("#tooltip");

    svg.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
    svg.append("g").attr("class", "y-axis");
}

export function updateLocationChart(data) {
    if (!data || data.length === 0) return;

    // 1. 提取维度
    const locations = Array.from(new Set(data.map(d => d.location)));
    const types = Array.from(new Set(data.map(d => d.type)));

    // 2. 配置比例尺
    // x0: 外层比例尺（按地点分组）
    x0 = d3.scaleBand().domain(locations).range([0, width]).paddingInner(0.2);
    // x1: 内层比例尺（每个地点内的犯罪类型并排）
    x1 = d3.scaleBand().domain(types).range([0, x0.bandwidth()]).padding(0.05);

    y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count) * 1.1]) // 顶部留白 10%
        .range([height, 0]);

    colorScale = d3.scaleOrdinal().domain(types).range(morandiColors);

    const t = d3.transition().duration(800);

    // 3. 渲染坐标轴
    svg.select(".x-axis").transition(t).call(
        d3.axisBottom(x0).tickFormat(d => locationMap[d] || d)
    ).selectAll("text")
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("fill", "var(--text-heading)");

    svg.select(".y-axis").transition(t).call(d3.axisLeft(y).ticks(8));

    // 4. 数据按地点进行嵌套分组
    const groupedData = d3.group(data, d => d.location);

    // 5. 渲染分组容器
    const locationGroups = svg.selectAll(".location-group")
        .data(groupedData, d => d[0]);

    locationGroups.exit().remove();

    const enterGroups = locationGroups.enter().append("g")
        .attr("class", "location-group")
        .attr("transform", d => `translate(${x0(d[0])},0)`);

    const mergedGroups = enterGroups.merge(locationGroups);
    mergedGroups.transition(t).attr("transform", d => `translate(${x0(d[0])},0)`);

    // 6. 渲染具体的柱子
    const bars = mergedGroups.selectAll("rect").data(d => d[1], d => d.type);

    bars.exit().transition(t).attr("y", height).attr("height", 0).remove();

    bars.enter().append("rect")
        .attr("x", d => x1(d.type))
        .attr("y", height)
        .attr("width", x1.bandwidth())
        .attr("height", 0)
        .attr("fill", d => colorScale(d.type))
        .attr("rx", 4) // 圆角矩形，增加高级感
        .merge(bars)
        .on("mouseover", function(event, d) {
            d3.select(this).style("filter", "brightness(1.1)");
            tooltip.style("opacity", 1)
                .html(`
                    <strong style="color:${colorScale(d.type)}">${d.type}</strong><br>
                    📍 ${locationMap[d.location] || d.location}<br>
                    数量: ${d.count.toLocaleString()} 起
                `)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).style("filter", "none");
            tooltip.style("opacity", 0);
        })
        .transition(t)
        .attr("x", d => x1(d.type))
        .attr("y", d => y(d.count))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.count));
}