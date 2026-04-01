package com.bruon.dbspre.dto;

public class EvolutionDTO {
    private Integer year;
    private String type;
    private Long count;

    public EvolutionDTO() {
    }

    public EvolutionDTO(Integer year, String type, Long count) {
        this.year = year; this.type = type; this.count = count;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }
}