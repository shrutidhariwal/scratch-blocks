/**
 * @license
 * Dice Block Sliders
 *
 * Copyright 2019 Massachusetts Institute of Technology
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
 * @fileoverview n-slider input field
 * Displays n sliders with fixed total height.
 * @author Ersin Arioglu (ersin@mit.edu) and Shannon Peng (pengs@mit.edu)
 */
'use strict';

goog.provide('Blockly.FieldSlider');

goog.require('Blockly.DropDownDiv');

/**
 * Class for a slider field.
 * @param {Array<number>} slider The default slider values represented by an array of numbers.
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
  this.sliderThumbNodes_ = [];
  /**
   * Array of SVGElement<rect> for slider editor in dropdown menu.
   * @type {!Array<SVGElement>}
   * @private
   */
  this.sliderRects_ = [];
  /**
   * Array of numbers for current slider values.
   * @type {Array}
   * @private
   */
  this.sliders_ = [20, 20, 20, 20, 20];

  /**
   * SVGElement for slider group in editor.
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
  /**
   * Current slider that is selected.
   * Must be integer from 0 to 4.
   * @type {Number}
   * @private
   */
  this.currentSlider_ = null;

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
 * Fixed width of each slider thumbnail node, in px.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.THUMBNAIL_NODE_SIZE = 4;

/**
 * Fixed padding for each slider thumbnail node, in px.
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
 * Fixed width of each slider, in px.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.SLIDER_NODE_WIDTH = 18;

/**
 * Fixed corner radius for sliders, in px.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.SLIDER_NODE_RADIUS = 4;

/**
 * Fixed padding for sliders, in px.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.SLIDER_NODE_PAD = 5;

/**
 * Fixed maximum slider height, in px.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.MAX_SLIDER_HEIGHT = 100;

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
  this.sliderThumbNodes_ = [];
  var nodeSize = Blockly.FieldSlider.THUMBNAIL_NODE_SIZE;
  var nodePad = Blockly.FieldSlider.THUMBNAIL_NODE_PAD;
  for (var i = 0; i < 5; i++) {
    
    var attr = {
      'x': ((nodeSize + nodePad) * i) + nodePad,
      'y': ((nodeSize + nodePad)) + nodePad,
      'width': nodeSize, 'height': nodeSize,
      'rx': nodePad, 'ry': nodePad,
      'fill': '#FFFFFF'
    };
    this.sliderThumbNodes_.push(
        Blockly.utils.createSvgElement('rect', attr, thumbnail)
    );
    
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
 * @param {Array} Update the slider values.
 * @override
 */
Blockly.FieldSlider.prototype.setValue = function(slider) {
  if (!slider || slider === this.sliders_) {
    return;  // No change
  }

  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.Change(
        this.sourceBlock_, 'field', this.name, this.sliders_, slider));
  }
  this.updateSlider_();
};

/**
 * Get the value from this slider menu.
 * @return {Array} Current slider values.
 */
Blockly.FieldSlider.prototype.getValue = function() {
  return this.sliders_.slice(0);
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
  var sliderSize = (Blockly.FieldSlider.SLIDER_NODE_WIDTH * 5) +
    (Blockly.FieldSlider.SLIDER_NODE_PAD * 6);
  this.sliderStage_ = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': sliderSize + 'px',
    'width': sliderSize + 'px',
    'cursor': 'ns-resize'
  }, div);
  // Create the slider
  this.sliderRects_ = [];
  for (var i = 0; i < 5; i++) {
    
    var x = (Blockly.FieldSlider.SLIDER_NODE_WIDTH * i) +
      (Blockly.FieldSlider.SLIDER_NODE_PAD * (i + 1));
    var y = sliderSize - Blockly.FieldSlider.SLIDER_NODE_WIDTH;
    var attr = {
      'x': x + 'px', 'y': y + 'px',
      'width': Blockly.FieldSlider.SLIDER_NODE_WIDTH,
      'height': Blockly.FieldSlider.MAX_SLIDER_HEIGHT,
      'rx': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
      'ry': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
      'fill': '#FFFFFF'
    };
    var newSliderRect = Blockly.utils.createSvgElement('rect', attr, this.sliderStage_);
   
    this.sliderStage_.appendChild(newSliderRect);
    this.sliderRects_.push(newSliderRect);
    
  }

  Blockly.DropDownDiv.setColour(this.sourceBlock_.getColour(),
      this.sourceBlock_.getColourTertiary());
  Blockly.DropDownDiv.setCategory(this.sourceBlock_.getCategory());
  Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_);

  this.sliderTouchWrapper_ =
      Blockly.bindEvent_(this.sliderStage_, 'mousedown', this, this.onMouseDown);

  // Update the slider for the current value
  this.updateSlider_();

};

this.nodeCallback_ = function(e, num) {
  console.log(num);
};

/**
 * Redraw the slider with the current value.
 * @private
 */
