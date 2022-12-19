// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: bolt;
/**
* 小组件作者: 95度茅台
* 南网在线 App
* 查看电费
* Version 1.0
* 2022-10-15 10:00
* Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy
*/
const timestamp = Date.parse(new Date());

const F_MGR = FileManager.iCloud();
const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), "electric");
const cacheFile = F_MGR.joinPath(folder, 'data.json');

if (F_MGR.fileExists(cacheFile)) {
  data = F_MGR.readString(cacheFile)
  data = JSON.parse(data)
} else {
  const loginAlert = new Alert();
  loginAlert.title = '南网在线登录';
  loginAlert.message = `\r\n南方电网只包括海南、广东、广西、云南、贵州5个省份。\n\n首次登录需用户在南方电网的网页版中登录，组件自动抓取 token，登录成功稍等10秒后生效，关闭该页面，token 将储存在 iCloud.\n\r\n小组件作者: 95度茅台\n获取token方法: @LSP`;
  loginAlert.addAction('继续');
  loginAlert.addCancelAction('取消');
  login = await loginAlert.presentAlert();
    
  if (login === -1) {
    return;
  } else {
    const webview = new WebView();  
    await webview.loadURL('https://95598.csg.cn/#/hn/login/login');
    await webview.present();
    const cookie = await webview.evaluateJavaScript(
      'document.cookie'
    );
    console.log(cookie)
    try {
      if (!F_MGR.fileExists(folder)) {F_MGR.createDirectory(folder)}
      const token = cookie.match(/token=(.*?);/)[1];
      data = {
        token: token,
        updateTime: timestamp
      }
      F_MGR.writeString(cacheFile, JSON.stringify(data));
      notify('登录成功', '前往桌面添加小组件');
    } catch(e) {
      return;
    }
  }
}

// Get Year and Month
const Year = new Date().getFullYear();
const Month = new Date().getMonth() + 1;

// UserInfo
const req = new Request('https://95598.csg.cn/ucs/ma/zt/eleCustNumber/queryBindEleUsers');
req.method = 'POST'
req.headers = {
  "x-auth-token": `${data.token}`
}
const res = await req.loadJSON();
console.log(res)
if (res.sta == 00) {
  ele = res.data[0] //User
  name = ele.userName
  code = ele.areaCode
  id = ele.bindingId
  number = ele.eleCustNumber
} else if (res.sta == 04) {
  notify('南网在线', 'token已过期，请重新登录获取');
  F_MGR.remove(folder); return
}

// Yesterday
const yesterday = new Request('https://95598.csg.cn/ucs/ma/zt/charge/queryDayElectricByMPointYesterday');
yesterday.method = 'POST'
yesterday.headers = {
  "x-auth-token": `${data.token}`,
  "Content-Type":"application/json;charset=utf-8"}
yesterday.body = `{
  "areaCode": "${code}",
  "eleCustId": "${id}"
}`
const resY = await yesterday.loadJSON();
const Y = resY.data
if (Y === null) {
  ystdayPower = '0.00 '
} else {
  ystdayPower = Y.power
}
  

// queryMeteringPoint
const point = new Request('https://95598.csg.cn/ucs/ma/zt/charge/queryMeteringPoint');
point.method = 'POST'
point.headers = {
  "x-auth-token": `${data.token}`,
  "Content-Type":"application/json;charset=utf-8"}
point.body = `{
  "areaCode" : "${code}",
  "eleCustNumberList" : [
    {
      "areaCode" : "${code}",
      "eleCustId" : "${id}"
    }
  ]
}`
const resP = await point.loadJSON();
const P = resP.data[0]
  
  
// Month
const month = new Request('https://95598.csg.cn/ucs/ma/zt/charge/queryDayElectricByMPoint');
month.method = 'POST'
month.headers = {
  "x-auth-token": `${data.token}`,
  "Content-Type":"application/json;charset=utf-8"}
