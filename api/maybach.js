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
const cacheFile = F_MGR.joinPath(path, 'honda.json');

if (!F_MGR.fileExists(path)) {
  F_MGR.createDirectory(path);
}

if (F_MGR.fileExists(cacheFile)) {
  data = F_MGR.readString(cacheFile);
  json = JSON.parse(data);
}

// Presents the main menu
async function presentMenu() {
  let alert = new Alert();
  alert.title = 'Mercedes Maybach';
  alert.message = '\n显示车辆实时位置、车速、停车时间\n模拟电子围栏、模拟停红绿灯\n设置间隔时间推送车辆状态信息';
  alert.addDestructiveAction('更新代码');
  alert.addDestructiveAction('重置所有');
  alert.addAction('家人地图');
  alert.addAction('输入凭证');
  alert.addAction('预览组件');
  alert.addAction('退出菜单');
  response = await alert.presentAlert();
  if (response === 1) {
    F_MGR.remove(path);
    return;
  }
  if (response === 2) {
    Safari.open('amapuri://WatchFamily/myFamily');
  }
  if (response === 3) {
    await inputCookie();
  }
  if (response === 4) {
    await getData();
    await createWidget();
  }
  if (response === 5) return;
  if (response === 0) {
    const codeString = await new Request('https://gitcode.net/4qiao/scriptable/raw/master/api/maybach.js').loadString();
    const finish = new Alert();
    if (codeString.indexOf('Maybach' || 'HONDA') == -1) {
      finish.title = '更新失败';
      finish.addAction('OK');
      await finish.presentAlert();
    } else {
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
    }
  }
}

async function inputCookie() {
  const alert = new Alert();
  alert.message = '输入 Cookie'
  alert.addTextField('高德地图Cookie', json.cookie);
  alert.addAction('确定');
  alert.addCancelAction('取消');
  const input = await alert.present();
  if (input === -1) return;
  const cookie = alert.textFieldValue(0);
  if (cookie) {
    json.cookie = cookie;
    F_MGR.writeString(
      cacheFile,
      JSON.stringify(json)
    );
  }
}


