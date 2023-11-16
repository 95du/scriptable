// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: car;
/**
 * 组件作者: 95度茅台
 * 组件版本: Version 1.0.0
 * 更新日期: 2023-08-12
 * 模拟电子围栏，显示车速，位置等
 */

async function main() {
  const uri = Script.name();
  const fm = FileManager.local();
  const mainPath = fm.joinPath(fm.documentsDirectory(), '95du_GPS');
  
  const getCachePath = (dirName) => fm.joinPath(mainPath, dirName);
  
  const [ settingPath, cacheImg, cacheStr, cacheCar] = [
    'setting.json',
    'cache_image',
    'cache_string',
    'cache_vehicle'
  ].map(getCachePath);
  
  
  /**
   * 读取储存的设置
   * @param {string} file - JSON
   * @returns {object} - JSON
   */
  const getSettings = (file) => {
    let setting = {};
    if (fm.fileExists(file)) {
      return { imei, password, token, run, coordinates, pushTime, imgArr, picture, aMapkey, tokenUrl, touser, agentid, interval, endAddr } = JSON.parse(fm.readString(file));
    }
    return {}
  }
  const setting = await getSettings(settingPath);
  
  /**
   * 存储当前设置
   * @param { JSON } string
   */
  const writeSettings = async (inObject) => {
    fm.writeString(settingPath, JSON.stringify(inObject, null, 2));
    console.log(JSON.stringify(
      inObject, null, 2
    ));
  }
  
  /**
   * 获取背景图片存储目录路径
   * @returns {string} - 目录路径
   */
  const getBgImagePath = () => {
    const bgImgPath = fm.joinPath(fm.documentsDirectory(), '95duBackground');
    return fm.joinPath(bgImgPath, Script.name() + '.jpg');
  };
  
  async function shadowImage(img) {
    let ctx = new DrawContext();
    ctx.size = img.size
    ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']))
    ctx.setFillColor(new Color("#000000", Number(setting.masking)));
    ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']))
    return await ctx.getImage()
  };
  
  /**
   * 弹出一个通知  
   * @param {string} title
   * @param {string} body
   * @param {string} url
   * @param {string} sound
   */
  const notify = async ( title, body, url, opts = {} ) => {
    let n = new Notification();
    n = Object.assign(n, opts);
    n.title = title
    n.body = body
    n.sound = 'piano_success'
    if (url) n.openURL = url
    return await n.schedule();
  };
  
  /**
   * 获取远程图片
   * @returns {image} - image
   */
  const getImage = async (url) => {
    return await new Request(url).loadImage();
  };
  
  /**
   * 获取车辆图片并使用缓存
   * @param {string} File Extension
   * @returns {image} - Request
   */
  const downloadCarImage = async (item) => {
    const carImage = await getImage(item);
    const imgName = decodeURIComponent(item.substring(item.lastIndexOf("/") + 1));
    const cachePath = fm.joinPath(cacheCar, imgName);
    await fm.writeImage(cachePath, carImage, { overwrite: true });
    imgArr.push(imgName);
    if ( imgArr.length > 8 ) {
      writeSettings(setting);
    }
  };
  
  const loadPicture = async () => {
    if ( !imgArr?.length ) {
      const maybach = Array.from({ length: 9 }, (_, index) => `https://gitcode.net/4qiao/scriptable/raw/master/img/car/Maybach-${index}.png`);
      maybach.forEach(async ( item ) => {
        await downloadCarImage(item);
      });
    }
  };
  
  /**
   * 随机获取缓存图片
   * @param {image} file
   */
 async function getRandomImage() {
    const count = imgArr.length;
    const index = Math.floor(Math.random() * count);
    const cacheImgPath = cacheCar + '/' + imgArr[index];
    return await fm.readImage(cacheImgPath);
  };
  
  try {
    if (setting.carImg) {
      const name = decodeURIComponent(setting.carImg.split('/').pop());
      vehicleImg = await getCacheImage(name, setting.carImg);
    } else {
      vehicleImg = await getRandomImage();
    }
  } catch (e) {
    vehicleImg = fm.readImage(fm.joinPath(cacheCar, 'Maybach-8.png'));
  };
  
  /**  
   * 获取网络图片并使用缓存
   * @param {Image} url
   */
  const useFileManager = (fileName) => {
    const imgPath = fm.joinPath(cacheImg, fileName);
    return {
      readImage: () => {
        return fm.fileExists(imgPath) ? fm.readImage(imgPath) : null;
      },
      writeImage: (image) => fm.writeImage(imgPath, image)
    }
  };
    
  const getCacheImage = async (name, url) => {
    const cache = useFileManager(name);
    const image = cache.readImage(name);
    if ( image ) {
      return image;
    }
    const img = await getImage(url);
    cache.writeImage(img);
    return img;
  };
  
  /**
   * 获取地理位置信息
   * @param {string} token
   * @param {number} longitude - 经度
   * @param {number} latitude - 纬度
   * @returns {object} - 地理位置信息的对象，包含地址、停车时间等属性
   */
  const makeRequest = async (url, body) => {
    const req = new Request(url);
    req.method = 'POST';
    req.body = body;
    return await req.loadJSON();
  };
    
  const fetchToken = async () => {
    const url = 'https://app.tutuiot.com/locator-app/imeiLoginVerification';
    const params = {
      imei,
      password
    };
    const requestBody = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&');
    
    try {
      const { data } = await makeRequest(url, requestBody);
      setting.token = data.token;
      writeSettings(setting);
      notify('登录成功', !aMapkey ? '需填写高德地图key，用于转换坐标。' : data.token);  
    } catch (e) {
      console.log(e + '178行');
    }
  };
  
  //
  const getTrackSegment = async () => {
    const url = 'https://app.tutuiot.com/locator-app/es/getTrackSegment';
    const params = {
      imeis: imei,
      page: 1,
      pageSize: 1,
      token
    };
    const requestBody = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&');
    
    try {
      const { data } = await makeRequest(url, requestBody);
      if (data.list?.length) {
        return { deviceName, endAddr, updateTime, totalTime, endTime, mileage, highestSpeed, averageSpeed, endLongitude, endLatitude } = data.list[0];
      }
      return null
    } catch (e) {
      if ( !endAddr ) {
        notify('获取数据失败⚠️', '新设备无行车/位置记录，或token已过期。');  
      }
      console.log(e + '205行');
      await fetchToken();
    }
  };
  
  //
  const getSpeed = async () => {
    const url = 'https://app.tutuiot.com/locator-app/redis/getGps';
    const params = {
      imei,
      coorType: 'wgs84',
      token
    };
    const requestBody = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&');

    try {
      const { data } = await makeRequest(url, requestBody);
      return { speed } = data;
    } catch (e) {
      console.log(e + '226行');
      await fetchToken();
    }
  };
  
  //
  const getMapUrl = async () => {
    try {
      const conversion = new Request(`https://restapi.amap.com/v3/assistant/coordinate/convert?coordsys=gps&output=json&key=${aMapkey}&locations=${endLongitude},${endLatitude}`);
      const convert = await conversion.loadJSON();
      const locations = convert.locations.split(",");
      return { 
        longitude: Number(locations[0]).toFixed(6),
        latitude: Number(locations[1]).toFixed(6)
      }
    } catch (e) {
      console.log(e + '242行');
      await fetchToken();
      return {
        longitude: 116.484828,
        latitude: 39.948585
      }
    }
  };

  //
  const getData = async () => {
    const info = await Promise.all([loadPicture(), getTrackSegment(), getSpeed()]);
    
    const { longitude, latitude } = await getMapUrl();
    const mapUrl = `https://maps.apple.com/?q=${encodeURIComponent(deviceName)}&ll=${latitude},${longitude}&t=m`;
    
    const [ state, status ] = speed <= 5 ? ['已静止', '[ 车辆静止中 ]'] : [`${speed} km·h`, `[ 车速 ${speed} km·h ]`];
    
    const textColor = Color.dynamic(new Color(setting.textLightColor), new Color(setting.textDarkColor));
    
    const GMT = updateTime.match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/)[0];
    const GMT2 = updateTime.match(/-(\d{2}-\d{2}\s\d{2}:\d{2})/)[1];
    
    const runObj = {
      ...setting,
      updateTime,
      endAddr,
      run: 'GPS',
      pushTime: Date.now(),
      parkingTime: GMT2,
      coordinates: `${longitude},${latitude}`
    };
    return { info, state, status, longitude, latitude, mapUrl, GMT, GMT2, textColor, runObj };
  };
  
  try {
    ({ info, state, status, longitude, latitude, mapUrl, GMT, GMT2, textColor, runObj } = await getData());
  } catch (error) {
    console.log(error);
  };
  
  // 设置组件背景
  const setBackground = async (widget) => {
    const bgImage = getBgImagePath();
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
    }
  };
  
  //=========> Create <=========//
  const createWidget = async () => {
    if ( !setting.run ) {
      writeSettings(runObj);
      await getRandomImage();
    }
    
    const widget = new ListWidget();
    await setBackground(widget);
    widget.refreshAfterDate = new Date(Date.now() + 1000 * 60 * Number(setting.refresh));

    /**
     * @param {number} padding
     * @returns {WidgetStack} 
     */
    widget.setPadding(10, 10, 10, 15);
    const mainStack = widget.addStack();
    mainStack.layoutHorizontally();
    mainStack.addSpacer();
    
    /**
     * Left Stack
     * @param {image} SFSymbol
     * @param {string} text
     * Cylindrical Bar Chart
     */
    const leftStack = mainStack.addStack();
    leftStack.size = new Size(setting.lrfeStackWidth, 0);
    leftStack.layoutVertically();
    leftStack.addSpacer();
    
    const plateStack = leftStack.addStack();
    const plateText = plateStack.addText(deviceName);
    plateText.font = Font.mediumSystemFont(19);
    plateText.textColor = new Color(setting.titleColor);
    plateText.textOpacity = 0.9;
    leftStack.addSpacer(3);
    
    // Update Time
    const dateStack = leftStack.addStack();
    dateStack.layoutHorizontally();
    dateStack.centerAlignContent();
    const iconSymbol2 = SFSymbol.named('timer');
    const carIcon2 = dateStack.addImage(iconSymbol2.image)
    carIcon2.imageSize = new Size(16, 16);
    dateStack.addSpacer(4);
    
    const updateTimeText = dateStack.addText(GMT2);
    updateTimeText.font = Font.mediumSystemFont(13);
    updateTimeText.textColor = textColor;
    updateTimeText.textOpacity = 0.7;
    leftStack.addSpacer(3)
    
    const milStack = leftStack.addStack();
    milStack.layoutHorizontally();
    milStack.centerAlignContent();
    const iconSymbol = SFSymbol.named('car.circle');
    const carIcon1 = milStack.addImage(iconSymbol.image);
    carIcon1.imageSize = new Size(16, 16);
    milStack.addSpacer(4);
    
    const mileageText = milStack.addText(`${mileage} km`);
    mileageText.font = Font.mediumSystemFont(14);
    mileageText.textColor = textColor;
    mileageText.textOpacity = 0.7;
    leftStack.addSpacer(22);
    
    // Left Stack bar
    const barStack = leftStack.addStack();
    barStack.layoutHorizontally();
    barStack.centerAlignContent();
    barStack.setPadding(3, 10, 3, 10);
    barStack.cornerRadius = 10;
    barStack.borderColor = new Color(speed <= 5 ? '#AB47BC' : '#FF1744', 0.7);
    barStack.borderWidth = 2;
    
    const barIcon = SFSymbol.named(speed <= 5 ? 'location' : 'location.fill');
    const barIconElement = barStack.addImage(barIcon.image);
    barIconElement.imageSize = new Size(16, 16);
    barIconElement.tintColor = speed <= 5 ? Color.purple() : Color.red();
    barStack.addSpacer(4);
    
    const speedText = barStack.addText(state);
    speedText.font = Font.mediumSystemFont(14);
    speedText.textColor = new Color(speed <= 5 ? '#AA00FF' : '#D50000');
    leftStack.addSpacer(8);
  
    // Left Stack bar2
    const barStack2 = leftStack.addStack();
    barStack2.size = new Size(83, 0);
    barStack2.layoutHorizontally();
    barStack2.centerAlignContent();
    barStack2.setPadding(3, 0, 3, 0);
    barStack2.cornerRadius = 10;
    barStack2.borderColor = new Color('#000000', 0.4);
    barStack2.borderWidth = 2;
    
    const statusText = barStack2.addText(`${highestSpeed} km·h`);
    statusText.font = Font.mediumSystemFont(14);
    statusText.textColor = textColor;
    statusText.textOpacity = 0.7;
    leftStack.addSpacer();
      
    /**
     * right Stack
     * @param {image} image
     * @param {string} address
     */
    const rightStack = mainStack.addStack();
    rightStack.layoutVertically();
    rightStack.addSpacer();
    
    const carLogoStack = rightStack.addStack();
    carLogoStack.addSpacer();
    if (setting.logo) {
      carLogo = await getCacheImage('newLogo.png', setting.logo);
    } else {
      carLogo = await getCacheImage('maybachLogo.png', 'https://gitcode.net/4qiao/scriptable/raw/master/img/car/maybachLogo.png');  
    }
    const image = carLogoStack.addImage(carLogo);
    image.imageSize = new Size(27,27);
    rightStack.addSpacer(1);
      
    // Car image
    const carImageStack = rightStack.addStack();
    carImageStack.size = new Size(setting.carStackWidth, 0);
    carImageStack.setPadding(setting.carTop, 5, setting.carBottom, 0);
    
    const imageCar = carImageStack.addImage(vehicleImg);
    imageCar.imageSize = new Size(setting.carWidth, setting.carHeight);
    rightStack.addSpacer();
  
    // show address
    const adrStack = rightStack.addStack();
    adrStack.centerAlignContent();
    adrStack.size = new Size(setting.bottomSize, 30);
    
    const jmz = {};
    jmz.GetLength = function(str) {
      return str.replace(/[\u0391-\uFFE5]/g,"@@").length;
    };  
    const str = jmz.GetLength(endAddr);
    if ( str <= 35 ) {
      addressText = adrStack.addText(endAddr + ' - 当前位置属乡村、高速路或无名路段 🚫');
    } else {
      addressText = adrStack.addText(endAddr);
    };
    
    addressText.font = Font.mediumSystemFont(11.2);
    addressText.textColor = textColor;
    addressText.textOpacity = 0.7;
    addressText.centerAlignText();
    rightStack.addSpacer();
    
    // jump content
    addressText.url = mapUrl;
    imageCar.url = 'scriptable:///run/' + encodeURIComponent(uri);
    
    if ( coordinates && aMapkey ) {
      const { distance } = await getDistance();
      await pushMessage(mapUrl, longitude, latitude, distance);
    };
    
    if ( !config.runsInWidget ) {  
      await widget.presentMedium();
    } else {
      Script.setWidget(widget);
      Script.complete();
    };
  }
  
  /**
   * 获取两点间驾车路线规划的距离
   * @returns {Promise<number>}
   */
  const getDistance = async () => {
    const fence = await new Request(`https://restapi.amap.com/v5/direction/driving?key=${aMapkey}&origin_type=0&strategy=38&origin=${coordinates}&destination=${longitude},${latitude}`).loadJSON();
    return { distance } = fence.route.paths[0];
  };
 
  /**
   * Electronic Fence
   * 判断run为GPS触发电子围栏
   * @returns {Promise<void>}
   */
  const pushMessage = async (mapUrl, longitude, latitude, distance) => {
    const mapPicUrl = `https://restapi.amap.com/v3/staticmap?&key=${aMapkey}&zoom=14&size=450*300&markers=-1,https://gitcode.net/4qiao/scriptable/raw/master/img/car/locating_0.png,0:${longitude},${latitude}`;
    
    const timeAgo = new Date(Date.now() - pushTime);
    const moment = timeAgo.getUTCHours() * 60 + timeAgo.getUTCMinutes();

    // push data
    const driveAway = updateTime !== setting.updateTime && distance > 20
    if ( driveAway ) {
      notify(`${status} ${GMT}`, `已离开📍${setting.endAddr}，相距 ${distance} 米`, mapUrl);
      await sendWechatMessage(`${status}  启动时间 ${GMT}\n已离开📍${setting.endAddr}，相距 ${distance} 米`, mapUrl, mapPicUrl);
      writeSettings(runObj);
    } else if ( speed <= 5 ) {
      if (moment >= (updateTime === setting.updateTime ? interval || 240 : 10)) {
        notify(`${status}  ${GMT}`, endAddr, mapUrl);
        await sendWechatMessage(`${status}  停车时间 ${GMT}`, mapUrl, mapPicUrl);
        writeSettings({ ...runObj, run: speed });
      }
    } else {
      notify(`${status}  ${GMT}`, endAddr, mapUrl);
      await sendWechatMessage(`${status}  启动时间 ${GMT}`, mapUrl, mapPicUrl);
      writeSettings(runObj);
    }
  };

 /**
  * 推送消息到微信
  * @returns {Promise} Promise
  */
  const sendWechatMessage = async (description, url, picurl) => {
    if ( !setting.tokenUrl ) return;
    const { access_token } = await new Request(tokenUrl).loadJSON();
    const request = new Request(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${access_token}`);
    request.method = 'POST'
    request.body = JSON.stringify({
      touser,
      agentid,
      msgtype: 'news',
      news: {
        articles: [{
          title: endAddr,
          picurl,
          url,
          description
        }]
      } // pushMessage to wiChat
    });
    console.log('信息已推送到微信');
    return request.loadJSON();
  };
  
  /**-------------------------**/
  
  // 创建小号组件
  createSmallWidget = async () => {
    const widget = new ListWidget();
    widget.backgroundImage = await getImage(`https://restapi.amap.com/v3/staticmap?&key=${aMapkey}&zoom=13&size=240*240&markers=-1,https://gitcode.net/4qiao/scriptable/raw/master/img/car/locating_0.png,0:${longitude},${latitude}`);
    widget.url = mapUrl;
    Script.setWidget(widget);
    Script.complete();
  }
  
  const createError = async () => {
    const widget = new ListWidget();
    widget.backgroundColor = Color.white();
    const gradient = new LinearGradient();
    gradient.locations = [0, 1];
    gradient.colors = [
      new Color("#99CCCC", 0.5),
      new Color('#00000000')
    ];
    widget.backgroundGradient = gradient;  
    
    widget.setPadding(10, 20, 30, 10)
    const mainStack = widget.addStack();
    mainStack.addSpacer();
    
    const cacheMaybach = fm.joinPath(cacheCar, 'Maybach-8.png');
    const vehicleImg = fm.readImage(cacheMaybach);
    const widgetImg = mainStack.addImage(vehicleImg);
    widgetImg.imageSize = new Size(400, 150);
    mainStack.addSpacer();
    
    if (!config.runsInWidget) {
      await widget.presentMedium();  
    } else {
      Script.setWidget(widget);
      Script.complete();
    }
  };
  
  const createErrorWidget = async () => {
    const widget = new ListWidget();
    const text = widget.addText('仅支持中小尺寸');
    text.font = Font.systemFont(17);
    text.centerAlignText();
    Script.setWidget(widget);
    Script.complete();
  };
  
  const runWidget = async () => {
    const isMediumWidget = config.widgetFamily === 'medium' || config.runsInApp
    try {
      await (isMediumWidget 
      ? await createWidget() 
      : config.widgetFamily === 'small' 
      ? await createSmallWidget() 
      : createErrorWidget());
    } catch (e) {
      isMediumWidget ? await createError() : createErrorWidget();
    }
  }
  await runWidget();
}
module.exports = { main }