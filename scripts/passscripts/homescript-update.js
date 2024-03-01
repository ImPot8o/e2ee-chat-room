/*games*/ {
function adr() {
    openGame('https://adr.pot8o.dev');
  }
  
function cc() {
    openGame('https://oldcc.pot8o.dev');
  }
  
function ch() {
    openGame('https://ch.pot8o.dev');
  }
  
function s() {
    openGame('https://s.pot8o.dev');
  }
  
function g() {
    openGame('https://g.pot8o.dev');
  }
  
function m() {
    openGame('https://m.pot8o.dev');
  }
  
function gf() {
    openGame('https://gfiles.pot8o.dev');
  }
  
function c3d() {
    openGame('https://3dc.pot8o.dev');
  }
  
function ctr() {
    openGame('https://ctr.pot8o.dev');
  }
  
function tr2() {
    openGame('https://tr2.pot8o.dev');
  }
  
function omc() {
    openGame('https://omc.pot8o.dev');
  }
  
function native() {
    openGame('https://native.pot8o.dev');
  }
  
function outred() {
    openGame('https://outred.pot8o.dev');
  }
}
/*emulators*/ {
function emu() {
    openGame('https://emu.pot8o.dev');
  }
    
function oot() {
    openGame('https://oot.pot8o.dev');
  }
    
function met() {
    openGame('https://met.pot8o.dev');
  }
    
function d64() {
    openGame('https://d64.pot8o.dev');
  }
    
function sm64() {
    openGame('https://sm64.pot8o.dev');
  }
    
function re2() {
    openGame('https://re2.pot8o.dev');
  }
}
/*proxies*/{
function ab() {
      openGame('https://ab.pot8o.dev');
    }
      
// function t() {
//       openGame('https://t.pot8o.dev');
//     }
      
// function gm() {
//       openGame('https://gm.pot8o.dev');
//     }
      
function hx() {
      openGame('https://hx.pot8o.dev');
    }
      
function inter() {
      openGame('https://inter.pot8o.dev');
    }
}
  // Define more functions for other games, following the same pattern
  
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

/*tools*/{
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
    function toggleBookmarkletBox() {
        var box = document.getElementById('bookmarkletBox');
        if (box.style.display === 'none') {
            box.style.display = 'block';
        } else {
            box.style.display = 'none';
        }
    }
    function injectBookmarklet() {
        var bookmarkletCode = document.getElementById('bookmarkletCode').value;
        var script = document.createElement('script');
        script.innerHTML = bookmarkletCode;
        document.body.appendChild(script);
    }
    function jsinjector() {
        openGame('https://jsinjector.pot8o.dev');
      } 
}
  