async function main() {
  // Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: magic;
// Determine if user has taken the screenshot.
  message =
  "在主屏幕长按进入编辑模式。滑动到最右边的空白页 ( 桌面墙纸设置为模糊 ) 截图";
  let exitOptions = ["已有截图", "没有截图"];
  let shouldExit = await generateAlert(message, exitOptions);
  if (shouldExit) return;

  // Get screenshot and determine phone size.
  let img = await Photos.fromLibrary();
  let height = img.size.height;
  let phone = phoneSizes()[height];
  if (!phone) {
    message = "您似乎选择了非iPhone屏幕截图的图像，或者不支持您的iPhone。请使用其它图像";
    await generateAlert(message, ["现在去截图"]);
    return;
  }
  
  // Extra setup needed for 2436-sized phones.
  if (height == 2436) {
  
    let cacheName = "mz-phone-type"
    let cachePath = files.joinPath(files.libraryDirectory(), cacheName)
  
    // If we already cached the phone size, load it.
    if (files.fileExists(cachePath)) {
      let typeString = files.readString(cachePath)
      phone = phone[typeString]
    
    // Otherwise, prompt the user.
    } else { 
      message = "你的iPhone是什么型号？"
      let types = ["iPhone 12 mini", "iPhone 11 Pro, XS, X"]
      let typeIndex = await generateAlert(message, types)
      let type = (typeIndex == 0) ? "mini" : "x"
      phone = phone[type]
      files.writeString(cachePath, type)
    }
  }
  
  // Prompt for widget size and position.
  message = "创建哪一种尺寸";
  let sizes = ["小号", "中号", "大号"];
  let size = await generateAlert(message, sizes);
  let widgetSize = sizes[size];

  message = "您想它在什么位置？";
  message += height == 1136 ? " (请注意，您的设备仅支持两行小组件，因此中间和底部选项相同。)" : "";

  // Determine image crop based on phone size.
  let crop = { w: "", h: "", x: "", y: "" };
  if (widgetSize == "小号") {
    crop.w = phone.小号;
    crop.h = phone.小号;
    let positions = ["顶部 左边", "顶部 右边", "中间 左边", "中间 右边", "底部 左边", "底部 右边"];
    let position = await generateAlert(message, positions);

    // Convert the two words into two keys for the phone size dictionary.
    let keys = positions[position].toLowerCase().split(" ");
    crop.y = phone[keys[0]];
    crop.x = phone[keys[1]];
  } else if (widgetSize == "中号") {
    crop.w = phone.中号;
    crop.h = phone.小号;

    // Medium and large widgets have a fixed x-value.
    crop.x = phone.左边;
    let positions = ["顶部", "中间", "底部"];
    let position = await generateAlert(message, positions);
    let key = positions[position].toLowerCase();
    crop.y = phone[key];
  } else if (widgetSize == "大号") {
    crop.w = phone.中号;
    crop.h = phone.大号;
    crop.x = phone.左边;
    let positions = ["顶部", "底部"];
    let position = await generateAlert(message, positions);

    // Large widgets at the bottom have the "middle" y-value.
    crop.y = position ? phone.中间 : phone.顶部;
  }

  // Crop image and finalize the widget.
  let imgCrop = cropImage(img, new Rect(crop.x, crop.y, crop.w, crop.h));

  message = "背景已制作成功";
  const exportPhotoOptions = ["立即使用", "导出相册", "重新制作"];
  const exportPhoto = await generateAlert(message, exportPhotoOptions);

  if (exportPhoto == 0) {
    F_MGR.writeImage(bgImage,imgCrop)
    Safari.open('scriptable:///run/' + encodeURIComponent(uri));
  } else if (exportPhoto == 1) {
    Photos.save(imgCrop)
  } else if (exportPhoto == 2) {
    await createBackground();
  }

// Crop an image into the specified rect.
function cropImage(img, rect) {
  let draw = new DrawContext();
  draw.size = new Size(rect.width, rect.height);
  draw.drawImageAtPoint(img, new Point(-rect.x, -rect.y));
  return draw.getImage();
}

// Pixel sizes and positions for widgets on all supported phones.
function phoneSizes() {
  let phones = {
    // 14 Pro Max
    2796: {
      小号: 510,
      中号: 1092,
      大号: 1146,
      左边: 99,
      右边: 681,
      顶部: 282,
      中间: 918,
      底部: 1554
    },
    // 14 Pro
    2556: {
      小号: 474,
      中号: 1014,
      大号: 1062,
      左边: 82,
      右边: 622,
      顶部: 270,
      中间: 858,
      底部: 1446
    },
    // 12/13 Pro Max
    2778: {
      小号: 510,
      中号: 1092,
      大号: 1146,
      左边: 96,
      右边: 678,
      顶部: 246,
      中间: 882,
      底部: 1518
    },
    // 12/13 and 12/13 Pro
    2532: {
      小号: 474,
      中号: 1014,
      大号: 1062,
      左边: 78,
      右边: 618,
      顶部: 231,
      中间: 819,
      底部: 1407
    },
    // 11 Pro Max, XS Max
    2688: {
      小号: 507,
      中号: 1080,
      大号: 1137,
      左边: 81,
      右边: 654,
      顶部: 228,
      中间: 858,
      底部: 1488
    },
    // 11, XR
    1792: {
      小号: 338,
      中号: 720,
      大号: 758,
      左边: 54,
      右边: 436,
      顶部: 160,
      中间: 580,
      底部: 1000
    },
    // 11 Pro, XS, X, 12 mini
    2436: {
      x: {
        小号: 465,
        中号: 987,
        大号: 1035,
        左边: 69,
        右边: 591,
        顶部: 213,
        中间: 783,
        底部: 1353
      },
      mini: {
        小号: 465,
        中号: 987,
        大号: 1035,
        左边: 69,
        右边: 591,
        顶部: 231,
        中间: 801,
        底部: 1371
      }
    },
    // Plus phones
    2208: {
      小号: 471,
      中号: 1044,
      大号: 1071,
      左边: 99,
      右边: 672,
      顶部: 114,
      中间: 696,
      底部: 1278
    },
    // SE2 and 6/6S/7/8
    1334: {
      小号: 296,
      中号: 642,
      大号: 648,
      左边: 54,
      右边: 400,
      顶部: 60,
      中间: 412,
      底部: 764
    },
    // SE1
    1136: {
      小号: 282,
      中号: 584,
      大号: 622,
      左边: 30,
      右边: 332,
      顶部: 59,
      中间: 399,
      底部: 399
    },
    // 11 and XR in Display Zoom mode
    1624: {
      小号: 310,
      中号: 658,
      大号: 690,
      左边: 46,
      右边: 394,
      顶部: 142,
      中间: 522,
      底部: 902
    },
    // Plus in Display Zoom mode
    2001: {
      小号: 444,
      中号: 963,
      大号: 972,
      左边: 81,
      右边: 600,
      顶部: 90,
      中间: 618,
      底部: 1146
    },
  };
  return phones;
}

async function generateAlert(message, options) {
  const alert = new Alert();
  alert.message = message;
  for (const option of options) {
    alert.addAction(option);
  }
  const response = await alert.presentAlert();
  return response;
}
}

module.exports = {
  main
}