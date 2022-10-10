const RUNTIME_VERSION = "3.3"

class DJG {
  constructor(arg) {
    this.arg = arg;
    this.init();
    this.isNight = Device.isUsingDarkAppearance();
    this.package = 'package.json';
 this.updata_info = 'https://mp.weixin.qq.com/s/XH8MU9tPpw0rZaxw4EJ58A';
  }

  init(widgetFamily = config.widgetFamily) {
    this._actions = {};
    this._actionsIcon = {};
    // 组件大小：small,medium,large
    this.widgetFamily = widgetFamily;
    this.DJG_KEY = this.hash('DJG.js');
    this.SETTING_KEY = this.hash(Script.name());
    // 文件管理器
    this.FM = FileManager.local();
    this.MGR_DOCU = this.FM.libraryDirectory();
    // 用于模块存储
    this.MODULE_FOLDER = this.FM.joinPath(
      this.MGR_DOCU, 'module/'
    );
    // 图片管理
    this.IMAGE_FOLDER = this.FM.joinPath(
      this.MGR_DOCU, 'images/'
    );
    // 背景截图
    this.BACKGROUND = this.FM.joinPath(
      this.IMAGE_FOLDER, 'djg_background.png'
    );
    this.MGR_PATH = this.FM.joinPath(
      this.MGR_DOCU, `${this.SETTING_KEY}/`,
    );
    // 透明背景
    this.BACKGROUND_OPA_KEY = this.FM.joinPath(
      this.MGR_PATH, 'bg_opacity.png',
    );
    // 白天图
    this.BACKGROUND_KEY = this.FM.joinPath(
      this.MGR_PATH, 'bg_light.png',
    );
    // 晚上图
    this.BACKGROUND_NIGHT_KEY = this.FM.joinPath(
      this.MGR_PATH, 'bg_night.png',
    );
    // 缓存管理
    this.CACHE_DOCU = this.FM.joinPath(
      this.MGR_DOCU, 'cache/'
    );
    this.CACHE_PATH = this.FM.joinPath(
      this.CACHE_DOCU, `${this.SETTING_KEY}/`,
    );
    this.djgSettings = this.getSettings(true, false);
    this.djgSettings.button = this.djgSettings.button || [true, false, true];// 存储公共按钮状态
    this.widgetConfig();
    this.createDirectory();
    this.backGroundColor;
    this.widgetColor;
  }
  
  widgetConfig (flag = true) {
    this.settings = flag 
    ? this.getSettings() : {
      cacheKey: this.settings.cacheKey,
      errorLogs: this.settings.errorLogs,
      recordDate: this.settings.recordDate
    };
    this.settings.errorLogs = this.settings.errorLogs || [];// 错误日志
    this.settings.recordDate = this.settings.recordDate || +new Date;// 日志记录日期
    
    this.settings.lightColor = this.settings.lightColor || '#000000';// 白天字体颜色
    this.settings.darkColor = this.settings.darkColor || '#FFFFFF';// 晚上字体颜色
    this.settings.lightShadowColor = this.settings.lightShadowColor || '';// 白天字体阴影
    this.settings.darkShadowColor = this.settings.darkShadowColor || '';// 晚上字体阴影
    this.settings.lightBgColor = this.settings.lightBgColor || '#E8EAF3';// 白天背景颜色
    this.settings.darkBgColor = this.settings.darkBgColor || '#537895';// 晚上背景颜色
    this.settings.colorGradient = this.settings.colorGradient || '#4F6678,#304352';// 渐变颜色
    this.settings.angleGradient = this.settings.angleGradient || '90';// 渐变角度
    this.settings.locations = this.settings.locations || '0.5,1';
    this.settings.refreshAfterDate = this.settings.refreshAfterDate || '30';// 组件刷新
    this.settings.bgBlur = this.settings.bgBlur || '0.1';// 背景模糊
    this.settings.bgBlurOpacity = this.settings.bgBlurOpacity || '0.3';// 背景模糊
    this.settings.bgColor = this.settings.bgColor || '#000000';// 蒙版颜色
    this.settings.bgOpacity = this.settings.bgOpacity || '0.3';// 蒙版透明度
    this.settings.signBG = this.settings.signBG || '1';// 1:默认背景，2:透明背景，3:自定义背景
    this.settings.button = this.settings.button || [true, false, true];// 存储开关按钮状态
    this.settings.choiceBut = this.settings.choiceBut || [0,0,0,0];// 存储点击按钮状态
    this.settings.cacheKey = this.settings.cacheKey || []; // 缓存key
  }
  
  createDirectory () {
    this.FM.createDirectory(this.MODULE_FOLDER,true);
    this.FM.createDirectory(this.IMAGE_FOLDER,true);
    this.FM.createDirectory(this.MGR_PATH,true);
    this.FM.createDirectory(this.CACHE_PATH,true);
  }
  
  /**
   * 渐变背景
   * @return {LinearGradient}
   */
  getBackgroundColor () {
    let angle = Math.floor(this.settings.angleGradient);
    let color = this.settings.colorGradient;
    const colors = color.split(',');
    const locations = [];
    const linearColor = new LinearGradient();
    let x = 0, y = 0;
    if(angle < 45){
      y = 0.5 - 0.5/45*angle;
    }else if(angle < 135){
      x = 1/90*(angle-45);
    }else if(angle <= 180){
      x = 1;
      y = 0.5/45*(angle - 135);
    }
    linearColor.startPoint = new Point(x, y);
    linearColor.endPoint = new Point(1-x, 1-y);
    let avg = 1/(colors.length-1);
    linearColor.colors = colors.map((item, index) => {
      locations.push(index*avg);
      return new Color(item);
    });
    linearColor.locations = locations;
    return linearColor;
  };
  
  // 取得组件实例
  getWidget() {
    this.ERROR = [];
    this.backGroundColor = Color.dynamic(
      new Color(this.settings.lightBgColor),
      new Color(this.settings.darkBgColor),
    );
    this.widgetColor = Color.dynamic(
      new Color(this.settings.lightColor),
      new Color(this.settings.darkColor),
    );
    const widget = new ListWidget();
    return widget;
  }
  
  // 判断是否到达更新时间
  isUpdate(cacheKey, useCache = true, time = parseInt(this.settings.refreshAfterDate)) {
    cacheKey = 'ss' + cacheKey;
    time = time < 2 ? 2 : time;
    let name = typeof useCache === 'string' ? useCache : this.name;
    const nowTime = +new Date;
    let lastTime = nowTime;
    Keychain.contains(cacheKey) ? 
      lastTime = parseInt(Keychain.get(cacheKey)) : Keychain.set(cacheKey, String(lastTime));
    let _lastTime = Math.floor((nowTime-lastTime)/60000)
    if(useCache) log(`${name}：缓存${_lastTime}分钟前，有效期${time}分钟`);
    if(lastTime < (nowTime - 1000*60*time) || lastTime == nowTime) {
      Keychain.set(cacheKey, String(nowTime));
      return true;
    }else { return false;}
  }
  
  // 版本检测
  async versionCheck (flag = true) {
    const url = this.getUrl(this.package);
   let versionData = await this.httpGet(url);
    if(flag){
      let req = versionData[this.widget_ID];
      if(req.version != this.version){
        let title = "💥新版本"+req.version;
        let message = req.notes + "\n版本更新尽在⬇️\n「大舅哥科技」公众号" + req.updateTime;;
        let idx = await this.generateAlert(message, ['立即更新','暂不更新'], title);
        if (idx === 0) Safari.open(this.updata_info);
      }else {
        let title = "暂无更新";
        let message = req.version + req.notes + "\n- 如无法预览，可尝试重置\n- 若发现问题，请点击'反馈'按钮" + req.updateTime;
        let idx = await this.generateAlert(message, ['反馈', '知道了'], title);
        if (idx === 0) Safari.open('https://support.qq.com/products/368353?');
      }
    } else {
      let req = versionData[this.widget_ID];
      if(req.url){
        await Safari.openInApp(req.url, false);
      }else {
        await this.generateAlert('敬请期待！', ['知道了']);
      }
    }
  }
  
  // 组件警报
  async renderAlert (warning) {
    const w = new ListWidget();
    this.addText(
     w, warning || '⚠️\n\n该尺寸小组件暂未适配！', 16,
     {color:'FF3B30', align:'center'},
        false
    );
    return w;
  }
  
  // 错误警报
  errorAlert () {
   if(this.ERROR.length == 0) return null;
    let errors = this.ERROR
    const w = new ListWidget();
    this.addText(w, `${errors[0].error}`, 16, {color:'FF3B30', align:'center'});
    return w
  }
  
  /**
   * 字体颜色设置透明度
   */
  _widgetColor (alpha) {
    const color = Color.dynamic(
      new Color(this.settings.lightColor, alpha),
      new Color(this.settings.darkColor, alpha),
    );
    return color;
  }
  
  /**
   * 生成操作回调URL，点击后执行本脚本，并触发相应操作
   * @param {string} name 操作的名称
   * @param {string} data 传递的数据
   */
  actionUrl (name = '', data = '') {
    let u = URLScheme.forRunningScript()
    let q = `act=${encodeURIComponent(name)}&data=${encodeURIComponent(data)}&__arg=${encodeURIComponent(this.arg)}&__size=${this.widgetFamily}`
    let result = ''
    if (u.includes('run?')) {
      result = `${u}&${q}`
    } else {
      result = `${u}?${q}`
    }
    return result
  }
  
