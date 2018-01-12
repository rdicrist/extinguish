/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */


(function() {
  var context = this;

  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(context);

  var Rails = context.Rails;

  (function() {
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, fire, prepareOptions, processResponse;

      CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var response;
          response = processResponse(xhr.response, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if (typeof options.beforeSend === "function") {
          options.beforeSend(xhr, options);
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        } else {
          return fire(document, 'ajaxStop');
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        CSRFProtection(xhr);
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return xhr.abort();
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.handleMetaClick = function(e) {
        var data, link, metaClick, method;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        if (metaClick && method === 'GET' && !data) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMetaClick, handleMethod, handleRemote, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMetaClick = Rails.handleMetaClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && (jQuery.ajax != null) && !jQuery.rails) {
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', handleMetaClick);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
/*
Turbolinks 5.1.0
Copyright © 2018 Basecamp, LLC
 */

(function(){this.Turbolinks={supported:function(){return null!=window.history.pushState&&null!=window.requestAnimationFrame&&null!=window.addEventListener}(),visit:function(t,e){return Turbolinks.controller.visit(t,e)},clearCache:function(){return Turbolinks.controller.clearCache()},setProgressBarDelay:function(t){return Turbolinks.controller.setProgressBarDelay(t)}}}).call(this),function(){var t,e,r,n=[].slice;Turbolinks.copyObject=function(t){var e,r,n;r={};for(e in t)n=t[e],r[e]=n;return r},Turbolinks.closest=function(e,r){return t.call(e,r)},t=function(){var t,r;return t=document.documentElement,null!=(r=t.closest)?r:function(t){var r;for(r=this;r;){if(r.nodeType===Node.ELEMENT_NODE&&e.call(r,t))return r;r=r.parentNode}}}(),Turbolinks.defer=function(t){return setTimeout(t,1)},Turbolinks.throttle=function(t){var e;return e=null,function(){var r;return r=1<=arguments.length?n.call(arguments,0):[],null!=e?e:e=requestAnimationFrame(function(n){return function(){return e=null,t.apply(n,r)}}(this))}},Turbolinks.dispatch=function(t,e){var n,o,i,s,a,u;return a=null!=e?e:{},u=a.target,n=a.cancelable,o=a.data,i=document.createEvent("Events"),i.initEvent(t,!0,n===!0),i.data=null!=o?o:{},i.cancelable&&!r&&(s=i.preventDefault,i.preventDefault=function(){return this.defaultPrevented||Object.defineProperty(this,"defaultPrevented",{get:function(){return!0}}),s.call(this)}),(null!=u?u:document).dispatchEvent(i),i},r=function(){var t;return t=document.createEvent("Events"),t.initEvent("test",!0,!0),t.preventDefault(),t.defaultPrevented}(),Turbolinks.match=function(t,r){return e.call(t,r)},e=function(){var t,e,r,n;return t=document.documentElement,null!=(e=null!=(r=null!=(n=t.matchesSelector)?n:t.webkitMatchesSelector)?r:t.msMatchesSelector)?e:t.mozMatchesSelector}(),Turbolinks.uuid=function(){var t,e,r;for(r="",t=e=1;36>=e;t=++e)r+=9===t||14===t||19===t||24===t?"-":15===t?"4":20===t?(Math.floor(4*Math.random())+8).toString(16):Math.floor(15*Math.random()).toString(16);return r}}.call(this),function(){Turbolinks.Location=function(){function t(t){var e,r;null==t&&(t=""),r=document.createElement("a"),r.href=t.toString(),this.absoluteURL=r.href,e=r.hash.length,2>e?this.requestURL=this.absoluteURL:(this.requestURL=this.absoluteURL.slice(0,-e),this.anchor=r.hash.slice(1))}var e,r,n,o;return t.wrap=function(t){return t instanceof this?t:new this(t)},t.prototype.getOrigin=function(){return this.absoluteURL.split("/",3).join("/")},t.prototype.getPath=function(){var t,e;return null!=(t=null!=(e=this.requestURL.match(/\/\/[^\/]*(\/[^?;]*)/))?e[1]:void 0)?t:"/"},t.prototype.getPathComponents=function(){return this.getPath().split("/").slice(1)},t.prototype.getLastPathComponent=function(){return this.getPathComponents().slice(-1)[0]},t.prototype.getExtension=function(){var t,e;return null!=(t=null!=(e=this.getLastPathComponent().match(/\.[^.]*$/))?e[0]:void 0)?t:""},t.prototype.isHTML=function(){return this.getExtension().match(/^(?:|\.(?:htm|html|xhtml))$/)},t.prototype.isPrefixedBy=function(t){var e;return e=r(t),this.isEqualTo(t)||o(this.absoluteURL,e)},t.prototype.isEqualTo=function(t){return this.absoluteURL===(null!=t?t.absoluteURL:void 0)},t.prototype.toCacheKey=function(){return this.requestURL},t.prototype.toJSON=function(){return this.absoluteURL},t.prototype.toString=function(){return this.absoluteURL},t.prototype.valueOf=function(){return this.absoluteURL},r=function(t){return e(t.getOrigin()+t.getPath())},e=function(t){return n(t,"/")?t:t+"/"},o=function(t,e){return t.slice(0,e.length)===e},n=function(t,e){return t.slice(-e.length)===e},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.HttpRequest=function(){function e(e,r,n){this.delegate=e,this.requestCanceled=t(this.requestCanceled,this),this.requestTimedOut=t(this.requestTimedOut,this),this.requestFailed=t(this.requestFailed,this),this.requestLoaded=t(this.requestLoaded,this),this.requestProgressed=t(this.requestProgressed,this),this.url=Turbolinks.Location.wrap(r).requestURL,this.referrer=Turbolinks.Location.wrap(n).absoluteURL,this.createXHR()}return e.NETWORK_FAILURE=0,e.TIMEOUT_FAILURE=-1,e.timeout=60,e.prototype.send=function(){var t;return this.xhr&&!this.sent?(this.notifyApplicationBeforeRequestStart(),this.setProgress(0),this.xhr.send(),this.sent=!0,"function"==typeof(t=this.delegate).requestStarted?t.requestStarted():void 0):void 0},e.prototype.cancel=function(){return this.xhr&&this.sent?this.xhr.abort():void 0},e.prototype.requestProgressed=function(t){return t.lengthComputable?this.setProgress(t.loaded/t.total):void 0},e.prototype.requestLoaded=function(){return this.endRequest(function(t){return function(){var e;return 200<=(e=t.xhr.status)&&300>e?t.delegate.requestCompletedWithResponse(t.xhr.responseText,t.xhr.getResponseHeader("Turbolinks-Location")):(t.failed=!0,t.delegate.requestFailedWithStatusCode(t.xhr.status,t.xhr.responseText))}}(this))},e.prototype.requestFailed=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.NETWORK_FAILURE)}}(this))},e.prototype.requestTimedOut=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.TIMEOUT_FAILURE)}}(this))},e.prototype.requestCanceled=function(){return this.endRequest()},e.prototype.notifyApplicationBeforeRequestStart=function(){return Turbolinks.dispatch("turbolinks:request-start",{data:{url:this.url,xhr:this.xhr}})},e.prototype.notifyApplicationAfterRequestEnd=function(){return Turbolinks.dispatch("turbolinks:request-end",{data:{url:this.url,xhr:this.xhr}})},e.prototype.createXHR=function(){return this.xhr=new XMLHttpRequest,this.xhr.open("GET",this.url,!0),this.xhr.timeout=1e3*this.constructor.timeout,this.xhr.setRequestHeader("Accept","text/html, application/xhtml+xml"),this.xhr.setRequestHeader("Turbolinks-Referrer",this.referrer),this.xhr.onprogress=this.requestProgressed,this.xhr.onload=this.requestLoaded,this.xhr.onerror=this.requestFailed,this.xhr.ontimeout=this.requestTimedOut,this.xhr.onabort=this.requestCanceled},e.prototype.endRequest=function(t){return this.xhr?(this.notifyApplicationAfterRequestEnd(),null!=t&&t.call(this),this.destroy()):void 0},e.prototype.setProgress=function(t){var e;return this.progress=t,"function"==typeof(e=this.delegate).requestProgressed?e.requestProgressed(this.progress):void 0},e.prototype.destroy=function(){var t;return this.setProgress(1),"function"==typeof(t=this.delegate).requestFinished&&t.requestFinished(),this.delegate=null,this.xhr=null},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.ProgressBar=function(){function e(){this.trickle=t(this.trickle,this),this.stylesheetElement=this.createStylesheetElement(),this.progressElement=this.createProgressElement()}var r;return r=300,e.defaultCSS=".turbolinks-progress-bar {\n  position: fixed;\n  display: block;\n  top: 0;\n  left: 0;\n  height: 3px;\n  background: #0076ff;\n  z-index: 9999;\n  transition: width "+r+"ms ease-out, opacity "+r/2+"ms "+r/2+"ms ease-in;\n  transform: translate3d(0, 0, 0);\n}",e.prototype.show=function(){return this.visible?void 0:(this.visible=!0,this.installStylesheetElement(),this.installProgressElement(),this.startTrickling())},e.prototype.hide=function(){return this.visible&&!this.hiding?(this.hiding=!0,this.fadeProgressElement(function(t){return function(){return t.uninstallProgressElement(),t.stopTrickling(),t.visible=!1,t.hiding=!1}}(this))):void 0},e.prototype.setValue=function(t){return this.value=t,this.refresh()},e.prototype.installStylesheetElement=function(){return document.head.insertBefore(this.stylesheetElement,document.head.firstChild)},e.prototype.installProgressElement=function(){return this.progressElement.style.width=0,this.progressElement.style.opacity=1,document.documentElement.insertBefore(this.progressElement,document.body),this.refresh()},e.prototype.fadeProgressElement=function(t){return this.progressElement.style.opacity=0,setTimeout(t,1.5*r)},e.prototype.uninstallProgressElement=function(){return this.progressElement.parentNode?document.documentElement.removeChild(this.progressElement):void 0},e.prototype.startTrickling=function(){return null!=this.trickleInterval?this.trickleInterval:this.trickleInterval=setInterval(this.trickle,r)},e.prototype.stopTrickling=function(){return clearInterval(this.trickleInterval),this.trickleInterval=null},e.prototype.trickle=function(){return this.setValue(this.value+Math.random()/100)},e.prototype.refresh=function(){return requestAnimationFrame(function(t){return function(){return t.progressElement.style.width=10+90*t.value+"%"}}(this))},e.prototype.createStylesheetElement=function(){var t;return t=document.createElement("style"),t.type="text/css",t.textContent=this.constructor.defaultCSS,t},e.prototype.createProgressElement=function(){var t;return t=document.createElement("div"),t.className="turbolinks-progress-bar",t},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.BrowserAdapter=function(){function e(e){this.controller=e,this.showProgressBar=t(this.showProgressBar,this),this.progressBar=new Turbolinks.ProgressBar}var r,n,o;return o=Turbolinks.HttpRequest,r=o.NETWORK_FAILURE,n=o.TIMEOUT_FAILURE,e.prototype.visitProposedToLocationWithAction=function(t,e){return this.controller.startVisitToLocationWithAction(t,e)},e.prototype.visitStarted=function(t){return t.issueRequest(),t.changeHistory(),t.loadCachedSnapshot()},e.prototype.visitRequestStarted=function(t){return this.progressBar.setValue(0),t.hasCachedSnapshot()||"restore"!==t.action?this.showProgressBarAfterDelay():this.showProgressBar()},e.prototype.visitRequestProgressed=function(t){return this.progressBar.setValue(t.progress)},e.prototype.visitRequestCompleted=function(t){return t.loadResponse()},e.prototype.visitRequestFailedWithStatusCode=function(t,e){switch(e){case r:case n:return this.reload();default:return t.loadResponse()}},e.prototype.visitRequestFinished=function(t){return this.hideProgressBar()},e.prototype.visitCompleted=function(t){return t.followRedirect()},e.prototype.pageInvalidated=function(){return this.reload()},e.prototype.showProgressBarAfterDelay=function(){return this.progressBarTimeout=setTimeout(this.showProgressBar,this.controller.progressBarDelay)},e.prototype.showProgressBar=function(){return this.progressBar.show()},e.prototype.hideProgressBar=function(){return this.progressBar.hide(),clearTimeout(this.progressBarTimeout)},e.prototype.reload=function(){return window.location.reload()},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.History=function(){function e(e){this.delegate=e,this.onPageLoad=t(this.onPageLoad,this),this.onPopState=t(this.onPopState,this)}return e.prototype.start=function(){return this.started?void 0:(addEventListener("popstate",this.onPopState,!1),addEventListener("load",this.onPageLoad,!1),this.started=!0)},e.prototype.stop=function(){return this.started?(removeEventListener("popstate",this.onPopState,!1),removeEventListener("load",this.onPageLoad,!1),this.started=!1):void 0},e.prototype.push=function(t,e){return t=Turbolinks.Location.wrap(t),this.update("push",t,e)},e.prototype.replace=function(t,e){return t=Turbolinks.Location.wrap(t),this.update("replace",t,e)},e.prototype.onPopState=function(t){var e,r,n,o;return this.shouldHandlePopState()&&(o=null!=(r=t.state)?r.turbolinks:void 0)?(e=Turbolinks.Location.wrap(window.location),n=o.restorationIdentifier,this.delegate.historyPoppedToLocationWithRestorationIdentifier(e,n)):void 0},e.prototype.onPageLoad=function(t){return Turbolinks.defer(function(t){return function(){return t.pageLoaded=!0}}(this))},e.prototype.shouldHandlePopState=function(){return this.pageIsLoaded()},e.prototype.pageIsLoaded=function(){return this.pageLoaded||"complete"===document.readyState},e.prototype.update=function(t,e,r){var n;return n={turbolinks:{restorationIdentifier:r}},history[t+"State"](n,null,e)},e}()}.call(this),function(){Turbolinks.Snapshot=function(){function t(t){var e,r;r=t.head,e=t.body,this.head=null!=r?r:document.createElement("head"),this.body=null!=e?e:document.createElement("body")}return t.wrap=function(t){return t instanceof this?t:this.fromHTML(t)},t.fromHTML=function(t){var e;return e=document.createElement("html"),e.innerHTML=t,this.fromElement(e)},t.fromElement=function(t){return new this({head:t.querySelector("head"),body:t.querySelector("body")})},t.prototype.clone=function(){return new t({head:this.head.cloneNode(!0),body:this.body.cloneNode(!0)})},t.prototype.getRootLocation=function(){var t,e;return e=null!=(t=this.getSetting("root"))?t:"/",new Turbolinks.Location(e)},t.prototype.getCacheControlValue=function(){return this.getSetting("cache-control")},t.prototype.getElementForAnchor=function(t){try{return this.body.querySelector("[id='"+t+"'], a[name='"+t+"']")}catch(e){}},t.prototype.hasAnchor=function(t){return null!=this.getElementForAnchor(t)},t.prototype.isPreviewable=function(){return"no-preview"!==this.getCacheControlValue()},t.prototype.isCacheable=function(){return"no-cache"!==this.getCacheControlValue()},t.prototype.isVisitable=function(){return"reload"!==this.getSetting("visit-control")},t.prototype.getSetting=function(t){var e,r;return r=this.head.querySelectorAll("meta[name='turbolinks-"+t+"']"),e=r[r.length-1],null!=e?e.getAttribute("content"):void 0},t}()}.call(this),function(){var t=[].slice;Turbolinks.Renderer=function(){function e(){}var r;return e.render=function(){var e,r,n,o;return n=arguments[0],r=arguments[1],e=3<=arguments.length?t.call(arguments,2):[],o=function(t,e,r){r.prototype=t.prototype;var n=new r,o=t.apply(n,e);return Object(o)===o?o:n}(this,e,function(){}),o.delegate=n,o.render(r),o},e.prototype.renderView=function(t){return this.delegate.viewWillRender(this.newBody),t(),this.delegate.viewRendered(this.newBody)},e.prototype.invalidateView=function(){return this.delegate.viewInvalidated()},e.prototype.createScriptElement=function(t){var e;return"false"===t.getAttribute("data-turbolinks-eval")?t:(e=document.createElement("script"),e.textContent=t.textContent,e.async=!1,r(e,t),e)},r=function(t,e){var r,n,o,i,s,a,u;for(i=e.attributes,a=[],r=0,n=i.length;n>r;r++)s=i[r],o=s.name,u=s.value,a.push(t.setAttribute(o,u));return a},e}()}.call(this),function(){Turbolinks.HeadDetails=function(){function t(t){var e,r,i,s,a,u,l;for(this.element=t,this.elements={},l=this.element.childNodes,s=0,u=l.length;u>s;s++)i=l[s],i.nodeType===Node.ELEMENT_NODE&&(a=i.outerHTML,r=null!=(e=this.elements)[a]?e[a]:e[a]={type:o(i),tracked:n(i),elements:[]},r.elements.push(i))}var e,r,n,o;return t.prototype.hasElementWithKey=function(t){return t in this.elements},t.prototype.getTrackedElementSignature=function(){var t,e;return function(){var r,n;r=this.elements,n=[];for(t in r)e=r[t].tracked,e&&n.push(t);return n}.call(this).join("")},t.prototype.getScriptElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("script",t)},t.prototype.getStylesheetElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("stylesheet",t)},t.prototype.getElementsMatchingTypeNotInDetails=function(t,e){var r,n,o,i,s,a;o=this.elements,s=[];for(n in o)i=o[n],a=i.type,r=i.elements,a!==t||e.hasElementWithKey(n)||s.push(r[0]);return s},t.prototype.getProvisionalElements=function(){var t,e,r,n,o,i,s;r=[],n=this.elements;for(e in n)o=n[e],s=o.type,i=o.tracked,t=o.elements,null!=s||i?t.length>1&&r.push.apply(r,t.slice(1)):r.push.apply(r,t);return r},o=function(t){return e(t)?"script":r(t)?"stylesheet":void 0},n=function(t){return"reload"===t.getAttribute("data-turbolinks-track")},e=function(t){var e;return e=t.tagName.toLowerCase(),"script"===e},r=function(t){var e;return e=t.tagName.toLowerCase(),"style"===e||"link"===e&&"stylesheet"===t.getAttribute("rel")},t}()}.call(this),function(){var t=function(t,r){function n(){this.constructor=t}for(var o in r)e.call(r,o)&&(t[o]=r[o]);return n.prototype=r.prototype,t.prototype=new n,t.__super__=r.prototype,t},e={}.hasOwnProperty;Turbolinks.SnapshotRenderer=function(e){function r(t,e,r){this.currentSnapshot=t,this.newSnapshot=e,this.isPreview=r,this.currentHeadDetails=new Turbolinks.HeadDetails(this.currentSnapshot.head),this.newHeadDetails=new Turbolinks.HeadDetails(this.newSnapshot.head),this.newBody=this.newSnapshot.body}return t(r,e),r.prototype.render=function(t){return this.shouldRender()?(this.mergeHead(),this.renderView(function(e){return function(){return e.replaceBody(),e.isPreview||e.focusFirstAutofocusableElement(),t()}}(this))):this.invalidateView()},r.prototype.mergeHead=function(){return this.copyNewHeadStylesheetElements(),this.copyNewHeadScriptElements(),this.removeCurrentHeadProvisionalElements(),this.copyNewHeadProvisionalElements()},r.prototype.replaceBody=function(){return this.activateBodyScriptElements(),this.importBodyPermanentElements(),this.assignNewBody()},r.prototype.shouldRender=function(){return this.newSnapshot.isVisitable()&&this.trackedElementsAreIdentical()},r.prototype.trackedElementsAreIdentical=function(){return this.currentHeadDetails.getTrackedElementSignature()===this.newHeadDetails.getTrackedElementSignature()},r.prototype.copyNewHeadStylesheetElements=function(){var t,e,r,n,o;for(n=this.getNewHeadStylesheetElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},r.prototype.copyNewHeadScriptElements=function(){var t,e,r,n,o;for(n=this.getNewHeadScriptElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(this.createScriptElement(t)));return o},r.prototype.removeCurrentHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getCurrentHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.removeChild(t));return o},r.prototype.copyNewHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getNewHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},r.prototype.importBodyPermanentElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyPermanentElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],(t=this.findCurrentBodyPermanentElement(o))?i.push(o.parentNode.replaceChild(t,o)):i.push(void 0);return i},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.assignNewBody=function(){return document.body=this.newBody},r.prototype.focusFirstAutofocusableElement=function(){var t;return null!=(t=this.findFirstAutofocusableElement())?t.focus():void 0},r.prototype.getNewHeadStylesheetElements=function(){return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails)},r.prototype.getNewHeadScriptElements=function(){return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails)},r.prototype.getCurrentHeadProvisionalElements=function(){return this.currentHeadDetails.getProvisionalElements()},r.prototype.getNewHeadProvisionalElements=function(){return this.newHeadDetails.getProvisionalElements()},r.prototype.getNewBodyPermanentElements=function(){return this.newBody.querySelectorAll("[id][data-turbolinks-permanent]")},r.prototype.findCurrentBodyPermanentElement=function(t){return document.body.querySelector("#"+t.id+"[data-turbolinks-permanent]")},r.prototype.getNewBodyScriptElements=function(){return this.newBody.querySelectorAll("script")},r.prototype.findFirstAutofocusableElement=function(){return document.body.querySelector("[autofocus]")},r}(Turbolinks.Renderer)}.call(this),function(){var t=function(t,r){function n(){this.constructor=t}for(var o in r)e.call(r,o)&&(t[o]=r[o]);return n.prototype=r.prototype,t.prototype=new n,t.__super__=r.prototype,t},e={}.hasOwnProperty;Turbolinks.ErrorRenderer=function(e){function r(t){this.html=t}return t(r,e),r.prototype.render=function(t){return this.renderView(function(e){return function(){return e.replaceDocumentHTML(),e.activateBodyScriptElements(),t()}}(this))},r.prototype.replaceDocumentHTML=function(){return document.documentElement.innerHTML=this.html},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.getScriptElements=function(){return document.documentElement.querySelectorAll("script")},r}(Turbolinks.Renderer)}.call(this),function(){Turbolinks.View=function(){function t(t){this.delegate=t,this.element=document.documentElement}return t.prototype.getRootLocation=function(){return this.getSnapshot().getRootLocation()},t.prototype.getElementForAnchor=function(t){return this.getSnapshot().getElementForAnchor(t)},t.prototype.getSnapshot=function(){return Turbolinks.Snapshot.fromElement(this.element)},t.prototype.render=function(t,e){var r,n,o;return o=t.snapshot,r=t.error,n=t.isPreview,this.markAsPreview(n),null!=o?this.renderSnapshot(o,n,e):this.renderError(r,e)},t.prototype.markAsPreview=function(t){return t?this.element.setAttribute("data-turbolinks-preview",""):this.element.removeAttribute("data-turbolinks-preview")},t.prototype.renderSnapshot=function(t,e,r){return Turbolinks.SnapshotRenderer.render(this.delegate,r,this.getSnapshot(),Turbolinks.Snapshot.wrap(t),e)},t.prototype.renderError=function(t,e){return Turbolinks.ErrorRenderer.render(this.delegate,e,t)},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.ScrollManager=function(){function e(e){this.delegate=e,this.onScroll=t(this.onScroll,this),this.onScroll=Turbolinks.throttle(this.onScroll)}return e.prototype.start=function(){return this.started?void 0:(addEventListener("scroll",this.onScroll,!1),this.onScroll(),this.started=!0)},e.prototype.stop=function(){return this.started?(removeEventListener("scroll",this.onScroll,!1),this.started=!1):void 0},e.prototype.scrollToElement=function(t){return t.scrollIntoView()},e.prototype.scrollToPosition=function(t){var e,r;return e=t.x,r=t.y,window.scrollTo(e,r)},e.prototype.onScroll=function(t){return this.updatePosition({x:window.pageXOffset,y:window.pageYOffset})},e.prototype.updatePosition=function(t){var e;return this.position=t,null!=(e=this.delegate)?e.scrollPositionChanged(this.position):void 0},e}()}.call(this),function(){Turbolinks.SnapshotCache=function(){function t(t){this.size=t,this.keys=[],this.snapshots={}}var e;return t.prototype.has=function(t){var r;return r=e(t),r in this.snapshots},t.prototype.get=function(t){var e;if(this.has(t))return e=this.read(t),this.touch(t),e},t.prototype.put=function(t,e){return this.write(t,e),this.touch(t),e},t.prototype.read=function(t){var r;return r=e(t),this.snapshots[r]},t.prototype.write=function(t,r){var n;return n=e(t),this.snapshots[n]=r},t.prototype.touch=function(t){var r,n;return n=e(t),r=this.keys.indexOf(n),r>-1&&this.keys.splice(r,1),this.keys.unshift(n),this.trim()},t.prototype.trim=function(){var t,e,r,n,o;for(n=this.keys.splice(this.size),o=[],t=0,r=n.length;r>t;t++)e=n[t],o.push(delete this.snapshots[e]);return o},e=function(t){return Turbolinks.Location.wrap(t).toCacheKey()},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.Visit=function(){function e(e,r,n){this.controller=e,this.action=n,this.performScroll=t(this.performScroll,this),this.identifier=Turbolinks.uuid(),this.location=Turbolinks.Location.wrap(r),this.adapter=this.controller.adapter,this.state="initialized",this.timingMetrics={}}var r;return e.prototype.start=function(){return"initialized"===this.state?(this.recordTimingMetric("visitStart"),this.state="started",this.adapter.visitStarted(this)):void 0},e.prototype.cancel=function(){var t;return"started"===this.state?(null!=(t=this.request)&&t.cancel(),this.cancelRender(),this.state="canceled"):void 0},e.prototype.complete=function(){var t;return"started"===this.state?(this.recordTimingMetric("visitEnd"),this.state="completed","function"==typeof(t=this.adapter).visitCompleted&&t.visitCompleted(this),this.controller.visitCompleted(this)):void 0},e.prototype.fail=function(){var t;return"started"===this.state?(this.state="failed","function"==typeof(t=this.adapter).visitFailed?t.visitFailed(this):void 0):void 0},e.prototype.changeHistory=function(){var t,e;return this.historyChanged?void 0:(t=this.location.isEqualTo(this.referrer)?"replace":this.action,e=r(t),this.controller[e](this.location,this.restorationIdentifier),this.historyChanged=!0)},e.prototype.issueRequest=function(){return this.shouldIssueRequest()&&null==this.request?(this.progress=0,this.request=new Turbolinks.HttpRequest(this,this.location,this.referrer),this.request.send()):void 0},e.prototype.getCachedSnapshot=function(){var t;return!(t=this.controller.getCachedSnapshotForLocation(this.location))||null!=this.location.anchor&&!t.hasAnchor(this.location.anchor)||"restore"!==this.action&&!t.isPreviewable()?void 0:t},e.prototype.hasCachedSnapshot=function(){return null!=this.getCachedSnapshot()},e.prototype.loadCachedSnapshot=function(){var t,e;return(e=this.getCachedSnapshot())?(t=this.shouldIssueRequest(),this.render(function(){var r;return this.cacheSnapshot(),this.controller.render({snapshot:e,isPreview:t},this.performScroll),"function"==typeof(r=this.adapter).visitRendered&&r.visitRendered(this),t?void 0:this.complete()})):void 0},e.prototype.loadResponse=function(){return null!=this.response?this.render(function(){var t,e;return this.cacheSnapshot(),this.request.failed?(this.controller.render({error:this.response},this.performScroll),"function"==typeof(t=this.adapter).visitRendered&&t.visitRendered(this),this.fail()):(this.controller.render({snapshot:this.response},this.performScroll),"function"==typeof(e=this.adapter).visitRendered&&e.visitRendered(this),this.complete())}):void 0},e.prototype.followRedirect=function(){return this.redirectedToLocation&&!this.followedRedirect?(this.location=this.redirectedToLocation,this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation,this.restorationIdentifier),this.followedRedirect=!0):void 0},e.prototype.requestStarted=function(){var t;return this.recordTimingMetric("requestStart"),"function"==typeof(t=this.adapter).visitRequestStarted?t.visitRequestStarted(this):void 0},e.prototype.requestProgressed=function(t){var e;return this.progress=t,"function"==typeof(e=this.adapter).visitRequestProgressed?e.visitRequestProgressed(this):void 0},e.prototype.requestCompletedWithResponse=function(t,e){return this.response=t,null!=e&&(this.redirectedToLocation=Turbolinks.Location.wrap(e)),this.adapter.visitRequestCompleted(this)},e.prototype.requestFailedWithStatusCode=function(t,e){return this.response=e,this.adapter.visitRequestFailedWithStatusCode(this,t)},e.prototype.requestFinished=function(){var t;return this.recordTimingMetric("requestEnd"),"function"==typeof(t=this.adapter).visitRequestFinished?t.visitRequestFinished(this):void 0},e.prototype.performScroll=function(){return this.scrolled?void 0:("restore"===this.action?this.scrollToRestoredPosition()||this.scrollToTop():this.scrollToAnchor()||this.scrollToTop(),this.scrolled=!0)},e.prototype.scrollToRestoredPosition=function(){var t,e;return t=null!=(e=this.restorationData)?e.scrollPosition:void 0,null!=t?(this.controller.scrollToPosition(t),!0):void 0},e.prototype.scrollToAnchor=function(){return null!=this.location.anchor?(this.controller.scrollToAnchor(this.location.anchor),!0):void 0},e.prototype.scrollToTop=function(){return this.controller.scrollToPosition({x:0,y:0})},e.prototype.recordTimingMetric=function(t){var e;return null!=(e=this.timingMetrics)[t]?e[t]:e[t]=(new Date).getTime()},e.prototype.getTimingMetrics=function(){return Turbolinks.copyObject(this.timingMetrics)},r=function(t){switch(t){case"replace":return"replaceHistoryWithLocationAndRestorationIdentifier";case"advance":case"restore":return"pushHistoryWithLocationAndRestorationIdentifier"}},e.prototype.shouldIssueRequest=function(){return"restore"===this.action?!this.hasCachedSnapshot():!0},e.prototype.cacheSnapshot=function(){return this.snapshotCached?void 0:(this.controller.cacheSnapshot(),this.snapshotCached=!0)},e.prototype.render=function(t){return this.cancelRender(),this.frame=requestAnimationFrame(function(e){return function(){return e.frame=null,t.call(e)}}(this))},e.prototype.cancelRender=function(){return this.frame?cancelAnimationFrame(this.frame):void 0},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.Controller=function(){function e(){this.clickBubbled=t(this.clickBubbled,this),this.clickCaptured=t(this.clickCaptured,this),this.pageLoaded=t(this.pageLoaded,this),this.history=new Turbolinks.History(this),this.view=new Turbolinks.View(this),this.scrollManager=new Turbolinks.ScrollManager(this),this.restorationData={},this.clearCache(),this.setProgressBarDelay(500)}return e.prototype.start=function(){return Turbolinks.supported&&!this.started?(addEventListener("click",this.clickCaptured,!0),addEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.start(),this.startHistory(),this.started=!0,this.enabled=!0):void 0},e.prototype.disable=function(){return this.enabled=!1},e.prototype.stop=function(){return this.started?(removeEventListener("click",this.clickCaptured,!0),removeEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.stop(),this.stopHistory(),this.started=!1):void 0},e.prototype.clearCache=function(){return this.cache=new Turbolinks.SnapshotCache(10)},e.prototype.visit=function(t,e){var r,n;return null==e&&(e={}),t=Turbolinks.Location.wrap(t),this.applicationAllowsVisitingLocation(t)?this.locationIsVisitable(t)?(r=null!=(n=e.action)?n:"advance",this.adapter.visitProposedToLocationWithAction(t,r)):window.location=t:void 0},e.prototype.startVisitToLocationWithAction=function(t,e,r){var n;return Turbolinks.supported?(n=this.getRestorationDataForIdentifier(r),this.startVisit(t,e,{restorationData:n})):window.location=t},e.prototype.setProgressBarDelay=function(t){return this.progressBarDelay=t},e.prototype.startHistory=function(){return this.location=Turbolinks.Location.wrap(window.location),this.restorationIdentifier=Turbolinks.uuid(),this.history.start(),this.history.replace(this.location,this.restorationIdentifier)},e.prototype.stopHistory=function(){return this.history.stop()},e.prototype.pushHistoryWithLocationAndRestorationIdentifier=function(t,e){return this.restorationIdentifier=e,this.location=Turbolinks.Location.wrap(t),this.history.push(this.location,this.restorationIdentifier)},e.prototype.replaceHistoryWithLocationAndRestorationIdentifier=function(t,e){return this.restorationIdentifier=e,this.location=Turbolinks.Location.wrap(t),this.history.replace(this.location,this.restorationIdentifier)},e.prototype.historyPoppedToLocationWithRestorationIdentifier=function(t,e){var r;return this.restorationIdentifier=e,this.enabled?(r=this.getRestorationDataForIdentifier(this.restorationIdentifier),this.startVisit(t,"restore",{restorationIdentifier:this.restorationIdentifier,restorationData:r,historyChanged:!0}),this.location=Turbolinks.Location.wrap(t)):this.adapter.pageInvalidated()},e.prototype.getCachedSnapshotForLocation=function(t){var e;return e=this.cache.get(t),e?e.clone():void 0},e.prototype.shouldCacheSnapshot=function(){return this.view.getSnapshot().isCacheable()},e.prototype.cacheSnapshot=function(){var t;return this.shouldCacheSnapshot()?(this.notifyApplicationBeforeCachingSnapshot(),t=this.view.getSnapshot(),this.cache.put(this.lastRenderedLocation,t.clone())):void 0},e.prototype.scrollToAnchor=function(t){var e;return(e=this.view.getElementForAnchor(t))?this.scrollToElement(e):this.scrollToPosition({x:0,y:0})},e.prototype.scrollToElement=function(t){return this.scrollManager.scrollToElement(t)},e.prototype.scrollToPosition=function(t){return this.scrollManager.scrollToPosition(t)},e.prototype.scrollPositionChanged=function(t){var e;return e=this.getCurrentRestorationData(),e.scrollPosition=t},e.prototype.render=function(t,e){return this.view.render(t,e)},e.prototype.viewInvalidated=function(){return this.adapter.pageInvalidated()},e.prototype.viewWillRender=function(t){return this.notifyApplicationBeforeRender(t)},e.prototype.viewRendered=function(){return this.lastRenderedLocation=this.currentVisit.location,this.notifyApplicationAfterRender()},e.prototype.pageLoaded=function(){
return this.lastRenderedLocation=this.location,this.notifyApplicationAfterPageLoad()},e.prototype.clickCaptured=function(){return removeEventListener("click",this.clickBubbled,!1),addEventListener("click",this.clickBubbled,!1)},e.prototype.clickBubbled=function(t){var e,r,n;return this.enabled&&this.clickEventIsSignificant(t)&&(r=this.getVisitableLinkForNode(t.target))&&(n=this.getVisitableLocationForLink(r))&&this.applicationAllowsFollowingLinkToLocation(r,n)?(t.preventDefault(),e=this.getActionForLink(r),this.visit(n,{action:e})):void 0},e.prototype.applicationAllowsFollowingLinkToLocation=function(t,e){var r;return r=this.notifyApplicationAfterClickingLinkToLocation(t,e),!r.defaultPrevented},e.prototype.applicationAllowsVisitingLocation=function(t){var e;return e=this.notifyApplicationBeforeVisitingLocation(t),!e.defaultPrevented},e.prototype.notifyApplicationAfterClickingLinkToLocation=function(t,e){return Turbolinks.dispatch("turbolinks:click",{target:t,data:{url:e.absoluteURL},cancelable:!0})},e.prototype.notifyApplicationBeforeVisitingLocation=function(t){return Turbolinks.dispatch("turbolinks:before-visit",{data:{url:t.absoluteURL},cancelable:!0})},e.prototype.notifyApplicationAfterVisitingLocation=function(t){return Turbolinks.dispatch("turbolinks:visit",{data:{url:t.absoluteURL}})},e.prototype.notifyApplicationBeforeCachingSnapshot=function(){return Turbolinks.dispatch("turbolinks:before-cache")},e.prototype.notifyApplicationBeforeRender=function(t){return Turbolinks.dispatch("turbolinks:before-render",{data:{newBody:t}})},e.prototype.notifyApplicationAfterRender=function(){return Turbolinks.dispatch("turbolinks:render")},e.prototype.notifyApplicationAfterPageLoad=function(t){return null==t&&(t={}),Turbolinks.dispatch("turbolinks:load",{data:{url:this.location.absoluteURL,timing:t}})},e.prototype.startVisit=function(t,e,r){var n;return null!=(n=this.currentVisit)&&n.cancel(),this.currentVisit=this.createVisit(t,e,r),this.currentVisit.start(),this.notifyApplicationAfterVisitingLocation(t)},e.prototype.createVisit=function(t,e,r){var n,o,i,s,a;return o=null!=r?r:{},s=o.restorationIdentifier,i=o.restorationData,n=o.historyChanged,a=new Turbolinks.Visit(this,t,e),a.restorationIdentifier=null!=s?s:Turbolinks.uuid(),a.restorationData=Turbolinks.copyObject(i),a.historyChanged=n,a.referrer=this.location,a},e.prototype.visitCompleted=function(t){return this.notifyApplicationAfterPageLoad(t.getTimingMetrics())},e.prototype.clickEventIsSignificant=function(t){return!(t.defaultPrevented||t.target.isContentEditable||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)},e.prototype.getVisitableLinkForNode=function(t){return this.nodeIsVisitable(t)?Turbolinks.closest(t,"a[href]:not([target]):not([download])"):void 0},e.prototype.getVisitableLocationForLink=function(t){var e;return e=new Turbolinks.Location(t.getAttribute("href")),this.locationIsVisitable(e)?e:void 0},e.prototype.getActionForLink=function(t){var e;return null!=(e=t.getAttribute("data-turbolinks-action"))?e:"advance"},e.prototype.nodeIsVisitable=function(t){var e;return(e=Turbolinks.closest(t,"[data-turbolinks]"))?"false"!==e.getAttribute("data-turbolinks"):!0},e.prototype.locationIsVisitable=function(t){return t.isPrefixedBy(this.view.getRootLocation())&&t.isHTML()},e.prototype.getCurrentRestorationData=function(){return this.getRestorationDataForIdentifier(this.restorationIdentifier)},e.prototype.getRestorationDataForIdentifier=function(t){var e;return null!=(e=this.restorationData)[t]?e[t]:e[t]={}},e}()}.call(this),function(){!function(){var t,e;if((t=e=document.currentScript)&&!e.hasAttribute("data-turbolinks-suppress-warning"))for(;t=t.parentNode;)if(t===document.body)return console.warn("You are loading Turbolinks from a <script> element inside the <body> element. This is probably not what you meant to do!\n\nLoad your application\u2019s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.\n\nFor more information, see: https://github.com/turbolinks/turbolinks#working-with-script-elements\n\n\u2014\u2014\nSuppress this warning by adding a `data-turbolinks-suppress-warning` attribute to: %s",e.outerHTML)}()}.call(this),function(){var t,e,r;Turbolinks.start=function(){return e()?(null==Turbolinks.controller&&(Turbolinks.controller=t()),Turbolinks.controller.start()):void 0},e=function(){return null==window.Turbolinks&&(window.Turbolinks=Turbolinks),r()},t=function(){var t;return t=new Turbolinks.Controller,t.adapter=new Turbolinks.BrowserAdapter(t),t},r=function(){return window.Turbolinks===Turbolinks},r()&&Turbolinks.start()}.call(this);
(function() {


}).call(this);



(function () {
  this.App = this.App || {};
  var App = this.App;

  var isTurbolinks = 'Turbolinks' in window && window.Turbolinks.supported;
  var isTurbolinks5 = isTurbolinks && 'clearCache' in window.Turbolinks;

  var onPageLoadFiredOnce = false;
  var pageLoadCallbacks = [];
  var triggerOnPageLoad = function () {
    pageLoadCallbacks.forEach(function (callback) {
      callback();
    });
    onPageLoadFiredOnce = true;
  };

  // Fires the callback on DOMContentLoaded or a Turbolinks page load.
  // If called from an async script on the first page load, and the DOMContentLoad event
  // has already fired, will execute the callback immediately.
  App.onPageLoad = function (callback) {
    pageLoadCallbacks.push(callback);
    // With async script loading, a callback may be added after the DOMContentLoaded event has already triggered.
    // This means we will receive neither a DOMContentLoaded event, nor a turbolinks:load event on Turbolinks 5.
    if (!onPageLoadFiredOnce && App.DOMContentLoadedFired) {
      callback();
    }
  };

  if (isTurbolinks5) {
    // In Turbolinks 5.0.1, turbolinks:load may have already fired (before DOMContentLoaded).
    // If so, add our own DOMContentLoaded listener:
    // See: https://github.com/turbolinks/turbolinks/commit/69d353ea73d10ee6b25c2866fc5706879ba403e3
    if (window.Turbolinks.controller.lastRenderedLocation) {
      document.addEventListener('DOMContentLoaded', function() {
        triggerOnPageLoad();
      });
    }
    document.addEventListener('turbolinks:load', function () {
      triggerOnPageLoad();
    });
  } else {
    // Turbolinks Classic (with or without jQuery.Turbolinks), or no Turbolinks:
    if (!App.DOMContentLoadedFired) {
      document.addEventListener('DOMContentLoaded', function () {
        triggerOnPageLoad();
      });
    }
    if (isTurbolinks) {
      document.addEventListener('page:load', function () {
        triggerOnPageLoad();
      })
    }
  }

  App.isAppPage = function() {
    return !!document.getElementById('app-page-container');
  }
}).call(this);
// Monkey patch Turbolinks to render 403, 404 & 500 normally
// See https://github.com/turbolinks/turbolinks/issues/179
//Dependency not working- patch
window.Turbolinks.HttpRequest.prototype.requestLoaded = function() {
  return this.endRequest(function() {
    var code = this.xhr.status;
    if (200 <= code && code < 300 ||
        code === 403 || code === 404 || code === 500) {
      this.delegate.requestCompletedWithResponse(
          this.xhr.responseText,
          this.xhr.getResponseHeader("Turbolinks-Location"));
    } else {
      this.failed = true;
      this.delegate.requestFailedWithStatusCode(code, this.xhr.responseText);
    }
  }.bind(this));
};
//Later?

window.App.onPageLoad(function () {
  Array.prototype.forEach.call(document.querySelectorAll('.app-nav-theme li button'), function(button) {
    button.addEventListener('click', function(evt) {
      var expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 12);
      document.cookie = 'app-theme=' +
          evt.currentTarget.parentNode.getAttribute('data-theme') +
          ';expires=' + expiresAt + ';path=/';
      document.location.reload();
    });
  });
});


/**
 * Copyright (c) 2016 hustcc
 * License: MIT
 * Version: v3.0.2
 * https://github.com/hustcc/timeago.js
**/
/* jshint expr: true */

!function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(root); // nodejs support
    module.exports['default'] = module.exports; // es6 support
  }
  else
    root.timeago = factory(root);
}(typeof window !== 'undefined' ? window : this,
function () {
  var indexMapEn = 'second_minute_hour_day_week_month_year'.split('_'),
    indexMapZh = '秒_分钟_小时_天_周_月_年'.split('_'),
    // build-in locales: en & zh_CN
    locales = {
      'en': function(number, index) {
        if (index === 0) return ['just now', 'right now'];
        var unit = indexMapEn[parseInt(index / 2)];
        if (number > 1) unit += 's';
        return [number + ' ' + unit + ' ago', 'in ' + number + ' ' + unit];
      },
      'zh_CN': function(number, index) {
        if (index === 0) return ['刚刚', '片刻后'];
        var unit = indexMapZh[parseInt(index / 2)];
        return [number + unit + '前', number + unit + '后'];
      }
    },
    // second, minute, hour, day, week, month, year(365 days)
    SEC_ARRAY = [60, 60, 24, 7, 365/7/12, 12],
    SEC_ARRAY_LEN = 6,
    // ATTR_DATETIME = 'datetime',
    ATTR_DATA_TID = 'data-tid',
    timers = {}; // real-time render timers

  // format Date / string / timestamp to Date instance.
  function toDate(input) {
    if (input instanceof Date) return input;
    if (!isNaN(input)) return new Date(toInt(input));
    if (/^\d+$/.test(input)) return new Date(toInt(input));
    input = (input || '').trim().replace(/\.\d+/, '') // remove milliseconds
      .replace(/-/, '/').replace(/-/, '/')
      .replace(/(\d)T(\d)/, '$1 $2').replace(/Z/, ' UTC') // 2017-2-5T3:57:52Z -> 2017-2-5 3:57:52UTC
      .replace(/([\+\-]\d\d)\:?(\d\d)/, ' $1$2'); // -04:00 -> -0400
    return new Date(input);
  }
  // change f into int, remove decimal. Just for code compression
  function toInt(f) {
    return parseInt(f);
  }
  // format the diff second to *** time ago, with setting locale
  function formatDiff(diff, locale, defaultLocale) {
    // if locale is not exist, use defaultLocale.
    // if defaultLocale is not exist, use build-in `en`.
    // be sure of no error when locale is not exist.
    locale = locales[locale] ? locale : (locales[defaultLocale] ? defaultLocale : 'en');
    // if (! locales[locale]) locale = defaultLocale;
    var i = 0,
      agoin = diff < 0 ? 1 : 0, // timein or timeago
      total_sec = diff = Math.abs(diff);

    for (; diff >= SEC_ARRAY[i] && i < SEC_ARRAY_LEN; i++) {
      diff /= SEC_ARRAY[i];
    }
    diff = toInt(diff);
    i *= 2;

    if (diff > (i === 0 ? 9 : 1)) i += 1;
    return locales[locale](diff, i, total_sec)[agoin].replace('%s', diff);
  }
  // calculate the diff second between date to be formated an now date.
  function diffSec(date, nowDate) {
    nowDate = nowDate ? toDate(nowDate) : new Date();
    return (nowDate - toDate(date)) / 1000;
  }
  /**
   * nextInterval: calculate the next interval time.
   * - diff: the diff sec between now and date to be formated.
   *
   * What's the meaning?
   * diff = 61 then return 59
   * diff = 3601 (an hour + 1 second), then return 3599
   * make the interval with high performace.
  **/
  function nextInterval(diff) {
    var rst = 1, i = 0, d = Math.abs(diff);
    for (; diff >= SEC_ARRAY[i] && i < SEC_ARRAY_LEN; i++) {
      diff /= SEC_ARRAY[i];
      rst *= SEC_ARRAY[i];
    }
    // return leftSec(d, rst);
    d = d % rst;
    d = d ? rst - d : rst;
    return Math.ceil(d);
  }
  // get the datetime attribute, `data-timeagp` / `datetime` are supported.
  function getDateAttr(node) {
    return getAttr(node, 'data-timeago') || getAttr(node, 'datetime');
  }
  // get the node attribute, native DOM and jquery supported.
  function getAttr(node, name) {
    if(node.getAttribute) return node.getAttribute(name); // native
    if(node.attr) return node.attr(name); // jquery
  }
  // set the node attribute, native DOM and jquery supported.
  function setTidAttr(node, val) {
    if(node.setAttribute) return node.setAttribute(ATTR_DATA_TID, val); // native
    if(node.attr) return node.attr(ATTR_DATA_TID, val); // jquery
  }
  // get the timer id of node.
  // remove the function, can save some bytes.
  // function getTidFromNode(node) {
  //   return getAttr(node, ATTR_DATA_TID);
  // }
  /**
   * timeago: the function to get `timeago` instance.
   * - nowDate: the relative date, default is new Date().
   * - defaultLocale: the default locale, default is en. if your set it, then the `locale` parameter of format is not needed of you.
   *
   * How to use it?
   * var timeagoLib = require('timeago.js');
   * var timeago = timeagoLib(); // all use default.
   * var timeago = timeagoLib('2016-09-10'); // the relative date is 2016-09-10, so the 2016-09-11 will be 1 day ago.
   * var timeago = timeagoLib(null, 'zh_CN'); // set default locale is `zh_CN`.
   * var timeago = timeagoLib('2016-09-10', 'zh_CN'); // the relative date is 2016-09-10, and locale is zh_CN, so the 2016-09-11 will be 1天前.
  **/
  function Timeago(nowDate, defaultLocale) {
    this.nowDate = nowDate;
    // if do not set the defaultLocale, set it with `en`
    this.defaultLocale = defaultLocale || 'en'; // use default build-in locale
    // for dev test
    // this.nextInterval = nextInterval;
  }
  // what the timer will do
  Timeago.prototype.doRender = function(node, date, locale) {
    var diff = diffSec(date, this.nowDate),
      self = this,
      tid;
    // delete previously assigned timeout's id to node
    node.innerHTML = formatDiff(diff, locale, this.defaultLocale);
    // waiting %s seconds, do the next render
    timers[tid = setTimeout(function() {
      self.doRender(node, date, locale);
      delete timers[tid];
    }, Math.min(nextInterval(diff) * 1000, 0x7FFFFFFF))] = 0; // there is no need to save node in object.
    // set attribute date-tid
    setTidAttr(node, tid);
  };
  /**
   * format: format the date to *** time ago, with setting or default locale
   * - date: the date / string / timestamp to be formated
   * - locale: the formated string's locale name, e.g. en / zh_CN
   *
   * How to use it?
   * var timeago = require('timeago.js')();
   * timeago.format(new Date(), 'pl'); // Date instance
   * timeago.format('2016-09-10', 'fr'); // formated date string
   * timeago.format(1473473400269); // timestamp with ms
  **/
  Timeago.prototype.format = function(date, locale) {
    return formatDiff(diffSec(date, this.nowDate), locale, this.defaultLocale);
  };
  /**
   * render: render the DOM real-time.
   * - nodes: which nodes will be rendered.
   * - locale: the locale name used to format date.
   *
   * How to use it?
   * var timeago = require('timeago.js')();
   * // 1. javascript selector
   * timeago.render(document.querySelectorAll('.need_to_be_rendered'));
   * // 2. use jQuery selector
   * timeago.render($('.need_to_be_rendered'), 'pl');
   *
   * Notice: please be sure the dom has attribute `datetime`.
  **/
  Timeago.prototype.render = function(nodes, locale) {
    if (nodes.length === undefined) nodes = [nodes];
    for (var i = 0, len = nodes.length; i < len; i++) {
      this.doRender(nodes[i], getDateAttr(nodes[i]), locale); // render item
    }
  };
  /**
   * setLocale: set the default locale name.
   *
   * How to use it?
   * var timeago = require('timeago.js')();
   * timeago.setLocale('fr');
  **/
  Timeago.prototype.setLocale = function(locale) {
    this.defaultLocale = locale;
  };
  /**
   * timeago: the function to get `timeago` instance.
   * - nowDate: the relative date, default is new Date().
   * - defaultLocale: the default locale, default is en. if your set it, then the `locale` parameter of format is not needed of you.
   *
   * How to use it?
   * var timeagoFactory = require('timeago.js');
   * var timeago = timeagoFactory(); // all use default.
   * var timeago = timeagoFactory('2016-09-10'); // the relative date is 2016-09-10, so the 2016-09-11 will be 1 day ago.
   * var timeago = timeagoFactory(null, 'zh_CN'); // set default locale is `zh_CN`.
   * var timeago = timeagoFactory('2016-09-10', 'zh_CN'); // the relative date is 2016-09-10, and locale is zh_CN, so the 2016-09-11 will be 1天前.
   **/
  function timeagoFactory(nowDate, defaultLocale) {
    return new Timeago(nowDate, defaultLocale);
  }
  /**
   * register: register a new language locale
   * - locale: locale name, e.g. en / zh_CN, notice the standard.
   * - localeFunc: the locale process function
   *
   * How to use it?
   * var timeagoFactory = require('timeago.js');
   *
   * timeagoFactory.register('the locale name', the_locale_func);
   * // or
   * timeagoFactory.register('pl', require('timeago.js/locales/pl'));
   **/
  timeagoFactory.register = function(locale, localeFunc) {
    locales[locale] = localeFunc;
  };

  /**
   * cancel: cancels one or all the timers which are doing real-time render.
   *
   * How to use it?
   * For canceling all the timers:
   * var timeagoFactory = require('timeago.js');
   * var timeago = timeagoFactory();
   * timeago.render(document.querySelectorAll('.need_to_be_rendered'));
   * timeagoFactory.cancel(); // will stop all the timers, stop render in real time.
   *
   * For canceling single timer on specific node:
   * var timeagoFactory = require('timeago.js');
   * var timeago = timeagoFactory();
   * var nodes = document.querySelectorAll('.need_to_be_rendered');
   * timeago.render(nodes);
   * timeagoFactory.cancel(nodes[0]); // will clear a timer attached to the first node, stop render in real time.
   **/
  timeagoFactory.cancel = function(node) {
    var tid;
    // assigning in if statement to save space
    if (node) {
      tid = getAttr(node, ATTR_DATA_TID); // get the timer of DOM node(native / jq).
      if (tid) {
        clearTimeout(tid);
        delete timers[tid];
      }
    } else {
      for (tid in timers) clearTimeout(tid);
      timers = {};
    }
  };

  return timeagoFactory;
});
//?

