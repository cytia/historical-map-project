# 现代县归属争议复核清单

拼装法把历史单位表达为其下辖单位所占现代县的并集。当多个历史单位的治所落在同一个现代县内时，这个县不能同时归属所有单位，必须人工裁决——而裁决依据不可能来自制造冲突的治所点本身。

附郭共址（府与其附郭县共用一县）已在上游排除：那是预期结果，不需要裁决。

本清单只记录需要判断的问题，不含结论。裁决一条意味着决定该现代县如何拆分或归属并给出依据，属于史料工作，结论应写回 `data/` 的来源记录。

由 `tools/reference/build_contested_review_list.py` 生成，数据源 `.reference-work\seat-county-correspondence.json`。

## 规模

| 层级 | 组数 | 含义 |
| --- | ---: | --- |
| cross-province | 0 | 决定省级边界。裁决前两侧省份都无法定稿，且该共享边只画一次。 |
| cross-prefecture | 35 | 决定省内府级边界，不影响省级轮廓。 |
| sibling | 43 | 同属一个上级，无论如何裁决上级轮廓不变；只在绘制府级边界时才需要。 |
| **合计** | **78** | 涉及 184 个历史单位 |

另有 4 组已裁决，结论与依据见 `county-assignment-overrides.json` 与 `cross-province-adjudication.md`，不再列入待办。

## 先处理的共因项

同一单位或同一上级反复出现，通常说明一处治所定位有误或一条隶属关系未定，在多个位置同时制造冲突。先解决这些，清单会随之缩短。

重复出现的单位：
- 永丰县（2 组）

集中出现的上级：
- `taiping-guangxi-prefecture`（19 次）
- `guangxi`（9 次）
- `kaifeng-prefecture`（7 次）
- `jinan-prefecture`（6 次）
- `chengdu-prefecture`（5 次）
- `dongchang-prefecture`（5 次）
- `nanning-prefecture`（5 次）
- `linan-yunnan-prefecture`（5 次）
- `hangzhou-prefecture`（5 次）
- `baoning-prefecture`（4 次）
- `wuchang-prefecture`（4 次）
- `dongping-department`（4 次）
- `puzhou-shanxi-department`（4 次）
- `zheng-kaifeng-department`（4 次）
- `yanzhou-zhejiang-prefecture`（4 次）
- `yunnan-prefecture`（3 次）
- `qingyuan-prefecture`（3 次）
- `chuzhou-zhejiang-prefecture`（3 次）

广西太平府、思明府一带的密集冲突不是数据缺陷。土州辖境本就细碎，十余个土州分布在现代少数几个县内，现代县界的粒度不足以分开它们。这类单位适合按区域代表点或 `schematic` 范围表达，不必强行拆分现代县；拆不开的，如实标注精度而不是编造界线。


## cross-prefecture

决定省内府级边界，不影响省级轮廓。

### Chenggongxian　（云南）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 呈贡县 | county | jinning-yunnan-department | 102.7900, 24.8900 | medium |
| 昆阳州 | department | yunnan-prefecture | 102.6500, 24.6800 | medium |

- [ ] 裁决：
- [ ] 依据：

### Jinningxian　（云南）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 三泊县 | county | kunyang-yunnan-department | 102.4300, 24.6000 | low |
| 归化县 | county | jinning-yunnan-department | 102.5800, 24.7000 | medium |
| 晋宁州 | department | yunnan-prefecture | 102.5900, 24.6800 | medium |

- 低可信治所 1 处（三泊县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Lufengxian　（云南）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 禄丰县 | county | anning-yunnan-department | 102.0800, 25.1500 | medium |
| 罗次县 | county | yunnan-prefecture | 102.2000, 25.2000 | low |

- 低可信治所 1 处（罗次县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Yuanmouxian　（云南）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 元谋县 | county | wuding-prefecture | 101.8700, 25.7000 | medium |
| 定远县 | county | chuxiong-prefecture | 101.8300, 25.7000 | medium |

- [ ] 裁决：
- [ ] 依据：

### Longyaoxian　（京师）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 唐山县 | county | shunde-prefecture | 114.7643, 37.3496 | low |
| 隆平县 | county | zhaozhou-department | 114.7643, 37.3496 | low |

- 低可信治所 2 处（唐山县、隆平县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Weixian　（京师）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 威县 | county | guangping-prefecture | 114.9331, 36.3600 | medium |
| 魏县 | county | daming-prefecture | 114.9331, 36.3600 | medium |

