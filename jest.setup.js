// jest.setup.js - 小程序 API mock
global.wx = {
  makePhoneCall: jest.fn(),
  setClipboardData: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showToast: jest.fn(),
  getSystemInfoSync: jest.fn(() => ({ platform: 'devtools' })),
  getWindowInfo: jest.fn(() => ({ windowWidth: 375, windowHeight: 667 })),
  getDeviceInfo: jest.fn(() => ({ brand: 'devtools', model: 'simulator' })),
};

// 模拟 getApp()
global.getApp = jest.fn(() => ({
  globalData: {
    companyInfo: {
      name: '广州采薇美容仪器有限公司',
      address: '广州市番禺区石碁镇XX工业园XX栋',
      phone: '020-12345678',
      email: 'info@caiwei-beauty.com',
      website: 'www.caiwei-beauty.com'
    },
    brandColor: '#2d5016',
    brandGold: '#c9a84c',
    bgColor: '#f5f0e8'
  }
}));

// Page 构造器 mock
global.Page = jest.fn((obj) => obj);