(function() {
  window.App.onPageLoad(function() {
    if (!window.App.isAppPage()) {
      return;
    }
    var COMPONENT_SELECTOR = '[data-time-ago]';
    window.timeago().render(
        document.querySelectorAll(COMPONENT_SELECTOR),
        document.querySelector('#app-page-container')
            .getAttribute('data-locale'));
  });
  document.addEventListener('turbolinks:before-cache', function() {
    timeago.cancel();
  });
})();
(function() {
  var context = this;

  (function() {
    (function() {
      var slice = [].slice;

      this.ActionCable = {
        INTERNAL: {
          "message_types": {
            "welcome": "welcome",
            "ping": "ping",
            "confirmation": "confirm_subscription",
            "rejection": "reject_subscription"
          },
          "default_mount_path": "/cable",
          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
        },
        WebSocket: window.WebSocket,
        logger: window.console,
        createConsumer: function(url) {
          var ref;
          if (url == null) {
            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
          }
          return new ActionCable.Consumer(this.createWebSocketURL(url));
        },
        getConfig: function(name) {
          var element;
          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
          return element != null ? element.getAttribute("content") : void 0;
        },
        createWebSocketURL: function(url) {
          var a;
          if (url && !/^wss?:/i.test(url)) {
            a = document.createElement("a");
            a.href = url;
            a.href = a.href;
            a.protocol = a.protocol.replace("http", "ws");
            return a.href;
          } else {
            return url;
          }
        },
        startDebugging: function() {
          return this.debugging = true;
        },
        stopDebugging: function() {
          return this.debugging = null;
        },
        log: function() {
          var messages, ref;
          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (this.debugging) {
            messages.push(Date.now());
            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
          }
        }
      };

    }).call(this);
  }).call(context);

  var ActionCable = context.ActionCable;

  (function() {
    (function() {
      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      ActionCable.ConnectionMonitor = (function() {
        var clamp, now, secondsSince;

        ConnectionMonitor.pollInterval = {
          min: 3,
          max: 30
        };

        ConnectionMonitor.staleThreshold = 6;

        function ConnectionMonitor(connection) {
          this.connection = connection;
          this.visibilityDidChange = bind(this.visibilityDidChange, this);
          this.reconnectAttempts = 0;
        }

        ConnectionMonitor.prototype.start = function() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            document.addEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
          }
        };

        ConnectionMonitor.prototype.stop = function() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            document.removeEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor stopped");
          }
        };

        ConnectionMonitor.prototype.isRunning = function() {
          return (this.startedAt != null) && (this.stoppedAt == null);
        };

        ConnectionMonitor.prototype.recordPing = function() {
          return this.pingedAt = now();
        };

        ConnectionMonitor.prototype.recordConnect = function() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          return ActionCable.log("ConnectionMonitor recorded connect");
        };

        ConnectionMonitor.prototype.recordDisconnect = function() {
          this.disconnectedAt = now();
          return ActionCable.log("ConnectionMonitor recorded disconnect");
        };

        ConnectionMonitor.prototype.startPolling = function() {
          this.stopPolling();
          return this.poll();
        };

        ConnectionMonitor.prototype.stopPolling = function() {
          return clearTimeout(this.pollTimeout);
        };

        ConnectionMonitor.prototype.poll = function() {
          return this.pollTimeout = setTimeout((function(_this) {
            return function() {
              _this.reconnectIfStale();
              return _this.poll();
            };
          })(this), this.getPollInterval());
        };

        ConnectionMonitor.prototype.getPollInterval = function() {
          var interval, max, min, ref;
          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
          interval = 5 * Math.log(this.reconnectAttempts + 1);
          return Math.round(clamp(interval, min, max) * 1000);
        };

        ConnectionMonitor.prototype.reconnectIfStale = function() {
          if (this.connectionIsStale()) {
            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
            } else {
              ActionCable.log("ConnectionMonitor reopening");
              return this.connection.reopen();
            }
          }
        };

        ConnectionMonitor.prototype.connectionIsStale = function() {
          var ref;
          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.disconnectedRecently = function() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.visibilityDidChange = function() {
          if (document.visibilityState === "visible") {
            return setTimeout((function(_this) {
              return function() {
                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
                  return _this.connection.reopen();
                }
              };
            })(this), 200);
          }
        };

        now = function() {
          return new Date().getTime();
        };

        secondsSince = function(time) {
          return (now() - time) / 1000;
        };

        clamp = function(number, min, max) {
          return Math.max(min, Math.min(max, number));
        };

        return ConnectionMonitor;

      })();

    }).call(this);
    (function() {
      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
        slice = [].slice,
        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

      ActionCable.Connection = (function() {
        Connection.reopenDelay = 500;

        function Connection(consumer) {
          this.consumer = consumer;
          this.open = bind(this.open, this);
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new ActionCable.ConnectionMonitor(this);
          this.disconnected = true;
        }

        Connection.prototype.send = function(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        };

        Connection.prototype.open = function() {
          if (this.isActive()) {
            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
            return false;
          } else {
            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
            if (this.webSocket != null) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        };

        Connection.prototype.close = function(arg) {
          var allowReconnect, ref1;
          allowReconnect = (arg != null ? arg : {
            allowReconnect: true
          }).allowReconnect;
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
          }
        };

        Connection.prototype.reopen = function() {
          var error;
          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error1) {
              error = error1;
              return ActionCable.log("Failed to reopen WebSocket", error);
            } finally {
              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        };

        Connection.prototype.getProtocol = function() {
          var ref1;
          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
        };

        Connection.prototype.isOpen = function() {
          return this.isState("open");
        };

        Connection.prototype.isActive = function() {
          return this.isState("open", "connecting");
        };

        Connection.prototype.isProtocolSupported = function() {
          var ref1;
          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
        };

        Connection.prototype.isState = function() {
          var ref1, states;
          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
        };

        Connection.prototype.getState = function() {
          var ref1, state, value;
          for (state in WebSocket) {
            value = WebSocket[state];
            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
              return state.toLowerCase();
            }
          }
          return null;
        };

        Connection.prototype.installEventHandlers = function() {
          var eventName, handler;
          for (eventName in this.events) {
            handler = this.events[eventName].bind(this);
            this.webSocket["on" + eventName] = handler;
          }
        };

        Connection.prototype.uninstallEventHandlers = function() {
          var eventName;
          for (eventName in this.events) {
            this.webSocket["on" + eventName] = function() {};
          }
        };

        Connection.prototype.events = {
          message: function(event) {
            var identifier, message, ref1, type;
            if (!this.isProtocolSupported()) {
              return;
            }
            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
            switch (type) {
              case message_types.welcome:
                this.monitor.recordConnect();
                return this.subscriptions.reload();
              case message_types.ping:
                return this.monitor.recordPing();
              case message_types.confirmation:
                return this.subscriptions.notify(identifier, "connected");
              case message_types.rejection:
                return this.subscriptions.reject(identifier);
              default:
                return this.subscriptions.notify(identifier, "received", message);
            }
          },
          open: function() {
            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
            this.disconnected = false;
            if (!this.isProtocolSupported()) {
              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
              return this.close({
                allowReconnect: false
              });
            }
          },
          close: function(event) {
            ActionCable.log("WebSocket onclose event");
            if (this.disconnected) {
              return;
            }
            this.disconnected = true;
            this.monitor.recordDisconnect();
            return this.subscriptions.notifyAll("disconnected", {
              willAttemptReconnect: this.monitor.isRunning()
            });
          },
          error: function() {
            return ActionCable.log("WebSocket onerror event");
          }
        };

        return Connection;

      })();

    }).call(this);
    (function() {
      var slice = [].slice;

      ActionCable.Subscriptions = (function() {
        function Subscriptions(consumer) {
          this.consumer = consumer;
          this.subscriptions = [];
        }

        Subscriptions.prototype.create = function(channelName, mixin) {
          var channel, params, subscription;
          channel = channelName;
          params = typeof channel === "object" ? channel : {
            channel: channel
          };
          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        };

        Subscriptions.prototype.add = function(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.sendCommand(subscription, "subscribe");
          return subscription;
        };

        Subscriptions.prototype.remove = function(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        };

        Subscriptions.prototype.reject = function(identifier) {
          var i, len, ref, results, subscription;
          ref = this.findAll(identifier);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            this.forget(subscription);
            this.notify(subscription, "rejected");
            results.push(subscription);
          }
          return results;
        };

        Subscriptions.prototype.forget = function(subscription) {
          var s;
          this.subscriptions = (function() {
            var i, len, ref, results;
            ref = this.subscriptions;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              s = ref[i];
              if (s !== subscription) {
                results.push(s);
              }
            }
            return results;
          }).call(this);
          return subscription;
        };

        Subscriptions.prototype.findAll = function(identifier) {
          var i, len, ref, results, s;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            if (s.identifier === identifier) {
              results.push(s);
            }
          }
          return results;
        };

        Subscriptions.prototype.reload = function() {
          var i, len, ref, results, subscription;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.sendCommand(subscription, "subscribe"));
          }
          return results;
        };

        Subscriptions.prototype.notifyAll = function() {
          var args, callbackName, i, len, ref, results, subscription;
          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
          }
          return results;
        };

        Subscriptions.prototype.notify = function() {
          var args, callbackName, i, len, results, subscription, subscriptions;
          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          results = [];
          for (i = 0, len = subscriptions.length; i < len; i++) {
            subscription = subscriptions[i];
            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
          }
          return results;
        };

        Subscriptions.prototype.sendCommand = function(subscription, command) {
          var identifier;
          identifier = subscription.identifier;
          return this.consumer.send({
            command: command,
            identifier: identifier
          });
        };

        return Subscriptions;

      })();

    }).call(this);
    (function() {
      ActionCable.Subscription = (function() {
        var extend;

        function Subscription(consumer, params, mixin) {
          this.consumer = consumer;
          if (params == null) {
            params = {};
          }
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }

        Subscription.prototype.perform = function(action, data) {
          if (data == null) {
            data = {};
          }
          data.action = action;
          return this.send(data);
        };

        Subscription.prototype.send = function(data) {
          return this.consumer.send({
            command: "message",
            identifier: this.identifier,
            data: JSON.stringify(data)
          });
        };

        Subscription.prototype.unsubscribe = function() {
          return this.consumer.subscriptions.remove(this);
        };

        extend = function(object, properties) {
          var key, value;
          if (properties != null) {
            for (key in properties) {
              value = properties[key];
              object[key] = value;
            }
          }
          return object;
        };

        return Subscription;

      })();

    }).call(this);
    (function() {
      ActionCable.Consumer = (function() {
        function Consumer(url) {
          this.url = url;
          this.subscriptions = new ActionCable.Subscriptions(this);
          this.connection = new ActionCable.Connection(this);
        }

        Consumer.prototype.send = function(data) {
          return this.connection.send(data);
        };

        Consumer.prototype.connect = function() {
          return this.connection.open();
        };

        Consumer.prototype.disconnect = function() {
          return this.connection.close({
            allowReconnect: false
          });
        };

        Consumer.prototype.ensureActiveConnection = function() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        };

        return Consumer;

      })();

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = ActionCable;
  } else if (typeof define === "function" && define.amd) {
    define(ActionCable);
  }
}).call(this);
// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `rails generate channel` command.
//




