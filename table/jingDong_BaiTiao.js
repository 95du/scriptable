// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: file-alt;
/**
 * 小组件作者：95度茅台
 * UITable 版本: Version 1.0.0
 * 2023-03-17 19:30
 * Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy
 */

async function main() {
  const uri = Script.name();
  const F_MGR = FileManager.local();
  const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), "95duJingDong_BaiTiao");
  const cacheFile = F_MGR.joinPath(folder, 'setting.json');
  const bgPath = F_MGR.joinPath(F_MGR.documentsDirectory(), "95duBackground");
  const bgImage = F_MGR.joinPath(bgPath, uri + ".jpg");
  
  if (F_MGR.fileExists(cacheFile)) {
    data = F_MGR.readString(cacheFile);
    setting = JSON.parse(data);
    cookie = setting.cookie;
    gap = setting.gap;
    location = setting.location;
  }
  
  const notify = async (title, body, url) => {
    let n = new Notification();
    n.title = title
    n.body = body
    n.sound = 'alert'
    if (url) {n.openURL = url}
    return await n.schedule();
  }
  
  
  const loadData = async () => {
    benefit = await LvlProgress('https://ms.jr.jd.com/gw/generic/zc/h5/m/queryBenefit');
    
    await whiteStripe('https://ms.jr.jd.com/gw/generic/bt/h5/m/btJrFirstScreenV2');
    
    await LvlProgress('https://ms.jr.jd.com/gw/generic/zc/h5/m/queryAccountLvlProgress');
    
    if (level === '1') {
      levelColor = '#4FC3F7'
      barColor = new Color(levelColor, 0.6);
    } else if (level === '2') {
      levelColor = '#99C0F0'
      barColor = new Color(levelColor, 0.6);
    } else if (level === '3') {
      levelColor = '#FF9999'
      barColor = new Color(levelColor, 0.6);
    } else if (level === '4') {
      levelColor = '#F72E27'
      barColor = new Color(levelColor, 0.6);
    } else if (level === '5') {
      levelColor = '#AB0D0D'
      barColor = new Color(levelColor, 0.6);
    } else if (level === '6') {
      levelColor = Color.dynamic(
        new Color('#222222'),
        new Color("#333333")
      );;
      barColor = Color.dynamic(
        new Color('#222222', 0.5),
        new Color("#444444")
      );;
    }
  }
  
  async function createWidget() {
    const widget = new ListWidget();
    const Appearance = Device.isUsingDarkAppearance();
    if (F_MGR.fileExists(bgImage) && Appearance === false) {
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
    } else if (Appearance == false) {
      widget.backgroundImage = await getImage('http://mtw.so/60NF6g');
    } else {
      const baiTiaoUrl = [
        'https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/baiTiaoBg.png',  
        'https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/baiTiaoBg1.png',  
        'https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/baiTiaoBg2.png'];
      const bgImageItems = baiTiaoUrl[Math.floor(Math.random() * baiTiaoUrl.length)];
      widget.backgroundImage = await getImage(bgImageItems);
      widget.backgroundColor = Color.dynamic( new Color("#fefefe"), new Color('#111111'));
    }
    
    
    /** 
    * @param {image} image
    * @param {string} string
    */
    widget.setPadding(0, 0, 0, 0);
    const mainStack = widget.addStack();
    mainStack.layoutVertically();
    mainStack.centerAlignContent();
    mainStack.setPadding(gap, gap, gap, gap);
    mainStack.addSpacer();
    // avatarStack
    const avatarStack = mainStack.addStack();
    avatarStack.layoutHorizontally();
    avatarStack.centerAlignContent();
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
    
    const topStack = avatarStack.addStack();
    topStack.layoutVertically();
    topStack.centerAlignContent();
    
    const levelStack = topStack.addStack();
    levelStack.layoutHorizontally();
    levelStack.centerAlignContent();
    
    const barStack = levelStack.addStack();
    barStack.layoutHorizontally();
    barStack.centerAlignContent();
    barStack.backgroundColor = level === '6' ? levelColor : new Color(levelColor);
    barStack.setPadding(1, 12, 1, 12);
    barStack.cornerRadius = 10;
    
    const iconSF = SFSymbol.named('crown.fill');
    const barIcon = barStack.addImage(iconSF.image);
    barIcon.imageSize = new Size(20, 20);
    barIcon.tintColor = new Color('#FDDA0D');
    barStack.addSpacer(4);
    
    const titleText = barStack.addText(title);
    titleText.font = Font.boldSystemFont(14);
    titleText.textColor = Color.white();
    levelStack.addSpacer(8);
    
    const beneStack = levelStack.addStack();
    beneStack.layoutHorizontally();
    beneStack.centerAlignContent();
    const benefitText = beneStack.addText(benefit.extValue.alreadyGetBenefitNum);
    benefitText.font = Font.boldSystemFont(15);
    benefitText.textColor = Color.red();
    
    const benefitText2 = beneStack.addText(' 项特权');
    benefitText2.font = Font.boldSystemFont(13);
    benefitText2.textOpacity = 0.7;
    barStack.addSpacer(5);
    topStack.addSpacer(5);
    
    
    const pointStack = topStack.addStack();
    pointStack.layoutHorizontally();
    pointStack.centerAlignContent();
    const baitiaoImage = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/baitiao.png');
    const baitiaoIcon = pointStack.addImage(baitiaoImage);
    baitiaoIcon.imageSize = new Size(25, 18);
    pointStack.addSpacer(8);
    
    const LevelText = pointStack.addText(progressNextLevelText);
    LevelText.font = Font.mediumSystemFont(12);
    LevelText.textOpacity = 0.7;
    pointStack.addSpacer();
    
    const barStack2 = pointStack.addStack();
    barStack2.layoutHorizontally();
    barStack2.centerAlignContent();
    barStack2.backgroundColor = new Color('#FF9500', 0.7);
    barStack2.setPadding(1, 8, 1, 8);
    barStack2.cornerRadius = 5;
    
    const pointText = barStack2.addText(lvlScore);
    pointText.font = Font.boldSystemFont(11);
    pointText.textColor = new Color('#FFFFFF');
    mainStack.addSpacer();
    
    // Switch position
    if (location == 0) {
      await progressBar();
    }
    
    /** 
    * Middle or bottom Stack
    * @param {image} image
    * @param {string} string
    */
    const middleStack = mainStack.addStack();
    middleStack.layoutHorizontally();
    middleStack.centerAlignContent();
    
    const quotaStack = middleStack.addStack();  
    quotaStack.layoutVertically();
    quotaStack.centerAlignContent();
    
    const quotaStack1 = quotaStack.addStack();
    const quotaText = quotaStack1.addText('可用额度');
    quotaText.font = Font.mediumSystemFont(12);
    quotaText.textOpacity = 0.7;
    quotaStack1.addSpacer();
    quotaStack.addSpacer(3);
    
    const quotaStack2 = quotaStack.addStack();
    const quota = quotaStack2.addText(quotaLeft.replace(',', ''));
    quota.font = Font.boldSystemFont(18);
    quotaStack2.addSpacer();
    quotaStack.addSpacer(3);

    const quotaStack3 = quotaStack.addStack();
    const quotaText2 = quotaStack3.addText(`总额度 ${quotaAll.replace(',', '')}`);
    quotaText2.font = Font.mediumSystemFont(12);
    quotaText2.textOpacity = 0.5;
    quotaStack3.addSpacer();
    middleStack.addSpacer();
    
    const gooseUrl = [
      'https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/whiteGoose.png',
      'https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/whiteGoose0.png',
      'https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/whiteGoose1.png'];
    const gooseItems = gooseUrl[Math.floor(Math.random() * gooseUrl.length)];
    const gooseIcon = await getImage(gooseItems);
    const gooseIconElement = middleStack.addImage(gooseIcon);
    const name = gooseItems.substring(gooseItems.lastIndexOf('/') + 1);
    gooseIconElement.imageSize = name == 'whiteGoose.png' ? new Size(55, 55) : new Size(52, 52);
    middleStack.addSpacer();
    
    
    const billStack = middleStack.addStack();    
    billStack.layoutVertically();  
    billStack.centerAlignContent();
    
    const billStack1 = billStack.addStack();
    billStack1.addSpacer();
    const billText = billStack1.addText('当月待还');  
    billText.font = Font.mediumSystemFont(12);
    billText.textOpacity = 0.7;
    billStack.addSpacer(3);
    
    billStack2 = billStack.addStack();
    billStack2.addSpacer();
    const bill = billStack2.addText(amount.replace(',', ''));
    bill.font = Font.boldSystemFont(18);
    billStack.addSpacer(3);
    
    billStack3 = billStack.addStack();
    billStack3.addSpacer();
    const billText2 = billStack3.addText(buttonName.replace('最近还款日', '还款日 '));  
    billText2.font = Font.mediumSystemFont(12);
    billText2.textOpacity = 0.5;
    mainStack.addSpacer();
    
    // Switch position
    if (location == 1) {
      await progressBar();
    }
    
    
    /** 
    * progressBar Stack
    * @param {image} image
    * @param {string} string
    */
    async function progressBar() {
      const prgrWid = Number(setting.progressWidth);
      const tempBarWidth = curScore == 0 ? prgrWid : curScore <= 100 ? prgrWid - 10 : (curScore > 100 && curScore <= 1000) ? prgrWid - 15 : (curScore > 1000 && curScore <= 10000) ? prgrWid - 25 : prgrWid - 32;
      const tempBarHeight = 18;
      
      const prgsStack = mainStack.addStack();  
      prgsStack.layoutHorizontally();
      prgsStack.centerAlignContent();
      
      const curScoreText = prgsStack.addText(curScore)
      curScoreText.font = Font.boldSystemFont(13);
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
        
        draw.setFillColor((barColor))
        draw.fillPath();
      
        const currPath = new Path();
        const isPercent = percent > 1 ? percent / 100 : percent;
        currPath.addEllipse(new Rect((tempBarWidth - tempBarHeight) * isPercent, 0, tempBarHeight, tempBarHeight));
        draw.addPath(currPath);
        // progressColor
        draw.setFillColor(new Color('#F2F5F7'));
        draw.fillPath();
        return draw.getImage();
      }
      
      prgsStack.addSpacer();
      const isPercent2 = percent < 1 ? percent * 100 : percent;
      const percentText = prgsStack.addText(`${isPercent2} %`);
      percentText.font = Font.boldSystemFont(13);  
      mainStack.addSpacer();
    }
    
    // jump App page
    avatarStack2.url = 'openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fh5.m.jd.com%2FbabelDiy%2FZeus%2FbE7uy5XYMCoM3ZNb8qjT5GWTeNV%2Findex.html%3F%26utm_source%3Diosapp%22%7D'
    barStack.url = 'openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fagree.jd.com%2Fcredit_rights%2Findex.html%3Ffrom%3Dbtsyright%22%7D'
    gooseIconElement.url = 'openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fmcr.jd.com%2Fcredit_home%2Fpages%2Findex.html%3FbtPageType%3DBT%26channelName%3D024%22%7D'
    if (config.runsInWidget) {
      Script.setWidget(widget);
      Script.complete();
    } else {
      await widget.presentMedium()
    }
    return widget;
  }
  
  
  /**-------------------------**/
     /** Request(url) json **/
  /**-------------------------**/
  
  const isSmallWidget =  config.widgetFamily === 'small';
  if (isSmallWidget && config.runsInWidget) {
    await smallrWidget();
  } else if (setting.code === 0) {
    await loadData();
    await createWidget();
  } else if (setting.code === 3) {
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
    req.body = `reqData={
      "environment": "1", 
      "clientType": "ios", 
      "clientVersion": "11.6.4"
    }`
    const res = await req.loadJSON();
    return {
      quota: {
        quotaLeft,
        quotaAll
      },
      bill: {
        amount,
        buttonName
      },
      right: {
        data: {
          scorePopJumpUrl,
          title,
          identityPicture,
          portrait,
          percent,
          progressNextLevelText
        }
      }
    } = res.resultData.data;
  }
  
  async function LvlProgress(url) {
    const req = new Request(url)
    req.method = 'POST'
    req.headers = {
      Cookie: cookie,
      Referer: 'https://agree.jd.com/'
    }
    req.body = `reqData={  
      "appId": "benefitGateway", 
      "channelId": "1", 
      "customerId": "1", 
      "shopId": "1", 
      "deviceInfo": { }
    }`
    const res = await req.loadJSON();
    if ( res.resultCode == 0 ) {
      return {
        lvlScore,
        curScore,
        level,
        nextLvl
      } = res.resultData;
    } else {
      setting.code = 3;
      F_MGR.writeString(cacheFile, JSON.stringify(setting));
      notify('京东小白鹅', 'Cookie已过期，请重新登录京东账号');
    }
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