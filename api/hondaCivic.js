const notice = new Notification()
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
  
  //刷新widget（间隔5分钟）,官方服务有请求次数限制（50次/h）,根据个人喜好修改最后一位数字（改成几就是间隔几分钟刷新）
  const interval = 1000 * 60 * 60;
   widget.refreshAfterDate = new Date(Date.now() + interval);
  
  
//coding cookie
const cookie = ('code=artifact-reforge%3Dfalse%2Casync-blocked%3Dtrue%2Cauth-by-wechat%3Dtrue%2Cci-qci%3Dfalse%2Cci-team-step%3Dfalse%2Cci-team-templates%3Dfalse%2Ccoding-flow%3Dfalse%2Ccoding-ocd-java%3Dfalse%2Ccoding-ocd-pages%3Dtrue%2Centerprise-permission-management%3Dtrue%2Cmobile-layout-test%3Dfalse%2Cproject-permission-management%3Dtrue%2Cservice-exception-tips%3Dfalse%2Ctencent-cloud-object-storage%3Dtrue%2C5b585a51; _ga=GA1.2.1553488068.1664098682; _gid=GA1.2.292291750.1664098682; enterprise_domain=diqiao; eid=8498be9b-b0b9-4575-be7b-609054e63564; c=auth-by-wechat%3Dtrue%2Cproject-permission-management%3Dtrue%2Centerprise-permission-management%3Dtrue%2C5c58505d; exp=89cd78c2; ac=9543735c-c43a-4a9a-8962-fdd4eaaadeba; login=4c0b000d-e6d1-4eee-b323-21ddaec6c513; XSRF-TOKEN=e6a5aade-0613-4c0f-8447-ed8415f80134')

    //Get Files 🗂
    const file = new Request('https://diqiao.coding.net/p/shortcuts/d/4qiao/git/raw/master/code/script.json')
    file.method = 'GET'
    file.headers = {"Cookie": `${cookie}`}
    const File = await file.loadJSON();

  
    //Data Request
    const req = new Request('http://ts.amap.com/ws/tservice/location/getLast?in=KQg8sUmvHrGwu0pKBNTpm771R2H0JQ%2FOGXKBlkZU2BGhuA1pzHHFrOaNuhDzCrQgzcY558tHvcDx%2BJTJL1YGUgE04I1R4mrv6h77NxyjhA433hFM5OvkS%2FUQSlrnwN5pfgKnFF%2FLKN1lZwOXIIN7CkCmdVD26fh%2Fs1crIx%2BJZUuI6dPYfkutl1Z5zqSzXQqwjFw03j3aRumh7ZaqDYd9fXcT98gi034XCXQJyxrHpE%2BPPlErnfiKxd36lLHKMJ7FtP7WL%2FOHOKE%2F3YNN0V9EEd%2Fj3BSYacBTdShJ4Y0pEtUf2qTpdsIWn%2F7Ls1llHCsoBB24PQ%3D%3D&ent=2&keyt=4')
    req.method = 'GET'
    req.headers = {"Cookie": "sessionid=ggylbvv5klxzm6ahibpfng4ldna2cxsy"}
    const res = await req.loadJSON();

    if (res.code != 1) {
      return;
    }
    
    const data = res.data
    const REQ = new Request(`http://restapi.amap.com/v3/geocode/regeo?key=9d6a1f278fdce6dd8873cd6f65cae2e0&s=rsv3&location=${data.longitude},${data.latitude}`);  
    const RES = await REQ.loadJSON();
    const address = RES.regeocode.formatted_address
  
    //Current Time
    const timestamp = Date.parse(new Date());

    runObj = `{
    "updateTime": "${data.updateTime}", 
    "address": "${address}", 
    "run": "${data.owner}", 
    "time": "${timestamp}"
    }`
    
    object = `{
    "updateTime": "${data.updateTime}",        
    "address": "${address}", 
    "coordinates": "${data.longitude},${data.latitude}",
    "time": "${timestamp}"
    }`
    
    // Timestamp
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
    
    
    //icon
    const iconStack = widget.addStack();
    const iconSymbol = SFSymbol.named('paperplane.fill');
    const naviIcon = iconStack.addImage(iconSymbol.image);
 naviIcon.imageSize = new Size(18, 18);
 naviIcon.tintColor = Color.blue();  
    iconStack.addSpacer(10);
    
    const carText = iconStack.addText('Maybach 迈巴赫 680');
    carText.textColor = Color.black();
    carText.font = Font.boldSystemFont(15);  
    widget.addSpacer(113);

    //Jump Map
    naviIcon.url = `${obj.Position}`;
 iconStack.useDefaultPadding();


    //get token
    const Req = new Request('https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=ww1ce681aef2442dad&corpsecret=Oy7opWLXZimnS_s76YkuHexs12OrUOwYEoMxwLTaxX4');
    const Res = await Req.loadJSON();
      
    //Path planning
    const requ = new Request(`https://restapi.amap.com/v5/direction/driving?key=a35a9538433a183718ce973382012f55&origin_type=0&strategy=38&origin=${File.coordinates}&destination=${data.longitude},${data.latitude}`);  
    resp = await requ.loadJSON();
    const distance = resp.route.paths[0].distance  
    if (distance > 20){
     return;
    }
      
           
    //push message to WeChat
    const REq = new Request(`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${Res.access_token}`);
    REq.method = 'POST'
    REq.body = `{"touser":"DianQiao","agentid":"1000004","msgtype":"news","news":{"articles":[{"title":"${address}","picurl":"https://restapi.amap.com/v3/staticmap?&key=a35a9538433a183718ce973382012f55&zoom=14&size=450*300&markers=-1,https://image.fosunholiday.com/cl/image/comment/619016bf24e0bc56ff2a968a_Locating_9.png,0:${data.longitude},${data.latitude}","description":"[ ${obj.Status} ]  更新时间 ${GMT}","url":"${obj.Position}"}]}}`;
    const REs = await REq.loadJSON();
      
    //Notification
    notice.title = `${obj.Status}，`+`更新时间 ${GMT}`
    notice.body = `${address}`
    //notice.sound = 'alert'
    notice.openURL = `${obj.Position}`
    notice.schedule()
    
    
    
    //edit file
    const edit = new Request('https://diqiao.coding.net/api/user/diqiao/project/shortcuts/depot/4qiao/git/blob/master/code/script.json')
    edit.method = 'GET'
    edit.headers = {"Cookie": `${cookie}`}
    const Edit = await edit.loadJSON();
    
    //upload JSON
    const up = new Request('https://diqiao.coding.net/api/user/diqiao/project/shortcuts/depot/4qiao/git/edit/master/code/script.json')
    up.method = 'POST'
    up.headers = {"Cookie": `${cookie}`,"X-XSRF-TOKEN": "e6a5aade-0613-4c0f-8447-ed8415f80134"}  
    up.body = `newRef=&newPath=&message="upload"&content=${object}&lastCommitSha=${Edit.data.headCommit.commitId}`
    const upload = await up.loadJSON();
    
    
    
    if (!config.runsInWidget) {
      await widget.presentMedium();  
    }  
    Script.setWidget(widget);  
    Script.complete();
   