  /**
   * 注册点击操作菜单
   * @param {string} name 操作函数名
   * @param {func} func 点击后执行的函数
   */
  registerAction(name, func, icon = { name: 'gearshape', color: '#FF6347' }) {
    this._actions[name] = func.bind(this);
    this._actionsIcon[name] = icon;
  }

  /**
   * base64 编码字符串
   * @param {string} str 要编码的字符串
   */
  base64Encode(str) {
    const data = Data.fromString(str);
    return data.toBase64String();
  }

  /**
   * base64解码数据 返回字符串
   * @param {string} b64 base64编码的数据
   */
  base64Decode(b64) {
    const data = Data.fromBase64String(b64);
    return data.toRawString();
  }

  /**
   * hash 加密字符串
   * @param {string} str 要加密成哈希值的数据
   */
  hash(string) {
    let hash2 = 0, i, chr;
    for (i = 0; i < string.length; i++) {
      chr = string.charCodeAt(i);
      hash2 = (hash2 << 5) - hash2 + chr;
      hash2 |= 0;
    }
    return `hash_${hash2}`;
  }
  
  getUrl(fileName) {
    const repository = "https://gitee.com/script_djg/scriptable/raw/master/Script/";
    return `${repository}${fileName}`;
  }
  
  /**
   * HTTP 请求接口
   * @param {string} url 请求的url
   * @param {bool} useCache 是否采用离线缓存（请求失败后获取上一次结果）
   * @param {bool} json 返回数据是否为 json，默认 true
   * @return {string | json | null}
   */
  async httpGet (url, json = true, useCache = true, options = null, method = 'GET') {
    let str = url + options?.headers?.cookie + options?.body;
    let cacheKey = this.hash(str);
    let cacheData = null, error = null;
    if (this.isUpdate(cacheKey, useCache) || !Keychain.contains(cacheKey)){
      try {
        let req = new Request(url)
        req.method = method
        if(options){
          Object.keys(options).forEach((key) => {
            req[key] = options[key];
          });
        }
        cacheData = await (json ? req.loadJSON() : req.loadString());
      } catch (e) {
        console.log(e);
        error = {url:url, error:e.toString()};
        this.writeError(error);
        if(!useCache) this.ERROR.push(error);
      };
    }
    if(cacheData && useCache) {
      this.saveCacheKey(cacheKey);
      Keychain.set(cacheKey, json ? JSON.stringify(cacheData) : cacheData)
    }else if (!cacheData && Keychain.contains(cacheKey)) {
      let cache = Keychain.get(cacheKey)
      cacheData = json ? JSON.parse(cache) : cache
    }else {
      this.ERROR.push(error);
    }
    return cacheData;
  }
  
  saveCacheKey(key){
    let cacheKey = this.settings.cacheKey || [];
    if(cacheKey.length == 0 || cacheKey.indexOf(key) == -1) {
      cacheKey.push(key);
      this.settings.cacheKey = cacheKey;
      this.saveSettings(false);
    }
  }
  
  async saveStringCache(cacheKey, content, path = this.CACHE_PATH) {
    const cacheFile = this.FM.joinPath(path, cacheKey);
    this.FM.writeString(cacheFile, content);
  }
  
  async loadStringCache(cacheKey, path = this.CACHE_PATH) {
    const cacheFile = this.FM.joinPath(path, cacheKey);
    const fileExists = this.FM.fileExists(cacheFile);
    let cacheString = null;
    if (fileExists) {
      cacheString = this.FM.readString(cacheFile);
    }
    return cacheString;
  }
  
  async getImageByUrl (url, path = this.CACHE_PATH) {
    const cacheKey = this.hash(url);
    let error = null;
    let cacheImg = this.loadImgCache(cacheKey, path);
    if (!!cacheImg) {
      return cacheImg;
    }
    try {
      const req = new Request(url)
      cacheImg = await req.loadImage();
      // 存储到缓存
      this.saveImgCache(cacheKey, cacheImg, path);
      return cacheImg;
    } catch (e) {
      error = {url:url, error:e.toString()};
      this.writeError(error);
      this.ERROR.push(error);
      // 没有缓存+失败情况下，返回自定义的绘制图片（红色背景）
      let ctx = new DrawContext()
      ctx.size = new Size(100, 100)
      ctx.setFillColor(Color.red())
      ctx.fillRect(new Rect(0, 0, 100, 100))
      return await ctx.getImage()
    }
  }
  
  saveImgCache(cacheKey, img, path) {
    const cacheFile = this.FM.joinPath(path, `${cacheKey}.png`);
    this.FM.writeImage(cacheFile, img);
  }

  loadImgCache(cacheKey, path) {
    const cacheFile = this.FM.joinPath(path, `${cacheKey}.png`);
    const fileExists = this.FM.fileExists(cacheFile);
    let img = undefined;
    if (fileExists) {
      img = Image.fromFile(cacheFile);
    }
    return img;
  }
  
  /**
   * @description 导入模块，不存在即下载模块
   * @param {string} moduleName 模块名
   */
  async require (moduleName) {
    const path = this.MODULE_FOLDER;
    const cacheKey = `${moduleName}.js`;
    let localCache = await this.loadStringCache(cacheKey, path);
    if (!localCache) {
      const url = this.getUrl(`module/${cacheKey}`);
      let req = new Request(url);
      localCache = await req.loadString();
      if (localCache) await this.saveStringCache(cacheKey, localCache, path);
    }
    if (localCache) {
      moduleName = this.FM.joinPath(path, cacheKey);
      return importModule(moduleName);
    }
  }
  
  // 设置 widget 背景图片
  async getWidgetBackgroundImage(widget) {
    const backgroundImage = await this.getBackgroundImage();
    if (backgroundImage) {
      widget.backgroundImage = backgroundImage;
    } else {
      if (this.settings.signBG == '4') {
        widget.backgroundGradient = this.getBackgroundColor();
      } else {
        widget.backgroundColor = this.backGroundColor;
      }
    }
  };
  
  /**
   * 背景高斯模糊
   * @param {img} Image
   * @param {blur} Int 模糊值
   * @param {blur} Int 透明度
   */
  async blurImage(img, blur = this.settings.bgBlur, opacity = this.settings.bgBlurOpacity) {
    const blurImage = await this.require("blurImage");
    return await blurImage(img, blur, opacity);
  }
  
  /**
   * 给图片加一层半透明遮罩
   * @param {Image} img 要处理的图片
   * @param {string} color 遮罩背景颜色
   * @param {float} opacity 透明度
   */
  async shadowImage (img, color = this.settings.bgColor, opacity = this.settings.bgOpacity) {
    let ctx = new DrawContext();
    // 获取图片的尺寸
    ctx.size = img.size
    ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']))
    ctx.setFillColor(new Color(color, parseFloat(opacity)))
    ctx.fillRect(new Rect(0, 0, img.size['width'], img.size['height']))
    return ctx.getImage()
  }
  
  /**
   * 绘制系统按钮
   * @param {bool} isOff 是否为关闭状态
   * @param {Size} size 按钮大小
   */
  async drawButton(isOff = true, size = new Size(104, 64)){
    const cacheKey = `button_${isOff}`;
    let cacheImg = this.loadImgCache(cacheKey, this.IMAGE_FOLDER);
    if(!!cacheImg) return cacheImg;
    
    const {width, height} = size;
    let screenScale = Device.screenScale();
    let color, x;
    if(isOff){
      color = '#E8E8E8';
      x = height/2;
    }else{
      color = '#34C759';
      x = width-height/2;
    }
    // 绘制圆角矩形
    const canvas = this.makeCanvas(width, height);
    this.fillRect(canvas,0,0,width,height,height/2,new Color(color));
    cacheImg = canvas.getImage();
    const maskData = Data.fromPNG(cacheImg).toBase64String();
    
    const html = `
    <img id="bgImage" src="data:image/png;base64,${maskData}" />
    <canvas id="canvas" />`;
    const js = `
    var drawRound = function(x, y, r, start, end, color, type) {
      var unit = Math.PI / 180;
      ctx.beginPath();
      ctx.arc(x, y, r, start * unit, end * unit);
      ctx[type + 'Style'] = color;
      ctx.closePath();
      // 添加阴影
      ctx.shadowColor = 'rgba(152,152,152,0.8)';
      ctx.shadowBlur = 10;
      // 阴影偏移
      //ctx.shadowOffsetX = 10;
      //ctx.shadowOffsetY = 10;
      // 绘制图形
      ctx[type]();
    }
    var bgImage = document.getElementById("bgImage");
    var canvas = document.createElement("canvas");
    var width = bgImage.width/${screenScale};
    var height = bgImage.height/${screenScale};
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation='source-atop';
    drawRound(${x}, height/2, height/2-${height*0.075}, 0, 360, '#fff', 'fill');
    output=canvas.toDataURL()`;
    let wv = new WebView();
    await wv.loadHTML(html);
    const base64Image = await wv.evaluateJavaScript(js);
    const image = await new Request(base64Image).loadImage();
    this.saveImgCache(cacheKey, image, this.IMAGE_FOLDER);
    return image;
  }
  
