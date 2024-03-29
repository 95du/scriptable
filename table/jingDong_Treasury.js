// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: fingerprint;
/**
 * 小组件作者：95度茅台
 * UITable 版本: Version 1.0.0
 * 2023-03-19 11:30
 * Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy
 */

async function main() {
  const F_MGR = FileManager.local();
  const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), "95duJingDong_Treasury");
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
      return { cookie } = JSON.parse(data);
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
  
  const treasury = await myAsset();
  if (!treasury) {
    setting.code = 3;
    F_MGR.writeString(cacheFile, JSON.stringify(setting));
    notify('京东小金库', 'Cookie已过期，请重新登录京东账号');
  }
  const {
    profitAmtBar,
    amountBar,
    availableAmountBar,
    totalIncomeAmtBar
  } = treasury;
  
  if (amountBar.balance !== setting.totalAssets) {
    setting.totalAssets = amountBar.balance;
    F_MGR.writeString(cacheFile, JSON.stringify(setting));  
    notify('京东金融提醒', `${amountBar.text}变动，剩余 ${amountBar.balance} 元。`);
  }
  
  async function createWidget() {
    const widget = new ListWidget();
    if (F_MGR.fileExists(bgImage)) {
      widget.backgroundImage = await shadowImage(F_MGR.readImage(bgImage))  
    } else if (setting.gradient.length !== 0) {
      const gradient = new LinearGradient();
      color = setting.gradient;
      const items = color[Math.floor(Math.random() * color.length)];
      gradient.locations = [0, 1]
      gradient.colors = [
        new Color(items, Number(setting.transparency)),
        new Color('#00000000')
      ]
      widget.backgroundGradient = gradient;
    } else {
      const imgUrl = ['https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/treasury.jpeg', 'https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/treasury1.jpeg']
      const Urlitems = imgUrl[Math.floor(Math.random() * imgUrl.length)];
      widget.backgroundImage = await getImage(Urlitems);
    }
    
    
    /** 
    * @param {image} image
    * @param {string} string
    */
    widget.setPadding(0, 0, 0, 0);
    const mainStack = widget.addStack();
    mainStack.layoutHorizontally();
    mainStack.centerAlignContent();
    mainStack.setPadding(20, 30, 15, 30);
    
    const topStack = mainStack.addStack();
    topStack.layoutVertically();
    topStack.centerAlignContent();

    const barStack = topStack.addStack();
    barStack.layoutHorizontally();
    barStack.centerAlignContent();
    barStack.backgroundColor = new Color('#FF9500');
    barStack.setPadding(3, 10, 3, 10);
    barStack.cornerRadius = 6;
    
    const titleText = barStack.addText(amountBar.text);
    titleText.font = Font.boldSystemFont(13);
    titleText.textColor = new Color('#000000');
    
    const balanceText = topStack.addText(amountBar.balance);
    balanceText.font = Font.boldSystemFont(28);
    balanceText.textColor = new Color('#FFFFFF');
    topStack.addSpacer();
    
    // 2
    const secondStack = topStack.addStack();
    secondStack.centerAlignContent();
    const secondText = secondStack.addText(availableAmountBar.text);
    secondText.font = Font.boldSystemFont(13);
    secondText.textColor = new Color('#FFFFFF');
    secondStack.addSpacer(7);
    
    const secondText2 = secondStack.addText(availableAmountBar.balance);
    secondText2.font = Font.boldSystemFont(15);
    secondText2.textColor = new Color('#FFFFFF');
    
    
    // 3
    const thirdStack = topStack.addStack();
    thirdStack.centerAlignContent();
    const thirdText = thirdStack.addText(totalIncomeAmtBar.text);
    thirdText.font = Font.boldSystemFont(13);
    thirdText.textColor = new Color('#FFFFFF');
    thirdStack.addSpacer(7);
    
    const thirdText2 = thirdStack.addText(totalIncomeAmtBar.balance);
    thirdText2.font = Font.boldSystemFont(15);
    thirdText2.textColor = new Color('#FFFFFF');    
    
    // 4
    const fourthStack = topStack.addStack();
    fourthStack.centerAlignContent();
    const fourthText = fourthStack.addText(profitAmtBar.text);
    fourthText.font = Font.boldSystemFont(13);
    fourthText.textColor = new Color('#FFFFFF');
    fourthStack.addSpacer(7);
    
    const fourthText2 = fourthStack.addText(profitAmtBar.balance);
    fourthText2.font = Font.boldSystemFont(15);
    fourthText2.textColor = new Color('#FFFFFF');
    mainStack.addSpacer();
    
    // Right
    const rightStack = mainStack.addStack();
    rightStack.layoutVertically();
    rightStack.centerAlignContent();
    rightStack.setPadding(-12, 0, 0, 0);
    
    const assetIcon = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/jdWord.png');
    const assetImage = rightStack.addImage(assetIcon);
    assetImage.imageSize = new Size(40, 40);
    assetImage.tintColor = new Color('#000000');
    assetImage.imageOpacity = 0.7;
    rightStack.addSpacer();
    
    widget.url = 'openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22https%3A%2F%2Flc.jr.jd.com%2Fck%2FxjkHold%2Findex%2F%3Fchannel%3Da00294%22%7D'
    if (config.runsInWidget) {
      Script.setWidget(widget);
      Script.complete();
    } else {
      await widget.presentMedium();
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
    await createWidget();
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
  
  async function myAsset(url) {
    const req = new Request('https://ms.jr.jd.com/gw/generic/xjk/h5/m/assetPageH5')
    req.method = 'POST'
    req.headers = {
      Cookie: cookie,
      Referer: 'https://lc.jr.jd.com/'
    }
    req.body = `reqData={"clientType":"ios","clientVersion":"","channel":"a00808"}`
    const res = await req.loadJSON();
    return res.resultData.data.xjkAssetBar
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
}
module.exports = { main }