// Create Widget
async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = Color.white();
  const gradient = new LinearGradient();
  color = [
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

  if (speed <= 5) {
    state = '已静止';
    status = '[ 车辆静止中 ]';
  } else {
    state = `${speed} km·h`;
    status = `[ 车速 ${speed} km·h ]`;
  }
  
  const mapUrl = `https://maps.apple.com/?q=HONDA&ll=${latitude},${longitude}&t=m`;
  
  // Get address (aMap)
  const adr = await new Request(`http://restapi.amap.com/v3/geocode/regeo?key=9d6a1f278fdce6dd8873cd6f65cae2e0&s=rsv3&radius=500&extensions=all&location=${longitude},${latitude}`).loadJSON();
  const address = adr.regeocode.formatted_address;
  
  // 计算停车时长(红绿灯图标)
  const timestamp = Date.parse(new Date());
  const parkingTime = (timestamp - updateTime);
  const days = Math.floor(parkingTime/(24 * 3600 * 1000));
  const P1 = parkingTime % (24 * 3600 * 1000);
  const hours1 = Math.floor(P1 / (3600 * 1000));
  const P2 = P1 % (3600 * 1000);
  const minutes1 = Math.floor(P2 / (60 * 1000));
  
  // Timestamp Formatter
  const date = new Date(updateTime);
  const df = new DateFormatter();
  df.dateFormat = 'yyyy-MM-dd HH:mm';
  const GMT = (df.string(date));
  df.dateFormat = 'MM-dd HH:mm';
  const GMT2 = (df.string(date));
  
  // Saved Json
  runObj = {
    updateTime: updateTime, 
    address: address,
    run: owner,
    coordinates: `${longitude},${latitude}`,
    pushTime: timestamp,
    parkingTime: GMT2,
    cookie: json.cookie
  }
    
  object = {
    ...runObj,
    run: speed
  }
  // Initial Save
  if (!F_MGR.fileExists(cacheFile)) {
    F_MGR.writeString(
      cacheFile,
      JSON.stringify(runObj, null, 2)
    );
    json = JSON.parse(
F_MGR.readString(cacheFile)
    );
  }
  
  /**
   * 界面显示布局(左到右)
   * @param {image} image
   * @param {string} text
   * Cylindrical Bar Chart
   */
  widget.setPadding(10, 10, 10, 15);
  const mainStack = widget.addStack();
  mainStack.layoutHorizontally();
  mainStack.addSpacer();
    
  // Left Main Stack
  const leftStack = mainStack.addStack();
  leftStack.layoutVertically();
  leftStack.addSpacer();
  // plateStack
  const plateStack = leftStack.addStack();
  const textPlate = plateStack.addText(minutes1 <= 3 ? 'Maybach🚦' : '琼A·849A8');
  textPlate.font = Font.mediumSystemFont(19);
  textPlate.textColor = Color.black();
  textPlate.textOpacity = 0.9;
  leftStack.addSpacer(3);
    
  // Mercedes Logo
  const benzStack = leftStack.addStack();
  benzStack.layoutHorizontally();
  benzStack.centerAlignContent();
  const iconSymbol = SFSymbol.named('car');
  const carIcon1 = benzStack.addImage(iconSymbol.image);
  carIcon1.imageSize = new Size(16, 16);
  benzStack.addSpacer(4);
  // mercedes text
  const vehicleModelText = benzStack.addText('Mercedes');
  vehicleModelText.font = Font.mediumSystemFont(14);
  vehicleModelText.textColor = Color.black();
  vehicleModelText.textOpacity = 0.7;
  leftStack.addSpacer(3)
  
  // update time icon
  const dateStack = leftStack.addStack();
  dateStack.layoutHorizontally();
  dateStack.centerAlignContent();
  const iconSymbol2 = SFSymbol.named('timer');
  const carIcon2 = dateStack.addImage(iconSymbol2.image)
  carIcon2.imageSize = new Size(16, 16);
  dateStack.addSpacer(4);
  // update time text
  const textUpdateTime = dateStack.addText(GMT2);
  textUpdateTime.font = Font.mediumSystemFont(13);
  textUpdateTime.textColor = Color.black();
  textUpdateTime.textOpacity = 0.7;
  leftStack.addSpacer(22);
  
  // Left Stack barRow
  const barStack = leftStack.addStack();
  barStack.layoutHorizontally();
  barStack.centerAlignContent();
  barStack.setPadding(3, 10, 3, 10);
  barStack.cornerRadius = 10;
  barStack.borderColor = new Color(speed <= 5 ? '#AB47BC' : '#FF1744', 0.7);
  barStack.borderWidth = 2;
  // bar icon
  const barIcon = SFSymbol.named(speed <= 5 ? 'location' : 'location.fill');
  const barIconElement = barStack.addImage(barIcon.image);
  barIconElement.imageSize = new Size(16, 16);
  barIconElement.tintColor = speed <= 5 ? Color.purple() : Color.red();
  barStack.addSpacer(4);
  // bar text
  const totalMonthBar = barStack.addText(state);
  totalMonthBar.font = Font.mediumSystemFont(14);
  totalMonthBar.textColor = new Color(speed <= 5 ? '#AA00FF' : '#D50000');
  leftStack.addSpacer(8);

  // Left Stack barRow2
  const barStack2 = leftStack.addStack();
  barStack2.layoutHorizontally();
  barStack2.centerAlignContent();
  barStack2.setPadding(3, 10, 3, 10);
  barStack2.cornerRadius = 10;
  barStack2.borderColor = Color.dynamic(new Color('#000000', 0.4), new Color('#000000', 0.4));
  barStack2.borderWidth = 2;
  // bsr icon
  const barIcon2 = SFSymbol.named('lock.shield.fill');
  const barIconElement2 = barStack2.addImage(barIcon2.image);
  barIconElement2.imageSize = new Size(16, 16);
  barIconElement2.tintColor = Color.green();
  barStack2.addSpacer(4);
  // bar text
  const totalMonthBar2 = barStack2.addText('已锁车');
  totalMonthBar2.font = Font.mediumSystemFont(14);
  totalMonthBar2.textColor = Color.black();
  totalMonthBar2.textOpacity = 0.6;
  leftStack.addSpacer();
  
    
  /**
   * right Stack
   * Car Logo and image
   * @param {image} image
   * @param {string} address
   */
  const rightStack = mainStack.addStack();
  rightStack.layoutVertically();
  rightStack.addSpacer();
  // Car Logo
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
    
  if (str <= 35) {
    textAddress = adrStack.addText(address + ` - ${adr.regeocode.pois[0].address}` + `${adr.regeocode.pois[0].distance}米`)
  } else if (str < 46) {
    textAddress = adrStack.addText(address + ` - ${adr.regeocode.pois[0].address}`);
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
  
  if (!config.runsInWidget) {  
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
  const acc = await new Request('https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=ww1ce681aef2442dad&corpsecret=Oy7opWLXZimnS_s76YkuHexs12OrUOwYEoMxwLTaxX4').loadJSON(); // accessToken
  
  const mapKey = atob('aHR0cHM6Ly9yZXN0YXBpLmFtYXAuY29tL3YzL3N0YXRpY21hcD8ma2V5PWEzNWE5NTM4NDMzYTE4MzcxOGNlOTczMzgyMDEyZjU1Jnpvb209MTQmc2l6ZT00NTAqMzAwJm1hcmtlcnM9LTEsaHR0cHM6Ly9pbWFnZS5mb3N1bmhvbGlkYXkuY29tL2NsL2ltYWdlL2NvbW1lbnQvNjE5MDE2YmYyNGUwYmM1NmZmMmE5NjhhX0xvY2F0aW5nXzkucG5n');
  
  if (json.run !== 'HONDA') {
    const fence = await new Request(`https://restapi.amap.com/v5/direction/driving?key=a35a9538433a183718ce973382012f55&origin_type=0&strategy=38&origin=${json.coordinates}&destination=${longitude},${latitude}`).loadJSON();  
    const distance = fence.route.paths[0].distance  
    
    if (distance > 20) {
      // push message to WeChat_1
      const weChat_1 = new Request(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${acc.access_token}`);
      weChat_1.method = 'POST'
      weChat_1.body = JSON.stringify({
        touser: 'DianQiao',
        agentid: '1000004',
        msgtype: 'news',
        news: {
          articles: [
            {
              title: address,
              picurl: `${mapKey},0:${longitude},${latitude}`,
              description: `${status}  启动时间 ${GMT}\n已离开📍${json.address}，相距 ${distance} 米`,
              url: mapUrl
            }
          ]
        }
      });
      await weChat_1.loadJSON();
      notify(status + ' ' + GMT, `已离开📍${json.address}，相距 ${distance} 米`, mapUrl);
      F_MGR.writeString(
        cacheFile,
        JSON.stringify(runObj)
      );
      return;// pushEnd_1
    }
  }
  
      
  /**
   * 车辆状态触发条件
   * 驻车时长，行驶中，静止状态
   * 推送信息到微信
   */
  const date1 = (timestamp - json.pushTime);
  const L1 = date1 % (24 * 3600 * 1000);
  const hours = Math.floor(L1 / (3600 * 1000));
  const L2 = L1 % (3600 * 1000);
  const minutes = Math.floor(L2 / (60 * 1000));
  const L3 = L2 % (60 * 1000);
  const seconds = Math.round(L3 / 1000);
  let moment = (hours * 60 + minutes)
  
  if (speed <= 5) {
    const duration = updateTime == json.updateTime ? 240 : 10;
    if (moment >= duration) {
      // push message to WeChat_2
      const weChat_2 = new Request(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${acc.access_token}`);
      weChat_2.method = 'POST'
      weChat_2.body = JSON.stringify({
        touser: 'DianQiao',
        agentid: '1000004',
        msgtype: 'news',
        news: {
          articles: [
            {
              title: address,
              picurl: `${mapKey},0:${longitude},${latitude}`,
              description: `${status} 停车时间 ${GMT}`,
              url: mapUrl
            }
          ]
        }
      });
      await weChat_2.loadJSON();
      notify(status + ' ' + GMT, address, mapUrl);
      F_MGR.writeString(
        cacheFile,
        JSON.stringify(object)
      );
    } 
  } else {
    if (json.run !== 'HONDA'){
      // push message to WeChat_3
      const weChat_3 = new Request(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${acc.access_token}`);
      weChat_3.method = 'POST'
      weChat_3.body = JSON.stringify({
        touser: 'DianQiao',
        agentid: '1000004',
        msgtype: 'news',
        news: {
          articles: [
            {
              title: address,
              picurl: `${mapKey},0:${longitude},${latitude}`,
              description: `${status} 启动时间 ${GMT}`,
              url: mapUrl
            }
          ]
        }
      });
      await weChat_3.loadJSON();
      notify(status + ' ' + GMT, address, mapUrl)
      F_MGR.writeString(
        cacheFile,
        JSON.stringify(runObj)
      );
    } else {
      // push message to WeChat_4
      const weChat_4 = new Request(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${acc.access_token}`);
      weChat_4.method = 'POST'
      weChat_4.body = JSON.stringify({
        touser: 'DianQiao',
        agentid: '1000004',
        msgtype: 'news',
        news: {
          articles: [
            {
              title: address,
              picurl: `${mapKey},0:${longitude},${latitude}`,
              description: `${status} 更新时间 ${GMT}`,
              url: mapUrl
            }
          ]
        }
      });
      await weChat_4.loadJSON();
      notify(status + ' ' + GMT, address, mapUrl);
      F_MGR.writeString(
        cacheFile,
        JSON.stringify(runObj)
      );
      return;
    }
  }
  return widget;
}

const isMediumWidget =  config.widgetFamily === 'medium'
if (config.runsInWidget) {
  if ( isMediumWidget ) {
    await getData();
    await createWidget();
  } else {
    await createErrorWidget();
  }
} else {
  await presentMenu();
}

async function getData() {
  const req = new Request('http://ts.amap.com/ws/tservice/location/getLast?in=KQg8sUmvHrGwu0pKBNTpm771R2H0JQ%2FOGXKBlkZU2BGhuA1pzHHFrOaNuhDzCrQgzcY558tHvcDx%2BJTJL1YGUgE04I1R4mrv6h77NxyjhA433hFM5OvkS%2FUQSlrnwN5pfgKnFF%2FLKN1lZwOXIIN7CkCmdVD26fh%2Fs1crIx%2BJZUuI6dPYfkutl1Z5zqSzXQqwjFw03j3aRumh7ZaqDYd9fXcT98gi034XCXQJyxrHpE%2BPPlErnfiKxd36lLHKMJ7FtP7WL%2FOHOKE%2F3YNN0V9EEd%2Fj3BSYacBTdShJ4Y0pEtUf2qTpdsIWn%2F7Ls1llHCsoBB24PQ%3D%3D&ent=2&keyt=4');
  req.method = 'GET'
  req.headers = {
    Cookie: json.cookie
  }
  const res = await req.loadJSON();
  if (res.code != 1) return;
  return {
    speed,
    owner,
    longitude,
    latitude,
    updateTime
  } = res.data;
}

async function notify (title, body, url, opts = {}) {
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