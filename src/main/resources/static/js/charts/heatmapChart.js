// js/charts/heatmapChart.js

let svg, colorScale, xScale, yScale, tooltip;
const margin = {top: 20, right: 20, bottom: 20, left: 20};
let width, height;

export function initHeatmapChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove();

    width = 850 - margin.left - margin.right;
    height = 550 - margin.top - margin.bottom; // 地图可以稍微高一点

    svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 绑定我们在 index.html 中预留的 tooltip div
    tooltip = d3.select("#tooltip");

    // 颜色比例尺 (使用 D3 内置的从浅黄到深红的连续色带)
    // 提示：你需要在 index.html 头部额外引入 d3-scale-chromatic：
    // <script src="https://d3js.org/d3-scale-chromatic.v3.min.js"></script>
    // 如果不额外引入，可以使用下面这种手动的渐变范围
    colorScale = d3.scaleSequential(d3.interpolateYlOrRd);
}

export function updateHeatmapChart(data) {
    if (!data || data.length === 0) return;

    // ================= 新增：空间坐标脏数据清洗 =================
    // 过滤掉坐标为 (0,0) 或严重偏离芝加哥市区的错误录入数据
    const cleanData = data.filter(d =>
        d.latGrid > 41.0 && d.latGrid < 42.5 &&
        d.lonGrid > -88.5 && d.lonGrid < -87.0
    );

    if (cleanData.length === 0) return;
    // =========================================================

    // 1. 确定地理边界 (全部改用清洗后的 cleanData)
    const lonExtent = d3.extent(cleanData, d => d.lonGrid);
    const latExtent = d3.extent(cleanData, d => d.latGrid);

    // 2. 建立地理坐标到屏幕像素的映射
    xScale = d3.scaleLinear().domain(lonExtent).range([0, width]);
    yScale = d3.scaleLinear().domain(latExtent).range([height, 0]);

    // 3. 更新颜色范围的最大值
    const maxCount = d3.max(cleanData, d => d.count);
    colorScale.domain([0, maxCount]);

    // 4. 计算网格大小 (0.01度在屏幕上占多少像素)
    const cellWidth = Math.abs(xScale(lonExtent[0] + 0.01) - xScale(lonExtent[0])) * 0.95;
    const cellHeight = Math.abs(yScale(latExtent[0] + 0.01) - yScale(latExtent[0])) * 0.95;

    // 5. 数据绑定与渲染 (数据源换成 cleanData)
    const cells = svg.selectAll(".grid-cell").data(cleanData, d => `${d.lonGrid}_${d.latGrid}`);

    cells.exit().remove();

    cells.enter().append("rect")
        .attr("class", "grid-cell")
        .attr("x", d => xScale(d.lonGrid))
        .attr("y", d => yScale(d.latGrid))
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .attr("fill", "#fff")
        .merge(cells)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("stroke", "#333").attr("stroke-width", 2);
            tooltip.style("opacity", 1)
                .html(`经度: ${d.lonGrid}<br>纬度: ${d.latGrid}<br>案件数量: ${d.count}`)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("stroke", "none");
            tooltip.style("opacity", 0);
        })
        .transition().duration(800)
        .attr("fill", d => colorScale(d.count));
}