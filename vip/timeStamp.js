let alert = new Alert();

    const date1 = new Date(1664132583000);
    const date2 = new Date(1664160985000);
    const date3 = (date2- date1);
    const days = Math.floor(date3 / (24 * 3600 * 1000));
    const leave1 = date3 % (24 * 3600 * 1000);
    const hours = Math.floor(leave1 / (3600 * 1000));
    const leave2 = leave1 % (3600 * 1000);
    const minutes = Math.floor(leave2 / (60 * 1000));
    const leave3 = leave2 % (60 * 1000);
    const seconds = Math.round(leave3 / 1000);
    date = (hours + "小时 "+minutes + " 分钟" + seconds + " 秒");



    alert.title = `${date}`;
    alert.addAction('OK');
    await alert.presentAlert();