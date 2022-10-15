// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: gas-pump;
const notice = new Notification()

const location = await Location.current();
    const locationText = await Location.reverseGeocode(
      location.latitude,
      location.longitude,
    );
    const {administrativeArea = ''} = locationText[0] || {};
    const province = `${administrativeArea.replace('省', '')}`;

const Req = new Request('https://mys4s.cn/v3/oil/price');
  Req.method = 'POST'
  Req.body = `region=${province}`
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
    
  
  async function createWidget(oil, img) {
    const widget = new ListWidget();
    const bg = await getImage('http://mtw.so/5J60oh');
    widget.backgroundImage = await shadowImage(bg);  
    
    //Text Color
    const titleText = widget.addText(province + '今日油价')  
    titleText.textColor = Color.white();
    titleText.font = Font.boldSystemFont(21)
    titleText.centerAlignText()
    widget.addSpacer(3)
    
    const mainStack = widget.addStack();
    mainStack.layoutVertically();
    const dataStack = mainStack.addStack();
    dataStack.layoutHorizontally();

    // First column
    const column1 = dataStack.addStack();
    column1.layoutVertically();
    column1.setPadding(15, 9, 0, 0);
    const oil0Text = column1.addText(`0#  -  ${oil.Oil0}` + `\n92  -  ${oil.Oil92}` + `\n95  -  ${oil.Oil95}` + `\n98  -  ${oil.Oil98}`);
    oil0Text.textColor = Color.white();
    oil0Text.font = Font.boldSystemFont(16.3)
    oil0Text.leftAlignText()
    column1.addSpacer(8)
    
    //Second column
    const column2 = dataStack.addStack();
    column2.layoutVertically();
    column2.setPadding(15, 20, 0, 0)
    const oilTipsText = column2.addText(`${forecast}`)
    oilTipsText.textColor = Color.white();
    oilTipsText.font = Font.boldSystemFont(16)
    oilTipsText.leftAlignText()
    column2.addSpacer(1)
    
    return widget;
  }


  // readString 读取
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
    notice.schedule() 
    notice.title = province + '油价涨跌调整‼️'
    notice.body = adjustment
    notice.openURL = 'https://mys4s.cn/v3/oil/price'
    notice.schedule()
    
    // writeString 写入
    if (!fileManager.fileExists(folder)) {
  fileManager.createDirectory(folder)
    }
      data = {"oil":`${forecast}`}
      data = JSON.stringify(data);
      fileManager.writeString(cacheFile, data);
  }


  async function getImage(url) {
    const r = await new Request(url);
    return await r.loadImage();
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