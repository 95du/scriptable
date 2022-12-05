// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: comments;
/**
* iOS 16 负一屏底栏
* 高仿微信通知信息样式
* 内容显示未来两小时天气
* 每日一句中英文
* 小组件作者：95度茅台
*/

// 小机型修改第 10 行中的[70]⚠️
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
    const location = await Location.current();
    obj = {
      ...location,
      "updateTime":`${timeStamp}`
    }
    F_MGR.writeString(cacheFile, JSON.stringify(obj));
  }
  try {
  // Conversion GPS  
  convert = await getJson(atob('aHR0cHM6Ly9yZXN0YXBpLmFtYXAuY29tL3YzL2Fzc2lzdGFudC9jb29yZGluYXRlL2NvbnZlcnQ/Y29vcmRzeXM9Z3BzJm91dHB1dD1qc29uJmtleT1hMzVhOTUzODQzM2ExODM3MThjZTk3MzM4MjAxMmY1NSZsb2NhdGlvbnM9') + `${location.longitude},${location.latitude}`);
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
  Safari.open('scriptable:///run/' + encodeURIComponent(uri));
}


if (config.runsInApp) {
  await presentMenu();
} else {
  Script.setWidget(widget);
  Script.complete();
}


async function presentMenu() {
  let alert = new Alert();
  alert.title = 'iOS 16 负一屏底栏'
  alert.message = "\n高仿微信通知信息样式\n内容显示未来两小时天气\n每日一句中英文";
  alert.addDestructiveAction('更新代码');
  alert.addAction('透明背景');
  alert.addAction('预览组件');
  alert.addAction('退出菜单');
  mainMenu = await alert.presentAlert();
  if (mainMenu === 1) {
    await createBackground();
  }
  if (mainMenu === 2) {
    await widget.presentMedium();
  }
  if (mainMenu === 3) return;
  if (mainMenu === 0) {
    const FILE_MGR = FileManager.local();
    const iCloudInUse = FILE_MGR.isFileStoredIniCloud(module.filename);
    const reqUpdate = new Request(atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvYXBpL2JvdHRvbUJhci5qcw=='));
    const codeString = await reqUpdate.loadString();
    if (codeString.indexOf('95度茅台') == -1) {
      message = "⚠️更新失败，请检查网络或稍后再试";
      await generateAlert(message, ["退出"]); return;
    } else {
      FILE_MGR.writeString(module.filename, codeString)
      message = "小组件更新成功";
      await generateAlert(message, ["OK"])
      Safari.open('scriptable:///run/' + encodeURIComponent(uri));
    }
  }
}

async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundImage = F_MGR.readImage(bgImage);
  // Wechat icon
  weChat = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/icon/weChat.png');
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
  return widget
}


async function createBackground() {
  // Determine if user has taken the screenshot.
  message =
  "在主屏幕长按进入编辑模式。滑动到最右边的空白页 ( 桌面墙纸设置为模糊 ) 截图";
  let exitOptions = ["已有截图", "没有截图"];
  let shouldExit = await generateAlert(message, exitOptions);
  if (shouldExit) return;

  // Get screenshot and determine phone size.
  let img = await Photos.fromLibrary();
  let height = img.size.height;
  let phone = phoneSizes()[height];
  if (!phone) {
    message = "您似乎选择了非iPhone屏幕截图的图像，或者不支持您的iPhone。请使用其它图像";
    await generateAlert(message, ["现在去截图"]);
    return;
  }

  // Prompt for widget size and position.
  message = "创建三种尺寸的小组件";
  let sizes = ["小号", "中号", "大号"];
  let size = await generateAlert(message, sizes);
  let widgetSize = sizes[size];

  message = "您想它在什么位置？";
  message += height == 1136 ? " (请注意，您的设备仅支持两行小组件，因此中间和底部选项相同。)" : "";

  // Determine image crop based on phone size.
  let crop = { w: "", h: "", x: "", y: "" };
  if (widgetSize == "小号") {
    crop.w = phone.小号;
    crop.h = phone.小号;
    let positions = ["顶部 左边", "顶部 右边", "中间 左边", "中间 右边", "底部 左边", "底部 右边"];
    let position = await generateAlert(message, positions);

    // Convert the two words into two keys for the phone size dictionary.
    let keys = positions[position].toLowerCase().split(" ");
    crop.y = phone[keys[0]];
    crop.x = phone[keys[1]];
  } else if (widgetSize == "中号") {
    crop.w = phone.中号;
    crop.h = phone.小号;

    // Medium and large widgets have a fixed x-value.
    crop.x = phone.左边;
    let positions = ["顶部", "中间", "底部"];
    let position = await generateAlert(message, positions);
    let key = positions[position].toLowerCase();
    crop.y = phone[key];
  } else if (widgetSize == "大号") {
    crop.w = phone.中号;
    crop.h = phone.大号;
    crop.x = phone.左边;
    let positions = ["顶部", "底部"];
    let position = await generateAlert(message, positions);

    // Large widgets at the bottom have the "middle" y-value.
    crop.y = position ? phone.中间 : phone.顶部;
  }

  // Crop image and finalize the widget.
  let imgCrop = cropImage(img, new Rect(crop.x, crop.y, crop.w, crop.h));

  message = "背景已制作成功";
  const exportPhotoOptions = ["立即使用", "导出相册", "重新制作"];
  const exportPhoto = await generateAlert(message, exportPhotoOptions);

  if (exportPhoto == 0) {
    F_MGR.writeImage(bgImage,imgCrop)
    Safari.open('scriptable:///run/' + encodeURIComponent(uri));
  } else if (exportPhoto == 1) {
    Photos.save(imgCrop)
  } else if (exportPhoto == 2) {
    await createBackground();
  }
}


