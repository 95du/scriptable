const alert = new Alert();
    alert.title = '车辆图片';
    alert.message = '请在相册选择您最喜欢的车辆图片以便展示到小组件上，最好是全透明背景PNG图。';
    alert.addAction('选择照片');
    alert.addCancelAction('取消');

    const id = await alert.presentAlert();
    if (id === -1) return await this.actionPreferenceSettings()
    try {
      const image = await Photos.fromLibrary();
      const imagePath = FileManager.local().joinPath(FileManager.local().documentsDirectory(), `myCarPhoto_${this.SETTING_KEY}`);
      await FileManager.local().writeImage(imagePath, image);
      this.settings['myCarPhoto'] = imagePath;
      await this.saveSettings();
      return await this.actionPreferenceSettings()
    } catch (error) {
      // 取消图片会异常 暂时不用管
    }