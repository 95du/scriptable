var message
message = "Before you start, go to your home screen and enter wiggle mode. Scroll to the empty page on the far right and take a screenshot."
let options = ["查看小组件","更新数据","退出选择"]
let response = await generateAlert(message,options)


// Update the code.
if (response === 1) {
  let files = FileManager.local()
  const iCloudInUse = files.isFileStoredIniCloud(module.filename)

  files = iCloudInUse ? FileManager.iCloud() : files

  // Try to download the file.
  try {
    const req = new Request("https://gitcode.net/4qiao/scriptable/raw/master/code/update.js")
    const codeString = await req.loadString()
    files.writeString(module.filename, codeString)
    message = "代码已更新。 如果脚本已打开，请将其关闭以使更改生效。"
  } catch {
    message = "更新失败，检查网络请稍后再试。"
  }
  options = ["OK"]
  await generateAlert(message,options)
  return
}

if (response === 2) return;

Script.complete()

// Generate an alert with the provided array of options.
async function generateAlert(message,options) {
  let alert = new Alert()
  alert.message = message
  for (const option of options) {
    alert.addAction(option)
  }
  let response = await alert.presentAlert()
  return response
}

