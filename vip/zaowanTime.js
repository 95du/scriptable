var thetime = '2023-04-17 19:09:00';
var date = new   Date(Date.parse(thetime .replace(/-/g,"/")));
var curDate = new Date();

  if(date <= curDate){
    console.log("早于当前时间");
  } else {
    console.log("晚于当前时间");
  }