let notice = new Notification()
const add = new Alert();

const vreq = new Request('https://git.im3x.cn/im3x/xjj-v3/raw/branch/master/package.json?_=' + (+new Date));
const p = await vreq.loadJSON();

const URL = 'https://git.im3x.cn/im3x/xjj-v3/raw/branch/master/bundle.js?_=' + (+new Date);

const req = new Request(URL);
const res = await req.loadString();
const Name = '小组件';
const FPath = FileManager.local().documentsDirectory() + `/${Name}.js`;

const js = `
module.__DEBUG__ = false;
module.__VERSION__ = '${p['version']}';
${res}`;
FileManager.local().writeString(FPath, js);

  try {
    const RPath = FileManager.iCloud().documentsDirectory() + `/${Name}.js`;
    FileManager.iCloud().writeString(RPath, js);
  } catch (e) {
    console.log('pass icloud..');
  }


  if (FileManager.local().fileExists(FPath)) {
    notice.sound = 'event'
    add.title = "恭喜，安装成功 !";
  } else {
    notice.sound = 'failure'
    add.title = "抱歉，安装失败 !";
  } notice.schedule()

  add.addAction('OK');  
  await add.presentAlert();  
  notice.sound = 'complete'  
  notice.schedule()  
  await Safari.open('scriptable:///run/' + encodeURIComponent(Name));
