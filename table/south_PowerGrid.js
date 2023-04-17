// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: broadcast-tower;
/**
 * 小组件作者：95度茅台
 * UITable 版本: Version 1.0.0
 * 2023-03-27 19:30
 */

async function main() {
  const cacheDirName = '95du_electric';
  const F_MGR = FileManager.local();

  /**
   * 获取电报机器人的数据存储目录路径
   * @returns {string} - 目录路径
   */
  const getSettingPath = () => {
    const mainPath = F_MGR.joinPath(F_MGR.documentsDirectory(), cacheDirName);
    F_MGR.createDirectory(mainPath, true);
    return F_MGR.joinPath(mainPath, 'setting.json', true);
  };
  
  
  /**
   * 获取背景图片存储目录路径
   * @returns {string} - 目录路径
   */
  const getBgImagePath = () => {
    const bgPath = F_MGR.joinPath(F_MGR.documentsDirectory(), '95duBackground');
    F_MGR.createDirectory(bgPath, true);
    return F_MGR.joinPath(bgPath, Script.name() + '.jpg');
  }
  
  /**
   * 读取储存的设置
   * @returns {object} - 设置对象
   */
  const getBotSettings = () => {
    if ( getSettingPath() ) {
      return { loop, token, gap, location, avatarImage } = JSON.parse(F_MGR.readString(getSettingPath()));
    }
    return null;
  };
  const setting = await getBotSettings();
  
  /**
   * 存储当前设置
   * @param { JSON } string
   */
  const writeSettings = async () => {
    typeof settings === 'object' ? F_MGR.writeString(getSettingPath(), JSON.stringify(setting)) : null;
    console.log(JSON.stringify(
      setting, null, 2)
    );
  }
  
  /**  
  * 弹出一个通知
  * @param {string} title
  * @param {string} body
  * @param {string} url
  * @param {string} sound
  */
  const notify = async (title, body, url) => {
    let n = new Notification();
    n.title = title
    n.body = body
    n.sound = 'alert'
    if (url) {n.openURL = url}
    return await n.schedule();
  }
  
  /**
   * 获取图片并使用缓存
   * @param {string} File Extension
   * @returns {image} - Request
   */
  const useFileManager = (options = {}) => {
    const fm = FileManager.local();
    const cacheDir = fm.joinPath(fm.documentsDirectory(), cacheDirName, options.cache || 'cache');
    fm.createDirectory(cacheDir, true);
    const cache = fm.joinPath(cacheDir, 'cache_path');
    fm.createDirectory(cache, true);
    
    return {
      readImage: (filePath) => {
        const imageFile = fm.joinPath(cache, filePath);
        if (fm.fileExists(imageFile) && options.cacheTime) {
          const createTime = fm.creationDate(imageFile).getTime();
          const diff = (Date.now() - createTime) / ( 60 * 60 * 1000 );
          if (diff >= options.cacheTime) {
            fm.remove(imageFile);
            return null;
          }
        }
        return fm.readImage(imageFile);
      },
      writeImage: (filePath, image) => fm.writeImage(fm.joinPath(cache, filePath), image)
    }
  };
  
  const getImage = async (url) => {
    return await new Request(url).loadImage();
  };
  
  // 获取图片，使用缓存
  const getCacheImage = async (name, url) => {
    const cache = useFileManager({ cacheTime: 24 });
    const image = cache.readImage(name);
    if (image) {
      return image;
    }
    const res = await getImage(url);
    cache.writeImage(name, res);
    return res;
  };
  
  
  //=========> START <=========//
  
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
  
  const Run = async () => {
    // Month & Yesterday
    const month = await getMonthData();
    if ( month ) {  
      totalPower = month.totalPower;
      const arr = month.result;
      ystdayPower = arr[arr.length-1].power;
    } else {
      totalPower = '0.00';
      ystdayPower = '0.00';
    }
    
    // levelColor loop
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
  
  const selectBill = async () => {
    const ele = await selectEleBill();
    if ( ele ) {  
      pay = ele.electricBillPay;
      const bill = ele.billUserAndYear.pop();
      total = bill.totalPower;
      arrears = bill.totalElectricity;
    }
  }
  
  async function createWidget() {
    const widget = new ListWidget();
    const bgImage = await getBgImagePath();
    const Appearance = Device.isUsingDarkAppearance();
    if (F_MGR.fileExists(bgImage) && Appearance === false) {
      widget.backgroundImage = await shadowImage(F_MGR.readImage(bgImage))  
    } else if (setting.gradient.length !== 0) {
      const gradient = new LinearGradient();
      const color = setting.gradient
      const items = color[Math.floor(Math.random() * color.length)];
      gradient.locations = [0, 1]
      gradient.colors = [
        new Color(items, Number(setting.transparency)),
        new Color('#00000000')
      ]
      widget.backgroundGradient = gradient
    } else if (Appearance == false) {
      widget.backgroundImage = await getCacheImage("bg.jpeg", 'http://mtw.so/60NF6g');
    } else {
      const baiTiaoUrl = [
        'https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/baiTiaoBg.png',
        'https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/baiTiaoBg2.png'];
      const bgImageURL = baiTiaoUrl[Math.floor(Math.random() * baiTiaoUrl.length)];
      const bgImageName = decodeURIComponent(bgImageURL.substring(bgImageURL.lastIndexOf("/") + 1));
      const randomBackgroundImage = await getCacheImage(bgImageName, bgImageURL);
      widget.backgroundImage = randomBackgroundImage;
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
    const iconSymbol = await getCacheImage('avatar.jpeg', avatarImage);
    const avatarIcon = avatarStack2.addImage(iconSymbol);
    avatarIcon.imageSize = new Size(50, 50);
    if ( avatarImage.indexOf('png') == -1 ) {
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
    benefitText.font = Font.boldSystemFont(14);  
    benefitText.textOpacity = 0.7;
    
    const benefitText2 = beneStack.addText(`${ystdayPower} °`);
    benefitText2.font = Font.boldSystemFont(16);
    benefitText2.textColor = Color.red();
    beneStack.addSpacer();
    
    if ( pay > 0 ) {
      const payText0 = 
      beneStack.addText(pay);
      payText0.font = Font.boldSystemFont(16);
      payText0.textColor = new Color('#FF2400');
    }
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
    LevelText.font = Font.mediumSystemFont(14);
    LevelText.textOpacity = 0.7;
    pointStack.addSpacer();
    
    const barStack2 = pointStack.addStack();
    barStack2.layoutHorizontally();
    barStack2.centerAlignContent();
    barStack2.backgroundColor = new Color('#FF9500', 0.7);
    barStack2.setPadding(0.5, 8, 0.5, 8);
    barStack2.cornerRadius = 5;
    
    const balance = await getBalance();
    const pointText = barStack2.addText(Number(balance).toFixed(2));
    pointText.font = Font.boldSystemFont(12);
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
    const quotaText2 = quotaStack3.addText('预计缴 ' + (arrears / total * totalPower).toFixed(2));
    quotaText2.font = Font.boldSystemFont(14);
    quotaText2.textOpacity = 0.7;
    quotaStack3.addSpacer();
    middleStack.addSpacer();
    
    const gooseUrl = [
      'http://mtw.so/67LhN1'];
    const gooseItems = gooseUrl[Math.floor(Math.random() * gooseUrl.length)];
    const gooseIcon = await getCacheImage('gose.png', gooseItems)
    const gooseIconElement = middleStack.addImage(gooseIcon);
    gooseIconElement.imageSize = new Size(58, 58);
    middleStack.addSpacer();
    
    
    const billStack = middleStack.addStack();    
    billStack.layoutVertically();  
    billStack.centerAlignContent();
    
    const billStack1 = billStack.addStack();
    billStack1.addSpacer();
    // Last Month
    const lastMomth = new Date().getMonth();  
    const month = lastMomth == 0 ? 12 : lastMomth < 10 ? `0${lastMomth}` : lastMomth;
    const billText = billStack1.addText(`${Year}-${pay > 0 ? month : String(month == 1 ? 12 : month - 1 < 10 ? `0${month - 1}` : month - 1)}`);
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
    const billText2 = billStack3.addText(arrears); 
    billText2.font = Font.boldSystemFont(14);
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
        // Circle Color
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
    const duration = pushTime % (24 * 3600 * 1000);
    const hours = Math.floor(duration / (3600 * 1000));
    if ( hours >= 12 && pay > 0 ) {
      notify('用电缴费通知‼️', `${name}` + `，户号 ${number}` + `\n上月用电 ${total} 度 ，待缴电费 ${pay} 元`)
      setting.updateTime = timestamp;
    }
    await writeSettings();
    
    // 组件实例
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
  
  async function runWidget() {
    if (config.widgetFamily === 'small') {
      await smallrWidget();
    } else if (setting.code === 0) {
      await userInfo();
      await getEleBill();
      await Run();
      await createWidget();
    } else {
      notify('南网用户未登录⚠️', 'Token 读取错误，请重新获取');
    }
  }
  await runWidget();
  
  /**-------------------------**/
     /** Request(url) json **/
  /**-------------------------**/
  
  
  async function userInfo() {
    const req = new Request('https://95598.csg.cn/ucs/ma/zt/eleCustNumber/queryBindEleUsers')
    req.method = 'POST'
    req.headers = headers;
    const res = await req.loadJSON();
    if (res.sta == 00) {
      let countArr = res.data.length;
      setting.count = countArr == 1 ? countArr - 1 : setting.count > 0 ? setting.count - 1 : countArr - 1;
      F_MGR.writeString(
        await getSettingPath(),  
        JSON.stringify(setting)
      );
      
      return {  
        userName: name,
        areaCode: code,
        bindingId: id,
        eleCustNumber: number,
      } = res.data[setting.count];
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
      yearMonth: Year + Month,
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
    const elecBill = new Request('https://95598.csg.cn/ucs/ma/zt/charge/queryCharges');
    elecBill.method = 'POST'
    elecBill.headers = headers;
    elecBill.body = JSON.stringify({
      type: 0,
      areaCode: code,
      eleModels: [
        {
          areaCode: code,
          eleCustId: id
        }
      ]
    });
    const res = await elecBill.loadJSON();
    const lastBill = res.data[0].points[0];
    if ( lastBill ) {  
      if ( !lastBill.arrears ) {
        await selectBill();
      } else {
        return {
          arrears: pay ,
          billingElectricity: total,
          receieElectricity: arrears
        } = lastBill;
      }
    } else {
      return {
        pay: pay = '0',
        total: total = '0.00',
        arrears: arrears = '0.00'
      }
    }
  }
  
  async function selectEleBill() {
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
  
  async function smallrWidget() {
    const widget = new ListWidget();
    const text = widget.addText('仅支持中尺寸');
    text.font = Font.systemFont(17);
    text.centerAlignText();
    Script.setWidget(widget);
    Script.complete();
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