// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: podcast;
/**
脚本名称：中国电信 Cookie
更新时间：2022-11-11
小组件作者：95度茅台
获取Token作者: @FoKit
Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy

使用方法：配置重写规则，手动运行小组件，按提示跳转到天翼账号中心网页版，登录即可自动抓取/更新 Cookie
使用前，请确保您的代理APP已配置好BoxJs重写，BoxJs配置方法：https://chavyleung.gitbook.io/boxjs

登录入口：http://u3v.cn/5uwtIP
=========Quantumult-X=========
重写订阅（QX）：https://raw.githubusercontent.com/FoKit/Scripts/main/rewrite/get_10000_cookie.conf
=========== Surge ===========
重写订阅（Surge）：https://raw.githubusercontent.com/FoKit/Scripts/main/rewrite/get_10000_cookie.sgmodule
==============================
BoxJs 主页: http://boxjs.com/
BoxJs 订阅：https://raw.githubusercontent.com/FoKit/Scripts/main/boxjs/fokit.boxjs.json
*/

// 网页登录后免Cookie 11-14 ‼️

const notice = new Notification()
const widget = new ListWidget()
widget.setPadding(0, 0, -6, 0)

const bgColor1 = Color.dynamic(
  new Color('#EEEEEE'), 
  new Color('#151515')
);
const bgColor2 = Color.dynamic(
  new Color('#FFFFFF'), 
  new Color('#13233F')
);
const logoColor = Color.dynamic(
  new Color('#004A8B'), 
  new Color('#1da0f2')
);
const textColor = Color.dynamic(
  new Color('#484848'), 
  new Color('#E0E0E0')
);
const barColor = Color.dynamic(
  new Color('#CFCFCF'), 
  new Color('#7A7A7A')
);
const progressColor = Color.dynamic(
  new Color('#34C759'),
  new Color('#00b100')
);

const gradient = new LinearGradient()
  gradient.locations = [0, 1]
  gradient.colors = [
    bgColor1,
    bgColor2
  ]
  widget.backgroundGradient = gradient


const apiData = new Request('https://gitcode.net/4qiao/shortcuts/raw/master/api/update/telecom.json')
const get = await apiData.loadJSON();


const F_MGR = FileManager.iCloud();
const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), "telecom");
const cacheFile = F_MGR.joinPath(folder, 'data.json');

if (F_MGR.fileExists(cacheFile)) {
  data = F_MGR.readString(cacheFile);
  data = JSON.parse(data);
  cookie = data.cookie.split(';')[0]
  loginUrl = data.loginUrl
}


if (!F_MGR.fileExists(folder) || cookie === undefined) {
  // boxjs_data
  boxjs_request = new Request(get.getCookie);
  boxjs_data = await boxjs_request.loadJSON();
  cookie = boxjs_data.val
  
  loginUrl_request = new Request(get.getLoginUrl);
  login_data = await loginUrl_request.loadJSON();
  loginUrl = login_data.val
  if (cookie) {
    if (!F_MGR.fileExists(folder)) {F_MGR.createDirectory(folder)}
      data = {"cookie": `${cookie}`,"loginUrl": `${loginUrl}`}
      data = JSON.stringify(data);
      F_MGR.writeString(cacheFile, data);
  }
}


if (!F_MGR.fileExists(cacheFile)) {
  if (!cookie) {
    let loginAlert = new Alert();
    loginAlert.title = '中国电信';
    loginAlert.message = `\r\n注 : 自动获取天翼账号中心Cookie需要Quantumult-X / Surge 辅助运行\n\n具体方法请查看小组件代码开头注释\n\r\n小组件作者: 95度茅台\n获取Cookie作者: @FoKit`;
    loginAlert.addAction('获取Cookie');
    loginAlert.addCancelAction('取消');
    loginAction = await loginAlert.presentAlert();
    if (loginAction === -1) {
      return;
    } else {
      const webView = new WebView();
      await webView.loadURL(get.loginPortal);
      await webView.present(true);
      return;
    }
  }
}


// Automatic Login
const login = new Request(loginUrl);
login.method = 'GET'
login.headers = {"Cookie": `${cookie}`,"Referer": `${get.referer}`}
const sign = await login.loadString()
const strLogin = sign.replaceAll('callbackMsg(','');
const json = JSON.parse(
  strLogin.replace(/\S{1}$/, '')
);


