App({
  onLaunch: function () {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
  },
  globalData: {
    systemInfo: null,
    // 品牌色配置
    brandColor: '#2d5016',
    brandGold: '#c9a84c',
    bgColor: '#f5f0e8',
    // 公司信息（统一来源）
    companyInfo: {
      name: '广州采薇美容仪器有限公司',
      address: '广州市番禺区石碁镇XX工业园XX栋',
      phone: '020-XXXXXXXX',
      email: 'info@caiwei-beauty.com',
      website: 'www.caiwei-beauty.com'
    }
  }
});
