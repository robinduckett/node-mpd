# node-mpd

Node MPD, An MPD client for connecting to and controlling / querying the Linux Music Player Daemon.

See MPD Documentation for command references
``` javascript
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
```
Example output:
``` bash
robin@robin-desktop:~/dev/node-mpd$ node examples/currentsong.js 
{ file: 'Linkin_Park-A_Thousand_Suns/13-linkin_park-fallout.mp3'
, Time: '83'
, Artist: 'Linkin Park'
, Title: 'Fallout'
, Album: 'A Thousand Suns'
, Track: '13/15'
, Date: '2010-09-14'
, Genre: 'Rock'
, Pos: '12'
, Id: '12'
}
Linkin Park - Fallout / 00:01:22 - 00:01:23
Linkin Park - Fallout / 00:01:23 - 00:01:23
Linkin Park - The Catalyst / 00:00:01 - 00:05:40
Linkin Park - The Catalyst / 00:00:02 - 00:05:40
    ^Crobin@robin-desktop:~/dev/node-mpd$
```
