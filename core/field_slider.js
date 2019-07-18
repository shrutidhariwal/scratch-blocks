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
   * Array of SVGElement<text> for slider text numbers.
   * @type {!Array<SVGElement>}
   * @private
   */
  this.sliderTexts_ = [];



  /**
   * Array of numbers for current slider values.
   * @type {Array}
   * @private
   */
  this.sliders_ = [];
  

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

  /**
   * List to hold the SVG elements that contain the textboxes.
   * @type {!Array}
   * @private
   */
  this.textboxes_ = [];


  /**
   * Svg element representing the thumbnail.
   * @type {?SVGElement}
   * @private
   */
  this.thumbnail_ = null;

  /**
   * Array to hold the strings that each slider reprsents
   */
  this.sliderStrings_ = [];

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
Blockly.FieldSlider.SLIDER_NODE_PAD = 20;

/**
 * Fixed maximum slider height, in px.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.MAX_SLIDER_HEIGHT = 100;

/**
 * Fixed height of the div that will contain the sliders.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.SLIDER_STAGE_HEIGHT = 120;


/**
 * Maximum number of sliders that can exist.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.MAX_SLIDER_NUMBER = 10;


/**
 * Called when the field is placed on a block.
 * @param {Block} block The owning block.
 */
Blockly.FieldSlider.prototype.init = function() {
  if (this.fieldGroup_) {
    // Slider menu has already been initialized once.
    return;
  }
  // Create the window on the block that the user can click to show the dropdown menu.
  this.fieldGroup_ = Blockly.utils.createSvgElement('g', {}, null);
  this.size_.width = Blockly.FieldSlider.THUMBNAIL_SIZE +
    Blockly.FieldSlider.ARROW_SIZE + (Blockly.BlockSvg.DROPDOWN_ARROW_PADDING * 1.5);
  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);
  // Create the arrow in the thumbnail.
  var thumbX = Blockly.BlockSvg.DROPDOWN_ARROW_PADDING / 2;
  var thumbY = (this.size_.height - Blockly.FieldSlider.THUMBNAIL_SIZE) / 2;
  this.thumbnail_ = Blockly.utils.createSvgElement('g', {
    'transform': 'translate(' + thumbX + ', ' + thumbY + ')',
    'pointer-events': 'bounding-box', 'cursor': 'pointer'
  }, this.fieldGroup_);
  this.sliderThumbNodes_ = [];
  var nodeSize = Blockly.FieldSlider.THUMBNAIL_NODE_SIZE;
  var nodePad = Blockly.FieldSlider.THUMBNAIL_NODE_PAD;
  
  var maxHeight = ((nodeSize + nodePad)) * 5;
  
  var newHeight = this.sliders_[0] / 100 * maxHeight;
  var height = newHeight;
  for (var i = 0; i < Blockly.FieldSlider.MAX_SLIDER_NUMBER; i++) {
    if (i === 6) {
      height = 0.0;
    } 
    var attr = {
      'x': ((nodeSize + nodePad) * i) + nodePad,
      'y': (maxHeight - newHeight),
      'width': nodeSize, 'height': height,
      'rx': nodePad, 'ry': nodePad,
      'fill': '#FFFFFF'
    };
    this.sliderThumbNodes_.push(
        Blockly.utils.createSvgElement('rect', attr, this.thumbnail_)
    );
    
    this.thumbnail_.style.cursor = 'default';
    
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
 * Set the value for this slider menu. Furthermore, report this new value to the scratch-vm.
 * All changes to the value of this menu go through this function.
 * @param {String} sliderValue the new value of the sliders to be 
 * reported to Blockly in string format.
 * @override
 */
Blockly.FieldSlider.prototype.setValue = function(sliderValue) {
  if (!sliderValue) {
    return;
  }
  
  
  var newArray = sliderValue.split(';');
  var sliders = newArray[0];
  var strings = newArray[1];

  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    var oldValue = this.sliders_.toString() + ';' + this.sliderStrings_.toString();
    Blockly.Events.fire(new Blockly.Events.Change( // Change the value of the block in Blockly.
        // The fourth argument to this function is the old value of the field,
        // The fifth argument is the new value.
        this.sourceBlock_, 'field', this.name, oldValue, sliders + ';' + strings));
    }
  // Set the new value of this.sliders_ only after changing the field in the block
  // in order to have atomicity. This is the only place where this.sliders_ is changed.
  this.sliders_ = JSON.parse("[" + sliders + "]");
  this.sliderStrings_ = strings.split(',');
  this.updateSlider_();
};

