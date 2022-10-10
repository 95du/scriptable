// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: cloud-download-alt;
const req = new Request(`https://gitee.com/script_djg/scriptable/raw/master/Script/DJG.js`);
const res = await req.loadString();
const Name = 'Framework';
  
FileManager.local().writeString(FileManager.local().documentsDirectory() + `/${Name}.js`,`${res}`);

FILE_MGR.remove(module.filename);

 Safari.open('scriptable:///run/' + encodeURIComponent(Name));