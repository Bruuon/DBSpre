package com.bruon.dbspre.dao;

import com.bruon.dbspre.dto.CrimeTrendDTO;
import com.bruon.dbspre.dto.CrimeWeeklyDTO;
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
}
