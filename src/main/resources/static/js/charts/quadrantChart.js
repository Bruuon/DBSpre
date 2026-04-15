let svg, x0, x1, y, color;
const margin = {top: 40, right: 30, bottom: 60, left: 70};
const width = 850 - margin.left - margin.right;
const height = 450 - margin.top - margin.bottom;

export function initQuadrantChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove();
    svg = container.append("svg").attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    x0 = d3.scaleBand().rangeRound([0, width]).paddingInner(0.2); // 犯罪类型
    x1 = d3.scaleBand().padding(0.1); // 周中 vs 周末
    y = d3.scaleLinear().rangeRound([height, 0]);

    // 采用 SOP 色彩：夜间使用 --c-teal (赭红), 白天使用 --c-mustard (金黄)
    color = d3.scaleOrdinal().range(["#EEDF7A", "#A04747"]);
}

export function updateQuadrantChart(data) {
    if (!data || data.length === 0) return;

    const types = data.map(d => d.type);
    x0.domain(types);
    x1.domain(["Weekday", "Weekend"]).rangeRound([0, x0.bandwidth()]);

    const maxVal = d3.max(data, d => Math.max(d.weekdayDay + d.weekdayNight, d.weekendDay + d.weekendNight));
    y.domain([0, maxVal * 1.1]);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x0));
    svg.append("g").call(d3.axisLeft(y));

    // 绘图逻辑：对每个类型创建两个堆叠柱
    const groups = svg.selectAll(".type-group").data(data).join("g")
        .attr("class", "type-group")
        .attr("transform", d => `translate(${x0(d.type)},0)`);

    // 逻辑省略：此处循环绘制 Weekday(wd_day+wd_night) 和 Weekend(we_day+we_night) 的堆叠矩形
}