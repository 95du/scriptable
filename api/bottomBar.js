// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: comments;
/**
* 小组件作者：95度茅台
* 小机型修改第 7 行中的[70]⚠️
* 微信图标修改第 108 行的链接
*/

const stackSize = new Size(0, 65);
const stackBackground = Color.dynamic(
  new Color('#EFEBE9', 0.6), 
  new Color('#161D2A', 0.5)
);
const textColor = Color.dynamic(
  new Color('#1E1E1E'), 
  new Color('#FEFEFE')
);

const timeStamp = Date.parse(new Date());
const uri = Script.name();
const F_MGR = FileManager.local();
const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), "bottomBar");
const cacheFile = F_MGR.joinPath(folder, 'data.json');
const bgImage = F_MGR.joinPath(folder, uri + ".jpg");

if (F_MGR.fileExists(cacheFile)) {
  data = F_MGR.readString(cacheFile)
  data = JSON.parse(data)
  // 计算时长
  const pushTime = (timeStamp - data.updateTime);
  const P1 = pushTime % (24 * 3600 * 1000);
  const hours = Math.floor(P1 / (3600 * 1000));
  if (hours <= 3) {
    location = data
  } else {
    try {
      location = await Location.current();
      obj = {
        ...location,
        "updateTime": timeStamp
      }
      F_MGR.writeString(cacheFile, JSON.stringify(obj));  
    } catch (error) {
      location = data
    }
  }
  // Conversion GPS
  try {
    convert = await getJson(atob('aHR0cHM6Ly9yZXN0YXBpLmFtYXAuY29tL3YzL2Fzc2lzdGFudC9jb29yZGluYXRlL2NvbnZlcnQ/Y29vcmRzeXM9Z3BzJm91dHB1dD1qc29uJmtleT1hMzVhOTUzODQzM2ExODM3MThjZTk3MzM4MjAxMmY1NSZsb2NhdGlvbnM9') + `${location.longitude},${location.latitude}`);
    widget = await createWidget();
  } catch(e) {
    console.error(e);
  }
}

// widget Initialization
if (!F_MGR.fileExists(folder)) {
  F_MGR.createDirectory(folder);
  const location = await Location.current();
  obj = {
    ...location,
    "updateTime": timeStamp
  }
  F_MGR.writeString(cacheFile, JSON.stringify(obj));
  Safari.open('scriptable:///run/' + encodeURIComponent(uri));
}

