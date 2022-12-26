async function main() {
  // Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: cog;
const VERSION = '1.0.0'
const uri = Script.name();
const F_MGR = FileManager.iCloud();

const path = F_MGR.joinPath(F_MGR.documentsDirectory(), "framework");
if (!F_MGR.fileExists(path)) {
  F_MGR.createDirectory(path);
}

const cacheFile = F_MGR.joinPath(path, 'setting.json');
if (!F_MGR.fileExists(cacheFile)) {
  setting = {
    minute: 10,
    system: 0,
    bgImage1: "light",
    bgImage1: "dark"
  }
  F_MGR.writeString(
    cacheFile,
    JSON.stringify(setting, null, 2)
  );
} else {
  data = F_MGR.readString(cacheFile);
  setting = JSON.parse(data);
}

// Background Color
const bgColor = Color.dynamic(
  new Color('#F5F5F5'), new Color('')
);
const topBgColor = Color.dynamic(
  new Color('#EEEEEE'), new Color('')
);

// refresh time
if (setting.minute) {  
  const widget = new ListWidget();
  const refresh = 1000 * 60 * setting.minute;
  widget.refreshAfterDate = new Date(Date.now() + refresh);
}

let modulePath = await downloadModule();
if (modulePath != null) {
  if(config.runsInWidget) {  
    const importedModule = importModule(modulePath);
    await importedModule.main();
  }
}

async function downloadModule() {
  const modulePath = F_MGR.joinPath(path, 'oil.js');
  if (F_MGR.fileExists(modulePath)) {
    await F_MGR.remove(modulePath)
  }
  const req = new Request('https://gitcode.net/4qiao/scriptable/raw/master/vip/mainScriptOil.js');
  const moduleJs = await req.load().catch(() => {
    return null;
  });
  if (moduleJs) {
    F_MGR.write(modulePath, moduleJs);
    return modulePath;
  }
}


/**
 * 设置组件内容
 * @returns {Promise<void>}
 */
setWidgetConfig = async () => {
  const table = new UITable();
  table.showSeparators = true;
  const enableSuggestions = true;
  await renderTables(table);
  await table.present();
};

async function renderTables(table) {
  // Header effectImage Row
  const effectRow = new UITableRow();
  effectRow.height = 70 * Device.screenScale();
  const effectImage = effectRow.addImageAtURL(atob('aHR0cDovL210dy5zby81djNYTGw='));
  effectImage.widthWeight = 0.4;
  effectImage.centerAligned();
  effectRow.backgroundColor = topBgColor
  table.addRow(effectRow);

  // Top Row
  const topRow = new UITableRow();
  topRow.height = 70;
  const leftText = topRow.addButton('更多组件');
  leftText.widthWeight = 0.3;
  leftText.onTap = async () => {
    await Run();
  };

  const authorImage = topRow.addImageAtURL('https://gitcode.net/4qiao/framework/raw/master/img/icon/4qiao.png');
  authorImage.widthWeight = 0.4;
  authorImage.centerAligned();

  const rightText = topRow.addButton('重置所有');
  rightText.widthWeight = 0.3;
  rightText.rightAligned();
  rightText.onTap = async () => {
    const delAlert = new Alert();
    delAlert.title = '清空所有数据';
    delAlert.message = '\n该操作将把用户储存的所有数据清除，重置后需重新运行获取，否则组件可能无法正常运行或显示';
    delAlert.addDestructiveAction('重置');
    delAlert.addCancelAction('取消');
    const action = await delAlert.presentAlert();
    if (action == 0) {
      F_MGR.remove(path);
      notify('已清空数据', '请重新运行或重新配置小组件');
      Safari.open('scriptable:///run/' + encodeURIComponent(uri));
    }
  };
  table.addRow(topRow);
  
  // Main Menu
  const basic = [
    {
      interval: 26
    },
    {
      url: 'https://gitcode.net/4qiao/scriptable/raw/master/img/icon/NicegramLogo.png',
      type: 'input',
      title: 'Telegram',
      val: '>',
      onClick: async () => {
        Safari.openInApp('https://t.me/+ViT7uEUrIUV0B_iy', false);
      }
    },
    {
      icon: {
        name: 'applelogo',
        color: '#00BCD4'
      },
      title: 'AppleOS',
      val: '>',
      onClick: async () => {
        const html = await new Request('https://developer.apple.com/news/releases/rss/releases.rss').loadString();
        const iOS = html.match(/<title>(iOS.*?)<\/title>/)[1];
        const a = iOS.match(/(iOS\s\d+\.\d*?\.?\d*?\s(beta\s?\d*?|RC\s?\d?))/)[1];
        const b = iOS.match(/\((.*?)\)/)[1];
        const iPadOS = html.match(/<title>(iPadOS.*?)<\/title>/)[1];
        const c = iPadOS.match(/(iPadOS\s\d+\.\d*?\.?\d*?\s(beta\s?\d*?|RC\s?\d?))/)[1];
        const d = iPadOS.match(/\((.*?)\)/)[1];
        const actions = [
          {
            title: iOS ? a : '正式版已发布',
            val: iOS ? b : '>',
            system: iOS,
            type: 'OS',
            icon: {
              name: 'applelogo',
              color: '#43CD80'
            }
          },
          {
            title: html.match(/<title>(iOS\s\d+\.\d\.?\d?)\s\(/)[1],
            val: '>',
            type: 'OS',
            icon: {
              name: 'applelogo',
              color: '#F57C00'
            }
          },
          {
            title: html.match(/<title>(iOS\s15\.\d\.?\d?)\s\(/)[1],
            val: '>',
            type: 'OS',
            icon: {
              name: 'applelogo',
              color: '#00BCD4'
            }
          },
          {
            title: iPadOS ? c : '正式版已发布',
            val: iPadOS ? d : '>',
            type: 'OS',
            icon: {
              name: 'applelogo',
              color: '#F9A825'
            }
          },
          {
            title: html.match(/<title>(iPadOS\s\d+\.\d\.?\d?)\s\(/)[1],
            val: '>',
            type: 'OS',
            icon: {
              name: 'applelogo',
              color: '#AB47BC'
            }
          },
          {
            title: html.match(/<title>(iPadOS\s15\.\d\.?\d?)\s\(/)[1],
            val: '>',
            type: 'OS',
            icon: {
              name: 'applelogo',
              color: '#42A5F5'
            }
          },
          {
            interval: 158 * Device.screenScale()
          }
        ];
        const table = new UITable();
        table.showSeparators = true;
        await preferences(table, actions, 'Apple OS');
        await table.present();
      }
    },
    {
      icon: {
        name: 'arrow.clockwise',
        color: '#43CD80'
      },
      type: 'input',
      title: '刷新时间',
      desc: '刷新时间仅供参考，具体时间由系统判断，单位：分钟',
      val: setting.minute
    },
    {
      icon: {
        name: 'photo',
        color: '#F57C00'
      },
      type: 'background',
      title: '图片背景',
      val: '>',
    },
    {
      icon: {
        name: 'square.stack.3d.down.forward.fill',
        color: '#D50000'
      },
      type: 'clean',
      title: '清除背景',
      desc: 'new Alert()',
      val: '>',
      onClick: async () => {
        notify('已清除背景', '请重新运行或重新配置小组件');
      }
    }
  ];
  await preferences(table, basic);
  
  // Preview Menu
  const preview = [
    {
      interval: 26
    },
    {
      icon: {
        name: 'lightswitch.on',
        color: '#AB47BC'
      },
      type: 'preview',
      title: '预览组件',
      //dismissOnSelect: true,
      desc: '预览组件测试',
      val: '>'
    },
    {
      interval: 26
    }
  ];
  await preferences(table, preview);
  
  // Version Menu
  const updateVersion = [
    {
      icon: {
        name: 'gearshape.fill',
        color: '#F9A825'
      },
      type: 'ver',
      title: '当前版本',
      desc: '2022年12月15日\n修复已知问题，调整布局',
      val: VERSION,
      ver: 'Version ' + VERSION
    },
    {
      icon: {
        name: 'icloud.and.arrow.down',
        color: '#42A5F5'
      },
      type: 'options',
      title: '更新代码',
      desc: '更新后当前脚本代码将被覆盖\n请先做好备份，此操作不可恢复'
    },
    {
      interval: 23.8 * Device.screenScale()
    },
  ];
  await preferences(table, updateVersion, '版本|更新');
}


/**
 * Setting Main menu
 * @param {Image} image
 * @param {string} string
 */
async function preferences(table, arr, outfit) {
  if (outfit === 'Apple OS') {
    let header = new UITableRow();
    let heading = header.addText(outfit);
    heading.titleFont = Font.mediumSystemFont(20);
    heading.centerAligned();
    table.addRow(header);
  }
  for (const item of arr) {
    const row = new UITableRow();
    row.dismissOnSelect = !!item.dismissOnSelect;
    if (item.url) {
      const rowIcon = row.addImageAtURL(item.url);
      rowIcon.widthWeight = 100;
    } else if (item.icon) {
      const icon = item.icon || {};
      const image = await drawTableIcon(
        icon.name,
        icon.color,
        item.cornerWidth
      );
      const imageCell = row.addImage(image);
      imageCell.widthWeight = 100;
    }
    let rowTitle = row.addText(item['title']);
    rowTitle.widthWeight = 400;
    rowTitle.titleFont = Font.systemFont(16);
    
    if (item.val) {
      let valText = row.addText(
        `${item.val}`.toUpperCase()
      );
      const fontSize = !item.val ? 26 : 16;
      valText.widthWeight = 500;
      valText.rightAligned();
      valText.titleColor = item.val == '>' ? Color.gray() : Color.blue()
      valText.titleFont = Font.mediumSystemFont(fontSize);
    } else if (item.interval) {
      row.height = item.interval;
      row.backgroundColor = bgColor;
    } else {
      /**
      const but_off = await drawButton();
      const but_on = await drawButton(false);
      const img = settings.button[item.but] ? but_on : but_off;
      const imgCell = UITableCell.image(img);
      */
      
      //https://gitee.com/scriptableJS/Scriptable/raw/master/images/more.png
      const imgCell = UITableCell.imageAtURL('https://gitcode.net/4qiao/framework/raw/master/img/icon/button_false.png');
      imgCell.rightAligned();
      imgCell.widthWeight = 500;
      row.addCell(imgCell);
    }
    table.addRow(row);
    
    // item.onClick
    const type = item.type;
    row.onSelect = item.onClick 
    ? async () => {
      await item.onClick(item, table);
    }
    : async () => {
      if (type == 'options') {
        await updateVersion(
          item['title'],
          item['desc'],
          item['val']
        );
      } else if (type == 'ver') {
        await generateAlert(
          title = item.ver,
          message = item.desc,
          options = ['完成']
        );
      } else if (type == 'OS') {
        Safari.openInApp('https://developer.apple.com/news/releases', false);
        ios = {
          ...setting, 
          system: item.title
        }
        if (item.system) {
          await F_MGR.writeString(
            cacheFile,
            JSON.stringify(ios)
          );
          notify('订阅成功', item.system + '\n将收到iOS最新开发者版或正式版通知');
        }
      } else if (type == 'input') {
        await inputInfo(
          item['title'],
          item['desc'],
          item['val']
        );
      } else if (type == 'preview') {
        let importedModule = importModule(modulePath);
        await importedModule.main();
      }
    }
  }
  table.reload();
}

// Refresh Time
async function inputInfo(title, desc, val) {  
  await generateInputAlert (
    {
      title: desc,
      options: [{ 
        hint: '分钟',
        value: `${val}`
      }]
    }, 
    async (inputArr) => {
      await F_MGR.writeString(
        cacheFile,
        JSON.stringify({ ...setting, minute: inputArr[0].value })
      );
      notify('设置成功', '刷新时间为' + inputArr[0].value + '分钟，重新组件运行即可生效');
    }
  );
}


/**
 * Download Script
 * @param {string} string
 */
async function updateVersion(title, desc) {
  const index = await generateAlert(
    title = title,
    message = desc,
    options = ['取消', '确认']
  );
  if (index === 0) return;
  const reqUpdate = new Request(atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvZnJhbWUvVUlUYWJsZS5qcw=='));
  const codeString = await reqUpdate.loadString();
  if (codeString.indexOf('95度茅台') == -1) {
    notify('更新失败⚠️', '请检查网络或稍后再试');
  } else {
    F_MGR.writeString(
      module.filename,
      codeString
    );
    notify('小组件更新成功', '');
    Safari.open('scriptable:///run/' + encodeURIComponent(uri));
  }
}


/**
 * Setting drawTableIcon
 * @param {Image} image
 * @param {string} string
 */
drawTableIcon = async (
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
    <canvas id="mainCanvas" />
    `;
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
 * 绘制系统按钮
 * @param {bool} isOff 是否为关闭状态
 * @param {Size} size 按钮大小
*/
async function drawButton (
  isOff = true,
  size = new Size(104, 64)
) {
  const cacheKey = `button_${isOff}`;
  let cacheImg = this.loadImgCache(cacheKey, this.IMAGE_FOLDER);
  if (!!cacheImg) return cacheImg;
  const {width, height} = size;
  let screenScale = Device.screenScale();
  let color, x;
  if (isOff) {
    color = '#E8E8E8';
    x = height / 2;
  } else {
    color = '#34C759';
    x = width-height / 2;
  }
  // 绘制圆角矩形
  const canvas = this.makeCanvas(width, height);
  this.fillRect(canvas, 0, 0, width, height, height / 2,new Color(color));
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
      ctx.shadowColor = 'rgba(152, 152, 152, 0.8)';
      ctx.shadowBlur = 10;
      ctx[type]();
    }
    var bgImage = document.getElementById("bgImage");
    var canvas = document.createElement("canvas");
    var width = bgImage.width / ${screenScale};
    var height = bgImage.height / ${screenScale};
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-atop';
    drawRound(${x}, height / 2, height / 2 - ${height * 0.075}, 0, 360, '#fff', 'fill');
    output = canvas.toDataURL()`;
  let wv = new WebView();
  await wv.loadHTML(html);
  const base64Image = await wv.evaluateJavaScript(js);
  const image = await new Request(base64Image).loadImage();
  this.saveImgCache(cacheKey, image, this.IMAGE_FOLDER);
  return image;
}


/**
 * 弹出一个通知
 * @param {string} title
 * @param {string} body
 * @param {string} url
 * @param {string} sound
 */
async function notify (title, body, url, opts = {}) {
  let n = new Notification()
  n = Object.assign(n, opts);
  n.title = title
  n.body = body
  n.sound = 'popup'
  if (url) n.openURL = url
  return await n.schedule()
}


/**
 * @param message 内容
 * @param options 按键
 * @returns {Promise<number>}
 */
async function generateAlert(title, message, options) {
  let alert = new Alert();
  alert.title = title
  alert.message = message
  for (const option of options) {
    alert.addAction(option)
  }
  return await alert.presentAlert();
}


/**
 * 弹出输入框
 * @param title 标题
 * @param desc  描述
 * @param opt   属性
 * @returns {Promise<void>}
 */
async function generateInputAlert(opt, confirm) {  
  const inputAlert = new Alert();
  inputAlert.title = opt.title;
  inputAlert.message = opt.message;
  const fieldArr = opt.options;
  for (const option of fieldArr) {
    inputAlert.addTextField(  
      option.hint,
      option.value
    );
  }
  inputAlert.addAction('取消');
  inputAlert.addAction('确认');
  let getIndex = await inputAlert.presentAlert();
  if (getIndex === 1) {
    const inputObj = [];
    fieldArr.forEach((_, index) => {
      let value = inputAlert.textFieldValue(index);
      inputObj.push({index, value});
    });
    confirm(inputObj);
  }
  return getIndex;
}


/**
 * Download Script
 * author: @95度茅台
 */
renderTableList = async (data) => {
  try {
    const table = new UITable();
    table.showSeparators = true;

    const gifRow = new UITableRow();
    gifRow.height = 83 * Device.screenScale();
    gifRow.backgroundColor = bgColor
    const gifImage = gifRow.addImageAtURL(atob('aHR0cHM6Ly9zd2VpeGluZmlsZS5oaXNlbnNlLmNvbS9tZWRpYS9NMDAvNzEvQzgvQ2g0RnlXT0k2b0NBZjRQMUFFZ0trSzZxVVVrNTQyLmdpZg=='));
    gifImage.centerAligned();
    table.addRow(gifRow);

    // Top Row
    const topRow = new UITableRow();
    topRow.height = 70;
    const leftText = topRow.addButton('效果图');
    leftText.onTap = async () => {
      const webView = new WebView();
      await webView.loadURL(atob('aHR0cHM6Ly9zd2VpeGluZmlsZS5oaXNlbnNlLmNvbS9tZWRpYS9NMDAvNzEvRjMvQ2g0RnlXT1NuM3FBVG9pUUFDT2ZoaVpaUzFJNzY4LnBuZw=='));
      await webView.present(false);
    };

    const authorImage = topRow.addImageAtURL('https://gitcode.net/4qiao/framework/raw/master/img/icon/4qiao.png');
    authorImage.widthWeight = 0.9
    authorImage.centerAligned();

    const rightText = topRow.addButton('快捷指令');
    rightText.rightAligned();
    rightText.onTap = async () => {
      Safari.openInApp('https://sharecuts.cn/user/KVlQooAqzA', false);
    };
    table.addRow(topRow);

    // interval 1
    await gapRow(table);

    // 如果是节点，则先远程获取
    const subscription = await new Request(data.subscription).loadJSON()
    const apps = subscription.apps;
    apps.forEach((item) => {
      const r = new UITableRow();
      r.height = 60;
      const imgCell = UITableCell.imageAtURL(item.thumb);
      imgCell.centerAligned();
      r.addCell(imgCell);

      const nameCell = UITableCell.text(item.title);
      nameCell.centerAligned();
      r.addCell(nameCell);

      const downloadCell = UITableCell.button("获取");
      downloadCell.centerAligned();
      downloadCell.dismissOnTap = true;
      downloadCell.onTap = async () => {
        const script = await new Request(item.scriptURL).loadString();
        F_MGR.writeString(F_MGR.documentsDirectory() + `/${item.name}.js`, script)
        if (script) {
          notify('', `小组件:${item.title}下载/更新成功`);
        }
      };
      r.addCell(downloadCell);
      table.addRow(r);
    });

    // interval 2
    await gapRow(table);

    // video Row
    const videoRow = new UITableRow();
    videoRow.height = 70;
    const videoText = videoRow.addButton('Animusic HD Pipe Dreams Video');
    videoText.centerAligned();
    videoText.onTap = async () => {
      await Safari.openInApp(atob('aHR0cHM6Ly9zd2VpeGluZmlsZS5oaXNlbnNlLmNvbS9tZWRpYS9NMDAvNzIvNUEvQ2g0RnlHT1l0dy1BSTI4Q0FPRDkzNDk1Y2hVMzMxLm1wNA=='), false);
    };
    table.addRow(videoRow);

    // bottom interval
    const bottom = new UITableRow();
    bottom.height = 180;
    bottom.backgroundColor = bgColor
    const bottomText = bottom.addText('Copyright ©️ 2022 界面修改自·@DmYY');
    bottomText.centerAligned();
    bottomText.titleFont = Font.boldMonospacedSystemFont(10);
    bottomText.titleColor = Color.gray();
    table.addRow(bottom);
    table.present(false);
  } catch (e) {
    console.log(e);
    notify("错误提示", "脚本获取失败");
  }
};

async function gapRow(table) {
  const gapRow = new UITableRow();
  gapRow.height = 30;
  gapRow.backgroundColor = bgColor
  return table.addRow(gapRow);
}

const Run = async () => {
  try {
    await renderTableList({
      author: '95度茅台',
      subscription: 'https://gitcode.net/4qiao/framework/raw/master/scriptable/install.json'
    });
    const script = await new Request('https://gitcode.net/4qiao/scriptable/raw/master/api/95duScriptStore.js').loadString();
    F_MGR.writeString(F_MGR.documentsDirectory() + '/95 °.js', script);
  } catch (e) {
    console.log("缓存读取错误" + e);
  }
};
// await setWidgetConfig
await setWidgetConfig();
}
// async function main()
module.exports = { main }