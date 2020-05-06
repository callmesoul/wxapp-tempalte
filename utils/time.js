
export function compare (value) {
    let _now= new Date();
    let dayNow= _now.getDate();
    let dayOld= new Date(value).getDate();
    let dayNum = dayNow-dayOld;
    let monNum = _now.getMonth() - new Date(value).getMonth();
    let yearNum = _now.getYear() - new Date(value).getYear();

    var now = _now.getTime(),
      old = new Date(value),
      oldTime = old.getTime(),
      difference = now - oldTime,
      result='',
      minute = 1000 * 60,
      hour = minute * 60,
      day = hour * 24,
      halfamonth = day * 15,
      month = day * 30,
      year = month * 12,
      _year = difference/year,
      _month =difference/month,
      _week =difference/(7*day),
      _day =difference/day,
      _hour =difference/hour,
      _min =difference/minute;

    var o_month = old.getMonth() + 1;
    var o_day = old.getDate() > 9 ? old.getDate() : '0' + old.getDate();
    var o_hour = old.getHours() > 9 ? old.getHours() : '0' + old.getHours();
    var o_minute = old.getMinutes() > 9 ? old.getMinutes() : '0' + old.getMinutes();

    var today_zero = new Date(new Date().toLocaleDateString()).getTime(); // 今天0时
    var yesterday_zero = today_zero - 24 * 60 * 60 * 60 * 1000; // 昨天0时

    if(yearNum>=1 || monNum>=1 || dayNum>1) {result= DateFormat(value,"MM-DD HH:ss")}
    else if(yearNum<=0 && monNum <=0 && dayNum==1) {result="昨天 "+ DateFormat(value,"HH:ss")}
    else if(_hour>=1) {result = DateFormat(value,"HH:ss")}
    else if(_min>=2) {result = (parseInt(_min)) +"分钟前"}
    else result="刚刚";
    return result;
}
export function DateFormat(value,formatString){
    var formateArr  = ['YYYY','MM','DD','HH','mm','ss'];
    var returnArr   = [];

    var date =new Date(value);
    returnArr.push(date.getFullYear());
    returnArr.push(formatNumber(date.getMonth() + 1));
    returnArr.push(formatNumber(date.getDate()));

    returnArr.push(formatNumber(date.getHours()));
    returnArr.push(formatNumber(date.getMinutes()));
    returnArr.push(formatNumber(date.getSeconds()));

    for (var i in returnArr)
    {
      formatString = formatString.replace(formateArr[i], returnArr[i]);
    }
    return formatString;
}


export function formatNumber (n) {
    n = n.toString();
    return n[1] ? n : '0' + n
}
  