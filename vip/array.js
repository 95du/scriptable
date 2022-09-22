let notice = new Notification()
const add = new Alert();
const alert = new Alert();

    alert.title = '自动安装小组件脚本';
    const menuList = [{
      name: 'benz',
      text: '奔驰'
    }, {
      name: 'bmw',
      text: '宝马'
    }, {
      name: 'audi',
      text: '奥迪'
    }, {
      name: 'audi',
      text: '大众'
    }];

    menuList.forEach(item => {
      alert.addAction(item.text);
    });
    
    alert.addCancelAction('取消');
    const menuId = await alert.presentSheet()
    const obj = menuList[menuId]
    if (menuId === -1) return
  
    const req = new Request(`https://gitcode.net/4qiao/scriptable/raw/master/api/${obj.name}.js`);
    const res = await req.loadString();
    const Name = '正在安装小组件...';

FileManager.local().writeString(FileManager.local().documentsDirectory() + `/${Name}.js`,`${res}`);

  if (res.length != 0) {
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
 