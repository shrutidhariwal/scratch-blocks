/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview 5x5 slider input field.
 * Displays an editable 5x5 slider for controlling LED arrays.
 * @author khanning@gmail.com (Kreg Hanning)
 */
'use strict';

goog.provide('Blockly.FieldSlider');

goog.require('Blockly.DropDownDiv');

/**
 * Class for a slider field.
 * @param {number} slider The default slider value represented by a 25-bit integer.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldSlider = function(slider) {
  Blockly.FieldSlider.superClass_.constructor.call(this, slider);
  this.addArgType('slider');
  /**
   * Array of SVGElement<rect> for slider thumbnail image on block field.
   * @type {!Array<SVGElement>}
   * @private
   */
  this.ledThumbNodes_ = [];
  /**
   * Array of SVGElement<rect> for slider editor in dropdown menu.
   * @type {!Array<SVGElement>}
   * @private
   */
  this.ledButtons_ = [];
  /**
   * String for storing current slider value.
   * @type {!String]
   * @private
   */
  this.slider_ = '';
  /**
   * SVGElement for LED slider in editor.
   * @type {?SVGElement}
   * @private
   */
  this.sliderStage_ = null;
  /**
   * SVG image for dropdown arrow.
   * @type {?SVGElement}
   * @private
   */
  this.arrow_ = null;
  /**
   * String indicating slider paint style.
   * value can be [null, 'fill', 'clear'].
   * @type {?String}
   * @private
   */
  this.paintStyle_ = null;
  /**
   * Touch event wrapper.
   * Runs when the field is selected.
   * @type {!Array}
   * @private
   */
  this.mouseDownWrapper_ = null;
  /**
   * Touch event wrapper.
   * Runs when the clear button editor button is selected.
   * @type {!Array}
   * @private
   */
  this.clearButtonWrapper_ = null;
  /**
   * Touch event wrapper.
   * Runs when the fill button editor button is selected.
   * @type {!Array}
   * @private
   */
  this.fillButtonWrapper_ = null;
  /**
   * Touch event wrapper.
   * Runs when the slider editor is touched.
   * @type {!Array}
   * @private
   */
  this.sliderTouchWrapper_ = null;
  /**
   * Touch event wrapper.
   * Runs when the slider editor touch event moves.
   * @type {!Array}
   * @private
   */
  this.sliderMoveWrapper_ = null;
  /**
   * Touch event wrapper.
   * Runs when the slider editor is released.
   * @type {!Array}
   * @private
   */
  this.sliderReleaseWrapper_ = null;
};
goog.inherits(Blockly.FieldSlider, Blockly.Field);

/**
 * Construct a FieldSlider from a JSON arg object.
 * @param {!Object} options A JSON object with options (slider).
 * @returns {!Blockly.FieldSlider} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldSlider.fromJson = function(options) {
  return new Blockly.FieldSlider(options['slider']);
};

/**
 * Fixed size of the slider thumbnail in the input field, in px.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.THUMBNAIL_SIZE = 26;

/**
 * Fixed size of each slider thumbnail node, in px.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.THUMBNAIL_NODE_SIZE = 4;

/**
 * Fixed size of each slider thumbnail node, in px.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.THUMBNAIL_NODE_PAD = 1;

/**
 * Fixed size of arrow icon in drop down menu, in px.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.ARROW_SIZE = 12;

/**
 * Fixed size of each button inside the 5x5 slider, in px.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.MATRIX_NODE_SIZE = 18;

/**
 * Fixed corner radius for 5x5 slider buttons, in px.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.MATRIX_NODE_RADIUS = 4;

/**
 * Fixed padding for 5x5 slider buttons, in px.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.MATRIX_NODE_PAD = 5;

/**
 * String with 25 '0' chars.
 * Used for clearing a slider or filling an LED node array.
 * @type {string}
 * @const
 */
Blockly.FieldSlider.ZEROS = '0000000000000000000000000';

/**
 * String with 25 '1' chars.
 * Used for filling a slider.
 * @type {string}
 * @const
 */
Blockly.FieldSlider.ONES = '1111111111111111111111111';

/**
 * Called when the field is placed on a block.
 * @param {Block} block The owning block.
 */
