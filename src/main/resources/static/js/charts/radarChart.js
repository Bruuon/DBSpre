let svg, tooltip;
const width = 850;
const height = 650;
const margin = 100;
const radius = Math.min(width, height) / 2 - margin;
const features = ['THEFT', 'BATTERY', 'NARCOTICS', 'ASSAULT', 'BURGLARY', 'ROBBERY'];

// 修改 js/charts/radarChart.js 里的映射字典
const districtMap = {
    '001': { name: '01区 (市中心/商业圈)', color: '#3498db' }, // 改为 '001'
    '011': { name: '11区 (哈里森/高危区)', color: '#e74c3c' }, // 改为 '011'
    '018': { name: '18区 (近北区/夜生活)', color: '#9b59b6' }  // 改为 '018'
};
export function initRadarChart(containerSelector) {
    const container = d3.select(containerSelector);
    container.selectAll("*").remove();

    svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`); // 原点移到中心

    tooltip = d3.select("#tooltip");

    // 绘制雷达图的底网 (同心圆)
    const ticks = [20, 40, 60, 80]; // 代表百分比
    ticks.forEach(t => {
        const r = (radius / 80) * t; // 映射半径 (假设最大值80%)
        svg.append("circle")
            .attr("cx", 0).attr("cy", 0).attr("r", r)
            .style("fill", "none").style("stroke", "#e0e0e0").style("stroke-dasharray", "4,4");

        // 标尺文字
        svg.append("text")
            .attr("x", 5).attr("y", -r - 2)
            .text(`${t}%`).style("font-size", "10px").style("fill", "#bdc3c7");
    });

    // 绘制坐标轴线 (蜘蛛网的骨架)
    const angleSlice = Math.PI * 2 / features.length;
    features.forEach((f, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const lineEnd = [radius * Math.cos(angle), radius * Math.sin(angle)];
        const labelPos = [(radius + 30) * Math.cos(angle), (radius + 30) * Math.sin(angle)];

        svg.append("line")
            .attr("x1", 0).attr("y1", 0).attr("x2", lineEnd[0]).attr("y2", lineEnd[1])
            .style("stroke", "#e0e0e0").style("stroke-width", "1px");

        // 轴标签文字
        svg.append("text")
            .attr("x", labelPos[0]).attr("y", labelPos[1])
            .attr("text-anchor", "middle").attr("dy", "0.35em")
            .style("font-size", "12px").style("font-weight", "bold").style("fill", "#34495e")
            .text(f);
    });

    // 添加图例
    const legend = svg.append("g").attr("transform", `translate(${width/2 - 180}, ${-height/2 + 20})`);
    Object.keys(districtMap).forEach((d, i) => {
        const row = legend.append("g").attr("transform", `translate(0, ${i * 25})`);
        row.append("rect").attr("w", 15).attr("h", 15).attr("fill", districtMap[d].color)
            .attr("width", 15).attr("height", 15).attr("rx", 3);
        row.append("text").attr("x", 25).attr("y", 12).text(districtMap[d].name).style("font-size", "13px");
    });
}

export function updateRadarChart(data) {
    if (!data || data.length === 0) return;

    // --- 数据转换：计算各警区内犯罪的“比例画像” ---
    // 为了公平比较不同警区的“基因”，我们将数量转化为该警区内这6类犯罪的占比 (%)
    const grouped = d3.group(data, d => d.district);
    const radarData = [];

    for (let [dist, records] of grouped) {
        if (!districtMap[dist]) continue;
        const total = d3.sum(records, r => r.count);
        const profile = { name: dist, color: districtMap[dist].color, values: {} };

        features.forEach(f => {
            const record = records.find(r => r.type === f);
            profile.values[f] = record ? (record.count / total) * 100 : 0;
        });
        radarData.push(profile);
    }

    const angleSlice = Math.PI * 2 / features.length;
    const rScale = d3.scaleLinear().range([0, radius]).domain([0, 80]); // Y轴映射到 80%

    // 雷达图路径生成器
    const radarLine = d3.lineRadial()
        .angle((d, i) => i * angleSlice)
        .radius(d => rScale(d.value))
        .curve(d3.curveLinearClosed);

    const t = d3.transition().duration(1200);

    // 绑定数据并绘制多边形
    const polygons = svg.selectAll(".radar-polygon").data(radarData, d => d.name);

    polygons.exit().remove();

    polygons.enter().append("path")
        .attr("class", "radar-polygon")
        .style("fill", d => d.color)
        .style("fill-opacity", 0.1) // 初始全透明
        .style("stroke", d => d.color)
        .style("stroke-width", 2)
        .attr("d", d => {
            // 初始状态：全部从中心点散发
            const initialData = features.map(f => ({axis: f, value: 0}));
            return radarLine(initialData);
        })
        .merge(polygons)
        .on("mouseover", function(event, d) {
            d3.selectAll(".radar-polygon").style("fill-opacity", 0.05).style("stroke-width", 1);
            d3.select(this).style("fill-opacity", 0.5).style("stroke-width", 3);

            // 构建 Tooltip 内容
            let html = `<strong>${districtMap[d.name].name} 画像</strong><br><hr style="margin:5px 0">`;
            features.forEach(f => {
                html += `${f}: <span style="color:${d.color}"><b>${d.values[f].toFixed(1)}%</b></span><br>`;
            });
            tooltip.style("opacity", 1).html(html)
                .style("left", (event.pageX + 20) + "px").style("top", (event.pageY - 50) + "px");
        })
        .on("mouseout", function() {
            d3.selectAll(".radar-polygon").style("fill-opacity", 0.3).style("stroke-width", 2);
            tooltip.style("opacity", 0);
        })
        .transition(t)
        .style("fill-opacity", 0.3)
        .attr("d", d => {
            // 映射到最终真实数据
            const finalData = features.map(f => ({axis: f, value: d.values[f]}));
            return radarLine(finalData);
        });
}