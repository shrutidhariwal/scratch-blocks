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
 * 
 * waste-bin.svg icon made by Egor Rumyantsev from www.flaticon.com
 */

/**
 * @fileoverview n-slider input field
 * Displays n sliders with fixed total height.
 * @author Ersin Arioglu (ersin.arioglu@gmail.com)
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
Blockly.FieldSlider.SLIDER_STAGE_HEIGHT = 140;//120;


/**
 * Maximum number of sliders that can exist.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.MAX_SLIDER_NUMBER = 10;

/**
 * Width of the buttons in the menu.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.BUTTON_WIDTH = 24;

/**
 * Height of the buttons in the menu.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.BUTTON_HEIGHT = 18;

/**
 * Padding between the buttons.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.BUTTON_PAD = 4;

/**
 * Height of margin under the slider rectangles, for space to contain
 * input boxes and buttons.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.BOTTOM_MARGIN = 45;

/**
 * Height of the input boxes.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.INPUT_BOX_HEIGHT = 20;

/**
 * Width of the input boxes.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.INPUT_BOX_WIDTH = 30;

/**
 * Path to the waste bin icon.
 * @type {string}
 * @const
 */
Blockly.FieldSlider.WASTEBIN_SVG_PATH = 'icons/waste-bin.svg';

/**
 * Size of the waste bin icon.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.WASTEBIN_SIZE = 13;

/**
 * Margin between input boxes and wastebin
 * @type {number}
 * @const
 */
Blockly.FieldSlider.WASTEBIN_MARGIN = 5;


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
  
  
  var newArray = sliderValue.split('|');
  var sliders = newArray[0];
  var strings = newArray[1];

  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    var oldValue = this.sliders_.toString() + '|' + this.sliderStrings_.toString();
    Blockly.Events.fire(new Blockly.Events.Change( // Change the value of the block in Blockly.
        // The fourth argument to this function is the old value of the field,
        // The fifth argument is the new value.
        this.sourceBlock_, 'field', this.name, oldValue, sliders + '|' + strings));
    }
  // Set the new value of this.sliders_ only after changing the field in the block
  // in order to have atomicity. This is the only place where this.sliders_ is changed.
  this.sliders_ = JSON.parse("[" + sliders + "]");
  this.sliderStrings_ = strings.split('~');
  this.updateSlider_();
};

/**
 * Get the value from this slider menu.
 * @return {String} Current slider values.
 */
