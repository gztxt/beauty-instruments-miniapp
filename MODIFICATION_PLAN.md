[[MODIFICATION_PLAN]]
- 修改文件：app.json
- 修改位置：tabBar.list[0-2].iconPath / selectedIconPath
- 修改描述：将 tabBar 图标引用从 .png 改为 .svg（矢量图，清晰度更高，微信基础库 2.9.0+ 支持）
- 预期行为变化：底部菜单栏 3 个图标在不同屏幕密度下均清晰锐利，不再出现模糊或排列异常
- 接口影响：无
[[END_PLAN]]
[[MODIFICATION_PLAN]]
- 修改文件：images/tab-about.svg
- 修改位置：整个文件（重绘为 81x81 viewBox，匹配 PNG 尺寸）
- 修改描述：重绘「关于我们」图标，viewBox 从 48x48 改为 81x81，笔画宽度 4，圆角 2.5，视觉风格与首页/产品中心图标统一
- 预期行为变化：三个 tab 图标尺寸、描边粗细、视觉重心完全一致，横向排列整齐
- 接口影响：无
[[END_PLAN]]
[[MODIFICATION_PLAN]]
- 修改文件：images/tab-about-active.svg
- 修改位置：整个文件（重绘为 81x81 viewBox，填充色 #2d5016）
- 修改描述：重绘「关于我们」选中态图标，与默认态同尺寸，填充品牌色
- 预期行为变化：点击「关于我们」tab 时图标平滑变色，无跳动/错位
- 接口影响：无
[[END_PLAN]]