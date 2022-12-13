// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: car;
/**
支付宝小程序 交管12123
小组件作者：95度茅台
获取Token作者: @FoKit
版本: Version 1.3
Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy

获取Token重写：https://raw.githubusercontent.com/FoKit/Scripts/main/rewrite/get_12123_token.sgmodule
使用方法：配置重写规则，手动运行小组件，按提示跳转到 支付宝12123小程序 登录即可自动抓取/更新Token。
使用前，请确保您的代理APP已配置好BoxJs重写，BoxJs配置方法：https://chavyleung.gitbook.io/boxjs/

一键添加 boxjs 重写到 Quantumult-X https://api.boxjs.app/quanx-install

Boxjs订阅（可选）：http://boxjs.com/#/sub/add/https%3A%2F%2Fraw.githubusercontent.com%2FFoKit%2FScripts%2Fmain%2Fboxjs%2Ffokit.boxjs.json

手动配置重写规则：
=========Quantumult-X=========
[rewrite_local]
^https:\/\/miniappcsfw\.122\.gov\.cn:8443\/openapi\/invokeApi\/business\/biz url script-request-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/get_12123_token.js

[MITM]
hostname = miniappcsfw.122.gov.cn
============Surge=============
[Script]
12123_Token = type=http-request,pattern=^https:\/\/miniappcsfw\.122\.gov\.cn:8443\/openapi\/invokeApi\/business\/biz,requires-body=1,max-size=0,timeout=1000,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/get_12123_token.js,script-update-interval=0

[MITM]
hostname = %APPEND% miniappcsfw.122.gov.cn
*/

const notice = new Notification()
const get = await new Request(atob(
'aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zaG9ydGN1dHMvcmF3L21hc3Rlci9hcGkvdXBkYXRlL3Zpb2xhdGlvbi5qc29u')).loadJSON()
const url = get.infoURL

const F_MGR = FileManager.iCloud();
const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), "violation");
const cacheFile = F_MGR.joinPath(folder, 'data.json');

if (F_MGR.fileExists(cacheFile)) {
  data = F_MGR.readString(cacheFile)
  data = JSON.parse(data);
  verifyToken = data.verifyToken
  myPlate = data.myPlate
}


if (!F_MGR.fileExists(folder) || verifyToken === undefined) {
  // boxjs_data
  boxjs_request = new Request('http://boxjs.com/query/data/token_12123');
  boxjs_data = await boxjs_request.loadJSON();
  verifyToken = boxjs_data.val
  if (F_MGR.fileExists(cacheFile)) {
    data = {
      verifyToken: `${verifyToken}`,
      myPlate: `${myPlate}`
    }
    data = JSON.stringify(data);
    F_MGR.writeString(cacheFile, data);
  }
}


if (!F_MGR.fileExists(cacheFile)) {
  if (!verifyToken) {
    const loginAlert = new Alert();
    loginAlert.title = '交管 12123';
    loginAlert.message = `\r\n注 : 自动获取Token需要Quantumult-X / Surge 辅助运行\n\n具体方法请查看小组件代码开头注释\n\r\n小组件作者: 95度茅台\n获取Token作者: @FoKit`;
    loginAlert.addAction('获取Token');
    loginAlert.addCancelAction('取消');
    login = await loginAlert.presentAlert();
    if (login === -1) {
      return;
    } else {
      Safari.open(get.alipay);
      return;
    }
  } else {
    console.log(`boxjs_token 获取成功: ${boxjs_data.val}`);
    const alert = new Alert();
    alert.title = '输入车牌号';
    alert.message = '将显示在小组件左上角'
    alert.addTextField('输入车牌号');
    alert.addAction('确定');
    alert.addCancelAction('取消');
    const input = await alert.presentAlert();
    const value = alert.textFieldValue(0);
    myPlate = value
    
    if (input === 0) {
      if (!F_MGR.fileExists(folder)) {F_MGR.createDirectory(folder)}
      data = {
        verifyToken: `${boxjs_data.val}`,
        myPlate: `${myPlate}`
      }
      data = JSON.stringify(data);
      F_MGR.writeString(cacheFile, data);
      notice.title = '登录成功'
      notice.body = '请前往桌面添加中号小组件'
      notice.schedule();
    } else {
      return;
    }
  }
}


