/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Mickael Jeanroy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/* global $util */
/* global $parse */
/* global $sanitize */
/* global $renderers */

var Column = function(column) {
  var isUndefined = $util.isUndefined;
  var escape = column.escape;
  var sortable = column.sortable;

  this.id = column.id;
  this.title = column.title || '';
  this.field = column.field || this.id;
  this.css = column.css || this.id;
  this.escape = isUndefined(escape) ? true : !!escape;
  this.sortable = isUndefined(sortable) ? true : !!sortable;

  // Sanitize input at construction
  if (escape) {
    this.title = $sanitize(this.title);
  }

  // Renderer can be defined as a custom function
  this.renderer = column.renderer;

  // Or it could be defined a string which is a shortcut to a pre-built renderer
  if ($util.isString(this.renderer)) {
    this.renderer = $renderers[this.renderer];
  }

  // If it is not a function, switch to default renderer
  // TODO Is it really a good idea ? Should we allow more flexibility ?
  // TODO Should we define a way to chain renderers ?
  if (!$util.isFunction(this.renderer)) {
    this.renderer = $renderers.identity;
  }

  // Parse that will be used to extract data value from plain old javascript object
  this.$parser = $parse(this.field);
};

Column.prototype = {

  // Check if a value is defined (i.e not undefined and not null)
  $$isDefined: function(val) {
    return !$util.isUndefined(val) && !$util.isNull(val);
  },

  // Render object using column settings
  render: function(object) {
    // Extract value
    var value = this.$$isDefined(object) ? this.$parser(object) : '';

    // Give extracted value as the first parameter
    // Give object as the second parameter to allow more flexibility
    // Give field to display as the third parameter to allow more flexibility
    // Use '$renderers' as this context, this way renderers can be easy compose
    var rendererValue = this.renderer.call($renderers, value, object, this.field);

    // If value is null or undefined, fallback to an empty string
    if (!this.$$isDefined(rendererValue)) {
      return '';
    }

    return this.escape ? $sanitize(rendererValue) : rendererValue;
  }
};