  /**
   * 图像蒙版
   * @param {Image} img
   * @param {int} corner 圆角
   */
  async getMaskImage (img, corner = 35) {
    const cacheKey = 'maskImage';
    const {width, height} = img.size;
    let cacheImg = this.loadImgCache(cacheKey, this.IMAGE_FOLDER);
    if (cacheImg == undefined || cacheImg == null) {
      const canvas = this.makeCanvas(width, height);
      this.fillRect(canvas,0,0,width,height,corner,new Color("#fff"));
      cacheImg = canvas.getImage();
      this.saveImgCache(cacheKey, cacheImg, this.IMAGE_FOLDER);
    }
    const maskData = Data.fromPNG(cacheImg).toBase64String();
    const imgData = Data.fromPNG(img).toBase64String();
    const html = `
    <img id="sourceImg" src="data:image/png;base64,${imgData}" />
    <img id="maskImage" src="data:image/png;base64,${maskData}" />
    <canvas id="mainCanvas" />`;
    const js = `
    var canvas = document.createElement("canvas");
    var sourceImg = document.getElementById("sourceImg");
    var maskImage = document.getElementById("maskImage");
    var ctx = canvas.getContext('2d');
    canvas.width = sourceImg.width;
    canvas.height = sourceImg.height;
    ctx.drawImage(maskImage, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation='source-in';
    ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);
    
    output=canvas.toDataURL()`;
    let wv = new WebView();
    await wv.loadHTML(html);
    const base64Image = await wv.evaluateJavaScript(js);
    const iconImage = await new Request(base64Image).loadImage();
    const image = iconImage;
    return image;
  }

  /**
   * 验证图片尺寸： 压缩图片像素
   * @param img Image
   * @return {Image}
   */
  async verifyImage(image){
    let {width, height} = image.size;
    const multiple = width/height;
    if(width > height){
      width = 600;
      height = parseInt(width/multiple);
    }else{
      height = 600;
      width = parseInt(height*multiple);
    }
    let ctx = new DrawContext();
    ctx.size = new Size(width, height);
    ctx.drawImageInRect(image, new Rect(0, 0, width, height));
    return await ctx.getImage();
  };
  
  // 保存背景图片
  async saveBackgroundImage(image, index){
    try {
      if(index != 3) {
        const multiple = 2.12;
       let {width, height} = image.size;
       if(width/height < multiple){
          const h = parseInt(width/multiple);
          const y = (height - h)/2;
          image = this.cropImage(image, new Rect(0, y, width, h));
       }
       image = await this.verifyImage(image);
      }
      if(this.djgSettings.button[0]) {
        const table = new UITable();
        table.showSeparators = false;
        await this.handleImage(table, image, index);
        await table.present();
      } else {this.setBackgroundImage(image, index)};
    } catch (e) {log(e)}
  };
  
  // 处理背景图
  async handleImage(table, image, index) {
    const actions = [
      {
        BACKGROUND: this.BACKGROUND_OPA_KEY,
      },
      {
        button: '全透明背景(参考图)',
      },
      {
        BACKGROUND: this.BACKGROUND_OPA_KEY,
        handle: 'blurImage',
      },
      {
        button: 'blurImage',
        param: {
          title: "模糊",
          message: "⒈模糊值    ⒉透明值\n值范围:0～1之间，请输入正确数值",
        },
      },
      {
        BACKGROUND: this.BACKGROUND_OPA_KEY,
        handle: 'shadowImage',
      },
      {
        button: 'shadowImage',
        param: {
          title: "蒙版",
          message: "⒈透明度范围:0～1之间\n⒉输入 (Hex 颜色) 字符\n请输入正确数值",
        },
      }
    ];
    table.removeAllRows();
    await this.imageTable(table, actions, '点击图片下方文字进行参数设置', image, index);
  }
  
  // 供用户手动处理背景图
  async imageTable(table, arrs, outfit, picture, index) {
    table.removeAllRows();
    const header = new UITableRow();
    const heading = header.addText(outfit);
    heading.titleFont = Font.mediumSystemFont(17);
    heading.centerAligned();
    table.addRow(header);
    for (const item of arrs) {
      let image = picture
      const row = new UITableRow();
      if (item.BACKGROUND) {
        row.height = 170;
        if (item.handle) image = await this[item.handle](image);
        image = await this.getMaskImage(image);
        const imgCell = UITableCell.image(image);
        imgCell.centerAligned();
        row.addCell(imgCell);
      }
      if (item.button) {
        const match = {
          blurImage:{title:'模糊', v:'bgBlur', o:'bgBlurOpacity'}, 
          shadowImage:{title:'蒙版', v:'bgOpacity', c:'bgColor'}
        };
        row.height = 30;
        let text = '  🟡';
        if(match[item.button]) {
          const set = match[item.button];
          for(let key in set) {
            text = key == 'title'
            ? `${text} ${set[key]}`
            : `${text} ${key}:${this.settings[set[key]]}`;
          }
        } else {
          text = item.button;
        }
        const paramCell = row.addButton(text);
        if (item.param) {
          paramCell.onTap = async () => {
            let json = {};
            Object.keys(match[item.button]).forEach((key) => {
              if(key != 'title')json[match[item.button][key]] = '';
            });
            let idex = await this.setCustomAction(item.param.title, item.param.message, json, true, false);
            if(idex) await this.imageTable(table, arrs, outfit, picture, index);  
          }
          const saveCell = row.addButton('🟡保存   ');
          saveCell.dismissOnTap = true;
          saveCell.rightAligned();
          saveCell.onTap = async () => {
            image = await this[item.button](image);
            this.setBackgroundImage(image, index);
          }
        }else{
          paramCell.centerAligned();
          paramCell.dismissOnTap = true;
          paramCell.onTap = async () => {
            this.setBackgroundImage(image, index);
          }
        };
      }
      table.addRow(row);
    }
    table.reload();
  };
  
  // 图像裁剪
  cropImage(img, rect) {
    let draw = new DrawContext();
    draw.size = new Size(rect.width, rect.height);
    draw.drawImageAtPoint(img, new Point(-rect.x, -rect.y));
    return draw.getImage();
  }
  
  // 所有支持手机上小部件的像素大小和位置。
  phoneSizes() {
    return {
      // 14 Pro Max
      2796: {small: 510,medium: 1092,large: 1146,left: 96,right: 678,top: 246,middle: 882,bottom: 1518},
      // 14 pro
      2556: {small: 474,medium: 1014,large: 1062,left: 78,right: 618,top: 231,middle: 819,bottom: 1407},
      
      // 12 Pro Max
      2778: {small: 510,medium: 1092,large: 1146,left: 96,right: 678,top: 246,middle: 882,bottom: 1518},
      // 12 and 12 Pro、14
      2532: {small: 474,medium: 1014,large: 1062,left: 78,right: 618,top: 231,middle: 819,bottom: 1407},
      // 11 Pro Max, XS Max
      2688: {small: 507,medium: 1080,large: 1137,left: 81,right: 654,top: 228,middle: 858,bottom: 1488},
      // 11, XR
      1792: {small: 338,medium: 720,large: 758,left: 54,right: 436,top: 160,middle: 580,bottom: 1000},
      // 11 Pro, XS, X
      2436: {small: 465,medium: 987,large: 1035,left: 69,right: 591,top: 213,middle: 783,bottom: 1353},
      // Plus phones
      2208: {small: 471,medium: 1044,large: 1071,left: 99,right: 672,top: 114,middle: 696,bottom: 1278},
      // SE2 and 6/6S/7/8
      1334: {small: 296,medium: 642,large: 648,left: 54,right: 400,top: 60,middle: 412,bottom: 764},
      // SE1
      1136: {small: 282,medium: 584,large: 622,left: 30,right: 332,top: 59,middle: 399,bottom: 399},
      // 11 and XR in Display Zoom mode
      1624: {small: 310,medium: 658,large: 690,left: 46,right: 394,top: 142,middle: 522,bottom: 902},
      // Plus in Display Zoom mode
      2001: {small: 444,medium: 963,large: 972,left: 81,right: 600,top: 90,middle: 618,bottom: 1146},
    };
  }
  
  /**
   * 获取组件尺寸
   * @param {string} size 组件尺寸【small】、【medium】
   * @returns {json}
   */
  getWidgetSize(size) {
    // 屏幕缩放比例
    let screenScale = Device.screenScale()
    // 宽度、高度
    let width, height;
    // 手机屏幕高度
    const screenHeight = Device.screenSize().height * screenScale;
    let phoneSize = this.phoneSizes()[screenHeight];
    if (!phoneSize) {
      phoneSize = this.phoneSizes()['2436'];
      screenScale = 3;
    }
    width = phoneSize[size] / screenScale;
    height = phoneSize['small'] / screenScale;
    return {width, height};
  }
  
  /**
   * 获取组件尺寸宽度大小
   * @param {string} size 组件尺寸【small】、【medium】
   * @returns {number}
   */
  getWidgetWidthSize(size) {
    // 屏幕缩放比例
    let screenScale = Device.screenScale()
    // 组件宽度
    let phoneWidgetSize = undefined
    // 手机屏幕高度
    const screenHeight = Device.screenSize().height * screenScale;
    phoneWidgetSize = this.phoneSizes()[screenHeight];
    if (!phoneWidgetSize) {
      phoneWidgetSize = this.phoneSizes()['2436'];
      screenScale = 3;
    }
    const width = phoneWidgetSize[size] / screenScale
    return width
  }
  
