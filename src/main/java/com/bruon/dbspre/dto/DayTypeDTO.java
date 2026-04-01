package com.bruon.dbspre.dto;

public class DayTypeDTO {
    private String type;
    private Integer dayOfWeek;
    private Long count;

    public DayTypeDTO(String primaryType, int crimeDay, long totalCount) {
    }

    public DayTypeDTO() {

    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(Integer dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }
}