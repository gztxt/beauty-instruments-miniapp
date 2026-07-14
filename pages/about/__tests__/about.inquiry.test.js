/**
 * pages/about/__tests__/about.inquiry.test.js
 * 对应变更：about 页新增「咨询配置卡片」功能
 *   - data.inquiryConfig 初始为 null
 *   - onShow 从 storage 读取 inquiryConfig；仅当 cfg.summary 为非空数组才渲染
 *   - copyInquiryConfig 将配置拼成文本写入剪贴板，无配置时 toast 提示
 *   - clearInquiryConfig 清除 storage 与 data
 * 测试框架：jest（testEnvironment=node，jest.setup.js 已 mock 小程序全局 API）
 * 注：wxml/wxss 为纯 UI，不在此覆盖；本文件覆盖全部 JS 功能分支。
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const aboutPath = path.resolve(__dirname, '../about.js');
const aboutSource = fs.readFileSync(aboutPath, 'utf-8');

// 在隔离上下文执行源码，捕获 Page 传入的对象（沿用仓库既有模式）
const context = {
  wx: global.wx,
  getApp: global.getApp,
  Page: (obj) => {
    obj.setData = function (patch) { Object.assign(this.data, patch); };
    context.pageObj = obj;
  },
  require: (id) => { throw new Error(`require(${id}) not mocked`); },
  module: { exports: {} },
  console,
};
vm.createContext(context);
vm.runInContext(aboutSource, context);

const pageObj = context.pageObj;
const { onShow, copyInquiryConfig, clearInquiryConfig } = pageObj;

// 一个合法的咨询配置（与 product-detail 写入结构一致）
const VALID_CFG = {
  productId: 1,
  productName: '射频美容仪',
  summary: [
    { key: 'chassis', name: '机箱样式', label: '标准铝合金' },
    { key: 'handle', name: '手柄样式', label: '直柄经典' },
  ],
};

describe('pages/about - 咨询配置卡片 (inquiryConfig)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 补齐本次变更用到的 wx 存储/剪贴板 API mock
    global.wx.getStorageSync = jest.fn(() => undefined);
    global.wx.removeStorageSync = jest.fn();
    global.wx.setClipboardData = jest.fn();
    global.wx.showToast = jest.fn();
    // 重置仅本变更触碰的字段，避免用例间状态泄露
    pageObj.data.inquiryConfig = null;
  });

  // ============ 初始状态 ============
  describe('初始 data', () => {
    test('inquiryConfig 初始为 null', () => {
      expect(pageObj.data.inquiryConfig).toBeNull();
    });
  });

  // ============ onShow ============
  describe('onShow', () => {
    test('storage 有合法配置（summary 非空）→ setData 该配置对象', () => {
      global.wx.getStorageSync.mockReturnValue(VALID_CFG);
      onShow.call(pageObj);
      expect(pageObj.data.inquiryConfig).toEqual(VALID_CFG);
    });

    test('storage 返回空对象（无 summary）→ inquiryConfig 为 null', () => {
      global.wx.getStorageSync.mockReturnValue({});
      onShow.call(pageObj);
      expect(pageObj.data.inquiryConfig).toBeNull();
    });

    test('storage 返回 summary 为空数组 → inquiryConfig 为 null', () => {
      global.wx.getStorageSync.mockReturnValue({ productName: 'X', summary: [] });
      onShow.call(pageObj);
      expect(pageObj.data.inquiryConfig).toBeNull();
    });

    test('storage 返回 undefined → inquiryConfig 为 null', () => {
      global.wx.getStorageSync.mockReturnValue(undefined);
      onShow.call(pageObj);
      expect(pageObj.data.inquiryConfig).toBeNull();
    });

    test('storage 返回 null → inquiryConfig 为 null', () => {
      global.wx.getStorageSync.mockReturnValue(null);
      onShow.call(pageObj);
      expect(pageObj.data.inquiryConfig).toBeNull();
    });

    test('onShow 确实调用 getStorageSync("inquiryConfig")', () => {
      onShow.call(pageObj);
      expect(global.wx.getStorageSync).toHaveBeenCalledWith('inquiryConfig');
    });
  });

  // ============ copyInquiryConfig ============
  describe('copyInquiryConfig', () => {
    test('无配置（null）→ toast「暂无配置」且未调用剪贴板', () => {
      pageObj.data.inquiryConfig = null;
      copyInquiryConfig.call(pageObj);
      expect(global.wx.showToast).toHaveBeenCalledWith({ title: '暂无配置', icon: 'none' });
      expect(global.wx.setClipboardData).not.toHaveBeenCalled();
    });

    test('配置 summary 为空 → toast「暂无配置」且未调用剪贴板', () => {
      pageObj.data.inquiryConfig = { productName: 'X', summary: [] };
      copyInquiryConfig.call(pageObj);
      expect(global.wx.showToast).toHaveBeenCalledWith({ title: '暂无配置', icon: 'none' });
      expect(global.wx.setClipboardData).not.toHaveBeenCalled();
    });

    test('配置合法 → setClipboardData 写入正确文本（含产品名与各维度 name：label）', () => {
      pageObj.data.inquiryConfig = VALID_CFG;
      copyInquiryConfig.call(pageObj);
      const expectedText =
        '【咨询配置】射频美容仪\n机箱样式：标准铝合金\n手柄样式：直柄经典';
      expect(global.wx.setClipboardData).toHaveBeenCalledWith(
        expect.objectContaining({ data: expectedText })
      );
    });

    test('配置合法 → 剪贴板 success 回调 → toast「配置已复制」', () => {
      pageObj.data.inquiryConfig = VALID_CFG;
      global.wx.setClipboardData.mockImplementation(({ success }) => success());
      copyInquiryConfig.call(pageObj);
      expect(global.wx.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: '配置已复制', icon: 'success' })
      );
    });

    test('配置合法 → 剪贴板 fail 回调 → toast「复制失败，请稍后再试」', () => {
      pageObj.data.inquiryConfig = VALID_CFG;
      global.wx.setClipboardData.mockImplementation(({ fail }) => fail());
      copyInquiryConfig.call(pageObj);
      expect(global.wx.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: '复制失败，请稍后再试', icon: 'none' })
      );
    });
  });

  // ============ clearInquiryConfig ============
  describe('clearInquiryConfig', () => {
    test('调用 removeStorageSync("inquiryConfig")', () => {
      pageObj.data.inquiryConfig = VALID_CFG;
      clearInquiryConfig.call(pageObj);
      expect(global.wx.removeStorageSync).toHaveBeenCalledWith('inquiryConfig');
    });

    test('setData 将 inquiryConfig 置空', () => {
      pageObj.data.inquiryConfig = VALID_CFG;
      clearInquiryConfig.call(pageObj);
      expect(pageObj.data.inquiryConfig).toBeNull();
    });

    test('toast「已清除」(success, 1500ms)', () => {
      pageObj.data.inquiryConfig = VALID_CFG;
      clearInquiryConfig.call(pageObj);
      expect(global.wx.showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: '已清除', icon: 'success', duration: 1500 })
      );
    });
  });
});