Blockly.FieldSlider.prototype.getValue = function() {
  // Report the value as a string because Blockly cannot handle arrays.
  // Also safety from rep exposure.
  return this.sliders_.toString() + '|' + this.sliderStrings_.join('~');
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
  
  var sliderSize = (Blockly.FieldSlider.SLIDER_NODE_WIDTH * numSliders) +
  (Blockly.FieldSlider.SLIDER_NODE_PAD * numSliders);


  
  

  
  //BEGIN ADD FIRST BUTTON

  //TODO Add plus and minus signs instead of button/input
  /*
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
  foreignObjectDiv.appendChild(button); */

  // END ADD FIRST BUTTON

  

  this.sliderStage_ = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': (Blockly.FieldSlider.SLIDER_STAGE_HEIGHT + Blockly.FieldSlider.BOTTOM_MARGIN) + 'px',
    'width': sliderSize + 'px',
    'cursor': 'ns-resize'
  }, div);
  
  this.sliderRects_ = [];
  this.textboxes_ = [];
  this.sliderTexts_ = [];

  // Add the div that will contain the uniform distribution and random distribution buttons.
  var buttonDiv = Blockly.utils.createSvgElement('svg', {
   /* 'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1', */
    'x': '0px',
    'y': '0px'
   // 'cursor': 'ns-resize'
  }, this.sliderStage_);
  this.createUniformRandomButtons(buttonDiv); // Draw the buttons.




  
  // Add the slider rectangles.
  for (var i = 0; i < Blockly.FieldSlider.MAX_SLIDER_NUMBER; i++) {
    var x = (Blockly.FieldSlider.SLIDER_NODE_WIDTH * i) +
      (Blockly.FieldSlider.SLIDER_NODE_PAD * (i + 0.5));


    // Import the waste-bin svg.
    var wasteBin = Blockly.utils.createSvgElement('image',
      {
        'width': Blockly.FieldSlider.WASTEBIN_SIZE,
        'height': Blockly.FieldSlider.WASTEBIN_SIZE,
        'x': x + (Blockly.FieldSlider.SLIDER_NODE_WIDTH - Blockly.FieldSlider.WASTEBIN_SIZE) / 2,
        'y': Blockly.FieldSlider.SLIDER_STAGE_HEIGHT + Blockly.FieldSlider.INPUT_BOX_HEIGHT + Blockly.FieldSlider.WASTEBIN_MARGIN * 2
      }, this.sliderStage_);
    wasteBin.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      Blockly.mainWorkspace.options.pathToMedia + Blockly.FieldSlider.WASTEBIN_SVG_PATH
    );


    

    
    // Add the svg containers for the textboxes.

    var textBoxContainer = Blockly.utils.createSvgElement('foreignObject', {
      'height': Blockly.FieldSlider.INPUT_BOX_HEIGHT + 2,
      'width': Blockly.FieldSlider.INPUT_BOX_WIDTH,
      'x': x - ((Blockly.FieldSlider.INPUT_BOX_WIDTH - Blockly.FieldSlider.SLIDER_NODE_WIDTH) / 2),
      'y': Blockly.FieldSlider.SLIDER_STAGE_HEIGHT + Blockly.FieldSlider.WASTEBIN_MARGIN
    }, this.sliderStage_);

    // Put the textboxes into the containers.
    var textbox = document.createElement('input');
    textbox.style.width = Blockly.FieldSlider.INPUT_BOX_WIDTH + 'px';
    textbox.style.height = Blockly.FieldSlider.INPUT_BOX_HEIGHT + 'px';
    textbox.style.border = 'none';
    textbox.style.outline = 'none';
    if (i >= this.sliderStrings_.length) {
      textbox.defaultValue = i + 1;
    } else {
      textbox.defaultValue = this.sliderStrings_[i];
    }
    textbox.style.borderRadius = '5px';
    
    //textbox.style.borderColor = 'white';

    textbox.style.textAlign = 'center';
    
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
    'height': Blockly.FieldSlider.BOTTOM_MARGIN - Blockly.FieldSlider.WASTEBIN_MARGIN - 1 + 'px',
    'width': (Blockly.FieldSlider.INPUT_BOX_HEIGHT + Blockly.FieldSlider.WASTEBIN_MARGIN) + 'px',
    'cursor': 'ns-resize'
  }, div);


  var foreignObjectDiv2 = Blockly.utils.createSvgElement('foreignObject', {
    'x': Blockly.FieldSlider.WASTEBIN_MARGIN + 'px', 'y': 0 + 'px',
    'width': Blockly.FieldSlider.INPUT_BOX_HEIGHT + Blockly.FieldSlider.WASTEBIN_MARGIN ,
    'height': Blockly.FieldSlider.BOTTOM_MARGIN,
    'rx': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
    'ry': Blockly.FieldSlider.SLIDER_NODE_RADIUS
  }, dropDownButtonDiv2);

  var button = document.createElement('button');
  button.innerHTML = '+';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.width = Blockly.FieldSlider.INPUT_BOX_HEIGHT + 'px';
  button.style.height = Blockly.FieldSlider.INPUT_BOX_HEIGHT + 'px';
  button.style.color = 'black';
  button.style.backgroundColor = 'white';
  button.style.borderRadius = '5px';
  button.style.borderColor  = 'white';
  button.style.outline = 'none';
  
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

