package com.bruon.dbspre.dto;

public class CrimeHourlyDTO {
    private Integer hour;
    private Long count;

    public CrimeHourlyDTO() {}

    public CrimeHourlyDTO(Integer hour, Long count) {
        this.hour = hour;
        this.count = count;
    }

    public Integer getHour() {
        return hour;
    }

    public void setHour(Integer hour) {
        this.hour = hour;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }
}