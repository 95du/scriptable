// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: tags;
/**
 * 小组件作者：95度茅台
 * UITable 版本: Version 1.0.2
 * 2023-02-27 11:30
 * Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy
 */

async function main() {
  const uri = Script.name();
  const F_MGR = FileManager.local();
  const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), "95duJingDong");
  const cacheFile = F_MGR.joinPath(folder, 'setting.json');
  const bgPath = F_MGR.joinPath(F_MGR.documentsDirectory(), "95duBackground");
  const bgImage = F_MGR.joinPath(bgPath, uri + ".jpg");
  
  if (F_MGR.fileExists(cacheFile)) {
    data = F_MGR.readString(cacheFile);
    setting = JSON.parse(data);
    cookie = setting.cookie;
    index = setting.randomIndex;
  }
  
  const notify = async (title, body, url) => {
    let n = new Notification();
    n.title = title
    n.body = body
    n.sound = 'alert'
    if (url) {n.openURL = url}
    return await n.schedule();
  }
  
  // User Information
  const info = await getJson('https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2');
  const sign = await signBeanAct('https://api.m.jd.com/client.action?functionId=signBeanAct&appid=ld');
  
  const Run = async () => {
    if (index === 0) {
      const asset = await totalAsset('https://ms.jr.jd.com/gw/generic/bt/h5/m/firstScreenNew');
      setting.schemeUrl = 'openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fmbt.jd.com%2Fbill%2Fmonthlybill%2Fmonthbillcore%2Fmonth-bill-index.html%3Fchannelcode%3D024%22%7D'
      setting.randomIndex = 1;
      const state = asset.quota.state === '1';
      val = {
        leading: 3,
        imageSize: 48,
        spac: 10,
        logoImage: 'http://mtw.so/67mqz3',
        text1: state ? `额度 ${Math.round(asset.quota.quotaLeft.replace(',', ''))}` : '额度 0.00',
        text2: state ? `待还 ${asset.bill.amount}` : '0.00',
        lightColor: '#FF0000',
        darkColor: '#FFBF00'
      }
    } else if (index === 1) {
      const expireBean = await splitBeans('https://api.m.jd.com?appid=jd-cphdeveloper-m&functionId=myBean&body=%7B%22tenantCode%22:%22jgm%22,%22bizModelCode%22:%226%22,%22bizModeClientType%22:%22M%22,%22externalLoginType%22:%221%22%7D&g_login_type=0&g_tk=997104177&g_ty=ajax&appCode=ms0ca95114');
      setting.schemeUrl = 'openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fbean.m.jd.com%2FbeanDetail%2Findex.action%3FresourceValue%3Dbean%22%7D'
      setting.randomIndex = 2;
      val = {
        leading: -3,
        imageSize: 38,
        spac: 1,
        logoImage: 'http://mtw.so/6mCxwp',
        text1: '今日京豆 ' + String(posi - mega),
        text2: `即将过期 ${expireBean}`,  
        lightColor: '#FF0000',
        darkColor: '#FFBF00'
      }
    } else if (index === 2) {
      const redEnvelope = await redPackage('https://wq.jd.com/user/info/QueryUserRedEnvelopesV2?type=1&orgFlag=JD_PinGou_New&page=1&cashRedType=1&redBalanceFlag=1&channel=3&sceneval=2&g_login_type=1');
      setting.schemeUrl = 'openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fwqs.jd.com%2Fmy%2Fredpacket.shtml%3Fsceneval%3D2%26jxsid%3D16780988595962555448%22%7D'
      setting.randomIndex = 3;
      val = {
        leading: -3,
        imageSize: 42,
        spac: 1,
        logoImage: 'http://mtw.so/5ZaunR',
        text1: `红包 ${redEnvelope.balance}`,
        text2: `即将过期 ${redEnvelope.expiredBalance}`,  
        lightColor: '#FF0000',
        darkColor: '#FFBF00'
      }
    } else if (index === 3) {
      const farm = await farmProgress('https://api.m.jd.com/client.action?functionId=initForFarm');
      if (farm.treeState === 2 || farm.treeState === 3) {
        notify('东东农场', `${farm.name}，可以兑换啦~`);  
      }
      setting.schemeUrl = 'openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fcarry.m.jd.com%2FbabelDiy%2FZeus%2F3KSjXqQabiTuD1cJ28QskrpWoBKT%2Findex.html%3FbabelChannel%3D94%2Findex%3Fsource%3Dlingjingdoushouye%22%7D'
      setting.randomIndex = 4;
      val = {
        leading: 5,
        imageSize: 35,
        spac: 5,
        logoImage: 'https://gitcode.net/enoyee/scriptable/raw/master/img/jd/icon_fruit.png',
        text1: `已种植『 ${farm.simpleName} 』`,
        text2: '果树进度  ' + Math.floor((farm.treeEnergy / farm.treeTotalEnergy) * 100) + '%',  
        lightColor: '#1ea532',
        darkColor: '#32CD32'
      }
    } else if (index === 4) {
      // http://mtw.so/66Fl0K
      setting.schemeUrl = 'openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fh5.m.jd.com%2Frn%2F3a5TGXF7Y8xpQ45CjgMzQ3tyqd4K%2Findex.html%3Fhas_native%3D0%2Findex%3Fsource%3Dlingjingdoushouye%22%7D'
      setting.randomIndex = 5;
      val = {
        leading: 3,
        imageSize: 40,
        spac: 8,
        logoImage: 'https://m.360buyimg.com/babel/jfs/t1/163192/9/7798/5516/6037526eE6df71306/1504fb66a0aa1a8e.png',
        text1: `已连签 ${sign.continuousDays} 天`,
        text2: `明天加 ${sign.tomorrowSendBeans} 京豆`,
        lightColor: '#000000',
        darkColor: '#FFA500'
      }
    } else if (index === 5) {
      const promise = await custXbScore('https://ms.jr.jd.com/gw/generic/bt/h5/m/queryCustXbScoreInfo');
      setting.schemeUrl = 'openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Fagree.jd.com%2Fm%2Findex.html%3Fsceneval%3D2%26jxsid%3D16780988595962555448%26channel%3Dwq%26from%3Djdmwode%22%7D'
      setting.randomIndex = 0;
      val = {
        leading: 3,
        imageSize: 33,
        spac: 8,
        logoImage: 'https://gitcode.net/4qiao/scriptable/raw/master/img/icon/human.png',
        text1: `守约分 ${promise.xbScore}`,
        text2: promise.recentDate,
        lightColor: '#000000',
        darkColor: '#FFFFFF'
      }
    }
    // Stack & Text Color
    stackSize = new Size(0, 64);
    stackBackground = Color.dynamic(
      new Color('#EFEBE9', Number(setting.light)),
      new Color('#161D2A', Number(setting.dark))
    );
    textColor = Color.dynamic(
      new Color('#1E1E1E'),
      new Color('#FEFEFE')
    );
    jNumColor = Color.dynamic(
      new Color('#FF0000'),
      new Color('#FFBF00')
    );
    botTextColor = Color.dynamic(
      new Color(val.lightColor),
      new Color(val.darkColor)
    );
  }

  
  /**
   * Frame Layout
   * @param {image} image
   * @param {string} text
   */
  async function createWidget() {
    const widget = new ListWidget();
    if (F_MGR.fileExists(bgImage)) {
      widget.backgroundImage = await shadowImage(F_MGR.readImage(bgImage))
    } else {
      widget.backgroundColor = Color.dynamic(new Color('#967969'), new Color('#555555'));
    }
    
    /* Top Content */
    widget.setPadding(0, 0, 0, 0);
    const topStack = widget.addStack();
    topStack.setPadding(10, 3, 10, 3)
    topStack.layoutHorizontally();
    topStack.centerAlignContent();
    topStack.addSpacer();
    topStack.backgroundColor = stackBackground;
    topStack.cornerRadius = 21;
    topStack.size = stackSize;
    
    const iconStack = topStack.addStack();
    const headImage = await getImage(info.headImageUrl);
    const imageElement = iconStack.addImage(headImage);
    imageElement.imageSize = new Size(45, 45);
    iconStack.cornerRadius = Number(setting.radian);
    iconStack.borderWidth = 2;
    iconStack.borderColor = new Color('#FFBF00');
    topStack.addSpacer(10);
    
    const nameStack = topStack.addStack();
    nameStack.layoutVertically();
    nameStack.centerAlignContent();
    const nicknameText = nameStack.addText(info.nickname);
    nicknameText.font = Font.boldSystemFont(15);
    nicknameText.textColor = textColor;
    nicknameText.textOpacity = 0.8
    nameStack.addSpacer(2);
    
    const jdNumStack = nameStack.addStack();
    jdNumStack.layoutHorizontally();
    jdNumStack.centerAlignContent();
    const jdou = await getImage('http://mtw.so/5K9zGv');
    const jdouIcon = jdNumStack.addImage(jdou);
    jdouIcon.imageSize = new Size(16, 16);
    jdNumStack.addSpacer(3);
    const contentText = jdNumStack.addText(info.jdNum.toString());
    contentText.font = Font.boldSystemFont(16);
    contentText.textColor = jNumColor
    contentText.textOpacity = 0.7;
    topStack.addSpacer();
    widget.addSpacer(5);
    
    // middleStack
    const middleStack = widget.addStack();
    middleStack.addSpacer();
    const middleText = middleStack.addText(`京享值 ${info.jvalue.toString()}`);
    middleText.textColor = Color.white();
    middleText.textOpacity = 0.9
    middleText.font = Font.boldSystemFont(11);
    middleStack.addSpacer();
    widget.addSpacer();
    
    /** 
    * Bottom Content
    * @param {image} image
    * @param {string} jvalue
    */
    const contentStack = widget.addStack();
    contentStack.layoutHorizontally()
    contentStack.centerAlignContent()
    contentStack.addSpacer();
    contentStack.backgroundColor = stackBackground;
    contentStack.setPadding(10, val.leading, 10, 3);
    contentStack.cornerRadius = 21;
    contentStack.size = stackSize;
    // Logo icon
    const logoStack = contentStack.addStack();
    const logoImage = await getImage(val.logoImage);
    const logoIcon = logoStack.addImage(logoImage);
    logoIcon.imageSize = new Size(val.imageSize, val.imageSize);
    contentStack.addSpacer(val.spac);
    
    const bottStack = contentStack.addStack();
    bottStack.layoutVertically();
    bottStack.centerAlignContent();
    
    const randomText1 = bottStack.addText(val.text1);
    randomText1.textColor = textColor;
    randomText1.font = Font.boldSystemFont(13);
    randomText1.textOpacity = 0.8;
    bottStack.addSpacer(2.5);
  
    const randomText2 = bottStack.addText(val.text2);
    randomText2.textColor = botTextColor;
    randomText2.font = Font.mediumSystemFont(13);
    randomText2.textOpacity = 0.8;
    contentStack.addSpacer();
    
    widget.url = setting.schemeUrl
    F_MGR.writeString(cacheFile, JSON.stringify(setting));
    if (config.runsInApp) {
      await widget.presentSmall();
    } else {
      Script.setWidget(widget);
      Script.complete();
    }
    return widget;
  }
  
  
  /**-------------------------**
   * Request(url) json & image
   */
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
    
  async function getJson(url) {
    const req = new Request(url)
    req.method = 'POST'
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
  
  async function splitBeans(url) {
    const req = new Request(url)
    req.method = 'GET'
    req.headers = {
      Referer: 'https://plantearth.m.jd.com/',
      Cookie: cookie
    }
    const res = await req.loadJSON();
    const df = new DateFormatter();
    df.dateFormat = 'yyyy-MM-dd'
    const date = df.string(new Date());
    let positive = [];
    let megative = [];
    for (const item of res.list) {
      if (item.amount > 0 && item.createDate.indexOf(date) > -1) {
        positive.push(item.amount);
      } else if (item.amount < 0 && item.createDate.indexOf(date) > -1) {
        megative.push(item.amount);
      }
    }
    
    posi = positive.length == 0 ? 0 : positive.reduce((accumulator, currentValue) => accumulator + currentValue);
    mega = megative.length == 0 ? 0 : Math.abs(megative.reduce((accumulator, currentValue) => accumulator + currentValue));

    return res.willExpireNum;
  }
  
  async function redPackage(url) {
    const req = new Request(url)
    req.method = 'GET'
    req.headers = {
      Referer: 'https://plantearth.m.jd.com/',
      Cookie: cookie
    }
    const res = await req.loadJSON();
    return res.data;
  }
  
  async function farmProgress(url) {
    const req = new Request(url)
    req.method = 'POST'
    req.headers = {
      Referer: 'https://h5.m.jd.com/',  
      Cookie: cookie
    }
    req.body = 'body=version:4&appid=wh5&clientVersion=9.1.0'
    const res = await req.loadJSON();
    const { farmUserPro } = res;
    return farmUserPro;
  }
  
  async function custXbScore(url) {
    const req = new Request(url)
    req.method = 'POST'
    req.headers = {
      Referer: 'https://agree.jd.com/',
      Cookie: cookie
    }
    req.body = `reqData={}`
    const res = await req.loadJSON();
    return res.resultData.data;
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
  
  if (setting.code === 0) {
    await Run();
    await createWidget();
  } else {
    await createErrWidget();
  }
}
module.exports = { main }