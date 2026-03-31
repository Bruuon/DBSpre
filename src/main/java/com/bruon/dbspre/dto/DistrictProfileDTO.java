package com.bruon.dbspre.dto;

public class DistrictProfileDTO {
    private String district;
    private String type;
    private Long count;

    public DistrictProfileDTO() {}

    public DistrictProfileDTO(String district, String type, Long count) {
        this.district = district;
        this.type = type;
        this.count = count;
    }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getCount() { return count; }
    public void setCount(Long count) { this.count = count; }
}