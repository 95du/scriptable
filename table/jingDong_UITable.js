// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: tags;
async function main() {
  const stackSize = new Size(0, 64);
  const stackBackground = Color.dynamic(
    new Color('#EFEBE9', 0.6),
    new Color('#161D2A', 0.5)
  );
  const textColor = Color.dynamic(
    new Color('#1E1E1E'), 
    new Color('#FEFEFE')
  );
  
  const uri = Script.name();
  const F_MGR = FileManager.local();
  const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), "95duJingDong");
  const cacheFile = F_MGR.joinPath(folder, 'data.json');
  const bgPath = F_MGR.joinPath(F_MGR.documentsDirectory(), "95duBackground");
  const bgImage = F_MGR.joinPath(bgPath, uri + ".jpg");
  
  if (F_MGR.fileExists(cacheFile)) {
    data = F_MGR.readString(cacheFile)
    data = JSON.parse(data)
  }
  
  
  const info = await getJson('https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2');
  const headImage = await getImage(info.headImageUrl);
  const logoImage = await getImage('https://sweixinfile.hisense.com/media/M00/74/2D/Ch4FyWP792qAQN5lAAB6TzEuKi4387.png');
  const jdou = await getImage('http://mtw.so/67lqbD');
  const bill = await billDateJson('https://ms.jr.jd.com/gw/generic/bt/h5/m/queryCard');
  const asset = await totalAsset('https://ms.jr.jd.com/gw/generic/bt/h5/m/queryCreditManage');
  
  if (config.runsInWidget) {
    widget = await createWidget();
    await widget.presentSmall();
  }
  
  async function createWidget() {
    const widget = new ListWidget();
    widget.backgroundImage = F_MGR.readImage(bgImage);
    
    /**
    * Frame Layout
    * Top Row Events
    */
    widget.setPadding(0, 0, 0, 0);
    const topStack = widget.addStack();
    topStack.setPadding(10, 5, 10, 5)
    topStack.layoutHorizontally();
    topStack.centerAlignContent();
    topStack.addSpacer();
    topStack.backgroundColor = stackBackground;
    topStack.cornerRadius = 23;
    topStack.size = stackSize;
    
    // User icon
    const iconStack = topStack.addStack();
    const imageElement = iconStack.addImage(headImage);
    imageElement.imageSize = new Size(45, 45);
    iconStack.cornerRadius = 30
    iconStack.borderWidth = 2;
    iconStack.borderColor = new Color('#FFBF00');
    topStack.addSpacer(10);
    
    // Nickname
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
    // http://mtw.so/67lqbD
    const jdouIcon = jdNumStack.addImage(jdou);
    jdouIcon.imageSize = new Size(18, 18);
    jdNumStack.addSpacer(3);
    const contentText = jdNumStack.addText(info.jdNum.toString());
    contentText.font = Font.boldSystemFont(15);
    contentText.textColor = new Color('#FF0000');
    contentText.textOpacity = 0.7;
    topStack.addSpacer();
    widget.addSpacer(5);
    
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
    * image
    * jvalue
    */
    const contentStack = widget.addStack();
    contentStack.layoutHorizontally();
    contentStack.centerAlignContent();
    contentStack.addSpacer();
    contentStack.backgroundColor = stackBackground
    contentStack.setPadding(10, 5, 10, 5);
    contentStack.cornerRadius = 23;
    contentStack.size = stackSize;
    // Logo
    const logoStack = contentStack.addStack();
    const logoIcon = logoStack.addImage(logoImage);
    logoIcon.imageSize = new Size(45, 45);
    contentStack.addSpacer(7);
    
    const threeStack = contentStack.addStack();
    threeStack.layoutVertically();
    threeStack.centerAlignContent();
    
    const totalAsset = threeStack.addText(`总额度 ${Math.round(asset.replace(',', ''))} `);
    totalAsset.textColor = textColor;
    totalAsset.font = Font.boldSystemFont(12);
    totalAsset.textOpacity = 0.8;
    threeStack.addSpacer(2);
  
    const billDate = threeStack.addText(`账单日 ${bill.billDateStr}`);
    billDate.textColor = textColor;
    billDate.font = Font.boldSystemFont(12);
    billDate.textOpacity = 0.8;
    contentStack.addSpacer();
    
    Script.setWidget(widget);
    Script.complete();
    return widget;
  }
  
  async function downloadModule() {
    const modulePath = F_MGR.joinPath(folder, 'image.js');
    if (F_MGR.fileExists(modulePath)) {
      return modulePath;
    } else {
      const req = new Request(atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvdmlwL21haW5UYWJsZUJhY2tncm91bmQuanM='));
      const moduleJs = await req.load().catch(() => {
        return null;
      });
      if (moduleJs) {
        F_MGR.write(modulePath, moduleJs);
        return modulePath;
      }
    }
  }
  
  
  
  async function getImage(url) {
    const r = await new Request(url);
    return await r.loadImage();
  }
  
  async function getJson(url) {
    const req = new Request(url)
    req.method = 'POST'
    req.headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
      Cookie: "pt_key=AAJj-5lXADC3MHZCNaP-c-H_Ukfv3E2yVU9X_DQC78TQ76gS3zJWZXZtZdnskv4LOp_SHsbpcKs;pt_pin=jd_PDipcnWgEEWX"
    }
    const res = await req.loadJSON();
    return res.base;
  }
  
  async function totalAsset(url) {
    const request = new Request(url);
    request.method = 'POST'
    request.headers = {
      Referer: "https://mallwallet.jd.com/",
      Cookie: "pt_key=AAJj-5lXADC3MHZCNaP-c-H_Ukfv3E2yVU9X_DQC78TQ76gS3zJWZXZtZdnskv4LOp_SHsbpcKs;pt_pin=jd_PDipcnWgEEWX"
    }
    request.body = `reqData={
      "clientType": "ios"
    }`
    const res = await request.loadJSON();
    return res.resultData.data.totalAssetInfo.totalAsset
  }
  
  async function billDateJson(url) {
    const req = new Request(url)
    req.method = 'POST'
    req.headers = {
      Referer: "https://mallwallet.jd.com/",
      Cookie: "pt_key=AAJj-5lXADC3MHZCNaP-c-H_Ukfv3E2yVU9X_DQC78TQ76gS3zJWZXZtZdnskv4LOp_SHsbpcKs;pt_pin=jd_PDipcnWgEEWX"
    }
    req.body = `reqData={
      "channel": "024"
    }`
    const res = await req.loadJSON();
    return res.resultData.data;
  }
}
module.exports = { main }