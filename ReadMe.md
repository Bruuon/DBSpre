# 芝加哥犯罪数据交互式可视化分析平台 
本项目是《数据库应用实践》课程的实战项目。基于芝加哥市超 700 万条真实犯罪历史记录，构建了一个高性能的前后端分离的Web应用，旨在通过多维度的交互式数据可视化，揭示城市犯罪的时空演变规律。

## 🛠 技术栈

本项目采用经典且高效的企业级前后端分离架构，并在数据库层面进行了深度性能优化，以支撑海量数据的毫秒级响应。

### 后端 
* **核心框架：** Java + Spring Boot (原生轻量，无过度封装)
* **数据访问：** Spring JDBC Template (直接执行高度优化的原生 SQL)
* **架构模式：** 标准三层架构 (Controller接口层 -> DAO数据访问层 -> DTO数据传输模型)
* **API 风格：** RESTful API，统一返回标准化 JSON 数据格式。

### 数据库 
* **核心引擎：** MySQL (部署于 CentOS 7 独立服务器/虚拟机)
* **性能优化：**
    * 针对千万级表，摒弃前端全量拉取的降智方案，采用**数据库底层聚合 (GROUP BY)** 策略。
    * 构建**预计算字段**（如提取星期 `crime_day` 和小时 `crime_hour`），避免查询时进行昂贵的字符串截取和函数运算。
    * 建立精确的**单列及复合索引**，将全表扫描的 $O(N)$ 复杂度降维至 $O(\log N)$，实现多维交叉查询的毫秒级响应。

### 前端
* **基础框架：** HTML5 + CSS3 + Vanilla JavaScript (原生 JS，零框架依赖)
* **模块化：** 采用最新的 ES6 Modules (`import/export`) 规范进行高度组件化解耦。
* **数据可视化：** **D3.js (v7)**。利用其强大的数据驱动 DOM 和丝滑的 Transition 过渡动画，实现基于 SVG 的高级动态图表交互。

---

## 📁 项目目录结构 

项目严格遵循后端 MVC 与前端模块化的工程规范：

```text
DBSPre/
├── src/main/java/com/bruon/dbspre/
│   ├── controller/             # 【接口控制层】
│   │   ├── AnalysisController.java  # 核心业务路由，接收前端参数并分发查询
│   │   └── TestController.java      # 系统健康与联通性测试接口
│   ├── dao/                    # 【数据访问层】
│   │   └── CrimeDAO.java            # 集中管理所有复杂 SQL 查询及结果集映射
│   ├── dto/                    # 【数据传输对象】
│   │   ├── CrimeTrendDTO.java       # 年度趋势数据模型
│   │   └── CrimeWeeklyDTO.java      # 周分布数据模型 (及其他维度模型)
│   └── DbsPreApplication.java  # Spring Boot 项目主启动类
│
├── src/main/resources/
│   ├── application.properties  # 核心配置文件 (数据库连接凭证、端口等)
│   └── static/                 # 【前端静态资源目录】 (由内置 Tomcat 托管)
│       ├── css/
│       │   └── styles.css           # 全局样式与组件排版
│       ├── js/
│       │   ├── charts/              # 【可视化图表组件库】(基于 D3.js)
│       │   │   ├── trendChart.js    # 年度趋势折线图模块 (含进场及更新动画)
│       │   │   └── weeklyChart.js   # 一周分布柱状图模块 (动态数据绑定)
│       │   ├── api.js               # 网络层：统一封装 fetch 请求与异常处理
│       │   └── app.js               # 视图控制器：全局状态管理与模块调度总控
│       └── index.html               # 唯一主页面 (SPA单页应用入口)
│
└── pom.xml                     # Maven 依赖管理文件 (引入 Spring Web, JDBC, MySQL Driver)