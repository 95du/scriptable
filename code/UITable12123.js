// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: car;
const F_MGR = FileManager.iCloud();
const uri = Script.name();
// Background Color
const bgColor = Color.dynamic(
  new Color('#F5F5F5'), new Color('')
);
const topBgColor = Color.dynamic(
  new Color('#EEEEEE'), new Color('')
);

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
  effectRow.height = 72 * Device.screenScale();
  const effectImage = effectRow.addImageAtURL(atob('aHR0cHM6Ly9zd2VpeGluZmlsZS5oaXNlbnNlLmNvbS9tZWRpYS9NMDAvNzIvMkQvQ2g0RnlXT2NkRmVBS0pWREFBVUd3bXNrZjV3NjE4LnBuZw=='));
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
      notify('已清空数据', '请重新运行或重新配置小组件');
    }
  };
  table.addRow(topRow);

  // interval 1
  const gapRow = new UITableRow();
  gapRow.height = 25
  gapRow.backgroundColor = bgColor
  table.addRow(gapRow);
  
  const basic = [
    {
      url: 'https://gitcode.net/4qiao/scriptable/raw/master/img/icon/NicegramLogo.png',
      type: 'input',
      title: 'Telegram',
      desc: 'Telegram电报群',
      val: 'in',
      onClick: () => {
        Safari.openInApp('https://t.me/+ViT7uEUrIUV0B_iy', false);
      }
    },
    {
      icon: {
        name: 'arrow.clockwise',
        color: '#43CD80'
      },
      type: 'input',
      title: '快速刷新',
      desc: '刷新时间仅供参考，具体刷新时间由系统判断，单位：分钟',
      val: 'refresh',
      onClick: () => {
        console.log('message')
      }
    },
    {
      icon: {
        name: 'photo',
        color: '#F57C00'
      },
      type: 'background',
      title: '透明背景',
      val: '>',
      onClick: () => {
        console.log('222222');
      }
    },
    {
      icon: {
        name: 'square.stack.3d.down.forward.fill',
        color: '#D50000'
      },
      type: 'clean',
      title: '清除背景',
      desc: 'new Alert() 清除预警',
      val: '>',
      onClick: () => {
        notify('已清除背景', '请重新运行或重新配置小组件');
      }
    }
  ];
  await preferences(table, basic, '组件设置');

  // interval 2
  const gapRow2 = new UITableRow();
  gapRow2.height = 25
  gapRow2.backgroundColor = bgColor
  table.addRow(gapRow2);
  
  const preview = [
    {
      icon: {
        name: 'lightswitch.on',
        color: '#AB47BC'
      },
      type: 'preview',
      title: '预览组件',
      val: '>'
    }
  ];
  await preferences(table, preview, '版本更新');

  // interval 3
  const gapRow3 = new UITableRow();
  gapRow3.height = 25;
  gapRow3.backgroundColor = bgColor
  table.addRow(gapRow3);
  
  const updateVersion = [
    {
      icon: {
        name: 'applelogo',
        color: '#F9A825'
      },
      type: 'ver',
      title: '当前版本',
      desc: '2022年12月15日\n修复已知问题，调整布局',
      val: '1.0.0'
    },
    {
      icon: {
        name: 'icloud.and.arrow.down',
        color: '#42A5F5'
      },
      type: 'options',
      title: '更新代码',
      desc: '下载最新脚本，更新后当前脚本代码将被覆盖，请先做好备份'
    }
  ];
  await preferences(table, updateVersion, '版本更新');
  
  // Bottom interval
  const bottomRow = new UITableRow();
  bottomRow.height = 39 * Device.screenScale();
  bottomRow.backgroundColor = bgColor
  table.addRow(bottomRow);
}


/**
 * Setting Main menu
 * @param {Image} image
 * @param {string} string
 */
async function preferences(table, arr, outfit) {
  for (const item of arr) {
    const row = new UITableRow();
    row.dismissOnSelect = !!item.dismissOnSelect;
    if (item.url) {
      const rowIcon = row.addImageAtURL(item.url);
      rowIcon.widthWeight = 100;
    } else {
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
      valText.titleColor = Color.blue();
      valText.titleFont = Font.mediumSystemFont(fontSize);
    } else {
      const imgCell = UITableCell.imageAtURL('https://gitee.com/scriptableJS/Scriptable/raw/master/images/more.png');
      imgCell.rightAligned();
      imgCell.widthWeight = 500;
      row.addCell(imgCell);
    }
    
    row.onSelect = item.onClick 
      ? async () => {
          await item.onClick(item, table);
        }
      : async () => {
          if (item.type == 'ver') {
            let ver = new Alert()
            ver.title = 'Version ' + item.val;
            ver.message = item.desc;
            ver.addAction('完成');
            await ver.presentAlert();
          } else if (item.type == 'options') {
            await updateVersion(
              item['title'],
              item['desc'],
              item['val']
            );
          }
        }
    table.addRow(row);
  }
}


