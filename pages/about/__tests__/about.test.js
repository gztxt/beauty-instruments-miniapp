/**
 * pages/about/__tests__/about.test.js
 * 测试 about 页交互函数：makeCall / copyPhone / copyAddress
 * 覆盖：校验失败、成功、失败重试 1 次、失败重试耗尽
 */

const fs = require('fs');
const path = require('path');

// 读取源文件并提取 Page 对象的方法
const aboutPath = path.resolve(__dirname, '../about.js');
const aboutSource = fs.readFileSync(aboutPath, 'utf-8');

// 用 vm 在隔离上下文中执行源码，拿到 Page 传入的对象
const vm = require('vm');
const context = {
  wx: global.wx,
  getApp: global.getApp,
  Page: (obj) => {
    obj.setData = jest.fn(); // mock setData
    context.pageObj = obj;
  },
  module: { exports: {} },
  require: (id) => { throw new Error(`require(${id}) not mocked`); },
  console: console,
  setTimeout: global.setTimeout,
  clearTimeout: global.clearTimeout,
};
vm.createContext(context);
vm.runInContext(aboutSource, context);

const pageObj = context.pageObj;
const { makeCall, copyPhone, copyAddress } = pageObj;

describe('pages/about/about.js - 交互函数', () => {

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    // 重置 wx mock 的实现
    global.wx.makePhoneCall.mockImplementation(({ success, fail }) => success());
    global.wx.setClipboardData.mockImplementation(({ success, fail }) => success());
    global.wx.showLoading.mockImplementation(() => {});
    global.wx.hideLoading.mockImplementation(() => {});
    global.wx.showToast.mockImplementation(() => {});
    // 重置防抖状态
    pageObj.debounceUntil = undefined;
    // 初始化 page data（模拟 onLoad）
    pageObj.onLoad.call(pageObj);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const runAllTimers = () => {
    jest.runAllTimers(); // 一次性跑完所有 setTimeout/setInterval
  };

  // 真实定时器下等待条件满足
  const waitFor = (fn, timeout = 3000) => {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        try {
          fn();
          resolve();
        } catch (e) {
          if (Date.now() - start > timeout) {
            reject(e);
          } else {
            setTimeout(check, 20);
          }
        }
      };
      check();
    });
  };

  // ============ makeCall 测试 ============
  describe('makeCall', () => {
    test('校验失败：电话为空 → toast"电话号码无效"，无 loading/重试', () => {
      pageObj.data.companyInfo.phone = '';
      makeCall.call(pageObj);

      expect(global.wx.showToast).toHaveBeenCalledWith({ title: '电话号码无效', icon: 'none' });
      expect(global.wx.showLoading).not.toHaveBeenCalled();
      expect(global.wx.makePhoneCall).not.toHaveBeenCalled();
    });

    test('校验失败：电话含非数字 → toast"电话号码无效"', () => {
      pageObj.data.companyInfo.phone = '020-ABCD';
      makeCall.call(pageObj);

      expect(global.wx.showToast).toHaveBeenCalledWith({ title: '电话号码无效', icon: 'none' });
      expect(global.wx.makePhoneCall).not.toHaveBeenCalled();
    });

    test('成功：makePhoneCall success → showLoading→hideLoading，toast 无额外调用', () => {
      pageObj.data.companyInfo.phone = '020-12345678';
      makeCall.call(pageObj);

      expect(global.wx.showLoading).toHaveBeenCalledWith({ title: '处理中...', mask: true });
      expect(global.wx.makePhoneCall).toHaveBeenCalledWith(expect.objectContaining({
        phoneNumber: '02012345678',
        success: expect.any(Function),
        fail: expect.any(Function),
      }));
      // 同步成功回调
      expect(global.wx.hideLoading).toHaveBeenCalled();
      // 无失败 toast
      const toastCalls = global.wx.showToast.mock.calls.map(c => c[0].title);
      expect(toastCalls).not.toContain('拨打失败，请稍后再试');
    });

    test('失败重试 1 次后成功：fail→300ms→success', async () => {
      jest.useRealTimers();
      pageObj.data.companyInfo.phone = '020-12345678';
      let callCount = 0;
      global.wx.makePhoneCall.mockImplementation(({ success, fail }) => {
        callCount++;
        if (callCount === 1) fail(); else success();
      });

      makeCall.call(pageObj);
      expect(global.wx.showLoading).toHaveBeenCalledTimes(1);

      // 等待重试完成
      await waitFor(() => {
        expect(global.wx.hideLoading).toHaveBeenCalledTimes(1);
      });
      expect(global.wx.showToast).not.toHaveBeenCalledWith(expect.objectContaining({ title: '拨打失败，请稍后再试' }));
      jest.useFakeTimers();
    });

    test('失败重试耗尽（3 次 fail）→ toast"拨打失败，请稍后再试"', async () => {
      jest.useRealTimers();
      pageObj.data.companyInfo.phone = '020-12345678';
      let callCount = 0;
      global.wx.makePhoneCall.mockImplementation(({ fail }) => {
        callCount++;
        fail();
      });

      makeCall.call(pageObj);

      // 等待所有重试耗尽
      await waitFor(() => {
        expect(global.wx.hideLoading).toHaveBeenCalledTimes(1);
      });
      expect(global.wx.showToast).toHaveBeenCalledWith(expect.objectContaining({
        title: '拨打失败，请稍后再试',
        icon: 'none'
      }));
      jest.useFakeTimers();
    });
  });

  // ============ copyPhone 测试 ============
  describe('copyPhone', () => {
    test('校验失败：电话为空 → toast"电话号码为空"，无 loading/重试', () => {
      pageObj.data.companyInfo.phone = '';
      copyPhone.call(pageObj);

      expect(global.wx.showToast).toHaveBeenCalledWith({ title: '电话号码为空', icon: 'none' });
      expect(global.wx.showLoading).not.toHaveBeenCalled();
      expect(global.wx.setClipboardData).not.toHaveBeenCalled();
    });

    test('成功：setClipboardData success → showLoading→hideLoading，toast"电话已复制"', () => {
      pageObj.data.companyInfo.phone = '020-12345678';
      copyPhone.call(pageObj);

      expect(global.wx.showLoading).toHaveBeenCalledWith({ title: '处理中...', mask: true });
      expect(global.wx.setClipboardData).toHaveBeenCalledWith(expect.objectContaining({
        data: '020-12345678',
        success: expect.any(Function),
        fail: expect.any(Function),
      }));
      expect(global.wx.hideLoading).toHaveBeenCalled();
      expect(global.wx.showToast).toHaveBeenCalledWith(expect.objectContaining({
        title: '电话已复制',
        icon: 'success',
        duration: 2000
      }));
    });

    test('失败重试 1 次后成功', async () => {
      jest.useRealTimers();
      pageObj.data.companyInfo.phone = '020-12345678';
      let callCount = 0;
      global.wx.setClipboardData.mockImplementation(({ success, fail }) => {
        callCount++;
        if (callCount === 1) fail(); else success();
      });

      copyPhone.call(pageObj);

      await waitFor(() => {
        expect(global.wx.hideLoading).toHaveBeenCalledTimes(1);
      });
      expect(global.wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '电话已复制' }));
      jest.useFakeTimers();
    });

    test('失败重试耗尽 → toast"复制失败，请长按手动复制"', async () => {
      jest.useRealTimers();
      pageObj.data.companyInfo.phone = '020-12345678';
      let callCount = 0;
      global.wx.setClipboardData.mockImplementation(({ fail }) => {
        callCount++;
        fail();
      });

      copyPhone.call(pageObj);

      await waitFor(() => {
        expect(global.wx.hideLoading).toHaveBeenCalledTimes(1);
      });
      expect(global.wx.showToast).toHaveBeenCalledWith(expect.objectContaining({
        title: '复制失败，请长按手动复制',
        icon: 'none'
      }));
      jest.useFakeTimers();
    });
  });

  // ============ copyAddress 测试 ============
  describe('copyAddress', () => {
    test('校验失败：地址为空 → toast"地址为空"', () => {
      pageObj.data.companyInfo.address = '';
      copyAddress.call(pageObj);

      expect(global.wx.showToast).toHaveBeenCalledWith({ title: '地址为空', icon: 'none' });
      expect(global.wx.showLoading).not.toHaveBeenCalled();
      expect(global.wx.setClipboardData).not.toHaveBeenCalled();
    });

    test('成功：setClipboardData success → toast"地址已复制"', () => {
      pageObj.data.companyInfo.address = '广州市番禺区石碁镇';
      copyAddress.call(pageObj);

      expect(global.wx.showLoading).toHaveBeenCalledWith({ title: '处理中...', mask: true });
      expect(global.wx.setClipboardData).toHaveBeenCalledWith(expect.objectContaining({
        data: '广州市番禺区石碁镇',
        success: expect.any(Function),
        fail: expect.any(Function),
      }));
      expect(global.wx.hideLoading).toHaveBeenCalled();
      expect(global.wx.showToast).toHaveBeenCalledWith(expect.objectContaining({
        title: '地址已复制',
        icon: 'success',
        duration: 2000
      }));
    });

    test('失败重试 1 次后成功', async () => {
      jest.useRealTimers();
      pageObj.data.companyInfo.address = '广州市番禺区';
      let callCount = 0;
      global.wx.setClipboardData.mockImplementation(({ success, fail }) => {
        callCount++;
        if (callCount === 1) fail(); else success();
      });

      copyAddress.call(pageObj);

      await waitFor(() => {
        expect(global.wx.hideLoading).toHaveBeenCalledTimes(1);
      });
      expect(global.wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '地址已复制' }));
      jest.useFakeTimers();
    });

    test('失败重试耗尽 → toast"复制失败，请长按手动复制"', async () => {
      jest.useRealTimers();
      pageObj.data.companyInfo.address = '广州市番禺区';
      let callCount = 0;
      global.wx.setClipboardData.mockImplementation(({ fail }) => {
        callCount++;
        fail();
      });

      copyAddress.call(pageObj);

      await waitFor(() => {
        expect(global.wx.hideLoading).toHaveBeenCalledTimes(1);
      });
      expect(global.wx.showToast).toHaveBeenCalledWith(expect.objectContaining({
        title: '复制失败，请长按手动复制',
        icon: 'none'
      }));
      jest.useFakeTimers();
    });

    // ============ copyAddress 防抖测试（新增） ============
    test('防抖：成功复制后 2 秒内再次调用 → 静默忽略（无 loading/clipboard/toast）', async () => {
      jest.useRealTimers();
      pageObj.data.companyInfo.address = '广州市番禺区石碁镇';
      // 第一次调用：成功
      copyAddress.call(pageObj);
      await waitFor(() => {
        expect(global.wx.hideLoading).toHaveBeenCalledTimes(1);
        expect(global.wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '地址已复制' }));
      });
      const firstClipboardCalls = global.wx.setClipboardData.mock.calls.length;
      const firstToastCalls = global.wx.showToast.mock.calls.length;
      const firstLoadingCalls = global.wx.showLoading.mock.calls.length;

      // 立即第二次调用（在 2 秒防抖窗口内）
      copyAddress.call(pageObj);
      await new Promise(r => setTimeout(r, 100)); // 给事件循环一点时间

      // 验证：无额外调用
      expect(global.wx.setClipboardData.mock.calls.length).toBe(firstClipboardCalls);
      expect(global.wx.showToast.mock.calls.length).toBe(firstToastCalls);
      expect(global.wx.showLoading.mock.calls.length).toBe(firstLoadingCalls);
      jest.useFakeTimers();
    });

    test('防抖：2 秒后再次调用 → 正常执行（showLoading/clipboard/toast 均触发）', async () => {
      jest.useRealTimers();
      pageObj.data.companyInfo.address = '广州市番禺区石碁镇';
      // 第一次调用
      copyAddress.call(pageObj);
      await waitFor(() => {
        expect(global.wx.hideLoading).toHaveBeenCalledTimes(1);
      });
      const firstClipboardCalls = global.wx.setClipboardData.mock.calls.length;

      // 等待防抖过期
      await new Promise(r => setTimeout(r, 2100));

      // 第二次调用
      copyAddress.call(pageObj);
      await waitFor(() => {
        expect(global.wx.hideLoading).toHaveBeenCalledTimes(2);
      });
      expect(global.wx.setClipboardData.mock.calls.length).toBe(firstClipboardCalls + 1);
      jest.useFakeTimers();
    });

    test('防抖：校验失败（地址为空）不触发防抖，且不影响后续正常调用', async () => {
      jest.useRealTimers();
      pageObj.data.companyInfo.address = '';
      // 校验失败
      copyAddress.call(pageObj);
      expect(global.wx.showToast).toHaveBeenCalledWith({ title: '地址为空', icon: 'none' });
      const toastCallsAfterFail = global.wx.showToast.mock.calls.length;

      // 设置有效地址
      pageObj.data.companyInfo.address = '广州市番禺区';
      copyAddress.call(pageObj);
      await waitFor(() => {
        expect(global.wx.hideLoading).toHaveBeenCalledTimes(1);
      });
      // 应该有新的 toast（地址已复制），而不是被防抖屏蔽
      expect(global.wx.showToast.mock.calls.length).toBeGreaterThan(toastCallsAfterFail);
      jest.useFakeTimers();
    });
  });
});