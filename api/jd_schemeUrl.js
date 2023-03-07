// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: paper-plane;
/**
 * 小组件作者：95度茅台
 * Version 1.0.0
 * 2023-03-07 14:30
 * Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy

==============================
 * 获取网页链接方法: 
 1，网页版中页面的链接。
 2，App里右上角分享的链接。

 * 脚本使用方法:
 1，拷贝链接，运行脚本。
 2，脚本自动拷贝已生成的SchemeURL

==============================
 * 领京豆 https://h5.m.jd.com/rn/42yjy8na6pFsq1cx9MJQ5aTgu3kX/index.html?has_native=0
 * 种豆得豆 https://plantearth.m.jd.com/plantBean/index?source=lingjingdoushouye
 * 京豆收支明细 https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean
 * 积分加油站 https://3.cn/-1FXjNaL
 * 双签 https://member.jr.jd.com/activity/sign/v5/indexV2.html?channelLv=shuangqian&utm_term=copyurl
 * 京东农场 https://carry.m.jd.com/babelDiy/Zeus/3KSjXqQabiTuD1cJ28QskrpWoBKT/index.html?babelChannel=94
 * 签到日历 https://h5.m.jd.com/rn/3a5TGXF7Y8xpQ45CjgMzQ3tyqd4K/index.html?has_native=0/index?source=lingjingdoushouye
 * 待收货 https://trade.m.jd.com/order/orderlist_jdm.shtml?sceneval=2&jxsid=16780988595962555448&orderType=waitReceipt&ptag=7155.1.13&source=my/index?source=lingjingdoushouye
 * 京享值 https://vipgrowth.m.jd.com/#/home
 * 红包 https://wqs.jd.com/my/redpacket.shtml?sceneval=2&jxsid=16780988595962555448
 * 下月待还 https://mbt.jd.com/bill/monthlybill/monthbillcore/month-bill-index.html?channelcode=024
 * 总资产 https://channel.jr.jd.com/wealthAssets/index/?source=wdqb&channelCode=CFCCsingle01
*/

const uri = Script.name();
const F_MGR = FileManager.local();
const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), "jd_schemeUrl");
if (!F_MGR.fileExists(folder)) {
  F_MGR.createDirectory(folder);
}
const cacheFile = F_MGR.joinPath(folder, 'setting.json');
const bgPath = F_MGR.joinPath(F_MGR.documentsDirectory(), "95duBackground");
const bgImage = F_MGR.joinPath(bgPath, uri + ".jpg");

if (F_MGR.fileExists(cacheFile)) {
  data = F_MGR.readString(cacheFile)
  setting = JSON.parse(data);
}

async function presentMenu() {
  let alert = new Alert();
  alert.title = '京东 SchemeURL'
  alert.message = "\n脚本功能:\n1，运行制作生成跳转链接\n2，桌面小组件点击跳转到指定App页面\n\n获取网页链接方法:\n1，网页版中页面的链接。\n2，App里右上角分享的链接。\n\n脚本使用方法:\n1，拷贝链接，运行脚本。\n2，脚本自动拷贝已生成的SchemeURL并储存链接到iCloud(桌面小组件点击)";
  alert.addDestructiveAction('更新代码');
  alert.addDestructiveAction('重置所有');
  alert.addAction('透明背景');
  alert.addAction('生成链接');
  alert.addAction('退出菜单');
  mainMenu = await alert.presentAlert();
  if (mainMenu === 1) {
    await F_MGR.remove(folder);
    if (F_MGR.fileExists(bgImage)) {
      await F_MGR.remove(bgImage);
    }
  }
  if (mainMenu === 2) {
    await importModule(await downloadModule()).main();
  }
  if (mainMenu === 3) {
    await generateLink();
  }
  if (mainMenu === 4) return;
  if (mainMenu === 0) {
    const reqUpdate = new Request(atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvYXBpL2JvdHRvbUJhci5qcw=='));
    const codeString = await reqUpdate.loadString();
    const finish = new Alert();
    if (codeString.indexOf("95度茅台") == -1) {
      finish.title = "更新失败"
      finish.addAction('OK')
      await finish.presentAlert();
    } else {
      F_MGR.writeString(  
        module.filename,
        codeString
      );
      finish.title = "更新成功"
      finish.addAction('OK')
      await finish.presentAlert();
      Safari.open('scriptable:///run/' + encodeURIComponent(uri));
    }
  }
}

async function generateLink() {
  const openUrl = encodeURIComponent(  
    Pasteboard.paste()
  )
  if (openUrl.indexOf('jd.com') > -1 || openUrl.indexOf('3.cn') > -1) {
    const schemeUrl = `openApp.jdMobile://virtual?params=%7B%22category%22%3A%22jump%22%2C%22des%22%3A%22m%22%2C%22url%22%3A%22${openUrl}%22%7D`
    setting = {schemeUrl: schemeUrl}
    F_MGR.writeString(cacheFile, JSON.stringify(setting));
    console.log(schemeUrl);
    Pasteboard.copy(schemeUrl);
    Safari.open(schemeUrl);
  }
}

async function createWidget() {
  const widget = new ListWidget();
  widget.backgroundImage = F_MGR.readImage(bgImage);
  const image = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/openUrl.png');
  const widgetImage = widget.addImage(image);
  widgetImage.centerAlignImage();
  widget.url = setting.schemeUrl;
  return widget;
}
  
async function getImage(url) {
  const r = await new Request(url);
  return await 
  r.loadImage();
}

async function downloadModule() {
  const modulePath = F_MGR.joinPath(folder, 'image.js');
  if (F_MGR.fileExists(modulePath)) {
    return modulePath;
  } else {
    const req = new Request(atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvdmlwL21haW5UYWJsZUJhY2tncm91bmQuanM='));
    const moduleJs = await req.load().catch(() => {
      return null;
    });
    if (moduleJs) {
      F_MGR.write(modulePath, moduleJs);
      return modulePath;
    }
  }
}

if (config.runsInApp) {
  await presentMenu();
} else {
  widget = await createWidget();
  Script.setWidget(widget);
  Script.complete();
}