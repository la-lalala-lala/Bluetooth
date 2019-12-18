// pages/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showForm:false,
    nowIndex:-1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
   * 长按修改指令
   */
  handleEditOrder:function(e){
    let _this = this
    let id = e.target.dataset.id
    _this.setData({
      nowIndex: id
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
   * 隐藏弹框
   */
  hiddenForm: function () {
    let that = this
    that.setData({
      showForm: false
    })
  },

  //动态绑定文本框
  bindInput:function(e){
    let _this = this
    let item = e.currentTarget.dataset.item;
    let id = e.target.dataset.id
    console.log(item+':'+e.detail.value)
    console.log(id)
  }


})