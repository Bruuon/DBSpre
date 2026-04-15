package com.bruon.dbspre.dto;

public class LocationCrimeDTO {
    private String location;
    private String type;
    private Long count;

    public LocationCrimeDTO() {}

    public LocationCrimeDTO(String location, String type, Long count) {
        this.location = location;
        this.type = type;
        this.count = count;
    }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getCount() { return count; }
    public void setCount(Long count) { this.count = count; }
}