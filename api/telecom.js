// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: exclamation-circle;
/**
 * 小组件作者: 95度茅台
 * 小组件名称: 中国电信余量
 * Version 1.2.5 
修复每日用量错误问题 ( 每月1日自动清零 )
 * 2023-03-01 14:30
 * Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy
 * 更新组件 https://gitcode.net/4qiao/scriptable/raw/master/api/95duScriptStore.js
 */

const F_MGR = FileManager.local();
const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), "telecom");
if (!F_MGR.fileExists(folder)) {
  F_MGR.createDirectory(folder);
}

const cacheFile = F_MGR.joinPath(folder, 'setting.json');
if (F_MGR.fileExists(cacheFile)) {
  data = F_MGR.readString(cacheFile);
  setting = JSON.parse(data);
  cookie = setting.cookie
} else {
  if (config.runsInApp) {
    const webview = new WebView();
    await webview.loadURL('http://u3v.cn/5uwtIP');
    await webview.present();
    cookie = await webview.evaluateJavaScript('document.cookie');
    console.log(cookie);
  } else { return }
}

logoColor = Color.dynamic(new Color('#004A8B'), new Color('#1da0f2'));
widgetBgColor = Color.dynamic(
new Color("#fefefe"), new Color("#1e1e1e"));
stackBgColor = Color.dynamic(new Color("#dfdfdf"), new Color("#444444"));
barBgColor = Color.dynamic(new Color("#dfdfdf"), new Color("#cfcfcf"));
MainTextColor = Color.dynamic(new Color("#000000"), new Color("#ffffff"));
SubTextColor = Color.dynamic(new Color("#666666"), new Color("#aaaaaa"));

// Small Widget Color
bgColor1 = Color.dynamic(new Color('#EEEEEE'), new Color('#151515'));  
bgColor2 = Color.dynamic(new Color('#FFFFFF'), new Color('#13233F'));
textColor = Color.dynamic(new Color('#484848'), new Color('#E0E0E0'));
barColor = Color.dynamic(new Color('#CFCFCF'), new Color('#7A7A7A'));
progressColor = Color.dynamic(new Color('#34C759'),new Color('#00b100'));

const balUrl = new Request('https://e.189.cn/store/user/balance_new.do?t=189Bill');
balUrl.method = 'GET'
balUrl.headers = { Cookie: cookie }
const balances = await balUrl.loadJSON();
const balanceAvailable = (balances.totalBalanceAvailable / 100).toFixed(2);

const package = new Request('https://e.189.cn/store/user/package_detail.do?t=189Bill');
package.method = 'GET'
package.headers = { Cookie: cookie }
const res = await package.loadJSON();
console.log(res)
if (!res.voiceAmount) {
  voiceAmount = '1';
  voiceBalance = '0';
  voice = '0';
} else {
  voiceAmount = res.voiceAmount
  voiceBalance = res.voiceBalance
  voice = (voiceBalance / voiceAmount * 100).toPrecision(3);
}

let pacArr = [];
let newArr = [];
let balArr = [];
const arr = res.items
for (let i in arr) {
  pacArr.push(...arr[i].items);
}

for (const item of pacArr) {
  if (item.ratableAmount !== '999999999999' && item.ratableResourcename.indexOf('流量') > -1  && item.ratableResourcename.indexOf('定向') === -1) {
    newArr.push(item.ratableAmount);
    balArr.push(item.balanceAmount);
  }
}

if (newArr.length > 0) {
  flowTotal = newArr.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue)) / 1048576
  bal = balArr.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue)) / 1048576
} else {
  flowTotal = res.total / 1048576
  bal = res.balance / 1048576
}

const flowBalance = bal.toFixed(2);
const flow = (bal / flowTotal * 100).toPrecision(3);

const dayNumber = Math.floor(Date.now() / 1000 / 60 / 60 / 24);
const df = new DateFormatter();
df.dateFormat = 'ddHHmm'
const day1st = df.string(new Date());

