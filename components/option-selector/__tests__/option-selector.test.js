/**
 * option-selector 组件单元测试
 * 对应变更：components/option-selector/* 新组件（4 件套：js/wxml/wxss/json）
 * 测试框架：jest（testEnvironment=node，jest.setup.js 已 mock 小程序全局 API）
 *
 * 小程序自定义组件通过 Component({...}) 注册，这里提供一个轻量级 Component 模拟，
 * 在 node 环境下实例化组件并验证 methods / lifetimes / 事件 的行为，不依赖渲染。
 *
 * 覆盖验收标准（选配功能方案.md §七 + §六测试计划）：
 *   - 初始化时 required 维度默认选中首项、非必选不选中（AC3）
 *   - onSelect 后 selected 更新且 triggerEvent 携带正确 summary（AC2/AC3）
 *   - _buildSummary 输出格式正确
 *   - options 属性 observer 触发重新初始化
 *   - change 事件实时携带 selection + summary（AC2 配置预览实时更新）
 */

// ---- 轻量级 Component 模拟（必须在 require 组件前注入 global.Component）----
const registry = {};
global.Component = (def) => { registry.def = def; return def; };

// 组件在 require 时执行 Component({...})，捕获其定义
require('../option-selector.js');

const getDef = () => registry.def;

/**
 * 实例化一个组件测试桩：
 *  - 合并 properties 进 this.data（与小程序运行时一致，组件内用 this.data.options 读取）
 *  - 提供 setData / triggerEvent 桩
 *  - 绑定 methods 与 lifetimes 到实例
 */
function createInstance(initialOptions = []) {
  const def = getDef();
  const instance = {
    properties: { options: initialOptions },
    data: JSON.parse(JSON.stringify(def.data || {})),
    _events: {},
    setData(patch, cb) {
      Object.assign(this.data, patch);
      if (typeof cb === 'function') cb();
    },
    triggerEvent(name, detail) {
      (this._events[name] = this._events[name] || []).push(detail);
    },
  };
  // 小程序：property 同步进 this.data
  instance.data.options = initialOptions;

  Object.keys(def.methods || {}).forEach((k) => {
    instance[k] = def.methods[k].bind(instance);
  });
  const lifetimes = def.lifetimes || {};
  Object.keys(lifetimes).forEach((k) => {
    instance['__lifetime_' + k] = lifetimes[k].bind(instance);
  });
  return instance;
}

// 与计划一致的选配维度（product 1 结构）：chassis/handle 必选，bracket 可选
const OPTIONS = [
  {
    key: 'chassis', name: '机箱样式', required: true, values: [
      { id: 'c1', label: '标准铝合金', desc: '阳极氧化银灰', icon: '🔲' },
      { id: 'c2', label: '高光烤漆白', desc: '钢琴烤漆白色', icon: '⬜' },
    ],
  },
  {
    key: 'handle', name: '手柄样式', required: true, values: [
      { id: 'h1', label: '直柄经典', desc: '直握人体工学', icon: '🖊️' },
      { id: 'h2', label: '弯柄贴面', desc: '弧形贴合面部', icon: '🪝' },
    ],
  },
  {
    key: 'bracket', name: '支架样式', required: false, values: [
      { id: 'b0', label: '不需要', desc: '仅主机', icon: '🚫' },
      { id: 'b1', label: '桌面立式', desc: '铝合金桌架', icon: '🗼' },
    ],
  },
];

const lastChange = (inst) => inst._events.change[inst._events.change.length - 1];

describe('option-selector 初始化（默认选中，AC3）', () => {
  test('required 维度默认选中首项，optional 不选中', () => {
    const inst = createInstance(OPTIONS);
    inst.__lifetime_attached();
    expect(inst.data.selected).toEqual({ chassis: 'c1', handle: 'h1' });
    expect(inst.data.selected.bracket).toBeUndefined();
  });

  test('options 为空时 selected 为空对象', () => {
    const inst = createInstance([]);
    inst.__lifetime_attached();
    expect(inst.data.selected).toEqual({});
  });

  test('required 维度若 values 为空则不选中（防御性）', () => {
    const opts = [{ key: 'x', name: 'X', required: true, values: [] }];
    const inst = createInstance(opts);
    inst.__lifetime_attached();
    expect(inst.data.selected.x).toBeUndefined();
  });

  test('无 required 标记的维度不默认选中', () => {
    const opts = [
      { key: 'a', name: 'A', required: false, values: [{ id: 'a1', label: 'A1', desc: '', icon: '' }] },
    ];
    const inst = createInstance(opts);
    inst.__lifetime_attached();
    expect(inst.data.selected.a).toBeUndefined();
  });

  test('初始化即触发一次 change 事件，携带默认 selection 与 summary', () => {
    const inst = createInstance(OPTIONS);
    inst.__lifetime_attached();
    expect(inst._events.change).toBeDefined();
    expect(inst._events.change).toHaveLength(1);
    const detail = inst._events.change[0];
    expect(detail.selection).toEqual({ chassis: 'c1', handle: 'h1' });
    expect(detail.summary).toHaveLength(2);
  });
});