- [ ] 裁决：
- [ ] 依据：

### Shanghaishi　（南京）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 上海县 | county | songjiang-prefecture | 121.4692, 31.2325 | medium |
| 嘉定县 | county | suzhou-prefecture | 121.2336, 31.3374 | medium |

- [ ] 裁决：
- [ ] 依据：

### Deyangshi　（四川）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 德阳县 | county | hanzhou-chengdu-department | 104.3950, 31.1289 | medium |
| 罗江县 | county | mianzhou-chengdu-department | 104.5070, 31.3052 | medium |

- [ ] 裁决：
- [ ] 依据：

### Jiangyoushi　（四川）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 彰明县 | county | mianzhou-chengdu-department | 104.7231, 31.7156 | medium |
| 江油县 | county | longan-prefecture | 104.7406, 31.7761 | medium |

- [ ] 裁决：
- [ ] 依据：

### Nanbuxian　（四川）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 仪陇县 | county | pengzhou-shunqing-department | 106.2966, 31.2682 | medium |
| 南部县 | county | baoning-prefecture | 106.0559, 31.3510 | medium |

- [ ] 裁决：
- [ ] 依据：

### Tongliangxian　（四川）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 安居县 | county | chongqing-prefecture | 106.0271, 29.9925 | medium |
| 铜梁县 | county | hezhou-chongqing-department | 106.0533, 29.8401 | medium |

- [ ] 裁决：
- [ ] 依据：

### Wenchuanxian　（四川）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 保县 | county | weizhou-chengdu-department | 103.5200, 31.6700 | low |
| 汶川县 | county | maozhou-chengdu-department | 103.5833, 31.4833 | medium |
| 威州 | department | chengdu-prefecture | 103.5900, 31.4700 | low |

- 低可信治所 2 处（保县、威州）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Gaoqingxian　（山东）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 青城县 | county | jinan-prefecture | 117.9558, 37.0971 | low |
| 高苑县 | county | qingzhou-prefecture | 117.9558, 37.0971 | low |

- 低可信治所 2 处（青城县、高苑县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Linyixian　（山东）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 临邑县 | county | jinan-prefecture | 116.8611, 37.1896 | medium |
| 德平县 | county | dezhou-department | 116.9561, 37.4651 | low |

- 低可信治所 1 处（德平县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Pingyuanxian　（山东）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 平原县 | county | dezhou-department | 116.4333, 37.1667 | medium |
| 恩县 | county | gaotang-department | 116.2710, 37.1541 | low |

- 低可信治所 1 处（恩县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Xinxian　（山东）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 朝城县 | county | puzhou-department | 115.5790, 36.0567 | low |
| 莘县 | county | dongchang-prefecture | 115.6626, 36.2355 | medium |
| 观城县 | county | puzhou-department | 115.3785, 35.9413 | low |

- 低可信治所 2 处（朝城县、观城县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Ziboshi　（山东）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 临淄县 | county | qingzhou-prefecture | 118.3000, 36.8167 | medium |
| 淄川县 | county | jinan-prefecture | 117.9669, 36.6436 | medium |

- [ ] 裁决：
- [ ] 依据：

### Deqingxian　（广东）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 东安州 | department | luoding-direct-department | 112.0001, 23.0765 | low |
| 德庆州 | department | zhaoqing-prefecture | 111.7803, 23.1449 | medium |

- 低可信治所 1 处（东安州）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Chongzuoxian　（广西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 崇善县 | county | taiping-guangxi-prefecture | 107.3600, 22.3800 | medium |
| 罗白县 | county | jiangzhou-guangxi-direct-department | 107.5216, 22.3287 | medium |
| 安平州 | department | taiping-guangxi-prefecture | 107.2000, 22.4800 | low |
| 左州 | department | taiping-guangxi-prefecture | 107.3500, 22.4167 | low |
| 江州 | department | guangxi | 107.3500, 22.4167 | medium |
| 太平府 | prefecture | guangxi | 107.3600, 22.3800 | medium |

- 低可信治所 2 处（安平州、左州）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Fusuixian　（广西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 罗阳县 | county | taiping-guangxi-prefecture | 107.9039, 22.6350 | low |
| 忠州 | department | nanning-prefecture | 107.9039, 22.6350 | low |
| 新宁州 | department | nanning-prefecture | 107.9014, 22.6361 | medium |
| 永康州 | department | taiping-guangxi-prefecture | 107.8330, 22.8317 | medium |

