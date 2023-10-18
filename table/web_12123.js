// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: car;
/**
 * 支付宝小程序 交管12123
 * 小组件作者：95度茅台
 * 获取Token作者: @FoKit
 * Version 1.0.0
 */
await 
async function main() {
  const fm = FileManager.local();
  const path = fm.joinPath(fm.documentsDirectory(), '95du_12123');
  const cacheData = fm.joinPath(path, 'cache_path');
  const cacheFile = fm.joinPath(path, 'setting.json');
  
  /**
   * 读取储存的设置
   * @param {string} file - JSON
   * @returns {object} - JSON
   */
  const getSettings = (file) => {
    if ( fm.fileExists(file) ) {
      return { verifyToken, myPlate, referer, sign, imgArr, picture } = JSON.parse(fm.readString(file));
    }
    return {}
  };
  const setting = getSettings(cacheFile);

  /**
   * 存储当前设置
   * @param { JSON } string
   */
  const writeSettings = async (inObject) => {
    fm.writeString(cacheFile, JSON.stringify(inObject, null, 2));
    console.log(JSON.stringify(
      inObject, null, 2
    ));
  };
  
  /**
   * 获取背景图片存储目录路径
   * @returns {string} - 目录路径
   */
  const getBgImagePath = () => {
    const bgImgPath = fm.joinPath(fm.documentsDirectory(), '95duBackground');
    return fm.joinPath(bgImgPath, Script.name() + '.jpg');
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
        writeSettings({
          ...setting,
          sign,
          verifyToken,
          referer
        })
        
        if (sign !== setting.sign && imgArr?.length) {
          Timer.schedule(1500, false, () => {notify('Boxjs_12123', 'verifyToken/Sign/Referer 更新成功')})
        }
      }
    } catch (e) {
      console.log(e + '或网络有问题')
      notify('获取 Boxjs 数据失败 ⚠️', '需打开 Quantumult-X 或其他辅助工具', 'quantumult-x://');
    }
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
  await getGovData();
  
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
  const cache = fm.joinPath(path, 'cachePath');
  fm.createDirectory(cache, true)
  
  const downloadCarImage = async (item) => {
    const carImage = await getImage(item);
    const imgKey = decodeURIComponent(item.substring(item.lastIndexOf("/") + 1));
    const cachePath = fm.joinPath(cache, imgKey);
    fm.writeImage(cachePath, carImage);
    imgArr.push(imgKey);
    writeSettings(setting);
    await getRandomImage();
  };
  
  if ( !imgArr?.length ) {
    maybach.forEach(async (item) => {
      await downloadCarImage(item);
    });
  }
  
  async function getRandomImage() {
    const count = imgArr.length;
    const index = Math.floor(Math.random() * count);
    const cacheImgPath = cache + '/' + imgArr[index];
    return vehicleImg = await fm.readImage(cacheImgPath);
  };
    
  try {
    if (setting.carImg) {
      const carImg = setting.carImg;
      const name = decodeURIComponent(carImg.substring(carImg.lastIndexOf("/") + 1));
      vehicleImg = await getCacheImage(name, carImg);
    } else {
      vehicleImg = await getRandomImage();
    }
  } catch (e) {
    const cacheMaybach = fm.joinPath(cache, 'Maybach-8.png');
    vehicleImg = fm.readImage(cacheMaybach);
  };
  
  /**  
   * 获取网络图片并使用缓存
   * @param {Image} url
   */
  const useFileManager = ({ cacheTime } = {}) => {
    return {
      readString: (fileName) => {
        const filePath = fm.joinPath(cacheData, fileName);
        if (fm.fileExists(filePath) && cacheTime < 18 && setting.useCache) {
          return fm.readString(filePath);
        }
        return null;
      },
      writeString: (fileName, content) => fm.writeString(fm.joinPath(cacheData, fileName), content),
      // cache image
      readImage: (fileName) => {
        const imgPath = fm.joinPath(cache, fileName);
        return fm.fileExists(imgPath) ? fm.readImage(imgPath) : null;
      },
      writeImage: (fileName, image) => fm.writeImage(fm.joinPath(cache, fileName), image)
    }
  };
    
  const getCacheImage = async (name, url) => {
    const cache = useFileManager();
    const image = cache.readImage(name);
    if ( image ) {
      return image;
    }
    const img = await getImage(url);
    cache.writeImage(name, img);
    return img;
  };
  
  /**
   * 获取JSON字符串
   * @param {string} json
   */
  const getCacheString = async (jsonName, api, params) => {
    const cacheTime = new Date().getHours();
    const cache = useFileManager({ cacheTime });
    const jsonString = cache.readString(jsonName);
    if (jsonString) {
      return JSON.parse(jsonString);
    }
    const response = await requestInfo(api, params);
    const jsonFile = JSON.stringify(response);
    cache.writeString(jsonName, jsonFile);
    return JSON.parse(jsonFile);
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
    request.body = 'params=' + encodeURIComponent(JSON.stringify({
      productId,
      api,  
      sign,
      version,
      verifyToken,
      params,
    }));
    const response = await request.loadJSON();
    if (!response.success) {
      await handleError(request);
    }
    return response;
  };
  
  // 获取车辆违章信息
  const getVehicleViolation = async (vehicle) => {
    const vioList = await getRandomItem(vehicle);
    if (!vioList) {
      return undefined;
    }
    const issueData = await getIssueData(vioList);
    if (!issueData) {
      return undefined;
    }
    const surveils = await getSurveils(vioList, issueData);
    //const detail = await getRandomItem(surveils);
    const randomIndex = Math.floor(Math.random() * surveils.length);
    const detail = surveils[randomIndex];
    if (!detail) {
      return undefined;
    }
    const index = randomIndex + 1;
    const vioDetail = await getViolationMsg(detail, index);
    const vio = vioDetail.detail;
    const photos = await getRandomItem(vioDetail.photos);
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
    const issue = await getCacheString('issue.json', api2, params);
    try {
      const issueArr = issue.data.vioCity.filter((item) => item.vioCount >= 1);
      return await getRandomItem(issueArr);
    } catch (e) {
      console.log(e);
    }
  };
  
  // 获取违章对应的违法行为信息  
  const getSurveils = async (vioList, issueData) => {
    const params = {
      internalOrder: vioList.internalOrder,
      plateType: 2,
      issueOrganization: issueData.issueOrganization,
    };
    const surveils = await getCacheString('surveils.json', api3, params);
    return surveils ? surveils.data?.surveils : [];
  };
  
  // 获取违章详细信息
  const getViolationMsg = async (detail, number) => {
    const params = {
      violationSerialNumber: detail.violationSerialNumber,
      issueOrganization: detail.issueOrganization,
    };
    //const violationMsg = await requestInfo(api4, params);
    const violationMsg = await getCacheString(`violationMsg${number}.json`, api4, params);
    return { detail, photos } = violationMsg.data;
  };
  
  // 查询主函数
  const violationQuery = async () => {
    const params = { productId, api: api1, sign, version, verifyToken };
    const main = await getCacheString('main.json', api1, params);
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
  const getRandomItem = async (array) => {
    if ( array?.length ) {
      const infoRandom = array[Math.floor(Math.random() * array.length)];
      return infoRandom;
    }
  };
  
  // 处理错误
  const handleError = async (response) => {
    const { resultCode, resultMsg } = response;
    if (resultCode === 'AUTHENTICATION_CREDENTIALS_NOT_EXIST' || resultCode === 'SECURITY_INFO_ABNORMAL') {
      const data = { ...setting, sign: null, verifyToken: null };
      writeSettings(data);
      notify(`${resultMsg} ⚠️`, '点击【 通知框 】或【 车图 】跳转到支付宝12123页面重新获取，请确保已打开辅助工具', detailsUrl);
    }
  };
  
  
  //=========> Create <=========//
  async function createWidget() {
    const widget = new ListWidget();
    
    const bgImage = await getBgImagePath();
    if (fm.fileExists(bgImage)) {
      widget.backgroundImage = await shadowImage(fm.readImage(bgImage));
    } else {
      const gradient = new LinearGradient();
      const color = setting.gradient.length > 0 ? setting.gradient : [setting.rangeColor];
      const randomColor = color[Math.floor(Math.random() * color.length)];
      
      // 渐变角度
      const angle = setting.angle;
      const radianAngle = ((360 - angle) % 360) * (Math.PI / 180);
      const x = 0.5 + 0.5 * Math.cos(radianAngle);
      const y = 0.5 + 0.5 * Math.sin(radianAngle);
      gradient.startPoint = new Point(1 - x, y);
      gradient.endPoint = new Point(x, 1 - y);
      
      gradient.locations = [0, 1];
      gradient.colors = [
        new Color(randomColor, Number(setting.transparency)),
        new Color('#00000000')
      ];
      widget.backgroundGradient = gradient;  
      widget.backgroundColor = new Color(setting.solidColor);
    };
    
    // 调用违章查询函数
    const queryResult = await violationQuery();
    const { success, vioList, detail, vio, photos } = queryResult;
    const nothing = success ? vioList === undefined : vioList;
    
    const textColor = Color.dynamic(new Color(setting.textLightColor), new Color(setting.textDarkColor));

    /**
     * @param {image} image
     * @param {string} text
     * Cylindrical Bar Chart
     */
    widget.setPadding(15, 18, 15, 15);
    if (nothing || !success) {
      widget.addSpacer(3);
    }
    const topStack = widget.addStack();
    if ( detail && success ) topStack.setPadding(0, 0, 3, 0)
    topStack.layoutHorizontally();
    topStack.centerAlignContent()
    
    const plateText = topStack.addText(myPlate);
    plateText.font = Font.mediumSystemFont(19.5);
    plateText.textColor = new Color(setting.titleColor);
    topStack.addSpacer();
    
    const text12123 = topStack.addText('12123');
    text12123.font = Font.mediumSystemFont(18);
    text12123.rightAlignText();
    text12123.textColor = new Color('#0061FF');
    
    /**
     * mainStack
     * Left and right
     */
    const mainStack = widget.addStack();
    mainStack.layoutHorizontally();
    mainStack.centerAlignContent()
    
    const leftStack = mainStack.addStack();
    leftStack.size = new Size(setting.lrfeStackWidth, 0);
    leftStack.setPadding(0, 0, (nothing || !success) ? 2 : 3, 0);
    leftStack.layoutVertically();
    leftStack.centerAlignContent();

    // 
    const carIconStack = leftStack.addStack();
    carIconStack.layoutHorizontally()
    carIconStack.centerAlignContent()
    const man = SFSymbol.named('car.circle');
    const carIcon = carIconStack.addImage(man.image);
    carIcon.imageSize = new Size(15, 15);
    carIcon.tintColor = nothing || !success ? Color.blue() : Color.red();
    carIconStack.addSpacer(5);
    
    // 
    const vehicleModel = carIconStack.addStack();
    vehicleModelText = vehicleModel.addText(nothing || !success ? '未处理违章 0' : `未处理违章 ${vioList.count} 条`);
    vehicleModelText.font = Font.mediumSystemFont(12);
    vehicleModelText.textColor = textColor;
    vehicleModelText.textOpacity = 0.7
    leftStack.addSpacer(3)
  
    //
    const vioPointStack = leftStack.addStack();
    const vioPoint = vioPointStack.addStack();
    if ( !nothing && success && detail ) {
      vioPointText = vioPoint.addText(`罚款${vio.fine}元   扣${vio.violationPoint}分`);
      vioPointText.font = Font.mediumSystemFont(12);
      vioPointText.textColor = textColor;
      vioPointText.textOpacity = 0.7
      leftStack.addSpacer(3);
    };
      
    // 
    const dateStack = leftStack.addStack();
    dateStack.layoutHorizontally();
    dateStack.centerAlignContent();
    if ( nothing || !success || !detail ) {
      const iconSymbol2 = SFSymbol.named('timer');
      const carIcon2 = dateStack.addImage(iconSymbol2.image)
      carIcon2.imageSize = new Size(15, 15);
      dateStack.addSpacer(5);
    };
      
    // 
    const updateTime = dateStack.addStack();
    const textUpdateTime = updateTime.addText(nothing || !success || `${vio.violationTime}` === 'undefined' ? referer.match(/validPeriodEnd=(\d{4}-\d{2}-\d{2})&/)[1] : `${vio.violationTime}`);
    textUpdateTime.font = Font.mediumSystemFont(nothing ? 13 : 11.8);
    textUpdateTime.textColor = textColor;
    textUpdateTime.textOpacity = 0.7
    leftStack.addSpacer();
    
    /**
     * @param {Stack} leftStack
     * @param {boolean} Status bar
     * @returns {Stack} Stack
     */
    const barStack = leftStack.addStack();
    barStack.layoutHorizontally();
    barStack.centerAlignContent();
    barStack.setPadding(3, 10, 3, 10);
    
    //
    barStack.backgroundColor = new Color('#EEEEEE', 0.1);
    barStack.cornerRadius = 10
    barStack.borderColor = nothing ? Color.green() : !success ? Color.orange() : new Color('#FF0000', 0.7);
    barStack.borderWidth = 2
    
    if ( nothing ) {
      const barIcon = SFSymbol.named('leaf.fill');
      const barIconElement = barStack.addImage(barIcon.image);
      barIconElement.tintColor = Color.green();
      barIconElement.imageSize = new Size(16, 16);
      barStack.addSpacer(4);
    };
    
    const totalMonthBar = barStack.addText(nothing ? '无违章' : !success ? 'Sign 过期' : `${vioList.plateNumber}`);
    totalMonthBar.font = Font.mediumSystemFont(14);
    totalMonthBar.textColor = new Color(nothing ? '#00b100' : !success ? 'FF9500' : '#D50000');
    leftStack.addSpacer(8);
    
    // 
    const barStack2 = leftStack.addStack();
    barStack2.layoutHorizontally();
    barStack2.centerAlignContent();
    barStack2.backgroundColor = new Color('#EEEEEE', 0.1);
    barStack2.setPadding(3, 10, 3, 10);
    barStack2.cornerRadius = 10
    barStack2.borderColor = new Color('#AB47BC', 0.7);
    barStack2.borderWidth = 2
    
    const systemVersion =  Device.systemVersion().split('.')[0];
    const barIcon2 = SFSymbol.named(systemVersion < 16 ? 'server.rack' : 'person.text.rectangle.fill');
    const barIconElement2 = barStack2.addImage(barIcon2.image);
    barIconElement2.imageSize = new Size(16, 16);
    barIconElement2.tintColor = Color.purple();
    barStack2.addSpacer(4);
    
    const cumulativePoint = referer.match(/cumulativePoint=(\d{1,2}|undefined|null)/)[1];
    const totalMonthBar2 = barStack2.addText(`记${cumulativePoint === 'undefined' ? '0' : cumulativePoint}分`);
    totalMonthBar2.font = Font.mediumSystemFont(14);
    totalMonthBar2.textColor = new Color('#616161');
    
    /**
     * @param {Stack} rightStack
     * @param {image} car & icon
     * @param {string} string
     */
    const rightStack = mainStack.addStack();
    rightStack.layoutVertically();
    rightStack.centerAlignContent();
    
    const carImageStack = rightStack.addStack();
    carImageStack.setPadding(nothing || !success ? setting.carTop + 8 : setting.carTop, 5, setting.carBottom, 0);
    carImageStack.size = new Size(setting.carStackWidth, 0);
      
    const imageCar = carImageStack.addImage(vehicleImg);
    imageCar.imageSize = new Size(setting.carWidth, setting.carHeight);
    rightStack.addSpacer();
  
    // 
    const tipsStack = rightStack.addStack();
    tipsStack.layoutHorizontally(); 
    tipsStack.centerAlignContent();
    tipsStack.size = new Size(setting.bottomSize, 28);
    
    if ( success && detail ) {
      const shortText = `${vio.violationAddress}，${vio.violation}`;
      if ( shortText.length <= 19 ) {
        violationText = `${shortText}，违章序列号 ${detail.violationSerialNumber}`;
      } else {
        violationText = shortText;
      }
    };

    if (nothing || !success) {
     tipsText = tipsStack.addText(setting.botStr);
    } else {
      tipsText = tipsStack.addText(violationText);
      if ( success && detail ) {
        tipsText.url = photos;
      }
    };
    tipsText.font = Font.mediumSystemFont(nothing || !success ? 11.5 : 11);
    tipsText.textColor = textColor;
    tipsText.textOpacity = 0.7
    tipsText.centerAlignText();
    
    // jump show status
    barStack2.url = statusUrl;
    topStack.url = 'tmri12123://'
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
    let n = new Notification();
    n = Object.assign(n, opts);
    n.title = title
    n.body = body
    if (url) n.openURL = url
    return await n.schedule();
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
    ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']));
    ctx.setFillColor(new Color("#000000", Number(setting.masking)));
    ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']))
    return await ctx.getImage();
  };
  
  const runWidget = async () => {
    if (!verifyToken || !referer) {
      await getBoxjsData();
    }
    if ((config.widgetFamily === 'medium' || config.runsInApp) && referer && imgArr.length > 0) {
      await createWidget();
    } else {
      createErrWidget();
    }
  };
  await runWidget();
}
module.exports = { main }