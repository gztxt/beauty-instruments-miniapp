const app = getApp();

Page({
  data: {
    companyInfo: {},
    milestones: [
      { year: '2015', desc: '采薇品牌创立，落户广州番禺，专注于家用美容仪器研发' },
      { year: '2017', desc: '首款智能皮肤检测仪上市，获天猫美容仪器品类新品销量TOP3' },
      { year: '2019', desc: '通过ISO 13485质量管理体系认证，生产基地扩至5000㎡' },
      { year: '2021', desc: '获国家高新技术企业认定，累计专利突破100项' },
      { year: '2023', desc: '产品远销全球50+国家和地区，服务全球500+企业客户' },
      { year: '2025', desc: '产品系列突破30个品类，新增射频美容仪、微电流美容仪产品线' }
    ],
    certifications: [
      { name: 'CE认证', short: 'CE' },
      { name: 'FCC认证', short: 'FCC' },
      { name: 'RoHS认证', short: 'RoHS' }
    ]
  },

  onLoad: function () {
    this.setData({
      companyInfo: app.globalData.companyInfo
    });
  },

  /** 一键拨号（去横线） */
  makeCall: function () {
    const phone = (this.data.companyInfo.phone || '').replace(/-/g, '');
    // 占位符或空号直接提示，避免 makePhoneCall 静默失败
    if (!phone || /X/i.test(phone)) {
      wx.showToast({ title: '电话号码待完善', icon: 'none' });
      return;
    }
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: function () {
        wx.showToast({ title: '拨号已取消', icon: 'none' });
      }
    });
  },

  /** 复制公司地址到剪贴板 */
  copyAddress: function () {
    wx.setClipboardData({
      data: this.data.companyInfo.address,
      success: function () {
        wx.showToast({ title: '地址已复制', icon: 'success', duration: 2000 });
      },
      fail: function () {
        wx.showToast({ title: '复制失败', icon: 'none' });
      }
    });
  },

  onShareAppMessage: function () {
    return {
      title: '关于我们 — 采薇 · 专业美容仪器品牌',
      path: '/pages/about/about'
    };
  }
});
