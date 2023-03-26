// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: broadcast-tower;
/**
 * 小组件作者：95度茅台
 * UITable 版本: Version 1.0.0
 * 2023-03-27 19:30
 * Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy
 */

async function main() {
  const uri = Script.name();
  const F_MGR = FileManager.local();
  const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), '95du_electric');
  const cacheFile = F_MGR.joinPath(folder, 'setting.json');
  const bgPath = F_MGR.joinPath(F_MGR.documentsDirectory(), '95duBackground');
  const bgImage = F_MGR.joinPath(bgPath, uri + '.jpg');
  
  if (F_MGR.fileExists(cacheFile)) {
    data = F_MGR.readString(cacheFile);
    setting = JSON.parse(data);
    loop = setting.loop;
    token = setting.token;
    gap = setting.gap;
    location = setting.location;
    avatarImg = setting.avatarImage
  }
  
  const notify = async (title, body, url) => {
    let n = new Notification();
    n.title = title
    n.body = body
    n.sound = 'alert'
    if (url) {n.openURL = url}
    return await n.schedule();
  }
  
  // Get Year and Month  
  const Year = new Date().getFullYear();
  const df = new DateFormatter();
  df.dateFormat = 'MM';
  const Month = (df.string(new Date()));
  const year = Month == 1 ? Year - 1 : Year;
  const timestamp = Date.parse(new Date());
  
  const headers = {
    'x-auth-token': token,
    'Content-Type': 'application/json;charset=utf-8'
  }
  
  // UserInfo
  const info = await userInfo();
  const {  
    userName: name,
    areaCode: code,
    bindingId: id,
    eleCustNumber: number,
  } = info;
  
  // Month & Yesterday
  const month = await getMonthData();
  if ( month ) {  
    totalPower = month.totalPower;
    const arr = month.result;
    ystdayPower = arr[arr.length-1].power;
  }
  
  // selectElecBill
  const ele = await getEleBill();
  if ( ele ) {  
    pay = ele.electricBillPay;
    const bill = ele.billUserAndYear.pop();
    total = bill.totalPower;
    arrears = bill.totalElectricity;
  } else {
    pay = '0.00';
    total = '0.00';
    arrears = '0.00';
  }
  
  const Run = async () => {
    if ( loop == 0 ) {
      setting.loop = 1
      levelColor = '#34C579'
      barColor = new Color(levelColor, 0.6);
    } else if ( loop == 1 ) {
      setting.loop = 0
      levelColor = '#4FC3F7'
      barColor = new Color(levelColor, 0.6);
    }
  }
  
  
  async function createWidget() {
    const widget = new ListWidget();
    const Appearance = Device.isUsingDarkAppearance();
    if (F_MGR.fileExists(bgImage) && Appearance === false) {
      widget.backgroundImage = await shadowImage(F_MGR.readImage(bgImage))  
    } else if (setting.gradient.length !== 0) {
      const gradient = new LinearGradient();
      color = setting.gradient
      const items = color[Math.floor(Math.random() * color.length)];
      gradient.locations = [0, 1]
      gradient.colors = [
        new Color(items, Number(setting.transparency)),
        new Color('#00000000')
      ]
      widget.backgroundGradient = gradient
    } else if (Appearance == false) {
      widget.backgroundImage = await getImage('http://mtw.so/60NF6g');
    } else {
      const baiTiaoUrl = [
        'https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/baiTiaoBg.png',
        'https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/baiTiaoBg2.png'];
      const bgImageItems = baiTiaoUrl[Math.floor(Math.random() * baiTiaoUrl.length)];
      widget.backgroundImage = await getImage(bgImageItems);
      widget.backgroundColor = Color.dynamic( new Color("#fefefe"), new Color('#111111'));
    }
    
    
    /** 
    * @param {image} image
    * @param {string} string
    */
    widget.setPadding(0, 0, 0, 0);
    const mainStack = widget.addStack();
    mainStack.layoutVertically();
    mainStack.centerAlignContent();
    mainStack.setPadding(gap, gap, gap, gap);
    mainStack.addSpacer();
    // avatarStack
    const avatarStack = mainStack.addStack();
    avatarStack.layoutHorizontally();
    avatarStack.centerAlignContent();
    const avatarStack2 = avatarStack.addStack();
    const iconSymbol = await getImage(avatarImg);
    const avatarIcon = avatarStack2.addImage(iconSymbol);
    avatarIcon.imageSize = new Size(52, 52);
    if ( avatarImg.indexOf('png') == -1 ) {
      avatarStack2.cornerRadius = 50;
      avatarStack2.borderWidth = 3;
      avatarStack2.borderColor = new Color('#FFBF00');
    }
    avatarStack.addSpacer(15);
    
    const topStack = avatarStack.addStack();
    topStack.layoutVertically();
    topStack.centerAlignContent();
    
    const levelStack = topStack.addStack();
    levelStack.layoutHorizontally();
    levelStack.centerAlignContent();
    
    const barStack = levelStack.addStack();
    barStack.layoutHorizontally();
    barStack.centerAlignContent();
    barStack.backgroundColor = new Color(levelColor);
    barStack.setPadding(1, 12, 1, 12);
    barStack.cornerRadius = 10;
    
    const iconSF = SFSymbol.named('crown.fill');
    const barIcon = barStack.addImage(iconSF.image);
    barIcon.imageSize = new Size(20, 20);
    barIcon.tintColor = new Color('#FDDA0D');
    barStack.addSpacer(4);
    
    const titleText = barStack.addText(name);
    titleText.font = Font.boldSystemFont(14);
    titleText.textColor = Color.white();
    levelStack.addSpacer(8);
    
    const beneStack = levelStack.addStack();
    beneStack.layoutHorizontally();
    beneStack.centerAlignContent();
    const benefitText = beneStack.addText('昨日  ');
    benefitText.font = Font.boldSystemFont(13);  
    benefitText.textOpacity = 0.7;
    
    const benefitText2 = beneStack.addText(`${ystdayPower} °`);
    benefitText2.font = Font.boldSystemFont(14);
    benefitText2.textColor = Color.red();
    barStack.addSpacer(5);
    topStack.addSpacer(5);
    
    
    const pointStack = topStack.addStack();
    pointStack.layoutHorizontally();
    pointStack.centerAlignContent();
    
    const payStack = pointStack.addStack();
    payStack.layoutHorizontally();
    payStack.centerAlignContent();
    payStack.backgroundColor = new Color(pay > 0 ? '#D50000' : '#AF52DE');
    payStack.setPadding(1, 5, 1, 5);
    payStack.cornerRadius = 5;
    
    const payText = payStack.addText(pay > 0 ? '待缴费' : '已缴费');
    payText.font = Font.boldSystemFont(11);
    payText.textColor = new Color('#FFFFFF');
    pointStack.addSpacer(8);
    
    const LevelText = pointStack.addText(number);
    LevelText.font = Font.mediumSystemFont(13);
    LevelText.textOpacity = 0.7;
    pointStack.addSpacer();
    
    const barStack2 = pointStack.addStack();
    barStack2.layoutHorizontally();
    barStack2.centerAlignContent();
    barStack2.backgroundColor = new Color('#FF9500', 0.7);
    barStack2.setPadding(1, 8, 1, 8);
    barStack2.cornerRadius = 5;
    
    const balance = await getBalance();
    const pointText = barStack2.addText(Number(balance).toFixed(2));
    pointText.font = Font.boldSystemFont(11);
    pointText.textColor = new Color('#FFFFFF');
    mainStack.addSpacer();
    
    // Switch position
    if (location == 0) {
      await progressBar();
    }
    
    /** 
    * Middle or bottom Stack
    * @param {image} image
    * @param {string} string
    */
    const middleStack = mainStack.addStack();
    middleStack.layoutHorizontally();
    middleStack.centerAlignContent();
    
    const quotaStack = middleStack.addStack();  
    quotaStack.layoutVertically();
    quotaStack.centerAlignContent();
    
    const quotaStack1 = quotaStack.addStack();
    const quotaText = quotaStack1.addText(`${Year}-${Month}`);
    quotaText.font = Font.mediumSystemFont(14);
    quotaText.textOpacity = 0.7;
    quotaStack1.addSpacer();
    quotaStack.addSpacer(3);
    
    const quotaStack2 = quotaStack.addStack();
    const quota = quotaStack2.addText(totalPower + ' °');
    quota.font = Font.boldSystemFont(18);
    quotaStack2.addSpacer();
    quotaStack.addSpacer(3);

    const quotaStack3 = quotaStack.addStack();
    const quotaText2 = quotaStack3.addText(`待缴  ${pay}`);
    quotaText2.font = Font.boldSystemFont(13);
    quotaText2.textColor = pay > 0 ? Color.red() : Color.dynamic(new Color('#000000'),new Color("#FFFFFF"));;
    quotaText2.textOpacity = 0.7;
    quotaStack3.addSpacer();
    middleStack.addSpacer();
    
    const gooseUrl = [
      'http://mtw.so/6ufcIQ'];
    const gooseItems = gooseUrl[Math.floor(Math.random() * gooseUrl.length)];
    const gooseIcon = await getImage(gooseItems);
    const gooseIconElement = middleStack.addImage(gooseIcon);
    gooseIconElement.imageSize = new Size(50, 55);
    middleStack.addSpacer();
    
    
    const billStack = middleStack.addStack();    
    billStack.layoutVertically();  
    billStack.centerAlignContent();
    
    const billStack1 = billStack.addStack();
    billStack1.addSpacer();
    const billText = billStack1.addText(`${Year}-${Month < 10 ? '0' : ''}` + String(Month - 1));
    billText.font = Font.mediumSystemFont(14);
    billText.textOpacity = 0.7;
    billStack.addSpacer(3);
    
    billStack2 = billStack.addStack();
    billStack2.addSpacer();
    const bill = billStack2.addText(total + ' °');
    bill.font = Font.boldSystemFont(18);
    billStack.addSpacer(3);
    
    billStack3 = billStack.addStack();
    billStack3.addSpacer();
    const billText2 = billStack3.addText(`${arrears}`); 
    billText2.font = Font.boldSystemFont(13);
    billText2.textOpacity = 0.7;
    mainStack.addSpacer();
    
    // Switch position
    if (location == 1) {
      await progressBar();
    }
    
    
    /** 
    * progressBar Stack
    * @param {image} image
    * @param {string} string
    */
    async function progressBar() {
      const prgrWid = Number(setting.progressWidth);
      const tempBarWidth = prgrWid;
      const tempBarHeight = 18;
      
      const prgsStack = mainStack.addStack();  
      prgsStack.layoutHorizontally();
      prgsStack.centerAlignContent();
      
      const curScoreText = prgsStack.addText(Month)
      curScoreText.font = Font.boldSystemFont(13);
      prgsStack.addSpacer();
      
      const imgProgress = prgsStack.addImage(creatProgress());
      imgProgress.centerAlignImage();
      imgProgress.imageSize = new Size(tempBarWidth, tempBarHeight);
      
      function creatProgress() {
        const draw = new DrawContext();
        draw.opaque = false;
        draw.respectScreenScale = true;
        draw.size = new Size(tempBarWidth, tempBarHeight);
      
        const barPath = new Path();
        const barHeight = tempBarHeight - 10;
        barPath.addRoundedRect(new Rect(0, 5, tempBarWidth, barHeight), barHeight / 2, barHeight / 2);
        draw.addPath(barPath);
        
        draw.setFillColor((barColor))
        draw.fillPath();
      
        const currPath = new Path();
        const isPercent = totalPower / total;
        currPath.addEllipse(new Rect((tempBarWidth - tempBarHeight) * isPercent, 0, tempBarHeight, tempBarHeight));
        draw.addPath(currPath);
        // progressColor
        draw.setFillColor(new Color("#FAFCFB"));
        draw.fillPath();
        return draw.getImage();
      }
      
      prgsStack.addSpacer();
      const isPercent2 = String(Math.floor(totalPower / total * 100));
      const percentText = prgsStack.addText(`${isPercent2} %`);
      percentText.font = Font.boldSystemFont(13);  
      mainStack.addSpacer();
    }
    
    gooseIconElement.url = 'alipays://platformapi/startapp?appId=2021001164644764';
    // 计算时长  
    const pushTime = (timestamp - setting.updateTime);
    const P1 = pushTime % (24 * 3600 * 1000);
    const hours = Math.floor(P1 / (3600 * 1000));
        
    if ( hours >= 12 && pay > 0 ) {
      notify('用电缴费通知‼️', `${name}` + `，户号 ${number}` + `\n上月用电 ${total} 度 ，待缴电费 ${pay} 元`)
      setting.updateTime = timestamp;
    }
    F_MGR.writeString(cacheFile, JSON.stringify(setting));

    if (config.runsInWidget) {
      Script.setWidget(widget);
      Script.complete();
    } else {
      await widget.presentMedium()
    }
    return widget;
  }
  
  
  /**-------------------------**/
     /** Request(url) json **/
  /**-------------------------**/
  
  const isSmallWidget =  config.widgetFamily === 'small';
  if (isSmallWidget && config.runsInWidget) {
    await smallrWidget();
  } else if (setting.code === 0) {
    await Run();
    await createWidget();
  }
  
  async function smallrWidget() {
    const widget = new ListWidget();
    const text = widget.addText('仅支持中尺寸');
    text.font = Font.systemFont(17);
    text.centerAlignText();
    Script.setWidget(widget);
    Script.complete();
  }
  
  /**-------------------------**/
     /** Request(url) json **/
  /**-------------------------**/
  
  
  
  async function userInfo() {
    const req = new Request('https://95598.csg.cn/ucs/ma/zt/eleCustNumber/queryBindEleUsers')
    req.method = 'POST'
    req.headers = headers;
    const res = await req.loadJSON();
    if (res.sta == 00) {
      const user = res.data[parseInt(Math.random() * res.data.length)];
      return user //User res.data[0]
    } else if (res.sta == 04) {
      setting.code = 3;
      F_MGR.writeString(cacheFile, JSON.stringify(setting)); 
      notify('用户未登录⚠️', 'Token 读取错误，请重新获取');
    }
  }
  
  async function getMonthData() {
    // queryMeteringPoint  
    const point = new Request('https://95598.csg.cn/ucs/ma/zt/charge/queryMeteringPoint');
    point.method = 'POST'
    point.headers = headers;
    point.body = JSON.stringify({
      areaCode: code,
      eleCustNumberList: [
        {
          areaCode: code,
          eleCustId: id
        }
      ]
    });
    const p = await point.loadJSON();
    // Month & Yesterday
    const req = new Request('https://95598.csg.cn/ucs/ma/zt/charge/queryDayElectricByMPoint')
    req.method = 'POST'
    req.headers = headers;
    req.body = JSON.stringify({
      eleCustId: id,
      areaCode: code,
      yearMonth: `${Year}${Month}`,
      meteringPointId: p.data[0].meteringPointId
    });
    const m = await req.loadJSON();
    return m.data;
  }
  
  async function getBalance() {
    const req = new Request('https://95598.csg.cn/ucs/ma/zt/charge/queryUserAccountNumberSurplus');  
    req.method = 'POST'
    req.headers = headers;
    req.body = JSON.stringify({
      areaCode: code,
      eleCustId: id
    });
    const bal = await req.loadJSON();
    return bal.data[0].balance;
  }
  
  async function getEleBill() {
    const req = new Request('https://95598.csg.cn/ucs/ma/zt/charge/selectElecBill');
    req.method = 'POST'
    req.headers = headers;
    req.body = JSON.stringify({
      electricityBillYear: year,
      areaCode: code,
      eleCustId: id
    });
    const res = await req.loadJSON();
    return res.data;
  }
  
  async function getImage(url) {
    const r = await new Request(url);
    return await r.loadImage();
  }
  
  async function shadowImage(img) {
    let ctx = new DrawContext()
    ctx.size = img.size
    ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']))
    ctx.setFillColor(new Color("#000000", Number(setting.masking)));
    ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']))
    return await ctx.getImage()
  }
}
module.exports = { main }