month.body = `{
  "eleCustId" : "${id}",
  "areaCode" : "${code}",
  "yearMonth" : "${Year}${Month}",
  "meteringPointId" : "${P.meteringPointId}"
}`
const resM = await month.loadJSON();
const M = resM.data
if (M === null) {
  totalPower = '0.00 '
} else {
  totalPower = M.totalPower
}

  
// UserAccountNumberSurplus
const balance = new Request('https://95598.csg.cn/ucs/ma/zt/charge/queryUserAccountNumberSurplus');
balance.method = 'POST'
balance.headers = {
  "x-auth-token": `${data.token}`,
  "Content-Type":"application/json;charset=utf-8"}
balance.body = `{
  "areaCode": "${code}",
  "eleCustId": "${id}"
}`
const resB = await balance.loadJSON();
const Bdata = resB.data
if (Bdata === null) {
  bal = '0'
} else {
  B = resB.data[0]
  bal = B.balance
}


// selectElecBill
const elecBill = new Request('https://95598.csg.cn/ucs/ma/zt/charge/selectElecBill');
elecBill.method = 'POST'
elecBill.headers = {
  "x-auth-token": `${data.token}`,
  "Content-Type":"application/json;charset=utf-8"}
elecBill.body = `{
  "electricityBillYear" : "${Year}",
  "areaCode" : "${code}",
  "eleCustId" : "${id}"
}`
const resBill = await elecBill.loadJSON();
const bill = resBill.data.billUserAndYear[0]
const total = bill.totalPower
const pay = bill.arrears
const arrears = bill.totalElectricity

// create Widget
const widget = await createWidget(ele, balance, pay);
  
if (config.runsInWidget) {
  Script.setWidget(widget)
  Script.complete()
} else {
  await widget.presentMedium();
}