if (!F_MGR.fileExists(cacheFile) || dayNumber !== setting.dayNumber) {
  setting = {
    flow: flow,
    voice: voice,
    dayNumber: dayNumber,
    flowBalance: flowBalance,
    voiceBalance: voiceBalance,
    cookie: cookie.match(/(CZSSON=[a-zA-Z\d]+)/)[1]
  }
  F_MGR.writeString(cacheFile, JSON.stringify(setting));
}

const Step1st = 25;
const Step2nd = 85;
const StepFin = 100;
const barWidth = 15;
const barHeigth = 105;
const phone = Device.screenSize().height;
const image = await new Request('https://gitcode.net/4qiao/scriptable/raw/master/img/icon/TelecomLogo.png').loadImage();

const isSmallWidget =  config.widgetFamily === 'small'
if (config.runsInWidget && isSmallWidget) {
  await createSmallWidget();
} else {
  await createWidget();
}

/**
 * Create Medium Widget
 * @param { string } string
 * @param { image } image
 */
async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = widgetBgColor;
  widget.setPadding(15, 15, 15, 15);
  const top = widget.addStack();
  top.layoutHorizontally();
  top.size = new Size(0, phone < 926 ? 25 : 30);
  
  const leftStack = top.addStack();
  leftStack.centerAlignContent();
  leftStack.addSpacer();
  const logoImage = 
  leftStack.addImage(image);
  logoImage.imageSize = new Size(phone < 926 ? 90 : 100, phone < 926 ? 25 : 30);
  logoImage.tintColor = logoColor
  logoImage.centerAlignImage();
  leftStack.addSpacer();
  top.addSpacer(52);
  
  const rightStack = top.addStack()
  rightStack.centerAlignContent();
  rightStack.addSpacer();
  let balanceText = rightStack.addText(balanceAvailable);
  balanceText.centerAlignText();
  balanceText.textColor = Color.red()
  balanceText.font = new Font('Georgia-Bold', phone < 926 ? 20 : 25);
  rightStack.addSpacer();
  widget.addSpacer(phone < 926 ? 3 : 5);
  
  /** 
   * Stacks and Bar
   * @param { string } string
   */
  const Content = widget.addStack();
  Content.setPadding(2, 2, 2, 2);
  Content.layoutHorizontally();
  
  const Stack1 = Content.addStack();
  Stack1.layoutVertically();
  Stack1.backgroundColor = stackBgColor
  Stack1.cornerRadius = 8;
  Stack1.addSpacer(9);
  
  const Stack1Head = Stack1.addStack();
  Stack1Head.addSpacer();
  let flowTitleText = Stack1Head.addText('剩余流量');
  flowTitleText.textColor = SubTextColor
  flowTitleText.font = Font.mediumSystemFont(12);
  Stack1Head.addSpacer();
  Stack1.addSpacer(3);
  
  const flowStack = Stack1.addStack();
  flowStack.addSpacer();
  let flowText = flowStack.addText(flowBalance + ' GB');
  flowText.textColor = MainTextColor
  flowText.font = Font.boldSystemFont(15);
  flowStack.addSpacer();
  
  const usedFlowStack = Stack1.addStack();
  usedFlowStack.addSpacer();
  if (day1st > '010000' && day1st < '010030') {
    usedFlowText = usedFlowStack.addText(`- ${(flowBalance - flowBalance).toFixed(2)}`);
  } else {
    usedFlowText = usedFlowStack.addText(`- ${(setting.flowBalance - flowBalance).toFixed(2)}`);
  }
  usedFlowText.textColor  = SubTextColor
  usedFlowText.font = Font.systemFont(12);
  usedFlowStack.addSpacer();
  Stack1.addSpacer(5);
  
  const Stack1Percent = Stack1.addStack();
  Stack1Percent.layoutHorizontally();
  Stack1Percent.centerAlignContent();
  Stack1Percent.addSpacer();
  let percentText1 = Stack1Percent.addText(flow);
  percentText1.textColor = MainTextColor
  percentText1.font = Font.boldSystemFont(28);
  percentSymbol1 = Stack1Percent.addText(' %');
  percentSymbol1.textColor = SubTextColor
  percentSymbol1.font = Font.systemFont(20);
  Stack1Percent.addSpacer();
  Stack1.addSpacer();
  Content.addSpacer();
  
  // Progress bar 1
  const BarContent1 = Content.addStack();
  BarContent1.layoutVertically();
  const progressBar1st = BarContent1.addImage(creatProgress(flow, setting.flow));
  progressBar1st.cornerRadius = 5.5
  progressBar1st.imageSize = new Size(barWidth, barHeigth);
  Content.addSpacer();
 
  // Progress bar 2
  const BarContent2 = Content.addStack();
  BarContent2.layoutVertically();
  const progressBar2nd = BarContent2.addImage(creatProgress(voice, setting.voice));
  progressBar2nd.cornerRadius = 5.5
  progressBar2nd.imageSize = new Size(barWidth, barHeigth);
  Content.addSpacer();
  
  const Stack2 = Content.addStack();
  Stack2.layoutVertically();
  Stack2.backgroundColor = stackBgColor
  Stack2.cornerRadius = 8;
  Stack2.addSpacer(9);
  
  const Stack2Head = Stack2.addStack();
  Stack2Head.addSpacer();
  let voiceTitleText = Stack2Head.addText('剩余语音');
  voiceTitleText.textColor = SubTextColor
  voiceTitleText.font = Font.mediumSystemFont(12);
  Stack2Head.addSpacer();
  Stack2.addSpacer(3);
   
  const voiceStack = Stack2.addStack();
  voiceStack.addSpacer();
  let voiceText = voiceStack.addText(voiceBalance + ' Min');
  voiceText.textColor = MainTextColor
  voiceText.font = Font.boldSystemFont(15);
  voiceStack.addSpacer();
  
  const voiceUsedStack = Stack2.addStack();
  voiceUsedStack.addSpacer();
  if (day1st > '010000' && day1st < '010030') {
    voiceUsedText = voiceUsedStack.addText(`- ${voiceBalance - voiceBalance}`);
  } else {
    voiceUsedText = voiceUsedStack.addText(`- ${setting.voiceBalance - voiceBalance}`);
  }
  voiceUsedText.textColor  = SubTextColor
  voiceUsedText.font = Font.systemFont(12);
  voiceUsedStack.addSpacer();
  Stack2.addSpacer(5);
  
  const Stack2Percent = Stack2.addStack();
  Stack2Percent.layoutHorizontally();
  Stack2Percent.centerAlignContent();
  Stack2Percent.addSpacer();
  
  let percentText2 = Stack2Percent.addText(voice);
  percentText2.textColor = MainTextColor
  percentText2.font = Font.boldSystemFont(28);
  percentSymbol2 = Stack2Percent.addText(' %');
  percentSymbol2.textColor = SubTextColor
  percentSymbol2.font = Font.systemFont(20);
  Stack2Percent.addSpacer();
  Stack2.addSpacer();
  
  if (!config.runsInWidget) {  
    await widget.presentMedium();
  } else {
    Script.setWidget(widget);
    Script.complete();
  }
}
  
