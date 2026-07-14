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
    if (!phone || !/^\d+$/.test(phone)) {
      wx.showToast({ title: '电话号码无效', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '处理中...', mask: true });
    const state = { attempt: 0 };
    const delays = [300, 600];
    const doCall = () => {
      wx.makePhoneCall({
        phoneNumber: phone,
        success: () => {
          wx.hideLoading();
        },
        fail: () => {
          if (state.attempt < 2) {
            const delay = delays[state.attempt];
            state.attempt++;
            setTimeout(doCall, delay);
          } else {
            wx.hideLoading();
            wx.showToast({ title: '拨打失败，请稍后再试', icon: 'none' });
          }
        }
      });
    };
    doCall();
  },

  /** 复制电话号码到剪贴板 */
  copyPhone: function () {
    const phone = (this.data.companyInfo.phone || '').trim();
    if (!phone) {
      wx.showToast({ title: '电话号码为空', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '处理中...', mask: true });
    const state = { attempt: 0 };
    const doCopy = () => {
      wx.setClipboardData({
        data: phone,
        success: () => {
          wx.hideLoading();
          wx.showToast({ title: '电话已复制', icon: 'success', duration: 2000 });
        },
        fail: () => {
          if (state.attempt < 2) {
            const delay = state.attempt === 0 ? 300 : 600;
            state.attempt++;
            setTimeout(doCopy, delay);
          } else {
            wx.hideLoading();
            wx.showToast({ title: '复制失败，请长按手动复制', icon: 'none' });
          }
        }
      });
    };
    doCopy();
  },

  /** 复制公司地址到剪贴板 */
  copyAddress: function () {
    const address = (this.data.companyInfo.address || '').trim();
    if (!address) {
      wx.showToast({ title: '地址为空', icon: 'none' });
      return;
    }

    // 防抖：成功复制后 2 秒内不再响应
    const now = Date.now();
    if (this.debounceUntil && now < this.debounceUntil) {
      return; // 静默忽略，不 showLoading、不 setClipboardData、不 toast
    }

    wx.showLoading({ title: '处理中...', mask: true });
    const state = { attempt: 0 };
    const doCopy = () => {
      wx.setClipboardData({
        data: address,
        success: () => {
          wx.hideLoading();
          wx.showToast({ title: '地址已复制', icon: 'success', duration: 2000 });
          // 记录防抖截止时间
          this.debounceUntil = Date.now() + 2000;
        },
        fail: () => {
          if (state.attempt < 2) {
            const delay = state.attempt === 0 ? 300 : 600;
            state.attempt++;
            setTimeout(doCopy, delay);
          } else {
            wx.hideLoading();
            wx.showToast({ title: '复制失败，请长按手动复制', icon: 'none' });
          }
        }
      });
    };
    doCopy();
  },

  onShareAppMessage: function () {
    return {
      title: '关于我们 — 采薇 · 专业美容仪器品牌',
      path: '/pages/about/about'
    };
  }
});