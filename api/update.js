// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: cloud-upload-alt;
let title
let message = "Before you start, go to your home screen and enter wiggle mode. Scroll to the empty page on the far right and take a screenshot."
let options = ["预览组件","更新数据","退出"]
let response = await generateAlert(message,options)

if (response === 0) return;
if (response === 2) return;
// Update the code.
if (response === 1) {
  let files = FileManager.iCloud()
  const iCloudInUse = files.isFileStoredIniCloud(module.filename)

  files = iCloudInUse ? FileManager.iCloud() : files

  // Try to download the file.
  try {
    const req = new Request("https://gitcode.net/4qiao/scriptable/raw/master/code/update.js")
    const codeString = await req.loadString()
    files.writeString(module.filename, codeString)
    title = "代码已更新‼️"
    message = "如果当前脚本已打开\n请将其关闭以使更改生效。"
  } catch {
    title = "更新失败⚠️"
    message = "检查网络请稍后再试。"
  }
  options = ["OK"]
  await generateAlert(message,options)
  return
}

Script.complete()

// Generate an alert with the provided array of options.
async function generateAlert(message,options) {
  let alert = new Alert()
  alert.title = title
  alert.message = message
  for (const option of options) {
    alert.addAction(option)
  }
  let response = await alert.presentAlert()
  return response
}

