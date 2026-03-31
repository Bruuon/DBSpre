package com.bruon.dbspre.dto;

public class ArrestRateDTO {
    private String type;      // 犯罪类型
    private Long totalCases;  // 总案件数
    private Long arrestCount; // 逮捕数
    private Double arrestRate; // 逮捕率 (百分比)

    public ArrestRateDTO() {}

    public ArrestRateDTO(String type, Long totalCases, Long arrestCount, Double arrestRate) {
        this.type = type;
        this.totalCases = totalCases;
        this.arrestCount = arrestCount;
        this.arrestRate = arrestRate;
    }

    // Getter 和 Setter (略，请自行生成)
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getTotalCases() { return totalCases; }
    public void setTotalCases(Long totalCases) { this.totalCases = totalCases; }
    public Long getArrestCount() { return arrestCount; }
    public void setArrestCount(Long arrestCount) { this.arrestCount = arrestCount; }
    public Double getArrestRate() { return arrestRate; }
    public void setArrestRate(Double arrestRate) { this.arrestRate = arrestRate; }
}