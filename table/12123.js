// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: car;
/**
 * 支付宝小程序 交管12123
 * 小组件作者：95度茅台
 * 获取Token作者: @FoKit
 * UITable 版本: Version 1.2.0
 */

async function main() {
  const F_MGR = FileManager.local();
  
  const path = F_MGR.joinPath(F_MGR.documentsDirectory(), '95du12123');  
  F_MGR.createDirectory(path, true);  
  
  const cacheFile = F_MGR.joinPath(path, 'setting.json');
  
  /**
   * 读取储存的设置
   * @param {string} file - JSON
   * @returns {object} - JSON
   */
  const getSettings = (file) => {
    if ( F_MGR.fileExists(file) ) {
      return { verifyToken, myPlate, referer, sign, imgArr, picture } = JSON.parse(F_MGR.readString(file));
    }
    return {}
  };
  const setting = getSettings(cacheFile);

  /**
   * 存储当前设置
   * @param { JSON } string
   */
  const writeSettings = async (inObject) => {
     F_MGR.writeString(cacheFile, JSON.stringify(inObject));
     console.log(JSON.stringify(
       inObject, null, 2)
     )
   };
  
  /**
   * 获取背景图片存储目录路径
   * @returns {string} - 目录路径
   */
  const getBgImagePath = () => {
    const bgImgPath = F_MGR.joinPath(F_MGR.documentsDirectory(), '95duBackground');
    return F_MGR.joinPath(bgImgPath, Script.name() + '.jpg');
  };
  
  /**
   * Get boxjs Data
   * 依赖：Quantumult-X / Surge
   */
  const getBoxjsData = async () => {
    try {
      const boxjs_data = await new Request('http://boxjs.com/query/data/body_12123').loadJSON();
      const boxjs = boxjs_data.val.split(',');
      verifyToken = boxjs[0];
      sign = boxjs[1];
      const boxjs_referer = await new Request('http://boxjs.com/query/data/referer_12123').loadJSON();
      referer = boxjs_referer.val;

      if (verifyToken && referer) {
        await writeSettings({
          ...setting,
          sign,
          verifyToken,
          referer
        })
        
        if (sign !== setting.sign && imgArr?.length) {
          Timer.schedule(1500, false, () => {notify('Boxjs_12123', 'verifyToken/Sign/Referer 储存成功')})
        }
      }
    } catch (e) {
      console.log(e + '\n或网络有问题')
      notify('获取 Boxjs 数据失败 ⚠️', '需打开 Quantumult-X 或其他辅助工具', 'quantumult-x://');
    }
  };
  
  if (verifyToken === null || sign === null || !referer) {
    await getBoxjsData();
  };
  
  /**
   * 获取请求数据
   * @param {string} - string
   * @returns {image} - url
   */
  const getGovData = async() => {
    const invoke = await new Request(atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zaG9ydGN1dHMvcmF3L21hc3Rlci9hcGkvdXBkYXRlL3Zpb2xhdGlvbi5qc29u')).loadJSON();
    return { infoURL, productId, version, api1, api2, api3, api4, alipayUrl, statusUrl, detailsUrl, maybach } = invoke;
  };
  
  /**
   * 获取远程图片
   * @returns {image} - image
   */
  const getImage = async (url) => {
    return await new Request(url).loadImage();
  };
  
  /**
   * 获取图片并使用缓存
   * @param {string} File Extension
   * @returns {image} - Request
   */
  const cache = F_MGR.joinPath(path, 'cachePath');
  F_MGR.createDirectory(cache, true);
  
  const downloadCarImage = async (item) => {
    const carImage = await getImage(item);
    const imgKey = decodeURIComponent(item.substring(item.lastIndexOf("/") + 1));
    const cachePath = F_MGR.joinPath(cache, imgKey);
    F_MGR.writeImage(cachePath, carImage);
    imgArr.push(imgKey);
    await writeSettings(setting);
  };
  
  if ( !imgArr?.length ) {
    if (picture.length > 0) {
      maybach = picture;
    }
    maybach.forEach(async (item) => {
      await downloadCarImage(item);
    });
  }
  
  async function getRandomImage() {
    const count = imgArr.length;
    const index = Math.floor(Math.random() * count);
    const cacheImgPath = cache + '/' + imgArr[index];
    return ing = await F_MGR.readImage(cacheImgPath);
  };
  
  /**
   * 发送请求获取信息
   *
   * @param {string} api
   * @param {object} params 请求参数
   * @param {object} params具体请求参数
   * @returns {object} 响应结果对象
   */
  const requestInfo = async (api, params) => {
    const request = new Request(infoURL);
    request.method = 'POST';
    request.body = `params=${encodeURIComponent(JSON.stringify({
      productId,
      api,
      sign,
      version,
      verifyToken,
      params,
    }))}`;
    const response = await request.loadJSON();
    if (!response.success) {
      await handleError(request);
    }
    return response;
  };
  
  // 获取车辆违章信息
  const getVehicleViolation = async (vehicle) => {
    const vioList = getRandomItem(vehicle);
    if (!vioList) {
      return undefined;
    }
    const issueData = await getIssueData(vioList);
    if (!issueData) {
      return undefined;
    }
    const surveils = await getSurveils(vioList, issueData);
    const detail = getRandomItem(surveils);
    if (!detail) {
      return undefined;
    }
    const vio = await getViolationMsg(detail);
    const photos = getRandomItem(vio.photos);
    return { vioList, detail, vio, photos };
  };
  
  // 获取违章对应的发证机关信息
  const getIssueData = async (vioList) => {
    const { plate } = myPlate.match(/(^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领])([A-Z])/);
    const params = {
      internalOrder: vioList.internalOrder,
      plateType: 2,
      _issueOrganization: plate,
    };
    const issue = await requestInfo(api2, params);
    const issueArr = issue.data.vioCity.filter((item) => item.vioCount >= 1);
    return getRandomItem(issueArr);
  };
  
  // 获取违章对应的违法行为信息
  const getSurveils = async (vioList, issueData) => {
    const params = {
      internalOrder: vioList.internalOrder,
      plateType: 2,
      issueOrganization: issueData.issueOrganization,
    };
    const surveils = await requestInfo(api3, params);
    return surveils.data.surveils;
  };
  
  // 获取违章详细信息
  const getViolationMsg = async (detail) => {
    const params = {
      violationSerialNumber: detail.violationSerialNumber,
      issueOrganization: detail.issueOrganization,
    };
    const violationMsg = await requestInfo(api4, params);
    return violationMsg.data.detail;
  };
  
  // 查询主函数
  const violationQuery = async () => {
    const params = { productId, api: api1, sign, version, verifyToken };
    const main = await requestInfo(api1, params);
    const { success } = main;
    if (success) {
      const { list: vehicle } = main.data;
      const violationDetails = await getVehicleViolation(vehicle);
      if (violationDetails) {
        return { success, ...violationDetails };
      }
    } else {
      await handleError(main);
    }
    return { success };
  };
  
  // 获取随机数组元素
  const getRandomItem = (array) => (array.length ? array[Math.floor(Math.random() * array.length)] : undefined);
  
  // 处理错误
  const handleError = async (response) => {
    const { resultCode, resultMsg } = response;
    if (resultCode === 'AUTHENTICATION_CREDENTIALS_NOT_EXIST' || resultCode === 'SECURITY_INFO_ABNORMAL') {
      const data = { ...setting, sign: null, verifyToken: null };
      await writeSettings(data);
      notify(`${resultMsg} ⚠️`, '点击【 通知框 】或【 车图 】跳转到支付宝12123页面重新获取，请确保已打开辅助工具', detailsUrl);
    } else {
      notify(`${resultCode} ⚠️`, resultMsg, detailsUrl);
    }
  };
  
  
  //=========> Create <=========//
  
  async function createWidget() {
    const widget = new ListWidget();
    widget.backgroundColor = Color.white();
    const bgImage = await getBgImagePath();
    if (F_MGR.fileExists(bgImage)) {
      widget.backgroundImage = F_MGR.readImage(bgImage);
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
        color = setting.gradient;
      }
      const items = color[Math.floor(Math.random() * color.length)];
      gradient.locations = [0, 1]
      gradient.colors = [
        new Color(items, Number(setting.transparency)),
        new Color('#00000000')
      ]
      widget.backgroundGradient = gradient;
    };
    
    // 调用违章查询函数
    const queryResult = await violationQuery();
    const { success, vioList, detail, vio, photos } = queryResult;
    const nothing = success ? vioList === undefined : vioList;
    
    /**
     * @param {image} image
     * @param {string} text
     * Cylindrical Bar Chart
     */
    widget.setPadding(nothing || !success ? 19 : 15, 18, 15, 14);
    const mainStack = widget.addStack();
    mainStack.layoutHorizontally();
    // Left Stack Violation Data
    const leftStack = mainStack.addStack();
    leftStack.layoutVertically();
    leftStack.addSpacer();
    // plateStack
    const plateStack = leftStack.addStack();
    textPlate = plateStack.addText(myPlate);
    textPlate.font = Font.mediumSystemFont(myPlate.length > 8 ? 16.5 : 19);
    textPlate.textColor = Color.black();
    leftStack.addSpacer(6)
  
    // Car icon
    const carIconStack = leftStack.addStack();
    carIconStack.layoutHorizontally()
    carIconStack.centerAlignContent()
    const man = SFSymbol.named('car');
    const carIcon = carIconStack.addImage(man.image);
    carIcon.imageSize = new Size(15, 15);
    carIcon.tintColor = nothing || !success ? Color.blue() : Color.red();
    carIconStack.addSpacer(5);
    // vehicleModel
    const vehicleModel = carIconStack.addStack();
    vehicleModelText = vehicleModel.addText(nothing || !success ? '未处理违章 0' : `未处理违章 ${vioList.count} 条`);
    vehicleModelText.font = Font.mediumSystemFont(12);
    vehicleModelText.textColor = new Color('#484848');
    leftStack.addSpacer(3)
  
    // violationPoint
    const vioPointStack = leftStack.addStack();
    const vioPoint = vioPointStack.addStack();
    if ( !nothing && success && detail ) {
      vioPointText = vioPoint.addText(`罚款${vio.fine}元、` + `扣${vio.violationPoint}分`);
      vioPointText.font = Font.mediumSystemFont(12);
      vioPointText.textColor = new Color('#484848');
      leftStack.addSpacer(3);
    };
      
    // validPeriodEnd icon
    const dateStack = leftStack.addStack();
    dateStack.layoutHorizontally();
    dateStack.centerAlignContent();
    if ( nothing || !success || !detail ) {
      const iconSymbol2 = SFSymbol.named('timer');
      const carIcon2 = dateStack.addImage(iconSymbol2.image)
      carIcon2.imageSize = new Size(15, 15);
      dateStack.addSpacer(5);
    };
      
    // validPeriodEndDate
    const updateTime = dateStack.addStack();
    const textUpdateTime = updateTime.addText(nothing || !success || `${vio.violationTime}` === 'undefined' ? referer.match(/validPeriodEnd=(\d{4}-\d{2}-\d{2})&/)[1] : `${vio.violationTime}`);
    textUpdateTime.font = Font.mediumSystemFont(nothing ? 13 : 12);
    textUpdateTime.textColor = new Color('#484848');
    leftStack.addSpacer(nothing || !success ? setting.leftGap1 : setting.leftGap2);
      
  
    // Status Columnar bar
    const barStack = leftStack.addStack();
    barStack.layoutHorizontally();
    barStack.centerAlignContent();
    barStack.setPadding(3, 10, 3, 10);
    // violation Early Warning
    barStack.backgroundColor = new Color('#EEEEEE', 0.1);
    barStack.cornerRadius = 10
    barStack.borderColor = nothing ? Color.green() : !success ? Color.orange() : new Color('#FF0000', 0.7);
    barStack.borderWidth = 2
    if ( nothing ) {
      // bar icon
      const barIcon = SFSymbol.named('leaf.fill');
      const barIconElement = barStack.addImage(barIcon.image);
      barIconElement.tintColor = Color.green();
      barIconElement.imageSize = new Size(16, 16);
      barStack.addSpacer(4);
    };
    // bar text
    const totalMonthBar = barStack.addText(nothing ? '无违章' : !success ? 'Sign 过期' : `${vioList.plateNumber}`);
    totalMonthBar.font = Font.mediumSystemFont(14);
    totalMonthBar.textColor = new Color(nothing ? '#00b100' : !success ? 'FF9500' : '#D50000');
    leftStack.addSpacer(8);
    
    // cumulativePoint Columnar bar
    const barStack2 = leftStack.addStack();
    barStack2.layoutHorizontally();
    barStack2.centerAlignContent();
    barStack2.backgroundColor = new Color('#EEEEEE', 0.1);
    barStack2.setPadding(3, 10, 3, 10);
    barStack2.cornerRadius = 10
    barStack2.borderColor = new Color('#AB47BC', 0.7);
    barStack2.borderWidth = 2
    // bsr icon
    const barIcon2 = SFSymbol.named('person.text.rectangle.fill');
    const barIconElement2 = barStack2.addImage(barIcon2.image);
    barIconElement2.imageSize = new Size(16, 16);
    barIconElement2.tintColor = Color.purple();
    barStack2.addSpacer(4);
    // Bar Text
    const cumulativePoint = referer.match(/cumulativePoint=(\d{1,2}|undefined|null)/)[1];
    const totalMonthBar2 = barStack2.addText(`记${cumulativePoint === 'undefined' ? '0' : cumulativePoint}分`);
    totalMonthBar2.font = Font.mediumSystemFont(14);
    totalMonthBar2.textColor = new Color('#616161');
    leftStack.addSpacer();
  
  
    /*
    * Right Main Stack
    * Car image
    * App Logo
    * Violation Address
    */
    const rightStack = mainStack.addStack();
    rightStack.layoutVertically();
    rightStack.addSpacer(10);
    // Car Logo
    const carLogoStack = rightStack.addStack();
    carLogoStack.addSpacer();
    textPlate2 = carLogoStack.addText('交管12123');
    textPlate2.font = Font.boldSystemFont(14);
    textPlate2.rightAlignText();
    textPlate2.textColor = new Color('#0061FF');
    rightStack.addSpacer(nothing || !success ? setting.rightGap1 : setting.rightGap2);
  
    // Car image
    const carImageStack = rightStack.addStack();
    carImageStack.setPadding(-20, 6, 0, 0);
    const img = await getRandomImage();
    const imageCar = carImageStack.addImage(img);
    imageCar.imageSize = new Size(setting.carWidth, setting.carHeight);
    rightStack.addSpacer(2);
  
    // Display Address
    const tipsStack = rightStack.addStack();
    tipsStack.layoutHorizontally();
    tipsStack.centerAlignContent();
    tipsStack.size = new Size(setting.bottomSize, 30);
    if (nothing || !success) {
      textAddress = tipsStack.addText(setting.botStr);
    } else {
      textAddress = tipsStack.addText(`${vio.violationAddress}，` + `${vio.violation}`);
      if ( success && detail ) {
        textAddress.url = photos;
      }
    };
    textAddress.font = Font.mediumSystemFont(nothing || !success ? 11.5 : 11);
    textAddress.textColor = new Color('#484848');
    textAddress.centerAlignText();
    rightStack.addSpacer();
    
    // jump show status
    barStack2.url = statusUrl;
    textPlate2.url = 'tmri12123://'
    imageCar.url = detailsUrl;
    
    if ( !config.runsInWidget ) {  
      await widget.presentMedium();
    } else {
      Script.setWidget(widget);
      Script.complete();
    };
    return widget;
  }
  
  /**-------------------------**/
     /** Request(url) json **/
  /**-------------------------**/
  
  async function notify (title, body, url, opts = {}) {
    let n = new Notification()
    n = Object.assign(n, opts);
    n.title = title
    n.body = body
    if (url) n.openURL = url
    return await n.schedule()
  };
  
  async function createErrWidget() {
    const widget = new ListWidget();
    const text = widget.addText('仅支持中尺寸');
    text.font = Font.systemFont(17);
    text.centerAlignText();
    Script.setWidget(widget);
  };
  
  async function shadowImage(img) {
    let ctx = new DrawContext()
    ctx.size = img.size
    ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']))
    ctx.setFillColor(new Color("#000000", Number(setting.masking)));
    ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']))
    return await ctx.getImage()
  };
  
  const runWidget = async () => {
    await getGovData();
    if ((config.widgetFamily === 'medium' || config.runsInApp) && referer && imgArr.length > 0) {
      createWidget();
    } else {
      createErrWidget();
    }
  };
  await runWidget();
}
module.exports = { main }