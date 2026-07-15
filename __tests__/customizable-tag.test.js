/**
 * 「可定制」标签数据不变量测试
 * 对应变更：products 页与首页卡片用 {{item.options.length}} 渲染「可定制」标签。
 *   标签正确性依赖两点：
 *   1) getProductsByCategory / findProductById 返回的产品对象保留 options 字段；
 *   2) 仅带选配的产品（美容仪器类 id 1~7）options.length 为真，其余为 0/undefined。
 * 测试框架：jest（testEnvironment=node）
 */
const {
  findProductById,
  getProductsByCategory,
} = require('../data/products.js');

const OPTION_PRODUCT_IDS = [1, 2, 3, 4, 5, 6, 7];

// 判定卡片是否显示「可定制」标签（等价于 wxml 的 {{item.options.length}}）
function isCustomizable(item) {
  return !!(item && Array.isArray(item.options) && item.options.length);
}

describe('可定制标签 - 数据不变量', () => {
  test('美容仪器类 id 1~7 带选配产品 options.length 为真', () => {
    OPTION_PRODUCT_IDS.forEach((id) => {
      const p = findProductById(id);
      expect(p).toBeTruthy();
      expect(isCustomizable(p)).toBe(true);
    });
  });

  test('其余产品（皮肤检测/清洁护理类）不显示「可定制」标签', () => {
    // 扫描皮肤检测(1)与清洁护理(2)类目，均不应有可定制标记
    [1, 2].forEach((cat) => {
      const all = getProductsByCategory(cat);
      expect(all.length).toBeGreaterThan(0);
      all.forEach((p) => {
        expect(isCustomizable(p)).toBe(false);
      });
    });
  });

  test('getProductsByCategory 返回对象保留 options 字段（卡片可读）', () => {
    const all = getProductsByCategory(0);
    const withOpt = all.filter((p) => OPTION_PRODUCT_IDS.includes(p.id));
    expect(withOpt.length).toBe(OPTION_PRODUCT_IDS.length);
    withOpt.forEach((p) => {
      expect(Array.isArray(p.options)).toBe(true);
      expect(p.options.length).toBeGreaterThan(0);
    });
  });

  test('首页卡片构建方式（Object.assign 合并 tag）保留 options', () => {
    // 模拟 index.js 的 build：Object.assign({ tag }, product)
    const p = findProductById(2);
    const card = Object.assign({ tag: '新品' }, p);
    expect(isCustomizable(card)).toBe(true);
    expect(card.tag).toBe('新品');
  });
});
