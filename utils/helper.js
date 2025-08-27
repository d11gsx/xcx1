/**
   * 格式化时间
   * @param {*} date 
   */
 function formatDate(dateStr, format = "") {
    const date = new Date(dateStr);
    if (!format) format = 'yyyy-MM-dd hh:mm:ss';
    let map = {
      "M+": date.getMonth() + 1, //月份
      "d+": date.getDate(),
      "h+": date.getHours(),
      "m+": date.getMinutes(),
      "s+": date.getSeconds(),
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度
      "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(format)) {
      format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in map) {
      if (new RegExp("(" + k + ")").test(format)) {
        format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (map[k]) : (("00" + map[k]).substr(("" + map[k]).length)));
      }
    }
    return format;
  }

  module.exports={
    formatDate
  }