Blockly.FieldSlider.prototype.init = function() {
  if (this.fieldGroup_) {
    // Slider menu has already been initialized once.
    return;
  }

  // Build the DOM.
  this.fieldGroup_ = Blockly.utils.createSvgElement('g', {}, null);
  this.size_.width = Blockly.FieldSlider.THUMBNAIL_SIZE +
    Blockly.FieldSlider.ARROW_SIZE + (Blockly.BlockSvg.DROPDOWN_ARROW_PADDING * 1.5);

  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);

  var thumbX = Blockly.BlockSvg.DROPDOWN_ARROW_PADDING / 2;
  var thumbY = (this.size_.height - Blockly.FieldSlider.THUMBNAIL_SIZE) / 2;
  var thumbnail = Blockly.utils.createSvgElement('g', {
    'transform': 'translate(' + thumbX + ', ' + thumbY + ')',
    'pointer-events': 'bounding-box', 'cursor': 'pointer'
  }, this.fieldGroup_);
  this.ledThumbNodes_ = [];
  var nodeSize = Blockly.FieldSlider.THUMBNAIL_NODE_SIZE;
  var nodePad = Blockly.FieldSlider.THUMBNAIL_NODE_PAD;
  for (var i = 0; i < 5; i++) {
    for (var n = 0; n < 5; n++) {
      var attr = {
        'x': ((nodeSize + nodePad) * n) + nodePad,
        'y': ((nodeSize + nodePad) * i) + nodePad,
        'width': nodeSize, 'height': nodeSize,
        'rx': nodePad, 'ry': nodePad
      };
      this.ledThumbNodes_.push(
          Blockly.utils.createSvgElement('rect', attr, thumbnail)
      );
    }
    thumbnail.style.cursor = 'default';
    this.updateSlider_();
  }

  if (!this.arrow_) {
    var arrowX = Blockly.FieldSlider.THUMBNAIL_SIZE +
      Blockly.BlockSvg.DROPDOWN_ARROW_PADDING * 1.5;
    var arrowY = (this.size_.height - Blockly.FieldSlider.ARROW_SIZE) / 2;
    this.arrow_ = Blockly.utils.createSvgElement('image', {
      'height': Blockly.FieldSlider.ARROW_SIZE + 'px',
      'width': Blockly.FieldSlider.ARROW_SIZE + 'px',
      'transform': 'translate(' + arrowX + ', ' + arrowY + ')'
    }, this.fieldGroup_);
    this.arrow_.setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', Blockly.mainWorkspace.options.pathToMedia +
        'dropdown-arrow.svg');
    this.arrow_.style.cursor = 'default';
  }

  this.mouseDownWrapper_ = Blockly.bindEventWithChecks_(
      this.getClickTarget_(), 'mousedown', this, this.onMouseDown_);
};

/**
 * Set the value for this slider menu.
 * @param {string} slider The new slider value represented by a 25-bit integer.
 * @override
 */
Blockly.FieldSlider.prototype.setValue = function(slider) {
  if (!slider || slider === this.slider_) {
    return;  // No change
  }
  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.Change(
        this.sourceBlock_, 'field', this.name, this.slider_, slider));
  }
  slider = slider + Blockly.FieldSlider.ZEROS.substr(0, 25 - slider.length);
  this.slider_ = slider;
  this.updateSlider_();
};

/**
 * Get the value from this slider menu.
 * @return {string} Current slider value.
 */
Blockly.FieldSlider.prototype.getValue = function() {
  return String(this.slider_);
};

/**
 * Show the drop-down menu for editing this field.
 * @private
 */
