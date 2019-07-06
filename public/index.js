window.onload = () => {
	$(document).ready(function() {
		var socket = io();

		const $sidebarButton = $('#sidebar-btn');
		const $membersButton = $('#members-btn');
		const $overlay = $('.dark-overlay');
		const $sidebar = $('.sidebar');
		const $members = $('.members');

		$sidebarButton.on('click', function() {
			$overlay.fadeToggle();
			$sidebar.addClass('show');
		});

		$membersButton.on('click', function() {
			$overlay.fadeToggle();
			$members.addClass('show');
		});

		$overlay.on('click', function() {
			$overlay.fadeToggle();
			$sidebar.removeClass('show');
			$members.removeClass('show');
		});

		/* Socket
======================================*/

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

		socket.on('chat message', message => {
			$('.messages__display').append(
				$('<li>')
					.text(message)
					.hide()
					.fadeIn(100)
			);
		});
	});
};
