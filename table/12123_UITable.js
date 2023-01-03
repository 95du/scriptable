// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: car;
/**
 * 支付宝小程序 交管12123
 * 小组件作者：95度茅台
 * 获取Token作者: @FoKit
 * UITable 版本: Version 1.0.0
 */
async function main() {
  const get = await new Request(atob(
'aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zaG9ydGN1dHMvcmF3L21hc3Rlci9hcGkvdXBkYXRlL3Zpb2xhdGlvbi5qc29u')).loadJSON()
  const url = get.infoURL
  
  const uri = Script.name()
  const F_MGR = FileManager.iCloud();
  const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), "95du12123");
  const cacheFile = F_MGR.joinPath(folder, 'setting.json');
  
  if (F_MGR.fileExists(cacheFile)) {
    data = F_MGR.readString(cacheFile)
    setting = JSON.parse(data);
    verifyToken = setting.verifyToken
    myPlate = setting.myPlate
  }
  
  if (verifyToken === '0') {
    try {
      boxjs_data = await new Request('http://boxjs.com/query/data/token_12123').loadJSON();
      verifyToken = boxjs_data.val
      data = {
        ...setting,
        verifyToken: verifyToken
      }
      F_MGR.writeString(cacheFile, JSON.stringify(data));
      notify('交管12123', `boxjs_token 获取成功: ${boxjs_data.val}`);
    } catch(e) {
      notify('获取boxJs数据失败 ⚠️', '需打开Quantumult-X获取verifyToken');
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
    const list = main.data.list[0];
    nothing = list === undefined;
    if (nothing) {
      console.log(main.resultMsg)
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
      notify(main.resultMsg, '');
    } else {
      data = {
        ...setting,
        verifyToken: '0'
      }
      F_MGR.writeString(cacheFile, JSON.stringify(data));
      notify('Token已过期 ⚠️', '点击通知框自动跳转到支付宝12123小程序页面重新获取 ( 请确保已打开辅助工具 )', get.alipay);
    }
    return;
  }
    
  
  const isMediumWidget =  config.widgetFamily === 'medium'
  if (!config.runsInWidget) {
    const widget = await createWidget(main);
    await widget.presentMedium();
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
    colorArr = setting.gradient.length
    if (colorArr === 0) {
      color = [
        "#82B1FF",
        "#757575",
        "#4FC3F7",
        "#66CCFF",
        "#99CCCC",
        "#BCBBBB"
      ]
    } else {
      color = setting.gradient
    }
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
    carIcon.tintColor = nothing ? Color.black() : Color.red();
    carIconStack.addSpacer(5);
    // vehicleModel
    const vehicleModel = carIconStack.addStack();
    vehicleModelText = vehicleModel.addText(nothing ? '未处理违章 0' : `未处理违章 ${list.count} 条`);
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
      
    // update icon
    const updateTimeStack = leftStack.addStack();
    if (nothing) {
      const iconSymbol2 = SFSymbol.named('person.crop.circle');
      const carIcon2 = updateTimeStack.addImage(iconSymbol2.image);
      carIcon2.imageSize = new Size(14, 14);
      carIcon2.tintColor = Color.black();
      updateTimeStack.addSpacer(5);
    }
      
    // update time
    const updateTime = updateTimeStack.addStack();
    const textUpdateTime = updateTime.addText(nothing ? 'Good Driving' : `${vio.violationTime}`);
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
      barIconElement.tintColor = Color.green();
      barStack.addSpacer(4);
    }
    // bar text
    const totalMonthBar = barStack.addText(nothing ? '无违章' : `${vio.plateNumber}`);
    totalMonthBar.font = Font.mediumSystemFont(14);
    totalMonthBar.textColor = new Color(nothing ? '#009201' : '#D50000');
    leftStack.addSpacer(8)
  
  
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
    imgArr = setting.picture.length
    if (imgArr === 0) {
      item = get.maybach[Math.floor(Math.random() * get.maybach.length)];
    } else {
      item = setting.picture[Math.floor(Math.random() * imgArr)];
    }
    const carImage = await getImage(item);
    const imageCar = carImageStack.addImage(carImage);
    imageCar.imageSize = new Size(225,100);
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
      textAddress.url = img;
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
}
module.exports = { main }