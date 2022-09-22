let notice = new Notification()
const add = new Alert();

  const req = new Request('#');
  const res = await req.loadString();
  const Name = '@';

  if (res.length > 300) {
    notice.sound = 'event'
    notice.schedule()
    add.title = "恭喜，安装成功 !";
    add.addAction('OK');
    await add.presentAlert();
FileManager.local().writeString(FileManager.local().documentsDirectory() + `/${Name}.js`,`${res}`);
    Safari.open('scriptable:///run/' + encodeURIComponent(Name));
  } else {
    notice.sound = 'failure'
    notice.schedule()
    add.title = "获取数据失败 !";
    add.addAction('OK');
    await add.presentAlert();
  }