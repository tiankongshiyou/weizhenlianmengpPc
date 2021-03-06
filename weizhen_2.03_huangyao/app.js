//app.js
/**
 * 初始化整个app项目，获取用户身份
 */
const util = require("./utils/util.js");
App({
    onLaunch: function () {
        //全局添加 util中的方法
        this.util = util;

        //全局添加图片域名前缀
        this.image_prefix_host =util.getImagePrefixHost();

        // 展示本地存储能力
        var logs = wx.getStorageSync('logs') || [];
        logs.unshift(Date.now());
        var that = this;


        // 获取用户身份，通过wx.getSetting判断是否授权，没有授权那么跳转授权页面，如果有授权，那么直接获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {

                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.showLoading({title: '加载用户资料中'});

                    wx.login({
                        success: res => {
                            if(res.code){
                                var login_code =res.code;
                                // 微信登录传递code到后台
                                wx.getUserInfo({
                                    success: res => {
                                        var Info = res.userInfo;
                                        that.globalData.userInfo = res.userInfo;
                                        that.uploadDataToBackend(login_code,Info);

                                        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                                        // 所以此处加入 callback 以防止这种情况
                                        if (this.userInfoReadyCallback) {
                                            this.userInfoReadyCallback(login_code,Info)
                                        }
                                    }
                                })
                            }else{
                                wx.hideLoading();
                                wx.showToast({title:'无法获取用户微信登陆信息,请退出重试',icon:'none',mask:true,duration:3000});
                                that.util.log(res,"app.js-wx.login方法，获取code登录失败!")
                            }
                        }
                    })
                }else{
                    console.log('app.js--wx.getSetting--未获取授权');
                    wx.navigateTo({
                        'url':'/pages/auth/auth'
                    })
                }
            }
        })
    },
    //上传用户信息到后台
    uploadDataToBackend: function (login_code,Info) {
        var that =this;
        var userData = {
            code: login_code,
            wxImg: Info.avatarUrl,
            address: Info.province + "-" + Info.city,
            sfsq: Info.gender,
            language: Info.language,
            wxNc: Info.nickName,
        };
        that.util.getPort('login_get_user_by_code',that,userData,function(res){
            wx.hideLoading();
            that.globalData.userRole = res.data.body;
            wx.setStorageSync('userRole', res.data.body);
            // wx.navigateTo({
            //   url: "/pages/apply_enter_weizhen/apply_enter_weizhen",
            // })
        });
    },
    //全局变量
    globalData: {
        userInfo: null,
        addr: "http://192.168.1.122:8080/weizhen",
        cdnaddr: "https://file.worldwz.com",
        image_prefix_host:util.getImagePrefixHost(),
        token:null
    },
})