(function() {
  this.App || (this.App = {});

  App.cable = ActionCable.createConsumer();

}).call(this);
(function() {


}).call(this);
(function() {
  this.GoogleAnalytics = (function() {
    function GoogleAnalytics() {}

    GoogleAnalytics.load = function() {
      var firstScript, ga;
      window._gaq = [];
      window._gaq.push(["_setAccount", GoogleAnalytics.analyticsId()]);
      ga = document.createElement("script");
      ga.type = "text/javascript";
      ga.async = true;
      ga.src = ("https:" === document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";
      firstScript = document.getElementsByTagName("script")[0];
      firstScript.parentNode.insertBefore(ga, firstScript);
      if (typeof Turbolinks !== 'undefined' && Turbolinks.supported) {
        return document.addEventListener("page:change", (function() {
          return GoogleAnalytics.trackPageview();
        }), true);
      } else {
        return GoogleAnalytics.trackPageview();
      }
    };

    GoogleAnalytics.trackPageview = function(url) {
      if (!GoogleAnalytics.isLocalRequest()) {
        if (url) {
          window._gaq.push(["_trackPageview", url]);
        } else {
          window._gaq.push(["_trackPageview"]);
        }
        return window._gaq.push(["_trackPageLoadTime"]);
      }
    };

    GoogleAnalytics.isLocalRequest = function() {
      return GoogleAnalytics.documentDomainIncludes("local");
    };

    GoogleAnalytics.documentDomainIncludes = function(str) {
      return document.domain.indexOf(str) !== -1;
    };

    GoogleAnalytics.analyticsId = function() {
      return 'UA-112414827-1';
    };

    return GoogleAnalytics;

  })();

  GoogleAnalytics.load();

}).call(this);
/**
 * http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * Version : 2.01.B
 * By Binny V A
 * License : BSD
 */

shortcut = {
	'all_shortcuts':{},//All the shortcuts are stored in this array
	'add': function(shortcut_combination,callback,opt) {
		//Provide a set of default options
		var default_options = {
			'type':'keydown',
			'propagate':false,
			'disable_in_input':false,
			'target':document,
			'keycode':false
		}
		if(!opt) opt = default_options;
		else {
			for(var dfo in default_options) {
				if(typeof opt[dfo] == 'undefined') opt[dfo] = default_options[dfo];
			}
		}

		var ele = opt.target;
		if(typeof opt.target == 'string') ele = document.getElementById(opt.target);
		var ths = this;
		shortcut_combination = shortcut_combination.toLowerCase();

		//The function to be called at keypress
		var func = function(e) {
			e = e || window.event;
			
			if(opt['disable_in_input']) { //Don't enable shortcut keys in Input, Textarea fields
				var element;
				if(e.target) element=e.target;
				else if(e.srcElement) element=e.srcElement;
				if(element.nodeType==3) element=element.parentNode;

				if(element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') return;
			}
	
			//Find Which key is pressed
			if (e.keyCode) code = e.keyCode;
			else if (e.which) code = e.which;
			var character = String.fromCharCode(code).toLowerCase();
			
			if(code == 188) character=","; //If the user presses , when the type is onkeydown
			if(code == 190) character="."; //If the user presses , when the type is onkeydown

			var keys = shortcut_combination.split("+");
			//Key Pressed - counts the number of valid keypresses - if it is same as the number of keys, the shortcut function is invoked
			var kp = 0;
			
			//Work around for stupid Shift key bug created by using lowercase - as a result the shift+num combination was broken
			var shift_nums = {
				"`":"~",
				"1":"!",
				"2":"@",
				"3":"#",
				"4":"$",
				"5":"%",
				"6":"^",
				"7":"&",
				"8":"*",
				"9":"(",
				"0":")",
				"-":"_",
				"=":"+",
				";":":",
				"'":"\"",
				",":"<",
				".":">",
				"/":"?",
				"\\":"|"
			}
			//Special Keys - and their codes
			var special_keys = {
				'esc':27,
				'escape':27,
				'tab':9,
				'space':32,
				'return':13,
				'enter':13,
				'backspace':8,
	
				'scrolllock':145,
				'scroll_lock':145,
				'scroll':145,
				'capslock':20,
				'caps_lock':20,
				'caps':20,
				'numlock':144,
				'num_lock':144,
				'num':144,
				
				'pause':19,
				'break':19,
				
				'insert':45,
				'home':36,
				'delete':46,
				'end':35,
				
				'pageup':33,
				'page_up':33,
				'pu':33,
	
				'pagedown':34,
				'page_down':34,
				'pd':34,
	
				'left':37,
				'up':38,
				'right':39,
				'down':40,
	
				'f1':112,
				'f2':113,
				'f3':114,
				'f4':115,
				'f5':116,
				'f6':117,
				'f7':118,
				'f8':119,
				'f9':120,
				'f10':121,
				'f11':122,
				'f12':123
			}
	
			var modifiers = { 
				shift: { wanted:false, pressed:false},
				ctrl : { wanted:false, pressed:false},
				alt  : { wanted:false, pressed:false},
				meta : { wanted:false, pressed:false}	//Meta is Mac specific
			};
                        
			if(e.ctrlKey)	modifiers.ctrl.pressed = true;
			if(e.shiftKey)	modifiers.shift.pressed = true;
			if(e.altKey)	modifiers.alt.pressed = true;
			if(e.metaKey)   modifiers.meta.pressed = true;
                        
			for(var i=0; k=keys[i],i<keys.length; i++) {
				//Modifiers
				if(k == 'ctrl' || k == 'control') {
					kp++;
					modifiers.ctrl.wanted = true;

				} else if(k == 'shift') {
					kp++;
					modifiers.shift.wanted = true;

				} else if(k == 'alt') {
					kp++;
					modifiers.alt.wanted = true;
				} else if(k == 'meta') {
					kp++;
					modifiers.meta.wanted = true;
				} else if(k.length > 1) { //If it is a special key
					if(special_keys[k] == code) kp++;
					
				} else if(opt['keycode']) {
					if(opt['keycode'] == code) kp++;

				} else { //The special keys did not match
					if(character == k) kp++;
					else {
						if(shift_nums[character] && e.shiftKey) { //Stupid Shift key bug created by using lowercase
							character = shift_nums[character]; 
							if(character == k) kp++;
						}
					}
				}
			}
			
			if(kp == keys.length && 
						modifiers.ctrl.pressed == modifiers.ctrl.wanted &&
						modifiers.shift.pressed == modifiers.shift.wanted &&
						modifiers.alt.pressed == modifiers.alt.wanted &&
						modifiers.meta.pressed == modifiers.meta.wanted) {
				callback(e);
	
				if(!opt['propagate']) { //Stop the event
					//e.cancelBubble is supported by IE - this will kill the bubbling process.
					e.cancelBubble = true;
					e.returnValue = false;
	
					//e.stopPropagation works in Firefox.
					if (e.stopPropagation) {
						e.stopPropagation();
						e.preventDefault();
					}
					return false;
				}
			}
		}
		this.all_shortcuts[shortcut_combination] = {
			'callback':func, 
			'target':ele, 
			'event': opt['type']
		};
		//Attach the function with the event
		if(ele.addEventListener) ele.addEventListener(opt['type'], func, false);
		else if(ele.attachEvent) ele.attachEvent('on'+opt['type'], func);
		else ele['on'+opt['type']] = func;
	},

	//Remove the shortcut - just specify the shortcut and I will remove the binding
	'remove':function(shortcut_combination) {
		shortcut_combination = shortcut_combination.toLowerCase();
		var binding = this.all_shortcuts[shortcut_combination];
		delete(this.all_shortcuts[shortcut_combination])
		if(!binding) return;
		var type = binding['event'];
		var ele = binding['target'];
		var callback = binding['callback'];

		if(ele.detachEvent) ele.detachEvent('on'+type, callback);
		else if(ele.removeEventListener) ele.removeEventListener(type, callback, false);
		else ele['on'+type] = false;
	}
}
;
/*!
 Autosize 4.0.0
 license: MIT
 http://www.jacklmoore.com/autosize
 */

!function(e,t){if("function"==typeof define&&define.amd)define(["exports","module"],t);else if("undefined"!=typeof exports&&"undefined"!=typeof module)t(exports,module);else{var n={exports:{}};t(n.exports,n),e.autosize=n.exports}}(this,function(e,t){"use strict";function n(e){function t(){var t=window.getComputedStyle(e,null);"vertical"===t.resize?e.style.resize="none":"both"===t.resize&&(e.style.resize="horizontal"),s="content-box"===t.boxSizing?-(parseFloat(t.paddingTop)+parseFloat(t.paddingBottom)):parseFloat(t.borderTopWidth)+parseFloat(t.borderBottomWidth),isNaN(s)&&(s=0),l()}function n(t){var n=e.style.width;e.style.width="0px",e.offsetWidth,e.style.width=n,e.style.overflowY=t}function o(e){for(var t=[];e&&e.parentNode&&e.parentNode instanceof Element;)e.parentNode.scrollTop&&t.push({node:e.parentNode,scrollTop:e.parentNode.scrollTop}),e=e.parentNode;return t}function r(){var t=e.style.height,n=o(e),r=document.documentElement&&document.documentElement.scrollTop;e.style.height="";var i=e.scrollHeight+s;return 0===e.scrollHeight?void(e.style.height=t):(e.style.height=i+"px",u=e.clientWidth,n.forEach(function(e){e.node.scrollTop=e.scrollTop}),void(r&&(document.documentElement.scrollTop=r)))}function l(){r();var t=Math.round(parseFloat(e.style.height)),o=window.getComputedStyle(e,null),i="content-box"===o.boxSizing?Math.round(parseFloat(o.height)):e.offsetHeight;if(i!==t?"hidden"===o.overflowY&&(n("scroll"),r(),i="content-box"===o.boxSizing?Math.round(parseFloat(window.getComputedStyle(e,null).height)):e.offsetHeight):"hidden"!==o.overflowY&&(n("hidden"),r(),i="content-box"===o.boxSizing?Math.round(parseFloat(window.getComputedStyle(e,null).height)):e.offsetHeight),a!==i){a=i;var l=d("autosize:resized");try{e.dispatchEvent(l)}catch(e){}}}if(e&&e.nodeName&&"TEXTAREA"===e.nodeName&&!i.has(e)){var s=null,u=e.clientWidth,a=null,c=function(){e.clientWidth!==u&&l()},p=function(t){window.removeEventListener("resize",c,!1),e.removeEventListener("input",l,!1),e.removeEventListener("keyup",l,!1),e.removeEventListener("autosize:destroy",p,!1),e.removeEventListener("autosize:update",l,!1),Object.keys(t).forEach(function(n){e.style[n]=t[n]}),i.delete(e)}.bind(e,{height:e.style.height,resize:e.style.resize,overflowY:e.style.overflowY,overflowX:e.style.overflowX,wordWrap:e.style.wordWrap});e.addEventListener("autosize:destroy",p,!1),"onpropertychange"in e&&"oninput"in e&&e.addEventListener("keyup",l,!1),window.addEventListener("resize",c,!1),e.addEventListener("input",l,!1),e.addEventListener("autosize:update",l,!1),e.style.overflowX="hidden",e.style.wordWrap="break-word",i.set(e,{destroy:p,update:l}),t()}}function o(e){var t=i.get(e);t&&t.destroy()}function r(e){var t=i.get(e);t&&t.update()}var i="function"==typeof Map?new Map:function(){var e=[],t=[];return{has:function(t){return e.indexOf(t)>-1},get:function(n){return t[e.indexOf(n)]},set:function(n,o){e.indexOf(n)===-1&&(e.push(n),t.push(o))},delete:function(n){var o=e.indexOf(n);o>-1&&(e.splice(o,1),t.splice(o,1))}}}(),d=function(e){return new Event(e,{bubbles:!0})};try{new Event("test")}catch(e){d=function(e){var t=document.createEvent("Event");return t.initEvent(e,!0,!1),t}}var l=null;"undefined"==typeof window||"function"!=typeof window.getComputedStyle?(l=function(e){return e},l.destroy=function(e){return e},l.update=function(e){return e}):(l=function(e,t){return e&&Array.prototype.forEach.call(e.length?e:[e],function(e){return n(e,t)}),e},l.destroy=function(e){return e&&Array.prototype.forEach.call(e.length?e:[e],o),e},l.update=function(e){return e&&Array.prototype.forEach.call(e.length?e:[e],r),e}),t.exports=l});
/** https://unpkg.com/textcomplete@0.13.1/dist/textcomplete.min.js */

!function(e){function t(r){if(n[r])return n[r].exports;var i=n[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,t),i.l=!0,i.exports}var n={};t.m=e,t.c=n,t.i=function(e){return e},t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:r})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=11)}([function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=n(1),s=(function(e){e&&e.__esModule}(o),function(){function e(t,n,i){r(this,e),this.data=t,this.term=n,this.strategy=i}return i(e,[{key:"replace",value:function(e,t){var n=this.strategy.replace(this.data);if(null!==n){Array.isArray(n)&&(t=n[1]+t,n=n[0]);var r=this.strategy.matchText(e);if(r)return n=n.replace(/\$&/g,r[0]).replace(/\$(\d+)/g,function(e,t){return r[parseInt(t,10)]}),[[e.slice(0,r.index),n,e.slice(r.index+r[0].length)].join(""),t]}}},{key:"render",value:function(){return this.strategy.template(this.data,this.term)}}]),e}());t.default=s},function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e){return e}Object.defineProperty(t,"__esModule",{value:!0});var o=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(12),u=function(e){return e&&e.__esModule?e:{default:e}}(s),a=function(){function e(t){r(this,e),this.props=t,this.cache=t.cache?{}:null}return o(e,[{key:"destroy",value:function(){return this.cache=null,this}},{key:"buildQuery",value:function(e){if("function"==typeof this.props.context){var t=this.props.context(e);if("string"==typeof t)e=t;else if(!t)return null}var n=this.matchText(e);return n?new u.default(this,n[this.index],n):null}},{key:"search",value:function(e,t,n){this.cache?this.searchWithCache(e,t,n):this.props.search(e,t,n)}},{key:"replace",value:function(e){return this.props.replace(e)}},{key:"searchWithCache",value:function(e,t,n){var r=this;this.cache&&this.cache[e]?t(this.cache[e]):this.props.search(e,function(n){r.cache&&(r.cache[e]=n),t(n)},n)}},{key:"matchText",value:function(e){return"function"==typeof this.match?this.match(e):e.match(this.match)}},{key:"match",get:function(){return this.props.match}},{key:"index",get:function(){return"number"==typeof this.props.index?this.props.index:2}},{key:"template",get:function(){return this.props.template||i}}]),e}();t.default=a},function(e){"use strict";function t(){}function n(e,t,n){this.fn=e,this.context=t,this.once=n||!1}function r(){this._events=new t,this._eventsCount=0}var i=Object.prototype.hasOwnProperty,o="~";Object.create&&(t.prototype=Object.create(null),(new t).__proto__||(o=!1)),r.prototype.eventNames=function(){var e,t,n=[];if(0===this._eventsCount)return n;for(t in e=this._events)i.call(e,t)&&n.push(o?t.slice(1):t);return Object.getOwnPropertySymbols?n.concat(Object.getOwnPropertySymbols(e)):n},r.prototype.listeners=function(e,t){var n=o?o+e:e,r=this._events[n];if(t)return!!r;if(!r)return[];if(r.fn)return[r.fn];for(var i=0,s=r.length,u=new Array(s);i<s;i++)u[i]=r[i].fn;return u},r.prototype.emit=function(e,t,n,r,i,s){var u=o?o+e:e;if(!this._events[u])return!1;var a,l,c=this._events[u],h=arguments.length;if(c.fn){switch(c.once&&this.removeListener(e,c.fn,void 0,!0),h){case 1:return c.fn.call(c.context),!0;case 2:return c.fn.call(c.context,t),!0;case 3:return c.fn.call(c.context,t,n),!0;case 4:return c.fn.call(c.context,t,n,r),!0;case 5:return c.fn.call(c.context,t,n,r,i),!0;case 6:return c.fn.call(c.context,t,n,r,i,s),!0}for(l=1,a=new Array(h-1);l<h;l++)a[l-1]=arguments[l];c.fn.apply(c.context,a)}else{var f,d=c.length;for(l=0;l<d;l++)switch(c[l].once&&this.removeListener(e,c[l].fn,void 0,!0),h){case 1:c[l].fn.call(c[l].context);break;case 2:c[l].fn.call(c[l].context,t);break;case 3:c[l].fn.call(c[l].context,t,n);break;case 4:c[l].fn.call(c[l].context,t,n,r);break;default:if(!a)for(f=1,a=new Array(h-1);f<h;f++)a[f-1]=arguments[f];c[l].fn.apply(c[l].context,a)}}return!0},r.prototype.on=function(e,t,r){var i=new n(t,r||this),s=o?o+e:e;return this._events[s]?this._events[s].fn?this._events[s]=[this._events[s],i]:this._events[s].push(i):(this._events[s]=i,this._eventsCount++),this},r.prototype.once=function(e,t,r){var i=new n(t,r||this,!0),s=o?o+e:e;return this._events[s]?this._events[s].fn?this._events[s]=[this._events[s],i]:this._events[s].push(i):(this._events[s]=i,this._eventsCount++),this},r.prototype.removeListener=function(e,n,r,i){var s=o?o+e:e;if(!this._events[s])return this;if(!n)return 0==--this._eventsCount?this._events=new t:delete this._events[s],this;var u=this._events[s];if(u.fn)u.fn!==n||i&&!u.once||r&&u.context!==r||(0==--this._eventsCount?this._events=new t:delete this._events[s]);else{for(var a=0,l=[],c=u.length;a<c;a++)(u[a].fn!==n||i&&!u[a].once||r&&u[a].context!==r)&&l.push(u[a]);l.length?this._events[s]=1===l.length?l[0]:l:0==--this._eventsCount?this._events=new t:delete this._events[s]}return this},r.prototype.removeAllListeners=function(e){var n;return e?(n=o?o+e:e,this._events[n]&&(0==--this._eventsCount?this._events=new t:delete this._events[n])):(this._events=new t,this._eventsCount=0),this},r.prototype.off=r.prototype.removeListener,r.prototype.addListener=r.prototype.on,r.prototype.setMaxListeners=function(){return this},r.prefixed=o,r.EventEmitter=r,e.exports=r},function(e,t){"use strict";function n(e){var t=e.getBoundingClientRect(),n=e.ownerDocument,r=n.defaultView,i=n.documentElement,o={top:t.top+r.pageYOffset,left:t.left+r.pageXOffset};return i&&(o.top-=i.clientTop,o.left-=i.clientLeft),o}function r(e){return e>=o&&e<=s}function i(e){var t=window.getComputedStyle(e);if(r(t.lineHeight.charCodeAt(0)))return r(t.lineHeight.charCodeAt(t.lineHeight.length-1))?parseFloat(t.lineHeight)*parseFloat(t.fontSize):parseFloat(t.lineHeight);var n=document.body;if(!n)return 0;var i=document.createElement(e.nodeName);i.innerHTML="&nbsp;",i.style.fontSize=t.fontSize,i.style.fontFamily=t.fontFamily,n.appendChild(i);var o=i.offsetHeight;return n.removeChild(i),o}Object.defineProperty(t,"__esModule",{value:!0}),t.calculateElementOffset=n,t.getLineHeightPx=i;var o=(t.createCustomEvent=function(){return"function"==typeof window.CustomEvent?function(e,t){return new document.defaultView.CustomEvent(e,{cancelable:t&&t.cancelable||!1,detail:t&&t.detail||void 0})}:function(e,t){var n=document.createEvent("CustomEvent");return n.initCustomEvent(e,!1,t&&t.cancelable||!1,t&&t.detail||void 0),n}}(),"0".charCodeAt(0)),s="9".charCodeAt(0)},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),a=n(2),l=r(a),c=n(10),h=r(c),f=n(0),d=(r(f),n(3)),p="dropdown-menu textcomplete-dropdown",v=function(e){function t(e){i(this,t);var n=o(this,(t.__proto__||Object.getPrototypeOf(t)).call(this));n.shown=!1,n.items=[],n.footer=e.footer,n.header=e.header,n.maxCount=e.maxCount||10,n.el.className=e.className||p,n.rotate=!e.hasOwnProperty("rotate")||e.rotate,n.placement=e.placement;var r=e.style;return r&&Object.keys(r).forEach(function(e){n.el.style[e]=r[e]}),n}return s(t,e),u(t,null,[{key:"createElement",value:function(){var e=document.createElement("ul"),t=e.style;t.display="none",t.position="absolute",t.zIndex="10000";var n=document.body;return n&&n.appendChild(e),e}}]),u(t,[{key:"destroy",value:function(){var e=this.el.parentNode;return e&&e.removeChild(this.el),this.clear()._el=null,this}},{key:"render",value:function(e,t){var n=(0,d.createCustomEvent)("render",{cancelable:!0});if(this.emit("render",n),n.defaultPrevented)return this;var r=e.map(function(e){return e.data}),i=e.slice(0,this.maxCount||e.length).map(function(e){return new h.default(e)});return this.clear().setStrategyId(e[0]).renderEdge(r,"header").append(i).renderEdge(r,"footer").setOffset(t).show(),this.emit("rendered",(0,d.createCustomEvent)("rendered")),this}},{key:"deactivate",value:function(){return this.hide().clear()}},{key:"select",value:function(e){var t={searchResult:e.searchResult},n=(0,d.createCustomEvent)("select",{cancelable:!0,detail:t});return this.emit("select",n),n.defaultPrevented?this:(this.deactivate(),this.emit("selected",(0,d.createCustomEvent)("selected",{detail:t})),this)}},{key:"up",value:function(e){return this.shown?this.moveActiveItem("prev",e):this}},{key:"down",value:function(e){return this.shown?this.moveActiveItem("next",e):this}},{key:"getActiveItem",value:function(){return this.items.find(function(e){return e.active})}},{key:"append",value:function(e){var t=this,n=document.createDocumentFragment();return e.forEach(function(e){t.items.push(e),e.appended(t),n.appendChild(e.el)}),this.el.appendChild(n),this}},{key:"setOffset",value:function(e){if(e.left?this.el.style.left=e.left+"px":e.right&&(this.el.style.right=e.right+"px"),this.isPlacementTop()){var t=document.documentElement;t&&(this.el.style.bottom=t.clientHeight-e.top+e.lineHeight+"px")}else this.el.style.top=e.top+"px";return this}},{key:"show",value:function(){if(!this.shown){var e=(0,d.createCustomEvent)("show",{cancelable:!0});if(this.emit("show",e),e.defaultPrevented)return this;this.el.style.display="block",this.shown=!0,this.emit("shown",(0,d.createCustomEvent)("shown"))}return this}},{key:"hide",value:function(){if(this.shown){var e=(0,d.createCustomEvent)("hide",{cancelable:!0});if(this.emit("hide",e),e.defaultPrevented)return this;this.el.style.display="none",this.shown=!1,this.emit("hidden",(0,d.createCustomEvent)("hidden"))}return this}},{key:"clear",value:function(){return this.el.innerHTML="",this.items.forEach(function(e){return e.destroy()}),this.items=[],this}},{key:"moveActiveItem",value:function(e,t){var n=this.getActiveItem(),r=void 0;return r=n?n[e]:"next"===e?this.items[0]:this.items[this.items.length-1],r&&(r.activate(),t.preventDefault()),this}},{key:"setStrategyId",value:function(e){var t=e&&e.strategy.props.id;return t?this.el.setAttribute("data-strategy",t):this.el.removeAttribute("data-strategy"),this}},{key:"renderEdge",value:function(e,t){var n=("header"===t?this.header:this.footer)||"",r="function"==typeof n?n(e):n,i=document.createElement("li");return i.classList.add("textcomplete-"+t),i.innerHTML=r,this.el.appendChild(i),this}},{key:"isPlacementTop",value:function(){return"top"===this.placement}},{key:"el",get:function(){return this._el||(this._el=t.createElement()),this._el}}]),t}(l.default);t.default=v},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),a=n(2),l=r(a),c=n(3),h=n(0),f=(r(h),function(e){function t(){return i(this,t),o(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments))}return s(t,e),u(t,[{key:"destroy",value:function(){return this}},{key:"applySearchResult",value:function(){throw new Error("Not implemented.")}},{key:"getCursorOffset",value:function(){throw new Error("Not implemented.")}},{key:"getBeforeCursor",value:function(){throw new Error("Not implemented.")}},{key:"getAfterCursor",value:function(){throw new Error("Not implemented.")}},{key:"emitMoveEvent",value:function(e){var t=(0,c.createCustomEvent)("move",{cancelable:!0,detail:{code:e}});return this.emit("move",t),t}},{key:"emitEnterEvent",value:function(){var e=(0,c.createCustomEvent)("enter",{cancelable:!0});return this.emit("enter",e),e}},{key:"emitChangeEvent",value:function(){var e=(0,c.createCustomEvent)("change",{detail:{beforeCursor:this.getBeforeCursor()}});return this.emit("change",e),e}},{key:"emitEscEvent",value:function(){var e=(0,c.createCustomEvent)("esc",{cancelable:!0});return this.emit("esc",e),e}},{key:"getCode",value:function(e){return 8===e.keyCode?"BS":9===e.keyCode?"ENTER":13===e.keyCode?"ENTER":16===e.keyCode?"META":17===e.keyCode?"META":18===e.keyCode?"META":27===e.keyCode?"ESC":38===e.keyCode?"UP":40===e.keyCode?"DOWN":78===e.keyCode&&e.ctrlKey?"DOWN":80===e.keyCode&&e.ctrlKey?"UP":91===e.keyCode?"META":93===e.keyCode?"META":"OTHER"}}]),t}(l.default));t.default=f},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),a=function e(t,n,r){null===t&&(t=Function.prototype);var i=Object.getOwnPropertyDescriptor(t,n);if(void 0===i){var o=Object.getPrototypeOf(t);return null===o?void 0:e(o,n,r)}if("value"in i)return i.value;var s=i.get;if(void 0!==s)return s.call(r)},l=n(14),c=r(l),h=n(5),f=r(h),d=n(3),p=n(0),v=(r(p),n(13)),y=["onInput","onKeydown"],m=function(e){function t(e){i(this,t);var n=o(this,(t.__proto__||Object.getPrototypeOf(t)).call(this));return n.el=e,y.forEach(function(e){n[e]=n[e].bind(n)}),n.startListening(),n}return s(t,e),u(t,[{key:"destroy",value:function(){return a(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"destroy",this).call(this),this.stopListening(),this.el=null,this}},{key:"applySearchResult",value:function(e){var t=e.replace(this.getBeforeCursor(),this.getAfterCursor());this.el.focus(),Array.isArray(t)&&((0,c.default)(this.el,t[0],t[1]),this.el.dispatchEvent(new Event("input")))}},{key:"getCursorOffset",value:function(){var e=(0,d.calculateElementOffset)(this.el),t=this.getElScroll(),n=this.getCursorPosition(),r=(0,d.getLineHeightPx)(this.el),i=e.top-t.top+n.top+r,o=e.left-t.left+n.left;return"rtl"!==this.el.dir?{top:i,left:o,lineHeight:r}:{top:i,right:document.documentElement?document.documentElement.clientWidth-o:0,lineHeight:r}}},{key:"getBeforeCursor",value:function(){return this.el.value.substring(0,this.el.selectionEnd)}},{key:"getAfterCursor",value:function(){return this.el.value.substring(this.el.selectionEnd)}},{key:"getElScroll",value:function(){return{top:this.el.scrollTop,left:this.el.scrollLeft}}},{key:"getCursorPosition",value:function(){return v(this.el,this.el.selectionEnd)}},{key:"onInput",value:function(){this.emitChangeEvent()}},{key:"onKeydown",value:function(e){var t=this.getCode(e),n=void 0;"UP"===t||"DOWN"===t?n=this.emitMoveEvent(t):"ENTER"===t?n=this.emitEnterEvent():"ESC"===t&&(n=this.emitEscEvent()),n&&n.defaultPrevented&&e.preventDefault()}},{key:"startListening",value:function(){this.el.addEventListener("input",this.onInput),this.el.addEventListener("keydown",this.onKeydown)}},{key:"stopListening",value:function(){this.el.removeEventListener("input",this.onInput),this.el.removeEventListener("keydown",this.onKeydown)}}]),t}(f.default);t.default=m},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),a=n(9),l=r(a),c=n(5),h=(r(c),n(4)),f=r(h),d=n(1),p=r(d),v=n(0),y=(r(v),n(2)),m=r(y),g=["handleChange","handleEnter","handleEsc","handleHit","handleMove","handleSelect"],b=function(e){function t(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};i(this,t);var r=o(this,(t.__proto__||Object.getPrototypeOf(t)).call(this));return r.completer=new l.default,r.isQueryInFlight=!1,r.nextPendingQuery=null,r.dropdown=new f.default(n.dropdown||{}),r.editor=e,r.options=n,g.forEach(function(e){r[e]=r[e].bind(r)}),r.startListening(),r}return s(t,e),u(t,[{key:"destroy",value:function(){var e=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];return this.completer.destroy(),this.dropdown.destroy(),e&&this.editor.destroy(),this.stopListening(),this}},{key:"register",value:function(e){var t=this;return e.forEach(function(e){t.completer.registerStrategy(new p.default(e))}),this}},{key:"trigger",value:function(e){return this.isQueryInFlight?this.nextPendingQuery=e:(this.isQueryInFlight=!0,this.nextPendingQuery=null,this.completer.run(e)),this}},{key:"handleHit",value:function(e){var t=e.searchResults;t.length?this.dropdown.render(t,this.editor.getCursorOffset()):this.dropdown.deactivate(),this.isQueryInFlight=!1,null!==this.nextPendingQuery&&this.trigger(this.nextPendingQuery)}},{key:"handleMove",value:function(e){"UP"===e.detail.code?this.dropdown.up(e):this.dropdown.down(e)}},{key:"handleEnter",value:function(e){var t=this.dropdown.getActiveItem();t&&(this.dropdown.select(t),e.preventDefault())}},{key:"handleEsc",value:function(e){this.dropdown.shown&&(this.dropdown.deactivate(),e.preventDefault())}},{key:"handleChange",value:function(e){this.trigger(e.detail.beforeCursor)}},{key:"handleSelect",value:function(e){this.emit("select",e),e.defaultPrevented||this.editor.applySearchResult(e.detail.searchResult)}},{key:"startListening",value:function(){var e=this;this.editor.on("move",this.handleMove).on("enter",this.handleEnter).on("esc",this.handleEsc).on("change",this.handleChange),this.dropdown.on("select",this.handleSelect),["show","shown","render","rendered","selected","hidden","hide"].forEach(function(t){e.dropdown.on(t,function(){return e.emit(t)})}),this.completer.on("hit",this.handleHit)}},{key:"stopListening",value:function(){this.completer.removeAllListeners(),this.dropdown.removeAllListeners(),this.editor.removeListener("move",this.handleMove).removeListener("enter",this.handleEnter).removeListener("esc",this.handleEsc).removeListener("change",this.handleChange)}}]),t}(m.default);t.default=b},function(e){var t;t=function(){return this}();try{t=t||Function("return this")()||(0,eval)("this")}catch(e){"object"==typeof window&&(t=window)}e.exports=t},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var u=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),a=n(2),l=r(a),c=n(1),h=(r(c),n(0)),f=(r(h),["handleQueryResult"]),d=function(e){function t(){i(this,t);var e=o(this,(t.__proto__||Object.getPrototypeOf(t)).call(this));return e.strategies=[],f.forEach(function(t){e[t]=e[t].bind(e)}),e}return s(t,e),u(t,[{key:"destroy",value:function(){return this.strategies.forEach(function(e){return e.destroy()}),this}},{key:"registerStrategy",value:function(e){return this.strategies.push(e),this}},{key:"run",value:function(e){var t=this.extractQuery(e);t?t.execute(this.handleQueryResult):this.handleQueryResult([])}},{key:"extractQuery",value:function(e){for(var t=0;t<this.strategies.length;t++){var n=this.strategies[t].buildQuery(e);if(n)return n}return null}},{key:"handleQueryResult",value:function(e){this.emit("hit",{searchResults:e})}}]),t}(l.default);t.default=d},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0}),t.CLASS_NAME=void 0;var o=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(4),u=(r(s),n(0)),a=(r(u),t.CLASS_NAME="textcomplete-item"),l=a+" active",c=["onClick","onMouseover"],h=function(){function e(t){var n=this;i(this,e),this.searchResult=t,this.active=!1,c.forEach(function(e){n[e]=n[e].bind(n)})}return o(e,[{key:"destroy",value:function(){this.el.removeEventListener("mousedown",this.onClick,!1),this.el.removeEventListener("mouseover",this.onMouseover,!1),this.el.removeEventListener("touchstart",this.onClick,!1),this._el=null}},{key:"appended",value:function(e){this.dropdown=e,this.siblings=e.items,this.index=this.siblings.length-1}},{key:"activate",value:function(){if(!this.active){var e=this.dropdown.getActiveItem();e&&e.deactivate(),this.active=!0,this.el.className=l}return this}},{key:"deactivate",value:function(){return this.active&&(this.active=!1,this.el.className=a),this}},{key:"onClick",value:function(e){e.preventDefault(),this.dropdown.select(this)}},{key:"onMouseover",value:function(){this.activate()}},{key:"el",get:function(){if(this._el)return this._el;var e=document.createElement("li");e.className=this.active?l:a;var t=document.createElement("a");return t.innerHTML=this.searchResult.render(),e.appendChild(t),this._el=e,e.addEventListener("mousedown",this.onClick),e.addEventListener("mouseover",this.onMouseover),e.addEventListener("touchstart",this.onClick),e}},{key:"next",get:function(){var e=void 0;if(this.index===this.siblings.length-1){if(!this.dropdown.rotate)return null;e=0}else e=this.index+1;return this.siblings[e]}},{key:"prev",get:function(){var e=void 0;if(0===this.index){if(!this.dropdown.rotate)return null;e=this.siblings.length-1}else e=this.index-1;return this.siblings[e]}}]),e}();t.default=h},function(e,t,n){"use strict";(function(e){function t(e){return e&&e.__esModule?e:{default:e}}var r=n(7),i=t(r),o=n(6),s=t(o),u=void 0;u=e.Textcomplete&&e.Textcomplete.editors?e.Textcomplete.editors:{},u.Textarea=s.default,e.Textcomplete=i.default,e.Textcomplete.editors=u}).call(t,n(8))},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var o=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),s=n(0),u=r(s),a=n(1),l=(r(a),function(){function e(t,n,r){i(this,e),this.strategy=t,this.term=n,this.match=r}return o(e,[{key:"execute",value:function(e){var t=this;this.strategy.search(this.term,function(n){e(n.map(function(e){return new u.default(e,t.term,t.strategy)}))},this.match)}}]),e}());t.default=l},function(e){!function(){function t(e,t,o){if(!r)throw new Error("textarea-caret-position#getCaretCoordinates should only be called in a browser");var s=o&&o.debug||!1;if(s){var u=document.querySelector("#input-textarea-caret-position-mirror-div");u&&u.parentNode.removeChild(u)}var a=document.createElement("div");a.id="input-textarea-caret-position-mirror-div",document.body.appendChild(a);var l=a.style,c=window.getComputedStyle?getComputedStyle(e):e.currentStyle;l.whiteSpace="pre-wrap","INPUT"!==e.nodeName&&(l.wordWrap="break-word"),l.position="absolute",s||(l.visibility="hidden"),n.forEach(function(e){l[e]=c[e]}),i?e.scrollHeight>parseInt(c.height)&&(l.overflowY="scroll"):l.overflow="hidden",a.textContent=e.value.substring(0,t),"INPUT"===e.nodeName&&(a.textContent=a.textContent.replace(/\s/g,"Â "));var h=document.createElement("span");h.textContent=e.value.substring(t)||".",a.appendChild(h);var f={top:h.offsetTop+parseInt(c.borderTopWidth),left:h.offsetLeft+parseInt(c.borderLeftWidth)};return s?h.style.backgroundColor="#aaa":document.body.removeChild(a),f}var n=["direction","boxSizing","width","height","overflowX","overflowY","borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth","borderStyle","paddingTop","paddingRight","paddingBottom","paddingLeft","fontStyle","fontVariant","fontWeight","fontStretch","fontSize","fontSizeAdjust","lineHeight","fontFamily","textAlign","textTransform","textIndent","textDecoration","letterSpacing","wordSpacing","tabSize","MozTabSize"],r="undefined"!=typeof window,i=r&&null!=window.mozInnerScreenX;void 0!==e&&void 0!==e.exports?e.exports=t:r&&(window.getCaretCoordinates=t)}()},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t,n){for(var r=e.value,i=t+(n||""),o=document.activeElement,s=0,u=0;r[s]===i[s];)s++;for(;r[r.length-u-1]===i[i.length-u-1];)u++;s=Math.min(s,r.length-u),e.setSelectionRange(s,r.length-u);var a=i.substring(s,i.length-u);return e.focus(),document.execCommand("insertText",!1,a)||(e.value=i),o&&o.focus(),e.setSelectionRange(t.length,t.length),e}}]);





