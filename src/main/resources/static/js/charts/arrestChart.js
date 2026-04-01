let svg, x, y, xAxisGroup, yAxisGroup, tooltip;
const margin = {top: 20, right: 50, bottom: 40, left: 180};
let width, height;

export function initArrestChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove();

    width = 850 - margin.left - margin.right;
    height = 600 - margin.top - margin.bottom; // 列表较长，增加高度

    svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    x = d3.scaleLinear().range([0, width]);
    y = d3.scaleBand().range([0, height]).padding(0.2);

    xAxisGroup = svg.append("g").attr("transform", `translate(0,${height})`).attr("class", "axis");
    yAxisGroup = svg.append("g").attr("class", "axis");
    tooltip = d3.select("#tooltip");
}

export function updateArrestChart(data, selectedType) {
    if (!data || data.length === 0) return;
    const t = d3.transition().duration(800);

    // 1. 更新比例尺
    x.domain([0, 100]);
    y.domain(data.map(d => d.type));

    // 2. 更新坐标轴
    xAxisGroup.transition(t).call(d3.axisBottom(x).tickFormat(d => d + "%"));
    yAxisGroup.transition(t).call(d3.axisLeft(y));

    // 3. 数据绑定
    const bars = svg.selectAll(".bar").data(data, d => d.type);

    // 4. 退出（Exit）
    bars.exit().remove();

    // 5. 进入 + 合并更新 (Enter + Update)
    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => y(d.type))
        .attr("height", y.bandwidth())
        .attr("width", 0)
        .merge(bars)
        .attr("class", d => {
            const currentBarType = d.type ? d.type.trim().toUpperCase() : "";
            const selectType = selectedType ? selectedType.trim().toUpperCase() : "";
            return (currentBarType === selectType) ? "bar arrest-bar highlight" : "bar arrest-bar";
        })
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                .html(`类型: ${d.type}<br>逮捕率: ${d.arrestRate.toFixed(2)}%<br>逮捕数/总数: ${d.arrestCount}/${d.totalCases}`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0))
        .transition(t)
        .attr("y", d => y(d.type))
        .attr("height", y.bandwidth())
        .attr("width", d => x(d.arrestRate));
}