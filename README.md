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