/**
 * Get the value from this slider menu.
 * @return {String} Current slider values.
 */
Blockly.FieldSlider.prototype.getValue = function() {
  // Report the value as a string because Blockly cannot handle arrays.
  // Also safety from rep exposure.
  return this.sliders_.toString() + ';' + this.sliderStrings_.toString();
};

/**
 * Show the drop-down menu for editing this field.
 * Draw the sliders.
 * @private
 */
Blockly.FieldSlider.prototype.showEditor_ = function() {
  // If there is an existing drop-down someone else owns, hide it immediately and clear it.
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();
  let numSliders = this.sliders_.length;
  var div = Blockly.DropDownDiv.getContentDiv();
  
  // Build the SVG DOM.
  var sliderSize = (Blockly.FieldSlider.SLIDER_NODE_WIDTH * numSliders) +
    (Blockly.FieldSlider.SLIDER_NODE_PAD * (numSliders + 1));
  

  
  //BEGIN ADD FIRST BUTTON

  //TODO Add plus and minus signs instead of button/input
  var dropDownButtonDiv = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': Blockly.FieldSlider.MAX_SLIDER_HEIGHT + 'px',
    'width': Blockly.FieldSlider.SLIDER_NODE_WIDTH + 'px',
    'cursor': 'ns-resize'
  }, div);


  var foreignObjectDiv = Blockly.utils.createSvgElement('foreignObject', {
    'x': 0 + 'px', 'y': 0 + 'px',
    'width': Blockly.FieldSlider.SLIDER_NODE_WIDTH,
    'height': Blockly.FieldSlider.MAX_SLIDER_HEIGHT,
    'rx': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
    'ry': Blockly.FieldSlider.SLIDER_NODE_RADIUS
  }, dropDownButtonDiv);
  

  var button = document.createElement('button');
  button.innerHTML = '-';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.width = Blockly.FieldSlider.SLIDER_NODE_WIDTH + 'px';
  button.style.height = Blockly.FieldSlider.SLIDER_NODE_WIDTH + 'px';
  button.style.color = 'black';
  button.style.backgroundColor = 'white';
  button.style.borderRadius = '5px';
  button.style.borderColor = 'white';
  
  button.addEventListener('click', this.handleReduceNumSlidersEvent.bind(this), false);
  foreignObjectDiv.appendChild(button);
  





  // END ADD FIRST BUTTON

  

  this.sliderStage_ = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': (Blockly.FieldSlider.SLIDER_STAGE_HEIGHT + 20) + 'px',
    'width': sliderSize + 'px',
    'cursor': 'ns-resize'
  }, div);
  // Create the slider
  this.sliderRects_ = [];
  this.textboxes_ = [];



  

  for (var i = 0; i < Blockly.FieldSlider.MAX_SLIDER_NUMBER; i++) {
    // Create the rectangle svg objects, to be used as sliders.
    var x = (Blockly.FieldSlider.SLIDER_NODE_WIDTH * i) +
      (Blockly.FieldSlider.SLIDER_NODE_PAD * (i + 1));

    
    // Add the svg containers for the textboxes.

    var textBoxContainer = Blockly.utils.createSvgElement('foreignObject', {
      'height': 20,
      'width': Blockly.FieldSlider.SLIDER_NODE_PAD + Blockly.FieldSlider.SLIDER_NODE_WIDTH,
      'x': x - (Blockly.FieldSlider.SLIDER_NODE_PAD / 2),
      'y': Blockly.FieldSlider.SLIDER_STAGE_HEIGHT
    }, this.sliderStage_);

    // Put the textboxes into the containers.
    var textbox = document.createElement('input');
    textbox.style.width = (Blockly.FieldSlider.SLIDER_NODE_PAD + Blockly.FieldSlider.SLIDER_NODE_WIDTH) + 'px';
    if (i >= this.sliderStrings_.length) {
      textbox.defaultValue = i + 1;
    } else {
      textbox.defaultValue = this.sliderStrings_[i];
    }
    
    textBoxContainer.appendChild(textbox);
    this.textboxes_.push(textbox);
    var textboxFunction = this.keyboardListenerFactory(i);


    textbox.addEventListener('input', textboxFunction.bind(this), false);

    
    var y = sliderSize - Blockly.FieldSlider.SLIDER_NODE_WIDTH;
    var attr = {  
      'x': x + 'px', 'y': y + 'px',
      'width':  Blockly.FieldSlider.SLIDER_NODE_WIDTH,
      'height': Blockly.FieldSlider.MAX_SLIDER_HEIGHT,
      'rx': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
      'ry': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
      'fill': '#FFFFFF'
    };
    var newSliderRect = Blockly.utils.createSvgElement('rect', attr, this.sliderStage_);
    this.sliderStage_.appendChild(newSliderRect);
    this.sliderRects_.push(newSliderRect);

    // Create the text elements that will show up on top of the sliders and will display the current value when user clicks on the slider.

    // BEGIN CONSTRUCTION ZONE

    attr = {
      'x': x + 'px', 'y': y + 'px',
      'width':  Blockly.FieldSlider.SLIDER_NODE_WIDTH,
      'height': Blockly.FieldSlider.SLIDER_NODE_WIDTH,
      'rx': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
      'ry': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
      'visibility': 'hidden',
      'fill': '#000000',
      'font-size': '12'
      //'text-anchor': 'middle'
    };

    var newSliderText = Blockly.utils.createSvgElement('text', attr, this.sliderStage_);
    this.sliderTexts_.push(newSliderText);

    // Append textboxes as many as necessary



    
  }

  // ADD SECOND BUTTON

  var dropDownButtonDiv2 = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': Blockly.FieldSlider.MAX_SLIDER_HEIGHT + 'px',
    'width': (Blockly.FieldSlider.SLIDER_NODE_WIDTH) + 'px',
    'cursor': 'ns-resize'
  }, div);


  var foreignObjectDiv2 = Blockly.utils.createSvgElement('foreignObject', {
    'x': 0 + 'px', 'y': 0 + 'px',
    'width': Blockly.FieldSlider.SLIDER_NODE_WIDTH,
    'height': Blockly.FieldSlider.MAX_SLIDER_HEIGHT,
    'rx': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
    'ry': Blockly.FieldSlider.SLIDER_NODE_RADIUS
  }, dropDownButtonDiv2);

  var button = document.createElement('button');
  button.innerHTML = '+';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.width = Blockly.FieldSlider.SLIDER_NODE_WIDTH + 'px';
  button.style.height = Blockly.FieldSlider.SLIDER_NODE_WIDTH + 'px';
  button.style.color = 'black';
  button.style.backgroundColor = 'white';
  button.style.borderRadius = '5px';
  button.style.borderColor = 'white';
  
  button.addEventListener('click', this.handleIncreaseNumSlidersEvent.bind(this), false);
  foreignObjectDiv2.appendChild(button);







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
 * Event listener for the minus button in the dropdown menu.
 */
