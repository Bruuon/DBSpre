package com.bruon.dbspre.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api") // 给这个控制器下的所有接口加一个 /api 前缀
public class TestController {

    @GetMapping("/test")
    public Map<String, Object> testConnection() {
        // 我们用 Map 来模拟最终返回给前端的 JSON 数据格式
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "太棒了！后端接口已经成功跑通！");

        // 模拟一点 D3.js 可能会用到的图表数据
        int[] chartData = {150, 230, 180, 290, 100};
        response.put("data", chartData);

        return response; // Spring Web 会自动把这个 Map 转换成标准的 JSON 字符串返回
    }
}
