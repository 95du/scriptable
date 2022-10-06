
// This script was created by Max Zeryck.

// The amount of blurring. Default is 150.
let blur = 150
 
// Determine if user has taken the screenshot.
var message
message = "Before you start, go to your home screen and enter wiggle mode. Scroll to the empty page on the far right and take a screenshot."
let options = ["查看小组件","退出选择","更新数据"]
let response = await generateAlert(message,options)

// Return if we need to exit.
if (response == 1) return

// Update the code.
if (response == 2) {
  let files = FileManager.local()
  const iCloudInUse = files.isFileStoredIniCloud(module.filename)

  files = iCloudInUse ? FileManager.iCloud() : files

  // Try to download the file.
  try {
    const req = new Request("https://raw.githubusercontent.com/mzeryck/Widget-Blur/main/widget-blur.js")
    const codeString = await req.loadString()
    files.writeString(module.filename, codeString)
    message = "The code has been updated. If the script is open, close it for the change to take effect."
  } catch {
    message = "The update failed. Please try again later."
  }
  options = ["OK"]
  await generateAlert(message,options)
  return
}

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

