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

    /**
     * 分析 9：工作日 vs 周末犯罪热力矩阵 (复用现有复合索引)
     */
    public List<DayTypeDTO> getDayTypeMatrix() {
        // 1 代表周日，7 代表周六
        String sql = "SELECT primary_type, crime_day, COUNT(*) as total_count " +
                "FROM crimes " +
                "GROUP BY primary_type, crime_day";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            DayTypeDTO dto = new DayTypeDTO();
            dto.setType(rs.getString("primary_type"));
            dto.setDayOfWeek(rs.getInt("crime_day"));
            dto.setCount(rs.getLong("total_count"));
            return dto;
        });
    }

    /**
     * 分析 10：宏观犯罪生态演变河流图 (复用 idx_type_year)
     */
    public List<EvolutionDTO> getCrimeEvolutionStream() {
        String sql = "SELECT year, primary_type, COUNT(*) as total_count " +
                "FROM crimes " +
                "WHERE year IS NOT NULL " +
                "AND primary_type IN ('THEFT', 'BATTERY', 'NARCOTICS', 'ASSAULT', 'BURGLARY', 'ROBBERY') " +
                "GROUP BY year, primary_type " +
                "ORDER BY year ASC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> new EvolutionDTO(
                rs.getInt("year"),
                rs.getString("primary_type"),
                rs.getLong("total_count")
        ));
    }

    /**
     * 分析 11：三大户外/交通场景犯罪结构对比 (复用单列索引)
     */
    public List<LocationCrimeDTO> getLocationCrimeComparison() {
        String sql = "SELECT location_description, primary_type, COUNT(*) as total_count " +
                "FROM crimes " +
                "WHERE location_description IN ('STREET', 'PARKING LOT/GARAGE(NON.RESID.)', 'CTA TRAIN') " +
                "AND primary_type IN ('THEFT', 'BATTERY', 'CRIMINAL DAMAGE', 'ASSAULT', 'ROBBERY') " +
                "GROUP BY location_description, primary_type";

        return jdbcTemplate.query(sql, (rs, rowNum) -> new LocationCrimeDTO(
                rs.getString("location_description"),
                rs.getString("primary_type"),
                rs.getLong("total_count")
        ));
    }

    /**
     * 分析 12：重罪 vs 轻罪结构对比 (复用 primary_type 索引)
     */
    public List<SeverityDTO> getSeverityStructure() {
        String sql = "SELECT " +
                "  CASE " +
                "    WHEN primary_type IN ('HOMICIDE', 'CRIM SEXUAL ASSAULT', 'ROBBERY', 'BURGLARY', 'ARSON', 'KIDNAPPING', 'WEAPONS VIOLATION') THEN '重罪 (Felony)' " +
                "    ELSE '轻罪/违规 (Misdemeanor/Other)' " +
                "  END AS severity_label, " +
                "  COUNT(*) as total_count " +
                "FROM crimes " +
                "GROUP BY severity_label";

        return jdbcTemplate.query(sql, (rs, rowNum) -> new SeverityDTO(
                rs.getString("severity_label"),
                rs.getLong("total_count")
        ));
    }

    /**
     * 分析 13：犯罪“冷却期” - 字符串兼容版
     * 性能提示：由于无法利用 date_str 的索引排序，此查询在千万级数据下约耗时 3-5 秒。
     */
    public List<CoolingPeriodDTO> getAllDistrictsCoolingPeriod(String crimeType) {
        // 逻辑：利用 DATETIME 原生排序，性能提升 10 倍以上
        String sql = "SELECT district, AVG(diff_mins) as avg_period FROM (" +
                "  SELECT district, TIMESTAMPDIFF(MINUTE, " +
                "    LAG(crime_date) OVER (PARTITION BY district ORDER BY crime_date), " +
                "    crime_date) as diff_mins " +
                "  FROM crimes " +
                "  WHERE primary_type = ?" +
                ") t WHERE diff_mins IS NOT NULL AND diff_mins < 1440 " +
                "GROUP BY district " +
                "ORDER BY avg_period ASC";

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                        new CoolingPeriodDTO(rs.getString("district"), rs.getDouble("avg_period")),
                crimeType);
    }

    public List<ArrestGapDTO> getArrestHourGap(String crimeType) {
        StringBuilder sql = new StringBuilder(
                "SELECT crime_hour, " +
                        "SUM(CASE WHEN arrest = 1 THEN 1 ELSE 0 END) as arrested, " +
                        "SUM(CASE WHEN arrest = 0 THEN 1 ELSE 0 END) as non_arrested " +
                        "FROM crimes FORCE INDEX (idx_type_hour_arrest) " +
                        "WHERE crime_hour IS NOT NULL "
        );
        List<Object> params = new ArrayList<>();

        if (crimeType != null && !"ALL".equalsIgnoreCase(crimeType)) {
            sql.append("AND primary_type = ? ");
            params.add(crimeType);
        }

        sql.append("GROUP BY crime_hour ORDER BY crime_hour ASC");

        return jdbcTemplate.query(sql.toString(), params.toArray(), (rs, rowNum) -> new ArrestGapDTO(
                rs.getInt("crime_hour"),
                rs.getLong("arrested"),
                rs.getLong("non_arrested")
        ));
    }

    public List<DistrictStructureDTO> getDistrictStructure() {
        // 选取主要的犯罪类型进行对比，避免长尾数据干扰
        String sql = "SELECT district, primary_type, COUNT(*) as total_count " +
                "FROM crimes FORCE INDEX (idx_district) " +
                "WHERE district IN ('001', '006', '007', '008', '011', '018') " + // 选取代表性警区
                "AND primary_type IN ('THEFT', 'BATTERY', 'CRIMINAL DAMAGE', 'NARCOTICS', 'ASSAULT', 'BURGLARY', 'ROBBERY', 'DECEPTIVE PRACTICE') " +
                "GROUP BY district, primary_type";

        return jdbcTemplate.query(sql, (rs, rowNum) -> new DistrictStructureDTO(
                rs.getString("district"),
                rs.getString("primary_type"),
                rs.getLong("total_count")
        ));
    }

    public List<LocationRiskDTO> getLocationRiskProfile() {
        String sql = "SELECT location_description, primary_type, COUNT(*) as total_count " +
                "FROM crimes FORCE INDEX (idx_location) " +
                "WHERE location_description IN ('STREET', 'RESIDENCE', 'APARTMENT', 'SIDEWALK', 'PARKING LOT') " +
                "AND primary_type IN ('THEFT', 'BATTERY', 'CRIMINAL DAMAGE', 'NARCOTICS', 'ASSAULT') " +
                "GROUP BY location_description, primary_type";

        return jdbcTemplate.query(sql, (rs, rowNum) -> new LocationRiskDTO(
                rs.getString("location_description"),
                rs.getString("primary_type"),
                rs.getLong("total_count")
        ));
    }

    public List<TimeQuadrantDTO> getTimeQuadrantAnalysis(String crimeType) {
        StringBuilder sql = new StringBuilder(
                "SELECT primary_type, " +
                        "SUM(CASE WHEN crime_day BETWEEN 2 AND 6 AND crime_hour BETWEEN 6 AND 17 THEN 1 ELSE 0 END) as wd_day, " +
                        "SUM(CASE WHEN crime_day BETWEEN 2 AND 6 AND (crime_hour >= 18 OR crime_hour < 6) THEN 1 ELSE 0 END) as wd_night, " +
                        "SUM(CASE WHEN (crime_day = 1 OR crime_day = 7) AND crime_hour BETWEEN 6 AND 17 THEN 1 ELSE 0 END) as we_day, " +
                        "SUM(CASE WHEN (crime_day = 1 OR crime_day = 7) AND (crime_hour >= 18 OR crime_hour < 6) THEN 1 ELSE 0 END) as we_night " +
                        "FROM crimes WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (crimeType != null && !"ALL".equalsIgnoreCase(crimeType)) {
            sql.append("AND primary_type = ? ");
            params.add(crimeType);
        }
        sql.append("GROUP BY primary_type");

        return jdbcTemplate.query(sql.toString(), params.toArray(), (rs, rowNum) -> {
            TimeQuadrantDTO dto = new TimeQuadrantDTO();
            dto.setType(rs.getString("primary_type"));
            dto.setWeekdayDay(rs.getLong("wd_day"));
            dto.setWeekdayNight(rs.getLong("wd_night"));
            dto.setWeekendDay(rs.getLong("we_day"));
            dto.setWeekendNight(rs.getLong("we_night"));
            return dto;
        });
    }
}
