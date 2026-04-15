let svg, g, colorScale, tooltip;
const width = 850;
const height = 550;
const radius = Math.min(width, height) / 2 - 40;

// 调色盘逻辑：重罪使用赭红 (--c-teal)，轻罪使用浅沙 (--c-sand)
const colorMap = {
    '重罪 (Felony)': "#A04747",
    '轻罪/违规 (Misdemeanor/Other)': "#EDDCC6"
};

export function initSeverityChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove();

    svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    g = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    tooltip = d3.select("#tooltip");
}

export function updateSeverityChart(data) {
    if (!data || data.length === 0) return;

    const total = d3.sum(data, d => d.count);
    const pie = d3.pie().value(d => d.count).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius);
    const hoverArc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius * 1.05);

    const arcs = g.selectAll(".arc").data(pie(data));

    arcs.exit().remove();

    const enterArcs = arcs.enter().append("g").attr("class", "arc");

    enterArcs.append("path")
        .attr("fill", d => colorMap[d.data.severity] || "#343131")
        .attr("d", arc)
        .each(function(d) { this._current = d; }) // 存储初始角度用于动画
        .on("mouseover", function(event, d) {
            d3.select(this).transition().duration(200).attr("d", hoverArc);
            const percent = ((d.data.count / total) * 100).toFixed(1);
            tooltip.style("opacity", 1)
                .html(`<strong>${d.data.severity}</strong><br>案件量: ${d.data.count.toLocaleString()}<br>占比: ${percent}%`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).transition().duration(200).attr("d", arc);
            tooltip.style("opacity", 0);
        });

    // 文字中心统计
    g.selectAll(".total-text").remove();
    g.append("text")
        .attr("class", "total-text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.5em")
        .style("font-size", "16px")
        .style("fill", "#758A93")
        .text("案发总量");

    g.append("text")
        .attr("class", "total-text")
        .attr("text-anchor", "middle")
        .attr("dy", "1em")
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .style("fill", "var(--text-heading)")
        .text(total.toLocaleString());
}