- 低可信治所 2 处（罗阳县、忠州）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Laibinxian　（广西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 来宾县 | county | liuzhou-prefecture | 109.2333, 23.7333 | medium |
| 迁江县 | county | binzhou-liuzhou-department | 109.2333, 23.7333 | medium |

- [ ] 裁决：
- [ ] 依据：

### Longanxian　（广西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 隆安县 | county | nanning-prefecture | 107.6875, 23.1749 | medium |
| 结伦州 | department | taiping-guangxi-prefecture | 107.3600, 23.1000 | low |
| 都结州 | department | taiping-guangxi-prefecture | 107.6875, 23.1749 | low |

- 低可信治所 2 处（结伦州、都结州）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Longzhouxian　（广西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 上下冻州 | department | taiping-guangxi-prefecture | 106.7003, 22.3946 | medium |
| 龙州 | department | guangxi | 106.8542, 22.3450 | medium |

- [ ] 裁决：
- [ ] 依据：

### Luochengyaolaozuzizhixian　（广西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 天河县 | county | qingyuan-prefecture | 108.6923, 24.7796 | medium |
| 罗城县 | county | liuzhou-prefecture | 108.9035, 24.7880 | medium |

- [ ] 裁决：
- [ ] 依据：

### Ningmingxian　（广西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 陀陵县 | county | taiping-guangxi-prefecture | 107.0700, 22.1400 | low |
| 思明州 | department | taiping-guangxi-prefecture | 107.0700, 22.1400 | low |
| 思陵州 | department | guangxi | 107.0700, 22.1400 | low |
| 思明府 | prefecture | guangxi | 107.0700, 22.1400 | medium |

- 低可信治所 3 处（陀陵县、思明州、思陵州）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Pingxiangshi　（广西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 下石西州 | department | siming-prefecture | 106.8944, 22.1220 | medium |
| 凭祥州 | department | guangxi | 106.7500, 22.1100 | medium |

- [ ] 裁决：
- [ ] 依据：

### Tiandengxian　（广西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 向武州 | department | guangxi | 106.9594, 23.2338 | medium |
| 结安州 | department | taiping-guangxi-prefecture | 107.0667, 23.0833 | low |
| 茗盈州 | department | taiping-guangxi-prefecture | 107.0667, 23.0833 | low |
| 都康州 | department | guangxi | 107.0858, 23.1070 | medium |
| 镇远州 | department | taiping-guangxi-prefecture | 107.0667, 23.0833 | low |
| 龙英州 | department | taiping-guangxi-prefecture | 107.0187, 22.9821 | medium |

- 低可信治所 3 处（结安州、茗盈州、镇远州）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Tianyangxian　（广西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 奉议州 | department | sien-military-prefecture | 106.9000, 23.7500 | low |
| 田州 | department | guangxi | 106.9133, 23.7393 | medium |

- 低可信治所 1 处（奉议州）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Nankangshi　（江西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 南康县 | county | nanan-prefecture | 114.7585, 25.6675 | medium |
| 龙南县 | county | ganzhou-prefecture | 114.7861, 25.9050 | medium |

- [ ] 裁决：
- [ ] 依据：

### Yongfengxian　（江西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 永丰县 | county | guangxin-prefecture | 115.5000, 27.3167 | medium |
| 永丰县 | county | jian-prefecture | 115.5000, 27.3167 | low |

- 低可信治所 1 处（永丰县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Yuanjinxian　（河南）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 延津县 | county | kaifeng-prefecture | 114.1966, 35.1471 | medium |
| 新乡县 | county | weihui-prefecture | 114.0511, 35.3086 | low |

- 低可信治所 1 处（新乡县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Wuyixian　（浙江）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 宣平县 | county | chuzhou-zhejiang-prefecture | 119.8118, 28.8964 | low |
| 武义县 | county | jinhua-prefecture | 119.8118, 28.8964 | medium |

- 低可信治所 1 处（宣平县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Guiyangxian　（湖广）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 桂阳县 | county | chenzhou-direct-department | 112.7283, 25.7486 | low |
| 桂阳州 | department | hengzhou-prefecture | 112.7283, 25.7486 | low |

- 低可信治所 2 处（桂阳县、桂阳州）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Wuhanshi　（湖广）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 武昌县 | county | wuchang-prefecture | 114.3143, 30.3551 | medium |
| 汉阳县 | county | hanyang-prefecture | 114.2660, 30.5490 | medium |
| 江夏县 | county | wuchang-prefecture | 114.3050, 30.5450 | medium |
| 武昌府 | prefecture | huguang | 114.3050, 30.5450 | medium |
| 汉阳府 | prefecture | huguang | 114.2660, 30.5490 | medium |

