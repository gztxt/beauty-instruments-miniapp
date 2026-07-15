/**
 * 选配功能（options）功能测试
 * 对应变更：data/products.js 为美容仪器类 id 1~7 七款仪器新增 options 选配维度，
 *           并新增 getProductOptions(id) 工具函数（无配置时返回 []）。
 * 测试框架：jest（testEnvironment=node，jest.setup.js 已 mock 小程序全局 API）
 */
const { findProductById, getProductOptions } = require('../data/products.js');

const OPTION_PRODUCT_IDS = [1, 2, 3, 4, 5, 6, 7];

// 期望的三款产品 options（逐字对齐计划/实现）
const EXPECTED_OPTIONS = {
  1: [
    { key: 'chassis', name: '机箱样式', required: true, values: [
      { id: 'c1', label: '标准铝合金', desc: '阳极氧化银灰', icon: '🔲' },
      { id: 'c2', label: '高光烤漆白', desc: '钢琴烤漆白色', icon: '⬜' },
      { id: 'c3', label: '碳纤纹黑', desc: '哑光碳纤维纹', icon: '⬛' },
    ]},
    { key: 'handle', name: '手柄样式', required: true, values: [
      { id: 'h1', label: '直柄经典', desc: '直握人体工学', icon: '🖊️' },
      { id: 'h2', label: '弯柄贴面', desc: '弧形贴合面部', icon: '🪝' },
    ]},
    { key: 'bracket', name: '支架样式', required: false, values: [
      { id: 'b0', label: '不需要', desc: '仅主机', icon: '🚫' },
      { id: 'b1', label: '桌面立式', desc: '铝合金桌架', icon: '🗼' },
    ]},
  ],
  2: [
    { key: 'chassis', name: '机箱样式', required: true, values: [
      { id: 'c1', label: '标准铝合金', desc: '阳极氧化银灰', icon: '🔲' },
      { id: 'c2', label: '高光烤漆白', desc: '钢琴烤漆白色', icon: '⬜' },
    ]},
    { key: 'handle', name: '手柄样式', required: true, values: [
      { id: 'h1', label: '直柄经典', desc: '直握人体工学', icon: '🖊️' },
      { id: 'h2', label: '弯柄贴面', desc: '弧形贴合面部', icon: '🪝' },
      { id: 'h3', label: '双头手柄', desc: '一机双探头', icon: '🔱' },
    ]},
    { key: 'bracket', name: '支架样式', required: false, values: [
      { id: 'b0', label: '不需要', desc: '仅主机', icon: '🚫' },
      { id: 'b1', label: '桌面立式', desc: '铝合金桌架', icon: '🗼' },
      { id: 'b2', label: '滚轮推车', desc: '带轮移动推车', icon: '🛒' },
    ]},
  ],
  3: [
    { key: 'chassis', name: '机箱样式', required: true, values: [
      { id: 'c1', label: '标准铝合金', desc: '阳极氧化银灰', icon: '🔲' },
      { id: 'c3', label: '碳纤纹黑', desc: '哑光碳纤维纹', icon: '⬛' },
    ]},
    { key: 'handle', name: '手柄样式', required: true, values: [
      { id: 'h2', label: '弯柄贴面', desc: '弧形贴合面部', icon: '🪝' },
      { id: 'h3', label: '双头手柄', desc: '一机双探头', icon: '🔱' },
    ]},
    { key: 'bracket', name: '支架样式', required: false, values: [
      { id: 'b0', label: '不需要', desc: '仅主机', icon: '🚫' },
      { id: 'b1', label: '桌面立式', desc: '铝合金桌架', icon: '🗼' },
    ]},
  ],
  4: [
    { key: 'chassis', name: '机箱样式', required: true, values: [
      { id: 'c1', label: '标准铝合金', desc: '阳极氧化银灰', icon: '🔲' },
      { id: 'c2', label: '高光烤漆白', desc: '钢琴烤漆白色', icon: '⬜' },
      { id: 'c3', label: '碳纤纹黑', desc: '哑光碳纤维纹', icon: '⬛' },
    ]},
    { key: 'handle', name: '手柄样式', required: true, values: [
      { id: 'h1', label: '直柄经典', desc: '直握人体工学', icon: '🖊️' },
      { id: 'h2', label: '弯柄贴面', desc: '弧形贴合面部', icon: '🪝' },
    ]},
    { key: 'bracket', name: '支架样式', required: false, values: [
      { id: 'b0', label: '不需要', desc: '仅主机', icon: '🚫' },
      { id: 'b1', label: '桌面立式', desc: '铝合金桌架', icon: '🗼' },
    ]},
  ],
  5: [
    { key: 'chassis', name: '机箱样式', required: true, values: [
      { id: 'c2', label: '高光烤漆白', desc: '钢琴烤漆白色', icon: '⬜' },
      { id: 'c4', label: '马卡龙粉', desc: '磨砂樱花粉', icon: '🌸' },
    ]},
    { key: 'handle', name: '手柄样式', required: true, values: [
      { id: 'h1', label: '直柄经典', desc: '直握人体工学', icon: '🖊️' },
      { id: 'h4', label: '轻量便携', desc: '超轻旅行手柄', icon: '🪶' },
    ]},
    { key: 'bracket', name: '支架样式', required: false, values: [
      { id: 'b0', label: '不需要', desc: '仅主机', icon: '🚫' },
      { id: 'b3', label: '便携收纳盒', desc: '磁吸旅行盒', icon: '📦' },
    ]},
  ],
  6: [
    { key: 'chassis', name: '机箱样式', required: true, values: [
      { id: 'c1', label: '标准铝合金', desc: '阳极氧化银灰', icon: '🔲' },
      { id: 'c3', label: '碳纤纹黑', desc: '哑光碳纤维纹', icon: '⬛' },
      { id: 'c5', label: '香槟金', desc: '电镀香槟金', icon: '🥂' },
    ]},
    { key: 'handle', name: '手柄样式', required: true, values: [
      { id: 'h2', label: '弯柄贴面', desc: '弧形贴合面部', icon: '🪝' },
      { id: 'h5', label: '双球滚珠', desc: '24K镀金滚珠', icon: '⚜️' },
    ]},
    { key: 'bracket', name: '支架样式', required: false, values: [
      { id: 'b0', label: '不需要', desc: '仅主机', icon: '🚫' },
      { id: 'b1', label: '桌面立式', desc: '铝合金桌架', icon: '🗼' },
      { id: 'b4', label: '无线充电底座', desc: '感应充电立座', icon: '🔌' },
    ]},
  ],
  7: [
    { key: 'chassis', name: '机箱样式', required: true, values: [
      { id: 'c1', label: '标准铝合金', desc: '阳极氧化银灰', icon: '🔲' },
      { id: 'c4', label: '马卡龙粉', desc: '磨砂樱花粉', icon: '🌸' },
    ]},
    { key: 'handle', name: '手柄样式', required: true, values: [
      { id: 'h1', label: '直柄经典', desc: '直握人体工学', icon: '🖊️' },
      { id: 'h2', label: '弯柄贴面', desc: '弧形贴合面部', icon: '🪝' },
    ]},
    { key: 'bracket', name: '支架样式', required: false, values: [
      { id: 'b0', label: '不需要', desc: '仅主机', icon: '🚫' },
      { id: 'b3', label: '便携收纳盒', desc: '磁吸旅行盒', icon: '📦' },
    ]},
  ],
};

