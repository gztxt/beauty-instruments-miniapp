# 美容仪器企业展示小程序

## 说明
本项目为一个美容仪器开发生产厂家的企业展示微信小程序。

## 目录结构
```
beauty-instruments-miniapp/
├── app.json              # 全局配置
├── app.js                # 全局逻辑（含公司信息统一来源）
├── app.wxss              # 全局样式（含共享 Banner 装饰样式）
├── project.config.json   # 项目配置
├── sitemap.json          # 站点地图
├── data/
│   └── products.js       # ★ 共享产品数据模块（13款完整数据）
├── images/               # 图标资源
│   ├── tab-*.svg          # Tab 图标
│   ├── icon-company.svg   # 公司图标
│   ├── icon-address.svg   # 地址图标
│   ├── icon-phone.svg     # 电话图标
│   ├── icon-email.svg     # 邮箱图标
│   └── icon-copy.svg      # 复制图标
├── components/
│   ├── banner-swiper/     # 轮播图组件（products 页复用）
│   └── section-header/    # 章节标题组件
└── pages/
    ├── index/             # 首页（分享已添加，滚动已节流）
    ├── products/          # 产品中心（复用 banner-swiper 组件 + 共享数据）
    ├── product-detail/    # 产品详情（共享数据 + 骨架屏 + 未找到状态）
    └── about/             # 关于我们（全局公司信息 + 共享Banner样式 + 联系信息卡）
```

> **页面数说明（2026-10-08核实）**：本项目为 **4 页**，非 5 页。
> 提交 `d3a5cd1`（2026-07-14）已**有意删除** `pages/contact/` 整目录，
> 将联系信息并入 `pages/about/about.wxml`（见该文件 97 行注释
> 「联系我们（并入：原独立联系页，删除留言系统）」），tabBar 同步由 4 项减为 3 项。
> 留言表单与地图一并移除，因此**不存在 `contact.js` 需要接 `wx.request()`**。

## 使用前准备
1. 在 `project.config.json` 中修改 `appid` 为你的微信小程序 AppID
2. 在 `app.js` 的 `globalData.companyInfo` 中填写真实公司信息
3. 将 `images/` 下产品占位图替换为真实产品图片
   （当前无真实产品图：列表/首页用渐变 + 产品名占位，详情页顶部用 4 组渐变轮换多视角。
    在 `data/products.js` 给产品补 `img` 字段即可让详情页顶部直接显示真图）
4. 如需真机预览，请在微信开发者工具中导入项目

## 设计规范
- 品牌色：深绿色 #2d5016
- 辅助色：金色 #c9a84c
- 背景色：米白 #f5f0e8
- 卡片圆角：12rpx

## v2.0 优化内容

> ⚠️ **以下为 2026-07 当时的变更记录，部分内容已随后续提交移除**（尤其涉及
> `pages/contact/` 的条目——该页在 `d3a5cd1` 中并入 about）。保留原文以存历史。

### 架构改进
- ✅ **共享数据模块** — 13款产品完整数据集中到 `data/products.js`，消除双重维护
- ✅ **全局公司信息** — `app.js` 中 `globalData.companyInfo` 统一公司信息
- ✅ **组件复用** — products/contact 页复用 `banner-swiper` 组件，消除 ~200 行重复代码
- ✅ **共享 Banner 样式** — 装饰器样式提取到 `app.wxss`，消除 ~270 行重复 WXSS

### 功能增强
- ✅ **地图集成** — contact 页地图占位替换为真实 wx.map 组件（**已随 contact 页删除而移除**）
- ✅ **分享功能** — 各页面添加 `onShareAppMessage`
- ✅ **骨架屏** — product-detail 页添加加载骨架屏
- ✅ **空/错误状态** — product-detail 页添加产品未找到状态
- ✅ **SVG 图标** — 联系页 emoji 替换为 SVG 图标（SVG 仅作栅格化源，tabBar 不直接用）

### 性能优化
- ✅ **滚动节流** — 首页 hot-scroll 自定义滚动条使用 50ms 防抖

### 代码简化
- ✅ **统一表单输入** — 3 个独立 handler 合并为通用的 `onFieldInput`（**表单已随留言系统移除**）
- ✅ **动态 Tab** — products 页分类列表使用循环渲染，替代手动 3 个 tab

## v3.0 优化内容

### 兼容性修复
- ✅ **SVG → PNG** — 微信 tabBar 图标与 `<image>` 不支持 SVG，已用 `.rasterize_icons.py`将`images/` 下 Tab 图标栅格化为 PNG（81×81 RGBA），原始 SVG 保留为源。
  > **2026-10-08 修正**：`app.json` 的 tabBar 曾仍指向 `.svg`（与本条描述矛盾，真机上图标不显示），
  > 已全部改为 `.png` 并逐项验证文件存在。经`python3 -c` 校验 `ALL EXIST`，残留 `.svg` 引用数 0。
