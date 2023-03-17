// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: file-alt;
/**
 * 小组件作者：95度茅台
 * UITable 版本: Version 1.0.0
 * 2023-03-17 19:30
 * 🔥示例图渐变颜色 #FFE5B4
 * Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy
 */

async function main() {
  const uri = Script.name();
  const phoneSize = Device.screenSize().height;
  const F_MGR = FileManager.local();
  const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), "95duJingDong_BaiTiao");
  const cacheFile = F_MGR.joinPath(folder, 'setting.json');
  const bgPath = F_MGR.joinPath(F_MGR.documentsDirectory(), "95duBackground");
  const bgImage = F_MGR.joinPath(bgPath, uri + ".jpg");
  
  if (F_MGR.fileExists(cacheFile)) {
    data = F_MGR.readString(cacheFile);
    setting = JSON.parse(data);
    cookie = setting.cookie;
  }
  
  const notify = async (title, body, url) => {
    let n = new Notification();
    n.title = title
    n.body = body
    n.sound = 'alert'
    if (url) {n.openURL = url}
    return await n.schedule();
  }
  
  const score = await LvlProgress('https://ms.jr.jd.com/gw/generic/zc/h5/m/queryAccountLvlProgress');
  const { lvlScore, curScore, code, nextLvl } = score;
  
  const stripe = await whiteStripe('https://ms.jr.jd.com/gw/generic/bt/h5/m/btJrFirstScreenV2');
  const {
    scorePopJumpUrl,
    title,
    identityPicture,
    portrait,
    percent,
    progressNextLevelText
  } = stripe.right.data;
  
  let level = '6'//title.match(/\d/)[0];
  if (level === '1') {
    levelColor = '#4FC3F7'
    levelTextColor = '#000000'
    barColor = new Color(levelColor, 0.6);
  } else if (level === '2') {
    levelColor = '#99C0F0'
    levelTextColor = '#000000'
    barColor = new Color(levelColor, 0.6);
  } else if (level === '3') {
    levelColor = '#FF9999'
    levelTextColor = '#FFFFFF'
    barColor = new Color(levelColor, 0.6);
  } else if (level === '4') {
    levelColor = '#F72E27'
    levelTextColor = '#FFFFFF'
    barColor = new Color(levelColor, 0.6);
  } else if (level === '5') {
    levelColor = '#AB0D0D'
    levelTextColor = '#FFFFFF'
    barColor = new Color(levelColor, 0.6);
  } else if (level === '6') {
    levelColor = Color.dynamic(
      new Color('#222222'),
      new Color("#333333")
    );;
    levelTextColor = '#FFFFFF'
    barColor = Color.dynamic(
      new Color('#222222', 0.5),
      new Color("#444444")
    );;
  }
  
  
  async function createWidget() {
    const widget = new ListWidget();
    if (F_MGR.fileExists(bgImage)) {
      widget.backgroundImage = await shadowImage(F_MGR.readImage(bgImage))
    } else if (setting.gradient.length !== 0) {
      const gradient = new LinearGradient();
      color = setting.gradient
      const items = color[Math.floor(Math.random() * color.length)];
      gradient.locations = [0, 1]
      gradient.colors = [
        new Color(items, Number(setting.transparency)),
        new Color('#00000000')
      ]
      widget.backgroundGradient = gradient
    } else {
      widget.backgroundColor = Color.dynamic(new Color('#4FC3F7', 0.2), new Color("#111111"));
    }
    
    
    /** 
    * @param {image} image
    * @param {string} string
    */
    widget.setPadding(0, 0, 0, 0);
    const mainStack = widget.addStack();
    mainStack.layoutVertically();
    mainStack.centerAlignContent();
    mainStack.setPadding(10, 10, 10, 10);
    mainStack.addSpacer();
    // avatarStack
    const avatarStack = mainStack.addStack();
    avatarStack.layoutHorizontally();
    avatarStack.centerAlignContent();
    avatarStack.setPadding(0, 15, 0, 15);
    const avatarStack2 = avatarStack.addStack();
    const iconSymbol = await circleImage(portrait);  
    
    if (setting.isPlus === 'true') {
      avatarStack2.backgroundImage = iconSymbol;
      const plus = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/plus.png');
      const plusImage = avatarStack2.addImage(plus);
      plusImage.imageSize = new Size(55, 55);
    } else {
      const avatarIcon = avatarStack2.addImage(iconSymbol);
      avatarIcon.imageSize = new Size(55, 55);
      avatarStack2.cornerRadius = 50;
      avatarStack2.borderWidth = 3;
      avatarStack2.borderColor = new Color('#FFBF00');
    }
    avatarStack.addSpacer(15);
    
    const btStack = avatarStack.addStack();
    btStack.layoutVertically();
    btStack.centerAlignContent();
    const barStack = btStack.addStack();
    barStack.layoutHorizontally();
    barStack.centerAlignContent();
    barStack.backgroundColor = level === '6' ? levelColor : new Color(levelColor);
    barStack.setPadding(1, 15, 1, 15);
    barStack.cornerRadius = 10;
    
    const iconSF = SFSymbol.named('crown.fill');
    const barIcon = barStack.addImage(iconSF.image);
    barIcon.imageSize = new Size(20, 20);
    barIcon.tintColor = new Color('#FDDA0D');
    barStack.addSpacer(4);
    
    const titleText = barStack.addText(title);
    titleText.font = Font.boldSystemFont(13);
    titleText.textColor = new Color(levelTextColor)
    btStack.addSpacer(5)
    
    
    const pointStack = btStack.addStack();
    pointStack.layoutHorizontally();
    pointStack.centerAlignContent();
    const baitiaoImage = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/baitiao.png');
    const baitiaoIcon = pointStack.addImage(baitiaoImage);
    baitiaoIcon.imageSize = new Size(25, 18);
    pointStack.addSpacer(8);
    
    const LevelText = pointStack.addText(progressNextLevelText);
    LevelText.font = Font.mediumSystemFont(12);
    LevelText.textOpacity = 0.7;
    pointStack.addSpacer(8);
    
    const barStack2 = pointStack.addStack();
    barStack2.layoutHorizontally();
    barStack2.centerAlignContent();
    barStack2.backgroundColor = new Color('#FF9500', 0.7);
    barStack2.setPadding(1, 8, 1, 8);
    barStack2.cornerRadius = 10;
    
    const pointText = barStack2.addText(lvlScore);
    pointText.font = Font.boldSystemFont(11);
    pointText.textColor = new Color('#FFFFFF');
    avatarStack.addSpacer();
    mainStack.addSpacer();
    
    
    /** 
    * Middle Stack
    * @param {image} image
    * @param {string} string
    */
    const middleStack = mainStack.addStack();
    middleStack.layoutHorizontally();
    middleStack.centerAlignContent();
    middleStack.setPadding(0, 15, 0, 15);
    
    const quotaStack = middleStack.addStack();  
    quotaStack.layoutVertically();
    quotaStack.centerAlignContent();
    const quotaText = quotaStack.addText('可用额度');
    quotaText.font = Font.mediumSystemFont(12);
    quotaText.textOpacity = 0.5;
    quotaStack.addSpacer(3);
    
    const quota = quotaStack.addText(stripe.quota.quotaLeft.replace(',', ''));
    quota.font = Font.boldSystemFont(17);
    quotaStack.addSpacer(3);

    const quotaText2 = quotaStack.addText(`总额度 ${stripe.quota.quotaAll.replace(',', '')}`);
    quotaText2.font = Font.mediumSystemFont(12);
    quotaText2.textOpacity = 0.5;
    middleStack.addSpacer();
    
    
    const assetIcon = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/walket.png');
    const assetIconElement = middleStack.addImage(assetIcon);
    assetIconElement.imageSize = new Size(53, 53);
    middleStack.addSpacer();
    
    
    const billStack = middleStack.addStack();    
    billStack.layoutVertically();  
    billStack.centerAlignContent();
    const billText = billStack.addText('当月待还');  
    billText.font = Font.mediumSystemFont(12);
    billText.textOpacity = 0.5;
    billStack.addSpacer(3);
    
    const bill = billStack.addText(stripe.bill.amount.replace(',', ''));
    bill.font = Font.boldSystemFont(15);
    billStack.addSpacer(3);

    const billText2 = billStack.addText(stripe.bill.buttonName);  
    billText2.font = Font.mediumSystemFont(12);
    billText2.textOpacity = 0.5;
    mainStack.addSpacer();
    
    
    /** 
    * bottom Stack
    * @param {image} image
    * @param {string} string
    */
    const prgrWid = Number(setting.progressWidth);
    const tempBarWidth = curScore === '0' ? prgrWid : prgrWid - 15;
    const tempBarHeight = 18
    const progressColor = "#f2f5f7"
    
    const prgsStack = mainStack.addStack();  
    prgsStack.layoutHorizontally();
    prgsStack.centerAlignContent();
    prgsStack.setPadding(0, 15, 0, 15);
    
    const curScoreText = prgsStack.addText(curScore)
    curScoreText.font = Font.mediumSystemFont(13);
    prgsStack.addSpacer();
    
    const imgProgress = prgsStack.addImage(creatProgress());
    imgProgress.centerAlignImage();
    imgProgress.imageSize = new Size(tempBarWidth, tempBarHeight);
    
    function creatProgress() {
      const draw = new DrawContext();
      draw.opaque = false;
      draw.respectScreenScale = true;
      draw.size = new Size(tempBarWidth, tempBarHeight);
    
      const barPath = new Path();
      const barHeight = tempBarHeight - 10;
      barPath.addRoundedRect(new Rect(0, 5, tempBarWidth, barHeight), barHeight / 2, barHeight / 2);
      draw.addPath(barPath);
      
      draw.setFillColor((barColor));
      draw.fillPath();
    
      const currPath = new Path();
      const isPercent = percent > 1 ? percent / 100 : percent;
      currPath.addEllipse(new Rect((tempBarWidth - tempBarHeight) * isPercent, 0, tempBarHeight, tempBarHeight));
      draw.addPath(currPath);
      // #00FF00
      draw.setFillColor(new Color(progressColor));
      draw.fillPath();
      return draw.getImage();
    }
    
    prgsStack.addSpacer();
    const percentText = prgsStack.addText(`${percent} %`)
    percentText.font = Font.mediumSystemFont(13);
    mainStack.addSpacer();
    
    
    if (config.runsInWidget) {
      Script.setWidget(widget);
      Script.complete();
    } else {
      await widget.presentMedium()
    }
  }
  
  
  /**-------------------------**/
     /** Request(url) json **/
  /**-------------------------**/
  
  const isSmallWidget =  config.widgetFamily === 'small';
  if (isSmallWidget && config.runsInWidget) {
    await smallrWidget();
  } else if (setting.code === 0) {
    //await Run();
    await createWidget();
  } else {
    await createErrWidget();
  }
  
  async function smallrWidget() {
    const widget = new ListWidget();
    const text = widget.addText('仅支持中尺寸');
    text.font = Font.systemFont(17);
    text.centerAlignText();
    Script.setWidget(widget);
    Script.complete();
  }
  
  /**-------------------------**/
     /** Request(url) json **/
  /**-------------------------**/
  
  async function whiteStripe(url) {
    const req = new Request(url)
    req.method = 'POST'
    req.headers = {
      Cookie: cookie,
      Referer: 'https://mcr.jd.com/'
    }
    req.body = `reqData={"environment":"1","clientType":"ios","clientVersion":"11.6.4"}`
    const res = await req.loadJSON();
    return res.resultData.data
  }
  
  async function LvlProgress(url) {
    const req = new Request(url)
    req.method = 'POST'
    req.headers = {
      Cookie: cookie,
      Referer: 'https://agree.jd.com/'
    }
    req.body = `reqData={"appId":"benefitGateway","channelId":"1","customerId":"1","shopId":"1","deviceInfo":{}}`
    const res = await req.loadJSON();
    return res.resultData
  }
  
  async function getImage(url) {
    const r = await new Request(url);
    return await r.loadImage();
  }
  
  async function shadowImage(img) {
    let ctx = new DrawContext()
    ctx.size = img.size
    ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']))
    ctx.setFillColor(new Color("#000000", Number(setting.masking)));
    ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']))
    return await ctx.getImage()
  }
  
  async function circleImage(url) {
    const req = new Request(url);  
    let img = await req.loadImage()
    const imgData = Data.fromPNG(img).toBase64String();
    const html = `
      <img id="sourceImg" src="data:image/png;base64,${imgData}" />
      <img id="silhouetteImg" src="" />
      <canvas id="mainCanvas" />
        `
    const js = `
      var canvas = document.createElement("canvas");
      var sourceImg = document.getElementById("sourceImg");
      var silhouetteImg = document.getElementById("silhouetteImg");
      var ctx = canvas.getContext('2d');
      canvas.width = sourceImg.width;
      canvas.height = sourceImg.height;
      ctx.save();
      ctx.arc(sourceImg.width / 2, sourceImg.height / 2, sourceImg.height / 2.1, 0, 1.9 * Math.PI);
      ctx.clip();
      ctx.drawImage(sourceImg, 0, 0);
      ctx.restore();
      var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imgData,0,0);
      silhouetteImg.src = canvas.toDataURL();
      output=canvas.toDataURL();
        `
    let wv = new WebView();
    await wv.loadHTML(html);
    const base64Image = await wv.evaluateJavaScript(js);
    const iconImage = await new Request(base64Image).loadImage();
    return iconImage
  }
  
  async function createErrWidget() {
    const widget = new ListWidget();
    const image = await getImage('http://mtw.so/5Zca3L');
    const widgetImage = widget.addImage(image);
    widgetImage.imageSize = new Size(50, 50);
    widgetImage.centerAlignImage();
    widget.addSpacer(10);
    const text = widget.addText('用户未登录');
    text.font = Font.systemFont(17);
    text.centerAlignText();
    Script.setWidget(widget);
  }
}
module.exports = { main }