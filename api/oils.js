// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: gas-pump;
/**
 * 小组件作者: 95度茅台
 * Oil price
 * Version 1.2
 * 2022-12-19 11:30
 * Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy
 * ⚠️适配机型: 手动修改第9、10行的数字
 */
const value = 6 //小机型改成 4
const wide = 8 //小机型改成 6

try {  
  const html = await new Request(atob('aHR0cDovL20ucWl5b3VqaWFnZS5jb20=')).loadString();
  forecast = html.match(/var tishiContent="(.*?)";/)[1].replace("<br/>", ',');
} catch(e) { console.log(e) }

const F_MGR = FileManager.iCloud();
const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), "oil");
const cacheFile = F_MGR.joinPath(folder, 'data.json');

if (F_MGR.fileExists(cacheFile)) {
  data = F_MGR.readString(cacheFile);
  data = JSON.parse(data);
  const req = new Request(atob('aHR0cHM6Ly9teXM0cy5jbi92My9vaWwvcHJpY2U='));  
  req.method = 'POST'
  req.body = `region=${data.province}`
  const res = await req.loadJSON();
  oil = res.data
  widget = await createWidget(oil);
} else {
  const alert = new Alert();
  alert.title = '输入省份名称';
  alert.addTextField('海南', '');
  alert.addAction('确定');
  alert.addCancelAction('取消');  
  const input = await alert.presentAlert();
  const province = alert.textFieldValue(0);
  if (input === -1) return;
  if (!F_MGR.fileExists(folder)) {
    F_MGR.createDirectory(folder)
    F_MGR.writeString(
      cacheFile,
      JSON.stringify({
        alert: forecast,
        province: province
      }, null, 2)
    );
    data = JSON.parse(
F_MGR.readString(cacheFile)
    );
    const uri = Script.name();
    Safari.open('scriptable:///run/' + encodeURIComponent(uri));
  }
}

