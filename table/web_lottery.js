// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: bowling-ball;
/**
 * 小组件作者: 95度茅台
 * Version 1.0.0
 * 2023-09-13
 * 全国彩票开奖结果
 */


async function main() {
  const fm = FileManager.local();
  const mainPath = fm.joinPath(fm.documentsDirectory(), '95du_lottery');
  const cache = fm.joinPath(mainPath, 'cache_data');
  if (!fm.fileExists(cache)) {
    fm.createDirectory(cache);
  };
  
  const cacheFile =  fm.joinPath(mainPath, 'setting.json');
  
  /**
   * 读取储存的设置
   * @returns {object} - 设置对象
   */
  const getBotSettings = (file) => {
    if (fm.fileExists(file)) {
      return JSON.parse(fm.readString(file));
    }
    return null;
  };
  const setting = await getBotSettings(cacheFile);
  
  // 在桌面小组件添加Parameter参数
  const param = args.widgetParameter;
  const _lotteryType = { 
    ssq: 0, dlt: 1, kl8: 2, pl3: 3, fc3d: 4, qxc: 5, qlc: 6, pl5: 7
  }

  /**
   * 写入读取json字符串并使用缓存
   * @param {string} File Extension
   * @param {Image} Basr64 
   * @returns {string} - Request
   */
  const useFileManager = ( cacheTime ) => {
    return {
      readString: (fileName) => {
        const filePath = fm.joinPath(cache, fileName);
        if (fm.fileExists(filePath) && cacheTime < 20 && setting.useCache && !config.runsInApp) {
          return fm.readString(filePath);
        }
        return null;
      },
      writeString: (fileName, content) => fm.writeString(fm.joinPath(cache, fileName), content),
      // cache Image
      readImage: (fileName) => {
        const imgPath = fm.joinPath(cache, fileName);
        return fm.fileExists(imgPath) ? fm.readImage(imgPath) : null;
      },
      writeImage: (fileName, image) => fm.writeImage(fm.joinPath(cache, fileName), image)
    }
  };

  /**
   * 获取json字符串
   * @param {string} json
   */
  const getString = async (url) => {
    try {
      const { data } = await new Request(url).loadJSON();
      if (param !== null && typeof _lotteryType[param] === 'number') {
        return data[_lotteryType[param]];  
      }
      data.splice(2, 1);
      return data[Number(setting.agentShortName)];
    } catch (e) {
      console.log(e);
      return null;
    }
  };
  
  const getCacheString = async (jsonFileName, jsonFileUrl) => {
    const df = new DateFormatter();
    df.dateFormat = 'HH';
    const cacheTime = df.string(new Date());
    const cache = useFileManager(cacheTime);
    const jsonString = cache.readString(jsonFileName);
    if (jsonString) {
      return jsonString;
    }
    const response = await getString(jsonFileUrl);
    cache.writeString(jsonFileName, JSON.stringify(response));
    return JSON.stringify(response);
  };
  
  /**
   * @param {string} data - JSON data to be processed.
   * @returns {object} - string
   */
  const processData = (data) => {
    const { firstNumbers, lastNumbers = '', ...rest } = JSON.parse(data);
    const openCodeArr = [...firstNumbers.split(','), ...lastNumbers.split(',').filter(num => num !== '')];
    return { openCodeArr, ...rest };
  };
  
  const macaujc = await 
getCacheString('macaujc.json', 'https://m.zhuying.com/api/lotapi/indexV2/1');
  const { openCodeArr, openTime, lastNumbers, lotteryName, frequency, officeOpenTime, todayOpen, issue, lotteryType, poolAmount } = processData(macaujc);
  
  /**
   * 系统版本
   * 数字转换为开奖状态
   * 开奖状态颜色
   * lotteryType
   */ 
  const systemVersion =  Device.systemVersion().match(/\d+/)[0];
  
  const todayOpenStatus = todayOpen === 0 ? '未到时间' : todayOpen === 1 ? '今晚开奖' : '已开奖';
  
  const staColor = todayOpen === 0 ? '#666666' : todayOpen === 1 ? '#FF6800' : '#34c759';
  
  const type = lotteryType === 'qlc' ? 3.5 : lotteryType === 'pl5' || lotteryType === 'pl3' || lotteryType === 'fc3d' ? 14 : 4
  
  // 时间转换星期
  function getWeekday(dateString) {
    const daysOfWeek = [
      "周日", "周一", "周二", "周三", "周四", "周五", "周六"
    ];
    const date = new Date(dateString);
    return daysOfWeek[date.getDay()];
  };
  const dayOfWeek = getWeekday(openTime.split(" ")[0]);
  
  // 转换亿万单位
  function formatAmount(original) {
    const amount = parseFloat(original);
    if (amount >= 100000000) {
      return (amount / 100000000).toFixed(2) + ' 亿';
    } else if (amount >= 10000) {
      return (amount / 10000).toFixed(1) + ' 万';
    }
    return '未知数额';
  };
  
  /**
   * @param {string[]} arr
   * @param {number} num
   * @returns {string[]}
   */ 
  const getRandomValues = (arr, num) => {
    return [...arr].sort(() => Math.random() - 0.5).slice(0, num);
  };
  
  const colorHex = {
    green: '#34C759',
    blue: '#0061FF',
    red: '#FF0000',
    orange: '#FF6800',
    purple: '#9D64FF',
    yellow: '#FFA300',
    skyBlue: '#0096FF',
    pink: '#FF79FF'
  };
  
  const colorArr = ['blue', 'orange', 'red', 'green', 'purple', 'skyBlue', 'yellow', 'pink'];
  const randomValues = getRandomValues(colorArr, 8);
  
  const colorCode = randomValues.map((name) => { return colorHex[name] });
  
 /**  
  * 弹出一个通知
  * @param {string} title
  * @param {string} body
  * @param {string} url
  * @param {string} sound
  */
  const notify = async (title, body, url, opts = {}) => {
    const n = Object.assign(new Notification(), { title, body, sound: 'piano_success', ...opts });
    if (url) n.openURL = url;
    return await n.schedule();
  };
  
  const widgetBgColor = Color.dynamic(
    new Color("#fefefe"),
    new Color("#1e1e1e")
  );
  
  const contextColor = Color.dynamic(
    new Color('#48484b', 0.3),
    new Color('#FFFFFF', 0.3)
  );
  
  const isSmallScreen = Device.screenSize().height < 926;
  const adapt = {
    top: isSmallScreen ? 8 : 12,
    middle: isSmallScreen ? 5 : 8,
    padding: isSmallScreen ? 0 : 5,
    font: lotteryType === 'qlc' ? 18 : 20,
    size: isSmallScreen ? (lotteryType === 'qlc' ? 32 : 38) : (lotteryType === 'qlc' ? 35 : 40),
  };
  
  /**
   * 获取网络图片
   * @param {Image} url
   */
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
    const img = await getImage(url);
    cache.writeImage(name, img);
    return img;
  };
  
  
  //=========> Create <=========//
  const createWidget = async () => {
    const widget = new ListWidget();
    widget.backgroundColor = widgetBgColor;
    
    widget.backgroundImage = await getCacheImage('logo.png', 'https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/baiTiaoBg2.png');
    
    /**
     * @param {number} padding
     * @returns {WidgetStack} 
     */
    widget.setPadding(10, adapt.padding, 10, adapt.padding);
    const titleStack = widget.addStack();
    titleStack.layoutHorizontally();
    titleStack.centerAlignContent();
    titleStack.addSpacer();
    
    const titleText = titleStack.addText(`[  ${lotteryName}  ]`);
    titleText.centerAlignText();
    titleText.font = Font.boldSystemFont(18);
    titleStack.addSpacer();
    
    const expectText1 = titleStack.addText('第 ');
    expectText1.font = Font.mediumSystemFont(16);
    
    const expectText2 = titleStack.addText(issue.substring(4));
    expectText2.font = Font.mediumSystemFont(16);
    expectText2.textColor = Color.red();
    
    const expectText3 = titleStack.addText(' 期');
    expectText3.font = Font.mediumSystemFont(16);
    titleStack.addSpacer(6);
    
    const dateText = titleStack.addText(openTime.split(" ")[0]);
    dateText.font = Font.mediumSystemFont(16);
    dateText.textOpacity = 0.5;
    titleStack.addSpacer(6);
    
    const weekText = titleStack.addText(dayOfWeek);
    weekText.font = Font.mediumSystemFont(15);
    weekText.textOpacity = 0.5;
    
    titleStack.addSpacer();
    widget.addSpacer(adapt.top);
    
    // openCodeArr
    const mainStack1 = widget.addStack();
    mainStack1.layoutHorizontally();
    mainStack1.addSpacer();
  
    const codeStack = mainStack1.addStack();
    codeStack.layoutHorizontally();
    codeStack.centerAlignContent();
    mainStack1.addSpacer();
    widget.addSpacer(8);
    
    for (let i = 0; i < openCodeArr.length; i++) {
      const item = openCodeArr[i];
      codeStack.addSpacer(type);
      
      const barStack = codeStack.addStack();
      barStack.layoutHorizontally();
      barStack.centerAlignContent();
      barStack.size = new Size(adapt.size, lotteryType === 'qlc' ? 35 : 40);
      
      barStack.backgroundColor = new Color(colorCode[i]);
      barStack.cornerRadius = systemVersion === '14' ? setting.radius : 50;
     
      const openCodeText = barStack.addText(item);
      openCodeText.font = Font.mediumSystemFont(adapt.font);
      openCodeText.textColor = Color.white();
      codeStack.addSpacer(type);
    };
    
    // 绘制分割线
    widget.addSpacer(adapt.middle);
    const context = new DrawContext()
    context.size = new Size(150, 0.5);
    context.opaque = false;
    context.respectScreenScale = true;
    context.setFillColor(contextColor);
    const path = new Path();
    path.addRoundedRect(new Rect(0, 0, 150, 0.3), 3, 2);
    context.addPath(path);
    context.fillPath();
    context.setFillColor(contextColor);
    const drawLine = widget.addImage(context.getImage());
    drawLine.centerAlignImage();
    widget.addSpacer(18);
    
    // 奖池 开奖日期等
    const botStack = widget.addStack();
    botStack.layoutHorizontally();
    botStack.centerAlignContent();
    botStack.addSpacer();
  
    const bottomText = botStack.addText('奖池 ');
    bottomText.font = Font.mediumSystemFont(15);
    bottomText.textOpacity = 0.5;
    botStack.addSpacer(1);
    
    const bottomText1 = botStack.addText(formatAmount(poolAmount));
    bottomText1.font = Font.mediumSystemFont(15);
    bottomText1.textColor = Color.red();
    bottomText1.textOpacity = 0.7;
    botStack.addSpacer();
    
    const bottomText2 = botStack.addText(frequency);
    bottomText2.font = Font.mediumSystemFont(15);
    bottomText2.textOpacity = 0.5;
    botStack.addSpacer(5);
    
    const bottomText3 = botStack.addText(officeOpenTime.match(/\d+:\d+/)[0]);
    bottomText3.font = Font.mediumSystemFont(15);
    bottomText3.textOpacity = 0.5;
    botStack.addSpacer();
    
    // 开奖状态
    const barStack = botStack.addStack();
    barStack.setPadding(3, 8, 3, 8);
    barStack.layoutHorizontally();
    barStack.centerAlignContent();
    
    barStack.backgroundColor = new Color(staColor);
    barStack.cornerRadius = 8;
     
    const openCodeText = barStack.addText(todayOpenStatus);
    openCodeText.font = Font.mediumSystemFont(14);
    openCodeText.textColor = Color.white();
    botStack.addSpacer();
    
    if (config.runsInApp) {
      await widget.presentMedium();
    } else {
      Script.setWidget(widget);
      Script.complete();
    };
    return widget;
  };
  
  //=========> Create <=========//
  const errorWidget = async () => {
    const widget = new ListWidget();
    const text = widget.addText('仅支持中尺寸');
    text.font = Font.systemFont(17);
    text.centerAlignText();
    Script.setWidget(widget);
  };
  
  const runWidget = async () => {
    await (config.runsInApp || config.widgetFamily === 'medium' ? createWidget() : errorWidget());
  }
  await runWidget();
}
module.exports = { main }