var MPD = require('../lib');

var mpd = new MPD();

function dur(sec) {
  var h = Math.floor(sec / (60*60));
  var m = Math.floor(sec % (60*60) / 60);
  var s = Math.ceil(sec % (60*60) % 60);
  
  if (h < 10) h = '0' + h;
  if (m < 10) m = '0' + m;
  if (s < 10) s = '0' + s;
  
  return h + ':' + m + ':' + s;
}

mpd.on('connect', function() {
  var title = '';
  var artist = '';
  
  mpd.send('currentsong', function(cs) {
    console.log(cs);
  });
  
  mpd.on('Title', function(t) {
    title = t;
  });
  
  mpd.on('Artist', function(a) {
    artist = a;
  });
  
  mpd.on('time', function(time) {    
    var secs = time.split(':')[0];
    var total = time.split(':')[1];
    
    console.log(artist + ' - ' + title + ' / ' + dur(secs) + ' - ' + dur(total));
  });
});