# 主题拆解与场景契约

## 从主题到有向图

按“对象 → 行为 → 关系 → 边界 → 结果”拆解。先记录语义，不要从某个八臂模型倒推内容。

| 主题类型 | 先找什么 | 推荐空间起点 |
| --- | --- | --- |
| 工艺/运营流程 | 输入、转换、检验、输出、返工 | 线性/分叉流水线 |
| 自然机制 | 储库、传输、反馈、能量来源 | 环轨或网络 |
| 系统架构 | 请求路径、服务边界、运行实例、持久化 | 分层平台 + 技术边 |
| 中央协调 | 中心决策、并行能力、回收结果 | 机械核心 + 多臂 |
| 组织协作 | 主体、交付物、交接与责任 | 工作站群组 |

区分 `flow`（数据/物料流）、`dependency`（使用/依赖）、`contains`（容器/实例）、`feedback`（反馈）。包含关系用框或层级表示，不自动产生流粒子。每条可动画边至少说明源、目标、传递内容和触发阶段。

事实有三个层次：用户资料/一手来源、稳定一般知识、展示假设。来源只存本次项目的 brief；绝不把本次项目事实回灌到通用技能。

## scene-spec.json

模板接受下列核心字段。可扩展语义、来源和业务层，但要同步扩展校验器，不能写了配置却不实现。

```json
{
  "title": "Water Cycle",
  "duration": 7,
  "autoplay": true,
  "pause": {"keyboard": true, "button": true, "onHidden": true},
  "replay": "loop",
  "transition": "cut",
  "visual": {"layout": "radial", "mechanicalArms": true, "armCount": 6},
  "palette": {"background": "#e8ede6", "surface": "#faf9f2", "ink": "#263f37", "accent": "#df7739"},
  "nodes": [
    {"id": "ocean", "label": "Ocean", "position": [0,0,0], "shape": "core"},
    {"id": "vapor", "label": "Vapor", "position": [-4,0,-3], "shape": "stack"}
  ],
  "edges": [{"from": "ocean", "to": "vapor", "kind": "flow", "start": 0, "duration": 0.8}],
  "shots": [{"name": "Overview", "preset": "overview-orbit", "focus": ["ocean","vapor"], "weight": 1, "span": 6}]
}
```

`duration` 是整个循环；边的时序单位为秒，必须落在循环内。`shots.weight` 按总权重分配镜头时间，不要求四镜头等长。`span` 是正交相机垂直半幅，数值越小越近。`replay` 可为 `loop` 或 `once`；`transition` 可为 `cut` 或 `continuous`。

`pause.button`、`pause.keyboard`、`pause.onHidden` 分别控制按钮、空格和前后台。减少动态始终先静止，按钮/空格是明确播放请求。静帧不能为空白。

`visual.armCount` 不超过已有非核心目标数；手绘/机械等装饰可以抽象，但节点和边不能为了造型而捏造。新增 logo 时用 `logoPath` 指向本地文件，构建时转为 data URL；不把路径留在最终 HTML。

每个镜头可指定 `focus`、`from`、`to`、`target`、`span`；显式坐标覆盖 preset。主题规模扩大时按 focus 重新取景，而不是全场盲目缩小。模板不会自动理解长标签与语义；作者仍须检查投影重叠与每个镜头的裁切。