// violation main
const violation = new Request(url);
violation.method = 'POST'
violation.body = `params={
    "productId": "${get.productId}",
    "api": "${get.api1}",
    "version": "${get.version}",
    "verifyToken": "${verifyToken}"
}`
const main = await violation.loadJSON();
const success = main.success


if (success === true) {
  var list = main.data.list[0]
  if (list === undefined) {
    console.log(
      JSON.stringify(main, null, 2)
    );
  } else {
    // issueOrganization plate
    const plate = list.plateNumber
    const issueOrganization = new Request(url);
    issueOrganization.method = 'POST'
    issueOrganization.body = `params={
  "productId": "${get.productId}",
  "api": "${get.api2}", 
  "version": "${get.version}",
  "verifyToken": "${verifyToken}",
  "params": {
    "plateNumber": "${plate}",
    "plateType": "02"
  }
}`
    const issue = await issueOrganization.loadJSON();
    const issueData = issue.data.vioCity[0]


    // get surveils
    const area = new Request(url);
    area.method = 'POST'
    area.body = `params={
    "productId": "${get.productId}", 
    "api": "${get.api3}",
    "version": "${get.version}",
    "verifyToken": "${verifyToken}", 
    "params": {
        "plateNumber": "${plate}", 
        "plateType": "02", 
        "issueOrganization": "${issueData.issueOrganization}"
    }
}`
    const surveils = await area.loadJSON();
    const detail = surveils.data.surveils[0]


    // violation Message
    if (detail !== undefined) {
      const violationMsg = new Request(url);
      violationMsg.method = 'POST'
      violationMsg.body = `params={
    "productId": "${get.productId}", 
    "api": "${get.api4}",
    "version": "${get.version}",
    "verifyToken": "${verifyToken}", 
    "params": {
        "violationSerialNumber": "${detail.violationSerialNumber}", 
        "issueOrganization": "${detail.issueOrganization}"
    }
}`
      const details = await violationMsg.loadJSON();
      vio = details.data.detail
      img = details.data.photos
    }
  }
} else {
  if (main.resultCode === 'SYSTEM_ERROR') {
  notice.title = main.resultMsg
    notice.schedule();
  } else {
    data = {myPlate: `${myPlate}`}
    data = JSON.stringify(data);
    F_MGR.writeString(cacheFile, data);
    // notice
    notice.title = 'Token已过期 ⚠️'
    notice.body = '点击通知框自动跳转到支付宝12123小程序页面获取最新的Token ( 请确保已打开辅助工具 )'
    notice.openURL = get.alipay
    notice.schedule();
  }
  return;
}
  

// Presents the main menu
async function presentMenu() {
  let alert = new Alert();
  alert.title = "交管 12123"
  alert.message = get.Ver
  alert.addDestructiveAction('更新代码');
  alert.addAction('GetToken');
  alert.addAction('预览组件');
  alert.addAction('退出');
  response = await alert.presentAlert();
  // menu action 1
  if (response === 1) {
    await Safari.open(get.alipay);
    return;
  }
  if (response === 2) {
    const widget = await createWidget(main);
    await widget.presentMedium();
  }
  if (response === 3) return;
  if (response === 0) {
    const iCloudInUse = F_MGR.isFileStoredIniCloud(module.filename);
    const reqUpdate = new Request(get.update);
    const codeString = await reqUpdate.loadString();
    const finish = new Alert();
    if (codeString.indexOf("交管12123") == -1) {
      finish.title = "更新失败"
      finish.addAction('OK');
      await finish.presentAlert();
    } else {
      F_MGR.writeString(module.filename, codeString);
      finish.title = "更新成功"
      finish.addAction('OK');
      await finish.presentAlert();
      const Name = Script.name()
      Safari.open('scriptable:///run/' + encodeURIComponent(Name));
    }
  }
}
  
  
// config widget
if (config.widgetFamily === "small") {
  return;
} else {
  if (!config.runsInWidget) {  
    await presentMenu();
  } else {
    const widget = await createWidget(main);
    Script.setWidget(widget);
    Script.complete();
  }
}
  

