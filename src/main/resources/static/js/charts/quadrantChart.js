let svg, x0, x1, y, color;

// 1. 大幅增加 bottom margin (从 60 改为 120)，为倾斜的文字留出空间
const margin = {top: 40, right: 180, bottom: 120, left: 70};
const width = 850 - margin.left - margin.right;
const height = 450 - margin.top - margin.bottom;

export function initQuadrantChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove();
    svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    x0 = d3.scaleBand().rangeRound([0, width]).paddingInner(0.2); // 犯罪类型大组
    x1 = d3.scaleBand().padding(0.1); // 组内：工作日 vs 周末
    y = d3.scaleLinear().rangeRound([height, 0]);

    // SOP 颜色：白天 (--c-mustard #EEDF7A), 夜间 (--c-teal #A04747)
    color = d3.scaleOrdinal().domain(["Day", "Night"]).range(["#EEDF7A", "#A04747"]);
}

export function updateQuadrantChart(data) {
    if (!data || data.length === 0) return;

    const types = data.map(d => d.type);
    x0.domain(types);
    x1.domain(["Weekday", "Weekend"]).rangeRound([0, x0.bandwidth()]);

    // 计算 Y 轴最大高度
    const maxVal = d3.max(data, d => Math.max(d.weekdayDay + d.weekdayNight, d.weekendDay + d.weekendNight));
    y.domain([0, maxVal * 1.1]);

    svg.selectAll(".axis").remove();
    svg.selectAll(".type-group").remove(); // 确保每次更新时清理旧组

    // 2. 绘制 X 轴并倾斜文字
    svg.append("g")
        .attr("class","axis x-axis")
        .attr("transform", `translate(0,${height})`)
        // 使用 tickPadding 将主坐标轴文字向下推 25px，给“周中/周末”留出位置
        .call(d3.axisBottom(x0).tickPadding(25))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)") // 倾斜 45 度
        .style("font-weight", "600")
        .style("fill", "var(--text-heading)");

    svg.append("g")
        .attr("class","axis y-axis")
        .call(d3.axisLeft(y).ticks(null, "s"));

    // 绘制大组
    const typeGroup = svg.selectAll(".type-group")
        .data(data)
        .join("g")
        .attr("class", "type-group")
        .attr("transform", d => `translate(${x0(d.type)},0)`);

    // 3. 绘制工作日柱子 (含子标签)
    const wd = typeGroup.append("g").attr("transform", `translate(${x1("Weekday")},0)`);

    wd.append("rect").attr("fill", color("Day")).attr("y", d => y(d.weekdayDay)).attr("height", d => height - y(d.weekdayDay)).attr("width", x1.bandwidth());
    wd.append("rect").attr("fill", color("Night")).attr("y", d => y(d.weekdayDay + d.weekdayNight)).attr("height", d => y(d.weekdayDay) - y(d.weekdayDay + d.weekdayNight)).attr("width", x1.bandwidth());

    // 添加 "周中" 子标签
    wd.append("text")
        .attr("y", height + 16) // 放置在柱子正下方
        .attr("x", x1.bandwidth() / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("fill", "var(--text-muted)")
        .text("周中");

    // 4. 绘制周末柱子 (含子标签)
    const we = typeGroup.append("g").attr("transform", `translate(${x1("Weekend")},0)`);

    we.append("rect").attr("fill", color("Day")).attr("y", d => y(d.weekendDay)).attr("height", d => height - y(d.weekendDay)).attr("width", x1.bandwidth());
    we.append("rect").attr("fill", color("Night")).attr("y", d => y(d.weekendDay + d.weekendNight)).attr("height", d => y(d.weekendDay) - y(d.weekendDay + d.weekendNight)).attr("width", x1.bandwidth());

    // 添加 "周末" 子标签
    we.append("text")
        .attr("y", height + 16)
        .attr("x", x1.bandwidth() / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("fill", "var(--text-muted)")
        .text("周末");

    // 绘制图例 (白天 vs 夜间)
    svg.selectAll(".legend-group").remove();
    const legend = svg.append("g").attr("class", "legend-group").attr("transform", `translate(${width + 20}, 0)`);

    ["白天 (06:00-18:00)", "夜间 (18:00-06:00)"].forEach((label, i) => {
        const item = legend.append("g").attr("transform", `translate(0, ${i * 25})`);
        item.append("rect").attr("width", 15).attr("height", 15).attr("rx", 2).attr("fill", i === 0 ? "#EEDF7A" : "#A04747");
        item.append("text").attr("x", 22).attr("y", 12).text(label).style("font-size", "12px").style("fill", "var(--text-body)");
    });
}