# 📊 MySQL 查询性能优化报告

---
注意注意：前两个场景放ppt上展示一下优化前后速度对比（直接截图渲染过的md文档就行），第三个场景不用展示了，跟前两个一起写进报告书“遇到的困难”这一部分。

### 🔍1. 场景一：按年份统计犯罪总数
    SELECT year, COUNT(*) as total_count 
    FROM crimes 
    WHERE year IS NOT NULL 
    GROUP BY year 
    ORDER BY year ASC;

优化前：全表扫描 (Full Table Scan)

| year | total_count |
| :--- | :--- |
| 2001 | 485878 |
| 2002 | 486802 |
| 2003 | 475979 |
| ...  | ...    |

23 rows in set **(23.59 sec)**

优化动作：
创建单列索引 `idx_year`：

    CREATE INDEX idx_year ON crimes(year);

优化后：索引覆盖 (Index Scan)

23 rows in set **(2.14 sec)**

---

### 🔍 2. 场景二：特定犯罪类型的年度统计
    SELECT year, COUNT(*) as total_count 
    FROM crimes 
    WHERE year IS NOT NULL AND primary_type = 'THEFT'
    GROUP BY year 
    ORDER BY year ASC;

优化前：

| year | total_count |
| :--- | :--- |
| 2001 | 99277 |
| 2002 | 98331 |
| 2003 | 98876 |
| ...  | ...   |


23 rows in set **(26.27 sec)**


优化动作：
创建复合索引（联合索引）`idx_type_year`，利用最左匹配原则加速过滤与分组：

    CREATE INDEX idx_type_year ON crimes(primary_type, year);

优化后：
23 rows in set **(0.78 sec)**

---

### 🔍 2. 场景三：联合索引需求引入

**遇到的问题：**
在按特定犯罪类型过滤并进行时间分组时（如 `WHERE primary_type = 'THEFT' GROUP BY year`），如果没有合适的索引，MySQL 只能全表扫描。即使只有类型的单列索引，MySQL 查出特定类型的记录后，依然必须“回表”去硬盘里读取对应的时间字段，并被迫在内存中建立临时表来进行重新排序和分组，产生了极大的性能损耗（触发耗时的 `Using temporary; Using filesort`）。

**解决的动作：**
基于“多字段过滤+分组”的需求，创建了联合索引 `(primary_type, year)`。

**解决的效果：**
联合索引强行规定了底层数据的物理排序规则：先按 `primary_type` 归类，在同一个类型内部，再按 `year` 排序。
查询时，数据库一瞬间跳到 `THEFT` 类型区域，由于里面的 `year` 已经天然按顺序排好了，MySQL 连临时表都不用建，也不用回表查数据，直接顺着索引数数（COUNT）即可出结果。这就叫“索引覆盖”，成功将耗时从 26 秒暴力压缩到了 0.78 秒。