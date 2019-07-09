window.onload = () => {
	$(document).ready(function() {
		var socket = io();

		const $login = $('.login');
		const $sidebarButton = $('#sidebar-btn');
		const $membersButton = $('#members-btn');
		const $editButton = $('#edit-btn');
		const $overlay = $('.dark-overlay');
		const $sidebar = $('.sidebar');
		const $members = $('.members');
		const $messageDisplay = $('.messages__display');

		$sidebarButton.on('click', function() {
			$overlay.fadeToggle();
			$sidebar.addClass('show');
		});

		$membersButton.on('click', function() {
			$overlay.fadeToggle();
			$members.addClass('show');
		});

		$editButton.on('click', function() {
			console.log('edit button');
			$login.fadeToggle();
			$overlay.fadeToggle();
			$sidebar.removeClass('show');
			$members.removeClass('show');
		});

		$overlay.on('click', function() {
			$overlay.fadeToggle();
			$sidebar.removeClass('show');
			$members.removeClass('show');
		});

		/* Socket
======================================*/

		// Sends chosen nickname and color to server
		$('.login__form').on('submit', function() {
			event.preventDefault();

			const nicknameInput = $('.login__form__nickname').val();
			const colorInput = $('.login__form__color').val();

			// Check for empty nickname
			if (nicknameInput.length < 1) {
				return false;
			}

			$('.profile__name').css({ color: colorInput });

			socket.emit(
				'update user',
				{ nickname: nicknameInput, color: colorInput },
				() => {
					$login.fadeToggle();
				}
			);
		});

		// Sends chat message to server
		$('.messages__form').on('submit', function() {
			event.preventDefault();
			const messageInput = $('.messages__form__input').val();

			// Check for empty message
			if (messageInput.length < 1) {
				return false;
			}

			socket.emit('chat message', $('.messages__form__input').val());
			$('.messages__form__input').val('');
			return false;
		});

		// Listens for server messages
		socket.on('server message', message => {
			$messageDisplay.append(
				$('<li>')
					.text(message)
					.addClass('message')
					.hide()
					.fadeIn(100)
			);
		});

		// Listens for chat message and appends message with username
		socket.on('chat message', messageData => {
			const { nickname, color, message } = messageData;
			const currentHour = new Date().getHours();
			const currentMinutes = new Date().getMinutes();
			let timestamp;

			// Checks hour and creates formatted timestamp
			if (currentHour === 0) {
				timestamp = `12:${currentMinutes} AM`;
			} else if (currentHour > 12 && currentHour !== 0) {
				timestamp = `${currentHour - 12}:${currentMinutes} PM`;
			} else {
				timestamp = `${currentHour}:${currentMinutes} AM`;
			}

			$messageDisplay.append(
				$('<li>')
					.prepend(
						$('<span>')
							.text(`${nickname}: `)
							.addClass('message__nickname')
							.css({
								color: color
							})
					)
					.append(
						$('<span>')
							.text(timestamp)
							.addClass('message__time')
					)
					.append($('<p>').text(message))
					.addClass('message')
					.hide()
					.fadeIn(100)
			);
		});
	});
};
