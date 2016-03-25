# chancer
a project exploring the creation of chance music via user interaction

## setup
setup is based in 3 parts:
app.js | the nodejs server app that handles all command communication
client.html | a self-contained client that is used to connect to the server and send/receive commands
sengine/index.html | the sound engine which actually plays sounds in a browser

To start chancer, first start the server app:
node app

Next open sEngine (sengine/index.html) in a browser [Chrome preferred]

Finally, use the client (client.html) to connect to the server and begin sending commands! The gear icon in the top right allows you to set the IP of the server (use localhost if server is running locally) and will automatically attempt to connect.  The gear icon will turn green if successfully connected.  

Any # of clients can simultaneously connect to the server.

## config
config.js | the server app config where you can change the listening ports and various other settings
