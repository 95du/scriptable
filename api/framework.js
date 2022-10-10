// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: cloud-download-alt;
const FILE_MGR = FileManager[module.filename.includes('Documents/iCloud~') ? 'iCloud' : 'local']();

await Promise.all(
  ['framework.js'].map(async (js) => {
    const REQ = new Request('https://gitee.com/script_djg/scriptable/raw/master/Script/DJG.js');
    const RES = await REQ.load();
FILE_MGR.write(FILE_MGR.joinPath(FILE_MGR.documentsDirectory(), js), RES);
  }));

//FILE_MGR.remove(module.filename);

Safari.open('scriptable:///run?scriptName=' + encodeURIComponent('framework.js'));