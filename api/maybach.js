// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: car;
/**
 * 组件作者: 95度茅台
 * Honda Civic
 * Version 1.1.0
 * 2022-12-22 22:22
 */

const uri = Script.name();
const fm = FileManager.local();
const mainPath = fm.joinPath(fm.documentsDirectory(), Script.name());
if (!fm.fileExists(mainPath)) fm.createDirectory(mainPath);

const cache = fm.joinPath(mainPath, 'cache_path');
if (!fm.fileExists(cache)) fm.createDirectory(cache);

const cacheFile = fm.joinPath(mainPath, 'setting.json')

/**
 * 读取储存的设置
 * @param {string} file - JSON
 * @returns {object} - JSON
 */
const getSettings = (file) => {
  if (fm.fileExists(file)) {
    return { cookie, run, myPlate, coordinates, pushTime, imgArr } = JSON.parse(fm.readString(file));
  }
  return {}
}
const setting = await getSettings(cacheFile);

/**
 * 存储当前设置
 * @param { JSON } string
 */
const writeSettings = async (inObject) => {
  fm.writeString(cacheFile, JSON.stringify(inObject, null, 2));
  console.log(
    JSON.stringify(inObject, null, 2)
  )
};

/**
 * 弹出一个通知  
 * @param {string} title
 * @param {string} body
 * @param {string} url
 * @param {string} sound
 */
const notify = async (title, body, url, opts = {}) => {
  const n = Object.assign(new Notification(), { title, body, sound: 'piano_success', ...opts });
  if (url) n.openURL = url;
  return await n.schedule();
};

/**
 * @description 更新 string
 * @returns {Promise<void>}
 */
const updateString = async () => {
  const codeString = await new Request('https://gitcode.net/4qiao/scriptable/raw/master/api/maybach.js').loadString();
  const iCloudInUse = fm.isFileStoredIniCloud(module.filename);
  if (codeString.includes('95度茅台') && iCloudInUse) {
    fm.writeString(module.filename, codeString);
    Safari.open('scriptable:///run/' + encodeURIComponent(uri));
  } else {
    const error = new Alert();
    error.title = '更新失败';
    error.addAction('OK');
    await error.presentAlert();
  }
};

/**
 * 弹出菜单供用户选择进行操作
 */
const presentMenu = async () => {
  const alert = new Alert();
  alert.message = '\n显示车辆实时位置、车速、停车时间\n模拟电子围栏、模拟停红绿灯\n设置间隔时间推送车辆状态信息';
  
  const actions = ['更新代码', '重置所有', '家人地图', '输入凭证', '预览组件'];
  actions.forEach(( action, index ) => {
    alert[ index === 0 || index === 1 
      ? 'addDestructiveAction'
      : 'addAction' ](action);
  });
  alert.addCancelAction('取消');
  
  const response = await alert.presentSheet();
  switch (response) {
    case 0:
      await updateString();
      break;
    case 1:
      fm.remove(mainPath);
      Safari.open('scriptable:///run/' + encodeURIComponent(uri));  
      break;
    case 2:
      Safari.open('amapuri://WatchFamily/myFamily');
      break;
    case 3:
      await inputCookie();
      break;
    case 4:
      if ( !setting.cookie ) return;
      await createWidget();
      break;
  }
};

