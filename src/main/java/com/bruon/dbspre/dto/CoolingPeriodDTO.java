package com.bruon.dbspre.dto;

public class CoolingPeriodDTO {
    private String district;
    private Double avgMinutes;

    public CoolingPeriodDTO(String district, Double avgMinutes) {
        this.district = district;
        this.avgMinutes = avgMinutes;
    }

    public String getDistrict() { return district; }
    public Double getAvgMinutes() { return avgMinutes; }
}