  // ######创建画布######
  makeCanvas(w, h) {
    const canvas = new DrawContext();
    canvas.opaque = false;
    canvas.respectScreenScale = true;
    canvas.size = new Size(w, h);
    return canvas;
  }
  // ######画线######
  drawLine(canvas, x1, y1, x2, y2, width, color = this.widgetColor){
    const path = new Path()
    path.move(new Point(Math.round(x1),Math.round(y1)))
    path.addLine(new Point(Math.round(x2),Math.round(y2)))
    canvas.addPath(path)
    canvas.setStrokeColor(color)
    canvas.setLineWidth(width)
    canvas.strokePath()  
  }
  
  // ######绘制文字#######  
  drawText(canvas, x, y, width, height, text, font, fontsize, alignment, color=this.widgetColor){
    canvas.setFont(this.provideFont(font, fontsize))
    canvas.setTextColor(color)
    if(alignment == "left") {canvas.setTextAlignedLeft()}
    if(alignment == "center") {canvas.setTextAlignedCenter()}
    if(alignment == "right") {canvas.setTextAlignedRight()}
    canvas.drawTextInRect(`${text}`, new Rect(x, y, width, height))  
  }
  
  // ######画实心柱######
  fillRect (canvas,x,y,width,height,cornerradio,color=this.widgetColor){  
    let path = new Path()  
    let rect = new Rect(x, y, width, height)  
    path.addRoundedRect(rect, cornerradio, cornerradio)  
    canvas.addPath(path)  
    canvas.setFillColor(color)  
    canvas.fillPath()  
  }
  
  // ######画实心园######
  drawPoint(canvas,x1,y1,diaofPoint,color=this.widgetColor){  
    let currPath = new Path()
    currPath.addEllipse(new Rect(x1, y1, diaofPoint, diaofPoint))
    canvas.addPath(currPath)
    canvas.setFillColor(color)
    canvas.fillPath()  
  }
  
  /**
   * 绘制圆环进度条
   * @param {DrawContext} canvas
   * @param {json} opts {size, radius, width, percent} 大小、半径、线宽、百分比
   * @param {string} fillColor 进度条颜色
   * @param {string} strokeColor 进度条底色
   */
  drawArc(canvas, opts, fillColor, strokeColor, strokeOpacity = 0.2) {
    const {size, radius, width, percent} = opts;
    
    let ctr = new Point(size / 2, size / 2);
    let bgx = ctr.x - radius;
    let bgy = ctr.y - radius;
    let bgd = 2 * radius;
    let bgr = new Rect(bgx, bgy, bgd, bgd)

    canvas.setStrokeColor(new Color(strokeColor, strokeOpacity));
    canvas.setLineWidth(width);
    canvas.strokeEllipse(bgr);

    for (let t = 0; t < percent*3.6; t++) {
      let rect_x = ctr.x + radius * this.sinDeg(t) - width / 2;
      let rect_y = ctr.y - radius * this.cosDeg(t) - width / 2;
      let rect_r = new Rect(rect_x, rect_y, width, width);
      canvas.setFillColor(new Color(fillColor));
      canvas.setStrokeColor(new Color(strokeColor))
      canvas.fillEllipse(rect_r);
    }
  }
  
  sinDeg(deg) {
    return Math.sin((deg * Math.PI) / 180);
  }

  cosDeg(deg) {
    return Math.cos((deg * Math.PI) / 180);
  }
  
  // 农历
  getLunar(date = new Date()) {
    const calendar = {}
    let lunarInfo = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0]

    let zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
    let Gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
    let Zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    //用于计算农历年月日的数据
    let localtime = date;
    // 取本地毫秒数
    let localmesc = localtime.getTime();
    // 取本地时区与格林尼治所在时区的偏差毫秒数
    let localOffset = localtime.getTimezoneOffset() * 60000;
    // 反推得到格林尼治时间
    let utc = localOffset + localmesc;
    // 得到指定时区时间
    let calctime = utc + (3600000 * 8);// 8 时区
    let lunarDate = new Date(calctime);
    let GY = lunarDate.getFullYear()
    let GM = lunarDate.getMonth()
    let GD = lunarDate.getDate()

    //==== 传入 offset 传回干支, 0=甲子
    function cyclical(num) {
      return(Gan[num % 10] + Zhi[num % 12])
    }
    //==== 传回农历 year年的总天数
    function lYearDays(year) {
      let i, sum = 348
      for(i = 0x8000; i > 0x8; i >>= 1) {
        sum += (lunarInfo[year - 1900] & i) ? 1: 0
      }
      return(sum + leapDays(year))
    }
    //==== 传回农历 year年闰月的天数
    function leapDays(year) {
      if(leapMonth(year)) {
        return((lunarInfo[year-1900] & 0x10000)? 30: 29)
      }else {
        return 0
      }
    }
    //==== 传回农历 year年闰哪个月 1-12 , 没闰传回 0
    function leapMonth(year) {
      return(lunarInfo[year - 1900] & 0xf)
    }
    //==== 传回农历 year年month月的总天数
    function monthDays(year, month) {
      return( (lunarInfo[year - 1900] & (0x10000 >> month))? 30: 29 )
    }
    //==== 算出农历, 传入日期对象, 传回农历日期对象
    //     该对象属性有 农历年year 农历月month 农历日day 是否闰年isLeap yearCyl dayCyl monCyl
    function Lunar(objDate) {
      let i, temp = 0
      let baseDate = new Date(1900,0,31)
      let offset   = Math.floor((objDate - baseDate)/86400000)
      let dayCyl = offset + 40
      let monCyl = 14
      for(i = 1900; i < 2050 && offset > 0; i++) {
        temp = lYearDays(i)
        offset -= temp
        monCyl += 12
      }
      if(offset < 0) {
        offset += temp;
        i--;
        monCyl -= 12
      }
      //农历年
      let year = i
      let yearCyl = i-1864
      let leap = leapMonth(i) //闰哪个月
      let isLeap = false  //是否闰年
      for(i=1; i<13 && offset>0; i++) {
        //闰月
        if(leap>0 && i === (leap+1) && isLeap === false) {
            --i; isLeap = true; temp = leapDays(year);
        }
        else {
            temp = monthDays(year, i);
        }
        //解除闰月
        if(isLeap === true && i === (leap + 1)) {isLeap = false}
        offset -= temp
        if(isLeap === false) {monCyl ++}
      }
      if(offset === 0 && leap>0 && i===leap+1)
        if(isLeap) {
            isLeap = false
        }else {
            isLeap = true
            --i
            --monCyl
        }
      if(offset<0){
        offset += temp
        --i
        --monCyl
      }
      //农历月
      let month = i
      //农历日
      let day = offset + 1
      return {
        //year: year,
        month: month,
        day: day,
        isLeap: isLeap,
        leap: leap,
        yearCyl: yearCyl,
        dayCyl: dayCyl,
        monCyl: monCyl
      }
    }
    //==== 中文日期 m为传入月份，d为传入日期
    function cDay(m, d){
      let nStr1 = ['日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
      let nStr2 = ['初', '十', '廿', '卅', '']
      //农历中文月
      let lunarMonthCn
      //农历中文日
      let lunarDayCn
      if (m > 10){
        lunarMonthCn = m === 11 ? '十' + nStr1[m - 10] : lunarMonthCn = '腊'
      } else {
        lunarMonthCn = m === 1 ? '正' : nStr1[m]
      }
      lunarMonthCn += '月'
      switch (d) {
        case 10: lunarDayCn = '初十'; break;
        case 20: lunarDayCn = '二十'; break;
        case 30: lunarDayCn = '三十'; break;
        default: lunarDayCn = nStr2[Math.floor(d/10)] + nStr1[d % 10]
      }
      return {
        lunarMonthCn: lunarMonthCn,
        lunarDayCn: lunarDayCn
      }
    }
    //去掉时分秒的日期
    let sDObj = new Date(GY, GM, GD);
    let lDObj = new Lunar(sDObj);
    //农历生肖
    calendar.zodiacYear = zodiacs[(GY - 4) % 12]
    //农历中文年月日
    calendar.lunarYearCn = cyclical( GY - 1900 + 36);
    calendar.lunarMonthCn = cDay(lDObj.month,lDObj.day).lunarMonthCn
    calendar.lunarDayCn = cDay(lDObj.month,lDObj.day).lunarDayCn
    return calendar
  }
  
