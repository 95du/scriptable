// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: comments;
/**
 * 组件作者：95度茅台
 * Version 1.3.0
 * 2023-11-17 15:30
 * Telegram 交流群 https://t.me/+ CpAbO_q_SGo2ZWE1
 * ⚠️ 小机型修改第 20 行中的数字 63
 * 修改第 21 行的数字小于 5 可切换为二十四节气，否则脚本将自动切换。
 */

const fm = FileManager.local();
const path = fm.joinPath(fm.documentsDirectory(), "bottomBar");
if (!fm.fileExists(path)) fm.createDirectory(path);
const cacheFile = fm.joinPath(path, 'setting.json');

const timeStamp = Date.now();
const df = new DateFormatter();
df.dateFormat = 'HH:mm';
const GMT = df.string(new Date());

const stackSize = 63 // 容器尺寸
const length = 2
const stackBackground = Color.dynamic(
  new Color('#EFEBE9', 0.6), 
  new Color('#161D2A', 0.5)
);

/**
 * 获取背景图片存储目录路径
 * @returns {image} - image
 */
const getBgImagePath = () => {
  const bgImgPath = fm.joinPath(fm.documentsDirectory(), '95duBackground');
  return fm.joinPath(bgImgPath, Script.name() + '.jpg');
};

/**
 * 存储当前设置
 * @param { JSON } string
 */
const setCacheData = (data) => {
  fm.writeString(cacheFile, JSON.stringify({ ...data, updateTime: timeStamp }, null, 2));
  console.log(JSON.stringify(
    data, null, 2
  ))
};

const getCacheData = () => {
  if (fm.fileExists(cacheFile)) {
    const data = fm.readString(cacheFile);
    return JSON.parse(data);
  }
};

/**
 * 获取指定位置的天气信息
 * @param {Object} opts
 *  - {Object} location
 *  - {String} url
 * @returns {Object} 
 */
const getLocation = async () => {
  const cacheData = getCacheData();
  if (cacheData) {
    const pushTime = timeStamp - cacheData.updateTime;
    const duration = pushTime % (24 * 3600 * 1000);
    const intervalTime = Math.floor(duration / (3600 * 1000));
    if (intervalTime <= 3) {
      return cacheData;
    } else {
      try {
        const location = await Location.current();
        const { title, content } = await getWeather({ location });
        setCacheData({ ...location, title, content });
        return location;
      } catch (error) {
        return cacheData;
      }
    }
  } else {
    const location = await Location.current();
    setCacheData(location);
    return location;
  }
};

/**
 * 获取天气信息
 * @param  {Type} paramName
 */
const getWeather = async ({ location } = opts) => {
  try {
    const convert = await getJson(atob('aHR0cHM6Ly9yZXN0YXBpLmFtYXAuY29tL3YzL2Fzc2lzdGFudC9jb29yZGluYXRlL2NvbnZlcnQ/Y29vcmRzeXM9Z3BzJm91dHB1dD1qc29uJmtleT1hMzVhOTUzODQzM2ExODM3MThjZTk3MzM4MjAxMmY1NSZsb2NhdGlvbnM9') + `${location.longitude},${location.latitude}`);
    const coordinates = convert.locations.split(",");
    const request = new Request(atob('aHR0cHM6Ly9zc2ZjLmFwaS5tb2ppLmNvbS9zZmMvanNvbi9ub3djYXN0'));
    request.method = 'POST'
    request.body = JSON.stringify({
      common: {
        platform: 'iPhone',
        language: 'CN'
      }, 
      params: {
        lat: coordinates[1],
        lon: coordinates[0]
      }
    });
    const { radarData } = await request.loadJSON();  
    return radarData;
  } catch (e) {
    console.log(e + '⚠️使用缓存');
    return getCacheData();
  }
};

/**
 * 获取图片、string并使用缓存
 * @param {string} File Extension
 * @returns {image} - Request
 */