// We are not currently using any features that require the Babel polyfill
// Enable this if we do:
//- require babel/polyfill
;
"use strict";

window.Thredded = window.Thredded || {};
'use strict';

(function () {
  var isTurbolinks = 'Turbolinks' in window && window.Turbolinks.supported;
  var isTurbolinks5 = isTurbolinks && 'clearCache' in window.Turbolinks;

  var onPageLoadFiredOnce = false;
  var pageLoadCallbacks = [];
  var triggerOnPageLoad = function triggerOnPageLoad() {
    pageLoadCallbacks.forEach(function (callback) {
      callback();
    });
    onPageLoadFiredOnce = true;
  };

  // Fires the callback on DOMContentLoaded or a Turbolinks page load.
  // If called from an async script on the first page load, and the DOMContentLoad event
  // has already fired, will execute the callback immediately.
  window.Thredded.onPageLoad = function (callback) {
    pageLoadCallbacks.push(callback);
    // With async script loading, a callback may be added after the DOMContentLoaded event has already triggered.
    // This means we will receive neither a DOMContentLoaded event, nor a turbolinks:load event on Turbolinks 5.
    if (!onPageLoadFiredOnce && window.Thredded.DOMContentLoadedFired) {
      callback();
    }
  };

  if (isTurbolinks5) {
    // In Turbolinks 5.0.1, turbolinks:load may have already fired (before DOMContentLoaded).
    // If so, add our own DOMContentLoaded listener:
    // See: https://github.com/turbolinks/turbolinks/commit/69d353ea73d10ee6b25c2866fc5706879ba403e3
    if (window.Turbolinks.controller.lastRenderedLocation) {
      document.addEventListener('DOMContentLoaded', function () {
        triggerOnPageLoad();
      });
    }
    document.addEventListener('turbolinks:load', function () {
      triggerOnPageLoad();
    });
  } else {
    // Turbolinks Classic (with or without jQuery.Turbolinks), or no Turbolinks:
    if (!window.Thredded.DOMContentLoadedFired) {
      document.addEventListener('DOMContentLoaded', function () {
        triggerOnPageLoad();
      });
    }
    if (isTurbolinks) {
      document.addEventListener('page:load', function () {
        triggerOnPageLoad();
      });
    }
  }
})();
'use strict';

