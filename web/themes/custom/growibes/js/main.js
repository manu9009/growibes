(function($, Drupal, window, document, undefined) {
  'use strict';
  Drupal.behaviors.atrct = {
    attach: function(context, settings) {

      $('.accordion-container .content-entry .article-title', context).click(function() {
        $(this).next(".accordion-content").slideToggle();
        $(this).toggleClass('active');
      	$(this).closest(".content-entry").siblings().find('.accordion-content').slideUp();
        $(this).closest(".content-entry").siblings().find('.article-title').removeClass('active');
      });

      function sticky_relocate() {
          var window_top = $(window).scrollTop();
          var footer_top = $("footer").offset().top;
          var div_top = $('#stickynav');
          if(div_top) {
            div_top = div_top.offset().top;
          }
          var div_height = $(".stickyTab-custom").height();

          var padding = 20;  // tweak here or get from margins etc

          if (window_top + div_height > footer_top - padding)
              $('.stickyTab-custom').css({top: (window_top + div_height - footer_top + padding) * -1})
          else if (window_top > div_top) {
              $('.stickyTab-custom').addClass('stick');
              $('.stickyTab-custom').css({top: 0})
          } else {
              $('.stickyTab-custom').removeClass('stick');
          }
      }

      $(function () {
          $(window).scroll(sticky_relocate);
          sticky_relocate();
      });


      $(document).ajaxSuccess(function(event, xhr, settings) {
        var getlinkvalue = $('.links .selectric-scroll li', context);
        getlinkvalue.click(function() {
          $('.custom-selects .form-actions .btn').trigger('click');
        });
      });
      $(document).ready(function() {
        var getlinkvalue = $('.links .selectric-scroll li', context);
        getlinkvalue.click(function() {
          $('.custom-selects .form-actions .btn').trigger('click');
        });
      });

      var getPathName = window.location.pathname;
      var get404Errorpages = $('body');

      if (get404Errorpages.length > 0) {
        var scroll = new LocomotiveScroll({
          el: document.querySelector('#js-scroll'),
          smooth: false,
          getSpeed: false,
          getDirection: true,
          useKeyboard: true,
        });
      } else {
        var scroll = new LocomotiveScroll({
          el: document.querySelector('#js-scroll'),
          smooth: true,
          getSpeed: true,
          getDirection: true,
          useKeyboard: true,
        });
      }
      var eventButton = $('.event_popup_button', context);
      eventButton.click(function() {
        var titlevalue = $(this).attr('data-title');
        var trimmedValue = $.trim(titlevalue);
        $('.webform-submission-events-form #edit-event').val(trimmedValue);
      });
      var atrc = {
        init: function() {
          document.documentElement.classList.add('is-loaded');
          document.documentElement.classList.remove('is-loading');
          Splitting({
            whitespace: false
          });
          setTimeout(() => {
            document.documentElement.classList.add('is-ready');
          }, 300)
          // Vertical Height Fix
          var vh = window.innerHeight * 0.01; // Then we set the value in the --vh custom property to the root of the document
          document.documentElement.style.setProperty('--vh', "".concat(vh, "px"));
          window.addEventListener('resize', function() {
            // We execute the same script as before
            var vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', "".concat(vh, "px"));
          });
          //Alert Close/
          $('.alert').each(function() {
            $(this).on('closed.bs.alert', function() {
              scroll.update()
            });
          });
          $('#myAlert').on('closed.bs.alert', function() {
            // do something…
          })
          ///Toggle Menu///
          $(".toggle-menu").click(function() {
            $(this).toggleClass("is-open");
            $('.slide-menu').toggleClass("is-open");
            $('body').toggleClass("is-open");
          });
          $('.modalBox').each(function() {
            $(this).on('hidden.bs.modal', function(e) {
              scroll.start()
            })
            $(this).on('shown.bs.modal', function(e) {
              scroll.stop()
            })
          });
          ///Show More Bbutton///
          $('.showmore').each(function() {
            $(this).on('click', function(e) {
              e.preventDefault();
              var parent = $(this).parents('section');
              var text = $(this).find('span').text();
              if (text === 'Show more') {
                $(this).find('span').text('Show less')
                $(this).find('i').addClass('less');
                parent.find('.wordCut').show();
                parent.find('.graphic').hide();
                setTimeout(() => {
                  $(this).attr('href', '#homeAbout');
                }, 300)
              }
              if (text === 'Show less') {
                $(this).find('span').text('Show more');
                $(this).find('.graphic').show();
                $(this).find('i').removeClass('less');
                parent.find('.wordCut').hide();
                setTimeout(() => {
                  $(this).attr('href', '.wordCut');
                }, 300)

              }
            })
          });
          ///Selectbox///
          $('select').selectric();
          $('form#views-exposed-form-embed-list-all-news select').selectric();
          ///Image Load for Preloader///
          $('.w-100').imagesLoaded({
              background: true
            }, function() {

            })
            .always(function(instance) {

            })
            .done(function(instance) {

              $('body').removeClass('loading');
              $('body').addClass('loaded');
              setTimeout(() => {
                $('.preloader').fadeOut('300');
                scroll.update()
                scroll.start()
              }, 300)
              // $('#app').fadeIn('800');
            })
            .fail(function() {

            })
            .progress(function(instance, image) {
              var result = image.isLoaded ? 'loaded' : 'broken';

              $('body').addClass('loading');
              loadProgress();
              scroll.stop()
            });
          var loadedCount = 0; //current number of images loaded
          var imagesToLoad = $('.w-100').length; //number of slides with .bcg container
          var loadingProgress = 0;

          function loadProgress(imgLoad, image) {
            //one more image has been loaded
            loadedCount++;
            loadingProgress = Math.floor((loadedCount / imagesToLoad) * 100);
            $('.progressbar').css('width', loadingProgress + '%');

          }
        },
        smoothscroll: function() {
          scroll.on('scroll', (instance) => {
            const progress = 360 * instance.scroll.y / instance.limit;
            document.documentElement.setAttribute('data-direction', instance.direction)
            if (instance.direction === 'down') {
              $('header').addClass('sticky');
            }
            if (instance.scroll.y <= 100) {
              $('header').removeClass('sticky');
            }

          });
          scroll.on('call', (value, way, obj) => {

          });
        },
        scrolltop: function() {
          $('a.scrolltop[href*="#"]')
            // Remove links that don't actually link to anything
            .not('[href="#"]')
            .not('[href="#0"]')
            .click(function(event) {
              // On-page links
              if (
                location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') &&
                location.hostname == this.hostname
              ) {
                // Figure out element to scroll to
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                // Does a scroll target exist?
                if (target.length) {
                  // Only prevent default if animation is actually gonna happen
                  event.preventDefault();
                  $('html, body').animate({
                    scrollTop: target.offset().top
                  }, 1000, function() {
                    // Callback after animation
                    // Must change focus!
                    var $target = $(target);
                    $target.focus();
                    if ($target.is(":focus")) { // Checking if the target was focused
                      return false;
                    } else {
                      $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
                      $target.focus(); // Set focus again
                    };
                  });
                }
              }
            });
        },
        swiper: function() {
          var swiper = new Swiper('.newSlider:not(.slider)', {
            spaceBetween: 30,
            effect: 'fade',
            autoplay: {
              delay: 3000,
            },
            loop: true,
            // mousewheel: {
            //   invert: false,
            // },
            // autoHeight: true,
            pagination: {
              el: '.newSlider__pagination',
              clickable: true,
            }
          });

          var focuseSwiper = new Swiper('.focusesSlider', {
            slidesPerView: 1,
            spaceBetween: 30,
            pagination: false,
            navigation: {
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            },
            scrollbar: {
              el: '.swiper-scrollbar',
              draggable: true,
              snapOnRelease: true
            },
            breakpoints: {
              500: {
                slidesPerView: 1
              },
              700: {
                slidesPerView: 2.5
              },
              1024: {
                slidesPerView: 3.5
              }
            }
          });

        }
      }
      atrc.init();
      atrc.scrolltop();
      atrc.smoothscroll();
      atrc.swiper();
    }
  }
})(jQuery, Drupal, window, document);