const useFileManager = ({ cacheTime } = {}) => {
  const cache = fm.joinPath(path, 'cache_path');
  if (!fm.fileExists(cache)) fm.createDirectory(cache);

  return {
    readString: (name) => {
      const filePath = fm.joinPath(cache, name);  
      const fileExists =  fm.fileExists(filePath);
      if (fileExists && hasExpired(filePath) > cacheTime) {
        fm.remove(filePath);
        return null;
      }
      return fm.fileExists(filePath) ? fm.readString(filePath) : null;
    },
    writeString: (name, content) => fm.writeString(fm.joinPath(cache, name), content),
    // cache image
    readImage: (name) => {
      const filePath = fm.joinPath(cache, name);
      const fileExists =  fm.fileExists(filePath);
      if (fileExists && hasExpired(filePath) > cacheTime) {
        fm.remove(filePath);
        return null;
      }
      return fm.fileExists(filePath) ? fm.readImage(filePath) : null;
    },
    writeImage: (name, image) => fm.writeImage(fm.joinPath(cache, name), image),
  };
    
  function hasExpired(filePath) {
    const createTime = fm.creationDate(filePath).getTime();
    return (Date.now() - createTime) / (60 * 60 * 1000)
  }
};

/**
 * 获取 GET POST JSON String 字符串
 * @param {string} name url
 * @returns {string} - String
 * @returns {object} - JSON
 */
const getString = async (url) => await new Request(url).loadString();

const getCacheString = async (strName, strUrl) => {
  const cache = useFileManager({ cacheTime: 48 });
  const string = cache.readString(strName);
  if (string) return string;
  const response = await getString(strUrl);
  cache.writeString(strName, response);
  return response;
};

// 
const getJson = async (url) => await new Request(url).loadJSON();

const getCacheJson = async (jsonName, jsonUrl) => {
  const cache = useFileManager({ cacheTime: 12 });
  const jsonString = cache.readString(jsonName);
  if (jsonString) {
    return JSON.parse(jsonString);
  }
  const response = await getJson(jsonUrl);
  const jsonFile = JSON.stringify(response);
  if ( jsonFile ) {
    cache.writeString(jsonName, jsonFile);
  }
  return JSON.parse(jsonFile);
};

// 获取图片，使用缓存
const getImage = async (url) => await new Request(url).loadImage();

const getCacheImage = async (name, url) => {
  const cache = useFileManager({ cacheTime: 240 });
  const image = cache.readImage(name);
  if (image) return image;
  const img = await getImage(url);
  cache.writeImage(name, img);
  return img;
};

/**
 * 获取随机图标
 * @returns {string} url
 */
const getIcon = async () => {
  const images = [
    'https://gitcode.net/4qiao/scriptable/raw/master/img/icon/weChat.png',
    'https://gitcode.net/4qiao/scriptable/raw/master/img/icon/weather.png'
  ]
  const appIconUrl = images[Math.floor(Math.random() * images.length)];
  const iconName = decodeURIComponent(appIconUrl.substring(appIconUrl.lastIndexOf("/") + 1));  
  return await getCacheImage(iconName, appIconUrl);
};

/**
 * 获取每日一句中英文及配图
 * @returns {Object} string
 */
const getOneWord = async () => {
  const { fenxiang_img, note, content } = await getCacheJson('ciba.json', atob('aHR0cHM6Ly9vcGVuLmljaWJhLmNvbS9kc2FwaQ=='));
  return { 
    note: `${note}\n${content}`,
    _note: note,
    imgUrl: fenxiang_img
  }
};

/**
 * 获取接下来的节气信息及距离当前日期的天数
 * @returns {Promise<Array>} object
 */
const getSolarTerm = async () => {
  const html = await getCacheString('jieqi.html', 'http://jieqi.xuenb.com');
  const webView = new WebView();
  await webView.loadHTML(html);

  const solarTermData = await webView.evaluateJavaScript(`
    (() => {
      const dnumberElements = Array.from(document.querySelectorAll('.dnumber'));
      const groups = [];

      for (let i = 0; i < dnumberElements.length; i += 5) {
        const solarTerm = dnumberElements[i + 1].textContent.trim();
        const dateStr = dnumberElements[i + 2].textContent.trim();
        const date = new Date(dateStr);

        if (date >= new Date()) {
          const daysUntil = Math.floor((date - new Date()) / (1000 * 60 * 60 * 24));
          const formattedDate = date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
          const dayOfWeek = date.toLocaleDateString('zh-CN', { weekday: 'short' });

          groups.push({ solarTerm, date: dateStr, daysUntil, dayOfWeek, formattedDate });
        }
      }
      return groups.slice(0, 2);
    })();
  `);
  return solarTermData;
};
const result = await getSolarTerm();