Blockly.FieldSlider.prototype.handleReduceNumSlidersEvent = function() {
  var currentValue = this.sliders_.length;
  if (currentValue === 2) {return;} // Number of sliders is already at the minimum so do nothing.

  currentValue--;
  var arrayValue = 100.0 / currentValue;
  var newArray = [];
  var newStrings = [];
  for (var i = 0; i < currentValue; i++){
    newArray.push(arrayValue);
    newStrings.push(i + 1);
  }

  this.setValue(newArray.toString() + ';' + newStrings.toString());
  
}

/**
 * Event listener for the plus button in the dropdown menu.
 */
Blockly.FieldSlider.prototype.handleIncreaseNumSlidersEvent = function () {
  var currentValue = this.sliders_.length;
  if (currentValue === Blockly.FieldSlider.MAX_SLIDER_NUMBER) {return;} // Number of sliders is already at the maximum so do nothing.
  currentValue++;
  var arrayValue = 100.0 / currentValue;
  var newArray = [];
  var newStrings = [];
  for (var i = 0; i < currentValue; i++){
    newArray.push(arrayValue);
    newStrings.push(i + 1);
  }

  this.setValue(newArray.toString() + ';' + newStrings.toString());

}

Blockly.FieldSlider.prototype.keyboardListenerFactory = function (index) {
  return function () {
    var newArray = this.sliderStrings_.slice();
    newArray[index] = this.textboxes_[index].value;
    this.setValue(this.sliders_.toString() + ';' + newArray.toString());
  };
}

/**
 * Redraw the slider with the current value.
 * @private
 */