// Presents the main menu
async function presentMenu() {
  let alert = new Alert();
  alert.title = "中国电信余量"
  alert.message = get.Ver
  alert.addDestructiveAction('更新代码');
  alert.addAction('GetCookie');
  alert.addAction('预览组件');
  alert.addAction('退出');
  response = await alert.presentAlert();
  // menu action 1
  if (response === 1) {
    if (json.result === 0) {
      const webView = new WebView();
      await webView.loadURL(json.toUrl);
      await webView.present(false);
    } else {
      notice.title = '登录失败 ⚠️'
      notice.body = json.msg
      notice.sound = 'alert'
      notice.schedule();
      return;
    }
  }
  if (response === 2) {
    await widget.presentSmall();
  }
  if (response === 3) return;
  if (response === 0) {
    const FILE_MGR = FileManager.local();
    const iCloudInUse = FILE_MGR.isFileStoredIniCloud(module.filename);
    const reqUpdate = new Request(get.update);
    const codeString = await reqUpdate.loadString();
    const finish = new Alert();
    if (codeString.indexOf("中国电信") == -1) {
      finish.title = "更新失败"
      finish.addAction('OK');
      await finish.presentAlert();
    } else {
      FILE_MGR.writeString(module.filename, codeString);
      finish.title = "更新成功"
      finish.addAction('OK');
      await finish.presentAlert();
      const Name = 'telecom'
      Safari.open('scriptable:///run/' + encodeURIComponent(Name));
    }
  }
}


// Telecom Logo
const logo = new Request(get.TelecomLogo);
const image = await logo.loadImage();
const widgetImage = 
widget.addImage(image);
widgetImage.imageSize = new Size(130,35);
widgetImage.centerAlignImage();
widgetImage.tintColor = logoColor


const balances = new Request(get.balance);
balances.method = 'GET'
//balances.headers = {"Cookie": `${cookie}`}
const money = await balances.loadJSON();
const balanceAvailable = money.totalBalanceAvailable / 100
const balText = widget.addText('￥' + balanceAvailable);
balText.textColor = Color.orange();
balText.font = new Font("Georgia-Bold", 22)
balText.centerAlignText();
widget.addSpacer(3)


const req = new Request(get.surplus);
req.method = 'POST'
//req.headers = {"Cookie": `${cookie}`}
const res = await req.loadJSON();
const voiceAmount = res.voiceAmount
const voiceUsage = res.voiceUsage
const voiceBalance = res.voiceBalance
const voice = String(voiceBalance / voiceAmount * 100).substring(0, 2);

const total = res.total / 1024000
const used = res.used / 1024000
const bal = res.balance / 1024000
const balance = String(bal).substring(0, 5);
const flow = String(bal / total * 100).substring(0, 2);


// Progress bar
const width = 135
const h = 10

getwidget(voiceAmount, voiceBalance, `剩余语音 ${voiceBalance} 分钟`);
getwidget(total, bal, `剩余流量 ${balance} GB`);

function getwidget(total, haveGone, str) {
  const titlew = widget.addText(str);
  titlew.centerAlignText();
  titlew.textColor = textColor
  titlew.font = Font.boldSystemFont(13);
  widget.addSpacer(3)
  
  const imgw = widget.addImage(creatProgress(total,haveGone));
  imgw.centerAlignImage();
  imgw.cornerRadius = 5.2
  imgw.imageSize = new Size(width, h)
  widget.addSpacer(5)
}


function creatProgress(total,havegone){
  const context = new DrawContext();
  context.size = new Size(width, h);
  context.opaque = false
  context.respectScreenScale = true
  context.setFillColor(barColor);
  
  const path = new Path();
  path.addRoundedRect(new Rect(0, 0, width, h), 3, 2);
  context.addPath(path);
  context.fillPath();
  context.setFillColor(progressColor)
  
  const path1 = new Path();
  path1.addRoundedRect(new Rect(0, 0, width*havegone/total, h), 3, 0);
  context.addPath(path1);
  context.fillPath();
  return context.getImage();
}

if (config.runsInWidget) {
  Script.setWidget(widget);
  Script.complete();
} else {
  await presentMenu();
}