/**
 * Draws a circle on a canvas with an arc and text representing progress.
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<Image>}
 */
const drawArc = async (deg, fillColor, canvas, canvSize, canvWidth) => {
  const ctr = new Point(canvSize / 2, canvSize / 2);

  canvas.setFillColor(fillColor);
  canvas.setStrokeColor(
    Color.dynamic(new Color('#3F8BFF', 0.2), new Color('#FFFFFF', 0.2))
  );
  canvas.setLineWidth(canvWidth);
  
  const canvRadius = 70
  const ellipseRect = new Rect(ctr.x - canvRadius, ctr.y - canvRadius, 2 * canvRadius, 2 * canvRadius);
  canvas.strokeEllipse(ellipseRect);

  for (let t = 0; t < deg; t++) {
    const x = ctr.x + canvRadius * Math.sin((t * Math.PI) / 180) - canvWidth / 2;
    const y = ctr.y - canvRadius * Math.cos((t * Math.PI) / 180) - canvWidth / 2;
    const rect = new Rect(x, y, canvWidth, canvWidth);
    canvas.fillEllipse(rect);
  }
};

const drawCircle = async () => {
  const canvas = new DrawContext();  
  canvas.opaque = false;
  canvas.respectScreenScale = true;
  
  const canvSize = 200
  const canvWidth = 19
  canvas.size = new Size(canvSize, canvSize);

  const progressColor = Color.dynamic(new Color('#3F8BFF'), new Color('#FFFFFF'))
  const { daysUntil } = result[0];
  const progress = daysUntil >= 10 ? 10 : daysUntil;

  drawArc(Math.floor(progress / 10 * 360), progressColor, canvas, canvSize, canvWidth);
  
  const canvTextSize = 45
  const canvTextRect = new Rect(0, 100 - canvTextSize / 2, canvSize, canvTextSize);
  canvas.setTextAlignedCenter();
  canvas.setTextColor(progressColor);
  canvas.setFont(Font.boldSystemFont(canvTextSize));
  canvas.drawTextInRect(
    daysUntil.toString(),
    canvTextRect
  );
  return canvas.getImage();
};

/**
 * 创建组件
 * @param {object} options
 * @param {string} string
 * @param {image} image
 */
const createWidget = async () => {
  const { title, content } = await getWeather({ location: await getLocation() });
  const { note, _note, imgUrl } = await getOneWord();
  
  const widget = new ListWidget();
  const bgImage = await getBgImagePath();
  if (fm.fileExists(bgImage)) {
    widget.backgroundImage = fm.readImage(bgImage);
  } else {
    widget.backgroundImage = await getCacheImage('default.jpeg', 'https://sweixinfile.hisense.com/media/M00/7D/EB/Ch4FyGVQ2PiAOtEMAAYfX67522s266.png');
  }
  
  widget.setPadding(0, 0, 0, 0);
  const weatherStack = widget.addStack();
  weatherStack.layoutHorizontally();
  weatherStack.centerAlignContent();
  weatherStack.backgroundColor = stackBackground;
  weatherStack.setPadding(15, 15, 15, 17);
  weatherStack.cornerRadius = 23;
  weatherStack.size = new Size(0, stackSize);
  
  const imageElement = weatherStack.addImage(await getIcon());
  imageElement.imageSize = new Size(38, 38);
  imageElement.url = 'https://html5.moji.com/tpd/mojiweatheraggr/index.html#/home'
  weatherStack.addSpacer(10);
  
  // Two Hours Weather
  const twoHoursStack = weatherStack.addStack();
  twoHoursStack.layoutVertically();
  twoHoursStack.centerAlignContent();
  
  const statusStack = twoHoursStack.addStack();
  statusStack.layoutHorizontally();
  const weatherText = statusStack.addText(title);
  weatherText.font = Font.boldSystemFont(14);
  weatherText.textOpacity = 0.9;
  statusStack.addSpacer();
  
  const statusText = statusStack.addText(GMT);
  statusText.font = Font.mediumSystemFont(15);
  statusText.textOpacity = 0.45;
  twoHoursStack.addSpacer(2);
  
  const contentText = twoHoursStack.addText(content);
  contentText.font = Font.mediumSystemFont(13.5);
  contentText.textOpacity = 0.82;
  widget.addSpacer();
  
  /** 
  * Bottom Content
  * @param {object} options
  * @param {string} string
  */
  const butStack = widget.addStack();
  butStack.layoutHorizontally();
  butStack.centerAlignContent();
  butStack.addSpacer();
  butStack.backgroundColor = stackBackground;
  butStack.setPadding(5, 15, 5, 5);
  butStack.cornerRadius = 23;
  butStack.size = new Size(0, 80);
  
  if (_note.length >= length) {
    const solarTermStack = butStack.addStack();
    solarTermStack.layoutVertically()
    
    for (const item of result) {
      solarTermStack.addSpacer(2.5);
      const { solarTerm, dayOfWeek, daysUntil } = item;
      const [ month, day ] = item.formattedDate.match(/\d+/g);  
      const date = `${month.padStart(2, '0')}月${day.padStart(2, "0")}日`;
      const days = daysUntil === 0 ? '明天 ㊗️' : `还有 ${daysUntil} 天`;
      
      const textElement = solarTermStack.addText(`${solarTerm} - ${date} ${dayOfWeek}，${days}`);
      textElement.font = Font.mediumSystemFont(14);
      textElement.textOpacity = 0.85
      textElement.url = imgUrl;
      solarTermStack.addSpacer(2.5);
    }
    
    butStack.addSpacer();
    const circle = await drawCircle();
    butStack.addImage(circle);
  } else {
    const textElement = butStack.addText(note);
    textElement.font = Font.mediumSystemFont(14);
    textElement.textOpacity = 0.8;
    textElement.url = imgUrl;
  };
  butStack.addSpacer();
  
  if (config.runsInApp) {
    await widget.presentMedium();
  } else {
    Script.setWidget(widget);
    Script.complete();
  };
  return widget;
};