  /**
   * 获取节假日
   * @param {int} length 节假日个数
   * @param {bool} flag 获取系统日历节假日信息，默认true
   * @return {json}
   */
  async getSolarTerm(length = 1, flag = true){
    let url = 'https://gitee.com/script_djg/scriptable/raw/master/Script/module/futureEvents.js';
    // ######获取日程#######
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate())
    // 结束时间设置为当日"+targetDate"天的日期  
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 365)
    // 日历事件
    let futureEvents;
    const nowTime = currentDate.getTime();
    try{
      futureEvents = await CalendarEvent.between(currentDate, endDate, []);
    }catch(e){
      console.warn("日历权限获取失败，从云端获取数据");
    }
    if(!flag || !futureEvents || futureEvents.length < 5){
      flag = false;
      let index = 0;
      futureEvents = await this.httpGet(url, true, '节假日');
      for (let key of futureEvents){
        let endDate = new Date(key.endDate);
        endDate.getTimezoneOffset();
        if (nowTime > endDate.getTime()){
          index++;
        }else {break;};
      }
      futureEvents = futureEvents.slice(index);
    }
    let events = [];
    for(let i = 0; i < length; i++) {
      let event = futureEvents[i];
      let startTime, endTime;
      if (!flag) {
        startTime = new Date(event.startDate);
        endTime = new Date(event.endDate);
      } else {
        startTime = event.startDate;
        endTime = event.endDate;
      }
      let json = {};
      json.startTime = startTime;
      json.endTime = endTime;
      json.solarTerm = event.title;
      json.week = this.getDateStr("EEE", startTime);
      json.color = futureEvents[i].calendar.color;
      json.isAllDay = event.isAllDay;
      events.push(json)
    }
    return events;
  }
  
  /**
   * @param message 描述内容
   * @param options 按钮
   * @returns {Promise<number>}
   */
  async generateAlert(message, options, title) {
    let alert = new Alert();
    title && (alert.title = title);
    alert.message = title ? '\n' + message : message;
    if(options) {
      for (const option of options) {
        alert.addAction(option);
      }
    }
    return await alert.presentAlert();
  }
  
  /**
   * 记录脚本异常
   * @param error 异常错误
   */ 
  writeError(error){
    error.time = +new Date;
    this.settings.errorLogs.unshift(error);
    this.saveSettings(false);
  }
  
  // 取得错误日志
  async getErrorLog() {
    let recordDate = this.settings.recordDate;
    let localMonth = this.getDateStr('M', new Date(recordDate));
    let nowMonth = this.getDateStr('M');
    if (localMonth != nowMonth) {
      this.settings.errorLogs = [];
      this.settings.recordDate = +new Date;
      this.saveSettings(false);
    }
    
    let errors = this.settings.errorLogs;
    let table = new UITable()
    table.showSeparators = true;
    let row = new UITableRow()
    let title = row.addText(
    "错误日志", 
    "记录脚本异常行为，每月1号清空")
    title.titleFont = Font.boldSystemFont(13)
    title.subtitleFont = Font.systemFont(9)
    title.subtitleColor = Color.gray()
    table.addRow(row)
 
    for (let item of errors) {
        row = new UITableRow()
        row.dismissOnSelect = false;
        let subtitle = this.getDateStr("yyyy.MM.dd hh:mm:ss", new Date(item.time));
        let t = row.addText(item.error, subtitle)
        t.titleFont = Font.boldSystemFont(13)
        t.titleColor = Color.red()
        t.subtitleFont = Font.systemFont(11)
        t.subtitleColor = Color.gray()
        row.onSelect = async (number) => {
          Pasteboard.copy(
           `${this.name}:
          ${item.error}
          url:${item.url}
          ${subtitle}`
          );
          await this.generateAlert("内容已复制到剪切板", ["知道了"])
        }
        table.addRow(row)
    }
    QuickLook.present(table, false);
  }
  
  /**
   * 输入菜单
   * @param {string} title 标题
   * @param {string} desc 描述
   * @param {array} opt 选择菜单
   * @param {bool} flag 非全局参数(true) 
   * @param {bool} notify 通知 默认：true
   * @returns {Promise<void>}
   */
  async setCustomAction(title, desc, opt, flag = true, notify = true) {
    const a = new Alert();
    a.title = title;
    a.message = !desc ? '' : '\n'+desc;
    Object.keys(opt).forEach((key) => {
      flag ? a.addTextField(opt[key], this.settings[key]) : a.addTextField(opt[key], this.djgSettings[key]);
    });
    a.addAction('确定');
    a.addCancelAction('取消');
    const id = await a.presentAlert();
    if (id === -1) return false;
    const data = {};
    Object.keys(opt).forEach(async (key, index) => {
      let temp = a.textFieldValue(index);
      data[key] = temp.replace(' ', '');
    });
    flag ? this.settings = { ...this.settings, ...data } : this.djgSettings = { ...this.djgSettings, ...data };
    this.saveSettings(notify, flag);
    return true;
  };
  
  /**
   * 选择菜单(单选、多选)
   * @param {string} title 标题
   * @param {string} desc 描述
   * @param {array} opt 选项
   * @param {bool} flag 单选(true) 默认 true
   * @param {string} attributeName 数据存放
   */
  async setChoiceAction(title, desc, opt, flag = true, attributeName = 'optionStatus') {
    let choice = this.settings[attributeName] || new Array(opt.length);
    const a = new Alert();
    a.title = title;
    a.message = `\n${desc}`;
    opt.map((k, i) => {
      a.addAction(choice[i] ? `${k} ✅` : `${k} ☑️`)
    })
    a.addCancelAction("完成设置")
    const id = await a.presentSheet();
    if (id === -1) return this.saveSettings(false);
    if(flag) {
      if(!!choice[id]){
        choice[id] = false;
      }else{
        choice = new Array(opt.length);
        choice[id] = true;
      }
      if(choice.indexOf(true) == -1) choice[id] = true;
      this.settings[attributeName] = choice;
      this.saveSettings(false);
    }else {
      choice[id] = !!choice[id] ? false : true;
      if(choice.indexOf(true) == -1) choice[id] = true;
      this.settings[attributeName] = choice;
      await this.setChoiceAction(title, desc, opt, false);
    }
  };
  
  /**
   * 设置组件内容
   * @returns {Promise<void>}
   */
  async setWidgetConfig() {
    const table = new UITable();
    table.showSeparators = true;
    await this.renderDJGTables(table);
    await table.present();
  };
  
  async dynamicMenu(table, arrs, outfit, flag = false) {
    let _arrs = arrs;
    if(typeof arrs == 'function') _arrs = arrs();
    table.removeAllRows();
    let settings = flag ? this.djgSettings : this.settings;
    const header = new UITableRow();
    const heading = header.addText(outfit);
    heading.titleFont = Font.mediumSystemFont(17);
    heading.centerAligned();
    table.addRow(header);
    for (const item of _arrs) {
      const row = new UITableRow();
      if (item.explain) {
        row.height = 36
         row.backgroundColor = Color.dynamic(
         new Color('F2F1F6'),
         new Color('000000'),
         );
        const title = row.addText(item.explain, ' ');
        title.subtitleFont = Font.systemFont(7);
        title.titleFont = Font.systemFont(13);
        title.titleColor = Color.dynamic(
          new Color('000000', 0.6),
          new Color('FFFFFF', 0.6),
        );
      } else if (item.title) {
       row.dismissOnSelect = !!item.dismissOnSelect;
       
       const rowTitle = row.addText(item.title);
       rowTitle.widthWeight = 400;
       rowTitle.titleFont = Font.systemFont(16);
       if(item.but != undefined){
           const but_off = await this.drawButton();
           const but_on = await this.drawButton(false);
          const img = settings.button[item.but] ? but_on : but_off;
          const imgCell = UITableCell.image(img)
          imgCell.rightAligned();
          imgCell.widthWeight = 500;
          row.addCell(imgCell);
        }else if (item.options) {
          let val = item.options[settings.choiceBut[item.index]];
          const valText = row.addText(`${val}`.toUpperCase());
          valText.widthWeight = 500;
          valText.rightAligned();
          valText.titleColor = Color.blue();
          valText.titleFont = Font.mediumSystemFont(16);
       }else{
          let val = !!item.val ? item.val : '>';
          const valText = row.addText(`${val}`.toUpperCase());
          valText.widthWeight = 500;
          valText.rightAligned();
          valText.titleColor = Color.blue();
          valText.titleFont = Font.mediumSystemFont(16);
        }
       if (item.onClick) row.onSelect = () => item.onClick(item, row);
       if (item.options) {
          row.onSelect = async () => {
            let length = item.options.length - 1;
            let index = settings.choiceBut[item.index];
            if (index == length) {
              index = 0;
            }else {
              index++;
            }
            if (flag) {
              this.djgSettings.choiceBut[item.index] = index;
            }else {
              this.settings.choiceBut[item.index] = index;
            }
            this.saveSettings(false, !flag);
            await this.dynamicMenu(table, arrs, outfit, flag);
          };
        }
       if (item.but != undefined) {
          row.onSelect = async () => {
            let button = settings.button[item.but];
            button = button ? false : true;
            if (flag) {
              this.djgSettings.button[item.but] = button;
            }else {
              this.settings.button[item.but] = button;
            }
            this.saveSettings(false, !flag);
            await this.dynamicMenu(table, arrs, outfit, flag);
          };
       }
      }
      table.addRow(row);
    }
    table.reload();
  };
  
  async preferences(table, arrs, outfit) {
    const header = new UITableRow();
    const heading = header.addText(outfit);
    heading.titleFont = Font.mediumSystemFont(17);
    heading.centerAligned();
    table.addRow(header);
    for (const item of arrs) {
      const row = new UITableRow();
      if (item.explain) {
        row.height = 36
         row.backgroundColor = Color.dynamic(
         new Color('F2F1F6'),
         new Color('000000'),
      );
      const title = row.addText(item.explain, ' ');
      title.subtitleFont = Font.systemFont(7);
      title.titleFont = Font.systemFont(13);
      title.titleColor = Color.dynamic(
         new Color('000000', 0.6),
         new Color('FFFFFF', 0.6),
      );
      } else if (item.title) {
       row.dismissOnSelect = !!item.dismissOnSelect;
       if (item.url) {
          const img = await this.getImageByUrl(item.url, this.IMAGE_FOLDER);
          const rowIcon = row.addImage(img)
          rowIcon.widthWeight = 100;
       }
       if (item.icon) {
          const icon = item.icon || {};
          const image = await this.drawTableIcon(icon.name, icon.color, icon.cornerWidth);
          const imageCell = row.addImage(image);
          imageCell.widthWeight = 100;
       }
       const rowTitle = row.addText(item.title);
       rowTitle.widthWeight = 400;
       rowTitle.titleFont = Font.systemFont(16);
        // …………………………
        const valText = row.addText(`${item.val || '>'}`.toUpperCase());
        valText.widthWeight = 500;
        valText.rightAligned();
        valText.titleColor = Color.blue();
        valText.titleFont = Font.mediumSystemFont(16);
       if (item.onClick) row.onSelect = () => item.onClick(item, row);
      }
      table.addRow(row);
    }
    table.reload();
  };
  
  // 取得Symbol图标
  async getSymbol (iconName, color, fontName, fontSize = 30){
    let sfi = SFSymbol.named(iconName);
    const font = this.provideFont(fontName, fontSize);
    sfi.applyFont(font);
    sfi = sfi.image;
    sfi = await this.changeIconColor(sfi, color);
    return sfi;
  }
  
  // 改变图标颜色
  async changeIconColor (icon, color) {
    color = color || 
      (Device.isUsingDarkAppearance() ? this.settings.darkColor : this.settings.lightColor);
    const imgData = Data.fromPNG(icon).toBase64String();
    const html = `
    <img id="sourceImg" src="data:image/png;base64,${imgData}" />
    <canvas id="mainCanvas" />`;
    const js = `
    function changeColor(ctx, image, color, bgColor) {
      ctx.save();
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, image.width, image.height);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(image, 0, 0);
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = bgColor || 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, image.width, image.height);
      ctx.restore();
    }
    var sourceImg = document.getElementById("sourceImg");
    var canvas = document.createElement("canvas");
    canvas.width = sourceImg.width;
    canvas.height = sourceImg.height;
    var ctx = canvas.getContext('2d');
    changeColor(ctx, sourceImg, "${color}")
    
    output=canvas.toDataURL()`;
    let wv = new WebView();
    await wv.loadHTML(html);
    const base64Image = await wv.evaluateJavaScript(js);
    const image = await new Request(base64Image).loadImage();
    return image;
  };
  
  async drawTableIcon (icon = 'square.grid.2x2', color = '#FF7F00', cornerWidth = 42) {
    const cacheKey = this.hash(icon + color);
    let img = this.loadImgCache(cacheKey, this.IMAGE_FOLDER);
    if(img) return img;
    
    let sfi;
    try{
      sfi = SFSymbol.named(icon);
      sfi.applyFont(Font.mediumSystemFont(30));
    } catch(e) {
      sfi = SFSymbol.named('square.grid.2x2');
      sfi.applyFont(Font.mediumSystemFont(30));
    }
    const imgData = Data.fromPNG(sfi.image).toBase64String();
    const html = `
    <img id="sourceImg" src="data:image/png;base64,${imgData}" />
    <img id="silhouetteImg" src="" />
    <canvas id="mainCanvas" />`;
    const js = `
    var canvas = document.createElement("canvas");
    var sourceImg = document.getElementById("sourceImg");
    var silhouetteImg = document.getElementById("silhouetteImg");
    var ctx = canvas.getContext('2d');
    var size = sourceImg.width > sourceImg.height ? sourceImg.width : sourceImg.height;
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(sourceImg, (canvas.width - sourceImg.width) / 2, (canvas.height - sourceImg.height) / 2);
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var pix = imgData.data;
    // 将图像转换为剪影
    for (var i=0, n = pix.length; i < n; i+= 4){
      //set red to 0 设置为红色到0
      pix[i] = 255;
      //set green to 0 设置绿色到0
      pix[i+1] = 255;
      //set blue to 0 设置为蓝色到0
      pix[i+2] = 255;
      //retain the alpha value 保留阿尔法值
      pix[i+3] = pix[i+3];
    }
    ctx.putImageData(imgData,0,0);
    silhouetteImg.src = canvas.toDataURL();
    output=canvas.toDataURL()`;
    let wv = new WebView();
    await wv.loadHTML(html);
    const base64Image = await wv.evaluateJavaScript(js);
    const iconImage = await new Request(base64Image).loadImage();
    const image = iconImage;
    
    const size = new Size(160, 160);
    const ctx = new DrawContext();
    ctx.opaque = false;
    ctx.respectScreenScale = true;
    ctx.size = size;
    const path = new Path();
    const rect = new Rect(0, 0, size.width, size.width);

    path.addRoundedRect(rect, cornerWidth, cornerWidth);
    path.closeSubpath();
    ctx.setFillColor(new Color(color));
    ctx.addPath(path);
    ctx.fillPath();
    const rate = 36;
    const iw = size.width - rate;
    const x = (size.width - iw) / 2;
    ctx.drawImageInRect(image, new Rect(x, x, iw, iw));
    
    img = ctx.getImage();
    this.saveImgCache(cacheKey, img, this.IMAGE_FOLDER);
    return img;
  };
  
  async renderDJGTables(table) {
    const basicSettings = [
      {
        title: '刷新时间',
        val: this.settings.refreshAfterDate,
        icon: {name: "arrow.clockwise", color: "#1890ff"},
        onClick: async () => {
          await this.setCustomAction(
            '刷新时间',
            '刷新时间仅供参考，具体刷新时间由系统判断，单位：分钟', {
              refreshAfterDate: '刷新时间',
            }
          );
        }
      },
      {
        title: "字体样式",
        icon: {name: "photo.fill", color: "#d48806"},
        onClick: async () => {
          const actions = [
            {
              title: "字体颜色",
              val: "白天 | 夜间",
              onClick: async () => {
                await this.setCustomAction("字体颜色", "⒈白天   ⒉晚上\n请自行百度搜寻颜色(Hex 颜色)", {lightColor:'浅色模式', darkColor:'深色模式'});
              }
            },
            {
              title: "字体阴影",
              val: "白天 | 夜间",
              onClick: async () => {
                await this.setCustomAction("字体颜色", "⒈白天   ⒉晚上\n请自行百度搜寻颜色(Hex 颜色)\n要取消文字阴影，请清空输入框", {lightShadowColor:'浅色模式', darkShadowColor:'深色模式'});
              }
            },
            {
              explain: '选取合适的阴影颜色，可以让组件看起来更精致',
            },
          ];
          const table = new UITable();
          table.showSeparators = true;
          await this.preferences(table, actions, "字体样式");
          await table.present();
       }
      },
      {
        title: "背景设置",
        icon: {name: "photo.on.rectangle", color: "#fa8c16"},
        onClick: async () => {
          const actions = [
           {
              title: "纯色背景",
              val: "白天 | 夜间",
              onClick: async () => {
                await this.setCustomAction("背景颜色", "⒈白天 ⒉晚上\n请自行去网站上搜寻颜色（Hex 颜色）", {
                  lightBgColor: '浅色模式',
                  darkBgColor: '深色模式',
                });
              }
            },
            {
              explain: '只有纯色背景才支持深浅模式动态切换'
        },
        {
              title: "渐变背景",
              onClick: async () => {
                let index = await this.setCustomAction("背景颜色", "⒈颜色，各颜色之间以英文逗号分隔\n2.渐变角度，数值范围：0 - 180\n请自行去网站上搜寻颜色（Hex 颜色）", {
                  colorGradient: '渐变颜色',
                  angleGradient: '渐变角度',
                });
                if(index) {
                  this.settings.signBG = '4';
                  this.saveSettings(false);
                }
              }
            },
            {
              title: "白天图",
              dismissOnSelect: true,
              onClick: async () => {
                let image = await Photos.fromLibrary();
                if (image) await this.saveBackgroundImage(image, 1);
              }
            },
            {
              title: "夜间图",
              dismissOnSelect: true,
              onClick: async () => {
                let image = await Photos.fromLibrary();
                if (image) await this.saveBackgroundImage(image ,2);
              }
            },
            {
              title: "透明背景",
              dismissOnSelect: true,
              onClick: async () => {
                const getWidgetScreenShot = await this.require('getWidgetScreenShot');
                const image = await getWidgetScreenShot(this.djgSettings.button[1]);
                if (image) await this.saveBackgroundImage(image ,3);
              }
            },
            {
              title: '辅助功能',
              but: 0,
            },
            {
              explain: '开启后，以上图片操作将增加背景模糊、蒙版等设置',
            },
            {
              title: '是否12 mini',
              but: 1,
            },
            {
              explain: '开启后，请重新设置透明背景，将修复背景错位问题',
            }
          ];
          const table = new UITable();
          table.showSeparators = true;
          await this.dynamicMenu(table, actions, "背景设置", true)
          await table.present();
        }
      },
      {
        title: "清除背景",
        dismissOnSelect: true,
        icon: {name: "clear", color: "#f5222d"},
        onClick: async () => {
          const options = ['取消', '清空'];
          const message = '该操作不可逆\n会清空自定义背景图片！';
          const index = await this.generateAlert(message, options);
          if (index === 0) return;
          await this.setBackgroundImage(false);
        }
      },
      {
        title: "错误日志",
        icon: {name: "note.text", color: "#7B68EE"},
        onClick: async () => {
          await this.getErrorLog();
        }
      },
      {
        title: "其他设置",
        icon: {name: "gearshape", color: "#48D1CC"},
        onClick: async () => {
          const otherOpts = [
           {
              title: '重置功能模块',
              dismissOnSelect: true,
              onClick: async () => {
                this.FM.remove(this.MODULE_FOLDER);
                this.createDirectory();
                this.notify('重置功能模块', '请重新运行此桌面小组件！');
              }
            },
            {
              explain: '如设置模块异常，可尝试此操作',
            },
            {
              title: '自动定位',
              but: 2
            },
            {
              explain: '关闭后，位置将不会刷新',
            }
          ];
          const table = new UITable();
          table.showSeparators = true;
          await this.dynamicMenu(table, otherOpts, "其他设置", true)
          await table.present();
        }
      }
    ];
    table.removeAllRows();
    let topRow = new UITableRow();
    let buttonCell1 = topRow.addButton('常见问题');
    buttonCell1.widthWeight = 0.25;
    buttonCell1.onTap = async () => {
      const faqTable = await this.require('faqTable');
      await faqTable();
    }
    let buttonCell2 = topRow.addButton('组件介绍');
    buttonCell2.widthWeight = 0.25;
    buttonCell2.onTap = async () => {
      await this.versionCheck(false);
    }
    let buttonCell3 = topRow.addButton('版本检测');
    buttonCell3.widthWeight = 0.25;
    buttonCell3.rightAligned();
    buttonCell3.onTap = async () => {
      await this.versionCheck();
    }
    let buttonCell4 = topRow.addButton('交流群');
    buttonCell4.widthWeight = 0.25;
    buttonCell4.rightAligned();
    buttonCell4.onTap = async () => {
      await Safari.open('https://jq.qq.com/?_wv=1027&k=bfguZi01');
    }
    table.addRow(topRow);
    let header = new UITableRow();
    let heading = header.addText('还原设置');
    heading.titleFont = Font.mediumSystemFont(17);
    heading.centerAligned();
    table.addRow(header);
    let row1 = new UITableRow();
    let rowtext1 = row1.addText(
      '重置缓存',
      '若数据显示错误，可尝试此操作',
    );
    rowtext1.titleFont = Font.systemFont(16);
    rowtext1.subtitleFont = Font.systemFont(12);
    rowtext1.subtitleColor = new Color('999999');
    row1.onSelect = async () => {
      const option = ['取消', '重置'];
      const message = '所有在线请求的数据缓存将会被清空！\n⚠️重置成功后⚠️\n请重新运行此桌面小组件！';
      const index = await this.generateAlert(message, option);
      if (index === 0) return;
      this.FM.remove(this.CACHE_PATH);
      this.createDirectory();
      this.removeCaches();
      this.notify('重置缓存成功', '请重新运行此桌面小组件！');
    };
    table.addRow(row1);
    let row2 = new UITableRow();
    let rowtext2 = row2.addText(
      '还原设置参数',
      '若需要恢复默认参数，可尝试此操作',
    );
    rowtext2.titleFont = Font.systemFont(16);
    rowtext2.subtitleFont = Font.systemFont(12);
    rowtext2.subtitleColor = new Color('999999');
    row2.onSelect = async () => {
      const option = ['取消', '重置'];
      const message = '基础设置中的所有参数将会重置为默认值，重置后请重新打开设置菜单！';
      const index = await this.generateAlert(message, option);
      if (index === 0) return;
      this.djgSettings.button = [true, false, true];
      this.widgetConfig(false);
      this.saveSettings(false);
      this.saveSettings(false, false);
      
      this.notify('还原设置成功', '请重新运行此桌面小组件！');
    };
    table.addRow(row2);
    await this.preferences(table, basicSettings, '基础设置');
    let imgRow = new UITableRow();
    imgRow.height = 200;
    let img = imgRow.addImage(await this.getImageByUrl('https://s1.ax1x.com/2022/07/10/jrjE8S.png',this.IMAGE_FOLDER
    ));
    img.centerAligned();
    table.addRow(imgRow);
  }
  
  /**
   * 弹出一个通知
   * @param {string} title 通知标题
   * @param {string} body 通知内容
   * @param {string} url 点击后打开的URL
   */
  async notify(title, body, opts = {openURL:"", sound:"alert"}) {
    try {
      let n = new Notification();
      n = Object.assign(n, opts);
      n.title = title;
      n.body = body;
      return await n.schedule();
    } catch (e) {throw new Error(e)}
  }

  /**
   * 获取当前插件的设置
   * @param {boolean} json 是否为json格式
   */
  getSettings(json = true, flag = true) {
    let res = json ? {} : '';
    let key = flag ? this.SETTING_KEY : this.DJG_KEY;
    let cache = '';
    if (Keychain.contains(key)) {
      cache = Keychain.get(key);
    }
    if (json) {
      try {
        res = JSON.parse(cache);
      } catch (e) {}
    } else {
      res = cache;
    }
    return res;
  }

  /**
   * 存储当前设置
   * @param {bool} notify 是否通知提示
   * @param {bool} flag 
   */
  saveSettings(notify = true, flag = true) {
    let key = flag ? this.SETTING_KEY : this.DJG_KEY;
    let setDemo = flag ? this.settings : this.djgSettings;
    let res =
      typeof setDemo === 'object'
        ? JSON.stringify(setDemo)
        : String(setDemo);
    Keychain.set(key, res);
    if (notify) this.notify('设置成功', '桌面组件稍后将自动刷新');
  }
  
  // 清除缓存
  removeCaches() {
    let cacheKey = this.settings.cacheKey;
    cacheKey.push('sslocUPtime');
    if(cacheKey.length == 0) return;
    cacheKey.forEach(function (key) {
      if(Keychain.contains(key)) {
        Keychain.remove(key);
      }
    })
    this.settings.cacheKey = [];
    this.saveSettings(false);
  }

  /**
   * 获取当前插件是否有自定义背景图片
   */
  async getBackgroundImage() {
    let result = null;
    switch (this.settings.signBG) {
      case '2':
       result = Image.fromFile(this.BACKGROUND_OPA_KEY);
        break;
      case '3':
       result = this.isNight
         ? Image.fromFile(this.BACKGROUND_KEY)
         : Image.fromFile(this.BACKGROUND_NIGHT_KEY);
        if(!result) result = this.isNight
         ? Image.fromFile(this.BACKGROUND_NIGHT_KEY)
         : Image.fromFile(this.BACKGROUND_KEY);
       break;
    }
    return result;
  }

  /**
   * 设置当前组件的背景图片
   * @param {Image} img
   * @param {flag} number 1:白天图 2:晚上图 3:透明图
   */
  setBackgroundImage(img, index) {
    if (!img) {
      // 移除背景
      if (this.FM.fileExists(this.BACKGROUND_KEY)) {
        this.FM.remove(this.BACKGROUND_KEY);
      }
      if (this.FM.fileExists(this.BACKGROUND_NIGHT_KEY)) {
        this.FM.remove(this.BACKGROUND_NIGHT_KEY);
      }
      this.settings.signBG = '1';
      this.notify('移除成功', '背景图片已移除，稍后刷新生效');
    } else {
      // 设置背景
      switch (index) {
       case 1:
         this.FM.writeImage(this.BACKGROUND_KEY, img);
         this.settings.signBG = '3';
         break;
       case 2:
         this.FM.writeImage(this.BACKGROUND_NIGHT_KEY, img);
         this.settings.signBG = '3';
         break;
       case 3:
         this.FM.writeImage(this.BACKGROUND_OPA_KEY, img);
         this.settings.signBG = '2';
         break;
      }
      this.notify('设置成功', '背景图片已设置！稍后刷新生效');
    }
    this.saveSettings(false);
  }
  
  /**
   * 获取定位
   * @return {json}
   */
  async getLocation(locTime = 20) {
    let locationInfo = null, error = null;
    const cacheKey = this.hash('DJG_location');
    if (!Keychain.contains(cacheKey) || 
      (!!this.settings.button[2] && this.isUpdate('locUPtime', "位置获取", locTime))) {
      Location.setAccuracyToHundredMeters();
      let location = await Location.current()
       .catch(async err => {
          error = {error: err.toString()};
          if(err.toString().indexOf('kCLErrorDomain错误1') == -1) {
            this.writeError(error);
            console.warn(err);
          }
       })
      try{
      let geocode = await Location.reverseGeocode(location.latitude, location.longitude, Device.locale());
      locationInfo = geocode[0];
      }catch(e){}
    }
    if(locationInfo){
      Keychain.set(cacheKey, JSON.stringify(locationInfo));
    }
    if(!locationInfo && Keychain.contains(cacheKey)){
      locationInfo = JSON.parse(Keychain.get(cacheKey));
    }
    if(!locationInfo){
      this.ERROR.push(error);
    }
    return locationInfo;
  }
  
  /**
   * 渲染标题内容
   * @param {object} widget 组件对象
   * @param {string} icon 图标地址
   * @param {string} title 标题内容
   * @param {bool|color} color 字体的颜色（自定义背景时使用，默认系统）
   */
  async renderHeader(widget, iconUrl, title, spacer = 15) {
    let header = widget.addStack();
    header.centerAlignContent();
    const image = await this.getImageByUrl(iconUrl);
    let _icon = header.addImage(image);
    _icon.imageSize = new Size(14, 14);
    _icon.cornerRadius = 4;
    header.addSpacer(10);
    this.addText(header, title, 12, {font:'bold', opacity:0.7})
    widget.addSpacer(spacer);
    return widget;
  }
  
  provideFont(fontName, fontSize) {
    const fontGenerator = {
      ultralight: function () {return Font.ultraLightSystemFont(fontSize)},
      light: function () {return Font.lightSystemFont(fontSize)},
      regular: function () {return Font.regularSystemFont(fontSize)},
      medium: function () {return Font.mediumSystemFont(fontSize)},
      semibold: function () {return Font.semiboldSystemFont(fontSize)},
      bold: function () {return Font.boldSystemFont(fontSize)},
      heavy: function () {return Font.heavySystemFont(fontSize)},
      black: function () {return Font.blackSystemFont(fontSize)},
      italic: function () {return Font.italicSystemFont(fontSize)},
      lightMonospaced: function () {return Font.lightMonospacedSystemFont(fontSize)},
      boldRounded: function () {return Font.boldRoundedSystemFont(fontSize)},
    }
    const systemFont = fontGenerator[fontName];//log([systemFont, !systemFont])
    if (systemFont) {return systemFont(fontSize)}
    try{
      return new Font('Marion-Bold', fontSize);
    }catch(e){
      return Font.systemFont(fontSize);
    }
  };
  
  /**
   * 文本添加接口
   * @param {WidgetStack} stack
   * @param {string} text 文本
   * @param {param} json {font:'',color:'',opacity:'',url:'',align:'',lineLimit:0,zoom:''}
   * @param {bool} useShadow 使用阴影
   */
  addText(stack, text, size, param = {}, useShadow = true){
    const format = {opacity:'textOpacity', url:'url', lineLimit:'lineLimit', zoom:'minimumScaleFactor'};
    let title = stack.addText(`${text}`);
    title.font = param.font ? this.provideFont(param.font, size) : Font.systemFont(size);
    title.textColor = param.color ? new Color(param.color) : this.widgetColor;
    Object.keys(param).forEach((key) => {
      if(format[key]!=null) title[format[key]] = param[key];
    })
    param.align && title[param.align+'AlignText']();
    const lightShadow = this.settings.lightShadowColor;
    const darkShadow = this.settings.darkShadowColor;
    if(useShadow && (lightShadow || darkShadow)) {
      title.shadowColor = Color.dynamic(
        new Color(lightShadow || 'fff', 0.8),
        new Color(darkShadow || '000', 0.8),
      );
      title.shadowOffset = new Point(1, 1);
      title.shadowRadius = 1;
    }
    return title;
  }
  
  /**
   * 图片添加接口
   * @param {param} json {color:'', corner:'', align:'', url:'', borderW:'', opacity:''}
   */
  addImage(stack, imag, size={w:0, h:0}, param = {}) {
    const icon = stack.addImage(imag);
    let {w, h} = size;
    if(w == 0 || w == null) w = imag.size.width*h/imag.size.height;
    if(h == 0 || h == null) h = imag.size.height*w/imag.size.width;
    icon.imageSize = new Size(w, h);
    if(param.color) icon.tintColor =  param.color=='this' ? this.widgetColor : new Color(param.color, param.opacity || 1);
    param.borderColor && (icon.borderColor = new Color(param.borderColor));
    param.corner && (icon.cornerRadius = param.corner);
    param.url && (icon.url = param.url);
    param.borderW && (icon.borderWidth = param.borderW);
    param.align && icon[param.align+'AlignImage']();
  }
  
  /**
   * 格式化数字
   * @param {Int} num 要处理的数字
   * @param {Int} fix 保留小数点后几位
   * @param {bool} flag 区分数字处理方式
   * @param {string} company 单位
   */
  numFormatr(num, fix = 2, flag = true){
    let com = ['万','亿'];
    if(num<10000){
      return num.toString()
    }else if(100000000>num && num>=10000){
      if(flag){
        return (num/10000).toFixed(fix) + com[0]
      }else{
        return num>9999499 ? Math.round(num/10000) + com[0] : (num/10000).toFixed(fix) + com[0]
      }
    }else{
      return (num/100000000).toFixed(fix) + com[1]
    }
  }
  
  /**
    * 格式化时间
    * @param {string} formatter 如 yyyy-MM-dd HH:mm:ss
    * @param {Date} date 日期
    * @returns {string}
    */
  getDateStr(formatter = "yyyy年MM月d日 EEE", date = new Date(), locale = "zh_cn") {
    const df = new DateFormatter()
    df.locale = locale
    df.dateFormat = formatter
    return df.string(date)
  }
  
  getTime(time){
   if (!time) return +new Date;
   let date = new Date(time)
   return Date.parse(date);
  }
}

