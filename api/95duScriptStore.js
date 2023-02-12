// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: cloud-download-alt;
/**
* 框架修改自：@DmYY
* DmYY订阅地址：https://raw.githubusercontent.com/dompling/Scriptable/master/install.json
* 感谢 @LSP 的帮助
* LSP订阅地址：https://gitcode.net/enoyee/scriptable/-/raw/master/install/package.json
* 95度茅台订阅地址 : https://gitcode.net/4qiao/framework/raw/master/scriptable/install.json
⚠️ 如运行报错，在 iCloud 里的 Scriptable 文件夹删除 95duSub
*/

const scriptName = '95duSub';
const scriptUrl = atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvdmlwL21haW5TY3JpcHQuanM=');

const fm = FileManager.iCloud();
const moduleDir = fm.joinPath(fm.documentsDirectory(), scriptName);
if (!fm.fileExists(moduleDir)) {
  fm.createDirectory(moduleDir);
}

const modulePath = await downloadModule(scriptName, scriptUrl);
if (modulePath != null) {
  const importedModule = importModule(modulePath);
  await importedModule.main();
}


async function downloadModule(scriptName, scriptUrl) {
  const date = new Date();
  const df = new DateFormatter();
  df.dateFormat = 'yyyyMMddHHmm';
  const moduleFilename = df.string(date).toString() + '.js';
  const modulePath = fm.joinPath(moduleDir, moduleFilename);
  if (fm.fileExists(modulePath)) {
    return modulePath;
  } else {
    const [moduleFiles, moduleLatestFile] = getModuleVersions(scriptName);
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
      return (moduleLatestFile != null) ? fm.joinPath(moduleDir, moduleLatestFile) : null;
    }
  }
}

function getModuleVersions(scriptName) {
  const dirContents = fm.listContents(moduleDir);
  if (dirContents.length > 0) {
    const versions = dirContents.map(x => {
      if (x.endsWith('.js')) return parseInt(x.replace('.js', ''));
    });
    versions.sort(function(a, b) {
      return b - a;
    });
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