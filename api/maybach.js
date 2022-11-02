// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: car;
const notice = new Notification()
const widget = await createWidget()

  async function createWidget() {
    const oilUrl = new Request('https://mys4s.cn/v3/oil/price');
    oilUrl.method = 'POST'
    oilUrl.body = 'region=海南'
    const oil = await oilUrl.loadJSON();
    const hainan = oil.data.Oil92
    // Data Request
    const req = new Request('http://ts.amap.com/ws/tservice/location/getLast?in=KQg8sUmvHrGwu0pKBNTpm771R2H0JQ%2FOGXKBlkZU2BGhuA1pzHHFrOaNuhDzCrQgzcY558tHvcDx%2BJTJL1YGUgE04I1R4mrv6h77NxyjhA433hFM5OvkS%2FUQSlrnwN5pfgKnFF%2FLKN1lZwOXIIN7CkCmdVD26fh%2Fs1crIx%2BJZUuI6dPYfkutl1Z5zqSzXQqwjFw03j3aRumh7ZaqDYd9fXcT98gi034XCXQJyxrHpE%2BPPlErnfiKxd36lLHKMJ7FtP7WL%2FOHOKE%2F3YNN0V9EEd%2Fj3BSYacBTdShJ4Y0pEtUf2qTpdsIWn%2F7Ls1llHCsoBB24PQ%3D%3D&ent=2&keyt=4');
    req.method = 'GET'
    req.headers = {"Cookie": "sessionid=ggylbvv5klxzm6ahibpfng4ldna2cxsy"}
    const res = await req.loadJSON();
    
    if (res.code != 1) {
      return;// Token expiration
    }
    
    // Get address (aMap)
    const data = res.data
    const REQ = new Request(`http://restapi.amap.com/v3/geocode/regeo?key=9d6a1f278fdce6dd8873cd6f65cae2e0&s=rsv3&radius=500&extensions=all&location=${data.longitude},${data.latitude}`);  
    const adr = await REQ.loadJSON();
    const address = adr.regeocode.formatted_address  
    
    // Current timestamp
    const timestamp = Date.parse(new Date());
    // 计算时长
    const parkingTime = (timestamp - data.updateTime);
    const days = Math.floor(parkingTime/(24 * 3600 * 1000));
    const P1 = parkingTime % (24 * 3600 * 1000);
    const hours1 = Math.floor(P1 / (3600 * 1000));
    const P2 = P1 % (3600 * 1000);
    const minutes1 = Math.floor(P2 / (60 * 1000));

    // Saved Data
    runObj = `{
    "updateTime": "${data.updateTime}", 
    "address": "${address}", 
    "run": "${data.owner}", 
    "coordinates": "${data.longitude},${data.latitude}",
    "pushTime": "${timestamp}"
    }`
    
    object = `{
    "updateTime": "${data.updateTime}",        
    "address": "${address}", 
    "run": "${data.speed}", 
    "coordinates": "${data.longitude},${data.latitude}",
    "pushTime": "${timestamp}"
    }`
    
    // Timestamp Conversion
    const date = new Date(data.updateTime);
    const Y = date.getFullYear() + '-';
    const M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    const D = (date.getDate() < 10 ? '0'+(date.getDate()) : date.getDate()) + ' ';
    const h = (date.getHours() < 10 ? '0'+(date.getHours()) : date.getHours()) + ':';
    const m = (date.getMinutes() < 10 ? '0'+(date.getMinutes()) : date.getMinutes()); //+ ':';
    //const s = (date.getSeconds() < 10 ? '0'+(date.getSeconds()) : date.getSeconds());
    const GMT = (Y+M+D+h+m);//+s
    const GMT2 = (M+D+h+m);
    
    // speed
    if (data.speed <= 5) {
      status = "[ 车辆静止中 ]";
      state = "已静止";
      mapUrl = `https://maps.apple.com/?q=HONDA&ll=${data.latitude},${data.longitude}&t=m`;
    } else {
      status = `[ 车速 ${data.speed} km·h ]`;
      state = `${data.speed} km·h`;
      mapUrl = `https://maps.apple.com/?q=HONDA&ll=${data.latitude},${data.longitude}&t=m`;
    }
    
    // 组件背景渐变
    const widget = new ListWidget()
    widget.backgroundColor = Color.white();
    const gradient = new LinearGradient()
    color = [
    "#82B1FF", 
    "#757575", 
    "#4FC3F7",
    "#66CCFF",
    "#99CCCC",
    "#BCBBBB"
    ]
    const items = color[Math.floor(Math.random()*color.length)];
    gradient.locations = [0, 1]
    gradient.colors = [
      new Color(`${items}`, 0.5),
      new Color('#00000000')
    ]
    widget.backgroundGradient = gradient


    /**
    界面显示布局(左到右)
    Layout left and right
    @ image
    @ text
    Cylindrical Bar Chart
    */
    widget.setPadding(10, 15, 10, 10);
    const mainStack = widget.addStack();
    //mainStack.layoutVertically();
    mainStack.layoutHorizontally();
    const dataStack = mainStack.addStack();
    

    // First column
    const column1 = dataStack.addStack();
    column1.layoutVertically();
    // plateStack
    const plateStack = column1.addStack();
    if (minutes1 <= 2) {
      textPlate = plateStack.addText('Maybach🚦');
    } else {
      textPlate = plateStack.addText('琼A·849A8')
    }
    textPlate.font = Font.mediumSystemFont(19);
    textPlate.textColor =Color.black();
    column1.addSpacer(3)
    
    // fuelpumpStack
    const fuelpumpStack = column1.addStack();
    fuelpumpStack.layoutHorizontally();
    fuelpumpStack.centerAlignContent();
    const gas = new Request ('https://gitcode.net/4qiao/scriptable/raw/master/img/icon/fuelpump.png');
    const iconSymbol = await gas.loadImage();
    const fuelpumpIcon = fuelpumpStack.addImage(iconSymbol);
    fuelpumpIcon.imageSize = new Size(15, 15);
    fuelpumpIcon.tintColor = Color.black();
    fuelpumpStack.addSpacer(5);
    // Oil 92 Price
    const vehicleModel = fuelpumpStack.addStack();
    const vehicleModelText = vehicleModel.addText(`92 - ¥ ${hainan}`);
    vehicleModelText.font = Font.mediumSystemFont(14);
    vehicleModelText.textColor = new Color('#424242');
    column1.addSpacer(3)
    
    
    // update time icon
    const updateTimeStack = column1.addStack();
    updateTimeStack.layoutHorizontally();
    updateTimeStack.centerAlignContent();
    const iconSymbol2 = SFSymbol.named('car');
    const carIcon = updateTimeStack.addImage(iconSymbol2.image);
    carIcon.imageSize = new Size(15, 15);
    carIcon.tintColor = Color.black();
    updateTimeStack.addSpacer(5);
    // update time text
    const updateTime = updateTimeStack.addStack();
    const textUpdateTime = updateTime.addText(GMT2);
    textUpdateTime.font = Font.mediumSystemFont(14);
    textUpdateTime.textColor = new Color('#424242');
    column1.addSpacer(21)
    
    
    const barRow = column1.addStack()
    const barStack = barRow.addStack();
    barStack.layoutHorizontally();
    barStack.centerAlignContent();
    barStack.setPadding(3, 10, 3, 10);
    if (data.speed <= 5) {
      // 按钮 speed 小于 5
      barStack.backgroundColor = new Color('#EEEEEE', 0.1);
      barStack.cornerRadius = 10
      barStack.borderColor = new Color('#AB47BC', 0.7);
      barStack.borderWidth = 2
      // bar icon
      const barIcon = SFSymbol.named('checkmark.shield.fill');
      const barIconElement = barStack.addImage(barIcon.image);
      barIconElement.imageSize = new Size(15, 15);
      barIconElement.tintColor = Color.purple();
      barStack.addSpacer(8);
      // bar text
      const totalMonthBar = barStack.addText(state);
      totalMonthBar.font = Font.mediumSystemFont(14);
      totalMonthBar.textColor = new Color('#AA00FF');
      column1.addSpacer(8)
    } else {
      // 按钮 speed 大于 5
      barStack.backgroundColor = new Color('#EEEEEE', 0.1);
      barStack.cornerRadius = 10
      barStack.borderColor = new Color('#FF1744', 0.7);
      barStack.borderWidth = 2
      // bar icon
      const barIcon = SFSymbol.named('checkmark.shield.fill');
      const barIconElement = barStack.addImage(barIcon.image);
      barIconElement.imageSize = new Size(15, 15);
      barIconElement.tintColor = Color.red();
      barStack.addSpacer(8);
      // bar text
      const totalMonthBar = barStack.addText(state);
      totalMonthBar.font = Font.mediumSystemFont(14);
      totalMonthBar.textColor = new Color('#D50000');
      column1.addSpacer(8)
    }
    

    // 按钮 2
    const barRow2 = column1.addStack();
    const barStack2 = barRow2.addStack();
    barStack2.layoutHorizontally();
    barStack2.centerAlignContent();
    barStack2.backgroundColor = new Color('#EEEEEE', 0.3);
    barStack2.setPadding(3, 10, 3, 10);
    barStack2.cornerRadius = 10
    barStack2.borderColor = new Color('#616161', 0.7);
    barStack2.borderWidth = 2
    // bsr icon
    const barIcon2 = SFSymbol.named('lock.shield.fill');
    const barIconElement2 = barStack2.addImage(barIcon2.image);
    barIconElement2.imageSize = new Size(15, 15);
    barIconElement2.tintColor = Color.green();
    barStack2.addSpacer(8);
    // bar text
    const totalMonthBar2 = barStack2.addText('已锁车');
    totalMonthBar2.font = Font.mediumSystemFont(14);
    totalMonthBar2.textColor = new Color('#616161');
    column1.addSpacer(2)
    
    
    /**
    Second column
    @ Car Logo
    @ Car image
    @ Address
    */
    const column2 = dataStack.addStack();
    column2.layoutVertically();
    // Car Logo
    const carLogoStack = column2.addStack();
    carLogoStack.setPadding(0, 200, 0, 0);
    const carLogo = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/car/maybachLogo.png');
    const image = carLogoStack.addImage(carLogo);
    image.imageSize = new Size(27,27);
    image.tintColor = Color.black();
    column2.addSpacer(2)
    
    // Car image
    const carImageStack = column2.addStack();
    carImageStack.setPadding(-20, 5, 0, 0);
    const imgUrl = new Request('https://gitcode.net/4qiao/shortcuts/raw/master/api/update/Scriptable.json');
    const resUrl = await imgUrl.loadJSON();
    const item = resUrl.maybach[Math.floor(Math.random()*resUrl.maybach.length)];
    const carImage = await getImage(item);
    const imageCar = carImageStack.addImage(carImage);
    imageCar.imageSize = new Size(226,100);
    column2.addSpacer(2)

    // show address
    const adrStack = column2.addStack();
    adrStack.layoutHorizontally();
    adrStack.centerAlignContent();
    adrStack.size = new Size(230, 30)
    const jmz = {};
    jmz.GetLength = function(str) {
      return str.replace(/[\u0391-\uFFE5]/g,"@@").length;
    };  
    str = (jmz.GetLength(address));
    
    if (str <= 35) {
      textAddress = adrStack.addText(address + ` - 距离${adr.regeocode.pois[0].address}` + `${adr.regeocode.pois[0].distance}米`)
    } else if (str < 47) {
      textAddress = adrStack.addText(address + ` - ${adr.regeocode.pois[0].address}`);
    } else {
      textAddress = adrStack.addText(address);
    }
    
    textAddress.font = Font.mediumSystemFont(11.5);
    textAddress.textColor = new Color('#484848');
    textAddress.centerAlignText();
    
    
    // jump show map
    barRow2.url = 'quantumult-x:///';
    // jump show map
    textAddress.url = `${mapUrl}`;
    // jump run widget
    imageCar.url = 'scriptable:///run/Maybach';
    
    // update and check
    if (!config.runsInWidget) {  
      let alert = new Alert();
      alert.title = "Honda Civic 小组件"
      alert.addAction('更新代码')
      alert.addAction('预览组件')
      alert.addAction('退出')
      response = await alert.presentAlert();
      if (response === 1) {
        await widget.presentMedium();
        return;
      }
      if (response === 2) return;
      // Update the code
      if (response === 0) {
        const FILE_MGR = FileManager.local()
        const iCloudInUse = FILE_MGR.isFileStoredIniCloud(module.filename);
        const reqUpdate = new Request('https://gitcode.net/4qiao/scriptable/raw/master/api/maybach.js');
        const codeString = await reqUpdate.loadString()  
        const finish = new Alert();
        if (codeString.indexOf("Maybach" || "HONDA") == -1) {
          finish.title = "更新失败"
          finish.addAction('OK')
          await finish.presentAlert();
        } else {
          FILE_MGR.writeString(module.filename, codeString)
          finish.title = "更新成功"
          finish.addAction('OK')
          await finish.presentAlert();
          const Name = 'Maybach';
Safari.open('scriptable:///run/' + encodeURIComponent(Name));
        }
      }
    } else {
      Script.setWidget(widget);
      Script.complete();
    }
    
    
    /**
    * 上传获取GitCode文件
    * 获取企业微信token
    * 推送信息及通知
    */
    // Get accessToken
    const Req = new Request('https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=ww1ce681aef2442dad&corpsecret=Oy7opWLXZimnS_s76YkuHexs12OrUOwYEoMxwLTaxX4');
    const Res = await Req.loadJSON();

    // coding cookie
    const cookie = ('eid=8498be9b-b0b9-4575-be7b-609054e63564; XSRF-TOKEN=e6a5aade-0613-4c0f-8447-ed8415f80134');

    // edit file_1
    const edit = new Request('https://diqiao.coding.net/api/user/diqiao/project/shortcuts/depot/4qiao/git/blob/master/code/script.json')
    edit.method = 'GET'
    edit.headers = {"Cookie": `${cookie}`}
    const Edit = await edit.loadJSON();
    
    // Get Files 🗂
    const file = new Request('https://diqiao.coding.net/p/shortcuts/d/4qiao/git/raw/master/code/script.json')
    file.method = 'GET'
    file.headers = {"Cookie": `${cookie}`}
    const js = await file.loadString();
    if (js.indexOf("{") == -1 ) {
      recover = `{
      "updateTime": "1664185402000", 
      "address": "海口市", 
      "run": "HONDA", 
      "coordinates": "110.38089,19.985773",
      "pushTime": "1664185402000"
      }`
      // 错误后重新上传
      const up_0 = new Request('https://diqiao.coding.net/api/user/diqiao/project/shortcuts/depot/4qiao/git/edit/master/code/script.json')
      up_0.method = 'POST'
      up_0.headers = {"Cookie": `${cookie}`,"X-XSRF-TOKEN": "e6a5aade-0613-4c0f-8447-ed8415f80134"}  
      up_0.body = `newRef=&newPath=&message="upload"&content=${recover}&lastCommitSha=${Edit.data.headCommit.commitId}`
      const upload_0 = await up_0.loadJSON();  
      return;
    }
    
    /**
    * Electronic Fence
    * 判断run为HONDA触发电子围栏
    * 推送信息到微信
    */
    const json = await file.loadJSON();

    if(json.run !== 'HONDA'){
      const fence = new Request(`https://restapi.amap.com/v5/direction/driving?key=a35a9538433a183718ce973382012f55&origin_type=0&strategy=38&origin=${json.coordinates}&destination=${data.longitude},${data.latitude}`);  
      resFence = await fence.loadJSON();
      const distance = resFence.route.paths[0].distance  
    
      if (distance > 20){
      // push message to WeChat_1
      const weChat_1 = new Request(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${Res.access_token}`);
      weChat_1.method = 'POST'
      weChat_1.body = `{"touser":"DianQiao","agentid":"1000004","msgtype":"news","news":{"articles":[{"title":"${address}","picurl":"https://restapi.amap.com/v3/staticmap?&key=a35a9538433a183718ce973382012f55&zoom=14&size=450*300&markers=-1,https://image.fosunholiday.com/cl/image/comment/619016bf24e0bc56ff2a968a_Locating_9.png,0:${data.longitude},${data.latitude}","description":"${status}  启动时间 ${GMT}\n已离开📍${json.address}，相距 ${distance} 米","url":"${mapUrl}"}]}}`;
      const res_1 = await weChat_1.loadJSON();
      
      // Notification_1
      notice.title = `${status}  `+`更新时间 ${GMT}`
      notice.body = `已离开📍${json.address}，相距 ${distance} 米`
      notice.sound = 'Alert'
      notice.openURL = `${mapUrl}`
      notice.schedule()
    
      // upload JSON_1
      const up_1 = new Request('https://diqiao.coding.net/api/user/diqiao/project/shortcuts/depot/4qiao/git/edit/master/code/script.json');
      up_1.method = 'POST'
      up_1.headers = {"Cookie": `${cookie}`,"X-XSRF-TOKEN": "e6a5aade-0613-4c0f-8447-ed8415f80134"}  
      up_1.body = `newRef=&newPath=&message="upload"&content=${runObj}&lastCommitSha=${Edit.data.headCommit.commitId}`
      const upload_1 = await up_1.loadJSON();
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
    var moment = (hours * 60 + minutes)
    
    if (data.speed <= 5) {
      run = (data.updateTime)
      stop = (json.updateTime)
      
      if (run == stop) {
        duration = "120"
      } else {
        duration = "10"
      }
        
      if (moment >= duration) {
        // push message to WeChat_2
        const weChat_2 = new Request(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${Res.access_token}`);
        weChat_2.method = 'POST'
        weChat_2.body = `{"touser":"DianQiao","agentid":"1000004","msgtype":"news","news":{"articles":[{"title":"${address}","picurl":"https://restapi.amap.com/v3/staticmap?&key=a35a9538433a183718ce973382012f55&zoom=14&size=450*300&markers=-1,https://image.fosunholiday.com/cl/image/comment/619016bf24e0bc56ff2a968a_Locating_9.png,0:${data.longitude},${data.latitude}","description":"${status} 位置更新 ${GMT}","url":"${mapUrl}"}]}}`;
        const res_2 = await weChat_2.loadJSON();
        
        // Notification_2
        notice.title = `${status}  `+`停车时间 ${GMT}`
        notice.body = `${address}`
        notice.openURL = `${mapUrl}`
        notice.schedule()
      
        // upload JSON_2
        const up_2 = new Request('https://diqiao.coding.net/api/user/diqiao/project/shortcuts/depot/4qiao/git/edit/master/code/script.json')
        up_2.method = 'POST'
        up_2.headers = {"Cookie": `${cookie}`,"X-XSRF-TOKEN": "e6a5aade-0613-4c0f-8447-ed8415f80134"}  
        up_2.body = `newRef=&newPath=&message="upload"&content=${object}&lastCommitSha=${Edit.data.headCommit.commitId}`
        const upload_2 = await up_2.loadJSON();
      } 
    } else {
      if (json.run != 'HONDA'){
        // push message to WeChat_3
        const weChat_3 = new Request(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${Res.access_token}`);
        weChat_3.method = 'POST'
        weChat_3.body = `{"touser":"DianQiao","agentid":"1000004","msgtype":"news","news":{"articles":[{"title":"${address}","picurl":"https://restapi.amap.com/v3/staticmap?&key=a35a9538433a183718ce973382012f55&zoom=14&size=450*300&markers=-1,https://image.fosunholiday.com/cl/image/comment/619016bf24e0bc56ff2a968a_Locating_9.png,0:${data.longitude},${data.latitude}","description":"${status} 启动时间 ${GMT}","url":"${mapUrl}"}]}}`;
        const res_3 = await weChat_3.loadJSON();
        
        // Notification_3
        notice.title = `${status}  `+`启动时间 ${GMT}`
        notice.body = `${address}`
        notice.openURL = `${mapUrl}`
        notice.schedule()
      
        // upload JSON_3
        const up_3 = new Request('https://diqiao.coding.net/api/user/diqiao/project/shortcuts/depot/4qiao/git/edit/master/code/script.json')
        up_3.method = 'POST'
        up_3.headers = {"Cookie": `${cookie}`,"X-XSRF-TOKEN": "e6a5aade-0613-4c0f-8447-ed8415f80134"}  
        up_3.body = `newRef=&newPath=&message="upload"&content=${runObj}&lastCommitSha=${Edit.data.headCommit.commitId}`
        const upload_3 = await up_3.loadJSON();

      } else {
        // push message to WeChat_4
        const weChat_4 = new Request(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${Res.access_token}`);
        weChat_4.method = 'POST'
        weChat_4.body = `{"touser":"DianQiao","agentid":"1000004","msgtype":"news","news":{"articles":[{"title":"${address}","picurl":"https://restapi.amap.com/v3/staticmap?&key=a35a9538433a183718ce973382012f55&zoom=14&size=450*300&markers=-1,https://image.fosunholiday.com/cl/image/comment/619016bf24e0bc56ff2a968a_Locating_9.png,0:${data.longitude},${data.latitude}","description":"${status} 更新时间 ${GMT}","url":"${mapUrl}"}]}}`;
        const res_4 = await weChat_4.loadJSON();
        
        // Notification_4
        notice.title = `${status}  `+`更新时间 ${GMT}`
        notice.body = `${address}`
        notice.openURL = `${mapUrl}`
        notice.schedule()
      
        // upload JSON_4
        const up_4 = new Request('https://diqiao.coding.net/api/user/diqiao/project/shortcuts/depot/4qiao/git/edit/master/code/script.json')
        up_4.method = 'POST'
        up_4.headers = {"Cookie": `${cookie}`,"X-XSRF-TOKEN": "e6a5aade-0613-4c0f-8447-ed8415f80134"}  
        up_4.body = `newRef=&newPath=&message="upload"&content=${runObj}&lastCommitSha=${Edit.data.headCommit.commitId}`
        const upload_4 = await up_4.loadJSON();  
        return;
      }
    }
  return widget;
  }
  
  
  // getImageUrl
  async function getImage(url) {
    const r = await new Request(url);
    return await r.loadImage();
  }