// Create widget
async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = Color.white();
  const gradient = new LinearGradient()
    color = [
    "#4FC3F7",
    "#66CCFF",
    "#99CCCC"
    ]
  const items = color[Math.floor(Math.random()*color.length)];
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color(items, 0.5),
    new Color('#00000000')
  ]
  widget.backgroundGradient = gradient
    
   
  // Frame Layout
  const mainStack = widget.addStack();
  mainStack.layoutHorizontally();

  /**
  * Left Main Stack
  */
  const leftStack = mainStack.addStack();
  leftStack.layoutVertically();
  // logo stack
  const logoStack = leftStack.addStack();
  logoStack.setPadding(0, 4, 0, 0);
  const ironMan = new Request ('https://gitcode.net/4qiao/scriptable/raw/master/img/icon/lightningMan.png');
  const iconSymbol = await ironMan.loadImage();
  const ironManIcon = logoStack.addImage(iconSymbol);
  ironManIcon.imageSize = new Size(80, 80);
  logoStack.url = 'alipays://platformapi/startapp?appId=2021001164644764'
  leftStack.addSpacer(5);
    
  // name stack
  const nameStack = leftStack.addStack();
  nameStack.layoutHorizontally();
  nameStack.centerAlignContent();
  nameStack.setPadding(3, 10, 3, 10);
  // name icon
  const nameIcon = SFSymbol.named('person.crop.circle');
  const nameIconElement = nameStack.addImage(nameIcon.image);
  nameIconElement.imageSize = new Size(15, 15);
  nameIconElement.tintColor = Color.black();
  nameStack.addSpacer(4);
  // name text
  const nameText = nameStack.addText(name);
  nameText.font = Font.mediumSystemFont(14);
  nameText.textColor = Color.black();
  leftStack.addSpacer(3)

  // pay stack
  if (pay < 1) {
    const payStack = leftStack.addStack();
    payStack.backgroundColor = new Color('#EEEEEE', 0.1);
    payStack.setPadding(3, 10, 3, 10);
    payStack.cornerRadius = 10
    payStack.borderColor = Color.green();
    payStack.borderWidth = 2
    // pay bar icon
    const payIcon = SFSymbol.named('leaf.fill');
    const payIconElement = payStack.addImage(payIcon.image);
    payIconElement.imageSize = new Size(15, 15);
    payIconElement.tintColor = Color.green();
    payStack.addSpacer(4);
    // pay bar text
    const payText = payStack.addText('已缴费');
    payText.font = Font.mediumSystemFont(14);
    payText.textColor = Color.green();
    leftStack.addSpacer(6)
  } else {
    const payStack = leftStack.addStack();
    payStack.backgroundColor = new Color('#EEEEEE', 0.1);
    payStack.setPadding(3, 10, 3, 10);
    payStack.cornerRadius = 10
    payStack.borderColor = new Color('#FF1744', 0.7);
    payStack.borderWidth = 2
    // pay bsr icon
    const payIcon = SFSymbol.named('leaf.fill');
    const payIconElement = payStack.addImage(payIcon.image);
    payIconElement.imageSize = new Size(15, 15);
    payIconElement.tintColor = Color.red();
    payStack.addSpacer(4);
    // pay bar text
    const payText = payStack.addText(pay);
    payText.font = Font.mediumSystemFont(14);
    payText.textColor = new Color('#D50000');
    leftStack.addSpacer(6)
  }
    
    
  /**
  * Center Stack
  */
  const centerStack = mainStack.addStack();
  centerStack.layoutVertically();
  centerStack.setPadding(5, 30, 0, 0)
  // yesterday
  const yesterdayRow = centerStack.addStack()
  const yesTDStack = yesterdayRow.addStack();
  yesTDStack.setPadding(0, 0, 0, 0);
  // yesterday icon
  const yesterdayIcon = SFSymbol.named('bolt.fill');
  const yesterdayIconElement = yesTDStack.addImage(yesterdayIcon.image);
  yesterdayIconElement.imageSize = new Size(15, 15);
  yesterdayIconElement.tintColor = Color.red();
  yesTDStack.addSpacer(6);
  // yesterday text
  const yesterdayText = yesTDStack.addText('昨日');
  yesterdayText.font = Font.mediumSystemFont(14)
  yesterdayText.textColor = new Color('#616161');
  centerStack.addSpacer(3)
  // Yesterday Use text
  const yesterdayUseText = centerStack.addText(ystdayPower + ' kw·h')
  yesterdayUseText.textColor = Color.blue();
  yesterdayUseText.font = Font.boldSystemFont(14)
  yesterdayUseText.leftAlignText()
  centerStack.addSpacer(10)
    
    
  // month stack
  const monthStack = centerStack.addStack();
  monthStack.setPadding(0, 0, 0, 0);
  // month icon
  const monthIcon = SFSymbol.named('bolt.fill');
  const monthIconElement = monthStack.addImage(monthIcon.image);
  monthIconElement.imageSize = new Size(15, 15);
  monthIconElement.tintColor = Color.purple();
  monthStack.addSpacer(6);
  // month text
  const monthText = monthStack.addText('本月');
  monthText.font = Font.mediumSystemFont(14)
  monthText.textColor = new Color('#616161');
  centerStack.addSpacer(3)
  // month Use Text
  const monthUseText = centerStack.addText(totalPower + ' kw·h')
  monthUseText.textColor = Color.blue();
  monthUseText.font = Font.boldSystemFont(14)
  monthUseText.leftAlignText()
  centerStack.addSpacer(10)
    
    
  // Use Ele Stack
  const useEleStack = centerStack.addStack();
  useEleStack.setPadding(0, 0, 0, 0);
  // Use ele icon
  const useEleIcon = SFSymbol.named('lightbulb.fill');
  const useEleIconElement = useEleStack.addImage(useEleIcon.image);
  useEleIconElement.imageSize = new Size(15, 15);
  useEleIconElement.tintColor = Color.orange();
  useEleStack.addSpacer(6);
  // Use ele text
  const useEleText = useEleStack.addText('上月');
  useEleText.font = Font.mediumSystemFont(14);
  useEleText.textColor = new Color('#616161');
  centerStack.addSpacer(3)
  // Use ele total text
  const useEleTotalText = centerStack.addText(`${total} kw·h`)
  useEleTotalText.textColor = Color.blue();
  useEleTotalText.font = Font.boldSystemFont(14)
  useEleTotalText.leftAlignText()
  centerStack.addSpacer(5)
    
    
  /**
  * Right Main Stack
  */
  const rightStack = mainStack.addStack();
  rightStack.layoutVertically();
  rightStack.setPadding(5, 20, 0, 0)
  // bal Stack
  const balStack = rightStack.addStack();
  balStack.setPadding(0, 0, 0, 0);
  // balance Icon
  const balanceIcon = SFSymbol.named('star.fill');
  const balanceIconElement = balStack.addImage(balanceIcon.image);
  balanceIconElement.imageSize = new Size(15, 15);
  balanceIconElement.tintColor = Color.green();
  balStack.addSpacer(6);
  // balance text
  const balanceText = balStack.addText('余额');
  balanceText.font = Font.mediumSystemFont(14)
  balanceText.textColor = new Color('#616161');
  rightStack.addSpacer(3)
  //balance Use Text
  const contain = bal.indexOf(".") != -1
  if (contain === false) {
    balanceUseText = rightStack.addText(bal + '.00 rmb')
  } else {
    balanceUseText = rightStack.addText(bal + ' rmb')
  }
  balanceUseText.textColor = Color.blue();
  balanceUseText.font = Font.boldSystemFont(14)
  balanceUseText.leftAlignText()
  rightStack.addSpacer(10)
    

  // ele Bill Stack
  const eleBiStack = rightStack.addStack();
  eleBiStack.setPadding(0, 0, 0, 0);
  // ele Bill icon
  const eleBillIcon = SFSymbol.named('yensign.circle');
  const eleBillIconElement = eleBiStack.addImage(eleBillIcon.image);
  eleBillIconElement.imageSize = new Size(15, 15);
  eleBillIconElement.tintColor = Color.purple();
  eleBiStack.addSpacer(6);
  // ele Bill text
  const eleBillText = eleBiStack.addText('电费');
  eleBillText.font = Font.mediumSystemFont(14);
  eleBillText.textColor = new Color('#616161');
  rightStack.addSpacer(3)
  // ele Bill Total Text
  const eleBillTotalText = rightStack.addText(`${arrears} rmb`)
  eleBillTotalText.textColor = Color.blue();
  eleBillTotalText.font = Font.boldSystemFont(14)
  eleBillTotalText.leftAlignText()
  rightStack.addSpacer(10)
    
    
  // arrears Stack
  const arrearsStack = rightStack.addStack();
  arrearsStack.setPadding(0, 0, 0, 0);
  // arrears icon
  const arrearsIcon = SFSymbol.named('exclamationmark.shield');
  const arrearsIconElement = arrearsStack.addImage(arrearsIcon.image);
  arrearsIconElement.imageSize = new Size(15, 15);
  arrearsIconElement.tintColor = Color.red();
  arrearsStack.addSpacer(6);
  // arrears text
  const arrearsText = arrearsStack.addText('待缴');
  arrearsText.font = Font.mediumSystemFont(14);
  arrearsText.textColor = new Color('#616161');
  rightStack.addSpacer(3)
  // arrears total text
  const arrearsTotalText = rightStack.addText(`${pay} rmb`);
  arrearsTotalText.textColor = Color.blue();
  arrearsTotalText.font = Font.boldSystemFont(14)
  arrearsTotalText.leftAlignText()
  rightStack.addSpacer(5)
  return widget;
}

// 计算时长
const pushTime = (timestamp - data.updateTime);
const P1 = pushTime % (24 * 3600 * 1000);
const hours = Math.floor(P1 / (3600 * 1000));
    
if (hours >= 12) {
  if (pay > 0) {
    notify('用电缴费通知‼️', `${name}` + `，户号 ${number}` + `\n上月用电 ${total} 度 ，待缴电费 ${pay} 元`)
    // writeString JSON
    if (F_MGR.fileExists(folder)) {
      data = {
        token: data.token,
        updateTime: timestamp
      };
      F_MGR.writeString(cacheFile, JSON.stringify(data));
    }
  }
}

async function notify (title, body, url, opts = {}) {
  let n = new Notification()
  n = Object.assign(n, opts);
  n.title = title
  n.body = body
  if (url) n.openURL = url
  return await n.schedule()
}

async function getImage(url) {
  const r = await new Request(url);
  return await r.loadImage();
}

async function shadowImage(img) {
  let ctx = new DrawContext();
  ctx.size = img.size
  ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']))
  // 图片遮罩颜色、透明度设置
  ctx.setFillColor(new Color("#000000", 0.2));
  ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']))
  return await ctx.getImage();
}