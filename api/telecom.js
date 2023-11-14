// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: exclamation-circle;
/**
 * 组件作者: 95度茅台
 * 组件名称: 中国电信余量
 * Version 1.2.5 
修复每日用量错误问题 ( 每月1日自动清零 )
 * 2023-11-14 14:30
 * Telegram 交流群 https://t.me/+CpAbO_q_SGo2ZWE1
 * 更新组件 https://gitcode.net/4qiao/scriptable/raw/master/api/95duScriptStore.js
 */

const fm = FileManager.local();
const folder = fm.joinPath(fm.documentsDirectory(), "telecom");
fm.createDirectory(folder, true);

const cacheFile = fm.joinPath(folder, 'setting.json');

if (fm.fileExists(cacheFile)) {
  data = fm.readString(cacheFile);
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
};

widgetBgColor = Color.dynamic(
new Color("#fefefe"), new Color("#111111"));
stackBgColor = Color.dynamic(new Color("#dfdfdf"), new Color("#444444"));
barBgColor = Color.dynamic(new Color("#dfdfdf"), new Color("#cfcfcf"));
MainTextColor = Color.dynamic(new Color("#000000"), new Color("#ffffff"));
SubTextColor = Color.dynamic(new Color("#666666"), new Color("#aaaaaa"));

// Small Widget Color
bgColor1 = Color.dynamic(new Color('#EEEEEE'), new Color('#151515'));  
bgColor2 = Color.dynamic(new Color('#FFFFFF'), new Color('#13233F'));
textColor = Color.dynamic(new Color('#484848'), new Color('#E0E0E0'));
barColor = Color.dynamic(new Color('#CFCFCF'), new Color('#7A7A7A'));

const makeRequest = async (url) => {
  const request = new Request(url);
  request.method = 'GET';
  request.headers = {
    Cookie: cookie
  };
  return await request.loadJSON();
};

// Voice Package
const fetchVoice = async () => {
  const package = await makeRequest('https://e.189.cn/store/user/package_detail.do?t=189Bill');
  const { items, total, balance, voiceAmount, voiceBalance } = package
  if (!voiceAmount) {
    return { voiceAmount: '1', voiceBalance: '0', voice: '0' };
  } else {
    return { items, total, balance, voiceAmount, voiceBalance, voice: (voiceBalance / voiceAmount * 100).toPrecision(3) };
  }
};

const { items, total, balance, voiceAmount, voiceBalance, voice } = await fetchVoice();

// Balance
const balances = await makeRequest('https://e.189.cn/store/user/balance_new.do?t=189Bill');
const balanceAvailable = (balances.totalBalanceAvailable / 100).toFixed(2);

let pacArr = [];
let newArr = [];
let balArr = [];
for (let i in items) {
  pacArr.push(...items[i].items);
}

for (const item of pacArr) {
  const { ratableAmount: amount, ratableResourcename: name, balanceAmount: balAmount } = item;
  if (name.includes('流量') && !name.includes('定向') && amount < '999999990000') {
    newArr.push(amount);
    balArr.push(balAmount);
  }
};

const flowTotal = newArr.length > 0 ? newArr.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue)) / 1048576 : total / 1048576
const bal = newArr.length > 0 ? balArr.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue)) / 1048576 : balance / 1048576

const flowBalance = bal.toFixed(2);
const flow = (bal / flowTotal * 100).toPrecision(3);

/**
 * Get dayNumber
 * Initial
 * Daily dosage
 */
const dayNumber = Math.floor(Date.now() / 1000 / 60 / 60 / 24);
if (!fm.fileExists(cacheFile) || dayNumber !== setting.dayNumber) {
  setting = {
    flow,
    voice,
    dayNumber,
    flowBalance,
    voiceBalance,
    cookie: cookie.match(/(CZSSON=[a-zA-Z\d]+)/)[1]
  }
  fm.writeString(cacheFile, JSON.stringify(setting));
};

// 进度颜色
const getColor = (value, isOpaque = false) => {
  const colorMap = new Map([
    [ 10, isOpaque ? new Color("#F7B50075") : new Color("#FF0000") ],
    [ 20, isOpaque ? new Color("#BE62F375") : new Color("#F7B500") ],
    [ 40, isOpaque ? new Color("#0083FF75") : new Color("#FFA500") ],
    [ 50, isOpaque ? new Color("#FFA50075") : new Color("#BE62F3") ],
    [ 65, isOpaque ? new Color("#FFA50075") : new Color("#0083FF") ],
    [ 75, isOpaque ? new Color("#FFA50075") : new Color("#44CB9C") ]
  ]);
  
  for (let [thresholdBetween, color] of colorMap) {
    if (value <= thresholdBetween) return color;
  }
  return isOpaque ? new Color("#FFA50075") : new Color("#00C400");
};

