var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.sendFile(`${__dirname}/public/index.html`);
});

const users = {};
io.on('connection', socket => {
	console.log('User connected...');
	users[socket.id] = { nickname: '', color: '' };
	console.log(users);
	io.emit('chat message', 'A user has connected...');

	socket.on('chat message', message => {
		io.emit('chat message', message);
	});

	socket.on('disconnect', () => {
		console.log('User disconnected...');
		delete users[socket.id];
		console.log(users);
		io.emit('chat message', 'A user has disconnected...');
	});
});

http.listen(3000, () => {
	console.log('Listening on port 3000...');
});
