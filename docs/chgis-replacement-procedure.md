# CHGIS 坐标独立替换流程记录

本文件把云贵、福建和江西试验中验证过的坐标替换流程固定下来，用于后续按一级行政区域分批迁移。它只规定数据迁移和验收，不授予任何外部数据再分发权；每批仍须按 `docs/historical-data.md` 和 `docs/chgis-commercial-license.md` 复核来源许可。

## 适用范围

- 目标是移除项目发布记录对 CHGIS `location` 主张的依赖，不是把 CHGIS 点位移动、舍入或改名为原创坐标。
- 历史行政实体、名称、父链和 1600 年有效性继续由《明史·地理志》及其他历史来源承担。
- 现代坐标来源必须允许项目所需的再分发场景；当前批次使用 Wikidata `P625`，来源记录为 `wikidata-modern-place-coordinates`，许可记录为 CC0 1.0。
- 旧 CHGIS `hvd_*` 编号可留在内部清单用于迁移审计，但不得作为替换记录的 `location` 来源，也不得进入商业发布包。

## 固定替换流程

### 1. 锁定区域清单

从 `docs/chgis-point-inventory.md` 按一级行政区域提取 `placeId`、历史名称、行政类别、父链和 CHGIS 编号。先锁定点位身份，不读取或复制 CHGIS 经纬度；清江县／临江府治等共址关系按一个项目点处理，但保留关联实体数量。

### 2. 独立取得现代候选

为每个 `placeId` 选择一个现代城市、县治或聚落代理，记录现代名称、来源记录编号、WGS 84 经度／纬度、许可和访问日期。候选采集与 CHGIS 坐标隔离，候选锁定后才允许做距离或同名冲突检查。若历史单位改名、撤并、迁治或存在同名候选，先标为 `low`，不得用现代县域连续性掩盖不确定性。

Wikidata 网页检索端点、页面 HTML 和搜索结果页只适合人工浏览，不适合批量读取，不能作为候选批处理入口。候选发现使用官方 Wikidata Action API `wbsearchentities`；批量按名称、行政关系或坐标筛选时使用官方 Wikidata Query Service（SPARQL）；实体属性和 `P625` 使用 `wbgetentities`／`wbgetclaims` 或 Query Service 读取。每次批量查询均记录访问日期、接口、参数或查询语句以及最终采用的 Q ID。

### 3. 建立历史对应链

用《明史·地理志》确认 1600 年的行政身份和父链；对改名或撤并县记录“历史名称 → 现代代理”的理由。例如江西压力测试中的安仁→余江、建昌（南康府）→永修、泸溪→资溪、龙泉（吉安）→遂川、宁州→修水、新昌→宜丰、新城→黎川、兴安→横峰、永宁→宁冈、长宁→寻乌。

### 4. 冻结候选表

候选表至少包含：`placeId`、历史名称、现代代理、来源 ID、坐标、`locationAccuracy`、`confidence`、对应理由和待复核事项。候选表冻结后才写入对应区域的 `data/places/<region>.json`；更换候选必须留下审计说明。`data/project.json` 由 `data/manifest.json` 自动汇总，不直接编辑。

### 5. 写入数据契约

每个替换记录保持以下结构：

- `locationAccuracy: "approximate"`；
- `locationMethod: "Modern historical-city proxy independently located from Wikidata Q..., guided by the Ming History geographic description; exact old administrative compound remains unresolved"`（将 `Q...` 换成实际来源 ID）；
- `confidence` 与证据强度一致；
- 保留历史来源的 `existence` 主张，删除 CHGIS `location` 主张；
- 增加现代空间来源的 `location` 主张、许可可审计的来源编号和现代代理说明；
- `P625` 坐标按官方接口返回的 JSON `datavalue.value.longitude`／`latitude` 原值写入，始终经度在前、纬度在后；不得把网页表格或地图的显示值、两位小数格式化值、平均值或四舍五入值写入。若接口同时返回 `precision`，将其作为独立的来源属性审计，不把小数位数等同于历史定位精度；
- `audit.reviewedOn` 记录替换日期，`audit.revisionNote` 说明替换原因和未解析事项。

### 6. 运行批次验收

至少运行以下检查：

```text
cargo run -p data-validator -- assemble data/manifest.json
cargo run -p data-validator -- data/manifest.json
cargo test -p data-validator
git diff --check
```

并用独立脚本核对：批次数量、每个点有经纬度和现代来源、坐标在 WGS 84 范围内、目标区域没有 CHGIS `location` 主张、共址实体数量未意外改变、低可信清单与候选表一致。

对批量候选至少抽样复读一次官方 API 或 Query Service，用 Q ID 对照原始 `P625` 数值；发现存储值只有两位小数、取自网页显示值或与原始数值不一致时，批次不得通过。

### 7. 更新审计与商业隔离文件

验收通过后，同步更新 `docs/chgis-point-inventory.md` 的统计、区域状态、特殊映射和清单标记。本流程不修改 CHGIS 授权申请书、授权邮件或其他许可沟通材料；只有单独任务明确要求时才维护这些材料。商业构建只允许发布已完成区域，目标区域仍有 CHGIS `location` 主张时必须失败。

## 江西压力测试记录（2026-07-16）

- 范围：江西 64 个点位，含 1 个清江县／临江府治共址项目点（关联 2 个历史实体）。
- 结果：64/64 点使用 `wikidata-modern-place-coordinates`；`approximate` 64 点，`medium` 54 点，`low` 10 点。
- 独立性：江西 64 点均无 CHGIS `location` 主张；历史来源的 `existence` 主张和 1600 年行政父链保留。
- 低可信原因：历史改名、撤并、迁治或同名消歧；详见 `docs/chgis-point-inventory.md` 的江西验收段落和对应清单行。
- 验收结果：`data-validator` 通过，单元测试 2/2 通过，`git diff --check` 通过；江西可作为独立来源商业发布压力测试区。

## 回滚与复核

- 候选表冻结后发现映射错误：只替换对应 `placeId`，保留审计记录，不批量改动其他区域。
- 批次验收失败：该区域不得进入商业发布包；先修复数据或撤回本批，再重新运行完整验收。
- 已提交的批次使用版本控制的反向提交回滚；未提交的批次保留工作树差异，禁止用不可追踪的覆盖脚本抹掉审计线索。
