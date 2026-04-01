let svg, xScale, yScale, colorScale, tooltip;
const margin = {top: 40, right: 30, bottom: 50, left: 50};
const width = 850 - margin.left - margin.right;
const height = 550 - margin.top - margin.bottom;

// 完美契合你 CSS 的莫兰迪调色盘
const morandiColors = ["#7EACB5", "#E9B63B", "#C66E52", "#BF4646", "#758A93", "#ECD5BC"];

export function initStreamChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove();

    svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    tooltip = d3.select("#tooltip");

    svg.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
}

export function updateStreamChart(data) {
    if (!data || data.length === 0) return;

    // 1. 数据塑形：把后端传来的扁平数组，转化为 D3 stack 需要的“按年份分组的多维对象”
    const types = Array.from(new Set(data.map(d => d.type)));
    const grouped = d3.group(data, d => d.year);
    const years = Array.from(grouped.keys()).sort();

    const formattedData = years.map(y => {
        const obj = { year: y };
        types.forEach(t => obj[t] = 0); // 补零防报错
        grouped.get(y).forEach(d => obj[d.type] = d.count);
        return obj;
    });

    // 2. 核心魔法：使用 stackOffsetWiggle 产生河流效果
    const stack = d3.stack()
        .keys(types)
        .offset(d3.stackOffsetWiggle) // 这句代码是画出河流形态的灵魂
        .order(d3.stackOrderInsideOut); // 让数据量大的在中间，产生流线美感

    const series = stack(formattedData);

    // 3. 比例尺
    xScale = d3.scaleLinear().domain(d3.extent(years)).range([0, width]);
    yScale = d3.scaleLinear()
        .domain([
            d3.min(series, layer => d3.min(layer, d => d[0])),
            d3.max(series, layer => d3.max(layer, d => d[1]))
        ])
        .range([height, 0]);

    colorScale = d3.scaleOrdinal().domain(types).range(morandiColors);

    // 4. 区域生成器 (使用平滑曲线)
    const area = d3.area()
        .x(d => xScale(d.data.year))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveBasis); // 基底平滑曲线

    const t = d3.transition().duration(1200);

    // 5. 渲染 X 轴 (Y轴不需要，因为河流图表现的是相对体量)
    svg.select(".x-axis").transition(t).call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    svg.select(".x-axis").selectAll("text").style("fill", "var(--text-muted)");
    svg.select(".x-axis").selectAll("path, line").style("stroke", "var(--c-sand)");

    // 6. 绑定数据并绘制河流层
    const streams = svg.selectAll(".stream-layer").data(series, d => d.key);

    streams.exit().transition(t).style("opacity", 0).remove();

    streams.enter().append("path")
        .attr("class", "stream-layer")
        .style("fill", d => colorScale(d.key))
        .style("opacity", 0)
        // 初始状态压扁成一条线
        .attr("d", d3.area().x(d => xScale(d.data.year)).y0(height/2).y1(height/2).curve(d3.curveBasis))
        .merge(streams)
        .on("mouseover", function(event, d) {
            // 交互炫技：悬浮时降低其他河流透明度
            svg.selectAll(".stream-layer").style("opacity", 0.2).style("transition", "opacity 0.2s");
            d3.select(this).style("opacity", 1);

            tooltip.style("opacity", 1)
                .html(`<strong style="color:${colorScale(d.key)}">${d.key}</strong><br>生态演变趋势`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event, d) {
            // 动态计算当前鼠标位置对应的年份和数据
            const year = Math.round(xScale.invert(d3.pointer(event, this)[0]));
            const yearData = d.find(p => p.data.year === year);
            if (yearData) {
                const count = yearData.data[d.key];
                tooltip.html(`<strong style="color:${colorScale(d.key)}">${d.key}</strong><br>年份: ${year}<br>案发量: ${count.toLocaleString()}`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            }
        })
        .on("mouseout", function() {
            svg.selectAll(".stream-layer").style("opacity", 0.85);
            tooltip.style("opacity", 0);
        })
        .transition(t)
        .style("opacity", 0.85) // 保持微透，增加高级感
        .attr("d", area);
}