// ======== config ======== //

const StepFin = 100;
const barWidth = 15;
const barHeigth = 111;

const phone = Device.screenSize().height;

const df = new DateFormatter();
df.dateFormat = 'ddHHmm'
const day1st = df.string(new Date());
  
// Logo image
const getImage = async (url) => await new Request(url).loadImage();

const image = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/icon/TelecomLogo.png');
const image1 = await getImage('https://gitcode.net/4qiao/framework/raw/master/img/icon/telecom_1.png');

/**
 * Create Medium Widget
 * @param { string } string
 * @param { image } image
 */
const createWidget = async () => {
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
  logoImage.tintColor = new Color('#2B83F1');
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
  Stack1.backgroundColor = stackBgColor;
  Stack1.cornerRadius = 8;
  Stack1.addSpacer(12);
  
  const Stack1Head = Stack1.addStack();
  Stack1Head.addSpacer();
  const flowTitleText = Stack1Head.addText('剩余流量');
  flowTitleText.textColor = SubTextColor;
  flowTitleText.font = Font.mediumSystemFont(12);
  Stack1Head.addSpacer();
  Stack1.addSpacer(3);
  
  const flowStack = Stack1.addStack();
  flowStack.addSpacer();
  const flowText = flowStack.addText(flowBalance + ' GB');
  flowText.textColor = MainTextColor
  flowText.font = Font.boldSystemFont(16);
  flowStack.addSpacer();
  
  const usedFlowStack = Stack1.addStack();
  usedFlowStack.addSpacer();
  if (day1st > '010000' && day1st < '010100') {
    usedFlowText = usedFlowStack.addText(`- ${(flowBalance - flowBalance).toFixed(2)}`);
  } else {
    usedFlowText = usedFlowStack.addText(`- ${(setting.flowBalance - flowBalance).toFixed(2)}`);
  }
  usedFlowText.textColor  = SubTextColor;
  usedFlowText.font = Font.boldSystemFont(13);
  usedFlowStack.addSpacer();
  Stack1.addSpacer(5);
  
  const Stack1Percent = Stack1.addStack();
  Stack1Percent.layoutHorizontally();
  Stack1Percent.centerAlignContent();
  Stack1Percent.addSpacer();
  
  const percentText1 = Stack1Percent.addText(flow);
  percentText1.textColor = MainTextColor;
  percentText1.font = Font.boldSystemFont(28);
  percentSymbol1 = Stack1Percent.addText(' %');
  percentSymbol1.textColor = SubTextColor;
  percentSymbol1.font = Font.systemFont(26);
  Stack1Percent.addSpacer();
  Stack1.addSpacer();
  Content.addSpacer();
  
  // Progress bar 1
  const BarContent1 = Content.addStack();
  BarContent1.layoutVertically();
  const progressBar1st = BarContent1.addImage(creatProgress(flow, setting.flow));
  progressBar1st.cornerRadius = 6
  progressBar1st.imageSize = new Size(barWidth, barHeigth);
  Content.addSpacer();
 
  // Progress bar 2
  const BarContent2 = Content.addStack();
  BarContent2.layoutVertically();
  const progressBar2nd = BarContent2.addImage(creatProgress(voice, setting.voice));
  progressBar2nd.cornerRadius = 6
  progressBar2nd.imageSize = new Size(barWidth, barHeigth);
  Content.addSpacer();
  
  const Stack2 = Content.addStack();
  Stack2.layoutVertically();
  Stack2.backgroundColor = stackBgColor;
  Stack2.cornerRadius = 8;
  Stack2.addSpacer(12);
  
  const Stack2Head = Stack2.addStack();
  Stack2Head.addSpacer();
  const voiceTitleText = Stack2Head.addText('剩余语音');
  voiceTitleText.textColor = SubTextColor;
  voiceTitleText.font = Font.mediumSystemFont(12);
  Stack2Head.addSpacer();
  Stack2.addSpacer(3);
   
  const voiceStack = Stack2.addStack();
  voiceStack.addSpacer();
  const voiceText = voiceStack.addText(voiceBalance + ' Min');
  voiceText.textColor = MainTextColor
  voiceText.font = Font.boldSystemFont(16);
  voiceStack.addSpacer();
  
  const voiceUsedStack = Stack2.addStack();
  voiceUsedStack.addSpacer();
  if (day1st > '010000' && day1st < '010030') {
    voiceUsedText = voiceUsedStack.addText(`- ${voiceBalance - voiceBalance}`);
  } else {
    voiceUsedText = voiceUsedStack.addText(`- ${setting.voiceBalance - voiceBalance}`);
  }
  voiceUsedText.textColor  = SubTextColor;
  voiceUsedText.font = Font.boldSystemFont(13);
  voiceUsedStack.addSpacer();
  Stack2.addSpacer(5);
  
  const Stack2Percent = Stack2.addStack();
  Stack2Percent.layoutHorizontally();
  Stack2Percent.centerAlignContent();
  Stack2Percent.addSpacer();
  
  const percentText2 = Stack2Percent.addText(voice);
  percentText2.textColor = MainTextColor;
  percentText2.font = Font.boldSystemFont(28);
  percentSymbol2 = Stack2Percent.addText(' %');
  percentSymbol2.textColor = SubTextColor;
  percentSymbol2.font = Font.systemFont(26);
  Stack2Percent.addSpacer();
  Stack2.addSpacer();
  
  if (!config.runsInWidget) {  
    await widget.presentMedium();
  } else {
    Script.setWidget(widget);
    Script.complete();
  }
};
  
