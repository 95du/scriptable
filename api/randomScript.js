// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: th-large;
/**
* 小组件作者: 95度茅台
* 随机自动切换多个小组件
* Version 1.0
* 2022-12-04 15:30
* Telegram 交流群 https://t.me/+ViT7uEUrIUV0B_iy
*/

const apiData = new Request(atob(
'aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zaG9ydGN1dHMvcmF3L21hc3Rlci9hcGkvdXBkYXRlL3JhbmRvbS5qc29u'));
const get = await apiData.loadJSON();

const F_MGR = FileManager.iCloud();
const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), '95duScript');
const cacheFile = F_MGR.joinPath(folder, 'data.json');

if (F_MGR.fileExists(cacheFile)) {
  data = F_MGR.readString(cacheFile)
  script = JSON.parse(data);
} else {
  script = get.script
}

const mainScript = script[Math.floor(Math.random() * script.length)];
const scriptName = 'Random';
const scriptUrl = mainScript
const modulePath = await downloadModule(scriptName, scriptUrl);

if (modulePath != null) {
  if (config.runsInWidget) {
    const importedModule = importModule(modulePath);
    await importedModule.main();
  } else {
    await presentMenu();
  }
} else {
  console.log('Failed to download new module and could not find any local version.');
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


async function presentMenu() {
  let alert = new Alert();
  alert.title = "随机切换小组件"
  alert.message = get.version
  alert.addDestructiveAction('更新代码');
  alert.addAction('使用教程');
  alert.addAction('添加组件');
  alert.addAction('预览组件');
  alert.addAction('取消');
  response = await alert.presentAlert();
  if (response === 1) {
    await shortcutsTutorial();
  }
  if (response === 2) {
    await addScriptURL();
  }
  if (response === 3) {
    const importedModule = importModule(modulePath);
    await importedModule.main();
  }
  if (response === 4) return;
  // Update the code
  if (response === 0) {
    const iCloudInUse = F_MGR.isFileStoredIniCloud(module.filename);
    const reqUpdate = new Request(get.update);
    const codeString = await reqUpdate.loadString();
    if (codeString.indexOf('95度茅台') == -1) {
      notify('更新失败⚠️', '请检查网络或稍后再试');
    } else {
      F_MGR.writeString(module.filename, codeString)
      notify('小组件更新成功', '');
      const uri = Script.name();
      Safari.open('scriptable:///run/' + encodeURIComponent(uri));
    }
  }
}


async function shortcutsTutorial() {
  const tutorial = new Alert();  
  tutorial.title = '使用教程';
  tutorial.message = get.msg
  tutorial.addDestructiveAction('重置所有数据');
  tutorial.addAction('GitCode 捷径');
  tutorial.addAction('上传代码捷径');
  tutorial.addAction('返回上页');
  index = await tutorial.presentAlert();
  if (index === 0) {
    if (F_MGR.fileExists(folder)) {
      await F_MGR.remove(folder);
      notify('已重置数据', '请重新添加小组件URL');  
    }
  }
  if (index === 1) {
    Safari.open(get.shortcuts1);
  }
  if (index === 2) {
    Safari.open(get.shortcuts2);
  }
  if (index === 3) {
    await presentMenu();
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
    if (!F_MGR.fileExists(folder)) {
      F_MGR.createDirectory(folder);
    };
    (F_MGR.fileExists(cacheFile)) ? arr = script : arr = new Array();
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
    await presentMenu();
  } 
}


async function downloadModule(scriptName, scriptUrl) {
  const fm = FileManager.local();
  const scriptPath = module.filename;
  const moduleDir = scriptPath.replace(fm.fileName(scriptPath, true), scriptName);
  if (fm.fileExists(moduleDir) && !fm.isDirectory(moduleDir)) fm.remove(moduleDir);
  if (!fm.fileExists(moduleDir)) fm.createDirectory(moduleDir);
  const timeStamp = Date.parse(new Date());
  const moduleFilename = timeStamp.toString() + '.js';
  const modulePath = fm.joinPath(moduleDir, moduleFilename);
  if (fm.fileExists(modulePath)) {
    console.log('Module already downlaoded ' + moduleFilename);
    return modulePath;
  } else {
    const [moduleFiles, moduleLatestFile] = getModuleVersions(scriptName);
    console.log('Downloading ' + moduleFilename + ' from URL: ' + scriptUrl);
    const req = new Request(scriptUrl);
    const moduleJs = await req.load().catch(() => {
      return null;
    });
    if (moduleJs) {
      fm.write(modulePath, moduleJs);
      if (moduleFiles != null) {
        moduleFiles.map(x => {
          fm.remove(fm.joinPath(moduleDir, x));
        });
      }
      return modulePath;
    } else {
      console.log('Failed to download new module. Using latest local version: ' + moduleLatestFile);
      return (moduleLatestFile != null) ? fm.joinPath(moduleDir, moduleLatestFile) : null;
    }
  }
}


function getModuleVersions(scriptName) {
  const fm = FileManager.local();
  const scriptPath = module.filename
  const moduleDir = scriptPath.replace(fm.fileName(scriptPath, true), scriptName);
  const dirContents = fm.listContents(moduleDir);
  if (dirContents.length > 0) {
    const versions = dirContents.map(x => {
      if (x.endsWith('.js')) return parseInt(x.replace('.js', ''));
    });
    versions.sort(function(a, b) {
      return b - a;
    });
    //versions = versions.filter(Boolean);
    if (versions.length > 0) {
      const moduleFiles = versions.map(x => {
        return x + '.js';
      });
      moduleLatestFile = versions[0] + '.js';
      return [moduleFiles, moduleLatestFile];
    }
  }
  return [null, null];
}