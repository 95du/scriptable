// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: cloud-download-alt;
async function main() {
  const bgColor = Color.dynamic(
    new Color('#F5F5F5'),
    new Color('#000000')
  );
  
  const notify = async (title, body, url, opts = {}) => {
    let n = new Notification();
    n = Object.assign(n, opts);
    n.title = title;
    n.body = body;
    n.sound = 'popup';
    if (url) n.openURL = url;
    return await n.schedule();
  };
  
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
  
      // topRow
      const topRow = new UITableRow();
      topRow.height = 70;
      const leftText = topRow.addButton('效果图');
      leftText.widthWeight = 0.3;
      leftText.onTap = async () => {
        const webView = new WebView();
        await webView.loadURL('https://gitcode.net/4qiao/framework/raw/master/img/picture/Example.png');
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
          const F_MGR = FileManager.iCloud();
          const script = await new Request(item.scriptURL).loadString();
          F_MGR.writeString(
            F_MGR.documentsDirectory() + `/${item.name}.js`,
            script
          )
          if (script) {
            notify('', `小组件:${item.title}下载/更新成功`);
          }
        };
        r.addCell(downloadCell);
        table.addRow(r);
      });
  
      // interval 2
      await gapRow(table);
  
      // telegramRow
      const telegramRow = new UITableRow();
      telegramRow.height = 70;
      const telegram = telegramRow.addButton('加入 Scriptable 小组件交流群');
      telegram.widthWeight = 0.3;
      telegram.centerAligned();
      telegram.onTap = async () => {
        Safari.openInApp('https://t.me/+CpAbO_q_SGo2ZWE1', false);
      };
      table.addRow(telegramRow);
  
      // bottom interval
      const bottom = new UITableRow();
      bottom.height = 225;
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
    } catch (e) {
      console.log("缓存读取错误" + e);
    }
  };
  await Run();
}
module.exports = { main }