// cookie menu
const inputCookie = async () => {
  await downloadModule('maybach.js', 'https://gitcode.net/4qiao/scriptable/raw/master/api/maybach_error.js')
  const alert = new Alert();
  alert.message = '输入 Cookie'
  alert.addTextField('高德地图Cookie');
  alert.addAction('确定');
  alert.addCancelAction('取消');
  const input = await alert.present();
  if ( input === -1 ) return;
  let cookie = alert.textFieldValue(0);

  if ( !cookie ) {
    try {
      const boxjs_data = await getJson('http://boxjs.com/query/data/amap_cookie');
      cookie = boxjs_data.val;
    } catch(e) {
      notify('获取 boxjs 数据失败 ⚠️', '需打开Quantumult-X获取Cookie');  
      Safari.open('quantumult-x://');
      return;
    }
  }
  
  writeSettings({ cookie: btoa(cookie), imgArr: [] });
  Safari.open('scriptable:///run/' + encodeURIComponent(uri));
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
const downloadCarImage = async (item) => {
  const carImage = await getImage(item);
  const imgKey = decodeURIComponent(item.substring(item.lastIndexOf("/") + 1));
  const cachePath = fm.joinPath(cache, imgKey);
  fm.writeImage(cachePath, carImage, { overwrite: true });
  imgArr.push(imgKey);
  writeSettings(setting);
};

const loadPicture = async () => {
  if ( !setting.imgArr?.length ) {
    const maybach = Array.from({ length: 9 }, (_, index) => `https://gitcode.net/4qiao/scriptable/raw/master/img/car/Maybach-${index}.png`);
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
  return fm.readImage(cacheImgPath);
};

/**
 * 获取图片、string并使用缓存
 * @param {string} File Extension
 * @returns {image} - Request
 */
const useFileManager = ({ cacheTime } = {}) => {
  return {
    readString: (name) => {
      const filePath = fm.joinPath(cache, name);  
      const fileExists =  fm.fileExists(filePath);
      if (fileExists && hasExpired(filePath) > cacheTime) {
        fm.remove(filePath);
        return null;
      }
      return fm.fileExists(filePath) ? fm.readString(filePath) : null;
    },
    writeString: (name, content) => fm.writeString(fm.joinPath(cache, name), content),
    // cache image
    readImage: (name) => {
      const filePath = fm.joinPath(cache, name);
      const fileExists =  fm.fileExists(filePath);
      if (fileExists && hasExpired(filePath) > cacheTime) {
        fm.remove(filePath);
        return null;
      }
      return fm.fileExists(filePath) ? fm.readImage(filePath) : null;
    },
    writeImage: (name, image) => fm.writeImage(fm.joinPath(cache, name), image),
  };
    
  function hasExpired(filePath) {
    const createTime = fm.creationDate(filePath).getTime();
    return (Date.now() - createTime) / (60 * 60 * 1000)
  }
};

/**
 * 获取 GET POST JSON 字符串
 * @param {string} json
 * @returns {object} - JSON
 */
const getJson = async (url) => await new Request(url).loadJSON();

const getCacheString = async (jsonName, jsonUrl) => {
  const cache = useFileManager({ cacheTime: 5 });
  const jsonString = cache.readString(jsonName);
  if (jsonString) {
    return JSON.parse(jsonString);
  }
  const response = await getJson(jsonUrl);
  const jsonFile = JSON.stringify(response);
  const { status } = JSON.parse(jsonFile);
  if (status === '1') {
    cache.writeString(jsonName, jsonFile);
  }
  return JSON.parse(jsonFile);
};

/**
 * 获取网络图片并使用缓存
 * @param {Image} url
 */
const getCacheImage = async (name, url) => {
  const cache = useFileManager();
  const image = cache.readImage(name);
  if ( image ) return image;
  const img = await getImage(url);
  cache.writeImage(name, img);
  return img;
};

/**
 * 获取地理位置信息
 * @param {number} longitude - 经度
 * @param {number} latitude - 纬度
 * @returns {object} - 地理位置信息的对象，包含地址、停车时间等属性
 */
const getLastLocation = async () => {
  const req = new Request('http://ts.amap.com/ws/tservice/location/getLast?in=KQg8sUmvHrGwu0pKBNTpm771R2H0JQ%2FOGXKBlkZU2BGhuA1pzHHFrOaNuhDzCrQgzcY558tHvcDx%2BJTJL1YGUgE04I1R4mrv6h77NxyjhA433hFM5OvkS%2FUQSlrnwN5pfgKnFF%2FLKN1lZwOXIIN7CkCmdVD26fh%2Fs1crIx%2BJZUuI6dPYfkutl1Z5zqSzXQqwjFw03j3aRumh7ZaqDYd9fXcT98gi034XCXQJyxrHpE%2BPPlErnfiKxd36lLHKMJ7FtP7WL%2FOHOKE%2F3YNN0V9EEd%2Fj3BSYacBTdShJ4Y0pEtUf2qTpdsIWn%2F7Ls1llHCsoBB24PQ%3D%3D&ent=2&keyt=4');
  req.method = 'GET'
  req.headers = { Cookie: atob(cookie) }
  const { code, data } = await req.loadJSON();
  if ( code === 1 ) {
    return { speed, owner, heading, channel, longitude, latitude, updateTime } = data;
  }
};

// 更新缓存文件
const handleFile = (fileName) => {
  const filePath = fm.joinPath(cache, fileName);
  if (fm.fileExists(filePath) && setting.longitude !== longitude && setting.updateTime !== updateTime) {
    console.log(fileName)
    fm.remove(filePath);
  }
};

/**
 * @description 获取指定经纬度的地址信息和周边POI点信息
 * @returns {Promise<object>} 包含formatted_address和pois的对象
 */
const getAddress = async () => {
  try {
    const url = `http://restapi.amap.com/v3/geocode/regeo?key=9d6a1f278fdce6dd8873cd6f65cae2e0&s=rsv3&radius=500&extensions=all&location=${longitude},${latitude}`;

    const fetchData = async () => setting.longitude !== longitude || setting.updateTime !== updateTime
      ? await getJson(url)
      : await getCacheString('address.json', url);
    
    const response = await fetchData(url);
    const poisArr = response.regeocode.pois;
    const poisData = poisArr.length > 0 ? poisArr : null;
    return { formatted_address: address, pois = poisData } = response.regeocode;  
  } catch (e) {
    console.log(e);
  }
};

/**
 * 获取两点间驾车路线规划的距离
 * @returns {Promise<number>} number
 */ 
const getDistance = async () => {
  try {
    const url = `https://restapi.amap.com/v5/direction/driving?key=a35a9538433a183718ce973382012f55&origin_type=0&strategy=38&origin=${coordinates}&destination=${longitude},${latitude}`;
    
    const fetchData = async (url) => setting.longitude !== longitude || setting.updateTime !== updateTime
      ? await getJson(url)
      : await getCacheString('distance.json', url);

    const { route } = await fetchData(url);
    return route.paths[0];
  } catch (error) {
    console.log(error);
  }
};

/**
 * 获取公用数据
 * @returns {Object} 返回包含信息的对象
 * @param {number} updateTime
 * @returns {number} 返回停车时长（分钟)
 * @param {string} format
 */
const getInfo = async () => {
  const locationData = await getLastLocation();
  if (locationData) {
    ['address.json', 'distance.json', 'mapImage.png'].forEach(handleFile);
    await getAddress();
  }

  const mapUrl = `https://maps.apple.com/?q=${encodeURIComponent('琼A·849A8')}&ll=${latitude},${longitude}&t=m`;
  
  const [state, status] = speed <= 5
    ? ['已静止', '[ 车辆静止中 ]']
    : [`${speed} km·h`, `[ 车速 ${speed} km·h ]`];
  
  // 计算停车时长(红绿灯图标)  
  const getParkingTime = (updateTime) => (new Date(Date.now() - updateTime)).getUTCMinutes();
  const parkingTime = getParkingTime(updateTime);
  
  // Timestamp Formatter
  const formatDate = (updateTime, format) => {
    const df = new DateFormatter();
    df.dateFormat = format;
    return df.string(new Date(updateTime));
  };
  const GMT = formatDate(updateTime, 'yyyy-MM-dd HH:mm');
  const GMT2 = formatDate(updateTime, 'MM-dd HH:mm');
  
  const runObj = {
    cookie,
    imgArr,
    updateTime, 
    address,
    longitude,
    latitude,
    coordinates: `${longitude},${latitude}`,
    run: owner,
    pushTime: Date.now(),
    parkingTime: GMT2,
  };
  
  if ( !setting.run ) {
    writeSettings(runObj);
  }
  
  return { state, status, mapUrl, parkingTime, GMT, GMT2, runObj };
};

// 设置组件背景
const setBackground = async (widget) => {
  widget.backgroundColor = Color.white();
  const gradient = new LinearGradient();
  const color = [
    "#82B1FF",
    "#4FC3F7",
    "#66CCFF",
    "#99CCCC",
    "#BCBBBB",
    "#A0BACB"
  ];
  const items = color[Math.floor(Math.random() * color.length)];
  gradient.locations = [0, 1];
  gradient.colors = [
    new Color(items, 0.5),
    new Color('#00000000')
  ];
  widget.backgroundGradient = gradient;
};

//=========> Create <=========//
const createWidget = async () => {
  const { state, status, mapUrl, parkingTime, GMT, GMT2, runObj } = await getInfo();
  
  /**
   * @param {number} padding
   * @returns {WidgetStack} 
   */
  const widget = new ListWidget();
  await setBackground(widget);
  widget.setPadding(10, 10, 10, 15);
  
  const mainStack = widget.addStack();
  mainStack.layoutHorizontally();
  mainStack.addSpacer();

  /**
   * Create left stack
   * @param {image} SFSymbol
   * @param {string} text
   * Cylindrical Bar Chart
   */
  const leftStack = mainStack.addStack();
  leftStack.layoutVertically();
  leftStack.addSpacer();
  
  const plateStack = leftStack.addStack();
  const plateText = plateStack.addText('琼A·849A8');
  plateText.font = Font.mediumSystemFont(19);
  plateText.textColor = Color.black();
  plateText.textOpacity = 0.9;
  leftStack.addSpacer(3);
  
  const benzStack = leftStack.addStack();
  benzStack.layoutHorizontally();
  benzStack.centerAlignContent();
  const iconSymbol = SFSymbol.named('car.circle');
  const carIcon1 = benzStack.addImage(iconSymbol.image);
  carIcon1.imageSize = new Size(16, 16);
  benzStack.addSpacer(4);
  
  const vehicleModelText = benzStack.addText(String(heading.toFixed(6)));
  vehicleModelText.font = Font.mediumSystemFont(14);
  vehicleModelText.textColor = Color.black();
  vehicleModelText.textOpacity = 0.7;
  leftStack.addSpacer(3)
  
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
  barStack2.layoutHorizontally();
  barStack2.centerAlignContent();
  barStack2.setPadding(3, 10, 3, 10);
  barStack2.cornerRadius = 10;
  barStack2.borderColor = new Color('#000000', 0.4);
  barStack2.borderWidth = 2;
  
  const barIcon2 = SFSymbol.named('lock.shield.fill');
  const barIconElement2 = barStack2.addImage(barIcon2.image);
  barIconElement2.imageSize = new Size(16, 16);
  barIconElement2.tintColor = Color.green();
  barStack2.addSpacer(4);
  
  const statusText = barStack2.addText('已锁车');
  statusText.font = Font.mediumSystemFont(14);
  statusText.textColor = Color.black();
  statusText.textOpacity = 0.6;
  leftStack.addSpacer();
    
  /**
   * Create right Stack
   * @param {image} image
   * @param {string} address
   */
  const rightStack = mainStack.addStack();
  rightStack.layoutVertically();
  rightStack.addSpacer();
  
  const carLogoStack = rightStack.addStack();
  carLogoStack.addSpacer();
  const carLogo = await getCacheImage('maybachLogo.png' ,'https://gitcode.net/4qiao/scriptable/raw/master/img/car/maybachLogo.png');
  const image = carLogoStack.addImage(carLogo);
  image.imageSize = new Size(27, 27);
  image.tintColor = Color.black();
  rightStack.addSpacer(1);
    
  // Car image
  const carImageStack = rightStack.addStack();
  carImageStack.setPadding(-25, 5, 0, 0);
  const imageCar = carImageStack.addImage(await getRandomImage());
  imageCar.imageSize = new Size(225, 100);
  rightStack.addSpacer();

  // show address
  const adrStack = rightStack.addStack();
  adrStack.centerAlignContent();
  adrStack.size = new Size(226, 30);
  
  try {
    const jmz = {};
    jmz.GetLength = function(str) {
      return str.replace(/[\u0391-\uFFE5]/g,"@@").length;
    };  
    const str = jmz.GetLength(address);
    if ( str <= 35 ) {
      addressText = adrStack.addText(`${address} - ${pois[0].address} ${pois[0].distance} 米`);
    } else if (str < 46) {
      addressText = adrStack.addText(`${address} - ${pois[0].address}`);
    } else {
      addressText = adrStack.addText(address);
    }
  } catch (e) {
    addressText = adrStack.addText(address + ' - 当前位置属乡镇、高速路或无名路段 🚫');
  }
  
  addressText.font = Font.mediumSystemFont(11.3);
  addressText.textColor = Color.black();
  addressText.textOpacity = 0.7;
  addressText.centerAlignText();
  rightStack.addSpacer();
  
  // jump content
  barStack2.url = 'amapuri://WatchFamily/myFamily';
  addressText.url = mapUrl;
  imageCar.url = 'scriptable:///run/' + encodeURIComponent(uri);
  
  if ( !config.runsInWidget ) {  
    await widget.presentMedium();
  } else {
    Script.setWidget(widget);
    Script.complete();
  };
  
  /**
   * Electronic Fence
   * 判断run为HONDA触发电子围栏
   * 弹窗通知并推送信息到微信
   */
  const pushMessage = async (mapUrl, longitude, latitude, distance) => {
    const mapPicUrl = `https://restapi.amap.com/v3/staticmap?&key=a35a9538433a183718ce973382012f55&zoom=14&size=450*300&markers=-1,https://gitcode.net/4qiao/scriptable/raw/master/img/car/locating_0.png,0:${longitude},${latitude}`;
    
    const timeAgo = new Date(Date.now() - pushTime);
    const hours = timeAgo.getUTCHours();
    const minutes = timeAgo.getUTCMinutes();
    const moment = hours * 60 + minutes;

    // driveAway
    if ( parkingTime >= 10 && distance > 20 && address !== setting.address ) {
      notify(`${status} ${GMT}`, `已离开📍${setting.address}，相距 ${distance} 米`, mapUrl);
      await sendWechatMessage(`${status}  更新时间 ${GMT}\n已离开📍${setting.address}，相距 ${distance} 米`, mapUrl, mapPicUrl);
      writeSettings(runObj);
    } else if ( speed <= 5 ) {
      const duration = updateTime === setting.updateTime ? 300 : 10;
      if (moment >= duration) {
        notify(`${status}  ${GMT}`, address, mapUrl);
        await sendWechatMessage(`${status}  停车时间 ${GMT}`, mapUrl, mapPicUrl);
        writeSettings({ ...runObj, run: speed });
      }
    } else {
      notify(`${status}  ${GMT}`, address, mapUrl);
      await sendWechatMessage(`${status}  更新时间 ${GMT}`, mapUrl, mapPicUrl);
      writeSettings(runObj);
    }
  };
  
  if ( setting.coordinates ) {
    const { distance } = await getDistance();
    await pushMessage(mapUrl, longitude, latitude, distance);
  }
};

/**
 * 推送消息到微信
 * @returns {Promise} Promise
 */
const sendWechatMessage = async (description, url, picurl) => {
  const acc = await getJson(atob('aHR0cHM6Ly9xeWFwaS53ZWl4aW4ucXEuY29tL2NnaS1iaW4vZ2V0dG9rZW4/Y29ycGlkPXd3MWNlNjgxYWVmMjQ0MmRhZCZjb3Jwc2VjcmV0PU95N29wV0xYWmltblNfczc2WWt1SGV4czEyT3JVT3dZRW9NeHdMVGF4WDQ='))
  const request = new Request(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${acc.access_token}`);
  request.method = 'POST'
  request.body = JSON.stringify({
    touser: 'DianQiao',
    agentid: '1000004',
    msgtype: 'news',
    news: {
      articles: [{
        title: address,
        picurl,
        url,
        description
      }]
    } // pushMessage to wiChat
  });
  return request.loadJSON();
};

// 创建小号组件
const createSmallWidget = async (widget) => {
  try {
    const { mapUrl } = await getInfo();
    const url = `https://restapi.amap.com/v3/staticmap?key=a35a9538433a183718ce973382012f55&zoom=13&size=240*240&markers=-1,https://gitcode.net/4qiao/scriptable/raw/master/img/car/locating_0.png,0:${longitude},${latitude}`;
    
    const fetchData = async (url) => setting.longitude !== longitude || setting.updateTime !== updateTime
      ? await getImage(url)
      : await getCacheImage('mapImage.png', url);
    
    widget.backgroundImage = await fetchData(url);
    widget.url = mapUrl;
  } catch (e) {
    const iconStack = widget.addStack();
    iconStack.addSpacer();
    const imageElement = iconStack.addImage(SFSymbol.named("wifi.exclamationmark").image);
    imageElement.tintColor = Color.dynamic(new Color('#000000'), new Color('#FFFFFF'));
    imageElement.imageSize = new Size(45, 45);
    iconStack.addSpacer();
    widget.addSpacer(15);
    
    const maybachStack = widget.addStack();
    maybachStack.addSpacer();
    const tipText = maybachStack.addText('数据未连接');
    tipText.font = Font.systemFont(17);
    tipText.centerAlignText();
    maybachStack.addSpacer();
  }
  
  if ( !config.runsInWidget ) {  
    await widget.presentSmall();
  } else {
    Script.setWidget(widget);
    Script.complete();
  }
};

// 数据未连接
const downloadModule = async (scriptName, url) => {
  const modulePath = fm.joinPath(cache, scriptName);
  if (fm.fileExists(modulePath)) {
    return modulePath;
  } else {
    const req = new Request(url);
    const moduleJs = await req.load().catch(() => {
      return null;
    });
    if (moduleJs) {
      fm.write(modulePath, moduleJs);
      return modulePath;
    }
  }
};

const createErrorWidget = async (widget) => {
  const text = widget.addText('不支持大号组件');
  text.font = Font.systemFont(17);
  text.centerAlignText();
  Script.setWidget(widget);
};

/**-------------------------**/
   /** Request(url) json **/
/**-------------------------**/

const argsParam = async () => {  
  const descriptions = {
    fortification_on: '解锁',
    fortification_off: '锁定',
    acc_on: await getLastLocation(),
    acc_off: '熄火'
  }
  if ( args ) {
    const description = descriptions[args.plainTexts[0]];
    return description || '未知';
  }
};
if ( args.plainTexts[0] ) {
  return JSON.stringify(await argsParam(), null, 4);
}

/**-------------------------**/

const runWidget = async () => {
  if (config.runsInWidget && setting.cookie) {
    const widget = new ListWidget();
    try {
      await (config.widgetFamily === 'medium' ? createWidget() : config.widgetFamily === 'small' ? createSmallWidget(widget) : createErrorWidget(widget));
    } catch (e) {
      await importModule(await downloadModule('maybach.js', 'https://gitcode.net/4qiao/scriptable/raw/master/api/maybach_error.js')).main();
    }
  } else {
    await Promise.all([loadPicture(), presentMenu()]);
  }
};
await runWidget();