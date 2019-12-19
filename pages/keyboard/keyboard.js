// pages/keyboard/keyboard.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 当前选中的按钮下标
    nowIndex: -1,
    // 获取到的缓存指令集
    orders: [],
    // 若用户没有初始化指令集时，系统自动创建的指令集那个数
    orderSize: 30,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 初始化 
    let _this = this;
    _this.initOrder()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 每次页面展示都会刷新值 
    let _this = this;
    _this.initOrder()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // 初始化显示用户指令集
  initOrder: function () {
    // 每次页面展示都会刷新值 
    let _this = this;
    let orderSize = _this.data.orderSize || 30
    try {
      // 提取用户设置的指令集
      let orders = wx.getStorageSync('order') || [];
      if (orders.length <= 0) {
        // 用户没有初始化，系统自动初始化,然后写入缓存
        for (var i = 0; i < orderSize; i++) {
          orders[i] = { "name": '', "touchstart": '', "touchend": '' }
        }
        // 写入缓存
        wx.setStorageSync('order', orders);
      } else {
        _this.setData({
          orders
        })
      }
    } catch (e) {
      console.log('初始化指令失败', e)
      //弹框提示
      wx.showModal({
        title: '错误提示',
        content: '初始化用户数据失败，请稍后重试'
      })
    }
  },

  /**
   * 按下事件
   */
  mytouchstart: function (e) {
    let _this = this
    let nowIndex = e.target.dataset.id
    const orders = _this.data.orders
    const nowOrder = orders[nowIndex] || {}
    if (nowOrder.touchstart === null || nowOrder.touchstart === ''){
      wx.showModal({
        title: '错误提示',
        content: '您还没有设置该按钮按下发送指令，请在设置->修改指令页面设置'
      })
    }else{
      //console.log(1)
      // 16进制
      _this.sendMy(_this.string2buffer(nowOrder.touchstart))
     // _this.sendMy(_this.string2buffer("0x01"))
    }
  },

  /**
   * 松开事件
   */
  mytouchend: function (e) {
    let _this = this
    let nowIndex = e.target.dataset.id
    const orders = _this.data.orders
    const nowOrder = orders[nowIndex] || {}
    if (nowOrder.touchend !== null && nowOrder.touchend !== '') {
      // 设置了，可以发送
      // this.sendMy(this.string2buffer('0xAB'))
      //console.log(2)
      // 16进制
      _this.sendMy(_this.string2buffer(nowOrder.touchend))
    } 
    if ((nowOrder.touchstart === null || nowOrder.touchstart === '')) {
      wx.showModal({
        title: '错误提示',
        content: '您还没有设置该按钮按下发送指令，松开指令不能发送'
      })
    }
  },

  /**
   * 发送数据
   */
  sendMy(buffer) {
    // 发送前校验蓝牙连接是否就绪
    let ble = wx.getStorageSync('ble')
    console.log(ble)
    if (Object.keys(ble).length !== 0) {
      wx.writeBLECharacteristicValue({
        // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
        deviceId: ble.deviceId,
        // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
        serviceId: ble.serviceId,
        // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
        characteristicId: ble.writeId,//第二步写入的特征值
        // 这里的value是ArrayBuffer类型
        value: buffer,
        success: function (res) {
          console.log("写入成功")
        },
        fail: function (res) {
          // 清除存储的连接信息
          wx.setStorageSync('ble', {});
          wx.showModal({
            title: '发送数据失败',
            content: res.errMsg
          })
        },
        complete: function () {
          console.log("调用结束");
        }
      })
    }else{
      wx.showModal({
        title: '发送数据失败',
        content: '请连接蓝牙设备后再发送数据'
      })
    }
  },

  /**
  * 将字符串转换成ArrayBufer
  */
  string2buffer(str) {
    let val = ""
    if (!str) return;
    let length = str.length;
    let index = 0;
    let array = []
    while (index < length) {
      array.push(str.substring(index, index + 2));
      index = index + 2;
    }
    val = array.join(",");
    // 将16进制转化为ArrayBuffer
    return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    })).buffer
  },

  /**
   * 将ArrayBuffer转换成字符串
   */
  ab2hex(buffer) {
    var hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      function (bit) {
        return ('00' + bit.toString(16)).slice(-2)
      }
    )
    return hexArr.join('');
  },

})