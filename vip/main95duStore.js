// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: cog;

async function main() {
  const uri = Script.name();
  const scriptName = 'Script Store'
  const version = '1.0.1'
  const updateDate = '2023年07月09日'
  
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
    effect: true,
    music: true
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
    if ( version !== settings.version ) {
      return '.signin-loader';
      settings.version = version;
      writeSettings(settings);
    }
    return null
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
  if (!fm.fileExists(cache)) {
    notify('正在初始化...', '首次运行需缓存图片及加载数据，请等待 15 秒。');
    fm.createDirectory(cache);
  };
  
  const useFileManager = () => {
    return {
      readString: (fileName) => {
        const filePath = fm.joinPath(cache, fileName);
        return fm.readString(filePath);
      },
      writeString: (fileName, content) => fm.writeString(fm.joinPath(cache, fileName), content),  
      // cache Image
      readImage: (fileName) => {
        const imgPath = fm.joinPath(cache, fileName);
        return fm.fileExists(imgPath) ? fm.readImage(imgPath) : null;
      },
      writeImage: (fileName, image) => fm.writeImage(fm.joinPath(cache, fileName), image)
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
    const cache = useFileManager();
    const cssString = cache.readString(cssFileName);
    if (cssString) return cssString;
    const response = await getString(cssFileUrl);
    cache.writeString(cssFileName, response);
    return response;
  };
  
  /**
   * 获取网络图片并使用缓存
   * @param {Image} url
   */
  const toBase64 = (img) => {
    return `data:image/png;base64,${Data.fromPNG(img).toBase64String()}`
  };
    
  const getImage = async (url) => {
    return await new Request(url).loadImage();
  };
  
  const getCacheImage = async (name, url) => {
    const cache = useFileManager();
    const image = cache.readImage(name);
    if ( image ) {
      return toBase64(image);
    }
    const img = await getImage(url);
    cache.writeImage(name, img);
    return toBase64(img);
  };
  
  // 获取预览图片
  const fetchImages = async () => {
    const imageUrls = [
      // imageUrls
    ];
    const images = await Promise.all(
      imageUrls.map(async (imageUrl, index) => {
        const imageName = `picture${index + 1}.png`;
        return await getCacheImage(imageName, imageUrl);
      })
    );
    return toBase64(images);
  };
  
  
  // ====== web start ======= //
  const renderAppView = async (options) => {
    const {
      formItems = [],
      head,
      avatarInfo
    } = options;
    
    // themeColor
    const [themeColor, logoColor] = Device.isUsingDarkAppearance() ? ['dark', 'white'] : ['white', 'black'];

    const appleHub = await getCacheImage(`${logoColor}.png`, `${rootUrl}img/picture/appleHub_${logoColor}.png`);
    
    const authorAvatar = fm.fileExists(getAvatarImg()) ? await toBase64(fm.readImage(getAvatarImg()) ) : await getCacheImage('author.png', `${rootUrl}img/icon/4qiao.png`);
    
    const scripts = ['jquery.min.js', 'bootstrap.min.js', 'loader.js'];
    const scriptTags = await Promise.all(scripts.map(async (script) => {
      const content = await getCacheString(script, `${rootUrl}web/${script}?ver=7.4.2`);
      return `<script>${content}</script>`;
    }));
    
    for (const i of formItems) {
      for (const item of i.items) {
        if (item.data) {
          const { name, appUrl } = item.data;
          item.icon = await getCacheImage(name, appUrl);
        }
        const { icon } = item;
        if (icon?.name) {
          const {name, color} = icon;
          item.icon = await loadSF2B64(name, color);
        } else if (icon?.startsWith('https')) {
          const imageName = decodeURIComponent(icon.substring(icon.lastIndexOf("/") + 1));
          item.icon = await getCacheImage(imageName, icon);
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
      --desc-background: #86868b;
      --card-radius: 10px;
      --list-header-color: rgba(60,60,67,0.6);
      --update-desc: hsl(0, 0%, 20%);
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
      /* overflow-y: auto; 纵向滑动 */
    }
    
   .modal-dialog {
      position: relative;
      width: auto;
      margin: ${Device.screenSize().height < 926 ? '62px' : '78px'};
      top: ${Device.screenSize().height < 926 ? '-125.5%' : '-115.5%'}; /* 弹窗位置 每加一个组件 + 6 */
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
    
    .modal-open {
      overflow: hidden;
    }
    
    .modal.fade .modal-dialog {
      transform: scale(.9);
      transition: transform .5s cubic-bezier(.32,.85,.45,1.18),width .3s;
    }
    
    .modal.in .modal-dialog {
      transform: scale(1);
    }
    
    /* 弹窗 body f04494 */
    body {
      --theme-color: #ff6800;
      --focus-color: var(--theme-color);
      --main-color: #4e5358;
      --main-shadow: rgba(116, 116, 116, 0.08);
      --main-bg-color: #fff;
      --main-radius: 25px;
      --blur-bg: rgba(255, 255, 255, 0.75);
    }
    
    a:focus,a:hover {
      color: var(--focus-color);
      outline: 0;
      text-decoration: none;
    }
    
    .scriptable-widget {
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
      padding: 20px 20px 10px 20px;
    }
    
    .badg.radius,.but.radius,.radius>.but {
      border-radius: 50px;
      padding: .3em 1em;
    }
    
    .jb-blue,.jb-cyan,.jb-green,.jb-pink,.jb-purple,.jb-red,.jb-vip,.jb-vip2,.jb-yellow {
      color: var(--this-color);
      background: var(--this-bg);
      --this-color: #fff;
    }
    
    .jb-blue,.jb-cyan,.jb-green,.jb-pink,.jb-purple,.jb-red,.jb-vip,.jb-vip2,.jb-yellow {
      border: none;
    }
    
    .jb-yellow{
      --this-bg: linear-gradient(135deg, #f59f54 10%, #ff6922 100%);
    }
    
    .jb-vip {  
      --this-bg: linear-gradient(25deg, #eabe7b 10%, #f5e3c7 70%, #edc788 100%);
      --this-color: #866127;
    }
      
    .title-h-center:before {
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
    
    .title-h-center {
      position: relative;
      padding-bottom: 7px;
    }
    
    .title-h-center:hover:before {
      width: 100px;
    }
    
    .separator {
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #86868b;
      font-size: 14px;
    }
    
    .separator::after,
    .separator::before {
      content: "";
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
    
    /* 弹窗 content */
    .popup-title {
      text-align: center;
      font-size: 20px;
      margin-top: -18px;
      margin-bottom: 5px;
      font-weight: 500;
    }
    
    .popup-version {
      text-align: center;
      font-size: 16px;
      color: var(--update-desc);
    }
    
    .popup-content {
      margin-left: 12px;
      color: var(--update-desc);
    }
    
    /** 头像开始 **/
    .form-item-auth {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 3.8em;
      padding: 0.8em 18px;
      position: relative;
    }
    
    .form-item-auth-name {
      margin: 0px 12px;
      font-size: 18px;
      font-weight: 420;
    }
    
    .form-item-auth-desc {
      margin: 0px 12px;
      font-size: 14px;
      color: var(--desc-background);
    }
    
    .form-label-author-avatar {
      width: 58px;
      height: 58px;
      border-radius:50%;
      border: 1px solid #F6D377;
    }
    
    .centered-image {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 0px;
    }
    
    .full-width-image {
      width: 100%;
      height: 225px;
    }
    /** 头像结束 **/
    
    /* 跳转提示框开始 */  
    .popup {
      position: fixed;
      top: -50px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #1B9AF1;
      font-size: 14px;
      color: #fff;
      border-radius: 50px;
      padding: 10px;
      width: 130px;
      height: 20px;
      opacity: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      transition: top 0.7s ease-in-out, opacity 0.5s ease-in-out;
    }
    
    .popup.show {
      top: 1.25%;
      opacity: 1;
    }
    
    .fd {
      animation: fd 0.15s ease-in-out;
    }
    
    @keyframes fd {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    /* 跳转提示框结束 */
    
    /* 打字机动画 */  
    .typing-indicator {
      display: inline-block;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background-color: #000;
      margin-left: 8px;
      vertical-align: middle;
      animation: typing-dot 0.4s infinite;
    }
    /* 打字机动画结束 */
    
    body {
      margin: ${!settings.music ? '70px' : '60px'} 0;
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
      overflow: hidden;
    }
    
    .custom-iframe {
      height: 0px;
    }
    
    .form-item,
    .from-music {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 16px;
      position: relative;
    }
    
    .form-item {
      min-height: 3.8em;
      padding: 0.3em 20px;
    }
    
    .from-music {
      min-height: 2.2em;
      padding: 0.3em 20px 0.3em 8px;
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
      font-size: 14px;
      color: #86868b;
      /* margin: 0 6px 0 auto; */
      max-width: 100px;
      max-height: 15px;
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
      height: 46px;
      border-radius: 12px;
      border: 1px solid var(--solid-color, #ddd);
    }
    
    .form-label-title {
      margin-left: 12px;
      font-weight: 420;
    }
    
    .form-label-desc {
      margin: 0px 12px;
      font-size: 13px;
      color: var(--desc-background);
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
    
    /* AppStore 样式 */
    .app {
      background: var(--card-background);
      border-radius: var(--card-radius);
      overflow: hidden;
    }
  
    .app-head {
      display: flex;
      padding: 18px 20px;
    }
    
    .app-icon {
      width: 60px;
      height: 60px;
      background: #eee;
      border-radius: 15px;
      border: 1px solid var(--solid-color, #eee);
      object-fit: cover;
    }
    
    .app-right {
      margin-left: 1em;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .app-name {
      font-size: 16px;
      font-weight: bold;
    }
    
    .app-desc {
      font-size: 0.85em;
      color: var(--desc-background);
    }
    
    .app-score {
      font-size: 0.75em;
      color: var(--desc-background);
    }
    
    .app-imgs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      column-gap: 0.5rem;
      padding: 0 1.25rem 1.125rem 1.25rem;
    }
    
    .app-img {
      width: 100%;
      aspect-ratio: 392 / 848;
      background: #eee;
      border-radius: 0.8rem;
      object-fit: cover;
    }
    /* AppStore 结束 */
    
    .icon-loading {
      display: inline-block;
      animation: 1s linear infinite spin;
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
        --solid-color: #1c1c1e;
        --desc-background: darkGrey;
        --update-desc: hsl(0,0%,80%);
      }
      
      .white-theme, .dark-theme {
        --blur-bg: rgba(50,51,53,0.8);
      }
    
      body {
        background: #000;
        color: #fff;
      }
    }`;
    
    // Java Script
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
      const value = settings[item.name] ?? item.default
      formData[item.name] = value;
      
      const label = document.createElement("label");  
      label.classList.add("form-item");
      if (item.type !== 'button') label.classList.add("from-music");
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
        
      if (['cell', 'button', 'page'].includes(item.type)) {
        const labelClickHandler = ( e ) => {
          const { name } = item;
          const methodName = name === 'effect' ? 'itemClick' : name;
          invoke(methodName, item);
        };
        label.addEventListener('click', labelClickHandler);
      
        const addIconOrDesc = () => {
          if (['cell', 'page'].includes(item.type)) {
            const icon = document.createElement('i');
            icon.className = 'iconfont icon-arrow_right';
            label.appendChild(icon);
          } else {
            const cntr = document.createElement('div');
            
            const button = document.createElement('button');
            button.name = 'button';
            button.innerText = '获取';
            button.className = 'iconfont icon-arrow_bottom';
            cntr.appendChild(button);
            
            const desc = document.createElement("div");
            desc.className = 'form-item-right-desc';
            desc.innerText = item.rightDesc;
            cntr.appendChild(desc);
            button.addEventListener('click', () => button.style.color = 'darkGray');
      
            label.appendChild(cntr);
          }
        };
        addIconOrDesc();
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
          invoke('changeSettings', formData);

          !formData.music ? iframe.src = '' : iframe.src = iframe.getAttribute('data-src');
        });
        label.appendChild(input);
      }
      return label;
    };
  
    // 创建列表
    const createList = (list, title) => {
      const fragment = document.createDocumentFragment();
      let elBody;
      let isHeaderAdded = false;
    
      for (const item of list) {
        if (item.type === 'group') {
          const grouped = createList(item.items, item.label);
          fragment.appendChild(grouped);
        } else if (item.type === 'app') {
          const groupDiv = fragment.appendChild(document.createElement('div'));
          groupDiv.className = 'list';
    
          if ( title && !isHeaderAdded ) {
            const elTitle = groupDiv.appendChild(document.createElement('div'));
            elTitle.className = 'list__header';
            elTitle.textContent = title;
            isHeaderAdded = true;
          }
    
          elBody = groupDiv.appendChild(document.createElement('div'));
          elBody.className = 'list__body';
    
          const { name, desc, date, appUrl, images } = item.data;
          const app = elBody.appendChild(document.createElement('div'));
          app.className = 'app';
          app.innerHTML =
          \`<div class="app-head">
            <img class="app-icon" src="\${appUrl}"></img>
            <div class="app-right">
              <div>
                <div class="app-name">\${name}</div>
                <div class="app-desc">\${desc}</div>
                <div class="app-score">\${date}</div>
              </div>
              <button class="iconfont icon-arrow_bottom">获取</button>
            </div>
          </div>
          <div class="app-imgs">
          \${images.map((img) => (
            \`<img class="app-img" src="\${img}"></img>\`
          )).join('')}
          </div>\`;

          const button = app.querySelector('.icon-arrow_bottom');
          button.addEventListener('click', (e) => {
            button.style.color = 'darkGrey';
            invoke('widget', item);
          });
        } else {
          if ( !elBody ) {
            const groupDiv = fragment.appendChild(document.createElement('div'));
            groupDiv.className = 'list';
            
            if ( title ) {
              const elTitle = groupDiv.appendChild(document.createElement('div'));
              elTitle.className = 'list__header';
              elTitle.textContent = title;
            }
    
            elBody = groupDiv.appendChild(document.createElement('div'));
            elBody.className = 'list__body';
          }
    
          const label = createFormItem(item);
          elBody.appendChild(label);
        }
      }
      return fragment;
    };
    
    const fragment = createList(formItems);
    document.getElementById('settings').appendChild(fragment);
    
    /** 加载动画 loading **/  
    const toggleLoading = (e) => {
      const target = e.currentTarget
      target.classList.add('loading')
      const icon = target.querySelector('.iconfont');
      const className = icon.className;
      icon.className = 'iconfont icon-loading';
    
      const listener = (event) => {
        if (event.detail.code) {
          target.classList.remove('loading');
          icon.className = className;
          window.removeEventListener(
            'JWeb', listener
          );
        }
      };
      window.addEventListener('JWeb', listener);
    };
    
    document.querySelectorAll('.form-item').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const name = e.currentTarget.dataset.name;
        if (name === 'effect' || btn.classList.contains('from-music')) { toggleLoading(e) }
      });
    });
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
          <img class="full-width-image signin-loader" data-src="${rootUrl}img/picture/widget.gif">
          <div class="form-item-auth form-item--link">
            <div class="form-label">
              <img class="signin-loader form-label-author-avatar" src="${authorAvatar}" />
              <div id="telegram">
                <div class="form-item-auth-name">95du丶茅台</div>
                <a class="but form-item-auth-desc chat-message"></a>
              </div>
            </div>
            <div class="form-label">
              <button id="plus" class="but jb-vip">PLUS</button>
              <div id="popup" class="popup"><p>加载中...</p>
              </div>
            </div>
          </div>
        </form>
      </div>
      <script>
        const myGif = document.querySelector('.full-width-image');
        myGif.src = myGif.getAttribute('data-src');
        document.querySelector('#plus').addEventListener('click', (e) => {
          e.preventDefault();
          const popupTips = document.getElementById("popup").classList;
          popupTips.add("show", "fd")
          setTimeout(() => {
            popupTips.remove("fd");
            setTimeout(() => popupTips.remove("show"), 1000);
          }, 1800);
          invoke('plus');
        });
        
        const message = 'Scriptable 组件脚本交流群';
        const chatMessage = document.querySelector(".chat-message");
        chatMessage.textContent = ''
        
        let currentChar = 0;
        function typeNextChar() {
          if (currentChar < message.length) {
            chatMessage.textContent += message[currentChar++];
            chatMessage.scrollTop = chatMessage.scrollHeight;
            setTimeout(typeNextChar, 100);
          }
        }
        typeNextChar();
      </script>`;
      
      //弹窗
      const popup = `      
      <div class="modal fade" id="u_sign" role="dialog">
        <div class="modal-dialog">
          <div class="scriptable-widget blur-bg">
            <div id="appleHub" class="box-body sign-logo">
              <img src="${appleHub}">
            </div>
            <div class="box-body">
              <div class="title-h-center popup-title">
                ${scriptName}
              </div>
              <a id="version" class="popup-version">
                <div class="but">
                  Version ${version}
                </div>
              </a><br>
              <div class="popup-content"> <li>${updateDate}&nbsp;</li> <li>Scriptable桌面小组件</li> <li>性能优化，改进用户体验</li>
              </div>
            </div>
            <div class="box-body">
              <div id="sign-in">
                <button class="but radius jb-yellow btn-block" id="clearCache">清除缓存</button>
              </div>
            </div>
            <p class="separator">
              95度茅台</p>
          </div>
        </div>
      </div>
      <script>
        setTimeout(function() {
          $('${updateVersionNotice()}').click();
        }, 1200);
        window._win = { uri: 'https://bbs.applehub.cn/wp-content/themes/zibll' };
      </script>`;
      
      const songId = [
        '8fk9B72BcV2',
        '8duPZb8BcV2',
        '6pM373bBdV2',
        '6NJHhd6BeV2'
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
        ${avatarHtml}
        ${popup}
        ${scriptTags.join('\n')}
      `
    };
    
    // 组件效果图
    const previewEffectImgHtml = async () => {
      const previewImgUrl = Array.from({ length: 3 }, (_, index) => `${rootUrl}img/picture/Example_${index}.png`);

      const previewImgs = await Promise.all(previewImgUrl.map(async (item) => {
        const imgName = decodeURIComponent(item.substring(item.lastIndexOf("/") + 1));
        const previewImg = await getCacheImage(imgName, item);
        return previewImg;
      }));
      return `
      <div>
        ${previewImgs.map((img) => `<img src="${img}">`).join('')}
      </div>`
    };
    
    // =======  HTML  =======//
    const html =`
    <html>
      <head>
        <meta name='viewport' content='width=device-width, user-scalable=no, viewport-fit=cover'>
        <link rel="stylesheet" href="https://at.alicdn.com/t/c/font_3772663_kmo790s3yfq.css" type="text/css">
        <style>${style}</style>
      </head>
      <body class="${themeColor}-theme site-layout-1">
        ${avatarInfo ? await mainMenuTop() : await previewEffectImgHtml()}
        ${head || ''}
        <section id="settings">
        </section>
        <script>${js}</script>
      </body>
    </html>`;
  
    const webView = new WebView();
    await webView.loadHTML(html);
    
    // 清除缓存
    const clearCache = async () => {
      const action = await generateAlert(
        '清除缓存', '是否确定删除所有缓存？\n离线数据及图片均会被清除。',
        options = ['取消', '清除']
      );
      if ( action == 1 ) {
        fm.remove(mainPath);
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
      } else if (data?.type === 'button' || data?.type === 'app') {
        const { label, scrUrl, rightDesc } = data;
        try {
          const fm = FileManager.iCloud();
          const script = await getString(scrUrl);  
          const scrLable = fm.documentsDirectory() + `/${label}.js`;
          fm.writeString(scrLable, script);
          Pasteboard.copy(scrUrl);
          notify(`已拷贝（${label}）可用于随机/循环组件`, scrUrl);
          Safari.open(`scriptable:///run/${encodeURIComponent(label)}`);
        } catch (e) {
          console.log(e)
          notify(label + ' ⚠️', '获取失败，请在设置中打开Sync Script Order');
        }
      };
      
      switch (code) {
        case 'plus':
          Timer.schedule(1000, false, () => { Safari.openInApp('https://scriptore.imarkr.com', false) });
          break;
        case 'telegram':
          Timer.schedule(300, false, () => { Safari.openInApp('https://t.me/+CpAbO_q_SGo2ZWE1', false) });
          break;
        case 'changeSettings':
          Object.assign(settings, data);
          writeSettings(settings);
          break;
        case 'itemClick':
          if (data.type === 'page') {
            const item = (() => {
              const find = (i) => {
                for (const el of i) {
                  if (el.name === data.name) return el
                  if (el.type === 'group') {
                    const r = find(el.items);
                    if (r) return r
                  }
                }
                return null
              };
              return find(formItems)
            })();
            await renderAppView(item, false, { settings });
          } else {
            await onItemClick?.(data, { settings });
          }
          break;
      };
      // Remove Event Listener
      if ( event ) {
        webView.evaluateJavaScript(
          "window.dispatchEvent(new CustomEvent('JWeb', { detail: { code: 'finishLoading' } }))",
          false
        );
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
    avatarInfo: true,
    formItems: [
      {
        type: 'group',
        items: [
          {
            label: '组件效果图',
            name: 'effect',
            type: 'page',
            default: true
          }
        ]
      },
      {
        label: '新版组件',
        type: 'group',
        items: [
          {
            label: '人民币汇率',
            desc: '常用国际货币汇率',
            rightDesc: '1.0.0',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/web_module_exchange_rate.js',
            icon: `${rootUrl}img/icon/exchange_rate.png`
          },
          {
            label: '开奖结果',
            desc: '体育彩票、福彩彩票',
            rightDesc: '1.0.4',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/web_module_lottery.js',
            icon: `${rootUrl}img/icon/lottery.png`
          },
          {
            label: '交管12123_2',
            desc: '违章信息、累积记分',
            rightDesc: '1.0.0',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/web_module_12123.js',
            icon: `${rootUrl}img/icon/new12123.png`
          },
          {
            label: '中国电信_2',
            desc: '剩余流量、语音和余额',
            rightDesc: '1.0.0',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/web_module_china_telecom.js',
            icon: `${rootUrl}img/icon/telecom_2.png`
          },
          {
            label: '全国油价_2',
            desc: '每日油价，油价预警',
            rightDesc: '1.0.0',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/web_module_oil_price.js',
            icon: `${rootUrl}img/icon/oilPrice2.png`
          }
        ]
      },
      {
        label: '最新发布',
        type: 'group',
        items: [
          {
            label: '车辆_GPS',
            type: 'app',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/web_module_GPS.js',
            data: {
              name: '车辆定位（ GPS ）',
              desc: '桌面小组件',
              date: '2023年8月12日',
              appUrl: 'https://is5-ssl.mzstatic.com/image/thumb/Purple126/v4/ce/f7/db/cef7db26-5d5c-46f6-69eb-a567791be8bf/AppIcon-ZhiAnXing-0-0-1x_U007emarketing-0-0-0-5-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.png',
              images: [
                'https://is3-ssl.mzstatic.com/image/thumb/PurpleSource114/v4/6c/8a/fa/6c8afa2e-7719-b53f-7478-7810987b3e00/3c647b6a-3d67-4bf3-87d9-2b1dcda00a62_1.png/392x696bb.png',
                'https://is2-ssl.mzstatic.com/image/thumb/PurpleSource124/v4/a7/9d/90/a79d9099-668c-d587-cc32-e15bfbd04d6e/29e0a192-f793-4917-9961-402484ee2bd0_2.png/392x696bb.png',
                'https://is2-ssl.mzstatic.com/image/thumb/PurpleSource124/v4/27/53/d1/2753d127-7fb0-14a5-8af8-0cb3470a8e6b/9aff51bb-4936-45b7-9d51-8beabd6073de_3.png/392x696bb.png'
              ]
            }
          },
        ]
      },
      {
        label: '桌面组件',
        type: 'group',
        items: [
          {
            label: '中国电信',
            desc: '剩余流量、语音和余额',
            rightDesc: '1.0.3',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/scriptable/raw/master/api/telecom.js',
            icon: `${rootUrl}img/icon/telecom.png`
          },
          {
            label: '交管12123',
            desc: '违章信息，累积记分',
            rightDesc: '1.2.5',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/scriptable/raw/master/api/violation.js',
            icon: `${rootUrl}img/icon/12123.png`
          },
          {
            label: '全国油价',
            desc: '每日油价，油价预警',
            rightDesc: '1.2.0',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/scriptable/raw/master/api/oils.js',
            icon: `${rootUrl}img/icon/oilPrice2.png`
          },
          {
            label: '负一屏底栏',
            desc: '显示未来两小时天气',
            rightDesc: '1.3.0',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/scriptable/raw/master/api/bottomBar.js',
            icon: `${rootUrl}img/icon/bottomBars.png`
          },
          {
            label: '南网在线_2',
            desc: '昨日用电量，账单',
            rightDesc: '1.0.0',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/web_module_powerGrid.js',
            icon: `${rootUrl}img/icon/electric.png`
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
            desc: '新旧版每日开奖结果',
            rightDesc: '1.0.2',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/module_macaujc.js',
            icon: `${rootUrl}img/icon/macaujc.png`
          },
          {
            label: '循环组件',
            desc: '循环切换显示小组件',
            rightDesc: '1.0.0',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/scriptable/raw/master/api/loopScripts.js',
            icon: `${rootUrl}img/icon/loopScript.png`
          },
          {
            label: '随机组件',
            desc: '随机切换多个小组件',
            rightDesc: '1.1.5',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/scriptable/raw/master/api/randomScript.js',
            icon: `${rootUrl}img/icon/random_2.jpeg`
          }
        ]
      },
      {
        label: '京东系列',
        type: 'group',
        items: [
          {
            label: '京东',
            desc: '京豆、农场、签到等',
            rightDesc: '1.0.0',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/web_module_jingDong.js',
            icon: `${rootUrl}img/icon/jd.png`
          },
          {
            label: '京东收支账单',
            desc: '每月收支账单、白条',
            rightDesc: '1.0.1',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/web_module_jingDong_bill.js',
            icon: `${rootUrl}img/icon/jingDong.png`
          },
          {
            label: '京东小白鹅',
            desc: '白条信息、白条等级',
            rightDesc: '1.0.1',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/framework/raw/master/mian/web_module_jingDong_baiTiao.js',
            icon: `${rootUrl}img/icon/jingDong.png`
          },
          {
            label: '京东小金库',
            desc: '资产，累积收益',
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
            desc: '跳转京东App指定页面',
            rightDesc: '1.0.0',
            type: 'button',
            scrUrl: 'https://gitcode.net/4qiao/scriptable/raw/master/api/jd_schemeUrl.js',
            icon: `${rootUrl}img/icon/jd_green.png`
          },
          {
            label: '清空回收站',
            desc: '清空Scriptable回收站',
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
            type: 'switch'
          }
        ]
      }
    ]
  }, true);
}
module.exports = { main }