// 校验某个选配维度的结构合法性
function assertDimensionShape(dim) {
  expect(typeof dim.key).toBe('string');
  expect(dim.key.length).toBeGreaterThan(0);
  expect(typeof dim.name).toBe('string');
  expect(typeof dim.required).toBe('boolean');
  expect(Array.isArray(dim.values)).toBe(true);
  expect(dim.values.length).toBeGreaterThan(0);
  dim.values.forEach(v => {
    expect(typeof v.id).toBe('string');
    expect(v.id.length).toBeGreaterThan(0);
    expect(typeof v.label).toBe('string');
    expect(v.label.length).toBeGreaterThan(0);
    expect(typeof v.desc).toBe('string');
    expect(typeof v.icon).toBe('string');
  });
}

describe('选配功能 options 数据结构', () => {
  test('仅美容仪器类 id 1~7 配置了 options', () => {
    OPTION_PRODUCT_IDS.forEach(id => {
      const p = findProductById(id);
      expect(p).toBeTruthy();
      expect(Array.isArray(p.options)).toBe(true);
    });
    // 其余产品（8..15，皮肤检测/清洁护理类）不应有 options 字段
    for (let id = 8; id <= 15; id++) {
      const p = findProductById(id);
      expect(p).toBeTruthy();
      expect(p.options).toBeUndefined();
    }
  });

  test('每款选配产品的 options 含 chassis/handle/bracket 三维度且位于 scenes 之后', () => {
    OPTION_PRODUCT_IDS.forEach(id => {
      const p = findProductById(id);
      expect(p.options.map(d => d.key)).toEqual(['chassis', 'handle', 'bracket']);
      const keys = Object.keys(p);
      expect(keys.indexOf('scenes')).toBeLessThan(keys.indexOf('options'));
    });
  });

  test('每个选配维度结构合法', () => {
    OPTION_PRODUCT_IDS.forEach(id => {
      const p = findProductById(id);
      p.options.forEach(assertDimensionShape);
    });
  });

  test('required 语义：chassis/handle 必选，bracket 可选', () => {
    OPTION_PRODUCT_IDS.forEach(id => {
      const p = findProductById(id);
      const byKey = Object.fromEntries(p.options.map(d => [d.key, d]));
      expect(byKey.chassis.required).toBe(true);
      expect(byKey.handle.required).toBe(true);
      expect(byKey.bracket.required).toBe(false);
    });
  });

  test('同一产品内 option key 唯一、同一维度内 value id 唯一', () => {
    OPTION_PRODUCT_IDS.forEach(id => {
      const p = findProductById(id);
      const keys = p.options.map(d => d.key);
      expect(new Set(keys).size).toBe(keys.length);
      p.options.forEach(d => {
        const ids = d.values.map(v => v.id);
        expect(new Set(ids).size).toBe(ids.length);
      });
    });
  });

  test('options 数据与计划逐字一致', () => {
    OPTION_PRODUCT_IDS.forEach(id => {
      const p = findProductById(id);
      expect(p.options).toEqual(EXPECTED_OPTIONS[id]);
    });
  });
});

describe('getProductOptions(id) 工具函数', () => {
  test('已通过 module.exports 导出且为函数', () => {
    expect(typeof getProductOptions).toBe('function');
  });

  test('返回已配置产品的 options 数组（与对象内一致）', () => {
    OPTION_PRODUCT_IDS.forEach(id => {
      const p = findProductById(id);
      expect(getProductOptions(id)).toEqual(p.options);
      expect(getProductOptions(id)).toEqual(EXPECTED_OPTIONS[id]);
    });
  });

  test('未配置选项的产品返回空数组', () => {
    for (let id = 8; id <= 15; id++) {
      expect(getProductOptions(id)).toEqual([]);
    }
  });

  test('不存在的产品 ID 返回空数组', () => {
    expect(getProductOptions(999)).toEqual([]);
    expect(getProductOptions(0)).toEqual([]);
    expect(getProductOptions(-1)).toEqual([]);
  });
});
