// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: gas-pump;
/**
 * 小组件作者: 95度茅台
 * Oil price
 * UITable Version 1.0.0
 * 2023-01-03 11:30
 */

async function main() {
  const fm = FileManager.local();
  const folder = fm.joinPath(fm.documentsDirectory(), "95duOilPrice");
  const cacheFile = fm.joinPath(folder, 'setting.json');
  
  // Background image path  
  const bgPath = fm.joinPath(fm.documentsDirectory(), "95duBackground");
  const bgImage = fm.joinPath(bgPath, Script.name() + ".jpg");
  
  if (fm.fileExists(cacheFile)) {
    const setting = JSON.parse(
      fm.readString(cacheFile)
    );
    
    const req = new Request(atob('aHR0cHM6Ly9teXM0cy5jbi92My9vaWwvcHJpY2U='));  
    req.method = 'POST'
    req.body = `region=${setting.province}`
    const res = await req.loadJSON();
    const oil = res.data;
    
    try {  
      const html = await new Request(atob('aHR0cDovL20ucWl5b3VqaWFnZS5jb20=')).loadString();
      forecast = html.match(/var tishiContent="(.*?)";/)[1].replace("<br/>", ',');
    } catch(e) { 
      console.log(e);
      forecast = setting.oil;
    };
    
    if (setting.oil === undefined) {
      fm.writeString(cacheFile, JSON.stringify({ ...setting, oil: forecast }, null, 2));
      const setting = JSON.parse(
        fm.readString(cacheFile)
      );
    }
    
    widget = await createWidget(setting, oil);
  }
  
  async function createWidget(setting, oil) {
    const value = 6 - setting.interval
    const wide = 8 - setting.interval
    const widget = new ListWidget();
    widget.backgroundColor = Color.white();
    if (fm.fileExists(bgImage)) {
      widget.backgroundImage = fm.readImage(bgImage);
    } else {
      const gradient = new LinearGradient();
      colorArr = setting.gradient.length
      if (colorArr === 0) {
        color = [
          "#82B1FF",
          "#4FC3F7",
          "#66CCFF",
          "#99CCCC",
          "#BCBBBB"
        ]
      } else {
        color = setting.gradient
      }
      const items = color[Math.floor(Math.random()*color.length)];
      
      // 渐变角度
      const angle = 90
      const radianAngle = ((360 - angle) % 360) * (Math.PI / 180);
      const x = 0.5 + 0.5 * Math.cos(radianAngle);
      const y = 0.5 + 0.5 * Math.sin(radianAngle);
      gradient.startPoint = new Point(1 - x, y);
      gradient.endPoint = new Point(x, 1 - y);
      // 渐变角度
      
      gradient.locations = [0, 1]
      gradient.colors = [
        new Color(items, Number(setting.transparency)),
        new Color('#00000000')
      ]
      widget.backgroundGradient = gradient
    }
     
      
    // 灵动岛
    widget.setPadding(7, 7, 7, 7);
    const mainStack = widget.addStack();
    mainStack.layoutVertically();
    mainStack.centerAlignContent();
    // Dynamic Island bar
    const Stack = mainStack.addStack();
    Stack.layoutHorizontally();
    Stack.centerAlignContent();
    Stack.addSpacer();
    const barStack = Stack.addStack();
    barStack.backgroundColor = Color.black();
    barStack.setPadding(5, 42, 5, 42);
    barStack.cornerRadius = 15
    barStack.borderColor = Color.black();
    barStack.borderWidth = 3
    //Text Color
    const titleText = barStack.addText(`${setting.province}油价`);
    dynamic = ['#FFBF00', '#34C759'];
    titleText.textColor = new Color(dynamic[parseInt(Math.random() * dynamic.length)]);
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
    barStack1.setPadding(8, 15, 8, 15);
    barStack1.backgroundColor = new Color('#EEEEEE', 0.1);
    barStack1.cornerRadius = 10
    barStack1.borderColor = new Color('#D50000', 0.8);
    barStack1.borderWidth = 2.5
    // bar text
    const oilTipsText = barStack1.addText(forecast);
    oilTipsText.textColor = fm.fileExists(bgImage) ? Color.white() : new Color('#5e5e5e');
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
    totalMonthBar2 = barStack2.addText(`92 - ${(oil.Oil92).toPrecision(3)}`);
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
      createErrorWidget();
    }
  }
  
  try {
    if (forecast.length !== setting.oil.length) {
      const notice = new Notification()
      notice.sound = 'alert'
      notice.title = `${setting.province}油价涨跌调整‼️`
      notice.body = forecast
      notice.schedule();
      fm.writeString(cacheFile, JSON.stringify({ ...setting, oil: forecast }, null, 2));
    }
  } catch(error) {
    console.log(error);
  }
  
  function createErrorWidget() {
    const widget = new ListWidget();
    const text = widget.addText('仅支持中尺寸');
    text.font = Font.systemFont(17);
    text.centerAlignText();
    Script.setWidget(widget);
  }
  
  async function shadowImage(img) {
    let ctx = new DrawContext();
    ctx.size = img.size
    ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']));
    // 图片遮罩颜色、透明度设置
    ctx.setFillColor(new Color("#000000", 0.3))
    ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']))
    return await ctx.getImage()
  }
}
module.exports = { main }