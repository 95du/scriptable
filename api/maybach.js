// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: car;
/**
 * 小组件作者: 95度茅台
 * Honda Civic
 * Version 1.1.0
 * 2022-12-22 22:22
 * 模拟电子围栏，显示车速，位置
 */

const uri = Script.name();
const F_MGR = FileManager.iCloud();
const path = F_MGR.joinPath(F_MGR.documentsDirectory(), 'mercedes');
if (!F_MGR.fileExists(path)) {
  F_MGR.createDirectory(path);
}
const cacheFile = F_MGR.joinPath(path, 'setting.json');

// Get Settings { json }
const getSettings = (file) => {
  let setting = {};
  if (F_MGR.fileExists(file)) {
    return { cookie, run, coordinates, pushTime } = JSON.parse(F_MGR.readString(file));
  }
  return {}
}
const setting = await getSettings(cacheFile);

/**
 * 存储当前设置
 * @param { JSON } string
 */
const writeSettings = async (inObject) => {
   if ( setting ) {
     F_MGR.writeString(cacheFile, JSON.stringify(inObject));
     console.log(JSON.stringify(
       inObject, null, 2)
    );
   }
 }


// Presents the main menu
async function presentMenu() {
  const title = 'Mercedes Maybach';
  const message = '\n显示车辆实时位置、车速、停车时间\n模拟电子围栏、模拟停红绿灯\n设置间隔时间推送车辆状态信息';
  const destructiveActions = ['更新代码', '重置所有'];
  const actions = ['家人地图', '输入凭证', '预览组件', '退出菜单'];

  const showAlert = (
    title,
    message
  ) => {
    let alert = new Alert();
    alert.title = title;
    alert.message = message;
    return alert;
  }

  const alert = showAlert(
    title, 
    message
  );
  for (const action of destructiveActions) {
    alert.addDestructiveAction(action);
  }
  for (const action of actions) {
    alert.addAction(action);
  }

  const response = await alert.presentAlert();
  switch (response) {
    case 1:
      F_MGR.remove(path);
      return;
    case 2:
      Safari.open('amapuri://WatchFamily/myFamily');
      break;
    case 3:
      await inputCookie();
      break;
    case 4:
      if ( !setting.cookie ) return;
      await getData();
      await createWidget();
      break;
    case 5:
      return;
    case 0:
      const codeString = await new Request('https://gitcode.net/4qiao/scriptable/raw/master/api/maybach.js').loadString();
      const finish = showAlert();
      if (codeString.includes('95度茅台' || 'HONDA' || 'Maybach')) {
        const iCloudInUse = F_MGR.isFileStoredIniCloud(module.filename);
        if (iCloudInUse) {
          F_MGR.writeString(  
            module.filename, 
            codeString
          );
          finish.title = '更新成功';
          finish.addAction('OK');
          await finish.presentAlert();
          Safari.open('scriptable:///run/' + encodeURIComponent(uri));
        }
      } else {
        finish.title = '更新失败';
        finish.addAction('OK');
        await finish.presentAlert();
      }
   // Main Menu
  }
}

async function inputCookie() {
  const alert = new Alert();
  alert.message = '输入 Cookie'
  alert.addTextField('高德地图Cookie');
  alert.addAction('确定');
  alert.addCancelAction('取消');
  const input = await alert.present();
  if ( input === -1 ) return;
  const cookie = alert.textFieldValue(0);
  if ( cookie ) {
    await writeSettings({ cookie: cookie });
    Safari.open('scriptable:///run/' + encodeURIComponent(uri));
  }
}

// Get address (aMap)
const getAddress = async () => {
  const adr = await new Request(`http://restapi.amap.com/v3/geocode/regeo?key=9d6a1f278fdce6dd8873cd6f65cae2e0&s=rsv3&radius=500&extensions=all&location=${longitude},${latitude}`).loadJSON();
  return { formatted_address: address, pois = [] } = adr.regeocode;
}

const getDistance = async () => {
  const fence = await new Request(`https://restapi.amap.com/v5/direction/driving?key=a35a9538433a183718ce973382012f55&origin_type=0&strategy=38&origin=${coordinates}&destination=${longitude},${latitude}`).loadJSON();
  return { distance } = fence.route.paths[0];
}


