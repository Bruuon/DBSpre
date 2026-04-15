package com.bruon.dbspre.dto;

public class SeverityDTO {
    private String severity;
    private Long count;

    public SeverityDTO() {}

    public SeverityDTO(String severity, Long count) {
        this.severity = severity;
        this.count = count;
    }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public Long getCount() { return count; }
    public void setCount(Long count) { this.count = count; }
}