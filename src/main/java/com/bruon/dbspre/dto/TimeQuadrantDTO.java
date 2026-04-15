package com.bruon.dbspre.dto;

public class TimeQuadrantDTO {
    private String type;
    private Long weekdayDay;    // 工作日白天 (6:00-18:00)
    private Long weekdayNight;  // 工作日夜间 (18:00-6:00)
    private Long weekendDay;    // 周末白天
    private Long weekendNight;  // 周末夜间

    public TimeQuadrantDTO() {}

    public TimeQuadrantDTO(String type, Long weekdayDay, Long weekdayNight, Long weekendDay, Long weekendNight) {
        this.type = type;
        this.weekdayDay = weekdayDay;
        this.weekdayNight = weekdayNight;
        this.weekendDay = weekendDay;
        this.weekendNight = weekendNight;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getWeekdayDay() {
        return weekdayDay;
    }

    public void setWeekdayDay(Long weekdayDay) {
        this.weekdayDay = weekdayDay;
    }

    public Long getWeekdayNight() {
        return weekdayNight;
    }

    public void setWeekdayNight(Long weekdayNight) {
        this.weekdayNight = weekdayNight;
    }

    public Long getWeekendDay() {
        return weekendDay;
    }

    public void setWeekendDay(Long weekendDay) {
        this.weekendDay = weekendDay;
    }

    public Long getWeekendNight() {
        return weekendNight;
    }

    public void setWeekendNight(Long weekendNight) {
        this.weekendNight = weekendNight;
    }
}