// Create Widget
async function createWidget() {
  await getAddress();
  const mapUrl = `https://maps.apple.com/?q=HONDA&ll=${latitude},${longitude}&t=m`;
  
  const [ state, status ] = speed <= 5 ? ['已静止', '车辆静止中'] : [`${speed} km·h`, `[ 车速 ${speed} km·h ]`];
  
  // 计算停车时长(红绿灯图标)  
  function getParkingTime( updateTime ) {
    const timeAgo = new Date(Date.now() - updateTime);
    const minutes = timeAgo.getUTCMinutes();
    return minutes;
  }
  const parkingTime = getParkingTime(updateTime);
  
  // Timestamp Formatter
  function formatDate(updateTime, format) {
    const date = new Date(updateTime);
    const df = new DateFormatter();
    df.dateFormat = format;
    return df.string(date);
  }
  const GMT = formatDate(
    updateTime,
    'yyyy-MM-dd HH:mm'
  );
  const GMT2 = formatDate(
    updateTime,
    'MM-dd HH:mm'
  );
  
  // Saved Json
  const runObj = {
    updateTime: updateTime, 
    address: address,
    run: owner,
    coordinates: `${longitude},${latitude}`,
    pushTime: Date.now(),
    parkingTime: GMT2,
    cookie: cookie
  }
  // Initial Save
  if ( setting.run == undefined) {
    await writeSettings(runObj);
  }
  
  
  // 显示小组件
  const widget = new ListWidget();
  widget.backgroundColor = Color.white();
  const gradient = new LinearGradient();
  const color = [
    "#82B1FF",
    "#4FC3F7",
    "#66CCFF",
    "#99CCCC",
    "#BCBBBB"
  ];
  const items = color[Math.floor(Math.random()*color.length)];
  gradient.locations = [0, 1];
  gradient.colors = [
    new Color(items, 0.5),
    new Color('#00000000')
  ];
  widget.backgroundGradient = gradient;
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
  leftStack.layoutVertically();
  leftStack.addSpacer();
  
  const plateStack = leftStack.addStack();
  const plateText = plateStack.addText(parkingTime <= 3 ? 'Maybach🚦' : '琼A·849A8');
  plateText.font = Font.mediumSystemFont(19);
  plateText.textColor = Color.black();
  plateText.textOpacity = 0.9;
  leftStack.addSpacer(3);
  
  const benzStack = leftStack.addStack();
  benzStack.layoutHorizontally();
  benzStack.centerAlignContent();
  const iconSymbol = SFSymbol.named('car');
  const carIcon1 = benzStack.addImage(iconSymbol.image);
  carIcon1.imageSize = new Size(16, 16);
  benzStack.addSpacer(4);
  
  const vehicleModelText = benzStack.addText('Mercedes');
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
  barStack2.borderColor = Color.dynamic(new Color('#000000', 0.4), new Color('#000000', 0.4));
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
   * right Stack
   * @param {image} image
   * @param {string} address
   */
  const rightStack = mainStack.addStack();
  rightStack.layoutVertically();
  rightStack.addSpacer();
  
  const carLogoStack = rightStack.addStack();
  carLogoStack.addSpacer();
  const carLogo = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/car/maybachLogo.png');
  const image = carLogoStack.addImage(carLogo);
  image.imageSize = new Size(27,27);
  image.tintColor = Color.dynamic(new Color('#000000'), new Color('#000000'));
  rightStack.addSpacer(2)
    
  // Car image
  const carImageStack = rightStack.addStack();
  carImageStack.setPadding(-20, 5, 0, 0);
  const imgUrl = new Request('https://gitcode.net/4qiao/shortcuts/raw/master/api/update/Scriptable.json');
  const resUrl = await imgUrl.loadJSON();
  const item = resUrl.maybach[Math.floor(Math.random() * resUrl.maybach.length)];
  const carImage = await getImage(item);
  const imageCar = carImageStack.addImage(carImage);
  imageCar.imageSize = new Size(225, 100);
  rightStack.addSpacer(1);

  // show address
  const adrStack = rightStack.addStack();
  adrStack.centerAlignContent();
  adrStack.size = new Size(226, 30);
  const jmz = {};
  jmz.GetLength = function(str) {
    return str.replace(/[\u0391-\uFFE5]/g,"@@").length;
  };  
  str = (jmz.GetLength(address));
    
  if ( str <= 35 ) {
    textAddress = adrStack.addText(`${address} - ${pois[0].address} ${pois[0].distance} 米`)
  } else if (str < 46) {
    textAddress = adrStack.addText(`${address} - ${pois[0].address}`);
  } else {
    textAddress = adrStack.addText(address);
  }
  textAddress.font = Font.mediumSystemFont(11.3);
  textAddress.textColor = Color.black();
  textAddress.textOpacity = 0.7;
  textAddress.centerAlignText();
  rightStack.addSpacer();
  
  // jump content
  barStack2.url = 'amapuri://WatchFamily/myFamily';
  textAddress.url = mapUrl;
  imageCar.url = 'scriptable:///run/' + encodeURIComponent(uri);
  
  if ( !config.runsInWidget ) {  
    await widget.presentMedium();
  } else {
    Script.setWidget(widget);
    Script.complete();
  }


  /**
   * Electronic Fence
   * 判断run为HONDA触发电子围栏
   * 推送信息到微信
   */
  const pushMessage = async (mapUrl, longitude, latitude, distance) => {
    const mapKey = atob('aHR0cHM6Ly9yZXN0YXBpLmFtYXAuY29tL3YzL3N0YXRpY21hcD8ma2V5PWEzNWE5NTM4NDMzYTE4MzcxOGNlOTczMzgyMDEyZjU1Jnpvb209MTQmc2l6ZT00NTAqMzAwJm1hcmtlcnM9LTEsaHR0cHM6Ly9pbWFnZS5mb3N1bmhvbGlkYXkuY29tL2NsL2ltYWdlL2NvbW1lbnQvNjE5MDE2YmYyNGUwYmM1NmZmMmE5NjhhX0xvY2F0aW5nXzkucG5n');
    const mapPicUrl = `${mapKey},0:${longitude},${latitude}`;
    const timeAgo = new Date(Date.now() - pushTime);
    const hours = timeAgo.getUTCHours();
    const minutes = timeAgo.getUTCMinutes();
    const moment = hours * 60 + minutes;
    
    if ( run !== 'HONDA' && distance > 20 ) {
      await sendWechatMessage(`${status}  启动时间 ${GMT}\n已离开📍${setting.address}，相距 ${distance} 米`, mapUrl, mapPicUrl);
      await writeSettings(runObj);
    } else if ( speed <= 5 ) {
      const duration = updateTime == setting.updateTime ? 120 : 10;
      if (moment >= duration) {
        await sendWechatMessage(`${status} 停车时间 ${GMT}`, mapUrl, mapPicUrl);
        await writeSettings({
          ...runObj,
          run: speed
        });
      }
    } else {
      if ( run !== 'HONDA' ) {
        await sendWechatMessage(`${status} 启动时间 ${GMT}`, mapUrl, mapPicUrl);
        await writeSettings(runObj);
      } else {
        await sendWechatMessage(`${status} 更新时间 ${GMT}`, mapUrl, mapPicUrl);
        await writeSettings(runObj);
      }
    }
  }
  
  const sendWechatMessage = async (description, url, picurl) => {
    const acc = await new Request('https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=ww1ce681aef2442dad&corpsecret=Oy7opWLXZimnS_s76YkuHexs12OrUOwYEoMxwLTaxX4').loadJSON(); // accessToken
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
          description,
          url
        }]
      }
    });
    if ( run !== 'HONDA' && distance > 20 ) {
      notify(`${status} ${GMT}`, `已离开📍${setting.address}，相距 ${distance} 米`, mapUrl);
    } else {
      notify(`${status} ${GMT}`, address, mapUrl);
    }
    return request.loadJSON();
  }
  
  await getDistance();
  await pushMessage(mapUrl, longitude, latitude, distance);

  return widget;
}


