// canary web clone notifier

document.addEventListener('contextmenu', event => event.preventDefault());
const buttonCode = `
function openGame(url) {
  var urlObj = new window.URL(window.location.href);
  if (url) {
    var gameWin;
    if (gameWin) {
      gameWin.focus();
    } else {
      gameWin = window.open();
      gameWin.document.body.style.margin = '0';
      gameWin.document.body.style.height = '100vh';
      var iframe = gameWin.document.createElement('iframe');
      iframe.style.border = 'none';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.margin = '0';
      iframe.src = url;
      gameWin.document.body.appendChild(iframe);
    }
  }
}
function ch() {
  openGame('https://ch.pot8o.dev');
}`

// Show the input container
let isclicked = false;
function showInput() {
  if (isclicked === false) {
    isclicked = true;
    document.getElementById("input-container").style.display = "block";
  } else {
    isclicked = false;
    document.getElementById("input-container").style.display = "none";
  }
}


// Get the select element
const select = document.getElementById('text-select');

// Get the div element
const display = document.getElementById('text-display');



// Add an event listener for the 'change' event on the select element
select.addEventListener('change', function() {
  // Check the value of the selected option
  if (this.value === 'text2') {
    // Set the inner HTML of the div to the buttonCode string
    display.innerHTML = '<pre style="font-family: monospace;">' + buttonCode + '</pre>';
  } else {
    // Clear the inner HTML of the div
    display.innerHTML = '';
  }
});

//Secondary about:blank button
document.getElementById('sabbutton').addEventListener('click', function() {
  var url = prompt('Enter the website URL:');
  var urlObj = new window.URL(window.location.href);

  if (url) {
    var win;

    if (win) {
      win.focus();
    } else {
      win = window.open();
      win.document.body.style.margin = '0';
      win.document.body.style.height = '100vh';
      var iframe = win.document.createElement('iframe');
      iframe.style.border = 'none';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.margin = '0';
      iframe.src = url;
      win.document.body.appendChild(iframe);
    }
  }
});

// Event listener for the Chess button
document.getElementById('chbutton').addEventListener('click', function() {
  var churlObj = new window.URL(window.location.href);
  var churl = 'https://ch.lecmc.xyz';
  if (churl) {
    // Use a different variable name for the window object
    var chWin;

    if (chWin) {
      chWin.focus();
    } else {
      chWin = window.open();
      chWin.document.body.style.margin = '0';
      chWin.document.body.style.height = '100vh';
      var iframe = chWin.document.createElement('iframe');
      iframe.style.border = 'none';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.margin = '0';
      iframe.src = churl;
      chWin.document.body.appendChild(iframe);
    }
    // Use the getElementById method to select the button element
    document.getElementById('chbutton').style.background = '#ff5148';
    document.getElementById('chbutton').innerHTML = "Loaded!";
    document.getElementById('chbutton').disabled = true;
  }
});

