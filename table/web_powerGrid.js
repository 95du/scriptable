// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: bolt;
/**
 * 组件作者: 95度茅台
 * 组件名称: 南方电网
 * 组件版本: Version 1.0.0
 * 发布时间: 2023-10-17
 */

async function main() {
  const fm = FileManager.local();
  const mainPath = fm.joinPath(fm.documentsDirectory(), '95du_powerGrid');
  
  const getCachePath = (dirName) => fm.joinPath(mainPath, dirName);
  
  const [ settingPath, cacheImg, cacheStr ] = [
    'setting.json',
    'cache_image',
    'cache_string',
  ].map(getCachePath);
  
  /**
   * 读取储存的设置
   * @returns {object} - 设置对象
   */
  const getBotSettings = (file) => {
    if (fm.fileExists(file)) {
      return { avatarImage, useCache, count, loop, token, gap, location, progressWidth, radius } = JSON.parse(fm.readString(file));
    }
    return null;
  };
  const setting = await getBotSettings(settingPath);
  
  /**
   * 存储当前设置
   * @param { JSON } string
   */
  const writeSettings = async (setting) => {
    fm.writeString(settingPath, JSON.stringify(setting, null, 2));
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
  const notify = async (title, body, url, opts = {}) => {
    const n = Object.assign(new Notification(), { title, body, sound: 'alert', ...opts });
    if (url) n.openURL = url;
    return await n.schedule();
  };
  
  /**
   * 获取背景图片存储目录路径
   * @returns {string} - 目录路径
   */
  const getBgImagePath = () => {
    const bgPath = fm.joinPath(fm.documentsDirectory(), '95duBackground');
    return fm.joinPath(bgPath, Script.name() + '.jpg');
  }
  
  /**
   * 读取和写入缓存的文本和图片数据
   * @param {object} options
   * @param {number}  - number
   * @returns {object} - Object
   */
  const useFileManager = ({ cacheTime } = {}) => {
    return {
      readString: (name) => {
        const filePath = fm.joinPath(cacheStr, name);  
        const fileExists =  fm.fileExists(filePath);
        if (fileExists && hasExpired(filePath) > cacheTime) {
          fm.remove(filePath);
          return null;
        }
        return fm.fileExists(filePath) && useCache ? fm.readString(filePath) : null;
      },
      writeString: (name, content) => fm.writeString(fm.joinPath(cacheStr, name), content),
      // cache image
      readImage: (name) => {
        const filePath = fm.joinPath(cacheImg, name);
        return fm.fileExists(filePath) ? fm.readImage(filePath) : null;
      },
      writeImage: (name, image) => fm.writeImage(fm.joinPath(cacheImg, name), image),
    };
    
    function hasExpired(filePath) {
      const createTime = fm.creationDate(filePath).getTime();
      return (Date.now() - createTime) / (60 * 60 * 1000)
    }
  };
  
  /**
   * 获取网络图片并使用缓存
   * @param {Image} url
   */
  const getImage = async (url) => {
    return await new Request(url).loadImage();
  };
  
  const getCacheImage = async (name, url) => {
    const cache = useFileManager();
    const image = cache.readImage(name);
    if (image) {
      return image;
    }
    const img = await getImage(url);
    cache.writeImage(name, img);
    return img;
  };
  
  /**
   * 获取 POST JSON 字符串
   * @param {string} json
   * @returns {object} - JSON
   */
  const getCacheString = async (jsonName, jsonUrl, requestBody) => {
    const cache = useFileManager({ cacheTime: 24 });
    const jsonString = cache.readString(jsonName);
    if (jsonString) {
      return JSON.parse(jsonString);
    }
    const response = await makeRequest(jsonUrl, requestBody);
    const jsonFile = JSON.stringify(response);
    const { sta } = JSON.parse(jsonFile);
    if ( sta == 00 ) {
      cache.writeString(jsonName, jsonFile);
    }
    return JSON.parse(jsonFile);
  };
  
  /**
  * 该函数获取当前的年份和月份
  * @returns {Promise}
  */
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentYear = month === '01' ? year - 1 : year;

  // 请求头参数
  const headers = {
    'x-auth-token': token,
    'Content-Type': 'application/json;charset=utf-8'
  }
  
  // totalPower & Yesterday
  const Run = async () => {
    const month = await getMonthData();
    if ( month ) {  
      totalPower = month.totalPower;
      ystdayPower = month.result.pop().power;
      beforeYesterday = month.result[month.result.length - 1].power ?? '0.00'
    } else {
      totalPower = '0.00';
      ystdayPower = '0.00';
      beforeYesterday = '0.00';
    }
    
    // levelColor loop
    if ( loop === 0 ) {
      setting.loop = 1
      levelColor = '#34C579'
      barColor = new Color(levelColor, 0.6);
    } else if ( loop === 1 ) {
      setting.loop = 0
      levelColor = '#4FC3F7'
      barColor = new Color(levelColor, 0.6);
    }
  };
  
  
  //=========> Create <=========//
  async function createWidget() {
    const widget = new ListWidget();
    widget.refreshAfterDate = new Date(Date.now() + 1000 * 60 * Number(setting.refresh));
    
    const bgImage = await getBgImagePath();
    const Appearance = Device.isUsingDarkAppearance();
    if (fm.fileExists(bgImage) && Appearance === false) {
      widget.backgroundImage = await shadowImage(fm.readImage(bgImage));
    } else if (setting.solidColor) {
      const gradient = new LinearGradient();
      const color = setting.gradient.length > 0 ? setting.gradient : [setting.rangeColor];
      const randomColor = color[Math.floor(Math.random() * color.length)];
      
      // 渐变角度
      const angle = setting.angle;
      const radianAngle = ((360 - angle) % 360) * (Math.PI / 180);
      const x = 0.5 + 0.5 * Math.cos(radianAngle);
      const y = 0.5 + 0.5 * Math.sin(radianAngle);
      gradient.startPoint = new Point(1 - x, y);
      gradient.endPoint = new Point(x, 1 - y);
      
      gradient.locations = [0, 1];
      gradient.colors = [
        new Color(randomColor, setting.transparency),
        new Color('#00000000')
      ];
      widget.backgroundGradient = gradient;
    } else if (Appearance == false) {
      widget.backgroundImage = await getCacheImage("bg.jpeg", 'https://gitcode.net/4qiao/framework/raw/master/img/picture/background_image.jpeg');
    } else {
      const baiTiaoUrl = [
        'https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/baiTiaoBg.png',
        'https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/baiTiaoBg2.png'];
      const bgImageURL = baiTiaoUrl[Math.floor(Math.random() * baiTiaoUrl.length)];
      const bgImageName = decodeURIComponent(bgImageURL.substring(bgImageURL.lastIndexOf("/") + 1));
      const randomBackgroundImage = await getCacheImage(bgImageName, bgImageURL);
      widget.backgroundImage = randomBackgroundImage;
      widget.backgroundColor = Color.dynamic( new Color("#fefefe"), new Color('#111111'));
    };
    
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
    
    const imgName = decodeURIComponent(avatarImage.substring(avatarImage.lastIndexOf("/") + 1));
    const iconSymbol = await getCacheImage(imgName, avatarImage);
    const avatarIcon = avatarStack2.addImage(iconSymbol);
    avatarIcon.imageSize = new Size(50, 50);
    if ( avatarImage.indexOf('png') == -1 ) {
      avatarStack2.cornerRadius = Number(radius);
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
    benefitText2.textColor = isArrears == 1 ? Color.blue() : Color.red()
    beneStack.addSpacer();
    
    if ( isArrears == 1 ) {
      const payText0 = 
      beneStack.addText(arrears);
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
    payStack.backgroundColor = new Color(isArrears == 1 ? '#D50000' : '#AF52DE');
    payStack.setPadding(1, 5, 1, 5);
    payStack.cornerRadius = 5;
    
    const payText = payStack.addText(isArrears == 1 ? '待缴费' : '已缴费');
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
    
    const pointText = barStack2.addText(beforeYesterday);
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
    const quotaText = quotaStack1.addText(`${year}-${month}`);
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
    const quotaText2 = quotaStack3.addText(totalPower > 0 ? await getBalance() : '0.00');
    quotaText2.font = Font.boldSystemFont(14);
    quotaText2.textOpacity = 0.7;
    quotaStack3.addSpacer();
    middleStack.addSpacer();
    
    const gooseUrl = [
      'https://sweixinfile.hisense.com/media/M00/75/2C/Ch4FyWQoaJOAFvSdAAG9-M1eIU0735.png'];
    const gooseItems = gooseUrl[Math.floor(Math.random() * gooseUrl.length)];
    const gooseIcon = await getCacheImage('gose.png', gooseItems)
    const gooseIconElement = middleStack.addImage(gooseIcon);
    gooseIconElement.imageSize = new Size(58, 58);
    middleStack.addSpacer();
    
    /**
     * Middle Right Stack
     */
    const billStack = middleStack.addStack();    
    billStack.layoutVertically();  
    billStack.centerAlignContent();
    
    const billStack1 = billStack.addStack();
    billStack1.addSpacer();
    
    const billText = billStack1.addText(lastMonth);
    billText.font = Font.mediumSystemFont(14);
    billText.textOpacity = 0.7;
    billStack.addSpacer(3);
    
    const billStack2 = billStack.addStack();
    billStack2.addSpacer();
    const bill = billStack2.addText(total + ' °');
    bill.font = Font.boldSystemFont(18);
    billStack.addSpacer(3);
    
    const billStack3 = billStack.addStack();
    billStack3.addSpacer();
    const billText2 = billStack3.addText(totalBill);
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
      const prgrWid = Number(progressWidth);
      const tempBarWidth = prgrWid;
      const tempBarHeight = 18;
      
      const prgsStack = mainStack.addStack();  
      prgsStack.layoutHorizontally();
      prgsStack.centerAlignContent();
      
      const curScoreText = prgsStack.addText(month)
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
        let isPercent = totalPower / total;
        if (isPercent > 1) {
          isPercent = 1
        }
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
    
    // 欠费时每12小时通知一次
    const arrearsNotice = () => {
      const pushTime = (Date.now() - setting.updateTime);
      const duration = pushTime % (24 * 3600 * 1000);
      const hours = Math.floor(duration / (3600 * 1000));
      if ( hours >= 12 && isArrears == 1 ) {
        notify('用电缴费通知 ‼️', `${name}，户号 ${number}` + `\n上月用电 ${total} 度 ，待缴电费 ${arrears} 元`)
        setting.updateTime = Date.now();
      }
    }
    arrearsNotice();
    writeSettings(setting);
    
    if (!config.runsInWidget) {
      await widget.presentMedium();
    } else {
      Script.setWidget(widget);
      Script.complete();
    };
    return widget;
  };
  
  /**-------------------------**/
     /** Request(url) json **/
  /**-------------------------**/
  async function makeRequest(url, requestBody) {
    const req = new Request(url);
    req.method = 'POST';
    req.headers = headers;
    req.body = JSON.stringify(requestBody);
    return await req.loadJSON();
  };
  
  // 用户信息
  async function userInfo() {
    const res = await makeRequest('https://95598.csg.cn/ucs/ma/zt/eleCustNumber/queryBindEleUsers');
    if (res.sta == 00) {
      let countArr = res.data.length;
      setting.count = countArr == 1 ? countArr - 1 : setting.count > 0 ? setting.count - 1 : countArr - 1;
      return {  
        userName: name,
        areaCode: code,
        bindingId: id,
        eleCustNumber: number,
      } = res.data[setting.count];
    }
  };
  
  // 月用电量
  async function getMonthData() {
    const pointResponse = await getCacheString(
      `queryMeteringPoint${count}.json`,
      'https://95598.csg.cn/ucs/ma/zt/charge/queryMeteringPoint', {
      areaCode: code,
      eleCustNumberList: [{ areaCode: code, eleCustId: id }]
    });
    // totalPower & yesterday
    const { meteringPointId } = pointResponse.data[0];
    const monthResponse = await getCacheString(`queryDayElectricByMPoint${count}.json`, 'https://95598.csg.cn/ucs/ma/zt/charge/queryDayElectricByMPoint', {
      eleCustId: id,
      areaCode: code,
      yearMonth: year + month,
      meteringPointId
    });
    return monthResponse.data;
  };
  
  // 余额
  async function getBalance() {
    const response = await getCacheString(
      `queryUserAccountNumberSurplus${count}.json`, 'https://95598.csg.cn/ucs/ma/zt/charge/queryUserAccountNumberSurplus', {
      areaCode: code,
      eleCustId: id
    });
    return response.data[0].balance;
  };
  
  // 账单
  async function selectEleBill() {
    const response = await getCacheString(  
      `selectElecBill${count}.json`,
      'https://95598.csg.cn/ucs/ma/zt/charge/selectElecBill', {
      electricityBillYear: currentYear,
      areaCode: code,
      eleCustId: id
    });
    const eleBill = response.data.billUserAndYear[0];
    if ( eleBill ) {
      lastMonth = eleBill.electricityBillYearMonth.replace(/^(\d{4})(\d{2})$/, '$1-$2');
      return {
        lastMonth: electricityBillYearMonth,
        totalPower: total,
        totalElectricity: totalBill,
        arrears,
        isArrears
      } = eleBill;
    }
  };
  
  /**-------------------------**/
     /** Request(url) json **/
  /**-------------------------**/
  async function shadowImage(img) {
    let ctx = new DrawContext()
    ctx.size = img.size
    ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']))
    ctx.setFillColor(new Color("#000000", Number(setting.masking)));
    ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']))
    return await ctx.getImage()
  };
  
  async function smallrWidget() {
    const widget = new ListWidget();
    const text = widget.addText('仅支持中尺寸');
    text.font = Font.systemFont(17);
    text.centerAlignText();
    Script.setWidget(widget);
    Script.complete();
  };
  
  async function createErrWidget() {
    const widget = new ListWidget();
    const image = await getCacheImage('gose.png', 'https://sweixinfile.hisense.com/media/M00/75/2C/Ch4FyWQoaJOAFvSdAAG9-M1eIU0735.png');
    const widgetImage = widget.addImage(image);
    widgetImage.imageSize = new Size(50, 50);
    widgetImage.centerAlignImage();
    widget.addSpacer(10);
    const text = widget.addText('用户未登录');
    text.font = Font.systemFont(17);
    text.centerAlignText();
    Script.setWidget(widget);
  };
  
  const runWidget = async () => {
    if (setting.code === 0) {
      await userInfo();
      await selectEleBill();
      await Run();
    }
    if (config.widgetFamily === 'medium' || config.runsInApp) {
      try {
        await (setting.code === 0 ? createWidget() : createErrWidget());  
      } catch (e) {
        console.log(e)
      }
    } else {
      await smallrWidget();
    }
  };
  await runWidget();
}
module.exports = { main }