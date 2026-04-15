package com.bruon.dbspre.dto;

public class ArrestGapDTO {
    private Integer hour;
    private Long arrestedCount;
    private Long nonArrestedCount;

    public ArrestGapDTO() {}

    public ArrestGapDTO(Integer hour, Long arrestedCount, Long nonArrestedCount) {
        this.hour = hour;
        this.arrestedCount = arrestedCount;
        this.nonArrestedCount = nonArrestedCount;
    }

    // Getters and Setters
    public Integer getHour() { return hour; }
    public void setHour(Integer hour) { this.hour = hour; }
    public Long getArrestedCount() { return arrestedCount; }
    public void setArrestedCount(Long arrestedCount) { this.arrestedCount = arrestedCount; }
    public Long getNonArrestedCount() { return nonArrestedCount; }
    public void setNonArrestedCount(Long nonArrestedCount) { this.nonArrestedCount = nonArrestedCount; }
}