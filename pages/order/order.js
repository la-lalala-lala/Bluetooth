// pages/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 是否弹出显示表单
    showForm:false,
    // 当前选中的按钮下标
    nowIndex:-1,
    // 获取到的缓存指令集
    orders:[],
    // 若用户没有初始化指令集时，系统自动创建的指令集那个数
    orderSize:30,
    // 弹框表单
    form:{
      // 触发名
      name:'',
      // 按下发送指令
      touchstart:'',
      // 松开发送指令
      touchend:'',
    }
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
  initOrder:function () {
    // 每次页面展示都会刷新值 
    let _this = this;
    let orderSize = _this.data.orderSize || 30
    try {
      // 提取用户设置的指令集
      let orders = wx.getStorageSync('order') || [];
      if(orders.length <= 0){
        // 用户没有初始化，系统自动初始化,然后写入缓存
        for (var i=0; i < orderSize; i++){
          orders[i] = { "name": '', "touchstart": '',"touchend":''}
        }
        // 写入缓存
        wx.setStorageSync('order', orders);
      }else{
        _this.setData({
          orders
        })
      }
    } catch (e) {
      console.log('初始化指令失败',e)
      //弹框提示
      wx.showModal({
        title: '错误提示',
        content: '初始化用户数据失败，请稍后重试'
      })
    }
  },

  /**
   * 长按修改指令事件，弹出表单
   */
  handleEditOrder:function(e){
    let _this = this
    let nowIndex = e.target.dataset.id
    let orders = _this.data.orders
    let { name, touchstart, touchend } = orders[nowIndex]
    let form = {}
    // 回显之前已设置的值
    if (name === '' || touchstart === ''){
      form = { "name": '', "touchstart": '',"touchend":''}
    }else{
      form = { "name": name, "touchstart": touchstart, "touchend": touchend }
    }
    _this.setData({
      nowIndex,
      form
    },function(){
      _this.visibleForm()
    })
  },

  /**
   * 显示弹框
   */
  visibleForm:function(){
    let that = this
    that.setData({
      showForm:true
    })
  },

  /**
   * 隐藏弹框,并清除现有表单
   */
  hiddenForm: function () {
    let that = this
    that.setData({
      showForm: false,
      form: { "name": '', "touchstart": '', "touchend": ''}
    })
  },

  /**
   * 确认保存
   */
  sureSave:function(e){
    let _this = this
    let nowIndex = e.target.dataset.id
    const {form,orders} = _this.data
    try{
      if (form.name === '' || form.touchstart === '') {
        //弹框提示
        wx.showModal({
          title: '错误提示',
          content: '指令名及按下发送指令值不能为空'
        })
      } else {
        // 写入
        orders[nowIndex] = Object.assign({}, form)
        _this.setData({
          orders
        })
        wx.setStorageSync('order', orders);
        _this.hiddenForm()
      }
    }catch(e){
      console.log("保存指令失败",e)
      wx.showModal({
        title: '错误提示',
        content: '保存指令失败'
      })
    }
  },

  //动态绑定文本框
  bindInput:function(e){
    let _this = this
    let item = e.currentTarget.dataset.item;
    let id = e.target.dataset.id
    const form = _this.data.form
    form[item] = (e.detail.value).trim()
    _this.setData({
      form
    })
  }


})