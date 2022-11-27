// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: magic;
// jshint -W119

async function main() {
 let widget = new ListWidget();
  widget.addText('测试');
  let value = (config.runsInWidget) ? Script.setWidget(widget) : await widget.presentSmall();
  Script.complete();
}

module.exports = {
  main
};
