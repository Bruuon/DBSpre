package com.bruon.dbspre.dto;

public class SchoolCrimeDTO {
    private Long nonSchoolCount;   // 非校园区域犯罪数
    private Long schoolDayCount;   // 校园区域 - 上学时段 (07:00 - 17:00)
    private Long schoolNightCount; // 校园区域 - 放学时段 (17:00 - 次日07:00)

    public SchoolCrimeDTO() {}

    public SchoolCrimeDTO(Long nonSchoolCount, Long schoolDayCount, Long schoolNightCount) {
        this.nonSchoolCount = nonSchoolCount;
        this.schoolDayCount = schoolDayCount;
        this.schoolNightCount = schoolNightCount;
    }

    public Long getNonSchoolCount() { return nonSchoolCount; }
    public void setNonSchoolCount(Long nonSchoolCount) { this.nonSchoolCount = nonSchoolCount; }
    public Long getSchoolDayCount() { return schoolDayCount; }
    public void setSchoolDayCount(Long schoolDayCount) { this.schoolDayCount = schoolDayCount; }
    public Long getSchoolNightCount() { return schoolNightCount; }
    public void setSchoolNightCount(Long schoolNightCount) { this.schoolNightCount = schoolNightCount; }
}