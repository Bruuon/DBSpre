package com.bruon.dbspre.dto;

public class DistrictStructureDTO {
    private String district;
    private String type;
    private Long count;

    public DistrictStructureDTO() {}

    public DistrictStructureDTO(String district, String type, Long count) {
        this.district = district;
        this.type = type;
        this.count = count;
    }

    // Getters and Setters
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getCount() { return count; }
    public void setCount(Long count) { this.count = count; }
}