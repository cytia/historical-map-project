# CHGIS 点位使用清单与独立替换方案

本文件是当前数据的静态审计快照，用于 CHGIS 授权沟通、商业发布隔离和独立替换排期，不构成法律意见。明细表保留已替换点位的原 CHGIS 编号，供内部迁移审计回查。固定替换操作见 [CHGIS 坐标独立替换流程记录](chgis-replacement-procedure.md)。

- 统计日期：2026-07-18
- 数据清单：[`data/manifest.json`](../data/manifest.json)；正式数据保存在 manifest 指向的各个分片中。
- CHGIS 来源 ID：`chgis-temporal-gazetteer`
- 坐标参考系：WGS 84，经度在前
- 清单不重复收录经纬度；每条记录通过 `placeId` 回查原始数据，避免产生第二份易失同步的受限坐标副本。

## 统计口径

项目共有 1,641 个地点记录。云贵试点前，实际采用 CHGIS 坐标的地点为 1,147 个，占全部地点 69.9%；其中 `jiangxi-jian-yongfeng-seat` 明确记录 CHGIS 在 1600 年无命中并保留现代代理，因此不计入该基线。完成云贵 14 点、福建 47 点、江西压力测试 64 点及原无命中例外 1 点、广东 73 点（分两批）、广西 82 点（分两批）、浙江 72 点（分两批）、湖广 107 点（三批）、四川 90 点（三批）、陕西 73 点（分两批）、山西 88 点（分两批）、河南 97 点（三批）、山东 104 点（三批）、南京 115 点（三批）和京师 121 点（三批）替换后，按本清单口径当前仍由 CHGIS `location` 主张承担坐标的地点为 **0 个，占全部地点 0%**。

迁移前基线涉及 1,139 个唯一 CHGIS `hvd_*` 编号和 1,125 组唯一坐标；当前未迁移记录涉及 **0 个唯一编号**和 **0 组唯一坐标**。迁移前有 21 组坐标由多个地点记录共用，共涉及 43 个地点；4 个地点同时引用多个 CHGIS 编号；12 个 CHGIS 编号被多个项目地点记录复用。

当前未迁移记录的定位精度和可信度统计均为 0；所有纳入基线的区域已完成独立替换。

“地点记录数”“唯一 CHGIS 编号数”和“唯一坐标数”不可互换；附郭、共治或项目实体拆分会造成同一 CHGIS 编号或坐标关联多个地点。

## 按行政层级汇总

| 类别 | 点位数 | 建议用途 |
|---|---:|---|
| 一级行政区域治所 | 0 | |
| 府与直隶州治所 | 0 | |
| 府属州与县治 | 0 | |
| 特殊治理／军事节点 | 0 | 单独研究与复核 |
| 合计 | 0 | |

分类采用互斥判定顺序：一级行政区域 → 府与直隶州 → 特殊治理／军事 → 府属州与县。该顺序只用于避免重复统计，不代表实际替换批次；一个地点与多个行政实体共址时只计一次。

## 按一级行政区域汇总

| 一级行政区域 | 点位数 |
|---|---:|
| 京师 | 0 |
| 南京 | 0 |
| 山东 | 0 |
| 河南 | 0 |
| 山西 | 0 |
| 陕西 | 0 |
| 四川 | 0 |
| 湖广 | 0 |
| 浙江 | 0 |
| 江西 | 0 |
| 福建 | 0 |
| 广东 | 0 |
| 广西 | 0 |
| 云南 | 0 |
| 贵州 | 0 |
| 合计 | 0 |

## 独立替换原则

每个替换点必须建立两条彼此可审计的证据链：

1. 历史身份链：以《明史·地理志》及必要的地方志、历史地名辞典或专题研究确认名称、隶属、迁治和现代聚落对应关系。
2. 现代空间链：从允许商业使用且坐标参考系明确的现代地名源独立取得候选城市或聚落坐标，记录来源编号、访问日期和原始坐标。

候选现代空间来源按官方许可页逐项登记：

