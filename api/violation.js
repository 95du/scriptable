// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: car;
/**
 * 支付宝小程序 交管12123
 * 小组件作者：95度茅台
 * 获取Token作者: @FoKit
 * 版本: Version 1.2.0
 * Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy

获取Token重写:
https://raw.githubusercontent.com/FoKit/Scripts/main/rewrite/get_12123_token.sgmodule

============使用方法============
1，配置重写规则，手动运行小组件，按提示跳转到 支付宝12123小程序 登录即可自动抓取/更新Token。
2，获取Referer按提示点击12123小程序页面。
3，使用前，请确保您的代理APP已配置好BoxJs重写，BoxJs配置方法：https://chavyleung.gitbook.io/boxjs/

===============================
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

const get = await new Request(atob(
'aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zaG9ydGN1dHMvcmF3L21hc3Rlci9hcGkvdXBkYXRlL3Zpb2xhdGlvbi5qc29u')).loadJSON()
const url = get.infoURL

const uri = Script.name()
const F_MGR = FileManager.local();
const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), "violation");
const cacheFile = F_MGR.joinPath(folder, 'data.json');

if (F_MGR.fileExists(cacheFile)) {
  data = F_MGR.readString(cacheFile)
  data = JSON.parse(data);
  verifyToken = data.verifyToken
  myPlate = data.myPlate
  referer = data.referer
}

if (!F_MGR.fileExists(folder) || !verifyToken || !referer || referer) {
  try {
    const boxjs_data = await new Request('http://boxjs.com/query/data/token_12123').loadJSON();
    verifyToken = boxjs_data.val
    const boxjs_referer = await new Request('http://boxjs.com/query/data/referer_12123').loadJSON();
    referer = boxjs_referer.val
  } catch(e) {
    if (config.runsInApp) {
      Safari.open('quantumult-x://');
      notify('获取boxJs数据失败 ⚠️', '需打开Quantumult-X获取verifyToken');
    }
  }
  if (verifyToken && !referer) {
    Safari.open(get.details);
    notify('boxjs_referer ⚠️', '点击车牌号或查询即可更新/获取');
    return;
  }
  if (F_MGR.fileExists(cacheFile)) {
    await saveSettings();
  }
}


if (!F_MGR.fileExists(cacheFile)) {
  if (!verifyToken) {
    const loginAlert = new Alert();
    loginAlert.title = '交管 12123';
    loginAlert.message = `\r\n注 : 自动获取Token以及Referer需要Quantumult-X / Surge 辅助运行，具体方法请查看小组件代码开头注释\n\n⚠️获取Referer方法: 当跳转到支付宝12123时点击【 查机动车违法 】再点击【 查询 】，用于获取检验有效期的日期和累积记分\n\r\n小组件作者: 95度茅台\n获取Token作者: @FoKit`;
    loginAlert.addAction('获取');
    loginAlert.addCancelAction('取消');
    login = await loginAlert.presentAlert();
    if (login === -1) return;
    Safari.open(get.alipay);
    return;
  } else {
    notify('交管12123', `boxjs_token 获取成功: ${verifyToken}`);
    await addLicensePlate();
  }
}

async function addLicensePlate() {
  const alert = new Alert();
  alert.title = '输入车牌号';
  alert.message = '显示在小组件左上角'
  alert.addTextField('输入车牌号', F_MGR.fileExists(cacheFile) ? myPlate : '');
  alert.addAction('确定');
  alert.addCancelAction('取消');
  const input = await alert.presentAlert();
  myPlate = alert.textFieldValue(0);
  if (!myPlate || input === -1) {
    return
  } else {
    if (!F_MGR.fileExists(folder)) {
      F_MGR.createDirectory(folder);
    }
    await saveSettings();
    notify(myPlate, '您的车牌设置成功');
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
  vehicle = main.data.list
  vioList = vehicle[Math.floor(Math.random() * vehicle.length)];
  nothing = vioList === undefined;
  if (nothing) {
    console.log(main.resultMsg)
  } else {
    // issueOrganization plate
    const plate = myPlate.match(/(^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z])/)[1];
    const issueOrganization = new Request(url);
    issueOrganization.method = 'POST'
    issueOrganization.body = `params={
  "productId": "${get.productId}",
  "api": "${get.api2}", 
  "version": "${get.version}",
  "verifyToken": "${verifyToken}",
  "params": {
    "internalOrder": "${vioList.internalOrder}",
    "plateType": "02",
    "_issueOrganization": "${plate}"
  }
}`
    const issue = await issueOrganization.loadJSON();
    const issueItems = issue.data.vioCity
    const issueData = issueItems[Math.floor(Math.random() * issueItems.length)];
    
    // get surveils
    const area = new Request(url);
    area.method = 'POST'
    area.body = `params={
      "productId": "${get.productId}", 
      "api": "${get.api3}",
      "version": "${get.version}",
      "verifyToken": "${verifyToken}", 
    "params": {
      "internalOrder": "${vioList.internalOrder}",
      "plateType": "02",
      "issueOrganization": "${issueData.issueOrganization}"
    }
}`
    const surveils = await area.loadJSON();
    const vioItems = surveils.data.surveils
    const detail = vioItems[Math.floor(Math.random() * vioItems.length)];

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
      const imgItems = details.data.photos
      photos = imgItems[Math.floor(Math.random() * imgItems.length)];
    }
  }
} else {
  if (main.resultCode === 'SYSTEM_ERROR') {
    notify(main.resultMsg, '');
  } else {
    data = { myPlate: myPlate, referer: referer }
    F_MGR.writeString(cacheFile, JSON.stringify(data));
    notify('Token已过期 ⚠️', '点击通知框自动跳转到支付宝12123小程序页面重新获取 ( 请确保已打开辅助工具 )', get.alipay);
  }
  return;
}
  

// Presents the main menu
async function presentMenu() {
  let alert = new Alert();
  alert.title = "交管 12123"
  alert.message = get.Ver
  alert.addDestructiveAction('更新代码');
  alert.addDestructiveAction('重置所有');
  alert.addAction('累积记分');
  alert.addAction('组件下载');
  alert.addAction('修改车牌')
  alert.addAction('预览组件');
  alert.addAction('退出菜单');
  response = await alert.presentAlert();
  // menu action 1
  if (response === 1) {
    if (F_MGR.fileExists(folder)) {
      await F_MGR.remove(folder);
      Safari.open('scriptable:///run/' + encodeURIComponent(uri));
    }
    return;
  }
  if (response === 2) {
    data = { myPlate: myPlate, verifyToken: verifyToken }
    F_MGR.writeString(cacheFile, JSON.stringify(data));
    Safari.open(get.details);
    notify('12123_Referer', '点击车牌号码或查询即可更新/获取');
  }
  if (response === 3) {
    const modulePath = await downloadModule();
    if (modulePath != null) {
      const importedModule = importModule(modulePath);
      await importedModule.main();
    }
  }
  if (response === 4) {
    await addLicensePlate();
  }
  if (response === 5) {
    const widget = await createWidget(main);
    await widget.presentMedium();
  }
  if (response === 6) return;
  if (response === 0) {
    const codeString = await new Request(get.update).loadString();
    const finish = new Alert();
    if (codeString.indexOf("交管12123") == -1) {
      finish.title = "更新失败"
      finish.addAction('OK');
      await finish.presentAlert();
    } else {
      F_MGR.writeString(  
        module.filename,
        codeString
      );
      finish.title = "更新成功"
      finish.addAction('OK');
      await finish.presentAlert();
      Safari.open('scriptable:///run/' + encodeURIComponent(uri));
    }
  }
}

const isMediumWidget =  config.widgetFamily === 'medium'
if (!config.runsInWidget) {
  await presentMenu();
} else {
  if (isMediumWidget) {
    const widget = await createWidget(main);
    Script.setWidget(widget);
    Script.complete();
  } else {
    await createErrorWidget();
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
  leftStack.addSpacer();
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
  carIcon.tintColor = nothing ? Color.blue() : Color.red();
  carIconStack.addSpacer(5);
  // vehicleModel
  const vehicleModel = carIconStack.addStack();
  vehicleModelText = vehicleModel.addText(nothing ? '未处理违章 0' : `未处理违章 ${vioList.count} 条`);
  vehicleModelText.font = Font.mediumSystemFont(12);
  vehicleModelText.textColor = new Color('#494949');
  leftStack.addSpacer(3)

  // violationPoint
  const vioPointStack = leftStack.addStack();
  const vioPoint = vioPointStack.addStack();
  if (!nothing) {
    vioPointText = vioPoint.addText(`罚款${vio.fine}元、` + `扣${vio.violationPoint}分`);
    vioPointText.font = Font.mediumSystemFont(12);
    vioPointText.textColor = new Color('#484848');
    leftStack.addSpacer(3)
  }
    
  // validPeriodEnd icon
  const updateTimeStack = leftStack.addStack();
  if (nothing) {
    const iconSymbol2 = SFSymbol.named('timer');
    const carIcon2 = updateTimeStack.addImage(iconSymbol2.image);
    carIcon2.imageSize = new Size(14, 14);
    updateTimeStack.addSpacer(5);
  }
    
  // validPeriodEndDate
  const updateTime = updateTimeStack.addStack();
  const textUpdateTime = updateTime.addText(nothing ? referer.match(/validPeriodEnd=(.+)&vehPhoneNumber/)[1] : `${vio.violationTime}`);
  textUpdateTime.font = Font.mediumSystemFont(12);  
  textUpdateTime.textColor = new Color('#484848');
  leftStack.addSpacer(nothing ? 25 : 8)
    

  // Status barRow
  const barStack = leftStack.addStack();
  barStack.layoutHorizontally();
  barStack.centerAlignContent();
  barStack.setPadding(3, 10, 3, 10);
  // violation Early Warning
  barStack.backgroundColor = new Color('#EEEEEE', 0.1);
  barStack.cornerRadius = 10
  barStack.borderColor = nothing ? Color.green() : new Color('#FF1744', 0.7);
  barStack.borderWidth = 2
  if (nothing) {
    // bar icon
    const barIcon = SFSymbol.named('leaf.fill');
    const barIconElement = barStack.addImage(barIcon.image);
    barIconElement.imageSize = new Size(16, 16);
    barStack.addSpacer(4);
  }
  // bar text
  const totalMonthBar = barStack.addText(nothing ? '无违章' : `${vioList.plateNumber}`);
  totalMonthBar.font = Font.mediumSystemFont(14);
  totalMonthBar.textColor = new Color(nothing ? '#00b100' : '#D50000')
  leftStack.addSpacer(8)


  // Driver's license bar
  const barStack2 = leftStack.addStack();
  barStack2.layoutHorizontally();
  barStack2.centerAlignContent();
  barStack2.backgroundColor = new Color('#EEEEEE', 0.1);
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
  // cumulativePoint Bar Text
  const totalMonthBar2 = barStack2.addText(`记${referer.match(/cumulativePoint=(.+)/)[1]}分`);
  totalMonthBar2.font = Font.mediumSystemFont(14);
  totalMonthBar2.textColor = new Color('#616161')
  leftStack.addSpacer();


  /*
  * Right Main Stack
  * Car image
  * App Logo
  * Violation Address
  */
  const rightStack = mainStack.addStack();
  rightStack.layoutVertically();
  rightStack.addSpacer();
  // Car Logo
  const carLogoStack = rightStack.addStack();
  carLogoStack.addSpacer();
  textPlate2 = carLogoStack.addText('交管12123')
  textPlate2.font = Font.boldSystemFont(14);
  textPlate2.rightAlignText();
  textPlate2.textColor = new Color('#0061FF');
  rightStack.addSpacer(nothing ? 16 : 14)

  // Car image
  const carImageStack = rightStack.addStack();
  carImageStack.setPadding(-20, 6, 0, 0);
  const item = get.maybach[Math.floor(Math.random()*get.maybach.length)];
  const carImage = await getImage(item);
  const imageCar = carImageStack.addImage(carImage);
  imageCar.imageSize = new Size(228, 100);
  rightStack.addSpacer(2)

  // show address
  const tipsStack = rightStack.addStack();
  tipsStack.layoutHorizontally();
  tipsStack.centerAlignContent();
  tipsStack.size = new Size(230, 30)
  const textAddress = tipsStack.addText(nothing ? '请保持良好的驾驶习惯，务必遵守交通规则' : `${vio.violationAddress}，` + `${vio.violation}`);
  textAddress.font = Font.mediumSystemFont(nothing ? 11.5 : 11.3);
  textAddress.textColor = new Color('#484848');
  textAddress.centerAlignText();
  rightStack.addSpacer();

  // jump show status
  barStack2.url = get.status;
  // jump to details
  textPlate2.url = get.details;
  // jump show image
  if (!nothing) {
    textAddress.url = `${photos}`;
  }
  return widget;
}