// Create Progress BarValue
function creatProgress(barValue1, barValue2) {
  barValue1 = Math.round(barValue1);
  barValue2 = Math.round(barValue2);
  const context = new DrawContext();
  context.size = new Size(barWidth, barHeigth);
  context.opaque = false
  context.respectScreenScale = true
  
  const path = new Path();
  path.addRoundedRect(new Rect(0, 0, barWidth, barHeigth), 4, 4);
  context.addPath(path);
  context.setFillColor(barBgColor);
  context.fillPath();
  
  // BarValue1 Color
  if (barValue1 <= Step1st) {BarColor1 = new Color("#bb1e10")}
  if (barValue2 <= Step1st) {BarColor2 = new Color("#bb1e1075")} 
 
  if (barValue1 >= Step1st && barValue1 < Step2nd) {BarColor1 = new Color("#f7b500")}
  else if (barValue1 >= Step2nd) {BarColor1 = new Color("#00b347")}
 
  // BarValue2 Color
  if (barValue2 >= Step1st && barValue2 < Step2nd) {BarColor2 = new Color("#f7b50075")} 
  else if (barValue2 >= Step2nd) {BarColor2 = new Color("#00b34775")}
  
  // BarValue1
  context.setFillColor(BarColor1);
  const path1 = new Path();
  const path1BarHeigth = (barHeigth * (barValue1 / StepFin) > barHeigth) ? barHeigth : barHeigth * (barValue1 / StepFin);
  path1.addRoundedRect(new Rect(0, barHeigth, barWidth, -path1BarHeigth), 2, 2);
  context.addPath(path1);
  context.fillPath();
  
  // BarValue2
  context.setFillColor(BarColor2);
  const path2 = new Path();
  const path2BarHeigth = (barHeigth * (barValue2 / StepFin) > barHeigth) ? barHeigth : barHeigth * (barValue2 / StepFin);
  path2.addRoundedRect(new Rect(0, barHeigth, barWidth, -path2BarHeigth), 2, 2);
  context.addPath(path2);
  context.fillPath();
  // context Font(size)
  context.setFont(
    Font.boldSystemFont(8)
  );
  context.setTextAlignedCenter();
  
  if (barValue1 < 90) {
    context.setTextColor(  
      new Color("#666666")
    );
    context.drawTextInRect('%', new Rect(0, 3, barWidth, barHeigth));
  } else {
    context.setTextColor(
      Color.white()
    );
    context.drawTextInRect('%', new Rect(0, barHeigth - 15, barWidth, barHeigth));
  }
  
  if (barValue1 <= 10) {
    PosCorr = -10
    context.setTextColor(
      Color.black()
    );
  } else {
    PosCorr = 2
    context.setTextColor(
      Color.white()
    );
  }
  context.drawTextInRect(
    barValue1.toString(),
    new Rect(0, barHeigth - path1BarHeigth + PosCorr, barWidth, path1BarHeigth - PosCorr)
  );
  return context.getImage();
}

