'use strict';
import jQuery from 'jquery';
//import fabric from '../../fabric/1.5.0/fabric';
import moment from '../../moment/2.9.0/js/moment-with-locales';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
var AFRAME, modules, e;
/* Общие функции для модулей плеера */

function getUriParam(name) {
	//return (location.search.split(name + '=')[1] || '').split('&')[0];
	return '';
}

// Удаленный сервис логирования
function sendLog() {
	if (console.sendLog) {
		console.sendLog(arguments);
	}
}

// Удаленный сервис логирования пока не поддерживает кириллицу
function toTranslit(text) {
	return text.replace(/([а-яё])|([\s_-])|([^a-z\d])/gi, function (all, ch, space, words, i) {
		if (space || words) {
			return space ? '-' : '';
		}
		var code = ch.charCodeAt(0),
		    index = code == 1025 || code == 1105 ? 0 : code > 1071 ? code - 1071 : code - 1039,
		    t = ['yo', 'a', 'b', 'v', 'g', 'd', 'e', 'zh', 'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'c', 'ch', 'sh', 'shch', '', 'y', '', 'e', 'yu', 'ya'];
		return t[index];
	});
}

function base64ToArrayBuffer(base64) {
	return Uint8Array.from(atob(base64), function (c) {
		return c.charCodeAt(0);
	});
}

function arrayBufferToBase64(buffer) {
	var binary = '';
	var bytes = new Uint8Array(buffer);
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return window.btoa(binary);
}

// Возвращает информацию о текущем плеере 
// для идентификации его в сетке

function getVideoContainerInfo($video) {
	if (!$video) {
		return {};
	}
	var player = {};
	var video = $video.get(0);
	player.src = video.src;
	var $cell = $video.closest('.divCell');
	if ($cell.length) {
		player.cell = {};
		player.cell.id = $cell.attr('id');
		player.cell.streamid = $cell.attr('data-mediastreamid');
		var $title = $cell.find('.titleContainer > a');
		if ($title.length) {
			player.cell.title = $title.text();
		}
	}
	return player;
}

function getContainerInfo($elem) {
	if (!$elem) {
		return {};
	}
	var info = {};
	var $cell = $elem.closest('.divCell');
	if ($cell.length) {
		info.id = $cell.attr('id');
		info.streamid = $cell.attr('data-mediastreamid');
		var $title = $cell.find('.titleContainer > a');
		if ($title.length) {
			info.title = $title.html();
		}
	}
	return info;
}

/*******************************************************************************
 * delay-start 0.1
 * 
 * Author: Alexander Ivanov, ALGONT, 2017
 * 
 * Слой с крутилкой, обратным отсчетом,
 * рандомной флуктуацией таймаута и реакцией на клик
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'delayStart',
	    defaults = {
		baseRetryDelay: 15, // сек
		maxFluctuation: 5 // сек
	};

	function DelayStart(element, options) {
		this.$element = $(element);
		this.options = $.extend({}, defaults, options);
		/*$(document).off('click.delayStart', '.delay-start').on('click.delayStart', '.delay-start', function () {
      $(this).parent().delayStart('done');
  });*/
		this.init();
	}

	DelayStart.prototype = {
		init: function init() {
			var t = this;
			this._active = false;
		},

		create: function create() {
			var t = this;
			if (this.$element.find('.delay-start').length < 1) {
				t.$container = $('<div>').addClass('delay-start centerAbs').css({
					//'z-index': 1000
				}).appendTo(t.$element);
				t.$timer = $('<div>').addClass('centerAbs delay-timer').hide().css({
					'font-size': '0.9em',
					'line-height': '30px',
					'font-weight': 'bold'
				}).appendTo(t.$container);
				t.$spinner = $('<div>').addClass('centerAbs delay-spinner').hide().appendTo(t.$container);

				t.$container.append('<div class="camera-error"><span class="fa-stack fa-lg"><i class="fa fa-video-camera fa-stack-1x" style="color: white;"></i><i class="fa fa-ban fa-stack-2x" style="color: #a94442;"></i></span></div>');

				$('.delay-timer, .delay-spinner').css({
					width: 30,
					height: 30
				});
				t.$container.click(function () {
					console.log('click delay');
					t.done();
				});
			}
		},

		show: function show(params) {
			//console.log('DelayStart show this._active=' + this._active);
			console.log('Delay show');
			var t = this;
			if (this._active) {
				return;
			}
			this._active = true;
			this.create();
			t.$container.show();

			clearTimeout(t.randomTimeout);
			t.randomTimeout = setTimeout(function () {
				clearTimeout(t.randomTimeout);
				t.$spinner.show();
				t.$timer.show();
				t.delayReplayTimer = t.options.baseRetryDelay;
				t.$timer.html(t.delayReplayTimer);
				clearInterval(t.replayInterval);
				t.replayInterval = setInterval(function () {
					t.delayReplayTimer--;
					if (t.delayReplayTimer > 0) {
						t.$timer.html(t.delayReplayTimer);
					} else {
						clearInterval(t.replayInterval);
						t.delayReplayTimer = 0;
						t.done();
					}
				}, 1000);
			}, Math.floor(Math.random() * t.options.maxFluctuation * 1000));
		},

		hide: function hide() {
			if (this._active) {
				this.$container.hide();
				this.$spinner.hide();
				this.$timer.hide();
				clearInterval(this.replayInterval);
				clearTimeout(this.randomTimeout);
				this._active = false;
			}
		},

		done: function done() {
			this.hide();
			console.log('Delay done!');
			this.$element.trigger('m7PlayerDelayDone');
		},

		isActive: function isActive() {
			return this._active === true;
		}

	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = ['isActive'];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new DelayStart(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof DelayStart && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof DelayStart && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * m7-player-aframe 0.1
 * 
 * Плагин для поддержки вывода видео через a-frame (video-360)
 * 
 * Author: Alexander Ivanov, ALGONT, 2018
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'm7PlayerAframe',
	    defaults = {
		screenButtons: true
	};

	function M7PlayerAframe(element, options) {
		console.log('M7PlayerAframe 360 create');
		this.$element = $(element);
		this.options = $.extend({}, defaults, options);
		var t = this;
		this.$element.off('.m7PlayerAframe').on('m7PlayerCursorbtnClick.m7PlayerAframe', function (e, button) {
			console.log('clicked', button);
			if (button === 'home') {
				t.goHome();
			} else if (button === 'left') {
				t.goLeft();
			} else if (button === 'right') {
				t.goRight();
			} else if (button === 'up') {
				t.goUp();
			} else if (button === 'down') {
				t.goDown();
			}
		});

		if (!AFRAME.components['m7player-aframe-listener']) {
			console.log('AFRAME.registerComponent m7player-aframe-listener');
			AFRAME.registerComponent('m7player-aframe-listener', {
				init: function init() {
					this.el.addEventListener('mousedown', this.handler.bind(this));
					this.el.addEventListener('mouseup', this.handler.bind(this));
				},
				remove: function remove() {
					this.el.removeEventListener('mousedown', this.handler);
					this.el.removeEventListener('mouseup', this.handler);
				},
				handler: function handler(e) {
					console.log('M7PlayerAframe event detected', e, this.el.camera, this.el.camera.el.getAttribute('rotation'));
					if (e.type == 'mousedown' && e.button == 0) {
						this.myX = e.x;
						this.myY = e.y;
					} else if (e.type == 'mouseup' && e.button == 0) {
						if (Math.abs(this.myX - e.x) < 2 && Math.abs(this.myY - e.y) < 2) {
							this.el.emit('m7PlayerClick', [e], true);
						}
					}
				}
			});
		}
	}

	M7PlayerAframe.prototype = {
		create: function create() {
			console.log('M7PlayerAframe 360 create');
			var t = this;
			this.$video = this.$element.find('video');
			if (!this.$video.length) {
				console.error('M7PlayerAframe error: tag <video> not found!');
				return;
			}
			if (this.$video.hasClass('aframed')) {
				this.destroy();
			}

			this.$video.addClass('aframed');
			if (!this.$video.attr('id')) {
				this.$video.attr('id', Date.now());
			}
			var $scene = $('<a-scene embedded vr-mode-ui="enabled: false" m7player-aframe-listener>');
			$('<a-camera id="camera" camera="active: true" look-controls="reverseMouseDrag: true"></a-camera>').appendTo($scene);
			var $videosphere = $('<a-videosphere>');

			if (this.options.screenButtons) {
				this.$element.m7PlayerCursorbtn({}).m7PlayerCursorbtn('show');
			}

			$videosphere.attr('src', '#' + this.$video.attr('id')).appendTo($scene);
			this.$element.append($scene);

			$('body').on('keydown.aframe', function (e) {
				var camera = t.getCamera();
				console.log('keydown.aframe ', e.keyCode);
				if (e.keyCode === 72) {
					// H(ome)
					t.goHome();
				} else if (e.keyCode === 37 && e.ctrlKey) {
					// Left
					t.goLeft();
				} else if (e.keyCode === 39 && e.ctrlKey) {
					// Right
					t.goRight();
				} else if (e.keyCode === 38 && e.ctrlKey) {
					// Up
					t.goUp();
				} else if (e.keyCode === 40 && e.ctrlKey) {
					// Down
					t.goDown();
				}
			});
		},

		getCamera: function getCamera() {
			return $('#camera')[0];
		},

		goHome: function goHome() {
			this.faceCameraToCoords({
				x: 0,
				y: 0,
				z: 0
			});
		},

		goLeft: function goLeft() {
			this.relativeRotation({
				x: 0,
				y: 5,
				z: 0
			});
		},

		goRight: function goRight() {
			this.relativeRotation({
				x: 0,
				y: -5,
				z: 0
			});
		},

		goUp: function goUp() {
			this.relativeRotation({
				x: 5,
				y: 0,
				z: 0
			});
		},

		goDown: function goDown() {
			this.relativeRotation({
				x: -5,
				y: 0,
				z: 0
			});
		},

		faceCameraToCoords: function faceCameraToCoords(coords) {
			var camera = this.getCamera();
			console.log('M7PlayerAframe faceCameraToCoords', coords, camera.getAttribute('rotation'));
			// ниже трэш-код, но более стандартные работающие способы для 0.8.2 найти не удалось :(
			camera.setAttribute('look-controls', { enabled: false });
			camera.setAttribute('rotation', coords);
			var newX = camera.object3D.rotation.x;
			var newY = camera.object3D.rotation.y;
			camera.components['look-controls'].pitchObject.rotation.x = newX;
			camera.components['look-controls'].yawObject.rotation.y = newY;
			camera.setAttribute('look-controls', { enabled: true });
		},

		relativeRotation: function relativeRotation(rotate) {
			var rotation = this.getCamera().getAttribute('rotation');
			this.faceCameraToCoords({
				x: rotation.x + rotate.x,
				y: rotation.y + rotate.y,
				z: rotation.z + rotate.z
			});
		},

		destroy: function destroy() {
			console.log('M7PlayerAframe 360 destroy');
			this.$element.find('a-scene').remove();
			this.$video.removeClass('aframed');
			if (this.$element.m7PlayerCursorbtn) {
				this.$element.m7PlayerCursorbtn('hide');
			}
			//this.$element.data('plugin-' + pluginName, null);
		},

		scale: function scale(event) {
			console.log('M7PlayerAframe scale not implemented yet');
			//this.$element.find('a-scene')[0].object3D.scale.multiplyScalar(1.1);
			//this.$element.find('a-videosphere')[0].object3D.scale.multiplyScalar(1.1);
		}

	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = [];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new M7PlayerAframe(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof M7PlayerAframe && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof M7PlayerAframe && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);


/*******************************************************************************
 * m7-player-cursorbtn 0.1
 * 
 * Наэкранные кнопки управления курсором (для видео 360)
 * 
 * Author: Alexander Ivanov, ALGONT, 2018
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'm7PlayerCursorbtn',
	    defaults = {};

	function M7PlayerCursorbtn(element, options) {
		this.$element = $(element);
		this.options = $.extend({}, defaults, options);
		this.init();
	}

	M7PlayerCursorbtn.prototype = {
		init: function init() {
			var t = this;
		},

		show: function show() {
			var t = this;
			this.buttonsContainer = $('<div class="cursor-buttons-container">');
			this.cursorButtons = $('<div class="cursor-buttons">');
			$('<i class="fa fa-home home-button cursor-button" data-id="home">').appendTo(this.cursorButtons);
			$('<i class="fa fa-chevron-left left-button cursor-button" data-id="left">').appendTo(this.cursorButtons);
			$('<i class="fa fa-chevron-right right-button cursor-button" data-id="right">').appendTo(this.cursorButtons);
			$('<i class="fa fa-chevron-up up-button cursor-button" data-id="up">').appendTo(this.cursorButtons);
			$('<i class="fa fa-chevron-down down-button cursor-button" data-id="down">').appendTo(this.cursorButtons);
			this.cursorButtons.appendTo(this.buttonsContainer);
			this.$element.append(this.buttonsContainer);
			this.cursorButtons.on('mousedown', function (e) {
				//console.log('click!', e, $(e.target).data('id'));
				t.$element.trigger('m7PlayerCursorbtnClick', [$(e.target).data('id')]);
				t.interval = setInterval(function () {
					t.$element.trigger('m7PlayerCursorbtnClick', [$(e.target).data('id')]);
				}, 100);
			}).on('mouseup mouseleave', function (e) {
				if (t.interval) {
					clearInterval(t.interval);
					delete t.interval;
				}
			});
		},

		hide: function hide() {
			this.buttonsContainer.remove();
		}

	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = [];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new M7PlayerCursorbtn(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof M7PlayerCursorbtn && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof M7PlayerCursorbtn && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * m7-player-html5 0.1
 * 
 * Author: Alexander Ivanov, ALGONT, 2017
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'm7PlayerHtml5',
	    defaults = {
		playbackRate: 1,
		autoplay: false,
		cache: 0,
		controls: false,
		debugRegim: false,
		delayControl: 0, // допустимая задержка в мс при воспроизведении живых потоков для коррекции. 0 - откл. коррекции		
		mode: 'stable',
		stalledTimeout: 3000, // задержка в мс, допустимая для нахождения плеера в состоянии stalled
		view360: false,
		workersCount: 1
	};

	function M7PlayerHtml5(element, options) {
		this.shift = 0; // время от старта потока (для расчета показа метаданных)
		this.hasAudio = false;
		this.$element = $(element);
		this.$player = this.$element.hasClass('m7Player') ? this.$element : this.$element.closest('.m7Player');
		this.options = $.extend({}, defaults, options);
		this.$video = $('<video>').addClass('m7PlayerHtml5');
		if (this.options.autoplay) {
			// Без этого локальные файлы не автостартовали в FF (video suspend)
			// Если будет мешать - убрать
			this.$video.attr('autoplay', 'autoplay');
		}
		this.$element.html(this.$video);
		this.$video.attr({
			crossorigin: 'anonymous' // нужно для подгрузки субтитров
		});
		this.video = this.$video.get(0);
		this.init();
	}

	M7PlayerHtml5.prototype = {
		init: function init() {
			console.log('M7PlayerHtml5 init');
			var t = this;
			this.video.controls = this.options.controls;
			//this.video.autoplay = this.options.autoplay;
			this.video.preload = 'none';

			this.$video.off().on('mousedown.' + pluginName, function (e) {
				console.log('mousedown', e);
				if (e.button == 0) {
					t.myMouseDownX = e.pageX;
					t.myMouseDownY = e.pageY;
				}
			}).on('mouseup.' + pluginName, function (e) {
				console.log('mouseup', t, e);
				if (e.button == 0 && Math.abs(t.myMouseDownX - e.pageX) < 2 && Math.abs(t.myMouseDownY - e.pageY) < 2) {
					t.$element.trigger('m7PlayerClick', [e]);
					delete t.myMouseDownX;
					delete t.myMouseDownY;
				}
			}).on('loadstart.' + pluginName, function (e) {
				console.log('video loadstart');
				//t.$element.trigger('loadstart');
			}).on('progress.' + pluginName, function (e) {
				//console.log('video progress', t.video, e);
				var bufferInfo = t.getBufferInfo();
				if (bufferInfo) {
					t.$element.trigger('m7BufferChange', [bufferInfo]);
				}
			}).on('suspend.' + pluginName, function (e) {
				sendLog('on video suspend', getVideoContainerInfo(t.$video));
				console.log('video suspend');
				//t.$element.trigger('suspend');
			}).on('abort.' + pluginName, function (e) {
				console.log('video abort');
				sendLog('on video abort', getVideoContainerInfo(t.$video));
				//t.$element.trigger('abort');
			}).on('emptied.' + pluginName, function (e) {
				console.log('video emptied');
				sendLog('on video emptied', getVideoContainerInfo(t.$video));
				//t.$element.trigger('emptied');
			}).on('stalled.' + pluginName, function (e) {
				console.log('video stalled');
				sendLog('on video stalled', getVideoContainerInfo(t.$video));
				// Плеер пытается получить данные, но их почему-то нет
				if (t.options.stalledTimeout && !t.stalledTimeout) {
					t.stalledTimeout = setTimeout(function () {
						sendLog('**error on video stalled', getVideoContainerInfo(t.$video));
						t.$element.trigger('m7PlayerError', 'error on video stalled');
						t.stalledTimeout = null;
					}, t.options.stalledTimeout);
				}
			}).on('loadedmetadata.' + pluginName, function (e) {
				console.log('video loadedmetadata', t.video.textTracks);
				if (t.track) {
					//t.track.mode = "hidden";
					t.track.oncuechange = null;
					console.log('set track oncuechange=null metadata ');
				}
				t.track = this.addTextTrack("metadata");
				console.log('set track oncuechange metadata 3', t.track);
				t.track.oncuechange = function () {
					t._onCueChange(t.track, true);
				};
			}).on('loadeddata.' + pluginName, function (e) {
				console.log('video loadeddata');
				//t.$element.trigger('loadeddata');
				var hasAudio = false;
				if (typeof t.video.webkitAudioDecodedByteCount !== "undefined") {
					// non-zero if video has audio track
					if (t.video.webkitAudioDecodedByteCount > 0) {
						//console.log("video has audio");
						hasAudio = true;
					} else {
						//console.log("video doesn't have audio");
					}
				} else if (typeof t.video.mozHasAudio !== "undefined") {
					// true if video has audio track
					if (t.video.mozHasAudio) {
						// console.log("video has audio");
						hasAudio = true;
					} else {
						// console.log("video doesn't have audio");
					}
				} else {
					console.error("can't tell if video has audio");
				}
				t.$video.trigger('m7StreamHasAudioReceived', [hasAudio]);
			}).on('canplay.' + pluginName, function (e) {
				console.log('video canplay', {
					audioTracks: t.video.audioTracks
				});
				//t.$element.trigger('canplay');
				sendLog('on video canplay', {
					paused: t.video.paused
				}, getVideoContainerInfo(t.$video));

				if (true === t.video.ended) {
					return;
				}
				if (true === t.manualPaused) {
					t.pause();
				} else {
					t.play();
				}
			}).on('canplaythrough.' + pluginName, function (e) {
				console.log('video canplaythrough');
				sendLog('on video canplaythrough', getVideoContainerInfo(t.$video));
				//console.log('video canplaythrough');
				//t.$element.trigger('canplaythrough');
			}).on('waiting.' + pluginName, function (e) {
				console.log('video waiting');
				sendLog('on video waiting', getVideoContainerInfo(t.$video));
				// Плеер пытается получить данные, но их почему-то нет
				// В Chrome вместо waiting генерируется stalled
				if (t.options.stalledTimeout && !t.stalledTimeout) {
					t.stalledTimeout = setTimeout(function () {
						sendLog('**error on video waiting', getVideoContainerInfo(t.$video));
						t.$element.trigger('m7PlayerError', 'error on video waiting');
						t.stalledTimeout = null;
					}, t.options.stalledTimeout);
				}
			}).on('seeking.' + pluginName, function (e) {
				console.log('video seeking');
				sendLog('on video seeking', getVideoContainerInfo(t.$video));
				// t.$element.trigger('seeking');
			}).on('seeked.' + pluginName, function (e) {
				console.log('video seeked');
				sendLog('on video seeked', getVideoContainerInfo(t.$video));
				//t.$element.trigger('seeked');
			}).on('ended.' + pluginName, function (e) {
				console.log('video ended');
				sendLog('on video ended', getVideoContainerInfo(t.$video));
				t.$element.trigger('m7PlayerEndReached');
			}).on('durationchange.' + pluginName, function (e) {
				console.log('video durationchange', this.duration);
				//t.$element.trigger('durationchange', [this.duration]);
			}).on('timeupdate.' + pluginName, function (e) {
				t.$element.trigger('m7PlayerTimeChange', [this.currentTime, t.getDelay(), this.duration]);
				if (t.track) {
					var cues = t.track.activeCues;
					//console.log('timeupdate', this.currentTime, t.track.activeCues);
				}
				if (t.stalledTimeout) {
					clearTimeout(t.stalledTimeout);
					delete t.stalledTimeout;
				}
				/*clearTimeout(t.nextTimeupdateTimeout);	
    if (t.options.delayControl) {
    	t.nextTimeupdateTimeout = setTimeout(function () {
    		t.$element.trigger('m7PlayerError');
    		delete t.options.delayControl;
    	}, 5000);						
    }*/
			}).on('play.' + pluginName, function (e) {
				console.log('video play');
				sendLog('on video play', {
					paused: t.video.paused
				}, getVideoContainerInfo(t.$video));
				console.log('video play');
				t.manualPaused = false;
				clearTimeout(t.stalledTimeout);
				delete t.stalledTimeout;
				t.$element.trigger('m7PlayerPlay');
				t.requestStreamInfo();
			}).on('playing.' + pluginName, function (e) {
				console.log('video playing');
				t.$element.trigger('m7PlayerPlaying');
				if (t.stalledTimeout) {
					clearTimeout(t.stalledTimeout);
					delete t.stalledTimeout;
				}
			}).on('pause.' + pluginName, function (e) {
				console.log('video pause');
				t.$element.trigger('m7PlayerPause');
				sendLog('on video pause', getVideoContainerInfo(t.$video));
				if (t.stalledTimeout) {
					clearTimeout(t.stalledTimeout);
					delete t.stalledTimeout;
				}
			}).on('ratechange.' + pluginName, function (e) {
				t.$element.trigger('m7PlayerRateChange', [t.video.playbackRate]);
			}).on('resize.' + pluginName, function (e) {
				console.log('video resize', t.video.videoWidth, t.video.videoHeight);
				t.$element.trigger('m7PlayerResolution', [t.video.videoWidth, t.video.videoHeight]);
			}).on('volumechange.' + pluginName, function (e, data) {
				console.log('video volumechange', e, data);
				t.$element.trigger('m7PlayerVolumeChange', [t.video.volume, t.video.muted]);
			}).on('error.' + pluginName, function (e) {
				console.error('video error', e);
				sendLog('** player error', {
					paused: t.video.paused
				}, getVideoContainerInfo(t.$video));
				t.$element.trigger('m7PlayerError', 'video hrml5 error');
				if (t.stalledTimeout) {
					clearTimeout(t.stalledTimeout);
					delete t.stalledTimeout;
				}
			}).on('m7MetadataReceived.' + pluginName, function (e, metadata, timestamp) {
				var start = parseFloat(timestamp) - parseFloat(t.shift);
				console.log('M7PlayerHtml5 m7MetadataReceived', {
					currentTime: t.video.currentTime,
					timestamp: timestamp,
					shift: t.shift,
					start: start,
					track: t.track
				});
				if (t.track) {
					var start = parseFloat(timestamp) - parseFloat(t.shift);
					var cue = new VTTCue(start, start + 0.2, metadata);
					console.log('set track oncuechange metadata 2', t.track.cues ? t.track.cues.length : 0);
					/*t.track.oncuechange = function () {
     	t._onCueChange(t.track, true);
     }*/
					t.track.addCue(cue);
				}
			}).on('m7StreamHasAudioReceived.' + pluginName, function (e, hasAudio) {
				console.log('m7StreamHasAudioReceived', hasAudio);
				t.hasAudio = hasAudio;
				t.$element.trigger('m7PlayerVolumeChange', [t.video.volume, t.video.muted]);
			}).on('m7StreamTimeShiftReceived.' + pluginName, function (e, shift) {
				t.shiftReceivedTime = new Date();
				console.log('m7StreamTimeShiftReceived', shift, t.shiftReceivedTime);
				t.shift = shift;
			});
		},

		addMetadata: function addMetadata(metadata) {
			var t = this;
			if (metadata.type == 'vtt' || metadata.mimeType == 'text/vtt') {
				if (metadata.file) {
					var $track = $('<track>').attr({
						'label': 'metadata',
						'kind': 'metadata',
						'src': metadata.file,
						'default': 'default'
					}).appendTo(this.$video);
					var track = $track.get(0).track;
					console.log('track vtt added. set track oncuechange metadata', track);
					track.oncuechange = function () {
						t._onCueChange(track, false);
					};
				} else {
					// Метаданные передаются не в файле, возможно - вебсокетом (см. src())
				}
			} else {
				console.error('Unsupported metadata type: ', metadata);
			}
		},

		destroy: function destroy() {
			this.$video.remove();
			this.$element.removeData('plugin-' + pluginName);
		},

		clear: function clear() {
			// Реинициализация плеера, запускается ТОЛЬКО родителем - m7-player
			sendLog('html5 clear', getVideoContainerInfo(this.$video));
			this.$video.html(''); // очищаем треки метаданных
			this.video.pause();
			this.video.src = '';
			this.clearCues();
			if (this.$video.videoMSE) {
				this.$video.videoMSE('reset');
			}
		},

		clearCues: function clearCues() {
			console.log('m7PlayerHtml5.clearCues start');
			this.$video.find('track').remove();
			if (this.track) {
				if (this.track.cues) {
					while (this.track.cues.length) {
						this.track.removeCue(this.track.cues[0]);
					}
				}
				delete this.track;
			}
		},

		hide: function hide() {
			this.$video.hide();
		},

		isAudioAvailable: function isAudioAvailable() {
			console.log('m7PlayerHtml5.isAudioAvailable', this.hasAudio);

			//return (this.video.audioTracks != undefined && this.video.audioTracks.length > 0);
			return true == this.hasAudio;
		},

		mute: function mute(data) {
			if (typeof data === 'undefined') {
				return this.video.muted;
			}
			this.video.muted = true == data;
		},

		nextFrame: function nextFrame() {
			this.video.currentTime += 1 / 15;
			/*if (typeof(this.video.seekToNextFrame) == 'function') {
   	// Экспериментальная функция FF. На версии 59.0.2 вкладка на ней падает
   	this.video.seekToNextFrame(); 
   } else {
   	//console.error('Function seekToNextFrame is not supported on this browser!');
   	this.video.currentTime += 1/15;
   }*/
		},

		src: function src(data) {
			console.log('m7PlayerHtml5 src', data);
			if (typeof data === 'undefined' || data == "") {
				return this.options.src;
			}
			this.options.src = data;

			this.$video.find('source').remove();
			this.clearCues();

			if (typeof data == 'string') {
				this.video.src = data;
			} else {
				// адаптация к параметрам, возвращаемым сервисом
				if (data.video && data.video.uri) {
					data.src = data.src || data.video.uri;
				}

				if (data.src) {
					data.view360 = data.view360 || false;
					if (this.options.view360 != data.view360) {
						this.view360(data.view360);
					}

					this.video.removeAttribute('src');
					if ( /*this.options.debugRegim ||*/data.mime == 'algont/mse2') {
						this.$video.videoMSE2({
							mode: this.options.mode,
							cache: this.options.cache,
							workersCount: this.options.workersCount
						}).videoMSE2('src', data);
					} else if (data.mime == 'algont/mse') {
						this.$video.videoMSE({
							mode: this.options.mode,
							cache: this.options.cache,
							workersCount: this.options.workersCount
						}).videoMSE('src', data);
					} else if (data.mime == 'algont/mse3') {
						this.$video.videoMseNoWorkers({
							mode: this.options.mode
						}).videoMseNoWorkers('src', data);
					} else if (data.mime == 'algont/mse4') {
						this.$video.videoMseNoWorkers2({
							mode: this.options.mode,
							src: data
						});
					} else if (data.mime == 'synology/mse') {
						this.$video.synologyMSE({
							mode: this.options.mode
						}).synologyMSE('src', data);
					} else {
						this.video.src = data.src;
					}
				}
			}
			this.playbackRate(this.options.playbackRate);
		},

		play: function play() {
			console.log('m7player-html5 play');
			sendLog('video play', getVideoContainerInfo(this.$video));
			this.video.play();
		},

		pause: function pause() {
			console.log('m7player-html5 pause');
			sendLog('video pause', getVideoContainerInfo(this.$video));
			this.manualPaused = true;
			this.$element.trigger('m7PlayerPause');
			this.video.pause();
		},

		show: function show() {
			this.$video.show();
		},

		stop: function stop() {
			console.log('m7player-html5 pause');
			this.video.pause();
		},

		getSnapshot: function getSnapshot() {
			console.log('getSnapshot, analytics', this.$player.m7Player('analytics'));
			if (this.$player.m7Player('analytics') /*this.$element.m7PlayerAnalytics*/) {
					//return this._getSnapshot();
					return this._getSnapshotAnalytics();
				} else {
				return this._getSnapshot();
			}
		},

		_getSnapshot: function _getSnapshot() {
			console.log('_getSnapshot');
			var $canvas = $('<canvas>').css({
				'width': this.video.videoWidth,
				'height': this.video.videoHeight
			}).appendTo(this.$element);
			var canvas = $canvas.get(0);
			canvas.width = this.video.videoWidth;
			canvas.height = this.video.videoHeight;
			var ctx = $canvas.get(0).getContext('2d');
			ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
			var image = canvas.toDataURL('image/jpeg');
			//$('<img>').attr('src', image).appendTo(this.$element);
			$canvas.remove();
			return image;
		},

		_getSnapshotAnalytics: function _getSnapshotAnalytics() {
			console.log('_getSnapshotAnalytics');
			this.$element.m7PlayerAnalytics('background', this.video);
			var image = this.$element.m7PlayerAnalytics('getSnapshot');
			this.$element.m7PlayerAnalytics('background', '');
			return image;
		},

		playbackRate: function playbackRate(data) {
			//console.log('html5 playbackRate', data);
			this.video.playbackRate = data;
		},

		position: function position(data) {
			if (data) {
				console.log('m7playar-html5 set position', data);
				this.video.currentTime = data;
			} else {
				return this.video.currentTime;
			}
		},

		requestStreamInfo: function requestStreamInfo() {
			// Результат надо возвращать событием m7StreamInfo, поскольку он может быть асинхронным (vlc)
			this.$element.trigger('m7StreamInfo', {
				width: this.video.videoWidth,
				height: this.video.videoHeight
			});
		},

		rewind: function rewind(data) {
			this.video.currentTime += data;
		},

		rewindToEnd: function rewindToEnd(data) {
			if (this.video.buffered.length && this.video.buffered.end(this.video.buffered.length - 1) - this.video.currentTime > 0.2) {
				this.video.currentTime = this.video.buffered.end(this.video.buffered.length - 1) - 0.1;
			}
		},

		getTimeShift: function getTimeShift() {
			return this.shift;
		},

		getDelay: function getDelay() {
			/*console.log('getTimeShift', {
   	currentTime: this.video.currentTime,
   	end: this.video.buffered.end(this.video.buffered.length-1),
   	shift: this.video.buffered.end(this.video.buffered.length-1) - this.video.currentTime
   });*/
			if (this.video.buffered.length) {
				return this.video.buffered.end(this.video.buffered.length - 1) - this.video.currentTime;
			} else {
				return 0;
			}
		},

		getBufferInfo: function getBufferInfo() {
			//console.log('getBufferInfo!!!', this.historyBuffer);
			if (this.video.buffered.length) {
				try {
					var fromEndOfBuffer = Math.round((this.video.buffered.end(this.video.buffered.length - 1) - this.video.currentTime) * 1000) / 1000;
					this.historyBuffer = this.historyBuffer || [];
					this.historyBuffer.push(fromEndOfBuffer);
					if (this.historyBuffer.length > 30) {
						this.historyBuffer.shift();
					}
					// Находим минимальное значение в массиве
					var minBuffer = Math.min.apply(null, this.historyBuffer);
					var result = {
						fromEndOfBuffer: fromEndOfBuffer,
						minBuffer: minBuffer,
						bufferedLength: this.video.buffered.length,
						bufferedStart: this.video.buffered.start(this.video.buffered.length - 1),
						bufferedEnd: this.video.buffered.end(this.video.buffered.length - 1)
					};
					if (this.track) {
						result.cuesLength = this.track.cues ? this.track.cues.length : 0;
					}
					return result;
				} catch (e) {
					return undefined;
				}
			}
		},

		getPlaybackQuality: function getPlaybackQuality() {
			var res = {};
			if (this.video.getVideoPlaybackQuality) {
				return this.video.getVideoPlaybackQuality();
			} else {
				if (this.video.webkitDecodedFrameCount) {
					res.webkitDecodedFrameCount = this.video.webkitDecodedFrameCount;
				}
				if (this.video.webkitDroppedFrameCount) {
					res.webkitDroppedFrameCount = this.video.webkitDroppedFrameCount;
				}
				if (this.video.webkitVideoDecodedByteCount) {
					res.webkitVideoDecodedByteCount = this.video.webkitVideoDecodedByteCount;
				}
				if (this.video.webkitAudioDecodedByteCount) {
					res.webkitAudioDecodedByteCount = this.video.webkitAudioDecodedByteCount;
				}
				return Object.keys(res).length ? res : undefined;
			}
		},

		view360: function view360(data) {
			if (typeof data === 'undefined') {
				return this.options.view360;
			}
			console.log('view360()', data);
			var $elem = this.$element;
			this.options.view360 = data;
			if (this.options.view360) {
				$elem.addClass('fullsize');
				$elem.m7PlayerAframe({}).m7PlayerAframe('create');
			} else {
				if ($elem.m7PlayerAframe) {
					$elem.m7PlayerAframe('destroy');
				}
				$elem.removeClass('fullsize');
				//this.$video.removeClass('hidden');
			}
		},

		volume: function volume(data) {
			if (typeof data === 'undefined') {
				return this.video.volume;
			}
			this.video.volume = data;
			this.mute(false);
		},

		_onCueChange: function _onCueChange(track, autoRemoveCue) {
			// autoRemoveCue выставлять false для статических vtt-файлов и true для динамических событий
			console.log('metadata track oncuechange', track);
			var activeStart = 0;
			for (var i = 0; i < track.activeCues.length; i++) {
				this.$element.trigger('m7PlayerMetadataEvent', [track.activeCues[i].text, track.activeCues[i].id]);
				activeStart = track.activeCues[i].startTime;
				if (autoRemoveCue) {
					track.removeCue(track.activeCues[i]); // prevented the memory leak	
				}
			}
			if (autoRemoveCue && activeStart && track.cues && track.cues.length) {
				var j = 0;
				while (j < track.cues.length) {
					if (track.cues[j] && track.cues[j].startTime < activeStart) {
						track.removeCue(track.cues[j]);
					} else {
						j++;
					}
				}
			}
		}

		/*_enterMetadataEvent: function (metadata, num) {
  	console.log('metaevent Enter ', num);
  	if (this.$element.m7PlayerAnalytics) {
  		this.$element.m7PlayerAnalytics('show', {
  			metadata: metadata, 
  			num: num
  		});
  	}
  },
  		_exitMetadataEvent: function (metadata) {
  	console.log('metaevent Exit');
  	//this.$element.m7PlayerAnalytics({}).m7PlayerAnalytics('hide');
  },*/

	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = ['src', 'getTimeShift', 'getPlaybackQuality', 'getBufferInfo', 'getSnapshot', '_getSnapshot', '_getSnapshotAnalytics', 'isAudioAvailable', 'mute', 'volume', 'view360', 'position'];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new M7PlayerHtml5(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof M7PlayerHtml5 && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof M7PlayerHtml5 && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * m7-player-info 0.1
 * 
 * Показываем информацию о потоке поверх видео
 * 
 * Author: Alexander Ivanov, ALGONT, 2017
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'm7PlayerInfo',
	    defaults = {
		//frequency: 1000, // мс, частота обновления информационного слоя 
		strings: {
			resolution: 'Разрешение',
			errors: 'Переподключений'
		}
	};

	function M7PlayerInfo(element, options) {
		this.$element = $(element);
		this.$player = this.$element.hasClass('m7Player') ? this.$element : this.$element.closest('.m7Player');
		this.options = $.extend({}, defaults, options);
		this.init();
	}

	M7PlayerInfo.prototype = {
		init: function init() {
			var t = this;
			t.$infoPane = null;
			console.log('m7PlayerInfo init');
		},

		show: function show() {
			//console.log('m7PlayerInfo show');
			var t = this;
			t.hide();

			t.$infoPane = $('<div>').addClass('stream-info').appendTo(t.$player);

			t.$resolution = $('<div>').append(t.options.strings.resolution + ': <span></span>').appendTo(t.$infoPane).find('span');

			t.$errors = $('<div>').append(t.options.strings.errors + ': <span>' + t.$player.m7Player('getErrorsCount') + '</span>').appendTo(t.$infoPane).find('span');

			// Опциональные параметры (скрыты изначально)
			/*t.$bufferState = $('<div>')
   	.css('padding-top', 10)
   	.appendTo(t.$infoPane)
   	.hide();
   
   t.$playbackQuality = $('<div>')
   	.css('padding-top', 10)
   	.appendTo(t.$infoPane)
   	.hide();*/

			t.$element.on('m7StreamInfo.' + pluginName, function (e, stream) {
				console.log('M7PlayerInfo on m7StreamInfo', stream);
				t.$resolution.html(stream.width + 'x' + stream.height);
			}).on('M7PlayerEncounteredError.' + pluginName, function (e, counter) {
				console.log('M7PlayerInfo on playerEncounteredError', counter);
				t.$errors.html(counter);
			});

			/*.on('m7BufferChange.' + pluginName, function (e, bufferState) {
   	t.$bufferState.html('');//.show();
   	if (bufferState) {
   		for (var key in bufferState) {
   			$('<div>')
   				.text(key + ': ' + bufferState[key])
   				.appendTo(t.$bufferState);
   		}						
   	}					
   });*/

			t.$player.m7Player('requestStreamInfo');
		},

		hide: function hide() {
			var t = this;
			this.$element.off('.' + pluginName);
			this.$player.find('.stream-info').remove();
			this.$infoPane = null;
		},

		toggle: function toggle() {
			if (this.$infoPane) {
				this.hide();
			} else {
				this.show();
			}
		},

		state: function state(data) {
			if (typeof data === 'undefined' || data === "") {
				return this.$infoPane != null;
			}
			if (data == true) {
				this.show();
			} else {
				this.hide();
			}
		}

	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = ['state'];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new M7PlayerInfo(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof M7PlayerInfo && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof M7PlayerInfo && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * m7-player-mjpeg 0.1
 * 
 * Mjpeg-плеер
 * 
 * Author: Alexander Ivanov, ALGONT, 2017
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'm7PlayerMjpeg',
	    defaults = {};

	function M7PlayerMjpeg(element, options) {
		this.$element = $(element);
		this.options = $.extend({}, defaults, options);
		this.init();
	}

	M7PlayerMjpeg.prototype = {
		init: function init() {
			var t = this;
		},

		src: function src(data) {
			var t = this;
			console.log('M7PlayerMjpeg src', data);
			if (typeof data === 'undefined' || data == "") {
				return this.$element[this.options.engine]('src');
			}
			if (typeof data == 'string') {
				this.source = data;
			} else if (data.src) {
				this.source = data.src;
			} else {
				console.error('M7PlayerMjpeg error: source not defined!');
			}
			if (this.source) {
				this.hide();
				$('<img>').addClass('M7PlayerMjpeg').attr('src', this.source).css({
					//'z-index': 200,
					'position': 'absolute',
					'top': 0,
					'left': 0,
					'width': '100%',
					'height': '100%'
				}).appendTo(this.$element);
				//this.$element.hide();				
				this.$element.trigger('directMjpegRegim', ["on"]);
				/*.click(function () {
    	t.$element.click();
    });*/
			}
		},

		hide: function hide() {
			this.$element.trigger('directMjpegRegim', ["off"]);
			//this.$element.show();
			this.$element.find('.M7PlayerMjpeg').remove();
		}

	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = ['src'];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new M7PlayerMjpeg(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof M7PlayerMjpeg && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof M7PlayerMjpeg && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * m7-player-playbtn 0.1 DEPRECATED
 * 
 * Показываем кнопки пуск/пауза поверх видео
 * 
 * Author: Alexander Ivanov, ALGONT, 2017
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'm7PlayerPlaybtn',
	    defaults = {
		state: 'play',
		iconSize: 80
	};

	function M7PlayerPlaybtn(element, options) {
		this.$element = $(element);
		this.options = $.extend({}, defaults, options);
		this.init();
	}

	M7PlayerPlaybtn.prototype = {
		init: function init() {
			var t = this;
			console.log('m7PlayerPlaybtn init');

			t.$element.on('m7PlayerStateChange.' + pluginName, function (e, state) {
				if (state == 'play') {
					t.options.state = 'pause';
				} else {
					t.options.state = 'play';
				}
				t.setButton(t.options.state);
			});
		},

		show: function show() {
			var t = this;

			if (t.$playBtnControl) {
				t.$playBtnControl.off().remove();
			}

			t.$playBtnControl = $('<div>').addClass('play-btn centerAbs').addClass('visibleOnHover').css({
				'overflow': 'hidden',
				'opacity': '0.6',
				'text-align': 'center',
				'margin': 'auto',
				'height': 200,
				'z-index': 111
			}).appendTo(t.$element);

			t.$playBtnControl.click(function () {

				var $btn;
				if ($btn = t.$playBtnControl.find('i')) {
					if (typeof $btn.effect == 'function') {
						$btn.effect("puff", {}, 500, function () {
							t.onClick();
						});
					} else {
						t.onClick();
					}
				}
			});

			if (t.options.state == 'pause') {
				t.setButton('pause');
			} else if (t.options.state == 'play') {
				t.setButton('play');
			} else {
				t.$playBtnControl.html('');
			}

			t.$playBtnControl.on('mouseover', function () {
				t.$playBtnControl.find('i').css('display', 'inherit');
			});
		},

		onClick: function onClick(mode) {
			this.$element.trigger('m7PlayerPlaybtnClick', [this.options.state]);
		},

		setButton: function setButton(mode) {
			var icon = mode == 'pause' ? 'fa-pause' : 'fa-play-circle-o';
			var t = this;
			var $btn = $('<i>').addClass('fa ' + icon).css({
				'color': 'white',
				'font-size': t.options.iconSize,
				'opacity': '0.6',
				'width': t.options.iconSize
			});

			t.$playBtnControl.html($btn);
			if (typeof $btn.effect == 'function') {
				$btn.css('position', 'absolute').position({
					of: t.$playBtnControl
				});
			} else {
				$btn.addClass('centerAbs').css('line-height', '200px');
			}
		}

	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = [];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new M7PlayerPlaybtn(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof M7PlayerPlaybtn && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof M7PlayerPlaybtn && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * m7-player-ptz 0.1
 * плагин управляния ptz для m7-player
 * 
 * Author: Alexander Ivanov, ALGONT, 2017
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'm7PlayerPtz',
	    defaults = {
		ptzNode: {}
	};

	function M7PlayerPtz(element, options) {
		this.$element = $(element);
		this.options = $.extend({}, defaults, options);
		this.options.active = false;
		this.init();
	}

	M7PlayerPtz.prototype = {
		init: function init() {
			console.log('M7PlayerPtz init');
			var t = this;
			this.$element.on('mouseup', function (e) {
				if (t.options.active) {
					console.log('M7PlayerPtz click mouseup');
					t._mouseup(e);
				}
			}).on('click', function (e) {
				// Не передаем клик плееру
				e.preventDefault();
				e.stopPropagation();
			}).on('mousedown', function (e) {
				if (t.options.active) {
					console.log('M7PlayerPtz click mousedown');
					t._mousedown(e);
				}
			}).on('mousemove', function (e) {
				if (t.options.active) {
					t._mousemove(e);
				}
			});
		},

		active: function active(data) {
			if (typeof data === 'undefined') {
				return this.options.active;
			}
			this.options.active = data == true;
			console.log('M7PlayerPtz active', this.options.active);
			if (this.options.active) {
				// Рисовать ли красный крестик в центре
				if (this.options.ptzNode.centerPanTiltSupport) {
					var $centerGlass = $('<div>').addClass('centerGlass text-center').css({
						'position': 'absolute'
					});
					$('<span>').css({
						'color': 'red',
						'font-size': '24px',
						'text-shadow': '#000 1px 1px 1px'

					}).append('+').appendTo($centerGlass);
					this.$element.html('').append($centerGlass);
					//this.$element.find('.centerGlass').position({
					$centerGlass.position({
						of: this.$element
					});
				}
				// Вид курсора мыши
				if (this.options.ptzNode.centerPanTiltSupport || this.options.ptzNode.absoluteZoomPositionSupport) {
					this.$element.css('cursor', 'crosshair');
				} else if (this.options.ptzNode.relativePanTiltTranslationSupport) {
					this.$element.html('');
					this.$element.css('cursor', 'pointer');
				}
			} else {
				this.$element.html('');
				this.$element.css('cursor', 'inherit');
			}
			this.options.active = data == true;
			return this.$element;
		},

		ptzNode: function ptzNode(data) {
			if (typeof data === 'undefined') {
				return this.options.ptzNode;
			}
			this.options.ptzNode = $.extend({}, defaults.ptzNode, data);
			return this.$element;
		},

		_sendZoomboxEvent: function _sendZoomboxEvent() {
			var zoombox = this.$element.find('.m7-zoombox');
			if (zoombox.length > 0) {
				this.$element.trigger('ptzZoom', {
					x: zoombox.position().top,
					y: zoombox.position().left,
					width: zoombox.width(),
					height: zoombox.height()
				});
				delete this.x;
				delete this.y;
			}
		},

		_makeZoombox: function _makeZoombox(x, y) {
			var t = this;
			console.log('_makeZoombox');
			this._deleteZoombox();
			this.$element.append('<div class="m7-zoombox"></div>').find('.m7-zoombox').css({
				top: Math.min(this.y, y),
				left: Math.min(this.x, x),
				width: Math.abs(this.x - x),
				height: Math.abs(this.y - y)
			}) /*.on("mouseup", function (ev) { // Клик по zoombox - шлем событие
      console.log('zoombox click');
          	ev.stopPropagation();
      t._sendZoomboxEvent();
      })*/;
		},

		_deleteZoombox: function _deleteZoombox() {
			console.log('_deleteZoombox');
			$('.m7-zoombox').remove();
		},

		_makeZoomboxCenter: function _makeZoomboxCenter(x, y) {
			this._deleteZoombox();
			console.log('_makeZoomboxCenter');
			var t = this;
			var width = 2 * Math.abs(this.x - x);
			var height = 2 * Math.abs(this.y - y);
			// Координаты верхней левой точки
			var x0 = this.x - width / 2;
			var y0 = this.y - height / 2;
			var zX, zY, zW, zH;
			// Теперь вписывем заданный прямоугольник в прямоугольник, подобный подложке
			var aspect = this.$element.width() / this.$element.height();
			if (width > height * aspect) {
				// Вписываем высоту
				zW = width;
				zH = width / aspect;
				zX = x0;
				zY = y0 - (zH - height) / 2;
			} else {
				// Вписываем ширину
				zH = height;
				zW = height * aspect;
				zY = y0;
				zX = x0 - (zW - width) / 2;
			}
			$('<div>').addClass('m7-zoombox').css({
				top: Math.round(zY),
				left: Math.round(zX),
				width: Math.round(zW),
				height: Math.round(zH),
				'z-index': 100
			}) /*.on("mouseup", function (ev) { // Клик по zoombox - шлем событие
      console.log('zoombox click');
          	ev.stopPropagation();
      t._sendZoomboxCenterEvent();
      })*/.appendTo(this.$element);

			//this.$element.append('<div class="m7-zoombox"></div>').find('.m7-zoombox')
		},

		_sendZoomboxCenterEvent: function _sendZoomboxCenterEvent() {
			console.log('_sendZoomboxCenterEvent');
			var zoombox = this.$element.find('.m7-zoombox');
			if (zoombox.length > 0) {
				this.$element.trigger('ptzZoomCenter', {
					x: zoombox.position().left + zoombox.width() / 2,
					y: zoombox.position().top + zoombox.height() / 2,
					zoomFactor: this.$element.width() / zoombox.width(),
					width: this.$element.width(),
					height: this.$element.height()
				});
				delete this.x;
				delete this.y;
				this._deleteZoombox();
			}
		},

		_mousedown: function _mousedown(e) {
			this._mousePressed = true;
			var x = e.pageX - this.$element.offset().left;
			var y = e.pageY - this.$element.offset().top;
			var t = this;
			this._deleteZoombox();
			console.log("mouse down: " + x + ", " + y);
			t.x = x;
			t.y = y;
		},

		_mouseup: function _mouseup(e) {
			var t = this;
			this._mousePressed = false;
			var x = e.pageX - this.$element.offset().left;
			var y = e.pageY - this.$element.offset().top;
			console.log({
				func: "ptz click mouseup",
				event: e
			});
			if ($('.m7-zoombox').length > 0) {
				t._sendZoomboxCenterEvent();
			} else if (this.options.ptzNode.centerPanTiltSupport) {
				clearTimeout(this.mouseDownTimeout);
				if (this.$element.find('.m7-zoombox').length == 0) {
					this.$element.trigger('ptzCenter', {
						x: x,
						y: y,
						width: this.$element.width(),
						height: this.$element.height()
					});
					delete this.x;
					delete this.y;
				}
			} /*else if (this.options.ptzNode.absoluteZoomPositionSupport) {
     		clearTimeout(this.mouseDownTimeout);
     		delete this.mouseDownTimeout;
     		var shiftX = (x - this.$element.width() / 2)/ this.$element.width();
     		var shiftY = (this.$element.height() / 2 - y) / this.$element.height();
     		console.log('ptzAbsoluteMove', shiftX, shiftY);
     		this.$element.trigger('ptzAbsoluteMove', {
     			shiftX: shiftX, 
     			shiftY: shiftY,
     		});				
     	}*/else if (this.options.ptzNode.relativeZoomTranslationSupport && typeof this.x !== "undefined" && typeof this.y !== "undefined" && this.x !== x && this.y !== y) {
					console.log("ZoomboxEvent second point: " + x + ", " + y);
					this._makeZoombox(x, y);
					this._sendZoomboxEvent();
				} else if (this.options.ptzNode.relativePanTiltTranslationSupport) {
					clearTimeout(this.mouseDownTimeout);
					delete this.mouseDownTimeout;
					var shiftX = (x - this.$element.width() / 2) / this.$element.width();
					var shiftY = (this.$element.height() / 2 - y) / this.$element.height();
					console.log('ptzMove');
					this.$element.trigger('ptzMove', {
						shiftX: shiftX,
						shiftY: shiftY
					});
				} else {
					console.log("Unsupported operation");
				}
		},

		_mousemove: function _mousemove(e) {
			var t = this;
			t.$element.trigger('playerMouseMove', e);
			if (this._mousePressed) {
				var x = e.pageX - this.$element.offset().left;
				var y = e.pageY - this.$element.offset().top;
				if (this.options.ptzNode.areaZoom) {
					if (typeof this.x !== "undefined" && typeof this.y !== "undefined" && x !== this.x && y !== this.y) {
						this._makeZoomboxCenter(x, y);
					}
				} else if (this.options.ptzNode.relativeZoomTranslationSupport) {
					if (typeof this.x !== "undefined" && typeof this.y !== "undefined") {
						this._makeZoombox(x, y);
					}
				}
			}
		}
	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = ['active', 'ptzNode'];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new M7PlayerPtz(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof M7PlayerPtz && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof M7PlayerPtz && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * m7-player-simple 0.1
 * 
 * Просто заготовка для плагинов m7-player
 * 
 * Author: Alexander Ivanov, ALGONT, 2017
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'm7PlayerSimple',
	    defaults = {};

	function M7PlayerSimple(element, options) {
		this.$element = $(element);
		this.options = $.extend({}, defaults, options);
		this.init();
	}

	M7PlayerSimple.prototype = {
		init: function init() {
			var t = this;
		}

	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = [];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new M7PlayerSimple(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof M7PlayerSimple && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof M7PlayerSimple && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * m7-player-techinfo 0.1
 * 
 * Показываем отладочную информацию поверх видео
 * 
 * Author: Alexander Ivanov, ALGONT, 2017
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'm7PlayerTechinfo',
	    defaults = {
		frequency: 1000 // мс, частота обновления информационного слоя 
	};

	function M7PlayerTechinfo(element, options) {
		this.$element = $(element);
		this.$player = this.$element.hasClass('m7Player') ? this.$element : this.$element.closest('.m7Player');
		this.options = $.extend({}, defaults, options);
		this.init();
	}

	M7PlayerTechinfo.prototype = {
		init: function init() {
			var t = this;
			t.$debugPane = null;
			console.log('m7PlayerTechinfo init');
		},

		show: function show() {
			//console.log('m7PlayerTechinfo show');
			var t = this;
			t.hide();
			$('<div>').addClass('tech-info glass-layer overlay').css({
				background: 'black',
				opacity: 0.6,
				padding: 6
			}).appendTo(t.$element);

			t.$debugPane = $('<div>').addClass('tech-info glass-layer overlay').css({
				color: '#00ff00',
				padding: 6
			}).appendTo(t.$element);

			t.updateInfo();

			/*t.$currentTime = $('<div>')
   	.append('currentTime: <span>0</span>')
   	.appendTo(t.$debugPane)
   	.find('span');
   t.$delay = $('<div>')
   	.append('Задержка: <span>0</span>')
   	.appendTo(t.$debugPane)
   	.find('span');
   t.$queue = $('<div>')
   	.append('Очередь: <span>0</span>')
   	.appendTo(t.$debugPane)
   	.find('span');
   		// Опциональные параметры (скрыты изначально)
   		t.$shift = $('<div>')
   	.append('Shift: <span></span>')
   	.appendTo(t.$debugPane)
   	.find('span')
   	.hide();
   		t.$mseEvents = $('<div>')
   	.append('Events: <span></span>')
   	.appendTo(t.$debugPane)
   	.find('span')
   	.hide();
   t.$mseAppendedData = $('<div>')
   	.append('AppendedData: <span></span>')
   	.appendTo(t.$debugPane)
   	.find('span')
   	.hide();
   t.$mseUpdating = $('<div>')
   	.append('Updating: <span></span>')
   	.appendTo(t.$debugPane)
   	.find('span')
   	.hide();
   
   /*t.$streamTime = $('<div>')
   	.append('streamTime: <span></span>')
   	.appendTo(t.$debugPane)
   	.find('span')
   	.hide();*/

			/*t.$bufferState = $('<div>')
   	.css('padding-top', 10)
   	.appendTo(t.$debugPane)
   	.hide();
   
   t.$playbackQuality = $('<div>')
   	.css('padding-top', 10)
   	.appendTo(t.$debugPane)
   	.hide();
   		t.shift = t.$player.m7Player('getTimeShift');
   console.log('techinfo getTimeShift', t.shift);
   if (t.shift) {
   	t.$shift.html(t.shift).show();
   }*/

			t.$player.on('m7PlayerTimeChange.' + pluginName, function (e, currentTime, duration) {
				t.debugInfo.currentTime = currentTime;
				/*t.$currentTime.html(currentTime);
    if (t.$streamTime) {
    	t.$streamTime.html(parseFloat(currentTime) + parseFloat(t.shift)).show();
    }*/
			}).on('m7DelayChange.' + pluginName, function (e, delay, correctionsCount, lastRewindToEnd) {
				t.debugInfo.delay = delay;
				t.debugInfo.correctionsCount = correctionsCount;
				t.debugInfo.lastRewindToEnd = lastRewindToEnd;
				//t.$delay.html(delay + ' (коррекций: ' + correctionsCount + ')');
			}).on('m7PlayerQueueChanged.' + pluginName, function (e, queue) {
				//console.log('m7PlayerQueueChanged', queue);
				t.debugInfo.queue = queue;
				//t.$queue.html(queue);
			}).on('m7PlayerMseStatus.' + pluginName, function (e, counters) {
				t.debugInfo.mse = 'u.start: ' + counters.updatestart + ' u: ' + counters.update + ' u.end: ' + counters.updateend + ' err: ' + counters.error + ' abort: ' + counters.abort;
				/*t.$mseEvents.html('u.start: ' + counters.updatestart + ' u: ' +  counters.update + ' u.end: ' + counters.updateend + ' err: ' + counters.error + ' abort: ' + counters.abort).show();
    t.$mseAppendedData.html(counters.appendData).show();
    t.$mseUpdating.html('On AppendData: ' + counters.updatingOnAppendData + ' On Update: ' + counters.updatingOnUpdate).show();*/
			}); /*.on('m7BufferChange.' + pluginName, function (e, bufferState) {
       /*t.$bufferState.html('').show();
       if (bufferState) {
       for (var key in bufferState) {
       	$('<div>')
       		.text(key + ': ' + bufferState[key])
       		.appendTo(t.$bufferState);
       }						
       }
       });*/

			/*if (t.$shift) {
   	t.$element.on('m7StreamTimeShiftReceived.' + pluginName, function (e, shift) {
   		t.shift = shift;
   		t.$shift.html(shift).show();
   	});                
   }*/
		},

		hide: function hide() {
			//this.$element.off();
			var t = this;
			this.$element.off('.' + pluginName);
			this.$element.find('.tech-info').remove();
			this.$debugPane = null;
			this.debugInfo = {};
		},

		state: function state(data) {
			if (typeof data === 'undefined' || data === "") {
				return this.$debugPane != null;
			}
			if (data == true) {
				this.show();
			} else {
				this.hide();
			}
		},

		toggle: function toggle() {
			if (this.$debugPane) {
				this.hide();
			} else {
				this.show();
			}
		},

		updateInfo: function updateInfo() {
			var t = this;
			//console.log('updateInfo $debugPane', t.debugInfo);
			if (this.$debugPane) {
				var html = '';
				if (t.debugInfo.currentTime) {
					var ct = Math.round(t.debugInfo.currentTime * 1000) / 1000 || 0;
					if (moment) {
						ct += ' - ' + moment(new Date() - t.debugInfo.currentTime * 1000).fromNow();
					}
					var lastErrorMessage = t.$player.m7Player('getLastErrorMessage');
					if (lastErrorMessage) {
						ct += ' (' + lastErrorMessage + ')';
					}
					html += '<div>currentTime: ' + ct + '</div>';
				}

				var correct = t.debugInfo.correctionsCount || 0;
				if (t.debugInfo.lastRewindToEnd) {
					correct += ', последняя была ' + moment(t.debugInfo.lastRewindToEnd).fromNow();
				}
				html += '<div>Коррекций: ' + correct + '</div>';

				/*var delay = t.debugInfo.delay || 0;
    html += '<div>Diff time: ' + delay + '</div>';*/

				/*var queue = t.debugInfo.queue || 0;
    html += '<div>Очередь: ' + queue + '</div>';*/

				if (t.debugInfo.mse) {
					html += '<div>MSE: ' + t.debugInfo.mse + '</div>';
				}

				//html += '<br>';
				var bufferState = t.$player.m7Player('getBufferInfo');
				console.log('getBufferInfo', bufferState);
				if (bufferState) {
					for (var key in bufferState) {
						html += '<div>' + key + ': ' + bufferState[key] + '</div>';
					}
				}

				//html += '<br>';
				var playbackQuality = t.$player.m7Player('getPlaybackQuality');
				if (playbackQuality) {
					for (var key in playbackQuality) {
						html += '<div>' + key + ': ' + playbackQuality[key] + '</div>';
					}
				}

				this.$debugPane.html(html);
				setTimeout(function () {
					t.updateInfo();
				}, t.options.frequency);
			}
		}

	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = ['state'];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new M7PlayerTechinfo(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof M7PlayerTechinfo && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof M7PlayerTechinfo && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * m7-player-title-temp 0.1
 * 
 * Показываем заголовок поверх видео (и скрываем по истечении времени)
 * 
 * Author: Alexander Ivanov, ALGONT, 2018
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'm7PlayerTitleTemp',
	    defaults = {
		duration: 5000
	};

	function m7PlayerTitleTemp(element, options) {
		this.$element = $(element);
		this.info = getContainerInfo(this.$element);
		this.options = $.extend({}, defaults, options);
		this.init();
	}

	m7PlayerTitleTemp.prototype = {
		init: function init() {
			this.titlePane = null;
			console.log('m7PlayerTitleTemp init', this.info);
		},

		show: function show() {
			if (typeof this.$element.m7PlayerTitle == 'function' && this.$element.m7PlayerTitle('state')) {
				return;
			}
			console.log('m7PlayerTitleTemp show');
			this.info = getContainerInfo(this.$element);
			if (!this.info.title) {
				return;
			}
			this.hide();
			$('<div>').addClass('title-info').css({
				top: 0,
				left: 0
				//'font-weight': 'bold'
			}).html(this.info.title).appendTo(this.$element);
			if (this.options.duration) {
				this.timeoutHide = setTimeout(function (context) {
					context.hide();
				}, this.options.duration, this);
			}
			this.titlePane = true;
		},

		hide: function hide() {
			clearTimeout(this.timeoutHide);
			this.$element.find('.title-info').remove();
			this.titlePane = null;
		}

	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = ['state'];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new m7PlayerTitleTemp(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof m7PlayerTitleTemp && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof m7PlayerTitleTemp && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * m7-player-title 0.1
 * 
 * Показываем заголовок и id потока поверх видео
 * 
 * Author: Alexander Ivanov, ALGONT, 2017
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'm7PlayerTitle',
	    defaults = {};

	function M7PlayerTitle(element, options) {
		this.$element = $(element);
		this.info = getContainerInfo(this.$element);
		this.options = $.extend({}, defaults, options);
		this.init();
	}

	M7PlayerTitle.prototype = {
		init: function init() {
			var t = this;
			t.$titlePane = null;
			console.log('m7PlayerTitle init', this.info);
		},

		show: function show() {
			if (typeof this.$element.m7PlayerTitleTemp == 'function') {
				this.$element.m7PlayerTitleTemp('hide');
			}
			console.log('m7PlayerTitle show');
			this.info = getContainerInfo(this.$element);
			this.hide();
			$('<div>').addClass('title-info').css({
				top: 0,
				left: 0
				//'font-weight': 'bold'
			}).html(this.info.title).appendTo(this.$element);
			$('<div>').addClass('title-info').css({
				bottom: 0,
				right: 0,
				color: '#ffffff'
			}).html('#' + this.info.streamid).appendTo(this.$element);
			this.$titlePane = true;
		},

		hide: function hide() {
			this.$element.find('.title-info').remove();
			this.$titlePane = null;
		},

		state: function state(data) {
			console.log('m7PlayerTitle state', data);
			if (typeof data === 'undefined' || data === "") {
				return this.$titlePane != null;
			}
			if (data == true) {
				this.show();
			} else {
				this.hide();
			}
		},

		toggle: function toggle() {
			if (this.$titlePane) {
				this.hide();
			} else {
				this.show();
			}
		}

	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = ['state'];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new M7PlayerTitle(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof M7PlayerTitle && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof M7PlayerTitle && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * m7-player-watchdog 0.1
 * 
 * Наблюдение за m7Player
 * 
 * Author: Alexander Ivanov, ALGONT, 2018
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'm7PlayerWatchdog',
	    defaults = {
		debug: false,
		timeout: 3000, // мс - переодичность проверки
		maxDelay: 2.5 // с - максимальная расчетная задержка плеера
	};

	function m7PlayerWatchdog(element, options) {
		this.$element = $(element);
		this.options = $.extend({}, defaults, options);
		this.init();
	}

	m7PlayerWatchdog.prototype = {
		init: function init() {
			console.log('m7PlayerWatchdog.init', this.options);
			this.start();
		},

		start: function start() {
			this.stop();
			this.pid = setTimeout(function (that) {
				that.check();
			}, this.options.timeout, this);
		},

		stop: function stop() {
			if (this.pid) {
				clearTimeout(this.pid);
				delete this.pid;
			}
		},

		check: function check() {
			console.log('m7PlayerWatchdog.check');
			try {
				$('.m7Player').m7Player('checkAlive');
			} catch (err) {
				console.error("m7PlayerWatchdog.check error", err);
			}
			this.start(); // запуск следующей отложенной проверки						
		}

	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = [];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new m7PlayerWatchdog(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof m7PlayerWatchdog && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof m7PlayerWatchdog && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * m7-player 0.2
 * 
 * Author: Alexander Ivanov, ALGONT, 2017
 *
 * Генерирует события:
 *
 * m7DelayChange - изменение задержки
 * m7PlayerSourceChange - изменение src
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'm7Player',
	    defaults = {
		alignVideoX: 'center', // left, center, right
		alignVideoY: 'center', // top, center, bottom
		analytics: false,
		autoplay: false,
		//backgroundColor: '#000',
		baseRetryDelay: 15, // сек
		cache: 0, // мс, размер агрегированного фрагмента потока перед передачей плееру
		clickControl: false,
		clickControlAnimation: 'clicked', // 'always', 'clicked' or false
		controls: false,
		debugRegim: false,
		delayControl: 0, // сек, максимальный накопленный буфер при воспроизведении живых потоков для коррекции. 0 - откл. коррекции
		engine: 'm7PlayerHtml5',
		fastReconnect: true, // опция первого реконнекта без крутилки		
		maxDelay: 0, // сек, максимальная расчетная задержка для m7PlayerWatchdog
		maxFluctuation: 3, // сек
		mode: 'stable',
		muted: false,
		playBtn: false, // DEPRECATED, use clickControl
		playbackRate: 1,
		playlist: [],
		playlistCurrentItem: -1,
		retryOnError: true,
		retryCallback: null, // Если колбэк не задан, просто пытаемся запустить play
		src: "",
		stalledTimeout: 3000, // задержка в мс, допустимая для нахождения плеера в состоянии ожидания видеоданных		
		statistics: false,
		timeoutToHideChannelName: 5000,
		volume: 1,
		watchdogTimeout: 0, // мс, 0 - watchdog отключен
		wheelZoomable: false,
		workersCount: 1,
		zoomCutMode: false
	};

	function M7Player(elementContainer, options) {
		//console.log('M7Player create', JSON.parse(JSON.stringify(defaults)), JSON.parse(JSON.stringify(options)));
		console.log('M7Player create', options);
		this.options = $.extend(true, {}, defaults, options); // true - это важно, иначе свойство playlist почему-то расшаривался между объектами		
		// Параметры командной строки перекрывают одноименные параметры запуска M7Player
		this.options.cache = getUriParam('cache') || this.options.cache;
		this.options.debugRegim = getUriParam('debugRegim') || this.options.debugRegim;
		this.options.workersCount = getUriParam('workersCount') || this.options.workersCount;
		this.options.stalledTimeout = getUriParam('waitingTimeout') || this.options.stalledTimeout;
		this.options.wrongSocket = getUriParam('wrongSocket') || false;
		this.$elementContainer = $(elementContainer);
		this.$elementContainer.addClass('m7Player');
		if (this.options.backgroundColor) {
			this.$elementContainer.css({
				backgroundColor: this.options.backgroundColor
			});
		}
		this.$elementContainer.off();
		this.$elementContainer.find('.m7PlayerVideoContainer').off();
		this.$element = $('<div>').addClass('m7PlayerVideoContainer');
		//			.appendTo(this.$elementContainer);

		do {
			this.playerSelector = 'id' + new Date().getTime();
		} while ($('.m7Player.' + this.playerSelector).length > 0);
		this.$elementContainer.addClass(this.playerSelector);
		this.$elementContainer.attr('data-id', this.playerSelector);
		this.$elementContainer.html(this.$element);
		this.init();
		this.lastDelayStart = new Date();
		this.lastErrorMessage = '';
		this.errorsCount = 0; // только растет
		this.delayCount = 0; // сбрасывается при удачном старте видео
		this.lastErrorMessage = '';
		//this._state; // Состояния плеера. Варианты
		// init - инициализация
		// start - попытка начать проигрывание
		// playing - играет
		// paused - на паузе
		// delayStart - режим отложенного старта
	}

	M7Player.prototype = {
		init: function init() {
			console.log('M7Player init', this.options);
			var t = this;
			this.state('init');
			this.fullscreenState = false;
			this.lastRewindToEnd = 0;
			//this.aspectRatio;
			t.watchdog(true);

			// Обработчики событий			

			/*this.$element.on('mousewheel DOMMouseScroll', function () {
   	console.log('$element mousewheel');
   });*/

			// Листенер перехода в полноэкранный режим. Есть мнение, что этот листенер менает сборщику мусора удалить объект
			// и создает утечку памяти. Требуется повестить глобальный листенер, который будет создавать триггеры для всех потенциальных
			// слушателей!
			$(document).on('mozfullscreenchange.M7Player webkitfullscreenchange.M7Player fullscreenchange.M7Player', function (e) {
				var fullscreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
				var $el = t.$elementContainer.parent();
				//console.log('on fullscreenchange', fullscreen, $el.hasClass('m7-fullscreen'), $el);

				// Бывает, что выход из полноэкранного режима происходит по клавише Esc
				if (!fullscreen && $el.hasClass('m7-fullscreen')) {
					t.fullscreen(false);
				}
			});

			t.$elementContainer.off('.' + pluginName).on('contextmenu.M7Player', function (e) {
				console.log('click contextmenu');
				e.preventDefault();
				e.stopPropagation();
			}).on('click.M7Player', function () {
				console.log('click player', t.$elementContainer);
				t.$elementContainer.trigger('playerClick');
			}) /*.on('changeContainer.M7Player', function (event, obj) {
      console.log('changeContainer event', obj);
      //
      })*/.on('m7PlayerDelayDone.M7Player', function () {
				t.state('start');
				sendLog('m7PlayerDelayDone.M7Player', getVideoContainerInfo(t.$video));
				console.log('m7PlayerDelayDone.M7Player', t.options.retryCallback);
				if (typeof t.options.retryCallback == 'function') {
					//console.log('try to run retryCallback this._state=' + t._state);
					var answer = t.options.retryCallback();
					if (typeof t[answer] == 'function') {
						t[answer]();
					}
				} else {
					t.src(t.options.src);
					//if (!t.options.autoplay) {
					t.play();
					//}						
				}
			});

			this.$element.off('.' + pluginName).on('m7PlayerClick.M7Player', function (e) {
				//console.log('m7PlayerVideoContainer m7PlayerClick', e);
				if (t.options.clickControl) {
					t.togglePlay(true);
				}
			}).on('m7PlayerTimeChange.M7Player', function (e, currentTime, secondsToBufferEnd, duration) {
				var now = new Date();
				if (!t.playStart) {
					t.playStart = now - currentTime * 1000;
				}
				t.currentTime = currentTime;
				var delay = Math.round(now - t.playStart - currentTime * 1000) / 1000;
				/*if (delay < 0) {
    	delay = 0;
    	t.playStart = 0;
    }*/
				//console.log('m7PlayerTimeChange', currentTime, duration, delay);
				if (delay != t.delay) {
					t.delay = delay;
					t.$element.trigger('m7DelayChange', [delay, t.delayCorrections, t.lastRewindToEnd]);
				}

				/*var fromEndOfBuf = t.video.buffered.end(t.video.buffered.length - 1) - currentTime;
    if (t.options.delayControl && (fromEndOfBuf > t.options.delayControl) && (now - t.lastRewindToEnd > 10000)) {
    	//t.rewindToEnd();
    }*/
				t.$elementContainer.trigger('playerTimeChanged', [currentTime * 1000, t.options.playlistCurrentItem]);
			}).on('m7PlayerPlay.M7Player', function (e) {
				console.log('m7PlayerPlay');
				t.playStart = 0;
				t.state('play');
				t.$elementContainer.trigger('playerPlaying');
			}).on('m7PlayerPlaying.M7Player', function (e) {
				console.log('m7PlayerPlaying');
				t.$elementContainer.removeClass('error-video');
				sendLog('m7PlayerPlaying', getVideoContainerInfo(t.$video));
				t.delayCount = 0;
				t.show();
			}).on('m7PlayerPause.M7Player', function (e) {
				console.log('m7PlayerPause');
				t.state('pause');
				//t.watchdog(false);
				t.$elementContainer.trigger('playerPaused');
			}).on('m7PlayerResolution.M7Player', function (e, width, height) {
				console.log('m7PlayerResolution', width, height);
				t.stream = t.stream || {};
				var needResetZoom = t.stream.width != width || t.stream.height != height;
				t.stream.width = width;
				t.stream.height = height;
				if (needResetZoom) {
					t.resetZoom();
				}
			}).on('m7PlayerResize.M7Player', function (e, width, height) {
				/*if (t.options.playBtn) {
    	t.$element.m7PlayerPlaybtn({}).m7PlayerPlaybtn('show');
    }*/
				t.analytics(t.options.analytics);
			}).on('m7PlayerVolumeChange', function (e, volume, mute) {
				console.log('m7PlayerVolumeChange', {
					volume: volume,
					mute: mute
				});
				t.$elementContainer.trigger('volumeChanged', [mute, volume]);
			}).on('m7PlayerStateChange', function (e, state) {
				/*console.log('m7PlayerStateChange', state);
    if (state == 'start') {
    	t.$elementContainer.trigger('playerPlaying'); // для очистки
    }*/
			}).on('m7PlayerEndReached.M7Player', function (e) {
				console.log('m7PlayerEndReached', t.options.playlistCurrentItem, t.options.playlist.length);
				if (t.options.playlistCurrentItem + 1 >= t.options.playlist.length) {
					t.$elementContainer.trigger('playerEndReached');
					/*if (t.options.delayControl) {
     	t.$element.trigger('m7PlayerError', 'm7PlayerEndReached');
     }*/
				} else {
					t.playlistItemLoad(t.options.playlistCurrentItem + 1);
					t.play();
				}
			}).on('m7PlayerRateChange.M7Player', function (e, rate) {
				console.log('m7PlayerRateChange', rate);
				t.options.playbackRate = rate;
			}).on('m7BufferChange', function (e, bufferInfo) {
				//console.log('M7Player buffer change', e);
				var now = new Date();
				if (bufferInfo.fromEndOfBuffer < -1) {
					// Остаток буфера не должен быть отрицательным, что-то не так
					console.log('Strange fromEndOfBuffer', bufferInfo);
					if (t.buffControl) {
						if (t.buffControl.bufferedEnd == bufferInfo.bufferedEnd) {
							t.buffControl.count++;
						} else {
							t.buffControl.count = 1;
							t.buffControl.bufferedEnd = bufferInfo.bufferedEnd;
						}
						if (t.buffControl.count > 3) {
							t.buffControl = null;
							console.log('Strange fromEndOfBuffer - m7PlayerError');
							t.$element.trigger('m7PlayerError', 'Strange fromEndOfBuffer');
						}
					} else {
						t.buffControl = {
							count: 1,
							bufferedEnd: bufferInfo.bufferedEnd
						};
					}
					//t.$element.trigger('m7PlayerError', [e, 'Strange fromEndOfBuffer']);
					sendLog('Strange fromEndOfBuffer', bufferInfo.fromEndOfBuffer, getVideoContainerInfo(t.$video));
				} else {
					t.buffControl = null;
					if (t.options.delayControl && bufferInfo.fromEndOfBuffer && bufferInfo.fromEndOfBuffer > t.options.delayControl
					//	|| (now - t.lastRewindToEnd > 3600000 * Math.floor(Math.random() + 1))) 
					&& now - t.lastRewindToEnd > 15000) {
						console.log('Start correction', {
							now: now,
							fromEndOfBuffer: bufferInfo.fromEndOfBuffer,
							delayControl: t.options.delayControl
						});
						t.rewindToEnd();
						t.play();
					} else {
						//console.log('###', now - t.lastRewindToEnd);
					}
				}
				/*				}).on('m7PlayerPlaybtnClick.M7Player', function (e, mode) {
    					if (mode == 'play') {
    						t.play();
    					} else if (mode == 'pause') {
    						t.pause();
    					} else {
    						console.error('m7PlayerPlaybtnClick unknown mode: ' + mode);
    					}*/
			}).on('m7PlayerError.M7Player', function (e, message) {
				t.watchdog(false);
				console.error('m7PlayerError', message, e);
				t.lastErrorMessage = message || '';
				sendLog('m7PlayerError', getVideoContainerInfo(t.$video));
				t.delayStart();
				// playerEncounteredError вызываем только в случае крутилки, не для быстрого переподключения
				//t.$elementContainer.trigger('playerEncounteredError');
			}).on('m7PlayerMetadataEvent.M7Player', function (e, metadata, num) {
				//console.log('m7PlayerMetadataEvent', t.options.analytics, metadata, num);
				if (t.options.analytics) {
					t.$element.m7PlayerAnalytics('show', {
						metadata: metadata,
						num: num
					});
				}
			}).on('mousewheel DOMMouseScroll', function (event) {
				//console.log(event);
				if (t.options.wheelZoomable && !event.ctrlKey & !event.shiftKey) {
					if (t.$element.find('a-scene').length) {
						t.$element.m7PlayerAframe('scale', event);
					} else {
						t.wheelZoom(event);
					}
					return false;
				}
			});
			// На этом уровне метаданные, если потребуются, должны приходить уже распарсенные 
			// и в их пока момент показа на плеере
			/*.on('metadata', function (e, metadata, timestamp) {
   	console.log('metadata event', metadata, timestamp);
   });*/

			if (this.options.analytics) {
				this.analytics(true);
			}

			if (this.options.src) {
				this.src(this.options.src);
			}
		},

		addMetadata: function addMetadata(metadata) {
			console.log('addMetadata', metadata);
			this.$element[this.options.engine]('addMetadata', metadata);
		},

		addToPlaylist: function addToPlaylist(src) {
			this.options.playlist.push(src);
			if (this.options.src == '') {
				this.playlistItemLoad(0);
			}
			console.log('addToPlaylist', src, this.options.playlist);
		},

		analytics: function analytics(data) {
			if (typeof data === 'undefined' || data === "") {
				return this.options.analytics == true;
			}
			this.options.analytics = data == true;
			if (this.options.analytics) {
				this.$element.m7PlayerAnalytics({});
			} else {
				if (typeof this.$element.m7PlayerAnalytics == 'function') {
					this.$element.m7PlayerAnalytics('hide');
				}
			}
			this.checkAnalytics();
		},

		analyticsShowType: function analyticsShowType(module, state) {
			this.$element.m7PlayerAnalytics({}).m7PlayerAnalytics('stateModule', {
				module: module,
				state: state
			});
		},

		animAction: function animAction(action) {
			this.$elementContainer.find('.anim-action').remove();
			if (action == 'play') {
				$('<div>').addClass('anim-action img-play centerAbs').appendTo(this.$elementContainer).animate({
					opacity: 0
				}, {
					step: function step(now, fx) {
						var size = 1 - now + 1;
						$(this).css('transform', 'scale(' + size + ')');
					},
					duration: 600,
					always: function always() {
						$(this).remove();
					}
				});
			} else if (action == 'pause') {
				$('<div>').addClass('anim-action img-pause centerAbs').appendTo(this.$elementContainer).animate({
					opacity: 0
				}, {
					step: function step(now, fx) {
						var size = 1 - now + 1;
						$(this).css('transform', 'scale(' + size + ')');
					},
					duration: 600,
					always: function always() {
						$(this).remove();
					}
				});
			}
		},

		// Проверка плеера для watchdog
		checkAlive: function checkAlive() {
			if (!this.options.watchdogTimeout || !this.options.src) {
				return; // этот плеер не проверяется watchdog
			}
			console.log('M7Player.checkAlive', this.playerSelector);
			/*this.lastState = this.lastState || {
				frames: 0,
				position: -1,
				positionCountRetry: 0
			};*/
			var quality = this.getPlaybackQuality();
			var acted = false; // признак, что к этому плееру применялись действия в этой итерации
			if (quality) {
				var frames = quality.totalVideoFrames || quality.webkitDecodedFrameCount || 0;
				console.log('M7Player.checkAlive frames=', frames, this.lastState.frames);
				// Проверка зависшего видео (застывший счетчик фреймов)
				if (frames == this.lastState.frames) {
					// показания не изменились с прошлой проверки
					if (!this.lastState.wasRewindToEnd) {
						// не пытались еще перематывать
						this.rewindToEnd();
						this.lastState.wasRewindToEnd = true;
						console.log('M7Player.checkAlive frames stalled: rewindToEnd', this.playerSelector);
						acted = true;
					} else if (frames == 0 || this.lastState.countRetry > 2) {
						// попытка перемотки не помогла, генерируем ошибку						
						this.lastState.wasRewindToEnd = false;
						this.testError('frames freeze, watchdog');
						console.log('M7Player.checkAlive frames stalled: sended error', this.playerSelector);
						acted = true;
					} else {
						var countRetry = this.lastState.countRetry || 0;
						this.lastState.countRetry = countRetry + 1;
						acted = true;
						console.log('M7Player.checkAlive frames stalled: +1 countRetry', this.playerSelector, countRetry);
					}
				} else {
					this.lastState.frames = frames; // запоминаем текущее значение
					this.lastState.countRetry = 0;
				}
			} else {
				console.log('M7Player.checkAlive NO quality', this.playerSelector);
			}

			if (!acted && this.position() > 300) {
				var now = new Date();
				var lastRewindToEnd = this.getLastRewindToEnd();
				var timeFromLastRewindToEnd = now - lastRewindToEnd;
				// Проверяем буфер спустя 10-20 минут после последней коррекции
				if (timeFromLastRewindToEnd > 600000 * (Math.random() + 1)) {
					var bufferInfo = this.getBufferInfo();
					// Минимальное значение буфера не должно превышать 400 мс 							
					if (bufferInfo && bufferInfo.minBuffer > 0.4) {
						console.log('M7Player.checkAlive tuning rewindToEnd', {
							timeFromLastRewindToEnd: timeFromLastRewindToEnd,
							bufferInfo: bufferInfo
						});
						this.rewindToEnd();
					}
				}
			} else {
				console.log('M7Player.checkAlive position() < 300', this.position());
			}

			if (!acted && this.position() == this.lastState.position) {
				this.lastState.positionCountRetry++;
				if (this.lastState.positionCountRetry > 2) {
					this.lastState.positionCountRetry = 0;
					console.log('M7Player.checkAlive position stopped ', this.position());
					this.testError('position stopped');
					acted = true;
				}
			} else {
				this.lastState.positionCountRetry = 0;
				this.lastState.position = this.position();
			}

			// Проверка расчетной задержки
			/*if (!acted && this.options.maxDelay > 0) {
   	// Проверка задержки
   	var delay = this.getDelay();
   	if (delay && Math.abs(delay) > this.options.maxDelay) {
   		console.log('M7Player.checkAlive delay > ' + this.options.maxDelay, delay);
   		this.testError('задержка');
   		acted = true;
   	}											
   }*/
		},

		checkAnalytics: function checkAnalytics() {
			console.log('M7Player.checkAnalytics', this.options.analytics);
			if (this.options.analytics) {
				this.$element.trigger('analyticsChanged', ["on"]);
			} else {
				this.$element.trigger('analyticsChanged', ["off"]);
			}
		},

		checkStatistics: function checkStatistics() {
			console.log('M7Player.checkStatistics', this.options.statistics);
			if (this.options.statistics) {
				this.$element.trigger('statisticsChanged', ["on"]);
			} else {
				this.$element.trigger('statisticsChanged', ["off"]);
			}
		},

		clear: function clear() {
			// Реинициализация плеера (например, перед открытием другого видео)
			console.log('M7Player.clear');
			this.delayStop();
			this.delay = 0; // сек, задержка
			this.delayCorrections = 0; // счетчик коррекций
			this.lastRewindToEnd = 0; // время последней коррекции
			this.$element[this.options.engine]('clear'); // 03.08.2018, Иванов, проблема с переключением по реакции
			if (typeof this.$element.m7PlayerAnalytics == 'function') {
				this.$element.m7PlayerAnalytics('clear');
			}
			/* 
   Иванов:
   Следующий дестрой необходим, иначе при повторном использовании плеера не подгружаются метаданные (20.11.18)
   Ранее дестрой был закоменчен с сообщением об утечке памяти, нужно будет проверить
   */
			if (this.$element[this.options.engine]) {
				this.$element[this.options.engine]('destroy');
			}
		},

		clearPlaylist: function clearPlaylist() {
			this.pause();
			this.options.playlist = [];
			this.options.playlistItem = -1;
			this.options.src = '';
		},

		debugInfo: function debugInfo(data) {
			var state = this.$elementContainer.m7PlayerTechinfo({}).m7PlayerTechinfo('state');
			if (typeof data === 'undefined' || data === "") {
				return state;
			}
			this.$elementContainer.m7PlayerTechinfo({}).m7PlayerTechinfo('state', data);
		},

		delayStart: function delayStart() {
			console.log('M7Player.delayStart', this.options.src);
			var t = this;

			// Показываем название канала даже для проблемных ячеек
			t.$elementContainer.m7PlayerTitleTemp({
				duration: t.options.timeoutToHideChannelName
			}).m7PlayerTitleTemp('show');

			/*console.log('delayStart', {
   	'state': t.state(),
   	'retryOnError': t.options.retryOnError
   });*/

			if (typeof this.$element.m7PlayerAnalytics == 'function') {
				this.$element.m7PlayerAnalytics('clear');
			}

			if (!t.options.retryOnError) {
				return;
			}

			var now = new Date();
			var timeFromLastDelay = now - this.lastDelayStart;
			sendLog('run delayStart', {
				fastReconnect: this.options.fastReconnect,
				delayCount: this.delayCount,
				timeFromLastDelay: timeFromLastDelay,
				condition: this.options.fastReconnect && this.delayCount === 0 && timeFromLastDelay > 30000
			}, getVideoContainerInfo(t.$video));
			if (this.options.fastReconnect && this.delayCount === 0 && timeFromLastDelay > 15000) {
				t.state('delayStart');
				this.errorsCount++;
				this.delayCount++;
				// t.$element.trigger('M7PlayerEncounteredError', t.errorsCount);
				sendLog('try fast reconnect', {
					errorsCount: this.errorsCount
				}, getVideoContainerInfo(t.$video));
				this.$elementContainer.trigger('m7PlayerDelayDone');
				this.lastDelayStart = now;
			} else if (t.state() != 'delayStart') {
				t.hideVideo();
				t.$elementContainer.addClass('error-video');

				sendLog('try delay reconnect', {
					fastReconnect: this.options.fastReconnect,
					delayCount: this.delayCount,
					timeFromLastDelay: timeFromLastDelay
				}, getVideoContainerInfo(t.$video));
				t.state('delayStart');
				this.lastDelayStart = now;
				t.errorsCount++;
				this.delayCount++;
				t.$element.trigger('M7PlayerEncounteredError', t.errorsCount);
				t.$elementContainer.delayStart({
					baseRetryDelay: t.options.baseRetryDelay,
					maxFluctuation: t.options.maxFluctuation
				}).delayStart('show');
				// See m7PlayerDelayDone listener
			}
		},

		delayStop: function delayStop() {
			if (this.$elementContainer.delayStart) {
				this.$elementContainer.delayStart({
					baseRetryDelay: this.options.baseRetryDelay,
					maxFluctuation: this.options.maxFluctuation
				}).delayStart('hide');
			}
		},

		destroy: function destroy() {
			console.log('M7Player destroy');
			this.clear();
			//this.$elementContainer.off('.M7Player'); // нельзя, не работают клики
			this.$elementContainer.removeData('plugin-' + pluginName);
			this.$element.html('');
		},

		draggable: function draggable(state) {
			var t = this;
			if (!this.$element.draggable) {
				return;
			}
			if (state) {
				this.$element.draggable({}).on('drag', function (e, ui) {
					console.log('on drag');
					var shift = ui.position.left - ui.originalPosition.left;
					if (shift > 0) {
						// вправо
						if (ui.position.left > 0) {
							ui.position.left = 0;
						}
					} else {
						// влево
						if (t.$elementContainer.width() - t.$element.width() > ui.position.left) {
							ui.position.left = t.$elementContainer.width() - t.$element.width();
						}
					}
					shift = ui.position.top - ui.originalPosition.top;
					if (shift > 0) {
						// вниз
						if (ui.position.top > 0) {
							ui.position.top = 0;
						}
					} else {
						// вверх
						if (t.$elementContainer.height() - t.$element.height() > ui.position.top) {
							ui.position.top = t.$elementContainer.height() - t.$element.height();
						}
					}
				});
			} else {
				this.$element.draggable({}).draggable('destroy');
			}
		},

		getBufferInfo: function getBufferInfo() {
			var bufferInfo = this.$element[this.options.engine]('getBufferInfo');
			if ((typeof bufferInfo === 'undefined' ? 'undefined' : _typeof(bufferInfo)) == 'object' && bufferInfo.context) {
				// не реализован геттер, вернулся jquery-plugin
				return undefined;
			} else {
				return bufferInfo;
			}
		},

		getDelay: function getDelay() {
			return this.delay;
		},

		getErrorsCount: function getErrorsCount() {
			return this.errorsCount;
		},

		getLastErrorMessage: function getLastErrorMessage() {
			return this.lastErrorMessage;
		},

		getLastRewindToEnd: function getLastRewindToEnd() {
			return this.lastRewindToEnd;
		},

		getPlaybackQuality: function getPlaybackQuality() {
			var playbackQuality = this.$element[this.options.engine]('getPlaybackQuality');
			if ((typeof playbackQuality === 'undefined' ? 'undefined' : _typeof(playbackQuality)) == 'object' && playbackQuality.context) {
				// не реализован геттер, вернулся jquery-plugin
				return undefined;
			} else {
				return playbackQuality;
			}
		},

		getSnapshot: function getSnapshot() {
			var snapshot = this.$element[this.options.engine]('getSnapshot');
			if ((typeof snapshot === 'undefined' ? 'undefined' : _typeof(snapshot)) == 'object' && snapshot.context) {
				return false;
			} else {
				return snapshot;
			}
		},

		/* Получить сдвиг по времени от начала вещания потока для позиционирования аналитики */
		getTimeShift: function getTimeShift() {
			console.log('m7 getTimeShift');
			var shift = this.$element[this.options.engine]('getTimeShift');
			if ((typeof shift === 'undefined' ? 'undefined' : _typeof(shift)) == 'object' && shift.context) {
				// не реализован геттер, вернулся jquery-plugin
				return undefined;
			} else {
				return shift;
			}
		},

		fillContainer: function fillContainer() {
			var t = this;
			var containerWidth = t.$elementContainer.width();
			var containerHeight = t.$elementContainer.height();
			console.log('fillContainer', t.stream, containerWidth, containerHeight);
			if (!t.stream.width || !t.stream.height) {
				// Неизвестные размеры видео, продолжать нет смысла
				return t;
			}
			var aspectRatio = t.stream.width / t.stream.height;
			var ratioWidth = containerWidth / t.stream.width;
			var ratioHeight = containerHeight / t.stream.height;
			if (ratioWidth > ratioHeight) {
				this.origWidth = containerWidth;
				this.resizePlayer(containerWidth, t.stream.height * ratioWidth);
			} else {
				this.origWidth = t.stream.width * ratioHeight;
				this.resizePlayer(t.stream.width * ratioHeight, containerHeight);
			}
			t.$element.position({
				my: t.options.alignVideoX + ' ' + t.options.alignVideoY,
				at: t.options.alignVideoX + ' ' + t.options.alignVideoY,
				of: t.$elementContainer
			});
			t.aspectRatio = aspectRatio;
			this.draggable(true);
			this.$elementContainer.find('.normalZoom').remove();
		},

		fitPlayerToContainer: function fitPlayerToContainer() {
			var t = this;
			var containerWidth = t.$elementContainer.width();
			var containerHeight = t.$elementContainer.height();
			console.log('fitPlayerToContainer', t.stream, containerWidth, containerHeight);
			if (!t.stream.width || !t.stream.height) {
				// Неизвестные размеры видео, продолжать нет смысла
				return t;
			}
			var aspectRatio = t.stream.width / t.stream.height;
			//if (aspectRatio != t.aspectRatio) { не учитывает изменение размеров плеера при сохранении пропорций
			var ratioWidth = containerWidth / t.stream.width;
			var ratioHeight = containerHeight / t.stream.height;
			if (ratioWidth < ratioHeight) {
				this.origWidth = containerWidth;
				this.resizePlayer(containerWidth, t.stream.height * ratioWidth);
			} else {
				this.origWidth = t.stream.width * ratioHeight;
				this.resizePlayer(t.stream.width * ratioHeight, containerHeight);
			}
			t.$element.position({
				my: t.options.alignVideoX + ' ' + t.options.alignVideoY,
				at: t.options.alignVideoX + ' ' + t.options.alignVideoY,
				of: t.$elementContainer
			});
			t.aspectRatio = aspectRatio;
			this.draggable(false);
			//}
			this.$elementContainer.find('.normalZoom').remove();
			this.options.zoomCutMode = false;
		},

		fullscreen: function fullscreen(mode) {
			if (typeof mode === 'undefined') {
				return this.fullscreenState;
			}

			this.fullscreenState = mode == true;
			var $el = this.$elementContainer.parent();

			/*var t = this;
   var $el = ($element) ? $element : this.$elementContainer;
   var el = $el.get(0);
   	// НЕЛЬЗЯ ячейку фуллскринить: не видны любые диалоговые окна (выбор канала, управление ptz)
   /*if (!this.fullscreen) {
   	if (el.requestFullscreen) {
   		el.requestFullscreen();
   	} else if (document.documentElement.mozRequestFullScreen) {
   		el.mozRequestFullScreen();
   	} else if (document.documentElement.webkitRequestFullscreen) {
   		el.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
   	}				
   } else {
   	if (document.cancelFullscreen) {
   		document.cancelFullscreen();
   	} else if (document.mozCancelFullScreen) {
   		document.mozCancelFullScreen();
   	} else if (document.webkitCancelFullScreen) {
   		document.webkitCancelFullScreen();
   	}
   }*/

			if (this.fullscreenState) {
				$el.addClass('m7-fullscreen');
			} else {
				$el.removeClass('m7-fullscreen');
			}
			console.log('fullscreen', this.fullscreenState);
			this.onresize();
		},

		hide: function hide() {
			this.hideVideo();
		},

		hideVideo: function hideVideo() {
			// this.stop();
			this.$element[this.options.engine]('hide');
			//this.$elementContainer.css('visibility', 'hidden');
			//this.$element.trigger('M7PlayerHide');
		},

		isAudioAvailable: function isAudioAvailable() {
			var r = this.$element[this.options.engine]('isAudioAvailable');
			console.log('m7Player.isAudioAvailable', r);
			return r;
		},

		isVisible: function isVisible() {
			return this.$element.css('visibility') != 'hidden';
		},

		mute: function mute(data) {
			if (typeof data === 'undefined') {
				return this.$element[this.options.engine]('mute');
			}
			console.log('m7Player mute', data);
			this.$element[this.options.engine]('mute', data == true);
		},

		nextFrame: function nextFrame() {
			this.$element[this.options.engine]('nextFrame');
		},

		onresize: function onresize() {
			/* Да, это костыль, но нужно как-то перерисовать плеер при смене размера контейнера
   Нормального колбека или события нет */
			var t = this;
			var lastWidth = t.$elementContainer.width();
			var lastHeight = t.$elementContainer.height();
			t.resetZoom();
			clearTimeout(t.resizeTimeout);
			t.resizeTimeout = setTimeout(function () {
				if (lastWidth != t.$elementContainer.width() || lastHeight != t.$elementContainer.height()) {
					// изменились размеры с предыдущего замера
					t.onresize();
				} else {
					t.$element.trigger('m7PlayerFullscreenChange');
				}
			}, 100);
		},

		pause: function pause(params) {
			sendLog('m7-player pause State=' + this.state(), getVideoContainerInfo(this.$video));
			console.log('try to pause. State=' + this.state());
			this.$element[this.options.engine]('pause');
			if (this.options.clickControlAnimation == 'always' || this.options.clickControlAnimation == 'clicked' && params && params.clickedOnPlayer) {
				this.animAction('pause');
			}
		},

		play: function play(params) {
			console.log('m7Player play', params, this.options.playlist);
			var t = this;
			//this.clear(); 06.08.2018 - Зачем полный сброс в начале воспроизведения?! clear() чистит все сведения об источнике видео
			if (params) {
				if (this.options && (this.options.clickControlAnimation == 'always' || this.options.clickControlAnimation == 'clicked' && params && params.clickedOnPlayer)) {
					this.animAction('play');
				}
				if (params.rate) {
					this.playbackRate(params.rate);
				}
				if (params.position) {
					if (typeof params.position.numTrack != 'undefined' && params.position.numTrack != this.options.playlistCurrentItem) {
						t.playlistItemLoad(params.position.numTrack, function () {
							if (params.position.time) {
								t.position(params.position.time / 1000);
							}
							t.$element[t.options.engine]('play');
						});
					} else {
						if (params.position.time) {
							t.position(params.position.time / 1000);
						}
						t.$element[t.options.engine]('play');
					}
				} else {
					t.$element[t.options.engine]('play');
				}
			} else {
				t.$element[t.options.engine]('play');
			}
		},

		playbackRate: function playbackRate(data) {
			if (typeof data === 'undefined' || data == "") {
				return this.$element[this.options.engine]('playbackRate');
			}
			this.options.playbackRate = data;
			this.$element[this.options.engine]('playbackRate', data);
		},

		playlistItemLoad: function playlistItemLoad(indexItem, callback) {
			// playlist item to src
			if (this.playlistItemLoading) {
				return;
			}
			var t = this;
			t.playlistItemLoading = true;
			console.log('playlistItemLoad', indexItem, this.options.playlist[indexItem]);
			if (this.options.playlist[indexItem].url) {
				// Необходимо смуксировать
				$.getJSON(this.options.playlist[indexItem].url, {}, function (result) {
					console.log('playlistItemLoad muxed result', result);
					if (result.success && result.objects.muxedPlayItems && result.objects.muxedPlayItems[0]) {
						t.options.playlistCurrentItem = indexItem;
						var muxedItem = JSON.parse(result.objects.muxedPlayItems[0]);
						muxedItem.src = muxedItem.fileConnectionInfo.video;
						if (muxedItem.fileConnectionInfo.metadata) {
							muxedItem.metadata = muxedItem.fileConnectionInfo.metadata;
						}
						t.options.playlist[indexItem] = muxedItem;
						t.src(t.options.playlist[t.options.playlistCurrentItem]);
					}
					callback && callback();
				}).always(function () {
					t.playlistItemLoading = false;
				});
			} else if (this.options.playlist[indexItem]) {
				this.options.playlistCurrentItem = indexItem;
				this.src(this.options.playlist[this.options.playlistCurrentItem]);
				t.playlistItemLoading = false;
				callback && callback();
			} else {
				console.error('Undefined playlist item index ' + indexItem);
				t.playlistItemLoading = false;
			}
		},

		position: function position(data) {
			if (typeof data === 'undefined' || data == "") {
				return this.$element[this.options.engine]('position');
			}
			this.$element[this.options.engine]('position', data);
		},

		ptz: function ptz(data) {
			console.log('m7Player.ptz', data);
			if (data) {
				if (!this.$ptzLayer) {
					this.$element.find('.m7PlayerPtz').remove();
					this.$ptzLayer = $('<div>').addClass('m7PlayerPtz glass-layer').css({
						'z-index': 10
					});
					this.$ptzLayer.appendTo(this.$element);
					this.$ptzLayer.m7PlayerPtz({});
				}
				if (data.ptzNode) {
					this.$ptzLayer.m7PlayerPtz('ptzNode', data.ptzNode);
				}
				this.$ptzLayer.m7PlayerPtz('active', true);
			} else if (data === false) {
				if (this.$ptzLayer) {
					this.$ptzLayer.m7PlayerPtz('active', false);
					this.$ptzLayer.remove();
					delete this.$ptzLayer;
				}
			}
		},

		requestStreamInfo: function requestStreamInfo() {
			// Результат надо возвращать событием m7StreamInfo, поскольку он может быть асинхронным (vlc)
			this.$element[this.options.engine]('requestStreamInfo');
		},

		resizePlayer: function resizePlayer(width, height) {
			console.log('resizePlayer', width, height);
			this.$element.css({
				width: width,
				height: height
			});
			this.$element.trigger('m7PlayerResize', [width, height]);
		},

		rewind: function rewind(data) {
			console.log('m7Player rewind', data);
			this.$element[this.options.engine]('rewind', data);
			if (typeof this.$element.m7PlayerAnalytics == 'function') {
				this.$element.m7PlayerAnalytics('clear');
			}
		},

		rewindToEnd: function rewindToEnd() {
			this.delayCorrections++;
			this.lastRewindToEnd = new Date();
			this.$element[this.options.engine]('rewindToEnd');
			if (typeof this.$element.m7PlayerAnalytics == 'function') {
				this.$element.m7PlayerAnalytics('clear');
			}
		},

		set: function set(name, value) {
			console.log('set', name, value);
			this.options[name] = value;
		},

		show: function show() {
			this.$element[this.options.engine]('show');
			//this.$elementContainer.css('visibility', 'visible');
			//this.$element.trigger('M7PlayerShow');
		},

		src: function src(data) {
			console.log('M7Player.src', data);
			this.delayStop();
			this.clear();
			this.state('start');
			if (typeof data === 'undefined' || data == "") {
				return this.$element[this.options.engine]('src');
			}
			this.options.src = data;

			if (data.mime == 'video/mjpeg') {
				this.$element.m7PlayerMjpeg({}).m7PlayerMjpeg('src', data);
			} else {
				this.$element[this.options.engine]({
					autoplay: this.options.autoplay,
					cache: this.options.cache,
					controls: this.options.controls,
					debugRegim: this.options.debugRegim,
					delayControl: this.options.delayControl,
					mode: this.options.mode,
					playbackRate: this.options.playbackRate,
					stalledTimeout: this.options.stalledTimeout,
					workersCount: this.options.workersCount
				});
				this.$element[this.options.engine]('volume', this.options.volume);
				this.$element[this.options.engine]('mute', this.options.muted);
				if (this.options.wrongSocket) {
					// for test
					data.src += '-wrongURL';
				}
				this.$element[this.options.engine]('src', data);
				if (data.metadata) {
					this.addMetadata(data.metadata);
				}
			}

			if (this.titleInfo()) {
				// Перерисовываем подпись канала
				this.titleInfo(true);
			} else {
				console.log('m7PlayerTitleTemp!!!');
				this.$elementContainer.m7PlayerTitleTemp({
					duration: this.options.timeoutToHideChannelName
				}).m7PlayerTitleTemp('show');
			}
			this.$element.trigger('m7PlayerSourceChange', [this.options.src]);
		},

		state: function state(data) {
			if (typeof data === 'undefined' || data == "") {
				return this._state;
			}
			this._state = data;
			this.$element.trigger('m7PlayerStateChange', [data]);
		},

		statistics: function statistics(data) {
			if (typeof data === 'undefined' || data === "") {
				return this.options.statistics == true;
			}
			console.log('m7Player statistics', data);
			this.options.statistics = data == true;
			if (this.options.statistics) {
				this.$element.m7PlayerInfo({}).m7PlayerInfo('show');
			} else {
				this.$element.m7PlayerInfo({}).m7PlayerInfo('hide');
			}
			this.checkStatistics();
		},

		stop: function stop(message) {
			this.$element[this.options.engine]('stop');
		},

		testError: function testError(message) {
			var mes = message || 'on demand';
			this.$element.trigger('m7PlayerError', mes);
		},

		titleInfo: function titleInfo(newState) {
			this.$elementContainer.m7PlayerTitle({});
			var state = this.$elementContainer.m7PlayerTitle('state');
			if (typeof newState === 'undefined' || newState === "") {
				return state;
			}
			this.$elementContainer.m7PlayerTitle('state', newState);
		},

		toggle: function toggle() {
			if (this.$element.css('visibility') == 'visible') {
				this.hide();
			} else {
				this.show();
			}
		},

		toggleAnalytics: function toggleAnalytics() {
			this.analytics(!this.options.analytics);
		},

		toggleDebugInfo: function toggleDebugInfo() {
			this.$elementContainer.m7PlayerTechinfo({}).m7PlayerTechinfo('toggle');
		},

		toggleFullscreen: function toggleFullscreen() {
			console.log('toggleFullscreen', !this.fullscreenState);
			this.fullscreen(!this.fullscreenState);
		},

		toggleMute: function toggleMute() {
			this.mute(!this.mute());
		},

		togglePlay: function togglePlay(clickedOnPlayer) {
			console.log('togglePlay. state = ', this.state());
			if (this.state() == 'play') {
				this.pause({ clickedOnPlayer: clickedOnPlayer });
			} else if (this.state() == 'pause') {
				this.play({ clickedOnPlayer: clickedOnPlayer });
			}
		},

		volume: function volume(data) {
			if (typeof data === 'undefined' || data === "") {
				return this.$element[this.options.engine]('volume');
			}
			this.$element[this.options.engine]('volume', data);
		},

		watchdog: function watchdog(state) {
			if (this.options.watchdogTimeout > 0) {
				$(document).m7PlayerWatchdog({
					maxDelay: this.options.maxDelay,
					timeout: this.options.watchdogTimeout
				}); //.m7PlayerWatchdog('watch', this.playerSelector, state == true);
			}
		},

		wheelZoom: function wheelZoom(event) {
			var deltaY = event.originalEvent ? event.originalEvent.deltaY || event.originalEvent.wheelDelta || event.originalEvent.detail : 0;
			var zoomStep = deltaY < 0 ? 1.2 : 0.8;
			//var zoomStep = Math.pow(1.05, deltaY); // шаг масштабирования, удобный для пользователя
			var offset = this.$element.parent().offset();
			var centerX = event.originalEvent.pageX - offset.left;
			var centerY = event.originalEvent.pageY - offset.top;
			/*console.log({
   	func: 'mousewheel',
   	zoomStep: zoomStep,
   	offset: offset,
   	centerX: centerX,
   	centerY: centerY,
   	event: event.originalEvent,
   	deltaY: deltaY
   });*/
			this.zoom(zoomStep, centerX, centerY);
		},

		zoom: function zoom(zoomStep, centerX, centerY) {
			var t = this;
			console.log('zoom', zoomStep, centerX, centerY);
			var centerX = centerX || this.$elementContainer.width() / 2;
			var centerY = centerY || this.$elementContainer.height() / 2;
			var width = this.$element.width();
			var height = this.$element.height();

			if (width * zoomStep < this.$elementContainer.width() && height * zoomStep < this.$elementContainer.height()) {
				this.fitPlayerToContainer();
				return;
			}

			this.draggable(true);

			this.scale = Math.round(width * zoomStep * 100 / this.origWidth);

			if (this.scale > 300) {
				this.scale = 300;
				zoomStep = this.scale * this.origWidth / (width * 100);
			}

			/*if (zoomStep > 1 && (width >= 1950 || height > 1024)) {
   	return;
   }*/
			var $normalZoom = this.$elementContainer.find('.normalZoom');

			console.log('New zoom', this.scale);
			if (!this.scale) {
				$normalZoom.remove();
				return;
			}

			this.resizePlayer(width * zoomStep, height * zoomStep);
			if (!$normalZoom.length) {
				$normalZoom = $('<div>').addClass('ctl normalZoom pointer');
				$normalZoom.appendTo(this.$elementContainer);
				$normalZoom.click(function (e) {
					t.resetZoom();
					e.stopPropagation();
				});
			}
			$normalZoom.html(this.scale + '%');

			centerX -= this.$element.position().left;
			var left = this.$element.position().left + centerX * (1 - zoomStep);
			this.$element.css('left', left + 'px');

			centerY -= this.$element.position().top;
			var top = this.$element.position().top + centerY * (1 - zoomStep);
			this.$element.css('top', top + 'px');
		},

		zoomCutMode: function zoomCutMode(data) {
			if (typeof data === 'undefined' || data === "") {
				return this.options.zoomCutMode == true;
			}
			this.options.zoomCutMode = data == true;
			this.resetZoom();
		},

		resetZoom: function resetZoom() {
			if (this.options.zoomCutMode) {
				this.fillContainer();
			} else {
				this.fitPlayerToContainer();
			}
		}

	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = ['src', 'state', 'playbackRate', 'getTimeShift', 'getPlaybackQuality', 'getBufferInfo', 'isAudioAvailable', 'mute', 'analytics', 'getSnapshot', 'debugInfo', 'titleInfo', 'statistics', 'getErrorsCount', 'volume', 'getDelay', 'getLastRewindToEnd', 'position', 'getLastErrorMessage', 'fullscreen', 'zoomCutMode'];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new M7Player(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof M7Player && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof M7Player && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * m7-workers 0.1
 * 
 * Библиотека для управления коллекцией воркеров
 * 
 * Author: Alexander Ivanov, ALGONT, 2017
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'm7Workers',
	    defaults = {
		workersCount: 1,
		renewTimeout: 5000 // мс
	};

	function M7Workers(element, options) {
		this.$element = $(element);
		this.workers = {};
		this.processes = {};
		this.options = $.extend({}, defaults, options);
		this.init();
	}

	M7Workers.prototype = {
		init: function init() {
			var t = this;
			//console.log('M7Workers init');
		},

		addProcess: function addProcess(process) {
			// Есть ли уже процесс с таким id?
			if (this.processes[process.processId]) {
				console.log('The process was added previously ', process.processId);
				sendLog('The process ' + process.processId + ' was added previously');
				return; // уже есть, ничего не делаем
			}
			var workerId = this.chooseWorker(process);
			console.log('Worker choosed id', workerId);
			// Новый уникальный id процеса
			/*var processId;
   do {
   	processId = 'p' + (new Date()).getTime();
   } while (this.processes[processId]);*/
			var processId = process.processId;
			this.processes[processId] = process;
			this.processes[processId].workerId = workerId;
			var workerItem = this.workers[process.workerType][workerId];
			workerItem.processes.push(processId);
			/*console.log('addProcess postMessage run', {
   	processId: processId,
   	process: this.processes[processId],
   	params: [process.processId, process.paramsToWorker],
   	worker: workerItem.worker,	
   	workerItem: workerItem
   });*/
			sendLog('addProcess postMessage run', {
				processId: processId,
				process: this.processes[processId],
				params: [process.processId, process.paramsToWorker],
				worker: workerItem.worker,
				workerItem: workerItem
			});

			workerItem.worker.postMessage({
				cmd: 'run',
				id: processId,
				params: process.paramsToWorker
			});
		},

		chooseWorker: function chooseWorker(process) {
			// Есть ли воркер(ы) данного типа?
			if (_typeof(this.workers[process.workerType]) == 'object' && Object.keys(this.workers[process.workerType]).length > 0) {
				if (Object.keys(this.workers[process.workerType]).length < this.options.workersCount) {
					return this._addWorker(process);
				} else {
					// выбираем воркер с наименьшим числом процессов
					var processesCount;
					var workerId;
					for (var wId in this.workers[process.workerType]) {
						var worker = this.workers[process.workerType][wId];
						console.log('chooseWorker worker', worker, this.workers);
						if (!processesCount || worker.processes.length < processesCount) {
							processesCount = worker.processes.length;
							workerId = worker.workerId;
						}
					}
					return workerId;
				}
			} else {
				return this._addWorker(process);
			}
		},

		closeWorker: function closeWorker(workerType, workerId) {
			var workerItem = this.workers[workerType][workerId];
			if (!workerItem) {
				console.error('Попытка удалить несуществующий воркер!', {
					workerType: workerType,
					workerId: workerId
				});
				return;
			}
			// Удаляем все процессы, связанные с этим воркером
			var proc = workerItem.processes;
			var count = 0;
			for (var i = 0; i < proc.length; i++) {
				delete this.processes[proc[i]];
				count++;
			}
			this.workers[workerType][workerId].worker.terminate();
			window.URL.revokeObjectURL(this.workers[workerType][workerId].workerObjectURL);
			delete this.workers[workerType][workerId];
			console.log('Worker ' + workerId + ' deleted. Processes removed: ' + count);
		},

		onMessage: function onMessage(e) {
			var data = e.data;
			//console.log('trigger msg'+data.id, data);
			if (data.msg == 'm7WorkerClosed') {
				console.log('Worker closed ' + data.workerId);
				sendLog('Message: worker closed ' + data.workerId);
				this.closeWorker(data.workerType, data.workerId);
			} else if (data.msg == 'm7WorkerState') {
				console.log('Worker state ', data);
				sendLog('Worker state ', data);
			} else {
				if (!data.id || !this.processes[data.id]) {
					console.error('Message from unknown process!', data);
					return;
				} else {
					//this.$element.trigger('msg'+data.id, data);	
					this.processes[data.id].onMessage(data);
				}
			}
		},

		removeProcess: function removeProcess(processId) {
			if (!this.processes || !this.processes[processId] || !this.workers || !this.workers[this.processes[processId].workerType]) {
				console.error('removeProcess error', {
					processId: processId,
					processes: this.processes,
					workers: this.workers
				});
				return;
			}
			var workerItem = this.workers[this.processes[processId].workerType][this.processes[processId].workerId];
			if (workerItem) {
				console.log('!! removeProcess', {
					processId: processId,
					workerItem: workerItem,
					workers: this.workers,
					processes: this.processes
				});
				workerItem.worker.postMessage({
					cmd: 'removeProcess',
					processId: processId
				});
				window.URL.revokeObjectURL(processId);
			} else {
				console.error('Trying to remove unknown process id=', processId);
			}
		},

		renew: function renew(processId) {
			if (!this.processes || !this.processes[processId] || !this.workers || !this.workers[this.processes[processId].workerType]) {
				console.error('worker renew error', {
					processId: processId,
					processes: this.processes,
					workers: this.workers
				});
				return;
			}
			var t = this;
			var workerItem = this.workers[this.processes[processId].workerType][this.processes[processId].workerId];
			if (workerItem) {
				var now = new Date();
				workerItem.lastRenewTime = workerItem.lastRenewTime || now;
				/*console.log('worker renew', {
    	lastRenewTime: workerItem.lastRenewTime,
    	now: now,
    	renewTimeout: t.options.renewTimeout
    });*/
				if (now - workerItem.lastRenewTime > t.options.renewTimeout) {
					//console.log('worker renew postMessage');
					workerItem.worker.postMessage({
						cmd: 'renew'
					});
					workerItem.lastRenewTime = now;
					/*console.log('Workers state', {
     	workers: this.workers,
     	processes: this.processes
     })*/
				}
			} else {
				console.error('Try to renew unknown worker! processId=' + processId, this.processes[processId]);
			}
		},

		_addWorker: function _addWorker(params) {
			console.log('_addWorker', params);
			var t = this;
			if (_typeof(this.workers[params.workerType]) != 'object') {
				this.workers[params.workerType] = {};
			}

			var workerText = params.workerText;

			workerText += '\n\t\t\t\tinit = function (data) {\n\t\t\t\t\tvar t = this;\n\t\t\t\t\tt.workerId = data.workerId;\n\t\t\t\t\tt.workerType = data.workerType;\n\t\t\t\t\tconsole.log(\'worker init. id=\' + t.workerId);\n\t\t\t\t\tt.checkTimeout();\n\t\t\t\t}\n\n\t\t\t\trenew = function () {\n\t\t\t\t\tthis.lastTime = new Date();\n\t\t\t\t\t// console.log(\'Worker renew \' + t.workerId);\n\t\t\t\t}\n\n\t\t\t\tcheckTimeout = function (base64) {\n\t\t\t\t\tvar t = this;\n\t\t\t\t\tt.lastTime = t.lastTime || new Date();\n\t\t\t\t\tt.timeout = t.timeout || 20000;\n\t\t\t\t\tsetTimeout(function () {\n\t\t\t\t\t\tvar now = new Date();\n\t\t\t\t\t\t//console.log("worker checkTimeout", now - t.lastTime, now, t.lastTime)\n\t\t\t\t\t\tif (now - t.lastTime > t.timeout) {\n\t\t\t\t\t\t\tconsole.log(\'No renew messages. Closing worker & websocket on timeout.\');\n\t\t\t\t\t\t\tpostMessage({\n\t\t\t\t\t\t\t\tmsg: \'m7WorkerClosed\',\n\t\t\t\t\t\t\t\tworkerId: t.workerId,\n\t\t\t\t\t\t\t\tworkerType: t.workerType,\n\t\t\t\t\t\t\t});\n\n\t\t\t\t\t\t\tif (websockets) {\n\t\t\t\t\t\t\t\tfor (var key in websockets) {\n\t\t\t\t\t\t\t\t\twebsockets[key].close();\n\t\t\t\t\t\t\t\t\tdelete websockets[key];\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\tdelete websockets;\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tt.close();\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t//console.log(\'check websockets\', websockets);\n\t\t\t\t\t\t\tpostMessage({\n\t\t\t\t\t\t\t\tmsg: \'m7WorkerState\',\n\t\t\t\t\t\t\t\tworkerId: t.workerId,\n\t\t\t\t\t\t\t\tworkerType: t.workerType,\n\t\t\t\t\t\t\t\twebsockets: Object.keys(websockets).length,\n\t\t\t\t\t\t\t});\n\t\t\t\t\t\t\tt.checkTimeout();\n\t\t\t\t\t\t}\n\t\t\t\t\t}, 3000);\n\t\t\t\t}\t\t\t\t\n\t\t\t';

			var workerObjectURL = window.URL.createObjectURL(new Blob([workerText]));
			var worker = new Worker(workerObjectURL);
			worker.onmessage = function (e) {
				t.onMessage(e);
			};
			// Новый уникальный id воркера
			var workerId;
			do {
				workerId = new Date().getTime();
			} while (this.workers[params.workerType][workerId]);
			this.workers[params.workerType][workerId] = {
				workerId: workerId,
				worker: worker,
				workerObjectURL: workerObjectURL,
				processes: []
			};
			worker.postMessage({
				cmd: 'init',
				workerId: workerId,
				workerType: params.workerType
			}); // Start the worker
			return workerId;
		}

	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = ['addWorker', 'chooseWorker'];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new M7Workers(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof M7Workers && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof M7Workers && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * synology-mse 0.1
 * 
 * Author: Alexander Ivanov, ALGONT, 2017
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'synologyMSE',
	    defaults = {
		autoplay: true,
		src: "",
		maxBuffer: 30, // максимальный размер буфера в секундах
		mode: 'stable',
		videoMimeType: 'video/mp4; codecs="avc1.42e028"',
		workersCount: 2
	};

	function SynologyMSE(element, options) {
		this.options = $.extend({}, defaults, options);
		this.$element = $(element);
		$(document).m7Workers({
			workersCount: this.options.workersCount
		});

		this.$video = this.$element;
		this.video = this.$element.get(0);
		window.MediaSource = window.MediaSource || window.WebKitMediaSource;
		this.init();
		if (this.options.src) {
			this.src(this.options.src);
		}
	}

	SynologyMSE.prototype = {
		init: function init() {
			var t = this;

			this.workerText = 'var websockets = {};\n\t\t\t\tvar timeout = 20000; // 10 \u0441\u0435\u043A - \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0437\u0430\u0434\u0435\u0440\u0436\u043A\u0430 \u0434\u043B\u044F renew\n\t\t\t\tvar trackId = \'track\';\n\t\t\t\tvar t = this;\n\t\t\t\tonmessage = function (e) { \n\t\t\t\t\t//console.log(\'onmessage in worker\', e.data);\n\t\t\t\t\tif (e.data.cmd == \'run\') {\n\t\t\t        \ttry {\n\t\t\t        \t\tvar id = e.data.id;\n\t\t\t        \t\tif (!id) {\n\t\t\t        \t\t\tconsole.error(\'Websocket id is undefined\', e.data);\n\t\t\t        \t\t}\n\n\t\t\t\t\t\t\tif (websockets[id]) {\n\t\t\t\t\t\t\t\tconsole.log(\'try to close websocket\');\n\t\t\t\t\t\t\t\twebsockets[id].close();\n\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t\twebsockets[id] = new WebSocket(e.data.params.uri);\n\t\t\t\t\t\t\twebsockets[id].binaryType = "arraybuffer";\n\t\t\t\t\t\t\twebsockets[id].lastKeepAlive = 0;\n\t\t\t\t\t\t\twebsockets[id].onmessage = function(e) {\n\t\t\t\t\t\t\t\tif (websockets[id].inited) {\n\t\t\t\t\t\t\t\t\tdispatchMessage(id, e.data);\t\n\t\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\t\twebsockets[id].inited = true;\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\tvar now = new Date();\n\t\t\t\t\t\t\t\t//console.log(now - lastKeepAlive, now - lastKeepAlive > 10000);\n\t\t\t\t\t\t\t\tif (now - websockets[id].lastKeepAlive > 10000) {\n\t\t\t\t\t\t\t\t\tif (WebSocket.OPEN === websockets[id].readyState) {\n                \t\t\t\t\t\twebsockets[id].send(\'keepAlive\');\n            \t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\twebsockets[id].lastKeepAlive = now;\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\twebsockets[id].onerror = function(e) {\n\t\t\t\t\t\t\t\tconsole.error({\n\t\t\t\t\t\t\t\t\tmsg: \'websocket error\', \n\t\t\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\t\t\tdata: e\n\t\t\t\t\t\t\t\t});\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\twebsockets[id].onopen = function(e) {\n\t\t\t\t\t\t\t\t//console.log(\'worker websocket open\', e);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\twebsockets[id].onclose = function(e) {\n\t\t\t\t\t\t\t\t//console.log(\'worker websocket close\', e);\n\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t} catch (error) {\n\t\t\t\t\t\t\tconsole.error({\n\t\t\t\t\t\t\t\tmsg: \'error\', \n\t\t\t\t\t\t\t\tdata: error\n\t\t\t\t\t\t\t});\n\t\t\t\t\t\t}\t\t\t\t\n\t\t\t\t\t} else {\n\t\t\t\t\t\tif (typeof t[e.data.cmd] == \'function\') {\n\t\t\t\t\t\t\tt[e.data.cmd](e.data);\n\t\t\t\t\t\t}\t\t\t\t\t\t\n\t\t\t\t\t} \n\t\t\t\t}\n\n\t\t\t\tbase64ToArrayBuffer = function (base64) {\n\t\t\t\t\treturn Uint8Array.from(atob(base64), function(c) {\n\t\t\t\t\t\treturn c.charCodeAt(0);\n\t\t\t\t\t});\n\t\t\t\t}\n\n\t\t\t\tgetRawData = function(a) {\n                \tvar b = (1 === a[0]) ? 0 : 4;\n                \treturn a.subarray(1 + b)                 \n            \t}\n\n\t\t\t\tdispatchMessage = function (id, rawData) {\n\t\t\t\t\t//console.log(\'worker dispatchMessage\', rawData instanceof ArrayBuffer, typeof(rawData));\n\t\t\t\t\t//console.log(\'_dispatchMessage\');\n\t\t\t\t\tif(rawData instanceof ArrayBuffer) {\n\t\t\t\t\t  // 12,4 = mfhd\n\t\t\t\t\t  // 20,4 slice - segment.id\n\t\t\t\t\t  // 36,4 = tfhd\n\t\t\t\t\t  // 44,4 slice - track.id\n\t\t\t\t\t  // 64,4 = tfdt\n\t\t\t\t\t  // 72,8 slice - prestime\n\t\t\t\t\t  // 84,4 = trun\n\t\t\t\t\t  //var view = new Uint8Array(rawData);\n\t\t\t\t\t  //t._appendData(view[47], view);\n\t\t\t\t\t  var res = getRawData(new Uint8Array(rawData));\n\t\t\t\t\t  appendData(id, trackId, res);\n\t\t\t\t\t} else {\n\t\t\t\t\t  var data = JSON.parse(rawData);\n\t\t\t\t\t  console.log(\'JSON received\', data);\n\t\t\t\t\t  \n\t\t\t\t\t  if (data.streamMeta) {\n\t\t\t\t\t\t//console.log(\'streamMeta received\', data);\n\t\t\t\t\t\tpostMessage({\n\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\tmsg: \'m7MetadataReceived\',\n\t\t\t\t\t\t\ttimestamp: data.timestamp,\n\t\t\t\t\t\t\tstreamMeta: data.streamMeta\t\t\t\t\t\t\t\n\t\t\t\t\t\t});\n\t\t\t\t\t  }\n\t\t\t\t\t  if (data.type === \'mse_init_segment\') {\n\t\t\t\t\t  \tdata.id = trackId;\n\t\t\t\t\t\tpostMessage({\n\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\tmsg: \'m7StreamTimeShiftReceived\',\n\t\t\t\t\t\t\tcorrection: data.correction\n\t\t\t\t\t\t});\n\t\t\t\t\t  }\n\t\t\t\t\t}\t\t\t\t\t\n\t\t\t\t}\n\n\t\t\t\tappendData = function (id, trackId, arrayBuffer) {\n\t\t\t\t\tpostMessage({\n\t\t\t\t\t\tid: id,\n\t\t\t\t\t\tmsg: \'appendData\', \n\t\t\t\t\t\ttrackId: trackId,\n\t\t\t\t\t\tarrayBuffer: arrayBuffer\n\t\t\t\t\t});\n\t\t\t\t}';

			//t.clear();

			/*var blob1 = new Blob([worker]);
   t.workerVideo = new Worker(window.URL.createObjectURL(blob1));
   t.workerVideo.onmessage = function (e) {
   	var data = e.data;
   	//console.log("onmessage from worker", data);
   	if (data.msg == 'appendData') {
   		//console.log('append from worker', data);
   		t._appendData(data.trackId, data.arrayBuffer);
   	} else if (data.msg == 'm7StreamTimeShiftReceived') {
   		t.$video.trigger('m7StreamTimeShiftReceived', [data.correction]);
   	} else if (data.msg == 'error') {
   		t.$video.trigger('error', e);
   	} else {
   		console.error('Unknown answer from worker', data);
   	}
   }
   t.workerVideo.postMessage('init'); // Start the worker*/

			/*var blob2 = new Blob([worker]);
   t.workerMeta = new Worker(window.URL.createObjectURL(blob2));			
   t.workerMeta.onmessage = function (e) {
   	var data = e.data;
   	console.log("onmessage from workerMeta", data);
   	if (data.msg == 'm7MetadataReceived') {
   		t.$video.trigger('m7MetadataReceived', [data.streamMeta, data.timestamp]);
   	}
   }
   t.workerMeta.postMessage('init'); // Start the worker
   t.checkWorking();
   */

			/*this.$video.on('m7PlayerSourceChange', function () {
   	if (t.websocket) {
   		console.log('try to close websocket');
   		t.websocket.close();
   	}				
   });*/
		},

		/*clear: function () {
  	if (this.workerVideo) {
  		this.workerVideo.terminate();
  	}
  	if (this.workerMeta) {
  		this.workerMeta.terminate();
  	}
  },*/

		/*checkWorking: function () {
  	var t = this;
  	setTimeout(function () {
  		//console.log('renew2', t.$element[0].parentElement);
  		if (!t.$element[0].parentElement) { // Родительский объект уничтожен
  			t.clear();
  		} else {
  			t.workerVideo.postMessage('renew');
  			t.workerMeta.postMessage('renew');
  			t.checkWorking();
  		}
  	}, 10000);
  },*/

		src: function src(data) {
			var t = this;
			console.log('synologyMSE.src', data);
			this.counters = {
				updatestart: 0,
				update: 0,
				updateend: 0,
				error: 0,
				abort: 0,
				appendData: 0,
				updatingOnUpdate: 0,
				updatingOnAppendData: 0

				/*if (t.websocket) {
    	console.log('try to close websocket');
    	t.websocket.close();
    }*/
			};if (this.mediaSource) {
				this.init();
				if (this.mediaSource.readyState == 'open') {
					this.mediaSource.endOfStream();
				}
			}
			this.buffers = {};
			this.queues = {};
			this.mediaSource = new MediaSource();
			this.video.src = window.URL.createObjectURL(t.mediaSource);
			this.mediaSource.addEventListener('sourceopen', function (e) {
				if (data.codec) {
					t.options.videoMimeType = data.codec;
				}

				$(document).m7Workers('addProcess', {
					workerType: 'synologyWebsocket',
					workerText: t.workerText,
					processId: t.video.src,
					paramsToWorker: { // что будет передаваться в воркер
						uri: data.src
					},
					onMessage: function onMessage(data) {
						//console.log("onmessage from worker", data);
						if (data.msg == 'appendData') {
							//console.log('append from worker', data);
							t._appendData(data.trackId, data.arrayBuffer);
							$(document).m7Workers('renew', data.id);
							sendLog(data.arrayBuffer.length);
							sendLog(' ' + data.arrayBuffer.length + ' -3гена- ' + arrayBufferToBase64(new Uint8Array(data.arrayBuffer)));
							//sendLog(btoa(String.fromCharCode.apply(null, data.arrayBuffer)));
						} else if (data.msg == 'm7StreamTimeShiftReceived') {
							t.$video.trigger('m7StreamTimeShiftReceived', [data.correction]);
						} else if (data.msg == 'error') {
							t.$video.trigger('error', e);
						} else {
							console.error('Unknown answer from worker', data);
						}
					}
				});

				/*t.workerVideo.postMessage({
    	cmd: 'connect',
    	uri: data.src
    });
    		if (data.metadata && data.metadata.uri) {
    	t.workerMeta.postMessage({
    		cmd: 'connect',
    		uri: data.metadata.uri
    	});
    }*/

				//t.mediaSource.duration = 30;
				/*try {
    t.websocket = new WebSocket(uri);
    t.websocket.binaryType = "arraybuffer";
    t.websocket.onmessage = function(e) {
    t._dispatchMessage(e.data);
    }
    t.websocket.onerror = function(e) {
    console.error('websocket error', e);
    t.$video.trigger('error', e);
    }
    t.websocket.onopen = function(e) {
    console.log('websocket open', e);
    }
    t.websocket.onclose = function(e) {
    console.log('websocket close', e);
    }
    t.$video.trigger('m7-newWebsocket', [t.websocket]);
    } catch (error) {
    t.$element.trigger('error', error);
    }*/
			});
		},

		_createSourceBuffers: function _createSourceBuffers(data) {
			var t = this;
			console.log('synologyMSE createSourceBuffers', data);
			var mimeType = this.options.videoMimeType;
			var buffer = t.buffers[data.id] = t.mediaSource.addSourceBuffer(mimeType);
			if (this.options.mode == 'debug') {
				buffer.mode = 'segments';
			} else {
				buffer.mode = 'sequence';
			}
			//buffer.timestampOffset = 15;
			var queue = t.queues[data.id] = [];
			t.$video.trigger('m7PlayerQueueChanged', [0]);

			buffer.addEventListener('updatestart', function () {
				t.counters.updatestart++;
			});

			buffer.addEventListener('update', function () {
				t.counters.update++;
				if (buffer.updating) {
					t.counters.updatingOnUpdate++;
				}
				if (queue.length > 0 && !buffer.updating) {
					buffer.appendBuffer(queue.shift());
					t.$video.trigger('m7PlayerQueueChanged', [queue.length]);
					//console.log('append buffer from queue', queue.length, buffer.timestampOffset, buffer.buffered.start(0), buffer.buffered.end(0));
				}
			});

			buffer.addEventListener('updateend', function () {
				t.counters.updateend++;
				if (t.options.maxBuffer && buffer.buffered.length) {
					var bufSize = buffer.buffered.end(buffer.buffered.length - 1) - buffer.buffered.start(buffer.buffered.length - 1);
					if (!buffer.updating && bufSize > t.options.maxBuffer * 2) {
						var startCut = 0; // Важно, т.к. FF 55 неточно сообщает buffered.start
						var endCut = buffer.buffered.start(buffer.buffered.length - 1) + bufSize - t.options.maxBuffer;
						//console.log('** try to reduce buffer', startCut, endCut/*, cache*/);
						buffer.remove(startCut, endCut);
					}
				}
			});

			buffer.addEventListener('error', function () {
				t.counters.error++;
			});

			buffer.addEventListener('abort', function () {
				t.counters.abort++;
			});
		},

		/*_dispatchMessage: function (rawData) {
  	var t = this;
  	var trackId = 'track';
  	//console.log('_dispatchMessage', rawData instanceof ArrayBuffer, typeof(rawData));
  	if(rawData instanceof ArrayBuffer) {
  	  // 12,4 = mfhd
  	  // 20,4 slice - segment.id
  	  // 36,4 = tfhd
  	  // 44,4 slice - track.id
  	  // 64,4 = tfdt
  	  // 72,8 slice - prestime
  	  // 84,4 = trun
  	  if (!t.buffers[trackId]) {
  	  	t._createSourceBuffers({
  	  		id: trackId
  	  	});
  	  }
  	  var view = new Uint8Array(rawData);
  	  //t._appendData(view[47], view);
  	  t._appendData(trackId, view);
  	} else {
  	  var data = JSON.parse(rawData);
  	  
  	  if (data.streamMeta) {
  		//console.log('streamMeta received', data);
  		t.$video.trigger('m7MetadataReceived', [data.streamMeta, data.timestamp]);
  	  }
  	  if (data.type === 'mse_init_segment') {
  	  	data.id = trackId;
  		t._createSourceBuffers(data);
  		if (data.correction) {
  			t.$video.trigger('m7StreamTimeShiftReceived', [data.correction]);
  	  	}
  		if (data.streamData) {
  	  		t._appendData(trackId, t._base64ToArrayBuffer(data.streamData));	
  		}				  
  	  } else if (data.type === 'mse_media_segment' && data.streamData) {
  		t._appendData(trackId, t._base64ToArrayBuffer(data.streamData));
  	  }
  	}
  },*/

		_appendData: function _appendData(trackId, binaryData) {
			var t = this;
			//console.log('_appendData', trackId, binaryData);
			t.counters.appendData++;
			if (!t.buffers[trackId]) {
				t._createSourceBuffers({
					id: trackId
				});
			}
			var buffer = t.buffers[trackId];
			var queue = t.queues[trackId];
			if (buffer.updating) {
				t.counters.updatingOnAppendData++;
			}
			if (buffer.updating || queue.length > 0) {
				if (queue.length < 1000) {
					queue.push(binaryData);
				} else {
					console.error('queue length is greater then 1000!');
				}
			} else {
				if (t.video.error) {
					console.error('HTMLMediaElement error ', t.video.error);
				}
				buffer.appendBuffer(binaryData);
				//console.log('append buffer', buffer.timestampOffset, buffer.buffered.start(0), buffer.buffered.end(0));
			}
			t.$video.trigger('m7PlayerMseStatus', [t.counters]);
		}

	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = [];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new SynologyMSE(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof SynologyMSE && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof SynologyMSE && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * video-mse вез воркеров
 * 
 * Author: Alexander Ivanov, ALGONT, 2017
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'videoMseNoWorkers',
	    defaults = {
		autoplay: true,
		src: "",
		maxBuffer: 30, // максимальный размер буфера в секундах
		mode: 'stable',
		videoMimeType: 'video/mp4;codecs="avc1.4d401f"'
	};

	function VideoMseNoWorkers(element, options) {
		this.options = $.extend({}, defaults, options);
		this.$element = $(element);
		this.$video = this.$element;
		this.video = this.$element.get(0);
		window.MediaSource = window.MediaSource || window.WebKitMediaSource;
		this.init();
		if (this.options.src) {
			this.src(this.options.src);
		}
	}

	VideoMseNoWorkers.prototype = {
		init: function init() {
			var t = this;
		},

		src: function src(data) {
			var t = this;
			console.log('videoMseNoWorkers.src', data);
			this.counters = {
				updatestart: 0,
				update: 0,
				updateend: 0,
				error: 0,
				abort: 0,
				appendData: 0,
				updatingOnUpdate: 0,
				updatingOnAppendData: 0
			};

			if (t.websocket) {
				console.log('try to close websocket');
				t.websocket.close();
			}
			if (this.mediaSource) {
				this.init();
				if (this.mediaSource.readyState == 'open') {
					this.mediaSource.endOfStream();
				}
			}
			this.buffers = {};
			this.queues = {};
			this.mediaSource = new MediaSource();
			this.video.src = window.URL.createObjectURL(t.mediaSource);
			this.mediaSource.addEventListener('sourceopen', function (e) {
				if (data.codec) {
					t.options.videoMimeType = data.codec;
				}
				//t.mediaSource.duration = 30;
				try {
					t.websocket = new WebSocket(data.src);
					t.websocket.binaryType = "arraybuffer";
					t.websocket.onmessage = function (e) {
						t._dispatchMessage(e.data);
					};
					t.websocket.onerror = function (e) {
						console.error('websocket error', e);
						t.$video.trigger('error', e);
					};
					t.websocket.onopen = function (e) {
						console.log('websocket open', e);
					};
					t.websocket.onclose = function (e) {
						console.log('websocket close', e);
					};
					t.$video.trigger('m7-newWebsocket', [t.websocket]);
				} catch (error) {
					t.$element.trigger('error', error);
				}
			});
		},

		_createSourceBuffers: function _createSourceBuffers(data) {
			var t = this;
			console.log('videoMseNoWorkers createSourceBuffers', data);
			var mimeType = this.options.videoMimeType;
			var buffer = t.buffers[data.id] = t.mediaSource.addSourceBuffer(mimeType);
			if (this.options.mode == 'debug') {
				buffer.mode = 'segments';
			} else {
				buffer.mode = 'sequence';
			}
			//buffer.timestampOffset = 15;
			var queue = t.queues[data.id] = [];
			t.$video.trigger('m7PlayerQueueChanged', [0]);

			buffer.addEventListener('updatestart', function () {
				t.counters.updatestart++;
			});

			buffer.addEventListener('update', function () {
				t.counters.update++;
				if (buffer.updating) {
					t.counters.updatingOnUpdate++;
				}
				if (queue.length > 0 && !buffer.updating) {
					buffer.appendBuffer(queue.shift());
					t.$video.trigger('m7PlayerQueueChanged', [queue.length]);
					//console.log('append buffer from queue', queue.length, buffer.timestampOffset, buffer.buffered.start(0), buffer.buffered.end(0));
				}
			});

			buffer.addEventListener('updateend', function () {
				t.counters.updateend++;
				if (t.options.maxBuffer && buffer.buffered.length) {
					var bufSize = buffer.buffered.end(buffer.buffered.length - 1) - buffer.buffered.start(buffer.buffered.length - 1);
					if (!buffer.updating && bufSize > t.options.maxBuffer * 2) {
						var startCut = 0; // Важно, т.к. FF 55 неточно сообщает buffered.start
						var endCut = buffer.buffered.start(buffer.buffered.length - 1) + bufSize - t.options.maxBuffer;
						//console.log('** try to reduce buffer', startCut, endCut/*, cache*/);
						buffer.remove(startCut, endCut);
					}
				}
			});

			buffer.addEventListener('error', function () {
				t.counters.error++;
			});

			buffer.addEventListener('abort', function () {
				t.counters.abort++;
			});
		},

		_dispatchMessage: function _dispatchMessage(rawData) {
			var t = this;
			var trackId = 'track';
			//console.log('_dispatchMessage', rawData instanceof ArrayBuffer, typeof(rawData));
			if (rawData instanceof ArrayBuffer) {
				// 12,4 = mfhd
				// 20,4 slice - segment.id
				// 36,4 = tfhd
				// 44,4 slice - track.id
				// 64,4 = tfdt
				// 72,8 slice - prestime
				// 84,4 = trun
				if (!t.buffers[trackId]) {
					t._createSourceBuffers({
						id: trackId
					});
				}
				var view = new Uint8Array(rawData);
				//t._appendData(view[47], view);
				t._appendData(trackId, view);
			} else {
				var data = JSON.parse(rawData);

				if (data.streamMeta) {
					//console.log('streamMeta received', data);
					t.$video.trigger('m7MetadataReceived', [data.streamMeta, data.timestamp]);
				}
				if (data.type === 'mse_init_segment') {
					data.id = trackId;
					t._createSourceBuffers(data);
					if (data.correction) {
						t.$video.trigger('m7StreamTimeShiftReceived', [data.correction]);
					}
					if (data.streamData) {
						t._appendData(trackId, t._base64ToArrayBuffer(data.streamData));
					}
				} else if (data.type === 'mse_media_segment' && data.streamData) {
					t._appendData(trackId, t._base64ToArrayBuffer(data.streamData));
				}
			}
		},

		_appendData: function _appendData(trackId, binaryData) {
			var t = this;
			//console.log('_appendData', trackId, binaryData);
			t.counters.appendData++;
			if (!t.buffers[trackId]) {
				t._createSourceBuffers({
					id: trackId
				});
			}
			var buffer = t.buffers[trackId];
			var queue = t.queues[trackId];
			if (buffer.updating) {
				t.counters.updatingOnAppendData++;
			}
			if (buffer.updating || queue.length > 0) {
				if (queue.length < 500) {
					queue.push(binaryData);
				} else {
					console.error('queue length is greater then 500!');
				}
			} else {
				if (t.video.error) {
					console.error('HTMLMediaElement error ', t.video.error);
				}
				buffer.appendBuffer(binaryData);
				//console.log('append buffer', buffer.timestampOffset, buffer.buffered.start(0), buffer.buffered.end(0));
			}
			t.$video.trigger('m7PlayerMseStatus', [t.counters]);
		}

	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = [];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new VideoMseNoWorkers(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof VideoMseNoWorkers && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof VideoMseNoWorkers && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * video-mse без воркеров с
 * 
 * Author: Alexander Ivanov, ALGONT, 2017
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'videoMseNoWorkers2',
	    defaults = {
		autoplay: true,
		src: "",
		maxBuffer: 30, // максимальный размер буфера в секундах
		minBufferSizeToAppend: 10000, // байт, делаем свой собственный кэш буфера для решения проблемы затыка браузера при большом числе мелких пакетов
		mode: 'stable',
		videoMimeType: 'video/mp4;codecs="avc1.4d401f"'
	};

	function VideoMseNoWorkers2(element, options) {
		this.options = $.extend({}, defaults, options);
		this.$element = $(element);
		this.$video = this.$element;
		this.video = this.$element.get(0);
		window.MediaSource = window.MediaSource || window.WebKitMediaSource;
		this.init();
		if (this.options.src) {
			this.src(this.options.src);
		}
	}

	VideoMseNoWorkers2.prototype = {
		init: function init() {
			var t = this;
		},

		src: function src(data) {
			var t = this;
			console.log('videoMseNoWorkers2.src', data);
			this.counters = {
				updatestart: 0,
				update: 0,
				updateend: 0,
				error: 0,
				abort: 0,
				appendData: 0,
				updatingOnUpdate: 0,
				updatingOnAppendData: 0
			};

			if (t.websocket) {
				console.log('try to close websocket');
				t.websocket.close();
			}
			if (this.mediaSource) {
				this.init();
				if (this.mediaSource.readyState == 'open') {
					this.mediaSource.endOfStream();
				}
			}
			this.buffers = {};
			this.queues = {};
			this.mediaSource = new MediaSource();
			this.video.src = window.URL.createObjectURL(t.mediaSource);
			this.mediaSource.addEventListener('sourceopen', function (e) {
				if (data.codec) {
					t.options.videoMimeType = data.codec;
				}
				//t.mediaSource.duration = 30;
				try {
					t.websocket = new WebSocket(data.src);
					t.websocket.binaryType = "arraybuffer";
					t.cache = new ArrayBuffer();
					t.websocket.onmessage = function (e) {
						t._dispatchMessage(e.data);
					};
					t.websocket.onerror = function (e) {
						console.error('websocket error', e);
						t.$video.trigger('error', e);
					};
					t.websocket.onopen = function (e) {
						console.log('websocket open', e);
					};
					t.websocket.onclose = function (e) {
						console.log('websocket close', e);
					};
					t.$video.trigger('m7-newWebsocket', [t.websocket]);
				} catch (error) {
					t.$element.trigger('error', error);
				}
			});
		},

		_createSourceBuffers: function _createSourceBuffers(data) {
			var t = this;
			console.log('videoMseNoWorkers2 createSourceBuffers', data);
			var mimeType = this.options.videoMimeType;
			var buffer = t.buffers[data.id] = t.mediaSource.addSourceBuffer(mimeType);
			if (this.options.mode == 'debug') {
				buffer.mode = 'segments';
			} else {
				buffer.mode = 'sequence';
			}
			//buffer.timestampOffset = 15;
			var queue = t.queues[data.id] = [];
			t.$video.trigger('m7PlayerQueueChanged', [0]);

			buffer.addEventListener('updatestart', function () {
				t.counters.updatestart++;
			});

			buffer.addEventListener('update', function () {
				t.counters.update++;
				if (buffer.updating) {
					t.counters.updatingOnUpdate++;
				}
				if (queue.length > 0 && !buffer.updating) {
					buffer.appendBuffer(queue.shift());
					t.$video.trigger('m7PlayerQueueChanged', [queue.length]);
					//console.log('append buffer from queue', queue.length, buffer.timestampOffset, buffer.buffered.start(0), buffer.buffered.end(0));
				}
			});

			buffer.addEventListener('updateend', function () {
				t.counters.updateend++;
				if (t.options.maxBuffer && buffer.buffered.length) {
					var bufSize = buffer.buffered.end(buffer.buffered.length - 1) - buffer.buffered.start(buffer.buffered.length - 1);
					if (!buffer.updating && bufSize > t.options.maxBuffer * 2) {
						var startCut = 0; // Важно, т.к. FF 55 неточно сообщает buffered.start
						var endCut = buffer.buffered.start(buffer.buffered.length - 1) + bufSize - t.options.maxBuffer;
						//console.log('** try to reduce buffer', startCut, endCut/*, cache*/);
						buffer.remove(startCut, endCut);
					}
				}
			});

			buffer.addEventListener('error', function () {
				t.counters.error++;
			});

			buffer.addEventListener('abort', function () {
				t.counters.abort++;
			});
		},

		_dispatchMessage: function _dispatchMessage(rawData) {
			var t = this;
			var trackId = 'track';
			//console.log('_dispatchMessage', rawData instanceof ArrayBuffer, typeof(rawData));
			if (rawData instanceof ArrayBuffer) {
				// 12,4 = mfhd
				// 20,4 slice - segment.id
				// 36,4 = tfhd
				// 44,4 slice - track.id
				// 64,4 = tfdt
				// 72,8 slice - prestime
				// 84,4 = trun
				if (!t.buffers[trackId]) {
					t._createSourceBuffers({
						id: trackId
					});
				}
				//var view = new Uint8Array(rawData);

				var tmp = new Uint8Array(t.cache.byteLength + rawData.byteLength);
				tmp.set(new Uint8Array(t.cache), 0);
				tmp.set(new Uint8Array(rawData), t.cache.byteLength);
				t.cache = tmp.buffer;
				//console.log('dispatchMessage', t.cache.byteLength, rawData.byteLength);
				if (t.cache.byteLength >= t.options.minBufferSizeToAppend) {
					//console.log('dispatchMessage -append');
					t._appendData(trackId, t.cache);
					t.cache = new ArrayBuffer();
				}

				//t._appendData(view[47], view);
				//t._appendData(trackId, view);
			} else {
				var data = JSON.parse(rawData);

				if (data.streamMeta) {
					//console.log('streamMeta received', data);
					t.$video.trigger('m7MetadataReceived', [data.streamMeta, data.timestamp]);
				}
				if (data.type === 'mse_init_segment') {
					data.id = trackId;
					t._createSourceBuffers(data);
					if (data.correction) {
						t.$video.trigger('m7StreamTimeShiftReceived', [data.correction]);
					}
					if (data.streamData) {
						t._appendData(trackId, t._base64ToArrayBuffer(data.streamData));
					}
				} else if (data.type === 'mse_media_segment' && data.streamData) {
					t._appendData(trackId, t._base64ToArrayBuffer(data.streamData));
				}
			}
		},

		_appendData: function _appendData(trackId, binaryData) {
			var t = this;
			//console.log('_appendData', trackId, binaryData);
			t.counters.appendData++;
			if (!t.buffers[trackId]) {
				t._createSourceBuffers({
					id: trackId
				});
			}
			var buffer = t.buffers[trackId];
			var queue = t.queues[trackId];
			if (buffer.updating) {
				t.counters.updatingOnAppendData++;
			}
			if (buffer.updating || queue.length > 0) {
				if (queue.length < 500) {
					queue.push(binaryData);
				} else {
					console.error('queue length is greater then 500!');
				}
			} else {
				if (t.video.error) {
					console.error('HTMLMediaElement error ', t.video.error);
				}
				buffer.appendBuffer(binaryData);
				//console.log('append buffer', buffer.timestampOffset, buffer.buffered.start(0), buffer.buffered.end(0));
			}
			t.$video.trigger('m7PlayerMseStatus', [t.counters]);
		}

	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = [];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new VideoMseNoWorkers2(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof VideoMseNoWorkers2 && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof VideoMseNoWorkers2 && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * video-MSE 0.2 (workers!)
 * 
 * Author: Alexander Ivanov, ALGONT, 2017
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'videoMSE',
	    t,
	    // Глобальная переменная-указатель на экземпляр плагина
	defaults = {
		autoplay: true,
		cache: 0,
		src: "",
		maxBuffer: 5, // максимальный размер буфера в секундах
		mode: 'stable',
		videoMimeType: 'video/mp4;codecs="avc1.4d401f"',
		workersCount: 1
	};

	function VideoMSE(element, options) {
		this.options = $.extend({}, defaults, options);
		this.$element = $(element);
		this.$video = this.$element;
		this.video = this.$element.get(0);
		console.log('videoMSE regim!');

		var t = this;
		this.$element.closest('.m7Player').on('m7PlayerError', function () {
			console.log('VideoMSE: on m7PlayerError. Trying to remove socket ', t.objectURL);
			if (t.objectURL) {
				$(document).m7Workers('removeProcess', t.objectURL);
			}
		});

		$(document).m7Workers({
			workersCount: this.options.workersCount
		});

		window.MediaSource = window.MediaSource || window.WebKitMediaSource;
		this.init();
		if (this.options.src) {
			this.src(this.options.src);
		}
	}

	VideoMSE.prototype = {
		init: function init() {
			var t = this;
			t.lastRenew = 0;
			t.workerText = 'var websockets = {};\n\t\t\t\tvar timeout = 20000; // \u043C\u0441, \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0437\u0430\u0434\u0435\u0440\u0436\u043A\u0430 \u0434\u043B\u044F worker renew\n\t\t\t\t//var timeoutProcess = 10000; // \u043C\u0441, \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0437\u0430\u0434\u0435\u0440\u0436\u043A\u0430 \u0434\u043B\u044F \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439 \u043E\u0442 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0430 (\u0441\u043E\u043A\u0435\u0442\u0430)\n\t\t\t\tvar minBufferSizeToAppend; // \u0431\u0430\u0439\u0442, \u0434\u0435\u043B\u0430\u0435\u043C \u0441\u0432\u043E\u0439 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u043A\u044D\u0448 \u0431\u0443\u0444\u0435\u0440\u0430 \u0434\u043B\u044F \u0440\u0435\u0448\u0435\u043D\u0438\u044F \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u044B \u0437\u0430\u0442\u044B\u043A\u0430 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430 \u043F\u0440\u0438 \u0431\u043E\u043B\u044C\u0448\u043E\u043C \u0447\u0438\u0441\u043B\u0435 \u043C\u0435\u043B\u043A\u0438\u0445 \u043F\u0430\u043A\u0435\u0442\u043E\u0432\n\t\t\t\tvar trackId = \'track\';\t\t\t\t\n\t\t\t\tvar t = this;\n\t\t\t\tonmessage = function (e) { \n\t\t\t\t\t//console.log(\'onmessage in worker\', e.data);\n\t\t\t\t\tif (e.data.cmd == \'run\') {\n\t\t\t\t\t\tthis.addProcess(e.data);\n\t\t\t\t\t} else {\n\t\t\t\t\t\tif (typeof t[e.data.cmd] == \'function\') {\n\t\t\t\t\t\t\tt[e.data.cmd](e.data);\n\t\t\t\t\t\t}\t\t\t\t\t\t\n\t\t\t\t\t} \n\t\t\t\t\tdelete e;\n\t\t\t\t}\n\n\t\t\t\taddProcess = function (data) {\n\t\t        \ttry {\n\t\t        \t\tvar id = data.id;\n\t\t        \t\tif (!id) {\n\t\t        \t\t\tconsole.error(\'Websocket id is undefined\', data);\n\t\t        \t\t}\n\n\t\t\t\t\t\tif (websockets[id]) {\n\t\t        \t\t\tthis.removeProcess(id); // \u043D\u0430 \u0432\u0441\u044F\u043A\u0438\u0439\n\t\t        \t\t}\n\n\t\t        \t\tconsole.log(\'websocket run\', data);\n\t\t\t\t\t\twebsockets[id] = {};\n\t\t\t\t\t\twebsockets[id].video = new WebSocket(data.params.uri);\n\t\t\t\t\t\tminBufferSizeToAppend = data.params.cache;\n\t\t\t\t\t\tconsole.log(\'worker cache\', minBufferSizeToAppend);\n\t\t\t\t\t\twebsockets[id].video.binaryType = "arraybuffer";\n\t\t\t\t\t\twebsockets[id].video.cache = new ArrayBuffer();\n\t\t\t\t\t\twebsockets[id].video.lastKeepAlive = 0;\n\t\t\t\t\t\twebsockets[id].video.onmessage = function(e) {\n\t\t\t\t\t\t\t//console.log(\'websocket.onmessage\', e.data);\n\t\t\t\t\t\t\tdispatchMessage(id, websockets[id].video, e.data);\n\n\t\t\t\t\t\t\tvar now = new Date();\n\t\t\t\t\t\t\t//console.log(now - lastKeepAlive, now - lastKeepAlive > 10000);\n\t\t\t\t\t\t\tif (now - websockets[id].video.lastKeepAlive > 10000) {\n\t\t\t\t\t\t\t\tif (WebSocket.OPEN === websockets[id].video.readyState) {\n            \t\t\t\t\t\twebsockets[id].video.send(\'keepAlive\');\n        \t\t\t\t\t\t}\n\t\t\t\t\t\t\t\twebsockets[id].video.lastKeepAlive = now;\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\twebsockets[id].video.onerror = function(e) {\n\t\t\t\t\t\t\tconsole.error({\n\t\t\t\t\t\t\t\tmsg: \'video-mse websocket error\', \n\t\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\t\tdata: e\n\t\t\t\t\t\t\t});\n\t\t\t\t\t\t}\n\t\t\t\t\t\twebsockets[id].video.onopen = function(e) {\n\t\t\t\t\t\t\tconsole.log(\'worker video websocket open\', id, e);\n\t\t\t\t\t\t}\n\t\t\t\t\t\twebsockets[id].video.onclose = function(e) {\n\t\t\t\t\t\t\tconsole.log(\'worker video websocket close\', id, e);\n\t\t\t\t\t\t}\n\n\t\t\t\t\t\tif (data.params.metadata && data.params.metadata.uri) {\n\t\t\t\t\t\t\twebsockets[id].meta = new WebSocket(data.params.metadata.uri);\n\t\t\t\t\t\t\twebsockets[id].meta.lastKeepAlive = 0;\n\t\t\t\t\t\t\twebsockets[id].meta.onmessage = function(e) {\n\t\t\t\t\t\t\t\t//console.log(\'websocket.onmessage\', e.data);\n\t\t\t\t\t\t\t\tif (e.data != \'keepAlive\') {\n\t\t\t\t\t\t\t\t\tdispatchMessage(id, websockets[id].meta, e.data);\t\n\t\t\t\t\t\t\t\t}\t\t\t\t\t\t\t\t\t\n\n\t\t\t\t\t\t\t\tvar now = new Date();\n\t\t\t\t\t\t\t\t//console.log(now - lastKeepAlive, now - lastKeepAlive > 10000);\n\t\t\t\t\t\t\t\tif (now - websockets[id].meta.lastKeepAlive > 10000) {\n\t\t\t\t\t\t\t\t\tif (WebSocket.OPEN === websockets[id].meta.readyState) {\n                \t\t\t\t\t\twebsockets[id].meta.send(\'keepAlive\');\n            \t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\twebsockets[id].meta.lastKeepAlive = now;\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\twebsockets[id].meta.onerror = function(e) {\n\t\t\t\t\t\t\t\tconsole.error({\n\t\t\t\t\t\t\t\t\tmsg: \'meta-websocket error\', \n\t\t\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\t\t\tdata: e\n\t\t\t\t\t\t\t\t});\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\twebsockets[id].meta.onopen = function(e) {\n\t\t\t\t\t\t\t\tconsole.log(\'worker meta websocket open\', id, e);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\twebsockets[id].meta.onclose = function(e) {\n\t\t\t\t\t\t\t\tconsole.log(\'worker meta websocket close\', id, e);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\t// \u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043F\u043E\u0441\u0442\u0443\u043F\u043B\u0435\u043D\u0438\u044F \u0440\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u044B\u0445 \u0434\u0430\u043D\u043D\u044B\u0445\n\t\t\t\t\t\t/*websockets[id].checkIntervalId = setInterval(function () {\n\t\t\t\t\t\t\tvar time = new Date() - (websockets[id].lastRawDataDate || 0);\n\t\t\t\t\t\t\tconsole.log(\'Websocket checkInterval timeout\', time, id);\n\t\t\t\t\t\t\tif (time  > timeoutProcess) {\n\t\t\t\t\t\t\t\tconsole.error(\'Websocket checkInterval timeout expired\', time, id, websockets[id]);\n\t\t\t\t\t\t\t\tpostMessage({\n\t\t\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\t\t\tmsg: \'error\',\n\t\t\t\t\t\t\t\t});\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}, timeoutProcess/2);*/\n\t\t\t\t\t} catch (error) {\n\t\t\t\t\t\tconsole.error(\'worker error\', {\n\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\tmsg: \'error\', \n\t\t\t\t\t\t\tdata: error\n\t\t\t\t\t\t});\n\t\t\t\t\t}\t\t\t\t\n\t\t\t\t}\n\n\t\t\t\tremoveProcess = function (data) {\n\t\t\t\t\tvar id = data.processId;\n\t\t\t\t\tconsole.log(\'!! worker removeProcess: try to close websocket\', id, websockets[id], t.workerId, t.websockets);\n\t\t\t\t\tif (websockets[id]) {\n\t\t\t\t\t\tconsole.log(\'try to close websocket\', id);\n\t\t\t\t\t\t//clearInterval(websockets[id].checkIntervalId);\n\t\t\t\t\t\tif (websockets[id].video) {\n\t\t\t\t\t\t\twebsockets[id].video.close();\t\n\t\t\t\t\t\t}\t\t\t\t\t\t\n\t\t\t\t\t\tif (websockets[id].meta) {\n\t\t\t\t\t\t\twebsockets[id].meta.close();\t\n\t\t\t\t\t\t}\t\t\t\t\t\t\n\t\t\t\t\t\tdelete websockets[id];\n\t\t\t\t\t} else {\n\t\t\t\t\t\tconsole.error(\'trying to close undefined websocket\', id, websockets);\n\t\t\t\t\t}\n\t\t\t\t}\n\n\t\t\t\tdispatchMessage = function (id, websocket, rawData) {\n\t\t\t\t\t//console.log(\'worker dispatchMessage\', rawData instanceof ArrayBuffer, typeof(rawData));\n\t\t\t\t\t//console.log(\'_dispatchMessage\');\n\t\t\t\t\tif(rawData instanceof ArrayBuffer) {\n\t\t\t\t\t  // 12,4 = mfhd\n\t\t\t\t\t  // 20,4 slice - segment.id\n\t\t\t\t\t  // 36,4 = tfhd\n\t\t\t\t\t  // 44,4 slice - track.id\n\t\t\t\t\t  // 64,4 = tfdt\n\t\t\t\t\t  // 72,8 slice - prestime\n\t\t\t\t\t  // 84,4 = trun\n\t\t\t\t\t  //var view = new Uint8Array(rawData);\n\t\t\t\t\t  //t._appendData(view[47], view);\n\t\t\t\t\t  websockets[id].lastRawDataDate = new Date();\n\t\t \t\t\t\tvar tmp = new Uint8Array(websocket.cache.byteLength + rawData.byteLength);\n\t\t                tmp.set(new Uint8Array(websocket.cache), 0);\n\t\t                tmp.set(new Uint8Array(rawData), websocket.cache.byteLength);\n\t\t                websocket.cache = tmp;\n\t\t                delete tmp;\n\t\t                //console.log(\'dispatchMessage\', websockets[id].cache.byteLength, rawData.byteLength);\n\t\t                if (websocket.cache.byteLength >= minBufferSizeToAppend) {\n\t\t                \t//console.log(\'dispatchMessage -append\');\n\t\t                \tappendData(id, trackId, new Uint8Array(websocket.cache));\n\t\t                \tdelete websocket.cache;\n\t\t                \twebsocket.cache = new ArrayBuffer();\n\t\t                }\n\t\t                //appendData(id, trackId, rawData);\t\t\t\t  \t  \t\n\t\t\t\t\t} else {\n\t\t\t\t\t  //console.log(\'JSON received\', rawData);\n\t\t\t\t\t  var data = JSON.parse(rawData);\t\t\t\t\t  \n\t\t\t\t\t  \n\t\t\t\t\t  if (data.streamMeta) {\n\t\t\t\t\t\t//console.log(\'streamMeta received\', data);\n\t\t\t\t\t\tpostMessage({\n\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\tmsg: \'m7MetadataReceived\',\n\t\t\t\t\t\t\ttimestamp: data.timestamp,\n\t\t\t\t\t\t\tstreamMeta: data.streamMeta\t\t\t\t\t\t\t\n\t\t\t\t\t\t});\n\t\t\t\t\t  }\n\t\t\t\t\t  if (data.type === \'mse_init_segment\') {\n\t\t\t\t\t  \tconsole.log(\'mse_init_segment\', data);\n\t\t\t\t\t  \tdata.id = trackId;\n\t\t\t\t\t\tpostMessage({\n\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\tmsg: \'m7StreamTimeShiftReceived\',\n\t\t\t\t\t\t\tcorrection: data.correction,\n\t\t\t\t\t\t});\n\t\t\t\t\t  \t/*var hasAudio = data.audio || false;\n\t\t\t\t\t\tpostMessage({\n\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\tmsg: \'m7StreamHasAudioReceived\',\n\t\t\t\t\t\t\thasAudio: hasAudio\n\t\t\t\t\t\t});*/\n\t\t\t\t\t  }\n\t\t\t\t\t  delete data;\n\t\t\t\t\t}\t\t\t\t\t\n\t\t\t\t}\n\n\t\t\t\tappendData = function (id, trackId, arrayBuffer) {\n\t\t\t\t\tpostMessage({\n\t\t\t\t\t\tid: id,\n\t\t\t\t\t\tmsg: \'appendData\', \n\t\t\t\t\t\ttrackId: trackId,\n\t\t\t\t\t\tarrayBuffer: new Uint8Array(arrayBuffer)\n\t\t\t\t\t});\n\t\t\t\t}';
		},

		// Сброс плеера перед новым подключением
		reset: function reset() {
			console.log('videoMSE.reset');
			this.counters = {
				updatestart: 0,
				update: 0,
				updateend: 0,
				error: 0,
				abort: 0,
				appendData: 0,
				updatingOnUpdate: 0,
				updatingOnAppendData: 0
			};
			delete this.buffers;
			delete this.queues;
			if (this.mediaSource) {
				//this.mediaSource.removeEventListener('sourceopen', this._sourceopenAction);            
				this.init();
				delete this.mediaSource;
			}
			if (this.objectURL) {
				$(document).m7Workers('removeProcess', this.objectURL);
				window.URL.revokeObjectURL(this.objectURL);
				delete this.objectURL;
			}
		},

		src: function src(data) {
			var t = this;
			console.log('videoMSE.src', data);
			sendLog('videoMSE.src', data, getVideoContainerInfo(t.$video));
			this.reset();

			this.options.src = data;
			this.buffers = {};
			this.queues = {};
			this.mediaSource = new MediaSource();
			this.mediaSource.addEventListener('sourceopen', function () {
				//console.log('videoMSE before _sourceopenAction', t.objectURL);
				t._sourceopenAction();
			});
			this.objectURL = window.URL.createObjectURL(this.mediaSource);
			this.video.src = this.objectURL;
			console.log('videoMSE new video.src', this.objectURL);
		},

		_sourceopenAction: function _sourceopenAction() {
			var t = this;
			var data = t.options.src;
			console.log('videoMSE _sourceopenAction', data, t.objectURL);
			sendLog('videoMSE _sourceopenAction', t.objectURL, getVideoContainerInfo(t.$video));
			if (data.codec) {
				t.options.videoMimeType = data.codec;
			}

			$(document).m7Workers('addProcess', {
				workerType: 'algontWebsocket',
				processId: t.video.src,
				workerText: t.workerText,
				paramsToWorker: { // что будет передаваться в воркер
					uri: data.src,
					metadata: data.metadata,
					cache: t.options.cache
				},
				onMessage: function onMessage(data) {
					//console.log('onMessage', t.video.src, data);
					if (data.id != t.video.src) {
						console.error('Message with wrong id', data.id);
						sendLog('Message with wrong id', {
							id: data.id,
							player: getVideoContainerInfo(t.$video)
						});
						$(document).m7Workers('removeProcess', data.id);
						return;
					}
					//console.log('Message from worker', data);
					if (data.msg == 'appendData') {
						//console.log('append from worker', data);
						t._appendData(data.trackId, data.arrayBuffer);
						var now = new Date();
						if (now - t.lastRenew > 5000) {
							t.lastRenew = now;
							$(document).m7Workers('renew', data.id);
						}
					} else if (data.msg == 'm7StreamTimeShiftReceived') {
						t.$video.trigger('m7StreamTimeShiftReceived', [data.correction]);
						/*} else if (data.msg == 'm7StreamHasAudioReceived') {
      	t.$video.trigger('m7StreamHasAudioReceived', [data.hasAudio]);*/
					} else if (data.msg == 'm7MetadataReceived') {
						// Получены метаданные
						console.log('m7MetadataReceived', data.timestamp);
						t.$video.trigger('m7MetadataReceived', [data.streamMeta, data.timestamp]);
					} else if (data.msg == 'error') {
						t.$video.trigger('error', e);
						sendLog('Error message from worker', data, getVideoContainerInfo(t.$video));
					} else {
						console.error('Unknown answer from worker', data);
					}
				}
			});
		},

		_createSourceBuffers: function _createSourceBuffers(data) {
			var t = this;
			console.log('videoMSE createSourceBuffers', data);
			sendLog('videoMSE createSourceBuffers', data, getVideoContainerInfo(t.$video));
			var mimeType = this.options.videoMimeType;
			var buffer = t.buffers[data.id] = t.mediaSource.addSourceBuffer(mimeType);
			if (this.options.mode == 'debug') {
				buffer.mode = 'segments';
			} else {
				buffer.mode = 'sequence';
			}
			//buffer.mode = 'segments';
			var queue = t.queues[data.id] = [];
			t.$video.trigger('m7PlayerQueueChanged', [0]);

			buffer.addEventListener('updatestart', function () {
				t.counters.updatestart++;
			});

			buffer.addEventListener('update', function () {
				t.counters.update++;
				if (buffer.updating) {
					t.counters.updatingOnUpdate++;
				}
			});

			buffer.addEventListener('updateend', function () {
				t.counters.updateend++;
				if (queue.length > 0 && !buffer.updating) {
					buffer.appendBuffer(new Uint8Array(queue.shift()));
					t.$video.trigger('m7PlayerQueueChanged', [queue.length]);
					//console.log('append buffer from queue', queue.length, buffer.timestampOffset, buffer.buffered.start(0), buffer.buffered.end(0));
				}
				if (!buffer.updating && t.options.maxBuffer && buffer.buffered.length) {
					var bufSize = buffer.buffered.end(buffer.buffered.length - 1) - buffer.buffered.start(buffer.buffered.length - 1);
					if (bufSize > t.options.maxBuffer * 2) {
						var startCut = 0; // Важно, т.к. FF 55 неточно сообщает buffered.start
						var endCut = buffer.buffered.start(buffer.buffered.length - 1) + bufSize - t.options.maxBuffer;
						//console.log('** try to reduce buffer', startCut, endCut/*, cache*/);
						buffer.remove(startCut, endCut);
					}
				}
			});

			buffer.addEventListener('error', function () {
				t.counters.error++;
			});

			buffer.addEventListener('abort', function () {
				t.counters.abort++;
			});
		},

		/*_dispatchMessage: function (rawData) {
  	var t = this;
  	var trackId = 'track';
  	//console.log('_dispatchMessage', rawData instanceof ArrayBuffer, typeof(rawData));
  	if(rawData instanceof ArrayBuffer) {
  	  // 12,4 = mfhd
  	  // 20,4 slice - segment.id
  	  // 36,4 = tfhd
  	  // 44,4 slice - track.id
  	  // 64,4 = tfdt
  	  // 72,8 slice - prestime
  	  // 84,4 = trun
  	  if (!t.buffers[trackId]) {
  	  	t._createSourceBuffers({
  	  		id: trackId
  	  	});
  	  }
  	  var view = new Uint8Array(rawData);
  	  //t._appendData(view[47], view);
  	  t._appendData(trackId, view);
  	} else {
  	  var data = JSON.parse(rawData);
  	  
  	  if (data.streamMeta) {
  		//console.log('streamMeta received', data);
  		t.$video.trigger('m7MetadataReceived', [data.streamMeta, data.timestamp]);
  	  }
  	  if (data.type === 'MSE_init_segment') {
  	  	data.id = trackId;
  		t._createSourceBuffers(data);
  		if (data.correction) {
  			t.$video.trigger('m7StreamTimeShiftReceived', [data.correction]);
  	  	}
  		if (data.streamData) {
  	  		t._appendData(trackId, t._base64ToArrayBuffer(data.streamData));	
  		}				  
  	  } else if (data.type === 'MSE_media_segment' && data.streamData) {
  		t._appendData(trackId, t._base64ToArrayBuffer(data.streamData));
  	  }
  	}
  },*/

		_appendData: function _appendData(trackId, binaryData) {
			var t = this;
			//console.log('_appendData', trackId, binaryData);
			t.counters.appendData++;
			if (!t.buffers[trackId]) {
				t._createSourceBuffers({
					id: trackId
				});
			}
			var buffer = t.buffers[trackId];
			var queue = t.queues[trackId];

			/*sendLog('_appendData', {
   	'binaryData length': binaryData.length,
   	'queue.length': queue.length,
   	't.counters': t.counters
   }, getVideoContainerInfo(t.$video));*/

			if (buffer.updating) {
				//console.log('_appendData buffer.updating! queue=', queue.length);
				t.counters.updatingOnAppendData++;
			}
			if (buffer.updating || queue.length > 0) {
				t.$video.trigger('m7PlayerQueueChanged', [queue.length]);
				if (queue.length < 200) {
					queue.push(new Uint8Array(binaryData));
				} else {
					console.error('Queue length is over limit!', t.$video);
					sendLog('**error Queue length is over limit ' + queue.length, getVideoContainerInfo(t.$video));
					t.$video.trigger('m7PlayerError', 'Queue length is over limit!');
				}
			} else {
				if (t.video.error) {
					console.error('HTMLMediaElement error ', t.video.error);
					sendLog('**error HTMLMediaElement error', {
						msg: t.video.error,
						player: getVideoContainerInfo(t.$video)
					});
					t.$video.trigger('m7PlayerError', 'HTMLMediaElement error');
				} else {
					buffer.appendBuffer(new Uint8Array(binaryData));
				}
				//console.log('append buffer', buffer.timestampOffset, buffer.buffered.start(0), buffer.buffered.end(0));
			}
			t.$video.trigger('m7PlayerMSEStatus', [t.counters]);
		}
	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = [];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new VideoMSE(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof VideoMSE && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof VideoMSE && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * video-MSE 0.2 (workers!)
 * 
 * Author: Alexander Ivanov, ALGONT, 2017
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'videoMSE2',
	    t,
	    // Глобальная переменная-указатель на экземпляр плагина
	defaults = {
		autoplay: true,
		cache: 0,
		src: "",
		maxBuffer: 5, // максимальный размер буфера в секундах
		mode: 'stable',
		videoMimeType: 'video/mp4;codecs="avc1.4d401f"',
		workersCount: 1
	};

	function VideoMSE2(element, options) {
		this.options = $.extend({}, defaults, options);
		this.$element = $(element);
		this.$video = this.$element;
		this.video = this.$element.get(0);
		console.log('videoMSE2 regim!');

		$(document).m7Workers({
			workersCount: this.options.workersCount
		});

		window.MediaSource = window.MediaSource || window.WebKitMediaSource;
		this.init();
		if (this.options.src) {
			this.src(this.options.src);
		}
	}

	VideoMSE2.prototype = {
		init: function init() {
			var t = this;
			t.lastRenew = 0;
			t.workerText = 'var websockets = {};\n\t\t\t\tvar timeout = 20000; // \u043C\u0441, \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0437\u0430\u0434\u0435\u0440\u0436\u043A\u0430 \u0434\u043B\u044F renew\n\t\t\t\tvar minBufferSizeToAppend; // \u0431\u0430\u0439\u0442, \u0434\u0435\u043B\u0430\u0435\u043C \u0441\u0432\u043E\u0439 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u043A\u044D\u0448 \u0431\u0443\u0444\u0435\u0440\u0430 \u0434\u043B\u044F \u0440\u0435\u0448\u0435\u043D\u0438\u044F \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u044B \u0437\u0430\u0442\u044B\u043A\u0430 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430 \u043F\u0440\u0438 \u0431\u043E\u043B\u044C\u0448\u043E\u043C \u0447\u0438\u0441\u043B\u0435 \u043C\u0435\u043B\u043A\u0438\u0445 \u043F\u0430\u043A\u0435\u0442\u043E\u0432\n\t\t\t\tvar trackId = \'track\';\t\t\t\t\n\t\t\t\tvar t = this;\n\t\t\t\tonmessage = function (e) { \n\t\t\t\t\t//console.log(\'onmessage in worker\', e.data);\n\t\t\t\t\tif (e.data.cmd == \'run\') {\n\t\t\t        \ttry {\n\t\t\t        \t\tvar id = e.data.id;\n\t\t\t        \t\tif (!id) {\n\t\t\t        \t\t\tconsole.error(\'Websocket id is undefined\', e.data);\n\t\t\t        \t\t}\n\n\t\t\t\t\t\t\tif (websockets[id]) {\n\t\t\t        \t\t\tthis.removeProcess(id); // \u043D\u0430 \u0432\u0441\u044F\u043A\u0438\u0439\n\t\t\t        \t\t}\n\n\t\t\t        \t\tconsole.log(\'websocket run\', e.data);\n\t\t\t\t\t\t\twebsockets[id] = {};\n\t\t\t\t\t\t\twebsockets[id].video = new WebSocket(e.data.params.uri);\n\t\t\t\t\t\t\tminBufferSizeToAppend = e.data.params.cache;\n\t\t\t\t\t\t\tconsole.log(\'worker cache\', minBufferSizeToAppend);\n\t\t\t\t\t\t\twebsockets[id].video.binaryType = "arraybuffer";\n\t\t\t\t\t\t\twebsockets[id].video.cache = new ArrayBuffer();\n\t\t\t\t\t\t\twebsockets[id].video.onmessage = function(e) {\n\t\t\t\t\t\t\t\t//console.log(\'websocket.onmessage\', e.data);\n\t\t\t\t\t\t\t\tdispatchMessage(id, websockets[id].video, e.data);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\twebsockets[id].video.onerror = function(e) {\n\t\t\t\t\t\t\t\tconsole.error({\n\t\t\t\t\t\t\t\t\tmsg: \'websocket error\', \n\t\t\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\t\t\tdata: e\n\t\t\t\t\t\t\t\t});\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\twebsockets[id].video.onopen = function(e) {\n\t\t\t\t\t\t\t\t//console.log(\'worker websocket open\', e);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\twebsockets[id].video.onclose = function(e) {\n\t\t\t\t\t\t\t\t//console.log(\'worker websocket close\', e);\n\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t\tif (e.data.params.metadata && e.data.params.metadata.uri) {\n\t\t\t\t\t\t\t\twebsockets[id].meta = new WebSocket(e.data.params.metadata.uri);\n\t\t\t\t\t\t\t\twebsockets[id].meta.onmessage = function(e) {\n\t\t\t\t\t\t\t\t\t//console.log(\'websocket.onmessage\', e.data);\n\t\t\t\t\t\t\t\t\tdispatchMessage(id, websockets[id].meta, e.data);\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\twebsockets[id].meta.onerror = function(e) {\n\t\t\t\t\t\t\t\t\tconsole.error({\n\t\t\t\t\t\t\t\t\t\tmsg: \'meta-websocket error\', \n\t\t\t\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\t\t\t\tdata: e\n\t\t\t\t\t\t\t\t\t});\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\twebsockets[id].meta.onopen = function(e) {\n\t\t\t\t\t\t\t\t\t//console.log(\'worker websocket open\', e);\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\twebsockets[id].meta.onclose = function(e) {\n\t\t\t\t\t\t\t\t\t//console.log(\'worker websocket close\', e);\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t} catch (error) {\n\t\t\t\t\t\t\tconsole.error(\'worker error\', {\n\t\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\t\tmsg: \'error\', \n\t\t\t\t\t\t\t\tdata: error\n\t\t\t\t\t\t\t});\n\t\t\t\t\t\t}\t\t\t\t\n\t\t\t\t\t} else {\n\t\t\t\t\t\tif (typeof t[e.data.cmd] == \'function\') {\n\t\t\t\t\t\t\tt[e.data.cmd](e.data);\n\t\t\t\t\t\t}\t\t\t\t\t\t\n\t\t\t\t\t} \n\t\t\t\t\tdelete e;\n\t\t\t\t}\n\n\t\t\t\tremoveProcess = function (data) {\n\t\t\t\t\tvar id = data.processId;\n\t\t\t\t\t//console.log(\'!! worker removeProcess: try to close websocket\', id, t.websockets[id], t.workerId, t.websockets);\n\t\t\t\t\tif (t.websockets[id]) {\n\t\t\t\t\t\tconsole.log(\'try to close websocket\', id);\n\t\t\t\t\t\tif (t.websockets[id].video) {\n\t\t\t\t\t\t\tt.websockets[id].video.close();\t\n\t\t\t\t\t\t}\t\t\t\t\t\t\n\t\t\t\t\t\tif (t.websockets[id].meta) {\n\t\t\t\t\t\t\tt.websockets[id].meta.close();\t\n\t\t\t\t\t\t}\t\t\t\t\t\t\n\t\t\t\t\t\tdelete websockets[id];\n\t\t\t\t\t} else {\n\t\t\t\t\t\tconsole.error(\'trying to close undefined websocket\', id, t.websockets);\n\t\t\t\t\t}\n\t\t\t\t}\n\n\t\t\t\tdispatchMessage = function (id, websocket, rawData) {\n\t\t\t\t\t//console.log(\'worker dispatchMessage\', rawData instanceof ArrayBuffer, typeof(rawData));\n\t\t\t\t\t//console.log(\'_dispatchMessage\');\n\t\t\t\t\tif(rawData instanceof ArrayBuffer) {\n\t\t\t\t\t  // 12,4 = mfhd\n\t\t\t\t\t  // 20,4 slice - segment.id\n\t\t\t\t\t  // 36,4 = tfhd\n\t\t\t\t\t  // 44,4 slice - track.id\n\t\t\t\t\t  // 64,4 = tfdt\n\t\t\t\t\t  // 72,8 slice - prestime\n\t\t\t\t\t  // 84,4 = trun\n\t\t\t\t\t  //var view = new Uint8Array(rawData);\n\t\t\t\t\t  //t._appendData(view[47], view);\n\t\t \t\t\t\tvar tmp = new Uint8Array(websocket.cache.byteLength + rawData.byteLength);\n\t\t                tmp.set(new Uint8Array(websocket.cache), 0);\n\t\t                tmp.set(new Uint8Array(rawData), websocket.cache.byteLength);\n\t\t                websocket.cache = tmp;\n\t\t                delete tmp;\n\t\t                //console.log(\'dispatchMessage\', websockets[id].cache.byteLength, rawData.byteLength);\n\t\t                if (websocket.cache.byteLength >= minBufferSizeToAppend) {\n\t\t                \t//console.log(\'dispatchMessage -append\');\n\t\t                \tappendData(id, trackId, new Uint8Array(websocket.cache));\n\t\t                \tdelete websocket.cache;\n\t\t                \twebsocket.cache = new ArrayBuffer();\n\t\t                }\n\t\t                //appendData(id, trackId, rawData);\t\t\t\t  \t  \t\n\t\t\t\t\t} else {\n\t\t\t\t\t  //console.log(\'JSON received\', rawData);\n\t\t\t\t\t  var data = JSON.parse(rawData);\t\t\t\t\t  \n\t\t\t\t\t  \n\t\t\t\t\t  if (data.streamMeta) {\n\t\t\t\t\t\t//console.log(\'streamMeta received\', data);\n\t\t\t\t\t\tpostMessage({\n\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\tmsg: \'m7MetadataReceived\',\n\t\t\t\t\t\t\ttimestamp: data.timestamp,\n\t\t\t\t\t\t\tstreamMeta: data.streamMeta\t\t\t\t\t\t\t\n\t\t\t\t\t\t});\n\t\t\t\t\t  }\n\t\t\t\t\t  if (data.type === \'mse_init_segment\') {\n\t\t\t\t\t  \tconsole.log(\'mse_init_segment m7StreamTimeShiftReceived\');\n\t\t\t\t\t  \tdata.id = trackId;\n\t\t\t\t\t\tpostMessage({\n\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\tmsg: \'m7StreamTimeShiftReceived\',\n\t\t\t\t\t\t\tcorrection: data.correction\n\t\t\t\t\t\t});\n\t\t\t\t\t  }\n\t\t\t\t\t}\t\t\t\t\t\n\t\t\t\t}\n\n\t\t\t\tappendData = function (id, trackId, arrayBuffer) {\n\t\t\t\t\tpostMessage({\n\t\t\t\t\t\tid: id,\n\t\t\t\t\t\tmsg: \'appendData\', \n\t\t\t\t\t\ttrackId: trackId,\n\t\t\t\t\t\tarrayBuffer: new Uint8Array(arrayBuffer)\n\t\t\t\t\t});\n\t\t\t\t}';
		},

		src: function src(data) {
			var t = this;
			console.log('videoMSE2.src', data);
			sendLog('videoMSE2.src', data, getVideoContainerInfo(t.$video));
			this.counters = {
				updatestart: 0,
				update: 0,
				updateend: 0,
				error: 0,
				abort: 0,
				appendData: 0,
				updatingOnUpdate: 0,
				updatingOnAppendData: 0
			};

			if (this.mediaSource) {
				//this.mediaSource.removeEventListener('sourceopen', this._sourceopenAction);            
				this.init();
				delete this.mediaSource;
			}
			delete this.buffers;
			delete this.queues;
			this.options.src = data;
			this.buffers = {};
			this.queues = {};
			this.mediaSource = new MediaSource();
			this.mediaSource.addEventListener('sourceopen', function () {
				//console.log('videoMSE2 before _sourceopenAction', t.objectURL);
				t._sourceopenAction(t);
			});
			this.objectURL = window.URL.createObjectURL(this.mediaSource);
			this.video.src = this.objectURL;
			console.log('videoMSE2 new video.src', this.objectURL);
		},

		_sourceopenAction: function _sourceopenAction(t) {
			var data = t.options.src;
			console.log('videoMSE2 _sourceopenAction', data, t.objectURL);
			sendLog('videoMSE2 _sourceopenAction', t.objectURL, getVideoContainerInfo(t.$video));
			if (data.codec) {
				t.options.videoMimeType = data.codec;
			}

			$(document).m7Workers('addProcess', {
				workerType: 'algontWebsocket',
				processId: t.video.src,
				workerText: t.workerText,
				paramsToWorker: { // что будет передаваться в воркер
					uri: data.src,
					metadata: data.metadata,
					cache: t.options.cache
				},
				onMessage: function onMessage(data) {
					if (data.id != t.video.src) {
						console.error('Message with wrong id', data.id);
						sendLog('Message with wrong id', {
							id: data.id,
							player: getVideoContainerInfo(t.$video)
						});
						$(document).m7Workers('removeProcess', data.id);
						return;
					}
					//console.log('Message from worker', data);
					if (data.msg == 'appendData') {
						//console.log('append from worker', data);
						t._appendData(data.trackId, data.arrayBuffer);
						var now = new Date();
						if (now - t.lastRenew > 5000) {
							t.lastRenew = now;
							$(document).m7Workers('renew', data.id);
						}
					} else if (data.msg == 'm7StreamTimeShiftReceived') {
						t.$video.trigger('m7StreamTimeShiftReceived', [data.correction]);
					} else if (data.msg == 'm7MetadataReceived') {
						// Получены метаданные
						console.log('m7MetadataReceived', data.timestamp);
						t.$video.trigger('m7MetadataReceived', [data.streamMeta, data.timestamp]);
					} else if (data.msg == 'error') {
						t.$video.trigger('error', e);
						sendLog('Error message from worker', data, getVideoContainerInfo(t.$video));
					} else {
						console.error('Unknown answer from worker', data);
					}
				}
			});
		},

		_createSourceBuffers: function _createSourceBuffers(data) {
			var t = this;
			console.log('videoMSE2 createSourceBuffers', data);
			sendLog('videoMSE2 createSourceBuffers', data, getVideoContainerInfo(t.$video));
			var mimeType = this.options.videoMimeType;
			var buffer = t.buffers[data.id] = t.mediaSource.addSourceBuffer(mimeType);
			if (this.options.mode == 'debug') {
				buffer.mode = 'segments';
			} else {
				buffer.mode = 'sequence';
			}
			//buffer.mode = 'segments';
			var queue = t.queues[data.id] = [];
			t.$video.trigger('m7PlayerQueueChanged', [0]);

			buffer.addEventListener('updatestart', function () {
				t.counters.updatestart++;
			});

			buffer.addEventListener('update', function () {
				t.counters.update++;
				if (buffer.updating) {
					t.counters.updatingOnUpdate++;
				}
			});

			buffer.addEventListener('updateend', function () {
				t.counters.updateend++;
				if (queue.length > 0 && !buffer.updating) {
					buffer.appendBuffer(new Uint8Array(queue.shift()));
					t.$video.trigger('m7PlayerQueueChanged', [queue.length]);
					//console.log('append buffer from queue', queue.length, buffer.timestampOffset, buffer.buffered.start(0), buffer.buffered.end(0));
				}
				if (!buffer.updating && t.options.maxBuffer && buffer.buffered.length) {
					var bufSize = buffer.buffered.end(buffer.buffered.length - 1) - buffer.buffered.start(buffer.buffered.length - 1);
					if (bufSize > t.options.maxBuffer * 2) {
						var startCut = 0; // Важно, т.к. FF 55 неточно сообщает buffered.start
						var endCut = buffer.buffered.start(buffer.buffered.length - 1) + bufSize - t.options.maxBuffer;
						//console.log('** try to reduce buffer', startCut, endCut/*, cache*/);
						buffer.remove(startCut, endCut);
					}
				}
			});

			buffer.addEventListener('error', function () {
				t.counters.error++;
			});

			buffer.addEventListener('abort', function () {
				t.counters.abort++;
			});
		},

		/*_dispatchMessage: function (rawData) {
  	var t = this;
  	var trackId = 'track';
  	//console.log('_dispatchMessage', rawData instanceof ArrayBuffer, typeof(rawData));
  	if(rawData instanceof ArrayBuffer) {
  	  // 12,4 = mfhd
  	  // 20,4 slice - segment.id
  	  // 36,4 = tfhd
  	  // 44,4 slice - track.id
  	  // 64,4 = tfdt
  	  // 72,8 slice - prestime
  	  // 84,4 = trun
  	  if (!t.buffers[trackId]) {
  	  	t._createSourceBuffers({
  	  		id: trackId
  	  	});
  	  }
  	  var view = new Uint8Array(rawData);
  	  //t._appendData(view[47], view);
  	  t._appendData(trackId, view);
  	} else {
  	  var data = JSON.parse(rawData);
  	  
  	  if (data.streamMeta) {
  		//console.log('streamMeta received', data);
  		t.$video.trigger('m7MetadataReceived', [data.streamMeta, data.timestamp]);
  	  }
  	  if (data.type === 'MSE_init_segment') {
  	  	data.id = trackId;
  		t._createSourceBuffers(data);
  		if (data.correction) {
  			t.$video.trigger('m7StreamTimeShiftReceived', [data.correction]);
  	  	}
  		if (data.streamData) {
  	  		t._appendData(trackId, t._base64ToArrayBuffer(data.streamData));	
  		}				  
  	  } else if (data.type === 'MSE_media_segment' && data.streamData) {
  		t._appendData(trackId, t._base64ToArrayBuffer(data.streamData));
  	  }
  	}
  },*/

		_appendData: function _appendData(trackId, binaryData) {
			var t = this;
			//console.log('_appendData', trackId, binaryData);
			t.counters.appendData++;
			if (!t.buffers[trackId]) {
				t._createSourceBuffers({
					id: trackId
				});
			}
			var buffer = t.buffers[trackId];
			var queue = t.queues[trackId];

			/*sendLog('_appendData', {
   	'binaryData length': binaryData.length,
   	'queue.length': queue.length,
   	't.counters': t.counters
   }, getVideoContainerInfo(t.$video));*/

			if (buffer.updating) {
				t.counters.updatingOnAppendData++;
			}
			if (buffer.updating || queue.length > 0) {
				t.$video.trigger('m7PlayerQueueChanged', [queue.length]);
				if (queue.length < 200) {
					queue.push(new Uint8Array(binaryData));
				} else {
					console.error('Queue length is over limit!', t.$video);
					sendLog('**error Queue length is over limit ' + queue.length, getVideoContainerInfo(t.$video));
					t.$video.trigger('m7PlayerError', {
						reason: 'Queue length is over limit!'
					});
				}
			} else {
				if (t.video.error) {
					console.error('HTMLMediaElement error ', t.video.error);
					sendLog('**error HTMLMediaElement error', {
						msg: t.video.error,
						player: getVideoContainerInfo(t.$video)
					});
					t.$video.trigger('m7PlayerError', {
						reason: 'HTMLMediaElement error'
					});
				}
				buffer.appendBuffer(new Uint8Array(binaryData));
				//console.log('append buffer', buffer.timestampOffset, buffer.buffered.start(0), buffer.buffered.end(0));
			}
			t.$video.trigger('m7PlayerMSEStatus', [t.counters]);
		}
	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = [];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new VideoMSE2(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof VideoMSE2 && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof VideoMSE2 && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);

/*******************************************************************************
 * video-MSE 0.2 (тестовый вариант для поиска утечек!
 )
 * 
 * Author: Alexander Ivanov, ALGONT, 2017
 * 
 ******************************************************************************/

(function ($, window, document, undefined) {
	'use strict';

	var __slice = [].slice;
	var pluginName = 'videoMSE3',
	    defaults = {
		autoplay: true,
		src: "",
		maxBuffer: 30, // максимальный размер буфера в секундах
		mode: 'stable',
		videoMimeType: 'video/mp4;codecs="avc1.4d401f"',
		workersCount: 4
	};

	function VideoMSE3(element, options) {
		//this.options = $.extend({}, defaults, options);
		//this.$element = $(element);		
		//this.$video = this.$element;
		//this.video = this.$element.get(0);

		/*$(document).m7Workers({
  	workersCount: this.options.workersCount
  });*/

		//window.MediaSource = window.MediaSource || window.WebKitMediaSource;
		//this.init();
		//if (this.options.src) {
		//this.src(this.options.src);
		//}		
	}

	VideoMSE3.prototype = {
		init: function init() {
			var t = this;

			t.workerText = 'var websockets = {};\n\t\t\t\tvar timeout = 20000; // \u043C\u0441, \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0437\u0430\u0434\u0435\u0440\u0436\u043A\u0430 \u0434\u043B\u044F renew\n\t\t\t\tvar minBufferSizeToAppend = 10000; // \u0431\u0430\u0439\u0442, \u0434\u0435\u043B\u0430\u0435\u043C \u0441\u0432\u043E\u0439 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u043A\u044D\u0448 \u0431\u0443\u0444\u0435\u0440\u0430 \u0434\u043B\u044F \u0440\u0435\u0448\u0435\u043D\u0438\u044F \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u044B \u0437\u0430\u0442\u044B\u043A\u0430 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430 \u043F\u0440\u0438 \u0431\u043E\u043B\u044C\u0448\u043E\u043C \u0447\u0438\u0441\u043B\u0435 \u043C\u0435\u043B\u043A\u0438\u0445 \u043F\u0430\u043A\u0435\u0442\u043E\u0432\n\t\t\t\tvar trackId = \'track\';\t\t\t\t\n\t\t\t\tvar t = this;\n\t\t\t\tonmessage = function (e) { \n\t\t\t\t\tconsole.log(\'onmessage in worker\', e.data);\n\t\t\t\t\tif (e.data.cmd == \'run\') {\n\t\t\t        \ttry {\n\t\t\t        \t\tvar id = e.data.id;\n\t\t\t        \t\tif (!id) {\n\t\t\t        \t\t\tconsole.error(\'Websocket id is undefined\', e.data);\n\t\t\t        \t\t}\n\n\t\t\t\t\t\t\tif (websockets[id]) {\n\t\t\t\t\t\t\t\tconsole.log(\'try to close websocket\');\n\t\t\t\t\t\t\t\twebsockets[id].close();\n\t\t\t\t\t\t\t\tdelete websockets[id];\n\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t\twebsockets[id] = new WebSocket(e.data.params.uri);\n\t\t\t\t\t\t\twebsockets[id].binaryType = "arraybuffer";\n\t\t\t\t\t\t\twebsockets[id].cache = new ArrayBuffer();\n\t\t\t\t\t\t\twebsockets[id].onmessage = function(e) {\n\t\t\t\t\t\t\t\t//console.log(\'websocket.onmessage\', e.data);\n\t\t\t\t\t\t\t\tdispatchMessage(id, e.data);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\twebsockets[id].onerror = function(e) {\n\t\t\t\t\t\t\t\tconsole.error({\n\t\t\t\t\t\t\t\t\tmsg: \'websocket error\', \n\t\t\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\t\t\tdata: e\n\t\t\t\t\t\t\t\t});\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\twebsockets[id].onopen = function(e) {\n\t\t\t\t\t\t\t\t//console.log(\'worker websocket open\', e);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\twebsockets[id].onclose = function(e) {\n\t\t\t\t\t\t\t\t//console.log(\'worker websocket close\', e);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t} catch (error) {\n\t\t\t\t\t\t\tconsole.error(\'worker error\', {\n\t\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\t\tmsg: \'error\', \n\t\t\t\t\t\t\t\tdata: error\n\t\t\t\t\t\t\t});\n\t\t\t\t\t\t}\t\t\t\t\n\t\t\t\t\t} else {\n\t\t\t\t\t\tif (typeof t[e.data.cmd] == \'function\') {\n\t\t\t\t\t\t\tt[e.data.cmd](e.data);\n\t\t\t\t\t\t}\t\t\t\t\t\t\n\t\t\t\t\t} \n\t\t\t\t}\n\n\t\t\t\tbase64ToArrayBuffer = function (base64) {\n\t\t\t\t\treturn Uint8Array.from(atob(base64), function(c) {\n\t\t\t\t\t\treturn c.charCodeAt(0);\n\t\t\t\t\t});\n\t\t\t\t}\n\n\n\t\t\t\tdispatchMessage = function (id, rawData) {\n\t\t\t\t\t//console.log(\'worker dispatchMessage\', rawData instanceof ArrayBuffer, typeof(rawData));\n\t\t\t\t\t//console.log(\'_dispatchMessage\');\n\t\t\t\t\tif(rawData instanceof ArrayBuffer) {\n\t\t\t\t\t  // 12,4 = mfhd\n\t\t\t\t\t  // 20,4 slice - segment.id\n\t\t\t\t\t  // 36,4 = tfhd\n\t\t\t\t\t  // 44,4 slice - track.id\n\t\t\t\t\t  // 64,4 = tfdt\n\t\t\t\t\t  // 72,8 slice - prestime\n\t\t\t\t\t  // 84,4 = trun\n\t\t\t\t\t  //var view = new Uint8Array(rawData);\n\t\t\t\t\t  //t._appendData(view[47], view);\n\t\t \t\t\t\tvar tmp = new Uint8Array(websockets[id].cache.byteLength + rawData.byteLength);\n\t\t                tmp.set(new Uint8Array(websockets[id].cache), 0);\n\t\t                tmp.set(new Uint8Array(rawData), websockets[id].cache.byteLength);\n\t\t                websockets[id].cache = tmp.buffer;\n\t\t                delete tmp;\n\t\t                //console.log(\'dispatchMessage\', websockets[id].cache.byteLength, rawData.byteLength);\n\t\t                if (websockets[id].cache.byteLength >= minBufferSizeToAppend) {\n\t\t                \t//console.log(\'dispatchMessage -append\');\n\t\t                \tappendData(id, trackId, websockets[id].cache);\n\t\t                \tdelete websockets[id].cache;\n\t\t                \twebsockets[id].cache = new ArrayBuffer();\n\t\t                }\n\t\t                //appendData(id, trackId, rawData);\t\t\t\t  \t  \t\n\t\t\t\t\t} else {\n\t\t\t\t\t  var data = JSON.parse(rawData);\n\t\t\t\t\t  console.log(\'JSON received\', data);\n\t\t\t\t\t  \n\t\t\t\t\t  if (data.streamMeta) {\n\t\t\t\t\t\t//console.log(\'streamMeta received\', data);\n\t\t\t\t\t\tpostMessage({\n\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\tmsg: \'m7MetadataReceived\',\n\t\t\t\t\t\t\ttimestamp: data.timestamp,\n\t\t\t\t\t\t\tstreamMeta: data.streamMeta\t\t\t\t\t\t\t\n\t\t\t\t\t\t});\n\t\t\t\t\t  }\n\t\t\t\t\t  if (data.type === \'MSE_init_segment\') {\n\t\t\t\t\t  \tdata.id = trackId;\n\t\t\t\t\t\tpostMessage({\n\t\t\t\t\t\t\tid: id,\n\t\t\t\t\t\t\tmsg: \'m7StreamTimeShiftReceived\',\n\t\t\t\t\t\t\tcorrection: data.correction\n\t\t\t\t\t\t});\n\t\t\t\t\t  }\n\t\t\t\t\t}\t\t\t\t\t\n\t\t\t\t}\n\n\t\t\t\tappendData = function (id, trackId, arrayBuffer) {\n\t\t\t\t\tpostMessage({\n\t\t\t\t\t\tid: id,\n\t\t\t\t\t\tmsg: \'appendData\', \n\t\t\t\t\t\ttrackId: trackId,\n\t\t\t\t\t\tarrayBuffer: arrayBuffer\n\t\t\t\t\t});\n\t\t\t\t}';
		},

		src: function src(data) {
			var t = this;
			console.log('videoMSE3.src', data);
			this.counters = {
				updatestart: 0,
				update: 0,
				updateend: 0,
				error: 0,
				abort: 0,
				appendData: 0,
				updatingOnUpdate: 0,
				updatingOnAppendData: 0
			};

			if (this.mediaSource) {
				this.init();
				if (this.mediaSource.readyState == 'open') {
					this.mediaSource.endOfStream();
				}
			}
			this.buffers = {};
			this.queues = {};
			this.mediaSource = new MediaSource();
			this.video.src = window.URL.createObjectURL(t.mediaSource);
			this.mediaSource.addEventListener('sourceopen', function (e) {
				if (data.codec) {
					t.options.videoMimeType = data.codec;
				}

				$(document).m7Workers('addProcess', {
					workerType: 'algontWebsocket',
					//processId: data.src,
					workerText: t.workerText,
					paramsToWorker: { // что будет передаваться в воркер
						uri: data.src
					},
					onMessage: function onMessage(data) {
						if (data.msg == 'appendData') {
							//console.log('append from worker', data);
							t._appendData(data.trackId, data.arrayBuffer);
							//console.log('worker renew command', data);
							$(document).m7Workers('renew', data.id);
						} else if (data.msg == 'm7StreamTimeShiftReceived') {
							t.$video.trigger('m7StreamTimeShiftReceived', [data.correction]);
						} else if (data.msg == 'error') {
							t.$video.trigger('error', e);
						} else {
							console.error('Unknown answer from worker', data);
						}
					}
				});
			});
		},

		_createSourceBuffers: function _createSourceBuffers(data) {
			var t = this;
			console.log('videoMSE3 createSourceBuffers', data);
			var mimeType = this.options.videoMimeType;
			var buffer = t.buffers[data.id] = t.mediaSource.addSourceBuffer(mimeType);
			if (this.options.mode == 'debug') {
				buffer.mode = 'segments';
			} else {
				buffer.mode = 'sequence';
			}
			//buffer.timestampOffset = 15;
			var queue = t.queues[data.id] = [];
			t.$video.trigger('m7PlayerQueueChanged', [0]);

			buffer.addEventListener('updatestart', function () {
				t.counters.updatestart++;
			});

			buffer.addEventListener('update', function () {
				t.counters.update++;
				if (buffer.updating) {
					t.counters.updatingOnUpdate++;
				}
				if (queue.length > 0 && !buffer.updating) {
					buffer.appendBuffer(queue.shift());
					t.$video.trigger('m7PlayerQueueChanged', [queue.length]);
					//console.log('append buffer from queue', queue.length, buffer.timestampOffset, buffer.buffered.start(0), buffer.buffered.end(0));
				}
			});

			buffer.addEventListener('updateend', function () {
				t.counters.updateend++;
				if (t.options.maxBuffer && buffer.buffered.length) {
					var bufSize = buffer.buffered.end(buffer.buffered.length - 1) - buffer.buffered.start(buffer.buffered.length - 1);
					if (!buffer.updating && bufSize > t.options.maxBuffer * 2) {
						var startCut = 0; // Важно, т.к. FF 55 неточно сообщает buffered.start
						var endCut = buffer.buffered.start(buffer.buffered.length - 1) + bufSize - t.options.maxBuffer;
						//console.log('** try to reduce buffer', startCut, endCut/*, cache*/);
						buffer.remove(startCut, endCut);
					}
				}
			});

			buffer.addEventListener('error', function () {
				t.counters.error++;
			});

			buffer.addEventListener('abort', function () {
				t.counters.abort++;
			});
		},

		_appendData: function _appendData(trackId, binaryData) {
			var t = this;
			//console.log('_appendData', trackId, binaryData);
			t.counters.appendData++;
			if (!t.buffers[trackId]) {
				t._createSourceBuffers({
					id: trackId
				});
			}
			var buffer = t.buffers[trackId];
			var queue = t.queues[trackId];
			if (buffer.updating) {
				t.counters.updatingOnAppendData++;
			}
			if (buffer.updating || queue.length > 0) {
				t.$video.trigger('m7PlayerQueueChanged', [queue.length]);
				if (queue.length < 500) {
					queue.push(binaryData);
				} else {
					console.error('Queue length is greater then 500!', t.$video);
					t.$video.trigger('m7PlayerError', {
						reason: 'Queue length is greater then 500!'
					});
				}
			} else {
				if (t.video.error) {
					console.error('HTMLMediaElement error ', t.video.error);
				}
				buffer.appendBuffer(binaryData);
				//console.log('append buffer', buffer.timestampOffset, buffer.buffered.start(0), buffer.buffered.end(0));
			}
			t.$video.trigger('m7PlayerMSEStatus', [t.counters]);
		}

	};

	$.fn[pluginName] = function (options) {
		$.fn[pluginName].getters = [];
		var args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin-' + pluginName)) {
					$.data(this, 'plugin-' + pluginName, new VideoMSE3(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			if (Array.prototype.slice.call(arguments, 1).length === 0 && $.inArray(options, $.fn[pluginName].getters) !== -1) {
				var instance = $.data(this[0], 'plugin-' + pluginName);
				if (instance instanceof VideoMSE3 && typeof instance[options] === 'function') {
					return instance[options].apply(instance, args);
				}
			} else {
				return this.each(function () {
					var instance = $.data(this, 'plugin-' + pluginName);
					if (instance instanceof VideoMSE3 && typeof instance[options] === 'function') {
						instance[options].apply(instance, args);
					}
				});
			}
		}
	};
})(jQuery, window, document);