Blockly.FieldSlider.prototype.updateSlider_ = function() {
  for (var i = 0; i < this.sliders_.length; i++) {
    this.fillSliderNode_(this.sliderRects_, i, this.sliders_[i], '#FFFFFF');
    this.fillSliderNode_(this.sliderThumbNodes_, i, this.sliders_[i], '#FFFFFF');
  }
};

/**
 * Fill slider node with specified colour.
 * @param {!Array<SVGElement>} node The array of slider nodes.
 * @param {!number} index The sindex of the slider node.
 * @param {!string} fill The fill colour in '#rrggbb' format.
 */
Blockly.FieldSlider.prototype.fillSliderNode_ = function(node, index, fill) {
  if (!node || !node[index] || !fill) return;
  var newHeight = this.sliders_[index] / 100 * Blockly.FieldSlider.MAX_SLIDER_HEIGHT;
  
  node[index].setAttribute('height', newHeight);
  
  node[index].setAttribute('y', ((Blockly.FieldSlider.MAX_SLIDER_HEIGHT - newHeight)) + 'px');
};

Blockly.FieldSlider.prototype.setSliderNode_ = function(sliderIndex, newHeight) {
  if (sliderIndex < 0 || sliderIndex > 5) return;
  if (newHeight < 0) {
    newHeight = 0;
  } else if (newHeight > 100) {
    newHeight = 100;
  }
  let heightDiff = this.sliders_[sliderIndex] - newHeight;
  let sumOfRest = 0;
  for (var i = 0; i < 5; i++){
    if (i != sliderIndex) {
      sumOfRest += this.sliders_[i];    
    }
  }
  for (var i = 0; i < 5; i++){
    if (i != sliderIndex) {
      this.sliders_[i] = this.sliders_[i]  + (heightDiff * this.sliders_[i] / sumOfRest);
    }
  }
  this.sliders_[sliderIndex] = newHeight;
};

/**
 * Takes in a mouse event and gives the new height to setSliderNode as a number between 0 and 100.
 * @param {!Event} e Mouse event.
 */
Blockly.FieldSlider.prototype.onMouseDown = function(e) {
  var bBox = this.sliderStage_.getBoundingClientRect();
  var nodeSize = Blockly.FieldSlider.SLIDER_NODE_WIDTH;
  var nodePad = Blockly.FieldSlider.SLIDER_NODE_PAD;
  var dy = e.clientY - bBox.top;
  this.sliderMoveWrapper_ =
    Blockly.bindEvent_(document.body, 'mousemove', this, this.onMouseMove);
  this.sliderReleaseWrapper_ =
    Blockly.bindEvent_(document.body, 'mouseup', this, this.onMouseUp);

  
  var sliderHit = parseInt(this.checkForSlider_(e));
  this.currentSlider_ = sliderHit;
  var newHeight = 100 * (Blockly.FieldSlider.MAX_SLIDER_HEIGHT - dy) / Blockly.FieldSlider.MAX_SLIDER_HEIGHT;
  if (sliderHit > -1 && sliderHit < 5) {
    this.setSliderNode_(sliderHit, newHeight);
    this.updateSlider_();
    this.sliderRects_[sliderHit].style.fill = '#91dfbf';
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
  for (var i = 0; i < 5; i++) {
    this.sliderRects_[i].style.fill = '#FFFFFF';
  }
  this.paintStyle_ = null;
};

/**
 * Toggle slider nodes on and off by dragging mouse.
 * @param {!Event} e Mouse move event.
 */
Blockly.FieldSlider.prototype.onMouseMove = function(e) {
  e.preventDefault();
  var bBox = this.sliderStage_.getBoundingClientRect();
  var nodeSize = Blockly.FieldSlider.SLIDER_NODE_WIDTH;
  var nodePad = Blockly.FieldSlider.SLIDER_NODE_PAD;
  var dy = e.clientY - bBox.top;

  var sliderHit = this.currentSlider_;
  var newHeight = 100 * (Blockly.FieldSlider.MAX_SLIDER_HEIGHT - dy) / Blockly.FieldSlider.MAX_SLIDER_HEIGHT;
  this.setSliderNode_(sliderHit, newHeight);
  this.updateSlider_();
};

/**
 * Check if mouse coordinates collide with a slider node.
 * @param {!Event} e Mouse move event.
 * @return {number} The matching slider node or -1 for none.
 */
Blockly.FieldSlider.prototype.checkForSlider_ = function(e) {
  var bBox = this.sliderStage_.getBoundingClientRect();
  var nodeSize = Blockly.FieldSlider.SLIDER_NODE_WIDTH;
  var nodePad = Blockly.FieldSlider.SLIDER_NODE_PAD;
  var dx = e.clientX - bBox.left;
  var dy = e.clientY - bBox.top;
  var min = nodePad / 2;
  var max = bBox.width - (nodePad / 2);
  if (dx < min || dx > max || dy < min || dy > max) {
    return -1;
  }
  var xDiv = Math.trunc((dx - nodePad / 2) / (nodeSize + nodePad));
  
  return xDiv;
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
  };
};

Blockly.Field.register('field_slider', Blockly.FieldSlider);
