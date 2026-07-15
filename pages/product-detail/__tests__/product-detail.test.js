/**
 * pages/product-detail/product-detail.js 交互测试
 * 对应变更：接入 option-selector 选配组件
 *   - onLoad 读取 getProductOptions(id) 写入 data.options
 *   - onOptionChange 保存 selection/summary
 *   - goToContact 在有选配时写 inquiryConfig 到 storage 再 switchTab
 * 测试框架：jest（testEnvironment=node）
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 读取真实产品数据模块，供页面 require 使用
const products = require('../../../data/products.js');

const detailPath = path.resolve(__dirname, '../product-detail.js');
const detailSource = fs.readFileSync(detailPath, 'utf-8');

// 在隔离上下文执行源码，捕获 Page 传入的对象；require 只放行 data/products
const context = {
  wx: global.wx,
  Page: (obj) => {
    obj.setData = function (patch) { Object.assign(this.data, patch); };
    context.pageObj = obj;
  },
  require: (id) => {
    if (id.includes('data/products')) return products;
    throw new Error(`require(${id}) not mocked`);
  },
  module: { exports: {} },
  console,
};
vm.createContext(context);
vm.runInContext(detailSource, context);

const pageObj = context.pageObj;

describe('pages/product-detail - 选配交互', () => {
  beforeEach(() => {
    // 补齐本页用到的 wx API mock
    global.wx.setStorageSync = jest.fn();
    global.wx.switchTab = jest.fn();
    global.wx.setNavigationBarTitle = jest.fn();
    global.wx.showToast = jest.fn();
    // 重置 data
    pageObj.data = {
      loading: true,
      product: { id: 0, name: '', model: '', desc: '', imgText: '', params: [], features: [], scenes: [] },
      options: [],
      optionSelection: {},
      optionSummary: []
    };
  });

  test('onLoad 有选配的产品(id=1) 写入 options', () => {
    pageObj.onLoad.call(pageObj, { id: '1' });
    expect(pageObj.data.product.id).toBe(1);
    expect(pageObj.data.options.length).toBe(3);
    expect(pageObj.data.options.map(o => o.key)).toEqual(['chassis', 'handle', 'bracket']);
  });

  test('onLoad 皮肤检测类产品(id=8) 也写入 3 个选配维度', () => {
    pageObj.onLoad.call(pageObj, { id: '8' });
    expect(pageObj.data.product.id).toBe(8);
    expect(pageObj.data.options.length).toBe(3);
    expect(pageObj.data.options.map(o => o.key)).toEqual(['chassis', 'handle', 'bracket']);
  });

  test('onLoad 未找到产品 走 toast 分支', () => {
    pageObj.onLoad.call(pageObj, { id: '999' });
    expect(global.wx.showToast).toHaveBeenCalled();
    expect(pageObj.data.loading).toBe(false);
  });

  test('onOptionChange 保存 selection 与 summary', () => {
    const detail = {
      selection: { chassis: 'c1', handle: 'h1' },
      summary: [
        { key: 'chassis', name: '机箱样式', label: '标准铝合金' },
        { key: 'handle', name: '手柄样式', label: '直柄经典' }
      ]
    };
    pageObj.onOptionChange.call(pageObj, { detail });
    expect(pageObj.data.optionSelection).toEqual(detail.selection);
    expect(pageObj.data.optionSummary).toEqual(detail.summary);
  });

  test('onOptionChange 缺省 detail 字段兜底为空', () => {
    pageObj.onOptionChange.call(pageObj, { detail: {} });
    expect(pageObj.data.optionSelection).toEqual({});
    expect(pageObj.data.optionSummary).toEqual([]);
  });

  test('goToContact 有选配 → 写 inquiryConfig 并 switchTab', () => {
    pageObj.data.product = { id: 2, name: '射频美容仪' };
    pageObj.data.optionSummary = [{ key: 'chassis', name: '机箱样式', label: '高光烤漆白' }];
    pageObj.goToContact.call(pageObj);
    expect(global.wx.setStorageSync).toHaveBeenCalledWith('inquiryConfig', {
      productId: 2,
      productName: '射频美容仪',
      summary: pageObj.data.optionSummary
    });
    expect(global.wx.switchTab).toHaveBeenCalledWith({ url: '/pages/about/about' });
  });

  test('goToContact 无选配 → 不写 storage 直接 switchTab', () => {
    pageObj.data.product = { id: 4, name: '光子嫩肤仪' };
    pageObj.data.optionSummary = [];
    pageObj.goToContact.call(pageObj);
    expect(global.wx.setStorageSync).not.toHaveBeenCalled();
    expect(global.wx.switchTab).toHaveBeenCalledWith({ url: '/pages/about/about' });
  });
});