Blockly.FieldSlider.prototype.showEditor_ = function() {
  // If there is an existing drop-down someone else owns, hide it immediately and clear it.
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();
  var div = Blockly.DropDownDiv.getContentDiv();
  // Build the SVG DOM.
  var sliderSize = (Blockly.FieldSlider.MATRIX_NODE_SIZE * 5) +
    (Blockly.FieldSlider.MATRIX_NODE_PAD * 6);
  this.sliderStage_ = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': sliderSize + 'px',
    'width': sliderSize + 'px'
  }, div);
  // Create the 5x5 slider
  this.ledButtons_ = [];
  for (var i = 0; i < 5; i++) {
    for (var n = 0; n < 5; n++) {
      var x = (Blockly.FieldSlider.MATRIX_NODE_SIZE * n) +
        (Blockly.FieldSlider.MATRIX_NODE_PAD * (n + 1));
      var y = (Blockly.FieldSlider.MATRIX_NODE_SIZE * i) +
        (Blockly.FieldSlider.MATRIX_NODE_PAD * (i + 1));
      var attr = {
        'x': x + 'px', 'y': y + 'px',
        'width': Blockly.FieldSlider.MATRIX_NODE_SIZE,
        'height': Blockly.FieldSlider.MATRIX_NODE_SIZE,
        'rx': Blockly.FieldSlider.MATRIX_NODE_RADIUS,
        'ry': Blockly.FieldSlider.MATRIX_NODE_RADIUS
      };
      var led = Blockly.utils.createSvgElement('rect', attr, this.sliderStage_);
      this.sliderStage_.appendChild(led);
      this.ledButtons_.push(led);
    }
  }
  // Div for lower button menu
  var buttonDiv = document.createElement('div');
  // Button to clear slider
  var clearButtonDiv = document.createElement('div');
  clearButtonDiv.className = 'scratchSliderButtonDiv';
  var clearButton = this.createButton_(this.sourceBlock_.colourSecondary_);
  clearButtonDiv.appendChild(clearButton);
  // Button to fill slider
  var fillButtonDiv = document.createElement('div');
  fillButtonDiv.className = 'scratchSliderButtonDiv';
  var fillButton = this.createButton_('#FFFFFF');
  fillButtonDiv.appendChild(fillButton);

  buttonDiv.appendChild(clearButtonDiv);
  buttonDiv.appendChild(fillButtonDiv);
  div.appendChild(buttonDiv);

  Blockly.DropDownDiv.setColour(this.sourceBlock_.getColour(),
      this.sourceBlock_.getColourTertiary());
  Blockly.DropDownDiv.setCategory(this.sourceBlock_.getCategory());
  Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_);

  this.sliderTouchWrapper_ =
      Blockly.bindEvent_(this.sliderStage_, 'mousedown', this, this.onMouseDown);
  this.clearButtonWrapper_ =
      Blockly.bindEvent_(clearButton, 'mousedown', this, this.clearSlider_);
  this.fillButtonWrapper_ =
    Blockly.bindEvent_(fillButton, 'mousedown', this, this.fillSlider_);

  // Update the slider for the current value
  this.updateSlider_();

};

this.nodeCallback_ = function(e, num) {
  console.log(num);
};

/**
 * Make an svg object that resembles a 3x3 slider to be used as a button.
 * @param {string} fill The color to fill the slider nodes.
 * @return {SvgElement} The button svg element.
 */
Blockly.FieldSlider.prototype.createButton_ = function(fill) {
  var button = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': Blockly.FieldSlider.MATRIX_NODE_SIZE + 'px',
    'width': Blockly.FieldSlider.MATRIX_NODE_SIZE + 'px'
  });
  var nodeSize = Blockly.FieldSlider.MATRIX_NODE_SIZE / 4;
  var nodePad = Blockly.FieldSlider.MATRIX_NODE_SIZE / 16;
  for (var i = 0; i < 3; i++) {
    for (var n = 0; n < 3; n++) {
      Blockly.utils.createSvgElement('rect', {
        'x': ((nodeSize + nodePad) * n) + nodePad,
        'y': ((nodeSize + nodePad) * i) + nodePad,
        'width': nodeSize, 'height': nodeSize,
        'rx': nodePad, 'ry': nodePad,
        'fill': fill
      }, button);
    }
  }
  return button;
};

/**
 * Redraw the slider with the current value.
 * @private
 */
Blockly.FieldSlider.prototype.updateSlider_ = function() {
  for (var i = 0; i < this.slider_.length; i++) {
    if (this.slider_[i] === '0') {
      this.fillSliderNode_(this.ledButtons_, i, this.sourceBlock_.colourSecondary_);
      this.fillSliderNode_(this.ledThumbNodes_, i, this.sourceBlock_.colour_);
    } else {
      this.fillSliderNode_(this.ledButtons_, i, '#FFFFFF');
      this.fillSliderNode_(this.ledThumbNodes_, i, '#FFFFFF');
    }
  }
};

/**
 * Clear the slider.
 * @param {!Event} e Mouse event.
 */
Blockly.FieldSlider.prototype.clearSlider_ = function(e) {
  if (e.button != 0) return;
  this.setValue(Blockly.FieldSlider.ZEROS);
};

/**
 * Fill the slider.
 * @param {!Event} e Mouse event.
 */
Blockly.FieldSlider.prototype.fillSlider_ = function(e) {
  if (e.button != 0) return;
  this.setValue(Blockly.FieldSlider.ONES);
};

/**
 * Fill slider node with specified colour.
 * @param {!Array<SVGElement>} node The array of slider nodes.
 * @param {!number} index The index of the slider node.
 * @param {!string} fill The fill colour in '#rrggbb' format.
 */
Blockly.FieldSlider.prototype.fillSliderNode_ = function(node, index, fill) {
  if (!node || !node[index] || !fill) return;
  node[index].setAttribute('fill', fill);
};

Blockly.FieldSlider.prototype.setLEDNode_ = function(led, state) {
  if (led < 0 || led > 24) return;
  var slider = this.slider_.substr(0, led) + state + this.slider_.substr(led + 1);
  this.setValue(slider);
};

