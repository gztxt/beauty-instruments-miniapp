const app = getApp();

Page({
  data: {
    activeSwiper: 0,
    banners: [
      { tag: 'CONTACT', title: '联系我们', sub: '期待与您携手合作 · 共同发展' },
      { tag: 'SERVICE', title: '全球服务网络', sub: '30+国家客户信赖 · 本地化支持' },
      { tag: 'COOPERATE', title: '合作咨询', sub: 'OEM/ODM · 品牌定制 · 技术方案' }
    ],
    companyInfo: {},
    formData: { name: '', phone: '', message: '' },
    canSubmit: false,
    submitting: false,
    // 地图坐标
    latitude: 22.555,
    longitude: 113.883,
    markers: [{
      id: 1,
      latitude: 22.555,
      longitude: 113.883,
      title: '采薇美容仪器',
      callout: { content: '广州采薇美容仪器有限公司', padding: 8, borderRadius: 4 }
    }]
  },

  onLoad: function () {
    this.setData({
      companyInfo: app.globalData.companyInfo
    });
  },

  onSwiperChange: function (e) {
    this.setData({ activeSwiper: e.detail.current });
  },

  /** 通用表单输入处理 */
  onFieldInput: function (e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`formData.${field}`]: e.detail.value }, this.checkForm);
  },

  checkForm: function () {
    const { name, phone, message } = this.data.formData;
    const valid = name.trim() !== '' && phone.trim() !== '' && message.trim() !== '';
    this.setData({ canSubmit: valid });
  },

  makeCall: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.companyInfo.phone.replace(/-/g, '')
    });
  },

  copyAddress: function () {
    wx.setClipboardData({
      data: this.data.companyInfo.address,
      success: function () {
        wx.showToast({ title: '地址已复制', icon: 'success', duration: 2000 });
      }
    });
  },

  submitForm: function () {
    const { name, phone, message } = this.data.formData;

    // 前端校验
    if (!name.trim() || !phone.trim() || !message.trim()) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    if (this.data.submitting) return;
    this.setData({ submitting: true });

    wx.showLoading({ title: '提交中...', mask: true });

    // TODO: 对接真实 API — 替换为 wx.request()
    // wx.request({
    //   url: 'https://api.your-domain.com/contact',
    //   method: 'POST',
    //   data: this.data.formData,
    //   success: (res) => { ... },
    //   fail: () => { wx.showToast({ title: '网络异常，请稍后重试', icon: 'none' }); },
    //   complete: () => { this.setData({ submitting: false }); wx.hideLoading(); }
    // });

    // 模拟提交（临时）
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '提交成功！我们将尽快与您联系', icon: 'success', duration: 2500 });
      this.setData({
        formData: { name: '', phone: '', message: '' },
        canSubmit: false,
        submitting: false
      });
    }, 1500);
  },

  onShareAppMessage: function () {
    return {
      title: '联系我们 — 采薇 · 美容仪器OEM/ODM合作',
      path: '/pages/contact/contact'
    };
  }
});
