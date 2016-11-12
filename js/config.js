var last_values = [],
	refresh_interval = 60000,
	set_interval_id = 0,

notify = function (title, msg) {
	var date = new Date(),
		hour = date.getHours(),
		minute = date.getMinutes(),
		day = date.getDate(),
		month = date.getMonth() + 1,
		year = date.getFullYear();
	if (minute < 10) {
		minute = '0' + minute;
	}
	if (hour < 10) {
		hour = '0' + hour;
	}
	if (day < 10) {
		day = '0' + day;
	}
	if (month < 10) {
		month = '0' + month;
	}
	var date_str = hour + ':' + minute + ' ' + day + '.' + month + '.' + year;
	return chrome.notifications.create('', {
		type: "basic",
		title: title,
		message: msg,
		contextMessage: date_str,
		iconUrl: "../icons/icon-128.png"
	}, function (notifid) {});
},

get_exchange = function () {
	return store.get('exchange') || 10;
},

get_last_value = function () {
	return store.get('last-value');
},

get_within = function () {
	return store.get('within') || 10;
},

store_exc = function (name, value) {
	value = parseInt(value, 10);
	if (isNaN(value)) {
		value = 1;
	}
	store.set(name, value);
},

store_float = function (name, value, default_value) {
	value = parseFloat(value);
	if (isNaN(value)) {
		value = default_value;
	}
	store.set(name, value);
},

store_int = function (name, value) {
	value = parseInt(value, 10);
	if (isNaN(value)) {
		value = 1;
	}
	store.set(name, value);
},

