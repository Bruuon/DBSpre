package com.bruon.dbspre.dao;

import com.bruon.dbspre.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class CrimeDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 获取年度趋势 (支持按类型过滤)
     * @param crimeType 具体犯罪类型，如果为 null 或 "ALL"，则查询总体趋势
     */
    public List<CrimeTrendDTO> getYearlyTrend(String crimeType) {
        // SQL 逻辑：按年份分组统计，并按年份排序，排除没有年份的脏数据
        StringBuilder sql = new StringBuilder("SELECT year, COUNT(*) as total_count FROM crimes WHERE year IS NOT NULL ");
        List<Object> params = new ArrayList<>();

        // 如果前端传来了特定的犯罪类型，动态拼接 WHERE 条件
        if (crimeType != null && !crimeType.trim().isEmpty() && !"ALL".equalsIgnoreCase(crimeType)) {
            sql.append("AND primary_type = ? ");
            params.add(crimeType);
        }

        sql.append("GROUP BY year ORDER BY year ASC");

        return jdbcTemplate.query(sql.toString(), params.toArray(), new RowMapper<CrimeTrendDTO>() {
            @Override
            public CrimeTrendDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
                CrimeTrendDTO dto = new CrimeTrendDTO();
                dto.setYear(rs.getInt("year"));
                dto.setCount(rs.getLong("total_count"));
                return dto;
            }
        });
    }

    /**
     * 分析 2：获取一周七天的犯罪分布 (支持按类型过滤)
     */
    public List<CrimeWeeklyDTO> getWeeklyDistribution(String crimeType) {
        // 替换为使用预计算的 crime_day 字段和索引
        StringBuilder sql = new StringBuilder(
                "SELECT crime_day as day_index, COUNT(*) as total_count " +
                        "FROM crimes WHERE crime_day IS NOT NULL "
        );
        List<Object> params = new ArrayList<>();

        if (crimeType != null && !crimeType.trim().isEmpty() && !"ALL".equalsIgnoreCase(crimeType)) {
            sql.append("AND primary_type = ? ");
            params.add(crimeType);
        }

        sql.append("GROUP BY day_index ORDER BY day_index ASC");

        return jdbcTemplate.query(sql.toString(), params.toArray(), new RowMapper<CrimeWeeklyDTO>() {
            @Override
            public CrimeWeeklyDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
                CrimeWeeklyDTO dto = new CrimeWeeklyDTO();
                dto.setDayOfWeek(rs.getInt("day_index"));
                dto.setCount(rs.getLong("total_count"));
                return dto;
            }
        });
    }

    /**
     * 分析 3：获取一天 24 小时内的犯罪分布 (支持按类型过滤)
     */
    public List<CrimeHourlyDTO> getHourlyDistribution(String crimeType) {
        // 使用预计算的 crime_hour 字段
        StringBuilder sql = new StringBuilder(
                "SELECT crime_hour, COUNT(*) as total_count " +
                        "FROM crimes WHERE crime_hour IS NOT NULL "
        );
        List<Object> params = new ArrayList<>();

        if (crimeType != null && !crimeType.trim().isEmpty() && !"ALL".equalsIgnoreCase(crimeType)) {
            sql.append("AND primary_type = ? ");
            params.add(crimeType);
        }

        sql.append("GROUP BY crime_hour ORDER BY crime_hour ASC");

        return jdbcTemplate.query(sql.toString(), params.toArray(), new RowMapper<CrimeHourlyDTO>() {
            @Override
            public CrimeHourlyDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
                CrimeHourlyDTO dto = new CrimeHourlyDTO();
                dto.setHour(rs.getInt("crime_hour"));
                dto.setCount(rs.getLong("total_count"));
                return dto;
            }
        });
    }
    /**
     * 分析 4：获取芝加哥犯罪空间分布热力图数据 (支持按类型过滤)
     */
    public List<HeatmapDTO> getCrimeHeatmap(String crimeType) {
        // 使用 ROUND(..., 2) 将经纬度划分为 0.01 度的网格 (约 1km x 1km)
        StringBuilder sql = new StringBuilder(
                "SELECT ROUND(longitude, 2) AS lon_grid, ROUND(latitude, 2) AS lat_grid, COUNT(*) as total_count " +
                        "FROM crimes FORCE INDEX (idx_type_lon_lat) WHERE latitude IS NOT NULL AND longitude IS NOT NULL "
        );
        List<Object> params = new ArrayList<>();

        if (crimeType != null && !crimeType.trim().isEmpty() && !"ALL".equalsIgnoreCase(crimeType)) {
            sql.append("AND primary_type = ? ");
            params.add(crimeType);
        }

        sql.append("GROUP BY lon_grid, lat_grid");

        return jdbcTemplate.query(sql.toString(), params.toArray(), new RowMapper<HeatmapDTO>() {
            @Override
            public HeatmapDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
                HeatmapDTO dto = new HeatmapDTO();
                dto.setLonGrid(rs.getDouble("lon_grid"));
                dto.setLatGrid(rs.getDouble("lat_grid"));
                dto.setCount(rs.getLong("total_count"));
                return dto;
            }
        });
    }

    /**
     * 分析 5：不同类型犯罪的逮捕率排名
     */
    public List<ArrestRateDTO> getArrestRateRanking() {
        String sql = "SELECT primary_type, COUNT(*) as total, " +
                "SUM(CASE WHEN arrest = 1 THEN 1 ELSE 0 END) as arrests, " +
                "(SUM(CASE WHEN arrest = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as rate " +
                "FROM crimes GROUP BY primary_type ORDER BY rate DESC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> new ArrestRateDTO(
                rs.getString("primary_type"),
                rs.getLong("total"),
                rs.getLong("arrests"),
                rs.getDouble("rate")
        ));
    }

    /**
     * 分析 6：校园犯罪占比与时段分布
     */
    public SchoolCrimeDTO getSchoolCrimeAnalysis(String crimeType) {
        // 使用 LIKE '%SCHOOL%' 囊括所有类型的学校 (公立、私立、建筑内、操场等)
        // 定义上学时段为 07:00 到 17:00
        StringBuilder sql = new StringBuilder(
                "SELECT " +
                        "SUM(CASE WHEN is_school = 0 THEN 1 ELSE 0 END) as non_school, " +
                        "SUM(CASE WHEN is_school = 1 AND crime_hour BETWEEN 7 AND 17 THEN 1 ELSE 0 END) as school_day, " +
                        "SUM(CASE WHEN is_school = 1 AND (crime_hour < 7 OR crime_hour > 17) THEN 1 ELSE 0 END) as school_night " +
                        "FROM crimes WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (crimeType != null && !crimeType.trim().isEmpty() && !"ALL".equalsIgnoreCase(crimeType)) {
            sql.append("AND primary_type = ?");
            params.add(crimeType);
        }

        return jdbcTemplate.queryForObject(sql.toString(), params.toArray(), (rs, rowNum) -> new SchoolCrimeDTO(
                rs.getLong("non_school"),
                rs.getLong("school_day"),
                rs.getLong("school_night")
        ));
    }

    /**
     * 分析 7：犯罪类型 × 时间段 × 逮捕率 (四维矩阵气泡图)
     */
    public List<MatrixDTO> getCrimeMatrix() {
        String sql = "SELECT primary_type, crime_hour, COUNT(*) as total_count, " +
                "(SUM(CASE WHEN arrest = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as arrest_rate " +
                "FROM crimes " +
                "WHERE crime_hour IS NOT NULL " +
                "GROUP BY primary_type, crime_hour";

        return jdbcTemplate.query(sql, (rs, rowNum) -> new MatrixDTO(
                rs.getString("primary_type"),
                rs.getInt("crime_hour"),
                rs.getLong("total_count"),
                rs.getDouble("arrest_rate")
        ));
    }

    /**
     * 分析 8：典型警区犯罪基因画像 (多维雷达图)
     */
    public List<DistrictProfileDTO> getDistrictRadarProfile() {
        // 将 '01', '11', '18' 改为数据库中实际的 '001', '011', '018'
        String sql = "SELECT district, primary_type, COUNT(*) as total_count " +
                "FROM crimes " +
                "WHERE district IN ('001', '011', '018') " +
                "AND primary_type IN ('THEFT', 'BATTERY', 'NARCOTICS', 'ASSAULT', 'BURGLARY', 'ROBBERY') " +
                "GROUP BY district, primary_type";

        return jdbcTemplate.query(sql, (rs, rowNum) -> new DistrictProfileDTO(
                rs.getString("district"),
                rs.getString("primary_type"),
                rs.getLong("total_count")
        ));
    }
}
