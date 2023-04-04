// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: tags;
/**
 * 小组件作者：95度茅台
 * UITable 版本: Version 1.0.2
 * 2023-03-13 19:30
 * 🔥示例图渐变颜色 #FFE5B4
 * Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy
 */

async function main() {
  const phoneSize = Device.screenSize().height;
  const F_MGR = FileManager.local();
  const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), '95duJingDong_Bill');
  const bgPath = F_MGR.joinPath(F_MGR.documentsDirectory(), '95duBackground');
  
  // file_Path
  function getPath(pathName, fileName) {
    return F_MGR.joinPath(pathName, fileName);
  }
  const bgImage = getPath(bgPath, Script.name() + '.jpg');
  const cacheFile = getPath(folder, 'setting.json');
  
  // Get Settings { json }
  const getSettings = (file) => {
    if ( F_MGR.fileExists(file) ) {
      const data = F_MGR.readString(file);
      return { cookie, statistics } = JSON.parse(data);
    }
    return null;
  }
  const setting = getSettings(cacheFile);

  //=========> START <=========//
  
  const notify = async (title, body, url) => {
    let n = new Notification();
    n.title = title
    n.body = body
    n.sound = 'alert'
    if (url) {n.openURL = url}
    return await n.schedule();
  }

  const sign = await signBeanAct('https://api.m.jd.com/client.action?functionId=signBeanAct&appid=ld');
  
  if (sign !== undefined) {
    const df = new DateFormatter();
    df.dateFormat = 'yyyy-MM';
    yearMonth = (df.string(new Date()));
    income = await incomeData('IN', yearMonth);
    inCode = income.responseCode === '00000';
    if (inCode) {
      inTotal = income.totalAmount;
      inPercent = income.list[0].amount;
      inP = income.list[0].percent;
      inPer = inP === '100.00' ? String(Math.floor(inP)) : Number(inP).toFixed(1);
    } else {
      inTotal = '1';
      inPercent = '0';
      inPer = '0.00';
    }
    
    expend = await incomeData('OUT', yearMonth);
    outCode = expend.responseCode === '00000';
    if (outCode) {
      outTotal = expend.totalAmount;
      outPercent = expend.list[0].amount
      outP = expend.list[0].percent;
      outPer = outP === '100.00' ? String(Math.floor(outP)) : Number(outP).toFixed(1);
    } else {
      outTotal = '1';
      outPercent = '0';
      outPer = '0.00';
    }
  }
  
  
  // inRank & outRank
  const Run = async () => {
    if (statistics === 0) {
      setting.statistics = 1;
      const inRank = await monthBillRank('IN', yearMonth);
      const inCode = inRank.responseCode === '00000';
      if (inCode) {
        const { showText, amount, date, icon } = inRank.list[0];
        obj = {
          icon: icon,
          det: `${showText.match(/[\w\W]{2}/)[0]}  ${amount}，${date}`
        }
      }
    } else if (statistics === 1) {
      setting.statistics = 0;
      const outRank = await monthBillRank('OUT', yearMonth);
      const outCode = outRank.responseCode === '00000';
      if (outCode) {
        const { showText, amount, date, icon } = outRank.list[0];
        obj = {
          icon: icon,
          det: `支出  ${amount}，${date}`
        }
      }
    } // 月收支排行榜

    if (!inCode || !outCode) {
      const billDetail = await allBillDetail('https://bill.jd.com/bill/getMListData.html');
      if (billDetail.responseCode === '00000') {
        const { customCategoryName, payMoney, date, iconUrl } = billDetail.list[0];
        obj = {
          icon: iconUrl,
          det: `${customCategoryName}  ${payMoney}，${date}`
        }
      } else {
        obj = {
          icon: 'https://is2-ssl.mzstatic.com/image/thumb/Purple126/v4/cf/ac/cc/cfaccca9-b522-3ffd-1780-7414507efcdb/AppIcon-0-1x_U007emarketing-0-4-0-sRGB-0-85-220.png/512x512bb.png',
          det: '没有收入/支付交易记录'
        }
      }
    } // 全部账单
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
      widget.backgroundColor = Color.dynamic(new Color('#FFE5B4', 0.5), new Color('#1e1e1e'));
    }
    
    
    widget.setPadding(10, 10, 10, 10);
    const mainStack = widget.addStack();
    mainStack.layoutHorizontally();
    mainStack.centerAlignContent();
    mainStack.addSpacer();
    
    /** 
    * Left Content
    * @param {image} image
    * @param {string} string
    */
    const leftStack = mainStack.addStack();
    leftStack.layoutVertically();
    leftStack.centerAlignContent();
    leftStack.addSpacer();
    leftStack.size = new Size(phoneSize < 926 ? 70 : 80, 0);
    
    // avatarStack
    const avatarStack = leftStack.addStack();
    const iconSymbol = await circleImage(headImageUrl);  
    
    if (setting.isPlus === 'true') {
      avatarStack.backgroundImage = iconSymbol;
      const plus = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/plus.png');
      const plusImage = avatarStack.addImage(plus);
      plusImage.imageSize = new Size(62, 62);
    } else {
      const avatarIcon = avatarStack.addImage(iconSymbol);
      avatarIcon.imageSize = new Size(62, 62);
      avatarStack.cornerRadius = 50;
      avatarStack.borderWidth = 3;
      avatarStack.borderColor = new Color('#FFBF00');
    }
    leftStack.addSpacer(6.5);
    
    
    // name stack
    const nameStack = leftStack.addStack();
    nameStack.layoutHorizontally();
    nameStack.centerAlignContent();
    const nameIcon = await getImage('http://m.360buyimg.com/mobilecms/jfs/t21250/351/1000721513/1891/9bfe1d6c/5b1e3870Nee820e5e.png');
    const nameIconElement = nameStack.addImage(nameIcon);
    nameIconElement.imageSize = new Size(16, 16);
    nameStack.addSpacer(5);
    
    const nameText = nameStack.addText(!setting.userName ? nickname : setting.userName);
    nameText.font = Font.mediumSystemFont(12);
    nameText.textOpacity = 0.8;
    leftStack.addSpacer(3);
    
  
    // Baitiao Stack
    const btStack = leftStack.addStack();
    btStack.layoutHorizontally();
    btStack.centerAlignContent();
    const baitiaoImage = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/baitiao.png');
    const baitiaoIcon = btStack.addImage(baitiaoImage);
    baitiaoIcon.imageSize = new Size(25, 18);
    btStack.addSpacer(6);
    
    const Amount = state === '1' ? amount.replace(',', '') : '0.00';
    const baitiaoText = btStack.addText(Amount >= '1000' ? String(Math.floor(Amount)) : Amount);
    baitiaoText.font = Font.mediumSystemFont(14);
    mainStack.addSpacer();
    
    
    /** 
    * Right Content
    * @param {image} image
    * @param {string} jd_value
    */
    const rightStack = mainStack.addStack();
    rightStack.layoutVertically();
    rightStack.centerAlignContent();
    
    const logoStack = rightStack.addStack();
    logoStack.layoutHorizontally();
    logoStack.centerAlignContent();
    const topImg = [
      'https://gitcode.net/enoyee/scriptable/-/raw/master/img/jd/ic_jd_logo.png'  
    ];
    const logoImage = topImg[Math.floor(Math.random() * topImg.length)];
    const logoIcon = logoStack.addImage(await getImage(logoImage));
    logoIcon.imageSize = new Size(32, 32);
    logoStack.addSpacer();
    
    const assetText = logoStack.addText(assetAmt);
    assetText.textColor = Color.red();
    assetText.font = Font.boldSystemFont(20);
    assetText.textOpacity = 0.8;
    logoStack.addSpacer();
    
    const jdImage = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/jdWord.png');
    const jdIcon = logoStack.addImage(jdImage);
    jdIcon.imageSize = new Size(36, 36);
    
    
    /*
    * Right Center Stack
    */
    const middleStack = rightStack.addStack();
    middleStack.layoutHorizontally();
    middleStack.setPadding(6, 0, 6, 0);
    
    const midLeftStack = middleStack.addStack();
    midLeftStack.layoutVertically();
    
    const inStack1 = midLeftStack.addStack();
    const inText = inStack1.addText(inCode ? income.compareLastTotalAmount : '收入/月');
    inText.font = Font.mediumSystemFont(13);
    inText.textOpacity = 0.7;
    inStack1.addSpacer();
    midLeftStack.addSpacer(7);
    
    const inStack2 = midLeftStack.addStack();
    const inAmountText = inStack2.addText(income.totalAmount);
    inAmountText.font = Font.boldSystemFont(20);
    inAmountText.leftAlignText();
    inAmountText.textOpacity = 0.9;
    inStack2.addSpacer();
    middleStack.addSpacer();
    
    const moneyBagUrl = [
      'https://img30.360buyimg.com/jdmonitor/jfs/t1/191158/3/10079/3167/60d4547bEee00ce33/dc8d2287590e39af.png',
      'https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/walket.png'
    ];
    const moneyBag = moneyBagUrl[Math.floor(Math.random() * moneyBagUrl.length)];
    const assetIcon = await getImage(moneyBag);
    const assetIconElement = middleStack.addImage(assetIcon);
    const bag = moneyBag.indexOf('gitcode') > -1 ? 48 : 41;
    assetIconElement.imageSize = new Size(bag, bag);
    middleStack.addSpacer();
    
    const midRightStack = middleStack.addStack();
    midRightStack.layoutVertically();
    
    const outStack1 = midRightStack.addStack();
    outStack1.addSpacer();
    const outText = outStack1.addText(outCode ? expend.compareLastTotalAmount : '支出/月');
    outText.font = Font.mediumSystemFont(13);
    outText.textOpacity = 0.7;
    outText.rightAlignText();
    midRightStack.addSpacer(7);

    const outStack2 = midRightStack.addStack();
    outStack2.addSpacer();
    const outAmountText = outStack2.addText(expend.totalAmount)
    outAmountText.font = Font.boldSystemFont(20);
    outAmountText.rightAlignText();
    outAmountText.textOpacity = 0.9;
    
    // Right bottom Stack
    const lowerStack = rightStack.addStack();
    lowerStack.size = new Size(0, 16)
    lowerStack.layoutHorizontally();
    lowerStack.centerAlignContent();
    const billImage = await circleImage(obj.icon);
    const billIcon = lowerStack.addImage(billImage);
    billIcon.imageSize = new Size(16, 16);
    lowerStack.addSpacer(8);
    
    const billText = lowerStack.addText(obj.det);
    billText.textColor = Color.red();
    billText.font = Font.boldSystemFont(13);
    billText.textOpacity = 0.8;
    mainStack.addSpacer();
    widget.addSpacer(5);
    
    
    /** 
    * widget Bottom Content
    * @param {image} Progress Bar
    * @param {string} string
    */
    const barColor = Color.dynamic(new Color('#CFCFCF'), new Color('#7A7A7A'));
    const width = Number(setting.progressWidth);
    const height = setting.progressHeight;
    
    getwidget(outTotal, outPercent, '支出', `${outPer} %`, progressColor = new Color(setting.progressColor1));
    getwidget(inTotal, inPercent, '收入', `${inPer} %`, progressColor = new Color(setting.progressColor2));
    
    function getwidget(inTotal, haveGone, str, percent, progressColor) {
      const percStack = widget.addStack();
      percStack.layoutHorizontally();
      percStack.centerAlignContent();  
      percStack.setPadding(0, 7.8, 0, 7.8);
      
      const title = percStack.addText(str);
      title.centerAlignText();
      title.textColor = Color.dynamic(new Color('#484848'), new Color('#E0E0E0'));
      title.font = Font.boldSystemFont(12);
      percStack.addSpacer(8);
      
      const imgProgress = percStack.addImage(creatProgress(inTotal, haveGone));
      imgProgress.centerAlignImage();
      imgProgress.cornerRadius = 5.2
      imgProgress.imageSize = new Size(width, height);
      percStack.addSpacer();
      
      const percentText = percStack.addText(percent);
      percentText.centerAlignText();
      percentText.textColor = Color.dynamic(new Color('#484848'), new Color('#E0E0E0'));
      percentText.font = Font.boldSystemFont(12);
      widget.addSpacer(phoneSize < 926 ? 1.5 : 2.5)
    }
    widget.addSpacer(5);
    
    function creatProgress(inTotal, havegone) {
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
      path1.addRoundedRect(new Rect(0, 0, width * havegone / inTotal, height), 3, 0)
      context.addPath(path1);
      context.fillPath();
      return context.getImage();
    }
    
    avatarStack.url = 'openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fh5.m.jd.com%2FbabelDiy%2FZeus%2FbE7uy5XYMCoM3ZNb8qjT5GWTeNV%2Findex.html%3F%26utm_source%3Diosapp%22%7D'
    assetIconElement.url = 'openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fmbt.jd.com%2Fbill%2Fmonthlybill%2Fmonthbillcore%2Fmonth-bill-index.html%3Fchannelcode%3D024%22%7D'

    if (config.runsInApp) {
      await widget.presentMedium()
    } else {
      Script.setWidget(widget);
      Script.complete();
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
    await getJson();
    await totalAsset();
    await myWallet();
    await Run();
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
  
  async function signBeanAct(url) {
    const req = new Request(url)
    req.method = 'POST'
    req.headers = {
      Referer: 'https://h5.m.jd.com/',
      Cookie: cookie
    }
    req.body = `body={
      fp: "-1",
      shshshfp: "-1",
      shshshfpa: "-1",
      referUrl: "-1",
      userAgent: "-1",
      jda: "-1",
      rnVersion: "3.9"
    }`
    const res = await req.loadJSON();
    if (res.code === '0') {
      const { data } = res;
      const { status, dailyAward, continuousDays, tomorrowSendBeans, totalUserBean, continuityAward } = data;
      if (status === '1') {
        setting.signData = res.data
        F_MGR.writeString(cacheFile, JSON.stringify(setting));
        if (dailyAward) {
          notify(`${dailyAward.title}${dailyAward.subTitle} ${dailyAward.beanAward.beanCount} 京豆`, `已签到 ${continuousDays} 天，明天签到加 ${tomorrowSendBeans} 京豆 ( ${totalUserBean} )`);
        } else {
          notify(continuityAward.title, `获得 ${continuityAward.beanAward.beanCount} 京豆，已签到 ${continuousDays} 天，明天签到加 ${tomorrowSendBeans} 京豆 ( ${totalUserBean} )`);
        }
      }
      return res.data;
    } else {
      setting.code = 3;
      F_MGR.writeString(cacheFile, JSON.stringify(setting));
      notify(res.errorMessage, 'Cookie 过期，请重新登录京东 ‼️');
    }
  }
  
  async function getJson() {
    const req = new Request('https://api.m.jd.com?functionId=queryJDUserInfo&appid=jd-cphdeveloper-m');
    req.method = 'GET'
    req.headers = {
      Referer: "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
      Cookie: cookie
    }
    const res = await req.loadJSON();
    return {
      headImageUrl,
      nickname
    } = res.base;
  }
  
  async function totalAsset() {
    const request = new Request('https://ms.jr.jd.com/gw/generic/bt/h5/m/firstScreenNew');
    request.method = 'POST'
    request.headers = {
      Referer: "https://mallwallet.jd.com/",
      Cookie: cookie
    }
    request.body = `reqData={
      "clientType": "ios"
    }`
    const res = await request.loadJSON();
    return {
      quota: { state },
      bill: { amount }
    } = res.resultData.data;
  }
  
  async function myWallet() {
    const req = new Request('https://ms.jr.jd.com/gw2/generic/MyWallet/h5/m/myWalletInfo');
    req.method = 'POST'
    req.headers = {
      Referer: 'https://mallwallet.jd.com/',
      Cookie: cookie
    }
    req.body = `reqData={"timestamp":${Date.parse(new Date())}}&aar={"nonce":""}`
    const res = await req.loadJSON();
    const arr = res.resultData.data.floors[0].nodes;
    for (const item of arr) {
      if ( item.title.value.indexOf('总资产') > -1 ) {
        return { 
          assetAmt 
        } = item.data;
      }
    }
  }
  
  async function incomeData(status, yearMonth) {
    const req = new Request('https://bill.jd.com/monthBill/statistics.html')
    req.method = 'POST'
    req.headers = {
      Cookie: cookie,
      Referer: 'https://mse.jd.com/'
    }
    req.body = `yearMonth=${yearMonth}&direction=${status}`
    return await req.loadJSON();
  }
  
  async function monthBillRank(status, yearMonth) {
    const req = new Request('https://bill.jd.com/monthBill/rank.html')
    req.method = 'POST'
    req.headers = {
      Cookie: cookie,
      Referer: 'https://mse.jd.com/'
    }
    req.body = `yearMonth=${yearMonth}&direction=${status}&sortField=1&sortType=DESC&pageNum=1&pageSize=20`
    return await req.loadJSON();
  }
  
  async function allBillDetail(url) {
    const req = new Request(url)
    req.method = 'POST'
    req.headers = {
      Cookie: cookie
    }
    return await req.loadJSON();
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