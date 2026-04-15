let svg, x0, x1, y, color;
// 扩大 right margin，为右侧图例留出充足空间
const margin = {top: 40, right: 180, bottom: 60, left: 70};
const width = 850 - margin.left - margin.right;
const height = 450 - margin.top - margin.bottom;

export function initLocRiskChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove();

    svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    x0 = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1); // 地点比例尺
    x1 = d3.scaleBand().padding(0.05); // 犯罪类型比例尺
    y = d3.scaleLinear().rangeRound([height, 0]);

    // 复用 SOP 定义色
    color = d3.scaleOrdinal().range(["#A04747", "#D8A25E", "#343131", "#C66E52", "#758A93"]);
}

export function updateLocRiskChart(data) {
    if (!data || data.length === 0) return;

    // 提取唯一的地点和犯罪类型
    const locations = [...new Set(data.map(d => d.location))];
    const types = [...new Set(data.map(d => d.type))];

    // 更新比例尺定义域
    x0.domain(locations);
    x1.domain(types).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(data, d => d.count) * 1.1]);

    // 绑定颜色比例尺
    color.domain(types);

    // 清理旧的坐标轴和图层
    svg.selectAll(".axis").remove();
    svg.selectAll(".location-group").remove();

    // 绘制坐标轴
    svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));

    svg.append("g")
        .attr("class", "y-axis axis")
        .call(d3.axisLeft(y).ticks(null, "s"));

    // 绘制分组柱状图
    svg.append("g")
        .selectAll("g")
        .data(locations.map(loc => ({
            location: loc,
            values: data.filter(d => d.location === loc)
        })))
        .join("g")
        .attr("class", "location-group")
        .attr("transform", d => `translate(${x0(d.location)},0)`)
        .selectAll("rect")
        .data(d => d.values)
        .join("rect")
        .attr("x", d => x1(d.type))
        .attr("y", d => y(d.count))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill", d => color(d.type))
        .attr("opacity", 0.9)
        // 简单的悬浮高亮反馈
        .on("mouseover", function() {
            d3.select(this).attr("opacity", 1).style("stroke", "#343131").style("stroke-width", "1px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 0.9).style("stroke", "none");
        });

    // =========================================
    // 新增：动态图例 (Legend) 渲染逻辑
    // =========================================

    // 清理旧图例
    svg.selectAll(".legend-group").remove();

    // 创建图例容器，定位到图表右侧
    const legend = svg.append("g")
        .attr("class", "legend-group")
        .attr("transform", `translate(${width + 20}, 0)`);

    // 为每个犯罪类型生成图例项
    const legendItem = legend.selectAll(".legend-item")
        .data(types)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 22})`); // 控制垂直间距

    // 添加色块
    legendItem.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 14)
        .attr("height", 14)
        .attr("rx", 2) // 轻微圆角
        .attr("fill", d => color(d));

    // 添加文本标签
    legendItem.append("text")
        .attr("x", 22)
        .attr("y", 7)
        .attr("dy", "0.35em") // 垂直居中
        .text(d => d)
        .style("font-size", "11px")
        .style("font-weight", "500")
        .style("fill", "var(--text-body)");
}