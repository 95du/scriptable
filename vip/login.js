let notice = new Notification()
const agreeAlert = new Alert();
const loginAlert = new Alert();


// 免责申明
    agreeAlert.title = '海信积分乐园登录';
    agreeAlert.message = `\r\n首次登录请配置账号密码获取令牌\n\r\n捷径不会收集您的个人账户信息，所有账号信息将储存在iCloud，请您妥善保管自己的账号密码\n\r\n捷径是开源、并且完全免费的\n\r\n捷径作者: 95度茅台`;

    agreeAlert.addAction('同意');
    agreeAlert.addCancelAction('取消');
    agree = await
    agreeAlert.presentAlert();
    
    if (agree === -1) {
      return;
    }
    

// 打开页面
    const webView = new WebView();
    const url = 'https://weibo.com/u/2911714970';
    await webView.loadURL(url);
    
    notice.title = '使用教程'
    notice.body = '点击左上角 Close 关闭'
    notice.sound = 'event'
    notice.openURL = 'shortcuts://run-shortcut?name=Scriptable'
    notice.schedule()
    await webView.present(true);


// 输入账号密码
    loginAlert.title = '海信积分乐园登录';
    loginAlert.message = '请输入用户登录信息';
    loginAlert.addTextField('输入账号', null);
    loginAlert.addTextField('输入密码', null);
    loginAlert.addAction('确定');
    loginAlert.addCancelAction('取消');

    const mobile = await
    loginAlert.presentAlert();
    const username = loginAlert.textFieldValue(0)
    const password = loginAlert.textFieldValue(1)
    
    if (mobile === -1) {
      return;
    }
    

// 获取响应头Cookie
    const req = new Request('https://jf.hisense.com/api/user-manage/front/user/login',);  
    req.method = 'POST';
    req.body = `mobile=${username}&password=${password}&captcha=&target=https://jf.hisense.com/&isRememberMe=1`;
    await req.loadJSON();
    
    const headers = req.response.headers;
    const content = "Content-Length";
    const length = headers[content];

    if (length === "90") {
      const cookies = req.response.cookies;
      const account = { token: '', cookie: '' };
      const cookie = [];

      cookies.forEach((item) => {
        const value = `${item.name}=${item.value}`;
        if (item.name === 'normal_user_token') {
       account.token = item.value
       cookie.push(value)
        }
      });
      
      account.cookie = cookie.join('=');
      console.log(account.cookie + "=");
      Pasteboard.copy(account.cookie);
    
      notice.title = '登录成功'
      notice.body = 'Cookie已保存到iCloud'
      notice.sound = 'complete'
      notice.schedule()
      Safari.open("shortcuts://");    
    }else{
      notice.title = '登录失败 ⚠️'
      notice.body = '账号或密码错误，无法获取Cookie'
      notice.sound = 'failure'
      notice.schedule()
    }
    
Script.complete()