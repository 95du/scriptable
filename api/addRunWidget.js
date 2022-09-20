let notice = new Notification()
const add = new Alert();

  const URL = 'https://gitcode.net/4qiao/scriptable/raw/master/api/LandRover.js';
  const req = new Request(URL);
  const res = await req.loadString();
  const Name = '奥迪小组件';
  const FPath = FileManager.local().documentsDirectory() + `/${Name}.js`;
  const js = `${res}`;
FileManager.local().writeString(FPath, js);


  if (FileManager.local().fileExists(FPath)) {
    notice.sound = 'event'
    add.title = "恭喜，安装成功 !";
    add.addAction('OK');
  } else {
    notice.sound = 'failure'
    add.title = "抱歉，安装失败 !";
    add.addAction('退出');
  }
    notice.schedule()
    addition = await
    add.presentAlert();
    
    if (addition === -1) {
        return;
    } else {
      notice.sound = 'complete'
      notice.schedule()
      await Safari.open('scriptable:///run/' + encodeURIComponent(Name));
    }