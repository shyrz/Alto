var html = $('html');
var body = $('body');

window.lazySizesConfig = window.lazySizesConfig || {};
window.lazySizesConfig.loadHidden = false;

document.addEventListener('lazyloaded', function (e) {
  'use strict';
  if ($(e.target).parent('.site-cover').length) {
    $(e.target).parent().addClass('initialized');
  }
});


/**
 * Global
 */
$(function () {
  'use strict';
  
  whiteLogo();
  carousel();
  video();
  // player();
  podcast();
  gallery();
  author();
  offCanvas();

  $('.js-scrolltop').on('click', () => {
    $('html, body').animate({
      scrollTop: 0
    }, 500)
  });
  window.addEventListener('scroll', onScrolling, { passive: true });
});

$(window).on('load', () => {
  darkMode();
  prepareProgressCircle();
});



function config() {
  if (typeof config != 'undefined') {
    
  }
}

/**
 * Dark Mode
 */
function darkMode() {
  $('.toggle-track').on('click', function () {
    if (html.hasClass('dark-mode')) {
      html.removeClass('dark-mode')
      localStorage.setItem('PROSE_DARKMODE', false);
    } else {
      html.addClass('dark-mode');
      localStorage.setItem('PROSE_DARKMODE', true);
    }
  });
}


function whiteLogo() {
  if (typeof gh_white_logo != 'undefined') {
    var whiteImage = '<img class="logo-image white" src="' + gh_white_logo + '">';
    $('.logo').append(whiteImage);
  }
}


function podcast() {
  'use strict';
  const PODCAST = $('.podcast-player');
  const AUDIO = $('audio.podcast-audio');
  const MEDIA = PODCAST.find('.podcast-media');
	const IMAGE = PODCAST.find('.podcast-image');
	const TITLE = PODCAST.find('.podcast-title');
	const META = PODCAST.find('.podcast-meta');
  const META_DATE = PODCAST.find('.podcast-meta-date');
  const META_TAGS = PODCAST.find('.podcast-meta-tags');
	const PROGRESS = $('.podcast-progress');
  let SPEED = 1;
  let BUTTON_EPISODE;
  const BUTTON_MEDIA = $('.podcast-media-button');
  // const BUTTON_PAUSE = $('.podcast-button-pause');
  const BUTTON_BACKWARD = $('.podcast-button-backward');
  const BUTTON_FORWARD = $('.podcast-button-forward');
  const BUTTON_SPEED = $('.podcast-button-speed');
  const TIME_CURRENT = $('.podcast-time-current');
  const TIME_DURATION = $('.podcast-time-duration');

  // console.log('[MEDIA]:', MEDIA);
  // console.log('[IMAGE]:', IMAGE);
  // console.log('[TITLE]:', TITLE);
  // console.log('[META]:', META);

  $('.site').on('click', '.podcast-js', function (e) {
    const $this = $(this);
    const $podcast = $this.closest('.post');
    const $meta = $podcast.find('.post-meta');
    const url = $this.attr('data-url');
    const id = $this.attr('data-id');

    PODCAST.addClass('podcast-active');
    

    // console.log($this, $podcast, url, id);

    // if ($('.podcast-player-external').length) {
		// 	body.addClass('podcast-player-opened');
		// }

    if (id !== MEDIA.attr('data-id')) {
			// Change audio player url
			AUDIO.attr('src', url);

			// Change player thumbnail and call lazySizes
			IMAGE.attr(
        'src',
        $this.find('.post-image').attr('src')
      ).attr(
        'data-srcset',
        $this.find('.post-image').attr('data-srcset')
      );
			lazySizes.loader.unveil(IMAGE[0]);

			// Change player title
			TITLE.html($this.closest('.post').find('.post-title').html());

			// Change player meta
			// META.html($this.closest('.post').find('.post-meta').html());
      META_DATE.text($meta.find('.post-meta-date').text());
      META_TAGS.html($meta.find('.post-meta-tags').html());


			// Make previous episode button pause
			// $('.post-' + MEDIA.attr('data-id'))
			// 	.find('.icon')
			// 	.removeClass('.icon-button-pause');

			// Change player media id attribute
			MEDIA.attr('data-id', id);
			BUTTON_MEDIA.attr('data-id', id);

			// Select current episode button

			BUTTON_EPISODE = $this.find('[data-id="' + id + '"]').find('.icon-button-play');
      console.log("[PODCAST:BUTTON_EPISODE]", BUTTON_EPISODE);
		}

    
    // Start & Pause
    if (AUDIO[0].paused) {
      let PLAY = AUDIO[0].play();
      if (PLAY !== undefined) {
      
        PLAY.then(_ => {
          // Make clicked button pause
          $this.find('.icon').removeClass('icon-button-play').addClass('icon-button-pause');
          // Make playing episode button pause
          if (BUTTON_EPISODE) {
            BUTTON_EPISODE.removeClass('icon-button-play').addClass('icon-button-pause');
          }
          BUTTON_MEDIA.find('.icon-button-play').removeClass('icon-button-play').addClass('icon-button-pause');
        })
        .catch(error => { console.log(error); });
      }
      console.log('[PODCAST:PLAY]');
    } else {
			AUDIO[0].pause();
			// Make clicked button play
			$this.find('.icon').removeClass('icon-button-pause').addClass('icon-button-play');
			// Make paused episode button play
			if (BUTTON_EPISODE) {
				BUTTON_EPISODE.removeClass('icon-button-pause').addClass('icon-button-play');
			}
      BUTTON_MEDIA.find('.icon-button-pause').removeClass('icon-button-pause').addClass('icon-button-play');
      console.log('[PODCAST:PAUSE]');
		}
    
    // Track Audio Progress
    AUDIO.on('loadedmetadata', function () {
      TIME_DURATION.text(new Date(AUDIO[0].duration * 1000).toISOString().substr(11, 8));
      AUDIO[0].addEventListener('timeupdate', function (e) {
        TIME_CURRENT.text(new Date(e.target.currentTime * 1000).toISOString().substr(11, 8));
        PROGRESS.css('width', (e.target.currentTime / AUDIO[0].duration) * 100 + '%');
      });
    });

    // Audio Backward
    BUTTON_BACKWARD.on('click', function () {
      AUDIO[0].currentTime = AUDIO[0].currentTime - 15;
    });
  
    // Audio Farward
    BUTTON_FORWARD.on('click', function () {
      AUDIO[0].currentTime = AUDIO[0].currentTime + 15;
    });
  
    // Audio Speed
    BUTTON_SPEED.on('click', function () {
      if (SPEED < 2) {
        SPEED += 0.1;
      } else {
        SPEED = 0.5;
      }
      AUDIO[0].playbackRate = SPEED;
      BUTTON_SPEED.text(SPEED.toFixed(1) + '×');
    });
  });
}