- [ ] 裁决：
- [ ] 依据：

### Yiyangshi　（湖广）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 沅江县 | county | changde-prefecture | 112.3595, 28.8417 | medium |
| 益阳县 | county | changsha-prefecture | 112.3333, 28.5833 | medium |

- [ ] 裁决：
- [ ] 依据：


## sibling

同属一个上级，无论如何裁决上级轮廓不变；只在绘制府级边界时才需要。

### Jianchuanxian　（云南）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 剑川州 | department | heqing-military-prefecture | 99.9000, 26.5300 | medium |
| 顺州 | department | heqing-military-prefecture | 100.0000, 26.6000 | medium |

- [ ] 裁决：
- [ ] 依据：

### Malongxian　（云南）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 亦佐县 | county | qujing-military-prefecture | 103.5500, 25.4000 | low |
| 马龙州 | department | qujing-military-prefecture | 103.6100, 25.4300 | medium |

- 低可信治所 1 处（亦佐县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Shipingxian　（云南）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 河西县 | county | linan-yunnan-prefecture | 102.3500, 24.1000 | medium |
| 宁州 | department | linan-yunnan-prefecture | 102.4300, 24.0800 | medium |
| 石屏州 | department | linan-yunnan-prefecture | 102.4900, 23.7000 | medium |

- [ ] 裁决：
- [ ] 依据：

### Xinpingyizhudaizuzizhixian　（云南）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 新平县 | county | linan-yunnan-prefecture | 101.9900, 24.0700 | medium |
| 新化州 | department | linan-yunnan-prefecture | 101.9500, 24.1000 | medium |

- [ ] 裁决：
- [ ] 依据：

### Wenanxian　（京师）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 保定县 | county | bazhou-department | 116.3574, 39.0032 | low |
| 文安县 | county | bazhou-department | 116.4549, 38.8651 | medium |

- 低可信治所 1 处（保定县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Dafengshi　（南京）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 虹县 | county | fengyang-prefecture | 117.8800, 33.4792 | low |
| 泗州 | department | fengyang-prefecture | 117.8800, 33.4792 | medium |

- 低可信治所 1 处（虹县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Dongzhixian　（南京）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 东流县 | county | chizhou-prefecture | 117.0186, 30.0999 | low |
| 建德县 | county | chizhou-prefecture | 117.0186, 30.0999 | low |

- 低可信治所 2 处（东流县、建德县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Bixian　（四川）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 崇宁县 | county | chengdu-prefecture | 103.8140, 30.8840 | low |
| 郫县 | county | chengdu-prefecture | 103.8989, 30.7986 | medium |

- 低可信治所 1 处（崇宁县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Gaoxian　（四川）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 庆符县 | county | xuzhou-prefecture | 104.5200, 28.5800 | low |
| 高州 | department | xuzhou-prefecture | 104.5000, 28.4400 | low |

- 低可信治所 2 处（庆符县、高州）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Guanyuanshi　（四川）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 广元县 | county | baoning-prefecture | 105.8398, 32.4353 | medium |
| 昭化县 | county | baoning-prefecture | 105.7142, 32.3368 | medium |
| 剑州 | department | baoning-prefecture | 105.4600, 32.2900 | low |

- 低可信治所 1 处（剑州）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Wushanxian　（四川）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 大昌县 | county | kuizhou-prefecture | 109.7933, 31.2659 | medium |
| 巫山县 | county | kuizhou-prefecture | 109.8745, 31.0789 | medium |

- [ ] 裁决：
- [ ] 依据：

### Xinduxian　（四川）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 新繁县 | county | chengdu-prefecture | 104.0163, 30.8757 | medium |
| 新都县 | county | chengdu-prefecture | 104.1605, 30.8246 | medium |

- [ ] 裁决：
- [ ] 依据：

### Xuanhanxian　（四川）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 东乡县 | county | dazhou-kuizhou-department | 107.7178, 31.3576 | medium |
| 太平县 | county | dazhou-kuizhou-department | 107.6400, 31.2300 | low |

- 低可信治所 1 处（太平县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Chepingxian　（山东）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 博平县 | county | dongchang-prefecture | 116.1122, 36.5900 | low |
| 茌平县 | county | dongchang-prefecture | 116.2611, 36.5642 | medium |

