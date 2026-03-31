package com.bruon.dbspre.controller;

import com.bruon.dbspre.dto.CrimeTrendDTO;
import com.bruon.dbspre.dao.CrimeDAO;
import com.bruon.dbspre.dto.CrimeWeeklyDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {
    @Autowired
    private CrimeDAO crimeDAO;

    /**
     * 接口 1：获取年度犯罪趋势数据
     * 访问路径示例：
     * 总体：GET /api/analysis/trend
     * 特定类型：GET /api/analysis/trend?type=THEFT
     */
    @GetMapping("/trend")
    public Map<String, Object> getYearlyTrend(
            @RequestParam(value = "type", required = false, defaultValue = "ALL") String type) {

        Map<String, Object> response = new HashMap<>();

        try {
            List<CrimeTrendDTO> data = crimeDAO.getYearlyTrend(type);
            response.put("status", "success");
            response.put("message", "数据获取成功");
            response.put("data", data);
            response.put("currentType", type); // 把当前查询的类型也返回给前端备用
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "数据查询失败：" + e.getMessage());
        }

        return response;
    }

    /**
     * 接口 2：获取一周犯罪分布数据
     * 访问路径示例：GET /api/analysis/weekly?type=THEFT
     */
    @GetMapping("/weekly")
    public Map<String, Object> getWeeklyDistribution(
            @RequestParam(value = "type", required = false, defaultValue = "ALL") String type) {

        Map<String, Object> response = new HashMap<>();
        try {
            List<CrimeWeeklyDTO> data = crimeDAO.getWeeklyDistribution(type);
            response.put("status", "success");
            response.put("data", data);
            response.put("currentType", type);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "数据查询失败：" + e.getMessage());
        }
        return response;
    }
}