/**-------------------------**/
   /** Request(url) json **/
/**-------------------------**/

const argsParam = async () => {  
  const descriptions = {
    fortification_on: '解锁',
    fortification_off: '锁定',
    acc_on: await getData(),
    acc_off: '熄火'
  }
  if ( args ) {
    const description = descriptions[args.plainTexts];
    return description || '未知';
  }
}
if ( args.plainTexts[0] ) {
  return await argsParam();
}

// config widget
const isMediumWidget =  config.widgetFamily === 'medium'
if ( config.runsInWidget ) {
  if ( isMediumWidget ) {
    await getData();
    await createWidget();
  } else {
    await createErrorWidget();
  }
} else {
  await presentMenu();
}

/**-------------------------**/
   /** Request(url) json **/
/**-------------------------**/
  
/**
 * 获取地理位置信息
 * @param {number} longitude - 经度
 * @param {number} latitude - 纬度
 * @returns {object} - 地理位置信息的对象，包含地址、停车时间等属性
 */
async function getData() {
  const req = new Request('http://ts.amap.com/ws/tservice/location/getLast?in=KQg8sUmvHrGwu0pKBNTpm771R2H0JQ%2FOGXKBlkZU2BGhuA1pzHHFrOaNuhDzCrQgzcY558tHvcDx%2BJTJL1YGUgE04I1R4mrv6h77NxyjhA433hFM5OvkS%2FUQSlrnwN5pfgKnFF%2FLKN1lZwOXIIN7CkCmdVD26fh%2Fs1crIx%2BJZUuI6dPYfkutl1Z5zqSzXQqwjFw03j3aRumh7ZaqDYd9fXcT98gi034XCXQJyxrHpE%2BPPlErnfiKxd36lLHKMJ7FtP7WL%2FOHOKE%2F3YNN0V9EEd%2Fj3BSYacBTdShJ4Y0pEtUf2qTpdsIWn%2F7Ls1llHCsoBB24PQ%3D%3D&ent=2&keyt=4');
  req.method = 'GET'
  req.headers = { Cookie: cookie }
  const res = await req.loadJSON();
  if ( res.code == 1 ) {
    return { speed, owner, longitude, latitude, updateTime } = res.data;
  }
}

async function notify ( title, body, url, opts = {} ) {
  let n = new Notification();
  n = Object.assign(n, opts);
  n.title = title
  n.body = body
  n.sound = 'piano_success'
  if (url) n.openURL = url
  return await n.schedule();
}

async function getImage(url) {
  const r = await new Request(url);
  return await r.loadImage();
}

async function createErrorWidget() {
  const widget = new ListWidget();
  const text = widget.addText('仅支持中尺寸');
  text.font = Font.systemFont(17);
  text.centerAlignText();
  Script.setWidget(widget);
}