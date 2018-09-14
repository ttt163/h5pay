/**
 * Author：liushaozong
 * Time：2017-08-29 19:27
 * Description：js demo index
 */
import {getQueryString} from '../../libs/js/utils'
// let payUrl = 'http://113.208.129.53:14808/'
// let payUrl = 'http://192.168.252.19:8083/'
let payUrl = 'http://mpay2.8864.com/'

$(document).ready(function () {
    // let passportName = 'passport_0' // 通行证名称
    /* let passportName = 'ypengfei' // 通行证名称
    let gameId = 189 // 游戏ID
    let gatewayId = 189999 // 区服
    let roleId = 0 // 角色ID
    let chargeMoney = 1 // 充值金额
    let code = 'a' // 透传字段
    // 微信官方
    let appType = 'Android'
    let appName = encodeURI('王者之剑')
    let packageName = 'com.linekong.pay' */

    let code = !getQueryString('code') ? 'a' : getQueryString('code') // 透传字段
    let passportName = !getQueryString('passportName') ? '' : getQueryString('passportName') // 通行证名称
    let gameId = !getQueryString('gameId') ? '' : getQueryString('gameId') // 游戏ID
    let gatewayId = !getQueryString('gatewayId') ? '' : getQueryString('gatewayId') // 区服
    // let roleId = !getQueryString('roleId') ? '' : getQueryString('roleId') // 角色ID
    let chargeMoney = !getQueryString('chargeMoney') ? '' : getQueryString('chargeMoney') // 充值金额
    // 微信官方
    let appType = !getQueryString('appType') ? '' : getQueryString('appType')
    let appName = !getQueryString('appName') ? '' : encodeURI(getQueryString('appName'))
    let packageName = !getQueryString('packageName') ? '' : getQueryString('packageName')
    let roleId = 0
    // let channelId = 39 // 微信充值渠道ID
    let channelIdZfb = 38 // 支付宝充值渠道ID
    let channelwxgf = 41 // 微信官方充值渠道ID
    let channeYlwap = 42 // 银联 wap支付
    let channelIdHnjyZfb = 43 // 海南精英-支付宝WAP充值
    // let code = '' // 透传字段
    // let deviceInfo = 'null'
    // let mchAppName = encodeURI('黎明之光')
    // let mchAppId = 'com.linekong.pay'

    /* if (isIos()) {
        // deviceInfo = 'iOS_WAP'
        appType = 'IOS'
    } else if (isandroid()) {
        // deviceInfo = 'AND_WAP'
        appType = 'Android'
    } */
    // 微信支付
    $('#pay-wx').on('click', function () {
        // wxPay()
        wxPaygf()
    })

    function wxPaygf () {
        let sendData = {
            passportName: passportName,
            gameId: gameId,
            gatewayId: gatewayId,
            channelId: channelwxgf,
            chargeMoney: chargeMoney,
            code: code,
            roleId: roleId,
            appType: appType,
            appName: appName,
            packageName: packageName,
            // key: $.md5(passportName + gameId + gatewayId + channelwxgf + chargeMoney + code + roleId)
            key: $.md5(passportName + gameId + gatewayId + chargeMoney + code + roleId)
        }
        console.log(sendData)
        $.ajax({
            type: 'post',
            dataType: 'jsonp',
            url: payUrl + 'lk-sdk-charge/charge/webChatWapCharging.do',
            jsonp: 'jsonp',
            data: sendData,
            success: function (result) {
                if (result.result === 1) {
                    // alert(result.callback)
                    // window.location.href = result.callback
                    $('iframe').css({'zIndex': '2'})
                    window.open(result.callback, 'posthere')
                    // $('iframe')[0].location = result.callback
                    // window.document.frames('posthere').location
                }
            },
            error: function (e) {
                console.log(e)
            }
        })
    }

    // function wxPay () {
    //     $.ajax({
    //         type: 'post',
    //         dataType: 'jsonp',
    //         url: payUrl + 'lk-sdk-charge/charge/swiftpassWebChatWapCharging.do',
    //         jsonp: 'jsonp',
    //         data: {
    //             passportName: passportName,
    //             gameId: gameId,
    //             gatewayId: gatewayId,
    //             channelId: channelId,
    //             chargeMoney: chargeMoney,
    //             code: code,
    //             roleId: roleId,
    //             deviceInfo: deviceInfo,
    //             mchAppName: mchAppName,
    //             mchAppId: mchAppId,
    //             key: $.md5(passportName + gameId + gatewayId + channelId + chargeMoney + code + roleId + deviceInfo + mchAppName + mchAppId)
    //         },
    //         success: function (result) {
    //             if (result.result === 1) {
    //                 window.location.href = result.callback
    //             }
    //         },
    //         error: function (e) {
    //             console.log(e)
    //         }
    //     })
    // }

    // 支付宝支付
    $('#pay-zfb').on('click', function () {
        zfbPay()
    })
    function zfbPay () {
        // $('.pay-entrance').css({'display': 'none'})
        let sendData = {
            passportName: passportName,
            gameId: gameId,
            gatewayId: gatewayId,
            channelId: channelIdZfb,
            chargeMoney: chargeMoney,
            code: code,
            roleId: roleId,
            key: $.md5(passportName + gameId + gatewayId + chargeMoney + code + roleId)
            // key: $.md5(passportName + gameId + gatewayId + channelIdZfb + chargeMoney + code + roleId)
        }
        console.log(sendData)
        $.ajax({
            type: 'post',
            dataType: 'jsonp',
            url: payUrl + 'lk-sdk-charge/charge/alipayWapPayCharging.do',
            jsonp: 'jsonp',
            data: sendData,
            success: function (result) {
                if (result.result === 1) {
                    // console.log(result.callback)
                    // $('.pay-entrance').css({'display': 'block'})
                    let _html = result.callback
                    _html = _html.substring(0, _html.indexOf('<form') + 5) + ' target="posthere" ' + _html.substring(_html.indexOf('<form') + 5)
                    // alert(_html)
                    // $('#control-zfb').html(result.callback)
                    // console.log(_html)
                    $('#control-zfb').html(_html)
                    $('iframe').css({'zIndex': '2'})
                }
            },
            error: function (e) {
                console.log(e)
            }
        })
    }

    // 银联支付
    $('#pay-yl').on('click', function () {
        ylPay()
    })
    function ylPay () {
        // $('.pay-entrance').css({'display': 'none'})
        let sendData = {
            passportName: passportName,
            gameId: gameId,
            gatewayId: gatewayId,
            channelId: channeYlwap,
            chargeMoney: chargeMoney,
            code: code,
            roleId: roleId,
            key: $.md5(passportName + gameId + gatewayId + channeYlwap + chargeMoney + code + roleId)
        }
        console.log(sendData)
        $.ajax({
            type: 'post',
            dataType: 'jsonp',
            url: payUrl + 'lk-sdk-charge/charge/unionPayWapCharging.do',
            jsonp: 'jsonp',
            data: sendData,
            success: function (result) {
                if (result.result === 1) {
                    // console.log(result.callback)
                    // $('.pay-entrance').css({'display': 'block'})
                    let _html = result.callback
                    _html = _html.substring(0, _html.indexOf('<form') + 5) + ' target="posthere" ' + _html.substring(_html.indexOf('<form') + 5)
                    // console.log(_html)
                    // $('#control-zfb').html(result.callback)
                    $('#control-zfb').html(_html)
                    $('iframe').css({'zIndex': '2'})
                }
            },
            error: function (e) {
                console.log('222')
                console.log(e)
            }
        })
    }

    // 海南精英-支付宝WAP充值
    $('#pay-hnjy').on('click', function () {
        hnjyPay()
    })
    function hnjyPay () {
        // $('.pay-entrance').css({'display': 'none'})
        let sendData = {
            passportName: passportName,
            gameId: gameId,
            gatewayId: gatewayId,
            channelId: channelIdHnjyZfb,
            chargeMoney: chargeMoney,
            code: code,
            roleId: roleId,
            key: $.md5(passportName + gameId + gatewayId + channelIdHnjyZfb + chargeMoney + code + roleId)
        }
        console.log(sendData)
        $.ajax({
            type: 'post',
            dataType: 'jsonp',
            url: payUrl + 'lk-sdk-charge/charge/hnjyalipayWapPayCharging.do',
            jsonp: 'jsonp',
            data: sendData,
            success: function (result) {
                if (result.result === 1) {
                    // console.log(result)
                    // $('.pay-entrance').css({'display': 'block'})
                    let _html = result.callback
                    _html = _html.substring(0, _html.indexOf('<form') + 5) + ' target="posthere" ' + _html.substring(_html.indexOf('<form') + 5)
                    // alert(_html)
                    // console.log(_html)
                    // $('#control-zfb').html(result.callback)
                    $('#control-zfb').html(_html)
                    $('iframe').css({'zIndex': '2'})
                }
            },
            error: function (e) {
                console.log(e)
            }
        })
    }

    // $('.close').on('click', function () {
    //     closePayModal()
    // })
})

// function closePayModal () {
//     $('.pay-entrance').css({'display': 'none'})
//     webViewClose()
// }