// Crop an image into the specified rect.
function cropImage(img, rect) {
  let draw = new DrawContext();
  draw.size = new Size(rect.width, rect.height);
  draw.drawImageAtPoint(img, new Point(-rect.x, -rect.y));
  return draw.getImage();
}

// Pixel sizes and positions for widgets on all supported phones.
function phoneSizes() {
  let phones = {
    // 14 Pro Max
    2796: { 
      小号: 510, 
      中号: 1092, 
      大号: 1146, 
      左边: 99, 
      右边: 681, 
      顶部: 282, 
      中间: 918, 
      底部: 1554
    },
    // 14 Pro
    2556: { 
      小号: 474, 
      中号: 1014, 
      大号: 1062, 
      左边: 82, 
      右边: 622, 
      顶部: 270, 
      中间: 858, 
      底部: 1446
    },
    // 11 Pro Max,Xs Max
    2688: {
      小号: 507,
      中号: 1080,
      大号: 1137,
      左边: 81,
      右边: 654,
      顶部: 228,
      中间: 858,
      底部: 1488,
    },
    // 11,XR
    1792: {
      小号: 338,
      中号: 720,
      大号: 758,
      左边: 54,
      右边: 436,
      顶部: 160,
      中间: 580,
      底部: 1000,
    },
    // 11 Pro,Xs,X
    2436: {
      小号: 465,
      中号: 987,
      大号: 1035,
      左边: 69,
      右边: 591,
      顶部: 213,
      中间: 783,
      底部: 1353,
    },
    // Plus Phones
    2208: {
      小号: 471,
      中号: 1044,
      大号: 1071,
      左边: 99,
      右边: 672,
      顶部: 114,
      中间: 696,
      底部: 1278,
    },
    //SE2 and 6/6s/7/8
    1334: {
      小号: 296,
      中号: 642,
      大号: 648,
      左边: 54,
      右边: 400,
      顶部: 60,
      中间: 412,
      底部: 764,
    },
    //SE1
    1136: {
      小号: 282,
      中号: 584,
      大号: 622,
      左边: 30,
      右边: 332,
      顶部: 59,
      中间: 399,
      底部: 399,
    },
    // 12 and 12 Pro
    2532: {
      小号: 474,
      中号: 1014,
      大号: 1062,
      左边: 78,
      右边: 618,
      顶部: 231,
      中间: 819,
      底部: 1407,
    },
    // 12 Mini
    2340: {
      小号: 436,
      中号: 936,
      大号: 980,
      左边: 72,
      右边: 570,
      顶部: 212,
      中间: 756,
      底部: 1300,
    },
    // 12 Pro max
    2778: {
      小号: 518,
      中号: 1114,
      大号: 1162,
      左边: 86,
      右边: 678,
      顶部: 252,
      中间: 898,
      底部: 1544,
    },
    // 11 and XR in Display Zoom mode
    1624: {
      小号: 310,
      中号: 658,
      大号: 690,
      左边: 46,
      右边: 394,
      顶部: 142,
      中间: 522,
      底部: 902,
    },
    //Plus in Display Zoom mode
    2001: {
      小号: 444,
      中号: 963,
      大号: 972,
      左边: 81,
      右边: 600,
      顶部: 90,
      中间: 618,
      底部: 1146,
    },
    // iPad Air 4
    2360: {
      小号: 310,
      中号: 658,
      大号: 658,
      左边: 132,
      右边: 480,
      顶部: 160,
      中间: 508,
      底部: 856,
    },
  };
  return phones;
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

async function generateAlert(message, options) {
  const alert = new Alert();
  alert.message = message;
  for (const option of options) {
    alert.addAction(option);
  }
  const response = await alert.presentAlert();
  return response;
}