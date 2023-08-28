//app.js
App({
  onLaunch: function () {
    // 初始默认的指令
    const  commands = {
      PT:{"name": '电源',"func":'0x00',"high": '0x01',"low":'0x00'},// 改变时触发
      LT:{"name": '左转', "func":'0x03',"high": '0x01',"low":'0x00'},// 按下&松开触发
      RT:{"name": '右转', "func":'0x03',"high": '0x02',"low":'0x00'},// 按下&松开触发
      D:{"name": '前进', "func":'0x04',"high": '0x01',"low":'0x00'},// 按下&松开触发
      R:{"name": '后退', "func":'0x04',"high": '0x02',"low":'0x00'},// 按下&松开触发
      DT:{"name": '驱动', "func":'0x02',"high": '0x01',"low":'0x00'}// 改变时触发
    }
    wx.setStorageSync('defaultCommands', commands)

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  }
})