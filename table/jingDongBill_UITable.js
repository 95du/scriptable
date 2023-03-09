// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: tags;
/**
 * 小组件作者：95度茅台
 * UITable 版本: Version 1.0.0
 * 2023-03-09 11:30
 * Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy
 */

async function main() {
  const uri = Script.name();
  const F_MGR = FileManager.local();
  const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), "95duJingDong_Bill");
  const cacheFile = F_MGR.joinPath(folder, 'setting.json');
  const bgPath = F_MGR.joinPath(F_MGR.documentsDirectory(), "95duBackground");
  const bgImage = F_MGR.joinPath(bgPath, uri + ".jpg");
  
  if (F_MGR.fileExists(cacheFile)) {
    data = F_MGR.readString(cacheFile);
    setting = JSON.parse(data);
    cookie = setting.cookie;
    index = setting.randomIndex;
    statistics = setting.statistics;
  }
  
  const notify = async (title, body, url) => {
    let n = new Notification();
    n.title = title
    n.body = body
    n.sound = 'alert'
    if (url) {n.openURL = url}
    return await n.schedule();
  }
  
  //const info = await getJson('https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2');
  const info = await getJson('https://api.m.jd.com?functionId=queryJDUserInfo&appid=jd-cphdeveloper-m');

  const sign = await signBeanAct('https://api.m.jd.com/client.action?functionId=signBeanAct&appid=ld');
  
  if (sign !== undefined) {
    asset = await totalAsset('https://ms.jr.jd.com/gw/generic/bt/h5/m/firstScreenNew');
  
    wallet = await myWallet('https://ms.jr.jd.com/gw2/generic/MyWallet/h5/m/myWalletInfo');
  
    const df = new DateFormatter();
    df.dateFormat = 'yyyy-MM';
    yearMonth = (df.string(new Date()));
    income = await incomeData('IN', yearMonth);
    inCode = income.responseCode === '00000';
    if (inCode) {
      inTotal = income.totalAmount;
      inPercent = income.list[0].amount;
      inPer = Math.floor(income.list[0].percent);
    } else {
      inTotal = '1'
      inPercent = '0'
      inPer = '0'
    }
    
    expend = await incomeData('OUT', yearMonth);
    outCode = expend.responseCode === '00000';
    if (outCode) {
      outTotal = expend.totalAmount;
      outPercent = expend.list[0].amount
      outPer = Math.floor(expend.list[0].percent);
    } else {
      outTotal = '1'
      outPercent = '0'
      outPer = '0'
    }
  }

  const Run = async () => {
    if (index === 0) {
      setting.randomIndex = 1;
      setting.schemeUrl = 'openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fmbt.jd.com%2Fbill%2Fmonthlybill%2Fmonthbillcore%2Fmonth-bill-index.html%3Fchannelcode%3D024%22%7D'
    } else if (index === 1) {
      setting.randomIndex = 2;
      setting.schemeUrl = 'openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fbean.m.jd.com%2FbeanDetail%2Findex.action%3FresourceValue%3Dbean%22%7D'
    } else if (index === 2) {
      setting.randomIndex = 3;
      setting.schemeUrl = 'openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fwqs.jd.com%2Fmy%2Fredpacket.shtml%3Fsceneval%3D2%26jxsid%3D16780988595962555448%22%7D'
    } else if (index === 3) {
      setting.randomIndex = 4;
      setting.schemeUrl = 'openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fcarry.m.jd.com%2FbabelDiy%2FZeus%2F3KSjXqQabiTuD1cJ28QskrpWoBKT%2Findex.html%3FbabelChannel%3D94%2Findex%3Fsource%3Dlingjingdoushouye%22%7D'
    } else if (index === 4) {
      setting.randomIndex = 5;
      setting.schemeUrl = 'openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fh5.m.jd.com%2Frn%2F3a5TGXF7Y8xpQ45CjgMzQ3tyqd4K%2Findex.html%3Fhas_native%3D0%2Findex%3Fsource%3Dlingjingdoushouye%22%7D'
    } else if (index === 5) {
      setting.randomIndex = 0;
      setting.schemeUrl = 'openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fagree.jd.com%2Fm%2Findex.html%3Fsceneval%3D2%26jxsid%3D16780988595962555448%26channel%3Dwq%26from%3Djdmwode%22%7D'
    }
    await monthBill();
  }

  const monthBill = async () => {
    if (statistics === 0) {
      setting.statistics = 1;
      const inRank = await monthBillRank('IN', yearMonth);
      if (inRank.responseCode === '00000') {
        const { showText, amount, date } = inRank.list[0];
        val = {
          showText: showText.match(/[\w\W]{2}/)[0],
          amount: amount,
          date: date
        }
      } else {
        setting.allData = 1;
      }
    } else if (statistics === 1) {
      setting.statistics = 0;
      const outRank = await monthBillRank('OUT', yearMonth);
      if (outRank.responseCode === '00000') {
        const { showText, amount, date } = outRank.list[0];
        val = {
          showText: '消费',
          amount: amount,
          date: date,
        }
      } else {
        setting.allData = 2;
      }
    } // 月收支排行榜

    if (setting.allData === 1 && setting.allData = 2) {
      const allBill = await getMListData('https://bill.jd.com/bill/getMListData.html');
      if (allBill.responseCode === '00000') {
        const { customCategoryName, payMoney, date, tradePayDateStr } = allBill.list[0];
        val = {
          showText: customCategoryName,
          amount: payMoney,
          date: tradePayDateStr.match(/(.+):/)[1]
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
      const items = color[Math.floor(Math.random()*color.length)];
      gradient.locations = [0, 1]
      gradient.colors = [
        new Color(items, Number(setting.transparency)),
        new Color('#00000000')
      ]
      widget.backgroundGradient = gradient
    } else {
      widget.backgroundColor = Color.dynamic(new Color("#FFFFFF", 0.5), new Color("#111111"));
    }
    
    
    widget.setPadding(12, 10, 12, 10);
    const mainStack = widget.addStack();
    mainStack.layoutHorizontally();
    mainStack.centerAlignContent();
    
    /** 
    * Left Content
    * @param {image} image
    * @param {string} string
    */
    const leftStack = mainStack.addStack();
    leftStack.layoutVertically();
    leftStack.centerAlignContent();
    leftStack.setPadding(0, 8, 0, 8);
    const avatarStack = leftStack.addStack();
    avatarStack.layoutHorizontally();
    avatarStack.addSpacer(7);
    const avatarStack1 = avatarStack.addStack();
    
    const iconSymbol = await getImage(info.headImageUrl);
    const crownIcon = avatarStack1.addImage(iconSymbol);
    crownIcon.imageSize = new Size(60, 60);
    avatarStack1.cornerRadius = 50
    avatarStack1.borderWidth = 3;
    avatarStack1.borderColor = new Color('#FFBF00');
    leftStack.addSpacer(6);
      
    // name stack
    const nameStack = leftStack.addStack();
    nameStack.layoutHorizontally();
    nameStack.centerAlignContent();
    nameStack.setPadding(1, 4, 1, 4);
    const nameIcon = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/crown.png');
    const nameIconElement = nameStack.addImage(nameIcon);
    nameIconElement.imageSize = new Size(17, 17);
    nameStack.addSpacer(4);
    
    const nameText = nameStack.addText(info.nickname);
    nameText.font = Font.mediumSystemFont(13);
    nameText.textOpacity = 0.8;
    leftStack.addSpacer(2)
  
    // Baitiao Stack
    const btStack = leftStack.addStack();
    btStack.layoutHorizontally();
    btStack.centerAlignContent();
    btStack.addSpacer(3)
    
    const baitiaoImage = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/baitiao.png');
    const baitiaoIcon = btStack.addImage(baitiaoImage);
    baitiaoIcon.imageSize = new Size(25, 18);
    btStack.addSpacer(6);
    
    const amount = asset.bill.amount;
    const baitiaoText = btStack.addText(asset.quota.state === '1' ? amount : amount > '999.99' ? amount.toPrecision(5) : amount > '9999.99' ? Math.floor(amount) : '未开通');
    baitiaoText.font = Font.mediumSystemFont(14);
    leftStack.addSpacer(2);
    mainStack.addSpacer()
    
    
    /** 
    * Right Content
    * @param {image} image
    * @param {string} jd_value
    */
    const rightStack = mainStack.addStack();
    rightStack.layoutVertically();
    rightStack.centerAlignContent();
    rightStack.setPadding(-5, 0, 6, 0)
    const logoStack = rightStack.addStack();
    logoStack.layoutHorizontally();
    logoStack.centerAlignContent();
    const logoImage = await getImage('http://mtw.so/67mqz3');
    const logoIcon = logoStack.addImage(logoImage);
    logoIcon.imageSize = new Size(32, 32);
    logoStack.addSpacer();
    
    const assetText = logoStack.addText(wallet.assetAmt);
    assetText.textColor = Color.red();
    assetText.font = Font.boldSystemFont(20);
    assetText.textOpacity = 0.8;
    logoStack.addSpacer();
    
    const jdImage = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/jdWord.png');
    const jdIcon = logoStack.addImage(jdImage);
    jdIcon.imageSize = new Size(36, 36);
    rightStack.addSpacer();
    mainStack.addSpacer();
    
    
    /**
    * Right Center Stack
    */
    const middleStack = rightStack.addStack();
    middleStack.layoutHorizontally();
    const midLeftStack = middleStack.addStack();
    midLeftStack.layoutVertically();
    midLeftStack.centerAlignContent()

    const inText = midLeftStack.addText(inCode ? income.compareLastTotalAmount : '收入(月)');
    inText.font = Font.mediumSystemFont(13);
    inText.textOpacity = 0.7;
    midLeftStack.addSpacer(7);
    
    const inAmountText = midLeftStack.addText(income.totalAmount);
    inAmountText.font = Font.boldSystemFont(20);
    inAmountText.leftAlignText();
    inAmountText.textOpacity = 0.7;
    
    middleStack.addSpacer();
    const assetIcon = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/walket.png');
    const assetIconElement = middleStack.addImage(assetIcon);
    assetIconElement.imageSize = new Size(48, 48);
    middleStack.addSpacer();
    
    
    const midRightStack = middleStack.addStack();
    midRightStack.layoutVertically();
    midLeftStack.addSpacer();
    
    const outText = midRightStack.addText(outCode ? expend.compareLastTotalAmount : '支出(月)');
    outText.font = Font.mediumSystemFont(13);
    outText.textOpacity = 0.7;
    midRightStack.addSpacer(7);

    const outAmountText = midRightStack.addText(expend.totalAmount);
    outAmountText.font = Font.boldSystemFont(20);
    outAmountText.rightAlignText();
    outAmountText.textOpacity = 0.7;
    midRightStack.addSpacer();
    
    
    const lowerStack = rightStack.addStack();
    lowerStack.size = new Size(0, 15)
    lowerStack.layoutHorizontally();
    lowerStack.centerAlignContent();
    const billImage = await circleImage('https://storage.360buyimg.com/bill/icon/new/weixin2x.png');
    const billIcon = lowerStack.addImage(billImage);
    billIcon.imageSize = new Size(15, 15);
    lowerStack.addSpacer(8);
    
    const billText = lowerStack.addText(!val ? '没有收入/支付交易记录' : `${val.showText} ${val.amount}，${val.date}`);
    billText.textColor = Color.red();
    billText.font = Font.boldSystemFont(13);
    billText.textOpacity = 0.8;
    
    
    /** 
    * Bottom Content
    * @param {image} Progress Bar
    * @param {string} string
    */
    const barColor = Color.dynamic(new Color('#CFCFCF'), new Color('#7A7A7A'));
    const width = Number(setting.progressWidth);
    const height = 10;
    
    getwidget(outTotal, outPercent, '支出', `${outPer} %`, progressColor = new Color(setting.progressColor1));
    getwidget(inTotal, inPercent, '收入', `${inPer} %`, progressColor = new Color(setting.progressColor2));
    
    function getwidget(inTotal, haveGone, str, percent, progressColor) {
      const percStack = widget.addStack();
      percStack.layoutHorizontally();
      percStack.centerAlignContent();
      percStack.addSpacer();
      
      const title = percStack.addText(str);
      title.centerAlignText();
      title.textColor = Color.dynamic(new Color('#484848'), new Color('#E0E0E0'));
      title.font = Font.boldSystemFont(12);
      percStack.addSpacer(10);
      
      const imgProgress = percStack.addImage(creatProgress(inTotal, haveGone));
      imgProgress.centerAlignImage();
      imgProgress.cornerRadius = 5.2
      imgProgress.imageSize = new Size(width, height);
      percStack.addSpacer(10);
      
      const percentText = percStack.addText(percent);
      percentText.centerAlignText();
      percentText.textColor = Color.dynamic(new Color('#484848'), new Color('#E0E0E0'));
      percentText.font = Font.boldSystemFont(12);
      
      percStack.addSpacer();
      const phoneSize = Device.screenSize().height
      widget.addSpacer(phoneSize < 926 ? 1 : 2.5)
    }
    
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
    
    widget.url = setting.schemeUrl
    F_MGR.writeString(cacheFile, JSON.stringify(setting));
    if (config.runsInApp) {
      await widget.presentMedium()
    } else {
      Script.setWidget(widget);
      Script.complete();
    }
    return widget;
  }
  
  
  if (setting.code === 0) {
    await Run();
    await createWidget();
  } else {
    await createErrWidget();
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
      const { status, dailyAward, continuousDays, tomorrowSendBeans, totalUserBean } = data;
      if (status === '1') {
        setting.signData = res.data
        F_MGR.writeString(cacheFile, JSON.stringify(setting));
        if (dailyAward) {
          notify(`${dailyAward.title}${dailyAward.subTitle} ${dailyAward.beanAward.beanCount} 京豆`, `已签到 ${continuousDays} 天，明天签到加 ${tomorrowSendBeans} 京豆 ( ${totalUserBean} )`);
        } else {
          notify('签到成功', `已签到 ${continuousDays} 天，明天签到加 ${tomorrowSendBeans} 京豆 ( ${totalUserBean} )`);
        }
      }
      return res.data;
    } else {
      setting.code = 3;
      F_MGR.writeString(cacheFile, JSON.stringify(setting));
      notify(res.errorMessage, 'Cookie 过期，请重新登录京东 ‼️');
    }
  }
    
  async function getJson(url) {
    const req = new Request(url)
    req.method = 'GET'
    req.headers = {
      Referer: "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
      Cookie: cookie
    }
    const res = await req.loadJSON();
    return res.base;
  }
  
  async function totalAsset(url) {
    const request = new Request(url);
    request.method = 'POST'
    request.headers = {
      Referer: "https://mallwallet.jd.com/",
      Cookie: cookie
    }
    request.body = `reqData={
      "clientType": "ios"
    }`
    const res = await request.loadJSON();
    return res.resultData.data
  }
  
  async function myWallet(url) {
    const req = new Request(url)
    req.method = 'POST'
    req.headers = {
      Referer: 'https://mallwallet.jd.com/',
      Cookie: cookie
    }
    req.body = `reqData={"timestamp":${Date.parse(new Date())}}&aar={"nonce":""}`
    const res = await req.loadJSON();
    const arr = res.resultData.data.floors[0].nodes
    for (const item of arr) {
      if (item.title.value.indexOf('总资产') > -1) {
        return item.data;
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
  
  async function getMListData(url) {
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
      ctx.arc(sourceImg.width / 2, sourceImg.height / 2, sourceImg.height / 2, 0, 2 * Math.PI);
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