/**
 * Create Small Widget
 * @param { string } string
 * @param { image } image
 */
async function createSmallWidget() {
  const widget = new ListWidget();
  widget.setPadding(0, 0, -6, 0);
  const gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    bgColor1,
    bgColor2
  ]
  widget.backgroundGradient = gradient
  
  const width = 130
  const height = 10
  
  const logoImage = 
  widget.addImage(image);
  logoImage.imageSize = new Size(130, 35);
  logoImage.tintColor = logoColor
  logoImage.centerAlignImage();
  
  const balText = widget.addText('' + balanceAvailable);  
  balText.textColor = Color.orange();
  balText.font = new Font("Georgia-Bold", 22);
  balText.centerAlignText();
  widget.addSpacer(3)
  
  getwidget(voiceAmount, voiceBalance, `剩余语音 ${voiceBalance} 分钟`);
  getwidget(flowTotal, bal, `剩余流量 ${flowBalance} GB`);
  
  function getwidget(flowTotal, haveGone, str) {
    const titlew = widget.addText(str);
    titlew.centerAlignText();
    titlew.textColor = textColor
    titlew.font = Font.boldSystemFont(13);
    widget.addSpacer(3)
    
    const imgw = widget.addImage(creatProgress(flowTotal, haveGone));
    imgw.centerAlignImage();
    imgw.cornerRadius = 5.2
    imgw.imageSize = new Size(width, height);
    widget.addSpacer(5)
  }
  
  function creatProgress(flowTotal, havegone) {
    const context = new DrawContext();
    context.size = new Size(width, height);
    context.opaque = false
    context.respectScreenScale = true
    context.setFillColor(barColor);
    
    const path = new Path();
    path.addRoundedRect(new Rect(0, 0, width, height), 3, 2);
    context.addPath(path);
    context.fillPath();
    context.setFillColor(
      progressColor
    );
    
    const path1 = new Path();
    path1.addRoundedRect(new Rect(0, 0, width * havegone / flowTotal, height), 3, 0)
    context.addPath(path1);
    context.fillPath();
    return context.getImage();
  }
  
  if (config.runsInWidget) {
    Script.setWidget(widget);
    Script.complete();
  } else {
    await widget.presentSmall();
  }
}