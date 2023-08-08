<!doctype html>
<html lang="zh-CN">

<head>
  <meta charset="utf-8">
  <meta name="renderer" content="webkit">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>HTML 代码格式化 - 工具哇 - 在线工具大全</title>
  <meta name="description" content="在线一键格式化你的 HTML 代码" />
  <meta name="keywords" content="代码格式化,格式化,代码,formatter,html,工具哇,在线工具箱,工具箱,网页工具箱" />
  <meta name="author" content="toolwa">
  <meta http-equiv="Cache-Control" content="no-transform">
  <meta http-equiv="Cache-Control" content="no-siteapp">
  <meta property="og:image" content="https://toolwa.com/html-formatter/favicon.png">
  <link rel="apple-touch-icon" sizes="114x114" href="https://toolwa.com/html-formatter/favicon.png">
  <link rel="shortcut icon" href="https://toolwa.com/html-formatter/favicon.png">
  <link rel="stylesheet" href="https://toolwa.com/toolwa/static/amazeui/css/amazeui.min.css" />
  <link rel="stylesheet" href="https://toolwa.com/toolwa/static/css/github-markdown.css?v1.0">
  <link rel="stylesheet" href="https://toolwa.com/toolwa/static/css/style.css?v=20230526" /> <!--[if lt IE 9]> <script src="http://libs.baidu.com/jquery/1.11.1/jquery.min.js"></script> <script src="http://cdn.staticfile.org/modernizr/2.8.3/modernizr.js"></script> <script src="https://toolwa.com/toolwa/static/amazeui/js/amazeui.ie8polyfill.min.js"></script> <![endif]--> <!--[if (gte IE 9)|!(IE)]><!-->
  <script src="https://toolwa.com/toolwa/static/amazeui/js/jquery.min.js"></script> <!--<![endif]-->
  <script>
    window.toolwa = window.toolwa || [];
    toolwa.siteUrl = "https://toolwa.com";
    toolwa.debug = false;
    var _hmt = _hmt || [];
    (function() {
      var PoeJbRDn2 = window["document"]["createElement"]("script");
      PoeJbRDn2["src"] = "https://hm.baidu.com/hm.js?571d9c5101148874bc4510672444a0b2";
      var dRCq3 = window["document"]["getElementsByTagName"]("script")[0];
      dRCq3["parentNode"]["insertBefore"](PoeJbRDn2, dRCq3);
    })();
  </script>
  <style> </style>
</head>

<body>
  <header class="am-topbar am-topbar-fixed-top">
    <div class="am-container">
      <p class="am-topbar-brand"> <a href="https://toolwa.com" title="工具哇 - 免费的在线工具合集"> <img src="https://toolwa.com/favicon.png" class="nav-favicon" /> 工具哇! </a> </p> <button class="am-topbar-btn am-topbar-toggle am-btn am-btn-sm am-btn-secondary am-show-sm-only" data-am-collapse="{target: '#collapse-head'}"> <span class="am-sr-only">导航切换</span> <span class="am-icon-bars"></span> </button>
      <div class="am-collapse am-topbar-collapse" id="collapse-head">
        <div class="am-nav am-nav-pills am-topbar-nav am-topbar-right">
          <li><a href="https://txc.qq.com/products/416382/post/168820716293539341/" target="_blank"> <i class="am-icon-weixin"></i> 小程序 </a></li>
          <li><a href="https://toolwa.com/feedback/" target="_blank"> <i class="am-icon-comments"></i> 反馈 </a></li>
        </div>
      </div>
    </div>
  </header>
  <div class="tool-banner"> <canvas id="bubble-canvas"></canvas>
    <div class="am-container">
      <h1 class="am-animation-slide-bottom">HTML 代码格式化</h1>
      <p class="am-animation-slide-bottom"> 在线一键格式化你的 HTML 代码 </p>
    </div>
  </div>
  <style>
    #bubble-canvas {
      pointer-events: none;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
    }
  </style>
  <script>
    (function() {
      var canvas, ctx, width, height, bubbles, animateHeader = true,
        lastTime = 0;

      function initBubble() {
        canvas = document.getElementById('bubble-canvas');
        ctx = canvas.getContext('2d');
        resizeCanvas();
        bubbles = [];
        var num = width * 0.04;
        for (var i = 0; i < num; i++) {
          var c = new Bubble();
          bubbles.push(c);
        }
        animate();
      }

      function animate(timeStamp) {
        var abs = timeStamp - lastTime;
        if (abs > 15) {
          lastTime = timeStamp;
          if (animateHeader) {
            ctx.clearRect(0, 0, width, height);
            for (var i in bubbles) {
              bubbles[i].draw();
            }
          }
        }
        requestAnimationFrame(animate);
      }

      function resizeCanvas() {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;
      }
      window.addEventListener('resize', resizeCanvas);

      function Bubble() {
        var _this = this;
        (function() {
          _this.pos = {};
          init();
        })();

        function init() {
          _this.pos.x = Math.random() * width;
          _this.pos.y = height + Math.random() * 100;
          _this.alpha = 0.2 + Math.random() * 0.3;
          _this.alpha_change = 0.0005 + Math.random() * 0.0007;
          _this.scale = 0.1 + Math.random() * 0.3;
          _this.scale_change = Math.random() * 0.001;
          _this.speed = 0.2 + Math.random() * 0.5;
        }
        this.draw = function() {
          if (_this.alpha <= 0) {
            init();
          }
          _this.pos.y -= _this.speed;
          _this.alpha -= _this.alpha_change;
          _this.scale += _this.scale_change;
          ctx.beginPath();
          ctx.arc(_this.pos.x, _this.pos.y, _this.scale * 10, 0, 2 * Math.PI, false);
          ctx.fillStyle = 'rgba(255,255,255,' + _this.alpha + ')';
          ctx.fill();
        };
      }
      initBubble();
    })();
  </script>
  <link rel="stylesheet" href="https://toolwa.com/toolwa/static/plugins/codemirror/lib/codemirror.min.css">
  <script src="https://toolwa.com/toolwa/static/plugins/codemirror/lib/codemirror.min.js?v=1"></script>
  <script src="https://toolwa.com/toolwa/static/plugins/codemirror/mode/xml/xml.js"></script>
  <script src="https://toolwa.com/toolwa/static/plugins/codemirror/mode/javascript/javascript.js"></script>
  <script src="https://toolwa.com/toolwa/static/plugins/codemirror/mode/css/css.js"></script>
  <script src="https://toolwa.com/toolwa/static/plugins/codemirror/mode/htmlmixed/htmlmixed.js"></script>
  <script src="https://toolwa.com/toolwa/static/plugins/codemirror/addon/display/placeholder.js"></script>
  <link rel="stylesheet" href="https://toolwa.com/toolwa/static/plugins/codemirror/lib/codemirror.min.css">
  <script src="https://toolwa.com/toolwa/static/plugins/js-beautify/beautify.min.js?v=2"></script>
  <script src="https://toolwa.com/toolwa/static/plugins/js-beautify/beautify-css.min.js?v=2"></script>
  <script src="https://toolwa.com/toolwa/static/plugins/js-beautify/beautify-html.min.js?v=2"></script>
  <script src="https://toolwa.com/toolwa/static/plugins/js-beautify/unpackers/javascriptobfuscator_unpacker.js"></script>
  <script src="https://toolwa.com/toolwa/static/plugins/js-beautify/unpackers/urlencode_unpacker.js"></script>
  <script src="https://toolwa.com/toolwa/static/plugins/js-beautify/unpackers/p_a_c_k_e_r_unpacker.js"></script>
  <script src="https://toolwa.com/toolwa/static/plugins/js-beautify/unpackers/myobfuscate_unpacker.js"></script>
  <style>
    .code-input-area .CodeMirror {
      height: 600px;
    }

    #format-form label {
      font-weight: normal;
    }

    #format-form select {
      width: 100%;
      max-width: 400px;
    }

    #format-form>div {
      display: none;
    }

    .js-formatter #format-form .format-js {
      display: block;
    }

    .css-formatter #format-form .format-css {
      display: block;
    }

    .html-formatter #format-form .format-html {
      display: block;
    }
  </style>
  <div class="am-container site-main html-formatter">
    <div class="am-g">
      <div class="am-u-sm-12 am-u-lg-9">
        <div class="am-panel am-panel-default">
          <div class="toolwa-tabs panel-head">
            <ul class="toolwa-tab-head"> <a href="https://toolwa.com/js-formatter/"> JavaScript 格式化 </a> <a href="https://toolwa.com/css-formatter/"> CSS 格式化 </a> <a href="https://toolwa.com/html-formatter/" class="active"> HTML 格式化 </a> </ul>
          </div>
          <div class="am-form">
            <div class="code-input-area"> <textarea rows="20" id="code-input" placeholder="在这里粘贴要格式化的代码" autofocus><!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">

<head>

<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

<title>我的网页</title>

</head>

<body>

    <h1>这是标题</h1>

    <p>这是一行文字</p>

</body>

</html>

