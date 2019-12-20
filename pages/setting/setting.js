// pages/setting/setting.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

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
   * 跳转到修改指令页面
   */
  jumpEditOrderPage:function(e){
    wx.navigateTo({
      url: '/pages/order/order'
    })
  },

  /**
   * 重置指令
   */
  removeOrder: function () {
    let orders = wx.getStorageSync('order') || [];
    console.log("orders:", orders)
    if (orders.length <= 0) {
      wx.showModal({
        title: '错误提示',
        content: '本地没有可供重置的指令'
      })
      return
    }
    wx.showModal({
      title: '重置确认',
      content: '您确认要重置所有指令么？',
      success: function (res) {
        if (res.confirm) {
          try {
              wx.clearStorageSync();
              wx.showModal({
                title: '操作提示',
                content: '指令重置成功'
              })
          } catch (e) {
            wx.showModal({
              title: '错误提示',
              content: '清空重置失败，请稍后重试'
            })
          }
        }
      }
    })
  }

})