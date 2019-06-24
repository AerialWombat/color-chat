window.onload = () => {
	$(document).ready(function() {
		var socket = io();

		$('form').submit(function(event) {
			event.preventDefault();

			socket.emit('chat message', $('.message-box').val());
			$('.message-box').val('');
			return false;
		});

		socket.on('chat message', message => {
			$('.messages').append($('<li>').text(message));
		});
	});
};
