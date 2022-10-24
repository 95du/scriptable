// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: car;
/**
交管12123
自动获取verifyToken作者: @FoKit
Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy
*/

const notice = new Notification()
const apiData = new Request('https://gitcode.net/4qiao/shortcuts/raw/master/api/update/violation.json')
const get = await apiData.loadJSON();

const fileManager = FileManager.iCloud();
const folder = fileManager.joinPath(fileManager.documentsDirectory(), "violation");
const cacheFile = fileManager.joinPath(folder, 'data.json');

// readString JSON
  if (fileManager.fileExists(cacheFile)) {
    data = fileManager.readString(cacheFile)
    data = JSON.parse(data)
  } else {
    // 使用方法
    const loginAlert = new Alert();
    loginAlert.title = '交管 12123';
    loginAlert.message = `\r\n注 : 自动获取verifyToken需要Quantumult-X App辅助运行\n\n首次登录需用户💙💙💙\n\r\n自动获取verifyToken作者: @FoKit\n小组件作者: 95度茅台`;
    loginAlert.addAction('填入车牌');
    loginAlert.addCancelAction('verifyToken');
    login = await loginAlert.presentAlert();
    
    if (login === -1) {
      Safari.open(`${get.alipay}`);
      return;
    } else {
      const alert = new Alert();
      alert.title = '输入车牌号';
      alert.message = '将显示在小组件左上角'
      alert.addTextField('输入车牌号');
      alert.addAction('确定');
      alert.addCancelAction('取消');
      const input = await alert.presentAlert();
      const value = alert.textFieldValue(0);
      if (input === 0) {
        fileManager.createDirectory(folder)
        data = {"version":"1.0","plate":`${value}`}
        data = JSON.stringify(data);
        fileManager.writeString(cacheFile, data);
        Safari.open('scriptable:///run/%E4%BA%A4%E7%AE%A112123')
        notice.title = '登录成功'
        notice.body = '请前往桌面添加小组件'
        notice.schedule();
      }
      return;
    }
  }