window.Thredded.onPageLoad(function () {
  if ('Rails' in window) {
    window.Rails.refreshCSRFTokens();
  } else if ('jQuery' in window && 'rails' in window.jQuery) {
    window.jQuery.rails.refreshCSRFTokens();
  }
});


/**
 * Return a function, that, as long as it continues to be invoked, will
 * not be triggered. The function will be called after it stops being
 * called for `wait` milliseconds. If `immediate` is passed, trigger the
 * function on the leading edge, instead of the trailing.
 * Based on https://john-dugan.com/javascript-debounce/.
 *
 * @param {Function} func
 * @param {Number} wait in milliseconds
 * @param {Boolean} immediate
 * @returns {Function}
 */


"use strict";

window.Thredded.debounce = function (func, wait, immediate) {
  var timeoutId = null;
  return function () {
    var context = this,
        args = arguments;
    var later = function later() {
      timeoutId = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    var callNow = immediate && !timeoutId;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(later, wait || 200);
    if (callNow) {
      func.apply(context, args);
    }
  };
};
'use strict';

window.Thredded.escapeHtml = function (text) {
  var node = document.createElement('div');
  node.textContent = text;
  return node.innerHTML;
};
"use strict";

window.Thredded.hideSoftKeyboard = function () {
  var activeElement = document.activeElement;
  if (!activeElement || !activeElement.blur) return;
  activeElement.blur();
};
'use strict';

window.Thredded.serializeForm = function (form) {
  // Can't use new FormData(form).entries() because it's not supported on any IE
  // The below is not a full replacement, but enough for Thredded's purposes.
  return Array.prototype.map.call(form.querySelectorAll('[name]'), function (e) {
    return encodeURIComponent(e.name) + '=' + encodeURIComponent(e.value);
  }).join('&');
};
'use strict';

(function () {
  var Thredded = window.Thredded;

  var COMPONENT_SELECTOR = '[data-thredded-currently-online]';
  var EXPANDED_CLASS = 'thredded--is-expanded';

  var handleMouseEnter = function handleMouseEnter(evt) {
    evt.target.classList.add(EXPANDED_CLASS);
  };

  var handleMouseLeave = function handleMouseLeave(evt) {
    evt.target.classList.remove(EXPANDED_CLASS);
  };

  var handleTouchStart = function handleTouchStart(evt) {
    evt.target.classList.toggle(EXPANDED_CLASS);
  };

  var initCurrentlyOnline = function initCurrentlyOnline(node) {
    node.addEventListener('mouseenter', handleMouseEnter);
    node.addEventListener('mouseleave', handleMouseLeave);
    node.addEventListener('touchstart', handleTouchStart);
  };

  Thredded.onPageLoad(function () {
    Array.prototype.forEach.call(document.querySelectorAll(COMPONENT_SELECTOR), function (node) {
      initCurrentlyOnline(node);
    });
  });
})();
'use strict';

(function () {
  var COMPONENT_SELECTOR = '[data-thredded-flash-message]';

  document.addEventListener('turbolinks:before-cache', function () {
    Array.prototype.forEach.call(document.querySelectorAll(COMPONENT_SELECTOR), function (node) {
      node.parentNode.removeChild(node);
    });
  });
})();
'use strict';

(function () {
  var Thredded = window.Thredded;

  Thredded.UserTextcomplete = {
    DROPDOWN_CLASS_NAME: 'thredded--textcomplete-dropdown',

    formatUser: function formatUser(_ref) {
      var avatar_url = _ref.avatar_url;
      var name = _ref.name;

      return "<div class='thredded--textcomplete-user-result'>" + ('<img class=\'thredded--textcomplete-user-result__avatar\' src=\'' + Thredded.escapeHtml(avatar_url) + '\' >') + ('<span class=\'thredded--textcomplete-user-result__name\'>' + Thredded.escapeHtml(name) + '</span>') + '</div>';
    },

    searchFn: function searchFn(_ref2) {
      var url = _ref2.url;
      var autocompleteMinLength = _ref2.autocompleteMinLength;

      return function search(term, callback, match) {
        if (term.length < autocompleteMinLength) {
          callback([]);
          return;
        }
        var request = new XMLHttpRequest();
        request.open('GET', url + '?q=' + term, /* async */true);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        request.onload = function () {
          // Ignore errors
          if (request.status < 200 || request.status >= 400) {
            callback([]);
            return;
          }
          callback(JSON.parse(request.responseText).results.map(function (_ref3) {
            var avatar_url = _ref3.avatar_url;
            var id = _ref3.id;
            var name = _ref3.name;

            return { avatar_url: avatar_url, id: id, name: name, match: match };
          }));
        };
        request.send();
      };
    }
  };

  document.addEventListener('turbolinks:before-cache', function () {
    Array.prototype.forEach.call(document.getElementsByClassName(Thredded.UserTextcomplete.DROPDOWN_CLASS_NAME), function (node) {
      node.parentNode.removeChild(node);
    });
  });
})();
'use strict';

var ThreddedMentionAutocompletion = {
  MATCH_RE: /(^@|\s@)"?([\w.,\- ()]+)$/,
  DROPDOWN_MAX_COUNT: 6,

  init: function init(form, textarea) {
    var editor = new Textcomplete.editors.Textarea(textarea);
    var textcomplete = new Textcomplete(editor, {
      dropdown: {
        className: Thredded.UserTextcomplete.DROPDOWN_CLASS_NAME,
        maxCount: ThreddedMentionAutocompletion.DROPDOWN_MAX_COUNT
      }
    });
    textcomplete.on('rendered', function () {
      if (textcomplete.dropdown.items.length) {
        textcomplete.dropdown.items[0].activate();
      }
    });
    textcomplete.register([{
      match: ThreddedMentionAutocompletion.MATCH_RE,
      search: Thredded.UserTextcomplete.searchFn({
        url: form.getAttribute('data-autocomplete-url'),
        autocompleteMinLength: parseInt(form.getAttribute('data-autocomplete-min-length'), 10)
      }),
      template: Thredded.UserTextcomplete.formatUser,
      replace: function replace(_ref) {
        var name = _ref.name;
        var match = _ref.match;

        var prefix = match[1];
        if (/[., ()]/.test(name)) {
          return prefix + '"' + name + '" ';
        } else {
          return '' + prefix + name + ' ';
        }
      }
    }]);
  }
};

window.ThreddedMentionAutocompletion = ThreddedMentionAutocompletion;
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function () {
  var PREVIEW_AREA_SELECTOR = '[data-thredded-preview-area]';
  var PREVIEW_AREA_POST_SELECTOR = '[data-thredded-preview-area-post]';

  var ThreddedPreviewArea = (function () {
    function ThreddedPreviewArea(form, textarea) {
      var _this = this;

      _classCallCheck(this, ThreddedPreviewArea);

      var preview = form.querySelector(PREVIEW_AREA_SELECTOR);
      if (!preview || !textarea) return;
      this.form = form;
      this.preview = preview;
      this.previewPost = form.querySelector(PREVIEW_AREA_POST_SELECTOR);
      this.previewUrl = this.preview.getAttribute('data-thredded-preview-url');

      var prevValue = null;
      var onChange = Thredded.debounce(function () {
        if (prevValue !== textarea.value) {
          _this.updatePreview();
          prevValue = textarea.value;
        }
      }, 200, false);

      textarea.addEventListener('input', onChange, false);

      this.requestId = 0;
    }

    _createClass(ThreddedPreviewArea, [{
      key: 'updatePreview',
      value: function updatePreview() {
        var _this2 = this;

        this.requestId++;
        var requestId = this.requestId;
        var request = new XMLHttpRequest();
        request.open(this.form.method, this.previewUrl, /* async */true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        request.onload = function () {
          if (
          // Ignore server errors
          request.status >= 200 && request.status < 400 &&
          // Ignore older responses received out-of-order
          requestId === _this2.requestId) {
            _this2.onPreviewResponse(request.responseText);
          }
        };
        request.send(Thredded.serializeForm(this.form));
      }
    }, {
      key: 'onPreviewResponse',
      value: function onPreviewResponse(data) {
        this.preview.style.display = 'block';
        this.previewPost.innerHTML = data;
      }
    }]);

    return ThreddedPreviewArea;
  })();

  window.ThreddedPreviewArea = ThreddedPreviewArea;
})();
'use strict';

(function () {
  var Thredded = window.Thredded;
  var ThreddedMentionAutocompletion = window.ThreddedMentionAutocompletion;
  var ThreddedPreviewArea = window.ThreddedPreviewArea;
  var autosize = window.autosize;

  var COMPONENT_SELECTOR = '[data-thredded-post-form]';
  var CONTENT_TEXTAREA_SELECTOR = 'textarea[name$="[content]"]';

  var initPostForm = function initPostForm(form) {
    var textarea = form.querySelector(CONTENT_TEXTAREA_SELECTOR);
    autosize(textarea);
    new ThreddedPreviewArea(form, textarea);
    ThreddedMentionAutocompletion.init(form, textarea);
  };

  var destroyPostForm = function destroyPostForm(form) {
    autosize.destroy(form.querySelector(CONTENT_TEXTAREA_SELECTOR));
  };

  Thredded.onPageLoad(function () {
    Array.prototype.forEach.call(document.querySelectorAll(COMPONENT_SELECTOR), function (node) {
      initPostForm(node);
    });
  });

  document.addEventListener('turbolinks:before-cache', function () {
    Array.prototype.forEach.call(document.querySelectorAll(COMPONENT_SELECTOR), function (node) {
      destroyPostForm(node);
    });
  });
})();
'use strict';

(function () {
  var Thredded = window.Thredded;

  Thredded.onPageLoad(function () {
    Array.prototype.forEach.call(document.querySelectorAll('[data-thredded-quote-post]'), function (el) {
      el.addEventListener('click', onClick);
    });
  });

  function onClick(evt) {
    // Handle only left clicks with no modifier keys
    if (evt.button !== 0 || evt.ctrlKey || evt.altKey || evt.metaKey || evt.shiftKey) return;
    evt.preventDefault();
    var target = document.getElementById('post_content');
    target.scrollIntoView();
    target.value = '...';
    fetchReply(evt.target.getAttribute('data-thredded-quote-post'), function (replyText) {
      if (!target.ownerDocument.body.contains(target)) return;
      target.focus();
      target.value = replyText;

      var autosizeUpdateEvent = document.createEvent('Event');
      autosizeUpdateEvent.initEvent('autosize:update', true, false);
      target.dispatchEvent(autosizeUpdateEvent);
      // Scroll into view again as the size might have changed.
      target.scrollIntoView();
    }, function (errorMessage) {
      target.value = errorMessage;
    });
  }

  function fetchReply(url, onSuccess, onError) {
    var request = new XMLHttpRequest();
    request.open('GET', url, /* async */true);
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        onSuccess(request.responseText);
      } else {
        onError('Error (' + request.status + '): ' + request.statusText + ' ' + request.responseText);
      }
    };
    request.onerror = function () {
      onError('Network Error');
    };
    request.send();
  }
})();
'use strict';

