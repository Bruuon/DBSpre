package com.bruon.dbspre.dto;

public class CrimeWeeklyDTO {
    private Integer dayOfWeek; // 1代表周日，2代表周一 ... 7代表周六 (MySQL 标准)
    private Long count;

    public CrimeWeeklyDTO() {}

    public CrimeWeeklyDTO(Integer dayOfWeek, Long count) {
        this.dayOfWeek = dayOfWeek;
        this.count = count;
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