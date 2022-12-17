// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: cloud-download-alt;
/**
* 框架修改自：@DmYY
* DmYY订阅地址：https://raw.githubusercontent.com/dompling/Scriptable/master/install.json
* 感谢 @LSP 的帮助
* LSP订阅地址：https://gitcode.net/enoyee/scriptable/-/raw/master/install/package.json
* 订阅作者 95度茅台
*/

const scriptName = '95duSub';
const scriptUrl = atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvdmlwL21haW5TY3JpcHQuanM=');

const modulePath = await downloadModule(scriptName, scriptUrl);
if (modulePath != null) {
  const importedModule = importModule(modulePath);
  await importedModule.main();
} else {
  console.log('Failed to download new module and could not find any local version.');
}


async function downloadModule(scriptName, scriptUrl) {
  // returns path of latest module version which is accessible
  const fm = FileManager.local();
  const scriptPath = module.filename;
  const moduleDir = scriptPath.replace(fm.fileName(scriptPath, true), scriptName);
  if (fm.fileExists(moduleDir) && !fm.isDirectory(moduleDir)) fm.remove(moduleDir);
  if (!fm.fileExists(moduleDir)) fm.createDirectory(moduleDir);
  const timeStamp = Date.parse(new Date());
  const moduleFilename = timeStamp.toString() + '.js';
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
      console.log('Failed to download new module. Using latest local version: ' + moduleLatestFile);
      return (moduleLatestFile != null) ? fm.joinPath(moduleDir, moduleLatestFile) : null;
    }
  }
}


function getModuleVersions(scriptName) {
  // returns all saved module versions and latest version of them
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
