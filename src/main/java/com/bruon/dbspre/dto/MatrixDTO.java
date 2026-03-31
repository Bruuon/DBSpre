package com.bruon.dbspre.dto;

public class MatrixDTO {
    private String type;       // 犯罪类型
    private Integer hour;      // 小时 (0-23)
    private Long count;        // 该类型在该小时的案件数 (决定气泡大小)
    private Double arrestRate; // 该类型在该小时的逮捕率 (决定气泡颜色)

    public MatrixDTO() {}

    public MatrixDTO(String type, Integer hour, Long count, Double arrestRate) {
        this.type = type;
        this.hour = hour;
        this.count = count;
        this.arrestRate = arrestRate;
    }

    // Getter & Setter (请自行使用 IDE 生成)
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getHour() { return hour; }
    public void setHour(Integer hour) { this.hour = hour; }
    public Long getCount() { return count; }
    public void setCount(Long count) { this.count = count; }
    public Double getArrestRate() { return arrestRate; }
    public void setArrestRate(Double arrestRate) { this.arrestRate = arrestRate; }
}