reload_badge = function (manual) {
	if (manual && set_interval_id) {
		clearInterval(set_interval_id);
		set_interval_id = setInterval(reload_badge, refresh_interval);
	}

	exchange = store.get('exchange');

	if (exchange == 10) {
		$.getJSON("https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-ok", function (data) {

			if (!data && !data['result'][0]['Last']) {
				return;
			}

			var value = parseFloat(data['result'][0]['Last']);
				last_value = get_last_value() || value;
				last_max = store.get('last-max') || value;
				last_min = store.get('last-min') || value;
				badge_value = value;
			if (value === last_value) {
				chrome.browserAction.setBadgeBackgroundColor({
					color: [0, 0, 0, 150]
				});
			} else if (value > last_value) {
				chrome.browserAction.setBadgeBackgroundColor({
					color: [0, 150, 0, 150]
				});
			} else {
				chrome.browserAction.setBadgeBackgroundColor({
					color: [255, 0, 0, 255]
				});
			}

			chrome.browserAction.setTitle({
				'title': '1 OK = ' + value + chrome.i18n.getMessage("satoshibittrex")
			});

			chrome.browserAction.setBadgeText({
				'text': ''+badge_value
			});

			store_float('last-value', value);

			if (store.get('notification-max') && value > last_max) {
				store.set('last-max', value);
				notify('New Hight OK Price', 'The highest price is now ' + value);
				$('#last_max').val(value);
			}

			if (store.get('notification-min') && value < last_min) {
				store.set('last-min', value);
				notify('New Low OK Price', 'The lowest price is now ' + value);
				$('#last_min').val(value);
			}

			if (store.get('notification-diff') && store.get('last-diff')) {
				var within = get_within();
				last_values.push(value);
				if (last_values.length > within) {
					last_values.shift();
				}
				var max = Math.max.apply(Math, last_values),
					min = Math.min.apply(Math, last_values),
					abs = Math.round(Math.abs(max - min) * 100) / 100,
					last_diff = store.get('last-diff'),
					title;
				if (abs > last_diff) {
					if (max === value) {
						title = 'Price rose from ' + min + ' to ' + max;
						abs = '+' + abs;
					} else {
						title = 'Price fell from ' + max + ' to ' + min;
						abs = '-' + abs;
					}
					last_values = [value];
					notify(title, 'Within ' + within + ' fetches/minutes price changed ' + abs + ' BTC.');
				}
			}
		});
	} else if (exchange == 20) {
		$.getJSON("https://bleutrade.com/api/v2/public/getmarketsummary?market=OK_BTC", function (data) {

			if (!data && !data['result'][0]['Last']) {
				return;
			}

			var value = parseFloat(data['result'][0]['Last']);
				last_value = get_last_value() || value;
				last_max = store.get('last-max') || value;
				last_min = store.get('last-min') || value;
				badge_value = value;
			if (value === last_value) {
				chrome.browserAction.setBadgeBackgroundColor({
					color: [0, 0, 0, 150]
				});
			} else if (value > last_value) {
				chrome.browserAction.setBadgeBackgroundColor({
					color: [0, 150, 0, 150]
				});
			} else {
				chrome.browserAction.setBadgeBackgroundColor({
					color: [255, 0, 0, 255]
				});
			}

			chrome.browserAction.setTitle({
				'title': '1 OK = ' + value + chrome.i18n.getMessage("satoshibleutrade")
			});

			chrome.browserAction.setBadgeText({
				'text': ''+badge_value
			});

			store_float('last-value', value);

			if (store.get('notification-max') && value > last_max) {
				store.set('last-max', value);
				notify('New Hight OK Price', 'The highest price is now ' + value);
				$('#last_max').val(value);
			}

			if (store.get('notification-min') && value < last_min) {
				store.set('last-min', value);
				notify('New Low OK Price', 'The lowest price is now ' + value);
				$('#last_min').val(value);
			}

			if (store.get('notification-diff') && store.get('last-diff')) {
				var within = get_within();
				last_values.push(value);
				if (last_values.length > within) {
					last_values.shift();
				}
				var max = Math.max.apply(Math, last_values),
					min = Math.min.apply(Math, last_values),
					abs = Math.round(Math.abs(max - min) * 100) / 100,
					last_diff = store.get('last-diff'),
					title;
				if (abs > last_diff) {
					if (max === value) {
						title = 'Price rose from ' + min + ' to ' + max;
						abs = '+' + abs;
					} else {
						title = 'Price fell from ' + max + ' to ' + min;
						abs = '-' + abs;
					}
					last_values = [value];
					notify(title, 'Within ' + within + ' fetches/minutes price changed ' + abs + ' BTC.');
				}
			}
		});
	} else if (exchange == 30) {
		$.getJSON("https://www.cryptopia.co.nz/api/GetMarket/1298", function (data) {

			if (!data && !data['Data']['LastPrice']) {
				return;
			}

			var value = parseFloat(data['Data']['LastPrice']);
				last_value = get_last_value() || value;
				last_max = store.get('last-max') || value;
				last_min = store.get('last-min') || value;
				badge_value = value;
			if (value === last_value) {
				chrome.browserAction.setBadgeBackgroundColor({
					color: [0, 0, 0, 150]
				});
			} else if (value > last_value) {
				chrome.browserAction.setBadgeBackgroundColor({
					color: [0, 150, 0, 150]
				});
			} else {
				chrome.browserAction.setBadgeBackgroundColor({
					color: [255, 0, 0, 255]
				});
			}

			chrome.browserAction.setTitle({
				'title': '1 OK = ' + value + chrome.i18n.getMessage("satoshicryptopia")
			});

			chrome.browserAction.setBadgeText({
				'text': ''+badge_value
			});

			store_float('last-value', value);

			if (store.get('notification-max') && value > last_max) {
				store.set('last-max', value);
				notify('New Hight OK Price', 'The highest price is now ' + value);
				$('#last_max').val(value);
			}

			if (store.get('notification-min') && value < last_min) {
				store.set('last-min', value);
				notify('New Low OK Price', 'The lowest price is now ' + value);
				$('#last_min').val(value);
			}

			if (store.get('notification-diff') && store.get('last-diff')) {
				var within = get_within();
				last_values.push(value);
				if (last_values.length > within) {
					last_values.shift();
				}
				var max = Math.max.apply(Math, last_values),
					min = Math.min.apply(Math, last_values),
					abs = Math.round(Math.abs(max - min) * 100) / 100,
					last_diff = store.get('last-diff'),
					title;
				if (abs > last_diff) {
					if (max === value) {
						title = 'Price rose from ' + min + ' to ' + max;
						abs = '+' + abs;
					} else {
						title = 'Price fell from ' + max + ' to ' + min;
						abs = '-' + abs;
					}
					last_values = [value];
					notify(title, 'Within ' + within + ' fetches/minutes price changed ' + abs + ' BTC.');
				}
			}
		});
	} else if (exchange == 40) {
		$.getJSON("https://yobit.net/api/3/ticker/ok_btc", function (data) {

			if (!data && !data['ok_btc']['last']) {
				return;
			}

			var value = parseFloat(data['ok_btc']['last']);
				last_value = get_last_value() || value;
				last_max = store.get('last-max') || value;
				last_min = store.get('last-min') || value;
				badge_value = value;
			if (value === last_value) {
				chrome.browserAction.setBadgeBackgroundColor({
					color: [0, 0, 0, 150]
				});
			} else if (value > last_value) {
				chrome.browserAction.setBadgeBackgroundColor({
					color: [0, 150, 0, 150]
				});
			} else {
				chrome.browserAction.setBadgeBackgroundColor({
					color: [255, 0, 0, 255]
				});
			}

			chrome.browserAction.setTitle({
				'title': '1 OK = ' + value + chrome.i18n.getMessage("satoshiyobit")
			});

			chrome.browserAction.setBadgeText({
				'text': ''+badge_value
			});

			store_float('last-value', value);

			if (store.get('notification-max') && value > last_max) {
				store.set('last-max', value);
				notify('New maximum OK Price', 'The highest price is now ' + value);
				$('#last_max').val(value);
			}

			if (store.get('notification-min') && value < last_min) {
				store.set('last-min', value);
				notify('New minimum OK Price', 'The lowest price is now ' + value);
				$('#last_min').val(value);
			}

			if (store.get('notification-diff') && store.get('last-diff')) {
				var within = get_within();
				last_values.push(value);
				if (last_values.length > within) {
					last_values.shift();
				}
				var max = Math.max.apply(Math, last_values),
					min = Math.min.apply(Math, last_values),
					abs = Math.round(Math.abs(max - min) * 100) / 100,
					last_diff = store.get('last-diff'),
					title;
				if (abs > last_diff) {
					if (max === value) {
						title = 'Price rose from ' + min + ' to ' + max;
						abs = '+' + abs;
					} else {
						title = 'Price fell from ' + max + ' to ' + min;
						abs = '-' + abs;
					}
					last_values = [value];
					notify(title, 'Within ' + within + ' fetches/minutes price changed ' + abs + ' BTC.');
				}
			}
		});
	}
},

