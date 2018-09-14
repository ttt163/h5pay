/**
 * Author：liushaozong
 * Time：2017-08-29 19:27
 * Description：js demo index
 */

import { get } from '../../libs/js/utils'
const logInUrl = 'http://192.168.252.19:8089/'

$(document).ready(function () {
    $('#m-login-btn').on('click', function () {
        fadeIn('.login-entrance')
    })

    $('#m-set-psw').on('click', function () {
        fadeIn('.login-attestation')
        fadeOut('.login-entrance')
    })

    // -------------关闭----------------------------------------
    $('.close').on('click', function () {
        $('.login-entrance').css('zIndex', -10)
        $('.login-attestation').css('zIndex', -10)
        $('.login-bound-phone').css('zIndex', -10)
        $('.find-password').css('zIndex', -10)
        $('.find-password-new').css('zIndex', -10)
        $('.login-amend-password').css('zIndex', -10)
    })

    // --------------游戏ID--------------------------------------
    let gameId = 196

    // --------------------RSA加密码------------------------------
    let pubkey = '-----BEGIN PUBLIC KEY-----\n'
    pubkey += 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC0kGMyi0cqxSqlECeXvz6IYlnM\n'
    pubkey += 'Sc7RxAfm2cr2Y/h56++uhhr0G1osk+IFgRmTIfLMnv2mKv9bGqO3DV0TTL0UOODq\n'
    pubkey += '+Q8ewcm0BXQy3KI2J2XAWSSD6Zi7BdYF4CHdmWWkawZqvY01Nw7B2JD4k78sjl0P\n'
    pubkey += '20QYQrsgnX0jtnyPZQIDAQAB\n'
    pubkey += '-----END PUBLIC KEY-----\n'
    let encrypt = new window.JSEncrypt()
    encrypt.setPublicKey(pubkey)

    // --------------------提示框---------------------------------
    function hintFn (val) {
        $('.hink-child').html(val).css('zIndex', 20)
        $('.popHink').css('zIndex', 20)
        setTimeout(function () {
            $('.hink-child').html('').css('zIndex', -1)
            $('.popHink').css('zIndex', -1)
        }, 1500)
    }

    // ---------------------显示-----------------------------------
    function fadeIn (obj) {
        $(obj).css('zIndex', 15)
    }
    // ---------------------隐藏-----------------------------------
    function fadeOut (obj) {
        $(obj).css('zIndex', -10)
    }
    // --------------------游客登录---------------------------------
    $('#temporaryLogin').on('click', function () {
        temporaryLogin()
    })
    let isVisitor = null // 判断是否游客
    let temporaryPassportName = null
    function temporaryLogin () { // 游客登录
        temporaryPassportName = $.fn.cookie('temporaryPassportName')
        get(logInUrl + 'lk-epassport-sdk/login/random', {
            gameId: gameId,
            identify: 'H5',
            source: 1,
            passportName: temporaryPassportName,
            sign: $.md5(gameId + 'H5' + 1 + 'linekongline')
        }, (data) => {
            console.log(data)
            if (data.result === 1) {
                $('.login-bound-p').show()
                isVisitor = data.isVisitor
                hintFn('登录成功')
                setTimeout(function () {
                    fadeOut('.login-entrance')
                    fadeOut('#m-login-btn')
                    fadeIn('#m-set-psw')
                }, 1510)

                if (isVisitor === 1) {
                    $('.login-set-psd').hide()
                    $('.login-amend-psd').hide()
                    $('.login-autonym').hide()
                }
                $.fn.cookie('temporaryPassportName', data.passportName)
                console.log($.fn.cookie('temporaryPassportName'))
            } else {
                hintFn('网络异常，稍后重试')
            }
        })
    }

    // --------------------检测是否实名认证-----------------------------
    function isCard () {
        get(logInUrl + 'lk-epassport-sdk/query/passport', {
            passportName: globalPhone,
            source: 2,
            sign: $.md5(globalPhone + 2 + 'linekongline')
        }, (data) => {
            console.log(data)
            if (data.idCode !== '') {
                $('.login-autonym').hide()
            } else {
                $('.login-autonym').show()
            }
        })
    }

    // --------------------检测是否初始化密码-----------------------------
    function isPassword () {
        get(logInUrl + 'lk-epassport-sdk/query/isinitPwd', {
            passportName: globalPhone,
            acountType: 3,
            validateCode: globalCodeNonentity,
            registerIp: '127.0.0.0',
            sign: $.md5(globalPhone + 3 + 'linekongline')
        }, (data) => {
            console.log(data)
            if (data.result === 1) {
                // fadeIn('.login-phone-psd')
                // fadeOut('.login-write-phone')
                $('.login-amend-psd').show()
                $('.login-set-psd').hide()
            } else if (data.result === -1411) {
                $('.login-set-psd').show()
                $('.login-amend-psd').hide()
            }
        })
    }

    // ----------------------手机登录------------------------------------
    $('#phoneLogin').on('click', function () {
        fadeIn('#phoneWrite')
        fadeOut('#entrance')
    })

    $('.detectionPhone').keyup(function () {
        keyupPhoneFn($('.phone-next-btn'), $(this))
    })
    function keyupPhoneFn (obj, This) {
        let reg = /^1\d*$/
        if (reg.test(This.val())) {
            let myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/
            if (This.val().length > 10 && myreg.test(This.val())) {
                obj.removeClass('active').removeAttr('disabled')
            } else {
                obj.addClass('active').attr('disabled')
            }
        } else {
            hintFn('手机号码以1开头')
        }
    }
    let globalPhone = null
    $('.phone-next-btn').on('click', function () {
        let myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/
        let phone = $('#detectionPhone').val()
        globalPhone = phone
        if (!myreg.test(phone)) {
            hintFn('请输入有效的手机号')
            return false
        } else {
            get(logInUrl + 'lk-epassport-sdk/query/isbindAcount', {
                passportName: phone,
                acountType: 3,
                requestIP: '127.0.0.0',
                sign: $.md5(phone + 3 + 'linekongline')
            }, (data) => {
                console.log(data)
                let dataState = data.result
                if (dataState === -1406) {
                    fadeIn('.login-register.not')
                    fadeOut('.login-write-phone.write')
                } else if (dataState === 1) {
                    fadeIn('.login-phone-psd')
                    $.fn.cookie('userPhone', globalPhone)
                    isPassword()
                    isCard()
                    $('.login-bound-p').hide()
                } else if (dataState === -1411) {
                    $('.login-bound-p').show()
                }
            })
        }
    })
    $('.login-write-phone.write .back').on('click', function () {
        fadeOut('.login-write-phone.write')
        fadeIn('.login-entrance')
    })
    $('.login-phone-psd .back').on('click', function () {
        fadeIn('.login-write-phone.write')
        fadeOut('.login-phone-psd')
    })

    // -----------------------验证码倒计时-----------------------------
    function countDown (obj) {
        let timer = null
        let time = 60
        timer = setInterval(function () {
            if (time === 1) {
                clearInterval(timer)
                obj.html('获取验证码').removeAttr('disabled').removeClass('active')
                return false
            } else {
                time--
                obj.html(time + 's')
            }
        }, 1000)
        obj.html(time + 's').attr('disabled', false).addClass('active')
    }

    $('.psd-time-register').on('click', function () {
        registerYardExist(globalPhone, 1)
        countDown($('.psd-time-register'))
    })
    // -------------------判断验证码是否6位-----------------------------
    let globalCodeNonentity = null // 未注册用户验证码
    $('.code-yanzheng').keyup(function () {
        if ($(this).val().length > 5) {
            globalCodeNonentity = $(this).val()
            $('.phone-enter-register').removeClass('active').removeAttr('disabled')
        } else {
            $('.phone-enter-register').addClass('active').attr('disabled')
        }
    })

    // ---------------新用户 验证码注册登录------------------------------
    function registerCode (passportName) { // 验证码登录
        get(logInUrl + 'lk-epassport-sdk/register/mobile', {
            passportName: passportName,
            password: encrypt.encrypt(''),
            validateCode: globalCodeNonentity,
            gameId: gameId,
            source: 1,
            registerIp: '127.0.0.0',
            tokenType: 0,
            identify: 'H5',
            sign: $.md5(globalPhone + gameId + 1 + globalCodeNonentity + 'linekongline')
        }, (data) => {
            console.log(data)
            if (data.result === 1) {
                hintFn('注册并登录成功')
                setTimeout(function () {
                    fadeOut('.login-register.not')
                    $('.code-yanzheng').val('')
                    fadeOut('#m-login-btn')
                    fadeOut('.login-bound-p')
                    fadeOut('.login-amend-psd')
                    fadeIn('#m-set-psw')
                }, 1500)
            } else if (data.result === -1443) {
                hintFn('手机验证码不存在')
            }
        })
    }
    $('.phone-enter-register').on('click', function () {
        registerCode(globalPhone)
    })

    // -------------------发送验证码-------------------------
    function registerYardExist (globalPhone, type) {
        console.log(globalPhone)
        get(logInUrl + 'lk-epassport-sdk/sms/mobileCode', {
            mobile: globalPhone,
            type: type,
            sign: $.md5(globalPhone + type + 'linekongline')
        }, (data) => {
            console.log(data)
            if (data.result === 1) {
                hintFn('验证码发送成功')
            } else if (data.result === -1407) {
                hintFn('账号已存在')
            }
        })
    }

    // -------------------账号已存在-------------------------------
    $('.tab-label li').on('click', function () {
        let index = $(this).index()
        $(this).addClass('active').siblings().removeClass('active')
        $('.tab-list').eq(index).addClass('active').siblings().removeClass('active')
    })
    $('.psd-time').on('click', function () {
        registerYardExist(globalPhone, 2)
        countDown($('.psd-time'))
    })

    let globalCodeExist = null // 账号已存在验证码

    // ------------------验证码登录--------------------------
    function codeRegister () {
        $.ajax({
            type: 'GET',
            dataType: 'jsonp',
            async: false,
            url: logInUrl + 'lk-epassport-sdk/login/mobile',
            contentType: 'application/x-www-form-urlencoded',
            jsonp: 'callback',
            data: {
                passportName: globalPhone,
                validateCode: globalCodeExist,
                gameId: gameId,
                source: 1,
                tokenType: 0,
                identify: 'H5',
                sign: $.md5(globalPhone + globalCodeExist + gameId + 'linekongline')
            },
            success: function (data) {
                console.log(data)
                if (data.result === -1443) {
                    hintFn('验证码无效')
                } else if (data.result === 1) {
                    hintFn('登录成功')
                    setTimeout(function () {
                        fadeOut('.login-phone-psd')
                        fadeOut('.login-write-phone')
                        fadeIn('#m-set-psw')
                        fadeOut('#m-login-btn')
                    }, 1500)
                } else if (data.result === -1445) {
                    hintFn('该验证码已使用')
                }
            },
            error: function () {
            }
        })
    }

    // ------------------密码登录--------------------------
    let globalPasswordExist = null // 账号已存在密码
    // 输入密码
    function keyupCodeFn (obj, This) {
        if (This.val().length > 5) {
            globalPasswordExist = This.val()
            obj.removeClass('active').removeAttr('disabled')
        } else {
            obj.addClass('active').attr('disabled')
        }
    }
    $('.phone-psd-m input').keyup(function () {
        keyupCodeFn($('#psdMBtn'), $(this))
    })
    function passWord (password) {
        get(logInUrl + 'lk-epassport-sdk/login/person', {
            passportName: globalPhone,
            password: encrypt.encrypt(password),
            gameId: gameId,
            source: 1,
            tokenType: 0,
            identify: 'H5',
            sign: $.md5(globalPhone + gameId + 'linekongline')
        }, (data) => {
            console.log(data)
            if (data.result === 1) {
                hintFn('登录成功')
                setTimeout(function () {
                    $('.tab-list input').val('')
                    fadeOut('.login-phone-psd')
                    fadeOut('#m-login-btn')
                    fadeOut('.login-write-phone')
                }, 1500)
                fadeIn('#m-set-psw')
            } else if (data.result === -1402) {
                hintFn('密码不正确')
            }
        })
    }
    // 验证码
    $('.phone-code-m input, .code-yanzheng input').keyup(function () {
        if ($(this).val().length > 5) {
            globalCodeExist = $(this).val()
            $('#codeMBtn, .phone-enter-already-btn').removeClass('active').removeAttr('disabled')
        } else {
            $('#codeMBtn, .phone-enter-already-btn').addClass('active').attr('disabled')
        }
    })
    // 验证码登录
    $('#codeMBtn, .phone-enter-already-btn').on('click', function () {
        codeRegister()
    })
    // 密码登录
    $('#psdMBtn').on('click', function () {
        passWord(globalPasswordExist)
        console.log(encrypt.encrypt(globalPasswordExist))
    })
    // 微信登录
    // $.ajax({
    //     type: 'GET',
    //     url: 'https://open.weixin.qq.com/connect/qrconnect',
    //     data: {
    //         appid: 'wx7f3ec00368bfb1ee',
    //         redirect_uri: 'http://www.qq.com/music.html',
    //         scope: 'snsapi_login',
    //         response_type: 'code',
    //         AppSecret: '779e8596c13dc74a6a5ae8d183ff7f22'
    //     },
    //     success: function (data) {
    //         console.log(data)
    //     }
    // })

    // function registerWx () {
    //     $.ajax({
    //         type: 'GET',
    //         dataType: 'jsonp',
    //         url: logInUrl + 'lk-epassport-sdk/login/random',
    //         data: {
    //             passportId: '',
    //             passportName: '',
    //             gameId: gameId,
    //             identify: 'H5',
    //             source: 1,
    //             tokenType: 0,
    //             code: '',
    //             sign: $.md5(gameId + 'H5' + 1 + '' + 'linekongline')
    //         },
    //         success: function (data) {
    //             console.log(data)
    //         }
    //     })
    // }

    // ----------------------设置密码--------------------------
    let newPassword = null // 新密码
    $('.login-set-psd').on('click', function () {
        fadeIn('.login-set-password')
    })
    $('#setInpPasw').keyup(function () {
        let reg = /^[0-9a-zA-Z]+$/
        if (!reg.test($(this).val())) {
            hintFn('你输入的字符不是数字或者字母')
        } else {
            if ($(this).val().length > 5) {
                newPassword = encrypt.encrypt($(this).val())
                $('.set-pas-btn').removeClass('active').removeAttr('disabled')
            } else {
                $('.set-pas-btn').addClass('active').attr('disabled')
            }
        }
    })
    $('.set-pas-btn').on('click', function () {
        setPassword()
    })
    function setPassword () { // 设置密码
        $.ajax({
            type: 'post',
            dataType: 'jsonp',
            async: false,
            jsonp: 'callback',
            url: logInUrl + 'lk-epassport-sdk/complete/password',
            contentType: 'application/x-www-form-urlencoded',
            data: {
                passportName: $.fn.cookie('userPhone'),
                password: newPassword,
                type: 3,
                requestIP: '127.0.0.0',
                sign: $.md5($.fn.cookie('userPhone') + 3 + newPassword + 'linekongline')
            },
            success: function (data) {
                console.log(data)
                let dataArr = data.result
                if (dataArr === -1410) {
                    hintFn('密码已初始化,不能再设置密码')
                    setTimeout(function () {
                        $('#setInpPasw').val('')
                    }, 1500)
                } else if (dataArr === 1) {
                    hintFn('密码已初始化成功')
                    setTimeout(function () {
                        $('#setInpPasw').val('')
                        $('.login-set-password').hide()
                        $('.login-set-psd').hide()
                        $('.login-amend-psd').show()
                    }, 1500)
                }
            },
            error: function () {
            }
        })
    }
    $('.login-set-password .back').on('click', function () {
        fadeOut('.login-set-password')
    })

    // -----------------------修改密码---------------------------
    let amendPassword = null // 修改后的密码
    let nowPsw = false
    let amendPsw = false

    $('.login-amend-psd').on('click', function () {
        fadeIn('.login-amend-password')
        fadeOut('.login-entrance')
    })
    $('#amendOldInpPasw').keyup(function () {
        let reg = /^[0-9a-zA-Z]+$/
        if (!reg.test($(this).val())) {
            hintFn('你输入的字符不是数字或者字母')
        } else {
            if ($(this).val().length > 5) {
                newPassword = encrypt.encrypt($(this).val())
                nowPsw = true
                amendState()
            } else {
                nowPsw = false
            }
        }
    })
    $('#amendNewInpPasw').keyup(function () {
        let reg = /^[0-9a-zA-Z]+$/
        if (!reg.test($(this).val())) {
            hintFn('你输入的字符不是数字或者字母')
        } else {
            if ($(this).val().length > 5) {
                amendPassword = encrypt.encrypt($(this).val())
                amendPsw = true
                amendState()
            } else {
                amendPsw = false
            }
        }
    })
    function amendState () {
        if (nowPsw === amendPsw) {
            if (nowPsw && amendPsw) {
                $('.amend-pas-btn').removeClass('active').removeAttr('disabled')
            } else {
                $('.amend-pas-btn').addClass('active').attr('disabled')
            }
        }
    }
    $('.amend-pas-btn').on('click', function () {
        amendPasswordFn()
    })
    function amendPasswordFn () {
        get(logInUrl + 'lk-epassport-sdk/modify/password', {
            passportName: $.fn.cookie('userPhone'),
            password: newPassword,
            newPassword: amendPassword,
            sign: $.md5($.fn.cookie('userPhone') + newPassword + amendPassword + 'linekongline')
        }, (data) => {
            console.log(data)
            if (data.result === -1451) {
                hintFn('新密码不能和原密码重复')
            } else if (data.result === -1402) {
                hintFn('原密码不正确')
            } else if (data.result === 1) {
                hintFn('密码修改成功')
                setTimeout(function () {
                    fadeOut('.login-amend-password')
                }, 1500)
                newPassword = amendPassword
            }
        })
    }

    // ------------------------实名认证----------------------------
    $('.login-autonym').on('click', function () {
        fadeIn('.login-attestation-write')
        fadeOut('.login-attestation')
    })
    let myNameState = false
    let myCardState = false
    let myName = null
    let myCard = null
    $('.input-text1 input').keyup(function () {
        let regName = /^[a-zA-Z\u4e00-\u9fa5]+$/
        if (regName.test($.trim($(this).val()))) {
            cardName()
            myName = $(this).val()
            console.log(myNameState)
            myNameState = true
            return false
        } else {
            myNameState = false
        }
    })
    $('.input-text2 input').keyup(function () {
        let regMycard = /^\d{15}$|^\d{18}$/
        if (regMycard.test($.trim($(this).val()))) {
            myCard = $(this).val()
            myCardState = true
            cardName()
            console.log(myNameState)
            return false
        } else {
            myCardState = false
        }
    })
    function cardName () {
        if (myNameState && myCardState) {
            $('.attestation-btn').removeClass('active').removeAttr('disabled')
        } else {
            $('.attestation-btn').addClass('active').attr('disabled')
        }
    }

    $('.attestation-btn').on('click', function () {
        attestation()
    })
    function attestation () { // 身份认证
        get(logInUrl + 'lk-epassport-sdk/complete/securityInfo', {
            passportName: $.fn.cookie('userPhone'),
            realName: myName,
            idCode: myCard,
            sex: '',
            birthday: '',
            address: '',
            checkSum: '',
            sign: $.md5($.fn.cookie('userPhone') + myName + myCard + 'linekongline')
        }, (data) => {
            let dataArr = data.result
            if (dataArr === 1) {
                hintFn('信息保存成功')
                setTimeout(function () {
                    fadeOut('.login-attestation-write')
                    fadeIn('.login-attestation')
                    $('.login-autonym').hide()
                }, 1500)
            }
        })
    }
    $('.login-attestation-write .back').on('click', function () {
        fadeOut('.login-attestation-write')
        fadeIn('.login-attestation')
    })

    // ---------------------------退出登录----------------------
    $('.login-exit').on('click', function () {
        $('.game-login-exit').css('zIndex', 16)
    })
    // 确定退出
    $('.hink-confirm').on('click', function () {
        $.fn.cookie('userPhone', '') // 清除手机号cookie
        $.fn.cookie('temporaryPassportName', '') // 清除游客cookie
        hintFn('退出成功')
        isVisitor = null // 游客状态
        setTimeout(function () {
            fadeOut('.game-login-exit')
            fadeOut('.login-bound-phone')
            fadeOut('.login-attestation')
            fadeOut('#m-set-psw')
            fadeIn('#m-login-btn')
        }, 1500)
    })
    // 取消退出
    $('.hink-abolish').on('click', function () {
        $('.game-login-exit').css('zIndex', -10)
    })

    // ------------------------绑定手机号码------------------------------
    $('.login-bound-p').on('click', function () {
        fadeIn('#bindingWrite')
        fadeOut('.login-bound-phone')
    })
    let globalBindingPhone = null // 绑定手机号码
    let bindCodeM = null
    let bindPhoneState = false
    let bindCodeState = false
    $('#bindingPhone').keyup(function () {
        let reg = /^1\d*$/
        if (reg.test($(this).val())) {
            let myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/
            if ($(this).val().length > 10 && myreg.test($(this).val())) {
                globalBindingPhone = $(this).val()
                bindPhoneState = true
                $('.psd-time-bind').removeClass('active').removeAttr('disabled')
                bindState()
            } else if ($(this).val().length > 10 && !myreg.test($(this).val())) {
                $('.psd-time-bind').addClass('active').attr('disabled')
                hintFn('请输入有效的手机号码')
                bindState()
            } else {
                bindPhoneState = false
                $('.psd-time-bind').addClass('active').attr('disabled')
                bindState()
            }
        } else {
            hintFn('手机号码以1开头')
        }
    })
    $('.bindCode').keyup(function () {
        if ($(this).val().length > 5) {
            bindCodeM = $(this).val()
            bindCodeState = true
            bindState()
        } else {
            bindCodeState = false
            bindState()
        }
    })
    function bindState () {
        if (bindPhoneState && bindCodeState) {
            $('.phone-binding-btn').removeClass('active').removeAttr('disabled')
        } else {
            $('.phone-binding-btn').addClass('active').attr('disabled')
        }
    }

    $('.psd-time-bind').on('click', function () {
        countDown($('.psd-time-bind'))
        registerYardExist(globalBindingPhone, 4)
    })
    let phoneBinding = (passportName) => {
        get(logInUrl + 'lk-epassport-sdk/bind/acount', {
            passportName: passportName,
            validateCode: bindCodeM,
            acount: globalBindingPhone,
            acountType: 3,
            requestIP: '127.0.0.0',
            sign: $.md5(passportName + globalBindingPhone + bindCodeM + 'linekongline')
        }, (data) => {
            console.log($.fn.cookie('userPhone'))
            console.log(data)
            if (data.result === 1) {
                hintFn('手机号码绑定成功')
                setTimeout(function () {
                    fadeOut('.login-write-phone.binding')
                })
                if (isVisitor === 1) {
                    $.fn.cookie('temporaryPassportName', '') // 清除游客cookie
                }
            } else if (data.result === -1410) {
                hintFn('已绑定过手机号,请先解绑原手机号')
            }
        })
    }
    $('.phone-binding-btn').on('click', function () {
        if (isVisitor === 1) {
            phoneBinding($.fn.cookie('temporaryPassportName'))
        } else {
            phoneBinding($.fn.cookie('userPhone'))
        }
    })

    $('.login-write-phone.binding .back').on('click', function () {
        fadeOut('.login-write-phone.binding')
        fadeIn('.login-attestation')
    })

    // ------------------------找回密码----------------------------
    $('.forget-psd').on('click', function () {
        fadeIn('.find-password')
        fadeOut('.login-phone-psd')
        $('#find-phone').val($.fn.cookie('userPhone'))
    })
    let findCode = null
    $('.find-psd-time').on('click', function () {
        countDown($('.find-psd-time'))
        registerYardExist($.fn.cookie('userPhone'), 3)
    })
    $('#find-code').keyup(function () {
        if ($(this).val().length > 5) {
            findCode = $(this).val()
            $('.find-m-btn').removeClass('active').removeAttr('disabled')
        } else {
            $('.find-m-btn').addClass('active').attr('disabled')
        }
    })
    $('#findMBtn').on('click', function () {
        fadeOut('.find-password')
        fadeIn('.find-password-new')
    })
    $('#findInpPasw').keyup(function () {
        let reg = /^[0-9a-zA-Z]+$/
        if (!reg.test($(this).val())) {
            hintFn('你输入的字符不是数字或者字母')
        } else {
            if ($(this).val().length > 5) {
                newPassword = encrypt.encrypt($(this).val())
                $('.find-pas-btn').removeClass('active').removeAttr('disabled')
            } else {
                $('.find-pas-btn').addClass('active').attr('disabled')
            }
        }
    })
    $('.find-pas-btn').on('click', function () {
        get(logInUrl + 'lk-epassport-sdk/modify/passwordByMobile', {
            passportName: $.fn.cookie('userPhone'),
            validateCode: findCode,
            newPassword: newPassword,
            sign: $.md5($.fn.cookie('userPhone') + newPassword + findCode + 'linekongline')
        }, (data) => {
            console.log(data)
            if (data.result === 1) {
                hintFn('密码设置成功')
                setTimeout(function () {
                    fadeOut('.find-password-new')
                    passWord($('#findInpPasw').val())
                }, 1500)
            } else if (data.result === -1445) {
                hintFn('验证码已经使用')
            } else {
                hintFn('网络请求超时')
            }
        })
    })
})
