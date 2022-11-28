// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: cloud-download-alt;
async function main() {
  const canvas = new DrawContext();  
  const canvSize = 200;
  const canvTextSize = 23;
  canvas.opaque = false;
  
  const batteryLevel = Device.batteryLevel();
  
  if (batteryLevel <= '0.2') {
    circleColor = "#D50000"
  } else if (batteryLevel <= '0.3') {
    circleColor = "#FFD723"
  } else if (batteryLevel <= '0.7') {
    circleColor = "#24FFD7"
  } else {
    circleColor = "#3BC952"
  }
  
  const canvFillColor = circleColor;
  const canvStrokeColor = '555555';
  (Device.isCharging() ? canvTextColor = circleColor : canvTextColor = 'fff')
  // #1da0f2
  
  const canvWidth = 13;
  const canvRadius = 62;
  
  canvas.size = new Size(canvSize, canvSize);
  canvas.respectScreenScale = true;
  
  function sinDeg(deg) {
    return Math.sin((deg * Math.PI) / 180);
  }
  
  function cosDeg(deg) {
    return Math.cos((deg * Math.PI) / 180);
  }
  
  function drawArc(ctr, rad, w, deg) {
    bgx = ctr.x - rad;
    bgy = ctr.y - rad;
    bgd = 2 * rad;
    bgr = new Rect(bgx, bgy, bgd, bgd);
  
    canvas.setFillColor(new Color(canvFillColor));
    canvas.setStrokeColor(new Color(canvStrokeColor));
    canvas.setLineWidth(w);
    canvas.strokeEllipse(bgr);
  
    for (t = 0; t < deg; t++) {
      rect_x = ctr.x + rad * sinDeg(t) - w / 2;
      rect_y = ctr.y - rad * cosDeg(t) - w / 2;
      rect_r = new Rect(rect_x, rect_y, w, w);
      canvas.fillEllipse(rect_r);
    }
  }
  
  drawArc(
    new Point(canvSize / 2, canvSize / 2),
    canvRadius,
    canvWidth,
    Math.floor(batteryLevel * 100 * 3.6)
  );
  
  const canvTextRect = new Rect(
    0,
    100 - canvTextSize / 2,
    canvSize,
    canvTextSize
  );
  
  
  const widget = new ListWidget();
  widget.setPadding(0, 0, 0, 0);
  let Stack = widget.addStack();
  Stack.layoutHorizontally();
  Stack.setPadding(0, 0, 0, 0);
  
  canvas.setTextAlignedCenter();
  canvas.setTextColor(new Color(canvTextColor));
  canvas.setFont(Font.boldSystemFont(canvTextSize));
  canvas.drawTextInRect(`${Math.floor(batteryLevel * 100)} ` + '%', canvTextRect);
  
  let gradient = new LinearGradient()
    gradient.locations = [0, 1]
    gradient.colors = [
      new Color("161616"),
      new Color("13233F")
    ]
    widget.backgroundGradient = gradient
  
  Stack.addImage(canvas.getImage())
  Script.setWidget(widget);
  await widget.presentSmall();
  Script.complete();
}

module.exports = {
  main
};