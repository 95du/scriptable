// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: bowling-ball;
/**
 * 组件作者: 95度茅台
 * 组件名称: 全国彩开奖结果
 * 组件版本: Version 1.0.2
 * 发布时间: 2023-09-17
 */


async function main() {
  const fm = FileManager.local();
  const mainPath = fm.joinPath(fm.documentsDirectory(), '95du_lottery');
  const cache = fm.joinPath(mainPath, 'cache_data');
  if (!fm.fileExists(cache)) {
    fm.createDirectory(cache);
  };
  
  const cacheFile =  fm.joinPath(mainPath, 'setting.json')
  
  /**
   * 存储当前设置
   * @param { JSON } string
   */
  const writeSettings = async (setting) => {
    fm.writeString(cacheFile, JSON.stringify(setting, null, 2));
    console.log(JSON.stringify(
      setting, null, 2)
    );
  };
  
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
    try {
      const { firstNumbers, lastNumbers = '', ...rest } = JSON.parse(data);
      const openCodeArr = [...firstNumbers.split(','), ...lastNumbers.split(',').filter(num => num !== '')];
      return { openCodeArr, ...rest }
    } catch (e) {
      console.log(e);
    }
  };
  
  const macaujc = await 
getCacheString('macaujc.json', 'https://m.zhuying.com/api/lotapi/indexV2/1');
  const { openCodeArr, openTime, lastNumbers, lotteryName, frequency, officeOpenTime, todayOpen, issue, lotteryType, poolAmount } = processData(macaujc);
  
  /**
   * iOS 系统版本
   * 获取跳转页面ID
   * 数字转换为开奖状态、颜色
   * lotteryType
   */
  const systemVersion =  Device.systemVersion().match(/\d+/)[0]; // 用于修改弧度
  
  const gameId = {
    ssq: 101, dlt: 201, pl3: 202, fc3d: 102, qxc: 204, qlc: 104, pl5: 203
  };
  
  const statusMap = {
    0: { todayOpenStatus: '未到时间', staColor: '#666666' },
    1: { todayOpenStatus: '今晚开奖', staColor: '#FF6800' },
    2: { todayOpenStatus: '已开奖', staColor: '#34c759' },
  };
  const { todayOpenStatus, staColor } = statusMap[todayOpen];
  
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
   * @returns {string[]} color
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
    cyan: '#00C4B6'
  };
  
  const colorArr = [ 'blue', 'orange', 'red', 'green', 'purple', 'skyBlue', 'yellow', 'cyan' ];
  const randomValues = getRandomValues(colorArr, 8);
  
  const colorCode = randomValues.map((name) => { 
    return colorHex[name]
  });
  
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
    
    widget.backgroundColor = Color.dynamic( new Color("#fefefe"), new Color('#111111'));
    
    widget.backgroundImage = await getCacheImage('logo.png', 'https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/baiTiaoBg2.png');
    
    /**
     * @param {number} padding
     * @returns {WidgetStack} 
     */
    widget.setPadding(10, adapt.padding, 10, adapt.padding);
    const titleStack = widget.addStack();
    titleStack.layoutHorizontally();
    titleStack.centerAlignContent();
    titleStack.setPadding(0, 2, 0, 0)
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
      barStack.cornerRadius = systemVersion >= 16 ? 50 : setting.radius;
     
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
    barStack.url = `https://m.ttzoushi.com/#/kjgg/detail;gameId=${gameId[lotteryType]}`;
    barStack.cornerRadius = 8;
     
    const openCodeText = barStack.addText(todayOpenStatus);
    openCodeText.font = Font.mediumSystemFont(14);
    openCodeText.textColor = Color.white();
    botStack.addSpacer();
    
    // 开奖结果通知
    if (setting.issue !== issue && todayOpen === 2 && param === null) {
      notify(`全国彩 [ ${lotteryName} ] 💥`, `第 ${issue.substring(4)} 期，开奖结果: ${openCodeArr.join(' ')}`);
      setting.issue = issue;
      writeSettings(setting);
    };
    
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