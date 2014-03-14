/*!
 * Angular Chosen
 * Chosen angular directives. Based on localytics' angular-chosen.
 * https://github.com/dbtek/angular-chosen
 * @author İsmail Demirbilek (@dbtek)
 * MIT Licensed  
 */
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('ngChosen', []);

  angular.module('ngChosen').directive('chosen', function() {
    var CHOSEN_OPTION_WHITELIST, NG_OPTIONS_REGEXP, isEmpty, snakeCase;

    NG_OPTIONS_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/;
    CHOSEN_OPTION_WHITELIST = ['noResultsText', 'allowSingleDeselect', 'disableSearchThreshold', 'disableSearch', 'enableSplitWordSearch', 'inheritSelectClasses', 'maxSelectedOptions', 'placeholderTextMultiple', 'placeholderTextSingle', 'searchContains', 'singleBackstrokeDelete', 'displayDisabledOptions', 'displaySelectedOptions', 'width', 'inputChangeHandler','placeholderTextSingle'];
    snakeCase = function(input) {
      return input.replace(/[A-Z]/g, function($1) {
        return "_" + ($1.toLowerCase());
      });
    };
    isEmpty = function(value) {
      var key;

      if (angular.isArray(value)) {
        return value.length === 0;
      } else if (angular.isObject(value)) {
        for (key in value) {
          if (value.hasOwnProperty(key)) {
            return false;
          }
        }
      }
      return true;
    };
    return {
      restrict: 'A',
      require: '?ngModel',
      terminal: true,
      link: function(scope, element, attr, ngModel) {
        var chosen, defaultText, disableWithMessage, empty, initOrUpdate, match, options, origRender, removeEmptyMessage, startLoading, stopLoading, valuesExpr, viewWatch;
        element.addClass('localytics-chosen');
        options = scope.$eval(attr.chosen) || {};
        angular.forEach(attr, function(value, key) {
          if (__indexOf.call(CHOSEN_OPTION_WHITELIST, key) >= 0) {
            return options[snakeCase(key)] = scope.$eval(value);
          }
        });
        startLoading = function() {
          $('.chosen-container').addClass('loading');
          return element.addClass('loading').trigger('chosen:updated');
        };
        stopLoading = function() {
          $('.chosen-container').removeClass('loading');
          return element.removeClass('loading').trigger('chosen:updated');
        };
        chosen = null;
        defaultText = null;
        empty = false;
        initOrUpdate = function() {
          if (chosen) {
            return element.trigger('chosen:updated');
          } else {
            chosen = element.chosen(options).data('chosen');
            // bind input change handler
            $('.chosen-drop .chosen-search input').on('input', function(scope){
              options.input_change_handler($(this).val());
            });
            return defaultText = chosen.default_text;
          }
        };
        removeEmptyMessage = function() {
          empty = false;
          return element.attr('data-placeholder', defaultText);
        };
        disableWithMessage = function() {
          empty = true;
          return element.attr('data-placeholder', chosen.results_none_found).trigger('chosen:updated');
        };
        if (ngModel) {
          origRender = ngModel.$render;
          ngModel.$render = function() {
            origRender();
            return initOrUpdate();
          };
          if (attr.multiple) {
            viewWatch = function() {
              return ngModel.$viewValue;
            };
            scope.$watch(viewWatch, ngModel.$render, true);
          }
        } else {
          initOrUpdate();
        }
        attr.$observe('disabled', function() {
          return element.trigger('chosen:updated');
        });
        if (attr.ngOptions && ngModel) {
          match = attr.ngOptions.match(NG_OPTIONS_REGEXP);
          valuesExpr = match[7];
          return scope.$watchCollection(valuesExpr, function(newVal, oldVal) {
            if (angular.isUndefined(newVal)) {
              return startLoading();
            } else {
              if (empty) {
                removeEmptyMessage();
              }
              stopLoading();
              if (isEmpty(newVal)) {
                return disableWithMessage();
              }
            }
          });
        }
      }
    };
  });

}).call(this);