async function createWidget(oil) {
  const widget = new ListWidget();
  widget.backgroundColor = Color.white();
  const gradient = new LinearGradient();
    color = [
      "#4FC3F7",
      "#C2B280",
      "#66CCFF",
      "#99CCCC",
      "#BCBBBB"
    ]
  const items = color[Math.floor(Math.random()*color.length)];
  gradient.locations = [0, 1]
  gradient.colors = [
    new Color(items, 0.5),
    new Color('#00000000')
  ]
  widget.backgroundGradient = gradient
   
    
  // 灵动岛
  widget.setPadding(7, 8, 7, 8);
  const mainStack = widget.addStack();
  mainStack.layoutVertically();
  
  // Dynamic Island bar
  const Stack = mainStack.addStack();
  Stack.addSpacer();
  const barStack = Stack.addStack();
  barStack.backgroundColor = Color.black();
  barStack.setPadding(5, 42, 5, 42);
  barStack.cornerRadius = 15
  barStack.borderColor = Color.black();
  barStack.borderWidth = 3
  //Text Color
  const titleText = barStack.addText(`${data.province}油价`);
  titleText.textColor = Color.green();
  titleText.font = Font.boldSystemFont(16);
  titleText.centerAlignText();
  Stack.addSpacer(3);
  
  // Notification icon
  const noticeStack = Stack.addStack();
  const iconSymbol2 = SFSymbol.named('bell.circle');
  const carIcon = noticeStack.addImage(iconSymbol2.image);
  carIcon.imageSize = new Size(30, 30);
  carIcon.tintColor = Color.black();
  Stack.addSpacer();
  mainStack.addSpacer(10)
  
  
  // oilPrice Alert
  const dataStack2 = mainStack.addStack();
  dataStack2.layoutHorizontally();
  dataStack2.addSpacer();
  // bar
  const barStack1 = dataStack2.addStack();
  barStack1.setPadding(8, 8, 8, 8);
  barStack1.backgroundColor = new Color('#EEEEEE', 0.1);
  barStack1.cornerRadius = 10
  barStack1.borderColor = new Color('#D50000', 0.8);
  barStack1.borderWidth = 2.5
  // bar text
  const oilTipsText = barStack1.addText(!forecast ? data.alert : forecast);
  oilTipsText.textColor = new Color('#5e5e5e');
  oilTipsText.font = Font.boldSystemFont(13);
  oilTipsText.centerAlignText();
  dataStack2.addSpacer();
  mainStack.addSpacer(10)
  
  
  // First column
  const dataStack = mainStack.addStack();
  dataStack.addSpacer();
  // Oil_0 bar
  const barStack0 = dataStack.addStack();
  barStack0.setPadding(3, wide, 3, wide);
  barStack0.backgroundColor = new Color('#FB8C00');
  barStack0.cornerRadius = 10
  barStack0.borderColor = new Color('#FB8C00');
  barStack0.borderWidth = 3
  // bar text
  const totalMonthBar0 = barStack0.addText(`0# - ${(oil.Oil0).toPrecision(3)}`);
  totalMonthBar0.font = Font.mediumSystemFont(14);
  totalMonthBar0.textColor = Color.white();
  dataStack.addSpacer(value)
  
  
  // Second column
  // Oil_92 bar
  const barStack2 = dataStack.addStack();
  barStack2.setPadding(3, wide, 3, wide);
  barStack2.backgroundColor = Color.blue();
  barStack2.cornerRadius = 10
  barStack2.borderColor = Color.blue();
  barStack2.borderWidth = 3
  // bar text
  const totalMonthBar2 = barStack2.addText(`92 - ${(oil.Oil92).toPrecision(3)}`);
  totalMonthBar2.font = Font.mediumSystemFont(14);
  totalMonthBar2.textColor = new Color('#FFFFFF');
  dataStack.addSpacer(value)
  
  
  // Third column
  // Oil_95 bar
  const barStack5 = dataStack.addStack();
  barStack5.setPadding(3, wide, 3, wide);
  barStack5.backgroundColor = new Color('#00C853');
  barStack5.cornerRadius = 10
  barStack5.borderColor = new Color('#00C853');
  barStack5.borderWidth = 3
  // bar text
  const totalMonthBar5 = barStack5.addText(`95 - ${(oil.Oil95).toPrecision(3)}`);
  totalMonthBar5.font = Font.mediumSystemFont(14);
  totalMonthBar5.textColor = new Color('#FFFFFF');
  dataStack.addSpacer(value)
  
    
  // Fourth column
  // Oil_98 bar
  const barStack8 = dataStack.addStack();
  barStack8.setPadding(3, wide, 3, wide);
  barStack8.backgroundColor = Color.purple();
  barStack8.cornerRadius = 10
  barStack8.borderColor = Color.purple();
  barStack8.borderWidth = 3
  // bar text
  const totalMonthBar8 = barStack8.addText(`98 - ${(oil.Oil98).toPrecision(3)}`);
  totalMonthBar8.font = Font.mediumSystemFont(14);
  totalMonthBar8.textColor = new Color('#FFFFFF');
  dataStack.addSpacer();
  return widget;
}

const isMediumWidget =  config.widgetFamily === 'medium'
if (!config.runsInWidget) {
  await widget.presentMedium();
} else {
  if (isMediumWidget) {
    Script.setWidget(widget);
    Script.complete();
  } else {
    await createErrorWidget();
  }
}

try {  
  if (forecast.length !== data.alert.length) {
    const notice = new Notification()
    notice.sound = 'alert'
    notice.title = `${data.province}油价涨跌调整‼️`
    notice.body = forecast
    notice.schedule();
    F_MGR.writeString(
      cacheFile,
      JSON.stringify({
        alert: forecast,
        province: data.province
      }, null, 2)
    );
  }
} catch(e) { console.log(e) }

async function createErrorWidget() {
  const widget = new ListWidget();
  const text = widget.addText('仅支持中尺寸');
  text.font = Font.systemFont(17);
  text.centerAlignText();
  Script.setWidget(widget);
}