- [Wikidata 结构化数据](https://www.wikidata.org/wiki/Wikidata:Licensing)：CC0。
- [GeoNames](https://www.geonames.org/export/)：CC BY 4.0，允许商业使用，坐标为 WGS 84。
- [Getty TGN](https://www.getty.edu/research/tools/vocabularies/obtain/download.html)：ODC-By 1.0，仅作为补充交叉验证；其坐标按官方说明只用于定位查找。

不得默认采用高德、百度等存在坐标偏移或再利用条款风险的在线地图坐标。

候选坐标必须在不查看或复制 CHGIS 坐标的独立流程中取得并锁定，之后才允许计算与旧点的距离用于发现同名误配、迁治或录入错误。距离接近不能证明独立来源，距离较远也不能自动证明候选错误。

不得通过移动、舍入、截断、平均、变换或删除来源标签把 CHGIS 点改称原创。CHGIS 旧记录和修订关系保留在内部审计历史中，但不进入商业发布包。

## 建议记录方式

普通现代城市或聚落代理建议使用：

> Modern historical-city proxy independently located from `[source and record ID]`, guided by the Ming History geographic description; exact old administrative compound remains unresolved.

- `locationAccuracy`：默认 `approximate`。
- `confidence`：现代聚落连续、无竞争候选且史料描述吻合时为 `medium`；只有区域对应、存在迁治疑问或多个候选时为 `low`。
- `sources`：现代空间来源承担坐标定位主张；《明史》及其他史料承担历史身份和对应判断。
- `audit`：记录候选锁定日期、人工判断、与旧记录的关系及仍未解决的问题。

该英文说明不能脱离具体的现代空间来源单独使用；《明史》通常不直接提供现代 WGS 84 坐标。

## 实施顺序

替换以一级行政区域为批次，不把全国同一行政等级拆成横跨所有地区的大批任务。每个区域独立完成候选采集、历史对应、人工复核、数据校验和商业发布资格验收；这样可以在全国替换完成前形成范围清楚的商业安全区域。

1. **云贵流程试验：14 点。** 云南 9 点、贵州 5 点，全部为 `approximate` 点；普通连续聚落为中可信，县域代理、迁治旧治和御夷府州代理为低可信。样本包含普通府治、军民府、御夷府州、旧治和铜仁府多 CHGIS 编号，可用于验证独立候选锁定、史料对应、审计保留和商业过滤的完整流程。
2. **福建普通州县验证：47 点（已完成）。** 福建具有较完整的普通府州县结构，并包含同名消歧和 CHGIS 父标签与《明史》父链不一致的记录，用于补足云贵样本缺少普通县治、附郭共址和密集父链的局限。
3. **江西压力测试：64 点及原无命中例外 1 点（已完成）。** 覆盖清江府县共址、普通县治、改名县、撤并县和同名消歧；原无命中例外永丰县也已改由独立 Wikidata 坐标承担 `location` 主张，江西不再由 CHGIS 承担 `location` 主张。
4. **其余区域分批替换。** 默认按当前点位数量由少到多安排：浙江 72（已完成）→ 陕西 73（已完成，两批）→ 山西 88（已完成，两批）→ 四川 90（已完成）→ 河南 97（三批，已完成）→ 山东 104（三批，已完成）→ 湖广 107（三批，已完成）→ 南京 115（三批，已完成）→ 京师 121（三批，已完成）；广西 82 点已完成。
5. 点位数量不是唯一依据；对外演示、爱发电说明或众筹宣传涉及的区域可以提前，但必须保持该区域完整验收，不能只替换截图范围内的少数点。
6. 区域内先处理一级行政区域及府、直隶州治所，再处理府属州、县和特殊治理节点；特殊节点不能以普通现代城市代理掩盖制度和驻地不确定性。
7. 商业构建必须拒绝目标发布区域中任何仍以 CHGIS 或其他非商业、授权不明来源承担定位主张的记录。

### 云贵试验验收

- 14 个候选坐标均由明确的商业兼容现代来源独立取得，并记录来源编号、许可、访问日期和原始坐标。
- 每个点均有《明史》或其他历史材料支持的地点对应判断；候选坐标在查看 CHGIS 坐标前已经锁定。
- 云州旧治、孟定御夷府、威远御夷州、镇康御夷州及铜仁府多编号情形具有单独人工说明。
- 云南、贵州商业发布记录不再由 CHGIS 承担任何 `location` 主张；旧 CHGIS 编号只保留在内部审计历史中。
- 云贵两区的数据结构、来源引用、坐标范围和商业发布资格校验通过。
- 本轮结果：14/14 点完成独立来源替换；云贵两区残留 CHGIS `location` 主张为 0；无法独立定位比例为 0/14，需第二来源复核的低可信点为 6/14。
- 单点平均处理时间尚未在本轮记录，后续区域批次开始时补充计时。

### 福建试验验收

- 47/47 点已由 `wikidata-modern-place-coordinates` 独立取得现代代理坐标；全部为 `approximate`，其中 `medium` 44 点、`low` 3 点。
- 福建商业发布记录不再由 CHGIS 承担任何 `location` 主张；旧 CHGIS 编号只保留在本内部清单中供迁移审计回查。
- 归化→明溪、宁洋→双洋、永福→永泰等改名或撤县情形采用低可信并保留未解析说明；南安使用丰州镇、漳浦使用绥安镇等历史县治区域代理。
- 福建 47 点的数据结构、来源引用、坐标范围和商业发布资格校验已通过；福建区域可作为当前独立来源商业发布试验区。

### 江西压力测试验收

- 65/65 点已由 `wikidata-modern-place-coordinates` 独立取得现代代理坐标；全部为 `approximate`，其中 `medium` 54 点、`low` 11 点。
- 江西商业发布记录不再由 CHGIS 承担任何 `location` 主张；旧 CHGIS 编号只保留在本内部清单中供迁移审计回查。
- 清江县／临江府治共址继续作为一个项目点保留，并以樟树市现代代理承载两个历史实体；建昌（南康府）→永修、安仁→余江、泸溪→资溪、龙泉（吉安）→遂川、宁州→修水、新昌→宜丰、新城→黎川、兴安→横峰、永宁→宁冈、长宁→寻乌等改名或撤并情形列为低可信，等待第二来源复核。
- 原无命中例外 `jiangxi-jian-yongfeng-seat` 使用 Wikidata `Q1356822` 的现代永丰县代理；与同一现代县域的另一历史 `placeId` 共用代理，但未合并历史行政实体。
- 江西压力测试覆盖普通县治、府县共址、改名县、撤并县和同名消歧；数据结构、来源引用、坐标范围和商业发布资格校验均已通过。
- 本轮结果：65/65 点完成独立来源替换；江西残留 CHGIS `location` 主张为 0；无法独立定位比例为 0/65；低可信点为 11/65。

### 京师替换验收

- 120/121 点由 `wikidata-modern-place-coordinates` 独立取得现代代理坐标，`baoding-county-seat` 已改用 OpenStreetMap 的文安县新镇二村近似代理；全部为 `approximate`，其中 `medium` 107 点、`low` 14 点。
- 按 `data/places/jingshi.json` 文件顺序分三批完成：第一批 41 点（`hejian-seat` 至 `yizhou-baoding-seat`），第二批 40 点（`laishui-seat` 至 `luancheng-seat`），第三批 40 点（`wuji-seat` 至 `leting-seat`）；京师 121 个目标点均不再由 CHGIS `location` 主张承担坐标。
- 保安州→涿鹿县、东安县→廊坊市、保定县→文安县新镇、新城县→高碑店新城镇、庆都县→望都县、完县→顺平县、束鹿县→辛集市、安州／新安县→安新县及安新镇、交河县→泊头市交河镇、兴济县→兴济镇、唐山县／隆平县→隆尧县、开州→濮阳市等历史沿革或现代代理未完全闭合的 14 条记录保留低可信说明。
- 大名府／大名县共用大名镇代理，唐山县／隆平县共用隆尧县代理，魏县的两个历史父链记录共用魏县代理；各历史 `placeId` 和关联实体数量均保留，未合并行政实体。
- 120 个 Wikidata 候选保留官方 API 返回的原始 `P625` 数值；保定县记录改用 OpenStreetMap 新镇二村节点作为现代聚落代理。各记录的来源主张、可信度和审计日期均写入京师数据分片。
- 三批数据结构、来源引用、WGS 84 坐标范围、京师目标无 CHGIS `location` 主张和旧编号审计保留检查通过；`data-validator` 与单元测试通过。旧 CHGIS 编号只保留在本清单中供迁移审计回查。

### 南京替换验收

- 115/115 点已由 `wikidata-modern-place-coordinates` 独立取得现代代理坐标；全部为 `approximate`，其中 `medium` 105 点、`low` 10 点。
- 按 `data/places/nanjing.json` 文件顺序分三批完成：第一批 39 点（`nanjing-city` 至 `sizhou-seat`），第二批 38 点（`suzhou-fengyang-seat` 至 `lujiang-seat`），第三批 38 点（`chao-seat` 至 `jianping-seat`）；南京 115 个目标点均不再由 CHGIS `location` 主张承担坐标。
- 临淮、虹、清河、安东、桃源、石埭、建德、东流、太平和建平等 10 条记录因改名、撤并、旧治或现代代理对应未完全闭合保留低可信；其余 105 条为中可信现代代理。
- 当涂府／当涂县、徽州府／歙县、池州府／贵池县、庐州府／合肥县、泗州／虹县、宁国府／宣城县、苏州府／吴县／长洲县、凤阳府／凤阳县、松江府／华亭县、淮安府／山阳县和建德／东流等共享现代代理时，保留各自历史 `placeId` 与来源主张，不解释为明代行政复合体的精确复原。
- 所有候选均保留官方 Wikidata API 返回的原始 `P625` 数值，经度在前；103 个唯一 Q ID、来源主张、可信度和审计日期已写入南京数据分片，历史来源统一保留为 `existence`。
- 三批数据结构、来源引用、WGS 84 坐标范围、南京目标无 CHGIS `location` 主张和旧编号审计保留检查通过；`data-validator` 与单元测试通过。旧 CHGIS 编号只保留在本清单中供迁移审计回查。

### 广东替换验收

- 73/73 点已由 `wikidata-modern-place-coordinates` 独立取得现代代理坐标；全部为 `approximate`，其中 `medium` 53 点、`low` 20 点。
- 按两批完成：第一批 37 点（清单 979–1015），第二批 36 点（清单 1016–1051）；广东 73 个目标点均不再由 CHGIS `location` 主张承担坐标。
- 电白县保留 Wikidata 现代电白区代理语义；因原始代表点在本项目自然参考层中落入海域，展示坐标向北移约 1.7 km 至陆地内侧，并在项目数据审计中记录该视觉校正。
- 安定、昌化、程乡、东安、封川、感恩、会同、开建、乐会、钦州、石城、万州、西宁、香山、新安、新宁、崖州、永安、长乐和长宁等改名、撤并、迁治或区域代理情形标为低可信，待后续第二来源复核。
- 数据结构、来源引用、坐标范围和商业发布资格校验通过；Wikidata `P625` 实体编号保留在对应区域数据分片的现代空间来源记录中。

### 广西替换验收

- 82/82 点已由 `wikidata-modern-place-coordinates` 独立取得现代代理坐标；全部为 `approximate`，其中 `medium` 65 点、`low` 17 点。
- 按两批完成：第一批 41 点（清单 1052–1092），第二批 41 点（清单 1093–1133）；广西 82 个目标点均不再由 CHGIS `location` 主张承担坐标。
- 对原 38 条低可信坐标逐条复核，其中 21 条因历史治所与现代乡镇代理可以闭合而升为中可信；仍保留低可信的 17 条为州域、跨县域、迁治未闭合或缺少独立乡镇坐标的代理：思陵、奉议、归德、河池、怀远、结安、都结、罗阳、茗盈、那地、思城、思明、陀陵、万承、镇远、忠、左。
- 提升后的记录保留官方 Wikidata API／Query Service 返回的原始 `P625` 数值，不使用网页显示值或两位小数格式化值；其余记录不因同属一个县域而强行升为中可信。
- 大新、扶绥、宁明、天等、江州等现代区域被多个历史记录共享代理时，保留各自历史身份，不将共享现代代理解释为旧行政复合体的精确复原。
- 两批数据结构、来源引用、WGS 84 坐标范围、广西目标无 CHGIS `location` 主张和旧编号审计保留检查均通过；旧 CHGIS 编号只保留在本清单中供迁移审计回查。

### 浙江替换验收

- 72/72 点已由 `wikidata-modern-place-coordinates` 独立取得现代代理坐标；全部为 `approximate`，其中 `medium` 70 点、`low` 2 点。
- 按两批完成：第一批 36 点（清单 796–831），第二批 36 点（清单 832–867）；浙江 72 个目标点均不再由 CHGIS `location` 主张承担坐标。
- 崇德、分水、海宁、建德、慈溪、孝丰、新城、武康、汤溪、于潜等记录采用独立 Wikidata 现代聚落代理；归安／乌程共享湖州代理，嘉兴／秀水共享嘉兴代理。
- 遂安使用淳安现代区域代理并标为低可信，因历史县城已淹没且现代对应未闭合；宣平使用武义现代区域代理并标为低可信，因历史县已撤并且确切治所仍待复核。
- 所有候选均保留官方 Wikidata API 返回的原始 `P625` 数值，经度在前；Q ID、来源主张、精度、可信度和审计日期已写入对应区域数据分片。
- 浙江批次的数据结构、来源引用、坐标范围、共享代理和目标区域无 CHGIS `location` 主张检查通过；`data-validator` 与单元测试通过。旧 CHGIS 编号只保留在本清单中供迁移审计回查。

### 湖广替换验收

- 107/107 点已由 `wikidata-modern-place-coordinates` 独立取得现代代理坐标；全部为 `approximate`，其中 `medium` 87 点、`low` 20 点。
- 按三批完成：第一批 36 点（清单 689–724），第二批 36 点（清单 725–760），第三批 35 点（清单 761–795）；湖广 107 个目标点均不再由 CHGIS `location` 主张承担坐标。
- 普通县治优先采用当前县、市或自治县代理；光化→老河口、广济→武穴、景陵→天门、龙阳→汉寿、蒲圻→赤壁、蕲水→浠水、应山→广水、永明→江永等改名或行政沿革项保留低可信说明。
- 桂阳州与桂阳县共享现代桂阳县代理但保持两个历史 `placeId`；均标为低可信，避免将同名历史实体合并。
- 均州使用丹江口市区域代理并标为低可信；归州、沅州、黔阳、上津等旧治或州县对应保留未解析说明。
- 所有候选均保留官方 Wikidata `P625` 原始数值，经度在前；Q ID、来源主张、精度、可信度和审计日期已写入对应区域数据分片。湖广批次唯一 Q ID 为 106 个，其中 1 个现代代理由两个历史点共享。
- 三批的数据结构、来源引用、WGS 84 坐标范围、湖广目标无 CHGIS `location` 主张和旧编号审计保留检查均通过；`data-validator` 与单元测试通过。旧 CHGIS 编号只保留在本清单中供迁移审计回查。

### 四川替换验收

- 90/90 点已由 `wikidata-modern-place-coordinates` 独立取得现代代理坐标；全部为 `approximate`，其中 `medium` 87 点、`low` 3 点。
- 按三批完成：第一批 30 点（清单 599–628），第二批 30 点（629–658），第三批 30 点（659–688）；四川 90 个目标点均不再由 CHGIS `location` 主张承担坐标。
- 所有候选均保留官方 Wikidata `P625` 原始数值，经度在前；汶川的原始精度 `0.016666666666667` 度已写入来源备注。
- 定远、石泉、太平长官司保留低可信说明：分别采用武胜县域、北川县曲山镇和兴文县域代理；太平长官司所指现代大坝镇坐标尚未独立匹配。
- 新宁按现开江县／新宁区域代理，永宁宣抚司按叙永镇代理，均保留“现代代理”语义，不解释为明代行政复合体精确复原。
- 三批数据结构、来源引用、WGS 84 坐标范围、四川目标无 CHGIS `location` 主张和旧编号审计保留检查均通过；`data-validator` 与单元测试通过。行政单位基线未被修改。

### 陕西替换验收

- 73/73 点已由 `wikidata-modern-place-coordinates` 独立取得现代代理坐标；全部为 `approximate`，其中 `medium` 61 点、`low` 12 点。
- 按两批完成：第一批 37 点（清单 526–562），第二批 36 点（清单 563–598）；陕西 73 个目标点均不再由 CHGIS `location` 主张承担坐标。
- 狄道、灵州、庆阳安化、兴安州、延安安定、褒城、延安保安、伏羌、金、宁远、三水和中部等 12 条记录因改名、迁治、撤并或现代聚落代理对应未完全闭合保留低可信。
- 所有候选均保留官方 Wikidata `P625` 原始数值，经度在前；73 个现代代理 Q ID 均有对应的来源主张、访问日期和审计记录。
- 陕西批次的数据结构、来源引用、WGS 84 坐标范围、目标无 CHGIS `location` 主张和旧编号审计保留检查通过；`data-validator`、单元测试与 `git diff --check` 均通过。旧 CHGIS 编号只保留在本清单中供迁移审计回查。

### 山西替换验收

- 88/88 点已由 `wikidata-modern-place-coordinates` 独立取得现代代理坐标；全部为 `approximate`，其中 `medium` 74 点、`low` 14 点。
- 按两批完成：第一批 44 点（清单 438–481），第二批 44 点（清单 482–525）；山西 88 个目标点均不再由 CHGIS `location` 主张承担坐标。
- 88 条记录使用 82 个 Wikidata Q ID；阳曲、大同、汾阳、临汾、长治及清源／徐沟保留 6 组共享现代代理，并保留对应历史实体数量。
- 广昌、崞、乐平、临晋、马邑、宁乡、清源、太平、万泉、蔚州、猗氏、永宁、岳阳、赵城等 14 条记录因改名、撤并、跨区域或共享代理对应未完全闭合保留低可信。
- 所有候选均保留官方 Wikidata `P625` 原始数值，经度在前；Q ID、来源主张、可信度和审计日期已写入山西数据分片。
- 山西批次的数据结构、来源引用、WGS 84 坐标范围、目标无 CHGIS `location` 主张和旧编号审计保留检查通过；`data-validator`、单元测试与 `git diff --check` 均通过。旧 CHGIS 编号只保留在本清单中供迁移审计回查。

### 河南替换验收

- 97/97 点已由 `wikidata-modern-place-coordinates` 独立取得现代代理坐标；全部为 `approximate`，其中 `medium` 84 点、`low` 13 点。
- 按三批完成：第一批 33 点（清单 341–373），第二批 32 点（清单 374–405），第三批 32 点（清单 406–437）；河南 97 个目标点均不再由 CHGIS `location` 主张承担坐标。
- 97 个点使用 92 个 Wikidata Q ID；灵宝／阌乡、兰考／仪封、荥阳／河阴／荥泽、卫辉／胙城等共享现代代理仍保留各自历史 `placeId`，不解释为明代行政复合体的精确复原。
- 河阴、考城、兰阳、密、汜水、唐、洧川、阌乡、荥泽、阳武、仪封、永宁和胙城等 13 条记录因改名、撤并、古县治或现代代理对应未完全闭合保留低可信，等待第二来源复核。
- 所有候选均保留官方 Wikidata API／Query Service 返回的原始 `P625` 数值，经度在前；Q ID、来源主张、可信度和审计日期已写入河南数据分片。
- 三批数据结构、来源引用、WGS 84 坐标范围、河南目标无 CHGIS `location` 主张和旧编号审计保留检查通过；旧 CHGIS 编号只保留在本清单中供迁移审计回查。

### 山东替换验收

- 104/104 点已由 `wikidata-modern-place-coordinates` 独立取得现代代理坐标；全部为 `approximate`，其中 `medium` 75 点、`low` 29 点。
- 按 `data/places/shandong.json` 文件顺序分三批完成：第一批 35 点、第二批 35 点、第三批 34 点；山东 104 个目标点均不再由 CHGIS `location` 主张承担坐标。
- 104 个点使用 101 个 Wikidata Q ID；长山、齐东与邹平共用邹平现代代理，青城与高苑共用高城镇现代代理，均保留各自历史 `placeId`，不解释为明代行政复合体的精确复原。
- 恩县、濮州、观城、朝城、黄县、宁海等因迁治、改名、撤并或古县治与现代代理对应未完全闭合保留低可信；这些判断与候选 Q ID、原始 `P625` 数值、来源主张和审计日期已写入山东数据分片。
- 三批数据结构、来源引用、WGS 84 坐标范围、山东目标无 CHGIS `location` 主张和旧编号审计保留检查通过；`data-validator`、单元测试与 `git diff --check` 均通过。旧 CHGIS 编号只保留在本清单中供迁移审计回查。

首轮锁定的现代代理如下（坐标来自 Wikidata `P625`，均按 WGS 84 经度在前记录）：

| `placeId` | 现代代理 | Wikidata | 经度 | 纬度 | 可信度 |
|---|---|---|---:|---:|---|
| `jingdong-prefectural-seat` | 景东自治县县域代理 | `Q1152904` | 100.83771 | 24.45150 | low |
| `heqing-prefectural-seat` | 云鹤镇 | `Q10881374` | 100.17135 | 26.56320 | medium |
| `menghua-prefectural-seat` | 南诏镇 | `Q10909007` | 100.30788 | 25.24040 | medium |
| `shunning-prefectural-seat` | 凤山镇 | `Q10896254` | 99.92364 | 24.58777 | medium |
| `mengding-seat` | 孟定镇 | `Q10945102` | 99.08169 | 23.55677 | low |
| `yunzhou-old-seat` | 爱华镇（旧治区域代理） | `Q14266432` | 100.12731 | 24.45139 | low |
| `weiyuan-yunnan-seat` | 威远镇 | `Q10943772` | 100.71184 | 23.48420 | low |
| `zhenkang-seat` | 凤尾镇 | `Q10896227` | 99.02162 | 23.88692 | low |
| `guangyi-seat` | 田园镇 | `Q14247137` | 99.61589 | 24.82901 | low |
| `duyun-prefectural-seat` | 都匀市 | `Q1207027` | 107.51430 | 26.26717 | medium |
| `liping-prefectural-seat` | 德凤街道 | `Q11071516` | 109.13133 | 26.23598 | medium |
| `sinan-prefectural-seat` | 思唐街道 | `Q11072564` | 108.25094 | 27.94254 | medium |
| `sizhou-prefectural-seat` | 思旸镇 | `Q11072583` | 108.74626 | 27.21158 | medium |
| `tongren-prefectural-seat` | 碧江区 | `Q1130793` | 109.18333 | 27.71667 | medium |

## 单点验收标准

- 具有明确的现代空间来源、记录编号、许可、访问日期和 WGS 84 坐标。
- 具有《明史》或其他历史材料支持的地点对应判断。
- 候选坐标在与 CHGIS 比对前已经独立锁定。
- 定位方法、精度、可信度和未解决问题与证据强度一致。
- 迁治、同名异地、附郭共址和特殊治理情形经过人工复核。
- 商业发布记录不再引用 CHGIS 承担定位主张，内部审计仍可追溯旧记录。
- 数据结构、来源引用、坐标范围和商业发布资格校验通过。

## 元数据异常

| placeId | 当前情况 | 建议 |
|---|---|---|
| `jiangxi-jian-yongfeng-seat` | 原无命中例外已使用 Wikidata `Q1356822` 的现代永丰县代理，原始 `P625` 为 `115.5, 27.316666666667`，精度约 `0.016666666666667` 度。 | 已纳入独立替换统计；旧 CHGIS 编号仅保留在本清单中供内部审计回查。 |

## 完整点位清单

以下清单按一级行政区域、行政层级分类和行政单位名称排序。除已标注“已独立替换（云贵试点）”的 14 条、“已独立替换（福建试验）”的 47 条、“已独立替换（江西压力测试）”的 64 条、“已独立替换（江西无命中例外）”的 1 条、“已独立替换（广东两批）”的 73 条、“已独立替换（广西两批）”的 82 条、“已独立替换（浙江两批）”的 72 条、“已独立替换（四川三批）”的 90 条、“已独立替换（山西两批）”的 88 条、“已独立替换（河南三批）”的 97 条、“已独立替换（山东三批）”的 104 条、“已独立替换（京师三批）”的 121 条和“已独立替换（南京三批）”的 115 条记录外，其余记录均已完成独立替换。

| # | 一级区域 | 类别 | 行政单位 | 等级 | placeId | CHGIS 编号 | 精度／可信度 | 标记 |
|---:|---|---|---|---|---|---|---|---|
| 1 | 京师 | 府与直隶州治所 | 保安州 | department | `baoan-seat` | `hvd_88275` | `approximate`／`low` | 低可信；已独立替换（京师三批） |
| 2 | 京师 | 府与直隶州治所 | 大名府／元城县 | prefecture／county | `daming-seat` | `hvd_87779` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（京师三批） |
| 3 | 京师 | 府与直隶州治所 | 广平府／永年县 | prefecture／county | `yongnian-seat` | `hvd_44826` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（京师三批） |
| 4 | 京师 | 府与直隶州治所 | 河间府／河间县 | prefecture／county | `hejian-seat` | `hvd_87998` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（京师三批） |
| 5 | 京师 | 府与直隶州治所 | 顺德府／邢台县 | prefecture／county | `xingtai-seat` | `hvd_44893` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（京师三批） |
| 6 | 京师 | 府与直隶州治所 | 永平府／卢龙县 | prefecture／county | `lulong-seat` | `hvd_88307` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（京师三批） |
| 7 | 京师 | 府与直隶州治所 | 真定府／真定县 | prefecture／county | `zhending-seat` | `hvd_88396` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（京师三批） |
| 8 | 京师 | 府属州与县治 | 安平县 | county | `anping-seat` | `hvd_44891` | `approximate`／`medium` | 已独立替换（京师三批） |
| 9 | 京师 | 府属州与县治 | 安肃县 | county | `ansu-seat` | `hvd_44750` | `approximate`／`medium` | 已独立替换（京师三批） |
| 10 | 京师 | 府属州与县治 | 安州 | department | `anzhou-baoding-seat` | `hvd_87745` | `approximate`／`low` | 低可信；已独立替换（京师三批） |
| 11 | 京师 | 府属州与县治 | 霸州 | department | `bazhou-seat` | `hvd_88200` | `approximate`／`medium` | 已独立替换（京师三批） |
| 12 | 京师 | 府属州与县治 | 柏乡县 | county | `baixiang-seat` | `hvd_44951` | `approximate`／`medium` | 已独立替换（京师三批） |
| 13 | 京师 | 府属州与县治 | 宝坻县 | county | `baodi-seat` | `hvd_88197` | `approximate`／`medium` | 已独立替换（京师三批） |
| 14 | 京师 | 府属州与县治 | 保定县 | county | `baoding-county-seat` | `hvd_88205` | `approximate`／`low` | 低可信；已改为文安县新镇二村近似代理 |
| 15 | 京师 | 府属州与县治 | 博野县 | county | `boye-seat` | `hvd_44753` | `approximate`／`medium` | 已独立替换（京师三批） |
| 16 | 京师 | 府属州与县治 | 沧州 | department | `cangzhou-seat` | `hvd_88239` | `approximate`／`medium` | 已独立替换（京师三批） |
| 17 | 京师 | 府属州与县治 | 昌黎县 | county | `changli-seat` | `hvd_88310` | `approximate`／`medium` | 已独立替换（京师三批） |
| 18 | 京师 | 府属州与县治 | 成安县 | county | `chengan-seat` | `hvd_44844` | `approximate`／`medium` | 已独立替换（京师三批） |
| 19 | 京师 | 府属州与县治 | 大城县 | county | `dacheng-seat` | `hvd_88203` | `approximate`／`medium` | 已独立替换（京师三批） |
| 20 | 京师 | 府属州与县治 | 大名县 | county | `daming-county-seat` | `hvd_45009` | `approximate`／`medium` | 已独立替换（京师三批） |
| 21 | 京师 | 府属州与县治 | 定兴县 | county | `dingxing-seat` | `hvd_87673` | `approximate`／`medium` | 已独立替换（京师三批） |
| 22 | 京师 | 府属州与县治 | 定州 | department | `dingzhou-zhending-seat` | `hvd_87865` | `approximate`／`medium` | 已独立替换（京师三批） |
| 23 | 京师 | 府属州与县治 | 东安县 | county | `dongan-shuntian-seat` | `hvd_88211` | `approximate`／`low` | 低可信；已独立替换（京师三批） |
| 24 | 京师 | 府属州与县治 | 东光县 | county | `dongguang-seat` | `hvd_44878` | `approximate`／`medium` | 已独立替换（京师三批） |
| 25 | 京师 | 府属州与县治 | 东明县 | county | `dongming-seat` | `hvd_44815` | `approximate`／`medium` | 已独立替换（京师三批） |
| 26 | 京师 | 府属州与县治 | 肥乡县 | county | `feixiang-seat` | `hvd_44836` | `approximate`／`medium` | 已独立替换（京师三批） |
| 27 | 京师 | 府属州与县治 | 丰润县 | county | `fengrun-seat` | `hvd_88318` | `approximate`／`medium` | 已独立替换（京师三批） |
| 28 | 京师 | 府属州与县治 | 抚宁县 | county | `funing-yongping-seat` | `hvd_88309` | `approximate`／`medium` | 已独立替换（京师三批） |
| 29 | 京师 | 府属州与县治 | 阜城县 | county | `fucheng-hejian-seat` | `hvd_44865` | `approximate`／`medium` | 已独立替换（京师三批） |
| 30 | 京师 | 府属州与县治 | 阜平县 | county | `fuping-zhending-seat` | `hvd_44977` | `approximate`／`medium` | 已独立替换（京师三批） |
| 31 | 京师 | 府属州与县治 | 高阳县 | county | `gaoyang-seat` | `hvd_44789` | `approximate`／`medium` | 已独立替换（京师三批） |
| 32 | 京师 | 府属州与县治 | 高邑县 | county | `gaoyi-seat` | `hvd_88352` | `approximate`／`medium` | 已独立替换（京师三批） |
| 33 | 京师 | 府属州与县治 | 藁城县 | county | `gaocheng-seat` | `hvd_45007` | `approximate`／`medium` | 已独立替换（京师三批） |
| 34 | 京师 | 府属州与县治 | 固安县 | county | `guan-seat` | `hvd_88207` | `approximate`／`medium` | 已独立替换（京师三批） |
| 35 | 京师 | 府属州与县治 | 故城县 | county | `gucheng-hejian-seat` | `hvd_44876` | `approximate`／`medium` | 已独立替换（京师三批） |
| 36 | 京师 | 府属州与县治 | 广平县 | county | `guangping-county-seat` | `hvd_87922` | `approximate`／`medium` | 已独立替换（京师三批） |
| 37 | 京师 | 府属州与县治 | 广宗县 | county | `guangzong-seat` | `hvd_44904` | `approximate`／`medium` | 已独立替换（京师三批） |
| 38 | 京师 | 府属州与县治 | 邯郸县 | county | `handan-seat` | `hvd_44847` | `approximate`／`medium` | 已独立替换（京师三批） |
| 39 | 京师 | 府属州与县治 | 衡水县 | county | `hengshui-seat` | `hvd_44886` | `approximate`／`medium` | 已独立替换（京师三批） |
| 40 | 京师 | 府属州与县治 | 滑县 | county | `hua-daming-seat` | `hvd_82322` | `approximate`／`medium` | 已独立替换（京师三批） |
| 41 | 京师 | 府属州与县治 | 获鹿县 | county | `huolu-seat` | `hvd_44972` | `approximate`／`medium` | 已独立替换（京师三批） |
| 42 | 京师 | 府属州与县治 | 鸡泽县 | county | `jize-seat` | `hvd_44842` | `approximate`／`medium` | 已独立替换（京师三批） |
| 43 | 京师 | 府属州与县治 | 蓟州 | department | `jizhou-seat` | `hvd_88212` | `approximate`／`medium` | 已独立替换（京师三批） |
| 44 | 京师 | 府属州与县治 | 冀州 | department | `jizhou-zhending-seat` | `hvd_88072` | `approximate`／`medium` | 已独立替换（京师三批） |
| 45 | 京师 | 府属州与县治 | 交河县 | county | `jiaohe-seat` | `hvd_44874` | `approximate`／`low` | 低可信；已独立替换（京师三批） |
| 46 | 京师 | 府属州与县治 | 晋州 | department | `jinzhou-zhending-seat` | `hvd_88403` | `approximate`／`medium` | 已独立替换（京师三批） |
| 47 | 京师 | 府属州与县治 | 井陉县 | county | `jingxing-seat` | `hvd_44975` | `approximate`／`medium` | 已独立替换（京师三批） |
| 48 | 京师 | 府属州与县治 | 景州 | department | `jingzhou-hejian-seat` | `hvd_88043` | `approximate`／`medium` | 已独立替换（京师三批） |
| 49 | 京师 | 府属州与县治 | 静海县 | county | `jinghai-seat` | `hvd_44923` | `approximate`／`medium` | 已独立替换（京师三批） |
| 50 | 京师 | 府属州与县治 | 钜鹿县 | county | `julu-seat` | `hvd_44906` | `approximate`／`medium` | 已独立替换（京师三批） |
| 51 | 京师 | 府属州与县治 | 浚县 | county | `jun-seat` | `hvd_82319` | `approximate`／`medium` | 已独立替换（京师三批） |
| 52 | 京师 | 府属州与县治 | 开州 | department | `kaizhou-seat` | `hvd_87833` | `approximate`／`low` | 低可信；已独立替换（京师三批） |
| 53 | 京师 | 府属州与县治 | 涞水县 | county | `laishui-seat` | `hvd_44943` | `approximate`／`medium` | 已独立替换（京师三批） |
| 54 | 京师 | 府属州与县治 | 乐亭县 | county | `leting-seat` | `hvd_88311` | `approximate`／`medium` | 已独立替换（京师三批） |
| 55 | 京师 | 府属州与县治 | 蠡县 | county | `li-seat` | `hvd_44774` | `approximate`／`medium` | 已独立替换（京师三批） |
| 56 | 京师 | 府属州与县治 | 临城县 | county | `lincheng-seat` | `hvd_44961` | `approximate`／`medium` | 已独立替换（京师三批） |
| 57 | 京师 | 府属州与县治 | 灵寿县 | county | `lingshou-seat` | `hvd_44986` | `approximate`／`medium` | 已独立替换（京师三批） |
| 58 | 京师 | 府属州与县治 | 隆平县 | county | `longping-seat` | `hvd_44959` | `approximate`／`low` | 低可信；已独立替换（京师三批） |
| 59 | 京师 | 府属州与县治 | 栾城县 | county | `luancheng-seat` | `hvd_44981` | `approximate`／`medium` | 已独立替换（京师三批） |
| 60 | 京师 | 府属州与县治 | 滦州 | department | `luanzhou-seat` | `hvd_88312` | `approximate`／`medium` | 已独立替换（京师三批） |
| 61 | 京师 | 府属州与县治 | 满城县 | county | `mancheng-seat` | `hvd_44747` | `approximate`／`medium` | 已独立替换（京师三批） |
| 62 | 京师 | 府属州与县治 | 南宫县 | county | `nangong-seat` | `hvd_44880` | `approximate`／`medium` | 已独立替换（京师三批） |
| 63 | 京师 | 府属州与县治 | 南和县 | county | `nanhe-seat` | `hvd_44899` | `approximate`／`medium` | 已独立替换（京师三批） |
| 64 | 京师 | 府属州与县治 | 南乐县 | county | `nanle-seat` | `hvd_87808` | `approximate`／`medium` | 已独立替换（京师三批） |
| 65 | 京师 | 府属州与县治 | 南皮县 | county | `nanpi-seat` | `hvd_88244` | `approximate`／`medium` | 已独立替换（京师三批） |
| 66 | 京师 | 府属州与县治 | 内黄县 | county | `neihuang-seat` | `hvd_82246` | `approximate`／`medium` | 已独立替换（京师三批） |
| 67 | 京师 | 府属州与县治 | 内丘县 | county | `neiqiu-seat` | `hvd_88173` | `approximate`／`medium` | 已独立替换（京师三批） |
| 68 | 京师 | 府属州与县治 | 宁津县 | county | `ningjin-hejian-seat` | `hvd_88036` | `approximate`／`medium` | 已独立替换（京师三批） |
| 69 | 京师 | 府属州与县治 | 宁晋县 | county | `ningjin-zhending-seat` | `hvd_44963` | `approximate`／`medium` | 已独立替换（京师三批） |
| 70 | 京师 | 府属州与县治 | 平山县 | county | `pingshan-zhending-seat` | `hvd_44988` | `approximate`／`medium` | 已独立替换（京师三批） |
| 71 | 京师 | 府属州与县治 | 平乡县 | county | `pingxiang-shunde-seat` | `hvd_44901` | `approximate`／`medium` | 已独立替换（京师三批） |
| 72 | 京师 | 府属州与县治 | 祁州 | department | `qizhou-baoding-seat` | `hvd_87725` | `approximate`／`medium` | 已独立替换（京师三批） |
| 73 | 京师 | 府属州与县治 | 迁安县 | county | `qianan-seat` | `hvd_88308` | `approximate`／`medium` | 已独立替换（京师三批） |
| 74 | 京师 | 府属州与县治 | 青县 | county | `qing-hejian-seat` | `hvd_44918` | `approximate`／`medium` | 已独立替换（京师三批） |
| 75 | 京师 | 府属州与县治 | 清丰县 | county | `qingfeng-seat` | `hvd_44811` | `approximate`／`medium` | 已独立替换（京师三批） |
| 76 | 京师 | 府属州与县治 | 清河县 | county | `qinghe-guangping-seat` | `hvd_44850` | `approximate`／`medium` | 已独立替换（京师三批） |
| 77 | 京师 | 府属州与县治 | 庆都县 | county | `qingdu-seat` | `hvd_44765` | `approximate`／`low` | 低可信；已独立替换（京师三批） |
| 78 | 京师 | 府属州与县治 | 庆云县 | county | `qingyun-seat` | `hvd_44934` | `approximate`／`medium` | 已独立替换（京师三批） |
| 79 | 京师 | 府属州与县治 | 曲阳县 | county | `quyang-seat` | `hvd_44822` | `approximate`／`medium` | 已独立替换（京师三批） |
| 80 | 京师 | 府属州与县治 | 曲周县 | county | `quzhou-guangping-seat` | `hvd_44835` | `approximate`／`medium` | 已独立替换（京师三批） |
| 81 | 京师 | 府属州与县治 | 饶阳县 | county | `raoyang-seat` | `hvd_44890` | `approximate`／`medium` | 已独立替换（京师三批） |
| 82 | 京师 | 府属州与县治 | 任丘县 | county | `renqiu-seat` | `hvd_44868` | `approximate`／`medium` | 已独立替换（京师三批） |
| 83 | 京师 | 府属州与县治 | 任县 | county | `ren-shunde-seat` | `hvd_44913` | `approximate`／`medium` | 已独立替换（京师三批） |
| 84 | 京师 | 府属州与县治 | 容城县 | county | `rongcheng-seat` | `hvd_44795` | `approximate`／`medium` | 已独立替换（京师三批） |
| 85 | 京师 | 府属州与县治 | 三河县 | county | `sanhe-seat` | `hvd_88195` | `approximate`／`medium` | 已独立替换（京师三批） |
| 86 | 京师 | 府属州与县治 | 沙河县 | county | `shahe-shunde-seat` | `hvd_44898` | `approximate`／`medium` | 已独立替换（京师三批） |
| 87 | 京师 | 府属州与县治 | 深泽县 | county | `shenze-seat` | `hvd_44825` | `approximate`／`medium` | 已独立替换（京师三批） |
| 88 | 京师 | 府属州与县治 | 深州 | department | `shenzhou-seat` | `hvd_88111` | `approximate`／`medium` | 已独立替换（京师三批） |
| 89 | 京师 | 府属州与县治 | 束鹿县 | county | `shulu-seat` | `hvd_87732` | `approximate`／`low` | 低可信；已独立替换（京师三批） |
| 90 | 京师 | 府属州与县治 | 肃宁县 | county | `suning-seat` | `hvd_44866` | `approximate`／`medium` | 已独立替换（京师三批） |
| 91 | 京师 | 府属州与县治 | 唐山县 | county | `tangshan-shunde-seat` | `hvd_44909` | `approximate`／`low` | 低可信；已独立替换（京师三批） |
| 92 | 京师 | 府属州与县治 | 唐县 | county | `tang-baoding-seat` | `hvd_44762` | `approximate`／`medium` | 已独立替换（京师三批） |
| 93 | 京师 | 府属州与县治 | 完县 | county | `wan-baoding-seat` | `hvd_44773` | `approximate`／`low` | 低可信；已独立替换（京师三批） |
| 94 | 京师 | 府属州与县治 | 威县 | county | `wei-guangping-seat` | `hvd_44853` | `approximate`／`medium` | 已独立替换（京师三批） |
| 95 | 京师 | 府属州与县治 | 魏县 | county | `wei-daming-seat` | `hvd_44796` | `approximate`／`medium` | 已独立替换（京师三批） |
| 96 | 京师 | 府属州与县治 | 文安县 | county | `wenan-seat` | `hvd_88202` | `approximate`／`medium` | 已独立替换（京师三批） |
| 97 | 京师 | 府属州与县治 | 无极县 | county | `wuji-seat` | `hvd_45002` | `approximate`／`medium` | 已独立替换（京师三批） |
| 98 | 京师 | 府属州与县治 | 吴桥县 | county | `wuqiao-seat` | `hvd_88049` | `approximate`／`medium` | 已独立替换（京师三批） |
| 99 | 京师 | 府属州与县治 | 武强县 | county | `wuqiang-seat` | `hvd_44888` | `approximate`／`medium` | 已独立替换（京师三批） |
| 100 | 京师 | 府属州与县治 | 武清县 | county | `wuqing-seat` | `hvd_88196` | `approximate`／`medium` | 已独立替换（京师三批） |
| 101 | 京师 | 府属州与县治 | 武邑县 | county | `wuyi-seat` | `hvd_44885` | `approximate`／`medium` | 已独立替换（京师三批） |
| 102 | 京师 | 府属州与县治 | 献县 | county | `xian-seat` | `hvd_44861` | `approximate`／`medium` | 已独立替换（京师三批） |
| 103 | 京师 | 府属州与县治 | 香河县 | county | `xianghe-seat` | `hvd_88199` | `approximate`／`medium` | 已独立替换（京师三批） |
| 104 | 京师 | 府属州与县治 | 新安县 | county | `xinan-anzhou-seat` | `hvd_44786` | `approximate`／`low` | 低可信；已独立替换（京师三批） |
| 105 | 京师 | 府属州与县治 | 新城县 | county | `xincheng-baoding-seat` | `hvd_44755` | `approximate`／`low` | 低可信；已独立替换（京师三批） |
| 106 | 京师 | 府属州与县治 | 新河县 | county | `xinhe-zhending-seat` | `hvd_44883` | `approximate`／`medium` | 已独立替换（京师三批） |
| 107 | 京师 | 府属州与县治 | 新乐县 | county | `xinle-seat` | `hvd_45008` | `approximate`／`medium` | 已独立替换（京师三批） |
| 108 | 京师 | 府属州与县治 | 行唐县 | county | `xingtang-seat` | `hvd_44985` | `approximate`／`medium` | 已独立替换（京师三批） |
| 109 | 京师 | 府属州与县治 | 兴济县 | county | `xingji-seat` | `hvd_44920` | `approximate`／`low` | 低可信；已独立替换（京师三批） |
| 110 | 京师 | 府属州与县治 | 雄县 | county | `xiong-seat` | `hvd_44775` | `approximate`／`medium` | 已独立替换（京师三批） |
| 111 | 京师 | 府属州与县治 | 盐山县 | county | `yanshan-hejian-seat` | `hvd_44930` | `approximate`／`medium` | 已独立替换（京师三批） |
| 112 | 京师 | 府属州与县治 | 易州 | department | `yizhou-baoding-seat` | `hvd_88287` | `approximate`／`medium` | 已独立替换（京师三批） |
| 113 | 京师 | 府属州与县治 | 永清县 | county | `yongqing-county-seat` | `hvd_88208` | `approximate`／`medium` | 已独立替换（京师三批） |
| 114 | 京师 | 府属州与县治 | 玉田县 | county | `yutian-seat` | `hvd_88317` | `approximate`／`medium` | 已独立替换（京师三批） |
| 115 | 京师 | 府属州与县治 | 元氏县 | county | `yuanshi-seat` | `hvd_44989` | `approximate`／`medium` | 已独立替换（京师三批） |
| 116 | 京师 | 府属州与县治 | 赞皇县 | county | `zanhuang-seat` | `hvd_44993` | `approximate`／`medium` | 已独立替换（京师三批） |
| 117 | 京师 | 府属州与县治 | 枣强县 | county | `zaoqiang-seat` | `hvd_88089` | `approximate`／`medium` | 已独立替换（京师三批） |
| 118 | 京师 | 府属州与县治 | 长垣县 | county | `changyuan-seat` | `hvd_87821` | `approximate`／`medium` | 已独立替换（京师三批） |
| 119 | 京师 | 府属州与县治 | 赵州 | department | `zhaozhou-seat` | `hvd_88336` | `approximate`／`medium` | 已独立替换（京师三批） |
| 120 | 京师 | 府属州与县治 | 涿州 | department | `zhuozhou-seat` | `hvd_88193` | `approximate`／`medium` | 已独立替换（京师三批） |
| 121 | 京师 | 府属州与县治 | 遵化县 | county | `zunhua-seat` | `hvd_88314` | `approximate`／`medium` | 已独立替换（京师三批） |
| 122 | 南京 | 一级行政区域治所 | 南京／应天府 | capital-region／prefecture | `nanjing-city` | `hvd_30033` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（南京三批） |
| 123 | 南京 | 府与直隶州治所 | 安庆府 | prefecture | `huaining-seat` | `hvd_43004` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 124 | 南京 | 府与直隶州治所 | 常州府 | prefecture | `wujin-seat` | `hvd_40459` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 125 | 南京 | 府与直隶州治所 | 池州府 | prefecture | `guichi-seat` | `hvd_41344` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 126 | 南京 | 府与直隶州治所 | 滁州 | department | `chuzhou-seat` | `hvd_33532` | `approximate`／`medium` | 已独立替换（南京三批） |
| 127 | 南京 | 府与直隶州治所 | 凤阳府 | prefecture | `fengyang-seat` | `hvd_43399` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 128 | 南京 | 府与直隶州治所 | 广德州 | department | `guangde-seat` | `hvd_32464` | `approximate`／`medium` | 已独立替换（南京三批） |
| 129 | 南京 | 府与直隶州治所 | 和州 | department | `hezhou-seat` | `hvd_33512` | `approximate`／`medium` | 已独立替换（南京三批） |
| 130 | 南京 | 府与直隶州治所 | 淮安府 | prefecture | `shanyang-seat` | `hvd_42766` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 131 | 南京 | 府与直隶州治所 | 徽州府 | prefecture | `she-seat` | `hvd_41320` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 132 | 南京 | 府与直隶州治所 | 庐州府 | prefecture | `hefei-seat` | `hvd_43060` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 133 | 南京 | 府与直隶州治所 | 宁国府 | prefecture | `xuancheng-seat` | `hvd_41303` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 134 | 南京 | 府与直隶州治所 | 松江府 | prefecture | `huating-seat` | `hvd_40495` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 135 | 南京 | 府与直隶州治所 | 苏州府 | prefecture | `suzhou-city` | `hvd_32432` | `approximate`／`medium` | 共址 3 个地点；已独立替换（南京三批） |
| 136 | 南京 | 府与直隶州治所 | 太平府 | prefecture | `dangtu-seat` | `hvd_41364` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 137 | 南京 | 府与直隶州治所 | 徐州 | department | `xuzhou-seat` | `hvd_33321` | `approximate`／`medium` | 已独立替换（南京三批） |
| 138 | 南京 | 府与直隶州治所 | 扬州府 | prefecture | `jiangdu-seat` | `hvd_42684` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 139 | 南京 | 府与直隶州治所 | 镇江府 | prefecture | `dantu-seat` | `hvd_40570` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 140 | 南京 | 府属州与县治 | 安东县 | county | `andong-seat` | `hvd_42924` | `approximate`／`low` | 低可信；已独立替换（南京三批） |
| 141 | 南京 | 府属州与县治 | 宝应县 | county | `baoying-seat` | `hvd_42727` | `approximate`／`medium` | 已独立替换（南京三批） |
| 142 | 南京 | 府属州与县治 | 亳州 | department | `bozhou-seat` | `hvd_43408` | `approximate`／`medium` | 已独立替换（南京三批） |
| 143 | 南京 | 府属州与县治 | 常熟县 | county | `changshu-county-seat` | `hvd_40382` | `approximate`／`medium` | 已独立替换（南京三批） |
| 144 | 南京 | 府属州与县治 | 巢县 | county | `chao-seat` | `hvd_43041` | `approximate`／`medium` | 已独立替换（南京三批） |
| 145 | 南京 | 府属州与县治 | 崇明县 | county | `chongming-county-seat` | `hvd_40390` | `approximate`／`medium` | 已独立替换（南京三批） |
| 146 | 南京 | 府属州与县治 | 丹徒县 | county | `dantu-county-seat` | `hvd_40570` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 147 | 南京 | 府属州与县治 | 丹阳县 | county | `danyang-county-seat` | `hvd_40576` | `approximate`／`medium` | 已独立替换（南京三批） |
| 148 | 南京 | 府属州与县治 | 当涂县 | county | `dangtu-county-seat` | `hvd_41364` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 149 | 南京 | 府属州与县治 | 砀山县 | county | `dangshan-seat` | `hvd_42802` | `approximate`／`medium` | 已独立替换（南京三批） |
| 150 | 南京 | 府属州与县治 | 定远县 | county | `dingyuan-seat` | `hvd_43089` | `approximate`／`medium` | 已独立替换（南京三批） |
| 151 | 南京 | 府属州与县治 | 东流县 | county | `dongliu-seat` | `hvd_41362` | `approximate`／`low` | 低可信；已独立替换（南京三批） |
| 152 | 南京 | 府属州与县治 | 繁昌县 | county | `fanchang-seat` | `hvd_41373` | `approximate`／`medium` | 已独立替换（南京三批） |
| 153 | 南京 | 府属州与县治 | 丰县 | county | `feng-seat` | `hvd_42806` | `approximate`／`medium` | 已独立替换（南京三批） |
| 154 | 南京 | 府属州与县治 | 凤阳县 | county | `fengyang-county-seat` | `hvd_43399` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 155 | 南京 | 府属州与县治 | 赣榆县 | county | `ganyu-seat` | `hvd_42893` | `approximate`／`medium` | 已独立替换（南京三批） |
| 156 | 南京 | 府属州与县治 | 高邮州 | department | `gaoyou-seat` | `hvd_42868` | `approximate`／`medium` | 已独立替换（南京三批） |
| 157 | 南京 | 府属州与县治 | 贵池县 | county | `guichi-county-seat` | `hvd_41344` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 158 | 南京 | 府属州与县治 | 海门县 | county | `haimen-seat` | `hvd_42935` | `approximate`／`medium` | 已独立替换（南京三批） |
| 159 | 南京 | 府属州与县治 | 含山县 | county | `hanshan-seat` | `hvd_43109` | `approximate`／`medium` | 已独立替换（南京三批） |
| 160 | 南京 | 府属州与县治 | 合肥县 | county | `hefei-county-seat` | `hvd_43060` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 161 | 南京 | 府属州与县治 | 虹县 | county | `hong-seat` | `hvd_43239` | `approximate`／`low` | 低可信；已独立替换（南京三批） |
| 162 | 南京 | 府属州与县治 | 华亭县 | county | `huating-county-seat` | `hvd_40495` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 163 | 南京 | 府属州与县治 | 怀宁县 | county | `huaining-county-seat` | `hvd_43004` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 164 | 南京 | 府属州与县治 | 怀远县 | county | `huaiyuan-seat` | `hvd_43388` | `approximate`／`medium` | 已独立替换（南京三批） |
| 165 | 南京 | 府属州与县治 | 霍山县 | county | `huoshan-seat` | `hvd_43417` | `approximate`／`medium` | 已独立替换（南京三批） |
| 166 | 南京 | 府属州与县治 | 绩溪县 | county | `jixi-seat` | `hvd_41335` | `approximate`／`medium` | 已独立替换（南京三批） |
| 167 | 南京 | 府属州与县治 | 嘉定县 | county | `jiading-county-seat` | `hvd_40393` | `approximate`／`medium` | 已独立替换（南京三批） |
| 168 | 南京 | 府属州与县治 | 建德县 | county | `jiande-chizhou-seat` | `hvd_41363` | `approximate`／`low` | 低可信；已独立替换（南京三批） |
| 169 | 南京 | 府属州与县治 | 建平县 | county | `jianping-seat` | `hvd_41359` | `approximate`／`low` | 低可信；已独立替换（南京三批） |
| 170 | 南京 | 府属州与县治 | 江都县 | county | `jiangdu-county-seat` | `hvd_42684` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 171 | 南京 | 府属州与县治 | 江阴县 | county | `jiangyin-county-seat` | `hvd_40436` | `approximate`／`medium` | 已独立替换（南京三批） |
| 172 | 南京 | 府属州与县治 | 金坛县 | county | `jintan-county-seat` | `hvd_40595` | `approximate`／`medium` | 已独立替换（南京三批） |
| 173 | 南京 | 府属州与县治 | 泾县 | county | `jing-seat` | `hvd_41313` | `approximate`／`medium` | 已独立替换（南京三批） |
| 174 | 南京 | 府属州与县治 | 旌德县 | county | `jingde-seat` | `hvd_41307` | `approximate`／`medium` | 已独立替换（南京三批） |
| 175 | 南京 | 府属州与县治 | 靖江县 | county | `jingjiang-county-seat` | `hvd_40437` | `approximate`／`medium` | 已独立替换（南京三批） |
| 176 | 南京 | 府属州与县治 | 昆山县 | county | `kunshan-county-seat` | `hvd_40400` | `approximate`／`medium` | 已独立替换（南京三批） |
| 177 | 南京 | 府属州与县治 | 来安县 | county | `laian-seat` | `hvd_43168` | `approximate`／`medium` | 已独立替换（南京三批） |
| 178 | 南京 | 府属州与县治 | 临淮县 | county | `linhuai-seat` | `hvd_43077` | `approximate`／`low` | 低可信；已独立替换（南京三批） |
| 179 | 南京 | 府属州与县治 | 六安州 | department | `luan-seat` | `hvd_43152` | `approximate`／`medium` | 已独立替换（南京三批） |
| 180 | 南京 | 府属州与县治 | 庐江县 | county | `lujiang-seat` | `hvd_43382` | `approximate`／`medium` | 已独立替换（南京三批） |
| 181 | 南京 | 府属州与县治 | 蒙城县 | county | `mengcheng-seat` | `hvd_43372` | `approximate`／`medium` | 已独立替换（南京三批） |
| 182 | 南京 | 府属州与县治 | 南陵县 | county | `nanling-seat` | `hvd_41318` | `approximate`／`medium` | 已独立替换（南京三批） |
| 183 | 南京 | 府属州与县治 | 宁国县 | county | `ningguo-seat` | `hvd_41312` | `approximate`／`medium` | 已独立替换（南京三批） |
| 184 | 南京 | 府属州与县治 | 沛县 | county | `pei-seat` | `hvd_42810` | `approximate`／`medium` | 已独立替换（南京三批） |
| 185 | 南京 | 府属州与县治 | 邳州 | department | `pizhou-seat` | `hvd_42825` | `approximate`／`medium` | 已独立替换（南京三批） |
| 186 | 南京 | 府属州与县治 | 祁门县 | county | `qimen-seat` | `hvd_41330` | `approximate`／`medium` | 已独立替换（南京三批） |
| 187 | 南京 | 府属州与县治 | 潜山县 | county | `qianshan-seat` | `hvd_43002` | `approximate`／`medium` | 已独立替换（南京三批） |
| 188 | 南京 | 府属州与县治 | 青浦县 | county | `qingpu-county-seat` | `hvd_40504` | `approximate`／`medium` | 已独立替换（南京三批） |
| 189 | 南京 | 府属州与县治 | 青阳县 | county | `qingyang-seat` | `hvd_41346` | `approximate`／`medium` | 已独立替换（南京三批） |
| 190 | 南京 | 府属州与县治 | 清河县 | county | `qinghe-huaian-seat` | `hvd_42769` | `approximate`／`low` | 低可信；已独立替换（南京三批） |
| 191 | 南京 | 府属州与县治 | 全椒县 | county | `quanjiao-seat` | `hvd_43395` | `approximate`／`medium` | 已独立替换（南京三批） |
| 192 | 南京 | 府属州与县治 | 如皋县 | county | `rugao-seat` | `hvd_42931` | `approximate`／`medium` | 已独立替换（南京三批） |
| 193 | 南京 | 府属州与县治 | 山阳县 | county | `shanyang-county-seat` | `hvd_42766` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 194 | 南京 | 府属州与县治 | 上海县 | county | `shanghai-county-seat` | `hvd_40502` | `approximate`／`medium` | 已独立替换（南京三批） |
| 195 | 南京 | 府属州与县治 | 歙县 | county | `she-county-seat` | `hvd_41320` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 196 | 南京 | 府属州与县治 | 石埭县 | county | `shidai-seat` | `hvd_41352` | `approximate`／`low` | 低可信；已独立替换（南京三批） |
| 197 | 南京 | 府属州与县治 | 寿州 | department | `shou-seat` | `hvd_43158` | `approximate`／`medium` | 已独立替换（南京三批） |
| 198 | 南京 | 府属州与县治 | 舒城县 | county | `shucheng-seat` | `hvd_43177` | `approximate`／`medium` | 已独立替换（南京三批） |
| 199 | 南京 | 府属州与县治 | 沭阳县 | county | `shuyang-seat` | `hvd_42898` | `approximate`／`medium` | 已独立替换（南京三批） |
| 200 | 南京 | 府属州与县治 | 泗州 | department | `sizhou-seat` | `hvd_43403` | `approximate`／`medium` | 已独立替换（南京三批） |
| 201 | 南京 | 府属州与县治 | 宿迁县 | county | `suqian-seat` | `hvd_42841` | `approximate`／`medium` | 已独立替换（南京三批） |
| 202 | 南京 | 府属州与县治 | 宿松县 | county | `susong-seat` | `hvd_43381` | `approximate`／`medium` | 已独立替换（南京三批） |
| 203 | 南京 | 府属州与县治 | 宿州 | department | `suzhou-fengyang-seat` | `hvd_43207` | `approximate`／`medium` | 已独立替换（南京三批） |
| 204 | 南京 | 府属州与县治 | 睢宁县 | county | `suining-seat` | `hvd_42867` | `approximate`／`medium` | 已独立替换（南京三批） |
| 205 | 南京 | 府属州与县治 | 太仓州 | department | `taicang-department-seat` | `hvd_40428` | `approximate`／`medium` | 已独立替换（南京三批） |
| 206 | 南京 | 府属州与县治 | 太和县 | county | `taihe-yingzhou-seat` | `hvd_43362` | `approximate`／`medium` | 已独立替换（南京三批） |
| 207 | 南京 | 府属州与县治 | 太湖县 | county | `taihu-seat` | `hvd_43008` | `approximate`／`medium` | 已独立替换（南京三批） |
| 208 | 南京 | 府属州与县治 | 太平县 | county | `taiping-ningguo-seat` | `hvd_41309` | `approximate`／`low` | 低可信；已独立替换（南京三批） |
| 209 | 南京 | 府属州与县治 | 泰兴县 | county | `taixing-seat` | `hvd_42941` | `approximate`／`medium` | 已独立替换（南京三批） |
| 210 | 南京 | 府属州与县治 | 泰州 | department | `taizhou-yangzhou-seat` | `hvd_42928` | `approximate`／`medium` | 已独立替换（南京三批） |
| 211 | 南京 | 府属州与县治 | 桃源县 | county | `taoyuan-huaian-seat` | `hvd_42927` | `approximate`／`low` | 低可信；已独立替换（南京三批） |
| 212 | 南京 | 府属州与县治 | 天长县 | county | `tianchang-seat` | `hvd_43266` | `approximate`／`medium` | 已独立替换（南京三批） |
| 213 | 南京 | 府属州与县治 | 桐城县 | county | `tongcheng-seat` | `hvd_43027` | `approximate`／`medium` | 已独立替换（南京三批） |
| 214 | 南京 | 府属州与县治 | 铜陵县 | county | `tongling-seat` | `hvd_41360` | `approximate`／`medium` | 已独立替换（南京三批） |
| 215 | 南京 | 府属州与县治 | 望江县 | county | `wangjiang-seat` | `hvd_43020` | `approximate`／`medium` | 已独立替换（南京三批） |
| 216 | 南京 | 府属州与县治 | 无为州 | department | `wuwei-seat` | `hvd_43045` | `approximate`／`medium` | 已独立替换（南京三批） |
| 217 | 南京 | 府属州与县治 | 无锡县 | county | `wuxi-county-seat` | `hvd_40447` | `approximate`／`medium` | 已独立替换（南京三批） |
| 218 | 南京 | 府属州与县治 | 吴江县 | county | `wujiang-county-seat` | `hvd_40415` | `approximate`／`medium` | 已独立替换（南京三批） |
| 219 | 南京 | 府属州与县治 | 吴县 | county | `wu-county-seat` | `hvd_40406` | `approximate`／`medium` | 共址 3 个地点；已独立替换（南京三批） |
| 220 | 南京 | 府属州与县治 | 芜湖县 | county | `wuhu-seat` | `hvd_41368` | `approximate`／`medium` | 已独立替换（南京三批） |
| 221 | 南京 | 府属州与县治 | 五河县 | county | `wuhe-seat` | `hvd_43268` | `approximate`／`medium` | 已独立替换（南京三批） |
| 222 | 南京 | 府属州与县治 | 武进县 | county | `wujin-county-seat` | `hvd_40459` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 223 | 南京 | 府属州与县治 | 婺源县 | county | `wuyuan-seat` | `hvd_41334` | `approximate`／`medium` | 已独立替换（南京三批） |
| 224 | 南京 | 府属州与县治 | 萧县 | county | `xiao-seat` | `hvd_42788` | `approximate`／`medium` | 已独立替换（南京三批） |
| 225 | 南京 | 府属州与县治 | 兴化县 | county | `xinghua-seat` | `hvd_42733` | `approximate`／`medium` | 已独立替换（南京三批） |
| 226 | 南京 | 府属州与县治 | 休宁县 | county | `xiuning-seat` | `hvd_41329` | `approximate`／`medium` | 已独立替换（南京三批） |
| 227 | 南京 | 府属州与县治 | 盱眙县 | county | `xuyi-seat` | `hvd_43293` | `approximate`／`medium` | 已独立替换（南京三批） |
| 228 | 南京 | 府属州与县治 | 宣城县 | county | `xuancheng-county-seat` | `hvd_41303` | `approximate`／`medium` | 共址 2 个地点；CHGIS 编号复用；已独立替换（南京三批） |
| 229 | 南京 | 府属州与县治 | 盐城县 | county | `yancheng-seat` | `hvd_42743` | `approximate`／`medium` | 已独立替换（南京三批） |
| 230 | 南京 | 府属州与县治 | 黟县 | county | `yi-seat` | `hvd_41324` | `approximate`／`medium` | 已独立替换（南京三批） |
| 231 | 南京 | 府属州与县治 | 仪真县 | county | `yizhen-seat` | `hvd_42729` | `approximate`／`medium` | 已独立替换（南京三批） |
| 232 | 南京 | 府属州与县治 | 宜兴县 | county | `yixing-county-seat` | `hvd_40474` | `approximate`／`medium` | 已独立替换（南京三批） |
| 233 | 南京 | 府属州与县治 | 英山县 | county | `yingshan-seat` | `hvd_43312` | `approximate`／`medium` | 已独立替换（南京三批） |
| 234 | 南京 | 府属州与县治 | 颍上县 | county | `yingshang-seat` | `hvd_43333` | `approximate`／`medium` | 已独立替换（南京三批） |
| 235 | 南京 | 府属州与县治 | 颍州 | department | `yingzhou-seat` | `hvd_43415` | `approximate`／`medium` | 已独立替换（南京三批） |
| 236 | 南京 | 府属州与县治 | 长洲县 | county | `changzhou-county-seat` | `hvd_40407` | `approximate`／`medium` | 共址 3 个地点；已独立替换（南京三批） |
| 237 | 山东 | 一级行政区域治所 | 山东／济南府／历城县 | province／prefecture／county | `licheng-seat` | `hvd_86003` | `approximate`／`medium` | 关联 3 个行政实体；已独立替换（山东三批） |
| 238 | 山东 | 府与直隶州治所 | 登州府／蓬莱县 | prefecture／county | `penglai-seat` | `hvd_86009` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（山东三批） |
| 239 | 山东 | 府与直隶州治所 | 东昌府／聊城县 | prefecture／county | `liaocheng-seat` | `hvd_86002` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（山东三批） |
| 240 | 山东 | 府与直隶州治所 | 莱州府／掖县 | prefecture／county | `ye-seat` | `hvd_86008` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（山东三批） |
| 241 | 山东 | 府与直隶州治所 | 青州府／益都县 | prefecture／county | `yidu-seat` | `hvd_86007` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（山东三批） |
| 242 | 山东 | 府与直隶州治所 | 兖州府／滋阳县 | prefecture／county | `ziyang-seat` | `hvd_86005` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（山东三批） |
| 243 | 山东 | 府属州与县治 | 安丘县 | county | `anqiu-seat` | `hvd_85322` | `approximate`／`medium` | 已独立替换（山东三批） |
| 244 | 山东 | 府属州与县治 | 滨州 | department | `binzhou-seat` | `hvd_85544` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 245 | 山东 | 府属州与县治 | 博平县 | county | `boping-seat` | `hvd_45329` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 246 | 山东 | 府属州与县治 | 博兴县 | county | `boxing-seat` | `hvd_85247` | `approximate`／`medium` | 已独立替换（山东三批） |
| 247 | 山东 | 府属州与县治 | 曹县 | county | `cao-seat` | `hvd_85127` | `approximate`／`medium` | 已独立替换（山东三批） |
| 248 | 山东 | 府属州与县治 | 曹州 | department | `caozhou-seat` | `hvd_86014` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 249 | 山东 | 府属州与县治 | 昌乐县 | county | `changle-seat` | `hvd_85298` | `approximate`／`medium` | 已独立替换（山东三批） |
| 250 | 山东 | 府属州与县治 | 昌邑县 | county | `changyi-laizhou-seat` | `hvd_1041` | `approximate`／`medium` | 已独立替换（山东三批） |
| 251 | 山东 | 府属州与县治 | 朝城县 | county | `chaocheng-seat` | `hvd_85100` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 252 | 山东 | 府属州与县治 | 城武县 | county | `chengwu-seat` | `hvd_85120` | `approximate`／`medium` | 已独立替换（山东三批） |
| 253 | 山东 | 府属州与县治 | 茌平县 | county | `chiping-seat` | `hvd_45336` | `approximate`／`medium` | 已独立替换（山东三批） |
| 254 | 山东 | 府属州与县治 | 单县 | county | `shan-yanzhou-seat` | `hvd_85028` | `approximate`／`medium` | 已独立替换（山东三批） |
| 255 | 山东 | 府属州与县治 | 德平县 | county | `deping-seat` | `hvd_45112` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 256 | 山东 | 府属州与县治 | 德州 | department | `dezhou-seat` | `hvd_45176` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 257 | 山东 | 府属州与县治 | 定陶县 | county | `dingtao-seat` | `hvd_85062` | `approximate`／`medium` | 已独立替换（山东三批） |
| 258 | 山东 | 府属州与县治 | 东阿县 | county | `donge-seat` | `hvd_45306` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 259 | 山东 | 府属州与县治 | 东平州 | department | `dongping-seat` | `hvd_85704` | `approximate`／`medium` | 已独立替换（山东三批） |
| 260 | 山东 | 府属州与县治 | 恩县 | county | `en-seat` | `hvd_1003` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 261 | 山东 | 府属州与县治 | 范县 | county | `fan-seat` | `hvd_85107` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 262 | 山东 | 府属州与县治 | 肥城县 | county | `feicheng-seat` | `hvd_85703` | `approximate`／`medium` | 已独立替换（山东三批） |
| 263 | 山东 | 府属州与县治 | 费县 | county | `fei-seat` | `hvd_85606` | `approximate`／`medium` | 已独立替换（山东三批） |
| 264 | 山东 | 府属州与县治 | 福山县 | county | `fushan-seat` | `hvd_85424` | `approximate`／`medium` | 已独立替换（山东三批） |
| 265 | 山东 | 府属州与县治 | 高密县 | county | `gaomi-seat` | `hvd_85499` | `approximate`／`medium` | 已独立替换（山东三批） |
| 266 | 山东 | 府属州与县治 | 高唐州 | department | `gaotang-seat` | `hvd_86042` | `approximate`／`medium` | 已独立替换（山东三批） |
| 267 | 山东 | 府属州与县治 | 高苑县 | county | `gaoyuan-seat` | `hvd_85229` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 268 | 山东 | 府属州与县治 | 观城县 | county | `guancheng-seat` | `hvd_85089` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 269 | 山东 | 府属州与县治 | 冠县 | county | `guan-dongchang-seat` | `hvd_45349` | `approximate`／`medium` | 已独立替换（山东三批） |
| 270 | 山东 | 府属州与县治 | 馆陶县 | county | `guantao-seat` | `hvd_85191` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 271 | 山东 | 府属州与县治 | 海丰县 | county | `haifeng-wuding-seat` | `hvd_85565` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 272 | 山东 | 府属州与县治 | 黄县 | county | `huang-dengzhou-seat` | `hvd_85374` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 273 | 山东 | 府属州与县治 | 即墨县 | county | `jimo-seat` | `hvd_85461` | `approximate`／`medium` | 已独立替换（山东三批） |
| 274 | 山东 | 府属州与县治 | 济宁州 | department | `jining-seat` | `hvd_85157` | `approximate`／`medium` | 已独立替换（山东三批） |
| 275 | 山东 | 府属州与县治 | 济阳县 | county | `jiyang-seat` | `hvd_45174` | `approximate`／`medium` | 已独立替换（山东三批） |
| 276 | 山东 | 府属州与县治 | 嘉祥县 | county | `jiaxiang-seat` | `hvd_85142` | `approximate`／`medium` | 已独立替换（山东三批） |
| 277 | 山东 | 府属州与县治 | 胶州 | department | `jiaozhou-seat` | `hvd_85479` | `approximate`／`medium` | 已独立替换（山东三批） |
| 278 | 山东 | 府属州与县治 | 金乡县 | county | `jinxiang-seat` | `hvd_85159` | `approximate`／`medium` | 已独立替换（山东三批） |
| 279 | 山东 | 府属州与县治 | 莒州 | department | `juzhou-seat` | `hvd_85619` | `approximate`／`medium` | 已独立替换（山东三批） |
| 280 | 山东 | 府属州与县治 | 巨野县 | county | `juye-seat` | `hvd_85110` | `approximate`／`medium` | 已独立替换（山东三批） |
| 281 | 山东 | 府属州与县治 | 莱芜县 | county | `laiwu-seat` | `hvd_45056` | `approximate`／`medium` | 已独立替换（山东三批） |
| 282 | 山东 | 府属州与县治 | 莱阳县 | county | `laiyang-seat` | `hvd_85384` | `approximate`／`medium` | 已独立替换（山东三批） |
| 283 | 山东 | 府属州与县治 | 乐安县 | county | `lean-qingzhou-seat` | `hvd_85259` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 284 | 山东 | 府属州与县治 | 乐陵县 | county | `leling-seat` | `hvd_85557` | `approximate`／`medium` | 已独立替换（山东三批） |
| 285 | 山东 | 府属州与县治 | 利津县 | county | `lijin-seat` | `hvd_85545` | `approximate`／`medium` | 已独立替换（山东三批） |
| 286 | 山东 | 府属州与县治 | 临清州 | department | `linqing-seat` | `hvd_85164` | `approximate`／`medium` | 已独立替换（山东三批） |
| 287 | 山东 | 府属州与县治 | 临朐县 | county | `linqu-seat` | `hvd_45061` | `approximate`／`medium` | 已独立替换（山东三批） |
| 288 | 山东 | 府属州与县治 | 临邑县 | county | `linyi-jinan-seat` | `hvd_45097` | `approximate`／`medium` | 已独立替换（山东三批） |
| 289 | 山东 | 府属州与县治 | 临淄县 | county | `linzi-seat` | `hvd_85236` | `approximate`／`medium` | 已独立替换（山东三批） |
| 290 | 山东 | 府属州与县治 | 陵县 | county | `ling-jinan-seat` | `hvd_45175` | `approximate`／`medium` | 已独立替换（山东三批） |
| 291 | 山东 | 府属州与县治 | 蒙阴县 | county | `mengyin-seat` | `hvd_85632` | `approximate`／`medium` | 已独立替换（山东三批） |
| 292 | 山东 | 府属州与县治 | 宁海州 | department | `ninghai-dengzhou-seat` | `hvd_85407` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 293 | 山东 | 府属州与县治 | 宁阳县 | county | `ningyang-seat` | `hvd_45282` | `approximate`／`medium` | 已独立替换（山东三批） |
| 294 | 山东 | 府属州与县治 | 平度州 | department | `pingdu-seat` | `hvd_85392` | `approximate`／`medium` | 已独立替换（山东三批） |
| 295 | 山东 | 府属州与县治 | 平阴县 | county | `pingyin-seat` | `hvd_85695` | `approximate`／`medium` | 已独立替换（山东三批） |
| 296 | 山东 | 府属州与县治 | 平原县 | county | `pingyuan-seat` | `hvd_45101` | `approximate`／`medium` | 已独立替换（山东三批） |
| 297 | 山东 | 府属州与县治 | 蒲台县 | county | `putai-seat` | `hvd_85573` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 298 | 山东 | 府属州与县治 | 濮州 | department | `puzhou-seat` | `hvd_86022` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 299 | 山东 | 府属州与县治 | 栖霞县 | county | `qixia-seat` | `hvd_85426` | `approximate`／`medium` | 已独立替换（山东三批） |
| 300 | 山东 | 府属州与县治 | 齐东县 | county | `qidong-seat` | `hvd_45171` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 301 | 山东 | 府属州与县治 | 齐河县 | county | `qihe-seat` | `hvd_45170` | `approximate`／`medium` | 已独立替换（山东三批） |
| 302 | 山东 | 府属州与县治 | 青城县 | county | `qingcheng-jinan-seat` | `hvd_85562` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 303 | 山东 | 府属州与县治 | 清平县 | county | `qingping-seat` | `hvd_85211` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 304 | 山东 | 府属州与县治 | 丘县 | county | `qiu-seat` | `hvd_85188` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 305 | 山东 | 府属州与县治 | 曲阜县 | county | `qufu-seat` | `hvd_45185` | `approximate`／`medium` | 已独立替换（山东三批） |
| 306 | 山东 | 府属州与县治 | 日照县 | county | `rizhao-seat` | `hvd_85651` | `approximate`／`medium` | 已独立替换（山东三批） |
| 307 | 山东 | 府属州与县治 | 商河县 | county | `shanghe-seat` | `hvd_1005` | `approximate`／`medium` | 已独立替换（山东三批） |
| 308 | 山东 | 府属州与县治 | 莘县 | county | `shen-seat` | `hvd_45344` | `approximate`／`medium` | 已独立替换（山东三批） |
| 309 | 山东 | 府属州与县治 | 寿光县 | county | `shouguang-seat` | `hvd_85269` | `approximate`／`medium` | 已独立替换（山东三批） |
| 310 | 山东 | 府属州与县治 | 寿张县 | county | `shouzhang-seat` | `hvd_45266` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 311 | 山东 | 府属州与县治 | 泗水县 | county | `sishui-seat` | `hvd_45308` | `approximate`／`medium` | 已独立替换（山东三批） |
| 312 | 山东 | 府属州与县治 | 泰安州 | department | `taian-seat` | `hvd_115857` | `approximate`／`medium` | 已独立替换（山东三批） |
| 313 | 山东 | 府属州与县治 | 郯城县 | county | `tancheng-seat` | `hvd_1073` | `approximate`／`medium` | 已独立替换（山东三批） |
| 314 | 山东 | 府属州与县治 | 堂邑县 | county | `tangyi-seat` | `hvd_85206` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 315 | 山东 | 府属州与县治 | 滕县 | county | `teng-seat` | `hvd_45206` | `approximate`／`medium` | 已独立替换（山东三批） |
| 316 | 山东 | 府属州与县治 | 潍县 | county | `wei-laizhou-seat` | `hvd_85471` | `approximate`／`medium` | 已独立替换（山东三批） |
| 317 | 山东 | 府属州与县治 | 文登县 | county | `wendeng-seat` | `hvd_85428` | `approximate`／`medium` | 已独立替换（山东三批） |
| 318 | 山东 | 府属州与县治 | 汶上县 | county | `wenshang-seat` | `hvd_45249` | `approximate`／`medium` | 已独立替换（山东三批） |
| 319 | 山东 | 府属州与县治 | 武城县 | county | `wucheng-dongchang-seat` | `hvd_85173` | `approximate`／`medium` | 已独立替换（山东三批） |
| 320 | 山东 | 府属州与县治 | 武定州 | department | `wuding-shandong-seat` | `hvd_86015` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 321 | 山东 | 府属州与县治 | 夏津县 | county | `xiajin-seat` | `hvd_45156` | `approximate`／`medium` | 已独立替换（山东三批） |
| 322 | 山东 | 府属州与县治 | 新城县 | county | `xincheng-jinan-seat` | `hvd_45169` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 323 | 山东 | 府属州与县治 | 新泰县 | county | `xintai-seat` | `hvd_85675` | `approximate`／`medium` | 已独立替换（山东三批） |
| 324 | 山东 | 府属州与县治 | 阳谷县 | county | `yanggu-seat` | `hvd_45254` | `approximate`／`medium` | 已独立替换（山东三批） |
| 325 | 山东 | 府属州与县治 | 阳信县 | county | `yangxin-seat` | `hvd_85534` | `approximate`／`medium` | 已独立替换（山东三批） |
| 326 | 山东 | 府属州与县治 | 沂水县 | county | `yishui-seat` | `hvd_85636` | `approximate`／`medium` | 已独立替换（山东三批） |
| 327 | 山东 | 府属州与县治 | 沂州 | department | `yizhou-seat` | `hvd_85591` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 328 | 山东 | 府属州与县治 | 峄县 | county | `yi-yanzhou-seat` | `hvd_45230` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 329 | 山东 | 府属州与县治 | 鱼台县 | county | `yutai-seat` | `hvd_85151` | `approximate`／`medium` | 已独立替换（山东三批） |
| 330 | 山东 | 府属州与县治 | 禹城县 | county | `yucheng-seat` | `hvd_45086` | `approximate`／`medium` | 已独立替换（山东三批） |
| 331 | 山东 | 府属州与县治 | 郓城县 | county | `yuncheng-seat` | `hvd_85126` | `approximate`／`medium` | 已独立替换（山东三批） |
| 332 | 山东 | 府属州与县治 | 沾化县 | county | `zhanhua-seat` | `hvd_85569` | `approximate`／`medium` | 已独立替换（山东三批） |
| 333 | 山东 | 府属州与县治 | 章丘县 | county | `zhangqiu-seat` | `hvd_45091` | `approximate`／`medium` | 已独立替换（山东三批） |
| 334 | 山东 | 府属州与县治 | 长清县 | county | `changqing-seat` | `hvd_45126` | `approximate`／`medium` | 已独立替换（山东三批） |
| 335 | 山东 | 府属州与县治 | 长山县 | county | `changshan-jinan-seat` | `hvd_45067` | `approximate`／`low` | 低可信；已独立替换（山东三批） |
| 336 | 山东 | 府属州与县治 | 招远县 | county | `zhaoyuan-seat` | `hvd_85427` | `approximate`／`medium` | 已独立替换（山东三批） |
| 337 | 山东 | 府属州与县治 | 诸城县 | county | `zhucheng-seat` | `hvd_85368` | `approximate`／`medium` | 已独立替换（山东三批） |
| 338 | 山东 | 府属州与县治 | 淄川县 | county | `zichuan-seat` | `hvd_45167` | `approximate`／`medium` | 已独立替换（山东三批） |
| 339 | 山东 | 府属州与县治 | 邹平县 | county | `zouping-seat` | `hvd_45045` | `approximate`／`medium` | 已独立替换（山东三批） |
| 340 | 山东 | 府属州与县治 | 邹县 | county | `zou-seat` | `hvd_45194` | `approximate`／`medium` | 已独立替换（山东三批） |
| 341 | 河南 | 一级行政区域治所 | 河南／开封府／祥符县 | province／prefecture／county | `xiangfu-seat` | `hvd_84008` | `approximate`／`medium` | 关联 3 个行政实体；已独立替换（河南三批） |
| 342 | 河南 | 府与直隶州治所 | 归德府／商丘县 | prefecture／county | `shangqiu-seat` | `hvd_84009` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（河南三批） |
| 343 | 河南 | 府与直隶州治所 | 河南府／洛阳县 | prefecture／county | `luoyang-seat` | `hvd_84004` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（河南三批） |
| 344 | 河南 | 府与直隶州治所 | 怀庆府／河内县 | prefecture／county | `henei-seat` | `hvd_84002` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（河南三批） |
| 345 | 河南 | 府与直隶州治所 | 南阳府／南阳县 | prefecture／county | `nanyang-seat` | `hvd_84005` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（河南三批） |
| 346 | 河南 | 府与直隶州治所 | 汝宁府／汝阳县 | prefecture／county | `ruyang-seat` | `hvd_84007` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（河南三批） |
| 347 | 河南 | 府与直隶州治所 | 汝州 | department | `ruzhou-seat` | `hvd_84013` | `approximate`／`medium` | 已独立替换（河南三批） |
| 348 | 河南 | 府与直隶州治所 | 卫辉府／汲县 | prefecture／county | `ji-seat` | `hvd_84003` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（河南三批） |
| 349 | 河南 | 府与直隶州治所 | 彰德府／安阳县 | prefecture／county | `anyang-seat` | `hvd_84001` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（河南三批） |
| 350 | 河南 | 府属州与县治 | 宝丰县 | county | `baofeng-ruzhou-seat` | `hvd_82993` | `approximate`／`medium` | 已独立替换（河南三批） |
| 351 | 河南 | 府属州与县治 | 陈留县 | county | `chenliu-kaifeng-seat` | `hvd_44325` | `approximate`／`medium` | 已独立替换（河南三批） |
| 352 | 河南 | 府属州与县治 | 磁州 | department | `cizhou-zhangde-seat` | `hvd_87977` | `approximate`／`medium` | 已独立替换（河南三批） |
| 353 | 河南 | 府属州与县治 | 登封县 | county | `dengfeng-henan-seat` | `hvd_82892` | `approximate`／`medium` | 已独立替换（河南三批） |
| 354 | 河南 | 府属州与县治 | 封丘县 | county | `fengqiu-seat` | `hvd_82327` | `approximate`／`medium` | 已独立替换（河南三批） |
| 355 | 河南 | 府属州与县治 | 扶沟县 | county | `fugou-seat` | `hvd_82060` | `approximate`／`medium` | 已独立替换（河南三批） |
| 356 | 河南 | 府属州与县治 | 巩县 | county | `gong-henan-seat` | `hvd_82876` | `approximate`／`medium` | 已独立替换（河南三批） |
| 357 | 河南 | 府属州与县治 | 固始县 | county | `gushi-runing-seat` | `hvd_82583` | `approximate`／`medium` | 已独立替换（河南三批） |
| 358 | 河南 | 府属州与县治 | 光山县 | county | `guangshan-runing-seat` | `hvd_82560` | `approximate`／`medium` | 已独立替换（河南三批） |
| 359 | 河南 | 府属州与县治 | 光州 | department | `guangzhou-runing-seat` | `hvd_82556` | `approximate`／`medium` | 已独立替换（河南三批） |
| 360 | 河南 | 府属州与县治 | 河阴县 | county | `heyin-seat` | `hvd_82434` | `approximate`／`low` | 低可信；已独立替换（河南三批） |
| 361 | 河南 | 府属州与县治 | 辉县 | county | `hui-weihui-seat` | `hvd_82280` | `approximate`／`medium` | 已独立替换（河南三批） |
| 362 | 河南 | 府属州与县治 | 获嘉县 | county | `huojia-weihui-seat` | `hvd_82264` | `approximate`／`medium` | 已独立替换（河南三批） |
| 363 | 河南 | 府属州与县治 | 郏县 | county | `jia-ruzhou-seat` | `hvd_82985` | `approximate`／`medium` | 已独立替换（河南三批） |
| 364 | 河南 | 府属州与县治 | 考城县 | county | `kaocheng-guide-seat` | `hvd_82341` | `approximate`／`low` | 低可信；已独立替换（河南三批） |
| 365 | 河南 | 府属州与县治 | 兰阳县 | county | `lanyang-seat` | `hvd_44371` | `approximate`／`low` | 低可信；已独立替换（河南三批） |
| 366 | 河南 | 府属州与县治 | 林县 | county | `lin-zhangde-seat` | `hvd_82222` | `approximate`／`medium` | 已独立替换（河南三批） |
| 367 | 河南 | 府属州与县治 | 临颍县 | county | `linying-seat` | `hvd_83025` | `approximate`／`medium` | 已独立替换（河南三批） |
| 368 | 河南 | 府属州与县治 | 临漳县 | county | `linzhang-zhangde-seat` | `hvd_82205` | `approximate`／`medium` | 已独立替换（河南三批） |
| 369 | 河南 | 府属州与县治 | 灵宝县 | county | `lingbao-henan-seat` | `hvd_83052` | `approximate`／`medium` | 已独立替换（河南三批） |
| 370 | 河南 | 府属州与县治 | 卢氏县 | county | `lushi-henan-seat` | `hvd_83180` | `approximate`／`medium` | 已独立替换（河南三批） |
| 371 | 河南 | 府属州与县治 | 鲁山县 | county | `lushan-ruzhou-seat` | `hvd_82974` | `approximate`／`medium` | 已独立替换（河南三批） |
| 372 | 河南 | 府属州与县治 | 鹿邑县 | county | `luyi-guide-seat` | `hvd_82098` | `approximate`／`medium` | 已独立替换（河南三批） |
| 373 | 河南 | 府属州与县治 | 罗山县 | county | `luoshan-runing-seat` | `hvd_83089` | `approximate`／`medium` | 已独立替换（河南三批） |
| 374 | 河南 | 府属州与县治 | 孟津县 | county | `mengjin-henan-seat` | `hvd_82958` | `approximate`／`medium` | 已独立替换（河南三批） |
| 375 | 河南 | 府属州与县治 | 孟县 | county | `meng-huaiqing-seat` | `hvd_82518` | `approximate`／`medium` | 已独立替换（河南三批） |
| 376 | 河南 | 府属州与县治 | 泌阳县 | county | `biyang-nanyang-seat` | `hvd_82654` | `approximate`／`medium` | 已独立替换（河南三批） |
| 377 | 河南 | 府属州与县治 | 密县 | county | `mi-yuzhou-seat` | `hvd_82460` | `approximate`／`low` | 低可信；已独立替换（河南三批） |
| 378 | 河南 | 府属州与县治 | 渑池县 | county | `mianchi-henan-seat` | `hvd_82931` | `approximate`／`medium` | 已独立替换（河南三批） |
| 379 | 河南 | 府属州与县治 | 南召县 | county | `nanzhao-nanyang-seat` | `hvd_82814` | `approximate`／`medium` | 已独立替换（河南三批） |
| 380 | 河南 | 府属州与县治 | 内乡县 | county | `neixiang-nanyang-seat` | `hvd_82767` | `approximate`／`medium` | 已独立替换（河南三批） |
| 381 | 河南 | 府属州与县治 | 宁陵县 | county | `ningling-guide-seat` | `hvd_82086` | `approximate`／`medium` | 已独立替换（河南三批） |
| 382 | 河南 | 府属州与县治 | 杞县 | county | `qi-kaifeng-seat` | `hvd_44329` | `approximate`／`medium` | 已独立替换（河南三批） |
| 383 | 河南 | 府属州与县治 | 确山县 | county | `queshan-runing-seat` | `hvd_83094` | `approximate`／`medium` | 已独立替换（河南三批） |
| 384 | 河南 | 府属州与县治 | 陕州 | department | `shanzhou-henan-seat` | `hvd_83049` | `approximate`／`medium` | 已独立替换（河南三批） |
| 385 | 河南 | 府属州与县治 | 商城县 | county | `shangcheng-runing-seat` | `hvd_82603` | `approximate`／`medium` | 已独立替换（河南三批） |
| 386 | 河南 | 府属州与县治 | 商水县 | county | `shangshui-seat` | `hvd_82013` | `approximate`／`medium` | 已独立替换（河南三批） |
| 387 | 河南 | 府属州与县治 | 上蔡县 | county | `shangcai-runing-seat` | `hvd_83091` | `approximate`／`medium` | 已独立替换（河南三批） |
| 388 | 河南 | 府属州与县治 | 沈丘县 | county | `shenqiu-seat` | `hvd_82052` | `approximate`／`medium` | 已独立替换（河南三批） |
| 389 | 河南 | 府属州与县治 | 汜水县 | county | `sishui-kaifeng-seat` | `hvd_82450` | `approximate`／`low` | 低可信；已独立替换（河南三批） |
| 390 | 河南 | 府属州与县治 | 嵩县 | county | `song-henan-seat` | `hvd_82934` | `approximate`／`medium` | 已独立替换（河南三批） |
| 391 | 河南 | 府属州与县治 | 睢州 | department | `suizhou-guide-seat` | `hvd_82166` | `approximate`／`medium` | 已独立替换（河南三批） |
| 392 | 河南 | 府属州与县治 | 遂平县 | county | `suiping-runing-seat` | `hvd_83087` | `approximate`／`medium` | 已独立替换（河南三批） |
| 393 | 河南 | 府属州与县治 | 太康县 | county | `taikang-seat` | `hvd_82057` | `approximate`／`medium` | 已独立替换（河南三批） |
| 394 | 河南 | 府属州与县治 | 汤阴县 | county | `tangyin-zhangde-seat` | `hvd_82212` | `approximate`／`medium` | 已独立替换（河南三批） |
| 395 | 河南 | 府属州与县治 | 唐县 | county | `tang-nanyang-seat` | `hvd_82643` | `approximate`／`low` | 低可信；已独立替换（河南三批） |
| 396 | 河南 | 府属州与县治 | 通许县 | county | `tongxu-seat` | `hvd_44331` | `approximate`／`medium` | 已独立替换（河南三批） |
| 397 | 河南 | 府属州与县治 | 桐柏县 | county | `tongbai-nanyang-seat` | `hvd_82672` | `approximate`／`medium` | 已独立替换（河南三批） |
| 398 | 河南 | 府属州与县治 | 洧川县 | county | `weichuan-seat` | `hvd_44347` | `approximate`／`low` | 低可信；已独立替换（河南三批） |
| 399 | 河南 | 府属州与县治 | 温县 | county | `wen-huaiqing-seat` | `hvd_82522` | `approximate`／`medium` | 已独立替换（河南三批） |
| 400 | 河南 | 府属州与县治 | 阌乡县 | county | `wenxiang-henan-seat` | `hvd_83076` | `approximate`／`low` | 低可信；已独立替换（河南三批） |
| 401 | 河南 | 府属州与县治 | 武安县 | county | `wuan-cizhou-seat` | `hvd_82232` | `approximate`／`medium` | 已独立替换（河南三批） |
| 402 | 河南 | 府属州与县治 | 舞阳县 | county | `wuyang-nanyang-seat` | `hvd_82796` | `approximate`／`medium` | 已独立替换（河南三批） |
| 403 | 河南 | 府属州与县治 | 西华县 | county | `xihua-seat` | `hvd_82039` | `approximate`／`medium` | 已独立替换（河南三批） |
| 404 | 河南 | 府属州与县治 | 西平县 | county | `xiping-runing-seat` | `hvd_83156` | `approximate`／`medium` | 已独立替换（河南三批） |
| 405 | 河南 | 府属州与县治 | 息县 | county | `xixian-runing-seat` | `hvd_82590` | `approximate`／`medium` | 已独立替换（河南三批） |
| 406 | 河南 | 府属州与县治 | 淅川县 | county | `xichuan-nanyang-seat` | `hvd_82735` | `approximate`／`medium` | 已独立替换（河南三批） |
| 407 | 河南 | 府属州与县治 | 夏邑县 | county | `xiayi-guide-seat` | `hvd_82113` | `approximate`／`medium` | 已独立替换（河南三批） |
| 408 | 河南 | 府属州与县治 | 襄城县 | county | `xiangcheng-xu-seat` | `hvd_83031` | `approximate`／`medium` | 已独立替换（河南三批） |
| 409 | 河南 | 府属州与县治 | 项城县 | county | `xiangcheng-chen-seat` | `hvd_82051` | `approximate`／`medium` | 已独立替换（河南三批） |
| 410 | 河南 | 府属州与县治 | 新安县 | county | `xinan-henan-seat` | `hvd_82918` | `approximate`／`medium` | 已独立替换（河南三批） |
| 411 | 河南 | 府属州与县治 | 新蔡县 | county | `xincai-runing-seat` | `hvd_83092` | `approximate`／`medium` | 已独立替换（河南三批） |
| 412 | 河南 | 府属州与县治 | 新野县 | county | `xinye-nanyang-seat` | `hvd_82753` | `approximate`／`medium` | 已独立替换（河南三批） |
| 413 | 河南 | 府属州与县治 | 新郑县 | county | `xinzheng-seat` | `hvd_82462` | `approximate`／`medium` | 已独立替换（河南三批） |
| 414 | 河南 | 府属州与县治 | 信阳州 | department | `xinyang-runing-seat` | `hvd_83095` | `approximate`／`medium` | 已独立替换（河南三批） |
| 415 | 河南 | 府属州与县治 | 荥阳县 | county | `xingyang-seat` | `hvd_44391` | `approximate`／`medium` | 已独立替换（河南三批） |
| 416 | 河南 | 府属州与县治 | 荥泽县 | county | `xingze-seat` | `hvd_82437` | `approximate`／`low` | 低可信；已独立替换（河南三批） |
| 417 | 河南 | 府属州与县治 | 修武县 | county | `xiuwu-huaiqing-seat` | `hvd_82484` | `approximate`／`medium` | 已独立替换（河南三批） |
| 418 | 河南 | 府属州与县治 | 许州 | department | `xu-kaifeng-seat` | `hvd_116032` | `approximate`／`medium` | 已独立替换（河南三批） |
| 419 | 河南 | 府属州与县治 | 鄢陵县 | county | `yanling-kaifeng-seat` | `hvd_44355` | `approximate`／`medium` | 已独立替换（河南三批） |
| 420 | 河南 | 府属州与县治 | 延津县 | county | `yanjin-seat` | `hvd_82288` | `approximate`／`medium` | 已独立替换（河南三批） |
| 421 | 河南 | 府属州与县治 | 偃师县 | county | `yanshi-henan-seat` | `hvd_82849` | `approximate`／`medium` | 已独立替换（河南三批） |
| 422 | 河南 | 府属州与县治 | 郾城县 | county | `yancheng-kaifeng-seat` | `hvd_83038` | `approximate`／`medium` | 已独立替换（河南三批） |
| 423 | 河南 | 府属州与县治 | 阳武县 | county | `yangwu-seat` | `hvd_82528` | `approximate`／`low` | 低可信；已独立替换（河南三批） |
| 424 | 河南 | 府属州与县治 | 叶县 | county | `ye-yuzhou-seat` | `hvd_82812` | `approximate`／`medium` | 已独立替换（河南三批） |
| 425 | 河南 | 府属州与县治 | 仪封县 | county | `yifeng-seat` | `hvd_44375` | `approximate`／`low` | 低可信；已独立替换（河南三批） |
| 426 | 河南 | 府属州与县治 | 宜阳县 | county | `yiyang-henan-seat` | `hvd_82864` | `approximate`／`medium` | 已独立替换（河南三批） |
| 427 | 河南 | 府属州与县治 | 永宁县 | county | `yongning-henan-seat` | `hvd_82915` | `approximate`／`low` | 低可信；已独立替换（河南三批） |
| 428 | 河南 | 府属州与县治 | 虞城县 | county | `yucheng-guide-seat` | `hvd_82153` | `approximate`／`medium` | 已独立替换（河南三批） |
| 429 | 河南 | 府属州与县治 | 禹州 | department | `yu-kaifeng-seat` | `hvd_116136` | `approximate`／`medium` | 已独立替换（河南三批） |
| 430 | 河南 | 府属州与县治 | 裕州 | department | `yuzhou-nanyang-seat` | `hvd_116142` | `approximate`／`medium` | 已独立替换（河南三批） |
| 431 | 河南 | 府属州与县治 | 原武县 | county | `yuanwu-seat` | `hvd_82534` | `approximate`／`medium` | 已独立替换（河南三批） |
| 432 | 河南 | 府属州与县治 | 长葛县 | county | `changge-seat` | `hvd_83043` | `approximate`／`medium` | 已独立替换（河南三批） |
| 433 | 河南 | 府属州与县治 | 柘城县 | county | `zhecheng-guide-seat` | `hvd_82172` | `approximate`／`medium` | 已独立替换（河南三批） |
| 434 | 河南 | 府属州与县治 | 真阳县 | county | `zhenyang-runing-seat` | `hvd_83096` | `approximate`／`medium` | 已独立替换（河南三批） |
| 435 | 河南 | 府属州与县治 | 郑州 | department | `zheng-kaifeng-seat` | `hvd_116189` | `approximate`／`medium` | 已独立替换（河南三批） |
| 436 | 河南 | 府属州与县治 | 中牟县 | county | `zhongmou-seat` | `hvd_44364` | `approximate`／`medium` | 已独立替换（河南三批） |
| 437 | 河南 | 府属州与县治 | 胙城县 | county | `zuocheng-weihui-seat` | `hvd_82297` | `approximate`／`low` | 低可信；已独立替换（河南三批） |
| 438 | 山西 | 一级行政区域治所 | 山西／太原府 | province／prefecture | `yangqu-seat` | `hvd_94021` | `approximate`／`medium` | 关联 2 个行政实体；共址 2 个地点；已独立替换（山西两批） |
| 439 | 山西 | 府与直隶州治所 | 大同府 | prefecture | `datong-seat` | `hvd_115139` | `approximate`／`medium` | 共址 2 个地点；已独立替换（山西两批） |
| 440 | 山西 | 府与直隶州治所 | 汾州府 | prefecture | `fenyang-seat` | `hvd_94027` | `approximate`／`medium` | 共址 2 个地点；已独立替换（山西两批） |
| 441 | 山西 | 府与直隶州治所 | 辽州 | department | `liaozhou-seat` | `hvd_94031` | `approximate`／`medium` | 已独立替换（山西两批） |
| 442 | 山西 | 府与直隶州治所 | 潞安府 | prefecture | `changzhi-seat` | `hvd_94066` | `approximate`／`medium` | 共址 2 个地点；已独立替换（山西两批） |
| 443 | 山西 | 府与直隶州治所 | 平阳府 | prefecture | `linfen-seat` | `hvd_94049` | `approximate`／`medium` | 共址 2 个地点；已独立替换（山西两批） |
| 444 | 山西 | 府与直隶州治所 | 泽州 | department | `zezhou-seat` | `hvd_94063` | `approximate`／`medium` | 已独立替换（山西两批） |
| 445 | 山西 | 府属州与县治 | 安邑县 | county | `shanxi-anyi-seat` | `hvd_95272` | `approximate`／`medium` | 已独立替换（山西两批） |
| 446 | 山西 | 府属州与县治 | 保德州 | department | `shanxi-baode-seat` | `hvd_95001` | `approximate`／`medium` | 已独立替换（山西两批） |
| 447 | 山西 | 府属州与县治 | 大同县 | county | `shanxi-datong-county-seat` | `hvd_95011` | `approximate`／`medium` | 共址 2 个地点；已独立替换（山西两批） |
| 448 | 山西 | 府属州与县治 | 代州 | department | `shanxi-daizhou-seat` | `hvd_95101` | `approximate`／`medium` | 已独立替换（山西两批） |
| 449 | 山西 | 府属州与县治 | 定襄县 | county | `shanxi-dingxiang-seat` | `hvd_95678` | `approximate`／`medium` | 已独立替换（山西两批） |
| 450 | 山西 | 府属州与县治 | 繁峙县 | county | `shanxi-fanzhi-seat` | `hvd_95113` | `approximate`／`medium` | 已独立替换（山西两批） |
| 451 | 山西 | 府属州与县治 | 汾西县 | county | `shanxi-fenxi-seat` | `hvd_95384` | `approximate`／`medium` | 已独立替换（山西两批） |
| 452 | 山西 | 府属州与县治 | 汾阳县 | county | `shanxi-fenyang-seat` | `hvd_95144` | `approximate`／`medium` | 共址 2 个地点；已独立替换（山西两批） |
| 453 | 山西 | 府属州与县治 | 浮山县 | county | `shanxi-fushan-seat` | `hvd_95390` | `approximate`／`medium` | 已独立替换（山西两批） |
| 454 | 山西 | 府属州与县治 | 高平县 | county | `shanxi-gaoping-seat` | `hvd_95712` | `approximate`／`medium` | 已独立替换（山西两批） |
| 455 | 山西 | 府属州与县治 | 广昌县 | county | `shanxi-guangchang-seat` | `hvd_44948` | `approximate`／`low` | 低可信；已独立替换（山西两批） |
| 456 | 山西 | 府属州与县治 | 广灵县 | county | `shanxi-guangling-seat` | `hvd_95027` | `approximate`／`medium` | 已独立替换（山西两批） |
| 457 | 山西 | 府属州与县治 | 崞县 | county | `shanxi-guo-seat` | `hvd_95117` | `approximate`／`low` | 低可信；已独立替换（山西两批） |
| 458 | 山西 | 府属州与县治 | 和顺县 | county | `shanxi-heshun-seat` | `hvd_95302` | `approximate`／`medium` | 已独立替换（山西两批） |
| 459 | 山西 | 府属州与县治 | 河津县 | county | `shanxi-hejin-seat` | `hvd_95233` | `approximate`／`medium` | 已独立替换（山西两批） |
| 460 | 山西 | 府属州与县治 | 河曲县 | county | `shanxi-hequ-seat` | `hvd_95007` | `approximate`／`medium` | 已独立替换（山西两批） |
| 461 | 山西 | 府属州与县治 | 洪洞县 | county | `shanxi-hongdong-seat` | `hvd_95393` | `approximate`／`medium` | 已独立替换（山西两批） |
| 462 | 山西 | 府属州与县治 | 壶关县 | county | `shanxi-huguan-seat` | `hvd_95328` | `approximate`／`medium` | 已独立替换（山西两批） |
| 463 | 山西 | 府属州与县治 | 怀仁县 | county | `shanxi-huairen-seat` | `hvd_95037` | `approximate`／`medium` | 已独立替换（山西两批） |
| 464 | 山西 | 府属州与县治 | 浑源州 | department | `shanxi-hunyuan-seat` | `hvd_95048` | `approximate`／`medium` | 已独立替换（山西两批） |
| 465 | 山西 | 府属州与县治 | 霍州 | department | `shanxi-huozhou-seat` | `hvd_94043` | `approximate`／`medium` | 已独立替换（山西两批） |
| 466 | 山西 | 府属州与县治 | 稷山县 | county | `shanxi-jishan-seat` | `hvd_95237` | `approximate`／`medium` | 已独立替换（山西两批） |
| 467 | 山西 | 府属州与县治 | 绛县 | county | `shanxi-jiang-seat` | `hvd_95240` | `approximate`／`medium` | 已独立替换（山西两批） |
| 468 | 山西 | 府属州与县治 | 交城县 | county | `shanxi-jiaocheng-seat` | `hvd_95570` | `approximate`／`medium` | 已独立替换（山西两批） |
| 469 | 山西 | 府属州与县治 | 介休县 | county | `shanxi-jiexiu-seat` | `hvd_95148` | `approximate`／`medium` | 已独立替换（山西两批） |
| 470 | 山西 | 府属州与县治 | 静乐县 | county | `shanxi-jingle-seat` | `hvd_95688` | `approximate`／`medium` | 已独立替换（山西两批） |
| 471 | 山西 | 府属州与县治 | 岢岚州 | department | `shanxi-kelan-seat` | `hvd_95576` | `approximate`／`medium` | 已独立替换（山西两批） |
| 472 | 山西 | 府属州与县治 | 乐平县 | county | `shanxi-leping-seat` | `hvd_95380` | `approximate`／`low` | 低可信；已独立替换（山西两批） |
| 473 | 山西 | 府属州与县治 | 黎城县 | county | `shanxi-licheng-seat` | `hvd_95334` | `approximate`／`medium` | 已独立替换（山西两批） |
| 474 | 山西 | 府属州与县治 | 临汾县 | county | `shanxi-linfen-county-seat` | `hvd_95421` | `approximate`／`medium` | 共址 2 个地点；已独立替换（山西两批） |
| 475 | 山西 | 府属州与县治 | 临晋县 | county | `shanxi-linjin-seat` | `hvd_95469` | `approximate`／`low` | 低可信；已独立替换（山西两批） |
| 476 | 山西 | 府属州与县治 | 临县 | county | `shanxi-linxian-seat` | `hvd_95160` | `approximate`／`medium` | 已独立替换（山西两批） |
| 477 | 山西 | 府属州与县治 | 灵丘县 | county | `shanxi-lingqiu-seat` | `hvd_95054` | `approximate`／`medium` | 已独立替换（山西两批） |
| 478 | 山西 | 府属州与县治 | 灵石县 | county | `shanxi-lingshi-seat` | `hvd_95223` | `approximate`／`medium` | 已独立替换（山西两批） |
| 479 | 山西 | 府属州与县治 | 陵川县 | county | `shanxi-lingchuan-seat` | `hvd_95715` | `approximate`／`medium` | 已独立替换（山西两批） |
| 480 | 山西 | 府属州与县治 | 潞城县 | county | `shanxi-lucheng-seat` | `hvd_95338` | `approximate`／`medium` | 已独立替换（山西两批） |
| 481 | 山西 | 府属州与县治 | 马邑县 | county | `shanxi-mayi-seat` | `hvd_95541` | `approximate`／`low` | 低可信；已独立替换（山西两批） |
| 482 | 山西 | 府属州与县治 | 宁乡县 | county | `shanxi-ningxiang-seat` | `hvd_95165` | `approximate`／`low` | 低可信；已独立替换（山西两批） |
| 483 | 山西 | 府属州与县治 | 平陆县 | county | `shanxi-pinglu-seat` | `hvd_95282` | `approximate`／`medium` | 已独立替换（山西两批） |
| 484 | 山西 | 府属州与县治 | 平顺县 | county | `shanxi-pingshun-seat` | `hvd_95339` | `approximate`／`medium` | 已独立替换（山西两批） |
| 485 | 山西 | 府属州与县治 | 平遥县 | county | `shanxi-pingyao-seat` | `hvd_95174` | `approximate`／`medium` | 已独立替换（山西两批） |
| 486 | 山西 | 府属州与县治 | 蒲县 | county | `shanxi-pu-seat` | `hvd_95658` | `approximate`／`medium` | 已独立替换（山西两批） |
| 487 | 山西 | 府属州与县治 | 祁县 | county | `shanxi-qi-seat` | `hvd_95587` | `approximate`／`medium` | 已独立替换（山西两批） |
| 488 | 山西 | 府属州与县治 | 沁水县 | county | `shanxi-qinshui-seat` | `hvd_95721` | `approximate`／`medium` | 已独立替换（山西两批） |
| 489 | 山西 | 府属州与县治 | 沁源县 | county | `shanxi-qinyuan-seat` | `hvd_95511` | `approximate`／`medium` | 已独立替换（山西两批） |
| 490 | 山西 | 府属州与县治 | 清源县 | county | `shanxi-qingyuan-seat` | `hvd_95624` | `approximate`／`low` | 低可信；共址 2 个地点；已独立替换（山西两批） |
| 491 | 山西 | 府属州与县治 | 曲沃县 | county | `shanxi-quwo-seat` | `hvd_95426` | `approximate`／`medium` | 已独立替换（山西两批） |
| 492 | 山西 | 府属州与县治 | 芮城县 | county | `shanxi-ruicheng-seat` | `hvd_95284` | `approximate`／`medium` | 已独立替换（山西两批） |
| 493 | 山西 | 府属州与县治 | 山阴县 | county | `shanxi-shanyin-seat` | `hvd_95059` | `approximate`／`medium` | 已独立替换（山西两批） |
| 494 | 山西 | 府属州与县治 | 石楼县 | county | `shanxi-shilou-seat` | `hvd_95181` | `approximate`／`medium` | 已独立替换（山西两批） |
| 495 | 山西 | 府属州与县治 | 朔州 | department | `shanxi-shuozhou-seat` | `hvd_95529` | `approximate`／`medium` | 已独立替换（山西两批） |
| 496 | 山西 | 府属州与县治 | 太谷县 | county | `shanxi-taigu-seat` | `hvd_95594` | `approximate`／`medium` | 已独立替换（山西两批） |
| 497 | 山西 | 府属州与县治 | 太平县 | county | `shanxi-taiping-seat` | `hvd_95733` | `approximate`／`low` | 低可信；已独立替换（山西两批） |
| 498 | 山西 | 府属州与县治 | 屯留县 | county | `shanxi-tunliu-seat` | `hvd_95345` | `approximate`／`medium` | 已独立替换（山西两批） |
| 499 | 山西 | 府属州与县治 | 万泉县 | county | `shanxi-wanquan-seat` | `hvd_95476` | `approximate`／`low` | 低可信；已独立替换（山西两批） |
| 500 | 山西 | 府属州与县治 | 蔚州 | department | `shanxi-weizhou-seat` | `hvd_88273` | `approximate`／`low` | 低可信；已独立替换（山西两批） |
| 501 | 山西 | 府属州与县治 | 文水县 | county | `shanxi-wenshui-seat` | `hvd_95609` | `approximate`／`medium` | 已独立替换（山西两批） |
| 502 | 山西 | 府属州与县治 | 闻喜县 | county | `shanxi-wenxi-seat` | `hvd_95254` | `approximate`／`medium` | 已独立替换（山西两批） |
| 503 | 山西 | 府属州与县治 | 五台县 | county | `shanxi-wutai-seat` | `hvd_95133` | `approximate`／`medium` | 已独立替换（山西两批） |
| 504 | 山西 | 府属州与县治 | 武乡县 | county | `shanxi-wuxiang-seat` | `hvd_95520` | `approximate`／`medium` | 已独立替换（山西两批） |
| 505 | 山西 | 府属州与县治 | 隰州 | department | `shanxi-xizhou-seat` | `hvd_94039` | `approximate`／`medium` | 已独立替换（山西两批） |
| 506 | 山西 | 府属州与县治 | 夏县 | county | `shanxi-xia-seat` | `hvd_95294` | `approximate`／`medium` | 已独立替换（山西两批） |
| 507 | 山西 | 府属州与县治 | 乡宁县 | county | `shanxi-xiangning-seat` | `hvd_95438` | `approximate`／`medium` | 已独立替换（山西两批） |
| 508 | 山西 | 府属州与县治 | 襄陵县 | county | `shanxi-xiangling-seat` | `hvd_95446` | `approximate`／`medium` | 已独立替换（山西两批） |
| 509 | 山西 | 府属州与县治 | 襄垣县 | county | `shanxi-xiangyuan-seat` | `hvd_95352` | `approximate`／`medium` | 已独立替换（山西两批） |
| 510 | 山西 | 府属州与县治 | 孝义县 | county | `shanxi-xiaoyi-seat` | `hvd_95190` | `approximate`／`medium` | 已独立替换（山西两批） |
| 511 | 山西 | 府属州与县治 | 兴县 | county | `shanxi-xing-seat` | `hvd_95620` | `approximate`／`medium` | 已独立替换（山西两批） |
| 512 | 山西 | 府属州与县治 | 徐沟县 | county | `shanxi-xugou-seat` | `hvd_95625` | `approximate`／`medium` | 共址 2 个地点；已独立替换（山西两批） |
| 513 | 山西 | 府属州与县治 | 阳城县 | county | `shanxi-yangcheng-seat` | `hvd_95728` | `approximate`／`medium` | 已独立替换（山西两批） |
| 514 | 山西 | 府属州与县治 | 阳曲县 | county | `shanxi-yangqu-seat` | `hvd_95638` | `approximate`／`medium` | 共址 2 个地点；已独立替换（山西两批） |
| 515 | 山西 | 府属州与县治 | 猗氏县 | county | `shanxi-yishi-seat` | `hvd_95481` | `approximate`／`low` | 低可信；已独立替换（山西两批） |
| 516 | 山西 | 府属州与县治 | 翼城县 | county | `shanxi-yicheng-seat` | `hvd_95447` | `approximate`／`medium` | 已独立替换（山西两批） |
| 517 | 山西 | 府属州与县治 | 永和县 | county | `shanxi-yonghe-seat` | `hvd_95673` | `approximate`／`medium` | 已独立替换（山西两批） |
| 518 | 山西 | 府属州与县治 | 永宁州 | department | `shanxi-yongning-seat` | `hvd_95202` | `approximate`／`low` | 低可信；已独立替换（山西两批） |
| 519 | 山西 | 府属州与县治 | 榆次县 | county | `shanxi-yuci-seat` | `hvd_95649` | `approximate`／`medium` | 已独立替换（山西两批） |
| 520 | 山西 | 府属州与县治 | 榆社县 | county | `shanxi-yushe-seat` | `hvd_95312` | `approximate`／`medium` | 已独立替换（山西两批） |
| 521 | 山西 | 府属州与县治 | 垣曲县 | county | `shanxi-yuanqu-seat` | `hvd_95261` | `approximate`／`medium` | 已独立替换（山西两批） |
| 522 | 山西 | 府属州与县治 | 岳阳县 | county | `shanxi-yueyang-seat` | `hvd_95459` | `approximate`／`low` | 低可信；已独立替换（山西两批） |
| 523 | 山西 | 府属州与县治 | 长治县 | county | `shanxi-changzhi-seat` | `hvd_95319` | `approximate`／`medium` | 共址 2 个地点；已独立替换（山西两批） |
| 524 | 山西 | 府属州与县治 | 长子县 | county | `shanxi-changzi-seat` | `hvd_95322` | `approximate`／`medium` | 已独立替换（山西两批） |
| 525 | 山西 | 府属州与县治 | 赵城县 | county | `shanxi-zhaocheng-seat` | `hvd_95226` | `approximate`／`low` | 低可信；已独立替换（山西两批） |
| 526 | 陕西 | 一级行政区域治所 | 陕西／西安府／长安县／咸宁县 | province／prefecture／county | `xian-city` | `hvd_70626` | `approximate`／`medium` | 关联 4 个行政实体；已独立替换（陕西两批） |
| 527 | 陕西 | 府与直隶州治所 | 凤翔府／凤翔县 | prefecture／county | `fengxiang-seat` | `hvd_70896` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（陕西两批） |
| 528 | 陕西 | 府与直隶州治所 | 巩昌府／陇西县 | prefecture／county | `longxi-seat` | `hvd_70001` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（陕西两批） |
| 529 | 陕西 | 府与直隶州治所 | 汉中府／南郑县 | prefecture／county | `nanzheng-seat` | `hvd_70987` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（陕西两批） |
| 530 | 陕西 | 府与直隶州治所 | 临洮府／狄道县 | prefecture／county | `didao-seat` | `hvd_70106` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（陕西两批） |
| 531 | 陕西 | 府与直隶州治所 | 灵州 | department | `lingzhou-seat` | `hvd_70559` | `approximate`／`low` | 低可信；已独立替换（陕西两批） |
| 532 | 陕西 | 府与直隶州治所 | 平凉府／平凉县 | prefecture／county | `pingliang-seat` | `hvd_115671` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（陕西两批） |
| 533 | 陕西 | 府与直隶州治所 | 庆阳府／安化县 | prefecture／county | `qingyang-anhua-seat` | `hvd_233` | `approximate`／`low` | 关联 2 个行政实体；低可信；已独立替换（陕西两批） |
| 534 | 陕西 | 府与直隶州治所 | 兴安州 | department | `xingan-seat` | `hvd_71242` | `approximate`／`low` | 低可信；已独立替换（陕西两批） |
| 535 | 陕西 | 府与直隶州治所 | 延安府／肤施县 | prefecture／county | `fushi-seat` | `hvd_70361` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（陕西两批） |
| 536 | 陕西 | 府属州与县治 | 安定县 | county | `anding-gongchang-seat` | `hvd_70008` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 537 | 陕西 | 府属州与县治 | 安定县 | county | `anding-yanan-seat` | `hvd_70368` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 538 | 陕西 | 府属州与县治 | 安塞县 | county | `ansai-seat` | `hvd_70365` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 539 | 陕西 | 府属州与县治 | 白河县 | county | `baihe-seat` | `hvd_71208` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 540 | 陕西 | 府属州与县治 | 白水县 | county | `baishui-tongzhou-seat` | `hvd_70342` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 541 | 陕西 | 府属州与县治 | 褒城县 | county | `baocheng-seat` | `hvd_70998` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 542 | 陕西 | 府属州与县治 | 宝鸡县 | county | `baoji-seat` | `hvd_70926` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 543 | 陕西 | 府属州与县治 | 保安县 | county | `baoan-yanan-seat` | `hvd_70369` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 544 | 陕西 | 府属州与县治 | 朝邑县 | county | `chaoyi-seat` | `hvd_70306` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 545 | 陕西 | 府属州与县治 | 澄城县 | county | `chengcheng-seat` | `hvd_70310` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 546 | 陕西 | 府属州与县治 | 淳化县 | county | `chunhua-seat` | `hvd_70214` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 547 | 陕西 | 府属州与县治 | 凤县 | county | `feng-hanzhong-seat` | `hvd_71071` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 548 | 陕西 | 府属州与县治 | 伏羌县 | county | `fuqiang-seat` | `hvd_70050` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 549 | 陕西 | 府属州与县治 | 府谷县 | county | `fugu-seat` | `hvd_70406` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 550 | 陕西 | 府属州与县治 | 富平县 | county | `fuping-seat` | `hvd_70809` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 551 | 陕西 | 府属州与县治 | 甘泉县 | county | `ganquan-seat` | `hvd_70367` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 552 | 陕西 | 府属州与县治 | 高陵县 | county | `gaoling-seat` | `hvd_70745` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 553 | 陕西 | 府属州与县治 | 韩城县 | county | `hancheng-seat` | `hvd_70319` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 554 | 陕西 | 府属州与县治 | 汉阴县 | county | `hanyin-seat` | `hvd_71241` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 555 | 陕西 | 府属州与县治 | 郃阳县 | county | `heyang-tongzhou-seat` | `hvd_70308` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 556 | 陕西 | 府属州与县治 | 鄠县 | county | `hu-seat` | `hvd_70747` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 557 | 陕西 | 府属州与县治 | 华亭县 | county | `huating-pingliang-seat` | `hvd_70190` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 558 | 陕西 | 府属州与县治 | 华阴县 | county | `huayin-seat` | `hvd_70329` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 559 | 陕西 | 府属州与县治 | 会宁县 | county | `huining-seat` | `hvd_70016` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 560 | 陕西 | 府属州与县治 | 金县 | county | `jin-seat` | `hvd_70099` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 561 | 陕西 | 府属州与县治 | 泾阳县 | county | `jingyang-seat` | `hvd_70700` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 562 | 陕西 | 府属州与县治 | 蓝田县 | county | `lantian-seat` | `hvd_70756` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 563 | 陕西 | 府属州与县治 | 醴泉县 | county | `liquan-seat` | `hvd_70819` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 564 | 陕西 | 府属州与县治 | 略阳县 | county | `lueyang-seat` | `hvd_71139` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 565 | 陕西 | 府属州与县治 | 洛川县 | county | `luochuan-seat` | `hvd_70227` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 566 | 陕西 | 府属州与县治 | 洛南县 | county | `luonan-seat` | `hvd_71287` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 567 | 陕西 | 府属州与县治 | 郿县 | county | `mei-seat` | `hvd_70940` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 568 | 陕西 | 府属州与县治 | 米脂县 | county | `mizhi-seat` | `hvd_70271` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 569 | 陕西 | 府属州与县治 | 沔县 | county | `mian-seat` | `hvd_71109` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 570 | 陕西 | 府属州与县治 | 宁远县 | county | `ningyuan-seat` | `hvd_70037` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 571 | 陕西 | 府属州与县治 | 平利县 | county | `pingli-seat` | `hvd_71162` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 572 | 陕西 | 府属州与县治 | 蒲城县 | county | `pucheng-seat` | `hvd_70337` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 573 | 陕西 | 府属州与县治 | 岐山县 | county | `qishan-seat` | `hvd_70907` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 574 | 陕西 | 府属州与县治 | 汧阳县 | county | `qianyang-seat` | `hvd_71289` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 575 | 陕西 | 府属州与县治 | 三水县 | county | `sanshui-seat` | `hvd_70213` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 576 | 陕西 | 府属州与县治 | 三原县 | county | `sanyuan-seat` | `hvd_70781` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 577 | 陕西 | 府属州与县治 | 山阳县 | county | `shanyang-shangzhou-seat` | `hvd_71278` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 578 | 陕西 | 府属州与县治 | 商南县 | county | `shangnan-seat` | `hvd_71279` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 579 | 陕西 | 府属州与县治 | 神木县 | county | `shenmu-seat` | `hvd_70404` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 580 | 陕西 | 府属州与县治 | 石泉县 | county | `shiquan-seat` | `hvd_71221` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 581 | 陕西 | 府属州与县治 | 渭南县 | county | `weinan-seat` | `hvd_70794` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 582 | 陕西 | 府属州与县治 | 渭源县 | county | `weiyuan-seat` | `hvd_70113` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 583 | 陕西 | 府属州与县治 | 吴堡县 | county | `wubu-seat` | `hvd_70274` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 584 | 陕西 | 府属州与县治 | 武功县 | county | `wugong-seat` | `hvd_70252` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 585 | 陕西 | 府属州与县治 | 西和县 | county | `xihe-seat` | `hvd_70051` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 586 | 陕西 | 府属州与县治 | 西乡县 | county | `xixiang-seat` | `hvd_71035` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 587 | 陕西 | 府属州与县治 | 兴平县 | county | `xingping-seat` | `hvd_70722` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 588 | 陕西 | 府属州与县治 | 洵阳县 | county | `xunyang-seat` | `hvd_71179` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 589 | 陕西 | 府属州与县治 | 洋县 | county | `yang-seat` | `hvd_71021` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 590 | 陕西 | 府属州与县治 | 宜川县 | county | `yichuan-seat` | `hvd_70374` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 591 | 陕西 | 府属州与县治 | 宜君县 | county | `yijun-seat` | `hvd_70232` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 592 | 陕西 | 府属州与县治 | 永寿县 | county | `yongshou-seat` | `hvd_70259` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 593 | 陕西 | 府属州与县治 | 漳县 | county | `zhang-seat` | `hvd_70022` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 594 | 陕西 | 府属州与县治 | 长武县 | county | `changwu-seat` | `hvd_70215` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 595 | 陕西 | 府属州与县治 | 镇安县 | county | `zhenan-shangzhou-seat` | `hvd_71277` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 596 | 陕西 | 府属州与县治 | 中部县 | county | `zhongbu-seat` | `hvd_70225` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 597 | 陕西 | 府属州与县治 | 盩厔县 | county | `zhouzhi-seat` | `hvd_70789` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 598 | 陕西 | 府属州与县治 | 紫阳县 | county | `ziyang-xingan-seat` | `hvd_71210` | `approximate`／`medium` | 已独立替换（陕西两批） |
| 599 | 四川 | 府与直隶州治所 | 东川军民府 | prefecture | `dongchuan-seat` | `hvd_80090` | `approximate`／`medium` | 已独立替换（四川三批） |
| 600 | 四川 | 府与直隶州治所 | 夔州府／奉节县 | prefecture／county | `fengjie-seat` | `hvd_44492` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（四川三批） |
| 601 | 四川 | 府与直隶州治所 | 马湖府／屏山县 | prefecture／county | `pingshan-seat` | `hvd_96639` | `approximate`／`medium` | 关联 2 个行政实体；已独立替换（四川三批） |
| 602 | 四川 | 府属州与县治 | 安居县 | county | `anju-chongqing-seat` | `hvd_44729` | `approximate`／`medium` | 已独立替换（四川三批） |
| 603 | 四川 | 府属州与县治 | 安县 | county | `an-chengdu-seat` | `hvd_96136` | `approximate`／`medium` | 已独立替换（四川三批） |
| 604 | 四川 | 府属州与县治 | 安岳县 | county | `anyue-tongchuan-seat` | `hvd_96334` | `approximate`／`medium` | 已独立替换（四川三批） |
| 605 | 四川 | 府属州与县治 | 苍溪县 | county | `cangxi-baoning-seat` | `hvd_44582` | `approximate`／`medium` | 已独立替换（四川三批） |
| 606 | 四川 | 府属州与县治 | 大昌县 | county | `dachang-kuizhou-seat` | `hvd_44501` | `approximate`／`medium` | 已独立替换（四川三批） |
| 607 | 四川 | 府属州与县治 | 大宁县 | county | `daning-kuizhou-seat` | `hvd_44504` | `approximate`／`medium` | 已独立替换（四川三批） |
| 608 | 四川 | 府属州与县治 | 大邑县 | county | `dayi-qiongzhou-seat` | `hvd_96154` | `approximate`／`medium` | 已独立替换（四川三批） |
| 609 | 四川 | 府属州与县治 | 大竹县 | county | `dazhu-shunqing-seat` | `hvd_96282` | `approximate`／`medium` | 已独立替换（四川三批） |
| 610 | 四川 | 府属州与县治 | 大足县 | county | `dazu-chongqing-seat` | `hvd_44718` | `approximate`／`medium` | 已独立替换（四川三批） |
| 611 | 四川 | 府属州与县治 | 德阳县 | county | `deyang-chengdu-seat` | `hvd_96149` | `approximate`／`medium` | 已独立替换（四川三批） |
| 612 | 四川 | 府属州与县治 | 垫江县 | county | `dianjiang-chongqing-seat` | `hvd_44546` | `approximate`／`medium` | 已独立替换（四川三批） |
| 613 | 四川 | 府属州与县治 | 定远县 | county | `dingyuan-chongqing-seat` | `hvd_44687` | `approximate`／`medium` | 已独立替换（四川三批） |
| 614 | 四川 | 府属州与县治 | 东乡县 | county | `dongxiang-kuizhou-seat` | `hvd_96267` | `approximate`／`medium` | 已独立替换（四川三批） |
| 615 | 四川 | 府属州与县治 | 峨眉县 | county | `emei-jiading-seat` | `hvd_96066` | `approximate`／`medium` | 已独立替换（四川三批） |
| 616 | 四川 | 府属州与县治 | 酆都县 | county | `fengdu-chongqing-seat` | `hvd_44542` | `approximate`／`medium` | 已独立替换（四川三批） |
| 617 | 四川 | 府属州与县治 | 涪州 | department | `fuzhou-chongqing-seat` | `hvd_115235` | `approximate`／`medium` | 已独立替换（四川三批） |
| 618 | 四川 | 府属州与县治 | 广安州 | department | `guangan-shunqing-seat` | `hvd_96241` | `approximate`／`medium` | 已独立替换（四川三批） |
| 619 | 四川 | 府属州与县治 | 广元县 | county | `guangyuan-baoning-seat` | `hvd_44592` | `approximate`／`medium` | 已独立替换（四川三批） |
| 620 | 四川 | 府属州与县治 | 合江县 | county | `hejiang-luzhou-seat` | `hvd_96037` | `approximate`／`medium` | 已独立替换（四川三批） |
| 621 | 四川 | 府属州与县治 | 合州 | department | `hezhou-chongqing-seat` | `hvd_115318` | `approximate`／`medium` | 已独立替换（四川三批） |
| 622 | 四川 | 府属州与县治 | 洪雅县 | county | `hongya-jiading-seat` | `hvd_96068` | `approximate`／`medium` | 已独立替换（四川三批） |
| 623 | 四川 | 府属州与县治 | 夹江县 | county | `jiajiang-jiading-seat` | `hvd_96070` | `approximate`／`medium` | 已独立替换（四川三批） |
| 624 | 四川 | 府属州与县治 | 犍为县 | county | `jianwei-jiading-seat` | `hvd_96082` | `approximate`／`medium` | 已独立替换（四川三批） |
| 625 | 四川 | 府属州与县治 | 简州 | department | `jianzhou-seat` | `hvd_44474` | `approximate`／`medium` | 已独立替换（四川三批） |
| 626 | 四川 | 府属州与县治 | 建始县 | county | `jianshi-kuizhou-seat` | `hvd_45915` | `approximate`／`medium` | 已独立替换（四川三批） |
| 627 | 四川 | 府属州与县治 | 江安县 | county | `jiangan-luzhou-seat` | `hvd_96048` | `approximate`／`medium` | 已独立替换（四川三批） |
| 628 | 四川 | 府属州与县治 | 江津县 | county | `jiangjin-chongqing-seat` | `hvd_44666` | `approximate`／`medium` | 已独立替换（四川三批） |
| 629 | 四川 | 府属州与县治 | 江油县 | county | `jiangyou-longan-seat` | `hvd_96004` | `approximate`／`medium` | 已独立替换（四川三批） |
| 630 | 四川 | 府属州与县治 | 金堂县 | county | `jintang-seat` | `hvd_44458` | `approximate`／`medium` | 已独立替换（四川三批） |
| 631 | 四川 | 府属州与县治 | 井研县 | county | `jingyan-seat` | `hvd_96421` | `approximate`／`medium` | 已独立替换（四川三批） |
| 632 | 四川 | 府属州与县治 | 开县 | county | `kai-kuizhou-seat` | `hvd_44511` | `approximate`／`medium` | 已独立替换（四川三批） |
| 633 | 四川 | 府属州与县治 | 乐至县 | county | `lezhi-tongchuan-seat` | `hvd_96340` | `approximate`／`medium` | 已独立替换（四川三批） |
| 634 | 四川 | 府属州与县治 | 梁山县 | county | `liangshan-kuizhou-seat` | `hvd_44534` | `approximate`／`medium` | 已独立替换（四川三批） |
| 635 | 四川 | 府属州与县治 | 邻水县 | county | `linshui-shunqing-seat` | `hvd_96203` | `approximate`／`medium` | 已独立替换（四川三批） |
| 636 | 四川 | 府属州与县治 | 芦山县 | county | `lushan-yazhou-seat` | `hvd_96363` | `approximate`／`medium` | 已独立替换（四川三批） |
| 637 | 四川 | 府属州与县治 | 罗江县 | county | `luojiang-chengdu-seat` | `hvd_96125` | `approximate`／`medium` | 已独立替换（四川三批） |
| 638 | 四川 | 府属州与县治 | 茂州 | department | `maozhou-seat` | `hvd_96054` | `approximate`／`medium` | 已独立替换（四川三批） |
| 639 | 四川 | 府属州与县治 | 绵州 | department | `mianzhou-seat` | `hvd_96120` | `approximate`／`medium` | 已独立替换（四川三批） |
| 640 | 四川 | 府属州与县治 | 绵竹县 | county | `mianzhu-chengdu-seat` | `hvd_96141` | `approximate`／`medium` | 已独立替换（四川三批） |
| 641 | 四川 | 府属州与县治 | 名山县 | county | `mingshan-yazhou-seat` | `hvd_96377` | `approximate`／`medium` | 已独立替换（四川三批） |
| 642 | 四川 | 府属州与县治 | 纳溪县 | county | `naxi-luzhou-seat` | `hvd_96044` | `approximate`／`medium` | 已独立替换（四川三批） |
| 643 | 四川 | 府属州与县治 | 南部县 | county | `nanbu-baoning-seat` | `hvd_44573` | `approximate`／`medium` | 已独立替换（四川三批） |
| 644 | 四川 | 府属州与县治 | 南川县 | county | `nanchuan-chongqing-seat` | `hvd_44702` | `approximate`／`medium` | 已独立替换（四川三批） |
| 645 | 四川 | 府属州与县治 | 内江县 | county | `neijiang-seat` | `hvd_96406` | `approximate`／`medium` | 已独立替换（四川三批） |
| 646 | 四川 | 府属州与县治 | 彭山县 | county | `pengshan-meizhou-seat` | `hvd_96186` | `approximate`／`medium` | 已独立替换（四川三批） |
| 647 | 四川 | 府属州与县治 | 彭县 | county | `peng-seat` | `hvd_44441` | `approximate`／`medium` | 已独立替换（四川三批） |
| 648 | 四川 | 府属州与县治 | 蓬溪县 | county | `pengxi-tongchuan-seat` | `hvd_96322` | `approximate`／`medium` | 已独立替换（四川三批） |
| 649 | 四川 | 府属州与县治 | 郫县 | county | `pi-seat` | `hvd_44398` | `approximate`／`medium` | 已独立替换（四川三批） |
| 650 | 四川 | 府属州与县治 | 蒲江县 | county | `pujiang-qiongzhou-seat` | `hvd_96163` | `approximate`／`medium` | 已独立替换（四川三批） |
| 651 | 四川 | 府属州与县治 | 青神县 | county | `qingshen-meizhou-seat` | `hvd_96191` | `approximate`／`medium` | 已独立替换（四川三批） |
| 652 | 四川 | 府属州与县治 | 渠县 | county | `qu-shunqing-seat` | `hvd_96278` | `approximate`／`medium` | 已独立替换（四川三批） |
| 653 | 四川 | 府属州与县治 | 仁寿县 | county | `renshou-seat` | `hvd_96413` | `approximate`／`medium` | 已独立替换（四川三批） |
| 654 | 四川 | 府属州与县治 | 荣昌县 | county | `rongchang-chongqing-seat` | `hvd_44714` | `approximate`／`medium` | 已独立替换（四川三批） |
| 655 | 四川 | 府属州与县治 | 荣县 | county | `rong-jiading-seat` | `hvd_96086` | `approximate`／`medium` | 已独立替换（四川三批） |
| 656 | 四川 | 府属州与县治 | 射洪县 | county | `shehong-tongchuan-seat` | `hvd_96296` | `approximate`／`medium` | 已独立替换（四川三批） |
| 657 | 四川 | 府属州与县治 | 什邡县 | county | `shifang-chengdu-seat` | `hvd_44425` | `approximate`／`medium` | 已独立替换（四川三批） |
| 658 | 四川 | 府属州与县治 | 石泉县 | county | `shiquan-longan-seat` | `hvd_96012` | `approximate`／`medium` | 已独立替换（四川三批） |
| 659 | 四川 | 府属州与县治 | 双流县 | county | `shuangliu-seat` | `hvd_44405` | `approximate`／`medium` | 已独立替换（四川三批） |
| 660 | 四川 | 府属州与县治 | 通江县 | county | `tongjiang-baoning-seat` | `hvd_44614` | `approximate`／`medium` | 已独立替换（四川三批） |
| 661 | 四川 | 府属州与县治 | 铜梁县 | county | `tongliang-chongqing-seat` | `hvd_44726` | `approximate`／`medium` | 已独立替换（四川三批） |
| 662 | 四川 | 府属州与县治 | 万县 | county | `wan-kuizhou-seat` | `hvd_44520` | `approximate`／`medium` | 已独立替换（四川三批） |
| 663 | 四川 | 府属州与县治 | 威远县 | county | `weiyuan-jiading-seat` | `hvd_96100` | `approximate`／`medium` | 已独立替换（四川三批） |
| 664 | 四川 | 府属州与县治 | 温江县 | county | `wenjiang-seat` | `hvd_44457` | `approximate`／`medium` | 已独立替换（四川三批） |
| 665 | 四川 | 府属州与县治 | 汶川县 | county | `wenchuan-chengdu-seat` | `hvd_96053` | `approximate`／`medium` | 已独立替换（四川三批） |
| 666 | 四川 | 府属州与县治 | 巫山县 | county | `wushan-kuizhou-seat` | `hvd_44495` | `approximate`／`medium` | 已独立替换（四川三批） |
| 667 | 四川 | 府属州与县治 | 武隆县 | county | `wulong-chongqing-seat` | `hvd_44694` | `approximate`／`medium` | 已独立替换（四川三批） |
| 668 | 四川 | 府属州与县治 | 西充县 | county | `xichong-shunqing-seat` | `hvd_96216` | `approximate`／`medium` | 已独立替换（四川三批） |
| 669 | 四川 | 府属州与县治 | 新都县 | county | `xindu-seat` | `hvd_44418` | `approximate`／`medium` | 已独立替换（四川三批） |
| 670 | 四川 | 府属州与县治 | 新繁县 | county | `xinfan-seat` | `hvd_44451` | `approximate`／`medium` | 已独立替换（四川三批） |
| 671 | 四川 | 府属州与县治 | 新津县 | county | `xinjin-chengdu-seat` | `hvd_44415` | `approximate`／`medium` | 已独立替换（四川三批） |
| 672 | 四川 | 府属州与县治 | 新宁县 | county | `xinning-kuizhou-seat` | `hvd_96257` | `approximate`／`medium` | 已独立替换（四川三批） |
| 673 | 四川 | 府属州与县治 | 盐亭县 | county | `yanting-tongchuan-seat` | `hvd_96285` | `approximate`／`medium` | 已独立替换（四川三批） |
| 674 | 四川 | 府属州与县治 | 仪陇县 | county | `yilong-shunqing-seat` | `hvd_96197` | `approximate`／`medium` | 已独立替换（四川三批） |
| 675 | 四川 | 府属州与县治 | 营山县 | county | `yingshan-shunqing-seat` | `hvd_96228` | `approximate`／`medium` | 已独立替换（四川三批） |
| 676 | 四川 | 府属州与县治 | 永川县 | county | `yongchuan-chongqing-seat` | `hvd_44709` | `approximate`／`medium` | 已独立替换（四川三批） |
| 677 | 四川 | 府属州与县治 | 岳池县 | county | `yuechi-shunqing-seat` | `hvd_96211` | `approximate`／`medium` | 已独立替换（四川三批） |
| 678 | 四川 | 府属州与县治 | 云阳县 | county | `yunyang-kuizhou-seat` | `hvd_44513` | `approximate`／`medium` | 已独立替换（四川三批） |
| 679 | 四川 | 府属州与县治 | 彰明县 | county | `zhangming-chengdu-seat` | `hvd_96017` | `approximate`／`medium` | 已独立替换（四川三批） |
| 680 | 四川 | 府属州与县治 | 昭化县 | county | `zhaohua-baoning-seat` | `hvd_44597` | `approximate`／`medium` | 已独立替换（四川三批） |
| 681 | 四川 | 府属州与县治 | 中江县 | county | `zhongjiang-tongchuan-seat` | `hvd_96293` | `approximate`／`medium` | 已独立替换（四川三批） |
| 682 | 四川 | 府属州与县治 | 忠州 | department | `zhongzhou-chongqing-seat` | `hvd_44538` | `approximate`／`medium` | 已独立替换（四川三批） |
| 683 | 四川 | 府属州与县治 | 资县 | county | `zi-seat` | `hvd_96391` | `approximate`／`medium` | 已独立替换（四川三批） |
| 684 | 四川 | 府属州与县治 | 资阳县 | county | `ziyang-chengdu-seat` | `hvd_96394` | `approximate`／`medium` | 已独立替换（四川三批） |
| 685 | 四川 | 府属州与县治 | 梓潼县 | county | `zitong-baoning-seat` | `hvd_96110` | `approximate`／`medium` | 已独立替换（四川三批） |
| 686 | 四川 | 特殊治理／军事节点 | 太平长官司 | military | `taiping-yongning-seat` | `hvd_96353` | `approximate`／`medium` | 已独立替换（四川三批） |
| 687 | 四川 | 特殊治理／军事节点 | 天全六番招讨司 | military | `tianquan-liufan-seat` | `hvd_96388` | `approximate`／`medium` | 已独立替换（四川三批） |
| 688 | 四川 | 特殊治理／军事节点 | 永宁宣抚司 | military | `yongning-xuanfu-seat` | `hvd_96348` | `approximate`／`medium` | 已独立替换（四川三批） |
| 689 | 湖广 | 府属州与县治 | 安化县 | county | `anhua-seat` | `hvd_41723` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 690 | 湖广 | 府属州与县治 | 安仁县 | county | `anren-hengzhou-seat` | `hvd_41875` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 691 | 湖广 | 府属州与县治 | 安乡县 | county | `anxiang-seat` | `hvd_41934` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 692 | 湖广 | 府属州与县治 | 巴东县 | county | `badong-seat` | `hvd_45840` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 693 | 湖广 | 府属州与县治 | 保康县 | county | `baokang-seat` | `hvd_45955` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 694 | 湖广 | 府属州与县治 | 茶陵州 | department | `chaling-changsha-seat` | `hvd_41774` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 695 | 湖广 | 府属州与县治 | 常宁县 | county | `changning-hengzhou-seat` | `hvd_41873` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 696 | 湖广 | 府属州与县治 | 辰溪县 | county | `chenxi-chenzhou-seat` | `hvd_41807` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 697 | 湖广 | 府属州与县治 | 城步县 | county | `chengbu-baoqing-seat` | `hvd_42022` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 698 | 湖广 | 府属州与县治 | 崇阳县 | county | `chongyang-seat` | `hvd_43437` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 699 | 湖广 | 府属州与县治 | 慈利县 | county | `cili-seat` | `hvd_41942` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 700 | 湖广 | 府属州与县治 | 大冶县 | county | `daye-seat` | `hvd_43452` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 701 | 湖广 | 府属州与县治 | 当阳县 | county | `dangyang-seat` | `hvd_45780` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 702 | 湖广 | 府属州与县治 | 道州 | department | `daozhou-yongzhou-seat` | `hvd_41988` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 703 | 湖广 | 府属州与县治 | 东安县 | county | `dongan-yongzhou-seat` | `hvd_41963` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 704 | 湖广 | 府属州与县治 | 房县 | county | `fang-seat` | `hvd_45929` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 705 | 湖广 | 府属州与县治 | 公安县 | county | `gongan-seat` | `hvd_43687` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 706 | 湖广 | 府属州与县治 | 谷城县 | county | `gucheng-xiangyang-seat` | `hvd_631` | `approximate`／`low` | 低可信；低可信；已独立替换（湖广三批） |
| 707 | 湖广 | 府属州与县治 | 光化县 | county | `guanghua-seat` | `hvd_45739` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 708 | 湖广 | 府属州与县治 | 广济县 | county | `guangji-seat` | `hvd_43553` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 709 | 湖广 | 府属州与县治 | 归州 | department | `guizhou-jingzhou-seat` | `hvd_45817` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 710 | 湖广 | 府属州与县治 | 桂东县 | county | `guidong-chenzhou-seat` | `hvd_41713` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 711 | 湖广 | 府属州与县治 | 桂阳县 | county | `guiyang-chenzhou-seat` | `hvd_41711` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 712 | 湖广 | 府属州与县治 | 桂阳州 | department | `guiyang-hengzhou-seat` | `hvd_41826` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 713 | 湖广 | 府属州与县治 | 汉川县 | county | `hanchuan-seat` | `hvd_43472` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 714 | 湖广 | 府属州与县治 | 衡山县 | county | `hengshan-hengzhou-seat` | `hvd_41862` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 715 | 湖广 | 府属州与县治 | 华容县 | county | `huarong-seat` | `hvd_42107` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 716 | 湖广 | 府属州与县治 | 黄安县 | county | `huangan-seat` | `hvd_43515` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 717 | 湖广 | 府属州与县治 | 黄梅县 | county | `huangmei-seat` | `hvd_43559` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 718 | 湖广 | 府属州与县治 | 黄陂县 | county | `huangpi-seat` | `hvd_43481` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 719 | 湖广 | 府属州与县治 | 会同县 | county | `huitong-jingzhou-seat` | `hvd_41892` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 720 | 湖广 | 府属州与县治 | 嘉鱼县 | county | `jiayu-seat` | `hvd_43438` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 721 | 湖广 | 府属州与县治 | 监利县 | county | `jianli-seat` | `hvd_43708` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 722 | 湖广 | 府属州与县治 | 江华县 | county | `jianghua-daozhou-seat` | `hvd_41979` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 723 | 湖广 | 府属州与县治 | 京山县 | county | `jingshan-seat` | `hvd_43568` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 724 | 湖广 | 府属州与县治 | 荆门州 | department | `jingmen-chengtian-seat` | `hvd_45770` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 725 | 湖广 | 府属州与县治 | 景陵县 | county | `jingling-seat` | `hvd_43600` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 726 | 湖广 | 府属州与县治 | 均州 | department | `junzhou-xiangyang-seat` | `hvd_45757` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 727 | 湖广 | 府属州与县治 | 蓝山县 | county | `lanshan-hengzhou-seat` | `hvd_41823` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 728 | 湖广 | 府属州与县治 | 耒阳县 | county | `leiyang-hengzhou-seat` | `hvd_41865` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 729 | 湖广 | 府属州与县治 | 澧州 | department | `lizhou-yuezhou-seat` | `hvd_42114` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 730 | 湖广 | 府属州与县治 | 醴陵县 | county | `liling-seat` | `hvd_41728` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 731 | 湖广 | 府属州与县治 | 临武县 | county | `linwu-hengzhou-seat` | `hvd_41832` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 732 | 湖广 | 府属州与县治 | 临湘县 | county | `linxiang-seat` | `hvd_42109` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 733 | 湖广 | 府属州与县治 | 酃县 | county | `ling-hengzhou-seat` | `hvd_41878` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 734 | 湖广 | 府属州与县治 | 浏阳县 | county | `liuyang-seat` | `hvd_41733` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 735 | 湖广 | 府属州与县治 | 龙阳县 | county | `longyang-seat` | `hvd_41914` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 736 | 湖广 | 府属州与县治 | 卢溪县 | county | `luxi-chenzhou-seat` | `hvd_41800` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 737 | 湖广 | 府属州与县治 | 罗田县 | county | `luotian-seat` | `hvd_43527` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 738 | 湖广 | 府属州与县治 | 麻城县 | county | `macheng-seat` | `hvd_43533` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 739 | 湖广 | 府属州与县治 | 麻阳县 | county | `mayang-yuanzhou-seat` | `hvd_42080` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 740 | 湖广 | 府属州与县治 | 沔阳州 | department | `mianyang-chengtian-seat` | `hvd_105011` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 741 | 湖广 | 府属州与县治 | 南漳县 | county | `nanzhang-seat` | `hvd_45692` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 742 | 湖广 | 府属州与县治 | 宁乡县 | county | `ningxiang-changsha-seat` | `hvd_41790` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 743 | 湖广 | 府属州与县治 | 宁远县 | county | `ningyuan-daozhou-seat` | `hvd_41974` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 744 | 湖广 | 府属州与县治 | 平江县 | county | `pingjiang-seat` | `hvd_42099` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 745 | 湖广 | 府属州与县治 | 蒲圻县 | county | `puqi-seat` | `hvd_43431` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 746 | 湖广 | 府属州与县治 | 祁阳县 | county | `qiyang-yongzhou-seat` | `hvd_41962` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 747 | 湖广 | 府属州与县治 | 蕲水县 | county | `qishui-seat` | `hvd_43519` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 748 | 湖广 | 府属州与县治 | 蕲州 | department | `qizhou-huangzhou-seat` | `hvd_43549` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 749 | 湖广 | 府属州与县治 | 潜江县 | county | `qianjiang-seat` | `hvd_43588` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 750 | 湖广 | 府属州与县治 | 黔阳县 | county | `qianyang-yuanzhou-seat` | `hvd_42078` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 751 | 湖广 | 府属州与县治 | 上津县 | county | `shangjin-seat` | `hvd_45967` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 752 | 湖广 | 府属州与县治 | 石门县 | county | `shimen-seat` | `hvd_41948` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 753 | 湖广 | 府属州与县治 | 石首县 | county | `shishou-seat` | `hvd_43701` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 754 | 湖广 | 府属州与县治 | 松滋县 | county | `songzi-seat` | `hvd_43717` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 755 | 湖广 | 府属州与县治 | 绥宁县 | county | `suining-jingzhou-seat` | `hvd_41898` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 756 | 湖广 | 府属州与县治 | 随州 | department | `suizhou-dean-seat` | `hvd_105025` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 757 | 湖广 | 府属州与县治 | 桃源县 | county | `taoyuan-changde-seat` | `hvd_41917` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 758 | 湖广 | 府属州与县治 | 天柱县 | county | `tianzhu-jingzhou-seat` | `hvd_41899` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 759 | 湖广 | 府属州与县治 | 通城县 | county | `tongcheng-wuchang-seat` | `hvd_43443` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 760 | 湖广 | 府属州与县治 | 通道县 | county | `tongdao-jingzhou-seat` | `hvd_41894` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 761 | 湖广 | 府属州与县治 | 通山县 | county | `tongshan-seat` | `hvd_43454` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 762 | 湖广 | 府属州与县治 | 武昌县 | county | `wuchang-seat` | `hvd_43425` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 763 | 湖广 | 府属州与县治 | 武冈州 | department | `wugang-baoqing-seat` | `hvd_42026` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 764 | 湖广 | 府属州与县治 | 咸宁县 | county | `xianning-seat` | `hvd_43433` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 765 | 湖广 | 府属州与县治 | 湘潭县 | county | `xiangtan-seat` | `hvd_41738` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 766 | 湖广 | 府属州与县治 | 湘乡县 | county | `xiangxiang-seat` | `hvd_41744` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 767 | 湖广 | 府属州与县治 | 湘阴县 | county | `xiangyin-seat` | `hvd_41754` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 768 | 湖广 | 府属州与县治 | 孝感县 | county | `xiaogan-seat` | `hvd_43477` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 769 | 湖广 | 府属州与县治 | 新化县 | county | `xinhua-baoqing-seat` | `hvd_42120` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 770 | 湖广 | 府属州与县治 | 新宁县 | county | `xinning-wugang-seat` | `hvd_42113` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 771 | 湖广 | 府属州与县治 | 兴国州 | department | `xingguo-huguang-seat` | `hvd_105005` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 772 | 湖广 | 府属州与县治 | 兴宁县 | county | `xingning-chenzhou-seat` | `hvd_41697` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 773 | 湖广 | 府属州与县治 | 兴山县 | county | `xingshan-seat` | `hvd_45835` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 774 | 湖广 | 府属州与县治 | 溆浦县 | county | `xupu-chenzhou-seat` | `hvd_41808` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 775 | 湖广 | 府属州与县治 | 夷陵州 | department | `yiling-jingzhou-seat` | `hvd_45806` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 776 | 湖广 | 府属州与县治 | 宜城县 | county | `yicheng-xiangyang-seat` | `hvd_45678` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 777 | 湖广 | 府属州与县治 | 宜都县 | county | `yidu-jingzhou-seat` | `hvd_43735` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 778 | 湖广 | 府属州与县治 | 宜章县 | county | `yizhang-chenzhou-seat` | `hvd_41705` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 779 | 湖广 | 府属州与县治 | 益阳县 | county | `yiyang-seat` | `hvd_41759` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 780 | 湖广 | 府属州与县治 | 应城县 | county | `yingcheng-seat` | `hvd_43617` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 781 | 湖广 | 府属州与县治 | 应山县 | county | `yingshan-dean-seat` | `hvd_43663` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 782 | 湖广 | 府属州与县治 | 永明县 | county | `yongming-daozhou-seat` | `hvd_41986` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 783 | 湖广 | 府属州与县治 | 永兴县 | county | `yongxing-chenzhou-seat` | `hvd_41701` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 784 | 湖广 | 府属州与县治 | 攸县 | county | `you-seat` | `hvd_41766` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 785 | 湖广 | 府属州与县治 | 沅江县 | county | `yuanjiang-changde-seat` | `hvd_41924` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 786 | 湖广 | 府属州与县治 | 沅州 | department | `yuanzhou-chenzhou-seat` | `hvd_42135` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 787 | 湖广 | 府属州与县治 | 远安县 | county | `yuanan-jingzhou-seat` | `hvd_45787` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 788 | 湖广 | 府属州与县治 | 云梦县 | county | `yunmeng-seat` | `hvd_43608` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 789 | 湖广 | 府属州与县治 | 郧西县 | county | `yunxi-seat` | `hvd_45962` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 790 | 湖广 | 府属州与县治 | 郧县 | county | `yun-yunyang-seat` | `hvd_45920` | `approximate`／`low` | 低可信；已独立替换（湖广三批） |
| 791 | 湖广 | 府属州与县治 | 枣阳县 | county | `zaoyang-seat` | `hvd_45704` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 792 | 湖广 | 府属州与县治 | 长阳县 | county | `changyang-seat` | `hvd_45824` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 793 | 湖广 | 府属州与县治 | 枝江县 | county | `zhijiang-jingzhou-seat` | `hvd_43726` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 794 | 湖广 | 府属州与县治 | 竹山县 | county | `zhushan-seat` | `hvd_45938` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 795 | 湖广 | 府属州与县治 | 竹溪县 | county | `zhuxi-seat` | `hvd_45951` | `approximate`／`medium` | 已独立替换（湖广三批） |
| 796 | 浙江 | 府属州与县治 | 安吉州 | department | `zhejiang-anjizhou-seat` | `hvd_40153` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 797 | 浙江 | 府属州与县治 | 昌化县 | county | `zhejiang-changhua-seat` | `hvd_40110` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 798 | 浙江 | 府属州与县治 | 常山县 | county | `zhejiang-changshan-seat` | `hvd_40629` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 799 | 浙江 | 府属州与县治 | 崇德县 | county | `zhejiang-chongde-seat` | `hvd_40064` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 800 | 浙江 | 府属州与县治 | 淳安县 | county | `zhejiang-chunan-seat` | `hvd_40811` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 801 | 浙江 | 府属州与县治 | 慈溪县 | county | `zhejiang-cixi-seat` | `hvd_40732` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 802 | 浙江 | 府属州与县治 | 德清县 | county | `zhejiang-deqing-seat` | `hvd_40158` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 803 | 浙江 | 府属州与县治 | 定海县 | county | `zhejiang-dinghai-seat` | `hvd_40745` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 804 | 浙江 | 府属州与县治 | 东阳县 | county | `zhejiang-dongyang-seat` | `hvd_40725` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 805 | 浙江 | 府属州与县治 | 分水县 | county | `zhejiang-fenshui-seat` | `hvd_40799` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 806 | 浙江 | 府属州与县治 | 奉化县 | county | `zhejiang-fenghua-seat` | `hvd_40735` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 807 | 浙江 | 府属州与县治 | 富阳县 | county | `zhejiang-fuyang-seat` | `hvd_40092` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 808 | 浙江 | 府属州与县治 | 归安县 | county | `zhejiang-guian-seat` | `hvd_40128` | `approximate`／`medium` | 共址 2 个地点；已独立替换（浙江两批） |
| 809 | 浙江 | 府属州与县治 | 海宁县 | county | `zhejiang-haining-seat` | `hvd_40117` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 810 | 浙江 | 府属州与县治 | 海盐县 | county | `zhejiang-haiyan-seat` | `hvd_40075` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 811 | 浙江 | 府属州与县治 | 黄岩县 | county | `zhejiang-huangyan-seat` | `hvd_40653` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 812 | 浙江 | 府属州与县治 | 嘉善县 | county | `zhejiang-jiashan-seat` | `hvd_40059` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 813 | 浙江 | 府属州与县治 | 嘉兴县 | county | `zhejiang-jiaxing-seat` | `hvd_40057` | `approximate`／`medium` | 共址 2 个地点；已独立替换（浙江两批） |
| 814 | 浙江 | 府属州与县治 | 建德县 | county | `zhejiang-jiande-seat` | `hvd_40803` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 815 | 浙江 | 府属州与县治 | 江山县 | county | `zhejiang-jiangshan-seat` | `hvd_40634` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 816 | 浙江 | 府属州与县治 | 金华县 | county | `zhejiang-jinhua-seat` | `hvd_40708` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 817 | 浙江 | 府属州与县治 | 缙云县 | county | `zhejiang-jinyun-seat` | `hvd_40597` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 818 | 浙江 | 府属州与县治 | 景宁县 | county | `zhejiang-jingning-seat` | `hvd_40598` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 819 | 浙江 | 府属州与县治 | 开化县 | county | `zhejiang-kaihua-seat` | `hvd_40635` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 820 | 浙江 | 府属州与县治 | 兰溪县 | county | `zhejiang-lanxi-seat` | `hvd_40712` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 821 | 浙江 | 府属州与县治 | 乐清县 | county | `zhejiang-yueqing-seat` | `hvd_40680` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 822 | 浙江 | 府属州与县治 | 丽水县 | county | `zhejiang-lishui-seat` | `hvd_40602` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 823 | 浙江 | 府属州与县治 | 临安县 | county | `zhejiang-linan-seat` | `hvd_40098` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 824 | 浙江 | 府属州与县治 | 临海县 | county | `zhejiang-linhai-seat` | `hvd_40657` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 825 | 浙江 | 府属州与县治 | 龙泉县 | county | `zhejiang-longquan-seat` | `hvd_40606` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 826 | 浙江 | 府属州与县治 | 龙游县 | county | `zhejiang-longyou-seat` | `hvd_40643` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 827 | 浙江 | 府属州与县治 | 宁海县 | county | `zhejiang-ninghai-seat` | `hvd_40661` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 828 | 浙江 | 府属州与县治 | 平湖县 | county | `zhejiang-pinghu-seat` | `hvd_40061` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 829 | 浙江 | 府属州与县治 | 平阳县 | county | `zhejiang-pingyang-seat` | `hvd_40687` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 830 | 浙江 | 府属州与县治 | 浦江县 | county | `zhejiang-pujiang-seat` | `hvd_40715` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 831 | 浙江 | 府属州与县治 | 青田县 | county | `zhejiang-qingtian-seat` | `hvd_40607` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 832 | 浙江 | 府属州与县治 | 庆元县 | county | `zhejiang-qingyuan-seat` | `hvd_40609` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 833 | 浙江 | 府属州与县治 | 瑞安县 | county | `zhejiang-ruian-seat` | `hvd_40695` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 834 | 浙江 | 府属州与县治 | 上虞县 | county | `zhejiang-shangyu-seat` | `hvd_40774` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 835 | 浙江 | 府属州与县治 | 嵊县 | county | `zhejiang-sheng-seat` | `hvd_40768` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 836 | 浙江 | 府属州与县治 | 寿昌县 | county | `zhejiang-shouchang-seat` | `hvd_40819` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 837 | 浙江 | 府属州与县治 | 松阳县 | county | `zhejiang-songyang-seat` | `hvd_40615` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 838 | 浙江 | 府属州与县治 | 遂安县 | county | `zhejiang-suian-seat` | `hvd_40822` | `approximate`／`low` | 低可信；已独立替换（浙江两批） |
| 839 | 浙江 | 府属州与县治 | 遂昌县 | county | `zhejiang-suichang-seat` | `hvd_40620` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 840 | 浙江 | 府属州与县治 | 太平县 | county | `zhejiang-taiping-zhejiang-seat` | `hvd_40662` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 841 | 浙江 | 府属州与县治 | 泰顺县 | county | `zhejiang-taishun-seat` | `hvd_40696` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 842 | 浙江 | 府属州与县治 | 汤溪县 | county | `zhejiang-tangxi-seat` | `hvd_40713` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 843 | 浙江 | 府属州与县治 | 天台县 | county | `zhejiang-tiantai-seat` | `hvd_40671` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 844 | 浙江 | 府属州与县治 | 桐庐县 | county | `zhejiang-tonglu-seat` | `hvd_40815` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 845 | 浙江 | 府属州与县治 | 桐乡县 | county | `zhejiang-tongxiang-seat` | `hvd_40060` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 846 | 浙江 | 府属州与县治 | 乌程县 | county | `zhejiang-wucheng-seat` | `hvd_40127` | `approximate`／`medium` | 共址 2 个地点；已独立替换（浙江两批） |
| 847 | 浙江 | 府属州与县治 | 武康县 | county | `zhejiang-wukang-seat` | `hvd_40135` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 848 | 浙江 | 府属州与县治 | 武义县 | county | `zhejiang-wuyi-seat` | `hvd_40730` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 849 | 浙江 | 府属州与县治 | 西安县 | county | `zhejiang-xian-zhejiang-seat` | `hvd_40648` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 850 | 浙江 | 府属州与县治 | 仙居县 | county | `zhejiang-xianju-seat` | `hvd_40676` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 851 | 浙江 | 府属州与县治 | 象山县 | county | `zhejiang-xiangshan-seat` | `hvd_40756` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 852 | 浙江 | 府属州与县治 | 萧山县 | county | `zhejiang-xiaoshan-seat` | `hvd_40784` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 853 | 浙江 | 府属州与县治 | 孝丰县 | county | `zhejiang-xiaofeng-seat` | `hvd_40155` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 854 | 浙江 | 府属州与县治 | 新昌县 | county | `zhejiang-xinchang-seat` | `hvd_40777` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 855 | 浙江 | 府属州与县治 | 新城县 | county | `zhejiang-xincheng-seat` | `hvd_40123` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 856 | 浙江 | 府属州与县治 | 秀水县 | county | `zhejiang-xiushui-seat` | `hvd_40058` | `approximate`／`medium` | 共址 2 个地点；已独立替换（浙江两批） |
| 857 | 浙江 | 府属州与县治 | 宣平县 | county | `zhejiang-xuanping-seat` | `hvd_40621` | `approximate`／`low` | 低可信；已独立替换（浙江两批） |
| 858 | 浙江 | 府属州与县治 | 义乌县 | county | `zhejiang-yiwu-seat` | `hvd_40720` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 859 | 浙江 | 府属州与县治 | 鄞县 | county | `zhejiang-yin-seat` | `hvd_40743` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 860 | 浙江 | 府属州与县治 | 永嘉县 | county | `zhejiang-yongjia-seat` | `hvd_40701` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 861 | 浙江 | 府属州与县治 | 永康县 | county | `zhejiang-yongkang-seat` | `hvd_40727` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 862 | 浙江 | 府属州与县治 | 于潜县 | county | `zhejiang-yuqian-seat` | `hvd_40100` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 863 | 浙江 | 府属州与县治 | 余杭县 | county | `zhejiang-yuhang-seat` | `hvd_40085` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 864 | 浙江 | 府属州与县治 | 余姚县 | county | `zhejiang-yuyao-seat` | `hvd_40788` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 865 | 浙江 | 府属州与县治 | 云和县 | county | `zhejiang-yunhe-seat` | `hvd_40622` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 866 | 浙江 | 府属州与县治 | 长兴县 | county | `zhejiang-changxing-seat` | `hvd_40144` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 867 | 浙江 | 府属州与县治 | 诸暨县 | county | `zhejiang-zhuji-seat` | `hvd_40796` | `approximate`／`medium` | 已独立替换（浙江两批） |
| 868 | 江西 | 府与直隶州治所 | 临江府／清江县 | prefecture／county | `qingjiang-seat` | `hvd_40941`／`hvd_32539` | `approximate`／`medium` | 关联 2 个行政实体；多编号 2；已独立替换（江西压力测试） |
| 869 | 江西 | 府属州与县治 | 安福县 | county | `jiangxi-anfu-seat` | `hvd_40913` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 870 | 江西 | 府属州与县治 | 安仁县 | county | `jiangxi-anren-seat` | `hvd_41187` | `approximate`／`low` | 已独立替换（江西压力测试）；低可信；历史现代对应待二次复核 |
| 871 | 江西 | 府属州与县治 | 安义县 | county | `jiangxi-anyi-seat` | `hvd_41140` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 872 | 江西 | 府属州与县治 | 安远县 | county | `jiangxi-anyuan-seat` | `hvd_40849` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 873 | 江西 | 府属州与县治 | 崇仁县 | county | `jiangxi-chongren-seat` | `hvd_40999` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 874 | 江西 | 府属州与县治 | 崇义县 | county | `jiangxi-chongyi-seat` | `hvd_40877` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 875 | 江西 | 府属州与县治 | 德安县 | county | `jiangxi-dean-seat` | `hvd_41150` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 876 | 江西 | 府属州与县治 | 德兴县 | county | `jiangxi-dexing-seat` | `hvd_41167` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 877 | 江西 | 府属州与县治 | 定南县 | county | `jiangxi-dingnan-seat` | `hvd_40855` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 878 | 江西 | 府属州与县治 | 东乡县 | county | `jiangxi-dongxiang-seat` | `hvd_41005` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 879 | 江西 | 府属州与县治 | 都昌县 | county | `jiangxi-duchang-seat` | `hvd_41133` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 880 | 江西 | 府属州与县治 | 分宜县 | county | `jiangxi-fenyi-seat` | `hvd_40970` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 881 | 江西 | 府属州与县治 | 丰城县 | county | `jiangxi-fengcheng-seat` | `hvd_41106` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 882 | 江西 | 府属州与县治 | 奉新县 | county | `jiangxi-fengxin-seat` | `hvd_41115` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 883 | 江西 | 府属州与县治 | 浮梁县 | county | `jiangxi-fuliang-seat` | `hvd_41185` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 884 | 江西 | 府属州与县治 | 广昌县 | county | `jiangxi-guangchang-seat` | `hvd_40988` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 885 | 江西 | 府属州与县治 | 贵溪县 | county | `jiangxi-guixi-seat` | `hvd_41204` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 886 | 江西 | 府属州与县治 | 湖口县 | county | `jiangxi-hukou-seat` | `hvd_41153` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 887 | 江西 | 府属州与县治 | 会昌县 | county | `jiangxi-huichang-seat` | `hvd_40845` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 888 | 江西 | 府属州与县治 | 吉水县 | county | `jiangxi-jishui-seat` | `hvd_40897` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 889 | 江西 | 府属州与县治 | 建昌县 | county | `jiangxi-jianchang-nankang-seat` | `hvd_41139` | `approximate`／`low` | 已独立替换（江西压力测试）；低可信；历史现代对应待二次复核 |
| 890 | 江西 | 府属州与县治 | 金溪县 | county | `jiangxi-jinxi-seat` | `hvd_41000` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 891 | 江西 | 府属州与县治 | 进贤县 | county | `jiangxi-jinxian-seat` | `hvd_41110` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 892 | 江西 | 府属州与县治 | 靖安县 | county | `jiangxi-jingan-seat` | `hvd_41116` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 893 | 江西 | 府属州与县治 | 乐安县 | county | `jiangxi-lean-seat` | `hvd_41004` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 894 | 江西 | 府属州与县治 | 乐平县 | county | `jiangxi-leping-seat` | `hvd_41180` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 895 | 江西 | 府属州与县治 | 龙南县 | county | `jiangxi-longnan-seat` | `hvd_40854` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 896 | 江西 | 府属州与县治 | 龙泉县 | county | `jiangxi-longquan-jian-seat` | `hvd_40917` | `approximate`／`low` | 已独立替换（江西压力测试）；低可信；历史现代对应待二次复核 |
| 897 | 江西 | 府属州与县治 | 泸溪县 | county | `jiangxi-luxi-seat` | `hvd_40989` | `approximate`／`low` | 已独立替换（江西压力测试）；低可信；历史现代对应待二次复核 |
| 898 | 江西 | 府属州与县治 | 南丰县 | county | `jiangxi-nanfeng-seat` | `hvd_40987` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 899 | 江西 | 府属州与县治 | 南康县 | county | `jiangxi-nankang-county-seat` | `hvd_40872` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 900 | 江西 | 府属州与县治 | 宁都县 | county | `jiangxi-ningdu-seat` | `hvd_40868` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 901 | 江西 | 府属州与县治 | 宁州 | department | `jiangxi-ningzhou-seat` | `hvd_41125` | `approximate`／`low` | 已独立替换（江西压力测试）；低可信；历史现代对应待二次复核 |
| 902 | 江西 | 府属州与县治 | 彭泽县 | county | `jiangxi-pengze-seat` | `hvd_41158` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 903 | 江西 | 府属州与县治 | 萍乡县 | county | `jiangxi-pingxiang-seat` | `hvd_40974` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 904 | 江西 | 府属州与县治 | 铅山县 | county | `jiangxi-qianshan-seat` | `hvd_41207` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 905 | 江西 | 府属州与县治 | 瑞昌县 | county | `jiangxi-ruichang-seat` | `hvd_41152` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 906 | 江西 | 府属州与县治 | 瑞金县 | county | `jiangxi-ruijin-seat` | `hvd_40859` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 907 | 江西 | 府属州与县治 | 上高县 | county | `jiangxi-shanggao-seat` | `hvd_41223` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 908 | 江西 | 府属州与县治 | 上犹县 | county | `jiangxi-shangyou-seat` | `hvd_40876` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 909 | 江西 | 府属州与县治 | 石城县 | county | `jiangxi-shicheng-seat` | `hvd_40860` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 910 | 江西 | 府属州与县治 | 泰和县 | county | `jiangxi-taihe-seat` | `hvd_40894` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 911 | 江西 | 府属州与县治 | 万安县 | county | `jiangxi-wanan-seat` | `hvd_40921` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 912 | 江西 | 府属州与县治 | 万年县 | county | `jiangxi-wannian-seat` | `hvd_41186` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 913 | 江西 | 府属州与县治 | 万载县 | county | `jiangxi-wanzai-seat` | `hvd_40979` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 914 | 江西 | 府属州与县治 | 武宁县 | county | `jiangxi-wuning-seat` | `hvd_41122` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 915 | 江西 | 府属州与县治 | 峡江县 | county | `jiangxi-xiajiang-seat` | `hvd_40956` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 916 | 江西 | 府属州与县治 | 新昌县 | county | `jiangxi-xinchang-seat` | `hvd_41227` | `approximate`／`low` | 已独立替换（江西压力测试）；低可信；历史现代对应待二次复核 |
| 917 | 江西 | 府属州与县治 | 新城县 | county | `jiangxi-xincheng-jianchang-seat` | `hvd_40983` | `approximate`／`low` | 已独立替换（江西压力测试）；低可信；历史现代对应待二次复核 |
| 918 | 江西 | 府属州与县治 | 新淦县 | county | `jiangxi-xingan-linjiang-seat` | `hvd_40947` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 919 | 江西 | 府属州与县治 | 新喻县 | county | `jiangxi-xinyu-seat` | `hvd_40955` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 920 | 江西 | 府属州与县治 | 信丰县 | county | `jiangxi-xinfeng-ganzhou-seat` | `hvd_40841` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 921 | 江西 | 府属州与县治 | 兴安县 | county | `jiangxi-xingan-seat` | `hvd_41213` | `approximate`／`low` | 已独立替换（江西压力测试）；低可信；历史现代对应待二次复核 |
| 922 | 江西 | 府属州与县治 | 兴国县 | county | `jiangxi-xingguo-seat` | `hvd_40842` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 923 | 江西 | 府属州与县治 | 宜黄县 | county | `jiangxi-yihuang-seat` | `hvd_41003` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 924 | 江西 | 府属州与县治 | 弋阳县 | county | `jiangxi-yiyang-seat` | `hvd_41203` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 925 | 江西 | 府属州与县治 | 永丰县 | county | `jiangxi-yongfeng-seat` | `hvd_41209` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 926 | 江西 | 府属州与县治 | 永宁县 | county | `jiangxi-yongning-jian-seat` | `hvd_40928` | `approximate`／`low` | 已独立替换（江西压力测试）；低可信；历史现代对应待二次复核 |
| 927 | 江西 | 府属州与县治 | 永新县 | county | `jiangxi-yongxin-seat` | `hvd_40926` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 928 | 江西 | 府属州与县治 | 余干县 | county | `jiangxi-yugan-seat` | `hvd_41173` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 929 | 江西 | 府属州与县治 | 雩都县 | county | `jiangxi-yudu-seat` | `hvd_40839` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 930 | 江西 | 府属州与县治 | 玉山县 | county | `jiangxi-yushan-seat` | `hvd_41214` | `approximate`／`medium` | 已独立替换（江西压力测试） |
| 931 | 江西 | 府属州与县治 | 长宁县 | county | `jiangxi-changning-ganzhou-seat` | `hvd_40850` | `approximate`／`low` | 已独立替换（江西压力测试）；低可信；历史现代对应待二次复核 |
| 932 | 福建 | 府属州与县治 | 安溪县 | county | `fujian-anxi-seat` | `hvd_40262` | `approximate`／`medium` | 已独立替换（福建试验） |
| 933 | 福建 | 府属州与县治 | 崇安县 | county | `fujian-chongan-seat` | `hvd_40235` | `approximate`／`medium` | 已独立替换（福建试验） |
| 934 | 福建 | 府属州与县治 | 大田县 | county | `fujian-datian-seat` | `hvd_40323` | `approximate`／`medium` | 已独立替换（福建试验） |
| 935 | 福建 | 府属州与县治 | 德化县 | county | `fujian-dehua-seat` | `hvd_40322` | `approximate`／`medium` | 已独立替换（福建试验） |
| 936 | 福建 | 府属州与县治 | 福安县 | county | `fujian-fuan-seat` | `hvd_40201` | `approximate`／`medium` | 已独立替换（福建试验） |
| 937 | 福建 | 府属州与县治 | 福清县 | county | `fujian-fuqing-seat` | `hvd_40198` | `approximate`／`medium` | 已独立替换（福建试验） |
| 938 | 福建 | 府属州与县治 | 古田县 | county | `fujian-gutian-seat` | `hvd_40207` | `approximate`／`medium` | 已独立替换（福建试验） |
| 939 | 福建 | 府属州与县治 | 光泽县 | county | `fujian-guangze-seat` | `hvd_40273` | `approximate`／`medium` | 已独立替换（福建试验） |
| 940 | 福建 | 府属州与县治 | 归化县 | county | `fujian-guihua-seat` | `hvd_40288` | `approximate`／`low` | 低可信；已独立替换（福建试验） |
| 941 | 福建 | 府属州与县治 | 海澄县 | county | `fujian-haicheng-seat` | `hvd_40332` | `approximate`／`medium` | 已独立替换（福建试验） |
| 942 | 福建 | 府属州与县治 | 惠安县 | county | `fujian-huian-seat` | `hvd_40258` | `approximate`／`medium` | 已独立替换（福建试验） |
| 943 | 福建 | 府属州与县治 | 建宁县 | county | `fujian-shaowu-jianning-seat` | `hvd_40277` | `approximate`／`medium` | 已独立替换（福建试验） |
| 944 | 福建 | 府属州与县治 | 建阳县 | county | `fujian-jianyang-seat` | `hvd_40241` | `approximate`／`medium` | 已独立替换（福建试验） |
| 945 | 福建 | 府属州与县治 | 将乐县 | county | `fujian-jianle-seat` | `hvd_40313` | `approximate`／`medium` | 已独立替换（福建试验） |
| 946 | 福建 | 府属州与县治 | 连城县 | county | `fujian-liancheng-seat` | `hvd_40290` | `approximate`／`medium` | 已独立替换（福建试验） |
| 947 | 福建 | 府属州与县治 | 连江县 | county | `fujian-lianjiang-seat` | `hvd_40200` | `approximate`／`medium` | 已独立替换（福建试验） |
| 948 | 福建 | 府属州与县治 | 龙岩县 | county | `fujian-longyan-seat` | `hvd_40324` | `approximate`／`medium` | 已独立替换（福建试验） |
| 949 | 福建 | 府属州与县治 | 罗源县 | county | `fujian-luoyuan-seat` | `hvd_40204` | `approximate`／`medium` | 已独立替换（福建试验） |
| 950 | 福建 | 府属州与县治 | 闽清县 | county | `fujian-minqing-seat` | `hvd_40210` | `approximate`／`medium` | 已独立替换（福建试验） |
| 951 | 福建 | 府属州与县治 | 南安县 | county | `fujian-nanan-seat` | `hvd_40256` | `approximate`／`medium` | 已独立替换（福建试验） |
| 952 | 福建 | 府属州与县治 | 南靖县 | county | `fujian-nanjing-seat` | `hvd_40338` | `approximate`／`medium` | 已独立替换（福建试验） |
| 953 | 福建 | 府属州与县治 | 宁德县 | county | `fujian-ningde-seat` | `hvd_40223` | `approximate`／`medium` | 已独立替换（福建试验） |
| 954 | 福建 | 府属州与县治 | 宁化县 | county | `fujian-ninghua-seat` | `hvd_40285` | `approximate`／`medium` | 已独立替换（福建试验） |
| 955 | 福建 | 府属州与县治 | 宁洋县 | county | `fujian-ningyang-seat` | `hvd_40326` | `approximate`／`low` | 低可信；已独立替换（福建试验） |
| 956 | 福建 | 府属州与县治 | 平和县 | county | `fujian-pinghe-seat` | `hvd_40340` | `approximate`／`medium` | 已独立替换（福建试验） |
| 957 | 福建 | 府属州与县治 | 浦城县 | county | `fujian-pucheng-seat` | `hvd_40248` | `approximate`／`medium` | 已独立替换（福建试验） |
| 958 | 福建 | 府属州与县治 | 清流县 | county | `fujian-qingliu-seat` | `hvd_40287` | `approximate`／`medium` | 已独立替换（福建试验） |
| 959 | 福建 | 府属州与县治 | 沙县 | county | `fujian-sha-seat` | `hvd_40317` | `approximate`／`medium` | 已独立替换（福建试验） |
| 960 | 福建 | 府属州与县治 | 上杭县 | county | `fujian-shanghang-seat` | `hvd_40294` | `approximate`／`medium` | 已独立替换（福建试验） |
| 961 | 福建 | 府属州与县治 | 寿宁县 | county | `fujian-shouning-seat` | `hvd_40224` | `approximate`／`medium` | 已独立替换（福建试验） |
| 962 | 福建 | 府属州与县治 | 顺昌县 | county | `fujian-shunchang-seat` | `hvd_40309` | `approximate`／`medium` | 已独立替换（福建试验） |
| 963 | 福建 | 府属州与县治 | 松溪县 | county | `fujian-songxi-seat` | `hvd_40251` | `approximate`／`medium` | 已独立替换（福建试验） |
| 964 | 福建 | 府属州与县治 | 泰宁县 | county | `fujian-taining-seat` | `hvd_40279` | `approximate`／`medium` | 已独立替换（福建试验） |
| 965 | 福建 | 府属州与县治 | 同安县 | county | `fujian-tongan-seat` | `hvd_40260` | `approximate`／`medium` | 已独立替换（福建试验） |
| 966 | 福建 | 府属州与县治 | 武平县 | county | `fujian-wuping-seat` | `hvd_40295` | `approximate`／`medium` | 已独立替换（福建试验） |
| 967 | 福建 | 府属州与县治 | 仙游县 | county | `fujian-xianyou-seat` | `hvd_40300` | `approximate`／`medium` | 已独立替换（福建试验） |
| 968 | 福建 | 府属州与县治 | 永安县 | county | `fujian-yongan-seat` | `hvd_40319` | `approximate`／`medium` | 已独立替换（福建试验） |
| 969 | 福建 | 府属州与县治 | 永春县 | county | `fujian-yongchun-seat` | `hvd_40321` | `approximate`／`medium` | 已独立替换（福建试验） |
| 970 | 福建 | 府属州与县治 | 永定县 | county | `fujian-yongding-seat` | `hvd_40296` | `approximate`／`medium` | 已独立替换（福建试验） |
| 971 | 福建 | 府属州与县治 | 永福县 | county | `fujian-yongfu-seat` | `hvd_40212` | `approximate`／`low` | 低可信；已独立替换（福建试验） |
| 972 | 福建 | 府属州与县治 | 尤溪县 | county | `fujian-youxi-seat` | `hvd_40318` | `approximate`／`medium` | 已独立替换（福建试验） |
| 973 | 福建 | 府属州与县治 | 漳平县 | county | `fujian-zhangping-seat` | `hvd_40325` | `approximate`／`medium` | 已独立替换（福建试验） |
| 974 | 福建 | 府属州与县治 | 漳浦县 | county | `fujian-zhangpu-seat` | `hvd_40331` | `approximate`／`medium` | 已独立替换（福建试验） |
| 975 | 福建 | 府属州与县治 | 长乐县 | county | `fujian-changle-seat` | `hvd_40828` | `approximate`／`medium` | 已独立替换（福建试验） |
| 976 | 福建 | 府属州与县治 | 长泰县 | county | `fujian-changtai-seat` | `hvd_40339` | `approximate`／`medium` | 已独立替换（福建试验） |
| 977 | 福建 | 府属州与县治 | 诏安县 | county | `fujian-zhaoan-seat` | `hvd_40342` | `approximate`／`medium` | 已独立替换（福建试验） |
| 978 | 福建 | 府属州与县治 | 政和县 | county | `fujian-zhenghe-seat` | `hvd_40253` | `approximate`／`medium` | 已独立替换（福建试验） |
| 979 | 广东 | 府与直隶州治所 | 廉州府／合浦县 | prefecture／county | `hepu-seat` | `hvd_42526`／`hvd_33011` | `approximate`／`medium` | 关联 2 个行政实体；多编号 2；已独立替换（广东两批） |
| 980 | 广东 | 府与直隶州治所 | 琼州府／琼山县 | prefecture／county | `qiongshan-seat` | `hvd_42455`／`hvd_33070` | `approximate`／`medium` | 关联 2 个行政实体；多编号 2；已独立替换（广东两批） |
| 981 | 广东 | 府属州与县治 | 安定县 | county | `anding-qiongzhou-seat` | `hvd_121106` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 982 | 广东 | 府属州与县治 | 博罗县 | county | `boluo-huizhou-seat` | `hvd_42171` | `approximate`／`medium` | 已独立替换（广东两批） |
| 983 | 广东 | 府属州与县治 | 昌化县 | county | `changhua-danzhou-seat` | `hvd_42482` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 984 | 广东 | 府属州与县治 | 潮阳县 | county | `chaoyang-chaozhou-seat` | `hvd_42146` | `approximate`／`medium` | 已独立替换（广东两批） |
| 985 | 广东 | 府属州与县治 | 程乡县 | county | `chengxiang-chaozhou-seat` | `hvd_42576` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 986 | 广东 | 府属州与县治 | 澄海县 | county | `chenghai-chaozhou-seat` | `hvd_42156` | `approximate`／`medium` | 已独立替换（广东两批） |
| 987 | 广东 | 府属州与县治 | 澄迈县 | county | `chengmai-qiongzhou-seat` | `hvd_42456` | `approximate`／`medium` | 已独立替换（广东两批） |
| 988 | 广东 | 府属州与县治 | 从化县 | county | `conghua-guangzhou-seat` | `hvd_42209` | `approximate`／`medium` | 已独立替换（广东两批） |
| 989 | 广东 | 府属州与县治 | 大埔县 | county | `dabu-chaozhou-seat` | `hvd_42155` | `approximate`／`medium` | 已独立替换（广东两批） |
| 990 | 广东 | 府属州与县治 | 儋州 | department | `dan-qiongzhou-seat` | `hvd_42477` | `approximate`／`medium` | 已独立替换（广东两批） |
| 991 | 广东 | 府属州与县治 | 德庆州 | department | `deqing-zhaoqing-seat` | `hvd_42353` | `approximate`／`medium` | 已独立替换（广东两批） |
| 992 | 广东 | 府属州与县治 | 电白县 | county | `dianbai-gaozhou-seat` | `hvd_42386` | `approximate`／`medium` | 已独立替换（广东两批；视觉校正） |
| 993 | 广东 | 府属州与县治 | 东安州 | department | `dongan-luoding-seat` | `hvd_42624` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 994 | 广东 | 府属州与县治 | 东莞县 | county | `dongguan-guangzhou-seat` | `hvd_42205` | `approximate`／`medium` | 已独立替换（广东两批） |
| 995 | 广东 | 府属州与县治 | 恩平县 | county | `enping-zhaoqing-seat` | `hvd_42331` | `approximate`／`medium` | 已独立替换（广东两批） |
| 996 | 广东 | 府属州与县治 | 封川县 | county | `fengchuan-deqing-seat` | `hvd_42373` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 997 | 广东 | 府属州与县治 | 感恩县 | county | `ganen-yazhou-seat` | `hvd_121115` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 998 | 广东 | 府属州与县治 | 高明县 | county | `gaoming-zhaoqing-seat` | `hvd_42325` | `approximate`／`medium` | 已独立替换（广东两批） |
| 999 | 广东 | 府属州与县治 | 广宁县 | county | `guangning-zhaoqing-seat` | `hvd_42339` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1000 | 广东 | 府属州与县治 | 海丰县 | county | `haifeng-huizhou-seat` | `hvd_42180` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1001 | 广东 | 府属州与县治 | 和平县 | county | `heping-huizhou-seat` | `hvd_42192` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1002 | 广东 | 府属州与县治 | 河源县 | county | `heyuan-huizhou-seat` | `hvd_42190` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1003 | 广东 | 府属州与县治 | 化州 | department | `huazhou-gaozhou-seat` | `hvd_42407` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1004 | 广东 | 府属州与县治 | 会同县 | county | `huitong-qiongzhou-seat` | `hvd_42462` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 1005 | 广东 | 府属州与县治 | 惠来县 | county | `huilai-chaozhou-seat` | `hvd_42152` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1006 | 广东 | 府属州与县治 | 揭阳县 | county | `jieyang-chaozhou-seat` | `hvd_42149` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1007 | 广东 | 府属州与县治 | 开建县 | county | `kaijian-deqing-seat` | `hvd_42375` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 1008 | 广东 | 府属州与县治 | 乐昌县 | county | `lechang-shaozhou-seat` | `hvd_42243` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1009 | 广东 | 府属州与县治 | 乐会县 | county | `lehui-qiongzhou-seat` | `hvd_42468` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 1010 | 广东 | 府属州与县治 | 连山县 | county | `lianshan-lianzhou-seat` | `hvd_42614` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1011 | 广东 | 府属州与县治 | 连州 | department | `lianzhou-guangzhou-seat` | `hvd_42620` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1012 | 广东 | 府属州与县治 | 临高县 | county | `lingao-qiongzhou-seat` | `hvd_42471` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1013 | 广东 | 府属州与县治 | 灵山县 | county | `lingshan-qinzhou-seat` | `hvd_42569` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1014 | 广东 | 府属州与县治 | 陵水县 | county | `lingshui-wanzhou-seat` | `hvd_42500` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1015 | 广东 | 府属州与县治 | 龙川县 | county | `longchuan-huizhou-seat` | `hvd_42188` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1016 | 广东 | 府属州与县治 | 龙门县 | county | `longmen-guangzhou-seat` | `hvd_42210` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1017 | 广东 | 府属州与县治 | 平远县 | county | `pingyuan-chaozhou-seat` | `hvd_42588` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1018 | 广东 | 府属州与县治 | 普宁县 | county | `puning-chaozhou-seat` | `hvd_42160` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1019 | 广东 | 府属州与县治 | 钦州 | department | `qinzhou-lianzhou-seat` | `hvd_320` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 1020 | 广东 | 府属州与县治 | 清远县 | county | `qingyuan-guangzhou-seat` | `hvd_42232` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1021 | 广东 | 府属州与县治 | 饶平县 | county | `raoping-chaozhou-seat` | `hvd_42150` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1022 | 广东 | 府属州与县治 | 仁化县 | county | `renhua-shaozhou-seat` | `hvd_42247` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1023 | 广东 | 府属州与县治 | 乳源县 | county | `ruyuan-shaozhou-seat` | `hvd_42249` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1024 | 广东 | 府属州与县治 | 三水县 | county | `sanshui-guangzhou-seat` | `hvd_42227` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1025 | 广东 | 府属州与县治 | 石城县 | county | `shicheng-huazhou-seat` | `hvd_42420` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 1026 | 广东 | 府属州与县治 | 始兴县 | county | `shixing-nanxiong-seat` | `hvd_42596` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1027 | 广东 | 府属州与县治 | 顺德县 | county | `shunde-guangzhou-seat` | `hvd_42202` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1028 | 广东 | 府属州与县治 | 四会县 | county | `sihui-zhaoqing-seat` | `hvd_42270` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1029 | 广东 | 府属州与县治 | 遂溪县 | county | `suixi-leizhou-seat` | `hvd_42441` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1030 | 广东 | 府属州与县治 | 万州 | department | `wanzhou-qiongzhou-seat` | `hvd_42491` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 1031 | 广东 | 府属州与县治 | 文昌县 | county | `wenchang-qiongzhou-seat` | `hvd_42451` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1032 | 广东 | 府属州与县治 | 翁源县 | county | `wengyuan-shaozhou-seat` | `hvd_42255` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1033 | 广东 | 府属州与县治 | 吴川县 | county | `wuchuan-huazhou-seat` | `hvd_42414` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1034 | 广东 | 府属州与县治 | 西宁州 | department | `xining-luoding-seat` | `hvd_42646` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 1035 | 广东 | 府属州与县治 | 香山县 | county | `xiangshan-guangzhou-seat` | `hvd_42226` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 1036 | 广东 | 府属州与县治 | 新安县 | county | `xinan-guangzhou-seat` | `hvd_42206` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 1037 | 广东 | 府属州与县治 | 新会县 | county | `xinhui-guangzhou-seat` | `hvd_42218` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1038 | 广东 | 府属州与县治 | 新宁县 | county | `xinning-guangzhou-seat` | `hvd_42228` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 1039 | 广东 | 府属州与县治 | 新兴县 | county | `xinxing-zhaoqing-seat` | `hvd_42284` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1040 | 广东 | 府属州与县治 | 信宜县 | county | `xinyi-gaozhou-seat` | `hvd_42402` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1041 | 广东 | 府属州与县治 | 兴宁县 | county | `xingning-huizhou-seat` | `hvd_42582` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1042 | 广东 | 府属州与县治 | 徐闻县 | county | `xuwen-leizhou-seat` | `hvd_42431` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1043 | 广东 | 府属州与县治 | 崖州 | department | `yazhou-qiongzhou-seat` | `hvd_337` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 1044 | 广东 | 府属州与县治 | 阳春县 | county | `yangchun-zhaoqing-seat` | `hvd_42291` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1045 | 广东 | 府属州与县治 | 阳江县 | county | `yangjiang-zhaoqing-seat` | `hvd_42304` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1046 | 广东 | 府属州与县治 | 阳山县 | county | `yangshan-lianzhou-seat` | `hvd_42603` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1047 | 广东 | 府属州与县治 | 英德县 | county | `yingde-shaozhou-seat` | `hvd_42263` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1048 | 广东 | 府属州与县治 | 永安县 | county | `yongan-huizhou-seat` | `hvd_42179` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 1049 | 广东 | 府属州与县治 | 增城县 | county | `zengcheng-guangzhou-seat` | `hvd_42214` | `approximate`／`medium` | 已独立替换（广东两批） |
| 1050 | 广东 | 府属州与县治 | 长乐县 | county | `changle-huizhou-seat` | `hvd_42587` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 1051 | 广东 | 府属州与县治 | 长宁县 | county | `changning-huizhou-seat` | `hvd_42178` | `approximate`／`low` | 低可信；已独立替换（广东两批） |
| 1052 | 广西 | 府与直隶州治所 | 都康州 | department | `dukang-seat` | `hvd_35525` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1053 | 广西 | 府与直隶州治所 | 江州 | department | `jiangzhou-guangxi-seat` | `hvd_35527` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1054 | 广西 | 府与直隶州治所 | 龙州 | department | `longzhou-guangxi-seat` | `hvd_35526` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1055 | 广西 | 府与直隶州治所 | 思恩军民府 | prefecture | `sien-prefectural-seat` | `hvd_35511` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1056 | 广西 | 府与直隶州治所 | 思陵州 | department | `siling-seat` | `hvd_35528` | `approximate`／`low` | 低可信；已独立替换（广西两批） |
| 1057 | 广西 | 府与直隶州治所 | 思明府 | prefecture | `siming-prefectural-seat` | `hvd_35538` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1058 | 广西 | 府与直隶州治所 | 泗城州 | department | `sicheng-seat` | `hvd_35476` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1059 | 广西 | 府与直隶州治所 | 田州 | department | `tianzhou-seat` | `hvd_35504` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1060 | 广西 | 府与直隶州治所 | 向武州 | department | `xiangwu-seat` | `hvd_35524` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1061 | 广西 | 府与直隶州治所 | 镇安府 | prefecture | `zhenan-prefectural-seat` | `hvd_35548` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1062 | 广西 | 府属州与县治 | 北流县 | county | `beiliu-yulin-seat` | `hvd_44275` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1063 | 广西 | 府属州与县治 | 宾州 | department | `binzhou-liuzhou-seat` | `hvd_44048` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1064 | 广西 | 府属州与县治 | 博白县 | county | `bobai-yulin-seat` | `hvd_44250` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1065 | 广西 | 府属州与县治 | 岑溪县 | county | `cenxi-wuzhou-seat` | `hvd_44186` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1066 | 广西 | 府属州与县治 | 东兰州 | department | `donglan-qingyuan-seat` | `hvd_44013` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1067 | 广西 | 府属州与县治 | 都结州 | department | `dujie-taiping-seat` | `hvd_44122` | `approximate`／`low` | 低可信；已独立替换（广西两批） |
| 1068 | 广西 | 府属州与县治 | 奉议州 | department | `fengyi-sien-seat` | `hvd_44294` | `approximate`／`low` | 低可信；已独立替换（广西两批） |
| 1069 | 广西 | 府属州与县治 | 富川县 | county | `fuchuan-pingle-seat` | `hvd_43917` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1070 | 广西 | 府属州与县治 | 恭城县 | county | `gongcheng-pingle-seat` | `hvd_43915` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1071 | 广西 | 府属州与县治 | 灌阳县 | county | `guanyang-quanzhou-seat` | `hvd_42116` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1072 | 广西 | 府属州与县治 | 归德州 | department | `guide-nanning-seat` | `hvd_43905` | `approximate`／`low` | 低可信；已独立替换（广西两批） |
| 1073 | 广西 | 府属州与县治 | 贵县 | county | `gui-xunzhou-seat` | `hvd_44232` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1074 | 广西 | 府属州与县治 | 河池州 | department | `hechi-qingyuan-seat` | `hvd_43982` | `approximate`／`low` | 低可信；已独立替换（广西两批） |
| 1075 | 广西 | 府属州与县治 | 贺县 | county | `he-pingle-seat` | `hvd_43925` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1076 | 广西 | 府属州与县治 | 横州 | department | `hengzhou-nanning-seat` | `hvd_43858` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1077 | 广西 | 府属州与县治 | 怀集县 | county | `huaiji-wuzhou-seat` | `hvd_44194` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1078 | 广西 | 府属州与县治 | 怀远县 | county | `huaiyuan-liuzhou-seat` | `hvd_43813` | `approximate`／`low` | 低可信；已独立替换（广西两批） |
| 1079 | 广西 | 府属州与县治 | 结安州 | department | `jiean-taiping-seat` | `hvd_44120` | `approximate`／`low` | 低可信；已独立替换（广西两批） |
| 1080 | 广西 | 府属州与县治 | 来宾县 | county | `laibin-liuzhou-seat` | `hvd_43834` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1081 | 广西 | 府属州与县治 | 荔波县 | county | `libo-hechi-seat` | `hvd_44043` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1082 | 广西 | 府属州与县治 | 荔浦县 | county | `lipu-pingle-seat` | `hvd_43932` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1083 | 广西 | 府属州与县治 | 灵川县 | county | `lingchuan-guilin-seat` | `hvd_43744` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1084 | 广西 | 府属州与县治 | 柳城县 | county | `liucheng-liuzhou-seat` | `hvd_43806` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1085 | 广西 | 府属州与县治 | 龙英州 | department | `longying-taiping-seat` | `hvd_44118` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1086 | 广西 | 府属州与县治 | 隆安县 | county | `longan-nanning-seat` | `hvd_43852` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1087 | 广西 | 府属州与县治 | 陆川县 | county | `luchuan-yulin-seat` | `hvd_44282` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1088 | 广西 | 府属州与县治 | 罗白县 | county | `luobai-jiangzhou-seat` | `hvd_44132` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1089 | 广西 | 府属州与县治 | 罗城县 | county | `luocheng-liuzhou-seat` | `hvd_43809` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1090 | 广西 | 府属州与县治 | 罗阳县 | county | `luoyang-taiping-seat` | `hvd_44133` | `approximate`／`low` | 低可信；已独立替换（广西两批） |
| 1091 | 广西 | 府属州与县治 | 洛容县 | county | `luorong-liuzhou-seat` | `hvd_43793` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1092 | 广西 | 府属州与县治 | 茗盈州 | department | `mingying-taiping-seat` | `hvd_44116` | `approximate`／`low` | 低可信；已独立替换（广西两批） |
| 1093 | 广西 | 府属州与县治 | 那地州 | department | `nadi-qingyuan-seat` | `hvd_44020` | `approximate`／`low` | 低可信；已独立替换（广西两批） |
| 1094 | 广西 | 府属州与县治 | 南丹州 | department | `nandan-qingyuan-seat` | `hvd_44026` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1095 | 广西 | 府属州与县治 | 平南县 | county | `pingnan-xunzhou-seat` | `hvd_44217` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1096 | 广西 | 府属州与县治 | 迁江县 | county | `qianjiang-binzhou-seat` | `hvd_44064` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1097 | 广西 | 府属州与县治 | 全茗州 | department | `quanming-taiping-seat` | `hvd_44117` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1098 | 广西 | 府属州与县治 | 全州 | department | `quanzhou-guilin-seat` | `hvd_42115` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1099 | 广西 | 府属州与县治 | 容县 | county | `rong-wuzhou-seat` | `hvd_44174` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1100 | 广西 | 府属州与县治 | 融县 | county | `rong-liuzhou-seat` | `hvd_43818` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1101 | 广西 | 府属州与县治 | 上林县 | county | `shanglin-binzhou-seat` | `hvd_44065` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1102 | 广西 | 府属州与县治 | 上思州 | department | `shangsi-nanning-seat` | `hvd_43885` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1103 | 广西 | 府属州与县治 | 上下冻州 | department | `shangxia-dong-taiping-seat` | `hvd_44128` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1104 | 广西 | 府属州与县治 | 思城州 | department | `sicheng-taiping-seat` | `hvd_44080` | `approximate`／`low` | 低可信；已独立替换（广西两批） |
| 1105 | 广西 | 府属州与县治 | 思恩县 | county | `sien-hechi-seat` | `hvd_44000` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1106 | 广西 | 府属州与县治 | 思明州 | department | `siming-taiping-seat` | `hvd_43893` | `approximate`／`low` | 低可信；已独立替换（广西两批） |
| 1107 | 广西 | 府属州与县治 | 太平州 | department | `taiping-taiping-seat` | `hvd_44114` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1108 | 广西 | 府属州与县治 | 藤县 | county | `teng-wuzhou-seat` | `hvd_44163` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1109 | 广西 | 府属州与县治 | 天河县 | county | `tianhe-qingyuan-seat` | `hvd_43977` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1110 | 广西 | 府属州与县治 | 陀陵县 | county | `tuoling-taiping-seat` | `hvd_44134` | `approximate`／`low` | 低可信；已独立替换（广西两批） |
| 1111 | 广西 | 府属州与县治 | 万承州 | department | `wancheng-taiping-seat` | `hvd_43895` | `approximate`／`low` | 低可信；已独立替换（广西两批） |
| 1112 | 广西 | 府属州与县治 | 武宣县 | county | `wuxuan-xiangzhou-seat` | `hvd_44248` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1113 | 广西 | 府属州与县治 | 下石西州 | department | `xia-shixi-siming-seat` | `hvd_43891` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1114 | 广西 | 府属州与县治 | 象州 | department | `xiangzhou-liuzhou-seat` | `hvd_43819` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1115 | 广西 | 府属州与县治 | 忻城县 | county | `xincheng-qingyuan-seat` | `hvd_44028` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1116 | 广西 | 府属州与县治 | 新宁州 | department | `xinning-nanning-seat` | `hvd_43879` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1117 | 广西 | 府属州与县治 | 兴安县 | county | `xingan-guilin-seat` | `hvd_43743` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1118 | 广西 | 府属州与县治 | 兴业县 | county | `xingye-yulin-seat` | `hvd_44288` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1119 | 广西 | 府属州与县治 | 修仁县 | county | `xiuren-pingle-seat` | `hvd_43945` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1120 | 广西 | 府属州与县治 | 阳朔县 | county | `yangshuo-guilin-seat` | `hvd_43748` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1121 | 广西 | 府属州与县治 | 养利州 | department | `yangli-taiping-seat` | `hvd_44101` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1122 | 广西 | 府属州与县治 | 义宁县 | county | `yining-yongning-seat` | `hvd_43767` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1123 | 广西 | 府属州与县治 | 永安州 | department | `yongan-pingle-seat` | `hvd_43957` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1124 | 广西 | 府属州与县治 | 永淳县 | county | `yongchun-hengzhou-seat` | `hvd_43876` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1125 | 广西 | 府属州与县治 | 永福县 | county | `yongfu-yongning-seat` | `hvd_43759` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1126 | 广西 | 府属州与县治 | 永康州 | department | `yongkang-taiping-seat` | `hvd_44103` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1127 | 广西 | 府属州与县治 | 永宁州 | department | `yongning-guilin-seat` | `hvd_43758` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1128 | 广西 | 府属州与县治 | 郁林州 | department | `yulin-wuzhou-seat` | `hvd_116139` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1129 | 广西 | 府属州与县治 | 昭平县 | county | `zhaoping-pingle-seat` | `hvd_43949` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1130 | 广西 | 府属州与县治 | 镇远州 | department | `zhenyuan-taiping-seat` | `hvd_44121` | `approximate`／`low` | 低可信；已独立替换（广西两批） |
| 1131 | 广西 | 府属州与县治 | 忠州 | department | `zhong-nanning-seat` | `hvd_43881` | `approximate`／`low` | 低可信；已独立替换（广西两批） |
| 1132 | 广西 | 府属州与县治 | 左州 | department | `zuo-taiping-seat` | `hvd_43900` | `approximate`／`low` | 低可信；已独立替换（广西两批） |
| 1133 | 广西 | 特殊治理／军事节点 | 安隆长官司 | military | `anlong-guangxi-seat` | `hvd_35481` | `approximate`／`medium` | 已独立替换（广西两批） |
| 1134 | 云南 | 府与直隶州治所 | 广邑州 | department | `guangyi-seat` | `hvd_80133` | `approximate`／`low` | 已独立替换（云贵试点） |
| 1135 | 云南 | 府与直隶州治所 | 鹤庆军民府 | prefecture | `heqing-prefectural-seat` | `hvd_80154` | `approximate`／`medium` | 已独立替换（云贵试点） |
| 1136 | 云南 | 府与直隶州治所 | 景东府 | prefecture | `jingdong-prefectural-seat` | `hvd_80199` | `approximate`／`low` | 已独立替换（云贵试点） |
| 1137 | 云南 | 府与直隶州治所 | 蒙化府 | prefecture | `menghua-prefectural-seat` | `hvd_80340` | `approximate`／`medium` | 已独立替换（云贵试点） |
| 1138 | 云南 | 府与直隶州治所 | 孟定御夷府 | prefecture | `mengding-seat` | `hvd_80368` | `approximate`／`low` | 已独立替换（云贵试点） |
| 1139 | 云南 | 府与直隶州治所 | 顺宁府 | prefecture | `shunning-prefectural-seat` | `hvd_80524` | `approximate`／`medium` | 已独立替换（云贵试点） |
| 1140 | 云南 | 府与直隶州治所 | 威远御夷州 | department | `weiyuan-yunnan-seat` | `hvd_80617` | `approximate`／`low` | 已独立替换（云贵试点） |
| 1141 | 云南 | 府与直隶州治所 | 镇康御夷州 | department | `zhenkang-seat` | `hvd_80820` | `approximate`／`low` | 已独立替换（云贵试点） |
| 1142 | 云南 | 府属州与县治 | 云州 | department | `yunzhou-old-seat` | `hvd_80794` | `approximate`／`low` | 已独立替换（云贵试点） |
| 1143 | 贵州 | 府与直隶州治所 | 都匀府 | prefecture | `duyun-prefectural-seat` | `hvd_99422` | `approximate`／`medium` | 已独立替换（云贵试点） |
| 1144 | 贵州 | 府与直隶州治所 | 黎平府 | prefecture | `liping-prefectural-seat` | `hvd_99444` | `approximate`／`medium` | 已独立替换（云贵试点） |
| 1145 | 贵州 | 府与直隶州治所 | 思南府 | prefecture | `sinan-prefectural-seat` | `hvd_99463` | `approximate`／`medium` | 已独立替换（云贵试点） |
| 1146 | 贵州 | 府与直隶州治所 | 思州府 | prefecture | `sizhou-prefectural-seat` | `hvd_99464` | `approximate`／`medium` | 已独立替换（云贵试点） |
| 1147 | 贵州 | 府与直隶州治所 | 铜仁府 | prefecture | `tongren-prefectural-seat` | `hvd_99468`／`hvd_99308` | `approximate`／`medium` | 多编号 2；已独立替换（云贵试点） |
