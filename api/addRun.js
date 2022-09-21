let notice = new Notification()
const add = new Alert();

  const req = new Request('#');
  const res = await req.loadString();
  const Name = '@';

FileManager.local().writeString(FileManager.local().documentsDirectory() + `/${Name}.js`,`${res}`);

  if (req.loadString(true)) {
    notice.sound = 'event'
    notice.schedule()
    add.title = "恭喜，安装成功 !";
    add.addAction('OK');
    await add.presentAlert();
    Safari.open('scriptable:///run/' + encodeURIComponent(Name));
  } else {
    notice.sound = 'failure'
    notice.schedule()
    add.title = "抱歉，安装失败 !";
    add.addAction('退出');
    await add.presentAlert();
  }