async function createErrorWidget() {
  const widget = new ListWidget();
  const text = widget.addText('仅支持中尺寸');
  text.font = Font.systemFont(17);
  text.centerAlignText();
  Script.setWidget(widget);
};

const downloadModule = async (scriptName, url) => {
  const modulePath = fm.joinPath(path, scriptName);
  if (fm.fileExists(modulePath)) {
    return modulePath;
  } else {
    const req = new Request(atob(url));
    const moduleJs = await req.load().catch(() => {
      return null;
    });
    if (moduleJs) {
      fm.write(modulePath, moduleJs);
      return modulePath;
    }
  }
};

const runScriptable = () => {
  Safari.open('scriptable:///run/' + encodeURIComponent(Script.name()));
};

const presentMenu = async() => {
  const alert = new Alert();
  alert.message = "\n【 iOS 16 负一屏底栏 】\n高仿iOS通知信息样式，内容显示未来两小时天气，\n底部每日一句中英文或二十四节气";
  const actions = ['95度茅台', '更新代码', '重置所有', '透明背景', '预览组件'];

  actions.forEach(( action, index ) => {
    alert[ index === 1 || index === 2 
      ? 'addDestructiveAction'
      : 'addAction' ](action);
  });
  alert.addCancelAction('取消');
  
  const menu = await alert.presentSheet();
  if (menu === 0) {
    await importModule(await downloadModule('store.js', 'aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvdmlwL21haW45NWR1U3RvcmUuanM=')).main();
  }
  if (menu === 1) {
    const reqUpdate = new Request(atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvYXBpL2JvdHRvbUJhci5qcw=='));
    const code = await reqUpdate.loadString();
    if (!code.includes('95度茅台')) {
      const finish = new Alert();
      finish.title = "更新失败"
      finish.addAction('OK')
      finish.presentAlert();
    } else {
      fm.writeString(
        module.filename, code
      );
      runScriptable();
    }
  }
  if (menu === 2) {
    const bgImage = await getBgImagePath();
    if (fm.fileExists(bgImage)) {
      fm.remove(bgImage);
    }
    fm.remove(path);
    runScriptable();
  }
  if (menu === 3) {
    await importModule(await downloadModule('image.js', 'aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvdmlwL21haW5UYWJsZUJhY2tncm91bmQuanM=')).main()
  }
  if (menu === 4) {
    await createWidget();
  }
};

const runWidget = async () => {  
  if (config.runsInApp) {
    await presentMenu();
  } else {
    config.widgetFamily === 'medium' ? await createWidget() : await createErrorWidget();
  }
};
await runWidget();