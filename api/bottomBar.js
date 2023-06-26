// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: comments;
/**
* 小组件作者：95度茅台
* Version 1.2.0
* 2023-04-24 15:30
* Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy
* ⚠️小机型修改第 198 行中的数字 63
*/

const fm = FileManager.local();
const path = fm.joinPath(fm.documentsDirectory(), "bottomBar");
fm.createDirectory(path, true);

const cacheFile = fm.joinPath(path, 'setting.json');

const uri = Script.name();
const timeStamp = Date.now();

const df = new DateFormatter();
df.dateFormat = 'HH:mm';
const GMT = (df.string(new Date()));

const stackBackground = Color.dynamic(
  new Color('#EFEBE9', 0.6), 
  new Color('#161D2A', 0.5)
);
const textColor = Color.dynamic(
  new Color('#1E1E1E'), 
  new Color('#FEFEFE')
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
  const cache = useFileManager({ cacheTime: 1024 });
  const image = cache.readImage(name);
  if (image) {
    return image;
  }
  const res = await getImage(url);
  cache.writeImage(name, res);
  return res;
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
  eventStack.size = new Size(0, 63);
  
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
  statusStack.addSpacer();
  
  const statusText = statusStack.addText(GMT);
  statusText.font = Font.boldSystemFont(15);
  statusText.textColor = textColor;
  statusText.textOpacity = 0.45
  twoHoursStack.addSpacer(2);
  
  const contentText = twoHoursStack.addText(content);
  contentText.font = Font.boldSystemFont(13.5);
  contentText.textColor = textColor;
  contentText.textOpacity = 0.7
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
  textElement.textColor = textColor;
  textElement.font = Font.boldSystemFont(14);
  textElement.textOpacity = 0.8;
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
  Safari.open('scriptable:///run/' + encodeURIComponent(uri));
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
  let menuAlert = new Alert();
  menuAlert.title = 'iOS 16 负一屏底栏'
  menuAlert.message = "\n高仿微信通知信息样式\n内容显示未来两小时天气\n底部显示每日一句中英文";
  menuAlert.addDestructiveAction('更新代码');
  menuAlert.addDestructiveAction('重置所有');
  menuAlert.addAction('透明背景');
  menuAlert.addAction('组件商店');
  menuAlert.addAction('预览组件');
  menuAlert.addAction('退出菜单');
  const mainMenu = await menuAlert.presentAlert();
  if (mainMenu === 1) {
    await fm.remove(path);
    const bgImage = await getBgImagePath();
    if (fm.fileExists(bgImage)) {
      fm.remove(bgImage);
    }
    await runScriptable();
  }
  if (mainMenu === 2) {
    await importModule(await downloadModule('image.js', 'aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvdmlwL21haW5UYWJsZUJhY2tncm91bmQuanM=')).main()
  }
  if (mainMenu === 3) {
    await importModule(await downloadModule('store.js', 'aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvdmlwL21haW45NWR1U3RvcmUuanM=')).main();
  }
  if (mainMenu === 4) {
    await createWidget();
  }
  if (mainMenu === 5) return;
  if (mainMenu === 0) {
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
};

const runWidget = async () => {
  if (config.runsInApp) {
    await presentMenu();
  } else {
    await createWidget();
  }
};
await runWidget();