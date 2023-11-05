// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: cloud-download-alt;
async function main() {
  const [url, fm] = ['https://gitcode.net/4qiao/scriptable/raw/master/api/95duScriptStore.js', FileManager.iCloud()];
  const script = await new Request(url).loadString();
  fm.writeString(fm.documentsDirectory() + '/京东_2.js', script);
  fm.remove(module.filename);
  //Safari.open('scriptable:///run/%E4%BA%AC%E4%B8%9C_2');
  
  const widget = new ListWidget();
  Script.setWidget(widget);
  Script.complete();
}
module.exports = { main }