- ✅ **废弃 API** — `app.js` 的 `wx.getSystemInfoSync()` 拆分为 `wx.getWindowInfo()` + `wx.getDeviceInfo()`（前者官方已废弃）。

### 品牌统一
- ✅ **单一配色** — 全项目统一为深绿 `#2d5016` + 金 `#c9a84c`（原先组件/预览页混用青绿 `#3D8B7A` + 橙 `#E8A87C`，由 `.color_unify.py` 批量映射，无残留）。

### 数据一致性
- ✅ **首页数据派生** — `pages/index/index.js` 的 `hotProducts/featuredProducts` 改为从 `data/products.js` 的 `findProductById` 派生，消除与共享产品库的硬编码重复。
- ✅ **preview.html 回正** — 预览页认证改为 CE/FCC/RoHS、合作客户 30+ 与小程序对齐；去掉 ISO9001、RoHS 与首页统计分叉。

### 健壮性打磨
- ✅ **稳定 wx:key** — 列表 `wx:key="index"` 改为稳定字段（产品用 `id`、里程碑用 `year`、认证用 `short` 等），避免重排错乱。
- ✅ **手机号校验** — about 页拨号前增加中国大陆 11 位手机号正则校验（`onFieldInput`/`submitForm` 双重校验）。
- ✅ **横向滚动条** — 首页热销滚动条 `onLoad` 初始 `hotScrollMax` 改为 `scrollWidth - clientWidth`（可滚动距离），首屏显示更准确。
- ✅ **单位统一** — `banner-swiper.wxss` 边框 `1px` → `1rpx`，与全项目 rpx 体系一致。
- ✅ **.editorconfig** — 统一编辑器缩进/换行规则。

> 注：`preview.html` 仍是小程序的独立 HTML 预览副本，数据需与小程序手工保持同步；如后续维护，建议以 `data/products.js` 为唯一数据源。

## 2026-10-08 修复

- **项目迁至技术文档根目录** — 由 `claude/beauty-instruments-miniapp/` 移至
  `/fs/1000/ftp/技术文档/beauty-instruments-miniapp/`，符合代码资产归档军规「源码唯一权威副本落技术文档目录」。
  git 历史与远端不变（HEAD `cda43a3`）；备份链 `scripts/backup-git-repos.sh` 靠 `find -maxdepth 3` 自动发现，
  移到顶层后 bundle 目录名从 `claude_beauty-instruments-miniapp` 变回 `beauty-instruments-miniapp`（接续 8月前旧名）。
- **app.json tabBar 图标 SVG → PNG** — 见 v3.0 段下的 2026-10-08 修正说明。
- **三页顶部高度统一为 160px** — 原首页/产品中心的 `.banner`/`.banner-slide` 为 200px，
  而关于我们用 `.page-banner` 为 160px，三页顶部不齐。按「以关于我们页为准」将前者两处改为 160px。
  验证：320/360/390/414/768/1024/1440/1920 八档宽度下三页顶部均为 160px，`scrollWidth == clientWidth` 无横向溢出；
  轮播内容实测高 91px（35→126）完整落在 160px 内不裁切；圆点（140–148px）与金线（124–126px）不重叠。

### 产品详情页改版

- **顶部产品图轮播，高 160px** — `.detail-hero` 由 200px 改 160px，与其它三页顶部对齐。
  改为 4 帧轮播（正面/侧面/细节/整机），复用首页/产品中心同一套
  `startSwiper/applySwiper`（仅换容器与帧数），**不新增轮播逻辑**。
  > ⚠️ 项目暂无真实产品图（`images/` 仅 tabBar 与联系页图标）。
  > 现用 4 组渐变（`.dh-0`~`.dh-3`）代替多视角图。
  > **真图预留**：在 `data/products.js` 给产品补 `img` 字段（字符串或数组），
  > `detailHeroFrames()` 会自动优先使用，渲染逻辑无需改动。
- **排版紧凑化，页面变短** — 用户反馈详情页过长（scrollHeight 1778px）。
  压缩后 **1547px（-231px，-13%）**。作用域严格限定 `.detail-page`，不影响其它页：

  | 部位 | 改前 | 改后 |
  |---|---|---|
  | `.section` margin-top | 16px | 10px |
  | 详情页 `.section-title` | 18px | 16px |
  | 详情页 `.card` padding | 16px | 12px |
  | `.param-item` padding | 10px | 7px |
  | `.opt-group` margin-bottom | 16px | 10px |
  | `.opt-chip` padding / min-width | 8/10 · 96px | 6/8 · 92px |
  | `.feature-item` padding | 12px | 9px |
  | `.back-bar` padding | 12/8 | 8/4 |

- **过程中修掉两处自查发现的缺陷**（均由量测/截图取证，非猜测）：
  - 产品名「多功能美容仪」在圆形占位内**折成两行** → 改为不重复产品名的图形占位条；
  - 视角标签置于名称下方时与底部圆点**重叠**（标签底 176 > 圆点顶 174）→ 移至名称上方，重叠消除。