(function () {
  var COMPONENT_SELECTOR = '#thredded--container [data-time-ago]';
  var Thredded = window.Thredded;
  if ('timeago' in window) {
    (function () {
      var timeago = window.timeago;
      Thredded.onPageLoad(function () {
        var threddedContainer = document.querySelector('#thredded--container');
        if (!threddedContainer) return;
        timeago().render(document.querySelectorAll(COMPONENT_SELECTOR), threddedContainer.getAttribute('data-thredded-locale'));
      });
      document.addEventListener('turbolinks:before-cache', function () {
        timeago.cancel();
      });
    })();
  } else if ('jQuery' in window && 'timeago' in jQuery.fn) {
    (function () {
      var $ = window.jQuery;
      Thredded.onPageLoad(function () {
        var allowFutureWas = $.timeago.settings.allowFuture;
        $.timeago.settings.allowFuture = true;
        $(COMPONENT_SELECTOR).timeago();
        $.timeago.settings.allowFuture = allowFutureWas;
      });
    })();
  }
})();
'use strict';

(function () {
  var Thredded = window.Thredded;
  var ThreddedMentionAutocompletion = window.ThreddedMentionAutocompletion;
  var ThreddedPreviewArea = window.ThreddedPreviewArea;
  var autosize = window.autosize;

  var COMPONENT_SELECTOR = '[data-thredded-topic-form]';
  var TITLE_SELECTOR = '[name$="topic[title]"]';
  var CONTENT_TEXTAREA_SELECTOR = 'textarea[name$="[content]"]';
  var COMPACT_CLASS = 'thredded--is-compact';
  var EXPANDED_CLASS = 'thredded--is-expanded';
  var ESCAPE_KEY_CODE = 27;

  var initTopicForm = function initTopicForm(form) {
    var textarea = form.querySelector(CONTENT_TEXTAREA_SELECTOR);
    autosize(textarea);
    new ThreddedPreviewArea(form, textarea);
    ThreddedMentionAutocompletion.init(form, textarea);

    if (!form.classList.contains(COMPACT_CLASS)) {
      return;
    }

    var title = form.querySelector(TITLE_SELECTOR);
    title.addEventListener('focus', function () {
      toggleExpanded(form, true);
    });

    [title, textarea].forEach(function (node) {
      // Un-expand on Escape key.
      node.addEventListener('keydown', function (evt) {
        if (evt.keyCode === ESCAPE_KEY_CODE) {
          evt.target.blur();
          toggleExpanded(form, false);
        }
      });

      // Un-expand on blur if the new focus element is outside of the same form and
      // all the form inputs are empty.
      node.addEventListener('blur', function () {
        // This listener will be fired right after the blur event has finished.
        var listener = function listener(evt) {
          if (!form.contains(evt.target) && !title.value && !textarea.value) {
            toggleExpanded(form, false);
          }
          document.body.removeEventListener('touchend', listener);
          document.body.removeEventListener('mouseup', listener);
        };
        document.body.addEventListener('mouseup', listener);
        document.body.addEventListener('touchend', listener);
      });
    });
  };

  var toggleExpanded = function toggleExpanded(form, expand) {
    if (expand) {
      form.classList.remove(COMPACT_CLASS);
      form.classList.add(EXPANDED_CLASS);
    } else {
      form.classList.remove(EXPANDED_CLASS);
      form.classList.add(COMPACT_CLASS);
    }
  };

  var destroyTopicForm = function destroyTopicForm(form) {
    autosize.destroy(form.querySelector(CONTENT_TEXTAREA_SELECTOR));
  };

  Thredded.onPageLoad(function () {
    Array.prototype.forEach.call(document.querySelectorAll(COMPONENT_SELECTOR), function (node) {
      initTopicForm(node);
    });
  });

  document.addEventListener('turbolinks:before-cache', function () {
    Array.prototype.forEach.call(document.querySelectorAll(COMPONENT_SELECTOR), function (node) {
      destroyTopicForm(node);
    });
  });
})();


