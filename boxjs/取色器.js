// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: clock;
const webView = new WebView()
const webHtml = `
  <meta charset="utf-8" >
    <title>取色器</title>
  <meta name="viewport" content="width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>

<link rel="stylesheet" href="https://static.runoob.com/assets/js/shadowlord/dist/css/app.css?1.00" media="all"/>
<div class="row">
  <div class="col-md-12">
    <div class="card">    <div class="card-header">


<!-- search-->
<header class="flex items-center">
      <div class="header__logo mr05"></div>
      <button class="mdc-icon-button" data-btn-info type="button" aria-label="project info" style="display:none;">
        <svg class="mdc-icon-button__icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
        </svg>
      </button>
      <div class="header__input-wrapper flex flex-auto">
        <div class="flex items-center">
          <button class="mdc-button" data-btn-color-picker type="button" aria-label="toggle color picker dialog">
            <span class="mdc-button__ripple"></span>
            <svg class="mdc-button__icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.92,19L5,17.08L13.06,9L15,10.94M20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L13.84,6.41L11.91,4.5L10.5,5.91L11.92,7.33L3,16.25V21H7.75L16.67,12.08L18.09,13.5L19.5,12.09L17.58,10.17L20.7,7.05C21.1,6.65 21.1,6 20.71,5.63Z" />
            </svg>
            <span class="mdc-button__label header__preview-color"></span>
          </button>
        </div>
        <label data-color-input class="mdc-text-field mr05">
          <span class="mdc-text-field__ripple"></span>
          <input  id="mdc-color" class="mdc-text-field__input" aria-labelledby="text-field-color-input" value="#6200ee" required>
          <span class="mdc-floating-label" id="text-field-color-input">Color</span>
          <span class="mdc-line-ripple"></span>
        </label>
        <label data-percent-input class="mdc-text-field mdc-text-field--with-leading-icon">
          <span class="mdc-text-field__ripple"></span>
          <span class="mdc-text-field__icon mdc-text-field__icon--leading">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.5 3.5L20.5 5.5L5.5 20.5L3.5 18.5L18.5 3.5M7 4C8.66 4 10 5.34 10 7C10 8.66 8.66 10 7 10C5.34 10 4 8.66 4 7C4 5.34 5.34 4 7 4M17 14C18.66 14 20 15.34 20 17C20 18.66 18.66 20 17 20C15.34 20 14 18.66 14 17C14 15.34 15.34 14 17 14M7 6C6.45 6 6 6.45 6 7C6 7.55 6.45 8 7 8C7.55 8 8 7.55 8 7C8 6.45 7.55 6 7 6M17 16C16.45 16 16 16.45 16 17C16 17.55 16.45 18 17 18C17.55 18 18 17.55 18 17C18 16.45 17.55 16 17 16Z" />
            </svg>
          </span>
          <input class="mdc-text-field__input" aria-labelledby="text-field-percent-input" type="number" inputmode="decimal" value="10" min="1" max="100" step="0.1" required>
          <span class="mdc-floating-label" id="text-field-percent-input">Percent factor</span>
          <span class="mdc-line-ripple"></span>
        </label>
      </div>
      <div class="header__random-btn">
        <button class="mdc-icon-button" data-btn-random type="button" aria-label="generate tints and shades from a random color">
          <svg class="mdc-icon-button__icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14.83,13.41L13.42,14.82L16.55,17.95L14.5,20H20V14.5L17.96,16.54L14.83,13.41M14.5,4L16.54,6.04L4,18.59L5.41,20L17.96,7.46L20,9.5V4M10.59,9.17L5.41,4L4,5.41L9.17,10.58L10.59,9.17Z" />
          </svg>
        </button>
      </div>
    </header>

    <main></main>
    <script src="https://static.runoob.com/assets/js/shadowlord/dist/js/index.js"></script>    
<!-- end -->
`
await webView.loadHTML(webHtml)
await webView.present()