// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: gas-pump;
/**
 * 组件作者: 95度茅台
 * 组件名称: 全国油价_2
 * 组件版本: Version 1.0.0
 * 更新日期: 2023-10-13 11:30
 */

async function main() {
  const fm = FileManager.local();
  const folder = fm.joinPath(fm.documentsDirectory(), "95duOilPrice");
  
  const cacheFile = fm.joinPath(folder, 'setting.json');
  if (fm.fileExists(cacheFile)) { 
    setting = JSON.parse(fm.readString(cacheFile));
  }
  
  // Background image path
  const bgPath = fm.joinPath(fm.documentsDirectory(), "95duBackground");
  const bgImage = fm.joinPath(bgPath, Script.name() + ".jpg");
  
  // 更新时间
  const df = new DateFormatter();
  df.dateFormat = 'HH:mm';
  const GMT = df.string(new Date());
  
  const getOilsData = async () => {
    try {  
      const html = await new Request(atob('aHR0cDovL20ucWl5b3VqaWFnZS5jb20=')).loadString();
      const webView = new WebView();
      await webView.loadHTML(html);

      const extractedData = await webView.evaluateJavaScript(`
        (() => {
          const table = document.querySelector('table');
          const oilsArr = [];
          const rows = table.querySelectorAll('tr');
          rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0 && cells[0].textContent.trim() === "${setting.province}") {
              const rowData = [];
              cells.forEach(cell => {
                rowData.push(cell.textContent.trim())
              });
              oilsArr.push(rowData);
            }
          });
          return { tishiContent, oilsArr }
        })();
      `);
      
      const { tishiContent, oilsArr } = extractedData;
      return { 
        oilsAlert: tishiContent.replace('<br/>', '，'),
        oils: oilsArr[0]
      }
    } catch(e) {
      console.log(e + '\n使用缓存');
      return { 
        oilsAlert: setting.oilsAlert,
        oils: setting.oils
      }
    }
  };
  
  const { oilsAlert, oils } = await getOilsData();
  const [_, oil92, oil95, oil98, oil0] = oils.map(item => parseFloat(item).toPrecision(3));

  if (setting.oils === undefined) {
    fm.writeString(cacheFile, JSON.stringify({ ...setting, oils, oilsAlert }, null, 2));
    setting = JSON.parse(
      fm.readString(cacheFile)
    )
  };
  
  //
  async function createWidget() {
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
      const angle = setting.angle || 90
      const radianAngle = ((360 - angle) % 360) * (Math.PI / 180);
      const x = 0.5 + 0.5 * Math.cos(radianAngle);
      const y = 0.5 + 0.5 * Math.sin(radianAngle);
      gradient.startPoint = new Point(1 - x, y);
      gradient.endPoint = new Point(x, 1 - y);
      
      gradient.locations = [0, 1]
      gradient.colors = [
        new Color(items, Number(setting.transparency)),
        new Color('#00000000')
      ]
      widget.backgroundGradient = gradient
    };
    
    widget.setPadding(10, 10, 10, 10);
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

    const titleText = barStack.addText(`${oils[0]}油价`);
    dynamic = ['#FFD723', '#34C759'];
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

    const barStack1 = dataStack2.addStack();
    barStack1.setPadding(8, 12, 8, 12);
    barStack1.backgroundColor = new Color('#EEEEEE', 0.1);
    barStack1.cornerRadius = 10
    barStack1.borderColor = new Color('#D50000', 0.8);
    barStack1.borderWidth = 2.5

    const oilTipsText = barStack1.addText((oilsAlert.length < 45 ? `${oilsAlert}，大家互相转告油价调整信息` : oilsAlert) + `【 ${GMT} 】`);
    oilTipsText.textColor = fm.fileExists(bgImage) ? Color.white() : new Color('#5e5e5e');
    oilTipsText.font = Font.boldSystemFont(13);
    oilTipsText.centerAlignText();
    dataStack2.addSpacer();
    mainStack.addSpacer(10);
    
    const dataStack = mainStack.addStack();
    dataStack.addSpacer();
    
    // Oil_0 bar
    const barStack0 = dataStack.addStack();
    barStack0.setPadding(3, wide, 3, wide);
    barStack0.backgroundColor = new Color('#FB8C00');
    barStack0.cornerRadius = 10
    barStack0.borderColor = new Color('#FB8C00');
    barStack0.borderWidth = 3

    const totalMonthBar0 = barStack0.addText(`0# - ${oil0}`);
    totalMonthBar0.font = Font.mediumSystemFont(14);
    totalMonthBar0.textColor = Color.white();
    dataStack.addSpacer(value);
    
    // Oil_92 bar
    const barStack2 = dataStack.addStack();
    barStack2.setPadding(3, wide, 3, wide);
    barStack2.backgroundColor = Color.blue();
    barStack2.cornerRadius = 10
    barStack2.borderColor = Color.blue();
    barStack2.borderWidth = 3

    totalMonthBar2 = barStack2.addText(`92 - ${oil92}`);
    totalMonthBar2.font = Font.mediumSystemFont(14);
    totalMonthBar2.textColor = new Color('#FFFFFF');
    dataStack.addSpacer(value)
    
    // Oil_95 bar
    const barStack5 = dataStack.addStack();
    barStack5.setPadding(3, wide, 3, wide);
    barStack5.backgroundColor = new Color('#00C853');
    barStack5.cornerRadius = 10
    barStack5.borderColor = new Color('#00C853');
    barStack5.borderWidth = 3

    const totalMonthBar5 = barStack5.addText(`95 - ${oil95}`);
    totalMonthBar5.font = Font.mediumSystemFont(14);
    totalMonthBar5.textColor = new Color('#FFFFFF');
    dataStack.addSpacer(value)
    
    // Oil_98 bar
    const barStack8 = dataStack.addStack();
    barStack8.setPadding(3, wide, 3, wide);
    barStack8.backgroundColor = Color.purple();
    barStack8.cornerRadius = 10
    barStack8.borderColor = Color.purple();
    barStack8.borderWidth = 3

    const totalMonthBar8 = barStack8.addText(`98 - ${oil98}`);
    totalMonthBar8.font = Font.mediumSystemFont(14);
    totalMonthBar8.textColor = new Color('#FFFFFF');
    dataStack.addSpacer();
    
    return widget;
  };
  
  if (oilsAlert.length !== setting.oilsAlert.length) {
    const notice = Object.assign(new Notification(), { 
      title: `${setting.province}油价涨跌调整‼️`, 
      body: oilsAlert, 
      sound: 'alert' 
    });
    notice.schedule();
    fm.writeString(cacheFile, JSON.stringify({ ...setting, oils, oilsAlert }, null, 2));
  };
  
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
  };
  
  const runWidget = async () => {
    const widget = await createWidget();
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
  };
  runWidget();
}
module.exports = { main }