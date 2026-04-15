let svg, x, y, color;
// 确保 right margin 有足够空间容纳较长的犯罪类型文本
const margin = {top: 40, right: 180, bottom: 50, left: 60};
const width = 850 - margin.left - margin.right;
const height = 450 - margin.top - margin.bottom;

export function initDistStructChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove();

    svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    x = d3.scaleBand().range([0, width]).padding(0.3);
    y = d3.scaleLinear().range([height, 0]);

    // 复用 SOP 核心色
    color = d3.scaleOrdinal()
        .range(["#D8A25E", "#EDDCC6", "#A04747", "#343131", "#ECD5BC", "#EEDF7A", "#C66E52", "#758A93"]);
}

export function updateDistStructChart(data) {
    if (!data || data.length === 0) return;

    // 数据重组：按警区聚合各类型比例
    const districts = [...new Set(data.map(d => d.district))];
    const types = [...new Set(data.map(d => d.type))];

    const formattedData = districts.map(d => {
        const item = { district: d };
        let total = 0;
        data.filter(v => v.district === d).forEach(v => {
            item[v.type] = v.count;
            total += v.count;
        });
        // 转换为百分比
        types.forEach(t => item[t] = (item[t] || 0) / total);
        return item;
    });

    // 绑定颜色比例尺的定义域
    color.domain(types);

    const stack = d3.stack().keys(types);
    const series = stack(formattedData);

    x.domain(districts);
    y.domain([0, 1]);

    // 清理旧的坐标轴和图形，防止重绘重叠
    svg.selectAll(".axis").remove();
    svg.selectAll(".layer").remove();

    svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "y-axis axis")
        .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

    // 绘制堆叠柱子
    svg.append("g")
        .selectAll("g")
        .data(series)
        .join("g")
        .attr("class", "layer")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => x(d.data.district))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        // 添加简单的进场动画
        .attr("opacity", 0)
        .transition().duration(800)
        .attr("opacity", 1);

    // =========================================
    // 新增：动态图例 (Legend) 渲染逻辑
    // =========================================

    // 清理旧图例
    svg.selectAll(".legend-group").remove();

    // 创建图例容器，放置在柱状图右侧的安全距离
    const legend = svg.append("g")
        .attr("class", "legend-group")
        .attr("transform", `translate(${width + 20}, 0)`);

    // 为每个犯罪类型生成一行图例项
    const legendItem = legend.selectAll(".legend-item")
        .data(types.slice().reverse()) // 反转数组让图例顺序和堆叠顺序在视觉上大致匹配
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 22})`); // 垂直间距 22px

    // 添加色块
    legendItem.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 14)
        .attr("height", 14)
        .attr("rx", 2) // 轻微圆角提升质感
        .attr("fill", d => color(d));

    // 添加文本标签
    legendItem.append("text")
        .attr("x", 22)
        .attr("y", 7)
        .attr("dy", "0.35em") // 垂直居中对齐
        .text(d => d)
        .style("font-size", "11px")
        .style("font-weight", "500")
        .style("fill", "var(--text-body)");
}