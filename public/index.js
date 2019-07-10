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
		const $typingNotification = $('.typing-notification');
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

		// Checks for keypress in input and emits a 'typing' notification
		let typingTimeout;
		$('.messages__form__input').on('keypress', function(event) {
			if (event.which === 13) {
				clearTimeout(typingTimeout);
				socket.emit('stopped typing');
			} else if (event.which !== 13) {
				clearTimeout(typingTimeout);
				socket.emit('started typing');

				typingTimeout = setTimeout(() => {
					socket.emit('stopped typing');
				}, 5000);
			}
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

		socket.on('update currently typing', currentlyTyping => {
			if (currentlyTyping.length > 0) {
				let notificationText = '';

				if (currentlyTyping.length === 1) {
					notificationText += currentlyTyping[0];
				} else {
					for (let i = 0; i < currentlyTyping.length; i++) {
						if (i > 1) {
							break;
						} else if (i !== currentlyTyping.length - 1) {
							notificationText += `${currentlyTyping[i]}, `;
						} else {
							notificationText += `${currentlyTyping[i]} `;
						}
					}
				}

				if (currentlyTyping.length > 2) {
					notificationText += `and ${currentlyTyping.length - 2} more `;
				}

				notificationText += `${
					currentlyTyping.length === 1 ? ' is' : ' are'
				} typing...`;

				$typingNotification.addClass('show').text(notificationText);
			} else {
				$typingNotification.removeClass('show').text('');
			}
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