/**
 * Download Script
 * @param {string} string
 */
async function updateVersion(title, desc) {
  options = ['取消', '确认'];
  title = title
  message = desc
  const index = await generateAlert(title, message, options);
  if (index === 0) return;
  const iCloudInUse = F_MGR.isFileStoredIniCloud(module.filename);
  const reqUpdate = new Request(atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvY29kZS9VSVRhYmxlMTIxMjMuanM='));
  const codeString = await reqUpdate.loadString();
  if (codeString.indexOf('95度茅台') == -1) {
    notify('更新失败⚠️', '请检查网络或稍后再试');
  } else {
    F_MGR.writeString(module.filename, codeString)
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
  sfi.applyFont(Font.mediumSystemFont(30));
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
*
async drawButton (isOff = true, size = new Size(104, 64)) {
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
*/

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
  let alert = new Alert()
  alert.title = title
  alert.message = message
  for (const option of options) {
    alert.addAction(option)
  }
  let response = await alert.presentAlert()
  return response
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
    gifRow.height = 85 * Device.screenScale();
    gifRow.backgroundColor = bgColor
    const gifImage = gifRow.addImageAtURL(atob('aHR0cHM6Ly9zd2VpeGluZmlsZS5oaXNlbnNlLmNvbS9tZWRpYS9NMDAvNzEvQzgvQ2g0RnlXT0k2b0NBZjRQMUFFZ0trSzZxVVVrNTQyLmdpZg=='));
    gifImage.widthWeight = 0.4;
    gifImage.centerAligned();
    table.addRow(gifRow);

    // Top Row
    const topRow = new UITableRow();
    topRow.height = 70;
    const leftText = topRow.addButton('效果图');
    leftText.widthWeight = 0.3;
    leftText.onTap = async () => {
      const webView = new WebView();
      await webView.loadURL(atob('aHR0cHM6Ly9zd2VpeGluZmlsZS5oaXNlbnNlLmNvbS9tZWRpYS9NMDAvNzEvRjMvQ2g0RnlXT1NuM3FBVG9pUUFDT2ZoaVpaUzFJNzY4LnBuZw=='));
      await webView.present(false);
    };

    const authorImage = topRow.addImageAtURL('https://gitcode.net/4qiao/framework/raw/master/img/icon/4qiao.png');
    authorImage.widthWeight = 0.4;
    authorImage.centerAligned();

    const rightText = topRow.addButton('快捷指令');
    rightText.widthWeight = 0.3;
    rightText.rightAligned();
    rightText.onTap = async () => {
      Safari.openInApp('https://sharecuts.cn/user/KVlQooAqzA', false);
    };
    table.addRow(topRow);

    // interval 2
    const gapRow2 = new UITableRow();
    gapRow2.height = 30;
    gapRow2.backgroundColor = bgColor
    table.addRow(gapRow2);

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
          notify("已获取Script", `小组件:${item.title}下载/更新成功`);
        }
      };
      r.addCell(downloadCell);
      table.addRow(r);
    });

    // interval 3
    const gapRow3 = new UITableRow();
    gapRow3.height = 30;
    gapRow3.backgroundColor = bgColor
    table.addRow(gapRow3);

    // video Row
    const videoRow = new UITableRow();
    videoRow.height = 70;
    const videoText = videoRow.addButton('Animusic HD Pipe Dreams Video');
    videoText.widthWeight = 0.3;
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
    bottomText.widthWeight = 0.3;
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

const Run = async () => {
  try {
    await renderTableList({
      author: '95度茅台',
      subscription: 'https://gitcode.net/4qiao/framework/raw/master/scriptable/install.json'
    });
    const script = await new Request('https://gitcode.net/4qiao/scriptable/raw/master/api/95duScriptStore.js').loadString();
    F_MGR.writeString(F_MGR.documentsDirectory() + '/95duStore.js', script);
  } catch (e) {
    console.log("缓存读取错误" + e);
  }
};
// Setting Widget Config
await setWidgetConfig()