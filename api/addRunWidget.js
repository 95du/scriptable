let notice = new Notification()
const add = new Alert();

  const URL = '🚖';
  const req = new Request(URL);
  const res = await req.loadString();
  const Name = '@';
  const FPath = FileManager.local().documentsDirectory() + `/${Name}.js`;
  const js = `${res}`;
FileManager.local().writeString(FPath, js);


  if (FileManager.local().fileExists(FPath)) {
    add.title = "恭喜，安装成功 !";
    add.addAction('OK');
    notice.sound = 'event'
  } else {
    add.title = "抱歉，安装失败 !";
    add.addAction('退出');
    notice.sound = 'failure'
  }
    notice.schedule()
    addition = await
    add.presentAlert();
    
    if (addition === -1) {
        return;
    } else {
      await Safari.open('scriptable:///run/' + encodeURIComponent(Name));
    }