save_options = function () {

	var optionsOK = true;

	if (optionsOK) {
		exchange = $('#exchange option:selected').val();
		within = $('#within option:selected').val();
		last_max = $('#last_max').val();
		last_min = $('#last_min').val();
		last_diff = $('#last_diff').val();
		store_exc('exchange', exchange, 10);
		store_int('within', within, 10);
		store_float('last-max', last_max, get_last_value());
		store_float('last-min', last_min, get_last_value());
		store_float('last-diff', last_diff, 5);
		$('input[type=checkbox]').each(function () {
			var elem = $(this),
				id = elem.attr('id'),
				checked = elem.prop('checked');
			store.set(id, checked);
		});
	}

	// Update status to let user know options were saved.
	var status = document.getElementById("status");

	if (optionsOK) {
		status.innerHTML = "<div class='alert alert-success'>Options Saved.</div>";
	}

	setTimeout(function() {
		status.innerHTML = "";
	}, 1500);

	load_options();

	reload_badge(1);
},

load_options = function () {
	$('#exchange option[value=' + get_exchange() + ']').prop('selected', true);
	$('#within option[value=' + get_within() + ']').prop('selected', true);
	$('input[type=checkbox]').each(function () {
		var elem = $(this),
			id = elem.attr('id'),
			checked = store.get(id);
		elem.prop('checked', checked);
	});
	$('#last_max').val(store.get('last-max') || get_last_value());
	$('#last_min').val(store.get('last-min') || get_last_value());
	$('#last_diff').val(store.get('last-diff') || 5);
	$('#save').on('click', save_options);
},

background = function () {
	chrome.browserAction.onClicked.addListener(function (tab) {
		chrome.browserAction.setBadgeBackgroundColor({
			color: [255, 0, 0, 255]
		});

		chrome.browserAction.setBadgeText({
			'text': '...'
		});

		reload_badge(1);
	});

	set_interval_id = setInterval(reload_badge, refresh_interval);

	reload_badge();
};

$(document).ready(function() {
	$.ajaxSetup({
		cache: false
	});
});

chrome.runtime.onInstalled.addListener(function (object) {
	chrome.tabs.create({url: "../options.html"}, function (tab) {});
});