describe('onSelect 交互（AC2 / AC3）', () => {
  test('点击切换选中项并更新 selected', () => {
    const inst = createInstance(OPTIONS);
    inst.__lifetime_attached();
    inst.onSelect({ currentTarget: { dataset: { key: 'chassis', id: 'c2' } } });
    expect(inst.data.selected.chassis).toBe('c2');
  });

  test('切换后 change 事件携带最新 selection 与正确 summary', () => {
    const inst = createInstance(OPTIONS);
    inst.__lifetime_attached();
    inst.onSelect({ currentTarget: { dataset: { key: 'chassis', id: 'c2' } } });
    const detail = lastChange(inst);
    expect(detail.selection.chassis).toBe('c2');
    expect(detail.summary.find((s) => s.key === 'chassis').label).toBe('高光烤漆白');
  });

  test('可选维度（bracket）点击后也能被选中并进入 summary', () => {
    const inst = createInstance(OPTIONS);
    inst.__lifetime_attached();
    inst.onSelect({ currentTarget: { dataset: { key: 'bracket', id: 'b1' } } });
    expect(inst.data.selected.bracket).toBe('b1');
    const detail = lastChange(inst);
    const b = detail.summary.find((s) => s.key === 'bracket');
    expect(b).toBeDefined();
    expect(b.label).toBe('桌面立式');
  });

  test('连续切换不同维度互不影响', () => {
    const inst = createInstance(OPTIONS);
    inst.__lifetime_attached();
    inst.onSelect({ currentTarget: { dataset: { key: 'chassis', id: 'c2' } } });
    inst.onSelect({ currentTarget: { dataset: { key: 'handle', id: 'h2' } } });
    expect(inst.data.selected).toEqual({ chassis: 'c2', handle: 'h2', bracket: undefined });
    expect(inst.data.selected.bracket).toBeUndefined();
  });

  test('AC2 高亮映射：选中项 id 与 selected[key] 一致（驱动 wxml --active 类）', () => {
    const inst = createInstance(OPTIONS);
    inst.__lifetime_attached();
    inst.onSelect({ currentTarget: { dataset: { key: 'chassis', id: 'c2' } } });
    const dim = OPTIONS.find((d) => d.key === 'chassis');
    dim.values.forEach((v) => {
      const isActive = inst.data.selected[dim.key] === v.id;
      if (v.id === 'c2') expect(isActive).toBe(true);
      else expect(isActive).toBe(false);
    });
  });
});

describe('_buildSummary 输出格式', () => {
  test('返回 {key,name,label} 结构，不包含 desc/icon', () => {
    const inst = createInstance(OPTIONS);
    inst.__lifetime_attached();
    const summary = inst._buildSummary();
    expect(summary).toHaveLength(2);
    summary.forEach((s) => {
      expect(Object.keys(s).sort()).toEqual(['key', 'label', 'name']);
    });
    expect(summary[0]).toEqual({ key: 'chassis', name: '机箱样式', label: '标准铝合金' });
  });

  test('未选中的维度不进入 summary', () => {
    const inst = createInstance(OPTIONS);
    inst.__lifetime_attached();
    const summary = inst._buildSummary();
    expect(summary.find((s) => s.key === 'bracket')).toBeUndefined();
  });

  test('改变选中后 summary 跟随更新', () => {
    const inst = createInstance(OPTIONS);
    inst.__lifetime_attached();
    inst.onSelect({ currentTarget: { dataset: { key: 'chassis', id: 'c2' } } });
    const s = inst._buildSummary().find((x) => x.key === 'chassis');
    expect(s.label).toBe('高光烤漆白');
  });
});

describe('options 属性 observer 重新初始化', () => {
  test('options 变化时重新按默认选中（丢弃旧选择）', () => {
    const inst = createInstance(OPTIONS);
    inst.__lifetime_attached();
    inst.onSelect({ currentTarget: { dataset: { key: 'chassis', id: 'c2' } } });
    expect(inst.data.selected.chassis).toBe('c2');

    getDef().properties.options.observer.call(inst, OPTIONS);
    expect(inst.data.selected.chassis).toBe('c1');
    expect(inst.data.selected.handle).toBe('h1');
    expect(inst.data.selected.bracket).toBeUndefined();
  });
});
