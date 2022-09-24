let notice = new Notification()
const widget = await createWidget();
  
  async function createWidget() {
    const widget = new ListWidget();
    const bg = await getImage('https://gitcode.net/4qiao/shortcuts/raw/master/update/img/Maybach.png');
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
  

    // Honda Status
    const req = new Request('http://ts.amap.com/ws/tservice/location/getLast?in=KQg8sUmvHrGwu0pKBNTpm771R2H0JQ%2FOGXKBlkZU2BGhuA1pzHHFrOaNuhDzCrQgzcY558tHvcDx%2BJTJL1YGUgE04I1R4mrv6h77NxyjhA433hFM5OvkS%2FUQSlrnwN5pfgKnFF%2FLKN1lZwOXIIN7CkCmdVD26fh%2Fs1crIx%2BJZUuI6dPYfkutl1Z5zqSzXQqwjFw03j3aRumh7ZaqDYd9fXcT98gi034XCXQJyxrHpE%2BPPlErnfiKxd36lLHKMJ7FtP7WL%2FOHOKE%2F3YNN0V9EEd%2Fj3BSYacBTdShJ4Y0pEtUf2qTpdsIWn%2F7Ls1llHCsoBB24PQ%3D%3D&ent=2&keyt=4')
    req.method = 'GET'
    req.headers = {"Cookie": "sessionid=ggylbvv5klxzm6ahibpfng4ldna2cxsy"}
    const res = await req.loadJSON();

    if (res.code === 1) {
      const data = res.data
      const REQ = new Request(`http://restapi.amap.com/v3/geocode/regeo?key=9d6a1f278fdce6dd8873cd6f65cae2e0&s=rsv3&location=${data.longitude},${data.latitude}`);  
      const RES = await REQ.loadJSON();
      const address = RES.regeocode.formatted_address

      // Timestamp
      const date = new Date(data.updateTime);
      const Y = date.getFullYear() + '-';
      const M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
      const D = date.getDate() + ' ';
      const h = date.getHours() + ':';
      const m = date.getMinutes() + ':';
      const s = date.getSeconds();
      const GMT = (Y+M+D+h+m+s);
        
        //speed
        if (data.speed <= 5) {
          obj = {
            "Status": "车辆静止中",
            "Position" : `https://maps.apple.com/?q=HONDA&ll=${data.latitude},${data.longitude}&t=m`
          };
        } else {
          obj = {
            "Status": `车速 ${data.speed} km/h`,
            "Position" : `https://maps.apple.com/?q=HONDA&ll=${data.latitude},${data.longitude}&t=m`
          };
        }


      //get token
      const Req = new Request('https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=ww1ce681aef2442dad&corpsecret=Oy7opWLXZimnS_s76YkuHexs12OrUOwYEoMxwLTaxX4')
      const Res = await Req.loadJSON();
           
      //push message to WeChat
      const REq = new Request(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${Res.access_token}`);
      REq.method = 'POST'
      REq.body = `{"touser":"DianQiao","agentid":"1000004","msgtype":"news","news":{"articles":[{"title":"${address}","picurl":"https://restapi.amap.com/v3/staticmap?&key=a35a9538433a183718ce973382012f55&zoom=15&size=450*300&markers=-1,https://image.fosunholiday.com/cl/image/comment/619016bf24e0bc56ff2a968a_Locating_9.png,0:${data.longitude},${data.latitude}","description":"[ ${obj.Status} ]  更新时间 ${GMT}","url":"${obj.Position}"}]}}`;
      const REs = await REq.loadJSON();
      
      //Notification
      notice.title = `${obj.Status}，`+`更新时间 ${GMT}`
      notice.body = `${address}`
      //notice.sound = 'alert'
      notice.openURL = `${obj.Position}`
      notice.schedule()
    }
    
    
    if (!config.runsInWidget) {
      await widget.presentMedium();  
    }  
    Script.setWidget(widget);  
  Script.complete();
  