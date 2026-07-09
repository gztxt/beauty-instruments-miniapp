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
    hotProducts: [
      { id: 2, name: '射频美容仪', model: 'BI-RF300', imgText: '多极射频', tag: '新品' },
      { id: 3, name: '射频紧肤仪', model: 'BI-RF400', imgText: '院线级', tag: '热销' },
      { id: 8, name: '智能皮肤分析仪', model: 'BI-SK100', imgText: 'AI分析', tag: '人气' },
      { id: 1, name: '多功能美容仪', model: 'BI-BM200', imgText: '7合1护理', tag: '爆款' },
      { id: 12, name: '深层洁面仪', model: 'BI-CL300', imgText: '声波清洁', tag: '热销' },
      { id: 4, name: '光子嫩肤仪', model: 'BI-IPL500', imgText: '强脉冲光', tag: '人气' },
      { id: 7, name: '微电流美容仪', model: 'BI-MS100', imgText: '微电流', tag: '新品' }
    ],
    featuredProducts: [
      { id: 2, name: '射频美容仪', model: 'BI-RF300', imgText: '多极射频' },
      { id: 3, name: '射频紧肤仪', model: 'BI-RF400', imgText: '院线射频' },
      { id: 7, name: '微电流美容仪', model: 'BI-MS100', imgText: '微电流提拉' },
      { id: 1, name: '多功能美容仪', model: 'BI-BM200', imgText: '7合1护理' },
      { id: 8, name: '智能皮肤分析仪', model: 'BI-SK100', imgText: 'AI皮肤分析' },
      { id: 12, name: '深层洁面仪', model: 'BI-CL300', imgText: '声波清洁' }
    ],
    hotScrollLeft: 0,
    hotScrollMax: 0,
    hotThumbLeft: 0,
    hotThumbWidth: 33,
    _scrollTimer: null
  },

  onLoad: function () {
    const that = this;
    wx.createSelectorQuery()
      .select('.hot-scroll')
      .fields({ scrollOffset: true, size: true }, function (res) {
        if (res) {
          that.setData({ hotScrollMax: res.scrollWidth || 0 });
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
    wx.switchTab({ url: '/pages/contact/contact' });
  },

  onShareAppMessage: function () {
    return {
      title: '采薇美容仪器 — 自主研发 · 精密制造 · 全球服务',
      path: '/pages/index/index'
    };
  }
});