// Makes topics in the list appear read as soon as the topic link is clicked,
// iff the topic link leads to the last page of the topic.
'use strict';

(function () {
  var Thredded = window.Thredded;

  var COMPONENT_SELECTOR = '[data-thredded-topics]';
  var TOPIC_UNREAD_CLASS = 'thredded--topic-unread';
  var TOPIC_READ_CLASS = 'thredded--topic-read';
  var POSTS_COUNT_SELECTOR = '.thredded--topics--posts-count';
  var POSTS_PER_PAGE = 50;

  function pageNumber(url) {
    var match = url.match(/\/page-(\d)$/);
    return match ? +match[1] : 1;
  }

  function totalPages(numPosts) {
    return Math.ceil(numPosts / POSTS_PER_PAGE);
  }

  function getTopicNode(node) {
    do {
      node = node.parentNode;
    } while (node && node.tagName !== 'ARTICLE');
    return node;
  }

  function initTopicsList(topicsList) {
    topicsList.addEventListener('click', function (evt) {
      var link = evt.target;
      if (link.tagName !== 'A' || link.parentNode.tagName !== 'H1') return;
      var topic = getTopicNode(link);
      if (pageNumber(link.href) === totalPages(+topic.querySelector(POSTS_COUNT_SELECTOR).textContent)) {
        topic.classList.add(TOPIC_READ_CLASS);
        topic.classList.remove(TOPIC_UNREAD_CLASS);
      }
    });
  }

  Thredded.onPageLoad(function () {
    Array.prototype.forEach.call(document.querySelectorAll(COMPONENT_SELECTOR), initTopicsList);
  });
})();


