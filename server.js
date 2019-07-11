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
let currentlyTyping = [];

io.on('connection', socket => {
	console.log('User connected...');
	users[socket.id] = {
		nickname: `User_${socket.id.slice(0, 3)}`,
		color: '#ffffff',
		isTyping: false
	};
	io.emit('update members', users);

	io.emit('server message', 'A user has connected...');

	socket.on('update user', (loginData, fn) => {
		users[socket.id] = loginData;
		io.emit('update members', users);
		fn();
	});

	socket.on('started typing', () => {
		users[socket.id].isTyping = true;

		// Checks for all users that are typing and adds to currentlyTyping array if not
		for (const user in users) {
			if (
				users[user].isTyping &&
				!currentlyTyping.includes(users[user].nickname)
			) {
				currentlyTyping.push(users[user].nickname);
			}
		}

		io.emit('update currently typing', currentlyTyping);
	});

	socket.on('stopped typing', () => {
		users[socket.id].isTyping = false;

		currentlyTyping = currentlyTyping.filter(
			user => user !== users[socket.id].nickname
		);

		io.emit('update currently typing', currentlyTyping);
	});

	socket.on('chat message', message => {
		const { nickname, color } = users[socket.id];
		const messageData = { nickname, color, message };

		io.emit('chat message', messageData);
	});

	socket.on('disconnect', () => {
		console.log('User disconnected...');
		delete users[socket.id];
		io.emit('server message', 'A user has disconnected...');
		io.emit('update members', users);
	});
});

http.listen(3000, () => {
	console.log('Listening on port 3000...');
});
