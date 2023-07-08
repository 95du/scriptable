// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: cog;

async function main() {
  const uri = Script.name();
  const scriptName = '组件商店'
  const version = '1.0.0'
  const updateDate = '2023年07月07日'
  
  const rootUrl = atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9mcmFtZXdvcmsvcmF3L21hc3Rlci8=');

  /**
   * 创建，获取存储路径
   * @returns {string} - string
   */
  const fm = FileManager.local();
  const mainPath = fm.joinPath(fm.documentsDirectory(), '95du_store');
  
  const getSettingPath = () => {
    if (!fm.fileExists(mainPath)) {
      fm.createDirectory(mainPath);
    }
    return fm.joinPath(mainPath, 'setting.json');
  };

  /**
   * 存储当前设置
   * @param { JSON } string
   */
  const writeSettings = async (settings) => {
    fm.writeString(getSettingPath(), JSON.stringify(settings, null, 2));
    console.log(JSON.stringify(
      settings, null, 2)
    )
  };
  
  /**
   * 读取储存的设置
   * @param {string} file - JSON
   * @returns {object} - JSON
   */
  const DEFAULT_SETTINGS = {
    version,
    music: true,
    bufferTime: 240
  };
  
  const getSettings = (file) => {
    if (fm.fileExists(file)) {
      return JSON.parse(fm.readString(file));
    } else {
      settings = DEFAULT_SETTINGS;
      writeSettings(settings);
    }
    return settings;
  };
  settings = await getSettings(getSettingPath());
  
  // 获取头像图片
  const getAvatarImg = () => {
    const avatarImgPath = fm.joinPath(fm.documentsDirectory(), '95du_store');
    return fm.joinPath(avatarImgPath, 'userSetAvatar.png');
  };
  
  /**
   * 弹出一个通知
   * @param {string} title
   * @param {string} body
   * @param {string} url
   * @param {string} sound
   */  
  const notify = async (title, body, url, opts = {}) => {
    const n = Object.assign(new Notification(), { title, body, sound: 'piano_', ...opts });
    if (url) n.openURL = url;
    return await n.schedule();
  };
  
  /**
   * 版本更新时弹出窗口
   * @returns {String} string
   */
  const updateVersionNotice = () => {
    const newVersion = version !== settings.version ? '.signin-loader' : undefined;
    if (newVersion) {
      settings.version = version;
      writeSettings(settings);
    }
    return newVersion;
  };
  
  /**
   * Setting drawTableIcon
   * @param { Image } image
   * @param { string } string
   */  
  const loadSF2B64 = async (
    icon = 'square.grid.2x2',
    color = '#56A8D6',
    cornerWidth = 39
  ) => {
    const sfSymbolImg = await drawTableIcon(icon, color, cornerWidth);
    return toBase64(sfSymbolImg);
  };
  
  const drawTableIcon = async (
    icon = 'square.grid.2x2',
    color = '#e8e8e8',
    cornerWidth = 39
  ) => {
    const sfi = SFSymbol.named(icon);
    sfi.applyFont(  
      Font.mediumSystemFont(30)
    );
    const imgData = Data.fromPNG(sfi.image).toBase64String();
    const html = `
      <img id="sourceImg" src="data:image/png;base64,${imgData}" />
      <img id="silhouetteImg" src="" />
      <canvas id="mainCanvas" />`;
      
    const js = `
      const canvas = document.createElement("canvas");
      const sourceImg = document.getElementById("sourceImg");
      const silhouetteImg = document.getElementById("silhouetteImg");
      const ctx = canvas.getContext('2d');
      const size = sourceImg.width > sourceImg.height ? sourceImg.width : sourceImg.height;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(sourceImg, (canvas.width - sourceImg.width) / 2, (canvas.height - sourceImg.height) / 2);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pix = imgData.data;
      for (var i=0, n = pix.length; i < n; i+= 4){
        pix[i] = 255;
        pix[i+1] = 255;
        pix[i+2] = 255;
        pix[i+3] = pix[i+3];
      }
      ctx.putImageData(imgData,0,0);
      silhouetteImg.src = canvas.toDataURL();
      output=canvas.toDataURL()
    `;
  
    let wv = new WebView();
    await wv.loadHTML(html);
    const base64Image = await wv.evaluateJavaScript(js);
    const iconImage = await new Request(base64Image).loadImage();
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
    ctx.drawImageInRect(iconImage, new Rect(x, x, iw, iw));
    return ctx.getImage();
  };
  
  /**
   * @param message 内容
   * @param options 按键
   * @returns { Promise<number> }
   */
  const generateAlert = async (title, message, options) => {
    const alert = new Alert();
    alert.title = title
    alert.message = message
    for (const option of options) {
      alert.addAction(option)
    }
    return await alert.presentAlert();
  };
  
  /**
   * 获取css及js字符串和图片并使用缓存
   * @param {string} File Extension
   * @param {Image} Base64 
   * @returns {string} - Request
   */
  const cache = fm.joinPath(mainPath, 'cache_path');
  fm.createDirectory(cache, true);
  
  const useFileManager = ({ cacheTime } = {}) => {
    return {
      readString: (fileName) => {
        const filePath = fm.joinPath(cache, fileName);
        const currentTime = (new Date()).getTime();
        if (fm.fileExists(filePath) && cacheTime && ((currentTime - fm.creationDate(filePath).getTime()) / ( 60 * 60 * 1000 )) <= cacheTime) {
          return fm.readString(filePath);
        }
        return null;
      },
      writeString: (fileName, content) => fm.writeString(fm.joinPath(cache, fileName), content),  
      // cache Image
      readImage: (filePath) => {
        const imgPath = fm.joinPath(cache, filePath);
        return fm.fileExists(imgPath) ? fm.readImage(imgPath) : null;
      },
      writeImage: (filePath, image) => fm.writeImage(fm.joinPath(cache, filePath), image)
    }
  };
  
  /**
   * 获取css，js字符串并使用缓存
   * @param {string} string
   */
  const getString = async (url) => {
    return await new Request(url).loadString();
  };
  
  const getCacheString = async (cssFileName, cssFileUrl) => {
    const cache = useFileManager({ cacheTime: settings.bufferTime });
    const cssString = cache.readString(cssFileName);
    if (cssString) {
      return cssString;
    }
    const response = await getString(cssFileUrl);
    cache.writeString(cssFileName, response);
    return response;
  };
  
  /**
   * 获取网络图片并使用缓存
   * @param {Image} url
   */
  const getImage = async (url) => {
    return await new Request(url).loadImage();
  };
  
  const getCacheImage = async (name, url) => {
    const cache = useFileManager();
    const image = cache.readImage(name);
    if ( image ) {
      return image;
    }
    const img = await getImage(url);
    cache.writeImage(name, img);
    return img;
  };
  
  const toBase64 = async (img) => {
    return `data:image/png;base64,${Data.fromPNG(img).toBase64String()}`
  };

  
  // ====== web start ======= //
  
  const renderAppView = async (options) => {
    const {
      formItems = [],
      head,
      $ = 'https://www.imarkr.com'
    } = options;
    
    // themeColor
    const [themeColor, logoColor] = Device.isUsingDarkAppearance() ? ['dark', 'white'] : ['white', 'black'];

    const appleHub = await toBase64(await getCacheImage(
      `${logoColor}.png`,
      `${rootUrl}img/picture/appleHub_${logoColor}.png`
    ));
    
    const authorAvatar = await toBase64(fm.fileExists(getAvatarImg()) ? fm.readImage(getAvatarImg()) : await getCacheImage(
      'author.png',
      `${rootUrl}img/icon/4qiao.png`
    ));
    
    const scripts = ['jquery.min.js', 'bootstrap.min.js', 'loader.js'];
    const scriptTags = await Promise.all(scripts.map(async (script) => {
      const content = await getCacheString(script, `${rootUrl}web/${script}`);
      return `<script>${content}</script>`;
    }));
    
    for (const i of formItems) {
      for (const item of i.items) {
        const { icon } = item;
        if (typeof icon === 'object' && icon.name) {
          const {name, color} = icon;
          item.icon = await loadSF2B64(name, color);
        } else if (typeof icon === 'string') {
          const name = decodeURIComponent(icon.substring(icon.lastIndexOf("/") + 1));
          const image = await getCacheImage(name, icon);
          item.icon = await toBase64(image);
        }
      }
    };
    
    /**
     * @param {string} style
     * @param {string} themeColor
     * @param {string} avatar
     * @param {string} popup
     * @param {string} js
     * @returns {string} html
     */
    
    const style =`  
    :root {
      --color-primary: #007aff;
      --divider-color: rgba(60,60,67,0.36);
      --card-background: #fff;
      --card-radius: 10px;
      --list-header-color: rgba(60,60,67,0.6);
    }
      
    td, th {
      padding: 0;
    }
    
    .btn-block {
      display: block;
      width: 100%;
      height: 32px;
      font-size: 14.5px;
    }
    
    .fade {
      opacity: 0;
      transition: opacity .15s linear;
    }
    
    .fade.in {
      opacity: 1;
    }
    
    .modal {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 1050;
      display: none;
      overflow: hidden;
      -webkit-overflow-scrolling: touch;
      outline: 0;
    }
    
    .modal.fade .modal-dialog {
      transform: translate(0,-25%);
      transition: transform .3s ease-out;
    }
    
    .modal.in .modal-dialog {
      transform: translate(0,0);
    }
    
    .modal-open .modal {
      overflow-x: hidden;
      overflow-y: auto;
    }
    
    .modal-dialog {
      position: relative;
      width: auto;
      margin: 72px;
      top: -75%;
    }
    
    .modal-backdrop {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 1040;
      background-color: #000;
    }
    
    .modal-backdrop.fade {
      opacity: 0;
    }
    
    .modal-backdrop.in {
      opacity: .5;
    }
    
    /* style 间隔 f04494 */    
    
    body {
      --theme-color: #ff6800;
      --focus-color: var(--theme-color);
      --main-color: #4e5358;
      --main-shadow: rgba(116, 116, 116, 0.08);
      --main-bg-color: #fff;
      --main-border-color: rgba(50, 50, 50, 0.06);
      --main-radius: 25px;
      --blur-bg: rgba(255, 255, 255, 0.75);
    }
    
    a:focus,a:hover {
      color: var(--focus-color);
      outline: 0;
      text-decoration: none;
    }
    
    .zib-widget {
      clear: both;
      background: var(--main-bg-color);
      padding: 15px;
      box-shadow: 0 0 10px var(--main-shadow);
      border-radius: var(--main-radius);
      margin-bottom: 20px;
    }
    
    .blur-bg {
      -webkit-backdrop-filter: saturate(5) blur(20px);
      backdrop-filter: saturate(5) blur(20px);
      background: var(--blur-bg);
    }
    
    .box-body,.box-header {
      padding: 20px 20 15px 20;
    }
    
    .badg.radius,.but.radius,.radius>.but {
      border-radius: 50px;
      padding: .3em 1em;
    }
    
    .b-blue,.b-blue-2,.b-cyan,.b-gray,.b-green,.b-purple,.b-red,.b-theme,.b-yellow,.jb-blue,.jb-cyan,.jb-green,.jb-pink,.jb-purple,.jb-red,.jb-vip1,.jb-vip2,.jb-yellow {
      color: var(--this-color);
      background: var(--this-bg);
      --this-color: #fff;
    }
    
    .jb-blue,.jb-cyan,.jb-green,.jb-pink,.jb-purple,.jb-red,.jb-vip1,.jb-vip2,.jb-yellow {
      border: none;
    }
    
    .jb-red,.order-type-9 .pay-tag {
      --this-bg: linear-gradient(135deg, #fd7a64 10%, #fb2d2d 100%);
    }
    
    .jb-pink,.order-type-2 .pay-tag {
      --this-bg: linear-gradient(135deg, #ff5e7f 30%, #ff967e 100%);
    }
    
    .jb-yellow,.order-type-3 .pay-tag {
      --this-bg: linear-gradient(135deg, #f59f54 10%, #ff6922 100%);
    }
    
    .jb-blue,.order-type-7 .pay-tag {
      --this-bg: linear-gradient(135deg, #59c3fb 10%, #268df7 100%);
    }
    
    .jb-cyan {
      --this-bg: linear-gradient(140deg, #039ab3 10%, #58dbcf 90%);
    }
    
    .jb-green,.order-type-5 .pay-tag {
      --this-bg: linear-gradient(135deg, #60e464 10%, #5cb85b 100%);
    }
    
    .jb-purple,.order-type-6 .pay-tag {
      --this-bg: linear-gradient(135deg, #f98dfb 10%, #ea00f9 100%);
    }
    
    .jb-vip1,.order-type-4 .pay-tag {
      --this-bg: linear-gradient(25deg, #eabe7b 10%, #f5e3c7 70%, #edc788 100%);
      --this-color: #866127;
    }
    
    .jb-vip2,.order-type-8 .pay-tag {
      --this-bg: linear-gradient(317deg, #4d4c4c 30%, #7b7b7b 70%, #5f5c5c 100%);
      --this-color: #ddd;
    }
    
    .tab-nav-theme li:before, .title-h-center:before, .title-h-left:before, .title-theme:before, .wp-posts-content>h1.has-text-align-center:before, .wp-posts-content>h1.wp-block-heading:before, .wp-posts-content>h1:not([class]):before, .wp-posts-content>h2.has-text-align-center:before, .wp-posts-content>h2.wp-block-heading:before, .wp-posts-content>h2:not([class]):before, .wp-posts-content>h3.has-text-align-center:before, .wp-posts-content>h3.wp-block-heading:before, .wp-posts-content>h3:not([class]):before, .wp-posts-content>h4.has-text-align-center:before, .wp-posts-content>h4.wp-block-heading:before, .wp-posts-content>h4:not([class]):before, .zib-widget>h3:before {
      position: absolute;
      content: "";
      width: 40px;
      height: 3px;
      background: var(--theme-color);
      top: auto;
      left: 0;
      right: 0;
      margin: auto;
      bottom: 3px;
      border-radius: 5px;
      box-shadow: 1px 1px 3px -1px var(--theme-color);
      transition: 0.4s;
    }
    
    .tab-nav-theme li, .title-h-center, .title-h-left, .wp-posts-content>h1.has-text-align-center, .wp-posts-content>h1.wp-block-heading, .wp-posts-content>h1:not([class]), .wp-posts-content>h2.has-text-align-center, .wp-posts-content>h2.wp-block-heading, .wp-posts-content>h2:not([class]), .wp-posts-content>h3.has-text-align-center, .wp-posts-content>h3.wp-block-heading, .wp-posts-content>h3:not([class]), .wp-posts-content>h4.has-text-align-center, .wp-posts-content>h4.wp-block-heading, .wp-posts-content>h4:not([class]), .zib-widget>h3 {
      position: relative;
      padding-bottom: 8px;
    }
    
    .title-h-center:hover:before,.title-h-left:hover:before {
      width: 80px;
    }
    
    .modal {
      padding-right: 0!important;
    }
    
    .modal-title {
      font-size: 16px;
    }
    
    .modal-content {
      border-radius: var(--main-radius);
      background: var(--main-bg-color);
      border: none;
    }
    
    .modal.fade .modal-dialog {
      transform: scale(.9);
      transition: transform .5s cubic-bezier(.32,.85,.45,1.18),width .3s;
    }
    
    .modal.in .modal-dialog {
      transform: scale(1);
    }
    
    .separator {
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .separator-center {
      color: #86868b;
      font-size: 14px;
    }
    
    .separator::after,.separator::before {
      content: "";
      background: var(--main-border-color);
      max-width: 23%;
      height: 1px;
      margin: 0 1em;
      flex: 1;
      background-color: rgba(128, 128, 128, 0.5);
    }
    
    .sign-logo {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .sign-logo img {
      max-width: 180px;
      max-height: 60px;
    }
    
    .sign ul>li {
      margin: 10px 0;
    }
    
    #sign-in,#sign-up {
      padding: 0 10px;
    }
    
    .popup-title {
      text-align: center;
      font-size: 20px;
      margin-top: -18px;
      margin-bottom: 5px;
      font-weight: 420;
    }
    
    .update-content {
      text-align: center;
      font-size: 16px;
    }
    
    /** 头像开始 **/
    
    .form-item-auth {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 3.8em;
      padding: 0.5em 18px;
      position: relative;
    }
    
    .form-item-auth-name {
      margin: 0px 12px;
      font-size: 19px;
      font-weight: 420;
    }
    
    .form-item-auth-desc {
      margin: 0px 12px;
      font-size: 14px;
      font-weight: 400;
    }
    
    .form-label-author-avatar {
      width: 58px;
      height: 58px;
      border-radius:50%;
      border: 1px solid #F6D377;
    }
    
    /** 头像结束 **/
    
    body {
      margin: 85px 0;
      -webkit-font-smoothing: antialiased;
      font-family: "SF Pro Display","SF Pro Icons","Helvetica Neue","Helvetica","Arial",sans-serif;
      accent-color: var(--color-primary);
      font-size: 14px;
      line-height: 1.42857143;
      color: #333;
      background: #f2f2f7;
    }

    button {
      font-weight: 800;
      font-size: 15px;
      border-radius: 20px;
      border: none;
      background: var(--checkbox, #eeeeef);
      padding: 0.15em 1em 0.15em 1em;
    }
    
    .list {
      margin: 15px;
    }
    
    .list__header {
      margin: 0 20px;
      color: var(--list-header-color);
      font-size: 13px;
    }
    
    .list__body {
      margin-top: 6px;
      margin-bottom: 30px;
      background: var(--card-background);
      border-radius: var(--card-radius);
      border-radius: 12px;
      overflow: hidden;
    }
    
    .custom-iframe {
      height: 0px;
    }
    
    .from-music {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 16px;
      min-height: 2.2em;
      padding: 0.3em 20px 0.3em 8px;
      position: relative;
    }
    
    .form-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 16px;
      min-height: 3.8em;
      padding: 0.3em 20px;
      position: relative;
    }
    
    .form-item + .form-item::before {
      content: "";
      position: absolute;
      top: 0;
      left: 20px;
      right: 0;
      border-top: 0.5px solid var(--divider-color);
    }
    
    .form-item .iconfont {
      margin-right: 0px;
    }
    
    .icon-arrow_right {
      color: #86868b;
      font-size: 16px;
    }
    
    .form-item-right-desc {
      font-size: 16px;
      color: #86868b;
      margin: 0 6px 0 auto;
      max-width: 100px;
      max-height: 25px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      justify-content: center;
    }
    
    .form-label {
      display: flex;
      align-items: center;
    }
    
    .form-label-img {
      height: 45px;
    }
    
    .form-label-title {
      margin-left: 12px;
      font-weight: 400;
    }
    
    .form-label-desc {
      margin: 0px 12px;
      font-size: 12px;
      color: #86868b;
    }
    
    input[type='checkbox'][role='switch'] {
      position: relative;
      display: inline-block;
      appearance: none;
      width: 46.6px;
      height: 28px;
      border-radius: 28px;
      background: var(--checkbox, #ddd);
      transition: 0.3s ease-in-out;
    }
    
    input[type='checkbox'][role='switch']::before {
      content: '';
      position: absolute;
      left: 2px;
      top: 2px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #fff;
      transition: 0.3s ease-in-out;
    }
    
    input[type='checkbox'][role='switch']:checked {
      background: #34C759;
    }
    
    input[type='checkbox'][role='switch']:checked::before {
      transform: translateX(18.6px);
    }
    
    .actions {
      margin: 15px;
    }
    
    .copyright {
      margin: 15px;
      margin-inline: 18px;
      font-size: 12px;
      color: #86868b;
    }
    
    .copyright a {
      color: #515154;
      text-decoration: none;
    }
    
    @keyframes spin {
      0% {
        transform: rotate(0);
      }
    
      100% {
        transform: rotate(1turn);
      }
    }
    
    @media (prefers-color-scheme: dark) {
      :root {
        --divider-color: rgba(84,84,88,0.65);
        --card-background: #1c1c1e;
        --list-header-color: rgba(235,235,245,0.6);
        --checkbox: #454545;
      }
        
      .white-theme, .dark-theme {
        --blur-bg: rgba(50, 51, 53, 0.8);
      }
    
      body {
        background: #000;
        color: #fff;
      }
    }`;
    
    //
    const js =`
    (() => {
    const settings = ${JSON.stringify({
      ...settings
    })}
    const formItems = ${JSON.stringify(formItems)}
  
    window.invoke = (code, data) => {
      window.dispatchEvent(
        new CustomEvent(
          'JBridge',
          { detail: { code, data } }
        )
      )
    }
    
    const formData = {};
    const createFormItem = ( item ) => {
      const value = settings[item.name] ?? item.default ?? null
      formData[item.name] = value;
      const label = document.createElement("label");
      const className = item.type === 'cell' || item.type === 'switch' ? "from-music" : "form-item";
      label.className = className;
      label.dataset.name = item.name;
        
      const div = document.createElement("div");
      div.className = 'form-label';
      label.appendChild(div);
      
      if ( item.icon ) {
        const img = document.createElement("img");
        img.src = item.icon;
        img.className = 'form-label-img';
        div.appendChild(img);
      }
      
      const divWrapper = document.createElement("div");
      const divTitle = document.createElement("div");
      divTitle.className = 'form-label-title';
      divTitle.innerText = item.label;
      divWrapper.appendChild(divTitle);
      
      if ( item.desc ) {
        const divDesc = document.createElement("div");
        divDesc.className = 'form-label-desc';
        divDesc.innerText = item.desc;
        divWrapper.appendChild(divDesc);
      }
      div.appendChild(divWrapper);
      
      if ( item.type === 'cell' || item.type === 'button' ) {
        if ( item.rightDesc ) {
          const desc = document.createElement("div");
          desc.className = 'form-item-right-desc';
          desc.innerText = item.rightDesc;
          label.appendChild(desc);
        }
        
        label.classList.add('form-item--link');
        if (item.type === 'cell') {
          const icon = document.createElement('i');
          icon.className = 'iconfont icon-arrow_right'
          label.appendChild(icon);
        } else {
          const button = document.createElement('button');
          button.name = 'button';
          button.innerText = '获取';
          button.className = 'iconfont icon-arrow_bottom';
          label.appendChild(button);
        }
        label.addEventListener('click', (e) => {
          invoke(item.name, item);
        });
      } else {
        const input = document.createElement("input")
        input.className = 'form-item__input'
        input.name = item.name
        input.type = item.type
        input.enterKeyHint = 'done'
        input.value = value
        
        if (item.type === 'switch') {
          input.type = 'checkbox'
          input.role = 'switch'
          input.checked = value
        }
        input.addEventListener("change", (e) => {
          formData[item.name] =
            item.type === 'switch'
            ? e.target.checked
            : e.target.value;
          invoke('changeSettings', formData)
        });
        label.appendChild(input);
      }
      return label;
    };
  
    const createList = (list, title) => {
      const fragment = document.createDocumentFragment()
  
      let elBody;
      for (const item of list) {
        if (item.type === 'group') {
          const grouped = createList(item.items, item.label)
          fragment.appendChild(grouped)
        } else {
          if (!elBody) {
            const groupDiv = fragment.appendChild(document.createElement('div'))
            groupDiv.className = 'list'
            if (title) {
              const elTitle = groupDiv.appendChild(document.createElement('div'))
              elTitle.className = 'list__header'
              elTitle.textContent = title
            }
            elBody = groupDiv.appendChild(document.createElement('div'))
            elBody.className = 'list__body'
          }
          const label = createFormItem(item)
          elBody.appendChild(label)
        }
      }
      return fragment
    };
    const fragment = createList(formItems);
    document.getElementById('settings').appendChild(fragment);
    document.getElementById('clearCache').addEventListener('click', () => {
      invoke('clearCache');
    });
      
document.getElementById('telegram').addEventListener('click', () => {
      invoke('telegram');
    });    
    
  })()`;

    // 主菜单头像信息
    const mainMenuTop = async () => {
      const avatarHtml = `    
      <div class="list">
        <form class="list__body" action="javascript:void(0);">
          <label class="but form-item-auth form-item--link" >
            <div class="form-label">
              <img class="signin-loader form-label-author-avatar" src="${authorAvatar}"/>
              <div id="telegram">
                <div class="form-item-auth-name">95度茅台</div>
                <div class="form-item-auth-desc">加入 Scriptable小 组件交流群
                </div>
              </div>
            </div>
            <div class="form-label">
              <i class="iconfont icon-arrow_right"></i>
            </div>
          </label>
        </form>
      </div> `;
      
      const popup = `      
      <div class="modal fade" id="u_sign" role="dialog">
        <div class="modal-dialog">
          <div class="sign zib-widget blur-bg relative">
            <div id="appleHub" class="box-body sign-logo">
              <img src="${appleHub}" class="lazyload">
            </div>
            <div class="box-body">
              <div class="title-h-center fa-2x popup-title">
                ${scriptName}
              </div>
              <a class="muted-color px30 update-content">
                <div class="but">
                  Version ${version}
                </div>
              </a><br>
              <div class="form-label-title"> <li>${updateDate}&nbsp;🔥</li> <li>Scriptable桌面小组件</li> <li>更多组件敬请期待</li>
              </div>
            </div>
            <div class="box-body">
              <div id="sign-in">
                <button type="button" class="but radius jb-yellow padding-lg btn-block" id="clearCache">
                  清除缓存
                </button>
              </div>
            </div>
            <p class="social-separator separator separator-center">95度茅台</p>
          </div>
        </div>
      </div>
      <script type="text/javascript">
        setTimeout(function() {
          $('${updateVersionNotice()}').click();
        }, 1200);
        window._win = { uri: 'https://zibll.com/wp-content/themes/zibll', loading: '0' };
      </script>`;
      
      const songId = [
        '8fk9B72BcV2',
        '8duPZb8BcV2',
        '6pM373bBdV2'
      ];
      const randomId = songId[Math.floor(Math.random() * songId.length)];
      const music = `
      <iframe data-src="https://t1.kugou.com/song.html?id=${randomId}" class="custom-iframe" frameborder="0" scrolling="auto">
      </iframe>
      <script>
        const iframe = document.querySelector('.custom-iframe');
        iframe.src = iframe.getAttribute('data-src');
      </script>
      `;
      
      return `
        ${settings.music === true ? music : ''}
        <!-- 弹窗 -->
        ${avatarHtml}
        ${popup}
        ${scriptTags.join('\n')}
      `
    };
    
    // HTML
    const html =`
    <html>
      <head>
        <meta name='viewport' content='width=device-width, user-scalable=no, viewport-fit=cover'>
        <link rel="stylesheet" href="//at.alicdn.com/t/c/font_3772663_kmo790s3yfq.css" type="text/css">
        <style>${style}</style>
      </head>
      <body class="${themeColor}-theme nav-fixed site-layout-1">
        ${await mainMenuTop()}
        ${head || ''}
        <section id="settings">
        </section>
        <script>${js}</script>
      </body>
    </html>`;
  
    const webView = new WebView();
    await webView.loadHTML(html, $);
    
    // 清除缓存
    const clearCache = async () => {
      const action = await generateAlert(
        title = '清除缓存',
        message = '是否确定删除所有缓存？\n离线内容及图片均会被清除。',
        options = ['取消', '清除']
      );
      if ( action == 1 ) {
        fm.remove(cache);
        Safari.open('scriptable:///run/' + encodeURIComponent(uri));
      }
    };
    
    // 注入监听器
    const injectListener = async () => {
      const event = await webView.evaluateJavaScript(
        `(() => {
          const controller = new AbortController()
          const listener = (e) => {
            completion(e.detail)
            controller.abort()
          }
          window.addEventListener(
            'JBridge',
            listener,
            { signal: controller.signal }
          )
        })()`,
        true
      ).catch((err) => {
        console.error(err);
      });
      
      const { code, data } = event;
      if (code === 'clearCache' && fm.fileExists(cache)) {
        await clearCache();
      } else if (code !== 'telegram' && data.scrUrl) {
        const { label } = data;
        try {
          const fm = FileManager.iCloud();
          const script = await new Request(data.scrUrl).loadString();
          fm.writeString(fm.documentsDirectory() + `/${label}.js`, script);
          Safari.open(`scriptable:///run/${encodeURIComponent(label)}`);
        } catch (e) {
          console.log(e)
          notify(label + ' ⚠️', '获取失败，请检查网络是否通畅');
        }
      }
      
      switch (code) {
        case 'telegram':
          Safari.openInApp('https://t.me/+CpAbO_q_SGo2ZWE1', false);
          break;
        case 'changeSettings':
          Object.assign(settings, data);
          writeSettings(settings);
          break;
        case 'effect':
          const view = new WebView();
          view.loadURL('https://gitcode.net/4qiao/framework/raw/master/img/picture/Example.png');
          view.present();
          break;
      };
      await injectListener();
    };
  
    injectListener().catch((e) => {
      console.error(e);
    });
    await webView.present();
  };
  
  // 主菜单
  await renderAppView({
    formItems: [
      {
        type: 'group',
        items: [
          {
            label: '组件效果图',
            name: 'effect',
            type: 'cell'
          }
        ]
      },
      {
        label: '新版组件',
        type: 'group',
        items: [
          {
            label: '中国电信_2',
            desc: '剩余流量、流量和余额',
            rightDesc: '1.0.5',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/moduleTelecom.js',
            icon: `${rootUrl}img/icon/telecom_2.png`
          },
          {
            label: '交管12123_2',
            desc: '违章信息、累积记分',
            rightDesc: '1.2.7',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/module12123.js',
            icon: `${rootUrl}img/icon/new12123.png`
          },
          {
            label: '全国油价_2',
            desc: '每日油价，油价预警',
            rightDesc: '1.0.5',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/moduleOilPrice.js',
            icon: `${rootUrl}img/icon/oilPrice2.png`
          }
        ]
      },
      {
        label: '桌面组件',
        type: 'group',
        items: [
          {
            label: '中国电信',
            desc: '剩余流量、流量和余额',
            rightDesc: '1.0.3',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/scriptable/raw/master/api/bottomBar.js',
            icon: `${rootUrl}img/icon/telecom.png`
          },
          {
            label: '交管12123',
            desc: '违章信息，累积记分',
            rightDesc: '1.2.5',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/scriptable/raw/master/api/bottomBar.js',
            icon: `${rootUrl}img/icon/12123.png`
          },
          {
            label: '全国油价',
            desc: '每日油价，油价预警',
            rightDesc: '1.2.0',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/scriptable/raw/master/api/bottomBar.js',
            icon: `${rootUrl}img/icon/map.gif`
          },
          {
            label: '负一屏底栏',
            desc: '高仿通知样式，未来两小时天气',
            rightDesc: '1.2.0',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/scriptable/raw/master/api/bottomBar.js',
            icon: `${rootUrl}img/icon/bottomBars.png`
          },
          {
            label: '南网在线',
            desc: '昨日用电量，月用电量，账单',
            rightDesc: '1.0.1',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/module_south_PowerGrid.js',
            icon: `${rootUrl}img/icon/electric.png`
          },
          {
            label: '随机组件',
            desc: '随机切换多个小组件',
            rightDesc: '1.1.5',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/scriptable/raw/master/api/randomScript.js',
            icon: `${rootUrl}img/icon/random.png`
          },
          {
            label: '房屋估值',
            desc: '幸福里全国房屋估值',
            rightDesc: '1.0.0',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/scriptable/raw/master/api/housePrice.js',
            icon: `${rootUrl}img/icon/house.png`
          },
          {
            label: '澳门六合彩',
            desc: '新旧版澳门六合彩每日开奖结果',
            rightDesc: '1.0.2',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/module_macaujc.js',
            icon: `${rootUrl}img/icon/macaujc.png`
          }
        ]
      },
      {
        label: '京东系列组件',
        type: 'group',
        items: [
          {
            label: 'JD_刘强冬',
            desc: '京豆、白条额度、农场、签到等',
            rightDesc: '1.0.5',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/moduleJD.js',
            icon: `${rootUrl}img/icon/jd.png`
          },
          {
            label: '京东收支账单',
            desc: '京东收支账单、白条、总资产',
            rightDesc: '1.0.3',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/moduleJD_Bill.js',
            icon: `${rootUrl}img/icon/jingDong.png`
          },
          {
            label: '京东小白鹅',
            desc: '白条信息、白条等级',
            rightDesc: '1.0.3',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/moduleJD_baitiao.js',
            icon: `${rootUrl}img/icon/jingDong.png`
          },
          {
            label: '京东小金库',
            desc: '资产，累积收益等',
            rightDesc: '1.0.0',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/module_jd_finance.js',
            icon: 'https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/finance.png',
          },
          {
            label: '京东汪汪',
            desc: '汪汪庄园30张Joy图',
            rightDesc: '1.0.0',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/module_jd_Joy.js',
            icon: `${rootUrl}img/icon/jd_wangWang.png`
          }
        ]
      },
      {
        label: '工具类',
        type: 'group',
        items: [
          {
            label: 'JD_SchemeUrl',
            desc: '跳转京东App指定页面URL',
            rightDesc: '1.0.0',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/scriptable/raw/master/api/jd_schemeUrl.js',
            icon: `${rootUrl}img/icon/jd_green.png`
          },
          {
            label: '清空回收站',
            desc: '一键清空Scriptable回收站',
            rightDesc: '1.0.1',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/scriptable/raw/master/api/cleanTrash.js',
            icon: `${rootUrl}img/icon/cleanFiles.png`
          }
        ]
      },
      {
        type: 'group',
        items: [
          {
            label: '背景音乐',
            name: 'music',
            type: 'switch',
            default: true
          }
        ]
      }
    ]
  }, true);
}
module.exports = { main }