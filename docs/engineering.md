# 工程规范

## 技术边界

| 层 | 技术与职责 |
|---|---|
| Web UI | React + TypeScript + Vite |
| 地图 | MapLibre GL JS，负责图层、相机和交互 |
| 状态 | Zustand，保存可序列化的应用状态 |
| 首版数据 | JSON / GeoJSON 静态资源 |
| 数据工具 | Rust，负责校验、转换、简化和构建 |
| 后续基础设施 | PMTiles/MVT；确有动态需求后使用 Axum + PostGIS |

不以 Rust/WASM 重写浏览器 UI 或 MapLibre。地图性能优先通过分包、几何简化、按需加载和矢量瓦片改善。

## 目录职责

项目建立后遵循以下边界：

```text
src/
  components/     Reusable UI components
  features/       User-facing feature modules
  map/            MapLibre integration and layer definitions
  stores/         Serializable application state
  types/          Shared TypeScript types
  utils/          Pure shared utilities
data/
  sources/        Bibliography and license records
  gazetteer/      Places, names, and administrative units
  periods/        Time-specific spatial data
  physical/       Natural geography layers
tools/            Rust validation and conversion workspace
docs/             Project rules and decisions
```

- `map/` 不拥有业务数据，只把状态转换为地图源、图层和交互。
- `components/` 不直接读写文件或请求外部服务。
- 通用历史类型放在 `types/`，不可在组件中重复定义。
- 大型 GeoJSON 不导入 TypeScript 包，应作为静态资源或瓦片加载。

## 代码规则

- TypeScript 开启严格类型检查；不得用 `any` 绕过数据边界。
- 外部 JSON、URL 参数和持久化状态必须在边界处验证。
- React 组件保持展示职责；数据转换放入纯函数或特性模块。
- 地图监听器和资源必须在卸载时释放，避免重复注册。
- Zustand 只保存可序列化业务状态，不保存 MapLibre 实例或 DOM 节点。
- 参数明显增多时使用具名对象，避免依赖位置参数表达复杂语义。
- Rust 公共数据类型使用 `serde`；错误带上下文但不得泄漏敏感值。
- 几何处理必须明确坐标参考系，禁止混用经纬度与平面距离计算。

## 验证要求

按改动范围运行最小充分验证：

- TypeScript：格式检查、静态检查、单元测试和生产构建。
- Rust：格式检查、静态分析和测试。
- 地图 UI：确认加载、缩放、图层切换、点击和移动端基本行为。
- 数据：运行结构、时间、来源、坐标和几何校验。

Bug 必须记录可复现条件，并用测试或明确的复测步骤证明修复。

## 依赖与安全

- 新依赖应解决明确问题；优先使用维护活跃、许可兼容的成熟项目。
- 提交锁文件，避免使用无约束版本或运行时从未知来源加载脚本。
- 外部 HTML 统一净化；外部 URL 限制为允许的协议和来源。
- 密钥使用本地忽略文件或平台 Secrets，不使用前端环境变量隐藏服务端秘密。
- 提交前检查暂存差异中是否包含凭据、私人路径、大型原始文件或许可不明数据。
- 发布前运行依赖审计；高风险漏洞未评估前不得发布。

## Git 与变更范围

- `main` 保持可运行；功能使用 `feat/*`，修复使用 `fix/*`。
- 提交应小而完整，描述实际变化，不写工具名称或进度标签。
- 不提交生成缓存、编辑器状态、密钥或无再分发权的原始资料。
- 不修改任务范围外的文件，不将重构混入功能或数据修正。

## 决策升级条件

以下变化先更新路线图中的决策，再实施：

- 引入后端、数据库、登录或用户上传。
- 改变历史时间模型、稳定 ID 或公开数据格式。
- 更换地图引擎、瓦片格式或坐标参考系。
- 改变许可证或引入具有传播性条款的数据或代码。
