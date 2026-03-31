package com.bruon.dbspre.dto;

public class HeatmapDTO {
    private Double lonGrid; // 经度网格
    private Double latGrid; // 纬度网格
    private Long count;     // 该网格内的犯罪数量

    public HeatmapDTO() {}

    public HeatmapDTO(Double lonGrid, Double latGrid, Long count) {
        this.lonGrid = lonGrid;
        this.latGrid = latGrid;
        this.count = count;
    }

    public Double getLonGrid() { return lonGrid; }
    public void setLonGrid(Double lonGrid) { this.lonGrid = lonGrid; }
    public Double getLatGrid() { return latGrid; }
    public void setLatGrid(Double latGrid) { this.latGrid = latGrid; }
    public Long getCount() { return count; }
    public void setCount(Long count) { this.count = count; }
}