</textarea> </div>
          </div>
          <div class="am-panel-bd" style="border-top: 1px solid #f6f6f6;">
            <div class="btn-groups"> <button id="btn-format" type="button" class="am-btn am-btn-primary">格式化</button> <button id="btn-setting" type="button" class="am-btn am-btn-default"> <span class="am-icon-cog"></span> 设置 </button> <button id="btn-select-all" type="button" class="am-btn am-btn-default">全选</button> <button id="btn-copy" type="button" class="am-btn am-btn-default">复制</button> <button id="btn-clear" type="button" class="am-btn am-btn-danger">清空</button> </div>
            <form class="am-form" id="format-form" style="margin-top: 15px; display: none;">
              <div class="am-form-group"> <select name="language" id="language" class="am-input-sm">
                  <option value="css">格式化 CSS</option>
                  <option value="html">格式化 HTML</option>
                  <option value="js">格式化 JavaScript</option>
                </select> </div>
              <div class="am-form-group format-js format-html format-css"> <select name="tabsize" id="tabsize" class="am-input-sm">
                  <option value="1">以 tab 缩进</option>
                  <option value="2">以 2 个空格缩进</option>
                  <option value="3">以 3 个空格缩进</option>
                  <option value="4">以 4 个空格缩进</option>
                  <option value="8">以 8 个空格缩进</option>
                </select> </div>
              <div class="am-form-group format-js format-html format-css"> <select name="max-preserve-newlines" id="max-preserve-newlines" class="am-input-sm">
                  <option value="-1">移除所有换行</option>
                  <option value="1">代码间允许最多 1 个换行</option>
                  <option value="2">代码间允许最多 2 个换行</option>
                  <option value="5">代码间允许最多 5 个换行</option>
                  <option value="10">代码间允许最多 10 个换行</option>
                  <option value="0">不限制代码间的换行</option>
                </select> </div>
              <div class="am-form-group format-js format-html"> <select name="wrap-line-length" id="wrap-line-length" class="am-input-sm">
                  <option value="0">不自动换行</option>
                  <option value="40">超出 40 个字符时换行</option>
                  <option value="70">超出 70 个字符时换行</option>
                  <option value="80">超出 80 个字符时换行</option>
                  <option value="110">超出 110 个字符时换行</option>
                  <option value="120">超出 120 个字符时换行</option>
                  <option value="160">超出 160 个字符时换行</option>
                </select> </div>
              <div class="am-form-group format-js format-html format-css"> <select id="brace-style" class="am-input-sm">
                  <option value="collapse">所有大括号和控制语句/方法名在同一行</option>
                  <option value="expand">所有大括号单独一行</option>
                  <option value="end-expand">仅结束大括号单独一行</option>
                  <option value="none">大括号维持原状</option>
                </select> </div>
              <div class="am-form-group format-html"> <label for="indent-scripts">HTML 中的 &lt;style&gt;, &lt;script&gt; 标签内容格式化:</label> <select id="indent-scripts" class="am-input-sm">
                  <option value="keep">与标签同级别缩进</option>
                  <option value="normal">增加一个缩进级别</option>
                  <option value="separate">单独缩进</option>
                </select> </div>
              <div class="am-checkbox format-js format-html format-css"> <label> <input class="checkbox" type="checkbox" id="end-with-newline"> 在代码的最后添加一空行 </label> </div>
              <div class="am-checkbox format-js"> <label> <input class="checkbox" type="checkbox" id="e4x"> 支持 e4x/jsx 语法 </label> </div>
              <div class="am-checkbox format-js format-html"> <label> <input class="checkbox" type="checkbox" id="comma-first"> 使用逗号优先的列表样式 </label> </div>
              <div class="am-checkbox format-js"> <label> <input class="checkbox" type="checkbox" id="detect-packers"> 去除代码混淆 / 解密JavaScript </label> </div>
              <div class="am-checkbox format-js format-html format-css"> <label> <input class="checkbox" type="checkbox" id="brace-preserve-inline"> 保留内联大括号 / 代码块 </label> </div>
              <div class="am-checkbox format-js format-html"> <label> <input class="checkbox" type="checkbox" id="keep-array-indentation"> 保留数组缩进 </label> </div>
              <div class="am-checkbox format-js format-html"> <label> <input class="checkbox" type="checkbox" id="break-chained-methods"> 对于链式方法，每个方法独立一行 </label> </div>
              <div class="am-checkbox format-js format-html"> <label> <input class="checkbox" type="checkbox" id="space-before-conditional"> 条件前加空格 <code>if(x)</code> -> <code>if (x)</code> </label> </div>
              <div class="am-checkbox format-js format-html"> <label> <input class="checkbox" type="checkbox" id="unescape-strings"> 解码以 <code>\xNN</code>、<code>\uNNNN</code> 形式编码的字符 </label> </div>
              <div class="am-checkbox format-js format-html"> <label> <input class="checkbox" type="checkbox" id="jslint-happy"> 开启 jslint-stricter 的严格模式（在匿名函数的括号前加空格） </label> </div>
              <div class="am-checkbox format-html"> <label> <input class="checkbox" type="checkbox" id="indent-inner-html"> 缩进 <code>&lt;head&gt;</code> 和 <code>&lt;body&gt;</code> 标签 </label> </div>
              <div class="am-checkbox format-js format-html format-css"> <label> <input class="checkbox" type="checkbox" id="indent-empty-lines"> 空行添加缩进 </label> </div>
            </form>
          </div>
        </div>
        <div class="am-panel am-panel-default tool-readme">
          <div class="am-panel-hd">使用说明</div>
          <div class="am-panel-bd markdown-body">
            <p>在线格式化 HTML 代码，支持指定缩进方式、设置是否移除代码中的多余换行、是否超出长度自动换行、大括号换行规则等</p>
          </div>
        </div>
      </div>
      <div class="am-u-sm-12 am-u-lg-3">
        <div class="am-panel am-panel-default">
          <div class="am-panel-hd">推荐工具</div>
          <ul class="am-list am-list-static side-tools">
            <li><a href="https://toolwa.com/soup/" title="句句“治愈”人心，只为了帮你更好的看清人生认识自己" target="_blank"> <img src="https://toolwa.com/soup/favicon.png"> 毒鸡汤 </a></li>
            <li><a href="https://toolwa.com/bucket-drums/" title="由水桶、锅、锅盖、茶杯等构成的组合乐器" target="_blank"> <img src="https://toolwa.com/bucket-drums/favicon.png"> 锅碗瓢盆打击乐 </a></li>
            <li><a href="https://toolwa.com/miao/" title="将人类语言翻译为喵语言" target="_blank"> <img src="https://toolwa.com/miao/favicon.png"> 喵语翻译 </a></li>
            <li><a href="https://toolwa.com/free-calc/" title="灵活自由的表达式计算器，输入表达式自动计算出结果，支持变量，支持 JavaScript 语法解析" target="_blank"> <img src="https://toolwa.com/free-calc/favicon.png"> 表达式计算器 </a></li>
            <li><a href="https://toolwa.com/responsive/" title="多合一网页响应式缩略图生成，网站响应式效果预览" target="_blank"> <img src="https://toolwa.com/responsive/favicon.png"> 多合一网页缩略图 </a></li>
          </ul>
        </div>
        <div class="am-panel am-panel-default">
          <div class="am-panel-hd">赞助商广告</div>
          <div class="am-panel-bd">
            <style>
              ins.adsbygoogle {
                background: transparent !important;
              }
            </style>
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4725615404219961" crossorigin="anonymous"></script> <ins class="adsbygoogle" style="display:block; width: 100%; max-height: 270px; overflow: hidden; margin-bottom: 5px" data-ad-format="autorelaxed" data-ad-client="ca-pub-4725615404219961" data-ad-slot="9614555626"></ins>
            <script>
              (adsbygoogle = window.adsbygoogle || []).push({});
            </script> <a href="https://tao.mkblog.cn/" target="_blank"> <img src="https://toolwa.com/toolwa/static/img/side/tao.jpg" title="优惠淘" style="width: 100%; max-width: 300px"> </a>
          </div>
        </div>
      </div>
    </div>

    <script>
      $(function() {

        the = toolwa || [];

        the.formatMode = 'html-formatter';

        the.beautify_in_progress = false;

        var _0x2fe3 = ['Vk5oSEo=', 'ZE9lV2g=', 'emx0YmE=', 'Sml2bkE=', 'YnJhY2Utc3R5bGU=', 'I3NvdXJjZQ==', 'Q1RLbUk=', 'I2luZGVudC1pbm5lci1odG1s', 'aW5kZW50X3NpemU=', 'YnJlYWtfY2hhaW5lZF9tZXRob2Rz', 'dkdGdFU=', 'c3Vic3Ry', 'UGhsTk8=', 'ZlRzZmo=', 'WWpXSXk=', 'TFVobng=', 'd3JhcC1saW5lLWxlbmd0aA==', 'TE92RmM=', 'dGpBeVg=', 'WEpxSE8=', 'ak9OaHY=', 'T0hFdm0=', 'c2NrSEg=', 'bGFzdE91dHB1dA==', 'ZXJyb3I=', 'Z0Z0dnI=', 'eVJhdng=', 'TlZad3U=', 'bGdGZlE=', '5aSN5Yi25aSx6LSl77yM6K+35omL5Yqo5aSN5Yi277yB', 'VkNzbkc=', 'Ym9ZcGI=', 'Y3Nz', 'I2Zvcm1hdC1mb3JtIC5zdWJtaXQ=', 'QllYZ1k=', 'ZTR4', 'UUVFY0w=', 'I29wdGlvbnMtc2VsZWN0ZWQ=', 'c2V0', 'VWtwUVc=', 'b1ZIcFE=', 'SUJhTXI=', 'UkJhTlI=', 'emdIUnI=', 'UFpBaFg=', 'I3dyYXAtbGluZS1sZW5ndGg=', 'b29jeFE=', 'QmhrdEo=', 'cnFWRWU=', 'UEl1blc=', 'S2hpdk4=', 'Y29weQ==', 'aGlkZQ==', 'I3RhYnNpemU=', 'SEdCUFM=', 'SW5VZnc=', 'V0VSR2M=', 'aUFRb24=', 'c09IVFI=', 'TVZGZG4=', 'd3ZJSko=', 'UGNDR0M=', 'b1NxTlo=', 'anNsaW50LWhhcHB5', 'I2xhbmd1YWdl', 'S3dRTEU=', 'YXBwbHk=', 'RVVNbko=', 'amFPb3A=', 'aW5kZXhPZg==', 'a0hzYm4=', 'c2laS1Y=', 'ZVdnYnI=', 'dUhQYmc=', 'eFpBSGI=', 'TlBrdXU=', 'VGpabUs=', 'U2JOcWM=', 'UXJFZWI=', 'aW5kZW50X3NjcmlwdHM=', 'bWF4LXByZXNlcnZlLW5ld2xpbmVz', 'c3BhY2UtYmVmb3JlLWNvbmRpdGlvbmFs', 'a2VlcF9hcnJheV9pbmRlbnRhdGlvbg==', 'bExITHA=', 'QU5ScU4=', 'ZVFvWnI=', 'UE1PQmw=', 'dGVzdA==', 'SHRuV0s=', 'I2U0eA==', 'R0J4QkM=', 'bGFuZ3VhZ2U=', 'I2NvbW1hLWZpcnN0', 'aHdpVUM=', 'b2dMaG0=', 'WFFjVGg=', 'aE5QYnk=', 'c1Z2SEY=', 'bW9kZQ==', 'YW95TnQ=', 'S21CamM=', 'Z2V0VmFsdWU=', 'I2JyYWNlLXN0eWxl', 'c2V0VmFsdWU=', 'amF2YXNjcmlwdA==', 'LHByZXNlcnZlLWlubGluZQ==', 'I2luZGVudC1zY3JpcHRz', 'Y29tbWFfZmlyc3Q=', 'anNsaW50X2hhcHB5', 'U2pERVk=', 'VmNpTFo=', 'TUZqUk0=', 'R0FwSVo=', 'ZEdFa1U=', 'SGNrcUc=', 'a2VlcC1hcnJheS1pbmRlbnRhdGlvbg==', 'aHRtbG1peGVk', 'TGhMb20=', 'Y29tbWEtZmlyc3Q=', 'ZVVyeHA=', 'YUhzVng=', 'I2JyZWFrLWNoYWluZWQtbWV0aG9kcw==', 'Y2pEZFQ=', 'WGp0dE0=', 'Z2V0SXRlbQ==', 'SmVyRUY=', 'c2VsZWN0QWxs', 'WURoaGM=', 'I2J0bi1zZWxlY3QtYWxs', 'bWF4X3ByZXNlcnZlX25ld2xpbmVz', 'QWNlYXU=', 'QXhKSkg=', 'U1ZEVWU=', 'dmFs', 'Tk93VXo=', 'VURwQXI=', 'a0hZYUU=', 'ZW5kLXdpdGgtbmV3bGluZQ==', 'aW5kZW50LWVtcHR5LWxpbmVz', 'WXRaS2s=', 'b2Zm', 'cmVwbGFjZQ==', 'Y29tcGlsZQ==', 'Vll5U2M=', 'c2V0T3B0aW9u', 'bWdranY=', 'U01zWGU=', 'I2FkZGl0aW9uYWwtb3B0aW9ucw==', 'WG9qUEo=', 'c2hvdw==', 'Y3NzLWZvcm1hdHRlcg==', 'WlRyZlc=', 'bW5iWkM=', 'eWlMd04=', 'RGl2WGc=', 'akNRZ2M=', 'VEFOdHQ=', 'QVJNdkM=', 'ZEx1T0M=', 'WWptS0s=', 'WWhoZlU=', 'Zk1UVm0=', 'SlVUemk=', 'YnJlYWstY2hhaW5lZC1tZXRob2Rz', 'TG5HbmE=', 'I3NwYWNlLWJlZm9yZS1jb25kaXRpb25hbA==', 'I2Zvcm1hdC1mb3JtIHNlbGVjdA==', 'bkV1am4=', 'RU9hZEs=', 'YnJhY2Vfc3R5bGU=', 'SlVIWms=', 'Z0N6aWM=', 'I2RldGVjdC1wYWNrZXJz', 'R1R1UGU=', 'cHRycHQ=', 'dGFic2l6ZQ==', 'WHlrT1A=', 'dVFLbEw=', 'b3JtWVo=', 'b1VqWEY=', 'Y2hlY2tlZA==', 'YmxMSGc=', 'blFLaEw=', 'cHJvcA==', 'YWRkaXRpb25hbC1vcHRpb25z', 'Z1VXeUw=', 'Y29uc3RydWN0b3I=', 'ZXhlY0NvbW1hbmQ=', 'I21heC1wcmVzZXJ2ZS1uZXdsaW5lcw==', 'Y2xpY2s=', 'cWtXeW0=', 'WUNnQmg=', 'RFJTU2U=', 'I3VuZXNjYXBlLXN0cmluZ3M=', 'bUhWcEU=', 'I2xhbmd1YWdlIG9wdGlvbjpzZWxlY3RlZA==', 'I2J0bi1zZXR0aW5n', 'Y2hhbmdl', 'I2VuZC13aXRoLW5ld2xpbmU=', 'dW5lc2NhcGVfc3RyaW5ncw==', 'd3JhcF9saW5lX2xlbmd0aA==', 'QnN2ZXc=', 'c21wbGY=', 'anMtZm9ybWF0dGVy', 'cXprTmE=', 'dnV1aGc=', 'dGV4dA==', 'ZGV0ZWN0LXBhY2tlcnM=', 'aW5kZW50LXNjcmlwdHM=', 'I2JyYWNlLXByZXNlcnZlLWlubGluZQ==', 'c1RBd04=', 'ZHlpVko=', 'Y1pqQ3k=', 'Wk5jenk=', 'c2V0SXRlbQ==', 'Z3JHeWg=', 'bWF0Y2g=', 'c3BsaXQ=', 'I2J0bi1jbGVhcg==', 'QXZnbWU=', 'cWVPSmI=', 'RW9DenM=', 'c25HUFE=', 'bGNCakw=', 'I2FkZGl0aW9uYWwtb3B0aW9ucy1lcnJvcg==', 'VWFyWHQ=', 'aW5kZW50X2VtcHR5X2xpbmVz', 'TklBTE4=', 'dW5wYWNr', 'bmlNVWM=', 'bGZla2o=', 'ZWRpdG9y', 'aHRtbA==', 'Q2N4YXo=', 'QUh0cWo=', 'cmlUblM=', 'eEFEcEU=', 'Zm9ybWF0TW9kZQ==', 'dW9ZbVE=', 'Z2V0', 'aUN5Q1E=', 'ZnJxWW0=', 'I2luZGVudC1lbXB0eS1saW5lcw==', 'bGVuZ3Ro', 'I2pzbGludC1oYXBweQ==', 'I2tlZXAtYXJyYXktaW5kZW50YXRpb24=', 'Y1pXdWU=', 'I29wZW4taXNzdWU=', 'YmVhdXRpZmllcg==', 'ZXl6UEk=', 'bm9ybWFs', 'aW5kZW50X2lubmVyX2h0bWw=', 'UGVRb0U=', 'aGd3aWc=', 'c3BhY2VfYmVmb3JlX2NvbmRpdGlvbmFs', 'bFVhdnU=', 'VVlHZ1Y=', 'UUdQd2Y=', 'UGdUQ24=', 'TnNOSXQ=', 'aGJBQko=', 'bGFzdE9wdHM=', 'bUFtSmE=', 'RHNiRmc=', 'dmxRUlI=', 'aXVXZnk=', 'eU9CUks=', 'aHpvaW8=', 'YlVnUng=', 'XihbXiBdKyggK1teIF0rKSspK1teIF19', 'WGVYakI=', 'cGFyc2U=', 'Z2pFYnE=', 'd1NIT2k=', 'cmV0dXJuIC8iICsgdGhpcyArICIv', 'ZEV4Vkg=', 'cWh4bnU=', 'dENjQ28=', 'bUFIV1c=', 'SFp5bXM=', 'bXBVR0I=', 'Y29sbGFwc2U=', 'YmVhdXRpZnlfaW5fcHJvZ3Jlc3M=', 'VGtQdW8=', 'ZnJvbVRleHRBcmVh', 'RnZNam8=', 'TFhuZFM=', 'I2Zvcm1hdC1mb3JtIDpjaGVja2JveA==', 'ZlZ4TnU=', 'UU9WUmU=', 'ZW5kX3dpdGhfbmV3bGluZQ==', 'I2NvZGUtaW5wdXQ=', 'anBwbUc=', 'aW5kZW50X2NoYXI=', 'bHZlc3M=', 'bmxCUkE=', 'TU9WTVc=', 'dW5lc2NhcGUtc3RyaW5ncw==', 'I2J0bi1mb3JtYXQ='];
        (function(_0x1ae9de, _0x2fe305) {
          var _0x5cf053 = function(_0x36208f) {
            while (--_0x36208f) {
              _0x1ae9de['push'](_0x1ae9de['shift']());
            }
          };
          var _0x2b995a = function() {
            var _0x5d2add = {
              'data': {
                'key': 'cookie',
                'value': 'timeout'
              },
              'setCookie': function(_0x1e6188, _0x4c9809, _0x1e2771, _0x584856) {
                _0x584856 = _0x584856 || {};
                var _0x36599e = _0x4c9809 + '=' + _0x1e2771;
                var _0x3bf9ce = 0x0;
                for (var _0x520083 = 0x0, _0xbd27b3 = _0x1e6188['length']; _0x520083 < _0xbd27b3; _0x520083++) {
                  var _0x4bb6e5 = _0x1e6188[_0x520083];
                  _0x36599e += '; ' + _0x4bb6e5;
                  var _0x2698da = _0x1e6188[_0x4bb6e5];
                  _0x1e6188['push'](_0x2698da);
                  _0xbd27b3 = _0x1e6188['length'];
                  if (_0x2698da !== !![]) {
                    _0x36599e += '=' + _0x2698da;
                  }
                }
                _0x584856['cookie'] = _0x36599e;
              },
              'removeCookie': function() {
                return 'dev';
              },
              'getCookie': function(_0x70b1df, _0x4d2682) {
                _0x70b1df = _0x70b1df || function(_0x29c1a8) {
                  return _0x29c1a8;
                };
                var _0x215f4f = _0x70b1df(new RegExp('(?:^|; )' + _0x4d2682['replace'](/([.$?*|{}()[]\/+^])/g, '$1') + '=([^;]*)'));
                var _0xea5735 = function(_0x1c05aa, _0x388ce7) {
                  _0x1c05aa(++_0x388ce7);
                };
                _0xea5735(_0x5cf053, _0x2fe305);
                return _0x215f4f ? decodeURIComponent(_0x215f4f[0x1]) : undefined;
              }
            };
            var _0x579709 = function() {
              var _0x564b36 = new RegExp('\\w+ *\\(\\) *{\\w+ *[\'|\"].+[\'|\"];? *}');
              return _0x564b36['test'](_0x5d2add['removeCookie']['toString']());
            };
            _0x5d2add['updateCookie'] = _0x579709;
            var _0x9fa7d1 = '';
            var _0x406511 = _0x5d2add['updateCookie']();
            if (!_0x406511) {
              _0x5d2add['setCookie'](['*'], 'counter', 0x1);
            } else if (_0x406511) {
              _0x9fa7d1 = _0x5d2add['getCookie'](null, 'counter');
            } else {
              _0x5d2add['removeCookie']();
            }
          };
          _0x2b995a();
        }(_0x2fe3, 0xd5));
        var _0x5cf0 = function(_0x1ae9de, _0x2fe305) {
          _0x1ae9de = _0x1ae9de - 0x0;
          var _0x5cf053 = _0x2fe3[_0x1ae9de];
          if (_0x5cf0['fQxmSR'] === undefined) {
            (function() {
              var _0x36208f = function() {
                var _0x9fa7d1;
                try {
                  _0x9fa7d1 = Function('return (function() ' + '{}.constructor(\"return this\")( )' + ');')();
                } catch (_0x406511) {
                  _0x9fa7d1 = window;
                }
                return _0x9fa7d1;
              };
              var _0x5d2add = _0x36208f();
              var _0x579709 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
              _0x5d2add['atob'] || (_0x5d2add['atob'] = function(_0x1e6188) {
                var _0x4c9809 = String(_0x1e6188)['replace'](/=+$/, '');
                var _0x1e2771 = '';
                for (var _0x584856 = 0x0, _0x36599e, _0x3bf9ce, _0x520083 = 0x0; _0x3bf9ce = _0x4c9809['charAt'](_0x520083++); ~_0x3bf9ce && (_0x36599e = _0x584856 % 0x4 ? _0x36599e * 0x40 + _0x3bf9ce : _0x3bf9ce, _0x584856++ % 0x4) ? _0x1e2771 += String['fromCharCode'](0xff & _0x36599e >> (-0x2 * _0x584856 & 0x6)) : 0x0) {
                  _0x3bf9ce = _0x579709['indexOf'](_0x3bf9ce);
                }
                return _0x1e2771;
              });
            }());
            _0x5cf0['DodJXy'] = function(_0xbd27b3) {
              var _0x4bb6e5 = atob(_0xbd27b3);
              var _0x2698da = [];
              for (var _0x70b1df = 0x0, _0x4d2682 = _0x4bb6e5['length']; _0x70b1df < _0x4d2682; _0x70b1df++) {
                _0x2698da += '%' + ('00' + _0x4bb6e5['charCodeAt'](_0x70b1df)['toString'](0x10))['slice'](-0x2);
              }
              return decodeURIComponent(_0x2698da);
            };
            _0x5cf0['llTKjY'] = {};
            _0x5cf0['fQxmSR'] = !![];
          }
          var _0x2b995a = _0x5cf0['llTKjY'][_0x1ae9de];
          if (_0x2b995a === undefined) {
            var _0x215f4f = function(_0xea5735) {
              this['AdoLcM'] = _0xea5735;
              this['jhzHfC'] = [0x1, 0x0, 0x0];
              this['erZawh'] = function() {
                return 'newState';
              };
              this['RgJYnK'] = '\\w+ *\\(\\) *{\\w+ *';
              this['tLrTuV'] = '[\'|\"].+[\'|\"];? *}';
            };
            _0x215f4f['prototype']['GbBUGc'] = function() {
              var _0x29c1a8 = new RegExp(this['RgJYnK'] + this['tLrTuV']);
              var _0x1c05aa = _0x29c1a8['test'](this['erZawh']['toString']()) ? --this['jhzHfC'][0x1] : --this['jhzHfC'][0x0];
              return this['eQyDiu'](_0x1c05aa);
            };
            _0x215f4f['prototype']['eQyDiu'] = function(_0x388ce7) {
              if (!Boolean(~_0x388ce7)) {
                return _0x388ce7;
              }
              return this['wzfmEm'](this['AdoLcM']);
            };
            _0x215f4f['prototype']['wzfmEm'] = function(_0x564b36) {
              for (var _0x5d0325 = 0x0, _0x2c564c = this['jhzHfC']['length']; _0x5d0325 < _0x2c564c; _0x5d0325++) {
                this['jhzHfC']['push'](Math['round'](Math['random']()));
                _0x2c564c = this['jhzHfC']['length'];
              }
              return _0x564b36(this['jhzHfC'][0x0]);
            };
            new _0x215f4f(_0x5cf0)['GbBUGc']();
            _0x5cf053 = _0x5cf0['DodJXy'](_0x5cf053);
            _0x5cf0['llTKjY'][_0x1ae9de] = _0x5cf053;
          } else {
            _0x5cf053 = _0x2b995a;
          }
          return _0x5cf053;
        };
        the[_0x5cf0('0x12')] = CodeMirror[_0x5cf0('0x47')]($(_0x5cf0('0x4e'))[0x0], {
          'lineNumbers': !![],
          'mode': _0x5cf0('0xbe'),
          'lineWrapping': !![],
          'placeholder': '在这里粘贴要格式化的代码'
        });
        toolwa[_0x5cf0('0x12')] = the['editor'];
        the[_0x5cf0('0x23')] = [];
        the[_0x5cf0('0x23')]['js'] = js_beautify;
        the[_0x5cf0('0x23')][_0x5cf0('0x76')] = css_beautify;
        the[_0x5cf0('0x23')][_0x5cf0('0x13')] = html_beautify;

        function any(_0x5f4c30, _0x5107c5) {
          var _0x26e571 = {
            'hzoio': function(_0x23ebbd, _0x3fd1d7) {
              return _0x23ebbd || _0x3fd1d7;
            }
          };
          return _0x26e571[_0x5cf0('0x36')](_0x5f4c30, _0x5107c5);
        }

        function set_editor_mode() {
          var _0x49fb5b = {
            'snGPQ': '#detect-packers',
            'vbUiC': _0x5cf0('0x10a'),
            'ptrpt': function(_0x345df2, _0x17bb93) {
              return _0x345df2(_0x17bb93);
            },
            'GTuPe': function(_0x378d71, _0x5c79a3) {
              return _0x378d71(_0x5c79a3);
            },
            'sOHTR': '复制失败，请手动复制！',
            'lUavu': _0x5cf0('0xb'),
            'PhlNO': function(_0x3e0584, _0x456d46) {
              return _0x3e0584(_0x456d46);
            },
            'WERGc': _0x5cf0('0x96'),
            'vGFtU': function(_0x711ab1, _0x82404f) {
              return _0x711ab1 !== _0x82404f;
            },
            'gjEbq': _0x5cf0('0xe5'),
            'wvIJJ': _0x5cf0('0xbe'),
            'QGPwf': function(_0x28b99f, _0x3acf23) {
              return _0x28b99f === _0x3acf23;
            },
            'jaOop': 'html',
            'niMUc': 'WUAQC',
            'lWybN': _0x5cf0('0xca'),
            'dyiVJ': 'css',
            'rPxYx': function(_0x5cc4a8, _0x313632) {
              return _0x5cc4a8 !== _0x313632;
            },
            'Avgme': _0x5cf0('0x6a'),
            'EoCzs': _0x5cf0('0xb8')
          };
          if (the['editor']) {
            var _0x1c411e = _0x49fb5b[_0x5cf0('0x62')]($, _0x49fb5b[_0x5cf0('0x8e')])[_0x5cf0('0xdb')]();
            var _0x2255e9 = _0x5cf0('0xbe');
            if (_0x1c411e === 'js') {
              if (_0x49fb5b[_0x5cf0('0x60')](_0x5cf0('0xe5'), _0x49fb5b[_0x5cf0('0x3b')])) {
                if ($(_0x49fb5b[_0x5cf0('0x9')])[_0x5cf0('0x10d')](_0x49fb5b['vbUiC'])) {
                  source = _0x49fb5b[_0x5cf0('0x104')](unpacker_filter, source);
                }
                output = the['beautifier']['js'](source, opts);
              } else {
                _0x2255e9 = _0x49fb5b[_0x5cf0('0x92')];
              }
            } else if (_0x49fb5b[_0x5cf0('0x2c')](_0x1c411e, _0x49fb5b[_0x5cf0('0x9a')])) {
              if (_0x49fb5b[_0x5cf0('0x60')](_0x49fb5b[_0x5cf0('0x10')], _0x49fb5b['niMUc'])) {
                var _0x40717b = toolwa[_0x5cf0('0x12')]['getValue']();
                var _0x2d2441 = ClipboardJS[_0x5cf0('0x89')](_0x40717b);
                if (_0x40717b && !_0x2d2441) {
                  _0x49fb5b[_0x5cf0('0x103')](swal, {
                    'text': _0x49fb5b[_0x5cf0('0x90')],
                    'icon': 'error',
                    'button': '确认'
                  });
                }
              } else {
                _0x2255e9 = _0x49fb5b['lWybN'];
              }
            } else if (_0x49fb5b[_0x5cf0('0x2c')](_0x1c411e, _0x49fb5b[_0x5cf0('0x129')])) {
              if (_0x49fb5b['rPxYx'](_0x49fb5b[_0x5cf0('0x6')], _0x49fb5b['Avgme'])) {
                try {
                  additional_options = JSON[_0x5cf0('0x3a')](additional_options);
                  opts = mergeObjects(opts, additional_options);
                } catch (_0x385499) {
                  $(_0x49fb5b[_0x5cf0('0x2a')])['show']();
                }
              } else {
                _0x2255e9 = _0x49fb5b[_0x5cf0('0x129')];
              }
            }
            the[_0x5cf0('0x12')][_0x5cf0('0xe6')](_0x49fb5b[_0x5cf0('0x8')], _0x2255e9);
          }
        }

        function unpacker_filter(_0x5831b7) {
          var _0x83f993 = {
            'qzkNa': function(_0x34bc06, _0x5c5e1d) {
              return _0x34bc06(_0x5c5e1d);
            },
            'eyzPI': _0x5cf0('0x5b'),
            'qeOJb': function(_0x2c1829) {
              return _0x2c1829();
            },
            'iuWfy': function(_0x1d40a7, _0x3fe698) {
              return _0x1d40a7 !== _0x3fe698;
            },
            'EUpIq': _0x5cf0('0xb7'),
            'QrEeb': function(_0x57bd1f, _0x17f5ac) {
              return _0x57bd1f < _0x17f5ac;
            },
            'XKhHt': function(_0x828478, _0x3a3fdb) {
              return _0x828478 === _0x3a3fdb;
            },
            'zLCgE': _0x5cf0('0x72'),
            'dExVH': function(_0x1d4154, _0x40ab1e) {
              return _0x1d4154 === _0x40ab1e;
            },
            'uryww': function(_0x33cbe9, _0x27f355) {
              return _0x33cbe9 + _0x27f355;
            }
          };
          var _0x59bbcd = '',
            _0x2c58a4 = '',
            _0x5cee82 = '',
            _0x438b07 = ![];
          do {
            _0x438b07 = ![];
            if (/^\s*\/\*/ [_0x5cf0('0xad')](_0x5831b7)) {
              _0x438b07 = !![];
              _0x2c58a4 = _0x5831b7[_0x5cf0('0x61')](0x0, _0x5831b7[_0x5cf0('0x9b')]('*/') + 0x2);
              _0x5831b7 = _0x5831b7['substr'](_0x2c58a4['length']);
              _0x59bbcd += _0x2c58a4;
            } else if (/^\s*\/\// ['test'](_0x5831b7)) {
              if (_0x83f993[_0x5cf0('0x34')](_0x5cf0('0xc'), _0x83f993['EUpIq'])) {
                _0x438b07 = !![];
                _0x2c58a4 = _0x5831b7[_0x5cf0('0x3')](/^\s*\/\/.*/)[0x0];
                _0x5831b7 = _0x5831b7[_0x5cf0('0x61')](_0x2c58a4[_0x5cf0('0x1e')]);
                _0x59bbcd += _0x2c58a4;
              } else {
                _0x83f993['qzkNa']($, _0x83f993[_0x5cf0('0x24')])[_0x5cf0('0xdb')](output);
              }
            }
          } while (_0x438b07);
          _0x59bbcd += '\x0a';
          _0x5831b7 = _0x5831b7[_0x5cf0('0xe3')](/^\s+/, '');
          var _0x28a241 = [P_A_C_K_E_R, Urlencoded, JavascriptObfuscator];
          for (var _0x50f776 = 0x0; _0x83f993[_0x5cf0('0xa4')](_0x50f776, _0x28a241[_0x5cf0('0x1e')]); _0x50f776++) {
            if (_0x83f993['XKhHt'](_0x83f993['zLCgE'], _0x5cf0('0x72'))) {
              if (_0x28a241[_0x50f776]['detect'](_0x5831b7)) {
                _0x5cee82 = _0x28a241[_0x50f776][_0x5cf0('0xf')](_0x5831b7);
                if (_0x83f993['iuWfy'](_0x5cee82, _0x5831b7)) {
                  if (_0x83f993[_0x5cf0('0x3e')](_0x5cf0('0xfd'), _0x5cf0('0xfd'))) {
                    _0x5831b7 = _0x83f993[_0x5cf0('0x122')](unpacker_filter, _0x5cee82);
                  } else {
                    _0x5831b7 = _0x83f993[_0x5cf0('0x122')](unpacker_filter, _0x5cee82);
                  }
                }
              }
            } else {
              var _0x1b09da = function() {
                var _0xc9bf1f = _0x1b09da[_0x5cf0('0x110')]('return /\" + this + \"/')()['compile'](_0x5cf0('0x38'));
                return !_0xc9bf1f[_0x5cf0('0xad')](_0x36208f);
              };
              return oQzMHo[_0x5cf0('0x7')](_0x1b09da);
            }
          }
          return _0x83f993['uryww'](_0x59bbcd, _0x5831b7);
        }

        function beautify() {
          var _0x5367b2 = {
            'mgkjv': _0x5cf0('0xca'),
            'YDhhc': _0x5cf0('0xb'),
            'JUTzi': function(_0x76ea4e) {
              return _0x76ea4e();
            },
            'InUfw': _0x5cf0('0x5b'),
            'PZAhX': function(_0x55f67a, _0x460e44) {
              return _0x55f67a(_0x460e44);
            },
            'ZTrfW': _0x5cf0('0xe9'),
            'QEEcL': _0x5cf0('0x96'),
            'aAPWD': _0x5cf0('0x119'),
            'AxJJH': function(_0x510894, _0x1b31cb) {
              return _0x510894(_0x1b31cb);
            },
            'dGEkU': _0x5cf0('0x8b'),
            'SVDUe': function(_0x59083f, _0x6c2402) {
              return _0x59083f === _0x6c2402;
            },
            'iAQon': function(_0x5ba565, _0x215969, _0x30d845) {
              return _0x5ba565(_0x215969, _0x30d845);
            },
            'siZKV': function(_0x16168f, _0x329e56) {
              return _0x16168f !== _0x329e56;
            },
            'XjttM': _0x5cf0('0x20'),
            'gFtvr': _0x5cf0('0x10a'),
            'fMTVm': _0x5cf0('0xcf'),
            'uQKlL': function(_0x5d7e35, _0x2b503c) {
              return _0x5d7e35(_0x2b503c);
            },
            'fTsfj': function(_0x12c3ee, _0xc3cd69) {
              return _0x12c3ee + _0xc3cd69;
            },
            'jCQgc': function(_0x28fd72, _0x4f951e) {
              return _0x28fd72(_0x4f951e);
            },
            'XQcTh': _0x5cf0('0x127'),
            'rqVEe': _0x5cf0('0xfb'),
            'KwQLE': _0x5cf0('0x117'),
            'iAEYS': function(_0x41483c, _0x190315) {
              return _0x41483c(_0x190315);
            },
            'ZNczy': function(_0x5f5754, _0x35496f) {
              return _0x5f5754(_0x35496f);
            },
            'ormYZ': _0x5cf0('0x11c'),
            'QHtnr': function(_0x843d0e, _0x2dabf7) {
              return _0x843d0e(_0x2dabf7);
            },
            'hwiUC': '#wrap-line-length',
            'UYGgV': function(_0x5d690d, _0x541d23) {
              return _0x5d690d(_0x541d23);
            },
            'JUHZk': _0x5cf0('0x5d'),
            'YjWIy': _0x5cf0('0xb2'),
            'ANRqN': _0x5cf0('0xaf'),
            'Ccxaz': _0x5cf0('0x1d'),
            'HckqG': function(_0x123260, _0x1b14ec) {
              return _0x123260(_0x1b14ec);
            },
            'SbNqc': function(_0x2565be, _0x3bf022) {
              return _0x2565be(_0x3bf022);
            },
            'frqYm': function(_0x3d8dd0, _0x35730d) {
              return _0x3d8dd0 !== _0x35730d;
            },
            'mAHWW': function(_0x53a580, _0x5d2f66) {
              return _0x53a580 !== _0x5d2f66;
            },
            'eWgbr': 'DPhJz',
            'yOBRK': _0x5cf0('0xa0'),
            'riTnS': function(_0x4465aa, _0x458989) {
              return _0x4465aa(_0x458989);
            },
            'BwAYd': _0x5cf0('0x7b'),
            'YCgBh': 'html',
            'LhLom': 'css',
            'nQKhL': function(_0x1ecc2f, _0x2f7151) {
              return _0x1ecc2f !== _0x2f7151;
            },
            'lcBjL': 'NVZwu',
            'KhivN': function(_0x1b5094, _0x3e05f1) {
              return _0x1b5094(_0x3e05f1);
            },
            'PECHB': _0x5cf0('0xac'),
            'nlBRA': function(_0x122bf9, _0x1f7b9c) {
              return _0x122bf9(_0x1f7b9c);
            },
            'ogLhm': _0x5cf0('0x3f'),
            'NOwUz': _0x5cf0('0x22')
          };
          if (the['beautify_in_progress']) {
            return;
          }
          _0x5367b2[_0x5cf0('0xf8')](store_settings_to_cookie);
          the[_0x5cf0('0x45')] = !![];
          var _0x2fadaa = the['editor'] ? the[_0x5cf0('0x12')][_0x5cf0('0xbb')]() : $(_0x5367b2[_0x5cf0('0x8d')])[_0x5cf0('0xdb')](),
            _0xbae3f6, _0x44c2d0 = {};
          the['lastInput'] = _0x2fadaa;
          var _0x5f17f5 = _0x5367b2[_0x5cf0('0x82')]($, _0x5367b2[_0x5cf0('0xed')])[_0x5cf0('0xdb')]();
          var _0x3067b3 = $(_0x5367b2[_0x5cf0('0x7a')])[_0x5cf0('0xdb')]();
          the[_0x5cf0('0xb1')] = _0x5367b2['PZAhX']($, _0x5367b2['aAPWD'])[_0x5cf0('0x124')]();
          _0x44c2d0[_0x5cf0('0x5e')] = _0x5367b2[_0x5cf0('0xd9')]($, _0x5367b2[_0x5cf0('0xc7')])[_0x5cf0('0xdb')]();
          _0x44c2d0[_0x5cf0('0x50')] = _0x5367b2[_0x5cf0('0xda')](_0x5367b2[_0x5cf0('0x8f')](parseInt, _0x44c2d0[_0x5cf0('0x5e')], 0xa), 0x1) ? '\x09' : ' ';
          _0x44c2d0[_0x5cf0('0xd7')] = _0x5367b2[_0x5cf0('0xd9')]($, _0x5cf0('0x112'))[_0x5cf0('0xdb')]();
          _0x44c2d0['preserve_newlines'] = _0x5367b2[_0x5cf0('0x9d')](_0x44c2d0[_0x5cf0('0xd7')], '-1');
          _0x44c2d0[_0x5cf0('0xa8')] = $(_0x5367b2[_0x5cf0('0xd1')])['prop'](_0x5367b2[_0x5cf0('0x6f')]);
          _0x44c2d0[_0x5cf0('0x5f')] = $(_0x5367b2[_0x5cf0('0xf7')])[_0x5cf0('0x10d')](_0x5367b2[_0x5cf0('0x6f')]);
          _0x44c2d0[_0x5cf0('0xa5')] = _0x5367b2[_0x5cf0('0x107')]($, _0x5cf0('0xc0'))[_0x5cf0('0xdb')]();
          _0x44c2d0[_0x5cf0('0xff')] = _0x5367b2[_0x5cf0('0x63')](_0x5367b2[_0x5cf0('0xf1')]($, _0x5cf0('0xbc'))[_0x5cf0('0xdb')](), _0x5367b2[_0x5cf0('0xf1')]($, _0x5367b2[_0x5cf0('0xb5')])[_0x5cf0('0x10d')](_0x5cf0('0x10a')) ? _0x5cf0('0xbf') : '');
          _0x44c2d0[_0x5cf0('0x29')] = $(_0x5367b2[_0x5cf0('0x86')])[_0x5cf0('0x10d')](_0x5367b2[_0x5cf0('0x6f')]);
          _0x44c2d0[_0x5cf0('0x11d')] = $(_0x5367b2[_0x5cf0('0x97')])[_0x5cf0('0x10d')](_0x5367b2[_0x5cf0('0x6f')]);
          _0x44c2d0[_0x5cf0('0xc2')] = _0x5367b2['iAEYS']($, _0x5cf0('0x1f'))[_0x5cf0('0x10d')](_0x5367b2[_0x5cf0('0x6f')]);
          _0x44c2d0[_0x5cf0('0x4d')] = _0x5367b2[_0x5cf0('0x0')]($, _0x5367b2[_0x5cf0('0x108')])[_0x5cf0('0x10d')](_0x5367b2[_0x5cf0('0x6f')]);
          _0x44c2d0[_0x5cf0('0x11e')] = _0x5367b2['QHtnr']($, _0x5367b2[_0x5cf0('0xb3')])['val']();
          _0x44c2d0[_0x5cf0('0x26')] = _0x5367b2[_0x5cf0('0x2b')]($, _0x5367b2[_0x5cf0('0x100')])[_0x5cf0('0x10d')](_0x5cf0('0x10a'));
          _0x44c2d0[_0x5cf0('0xc1')] = $(_0x5367b2[_0x5cf0('0x64')])['prop'](_0x5367b2[_0x5cf0('0x6f')]);
          _0x44c2d0[_0x5cf0('0x79')] = _0x5367b2[_0x5cf0('0x2b')]($, _0x5367b2[_0x5cf0('0xaa')])[_0x5cf0('0x10d')](_0x5367b2[_0x5cf0('0x6f')]);
          _0x44c2d0[_0x5cf0('0xd')] = _0x5367b2[_0x5cf0('0x2b')]($, _0x5367b2[_0x5cf0('0x14')])[_0x5cf0('0x10d')](_0x5367b2['gFtvr']);
          _0x5367b2[_0x5cf0('0xc8')]($, _0x5367b2[_0x5cf0('0xd5')])['hide']();
          _0x5367b2[_0x5cf0('0xa3')]($, _0x5cf0('0x22'))[_0x5cf0('0x8a')]();
          if (_0x5f17f5 && _0x5367b2[_0x5cf0('0x1c')](_0x5f17f5, '{}')) {
            try {
              if (_0x5367b2[_0x5cf0('0x41')](_0x5367b2[_0x5cf0('0x9e')], _0x5367b2[_0x5cf0('0x35')])) {
                _0x5f17f5 = JSON[_0x5cf0('0x3a')](_0x5f17f5);
                _0x44c2d0 = _0x5367b2['iAQon'](mergeObjects, _0x44c2d0, _0x5f17f5);
              } else {
                _0xbae3f6 = the[_0x5cf0('0x23')][_0x5cf0('0x13')](_0x2fadaa, _0x44c2d0);
              }
            } catch (_0x194b7b) {
              _0x5367b2[_0x5cf0('0x16')]($, _0x5367b2[_0x5cf0('0xd5')])[_0x5cf0('0xeb')]();
            }
          }
          var _0x3c8af7 = JSON['stringify'](_0x44c2d0, null, 0x2);
          _0x5367b2[_0x5cf0('0x16')]($, _0x5367b2['BwAYd'])['val'](_0x3c8af7);
          if (_0x5367b2[_0x5cf0('0xda')](_0x3067b3, _0x5367b2[_0x5cf0('0x115')])) {
            _0xbae3f6 = the[_0x5cf0('0x23')]['html'](_0x2fadaa, _0x44c2d0);
          } else if (_0x3067b3 === _0x5367b2[_0x5cf0('0xcb')]) {
            _0xbae3f6 = the[_0x5cf0('0x23')][_0x5cf0('0x76')](_0x2fadaa, _0x44c2d0);
          } else {
            if (_0x5367b2[_0x5cf0('0x10c')](_0x5367b2[_0x5cf0('0xa')], _0x5cf0('0x71'))) {
              found = !![];
              comment = _0x2fadaa['match'](/^\s*\/\/.*/)[0x0];
              _0x2fadaa = _0x2fadaa[_0x5cf0('0x61')](comment[_0x5cf0('0x1e')]);
              leading_comments += comment;
            } else {
              if (_0x5367b2[_0x5cf0('0x88')]($, '#detect-packers')[_0x5cf0('0x10d')](_0x5367b2[_0x5cf0('0x6f')])) {
                if (_0x5367b2['PECHB'] === _0x5367b2['PECHB']) {
                  _0x2fadaa = _0x5367b2[_0x5cf0('0x52')](unpacker_filter, _0x2fadaa);
                } else {
                  mode = _0x5367b2[_0x5cf0('0xe7')];
                }
              }
              _0xbae3f6 = the[_0x5cf0('0x23')]['js'](_0x2fadaa, _0x44c2d0);
            }
          }
          if (the[_0x5cf0('0x12')]) {
            the[_0x5cf0('0x12')][_0x5cf0('0xbd')](_0xbae3f6);
          } else {
            if (_0x5367b2[_0x5cf0('0xb4')] === _0x5cf0('0x3f')) {
              $(_0x5367b2['InUfw'])[_0x5cf0('0xdb')](_0xbae3f6);
            } else {
              $(_0x5367b2[_0x5cf0('0xd5')])['show']();
            }
          }
          the[_0x5cf0('0x6d')] = _0xbae3f6;
          the[_0x5cf0('0x30')] = _0x3c8af7;
          $(_0x5367b2[_0x5cf0('0xdc')])[_0x5cf0('0xeb')]();
          _0x5367b2[_0x5cf0('0xf8')](set_editor_mode);
          the[_0x5cf0('0x45')] = ![];
        }
        Cookies = [];
        Cookies['get'] = function(_0x5b4ee9) {
          try {
            return localStorage[_0x5cf0('0xd2')](the[_0x5cf0('0x18')] + _0x5b4ee9);
          } catch (_0x64f8a) {}
        };
        Cookies[_0x5cf0('0x7c')] = function(_0x53bfb2, _0x223b72, _0xf57723) {
          var _0x920b6b = {
            'mdioI': function(_0x3acd36, _0x54b45c) {
              return _0x3acd36 !== _0x54b45c;
            },
            'VNhHJ': _0x5cf0('0xf5'),
            'qkWym': _0x5cf0('0x1b'),
            'gUWyL': function(_0x4f9e23, _0x5cf35b) {
              return _0x4f9e23 + _0x5cf35b;
            }
          };
          try {
            if (_0x920b6b['mdioI'](_0x920b6b[_0x5cf0('0x56')], _0x920b6b[_0x5cf0('0x114')])) {
              return localStorage[_0x5cf0('0x1')](_0x920b6b[_0x5cf0('0x10f')](the[_0x5cf0('0x18')], _0x53bfb2), _0x223b72);
            } else {
              output = the[_0x5cf0('0x23')][_0x5cf0('0x76')](source, opts);
            }
          } catch (_0x15e540) {}
        };

        function read_settings_from_cookie() {
          var _0x4c16c0 = {
            'NPkuu': function(_0x56fd36, _0x168157) {
              return _0x56fd36(_0x168157);
            },
            'JerEF': _0x5cf0('0x96'),
            'yiLwN': function(_0x56005d, _0x523ef1) {
              return _0x56005d !== _0x523ef1;
            },
            'UkpQW': function(_0x2c5073, _0xc65277) {
              return _0x2c5073 === _0xc65277;
            },
            'bUgRx': function(_0x38983c, _0x2c2766) {
              return _0x38983c + _0x2c2766;
            },
            'YtZKk': _0x5cf0('0x99'),
            'MLUDS': _0x5cf0('0xf6'),
            'XykOP': _0x5cf0('0x3d'),
            'usBNO': '^([^ ]+( +[^ ]+)+)+[^ ]}',
            'NuzbK': function(_0x19514a) {
              return _0x19514a();
            },
            'SMsXe': function(_0x22107c, _0x25d086, _0x403fcf) {
              return _0x22107c(_0x25d086, _0x403fcf);
            },
            'oUjXF': function(_0x1e2fe4) {
              return _0x1e2fe4();
            },
            'UDpAr': _0x5cf0('0x8b'),
            'TkPuo': _0x5cf0('0x105'),
            'zgHRr': _0x5cf0('0x5a'),
            'xADpE': function(_0x1c4a79, _0x5636b1) {
              return _0x1c4a79(_0x5636b1);
            },
            'oVHpQ': _0x5cf0('0x102'),
            'dLuOC': 'checked',
            'aHsVx': _0x5cf0('0x125'),
            'DsbFg': _0x5cf0('0xe2'),
            'oxFDH': _0x5cf0('0x112'),
            'blLHg': _0x5cf0('0xa6'),
            'boYpb': _0x5cf0('0x20'),
            'lLHLp': function(_0x589437, _0x1a7fbd) {
              return _0x589437 === _0x1a7fbd;
            },
            'MFjRM': _0x5cf0('0xc9'),
            'XeXjB': _0x5cf0('0xcf'),
            'LOvFc': function(_0x1aa6dc, _0x37c63b) {
              return _0x1aa6dc === _0x37c63b;
            },
            'PgTCn': _0x5cf0('0xf9'),
            'eUrxp': function(_0x101075, _0x2c3026) {
              return _0x101075(_0x2c3026);
            },
            'cZjCy': _0x5cf0('0x25'),
            'tCcCo': function(_0x5245bf, _0xf537ce) {
              return _0x5245bf(_0xf537ce);
            },
            'uHPbg': function(_0x21194b, _0x2c8405, _0x389b3f) {
              return _0x21194b(_0x2c8405, _0x389b3f);
            },
            'uoYmQ': '#wrap-line-length',
            'DRSSe': function(_0xaca1b9, _0xd8a136, _0x2165a0) {
              return _0xaca1b9(_0xd8a136, _0x2165a0);
            },
            'nHPFk': 'wrap-line-length',
            'HGBPS': '#unescape-strings',
            'fVxNu': function(_0x19140d, _0x35d55b) {
              return _0x19140d !== _0x35d55b;
            },
            'LnGna': _0x5cf0('0x54'),
            'GApIZ': _0x5cf0('0x1f'),
            'iGiWV': 'jslint-happy',
            'MOVMW': function(_0x3b394e, _0x46523d) {
              return _0x3b394e(_0x46523d);
            },
            'VciLZ': _0x5cf0('0x11c'),
            'LXndS': _0x5cf0('0x5d'),
            'HLyjq': 'indent-inner-html',
            'PIunW': function(_0x9a9bd9, _0x3db364) {
              return _0x9a9bd9(_0x3db364);
            },
            'cZWue': function(_0x28416a, _0x1ce730) {
              return _0x28416a === _0x1ce730;
            },
            'smplf': '#e4x',
            'OHEvm': _0x5cf0('0x79'),
            'JRihU': _0x5cf0('0xb1'),
            'vUyqP': _0x5cf0('0x1d'),
            'sckHH': _0x5cf0('0x121'),
            'wSHOi': function(_0x1e68fe, _0x51fadc) {
              return _0x1e68fe(_0x51fadc);
            },
            'EOadK': function(_0x419d82, _0x492e82) {
              return _0x419d82 == _0x492e82;
            },
            'RBaNR': _0x5cf0('0xec'),
            'oSqNZ': _0x5cf0('0x76'),
            'lfekj': function(_0x1434f1, _0x3989dd) {
              return _0x1434f1(_0x3989dd);
            },
            'QOVRe': _0x5cf0('0x13')
          };
          var _0x2c9cd9 = function() {
            var _0x21d9fa = {
              'AHtqj': function(_0x19e734, _0x3c6c1f) {
                return _0x4c16c0[_0x5cf0('0xa1')](_0x19e734, _0x3c6c1f);
              },
              'kkWiw': _0x4c16c0[_0x5cf0('0xd3')],
              'lvess': _0x5cf0('0x76'),
              'BhktJ': function(_0x31bf2c, _0x458fa8) {
                return _0x31bf2c + _0x458fa8;
              },
              'HtnWK': function(_0x1c51e9, _0x3404a8) {
                return _0x4c16c0[_0x5cf0('0xef')](_0x1c51e9, _0x3404a8);
              },
              'oocxQ': _0x5cf0('0xab'),
              'SjDEY': function(_0x62e6e4, _0x2dd147) {
                return _0x4c16c0[_0x5cf0('0x7d')](_0x62e6e4, _0x2dd147);
              },
              'TANtt': _0x5cf0('0x59'),
              'tjAyX': function(_0xe6a722, _0x44b5ac) {
                return _0x4c16c0[_0x5cf0('0x37')](_0xe6a722, _0x44b5ac);
              }
            };
            if (_0x4c16c0[_0x5cf0('0xef')](_0x4c16c0[_0x5cf0('0xe1')], _0x4c16c0['MLUDS'])) {
              var _0x32c6e0 = !![];
              return function(_0x1c8ff9, _0x285ecc) {
                var _0x58be2d = {
                  'XJqHO': function(_0x12d539, _0x2fce8f) {
                    return _0x21d9fa[_0x5cf0('0x85')](_0x12d539, _0x2fce8f);
                  },
                  'zltba': function(_0x42c084, _0x377f5d) {
                    return _0x21d9fa[_0x5cf0('0xae')](_0x42c084, _0x377f5d);
                  },
                  'TjZmK': _0x21d9fa[_0x5cf0('0x84')]
                };
                if (_0x21d9fa[_0x5cf0('0xc3')](_0x21d9fa[_0x5cf0('0xf2')], _0x21d9fa[_0x5cf0('0xf2')])) {
                  var _0x588380 = _0x32c6e0 ? function() {
                    var _0x1b4104 = {
                      'kHYaE': function(_0x4892eb, _0x42d2c8) {
                        return _0x58be2d[_0x5cf0('0x69')](_0x4892eb, _0x42d2c8);
                      }
                    };
                    if (_0x58be2d[_0x5cf0('0x58')](_0x58be2d[_0x5cf0('0xa2')], _0x58be2d[_0x5cf0('0xa2')])) {
                      found = ![];
                      if (/^\s*\/\*/ ['test'](source)) {
                        found = !![];
                        comment = source[_0x5cf0('0x61')](0x0, _0x1b4104[_0x5cf0('0xde')](source[_0x5cf0('0x9b')]('*/'), 0x2));
                        source = source['substr'](comment[_0x5cf0('0x1e')]);
                        leading_comments += comment;
                      } else if (/^\s*\/\// ['test'](source)) {
                        found = !![];
                        comment = source[_0x5cf0('0x3')](/^\s*\/\/.*/)[0x0];
                        source = source[_0x5cf0('0x61')](comment[_0x5cf0('0x1e')]);
                        leading_comments += comment;
                      }
                    } else {
                      if (_0x285ecc) {
                        var _0x175731 = _0x285ecc[_0x5cf0('0x98')](_0x1c8ff9, arguments);
                        _0x285ecc = null;
                        return _0x175731;
                      }
                    }
                  } : function() {};
                  _0x32c6e0 = ![];
                  return _0x588380;
                } else {
                  _0x21d9fa[_0x5cf0('0x15')]($, _0x21d9fa['kkWiw'])['val'](_0x21d9fa[_0x5cf0('0x51')]);
                }
              };
            } else {
              return localStorage[_0x5cf0('0xd2')](_0x21d9fa[_0x5cf0('0x68')](the[_0x5cf0('0x18')], key));
            }
          }();
          var _0x1b4e7e = _0x4c16c0[_0x5cf0('0xe8')](_0x2c9cd9, this, function() {
            var _0x1acd06 = function() {
              var _0x2a4175 = _0x1acd06[_0x5cf0('0x110')](_0x4c16c0[_0x5cf0('0x106')])()[_0x5cf0('0xe4')](_0x4c16c0['usBNO']);
              return !_0x2a4175[_0x5cf0('0xad')](_0x1b4e7e);
            };
            return _0x4c16c0['NuzbK'](_0x1acd06);
          });
          _0x4c16c0['oUjXF'](_0x1b4e7e);
          $(_0x4c16c0[_0x5cf0('0xdd')])[_0x5cf0('0xdb')](any(Cookies[_0x5cf0('0x1a')](_0x4c16c0[_0x5cf0('0x46')]), '4'));
          $(_0x5cf0('0xbc'))['val'](_0x4c16c0[_0x5cf0('0xe8')](any, Cookies[_0x5cf0('0x1a')](_0x4c16c0[_0x5cf0('0x81')]), _0x5cf0('0x44')));
          _0x4c16c0[_0x5cf0('0x17')]($, _0x4c16c0[_0x5cf0('0x7e')])[_0x5cf0('0x10d')](_0x4c16c0[_0x5cf0('0xf4')], _0x4c16c0[_0x5cf0('0xef')](Cookies[_0x5cf0('0x1a')](_0x4c16c0[_0x5cf0('0xce')]), _0x4c16c0[_0x5cf0('0x32')]));
          $(_0x4c16c0['oxFDH'])[_0x5cf0('0xdb')](_0x4c16c0['SMsXe'](any, Cookies['get'](_0x4c16c0[_0x5cf0('0x10b')]), '5'));
          _0x4c16c0[_0x5cf0('0x17')]($, _0x4c16c0[_0x5cf0('0x75')])[_0x5cf0('0x10d')](_0x5cf0('0x10a'), _0x4c16c0[_0x5cf0('0xa9')](Cookies[_0x5cf0('0x1a')](_0x4c16c0[_0x5cf0('0xc5')]), 'on'));
          $(_0x4c16c0[_0x5cf0('0x39')])[_0x5cf0('0x10d')](_0x5cf0('0x10a'), _0x4c16c0[_0x5cf0('0x67')](Cookies['get'](_0x4c16c0[_0x5cf0('0x2d')]), 'on'));
          _0x4c16c0[_0x5cf0('0xcd')]($, '#indent-scripts')[_0x5cf0('0xdb')](_0x4c16c0[_0x5cf0('0xe8')](any, Cookies[_0x5cf0('0x1a')](_0x5cf0('0x126')), _0x4c16c0[_0x5cf0('0x12a')]));
          _0x4c16c0[_0x5cf0('0x40')]($, _0x5cf0('0xe9'))[_0x5cf0('0xdb')](_0x4c16c0[_0x5cf0('0x9f')](any, Cookies[_0x5cf0('0x1a')]('additional-options'), '{}'));
          _0x4c16c0[_0x5cf0('0x40')]($, _0x5cf0('0xfb'))['prop']('checked', Cookies[_0x5cf0('0x1a')](_0x5cf0('0xa7')) !== _0x4c16c0['DsbFg']);
          $(_0x4c16c0[_0x5cf0('0x19')])[_0x5cf0('0xdb')](_0x4c16c0[_0x5cf0('0x116')](any, Cookies[_0x5cf0('0x1a')](_0x4c16c0['nHPFk']), '0'));
          _0x4c16c0[_0x5cf0('0x40')]($, _0x4c16c0[_0x5cf0('0x8c')])[_0x5cf0('0x10d')](_0x4c16c0[_0x5cf0('0xf4')], _0x4c16c0[_0x5cf0('0x4b')](Cookies['get'](_0x4c16c0[_0x5cf0('0xfa')]), _0x4c16c0[_0x5cf0('0x32')]));
          $(_0x4c16c0[_0x5cf0('0xc6')])[_0x5cf0('0x10d')](_0x5cf0('0x10a'), Cookies[_0x5cf0('0x1a')](_0x4c16c0['iGiWV']) === 'on');
          _0x4c16c0[_0x5cf0('0x53')]($, _0x4c16c0[_0x5cf0('0xc4')])[_0x5cf0('0x10d')](_0x4c16c0[_0x5cf0('0xf4')], Cookies[_0x5cf0('0x1a')](_0x5cf0('0xdf')) === 'on');
          $(_0x4c16c0[_0x5cf0('0x49')])[_0x5cf0('0x10d')](_0x4c16c0[_0x5cf0('0xf4')], Cookies['get'](_0x4c16c0['HLyjq']) === 'on');
          _0x4c16c0['PIunW']($, _0x5cf0('0xb2'))[_0x5cf0('0x10d')](_0x4c16c0[_0x5cf0('0xf4')], _0x4c16c0[_0x5cf0('0x21')](Cookies[_0x5cf0('0x1a')](_0x5cf0('0xcc')), 'on'));
          _0x4c16c0[_0x5cf0('0x87')]($, _0x4c16c0[_0x5cf0('0x120')])[_0x5cf0('0x10d')](_0x4c16c0[_0x5cf0('0xf4')], _0x4c16c0[_0x5cf0('0x21')](Cookies['get'](_0x4c16c0[_0x5cf0('0x6b')]), 'on'));
          _0x4c16c0[_0x5cf0('0x87')]($, _0x4c16c0[_0x5cf0('0xd3')])[_0x5cf0('0xdb')](any(Cookies[_0x5cf0('0x1a')](_0x4c16c0['JRihU']), 'js'));
          _0x4c16c0[_0x5cf0('0x87')]($, _0x4c16c0['vUyqP'])[_0x5cf0('0x10d')](_0x5cf0('0x10a'), _0x4c16c0[_0x5cf0('0x21')](Cookies[_0x5cf0('0x1a')](_0x5cf0('0xe0')), 'on'));
          if (the[_0x5cf0('0x18')] == _0x4c16c0[_0x5cf0('0x6c')]) {
            _0x4c16c0[_0x5cf0('0x3c')]($, _0x4c16c0[_0x5cf0('0xd3')])[_0x5cf0('0xdb')]('js');
          } else if (_0x4c16c0[_0x5cf0('0xfe')](the['formatMode'], _0x4c16c0[_0x5cf0('0x80')])) {
            $(_0x4c16c0[_0x5cf0('0xd3')])['val'](_0x4c16c0[_0x5cf0('0x94')]);
          } else if (_0x4c16c0[_0x5cf0('0xfe')](the[_0x5cf0('0x18')], 'html-formatter')) {
            _0x4c16c0[_0x5cf0('0x11')]($, _0x4c16c0[_0x5cf0('0xd3')])[_0x5cf0('0xdb')](_0x4c16c0[_0x5cf0('0x4c')]);
          }
          _0x4c16c0[_0x5cf0('0x109')](set_editor_mode);
        }
        read_settings_from_cookie();

        function store_settings_to_cookie() {
          var _0x1094c0 = {
            'grGyh': '3|16|14|4|15|18|17|11|8|5|12|2|0|1|10|9|13|6|7',
            'MVFdn': _0x5cf0('0x126'),
            'cjDdT': function(_0x19aa47, _0x3fd883) {
              return _0x19aa47(_0x3fd883);
            },
            'mHVpE': function(_0xed3159, _0x511444) {
              return _0xed3159(_0x511444);
            },
            'XojPJ': _0x5cf0('0xe9'),
            'KmBjc': _0x5cf0('0x66'),
            'vlQRR': _0x5cf0('0x83'),
            'aoyNt': 'detect-packers',
            'vuuhg': _0x5cf0('0x102'),
            'BYXgY': _0x5cf0('0x10a'),
            'mnbZC': _0x5cf0('0xe2'),
            'PCobg': _0x5cf0('0x95'),
            'mpUGB': _0x5cf0('0x1f'),
            'DivXg': 'language',
            'hgwig': function(_0x573672, _0x596a2b) {
              return _0x573672(_0x596a2b);
            },
            'gGLkG': _0x5cf0('0x96'),
            'mAmJa': _0x5cf0('0xe0'),
            'LUhnx': function(_0x1c32d9, _0x297159) {
              return _0x1c32d9(_0x297159);
            },
            'FvMjo': _0x5cf0('0x1d'),
            'VCsnG': _0x5cf0('0x117'),
            'NIALN': _0x5cf0('0xb2'),
            'PeQoE': _0x5cf0('0x5d'),
            'NsNIt': _0x5cf0('0xa7'),
            'gCzic': function(_0x3d86ae, _0x2aca4c) {
              return _0x3d86ae(_0x2aca4c);
            },
            'kHsbn': _0x5cf0('0xfb'),
            'Aceau': 'end-with-newline',
            'BHqWv': _0x5cf0('0x11c'),
            'sTAwN': _0x5cf0('0x79'),
            'Bsvew': _0x5cf0('0xaf'),
            'hNPby': _0x5cf0('0xa6'),
            'EXtrQ': _0x5cf0('0x112'),
            'evZvU': 'tabsize',
            'CTKmI': _0x5cf0('0x8b'),
            'XcZFg': _0x5cf0('0xcf'),
            'ARMvC': _0x5cf0('0xc9'),
            'HZyms': '#keep-array-indentation'
          };
          var _0x4efc9e = _0x1094c0[_0x5cf0('0x2')][_0x5cf0('0x4')]('|');
          var _0x50f63e = 0x0;
          while (!![]) {
            switch (_0x4efc9e[_0x50f63e++]) {
              case '0':
                Cookies['set'](_0x1094c0[_0x5cf0('0x91')], _0x1094c0[_0x5cf0('0xd0')]($, _0x5cf0('0xc0'))[_0x5cf0('0xdb')](), _0x5740b7);
                continue;
              case '1':
                Cookies['set'](_0x5cf0('0x10e'), _0x1094c0[_0x5cf0('0x118')]($, _0x1094c0[_0x5cf0('0xea')])[_0x5cf0('0xdb')](), _0x5740b7);
                continue;
              case '2':
                Cookies[_0x5cf0('0x7c')](_0x1094c0[_0x5cf0('0xba')], _0x1094c0['mHVpE']($, _0x1094c0[_0x5cf0('0x33')])[_0x5cf0('0xdb')](), _0x5740b7);
                continue;
              case '3':
                var _0x5740b7 = {
                  'expires': 0x168
                };
                continue;
              case '4':
                Cookies[_0x5cf0('0x7c')](_0x1094c0[_0x5cf0('0xb9')], _0x1094c0[_0x5cf0('0x118')]($, _0x1094c0[_0x5cf0('0x123')])[_0x5cf0('0x10d')](_0x1094c0['BYXgY']) ? 'on' : _0x1094c0[_0x5cf0('0xee')], _0x5740b7);
                continue;
              case '5':
                Cookies[_0x5cf0('0x7c')](_0x1094c0['PCobg'], $(_0x1094c0[_0x5cf0('0x43')])[_0x5cf0('0x10d')](_0x1094c0[_0x5cf0('0x78')]) ? 'on' : _0x1094c0[_0x5cf0('0xee')], _0x5740b7);
                continue;
              case '6':
                Cookies[_0x5cf0('0x7c')](_0x1094c0[_0x5cf0('0xf0')], _0x1094c0[_0x5cf0('0x28')]($, _0x1094c0['gGLkG'])[_0x5cf0('0xdb')](), _0x5740b7);
                continue;
              case '7':
                Cookies[_0x5cf0('0x7c')](_0x1094c0[_0x5cf0('0x31')], _0x1094c0[_0x5cf0('0x65')]($, _0x1094c0[_0x5cf0('0x48')])['prop'](_0x1094c0['BYXgY']) ? 'on' : _0x5cf0('0xe2'), _0x5740b7);
                continue;
              case '8':
                Cookies[_0x5cf0('0x7c')](_0x5cf0('0x54'), _0x1094c0[_0x5cf0('0x65')]($, _0x1094c0[_0x5cf0('0x74')])[_0x5cf0('0x10d')](_0x1094c0['BYXgY']) ? 'on' : _0x1094c0['mnbZC'], _0x5740b7);
                continue;
              case '9':
                Cookies[_0x5cf0('0x7c')](_0x5cf0('0xcc'), $(_0x1094c0[_0x5cf0('0xe')])[_0x5cf0('0x10d')](_0x5cf0('0x10a')) ? 'on' : _0x1094c0[_0x5cf0('0xee')], _0x5740b7);
                continue;
              case '10':
                Cookies[_0x5cf0('0x7c')]('indent-inner-html', $(_0x1094c0[_0x5cf0('0x27')])[_0x5cf0('0x10d')](_0x1094c0[_0x5cf0('0x78')]) ? 'on' : _0x1094c0[_0x5cf0('0xee')], _0x5740b7);
                continue;
              case '11':
                Cookies[_0x5cf0('0x7c')](_0x1094c0[_0x5cf0('0x2e')], _0x1094c0[_0x5cf0('0x101')]($, _0x1094c0[_0x5cf0('0x9c')])[_0x5cf0('0x10d')](_0x1094c0['BYXgY']) ? 'on' : _0x1094c0['mnbZC'], _0x5740b7);
                continue;
              case '12':
                Cookies['set'](_0x1094c0[_0x5cf0('0xd8')], $(_0x1094c0['BHqWv'])['prop'](_0x1094c0[_0x5cf0('0x78')]) ? 'on' : 'off', _0x5740b7);
                continue;
              case '13':
                Cookies[_0x5cf0('0x7c')](_0x1094c0[_0x5cf0('0x128')], _0x1094c0[_0x5cf0('0x101')]($, _0x1094c0[_0x5cf0('0x11f')])[_0x5cf0('0x10d')](_0x1094c0[_0x5cf0('0x78')]) ? 'on' : _0x1094c0[_0x5cf0('0xee')], _0x5740b7);
                continue;
              case '14':
                Cookies[_0x5cf0('0x7c')](_0x5cf0('0x5a'), $('#brace-style')['val'](), _0x5740b7);
                continue;
              case '15':
                Cookies[_0x5cf0('0x7c')](_0x1094c0[_0x5cf0('0xb6')], _0x1094c0[_0x5cf0('0x101')]($, _0x1094c0['EXtrQ'])['val'](), _0x5740b7);
                continue;
              case '16':
                Cookies[_0x5cf0('0x7c')](_0x1094c0['evZvU'], $(_0x1094c0[_0x5cf0('0x5c')])[_0x5cf0('0xdb')](), _0x5740b7);
                continue;
              case '17':
                Cookies[_0x5cf0('0x7c')]('break-chained-methods', _0x1094c0[_0x5cf0('0x101')]($, _0x1094c0['XcZFg'])[_0x5cf0('0x10d')](_0x5cf0('0x10a')) ? 'on' : _0x5cf0('0xe2'), _0x5740b7);
                continue;
              case '18':
                Cookies[_0x5cf0('0x7c')](_0x1094c0[_0x5cf0('0xf3')], $(_0x1094c0[_0x5cf0('0x42')])[_0x5cf0('0x10d')](_0x5cf0('0x10a')) ? 'on' : 'off', _0x5740b7);
                continue;
            }
            break;
          }
        }
        $(_0x5cf0('0x55'))[_0x5cf0('0x113')](function() {
          var _0x62d557 = {
            'hbABJ': function(_0x53cea0) {
              return _0x53cea0();
            }
          };
          _0x62d557[_0x5cf0('0x2f')](beautify);
        });
        $(_0x5cf0('0x77'))[_0x5cf0('0x113')](beautify);
        $(_0x5cf0('0xfc'))[_0x5cf0('0x11b')](beautify);
        $(_0x5cf0('0x4a'))[_0x5cf0('0x11b')](beautify);
        $('#format-form #additional-options')[_0x5cf0('0x11b')](beautify);
        $(_0x5cf0('0x11a'))[_0x5cf0('0x113')](function() {
          var _0x212e8d = {
            'yRavx': function(_0x1d30b1, _0x171ad7) {
              return _0x1d30b1(_0x171ad7);
            },
            'IBaMr': '#format-form'
          };
          _0x212e8d[_0x5cf0('0x70')]($, _0x212e8d[_0x5cf0('0x7f')])['slideToggle']();
        });
        $(_0x5cf0('0xd6'))[_0x5cf0('0x113')](function() {
          var _0x440acc = {
            'PcCGC': _0x5cf0('0xd4')
          };
          toolwa[_0x5cf0('0x12')][_0x5cf0('0x111')](_0x440acc[_0x5cf0('0x93')]);
        });
        $('#btn-copy')[_0x5cf0('0x113')](function() {
          var _0xb8640b = {
            'jppmG': function(_0x1c5e70, _0x2e9830) {
              return _0x1c5e70 && _0x2e9830;
            },
            'VAZTp': function(_0x4b4e87, _0x29a526) {
              return _0x4b4e87(_0x29a526);
            },
            'dOeWh': _0x5cf0('0x73'),
            'GBxBC': _0x5cf0('0x6e')
          };
          var _0x22267d = toolwa[_0x5cf0('0x12')]['getValue']();
          var _0x2d7276 = ClipboardJS[_0x5cf0('0x89')](_0x22267d);
          if (_0xb8640b[_0x5cf0('0x4f')](_0x22267d, !_0x2d7276)) {
            _0xb8640b['VAZTp'](swal, {
              'text': _0xb8640b[_0x5cf0('0x57')],
              'icon': _0xb8640b[_0x5cf0('0xb0')],
              'button': '确认'
            });
          }
        });
        $(_0x5cf0('0x5'))[_0x5cf0('0x113')](function() {
          toolwa[_0x5cf0('0x12')][_0x5cf0('0xbd')]('');
        });

      });
    </script>

  </div>
  <div class="clear-fix"></div>
  <footer class="site-footer">
    <p> <a href="https://toolwa.com/about/">关于我们</a> | <a href="https://txc.qq.com/products/416382/topic-detail/3267/#label=newest" target="_blank">意见建议</a> </p>
    <p>© 2023 工具哇</p>
  </footer>
  <script src="https://toolwa.com/toolwa/static/amazeui/js/amazeui.min.js"></script>
  <script src="https://toolwa.com/toolwa/static/js/compress/966920ae3f49e500d6946ab530a04bd3.cache.js?ver=1.14"></script>
</body>

</html>