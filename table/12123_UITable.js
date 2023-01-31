// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: car;
/**
 * 支付宝小程序 交管12123
 * 小组件作者：95度茅台
 * 获取Token作者: @FoKit
 * UITable 版本: Version 1.1.0
 */
async function main() {
  const get = await new Request(atob(
'aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zaG9ydGN1dHMvcmF3L21hc3Rlci9hcGkvdXBkYXRlL3Zpb2xhdGlvbi5qc29u')).loadJSON()
  const url = get.infoURL
  
  const uri = Script.name()
  const F_MGR = FileManager.local();
  const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), "95du12123");
  const cacheFile = F_MGR.joinPath(folder, 'setting.json');
  // Background image path  
  const bgPath = F_MGR.joinPath(F_MGR.documentsDirectory(), "95duBackground");
  const bgImage = F_MGR.joinPath(bgPath, uri + ".jpg");
  
  if (F_MGR.fileExists(cacheFile)) {
    data = F_MGR.readString(cacheFile)
    setting = JSON.parse(data);
    verifyToken = setting.verifyToken
    myPlate = setting.myPlate
    referer = setting.referer
  }
  
  if (verifyToken && !referer) {
    notify('12123_Referer ⚠️', '点击菜单中的累积记分获取');
  }
  
  if (verifyToken === null) {
    try {
      const boxjs_data = await new Request('http://boxjs.com/query/data/token_12123').loadJSON();
      verifyToken = boxjs_data.val
      const boxjs_referer = await new Request('http://boxjs.com/query/data/referer_12123').loadJSON();
      referer = boxjs_referer.val
      data = {
        ...setting,
        verifyToken: verifyToken,
        referer: referer
      }
      F_MGR.writeString(cacheFile, JSON.stringify(data));
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
      data = {
        ...setting,
        verifyToken: null
      }
      F_MGR.writeString(cacheFile, JSON.stringify(data));
      notify('Token已过期 ⚠️', '点击通知框自动跳转到支付宝12123小程序页面重新获取 ( 请确保已打开辅助工具 )', get.alipay);
    }
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
    if (F_MGR.fileExists(bgImage)) {
      widget.backgroundImage = F_MGR.readImage(bgImage);
    } else {
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
        new Color(items, Number(setting.transparency)),
        new Color('#00000000')
      ]
      widget.backgroundGradient = gradient
    }
  
  
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
    totalMonthBar.textColor = new Color(nothing ? '#00b100' : '#D50000');
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
    const barIcon2 = SFSymbol.named('person.text.rectangle.fill');
    const barIconElement2 = barStack2.addImage(barIcon2.image);
    barIconElement2.imageSize = new Size(16, 16);
    barIconElement2.tintColor = Color.purple();
    barStack2.addSpacer(4);
    // cumulativePoint Bar Text
    const totalMonthBar2 = barStack2.addText(`记${referer.match(/cumulativePoint=(.+)/)[1]}分`);
    totalMonthBar2.font = Font.mediumSystemFont(14);
    totalMonthBar2.textColor = new Color('#616161');
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
    imageCar.imageSize = new Size(setting.width, setting.height);
    rightStack.addSpacer(2)
  
    // show address
    const tipsStack = rightStack.addStack();
    tipsStack.layoutHorizontally();
    tipsStack.centerAlignContent();
    tipsStack.size = new Size(Number(setting.layout), 30)
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