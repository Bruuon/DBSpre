let svg, x0, x1, y, color;
const margin = {top: 40, right: 30, bottom: 60, left: 70};
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

    const locations = [...new Set(data.map(d => d.location))];
    const types = [...new Set(data.map(d => d.type))];

    x0.domain(locations);
    x1.domain(types).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(data, d => d.count) * 1.1]);

    // 绘制坐标轴
    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x0));
    svg.append("g").call(d3.axisLeft(y).ticks(null, "s"));

    // 绘制分组柱状图
    svg.append("g")
        .selectAll("g")
        .data(locations.map(loc => ({
            location: loc,
            values: data.filter(d => d.location === loc)
        })))
        .join("g")
        .attr("transform", d => `translate(${x0(d.location)},0)`)
        .selectAll("rect")
        .data(d => d.values)
        .join("rect")
        .attr("x", d => x1(d.type))
        .attr("y", d => y(d.count))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill", d => color(d.type))
        .attr("opacity", 0.9);
}