let svg, x, y, lineArrested, lineNonArrested;
const margin = {top: 30, right: 80, bottom: 50, left: 80};
const width = 850 - margin.left - margin.right;
const height = 450 - margin.top - margin.bottom;

export function initArrestGapChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove();

    svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    x = d3.scaleLinear().range([0, width]);
    y = d3.scaleLinear().range([height, 0]);

    svg.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${height})`);
    svg.append("g").attr("class", "y-axis axis");

    // 初始化两条曲线
    lineArrested = svg.append("path").attr("class", "line").style("stroke", "#A04747");
    lineNonArrested = svg.append("path").attr("class", "line").style("stroke", "#EDDCC6");
}

export function updateArrestGapChart(data) {
    if (!data || data.length === 0) return;

    x.domain([0, 23]);
    y.domain([0, d3.max(data, d => Math.max(d.arrestedCount, d.nonArrestedCount)) * 1.1]);

    const lineGenA = d3.line().x(d => x(d.hour)).y(d => y(d.arrestedCount)).curve(d3.curveMonotoneX);
    const lineGenN = d3.line().x(d => x(d.hour)).y(d => y(d.nonArrestedCount)).curve(d3.curveMonotoneX);

    svg.select(".x-axis").transition().duration(800).call(d3.axisBottom(x).ticks(12).tickFormat(d => d + ":00"));
    svg.select(".y-axis").transition().duration(800).call(d3.axisLeft(y));

    lineArrested.datum(data).transition().duration(800).attr("d", lineGenA);
    lineNonArrested.datum(data).transition().duration(800).attr("d", lineGenN);
}