Blockly.FieldSlider.prototype.createUniformRandomButtons = function(button) {
  var nodeWidth = Blockly.FieldSlider.BUTTON_WIDTH / 4;
  var nodePad = Blockly.FieldSlider.BUTTON_WIDTH / 16;
  var nodeHeight = Blockly.FieldSlider.BUTTON_HEIGHT * 5 / 6;
  // Create the three vertical bars to represent a uniform distribution.
  for (var i = 0; i < 3; i++) {
    Blockly.utils.createSvgElement('rect', {
      'x': (nodeWidth * i) + (nodePad * (i + 1)),
      'y': 0,
      'width': nodeWidth, 'height': nodeHeight,
      'rx': nodePad, 'ry': nodePad,
      'fill': '#FFFFFF'
    }, button);
  }
  // Create the horizontal line underneath the vertical bars.
  Blockly.utils.createSvgElement('rect', {
    'x': 0,
    'y': nodeHeight + nodePad,
    'width': Blockly.FieldSlider.BUTTON_WIDTH,
    'height': 1,
    'fill': '#FFFFFF'
  }, button);

  var leftMost = Blockly.FieldSlider.BUTTON_WIDTH + Blockly.FieldSlider.BUTTON_PAD;

  var sliderHeights = [30, 80, 60];

  for (var i = 0; i < 3; i++) {
    Blockly.utils.createSvgElement('rect', {
      'x': leftMost + (nodeWidth * i) + (nodePad * (i + 1)),
      'y': nodeHeight * (1 - sliderHeights[i] / 100.0),
      'width': nodeWidth,
      'height': nodeHeight * (sliderHeights[i] / 100.0),
      'rx': nodePad, 'ry': nodePad,
      'fill': '#FFFFFF'
    }, button);
  }
  Blockly.utils.createSvgElement('rect', {
    'x': leftMost,
    'y': nodeHeight + nodePad,
    'width': Blockly.FieldSlider.BUTTON_WIDTH,
    'height': 1,
    'fill': '#FFFFFF'
  }, button);
}


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
    newStrings.push(this.sliderStrings_[i]);
  }

  this.setValue(newArray.toString() + '|' + newStrings.join('~'));
  
}

/**
 * Event listener for the plus button in the dropdown menu.
 */
Blockly.FieldSlider.prototype.handleIncreaseNumSlidersEvent = function () {
  var currentValue = this.sliders_.length;
  if (currentValue === Blockly.FieldSlider.MAX_SLIDER_NUMBER) {return;} // Number of sliders is already at the maximum so do nothing.
  var arrayValue = 100.0 / (currentValue + 1);
  this.setSliderNode_(currentValue, arrayValue);
  
  var newArray = this.sliders_.slice();
  var newStrings = this.sliderStrings_.slice();
  
  newArray[newArray.length - 1] = arrayValue;
  newStrings[newArray.length - 1] = newArray.length;

  this.setValue(newArray.toString() + '|' + newStrings.join('~'));

}

