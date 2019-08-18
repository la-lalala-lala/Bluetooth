// pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 蓝牙适配器是否可用
    isbluetoothready: false,
    // 蓝牙适配器是否处于搜索状态
    searchingstatus: false,
    // 已发现的设备
    devices: [],
    // 已连接的设备信息
    ble: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //this.initBluetooth()
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
    this.closeConnection()
    this.closeAdapter()
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

  /**
   * 切换蓝牙适配器
   */
  switchBlueTooth: function () {
    var that = this
    // 状态翻转
    that.setData({
      isbluetoothready: !that.data.isbluetoothready,
    })
    if (that.data.isbluetoothready) {
      // 初始化适配器
      that.initBluetooth()
    }else{
      // 关闭蓝牙
      that.closeConnection()
      // 关闭适配器
      that.closeAdapter()
    }
  },

  /**
   * 关闭连接状态
   */
  switchConnection: function (){
    var that = this;
    // 获取切换前的设备状态
    let connectionStatus = that.data.ble;
    if (connectionStatus !== null){
      this.closeConnection()
    }
  },

  /**
   * 初始化连接
   */
  initBluetooth: function (){
    let that = this
    // 初始化蓝牙模块，获取适配器
    wx.openBluetoothAdapter({
      success: function (res) {
        console.log('初始化蓝牙适配器成功' + JSON.stringify(res))
        that.msg = '初始化蓝牙适配器成功'
        wx.showModal({
          title: '蓝牙适配情况',
          content: '初始化蓝牙适配器成功'
        })
        // 监听蓝牙适配器状态变化事件
        wx.onBluetoothAdapterStateChange(function (res) {
          console.log("蓝牙适配器状态变化", res)
          if (res.available === false) {
            // 蓝牙不可用
            // 断开连接
            that.closeConnection()
            // 关闭适配器
            that.closeAdapter()
            that.setData({
              devices: [],
              isbluetoothready: res.available,
              searchingstatus: res.discovering
            })
          } else {
            // 蓝牙可用
            that.setData({
              isbluetoothready: res.available,
              searchingstatus: res.discovering
            })
          }
        })
        // 监听寻找的新设备
        // 安卓下部分机型需要有位置权限才能搜索到设备，需留意是否开启了位置权限
        wx.onBluetoothDeviceFound(function (devices) {
          let _device = that.data.devices
          _device.push(...devices.devices)
          that.setData({
            devices: _device
          })
          //name 蓝牙设备名称，某些设备可能没有
          //deviceId	用于区分设备的id
          console.log('监听到有新设备')
          console.log(devices)
        })
        // 接收数据的方法wx.onBLECharacteristicValueChange
      },
      fail: function () {
        that.msg = '初始化蓝牙适配器失败'
        that.setData({
          isbluetoothready: false,
          searchingstatus: false
        })
        wx.showModal({
          title: '蓝牙适配情况',
          content: '蓝牙适配失败，请检查手机蓝牙和定位功能是否打开'
        })
      },
      complete: function () {
        // 适配器初始化完成后，赋予初始值
        wx.getBluetoothAdapterState({
          success(res) {
            let { available, discovering, errMsg } = res
            that.setData({
              isbluetoothready: res.available,
              searchingstatus: res.discovering
            })
          }, 
          fail: function () {
            that.setData({
              isbluetoothready: false,
              searchingstatus: false
            })
          }
        })
        console.log('初始化蓝牙适配器完成')
      }
    })
  },

  /**
   *开启蓝牙搜索
   */
  startSearch: function (e) {
    //console.log(e.detail.value)
    let _this = this
    // 搜索前，必须判断适配器是否可用。获取本机适配状态
    wx.getBluetoothAdapterState({
      success(res) {
        let { available, discovering, errMsg } = res
        console.log("开启&关闭蓝牙搜索")
        console.log(res)
        if (available == false){
          // 未开启适配器
          _this.setData({
            isbluetoothready: false
          })
          wx.showModal({
            title: '蓝牙搜索失败',
            content: '请打开蓝牙后再试'
          })
        }
        if (available == true && discovering == false) {
          // 蓝牙可用，且当前没有进行搜索 -> 开启搜索
          // 开始搜寻附近的蓝牙外围设备,此过程比较耗费系统资源，在找到设备后，请及时关闭
          wx.startBluetoothDevicesDiscovery({
            success: function (res) {
              // 清空之前发现的列表
              _this.setData({
                devices:[]
              })
              console.log("开始搜索附近蓝牙设备")
            },
            fail: function (res) {
              wx.showModal({
                title: '蓝牙搜索失败',
                content: res.errMsg
              })
            }
          })
        }
        if (available == true && discovering == true) {
          // 蓝牙可用，且当前正在进行搜索 -> 关闭搜索
          // 关闭搜索
          wx.stopBluetoothDevicesDiscovery({
            success: function (res) {
              console.log("停止蓝牙搜索")
              console.log(res)
              _this.getBlue()
            }
          })
        }
      },
      fail(res) {
        _this.setData({
          searchingstatus: false
        })
        wx.showModal({
          title: '错误提示',
          content: res.errMsg
        })
      }
    })
  },

  // 关闭蓝牙
  closeAdapter: function() {
    let _this = this
    // 及时关闭蓝牙
    wx.closeBluetoothAdapter({
      success(res) {
        console.log("关闭蓝牙适配器成功" + JSON.stringify(res))
        _this.setData({
          isbluetoothready: false,
          searchingstatus: false,
          devices: [],
          ble:{}
        })
      },
      fail(res) {
        console.log("关闭蓝牙适配器失败" + JSON.stringify(res))
      },
      complete(res) {
        console.log("关闭蓝牙适配器结束")
        wx.showModal({
          title: '提示',
          content: '请检查手机蓝牙是否打开',
        })
      }
    })
    console.log("closeAdapter执行完毕")
  },

  /**
   * 关闭蓝牙连接
   */
  closeConnection: function() {
    var that = this;
    let ble = that.data.ble
    if (ble.deviceId != null){
      wx.closeBLEConnection({
        deviceId: ble.deviceId,
        complete: function (res) {
          console.log("断开蓝牙连接")
          // 清除存储的连接信息
          wx.setStorageSync('ble', {});
          that.setData({
            ble: {}
          })
        }
      })
    }
  },

  /**
  * 获取搜索到的设备信息
  */
  getBlue: function() {
    var that = this
    wx.getBluetoothDevices({
      success: function (res) {
        //deviceId 为设备 MAC 地址，iOS 上则为设备 uuid
        console.log(res)
        that.setData({
          devices: res.devices
        })
      },
      fail: function () {
        console.log("搜索蓝牙设备失败")
      }
    })
  },

  //连接设备
  connectDevice: function (e) {
    // 为了防止重复连接，连接前必须要判断
    let that = this;
    // 获取切换前的设备状态
    let ble = that.data.ble;
    if (Object.keys(ble).length !== 0) {
      if (e.currentTarget.dataset.deviceid === ble.deviceId){
        wx.showModal({
          title: '设备连接完毕',
          content: '您已经连接了该设备'
        })
      }else{
        wx.showModal({
          title: '设备连接失败',
          content: '您已经连接了设备:' + ble.deviceId + '请您断开该连接后重试。'
        })
      }
    }else{
      wx.showLoading({
        title: '连接蓝牙设备中...',
      })
      wx.createBLEConnection({
        deviceId: e.currentTarget.dataset.deviceid,
        success: function (res) {
          // 关闭蓝牙
          wx.stopBluetoothDevicesDiscovery({
            success: function (res) {
              console.log('连接蓝牙成功之后关闭蓝牙搜索');
            }
          })
          // 保存连接成功的设备信息
          that.setData({
            ble: {
              connectionStatus: true,
              deviceId: e.currentTarget.dataset.deviceid
            },
          })
          wx.showModal({
            title: '设备连接完毕',
            content: '连接成功'
          })
          //获取蓝牙设备所有服务
          that.getServiceId()
        },
        fail: function (res) {
          wx.showModal({
            title: '设备连接失败',
            content: res.errMsg
          })
        },
        complete: function () {
          wx.hideLoading()
        }
      })
    }
  },

  /**
   * 获取蓝牙设备所有服务
   */
  getServiceId() {
    let that = this
    let ble = that.data.ble
    wx.getBLEDeviceServices({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: ble.deviceId,
      success: function (res) {
        ble.serviceId = res.services[0].uuid
        that.setData({
          ble
        })
        // 获取设备的特征值
        that.getCharacteId()
      }
    })
  },

  /**
   * 获取设备特征值
   */
  getCharacteId() {
    var that = this
    let ble = that.data.ble
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId: ble.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: ble.serviceId,
      success: function (res) {
        console.log("特征值"+JSON.stringify(res))
        for (var i = 0; i < res.characteristics.length; i++) {//2个值
          var model = res.characteristics[i]
          if (model.properties.notify == true) {
            ble.notifyId = model.uuid//监听的值
            that.setData({
              ble
            })
            wx.setStorageSync('ble', ble);//存储ble
            // 启用 notify 功能
            that.startNotice(model.uuid)//7.0
          }
          if (model.properties.write == true) {
            ble.writeId = model.uuid//用来写入的值
            that.setData({
              ble
            })
            wx.setStorageSync('ble', ble);//存储ble
          }
        }
      }
    })
  },

  /**
   * 启用 notify 功能
   */
  startNotice(uuid) {
    var that = this;
    let ble = that.data.ble
    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
      deviceId: ble.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: ble.serviceId,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: uuid,  //第一步 开启监听 notityid  第二步发送指令 write
      success: function (res) {
        // 设备返回的方法
        // 监听低功耗蓝牙设备的特征值变化事件必须先启用wx.notifyBLECharacteristicValueChange
        wx.onBLECharacteristicValueChange(function (res) {
        // 此时可以拿到蓝牙设备返回来的数据是一个ArrayBuffer类型数据，所以需要通过一个方法转换成字符串
          var hex = that.ab2hex(res.value)
        })
      }
    })
  },

  /**
   * 发送数据
   */
  sendMy(buffer) {
    var that = this
    let ble = that.data.ble
    wx.writeBLECharacteristicValue({
      // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId: ble.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: ble.services,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: ble.writeId,//第二步写入的特征值
      // 这里的value是ArrayBuffer类型
      value: buffer,
      success: function (res) {
        console.log("写入成功")
      },
      fail: function () {
        console.log('写入失败')
      },
      complete: function () {
        console.log("调用结束");
      }
    })
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