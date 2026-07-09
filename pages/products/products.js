const { getProductsByCategory, getCategoryName } = require('../../data/products');

Page({
  data: {
    activeSwiper: 0,
    banners: [
      { tag: 'PRODUCTS', title: '美容仪器全系列', sub: '多极射频 · 光子嫩肤 · 超声波导入' },
      { tag: 'CUSTOMIZE', title: '支持OEM/ODM定制', sub: '品牌定制 · 品质保障 · 全球交付' },
      { tag: 'QUALITY', title: '万级无尘车间制造', sub: 'ISO质量管理 · CE/FCC/RoHS认证' }
    ],
    currentTab: 0,
    currentProducts: [],
    // 分类列表
    categories: [
      { index: 0, name: getCategoryName(0) },
      { index: 1, name: getCategoryName(1) },
      { index: 2, name: getCategoryName(2) }
    ]
  },

  onLoad: function () {
    this.setData({
      currentProducts: getProductsByCategory(0)
    });
  },

  onSwiperChange: function (e) {
    this.setData({ activeSwiper: e.detail.current });
  },

  switchTab: function (e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      currentTab: index,
      currentProducts: getProductsByCategory(index)
    });
  },

  showProductDetail: function (e) {
    const product = e.currentTarget.dataset.product;
    wx.navigateTo({
      url: '/pages/product-detail/product-detail?id=' + product.id
    });
  },

  onShareAppMessage: function () {
    return {
      title: '采薇美容仪器产品中心 — 专业美容仪器制造商',
      path: '/pages/products/products'
    };
  }
});
