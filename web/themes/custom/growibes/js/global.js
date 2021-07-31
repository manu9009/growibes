/**
 * @file
 * Global utilities.
 *
 */
(function ($, Drupal) {

  'use strict';

  Drupal.behaviors.atrcCustom = {
    attach: function (context, settings) {
      $('[data-drupal-selector="edit-e-combine"]').on('change focus', function() {
        if ($(this).val() > 0) {
          $(this).parent().children('label').hide();
        } else {
          $(this).parent().children('label').show();
        }
      });
    }
  }
})(jQuery, Drupal);
