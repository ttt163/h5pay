/**
 * Author：tantingting
 * Time：2018/1/30
 * Description：Description
 */
$(function () {
    $('.pay-entrance .close').on('click', function () {
        $('iframe').css({'zIndex': '-1'})
        closePayModal()
    })
})
function closePayModal () {
    $('.pay-entrance').css({'display': 'none'})
    webViewClose()
}