- 低可信治所 1 处（博平县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Gaotangixan　（山东）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 清平县 | county | dongchang-prefecture | 116.0752, 36.7554 | low |
| 高唐州 | department | dongchang-prefecture | 116.2681, 36.8544 | medium |

- 低可信治所 1 处（清平县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Jiningshi　（山东）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 邹县 | county | yanzhou-prefecture | 116.4500, 35.3667 | medium |
| 济宁州 | department | yanzhou-prefecture | 116.5667, 35.4000 | medium |

- [ ] 裁决：
- [ ] 依据：

### Pingyinxian　（山东）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 东阿县 | county | dongping-department | 116.2798, 36.1728 | low |
| 平阴县 | county | dongping-department | 116.4333, 36.2833 | medium |

- 低可信治所 1 处（东阿县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Yangguxian　（山东）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 寿张县 | county | dongping-department | 115.8513, 36.0114 | low |
| 阳谷县 | county | dongping-department | 115.7848, 36.1137 | medium |

- 低可信治所 1 处（寿张县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Zhoupingxian　（山东）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 邹平县 | county | jinan-prefecture | 117.7424, 36.8625 | medium |
| 长山县 | county | jinan-prefecture | 117.7424, 36.8625 | low |
| 齐东县 | county | jinan-prefecture | 117.7424, 36.8625 | low |

- 低可信治所 2 处（长山县、齐东县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Hongtongxian　（山西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 洪洞县 | county | pingyang-prefecture | 111.6677, 36.2569 | medium |
| 赵城县 | county | pingyang-prefecture | 111.6716, 36.3857 | low |

- 低可信治所 1 处（赵城县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Linqixian　（山西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 临晋县 | county | puzhou-shanxi-department | 110.5494, 35.0957 | low |
| 猗氏县 | county | puzhou-shanxi-department | 110.7726, 35.1433 | low |

- 低可信治所 2 处（临晋县、猗氏县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Qingxuxian　（山西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 徐沟县 | county | taiyuan-prefecture | 112.5002, 37.5635 | medium |
| 清源县 | county | taiyuan-prefecture | 112.5002, 37.5635 | low |

- 低可信治所 1 处（清源县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Wanrongxian　（山西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 万泉县 | county | puzhou-shanxi-department | 110.8312, 35.4169 | low |
| 荥河县 | county | puzhou-shanxi-department | 110.6900, 35.4200 | low |

- 低可信治所 2 处（万泉县、荥河县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Fengkaixian　（广东）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 封川县 | county | deqing-zhaoqing-department | 111.4981, 23.4393 | low |
| 开建县 | county | deqing-zhaoqing-department | 111.4981, 23.4393 | low |

- 低可信治所 2 处（封川县、开建县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Qionghaishi　（广东）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 乐会县 | county | qiongzhou-prefecture | 110.4642, 19.2431 | low |
| 会同县 | county | qiongzhou-prefecture | 110.4642, 19.2431 | low |

- 低可信治所 2 处（乐会县、会同县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Daxinxian　（广西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 万承州 | department | taiping-guangxi-prefecture | 107.1997, 22.8361 | low |
| 全茗州 | department | taiping-guangxi-prefecture | 107.1757, 22.9214 | medium |
| 养利州 | department | taiping-guangxi-prefecture | 107.1918, 22.8384 | medium |
| 太平州 | department | taiping-guangxi-prefecture | 107.0978, 22.6446 | medium |
| 思城州 | department | taiping-guangxi-prefecture | 107.1997, 22.8361 | low |

- 低可信治所 2 处（万承州、思城州）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Lipuxian　（广西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 修仁县 | county | pingle-prefecture | 110.2446, 24.4330 | medium |
| 荔浦县 | county | pingle-prefecture | 110.3902, 24.4935 | medium |

- [ ] 裁决：
- [ ] 依据：

### Nandanxian　（广西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 南丹州 | department | qingyuan-prefecture | 107.5333, 24.9833 | medium |
| 那地州 | department | qingyuan-prefecture | 107.5333, 24.9833 | low |

- 低可信治所 1 处（那地州）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Pingguoxian　（广西）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 归德州 | department | nanning-prefecture | 107.5667, 23.3333 | low |
| 果化州 | department | nanning-prefecture | 107.5500, 23.3800 | low |