// Create Progress
const creatProgress = (barValue1, barValue2) => {
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
  
  const BarColor1 = getColor(barValue1);
  const BarColor2 = getColor(barValue2, true);
  
  // BarValue2
  context.setFillColor(BarColor2);
  const path2 = new Path();
  const path2BarHeigth = (barHeigth * (barValue2 / StepFin) > barHeigth) ? barHeigth : barHeigth * (barValue2 / StepFin);
  path2.addRoundedRect(new Rect(0, barHeigth, barWidth, -path2BarHeigth), 2, 2);
  context.addPath(path2);
  context.fillPath();
  
  // BarValue1
  context.setFillColor(BarColor1);
  const path1 = new Path();
  const path1BarHeigth = (barHeigth * (barValue1 / StepFin) > barHeigth) ? barHeigth : barHeigth * (barValue1 / StepFin);
  path1.addRoundedRect(new Rect(0, barHeigth, barWidth, -path1BarHeigth), 2, 2);
  context.addPath(path1);
  context.fillPath();
  context.setFont(Font.boldSystemFont(barValue1 > 99 ? 6 : 8));
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
    PosCorr = -15
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
};

/**
 * Create Small Widget
 * @param { string } string
 * @param { image } image
 */
async function createSmallWidget() {
  const widget = new ListWidget();
  widget.setPadding(6, 0, 0, 0);
  const gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    bgColor1,
    bgColor2
  ]
  widget.backgroundGradient = gradient
  
  const width = 128
  const height = 8
  const radius = height / 2
  
  const logoImage = 
  widget.addImage(image1);
  logoImage.imageSize = new Size(130, 40);
  logoImage.centerAlignImage();
  
  const balText = widget.addText('' + balanceAvailable);  
  balText.textColor = Color.orange();
  balText.font = new Font("Georgia-Bold", 22);
  balText.centerAlignText();
  widget.addSpacer(5);
  
  getwidget(voiceAmount, voiceBalance, `${voiceBalance} 分钟 - ${voice}%`, getColor(voice));
  getwidget(flowTotal, bal, `${flowBalance} GB - ${flow}%`, getColor(flow));
  
  function getwidget(flowTotal, haveGone, str, progressColor) {
    const title = widget.addText(str);
    title.centerAlignText();
    title.textColor = textColor;
    title.font = Font.boldSystemFont(14);
    widget.addSpacer(3);
    
    const imgw = widget.addImage(creatProgress(flowTotal, haveGone, progressColor));
    imgw.centerAlignImage();
    imgw.imageSize = new Size(width, height);
    widget.addSpacer(6);
  }
  
  function creatProgress(flowTotal, haveGone, progressColor) {
    const context = new DrawContext();
    context.size = new Size(width, height);
    context.opaque = false
    context.respectScreenScale = true
    context.setFillColor(barColor);
    
    const path = new Path();
    path.addRoundedRect(new Rect(0, 0, width, height), radius, radius);
    context.addPath(path);
    context.fillPath();
    context.setFillColor(haveGone < 0.3 ? widgetBgColor : progressColor);
    
    const path1 = new Path();
    path1.addRoundedRect(new Rect(0, 0, width * haveGone / flowTotal, height), radius, radius);
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
};

// config widget
const runWidget = async () => {  
  const isSmallWidget =  config.widgetFamily === 'small'
  if (config.runsInWidget && isSmallWidget) {
    await createSmallWidget();
  } else {
    await createWidget();
  }
}
await runWidget();