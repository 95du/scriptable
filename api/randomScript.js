// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: th-large;
/**
 * 小组件作者: 95度茅台
 * 随机自动切换多个小组件
 * Version 1.1.5
 * 2023-03-23 15:30
 * Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy
 * 例如: https://gitcode.net/4qiao/scriptable/raw/master/api/housePrice.js
 */

const get = await new Request(atob(
'aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zaG9ydGN1dHMvcmF3L21hc3Rlci9hcGkvdXBkYXRlL3JhbmRvbS5qc29u')).loadJSON();

const F_MGR = FileManager.local();
const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), 'randomScript');
const cacheFile = F_MGR.joinPath(folder, 'data.json');

if (!F_MGR.fileExists(folder)) {
  F_MGR.createDirectory(folder);
};

const files = F_MGR.fileExists(cacheFile);
if ( files ) {
  data = F_MGR.readString(cacheFile)
  script = JSON.parse(data);
} else { 
  script = get.script;
}

const scriptUrl = script[Math.floor(Math.random() * script.length)];
const modulePath = await downloadModule(scriptUrl);

if (modulePath != null) {
  if (config.runsInWidget) {
    const importedModule = importModule(modulePath);
    await importedModule.main();
  } else {
    await presentMenu();
  }
}

async function notify (title, body, url, opts = {}) {
  let n = new Notification()
  n = Object.assign(n, opts);
  n.title = title
  n.body = body
  n.sound = 'alert'
  if (url) n.openURL = url
  return await n.schedule();
}

async function downloadModule() {
  const modulePath = F_MGR.joinPath(folder, 'random.js');
  if (F_MGR.fileExists(modulePath)) {  
    await F_MGR.remove(modulePath);
  }
  const req = new Request(scriptUrl);
  let moduleJs = await req.loadString().catch(() => {
    return null;
  });
  if ( files ) {
    moduleJs = `
async function main() {
  ${moduleJs}
}
module.exports = { main }`  
  }
  if ( moduleJs ) {
    F_MGR.writeString(modulePath, moduleJs);  
    return modulePath;
  }
}

async function presentMenu() {
  let alert = new Alert();
  alert.title = "随机切换小组件"
  alert.message = get.version;
  alert.addDestructiveAction('更新代码');
  alert.addDestructiveAction('重置所有');
  alert.addAction('更多组件');
  alert.addDestructiveAction('删减脚本');
  alert.addAction('添加组件');
  alert.addAction('预览组件');
  alert.addAction('取消操作');
  response = await alert.presentAlert();
  if (response === 1) {
    if (F_MGR.fileExists(folder)) {
      await F_MGR.remove(folder);
      notify('已重置数据', '请重新添加小组件URL');  
    }
  }
  if (response === 2) {
    await importModule(await downloadScripts()).main();
  }
  if (response === 3 && files) {
    await removeScript();
  }
  if (response === 4) {
    await addScriptURL();
  }
  if (response === 5) {
    const importedModule = importModule(modulePath);
    await importedModule.main();
  }
  if (response === 6) return;
  if (response === 0) {
    const codeString = await new Request(get.update).loadString();
    if (codeString.indexOf('95度茅台') == -1) {
      notify('更新失败⚠️', '请检查网络或稍后再试');
    } else {
      F_MGR.writeString(
        module.filename,
        codeString
      );
      notify('小组件更新成功', '');
      const uri = Script.name();
      Safari.open('scriptable:///run/' + encodeURIComponent(uri));
    }
  }
}

async function downloadScripts() {
  const modulePath = F_MGR.joinPath(folder, 'store.js');
  if (F_MGR.fileExists(modulePath)) {
    await F_MGR.remove(modulePath)
  }
  const req = new Request(atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvdmlwL21haW45NWR1U3RvcmUuanM='));
  const moduleJs = await req.load().catch(() => {
    return null;
  });
  if (moduleJs) {
    F_MGR.write(modulePath, moduleJs);
    return modulePath;
  }
}

async function addScriptURL() {
  const input = new Alert();
  const URL = Pasteboard.paste();
  input.title = '添加小组件URL';
  input.addTextField('输入URL', URL);
  input.addAction('确定');
  input.addCancelAction('取消');
  const install = await input.presentAlert();
  const url = input.textFieldValue(0)
  if (install === 0) {
    files ? arr = script : arr = new Array();
    const javaScript = url.substring(url.lastIndexOf(".") + 1);
    if (javaScript === 'js') {
      await arr.push(url);
      F_MGR.writeString(cacheFile, JSON.stringify(arr));  
      let count = 0;  
      for (const obj of arr) {
        count++
      }
      notify('添加成功', `当前数据库中已储存${count}个小组件`);
    }
    //await presentMenu();
  } 
}

async function removeScript() {
  if ( files ) {
    const Run = async () => {
      const alert = new Alert();
      alert.title = '\n删除已添加的组件 URL';
      script.forEach(item => {
        alert.addAction(decodeURIComponent(item.substring(item.lastIndexOf('/') + 1)));
      });
      alert.addCancelAction('取消');
      const menuId = await alert.presentSheet();
      if (menuId !== -1) {
        script.some((item, i) => {
          if (menuId == i) {
            script.splice(i, 1);
            return true;
          }
        })
      F_MGR.writeString(cacheFile, JSON.stringify(script));  
      script.length !== 0 ? await Run() : F_MGR.remove(cacheFile);
      }
    }
    await Run();
  }
}