const { findProductById } = require('../../data/products');

Page({
  data: {
    activeSwiper: 0,
    banners: [
      { tag: 'BRAND', title: '采薇 · 高端美容仪器品牌', sub: '自主研发 · 精密制造 · 全球服务' },
      { tag: 'R&D', title: '采薇 · 技术创新驱动', sub: '30+产品系列 · 100+专利技术' },
      { tag: 'QUALITY', title: '品质认证 · 全球信赖', sub: 'CE、FCC、RoHS · ISO9001认证' },
      { tag: 'SERVICE', title: '采薇 · 科技守护美丽', sub: 'OEM/ODM · 品牌定制 · 全球服务' }
    ],
    advantages: [
      { icon: '🔬', title: '自主研发', desc: '100+专利技术，持续产品创新' },
      { icon: '⚙️', title: '产品丰富', desc: '30+产品系列，覆盖全品类美容仪器' },
      { icon: '🏆', title: '品质认证', desc: 'CE、FCC、RoHS等国际认证齐全' }
    ],
    hotProducts: [],
    featuredProducts: [],
    hotScrollLeft: 0,
    hotScrollMax: 0,
    hotThumbLeft: 0,
    hotThumbWidth: 33,
    _scrollTimer: null
  },

  onLoad: function () {
    const that = this;
    const build = (ids, tagMap) => ids.map(id => {
      const p = findProductById(id);
      return p ? Object.assign({ tag: tagMap[id] || '' }, p) : null;
    }).filter(Boolean);

    this.setData({
      hotProducts: build([2, 3, 8, 1, 12, 4, 7], { 2: '新品', 3: '热销', 8: '人气', 1: '爆款', 12: '热销', 4: '人气', 7: '新品' }),
      featuredProducts: build([2, 3, 7, 1, 8, 12])
    });

    wx.createSelectorQuery()
      .select('.hot-scroll')
      .fields({ scrollOffset: true, size: true }, function (res) {
        if (res) {
          const maxScroll = Math.max(0, (res.scrollWidth || 0) - (res.clientWidth || 0));
          that.setData({ hotScrollMax: maxScroll });
        }
      })
      .exec();
  },

  onSwiperChange: function (e) {
    this.setData({ activeSwiper: e.detail.current });
  },

  /** 热销滚动条（已节流，避免高频 setData） */
  onHotScroll: function (e) {
    if (this.data._scrollTimer) return;
    const timer = setTimeout(() => {
      const scrollLeft = e.detail.scrollLeft;
      const scrollWidth = e.detail.scrollWidth;
      const clientWidth = e.detail.clientWidth || 750;
      if (scrollWidth > clientWidth) {
        const max = scrollWidth - clientWidth;
        const thumbWidth = Math.max(15, (clientWidth / scrollWidth) * 100);
        const thumbLeft = max > 0 ? (scrollLeft / max) * (100 - thumbWidth) : 0;
        this.setData({
          hotScrollLeft: scrollLeft,
          hotScrollMax: max,
          hotThumbLeft: thumbLeft,
          hotThumbWidth: thumbWidth,
          _scrollTimer: null
        });
      }
    }, 50);
    this.setData({ _scrollTimer: timer });
  },

  goToProductDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/product-detail/product-detail?id=' + id
    });
  },

  goToContact: function () {
    wx.switchTab({ url: '/pages/about/about' });
  },

  onShareAppMessage: function () {
    return {
      title: '采薇美容仪器 — 自主研发 · 精密制造 · 全球服务',
      path: '/pages/index/index'
    };
  }
});
