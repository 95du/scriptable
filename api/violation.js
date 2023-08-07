// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: car;
/**
 * 支付宝小程序 交管12123
 * 小组件作者：95度茅台
 * 获取Token作者: @FoKit
 * 版本: Version 1.3.0
 * Telegram 交流群 https://t.me/+CpAbO_q_SGo2ZWE1

获取Token重写:
https://gitcode.net/4qiao/scriptable/raw/master/quanX/getToken_12123.sgmodule

95度茅台 Boxjs 订阅:
https://gitcode.net/4qiao/scriptable/raw/master/boxjs/sub.json

===============================
一键添加 boxjs 重写到 Quantumult-X https://api.boxjs.app/quanx-install

@Fokit Boxjs订阅（可选）：
http://boxjs.com/#/sub/add/https%3A%2F%2Fraw.githubusercontent.com%2FFoKit%2FScripts%2Fmain%2Fboxjs%2Ffokit.boxjs.json

============使用方法============
1，配置重写规则，手动运行小组件，点击【 GetToken 】或【 累积记分 】跳转到支付宝12123小程序 登录即可自动抓取/更新Token。
2，Referer (用于获取车辆检验有效期时间及累积记分) 按提示点击12123小程序页面。
3，使用前，请确保您的代理APP已配置好BoxJs重写，BoxJs配置方法：https://chavyleung.gitbook.io/boxjs/

=========Quantumult-X=========
[rewrite_local]
^https:\/\/miniappcsfw\.122\.gov\.cn:8443\/openapi\/invokeApi\/business\/biz url script-request-body https://gitcode.net/4qiao/scriptable/raw/master/quanX/getToken_12123.js

[MITM]
hostname = miniappcsfw.122.gov.cn

============Surge=============
[Script]
12123_Token = type=http-request,pattern=^https:\/\/miniappcsfw\.122\.gov\.cn:8443\/openapi\/invokeApi\/business\/biz,requires-body=1,max-size=0,timeout=1000,script-path=https://gitcode.net/4qiao/scriptable/raw/master/quanX/getToken_12123.js,script-update-interval=0

[MITM]
hostname = %APPEND% miniappcsfw.122.gov.cn
*/

const scriptName = '95du12123_1';
const scriptUrl = atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9mcmFtZXdvcmsvcmF3L21hc3Rlci9hcGkvbWFpbl8xMjEyM18xLmpz');
const fm = FileManager.local();
const runPath = fm.joinPath(fm.documentsDirectory(), scriptName);
if (!fm.fileExists(runPath)) {
  fm.createDirectory(runPath);
}

const moduleDir = fm.joinPath(fm.documentsDirectory(), `${scriptName}/Running`);
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
  df.dateFormat = 'yyyyMMddHH';
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
      console.log('Failed to download new module. Using latest local version: ' + moduleLatestFile);
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