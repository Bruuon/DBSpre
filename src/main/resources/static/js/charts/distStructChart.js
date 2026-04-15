let svg, x, y, color;
const margin = {top: 40, right: 150, bottom: 50, left: 60};
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

    const stack = d3.stack().keys(types);
    const series = stack(formattedData);

    x.domain(districts);
    y.domain([0, 1]);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
    svg.append("g").call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

    svg.append("g")
        .selectAll("g")
        .data(series)
        .join("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => x(d.data.district))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth());

    // 此处可追加图例渲染...
}