const { findProductById, getProductOptions } = require('../../data/products');

Page({
  data: {
    loading: true,
    product: {
      id: 0, name: '', model: '', desc: '', imgText: '',
      params: [], features: [], scenes: []
    },
    options: [],
    optionSelection: {},
    optionSummary: []
  },

  onLoad: function (options) {
    const id = parseInt(options.id) || 0;
    const product = findProductById(id);

    if (product) {
      this.setData({ product, options: getProductOptions(id), loading: false });
      wx.setNavigationBarTitle({ title: product.name });
    } else {
      wx.showToast({ title: '产品未找到', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  onOptionChange: function (e) {
    this.setData({
      optionSelection: e.detail.selection || {},
      optionSummary: e.detail.summary || []
    });
  },

  goToContact: function () {
    if (this.data.optionSummary && this.data.optionSummary.length) {
      wx.setStorageSync('inquiryConfig', {
        productId: this.data.product.id,
        productName: this.data.product.name,
        summary: this.data.optionSummary
      });
    }
    wx.switchTab({ url: '/pages/about/about' });
  },

  goBack: function () {
    wx.navigateBack();
  },

  onShareAppMessage: function () {
    const p = this.data.product;
    return {
      title: p.name ? `${p.name} — 采薇美容仪器` : '采薇美容仪器产品详情',
      path: '/pages/product-detail/product-detail?id=' + p.id
    };
  }
});