let $aosWrapper = null
let $progressCircle = null
let lastScrollingY = window.pageYOffset - 100
let lastWindowHeight = 0
let lastDocumentHeight = 0
let circumference = 0
let isTicking = false

const onScrolling = () => {
  lastScrollingY = window.pageYOffset - 100
  requestTicking()
}

const onResizing = () => {
  setHeights()
  // adjustShare(100)

  setTimeout(() => {
    setCircleStyles()
    requestTicking()
  }, 200)
}

const requestTicking = () => {
  if (!isTicking) {
    requestAnimationFrame(updating)
  }

  isTicking = true
}

const updating = () => {
  const progressMax = lastDocumentHeight - lastWindowHeight
  const percent = Math.ceil((lastScrollingY / progressMax) * 100)

  if (percent <= 100) {
    setProgress(percent)
  }

  isTicking = false
}

const setHeights = () => {
  lastWindowHeight = window.innerHeight
  lastDocumentHeight = $(document).height()
}

const setCircleStyles = () => {
  const svgWidth = $progressCircle.parent().width();
  const radiusCircle = svgWidth / 2
  const borderWidth = 3

  $progressCircle.parent().attr('viewBox', `0 0 ${svgWidth} ${svgWidth}`)
  $progressCircle.attr('stroke-width', borderWidth)
  $progressCircle.attr('r', radiusCircle - (borderWidth - 1))
  $progressCircle.attr('cx', radiusCircle)
  $progressCircle.attr('cy', radiusCircle)

  circumference = radiusCircle * 2 * Math.PI

  $progressCircle[0].style.strokeDasharray = `${circumference} ${circumference}`
  $progressCircle[0].style.strokeDashoffset = circumference
}

const setProgress = (percent) => {
  if (percent <= 100) {
    const offset = circumference - percent / 100 * circumference
    $progressCircle[0].style.strokeDashoffset = offset
  }
}

const prepareProgressCircle = () => {
  $progressCircle = $('.js-progress')

  setHeights()
  setCircleStyles()
  updating()

  setTimeout(() => {
    $progressCircle.parent().css('opacity', 1)
  }, 300)
}




function carousel() {
  var carousel = $('.carousel');
  var postImage = carousel.find('.post-image');
  var imageHeight, nav;

  function moveNav() {
    imageHeight = postImage.height();
    if (!nav) {
      nav = carousel.find('.owl-prev, .owl-next');
    }
    nav.css({
      top: imageHeight / 2 + 'px',
      opacity: 1,
    });
  }

  carousel.owlCarousel({
    dots: false,
    margin: 20,
    nav: true,
    navText: [
      '<i class="icon icon-left-arrow"></i>',
      '<i class="icon icon-right-arrow"></i>',
    ],
    onInitialized: function () {
      moveNav();
    },
    onResized: function () {
      moveNav();
    },
    responsive: {
      0: {
        items: 1,
      },
      768: {
        items: 3,
      },
      992: {
        items: 4,
      },
    },
  });
}

function video() {
  'use strict';
  $('.post-content').fitVids();
}

function gallery() {
  var images = document.querySelectorAll('.kg-gallery-image img');
  images.forEach(function (image) {
    var container = image.closest('.kg-gallery-image');
    var width = image.attributes.width.value;
    var height = image.attributes.height.value;
    var ratio = width / height;
    container.style.flex = ratio + ' 1 0%';
  });
}

function author() {
  $('.author-name').on('click', function () {
    $(this).next('.author-social').toggleClass('enabled');
  });
}

function offCanvas() {
  var burger = $('.burger');
  var canvasClose = $('.canvas-close');

  $('.nav-list').slicknav({
    label: '',
    prependTo: '.mobile-menu',
  });

  burger.on('click', function () {
    html.toggleClass('canvas-opened');
    html.addClass('canvas-visible');
    dimmer('open', 'medium');
  });

  canvasClose.on('click', function () {
    if (html.hasClass('canvas-opened')) {
      html.removeClass('canvas-opened');
      dimmer('close', 'medium');
    }
  });

  $('.dimmer').on('click', function () {
    if (html.hasClass('canvas-opened')) {
      html.removeClass('canvas-opened');
      dimmer('close', 'medium');
    }
  });

  $(document).keyup(function (e) {
    if (e.keyCode == 27 && html.hasClass('canvas-opened')) {
      html.removeClass('canvas-opened');
      dimmer('close', 'medium');
    }
  });
}

function dimmer(action, speed) {
  'use strict';

  var dimmer = $('.dimmer');

  switch (action) {
    case 'open':
      dimmer.fadeIn(speed);
      break;
    case 'close':
      dimmer.fadeOut(speed);
      break;
  }
}
