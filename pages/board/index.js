// pages/board/index.js
const dateUtil = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 页面时钟
    clock:'',
    // 动画数据
    animationData: null,
    // 是否显示设置modal
    settingModal: false,
    // 蓝牙适配器开关
    isbluetoothready: false,
    // 蓝牙适配器是否处于搜索状态
    searchingstatus: false,
    // 已发现的设备
    devices: [],
    // 已连接的设备信息
    ble: {},
    // 数据发送状态，只用于显示发送数据中显示loading，无其他实意
    sendDataStatus:false,
    // 是否弹出修改指令表单
    showCommandEditForm:false,
    // 初始化默认的命令
    commands:{},
    // 渲染指令表单
    form:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    // 初始化 
    that.initCommand()
    setInterval(function () {
      const now = dateUtil.formatTime(new Date());
      that.setData({
        clock:now
      })
    },1000)
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
   * 显示遮罩层
   * @param {*} e 
   */
  showSettingModal:function(e){
    if (this.data.settingModal == false) {
      this.animationModal()
    } else {
      this.hideSettingModal()
    }
  },

  /**
   * 动画函数
   * @param {*} e 
   */
  animationModal: function (e) {
    // 用that取代this，防止不必要的情况发生
    var that = this;
    // 创建一个动画实例
    var animation = wx.createAnimation({
      // 动画持续时间
      duration: 500,
      // 定义动画效果，当前是匀速
      timingFunction: 'linear'
    })
    // 将该变量赋值给当前动画
    that.animation = animation
    // 先在y轴偏移，然后用step()完成一个动画
    animation.translateX(1000).step()
    // 用setData改变当前动画
    that.setData({
      // 通过export()方法导出数据
      animationData: animation.export(),
      // 改变view里面的Wx：if
      settingModal: true
    })
    // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动 滑动时间
    setTimeout(function () {
      animation.translateX(0).step()
      that.setData({
        animationData: animation.export(),
        clearcart: false
      })
    }, 100)
  },
  /**
   * 隐藏
   * @param {*} e 
   */
  hideSettingModal: function (e) {
    var that = this;
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'linear'
    })
    that.animation = animation
    animation.translateX(700).step()
    that.setData({
      animationData: animation.export()
    })
    setTimeout(function () {
      animation.translateX(0).step()
      that.setData({
        animationData: animation.export(),
        settingModal: false
      })
    }, 500)
  },

  // 初始化显示用户指令集
  initCommand:function () {
    // 每次页面展示都会刷新值 
    let _this = this;
    try {
      // 提取用户设置好的的指令集
      let commands = wx.getStorageSync('commands');
      if(!commands){
        // 使用系统默认的
        commands = wx.getStorageSync('defaultCommands');
      }
      _this.setData({commands})
    } catch (e) {
      console.log('init command fail:',e)
      //弹框提示
      wx.showModal({
        title: '错误',
        content: '初始化用户数据失败，请稍后重试'
      })
    }
  },

  /**
   * 打开/关闭 蓝牙适配器(页面按钮触发)
   */
  switchBlueTooth: function () {
    var that = this
    // 状态翻转
    that.setData({
      isbluetoothready: !that.data.isbluetoothready
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
   * 关闭&打开连接状态(页面按钮触发)
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
   *开启&关闭蓝牙搜索(页面按钮触发)
   */
  openSearch: function (e) {
    //console.log(e.detail.value)
    let _this = this
    // 搜索前，必须判断适配器是否可用。获取本机适配状态
    wx.getBluetoothAdapterState({
      success(res) {
        let { available, discovering, errMsg } = res
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
          console.log("start search bluetooth devices")
          wx.startBluetoothDevicesDiscovery({
            success: function (res) {
              // 清空之前发现的列表
              _this.setData({
                devices:[]
              })
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
              console.log("stop search bluetooth devices")
              console.log(res)
              // 不用重复获取
              // _this.getBlue()
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

  /**
   * 按下事件发送指令
   */
  mytouchstart: function (e) {
    let _this = this
    let key = e.target.dataset.key
    let commands = _this.data.commands
    let { func,touchstart} = commands[key]
    if (func === null || func === '' || touchstart === null || touchstart === ''){
      wx.showModal({
        title: '错误提示',
        content: '您还没有设置该按钮按下发送指令，请在设置->修改指令页面设置'
      })
    }else{
      //console.log(_this.string2buffer(func+touchstart))
      // 16进制
      _this.sendMy(_this.string2buffer(func+touchstart))
      // _this.sendMy(_this.string2buffer("0x01"))
    }
  },

  /**
   * 松开事件发送指令
   */
  mytouchend: function (e) {
    let _this = this
    let key = e.target.dataset.key
    let commands = _this.data.commands
    let { func,touchend} = commands[key]
    if (func === null || func === '' || touchend === null || touchend === ''){
      wx.showModal({
        title: '错误提示',
        content: '您还没有设置该按钮按下发送指令，松开指令不能发送'
      })
    } else{
      //console.log(_this.string2buffer(func+touchend))
      // 16进制
      // this.sendMy(this.string2buffer('0xAB'))
      _this.sendMy(_this.string2buffer(func+touchend))
    }
  },

  /**
   * 点击事件发送指令
   */
  myclick: function (e){
    let _this = this
    let key = e.target.dataset.key
    let commands = _this.data.commands
    let { func,value} = commands[key]
    if (func === null || func === '' || value === null || value === ''){
      wx.showModal({
        title: '错误提示',
        content: '您还没有设置该按钮按下发送指令，松开指令不能发送'
      })
    } else{
      //console.log(_this.string2buffer(func+touchend))
      // 16进制
      // this.sendMy(this.string2buffer('0xAB'))
      console.log("得到的原始指令：",func,value)
      console.log("封装后的数据：",_this.string2buffer(func+value))
      _this.sendMy(_this.string2buffer(func+value))
    }
  },

  /**
   * switch改变事件发送指令
   */
  mychange: function(e){
    let _this = this
    let key = e.target.dataset.key
    let commands = _this.data.commands
    let { func,high,low} = commands[key]
    if (func === null || func === '' || high === null || high === '' || low === null || low === ''){
      wx.showModal({
        title: '错误提示',
        content: '您还没有设置该按钮按下发送指令，松开指令不能发送'
      })
      return
    }
    if (true == e.detail.value){
      // 打开
      // this.sendMy(this.string2buffer('0xAB'))
      _this.sendMy(_this.string2buffer(func+high))
    }else{
      // 关闭
      // this.sendMy(this.string2buffer('0xAB'))
      _this.sendMy(_this.string2buffer(func+low))
    }
  },

  /**
   * 长按修改指令
   * @param {}} e 
   */
  editCommand:function(e){
    let _this = this
    let key = e.target.dataset.key
    let commands = _this.data.commands
    let { name,func,high,low} = commands[key]
    // 回显之前已设置的值
    const form = { 
      "key": key,
      "func": _this.transformDecimal(func),
      "name": name, 
      "high": _this.transformDecimal(high), 
      "low": _this.transformDecimal(low) 
    }
    _this.setData({
      form
    },function(){
      console.log(e)
      _this.visibleCommandEditForm()
    })
  },

  /**
   * 初始化蓝牙
   */
  initBluetooth: function (){
    let that = this
    wx.showLoading({
      title: '正在开启',
    })
    // 初始化蓝牙模块，获取适配器
    wx.openBluetoothAdapter({
      success: function (res) {
        console.log('init bluetooth adapter success:' + JSON.stringify(res))
        wx.hideLoading()
        wx.showToast({
          title: '开启成功',
          icon: 'success',
          duration: 2000
        })
        // 监听蓝牙适配器状态变化事件
        wx.onBluetoothAdapterStateChange(function (res) {
          console.log("bluetooth adapter state change:", res)
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
        // 监听寻找到新设备的事件
        // 安卓下部分机型需要有位置权限才能搜索到设备，需留意是否开启了位置权限
        wx.onBluetoothDeviceFound(function (devices) {
          //name 蓝牙设备名称，某些设备可能没有
          //deviceId	用于区分设备的id
          console.log('discovery a new devices:',devices)
          let _device = that.data.devices
          // 加入之前判断设备名是否为空，为空的略掉
          for (const key in devices.devices) {
            const item = devices.devices[key]
            if(''!==item.name && true === item.connectable){
              _device.push(item)
            }else{
              console.log(item.deviceId+'的name为空,已经自动过滤')
            }
          }
          that.setData({
            devices: _device
          })
        })
        // 接收数据的方法wx.onBLECharacteristicValueChange
      },
      fail: function (res) {
        console.log('init bluetooth adapter fail:' + JSON.stringify(res))
        that.setData({
          isbluetoothready: false,
          searchingstatus: false
        })
        wx.hideLoading()
        wx.showModal({
          title: '错误',
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
        console.log('init bluetooth adapter complete')
      }
    })
  },

  /**
  * 获取在蓝牙模块生效期间所有已发现的蓝牙设备(已经弃用)
  */
  getBlue: function() {
    var that = this
    wx.getBluetoothDevices({
      success: function (res) {
        //deviceId 为设备 MAC 地址，iOS 上则为设备 uuid
        console.log("get all bluetooth devices",res)
        that.setData({
          devices: res.devices
        })
      },
      fail: function () {
        console.log("get all bluetooth devices fail")
      }
    })
  },

  /**
   * 连接低功耗蓝牙设备
   * @param {*} e 
   */
  connectDevice: function (e) {
    // 为了防止重复连接，连接前必须要判断
    let that = this;
    // 获取切换前的设备状态
    let ble = that.data.ble;
    // 当前处于连接中
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
      // 显示设备连接loading
      wx.showLoading()
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
              name:e.currentTarget.dataset.name,
              deviceId: e.currentTarget.dataset.deviceid
            },
          })
          wx.showToast({
            title: '连接成功',
            icon: 'success',
            duration: 2000
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
        console.log("get device characteristics：",JSON.stringify(res))
        for (var i = 0; i < res.characteristics.length; i++) {//2个值
          var model = res.characteristics[i]
          if (model.properties.notify == true) {
            ble.notifyId = model.uuid//监听的值
            that.setData({
              ble
            })
            //wx.setStorageSync('ble', ble);//存储ble,跨页面传值解决方案
            // 启用 notify 功能
            that.startNotice(model.uuid)//7.0
          }
          if (model.properties.write == true) {
            ble.writeId = model.uuid//用来写入的值
            that.setData({
              ble
            })
            //wx.setStorageSync('ble', ble);//存储ble,跨页面传值解决方案
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
          console.log("receive data value:",res.value)
          console.log("receive data hex value:",hex)
          that.receiveHandle(hex)
        })
      }
    })
  },

  // 收到指令后的回执处理
  receiveHandle(command){
    const that = this;
    // 收到心跳询问，需要即刻返回
    if('01ff'===command){
      console.log("收到心跳啦~")
      that.sendMy(that.string2buffer('0x01FF'))
    }else if('0001'===hex){
      console.log("设备已开启")
      // 设备已经启动
    }else if('0000'===hex){
      console.log("设备已关闭")
      // 设备已经关闭
      // 级联的驱动也应该关闭
    }else if('0201'===hex){
      console.log("驱动已开启")
      // 驱动已经启动
    }else if('0200'===hex){
      console.log("驱动已关闭")
      // 驱动已经关闭
    }
  },

  /**
   * 发送数据
   */
  sendMy(buffer) {
    var that = this;
    // 发送前校验蓝牙连接是否就绪 //跨页面传值解决方案
    let ble = that.data.ble
    // let ble = wx.getStorageSync('ble')
    if (Object.keys(ble).length !== 0) {
      console.log("send data:",buffer)
      that.setData({
        sendDataStatus:true
      })
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
          console.log("send data success")
        },
        fail: function (res) {
          // 清除存储的连接信息
          // wx.setStorageSync('ble', {}); //跨页面传值解决方案
          wx.showModal({
            title: '发送数据失败',
            content: res.errMsg
          })
          console.log("send data fail",res)
        },
        complete: function () {
          console.log("send data complete")
          that.setData({
            sendDataStatus:false
          })
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
   * 关闭蓝牙模块
   */
  closeAdapter: function() {
    let _this = this
    // 及时关闭蓝牙
    wx.closeBluetoothAdapter({
      success(res) {
        console.log("close bluetooth adapter success:" + JSON.stringify(res))
        _this.setData({
          isbluetoothready: false,
          searchingstatus: false,
          devices: [],
          ble:{}
        })
      },
      fail(res) {
        console.log("close bluetooth adapter fail:" + JSON.stringify(res))
      },
      complete(res) {
        console.log("close bluetooth adapter complete")
        wx.showModal({
          title: '提示',
          content: '请检查手机蓝牙是否打开',
        })
      }
    })
    console.log("closeAdapter执行完毕")
  },

  /**
   * 断开与低功耗蓝牙设备的连接
   */
  closeConnection: function() {
    var that = this;
    let ble = that.data.ble
    if (ble.deviceId != null){
      wx.closeBLEConnection({
        deviceId: ble.deviceId,
        complete: function (res) {
          console.log("disconnect bluetooth connection")
          // 清除存储的连接信息
          // wx.setStorageSync('ble', {}); // 跨页面传值解决方案
          that.setData({
            ble: {}
          })
        }
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
    console.log("hexArr",hexArr)
    return hexArr.join('');
  },

  /**
   * 显示弹框
   */
  visibleCommandEditForm:function(){
    let that = this
    that.setData({
      showCommandEditForm:true
    })
  },

  /**
   * 隐藏弹框,并清除现有表单
   */
  hiddenCommandEditForm: function () {
    let that = this
    that.setData({
      showCommandEditForm: false,
      form: { "name": '', "touchstart": '', "touchend": '',"key": '',"type": '',}
    })
  },


  /**
   * 确认保存指令
   */
  sureSave:function(e){
    let _this = this
    const {form,commands} = _this.data
    let key = form.key
    // 读出原来存储的值
    var _form = Object.assign({}, commands[key])
    try{
      _form.high = _this.transformHex(form.high)
      _form.low = _this.transformHex(form.low)
      _form.func = _this.transformHex(form.func)
      // 写入
      commands[key] = Object.assign({}, _form)
      _this.setData({
        commands
      })
      // 持久化保存
      wx.setStorageSync('commands', commands);
      _this.hiddenCommandEditForm()
    }catch(e){
      console.log("save command fail:",e)
      wx.showModal({
        title: '错误',
        content: '保存指令失败'
      })
    }
  },

  /**
   * 动态绑定文本框
   * @param {*} e 
   */
  bindInput:function(e){
    let _this = this
    let item = e.currentTarget.dataset.item;
    const form = _this.data.form
    // 指令框
    if (e.detail.value.length == 1) {
      form[item] = e.detail.value.replace(/[^1-9]/g, '') 
    } else {
      form[item] = e.detail.value.replace(/\D/g, '')
    }
    // 越界
    if (form[item] > 255 || form[item] < 0) {
      form[item] = ''
    }
    _this.setData({
      form
    })
  },

  /**
   * 10进制转换16进制(10进制必须在0~255区间，转换后形式0x01)
   * @param {*} num 
   */
  transformHex:function(num){
    if (null === num || '' === num){
      return '';
    }
    // 事先转换成整型
    num = parseInt(num)
    if (num > 255 || num < 0){
      // 越界，返回null
      return '';
    }
    var hex_num = num.toString(16);
    // 转换后判断hex_num的位数是否为2，不足2的自动补齐
    var zero = '00';
    var tmp = 2 - hex_num.length;
    return '0x' + zero.substr(0, tmp) + hex_num;
  },

  /**
   * 16进制转换10进制
   * @param {*} num 数字字符串
   */
  transformDecimal:function(num){
    if (null === num || '' === num){
      return '';
    }
    return parseInt(num, 16)
  },

})