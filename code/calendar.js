// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: feather-alt;
const { DJG, Runing } = importModule(
  FileManager.local().joinPath(
    FileManager.local().libraryDirectory(),
    "/DJG.js"
  )
);

// @组件代码开始
class Widget extends DJG {
  constructor(arg) {
    super(arg);
    this.name = "日历Ⅱ";
    this.widget_ID = "DJG-126";
    this.version = "V1.0";
    this.imageCache = `${this.name}_image.png`;
    this.bgUrl = "https://s1.ax1x.com/2022/07/10/jylBlT.jpg";
    
    this.Run(module.filename, args);
  }
  
  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render () {
    let widget = this.getWidget();
    await this.getWidgetBackgroundImage(widget);
    const lightShadow = this.settings.lightShadowColor || '#fff';
    const darkShadow = this.settings.darkShadowColor || '#000';
    try{
      switch (this.widgetFamily) {
        case 'small':
         await this.renderSmall(widget);
         break;
        case 'medium':
         await this.renderMedium(widget);
         break;
        default:
         return await this.renderAlert();
      }
    }catch(e){
      this.ERROR.push({error:e.toString()});
    }
    return widget;
  }
  
  // 渲染小尺寸组件
  async renderSmall (widget) {
    let {width, height} = this.getWidgetSize('small');
    let body = widget.addStack();
    await this.setLeftStack(body, width, height);
  }
  
  // 渲染中尺寸组件
  async renderMedium (widget) {
    let {width, height} = this.getWidgetSize('medium');
    width = width-20;
    height = height-18;
    const body = widget.addStack();
    body.size = new Size(width, height);
    // 左边
    await this.setLeftStack(body, width, height);
    
    body.addSpacer(10);
    
    // 右边
    width = width-height-12;
    const rightStack = body.addStack();
    rightStack.layoutVertically();
    rightStack.size = new Size(width, height);
    let titleStack = rightStack.addStack();
    titleStack.addSpacer();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'Septemper', 'October', 'November', 'December'];
    const month = months[new Date().getMonth()];
    this.addText(titleStack, month, 16, {font:'Marion-Bold'}, false);
    titleStack.addSpacer(8);
    
    const dateStack = rightStack.addStack();
    height = height - 16;
    dateStack.size = new Size(width, height);
    
