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
│   ├── banner-swiper/     # 轮播图组件（products/contact 页复用）
│   └── section-header/    # 章节标题组件
└── pages/
    ├── index/             # 首页（分享已添加，滚动已节流）
    ├── products/          # 产品中心（复用 banner-swiper 组件 + 共享数据）
    ├── product-detail/    # 产品详情（共享数据 + 骨架屏 + 未找到状态）
    ├── about/             # 关于我们（全局公司信息 + 共享Banner样式）
    └── contact/           # 联系我们（复用组件 + 地图 + 简化表单）
```

## 使用前准备
1. 在 `project.config.json` 中修改 `appid` 为你的微信小程序 AppID
2. 在 `app.js` 的 `globalData.companyInfo` 中填写真实公司信息
3. 将 `images/` 下产品占位图替换为真实产品图片
4. 在 `contact.js` 中替换模拟 API 提交为真实 `wx.request()` 调用
5. 如需真机预览，请在微信开发者工具中导入项目

## 设计规范
- 品牌色：深绿色 #2d5016
- 辅助色：金色 #c9a84c
- 背景色：米白 #f5f0e8
- 卡片圆角：12rpx

## v2.0 优化内容

### 架构改进
- ✅ **共享数据模块** — 13款产品完整数据集中到 `data/products.js`，消除双重维护
- ✅ **全局公司信息** — `app.js` 中 `globalData.companyInfo` 统一公司信息
- ✅ **组件复用** — products/contact 页复用 `banner-swiper` 组件，消除 ~200 行重复代码
- ✅ **共享 Banner 样式** — 装饰器样式提取到 `app.wxss`，消除 ~270 行重复 WXSS

### 功能增强
- ✅ **地图集成** — contact 页地图占位替换为真实 wx.map 组件
- ✅ **分享功能** — 所有 5 个页面添加 `onShareAppMessage`
- ✅ **骨架屏** — product-detail 页添加加载骨架屏
- ✅ **空/错误状态** — product-detail 页添加产品未找到状态
- ✅ **SVG 图标** — 联系页 emoji 替换为 SVG 图标

### 性能优化
- ✅ **滚动节流** — 首页 hot-scroll 自定义滚动条使用 50ms 防抖

### 代码简化
- ✅ **统一表单输入** — 3 个独立 handler 合并为通用的 `onFieldInput`
- ✅ **动态 Tab** — products 页分类列表使用循环渲染，替代手动 3 个 tab

## v3.0 优化内容

### 兼容性修复
- ✅ **SVG → PNG** — 微信 tabBar 图标与 `<image>` 不支持 SVG，已将 `images/` 下全部 12 个 Tab 图标 + 4 个联系页图标栅格化为 PNG（`.rasterize_icons.py`），`app.json` 与 `contact.wxml` 已指向 PNG。原始 SVG 保留为源。
- ✅ **废弃 API** — `app.js` 的 `wx.getSystemInfoSync()` 拆分为 `wx.getWindowInfo()` + `wx.getDeviceInfo()`（前者官方已废弃）。

### 品牌统一
- ✅ **单一配色** — 全项目统一为深绿 `#2d5016` + 金 `#c9a84c`（原先组件/预览页混用青绿 `#3D8B7A` + 橙 `#E8A87C`，由 `.color_unify.py` 批量映射，无残留）。

### 数据一致性
- ✅ **首页数据派生** — `pages/index/index.js` 的 `hotProducts/featuredProducts` 改为从 `data/products.js` 的 `findProductById` 派生，消除与共享产品库的硬编码重复。
- ✅ **preview.html 回正** — 预览页认证改为 CE/FCC/RoHS、合作客户 30+ 与小程序对齐；去掉 ISO9001、RoHS 与首页统计分叉。

### 健壮性打磨
- ✅ **稳定 wx:key** — 列表 `wx:key="index"` 改为稳定字段（产品用 `id`、里程碑用 `year`、认证用 `short` 等），避免重排错乱。
- ✅ **手机号校验** — `contact` 表单增加中国大陆 11 位手机号正则校验（`onFieldInput`/`submitForm` 双重校验）。
- ✅ **横向滚动条** — 首页热销滚动条 `onLoad` 初始 `hotScrollMax` 改为 `scrollWidth - clientWidth`（可滚动距离），首屏显示更准确。
- ✅ **单位统一** — `banner-swiper.wxss` 边框 `1px` → `1rpx`，与全项目 rpx 体系一致。
- ✅ **.editorconfig** — 统一编辑器缩进/换行规则。

> 注：`preview.html` 仍是小程序的独立 HTML 预览副本，数据需与小程序手工保持同步；如后续维护，建议以 `data/products.js` 为唯一数据源。