Blockly.FieldSlider.prototype.fillLEDNode_ = function(led) {
  if (led < 0 || led > 24) return;
  this.setLEDNode_(led, '1');
};

Blockly.FieldSlider.prototype.clearLEDNode_ = function(led) {
  if (led < 0 || led > 24) return;
  this.setLEDNode_(led, '0');
};

Blockly.FieldSlider.prototype.toggleLEDNode_ = function(led) {
  if (led < 0 || led > 24) return;
  if (this.slider_.charAt(led) === '0') {
    this.setLEDNode_(led, '1');
  } else {
    this.setLEDNode_(led, '0');
  }
};

/**
 * Toggle slider nodes on and off.
 * @param {!Event} e Mouse event.
 */
Blockly.FieldSlider.prototype.onMouseDown = function(e) {
  this.sliderMoveWrapper_ =
    Blockly.bindEvent_(document.body, 'mousemove', this, this.onMouseMove);
  this.sliderReleaseWrapper_ =
    Blockly.bindEvent_(document.body, 'mouseup', this, this.onMouseUp);
  var ledHit = this.checkForLED_(e);
  if (ledHit > -1) {
    if (this.slider_.charAt(ledHit) === '0') {
      this.paintStyle_ = 'fill';
    } else {
      this.paintStyle_ = 'clear';
    }
    this.toggleLEDNode_(ledHit);
    this.updateSlider_();
  } else {
    this.paintStyle_ = null;
  }
};

/**
 * Unbind mouse move event and clear the paint style.
 * @param {!Event} e Mouse move event.
 */
Blockly.FieldSlider.prototype.onMouseUp = function() {
  Blockly.unbindEvent_(this.sliderMoveWrapper_);
  Blockly.unbindEvent_(this.sliderReleaseWrapper_);
  this.paintStyle_ = null;
};

/**
 * Toggle slider nodes on and off by dragging mouse.
 * @param {!Event} e Mouse move event.
 */
Blockly.FieldSlider.prototype.onMouseMove = function(e) {
  e.preventDefault();
  if (this.paintStyle_) {
    var led = this.checkForLED_(e);
    if (led < 0) return;
    if (this.paintStyle_ === 'clear') {
      this.clearLEDNode_(led);
    } else if (this.paintStyle_ === 'fill') {
      this.fillLEDNode_(led);
    }
  }
};

/**
 * Check if mouse coordinates collide with a slider node.
 * @param {!Event} e Mouse move event.
 * @return {number} The matching slider node or -1 for none.
 */
Blockly.FieldSlider.prototype.checkForLED_ = function(e) {
  var bBox = this.sliderStage_.getBoundingClientRect();
  var nodeSize = Blockly.FieldSlider.MATRIX_NODE_SIZE;
  var nodePad = Blockly.FieldSlider.MATRIX_NODE_PAD;
  var dx = e.clientX - bBox.left;
  var dy = e.clientY - bBox.top;
  var min = nodePad / 2;
  var max = bBox.width - (nodePad / 2);
  if (dx < min || dx > max || dy < min || dy > max) {
    return -1;
  }
  var xDiv = Math.trunc((dx - nodePad / 2) / (nodeSize + nodePad));
  var yDiv = Math.trunc((dy - nodePad / 2) / (nodeSize + nodePad));
  return xDiv + (yDiv * nodePad);
};

/**
 * Clean up this FieldSlider, as well as the inherited Field.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldSlider.prototype.dispose_ = function() {
  var thisField = this;
  return function() {
    Blockly.FieldSlider.superClass_.dispose_.call(thisField)();
    thisField.sliderStage_ = null;
    if (thisField.mouseDownWrapper_) {
      Blockly.unbindEvent_(thisField.mouseDownWrapper_);
    }
    if (thisField.sliderTouchWrapper_) {
      Blockly.unbindEvent_(thisField.sliderTouchWrapper_);
    }
    if (thisField.sliderReleaseWrapper_) {
      Blockly.unbindEvent_(thisField.sliderReleaseWrapper_);
    }
    if (thisField.sliderMoveWrapper_) {
      Blockly.unbindEvent_(thisField.sliderMoveWrapper_);
    }
    if (thisField.clearButtonWrapper_) {
      Blockly.unbindEvent_(thisField.clearButtonWrapper_);
    }
    if (thisField.fillButtonWrapper_) {
      Blockly.unbindEvent_(thisField.fillButtonWrapper_);
    }
  };
};

Blockly.Field.register('field_slider', Blockly.FieldSlider);
