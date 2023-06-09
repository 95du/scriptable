// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: car;
/**
 * 小组件作者: 95度茅台
 * Version 1.0.0
 * 2023-05-01
 * 模拟电子围栏，显示车速，位置等
 */


async function main() {
  const uri = Script.name();
  const F_MGR = FileManager.local();
  const path = F_MGR.joinPath(F_MGR.documentsDirectory(), '95duGps');
  F_MGR.createDirectory(path, true);
  const cacheFile = F_MGR.joinPath(path, 'setting.json');
  
  
  /**
   * 读取储存的设置
   * @param {string} file - JSON
   * @returns {object} - JSON
   */
  const getSettings = (file) => {
    let setting = {};
    if (F_MGR.fileExists(file)) {
      return { imei, password, token, run, coordinates, pushTime, imgArr, picture, aMapkey, tokenUrl, touser, agentid } = JSON.parse(F_MGR.readString(file));
    }
    return {}
  }
  const setting = await getSettings(cacheFile);
  
  
  /**
   * 存储当前设置
   * @param { JSON } string
   */
  const writeSettings = async (inObject) => {
    F_MGR.writeString(cacheFile, JSON.stringify(inObject), null, 2);
    console.log(JSON.stringify(
      inObject, null, 2
    ));
  }
  
  /**
   * 获取背景图片存储目录路径
   * @returns {string} - 目录路径
   */
  const getBgImagePath = () => {
    const bgImgPath = F_MGR.joinPath(F_MGR.documentsDirectory(), '95duBackground');
    return F_MGR.joinPath(bgImgPath, Script.name() + '.jpg');
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
  }
  
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
    await F_MGR.writeImage(cachePath, carImage, { overwrite: true });
    imgArr.push(imgKey);
    await writeSettings(setting);
    if ( imgArr.length == 1 ) {
      notify('获取成功', '初始化数据及储存车图片并使用缓存');  
    }
  };
  
  const loadPicture = async () => {
    if ( !imgArr?.length || picture.length > imgArr.length) {
      const cacheUrl = await new Request('https://gitcode.net/4qiao/shortcuts/raw/master/api/update/Scriptable.json').loadJSON();
      let maybach = cacheUrl.maybach;
      if (picture.length > imgArr.length) {
        maybach = picture;
      }
      maybach.forEach(async (item) => {
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
    const cacheImgPath = cache + '/' + imgArr[index];
    return await F_MGR.readImage(cacheImgPath);
  };
  
  
  /**
   * 获取地理位置信息
   * @param {string} token
   * @param {number} longitude - 经度
   * @param {number} latitude - 纬度
   * @returns {object} - 地理位置信息的对象，包含地址、停车时间等属性
   */
  const fetchToken = async () => {
    const params = {
      imei,
      password
    };
    const requestBody = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&');
    
    const req = new Request('https://app.tutuiot.com/locator-app/imeiLoginVerification');
    req.method = 'POST'
    req.body = requestBody;
    const { data } = await req.loadJSON();
    setting.token = data.token;
    await writeSettings(setting);
    notify('登录成功', data.token);
  };
  
  //
  const getTrackSegment = async () => {
    const params = {
      imeis: imei,
      page: 1,
      pageSize: 1,
      token
    };
    const requestBody = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&');
  
    const req = new Request('https://app.tutuiot.com/locator-app/es/getTrackSegment');
    req.method = 'POST';
    req.body = requestBody;
    try {
      const { data } = await req.loadJSON();
      return { deviceName, endAddr, updateTime, totalTime, endTime, mileage, highestSpeed, averageSpeed, endLongitude, endLatitude } = data.list[0];
    } catch (e) {
      notify('获取数据失败⚠️', '新设备无行车/位置记录，或token已过期。');
      console.log(e);
      await fetchToken();
    }
  };
  
  //
  const getSpeed = async () => {
    const params = {
      imei,
      coorType: 'wgs84',
      token
    };
    const requestBody = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&');
    const req = new Request('https://app.tutuiot.com/locator-app/redis/getGps');
    req.method = 'POST'
    req.body = requestBody;
    try {
      const { data } = await req.loadJSON();
      return { speed } = data;
    } catch (error) {
      console.log(error);
      await fetchToken();
    }
  };
  
  //
  const getMapUrl = async () => {
    const conversion = new Request(`https://restapi.amap.com/v3/assistant/coordinate/convert?coordsys=gps&output=json&key=${aMapkey}&locations=${endLongitude},${endLatitude}`);
    const convert = await conversion.loadJSON();
    const locations = convert.locations.split(",");
    return { 
      longitude: Number(locations[0]).toFixed(6),
      latitude: Number(locations[1]).toFixed(6)
    }
  };

  //
  const getData = async () => {
    const info = await Promise.all([loadPicture(), getTrackSegment(), getSpeed()]);
    
    const { longitude, latitude } = await getMapUrl();
    const mapUrl = `https://maps.apple.com/?q=${encodeURIComponent(deviceName)}&ll=${latitude},${longitude}&t=m`;
    
    const [ state, status ] = speed <= 5 ? ['已静止', '[ 车辆静止中 ]'] : [`${speed} km·h`, `[ 车速 ${speed} km·h ]`];
  
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
    return { info, state, status, longitude, latitude, mapUrl, GMT, GMT2, runObj };
  };

  //=========> Create <=========//
  const { info, state, status, longitude, latitude, mapUrl, GMT, GMT2, runObj } = await getData();

  const createWidget = async () => {
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
      const randomColor = color[Math.floor(Math.random() * color.length)];
      gradient.locations = [0, 1]
      gradient.colors = [
        new Color(randomColor, Number(setting.transparency)),
        new Color('#00000000')
      ]
      widget.backgroundGradient = gradient;
    };
    
    if ( !setting.run ) {
      await writeSettings(runObj);
      await getRandomImage();
    }
    
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
    plateText.textColor = Color.black();
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
    updateTimeText.textColor = Color.black();
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
    mileageText.textColor = Color.black();
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
    barIconElement.tintColor = speed <= 5 ? Color.purple() : (speed > 5 && speed <= 100) ? Color.green() : Color.red();
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
    statusText.textColor = Color.black();
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
      carLogo = await getImage(setting.logo);
    } else {
      carLogo = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/car/maybachLogo.png');  
    }
    const image = carLogoStack.addImage(carLogo);
    image.imageSize = new Size(27,27);
    rightStack.addSpacer(1);
      
    // Car image
    const carImageStack = rightStack.addStack();
    carImageStack.size = new Size(setting.carStackWidth, 0);
    carImageStack.setPadding(-25, 5, 0, 0);
    const img = await getRandomImage();
    const imageCar = carImageStack.addImage(img);
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
    addressText.textColor = Color.black();
    addressText.textOpacity = 0.7;
    addressText.centerAlignText();
    rightStack.addSpacer();
    
    // jump content
    addressText.url = mapUrl;
    imageCar.url = 'scriptable:///run/' + encodeURIComponent(uri);
    
    if ( !config.runsInWidget ) {  
      await widget.presentMedium();
    } else {
      Script.setWidget(widget);
      Script.complete();
    };
    
    if ( coordinates && aMapkey ) {
      await getDistance();
      await pushMessage(mapUrl, longitude, latitude, distance);
    };
    return widget;
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
    const mapPicUrl = `https://restapi.amap.com/v3/staticmap?&key=${aMapkey}&zoom=14&size=450*300&markers=-1,https://image.fosunholiday.com/cl/image/comment/619016bf24e0bc56ff2a968a_Locating_9.png,0:${longitude},${latitude}`;
    
    const timeAgo = new Date(Date.now() - pushTime);
    const hours = timeAgo.getUTCHours();
    const minutes = timeAgo.getUTCMinutes();
    const moment = hours * 60 + minutes;
  
    // push data
    const driveAway = run !== 'GPS' && distance > 20
    if ( driveAway ) {
      await sendWechatMessage(`${status}  启动时间 ${GMT}\n已离开📍${setting.endAddr}，相距 ${distance} 米`, mapUrl, mapPicUrl);
      await writeSettings(runObj);
    } else if ( speed <= 5 ) {
      const duration = updateTime === setting.updateTime ? 240 : 10;
      if (moment >= duration) {
        await sendWechatMessage(`${status}  停车时间 ${GMT}`, mapUrl, mapPicUrl);
        await writeSettings({
          ...runObj,
          run: speed
        });
      }
    } else {
      if ( run !== 'GPS' ) {
        await sendWechatMessage(`${status}  启动时间 ${GMT}`, mapUrl, mapPicUrl);
        await writeSettings(runObj);
      } else {
        await sendWechatMessage(`${status}  更新时间 ${GMT}`, mapUrl, mapPicUrl);
        await writeSettings(runObj);
      }
    }
  };

 /**
  * 推送消息到微信
  * @returns {Promise} Promise
  */
  const sendWechatMessage = async (description, url, picurl) => {
    const driveAway = run !== 'GPS' && distance > 20
    if ( driveAway ) {
      notify(`${status} ${GMT}`, `已离开📍${setting.endAddr}，相距 ${distance} 米`, mapUrl);
    } else {
      notify(`${status}  ${GMT}`, endAddr, mapUrl);
    };
    
    if ( !setting.tokenUrl ) return;
    const acc = await new Request(tokenUrl).loadJSON();
    const request = new Request(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${acc.access_token}`);
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
    widget.backgroundImage = await getImage(`https://restapi.amap.com/v3/staticmap?&key=${aMapkey}&zoom=13&size=240*240&markers=-1,https://image.fosunholiday.com/cl/image/comment/619016bf24e0bc56ff2a968a_Locating_9.png,0:${longitude},${latitude}`);
    widget.url = mapUrl;
    Script.setWidget(widget);
    Script.complete();
    return widget;  
  }
    
  const createErrorWidget = async () => {
    const widget = new ListWidget();
    const text = widget.addText('仅支持中小尺寸');
    text.font = Font.systemFont(17);
    text.centerAlignText();
    Script.setWidget(widget);
  }
  
  const runWidget = async () => {
    await (config.runsInApp || config.widgetFamily === 'medium' ? createWidget() : config.widgetFamily === 'small' ? createSmallWidget() : createErrorWidget());
  }
  await runWidget();
}
module.exports = { main }