async function downloadModule() {
  const modulePath = F_MGR.joinPath(folder, 'store.js');
  if (F_MGR.fileExists(modulePath)) {
    await F_MGR.remove(modulePath)
  }
  const req = new Request(atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvdmlwL21haW45NWR1U3RvcmUuanM='));
  const moduleJs = await req.load().catch(() => {
    return null;
  });
  if (moduleJs) {
    F_MGR.write(modulePath, moduleJs);
    return modulePath;
  }
}

/**
 * 存储当前设置
 * @param { JSON } string
 */
async function saveSettings () {
  data = {
    verifyToken: verifyToken,
    referer: referer,
    myPlate: myPlate
  }
  typeof data === 'object' ?  F_MGR.writeString(cacheFile, JSON.stringify(data)) : null
  console.log(JSON.stringify(data, null, 2))
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

async function createErrorWidget() {
  const widget = new ListWidget();
  const text = widget.addText('仅支持中尺寸');
  text.font = Font.systemFont(17);
  text.centerAlignText();
  Script.setWidget(widget);
}

async function shadowImage(img) {
  let ctx = new DrawContext()
  ctx.size = img.size
  ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']))
  // 图片遮罩颜色、透明度设置
  ctx.setFillColor(new Color("#000000", 0.2))
  ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']))
  return await ctx.getImage()
}