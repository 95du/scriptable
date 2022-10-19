// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: gas-pump;
const notice = new Notification()

const Req = new Request('https://mys4s.cn/v3/oil/price');
  Req.method = 'POST'
  Req.body = 'region=海南'
  const Res = await Req.loadJSON();
  const oil = Res.data

const req = new Request('http://m.qiyoujiage.com');
  const html = await req.loadString();
  const rule = 'var tishiContent="(.*?)";';
  const forecast = html.match(new RegExp(rule,"g")).map(str=>{
    const forecast = str.match(new RegExp(rule));  
    const regex = /<br\/>/g;
    const value = forecast[1].split(regex)
    return value
  });
    
const widget = await createWidget(oil);
const fileManager = FileManager.iCloud();
const folder = fileManager.joinPath(fileManager.documentsDirectory(), "oil");
const cacheFile = fileManager.joinPath(folder, 'data.json');
  
  if (config.widgetFamily === "small") {
    return;
  }
  
  if (config.runsInWidget) {
    Script.setWidget(widget)
    Script.complete()
  } else {
    widget.presentMedium();
  }
    
  
  async function createWidget(oil, data) {
    // 组件背景渐变
    const widget = new ListWidget()
    widget.backgroundColor = Color.white();
    const gradient = new LinearGradient()
    color = [
    "#82B1FF", 
    "#757575", 
    "#4FC3F7",
    "#66CCFF"
    ]
    const items = color[Math.floor(Math.random()*color.length)];
    gradient.locations = [0, 1]
    gradient.colors = [
      new Color(`${items}`, 0.5),
      new Color('#00000000')
    ]
    widget.backgroundGradient = gradient
   
    
    // 灵动岛
    const mainStack = widget.addStack();
    mainStack.layoutVertically();
    const Stack = mainStack.addStack();
    Stack.setPadding(0, 65, 0, 0);
    Stack.layoutHorizontally();
    
    // Notification icon
    const columnN = Stack.addStack();
    columnN.layoutVertically();

    const noticeStack = columnN.addStack();
    const iconSymbol2 = SFSymbol.named('bell.circle');
    const carIcon = noticeStack.addImage(iconSymbol2.image);
    carIcon.imageSize = new Size(28, 28);
    carIcon.tintColor = Color.black();
    noticeStack.addSpacer(5);
    
    // Dynamic Island bar
    const barRow = noticeStack.addStack();
    const barStack = barRow.addStack();
    barStack.layoutHorizontally();
    barStack.centerAlignContent();
    barStack.backgroundColor = new Color('#000000', 0.8);
    barStack.setPadding(5, 45, 5, 45);
    barStack.cornerRadius = 15
    barStack.borderColor = new Color('#000000', 0.7);
    barStack.borderWidth = 3
    //Text Color
    const titleText = barStack.addText('海南油价');
    titleText.textColor = Color.white();
    titleText.font = Font.boldSystemFont(15)
    titleText.centerAlignText();
    columnN.addSpacer(15)
    
    
    // oilPrice _alert ‼️
    const dataStack2 = mainStack.addStack();
    dataStack2.setPadding(0, 0, 0, 0);
dataStack2.layoutHorizontally();
    const column1 = dataStack2.addStack();
    column1.layoutVertically();
    // bar
    const barRow1 = column1.addStack();
    barRow1.setPadding(0, 0, 10, 0);
    const barStack1 = barRow1.addStack();
    barStack1.layoutHorizontally();
    barStack1.centerAlignContent();
    barStack1.setPadding(8, 8, 8, 8);
    barStack1.backgroundColor = new Color('#EEEEEE', 0.1);
    barStack1.cornerRadius = 10
    barStack1.borderColor = new Color('#D50000', 0.7);
    barStack1.borderWidth = 3
    // bar text
    const oilTipsText = barStack1.addText(`${forecast}`);
    oilTipsText.textColor = new Color('#616161');
    oilTipsText.font = Font.boldSystemFont(12.5)
    oilTipsText.centerAlignText();
    barStack1.addSpacer(10)
    
    
    // First column ❤️
    const dataStack = mainStack.addStack();
    dataStack.layoutHorizontally();
    const column0 = dataStack.addStack();
    column0.layoutVertically();
    // Oil_0 bar
    const barRow0 = column0.addStack();
    barRow0.setPadding(0, 0, 0, 6);
    const barStack0 = barRow0.addStack();
    barStack0.layoutHorizontally();
    barStack0.centerAlignContent();
    barStack0.setPadding(3, 8, 3, 8);
    barStack0.backgroundColor = new Color('#FB8C00');
    barStack0.cornerRadius = 10
    barStack0.borderColor = new Color('#FB8C00');
    barStack0.borderWidth = 3
    // bar text
    let oil0 = `${oil.Oil0}`
    const a = {};
    a.GetLength = function(str) {
      return str.replace(/[\u0391-\uFFE5]/g,"@@").length;
    };  
    str0 = (a.GetLength(oil0));
    if (str0 <= 3) {
      totalMonthBar0 = barStack0.addText(`0# - ${oil.Oil0}0`);
    } else {
      totalMonthBar0 = barStack0.addText(`0# - ${oil.Oil0}`);
    }
    totalMonthBar0.font = Font.mediumSystemFont(14);
    totalMonthBar0.textColor = Color.white();
    column0.addSpacer(6)
    
    
    // Second column ❤️
    const column2 = dataStack.addStack();
    column2.layoutVertically();
    // Oil_92 bar
    const barRow2 = column2.addStack();
    barRow2.setPadding(0, 0, 0, 6);
    const barStack2 = barRow2.addStack();
    barStack2.layoutHorizontally();
    barStack2.centerAlignContent();
    barStack2.setPadding(3, 8, 3, 8);
    barStack2.backgroundColor = Color.blue();
    barStack2.cornerRadius = 10
    barStack2.borderColor = Color.blue();
    barStack2.borderWidth = 3
    // bar text
    let oil92 = `${oil.Oil92}`
    const b = {};
    b.GetLength = function(str) {
      return str.replace(/[\u0391-\uFFE5]/g,"@@").length;
    };  
    str92 = (b.GetLength(oil92));
    if (str92 <= 3) {
      totalMonthBar2 = barStack2.addText(`92 - ${oil.Oil92}0`);
    } else {
      totalMonthBar2 = barStack2.addText(`92 - ${oil.Oil92}`);
    }
    totalMonthBar2.font = Font.mediumSystemFont(14);
    totalMonthBar2.textColor = new Color('#FFFFFF');
    column2.addSpacer(6)
    
    
    // Third column ❤️
    const column5 = dataStack.addStack();
    column5.layoutVertically();
    // Oil_95 bar
    const barRow5 = column5.addStack();
    barRow5.setPadding(0, 0, 0, 6);
    const barStack5 = barRow5.addStack();
    barStack5.layoutHorizontally();
    barStack5.centerAlignContent();
    barStack5.setPadding(3, 8, 3, 8);
    barStack5.backgroundColor = new Color('#00C853');
    barStack5.cornerRadius = 10
    barStack5.borderColor = new Color('#00C853');
    barStack5.borderWidth = 3
    // bar text
    let oil95 = `${oil.Oil95}`
    const c = {};
    c.GetLength = function(str) {
      return str.replace(/[\u0391-\uFFE5]/g,"@@").length;
    };  
    str95 = (c.GetLength(oil95));
    if (str95 <= 3) {
      totalMonthBar5 = barStack5.addText(`95 - ${oil.Oil95}0`);
    } else {
      totalMonthBar5 = barStack5.addText(`95 - ${oil.Oil95}`);
    }
    totalMonthBar5.font = Font.mediumSystemFont(14);
    totalMonthBar5.textColor = new Color('#FFFFFF');
    column5.addSpacer(6)
    
    
    // Fourth column ❤️
    const column8 = dataStack.addStack();
    column8.layoutVertically();
    // Oil_98 bar
    const barRow8 = column8.addStack();
    const barStack8 = barRow8.addStack();
    barStack8.layoutHorizontally();
    barStack8.centerAlignContent();
    barStack8.setPadding(3, 8, 3, 8);
    barStack8.backgroundColor = Color.purple();
    barStack8.cornerRadius = 10
    barStack8.borderColor = Color.purple();
    barStack8.borderWidth = 3
    // bar text
    let oil98 = `${oil.Oil98}`
    const d = {};
    d.GetLength = function(str) {
      return str.replace(/[\u0391-\uFFE5]/g,"@@").length;
    };  
    str98 = (d.GetLength(oil98));
    if (str98 <= 3) {
      totalMonthBar8 = barStack8.addText(`98 - ${oil.Oil98}0`);
    } else {
      totalMonthBar8 = barStack8.addText(`98 - ${oil.Oil98}`);  
    }
    totalMonthBar8.font = Font.mediumSystemFont(14);
    totalMonthBar8.textColor = new Color('#FFFFFF');
    
    return widget;
  }


  // readString
  if (fileManager.fileExists(cacheFile)) {
    data = fileManager.readString(cacheFile)
    data = JSON.parse(data)
  } else {
      fileManager.createDirectory(folder)
      data = {"oil":`${forecast}`}
      data = JSON.stringify(data);
      fileManager.writeString(cacheFile, data);
    return;
  }
  
  var adjustment = `${forecast}`
  if (adjustment !== data.oil) {
    //Notification_1
    notice.sound = 'alert'
    notice.title = '海南油价涨跌调整‼️'
    notice.body = adjustment
    notice.openURL = 'https://mys4s.cn/v3/oil/price'
    notice.schedule();
    
    // writeString
    if (fileManager.fileExists(folder)) {
      data = {"oil":`${forecast}`}
      data = JSON.stringify(data);
      fileManager.writeString(cacheFile, data);
    }
  }
  
  
  async function shadowImage(img) {
    let ctx = new DrawContext()
    ctx.size = img.size
    ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']))
    // 图片遮罩颜色、透明度设置
    ctx.setFillColor(new Color("#000000", 0.3))
    ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']))
    let res = await ctx.getImage()
    return res
  }