    const image = this.makeDrawing(width, height);
    this.addImage(dateStack, image, {w:width});
  }
  
  // 左边
  async setLeftStack(stack, width, height){
    const {title,date,days,lunar,des} = await this.getDateInfo();
    const fontColor = this.settings.titleColor || '#FFFFFF';
    
    const leftStack = stack.addStack();
    leftStack.size = new Size(height+2, height);
    // 背景图片
    const userImage = await this.loadImgCache(this.imageCache, this.CACHE_PATH);
    leftStack.backgroundImage = userImage || await this.getImageByUrl(this.bgUrl);
    leftStack.cornerRadius = 15;
    
    let cellStack = leftStack.addStack();
    cellStack.setPadding(15, 15, 15, 15);
    cellStack.layoutVertically();
    
    let titleStack = cellStack.addStack();
    titleStack.centerAlignContent();
    let icon = await this.getSymbol('clock.fill', fontColor);
    this.addImage(titleStack, icon, {w:14});
    titleStack.addSpacer(4);
    this.addText(titleStack, title, 14, {font:'bold', color:fontColor});
    
    cellStack.addSpacer(5);
    
    this.addText(cellStack, date, 12, {font:'bold', color:fontColor});
    cellStack.addSpacer();
    if(!!des){
      this.addText(cellStack, des, 13, {font:'boldRounded', color:'#C0A838'});
      cellStack.addSpacer(5);
    }else{
      titleStack = cellStack.addStack();
      titleStack.size = new Size(0, 28);
      titleStack.centerAlignContent();
      this.addText(titleStack, days, 28, {font:'boldRounded', color:fontColor});
      this.addText(titleStack, '天', 15, {font:'boldRounded', color:fontColor});
    }
    
    this.addText(cellStack, `农历${lunar}`, 12, {font:'bold', color:fontColor, opacity:0.8});
    leftStack.addSpacer();
    let url = this.actionUrl('Tables');
    leftStack.url = url;
  }
  
  // 绘制日期表格
  makeDrawing(width, height){
    let [year, month, day] = this.getDateStr("yyyy M dd").split(' ');
    let firstday = new Date(year,month-1,1).getDay(); // 当月第一天星期几
    let m_days = new Array(31,28+this.is_leap(year),31,30,31,30,31,31,30,31,30,31);  //每个月的天数
    let rows = Math.ceil((m_days[month-1] + firstday)/7);   //当前月天数+第一天是星期几的数值 获得表格行数
    const weeks = ['日','一','二','三','四','五','六'];
    const canvas = this.makeCanvas(width, height);
    width=width+5
    let i, k, index, dateStr, col;
    for(i = 0; i < rows; i++) {
      for(k = 0; k < 7; k++){
        col = this.widgetColor;
        index = i * 7 + k; //单元格自然序列号
        dateStr = index - firstday + 1; //计算日期
        // 绘制星期
        this.drawText(canvas, k*(width/7)-10, 7, 40, 17, weeks[k], 'system', 12, 'center');
        // 绘制日期
        const x = k*(width/7)-5; // x坐标
        const y = i*((height-23)/rows)+25; // y坐标
        if(dateStr <= 0 || dateStr > m_days[month-1]){
          dateStr = ''; //过滤无效日期（小于等于零的、大于月总天数的）
        }else if(dateStr < day){
          col = this._widgetColor(0.6);
        }else if(dateStr == day){
          col = Color.white();
          this.fillRect (canvas,x+6.8,y-3,16,16,2, Color.black())
        }
        this.drawText(canvas, x, y, 30, 15, dateStr, 'Marion-Bold', 12, 'center', col)
      }
    }
    return canvas.getImage();
  }
  
  is_leap(year) {  //判断是否为闰年
    let res;
    return (year%100==0?res=(year%400==0?1:0):res=(year%4==0?1:0));
  }
  
  // 根据重复事件计算日期;
  returnDate(date, choice, nowTime){
    if(date.getTime() >= nowTime) return date;
    let dateStr = this.getDateStr('yyyy/MM/dd 00:00:00', date);
    let year = date.getFullYear();
    if(choice == 1){
      date = dateStr.replace(/(\d{4})/, year+1);
    }else if(choice == 2){
      let month = date.getMonth()+1;
      if(month == 12){
        date = dateStr.replace(/(\d{4})/, year+1);
        date = dateStr.replace(/\/(\d{2})\//, '/01/');// 替换月份
      }else{
        date = dateStr.replace(/\/(\d{2})\//, `/${month+1}/`);// 替换月份
      }
    }else if(choice == 3){
      let m_days = [31,28+this.is_leap(year),31,30,31,30,31,31,30,31,30,31];  //每个月的天数
      let days = date.getDate()+7;
      let months = m_days[date.getMonth()];
      if(days > months){
        date = dateStr.replace(/\/(\d{2}) /, `/${days-months} `);// 替换日期
      }else{
        date = dateStr.replace(/\/(\d{2}) /, `/${days} `);// 替换日期
      }
    }
    return new Date(date);
  }
  
  // 计算时间差(天数)
  differenceInDays(startDate, endDate){
    let diff = Math.abs((endDate.getTime()+24*60*60*1000-1) - startDate.getTime());
    let days = diff/(24*60*60*1000);
    return Math.trunc(days);
  }
  
  async getDateInfo(){
    let dateInfo = {
      title: '',
      date: '',
      days: 0,
      lunar: '',
      des: ''
    }
    let now = new Date();
    let nowTime = new Date(now.toLocaleDateString()).getTime();
    let commemorationDay = this.settings.commemorationDay;
    if(commemorationDay){
      commemorationDay = new Date(commemorationDay);
    }
    let choiceBut = this.settings.choiceBut[0];
    let date;
    if(!commemorationDay || choiceBut == 0 && commemorationDay.getTime() < nowTime){
      let events = await this.getSolarTerm(1, false);
      events = events[0];
      dateInfo.title = events.solarTerm;
      if (nowTime > events.startTime.getTime()) {
        date = new Date();
      } else {
        date = events.startTime;
      }
    }else{
      dateInfo.title = this.settings.title || '纪念日';
      date = this.returnDate(commemorationDay, choiceBut, nowTime); // 处理纪念日时间
    }
    dateInfo.date = this.getDateStr("yyyy.MM.dd",date);
    let days =  this.differenceInDays(now, date);
    dateInfo.days =  days;
    let lunar = await this.getLunar(date);
    dateInfo.lunar = `${lunar.lunarMonthCn}${lunar.lunarDayCn}`;
    if(days == 1){
      dateInfo.des = '明天就到了';
    }else if(days == 0){
      dateInfo.des = '🥳 日子到了';
    };
    return dateInfo;
  }
  
  async actionTables() {
    const actions = [
        {
          title: '纪念日标题',
          onClick: async () => {
            await this.setCustomAction("纪念日标题", "", {
              title: '纪念日标题',
            })
          }
        },
        {
         title: "设置日期",
          onClick: async () => {
            const datePicker = new DatePicker();
            const promise = await datePicker.pickDate();
            let time = new Date(promise.toLocaleDateString());
            if(time){
              this.settings.commemorationDay = time;
              this.saveSettings();
              log(`${this.name}：设置日期成功！`);
            }
          }
        },
        {
          title: "重复事件",
          options: ["不重复","每年","每月","每周"],
          index: 0,
        },
        {
         title: "文字颜色",
          onClick: async () => {
            await this.setCustomAction("文字颜色", "设置合适的文字颜色可以让组件更精致\n基础设置-字体样式，可调整文字阴影\n请自行百度搜寻颜色(Hex 颜色)", {
              titleColor: '文字颜色',
            })
          }
        },
        {
         explain: '自定义左侧纪念日文字颜色'
        },
        {
         title: "更换图片",
          onClick: async () => {
            let image = await Photos.fromLibrary();
            if (image) {
              image = await this.verifyImage(image);
              this.saveImgCache(this.imageCache, image, this.CACHE_PATH);
              this.notify(this.name, '图片保存成功，组件稍后刷新！');
            }
          }
        },
        {
         explain: '自定义左侧背景图片'
        }
    ];
    const table = new UITable();
    table.showSeparators = true;
    await this.dynamicMenu(table, actions, "样式设置")
    await table.present();
  }
  
  // 添加设置信息
  Run(filename, args) {
    if (config.runsInApp) {
      this.registerAction("基础设置", this.setWidgetConfig);
      this.registerAction("样式设置", async () => {
        await this.actionTables();
      }, { name: 'repeat.circle', color: '#1E90FF' });
    }
  }
}
// @组件代码结束
await Runing(Widget); 