// violation main
const violation = new Request(`${get.infoURL}`);
  violation.method = 'POST'
  violation.body = `params={
    "productId": "${get.productId}", 
    "api": "${get.api1}", 
    "verifyToken": "${💙}"
}`
  const main = await violation.loadJSON();
  const success = main.success
  const list = main.data.list[0]
  
  
  if (success === true) {
    if (list === undefined) {
      log(JSON.stringify(main, null, 4))
    } else {
      // issueOrganization
      const plate = list.plateNumber
      const issueOrganization = new Request(`${get.infoURL}`);
      issueOrganization.method = 'POST'
      issueOrganization.body = `params={
    "productId": "${get.productId}", 
    "api": "${get.api2}", 
    "verifyToken": "${💙}", 
    "params": {
        "plateNumber": "${plate}", 
        "plateType": "02"
    }
}`
      const issue = await issueOrganization.loadJSON();
      const issueData = issue.data.vioCity[0]
      
      
      // get surveils
      const area = new Request(`${get.infoURL}`);
      area.method = 'POST'
      area.body = `params={
    "productId": "${get.productId}", 
    "api": "${get.api3}", 
    "verifyToken": "${💙}", 
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
      const violationMsg = new Request(`${get.infoURL}`);
      violationMsg.method = 'POST'
      violationMsg.body = `{
    "productId": "${get.productId}", 
    "api": "${get.api4}", 
    "verifyToken": "${💙}", 
    "params": {
        "violationSerialNumber": "${detail.violationSerialNumber}", 
        "issueOrganization": "${detail.issueOrganization}"
    }
}`
      const details = await violationMsg.loadJSON();
      const vio = details.data.detail      
      const img = details.data.photo
      // Violation Information
      }
    }
  } else {
    notice.title = 'verifyToken已过期'
    notice.body = '请前往💙💙💙'
    notice.schedule();
  }

  
  // createWidget
  const widget = await createWidget(main);

  if (config.widgetFamily === "small") {
    return;
  }
    
  
  async function createWidget() {
    const widget = new ListWidget();
    widget.backgroundColor = Color.white();
    const gradient = new LinearGradient()
    color = [
    "#CCCC99", 
    "#757575", 
    "#4FC3F7",
    "#99CCCC"
    ]
    const items = color[Math.floor(Math.random()*color.length)];
    gradient.locations = [0, 1]
    gradient.colors = [
      new Color(`${items}`, 0.5),
      new Color('#00000000')
    ]
    widget.backgroundGradient = gradient
    
   
    // Frame Layout
    widget.setPadding(5, 5, 5, 5);
    const mainStack = widget.addStack();
    mainStack.layoutVertically();
    mainStack.setPadding(10, 24, 0, 22);
    const dataStack = mainStack.addStack();
    dataStack.layoutHorizontally();

    // First column
    const column1 = dataStack.addStack();
    column1.layoutVertically();
    column1.setPadding(0, 5, 0, 0);
    // plateStack
    const plateStack = column1.addStack();
      textPlate = plateStack.addText(`${data.plate}`)
    textPlate.font = Font.mediumSystemFont(19);
    textPlate.textColor = new Color('#424242');
    column1.addSpacer(6)
    
    // Mercedes Logo
    const benzLogoStack = column1.addStack();
    const man = SFSymbol.named('car');
    const carIcon = benzLogoStack.addImage(man.image);
    carIcon.imageSize = new Size(14, 14);
    if (list === undefined) {
      carIcon.tintColor = Color.black();
    } else {
      carIcon.tintColor = Color.red();
    }
    benzLogoStack.addSpacer(5);
    // vehicleModel
    const vehicleModel = benzLogoStack.addStack();
    if (list === undefined) {
      vehicleModelText = vehicleModel.addText('未处理违章 0 条');
    } else {
      vehicleModelText = vehicleModel.addText(`未处理违章 ${list.count} 条`);
    }
    vehicleModelText.font = Font.mediumSystemFont(12);
    vehicleModelText.textColor = new Color('#424242');
    column1.addSpacer(3)
    
    // update icon
    const updateTimeStack = column1.addStack();
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
      textUpdateTime = updateTime.addText('驾驶证习惯良好');
      textUpdateTime.font = Font.mediumSystemFont(12);
    } else {
      textUpdateTime = updateTime.addText(`${vio.violationTime}`);
      textUpdateTime.font = Font.mediumSystemFont(13);
    }
    textUpdateTime.textColor = new Color('#424242');
    column1.addSpacer(22)
    
    
    const barRow = column1.addStack()
    const barStack = barRow.addStack();
    barStack.layoutHorizontally();
    barStack.centerAlignContent();
    barStack.setPadding(3, 10, 3, 10);
    if (list === undefined) {
      // Violation Early Warning
      barStack.backgroundColor = new Color('#EEEEEE', 0.1);
      barStack.cornerRadius = 10
      barStack.borderColor = Color.green();
      barStack.borderWidth = 2
      // bar icon
      const barIcon = SFSymbol.named('checkmark.shield.fill');
      const barIconElement = barStack.addImage(barIcon.image);
      barIconElement.imageSize = new Size(16, 16);
      barIconElement.tintColor = new Color('#009201');
      barStack.addSpacer(8);
      // bar text
      const totalMonthBar = barStack.addText('无违章');
      totalMonthBar.font = Font.mediumSystemFont(14);
      totalMonthBar.textColor = new Color('#009201');
      column1.addSpacer(10)
    } else {
      // Driver's license
      barStack.backgroundColor = new Color('#EEEEEE', 0.1);
      barStack.cornerRadius = 10
      barStack.borderColor = new Color('#FF1744', 0.7);
      barStack.borderWidth = 2
      // bar icon
      const barIcon = SFSymbol.named('checkmark.shield.fill');
      const barIconElement = barStack.addImage(barIcon.image);
      barIconElement.imageSize = new Size(15, 15);
      barIconElement.tintColor = Color.red();
      barStack.addSpacer(8);
      // bar text
      const totalMonthBar = barStack.addText('有违章');
      totalMonthBar.font = Font.mediumSystemFont(14);
      totalMonthBar.textColor = new Color('#D50000');
      column1.addSpacer(10)
    }
    

    // Driver's license bar
    const barRow2 = column1.addStack();
    const barStack2 = barRow2.addStack();
    barStack2.layoutHorizontally();
    barStack2.centerAlignContent();
    barStack2.backgroundColor = new Color('#EEEEEE', 0.3);
    barStack2.setPadding(3, 10, 3, 10);
    barStack2.cornerRadius = 10
    barStack2.borderColor = Color.purple();
    barStack2.borderWidth = 2
    // bsr icon
    const barIcon2 = SFSymbol.named('mail.fill');
    const barIconElement2 = barStack2.addImage(barIcon2.image);
    barIconElement2.imageSize = new Size(16, 16);
    barIconElement2.tintColor = Color.purple();
    barStack2.addSpacer(8);
    // bar text
    const totalMonthBar2 = barStack2.addText('驾驶证');
    totalMonthBar2.font = Font.mediumSystemFont(14);
    totalMonthBar2.textColor = Color.purple();
    column1.addSpacer()
    
    
    // Second column
    const column2 = dataStack.addStack();
    column2.layoutVertically();
    // Logo
    const carLogoStack = column2.addStack();
    carLogoStack.setPadding(0, 200, 0, 0);
    const carLogo = await getImage('https://sweixinfile.hisense.com/media/M00/71/03/Ch4FyGNWSISAB4b-AAAg-9GNdG0527.png');
    const image = carLogoStack.addImage(carLogo);
    image.imageSize = new Size(25,25);
    image.tintColor = Color.blue();
    column2.addSpacer(2)
    
    // Car image
    const carImageStack = column2.addStack();
    carImageStack.setPadding(-19, 5, 0, 0);
    const imgUrl = new Request('https://gitcode.net/4qiao/shortcuts/raw/master/api/update/Scriptable.json');
    const resUrl = await imgUrl.loadJSON();
    const item = resUrl.maybach[Math.floor(Math.random()*resUrl.maybach.length)];
    const carImage = await getImage(item);
    const imageCar = carImageStack.addImage(carImage);
    imageCar.imageSize = new Size(228,100);
    column2.addSpacer(3)

    // show address
    const addressStack = column2.addStack();
    addressStack.setPadding(0, 10, 0, 0);
    if (list === undefined) {
      textAddress = addressStack.addText('交管12123提醒您 : 请保持良好的驾驶习惯，务必遵守交通规则');
    } else {
      textAddress = addressStack.addText(`${vio.violation}，` + `${vio.violationAddress}，` + `罚款 ${vio.fine} 元 ` + `扣 ${vio.violationPoint} 分`)
    }
    textAddress.font = Font.mediumSystemFont(12.5);
    textAddress.textColor = new Color('#484848');
    textAddress.centerAlignText();
    column2.addSpacer(2)
    
    
    // jump show status
    barRow2.url = `${get.status}`;
    // jump show image
    if (list !== undefined) {
      textAddress.url = `${img}`;
    }
    // jump to alipay
    widget.url = `${get.alipay}`;

    
    // update and check
    if (!config.runsInWidget) {  
      let alert = new Alert();
      alert.title = "交管 12123 小组件"
      alert.addAction('更新代码')
      alert.addAction('预览组件')
      alert.addAction('退出')
      response = await alert.presentAlert();
      // menu action 1
      if (response === 1) {
        await widget.presentMedium();
        return;//预览后退出
      }
      // menu action 2
      if (response === 2) return;
      // Update the code
      if (response === 0) {
        const FILE_MGR = FileManager.local()
        const iCloudInUse = FILE_MGR.isFileStoredIniCloud(module.filename);
        const reqUpdate = new Request(`${get.update}`);
        const codeString = await reqUpdate.loadString()  
        const finish = new Alert();
        if (codeString.indexOf("交管12123") == -1) {
          finish.title = "更新失败"
          finish.addAction('OK')
          await finish.presentAlert();
        } else {
          FILE_MGR.writeString(module.filename, codeString)
          finish.title = "更新成功"
          finish.addAction('OK')
          await finish.presentAlert();
          const Name = 'violation';
Safari.open('scriptable:///run/' + encodeURIComponent(Name));
        }
      }
    } else {
      Script.setWidget(widget);
      Script.complete();
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