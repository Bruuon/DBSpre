package com.bruon.dbspre.dto;

public class LocationRiskDTO {
    private String location;
    private String type;
    private Long count;

    public LocationRiskDTO() {}

    public LocationRiskDTO(String location, String type, Long count) {
        this.location = location;
        this.type = type;
        this.count = count;
    }

    // Getters and Setters
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getCount() { return count; }
    public void setCount(Long count) { this.count = count; }
}