- 低可信治所 2 处（归德州、果化州）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Lankaoxian　（河南）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 仪封县 | county | kaifeng-prefecture | 114.8160, 34.8300 | low |
| 兰阳县 | county | kaifeng-prefecture | 114.8160, 34.8300 | low |

- 低可信治所 2 处（仪封县、兰阳县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Lingbaoshi　（河南）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 灵宝县 | county | shanzhou-henan-department | 110.8786, 34.5221 | medium |
| 阌乡县 | county | shanzhou-henan-department | 110.8786, 34.5221 | low |

- 低可信治所 1 处（阌乡县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Weishixian　（河南）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 尉氏县 | county | kaifeng-prefecture | 114.1930, 34.4114 | low |
| 洧川县 | county | kaifeng-prefecture | 113.9823, 34.2908 | low |

- 低可信治所 2 处（尉氏县、洧川县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Xingyangxian　（河南）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 汜水县 | county | zheng-kaifeng-department | 113.2121, 34.8452 | low |
| 河阴县 | county | zheng-kaifeng-department | 113.3839, 34.7875 | low |
| 荥泽县 | county | zheng-kaifeng-department | 113.3839, 34.7875 | low |
| 荥阳县 | county | zheng-kaifeng-department | 113.3839, 34.7875 | medium |

- 低可信治所 3 处（汜水县、河阴县、荥泽县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Yuanyangshi　（河南）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 原武县 | county | kaifeng-prefecture | 113.7795, 34.9985 | medium |
| 阳武县 | county | kaifeng-prefecture | 113.9600, 35.0541 | low |

- 低可信治所 1 处（阳武县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Cunanxian　（浙江）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 淳安县 | county | yanzhou-zhejiang-prefecture | 119.0384, 29.6050 | medium |
| 遂安县 | county | yanzhou-zhejiang-prefecture | 119.0384, 29.6050 | low |

- 低可信治所 1 处（遂安县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Deqingxian　（浙江）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 德清县 | county | huzhou-prefecture | 119.9630, 30.5381 | medium |
| 武康县 | county | huzhou-prefecture | 119.9691, 30.5369 | medium |

- [ ] 裁决：
- [ ] 依据：

### Fuyangshi　（浙江）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 富阳县 | county | hangzhou-prefecture | 119.9370, 30.0500 | medium |
| 新城县 | county | hangzhou-prefecture | 119.7297, 29.9699 | medium |

- [ ] 裁决：
- [ ] 依据：

### Linanxian　（浙江）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 临安县 | county | hangzhou-prefecture | 119.7153, 30.2348 | medium |
| 于潜县 | county | hangzhou-prefecture | 119.3943, 30.1887 | medium |
| 昌化县 | county | hangzhou-prefecture | 119.2129, 30.1654 | medium |

- [ ] 裁决：
- [ ] 依据：

### Songyangxian　（浙江）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 松阳县 | county | chuzhou-zhejiang-prefecture | 119.4801, 28.4567 | medium |
| 遂昌县 | county | chuzhou-zhejiang-prefecture | 119.5000, 28.5000 | medium |

- [ ] 裁决：
- [ ] 依据：

### Tongluxian　（浙江）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 分水县 | county | yanzhou-zhejiang-prefecture | 119.4312, 29.9316 | medium |
| 桐庐县 | county | yanzhou-zhejiang-prefecture | 119.6873, 29.7954 | medium |

- [ ] 裁决：
- [ ] 依据：

### Tongxiangshi　（浙江）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 崇德县 | county | jiaxing-prefecture | 120.4357, 30.5306 | medium |
| 桐乡县 | county | jiaxing-prefecture | 120.5474, 30.6326 | medium |

- [ ] 裁决：
- [ ] 依据：

### Jiayuxian　（湖广）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 嘉鱼县 | county | wuchang-prefecture | 113.9263, 29.9736 | medium |
| 蒲圻县 | county | wuchang-prefecture | 113.6333, 29.8833 | low |

- 低可信治所 1 处（蒲圻县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：

### Zhangpingxian　（福建）

| 单位 | 层级 | 上级 | 治所坐标 | 可信度 |
| --- | --- | --- | --- | --- |
| 宁洋县 | county | zhangzhou-prefecture | 117.3626, 25.6117 | low |
| 漳平县 | county | zhangzhou-prefecture | 117.4148, 25.2938 | medium |

- 低可信治所 1 处（宁洋县）：冲突可能来自代理点误差而非真实辖境重叠，先复核治所定位。
- [ ] 裁决：
- [ ] 依据：
