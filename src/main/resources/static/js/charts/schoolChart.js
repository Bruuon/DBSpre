let svg, tooltip;
const width = 850;
const height = 500;
const radius = Math.min(width, height) / 2 - 20;

export function initSchoolChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove();

    svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`); // 原点移到中心

    tooltip = d3.select("#tooltip");
}

export function updateSchoolChart(data) {
    if (!data) return;
    svg.selectAll("*").remove(); // 每次更新重绘嵌套图

    // 数据重组：适配 D3 的嵌套饼图逻辑
    const innerData = [
        { label: "非校园区域", value: data.nonSchoolCount, color: "#bdc3c7" },
        { label: "校园区域", value: data.schoolDayCount + data.schoolNightCount, color: "#3498db" }
    ];

    const outerData = [
        { label: "非校园区域 (占位不可见)", value: data.nonSchoolCount, color: "transparent" },
        { label: "上学时段 (07:00-17:00)", value: data.schoolDayCount, color: "#2ecc71" },
        { label: "放学时段 (17:00-07:00)", value: data.schoolNightCount, color: "#e74c3c" }
    ];

    const total = data.nonSchoolCount + data.schoolDayCount + data.schoolNightCount;

    // 定义内环和外环的半径
    const arcInner = d3.arc().innerRadius(radius * 0.4).outerRadius(radius * 0.7);
    const arcOuter = d3.arc().innerRadius(radius * 0.7 + 2).outerRadius(radius * 0.95);

    const pie = d3.pie().value(d => d.value).sort(null);

    // ================= 1. 绘制内环 (大类) =================
    const innerArcs = svg.selectAll(".arc-inner")
        .data(pie(innerData))
        .enter().append("g").attr("class", "arc-inner");

    innerArcs.append("path")
        .attr("d", arcInner)
        .attr("fill", d => d.data.color)
        .attr("stroke", "#fff")
        .attr("stroke-width", "2px")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 0.8);
            const percent = ((d.data.value / total) * 100).toFixed(2);
            tooltip.style("opacity", 1)
                .html(`<strong>${d.data.label}</strong><br>案件数: ${d.data.value}<br>占比: ${percent}%`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 1);
            tooltip.style("opacity", 0);
        })
        // 进场动画
        .transition().duration(1000)
        .attrTween("d", function(d) {
            const i = d3.interpolate({startAngle: 0, endAngle: 0}, d);
            return function(t) { return arcInner(i(t)); };
        });

    // ================= 2. 绘制外环 (小类) =================
    const outerArcs = svg.selectAll(".arc-outer")
        .data(pie(outerData))
        .enter().append("g").attr("class", "arc-outer");

    outerArcs.append("path")
        .attr("d", arcOuter)
        .attr("fill", d => d.data.color)
        .attr("stroke", "#fff")
        .attr("stroke-width", "2px")
        .on("mouseover", function(event, d) {
            if (d.data.color === "transparent") return; // 忽略占位符
            d3.select(this).attr("opacity", 0.8);
            const schoolTotal = data.schoolDayCount + data.schoolNightCount;
            const percent = ((d.data.value / schoolTotal) * 100).toFixed(2);
            tooltip.style("opacity", 1)
                .html(`<strong>${d.data.label}</strong><br>案件数: ${d.data.value}<br>占校园案件比: ${percent}%`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 1);
            tooltip.style("opacity", 0);
        })
        // 进场动画 (外环稍微延迟，产生层次感)
        .transition().delay(300).duration(1000)
        .attrTween("d", function(d) {
            const i = d3.interpolate({startAngle: d.startAngle, endAngle: d.startAngle}, d);
            return function(t) { return arcOuter(i(t)); };
        });

    // ================= 3. 中心文字 =================
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.5em")
        .style("font-size", "16px")
        .style("fill", "#7f8c8d")
        .text("总案件数")
        .style("opacity", 0)
        .transition().delay(800).duration(500)
        .style("opacity", 1);

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1em")
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .style("fill", "#2c3e50")
        .text(total.toLocaleString())
        .style("opacity", 0)
        .transition().delay(800).duration(500)
        .style("opacity", 1);
}
