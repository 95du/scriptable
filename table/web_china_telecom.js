// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: phone-volume;
/**
 * 组件作者: 95度茅台
 * 组件名称: 中国电信余量
 * Version 1.0.0
 * 2023-10-17 14:30
 */

async function main() {
  const fm = FileManager.local();
  const mainPath = fm.joinPath(fm.documentsDirectory(), '95du_telecom');
  
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
      return { cookie, balanceColor } = JSON.parse(fm.readString(file));
    }
    return null;
  };
  const setting = await getBotSettings(settingPath);
  
  /**
   * 存储当前设置
   * @param { JSON } string
   */
  const writeSettings = async (settings) => {
    fm.writeString(settingPath, JSON.stringify(settings, null, 2));
    console.log(JSON.stringify(
      settings, null, 2)
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
   * 获取背景图片存储目录路径
   * @returns {string} - 目录路径
   */
  const getBgImagePath = () => {
    const bgPath = fm.joinPath(fm.documentsDirectory(), '95duBackground');
    return fm.joinPath(bgPath, Script.name() + '.jpg');
  }
  
  /**
   * 获取图片并使用缓存
   * @param {string} File Extension
   * @returns {image} - Request
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
        return fm.fileExists(filePath) ? fm.readString(filePath) : null;
      },
      writeString: (name, content) => fm.writeString(fm.joinPath(cacheStr, name), content),
      // cache image
      readImage: (name) => {
        const filePath = fm.joinPath(cacheImg, name);
        const fileExists =  fm.fileExists(filePath);
        if (fileExists && hasExpired(filePath) > cacheTime) {
          fm.remove(filePath);
          return null;
        }
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
    const cache = useFileManager({ cacheTime : 24 });
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
  const getCacheString = async (jsonName, jsonUrl) => {
    const cache = useFileManager({ cacheTime: setting.cacheTime });
    const jsonString = cache.readString(jsonName);
    if (jsonString) {
      return JSON.parse(jsonString);
    }
    const response = await makeReq(jsonUrl);
    const jsonFile = JSON.stringify(response);
    const { result } = JSON.parse(jsonFile);
    if ( result === 0 ) {
      cache.writeString(jsonName, jsonFile);
    }
    return JSON.parse(jsonFile);
  };
  
  /**
   * 从用户套餐页面获取数据，并进行处理
   * @returns {Promise<Object>} - 包含处理后的语音、流量和余额信息的对象
   */
  const makeReq = async (url) => {
    const request = new Request(url);
    request.method = 'GET';
    request.headers = {
      Cookie: cookie
    };
    return await request.loadJSON();
  };
  
  const fetchVoice = async () => {
    const package = await getCacheString('package_detail.json', 'https://e.189.cn/store/user/package_detail.do?t=189Bill');
    const { items, total, balance, voiceAmount, voiceBalance } = package
    if (!voiceAmount) {
      return { voiceAmount: '1', voiceBalance: '0', voice: '0' };
    } else {
      return { items, total, balance, voiceAmount, voiceBalance, voice: (voiceBalance / voiceAmount * 100).toPrecision(3) };
    }
  };

  const { items, total, balance, voiceAmount, voiceBalance, voice } = await fetchVoice();
  
  // 获取流量
  let pacArr = [];
  for (let i in items) {
    pacArr.push(...items[i].items);
  };

  const filteredItems = pacArr.filter(item => {
    const { ratableAmount: amount, ratableResourcename: name } = item
    return name.includes('流量') && !name.includes('定向') && amount !== '999999999999';
  });
    
  const calculateFlowTotals = (filteredItems, total, balance) => {
    const newArr = filteredItems.map(item => item.ratableAmount);
    const balArr = filteredItems.map(item => item.balanceAmount);
  
    return {
      flowTotal: newArr.length > 0 ? newArr.reduce((acc, val) => acc + Number(val)) / 1048576 : total / 1048576,
      bal: newArr.length > 0 ? balArr.reduce((acc, val) => acc + Number(val)) / 1048576 : balance / 1048576
    }
  };
  
  const { flowTotal, bal } = calculateFlowTotals(filteredItems, total, balance);
  
  const flowBalance = bal.toFixed(2);
  const flow = (bal / flowTotal * 100).toPrecision(3);
  
  // 获取余额
  const balances = await getCacheString('balance_new.json', 'https://e.189.cn/store/user/balance_new.do?t=189Bill');
  const balanceAvailable = (balances.totalBalanceAvailable / 100).toFixed(2);
  
  /**
   * Get dayNumber
   * Daily dosage
   */
  const dayNumber = Math.floor(Date.now() / 1000 / 60 / 60 / 24);
  if (!setting.init || dayNumber !== setting.dayNumber) {
    writeSettings({ ...setting, dayNumber, flow, flowBalance, voice, voiceBalance, init: true });
    return null;
  };
  
  // Color definitions
  const logoColor = Color.dynamic(new Color('#004A8B'), new Color('#1da0f2'));
  const widgetBgColor = Color.dynamic(
  new Color("#fefefe"), new Color("#1e1e1e"));
  const stackBgColor = Color.dynamic(new Color("#dfdfdf"), new Color("#444444"));
  const barBgColor = Color.dynamic(new Color("#dfdfdf"), new Color("#cfcfcf"));
  const MainTextColor = Color.dynamic(new Color("#000000"), new Color("#ffffff"));
  const SubTextColor = Color.dynamic(new Color("#666666"), new Color("#aaaaaa"));
  
  // Small Widget Color
  const bgColor1 = Color.dynamic(new Color('#EEEEEE'), new Color('#1e1e1e'));  
  const bgColor2 = Color.dynamic(new Color('#FFFFFF'), new Color('#13233F'));
  const textColor = Color.dynamic(new Color('#484848'), new Color('#E0E0E0'));
  const barColor = Color.dynamic(new Color('#CFCFCF'), new Color('#7A7A7A'));

  const getColor = (value) => {
    const colorMap = new Map([
      [10, new Color("#D50000")],
      [20, new Color("#FFD723")],
      [40, new Color("#FFA500")],
      [50, new Color("#BE62F3")],
      [70, new Color("#0083FF")],
      [80, new Color("#44CB9C")]
    ]);
  
    for (let [threshold, color] of colorMap) {
      if (value <= threshold) {
        return color;
      }
    }
    return new Color("#3BC952");
  };
  
  const flowColor = getColor(flow);
  const voiceColor = getColor(voice);
  
  //=========> config <=========//
  const [ flow1st, flow2nd, voice1st, voice2nd ] = [ setting.flow, flow, voice, setting.voice ];

  const Step1st = 25;
  const Step2nd = 85;
  const StepFin = 100;
  const barWidth = 15;
  const barHeigth = (flow < 100 && voice < 100) ? 108 : 105;
  
  const phone = Device.screenSize().height;
  
  const df = new DateFormatter();
df.dateFormat = 'ddHHmm'
  const day1st = df.string(new Date());
  
  const image = await getCacheImage('logo.png', 'https://gitcode.net/4qiao/scriptable/raw/master/img/icon/TelecomLogo.png');
  const bgImage = await getBgImagePath();
  
  
  /**
   * Create Medium Widget
   * @param { string } string
   * @param { image } image
   */
  async function createWidget() {
    const widget = new ListWidget();
    widget.refreshAfterDate = new Date(Date.now() + 1000 * 60 * Number(setting.refresh));
    
    if (fm.fileExists(bgImage)) {
      widget.backgroundImage = await shadowImage(fm.readImage(bgImage))
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
    } else {
      widget.backgroundColor = widgetBgColor;
    }
    
    widget.setPadding(15, 15, 15, 15);
    const top = widget.addStack();
    top.layoutHorizontally();
    top.size = new Size(0, phone < 926 ? 25 : 30);
    
    const leftStack = top.addStack();
    leftStack.centerAlignContent();
    leftStack.addSpacer();
    const logoImage = 
    leftStack.addImage(image);
    logoImage.imageSize = new Size(phone < 926 ? 95 : 100, phone < 926 ? 25 : 30);
    logoImage.tintColor = logoColor
    logoImage.centerAlignImage();
    leftStack.addSpacer();
    top.addSpacer(50);
    
    const rightStack = top.addStack()
    rightStack.centerAlignContent();
    rightStack.addSpacer();
    let balanceText = rightStack.addText(balanceAvailable);
    balanceText.centerAlignText();
    balanceText.textColor = new Color(balanceColor);
    balanceText.font = new Font('Georgia-Bold', phone < 926 ? 20 : 25);
    balanceText.url = 'alipays://platformapi/startapp?appId=2021001107610820&page=pages%2Ftop-up%2Fhome%2Findex';
    rightStack.addSpacer();
    widget.addSpacer(phone < 926 ? 3 : 5)
    
    /** 
     * Stacks and Bar
     * @param { string } string
     */
    const Content = widget.addStack();
    Content.setPadding(2, 2, 2, 2);
    Content.layoutHorizontally();
    
    const Stack1 = Content.addStack();
    Stack1.layoutVertically();
    Stack1.backgroundColor = stackBgColor;
    Stack1.cornerRadius = 8;
    Stack1.addSpacer(12);
    
    const Stack1Head = Stack1.addStack();
    Stack1Head.addSpacer();
    let flowTitleText = Stack1Head.addText('剩余流量');
    flowTitleText.textColor = SubTextColor
    flowTitleText.font = Font.mediumSystemFont(12);
    Stack1Head.addSpacer();
    Stack1.addSpacer(3);
    
    const flowStack = Stack1.addStack();
    flowStack.addSpacer();
    let flowText = flowStack.addText(flowBalance + ' GB');
    flowText.textColor = MainTextColor
    flowText.font = Font.boldSystemFont(15);
    flowStack.addSpacer();
    
    const usedFlowStack = Stack1.addStack();
    usedFlowStack.addSpacer();
    if (day1st > '010000' && day1st < '010100') {
      usedFlowText = usedFlowStack.addText(`- ${(flowBalance - flowBalance).toFixed(2)}`);
    } else {
      usedFlowText = usedFlowStack.addText(`- ${(setting.flowBalance - flowBalance).toFixed(2)}`);
    }
    usedFlowText.textColor  = SubTextColor;
    usedFlowText.font = Font.systemFont(12);
    usedFlowStack.addSpacer();
    Stack1.addSpacer(5);
    
    const Stack1Percent = Stack1.addStack();
    Stack1Percent.layoutHorizontally();
    Stack1Percent.centerAlignContent();
    Stack1Percent.addSpacer();
    let percentText1 = Stack1Percent.addText(flow);
    percentText1.textColor = MainTextColor
    percentText1.font = Font.boldSystemFont(28);
    percentSymbol1 = Stack1Percent.addText(' %');
    percentSymbol1.textColor = SubTextColor
    percentSymbol1.font = Font.systemFont(20);
    Stack1Percent.addSpacer();
    Stack1.addSpacer();
    Content.addSpacer();
    
    // Progress bar 1
    const BarContent1 = Content.addStack();
    BarContent1.layoutVertically();
    const progressBar1st = BarContent1.addImage(creatProgress(flow2nd, flow1st));
    progressBar1st.cornerRadius = 5.5
    progressBar1st.imageSize = new Size(barWidth, barHeigth);
    Content.addSpacer();
   
    // Progress bar 2
    const BarContent2 = Content.addStack();
    BarContent2.layoutVertically();
    const progressBar2nd = BarContent2.addImage(creatProgress(voice1st, voice2nd));
    progressBar2nd.cornerRadius = 5.5
    progressBar2nd.imageSize = new Size(barWidth, barHeigth);
    Content.addSpacer();
    
    const Stack2 = Content.addStack();
    Stack2.layoutVertically();
    Stack2.backgroundColor = stackBgColor
    Stack2.cornerRadius = 8;
    Stack2.addSpacer(12);
    
    const Stack2Head = Stack2.addStack();
    Stack2Head.addSpacer();
    let voiceTitleText = Stack2Head.addText('剩余语音');
    voiceTitleText.textColor = SubTextColor
    voiceTitleText.font = Font.mediumSystemFont(12);
    Stack2Head.addSpacer();
    Stack2.addSpacer(3);
     
    const voiceStack = Stack2.addStack();
    voiceStack.addSpacer();
    let voiceText = voiceStack.addText(voiceBalance + ' Min');
    voiceText.textColor = MainTextColor
    voiceText.font = Font.boldSystemFont(15);
    voiceStack.addSpacer();
    
    const voiceUsedStack = Stack2.addStack();
    voiceUsedStack.addSpacer();
    if (day1st > '010000' && day1st < '010030') {
      voiceUsedText = voiceUsedStack.addText(`- ${voiceBalance - voiceBalance}`);
    } else {
      voiceUsedText = voiceUsedStack.addText(`- ${setting.voiceBalance - voiceBalance}`);
    }
    voiceUsedText.textColor  = SubTextColor
    voiceUsedText.font = Font.systemFont(12);
    voiceUsedStack.addSpacer();
    Stack2.addSpacer(5);
    
    const Stack2Percent = Stack2.addStack();
    Stack2Percent.layoutHorizontally();
    Stack2Percent.centerAlignContent();
    Stack2Percent.addSpacer();
    
    let percentText2 = Stack2Percent.addText(voice);
    percentText2.textColor = MainTextColor;
    percentText2.font = Font.boldSystemFont(28);
    percentSymbol2 = Stack2Percent.addText(' %');
    percentSymbol2.textColor = SubTextColor
    percentSymbol2.font = Font.systemFont(20);
    Stack2Percent.addSpacer();
    Stack2.addSpacer();
    
    if (!config.runsInWidget) {  
      await widget.presentMedium();
    } else {
      Script.setWidget(widget);
      Script.complete();
    }
  };
    
  // Create Progress BarValue
  function creatProgress(barValue1, barValue2) {
    barValue1 = Math.round(barValue1);
    barValue2 = Math.round(barValue2);
    const context = new DrawContext();
    context.size = new Size(barWidth, barHeigth);
    context.opaque = false
    context.respectScreenScale = true
   // background
    const path = new Path();
    path.addRoundedRect(new Rect(0, 0, barWidth, barHeigth), 4, 4);
    context.addPath(path);
    context.setFillColor(barBgColor);
    context.fillPath();
    
    // BarValue1 Color
    if (barValue1 <= Step1st) { BarColor1 = new Color("#bb1e10") }
    
    if (barValue2 <= Step1st) {BarColor2 = new Color("#bb1e1075")}
   
    if (barValue1 >= Step1st && barValue1 < Step2nd) { BarColor1 = new Color("#f7b500") } 
    else if (barValue1 >= Step2nd) { BarColor1 = new Color("#00b347") }
    
    // BarValue2 Color
    if (barValue2 >= Step1st && barValue2 < Step2nd) { BarColor2 = new Color("#f7b50075") }
    else if (barValue2 >= Step2nd) {BarColor2 = new Color("#00b34775")}
    
    // BarValue1
    context.setFillColor(BarColor1);
    const path1 = new Path();
    const path1BarHeigth = (barHeigth * (barValue1 / StepFin) > barHeigth) ? barHeigth : barHeigth * (barValue1 / StepFin);
    path1.addRoundedRect(new Rect(0, barHeigth, barWidth, -path1BarHeigth), 2, 2);
    context.addPath(path1);
    context.fillPath();
    
    // BarValue2
    context.setFillColor(BarColor2);
    const path2 = new Path();
    const path2BarHeigth = (barHeigth * (barValue2 / StepFin) > barHeigth) ? barHeigth : barHeigth * (barValue2 / StepFin);
    path2.addRoundedRect(new Rect(0, barHeigth, barWidth, -path2BarHeigth), 2, 2);
    context.addPath(path2);
    context.fillPath();
    context.setFont(
      Font.boldSystemFont(8)
    );
    context.setTextAlignedCenter();
    
    if (barValue1 < 90) {
      context.setTextColor(  
        new Color("#666666")
      );
      context.drawTextInRect('%', new Rect(0, 3, barWidth, barHeigth));
    } else {
      context.setTextColor(
        Color.white()
      );
      context.drawTextInRect('%', new Rect(0, barHeigth - 15, barWidth, barHeigth));
    }
    
    if (barValue1 <= 10) {
      PosCorr = -10
      context.setTextColor(
        Color.black()
      );
    } else {
      PosCorr = 2
      context.setTextColor(
        Color.white()
      );
    }
    
    context.drawTextInRect(
      barValue1.toString(),
      new Rect(0, barHeigth - path1BarHeigth + PosCorr, barWidth, path1BarHeigth - PosCorr)
    );
    return context.getImage();
  };
  
  /**
   * Create Small Widget
   * @param { string } string
   * @param { image } image
   */
  const createSmallWidget = async () => {
    const widget = new ListWidget();
    widget.setPadding(0, 0, -6, 0);
    
    if (fm.fileExists(bgImage)) {
      widget.backgroundImage = await shadowImage(fm.readImage(bgImage))
    } else {
      widget.backgroundColor = widgetBgColor;
    }
    
    widget.url = 'alipays://platformapi/startapp?appId=2021001107610820&page=pages%2Ftop-up%2Fhome%2Findex'

    const width = 130
    const height = 8
    const radius = height / 2
    
    const logoImage = 
    widget.addImage(image);
    logoImage.imageSize = new Size(130, 35);
    logoImage.tintColor = logoColor
    logoImage.centerAlignImage();
    
    const balText = widget.addText('' + balanceAvailable);  
    balText.textColor = Color.orange();
    balText.font = new Font("Georgia-Bold", 22);
    balText.centerAlignText();
    widget.addSpacer(3);
    
    getwidget(voiceAmount, voiceBalance, `剩余语音 ${voiceBalance} 分钟`, voiceColor);
    getwidget(flowTotal, bal, `剩余流量 ${flowBalance} GB`, flowColor);
    
    function getwidget(flowTotal, haveGone, str, progressColor) {
      const titlew = widget.addText(str);
      titlew.centerAlignText();
      titlew.textColor = fm.fileExists(bgImage) ? Color.white() : textColor
      titlew.font = Font.boldSystemFont(13);
      widget.addSpacer(3);
      
      const imgw = widget.addImage(creatProgress(flowTotal, haveGone, progressColor));
      imgw.centerAlignImage();
      //imgw.cornerRadius = 5.2
      imgw.imageSize = new Size(width, height);
      widget.addSpacer(5);
    };
    
    function creatProgress(flowTotal, haveGone, progressColor) {
      const context = new DrawContext();
      context.size = new Size(width, height);
      context.opaque = false
      context.respectScreenScale = true
      context.setFillColor(barColor);
      
      const path = new Path();
      path.addRoundedRect(new Rect(0, 0, width, height), radius, radius);
      context.addPath(path);
      context.fillPath();
      context.setFillColor(
        progressColor
      );
      
      const path1 = new Path();
      path1.addRoundedRect(new Rect(0, 0, width * haveGone / flowTotal, height), radius, radius);
      context.addPath(path1);
      context.fillPath();
      return context.getImage();
    };
    return widget;
  };
  
  async function shadowImage(img) {
    let ctx = new DrawContext();
    ctx.size = img.size
    ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']));
    ctx.setFillColor(new Color("#000000", Number(setting.masking)));
    ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']));
    return await ctx.getImage();
  };
  
  /*
   * Name: MyWidget
   * Author: John Smith
   * Date: 2022/11/11
   * Version: 1.1
   * Description: This is a widget that displays some information.
   */
  const runWidget = async () => {
    const isSmallWidget =  config.widgetFamily === 'small'
    if (config.runsInWidget && isSmallWidget) {
      const widget = await createSmallWidget();
      Script.setWidget(widget);
      Script.complete();
    } else {
      await createWidget();
    }
  }
  await runWidget();
}
module.exports = { main }