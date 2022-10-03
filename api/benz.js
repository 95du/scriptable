const notice = new Notification()
const widget = await createWidget();

  async function createWidget() {
    const widget = new ListWidget();
    const imgUrl = new Request('https://gitcode.net/4qiao/shortcuts/raw/master/api/update/Scriptable.json');
    const resUrl = await imgUrl.loadJSON();
    const item = resUrl.mercedes[Math.floor(Math.random()*resUrl.mercedes.length)];
    const bg = await getImage(item);
    widget.backgroundImage = await shadowImage(bg);
    return widget;
  }

  async function getImage(url) {
    const r = await new Request(url);
    return await r.loadImage();
  }
  
  async function shadowImage(img) {
    const ctx = new DrawContext();
    ctx.size = img.size;
    ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']));  
    const res = await ctx.getImage();
    return res;  
  }
  
    //Data Request
    const req = new Request('http://ts.amap.com/ws/tservice/location/getLast?in=KQg8sUmvHrGwu0pKBNTpm771R2H0JQ%2FOGXKBlkZU2BGhuA1pzHHFrOaNuhDzCrQgzcY558tHvcDx%2BJTJL1YGUgE04I1R4mrv6h77NxyjhA433hFM5OvkS%2FUQSlrnwN5pfgKnFF%2FLKN1lZwOXIIN7CkCmdVD26fh%2Fs1crIx%2BJZUuI6dPYfkutl1Z5zqSzXQqwjFw03j3aRumh7ZaqDYd9fXcT98gi034XCXQJyxrHpE%2BPPlErnfiKxd36lLHKMJ7FtP7WL%2FOHOKE%2F3YNN0V9EEd%2Fj3BSYacBTdShJ4Y0pEtUf2qTpdsIWn%2F7Ls1llHCsoBB24PQ%3D%3D&ent=2&keyt=4');
    req.method = 'GET'
    req.headers = {"Cookie": "sessionid=ggylbvv5klxzm6ahibpfng4ldna2cxsy"}
    const res = await req.loadJSON();

    if (res.code != 1) {
      return;//Token expiration
    }
    
    const data = res.data
    const REQ = new Request(`http://restapi.amap.com/v3/geocode/regeo?key=9d6a1f278fdce6dd8873cd6f65cae2e0&s=rsv3&radius=300&extensions=all&location=${data.longitude},${data.latitude}`);  
    const RES = await REQ.loadJSON();
    const address = RES.regeocode.formatted_address
  
    //Current timestamp
    const timestamp = Date.parse(new Date());
    
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
    const m = (date.getMinutes() < 10 ? '0'+(date.getMinutes()) : date.getMinutes()) + ':';
    const s = (date.getSeconds() < 10 ? '0'+(date.getSeconds()) : date.getSeconds());
    const GMT = (Y+M+D+h+m+s);
        
    //speed
    if (data.speed <= 5) {
      status = "车辆静止 ";
      mapUrl = `https://maps.apple.com/?q=HONDA&ll=${data.latitude},${data.longitude}&t=m`;
    } else {
      status = `车速 ${data.speed} km/h `;
      mapUrl = `https://maps.apple.com/?q=HONDA&ll=${data.latitude},${data.longitude}&t=m`;
    }
    
    //show message
    //第一行
    const iconStack = widget.addStack();  
    iconStack.setPadding(2, 0, 2, 0);
    if (data.speed <= 5) {
      const SFsymbol = ['paperplane.circle','location.circle','lock.circle']
      const SF = SFsymbol[Math.floor(Math.random()*SFsymbol.length)];
      symbol = {"sf": `${SF}`};
    } else {
      symbol = {"sf": "checkmark.shield.fill"};
    }
    const iconSymbol = SFSymbol.named(symbol.sf);
    const naviIcon = iconStack.addImage(iconSymbol.image);
    naviIcon.imageSize = new Size(18, 18);
    if (data.speed <= 5) {
      naviIcon.tintColor = Color.red();
    } else {
      naviIcon.tintColor = Color.green();
    }
    iconStack.addSpacer(8);
    
    const addressText = iconStack.addText(`${RES.regeocode.pois[0].address}` + `${RES.regeocode.pois[0].name}`);
    if (data.speed <= 5) {
      addressText.textColor = Color.purple();
    } else {
      addressText.textColor = Color.blue();
    }
    addressText.font = Font.boldSystemFont(14);
    addressText.leftAlignText();
    
    
    //第二行
    const iconStack2 = widget.addStack();
    iconStack2.setPadding(2, 0, 2, 0);
    const iconSymbol2 = SFSymbol.named('car.circle');
    const carIcon = iconStack2.addImage(iconSymbol2.image);
    carIcon.imageSize = new Size(18, 18);
    if (data.speed <= 5) {
      carIcon.tintColor = Color.orange();
    } else {
      carIcon.tintColor = Color.green();
    }
    iconStack2.addSpacer(8);
    
    const statusText = iconStack2.addText(`${status}`);
    if (data.speed <= 5) {
      statusText.textColor = Color.blue();
    } else {
      statusText.textColor = Color.green();
    }
    statusText.font = Font.boldSystemFont(14);
    
    //计算时长
    const parkingTime = (timestamp - data.updateTime);
    const days = Math.floor(parkingTime/(24*3600*1000));
    const P1 = parkingTime % (24 * 3600 * 1000);
    const hours1 = Math.floor(P1 / (3600 * 1000));
    const P2 = P1 % (3600 * 1000);
    const minutes1 = Math.floor(P2 / (60 * 1000));

    if (days === 0) {
      var durationText = iconStack2.addText(` ${hours1}小时` + `${minutes1}分`);
    } else {
      var durationText = iconStack2.addText(` ${days}天` + `${hours1}小时` + `${minutes1}分`);
    }
    durationText.textColor = Color.blue();
    durationText.font = Font.boldSystemFont(14);
    durationText.leftAlignText();
    widget.addSpacer(103);
    
    //jump run widget
    widget.url = 'scriptable:///run/Honda%20Civic';
    //jump show map
    naviIcon.url = `${mapUrl}`;

    if (!config.runsInWidget) {
      await widget.presentMedium();  
    } else {
      Script.setWidget(widget);  
      Script.complete();  
    }


    //Get accessToken
    const Req = new Request('https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=ww1ce681aef2442dad&corpsecret=Oy7opWLXZimnS_s76YkuHexs12OrUOwYEoMxwLTaxX4');
    const Res = await Req.loadJSON();

    //coding cookie
    const cookie = ('eid=8498be9b-b0b9-4575-be7b-609054e63564; XSRF-TOKEN=e6a5aade-0613-4c0f-8447-ed8415f80134');

    //Get Files 🗂
    const file = new Request('https://diqiao.coding.net/p/shortcuts/d/4qiao/git/raw/master/code/script.json')
    file.method = 'GET'
    file.headers = {"Cookie": `${cookie}`}
    const json = await file.loadJSON();  
    
    //edit file_1
    const edit = new Request('https://diqiao.coding.net/api/user/diqiao/project/shortcuts/depot/4qiao/git/blob/master/code/script.json')
    edit.method = 'GET'
    edit.headers = {"Cookie": `${cookie}`}
    const Edit = await edit.loadJSON();
    
    /**
    *Electronic Fence
    *判断run没有值触发电子围栏
    *推送信息到微信
    */
    if(json.run !== 'HONDA'){
      const fence = new Request(`https://restapi.amap.com/v5/direction/driving?key=a35a9538433a183718ce973382012f55&origin_type=0&strategy=38&origin=${json.coordinates}&destination=${data.longitude},${data.latitude}`);  
      resFence = await fence.loadJSON();
      const distance = resFence.route.paths[0].distance  
    
      if (distance > 20){
      //push message to WeChat_1
      const weChat_1 = new Request(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${Res.access_token}`);
      weChat_1.method = 'POST'
      weChat_1.body = `{"touser":"DianQiao","agentid":"1000004","msgtype":"news","news":{"articles":[{"title":"${address}","picurl":"https://restapi.amap.com/v3/staticmap?&key=a35a9538433a183718ce973382012f55&zoom=14&size=450*300&markers=-1,https://image.fosunholiday.com/cl/image/comment/619016bf24e0bc56ff2a968a_Locating_9.png,0:${data.longitude},${data.latitude}","description":"${status}  已離開📍${json.address}（ 相距 ${distance} 米 ）\n更新時間 ${GMT}","url":"${mapUrl}"}]}}`;
      const res_1 = await weChat_1.loadJSON();
      
      //Notification_1
      notice.title = `${status}  `+`更新時間 ${GMT}`
      notice.body = `已離開📍${json.address}（ 相距 ${distance} 米 ）`
      notice.sound = 'Alert'
      notice.openURL = `${mapUrl}`
      notice.schedule()
    
      //upload JSON_1
      const up_1 = new Request('https://diqiao.coding.net/api/user/diqiao/project/shortcuts/depot/4qiao/git/edit/master/code/script.json');
      up_1.method = 'POST'
      up_1.headers = {"Cookie": `${cookie}`,"X-XSRF-TOKEN": "e6a5aade-0613-4c0f-8447-ed8415f80134"}  
      up_1.body = `newRef=&newPath=&message="upload"&content=${runObj}&lastCommitSha=${Edit.data.headCommit.commitId}`
      const upload_1 = await up_1.loadJSON();
      return;//pushEnd_1
      }
    }
      
      
    /**
    *车辆状态触发条件
    *驻车时长，行驶中，静止状态
    *推送信息到微信
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
      var run = (data.updateTime)
      var stop = (json.updateTime)
      if (run == stop) {
        duration = "120"
      } else {
        duration = "10"
      }
        
      if (moment >= duration) {
      //push message to WeChat_2
      const weChat_2 = new Request(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${Res.access_token}`);
      weChat_2.method = 'POST'
      weChat_2.body = `{"touser":"DianQiao","agentid":"1000004","msgtype":"news","news":{"articles":[{"title":"${address}","picurl":"https://restapi.amap.com/v3/staticmap?&key=a35a9538433a183718ce973382012f55&zoom=14&size=450*300&markers=-1,https://image.fosunholiday.com/cl/image/comment/619016bf24e0bc56ff2a968a_Locating_9.png,0:${data.longitude},${data.latitude}","description":"${status}，驻车时间 ${GMT}","url":"${mapUrl}"}]}}`;
      const res_2 = await weChat_2.loadJSON();
      
      //Notification_2
      notice.title = `${status}  `+`驻车时间 ${GMT}`
      notice.body = `${address}`
      notice.openURL = `${mapUrl}`
      notice.schedule()
    
      //upload JSON_2
      const up_2 = new Request('https://diqiao.coding.net/api/user/diqiao/project/shortcuts/depot/4qiao/git/edit/master/code/script.json')
      up_2.method = 'POST'
      up_2.headers = {"Cookie": `${cookie}`,"X-XSRF-TOKEN": "e6a5aade-0613-4c0f-8447-ed8415f80134"}  
      up_2.body = `newRef=&newPath=&message="upload"&content=${object}&lastCommitSha=${Edit.data.headCommit.commitId}`
      const upload_2 = await up_2.loadJSON();
      } 
    } else {
      if (json.run != 'HONDA'){
      //push message to WeChat_3
      const weChat_3 = new Request(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${Res.access_token}`);
      weChat_3.method = 'POST'
      weChat_3.body = `{"touser":"DianQiao","agentid":"1000004","msgtype":"news","news":{"articles":[{"title":"${address}","picurl":"https://restapi.amap.com/v3/staticmap?&key=a35a9538433a183718ce973382012f55&zoom=14&size=450*300&markers=-1,https://image.fosunholiday.com/cl/image/comment/619016bf24e0bc56ff2a968a_Locating_9.png,0:${data.longitude},${data.latitude}","description":"${status}，启动时间 ${GMT}","url":"${mapUrl}"}]}}`;
      const res_3 = await weChat_3.loadJSON();
      
      //Notification_3
      notice.title = `${status}  `+`启动时间 ${GMT}`
      notice.body = `${address}`
      notice.openURL = `${mapUrl}`
      notice.schedule()
    
      //upload JSON_3
      const up_3 = new Request('https://diqiao.coding.net/api/user/diqiao/project/shortcuts/depot/4qiao/git/edit/master/code/script.json')
      up_3.method = 'POST'
      up_3.headers = {"Cookie": `${cookie}`,"X-XSRF-TOKEN": "e6a5aade-0613-4c0f-8447-ed8415f80134"}  
      up_3.body = `newRef=&newPath=&message="upload"&content=${runObj}&lastCommitSha=${Edit.data.headCommit.commitId}`
      const upload_3 = await up_3.loadJSON();

      } else {
        //push message to WeChat_4
        const weChat_4 = new Request(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${Res.access_token}`);
        weChat_4.method = 'POST'
        weChat_4.body = `{"touser":"DianQiao","agentid":"1000004","msgtype":"news","news":{"articles":[{"title":"${address}","picurl":"https://restapi.amap.com/v3/staticmap?&key=a35a9538433a183718ce973382012f55&zoom=14&size=450*300&markers=-1,https://image.fosunholiday.com/cl/image/comment/619016bf24e0bc56ff2a968a_Locating_9.png,0:${data.longitude},${data.latitude}","description":"${status}，更新时间 ${GMT}","url":"${mapUrl}"}]}}`;
        const res_4 = await weChat_4.loadJSON();
        
        //Notification_4
        notice.title = `${status}  `+`更新时间 ${GMT}`
        notice.body = `${address}`
        notice.openURL = `${mapUrl}`
        notice.schedule()
      
        //upload JSON_4
        const up_4 = new Request('https://diqiao.coding.net/api/user/diqiao/project/shortcuts/depot/4qiao/git/edit/master/code/script.json')
        up_4.method = 'POST'
        up_4.headers = {"Cookie": `${cookie}`,"X-XSRF-TOKEN": "e6a5aade-0613-4c0f-8447-ed8415f80134"}  
        up_4.body = `newRef=&newPath=&message="upload"&content=${runObj}&lastCommitSha=${Edit.data.headCommit.commitId}`
        const upload_4 = await up_4.loadJSON();  
        return;
      }
    }
console.log(moment)