Blockly.FieldSlider.prototype.updateSlider_ = function() {
  let thumbNodeSize = Blockly.FieldSlider.THUMBNAIL_NODE_SIZE;
  let thumbNodePad = Blockly.FieldSlider.THUMBNAIL_NODE_PAD;


  let numSliders = this.sliders_.length;
  var sliderSize = (Blockly.FieldSlider.SLIDER_NODE_WIDTH * numSliders) +
    (Blockly.FieldSlider.SLIDER_NODE_PAD * (numSliders + 0.5));
  // If the svg object to contain the rectangles has been initialized:

  
  if (this.sliderStage_) {
    // Change 
    this.sliderStage_.setAttribute('width', sliderSize + 'px');
    //this.sliderStage_.width = sliderSize + 'px';
  } 
  if (this.thumbnail_) {

    sliderSize = (thumbNodePad * (numSliders + 1)) + thumbNodeSize * numSliders +
    Blockly.FieldSlider.ARROW_SIZE + (Blockly.BlockSvg.DROPDOWN_ARROW_PADDING * 1.5);

  }

  

  /*Blockly.Events.fire(new Blockly.Events.Change( // Change the value of the block in Blockly.
    // The fourth argument to this function is the old value of the field,
    // The fifth argument is the new value.
    this.sourceBlock_, 'field', this.size_.width, this.size_.width, sliderSize));*/
  
  
  

  var numExtraThumbNodes = this.sliderThumbNodes_.length - this.sliders_.length;
  
  if (numExtraThumbNodes > 0) {
    for (var i = this.sliders_.length; i < this.sliderThumbNodes_.length; i++) {
      this.fillSliderNode_(0, i);
    }
  }
  for (var i = 0; i < this.sliders_.length; i++) {
    this.fillSliderNode_(this.sliders_[i], i);
  }
};

/**
 * Fill slider node with specified colour.
 * @param {!Array<SVGElement>} node The array of slider nodes.
 * @param {!number} index The sindex of the slider node.
 * @param {!string} fill The fill colour in '#rrggbb' format.
 */
Blockly.FieldSlider.prototype.fillSliderNode_ = function(height, index) {
  if (index >= this.sliderRects_.length) { // If the index is greater than the length of the list of svg rectangles:
    var maxHeight = Blockly.FieldSlider.MAX_SLIDER_HEIGHT;
    var newHeight = height / 100.0 * maxHeight;

    var pad = Blockly.FieldSlider.SLIDER_NODE_PAD;
    var width = Blockly.FieldSlider.SLIDER_NODE_WIDTH;
    var x = (width + pad) * index + pad;
    let numSliders = this.sliders_.length;
    var div = Blockly.DropDownDiv.getContentDiv();

    // Create the actual slider rectangle on the dropdown menu.
    var attr = {
      'x': x, 'y': (maxHeight - newHeight),
      'width':  width,
      'height': newHeight,
      'rx': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
      'ry': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
      'fill': '#FFFFFF'
    };

    
    
    var newSliderRect = Blockly.utils.createSvgElement('rect', attr, this.sliderStage_);
    newSliderRect.setAttribute('y', Blockly.FieldSlider.SLIDER_STAGE_HEIGHT - newHeight);
    this.sliderRects_.push(newSliderRect);

    // Create the thumbnail of the slider rectangle.

    maxHeight = (Blockly.FieldSlider.THUMBNAIL_NODE_SIZE + Blockly.FieldSlider.THUMBNAIL_NODE_PAD) * 5;
    newHeight = height / 100.0 * maxHeight;
    pad = Blockly.FieldSlider.THUMBNAIL_NODE_PAD;
    width = Blockly.FieldSlider.THUMBNAIL_NODE_SIZE
    x = (width + pad) * index + pad;

    attr = {
      'x': x, 'y': (maxHeight - newHeight),
      'width':  width,
      'height': newHeight,
      'rx': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
      'ry': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
      'fill': '#FFFFFF'
    };
    this.sliderThumbNodes_.push(newSliderRect);



    // Create the text box.
    attr = {
      'x': x + 'px', 'y': (Blockly.FieldSlider.SLIDER_STAGE_HEIGHT - newHeight) + 'px',
      'width': Blockly.FieldSlider.SLIDER_NODE_WIDTH,
      'height': Blockly.FieldSlider.SLIDER_NODE_WIDTH,
      'rx': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
      'ry': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
      'fill': '#000000',
      'font-size': '12',
      'visibility': 'hidden'
    };
    var newSliderText = Blockly.utils.createSvgElement('text', attr, this.sliderStage_);
    newSliderText.innerHTML = Math.round(height) + '';
    this.sliderTexts_.push(newSliderText);
  } 
  
  else {
    var maxHeight = Blockly.FieldSlider.MAX_SLIDER_HEIGHT;
    var newHeight = height / 100.0 * maxHeight;
    
    this.sliderTexts_[index].setAttribute('y', (Blockly.FieldSlider.SLIDER_STAGE_HEIGHT - newHeight));
    this.sliderTexts_[index].innerHTML = Math.round(height) + '';
    


    this.sliderRects_[index].setAttribute('y', (Blockly.FieldSlider.SLIDER_STAGE_HEIGHT - newHeight));
    this.sliderRects_[index].setAttribute('height', newHeight)



    maxHeight = (Blockly.FieldSlider.THUMBNAIL_NODE_SIZE + Blockly.FieldSlider.THUMBNAIL_NODE_PAD) * 5;
    newHeight = height / 100.0 * maxHeight;

    this.sliderThumbNodes_[index].setAttribute('y', (maxHeight - newHeight));
    
    this.sliderThumbNodes_[index].setAttribute('height', newHeight);
    
  }
};