// @base.end
const Runing = async (Widget, default_args = '', isDebug = true, extra) => {
  let M = null;
  // 判断hash是否和当前设备匹配
  if (config.runsInWidget) {
    M = new Widget(args.widgetParameter || '');
    if (extra) {
      Object.keys(extra).forEach((key) => {
        M[key] = extra[key];
      });
    }
    let W = await M.render();
    W = M.errorAlert() || W;
    try {
      if (M.settings.refreshAfterDate) {
        W.refreshAfterDate = new Date(
          (+new Date) + 1000 * 60 * parseInt(M.settings.refreshAfterDate),
        );
      }
    } catch (e) {
      console.log(e);
    }
    if (W) {
      Script.setWidget(W);
      Script.complete();
    }
  } else {
    log(`[*] Hello！`)
    log(`[*] 欢迎使用「大舅哥」组件`)
    log(`[-] 关注抖音：大舅哥科技`)
    log(`[+] 抖音有你更加精彩！`)
    log(`[/] 当前环境：${RUNTIME_VERSION}`)
    let { act, data, __arg, __size } = args.queryParameters;
    M = new Widget(__arg || default_args || '');
    if (extra) {
      Object.keys(extra).forEach((key) => {
        M[key] = extra[key];
      });
    }
    if (__size) M.init(__size);
    if (!act || !M['_actions']) {
      // 弹出选择菜单
      const actions = M['_actions'];
      const table = new UITable();
      const onClick = async (item) => {
        M.widgetFamily = item.val;
        let w = await M.render();
        const fnc = item.val
          .toLowerCase()
          .replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
        if (w) {
          w = M.errorAlert() || w;
          return w[`present${fnc}`]();
        }
      };
      const preview = [
        {
          icon: {name: "capsule", color: "#4676ed", rate: 80},
          title: '小尺寸',
          val: 'small',
          onClick,
        },
        {
          icon: {name: "rectangle", color: "#4676ed"},
          title: '中尺寸',
          val: 'medium',
          onClick,
        },
        {
          title: '大尺寸',
          icon: {name: "square", color: "#4676ed"},
          val: 'large',
          onClick,
        },
      ];
      let topRow = new UITableRow();
      topRow.height = 60;
      let leftText = topRow.addButton('➕关注');
      leftText.widthWeight = 0.3;
      leftText.onTap = async () => {
        await Safari.open('https://v.douyin.com/ePRqdq1/');
      };
      let centerRow = topRow.addImage(await M.getImageByUrl('https://s1.ax1x.com/2022/07/10/jrjAC8.png', M.IMAGE_FOLDER));
      centerRow.widthWeight = 0.4;
      centerRow.centerAligned();
      let rightText = topRow.addButton('gitee仓库');
      rightText.widthWeight = 0.3;
      rightText.rightAligned();
      rightText.onTap = async () => {
        await Safari.openInApp('https://gitee.com/script_djg/scriptable',false);
      };
      table.addRow(topRow)
      await M.preferences(table, preview, '预览组件');
      const extra = [];
      for (let _ in actions) {
        const iconItem = M._actionsIcon[_];
        const isUrl = typeof iconItem === 'string';
        const actionItem = {
          title: _,
          onClick: actions[_],
        };
        if (isUrl) {
          actionItem.url = iconItem;
        } else {
          actionItem.icon = iconItem;
        }
        extra.push(actionItem);
      }
      await M.preferences(table, extra, '配置组件');
      let imgRow = new UITableRow();
      imgRow.dismissOnSelect = false;
      imgRow.height = 200;
      let img = imgRow.addImage(await M.getImageByUrl('https://s1.ax1x.com/2022/07/10/jrjE8S.png', M.IMAGE_FOLDER));
      img.centerAligned();
      table.addRow(imgRow);
      return table.present();
    }else{
      let _tmp = act.split('-').map(_ => _[0].toUpperCase() + _.substr(1)).join('')
      let _act = `action${_tmp}`
      if (M[_act] && typeof M[_act] === 'function') {
        const func = M[_act].bind(M)
        await func(data)
      }
      M.refreshAfterDate = new Date();
    }
  }
};
//  await new DJG().setWidgetConfig();
module.exports = { DJG, Runing };