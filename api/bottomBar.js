// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: comments;
/**
* iOS 16 负一屏底栏
* 高仿微信通知信息样式
* 内容显示未来两小时天气
* 每日一句中英文
* 自行替换第34行的背景URL
* 小组件作者：95度茅台
*/

// 小机型修改第11行中的[70]⚠️
const stackSize = new Size(0, 70);
const stackBackground = Color.dynamic(
  new Color('#EFEBE9', 0.6), 
  new Color('#161D2A', 0.5)
);
const eventTextColor = Color.dynamic(
  new Color('#1E1E1E'), 
  new Color('#FEFEFE')
);

const timeStamp = Date.parse(new Date());
const F_MGR = FileManager.iCloud();
const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), "weather");
const cacheFile = F_MGR.joinPath(folder, 'data.json');


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
    const location = await Location.current();
    obj = {
      ...location,
      "updateTime":`${timeStamp}`
    }
    F_MGR.writeString(cacheFile, JSON.stringify(obj));
  }
  try {
  // Conversion GPS  
  convert = await getJson(`https://restapi.amap.com/v3/assistant/coordinate/convert?coordsys=gps&output=json&key=a35a9538433a183718ce973382012f55&locations=${location.longitude},${location.latitude}`);
    widget = await createWidget();
  } catch(e) {
    console.error(e);
  }
}


if (!F_MGR.fileExists(folder)) {
  F_MGR.createDirectory(folder);
  const location = await Location.current();
  obj = {
    ...location,
    "updateTime":`${timeStamp}`
  }
  F_MGR.writeString(cacheFile, JSON.stringify(obj));
  const uri = Script.name();
  await Safari.open('scriptable:///run/' + encodeURIComponent(uri));
}


async function createWidget() {
  const widget = new ListWidget();
  // Wechat icon
  weChat = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/icon/weChat.png');

  // Background picture
  const bg = await getImage(atob('aHR0cHM6Ly9zd2VpeGluZmlsZS5oaXNlbnNlLmNvbS9tZWRpYS9NMDAvNzEvRDAvQ2g0RnlHTl9vVC1BRWFhdUFBQmtUV21CQWc4MDguanBlZw=='));
  widget.backgroundImage = bg
  
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
  imageElement.imageSize = new Size(42, 42);
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
  contentText.textColor = eventTextColor
  contentText.textOpacity = 0.7
  
  // Right timeStack
  eventStack.addSpacer();
  const timeStack = eventStack.addStack();
  timeStack.layoutVertically();
  const statusText = timeStack.addText('现在');
  statusText.font = Font.boldSystemFont(12);
  statusText.textColor = eventTextColor
  statusText.textOpacity = 0.4
  timeStack.addSpacer();
  widget.addSpacer(18)
  
  
  /** 
  * Bottom Content
  * Alert image
  * One word
  */
  const contentStack = widget.addStack();
  contentStack.layoutHorizontally();
  contentStack.centerAlignContent();
  
  contentStack.addSpacer();
  contentStack.setPadding(0, 10, 0, 10);
  const textElement = contentStack.addText(`${one.note}\n${one.content}`);
  textElement.textColor = Color.white();
  textElement.font = Font.boldSystemFont(15);
  contentStack.addSpacer();
  widget.addSpacer();
  
  if (config.runsInApp) {
    await widget.presentMedium();
  } else {
    Script.setWidget(widget);
    Script.complete();
  }
  
  return widget
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
  result = await request.loadJSON();
  return result
}

async function getJson(url) {
  const req = await new Request(url)
  return await req.loadJSON();
}

async function getImage(url) {
  const r = await new Request(url);
  return await r.loadImage();
}