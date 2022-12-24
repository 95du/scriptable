// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: cloud-download-alt;
class main {
  let widget = new ListWidget();
  widget.addText('Widget Text');
  let value = (config.runsInWidget) ? Script.setWidget(widget) : await widget.presentSmall();
  Script.complete();
}

module.exports = {
  main
}