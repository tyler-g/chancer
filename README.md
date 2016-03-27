# chancer
a project exploring the creation of chance music via user interaction

## setup
setup is based in 3 parts:<br>
+ app.js | the nodejs server app that handles all command communication<br>
+ client.html | a self-contained client that is used to connect to the server and send/receive commands<br>
+ sengine/index.html | the sound engine which actually plays sounds in a browser

To start chancer, first start the server app:<br>
<pre><code>node app</code></pre>

Next open sEngine (sengine/index.html) in a browser [Chrome preferred]. You will get a message on the server app once sEngine successfully connects. As of now, sEngine only works when running on the same machine as the server app.

Finally, use the client (client.html) to connect to the server and begin sending commands! The gear icon in the top right allows you to set the IP of the server (use localhost if server is running locally) and will automatically attempt to connect.  The gear icon will turn green if successfully connected.  

Any # of clients can simultaneously connect to the server.

## config
config.js | the server app config where you can change the listening ports and various other settings

## commands
chancer supports a command line interface. To send and receive commands, use the self-contained client (client.html). 

For the following supported commands, assume x is a number associated with a particular sound. The association is random at each startup of sEngine.

The command line supports standard up/down arrow navigation through recently used commands.

<pre><code>/play x</code></pre>
play sound x 1 time
<pre><code>/stop x</code></pre>
stop sound x and reset its position
<pre><code>/pause x</code></pre>
pause sound x without changing its position
<pre><code>/loop x y</code></pre>
loop sound x, y times. If y is ommitted, loop infinitely.
<pre><code>/vol x y</code></pre>
change the volume of sound x to y, which much be a value between 0 and 100, with 0 being 0% and 100 being 100% volume.
<pre><code>/pan x y</code></pre>
change the panning of sound x to y, which much be a value between -50 and 50, with -50 being hard left, and 50 being hard right.
<pre><code>/filter x y</code></pre>
change the filter frequency of sound x to frequency y, which much be a value between 0 and 22000 (hz). Currently only 'lowpass' filter is supported.

## troubleshooting

#####node server app errors
<pre><code>command received from client, but sEngine is not connected</code></pre>
The server is receiving commands successfully from the client, but sEngine is not running. Simply open sengine/index.html in a browser window, and it will automatically connect to the server.

#####client errors
<pre><code>Server received your command [/play x] , but the sound id is invalid</code></pre>
<pre><code>Server received your command [/play -x] , but the sound id is invalid (must be positive number)</code></pre>
The server received the command as shown, but x is not a valid sound id.

x cannot be negative nor can it be a number higher than the manifest length -1. The manifest length is shown on the server at the moment sEngine connects to the server. It will say something like "SENGINE says manifest length = 9"


## logging
Not yet supported, but will be the next major feature.