// Submit GET forms with turbolinks
'use strict';

(function () {
  var Thredded = window.Thredded;
  var Turbolinks = window.Turbolinks;

  Thredded.onPageLoad(function () {
    if (!Turbolinks || !Turbolinks.supported) return;
    Array.prototype.forEach.call(document.querySelectorAll('[data-thredded-turboform]'), function (form) {
      form.addEventListener('submit', handleSubmit);
    });
  });

  var handleSubmit = function handleSubmit(evt) {
    evt.preventDefault();
    var form = evt.currentTarget;
    Turbolinks.visit(form.action + (form.action.indexOf('?') === -1 ? '?' : '&') + Thredded.serializeForm(form));

    // On mobile the soft keyboard doesn't won't go away after the submit since we're submitting with
    // Turbolinks. Hide it:
    Thredded.hideSoftKeyboard();
  };
})();


// Reflects the logic of user preference settings by enabling/disabling certain inputs.
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function () {
  var Thredded = window.Thredded;

  var COMPONENT_SELECTOR = '[data-thredded-user-preferences-form]';
  var BOUND_MESSAGEBOARD_NAME = 'data-thredded-bound-messageboard-pref';
  var UPDATE_ON_CHANGE_NAME = 'data-thredded-update-checkbox-on-change';

  var MessageboardPreferenceBinding = (function () {
    function MessageboardPreferenceBinding(form, genericCheckboxName, messageboardCheckboxName) {
      var _this = this;

      _classCallCheck(this, MessageboardPreferenceBinding);

      this.messageboardCheckbox = form.querySelector('[type="checkbox"][name="' + messageboardCheckboxName + '"]');
      if (!this.messageboardCheckbox) {
        return;
      }
      this.messageboardCheckbox.addEventListener('change', function () {
        _this.rememberMessageboardChecked();
      });
      this.rememberMessageboardChecked();

      this.genericCheckbox = form.querySelector('[type="checkbox"][name="' + genericCheckboxName + '"]');
      this.genericCheckbox.addEventListener('change', function () {
        _this.updateMessageboardCheckbox();
      });
      this.updateMessageboardCheckbox();
    }

    _createClass(MessageboardPreferenceBinding, [{
      key: 'rememberMessageboardChecked',
      value: function rememberMessageboardChecked() {
        this.messageboardCheckedWas = this.messageboardCheckbox.checked;
      }
    }, {
      key: 'updateMessageboardCheckbox',
      value: function updateMessageboardCheckbox() {
        var enabled = this.genericCheckbox.checked;
        this.messageboardCheckbox.disabled = !enabled;
        this.messageboardCheckbox.checked = enabled ? this.messageboardCheckedWas : false;
      }
    }]);

    return MessageboardPreferenceBinding;
  })();

  var UpdateOnChange = function UpdateOnChange(form, sourceElement, targetName) {
    _classCallCheck(this, UpdateOnChange);

    var target = form.querySelector('[type="checkbox"][name="' + targetName + '"]');
    if (!target) return;
    sourceElement.addEventListener('change', function () {
      target.checked = sourceElement.checked;
    });
  };

  var UserPreferencesForm = function UserPreferencesForm(form) {
    _classCallCheck(this, UserPreferencesForm);

    Array.prototype.forEach.call(form.querySelectorAll('input[' + BOUND_MESSAGEBOARD_NAME + ']'), function (element) {
      new MessageboardPreferenceBinding(form, element.name, element.getAttribute(BOUND_MESSAGEBOARD_NAME));
    });
    Array.prototype.forEach.call(form.querySelectorAll('input[' + UPDATE_ON_CHANGE_NAME + ']'), function (element) {
      new UpdateOnChange(form, element, element.getAttribute(UPDATE_ON_CHANGE_NAME));
    });
  };

  Thredded.onPageLoad(function () {
    Array.prototype.forEach.call(document.querySelectorAll(COMPONENT_SELECTOR), function (form) {
      new UserPreferencesForm(form);
    });
  });
})();
'use strict';

(function () {
  var Thredded = window.Thredded;
  var autosize = window.autosize;

  var COMPONENT_SELECTOR = '[data-thredded-users-select]';

  Thredded.UsersSelect = {
    DROPDOWN_MAX_COUNT: 6
  };

  function parseNames(text) {
    var result = [];
    var current = [];
    var currentIndex = 0;
    var inQuoted = false;
    var inName = false;
    for (var i = 0; i < text.length; ++i) {
      var char = text.charAt(i);
      switch (char) {
        case '"':
          inQuoted = !inQuoted;
          break;
        case ' ':
          if (inName) current.push(char);
          break;
        case ',':
          if (inQuoted) {
            current.push(char);
          } else {
            inName = false;
            if (current.length) {
              result.push({ name: current.join(''), index: currentIndex });
              current.length = 0;
            }
          }
          break;
        default:
          if (!inName) currentIndex = i;
          inName = true;
          current.push(char);
      }
    }
    if (current.length) result.push({ name: current.join(''), index: currentIndex });
    return result;
  }

  var initUsersSelect = function initUsersSelect(textarea) {
    autosize(textarea);
    // Prevent multiple lines
    textarea.addEventListener('keypress', function (evt) {
      if (evt.keyCode === 13 || evt.keyCode === 10) {
        evt.preventDefault();
      }
    });
    var editor = new Textcomplete.editors.Textarea(textarea);
    var textcomplete = new Textcomplete(editor, {
      dropdown: {
        className: Thredded.UserTextcomplete.DROPDOWN_CLASS_NAME,
        maxCount: Thredded.UsersSelect.DROPDOWN_MAX_COUNT
      }
    });

    var searchFn = Thredded.UserTextcomplete.searchFn({
      url: textarea.getAttribute('data-autocomplete-url'),
      autocompleteMinLength: parseInt(textarea.getAttribute('data-autocomplete-min-length'), 10)
    });
    textcomplete.on('rendered', function () {
      if (textcomplete.dropdown.items.length) {
        textcomplete.dropdown.items[0].activate();
      }
    });
    textcomplete.register([{
      index: 0,
      match: function match(text) {
        var names = parseNames(text);
        if (names.length) {
          var _names = names[names.length - 1];
          var _name = _names.name;
          var index = _names.index;

          var matchData = [_name];
          matchData.index = index;
          return matchData;
        } else {
          return null;
        }
      },
      search: function search(term, callback, match) {
        searchFn(term, function (results) {
          var names = parseNames(textarea.value).map(function (_ref) {
            var name = _ref.name;
            return name;
          });
          callback(results.filter(function (result) {
            return names.indexOf(result.name) === -1;
          }));
        }, match);
      },
      template: Thredded.UserTextcomplete.formatUser,
      replace: function replace(_ref2) {
        var name = _ref2.name;

        if (/,/.test(name)) {
          return '"' + name + '", ';
        } else {
          return name + ', ';
        }
      }
    }]);
  };

  function destroyUsersSelect(textarea) {
    autosize.destroy(textarea);
  }

  window.Thredded.onPageLoad(function () {
    Array.prototype.forEach.call(document.querySelectorAll(COMPONENT_SELECTOR), function (node) {
      initUsersSelect(node);
    });
  });

  document.addEventListener('turbolinks:before-cache', function () {
    Array.prototype.forEach.call(document.querySelectorAll(COMPONENT_SELECTOR), function (node) {
      destroyUsersSelect(node);
    });
  });
})();
"use strict";
"use strict";
(function() {


}).call(this);
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//





;