async function presentMenu() {
  let alert = new Alert();
  alert.title = 'iOS 16 负一屏底栏'
  alert.message = "\n高仿微信通知信息样式\n内容显示未来两小时天气\n每日一句中英文";
  alert.addDestructiveAction('更新代码');
  alert.addDestructiveAction('重置所有');
  alert.addAction('透明背景');
  alert.addAction('预览组件');
  alert.addAction('退出菜单');
  mainMenu = await alert.presentAlert();
  if (mainMenu === 1) {
    await F_MGR.remove(folder);
  }
  if (mainMenu === 2) {
    const modulePath = await downloadModule();
    if (modulePath != null) {
      const importedModule = importModule(modulePath);
      await importedModule.main();
    }
  }
  if (mainMenu === 3) {
    await widget.presentMedium();
  }
  if (mainMenu === 4) return;
  if (mainMenu === 0) {
    const reqUpdate = new Request(atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvYXBpL2JvdHRvbUJhci5qcw=='));
    const codeString = await reqUpdate.loadString();
    const finish = new Alert();
    if (codeString.indexOf("95度茅台") == -1) {
      finish.title = "更新失败"
      finish.addAction('OK')
      await finish.presentAlert();
    } else {
      F_MGR.writeString(  
        module.filename,
        codeString
      );
      finish.title = "更新成功"
      finish.addAction('OK')
      await finish.presentAlert();
      Safari.open('scriptable:///run/' + encodeURIComponent(uri));
    }
  }
}

async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundImage = F_MGR.readImage(bgImage);
  // Wechat icon
  const picture = await getJson(atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zaG9ydGN1dHMvcmF3L21hc3Rlci9hcGkvdXBkYXRlL2JvdHRvbUJhci5qc29u'));
  const items = picture.noticeApp[Math.floor(Math.random() * picture.noticeApp.length)];
  weChat = await getImage(items);
  // One word
  const one = await getJson('http://open.iciba.com/dsapi');
  // Next two hours
  await get({"url": "https://ssfc.api.moji.com/sfc/json/nowcast"})
  
  
  /**
  * Frame Layout
  * Top Row Events
  */
  widget.setPadding(0, 0, 0, 0);
  const eventStack = widget.addStack();
  eventStack.setPadding(15, 15, 15, 15)
  eventStack.layoutHorizontally();
  eventStack.centerAlignContent();
  eventStack.backgroundColor = stackBackground
  eventStack.cornerRadius = 23
  eventStack.size = stackSize
  
  // WeChat icon
  const imageElement = eventStack.addImage(weChat);
  imageElement.imageSize = new Size(38, 38);
  imageElement.url = 'https://html5.moji.com/tpd/mojiweatheraggr/index.html#/home'
  eventStack.addSpacer(10);
  
  // Two Hours Weather
  const twoHoursStack = eventStack.addStack();
  twoHoursStack.layoutVertically();
  twoHoursStack.centerAlignContent();
  const weatherText = twoHoursStack.addText(result.radarData.title);
  weatherText.font = Font.boldSystemFont(14);
  
  // Two Hours Weather
  twoHoursStack.addSpacer(2);
  twoHoursStack.layoutVertically();
  const contentText = twoHoursStack.addText(result.radarData.content);
  contentText.font = Font.boldSystemFont(13.5);
  contentText.textColor = textColor;
  contentText.textOpacity = 0.7
  
  // Right timeStack
  eventStack.addSpacer();
  const timeStack = eventStack.addStack();
  timeStack.layoutVertically();
  const statusText = timeStack.addText('现在');
  statusText.font = Font.boldSystemFont(12);
  statusText.textColor = textColor;
  statusText.textOpacity = 0.4
  timeStack.addSpacer();
  widget.addSpacer();
  
  /** 
  * Bottom Content
  * Alert image
  * One word
  */
  const contentStack = widget.addStack();
  contentStack.layoutHorizontally();
  contentStack.centerAlignContent();
  contentStack.addSpacer();
  contentStack.setPadding(15, 15, 15, 15);
  contentStack.backgroundColor = stackBackground
  contentStack.cornerRadius = 23
  contentStack.size = new Size(0, 80);
  
  const textElement = contentStack.addText(`${one.note}\n${one.content}`);
  textElement.textColor = textColor;
  textElement.font = Font.boldSystemFont(15);
  textElement.textOpacity = 0.6
  contentStack.addSpacer();
  return widget
}

async function downloadModule() {
  const modulePath = F_MGR.joinPath(folder, 'tool.js');
  if (F_MGR.fileExists(modulePath)) {
    return modulePath;
  } else {
    const req = new Request(atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvdmlwL2JhY2tncm91bmRTY3JpcHQuanM='));
    const moduleJs = await req.load().catch(() => {
      return null;
    });
    if (moduleJs) {
      F_MGR.write(modulePath, moduleJs);
      return modulePath;
    }
  }
}

if (config.runsInApp) {
  await presentMenu();
} else {
  Script.setWidget(widget);
  Script.complete();
}

async function get(opts) {
  const coordinates = convert.locations.split(",");
  const request = new Request(opts.url);
  request.method = 'POST'
  request.body = `{
    "common": {
      "platform": "iPhone",
      "language": "CN"
    }, 
    "params": {
      "lat": '${coordinates[1]}', 
      "lon": '${coordinates[0]}'
    }
  }`
  return result = await request.loadJSON();
}

async function getJson(url) {
  const req = await new Request(url)
  return await req.loadJSON();
}

async function getImage(url) {
  const r = await new Request(url);
  return await r.loadImage();
}