Blockly.FieldSlider.prototype.setSliderNode_ = function(sliderIndex, newHeight) {
  let numSliders = this.sliders_.length;
  let slidersCopy = this.sliders_.slice(0);
  
  if (sliderIndex < 0 || sliderIndex > numSliders) return;
  if (newHeight < 0) {
    newHeight = 0;
  } else if (newHeight > 100) {
    newHeight = 100;
  }
  let heightDiff = this.sliders_[sliderIndex] - newHeight;
  let sumOfRest = 0;
  for (var i = 0; i < numSliders; i++){
    if (i != sliderIndex) {
      sumOfRest += this.sliders_[i];    
    }
  }
  for (var i = 0; i < numSliders; i++){
    if (i != sliderIndex) {
      if (sumOfRest === 0) {
        slidersCopy[i] = slidersCopy[i] + heightDiff / (numSliders - 1);

      } else {
        slidersCopy[i] = slidersCopy[i] + (heightDiff * slidersCopy[i] / sumOfRest);
        if (slidersCopy[i] < 0) {
          slidersCopy[i] = 0;
        }
      } 
    }
  }
  slidersCopy[sliderIndex] = newHeight;
  this.setValue(slidersCopy.toString() + ';' + this.sliderStrings_.toString());
};

/**
 * Takes in a mouse event and gives the new height to setSliderNode as a number between 0 and 100.
 * @param {!Event} e Mouse event.
 */
Blockly.FieldSlider.prototype.onMouseDown = function(e) {
  let numSliders = this.sliders_.length;
  var bBox = this.sliderStage_.getBoundingClientRect();
  var nodeSize = Blockly.FieldSlider.SLIDER_NODE_WIDTH;
  var nodePad = Blockly.FieldSlider.SLIDER_NODE_PAD;
  var dy = e.clientY - bBox.top - (Blockly.FieldSlider.SLIDER_STAGE_HEIGHT - Blockly.FieldSlider.MAX_SLIDER_HEIGHT);
  
  this.sliderMoveWrapper_ =
    Blockly.bindEvent_(document.body, 'mousemove', this, this.onMouseMove);
  this.sliderReleaseWrapper_ =
    Blockly.bindEvent_(document.body, 'mouseup', this, this.onMouseUp);

  
  var sliderHit = parseInt(this.checkForSlider_(e));
  this.currentSlider_ = sliderHit;
  var newHeight = 100 * (Blockly.FieldSlider.MAX_SLIDER_HEIGHT - dy) / Blockly.FieldSlider.MAX_SLIDER_HEIGHT;
  if (newHeight < 0) {return;}
  if (sliderHit > -1 && sliderHit < numSliders) {
    this.sliderTexts_[sliderHit].setAttribute('visibility', 'visible');
    this.setSliderNode_(sliderHit, newHeight);
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
  for (var i = 0; i < this.sliders_.length; i++) {
    this.sliderRects_[i].style.fill = '#FFFFFF';
  }
  this.paintStyle_ = null;
  
  this.sliderTexts_[this.currentSlider_].setAttribute('visibility', 'hidden');
  this.currentSlider_ = null;
};

/**
 * Toggle slider nodes on and off by dragging mouse.
 * @param {!Event} e Mouse move event.
 */
Blockly.FieldSlider.prototype.onMouseMove = function(e) {
  e.preventDefault();
  var bBox = this.sliderStage_.getBoundingClientRect();
  var dy = e.clientY - bBox.top - (Blockly.FieldSlider.SLIDER_STAGE_HEIGHT - Blockly.FieldSlider.MAX_SLIDER_HEIGHT);

  
  var sliderHit = this.currentSlider_;
  var newHeight = 100 * (Blockly.FieldSlider.MAX_SLIDER_HEIGHT - dy) / Blockly.FieldSlider.MAX_SLIDER_HEIGHT;
  this.setSliderNode_(sliderHit, newHeight);
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