Blockly.FieldSlider.prototype.keyboardListenerFactory = function (index) {
  return function () {
    var newArray = this.sliderStrings_.slice();
    // Disallow the vertical bar and the tilde from being entered into the input box, because doing so would break the rep.
    if (this.textboxes_[index].value.match(/\||~/g)) {
      this.textboxes_[index].value = this.textboxes_[index].value.replace(/\||~/g, '');
    }
    newArray[index] = this.textboxes_[index].value;
    this.setValue(this.sliders_.toString() + '|' + newArray.join('~'));
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
    (Blockly.FieldSlider.SLIDER_NODE_PAD * numSliders);
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
  var pad = Blockly.FieldSlider.SLIDER_NODE_PAD;
  var width = Blockly.FieldSlider.SLIDER_NODE_WIDTH;
  var x = width * index + pad * (index + 0.5);
  if (index >= this.sliderRects_.length) { // If the index is greater than the length of the list of svg rectangles:
    var maxHeight = Blockly.FieldSlider.MAX_SLIDER_HEIGHT;
    var newHeight = height / 100.0 * maxHeight;

    
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
      'x': x + 'px', 'y': (Blockly.FieldSlider.SLIDER_STAGE_HEIGHT - newHeight) - 10 + 'px',
      'textLength': '6em',
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
    
    this.sliderTexts_[index].setAttribute('y', (Blockly.FieldSlider.SLIDER_STAGE_HEIGHT - newHeight - 10));
    this.sliderTexts_[index].innerHTML = Math.round(height) + '';
    var textWidth = this.sliderTexts_[index].getBoundingClientRect().width;
    this.sliderTexts_[index].setAttribute('x', x - (textWidth - Blockly.FieldSlider.SLIDER_NODE_WIDTH)/2);

    this.textboxes_[index].value = this.sliderStrings_[index];


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
  if (sliderIndex === numSliders) {
    this.sliders_.push(0.0);
  }
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
  this.setValue(slidersCopy.toString() + '|' + this.sliderStrings_.join('~'));
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
  
  if (newHeight < 0) {
    dy = e.clientY - bBox.top;
    if (dy > (Blockly.FieldSlider.SLIDER_STAGE_HEIGHT + Blockly.FieldSlider.INPUT_BOX_HEIGHT + Blockly.FieldSlider.WASTEBIN_MARGIN * 2)) {
      this.removeSlider_(sliderHit);
    }
    return;
  }

  if (newHeight > 110) {
    this.checkForButton_(e);
    return;
  }
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
  if (newHeight < 0 || newHeight > 110) {return;}
  this.setSliderNode_(sliderHit, newHeight);
};

Blockly.FieldSlider.prototype.removeSlider_ = function(sliderHit) {
  var currentValue = this.sliders_.length;
  if (currentValue === 2) {return;}
  this.setSliderNode_(sliderHit, 0);
  var newArray = [];
  var newStrings = [];
  for (var i = 0; i < currentValue; i++){
    if (i !== sliderHit) {
      newArray.push(this.sliders_[i]);
      newStrings.push(this.sliderStrings_[i]);
    }
    
  }
  this.setValue(newArray.toString() + '|' + newStrings.join('~'));
}

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
  var xDiv = Math.trunc((dx) / (nodeSize + nodePad));
  return xDiv;
};

Blockly.FieldSlider.prototype.checkForButton_ = function(e) {
  var bBox = this.sliderStage_.getBoundingClientRect();
  var dx = e.clientX - bBox.left;
  var dy = e.clientY - bBox.top;
  var width = Blockly.FieldSlider.BUTTON_WIDTH;
  var height = Blockly.FieldSlider.BUTTON_HEIGHT;
  var pad = Blockly.FieldSlider.BUTTON_PAD;
  if (dy <= height) {
    if (dx <= width) {
      this.setToUniform_();
    } else if (dx >= (width + pad) && dx <= (2 * width + pad)) {
      this.setToRandom_();
    }
  }
}

Blockly.FieldSlider.prototype.setToUniform_ = function () {
  var currentValue = this.sliders_.length;
  var arrayValue = 100.0 / currentValue;
  var newArray = [];
  var newStrings = [];
  for (var i = 0; i < currentValue; i++){
    newArray.push(arrayValue);
    newStrings.push(this.sliderStrings_[i]);
  }
  this.setValue(newArray.toString() + '|' + newStrings.join('~'));
}

Blockly.FieldSlider.prototype.setToRandom_ = function() {
  var resources = 100.0;
  var numSliders = this.sliders_.length;
  var newValue;
  var newArray = [];
  var newStrings = [];
  for (var i = 0; i < numSliders; i++) {
    if (i === (numSliders - 1)) { // If this is last slider give it the rest of the probability.
      newArray.push(resources);
    } else { // Else give a random ratio of the remaining probability.
      newValue = Math.random() * resources;
      resources -= newValue;
      newArray.push(newValue);
    }
    newStrings.push(this.sliderStrings_[i]);
  }
  newArray.sort(() => Math.random() - 0.5); // Shuffle the array.
  this.setValue(newArray.toString() + '|' + newStrings.join('~'));
}

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