// createWidget
async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = Color.white();
  const gradient = new LinearGradient();
  color = [
  "#82B1FF", 
  "#757575", 
  "#4FC3F7",
  "#66CCFF",
  "#99CCCC",
  "#BCBBBB"
  ]
  const items = color[Math.floor(Math.random()*color.length)];
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color(items, 0.5),
    new Color('#00000000')
  ]
  widget.backgroundGradient = gradient


  // Frame Layout
  widget.setPadding(15, 18, 15, 15);
  const mainStack = widget.addStack();
  mainStack.layoutHorizontally();
  
  /* 
  * Left Main Stack
  * Violation content
  * Status
  */
  const leftStack = mainStack.addStack();
  leftStack.layoutVertically();
  // plateStack
  const plateStack = leftStack.addStack();
  textPlate = plateStack.addText(myPlate);
  textPlate.font = Font.mediumSystemFont(19);
  textPlate.textColor = Color.black();
  leftStack.addSpacer(6)

  // Car icon
  const carIconStack = leftStack.addStack();
  carIconStack.layoutHorizontally();
  carIconStack.centerAlignContent();
  const man = SFSymbol.named('car');
  const carIcon = carIconStack.addImage(man.image);
  carIcon.imageSize = new Size(14, 14);
  if (list === undefined) {
    carIcon.tintColor = Color.black();
  } else {
    carIcon.tintColor = Color.red();
  }
  carIconStack.addSpacer(5);
  // vehicleModel
  const vehicleModel = carIconStack.addStack();
  if (list === undefined) {
    vehicleModelText = vehicleModel.addText('未处理违章 0');
  } else {
    vehicleModelText = vehicleModel.addText(`未处理违章 ${list.count} 条`);
  }
  vehicleModelText.font = Font.mediumSystemFont(12);
  vehicleModelText.textColor = new Color('#494949');
  leftStack.addSpacer(3)


  // violationPoint
  const vioPointStack = leftStack.addStack();
  const vioPoint = vioPointStack.addStack();
  if (list !== undefined) {
    vioPointText = vioPoint.addText(`罚款${vio.fine}元、` + `扣${vio.violationPoint}分`);
    vioPointText.font = Font.mediumSystemFont(12);
    vioPointText.textColor = new Color('#484848');
    leftStack.addSpacer(3)
  }
    
  // update icon
  const updateTimeStack = leftStack.addStack();
  if (list === undefined) {
    const iconSymbol2 = SFSymbol.named('person.crop.circle');
    const carIcon2 = updateTimeStack.addImage(iconSymbol2.image);
    carIcon2.imageSize = new Size(14, 14);
    carIcon2.tintColor = Color.black();
    updateTimeStack.addSpacer(5);
  }
    
  // update time
  const updateTime = updateTimeStack.addStack();
  if (list === undefined) {
    textUpdateTime = updateTime.addText('Good Driving');
    textUpdateTime.font = Font.mediumSystemFont(12);  
    textUpdateTime.textColor = new Color('#484848');
    leftStack.addSpacer(25)
  } else {
    textUpdateTime = updateTime.addText(`${vio.violationTime}`);
    textUpdateTime.font = Font.mediumSystemFont(12);  
    textUpdateTime.textColor = new Color('#484848');
    leftStack.addSpacer(8)
  }
    

  // Status barRow
  const barStack = leftStack.addStack();
  barStack.layoutHorizontally();
  barStack.centerAlignContent();
  barStack.setPadding(3, 10, 3, 10);
  if (list === undefined) {
    // violation Early Warning
    barStack.backgroundColor = new Color('#EEEEEE', 0.1);
    barStack.cornerRadius = 10
    barStack.borderColor = Color.green();
    barStack.borderWidth = 2
      
    // bar icon
    const barIcon = SFSymbol.named('leaf.fill');
    const barIconElement = barStack.addImage(barIcon.image);
    barIconElement.imageSize = new Size(16, 16);
    barIconElement.tintColor = Color.green();
    barStack.addSpacer(4);
    // bar text
    const totalMonthBar = barStack.addText('无违章');
    totalMonthBar.font = Font.mediumSystemFont(14);
    totalMonthBar.textColor = new Color('#009201');
    leftStack.addSpacer(8)
  } else {
    // Driver's license
    barStack.backgroundColor = new Color('#EEEEEE', 0.1);
    barStack.cornerRadius = 10
    barStack.borderColor = new Color('#FF1744', 0.7);
    barStack.borderWidth = 2
    // bar text
    const totalMonthBar = barStack.addText(`${vio.plateNumber}`);
    totalMonthBar.font = Font.mediumSystemFont(14);
    totalMonthBar.textColor = new Color('#D50000');
    leftStack.addSpacer(8)
  }


  // Driver's license bar
  const barStack2 = leftStack.addStack();
  barStack2.layoutHorizontally();
  barStack2.centerAlignContent();
  barStack2.backgroundColor = new Color('#EEEEEE', 0.3);
  barStack2.setPadding(3, 10, 3, 10);
  barStack2.cornerRadius = 10
  barStack2.borderColor = new Color('#AB47BC', 0.7);
  barStack2.borderWidth = 2
  // bsr icon
  const barIcon2 = SFSymbol.named('mail.fill');
  const barIconElement2 = barStack2.addImage(barIcon2.image);
  barIconElement2.imageSize = new Size(16, 16);
  barIconElement2.tintColor = Color.purple();
  barStack2.addSpacer(4);
  // bar text
  const totalMonthBar2 = barStack2.addText('驾驶证');
  totalMonthBar2.font = Font.mediumSystemFont(14);
  totalMonthBar2.textColor = new Color('#757575');
  leftStack.addSpacer(2)


  /*
  * Right Main Stack
  * Car image
  * App Logo
  * Violation Address
  */
  const rightStack = mainStack.addStack();
  rightStack.layoutVertically();
  // Car Logo
  const carLogoStack = rightStack.addStack();
  carLogoStack.addSpacer()
  textPlate2 = carLogoStack.addText('交管12123')
  textPlate2.font = Font.boldSystemFont(14);
  textPlate2.rightAlignText();
  textPlate2.textColor = new Color('#0061FF');
  rightStack.addSpacer(14)

  // Car image
  const carImageStack = rightStack.addStack();
  carImageStack.setPadding(-20, 6, 0, 0);
  const item = get.maybach[Math.floor(Math.random()*get.maybach.length)];
  const carImage = await getImage(item);
  const imageCar = carImageStack.addImage(carImage);
  imageCar.imageSize = new Size(225,100);
  rightStack.addSpacer(2)

  // show address
  const tipsStack = rightStack.addStack();
  tipsStack.layoutHorizontally();
  tipsStack.centerAlignContent();
  tipsStack.size = new Size(230, 30)
  if (list === undefined) {
    textAddress = tipsStack.addText('温馨提示: 请保持良好的驾驶习惯，务必遵守交通规则');
  } else {
    textAddress = tipsStack.addText(`${vio.violationAddress}，` + `${vio.violation}`);
  }
  textAddress.font = Font.mediumSystemFont(11.3);
  textAddress.textColor = new Color('#484848');
  textAddress.centerAlignText();

  // jump show status
  barStack2.url = get.status;
  // jump to details
  textPlate2.url = get.details;
  // jump 12123
  widget.url = get.alipay;
  // jump show image
  if (list !== undefined) {
    textAddress.url = `${img}`;
  }
  return widget;
}

async function getImage(url) {
  const r = await new Request(url);
  return await r.loadImage();
}

async function shadowImage(img) {
  let ctx = new DrawContext()
  ctx.size = img.size
  ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']))
  // 图片遮罩颜色、透明度设置
  ctx.setFillColor(new Color("#000000", 0.2))
  ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']))
  let res = await ctx.getImage()
  return res
}