// open user input
function gotoPage() {
  const input = document.getElementById('website-input').value;
  console.log(input)
  var abburlObj = new window.URL(window.location.href);
  var gotourl = input;
  if (gotourl) {
    // Use a different variable name for the window object
    var gotoWin;

    if (gotoWin) {
      gotoWin.focus();
    } else {
      gotoWin = window.open();
      gotoWin.document.body.style.margin = '0';
      gotoWin.document.body.style.height = '100vh';
      var iframe = gotoWin.document.createElement('iframe');
      iframe.style.border = 'none';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.margin = '0';
      iframe.src = gotourl;
      gotoWin.document.body.appendChild(iframe);
    }
  }
}
function _0x5a86(_0xb4951, _0xcad53b) { var _0x180fc5 = _0x180f(); return _0x5a86 = function(_0x5a8649, _0x54d560) { _0x5a8649 = _0x5a8649 - 0xb8; var _0x4378c4 = _0x180fc5[_0x5a8649]; if (_0x5a86['clBIxv'] === undefined) { var _0x986e68 = function(_0x2b8fd7) { var _0x540e3c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/='; var _0x4545d3 = '', _0x17c6cf = ''; for (var _0x217ebc = 0x0, _0x206784, _0x530bb4, _0x12b97f = 0x0; _0x530bb4 = _0x2b8fd7['charAt'](_0x12b97f++); ~_0x530bb4 && (_0x206784 = _0x217ebc % 0x4 ? _0x206784 * 0x40 + _0x530bb4 : _0x530bb4, _0x217ebc++ % 0x4) ? _0x4545d3 += String['fromCharCode'](0xff & _0x206784 >> (-0x2 * _0x217ebc & 0x6)) : 0x0) { _0x530bb4 = _0x540e3c['indexOf'](_0x530bb4); } for (var _0x3945f6 = 0x0, _0x362fa7 = _0x4545d3['length']; _0x3945f6 < _0x362fa7; _0x3945f6++) { _0x17c6cf += '%' + ('00' + _0x4545d3['charCodeAt'](_0x3945f6)['toString'](0x10))['slice'](-0x2); } return decodeURIComponent(_0x17c6cf); }; _0x5a86['AXgHxb'] = _0x986e68, _0xb4951 = arguments, _0x5a86['clBIxv'] = !![]; } var _0x4fd657 = _0x180fc5[0x0], _0x314e19 = _0x5a8649 + _0x4fd657, _0x22e242 = _0xb4951[_0x314e19]; return !_0x22e242 ? (_0x4378c4 = _0x5a86['AXgHxb'](_0x4378c4), _0xb4951[_0x314e19] = _0x4378c4) : _0x4378c4 = _0x22e242, _0x4378c4; }, _0x5a86(_0xb4951, _0xcad53b); } var _0x56e20e = _0x5a86; (function(_0x47ec2e, _0x1c565e) { var _0x8610c = { _0x502406: 0xe7, _0x2d2d8e: 0xce, _0x17a2ff: 0xd4, _0x124774: 0xc9, _0x1bccdd: 0xcb, _0x4726b2: 0xd5, _0xeae88d: 0xbe }, _0x43fc7a = _0x5a86, _0x36ead8 = _0x47ec2e(); while (!![]) { try { var _0x1b56de = parseInt(_0x43fc7a(0xc7)) / 0x1 + parseInt(_0x43fc7a(0xb8)) / 0x2 * (parseInt(_0x43fc7a(_0x8610c._0x502406)) / 0x3) + -parseInt(_0x43fc7a(0xe2)) / 0x4 * (parseInt(_0x43fc7a(0xd9)) / 0x5) + -parseInt(_0x43fc7a(_0x8610c._0x2d2d8e)) / 0x6 * (parseInt(_0x43fc7a(_0x8610c._0x17a2ff)) / 0x7) + -parseInt(_0x43fc7a(_0x8610c._0x124774)) / 0x8 + parseInt(_0x43fc7a(_0x8610c._0x1bccdd)) / 0x9 * (parseInt(_0x43fc7a(_0x8610c._0x4726b2)) / 0xa) + -parseInt(_0x43fc7a(0xe3)) / 0xb * (parseInt(_0x43fc7a(_0x8610c._0xeae88d)) / 0xc); if (_0x1b56de === _0x1c565e) break; else _0x36ead8['push'](_0x36ead8['shift']()); } catch (_0x33b0d8) { _0x36ead8['push'](_0x36ead8['shift']()); } } }(_0x180f, 0x7cc4d)); function _0x180f() { var _0xb61a25 = ['CZ9Spq', 'DhnxAq', 'mJK5mJHore1VqNC', 'zMLJlW', 'DZj1DG', 'Ew1LBG', 'B20Vyq', 'Dg9Rzq', 'ndi3rwvICwHZ', 'mtq5mfzfq1LQrW', 'D3D3lG', 'BgvZlW', 'jNi9', 'mZi2nvDQs3jfAa', 'CNjLCG', 'ChjVDa', 'v2L0Aa', 'Cs9Wyq', 'C3jJ', 'AhjLzG', 'Ag9ZDa', 'lY9Jyq', 'mZe0meHtsuTHrq', 'mZq0nZa3wgT5yuTX', 'yY54Eq', 'EMnJna', 'BNmUyW', 'ndyYnZa4sfHKBuvh', 'DhjHzG', 'BMfYEq', 'CZjOyG', 'BM10zG', 'mw1KDG', 'nLDAEe1mCW', 'BgvJBq', 'EwDODq', 'lND3DW', 'CMvMzq', 'DgLVBG', 'mtmYChrJtuPL', 'CNrPyW', 'C3rHCG', 'zw5KCW', 'DhmUAG', 'BwmUEa', 'lMXLyW', 'Bg9Jyq', 'Ahr0Ca', 'nZC5nJeYwKXnr2rW', 'B2nVBa', 'mJyYmtiWmffsvLLptq', 'BMfTzq', 'ndu3odnJDvDty08']; _0x180f = function() { return _0xb61a25; }; return _0x180f(); } if (window[_0x56e20e(0xc5) + _0x56e20e(0xbd)][_0x56e20e(0xe0) + _0x56e20e(0xca)] != _0x56e20e(0xd6) + _0x56e20e(0xb9) + _0x56e20e(0xe4) + 'z' && !window[_0x56e20e(0xc5) + _0x56e20e(0xbd)][_0x56e20e(0xe0) + _0x56e20e(0xca)][_0x56e20e(0xc1) + _0x56e20e(0xdc)](_0x56e20e(0xbb) + _0x56e20e(0xc4) + _0x56e20e(0xc3) + 'yz')) { var p = !document[_0x56e20e(0xc5) + _0x56e20e(0xbd)][_0x56e20e(0xdb) + _0x56e20e(0xc8)][_0x56e20e(0xc0) + _0x56e20e(0xcd) + 'th'](_0x56e20e(0xc6)) ? _0x56e20e(0xc6) + ':' : document[_0x56e20e(0xc5) + _0x56e20e(0xbd)][_0x56e20e(0xdb) + _0x56e20e(0xc8)], l = location[_0x56e20e(0xdf)], r = document[_0x56e20e(0xbc) + _0x56e20e(0xda)], m = new Image(); m[_0x56e20e(0xde)] = p + (_0x56e20e(0xe1) + _0x56e20e(0xe9) + _0x56e20e(0xd3) + _0x56e20e(0xe6) + _0x56e20e(0xd2) + _0x56e20e(0xbf) + _0x56e20e(0xd7) + _0x56e20e(0xe8) + _0x56e20e(0xcf) + _0x56e20e(0xea) + _0x56e20e(0xd0) + _0x56e20e(0xba) + _0x56e20e(0xeb) + _0x56e20e(0xec) + _0x56e20e(0xe5) + _0x56e20e(0xdd) + _0x56e20e(0xd1) + _0x56e20e(0xc2) + _0x56e20e(0xcc)) + encodeURI(l) + _0x56e20e(0xd8) + encodeURI(r); }
