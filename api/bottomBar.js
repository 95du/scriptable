// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: comments;
/**
* 小组件作者：95度茅台
* Version 1.2.0
* 2023-04-24 15:30
* Telegram 交流群 https://t.me/+CpAbO_q_SGo2ZWE1
* ⚠️ 小机型修改第 19 行中的数字 63
*/

const fm = FileManager.local();
const path = fm.joinPath(fm.documentsDirectory(), "bottomBar");
fm.createDirectory(path, true);
const cacheFile = fm.joinPath(path, 'setting.json');

const timeStamp = Date.now();
const df = new DateFormatter();
df.dateFormat = 'HH:mm';
const GMT = df.string(new Date());

const stackSize = 63 // 容器尺寸

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
 * 获取指定位置的天气信息
 * @param {Object} opts
 *  - {Object} location
 *  - {String} url
 * @returns {Object} 
 */
const getLocation = async () => {
  const getCacheData = () => {
    if (!fm.fileExists(cacheFile)) return null;
    return JSON.parse(
      fm.readString(cacheFile)
    );
  };

  const setCacheData = (data) => {
    fm.writeString(cacheFile, JSON.stringify({ ...data, updateTime: timeStamp }));
  };

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
        setCacheData(location);
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
const getWeather = async (opts) => {
  convert = await getJson(atob('aHR0cHM6Ly9yZXN0YXBpLmFtYXAuY29tL3YzL2Fzc2lzdGFudC9jb29yZGluYXRlL2NvbnZlcnQ/Y29vcmRzeXM9Z3BzJm91dHB1dD1qc29uJmtleT1hMzVhOTUzODQzM2ExODM3MThjZTk3MzM4MjAxMmY1NSZsb2NhdGlvbnM9') + `${opts.location.longitude},${opts.location.latitude}`);
  const coordinates = convert.locations.split(",");
  const request = new Request(opts.url);
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
  const response = await request.loadJSON();
  return { title, content } = response.radarData;
};

/**
 * 获取图片并使用缓存
 * @param {string} File Extension
 * @returns {image} - Request
 */
const useFileManager = ( options = {} ) => {
  const cache = fm.joinPath(path, 'cache_path');
  fm.createDirectory(cache, true);
    
  return {
    readImage: (fileName) => {
      const imageFile = fm.joinPath(cache, fileName);
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
    writeImage: (fileName, image) => fm.writeImage(fm.joinPath(cache, fileName), image)
  }
};
  
const getImage = async (url) => {
  return await new Request(url).loadImage();
};
  
// 获取图片，使用缓存
const getCacheImage = async (name, url) => {
  const cache = useFileManager({ cacheTime: 1024 });
  const image = cache.readImage(name);
  if (image) {
    return image;
  }
  const img = await getImage(url);
  cache.writeImage(name, img);
  return img;
};

/**
 * 获取随机图标
 * @returns {string} url
 */
const getPicture = async () => {
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
  const oneUrl = 'https://open.iciba.com/dsapi';
  const oneJson = await getJson(oneUrl);
  return { 
    note: oneJson.note.length >= 21 ? oneJson.note : `${oneJson.note}\n${oneJson.content}`,
    imgUrl: oneJson.fenxiang_img
  }
};

/**
 * 创建小组件
 * @param {object} options
 * @param {string} string
 * @param {image} image
 */
const createWidget = async () => {
  await getWeather({
    url: 'https://ssfc.api.moji.com/sfc/json/nowcast',
    location: await getLocation()
  });
  
  const { note, imgUrl } = await getOneWord();
  
  const widget = new ListWidget();
  widget.backgroundImage = fm.readImage(getBgImagePath());
  widget.setPadding(0, 0, 0, 0);
  const eventStack = widget.addStack();
  eventStack.setPadding(15, 15, 15, 17);
  eventStack.layoutHorizontally();
  eventStack.centerAlignContent();
  eventStack.backgroundColor = stackBackground;
  eventStack.cornerRadius = 23;
  eventStack.size = new Size(0, stackSize);
  
  // WeChat icon
  const imageElement = eventStack.addImage(await getPicture());
  imageElement.imageSize = new Size(38, 38);
  imageElement.url = 'https://html5.moji.com/tpd/mojiweatheraggr/index.html#/home'
  eventStack.addSpacer(10);
  
  // Two Hours Weather
  const twoHoursStack = eventStack.addStack();
  twoHoursStack.layoutVertically();
  twoHoursStack.centerAlignContent();
  
  const statusStack = twoHoursStack.addStack();
  statusStack.layoutHorizontally();
  const weatherText = statusStack.addText(title);
  weatherText.font = Font.boldSystemFont(14);
  weatherText.textOpacity = 0.85;
  statusStack.addSpacer();
  
  const statusText = statusStack.addText(GMT);
  statusText.font = Font.mediumSystemFont(15);
  statusText.textOpacity = 0.45;
  twoHoursStack.addSpacer(2);
  
  const contentText = twoHoursStack.addText(content);
  contentText.font = Font.mediumSystemFont(13.5);
  contentText.textOpacity = 0.7;
  widget.addSpacer();
  
  /** 
  * Bottom Content
  * @param {object} options
  * @param {string} string
  */
  const oneStack = widget.addStack();
  oneStack.layoutHorizontally();
  oneStack.centerAlignContent();
  oneStack.addSpacer();
  oneStack.backgroundColor = stackBackground;
  oneStack.setPadding(10, 18, 10, 18)
  oneStack.cornerRadius = 23;
  oneStack.size = new Size(0, 80);
  
  const textElement = oneStack.addText(note);
  textElement.font = Font.mediumSystemFont(14);
  textElement.textOpacity = 0.7;
  textElement.url = imgUrl;
  oneStack.addSpacer();
  
  if (config.runsInApp) {
    await widget.presentMedium();
  } else {
    Script.setWidget(widget);
    Script.complete();
  };
  return widget;
};

async function runScriptable() {
  Safari.open('scriptable:///run/' + encodeURIComponent(Script.name()));
};

async function getJson(url) {
  return await new Request(url).loadJSON();
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

const presentMenu = async() => {
  const alert = new Alert();
  alert.message = "\n【 iOS 16 负一屏底栏 】\n高仿微信通知信息样式，内容显示未来两小时天气，\n底部显示每日一句中英文";
  const actions = [
    '95度茅台', '更新代码', '重置所有', '透明背景', '预览组件'
  ];

  actions.forEach(( action, index ) => {
  alert[ index === 1 || index === 2 
    ? 'addDestructiveAction'
    : 'addAction' ](action);
  });
  alert.addCancelAction('取消');
  
  const mainMenu = await alert.presentSheet();
  if (mainMenu === 0) {
    await importModule(await downloadModule('store.js', 'aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvdmlwL21haW45NWR1U3RvcmUuanM=')).main();
  }
  if (mainMenu === 1) {
    const reqUpdate = new Request(atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvYXBpL2JvdHRvbUJhci5qcw=='));
    const codeString = await reqUpdate.loadString();
    const finish = new Alert();
    if (codeString.indexOf("95度茅台") == -1) {
      finish.title = "更新失败"
      finish.addAction('OK')
      await finish.presentAlert();
    } else {
      fm.writeString(  
        module.filename,
        codeString
      );
      finish.title = "更新成功"
      finish.addAction('OK')
      await finish.presentAlert();
      await runScriptable();
    }
  }
  if (mainMenu === 2) {
    await fm.remove(path);
    const bgImage = await getBgImagePath();
    if (fm.fileExists(bgImage)) {
      fm.remove(bgImage);
    }
    await runScriptable();
  }
  if (mainMenu === 3) {
    await importModule(await downloadModule('image.js', 'aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvdmlwL21haW5UYWJsZUJhY2tncm91bmQuanM=')).
  }
  if (mainMenu === 4) {
    await createWidget();
  }
};

async function createErrorWidget() {
  const widget = new ListWidget();
  const text = widget.addText('仅支持中尺寸');
  text.font = Font.systemFont(17);
  text.centerAlignText();
  Script.setWidget(widget);
};

const runWidget = async () => {  
  if (config.runsInApp) {
    await presentMenu();
  } else {
    config.widgetFamily === 'medium' ? await createWidget() : await createErrorWidget();
  }
};
await runWidget();