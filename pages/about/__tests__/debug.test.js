const fs = require('fs');
const path = require('path');
const vm = require('vm');

const aboutPath = path.resolve(__dirname, '../about.js');
const aboutSource = fs.readFileSync(aboutPath, 'utf-8');

const context = {
  wx: {
    makePhoneCall: jest.fn(({success, fail}) => fail()),
    showLoading: jest.fn(),
    hideLoading: jest.fn(),
    showToast: jest.fn(),
  },
  getApp: () => ({ globalData: { companyInfo: { phone: '020-12345678' } } }),
  Page: (obj) => { context.pageObj = obj; },
  module: { exports: {} },
  require: (id) => { throw new Error(`require(${id}) not mocked`); },
  console: console,
  setTimeout: global.setTimeout,
  clearTimeout: global.clearTimeout,
};
vm.createContext(context);
vm.runInContext(aboutSource, context);

const { makeCall } = context.pageObj;

jest.useFakeTimers();
test('debug timer', () => {
  makeCall.call(context.pageObj);
  console.log('After makeCall:', context.wx.makePhoneCall.mock.calls.length);
  jest.advanceTimersByTime(300);
  jest.runOnlyPendingTimers();
  console.log('After 300ms:', context.wx.makePhoneCall.mock.calls.length);
  jest.advanceTimersByTime(600);
  jest.runOnlyPendingTimers();
  console.log('After 900ms:', context.wx.makePhoneCall.mock.calls.length);
  console.log('hideLoading calls:', context.wx.hideLoading.mock.calls.length);
  console.log('showToast calls:', context.wx.showToast.mock.calls.map(c => c[0].title));
});
