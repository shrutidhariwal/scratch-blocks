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
 * CREDIT:
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
   * Boolean that is true when field is operating in random mode.
   * @type {boolean}
   * @private
   */
  this.randomMode_ = false;
  

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
   * Array to hold the strings that each slider represents
   */
  this.sliderStrings_ = [];

  /**
   * Records which of the slider text values is currently visible.
   */
  this.visibleSliderText_ = null;

  /**
   * Holds the SVG element representing the add slider button.
   */
  this.addSliderButton_ = null;

  /**
   * Holds the SVG element representing the random distribution button.
   */
  this.randomButton_ = null;

  /**
   * Holds the SVG element representing the uniform distribution button.
   */
  this.uniformButton_ = null;
  
  /**
   * Holds the SVG element that is the white background behind the sliders.
   */
  this.whiteBackground_ = null;

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
Blockly.FieldSlider.SLIDER_STAGE_HEIGHT = 145;//140;


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
Blockly.FieldSlider.BUTTON_HEIGHT = 17;

/**
 * Padding between the buttons.
 * @type {number}
 * @const
 */
Blockly.FieldSlider.BUTTON_PAD = 8;

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
  var newHeight;
   
  for (var i = 0; i < Blockly.FieldSlider.MAX_SLIDER_NUMBER; i++) {
    if (i >= this.sliders_.length) {
      newHeight = 0.0;
    } else {
      newHeight = this.sliders_[i] / 100 * maxHeight;
    }
    var visibility;
    if (this.randomMode_) {
      visibility = 'hidden';
    } else {
      visibility = 'visible';
    }
    var attr = {
      'x': ((nodeSize + nodePad) * i) + nodePad,
      'y': (maxHeight - newHeight),
      'width': nodeSize, 'height': newHeight,
      'rx': nodePad, 'ry': nodePad,
      'fill': '#FFFFFF', 'visibility': visibility
    };
    console.log('I GET HERE');
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
  var random;
  if (newArray.length === 3) {  
    if (!this.randomMode_) {    
      this.toggleRandomMode_();
    }
    random = '|random';
  } else {
    if (this.randomMode_) {
      this.toggleRandomMode_();
    }
    random = '';
  }


  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    var oldValue = this.sliders_.toString() + '|' + this.sliderStrings_.toString();
    Blockly.Events.fire(new Blockly.Events.Change( // Change the value of the block in Blockly.
        // The fourth argument to this function is the old value of the field,
        // The fifth argument is the new value.
        this.sourceBlock_, 'field', this.name, oldValue, sliders + '|' + strings + random));
    }
  // Set the new value of this.sliders_ only after changing the field in the block
  // in order to have atomicity. This is the only place where this.sliders_ is mutated.
  
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
  if (this.randomMode_) {
    return this.sliders_.toString() + '|' + this.sliderStrings_.join('~') + '|random';
  } else {
    return this.sliders_.toString() + '|' + this.sliderStrings_.join('~');
  }
  
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

  var maxWidth = (Blockly.FieldSlider.SLIDER_NODE_WIDTH + Blockly.FieldSlider.SLIDER_NODE_PAD) * Blockly.FieldSlider.MAX_SLIDER_NUMBER;
  


  Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': Blockly.FieldSlider.SLIDER_NODE_WIDTH,
    'width': Blockly.FieldSlider.INPUT_BOX_HEIGHT + Blockly.FieldSlider.WASTEBIN_MARGIN
  }, div);

  this.sliderStage_ = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': (Blockly.FieldSlider.SLIDER_STAGE_HEIGHT + Blockly.FieldSlider.BOTTOM_MARGIN) + 'px',
    'width': sliderSize + 'px',
    'cursor': 'ns-resize'
  }, div);

  this.sliderStage_.addEventListener('mousemove', this.stageHoverMoveListener_.bind(this), false);
  this.sliderStage_.addEventListener('mouseleave', this.stageMouseOut_.bind(this), false);
  
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

  
  this.whiteBackground_ = Blockly.utils.createSvgElement('rect', {
    'x': '0px', 'y': Blockly.FieldSlider.BUTTON_HEIGHT + (Blockly.FieldSlider.WASTEBIN_MARGIN / 2) + 'px',
    'width': sliderSize + 'px', 'height': (Blockly.FieldSlider.SLIDER_STAGE_HEIGHT - Blockly.FieldSlider.BUTTON_HEIGHT) + 'px',
    'rx': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
    'ry': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
    'fill': '#FFFFFF'
  }, this.sliderStage_);


  
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
    wasteBin.addEventListener('click', this.removeSliderListener_.bind(this), false);


    

    
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

    textbox.style.textAlign = 'center';
    
    textBoxContainer.appendChild(textbox);
    this.textboxes_.push(textbox);
    var textboxFunction = this.keyboardListenerFactory(i);


    textbox.addEventListener('input', textboxFunction.bind(this), false);

    // Add the slider rectangles.
    var y = sliderSize - Blockly.FieldSlider.SLIDER_NODE_WIDTH;
    var attr = {  
      'x': x + 'px', 'y': y + 'px',
      'width':  Blockly.FieldSlider.SLIDER_NODE_WIDTH,
      'height': Blockly.FieldSlider.MAX_SLIDER_HEIGHT,
      'rx': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
      'ry': Blockly.FieldSlider.SLIDER_NODE_RADIUS,
      'fill': '#65CEFF'
    };

    
    var newSliderRect = Blockly.utils.createSvgElement('rect', attr, this.sliderStage_);
    if (this.randomMode_) {
      newSliderRect.setAttribute('visibility', 'hidden');
    }
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

  // ADD SLIDER BUTTON BEING ADDED HERE

  var dropDownButtonDiv2 = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': Blockly.FieldSlider.BOTTOM_MARGIN - Blockly.FieldSlider.WASTEBIN_MARGIN - 1 + 'px',
    'width': (Blockly.FieldSlider.INPUT_BOX_HEIGHT + Blockly.FieldSlider.WASTEBIN_MARGIN) + 'px'
  }, div);


  var button = Blockly.utils.createSvgElement('circle', {
    'cx': Blockly.FieldSlider.INPUT_BOX_HEIGHT / 2 + Blockly.FieldSlider.WASTEBIN_MARGIN,
    'cy': Blockly.FieldSlider.INPUT_BOX_HEIGHT / 2,
    'r':  Blockly.FieldSlider.INPUT_BOX_HEIGHT / 2,
    'fill': this.sourceBlock_.getColourTertiary()
  }, dropDownButtonDiv2);


  

  var addButtonText = Blockly.utils.createSvgElement('text', {
    'x': Blockly.FieldSlider.INPUT_BOX_HEIGHT / 2 + 0.5,
    'y': Blockly.FieldSlider.INPUT_BOX_HEIGHT / 2 + 4,
    'fill': '#91dfbf'
  }, dropDownButtonDiv2);
  addButtonText.innerHTML = '+';
  
  button.addEventListener('click', this.handleIncreaseNumSlidersEvent.bind(this), false);
  button.addEventListener('mouseover', this.buttonMouseOver_.bind(this), false);
  button.addEventListener('mouseout', this.buttonMouseOut_.bind(this), false);
  addButtonText.addEventListener('mouseover', this.buttonMouseOver_.bind(this), false);
  addButtonText.addEventListener('mouseout', this.buttonMouseOut_.bind(this), false);
  addButtonText.addEventListener('click', this.handleIncreaseNumSlidersEvent.bind(this), false);
  this.addSliderButton_ = button;
  



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
 * Create the "return to uniform" and "random distribution" buttons.
 */
Blockly.FieldSlider.prototype.createUniformRandomButtons = function(button) {
  var paddingOfPattern = 2;
  var nodeWidth = (Blockly.FieldSlider.BUTTON_WIDTH - paddingOfPattern * 2) / 4;
  var nodePad = (Blockly.FieldSlider.BUTTON_WIDTH - paddingOfPattern * 2) / 16;
  var nodeHeight = (Blockly.FieldSlider.BUTTON_HEIGHT - paddingOfPattern * 2) * 5 / 6;
  var fill = '#91dfbf';

  

  this.uniformButton_ = Blockly.utils.createSvgElement('rect', {
    'x': 0,
    'y': 0,
    'width': Blockly.FieldSlider.BUTTON_WIDTH,
    'height': Blockly.FieldSlider.BUTTON_HEIGHT,
    'fill': this.sourceBlock_.getColourTertiary(),
    'rx': nodePad, 'ry': nodePad
  }, button);

  this.uniformButton_.addEventListener('mouseover', this.uniformMouseOver_.bind(this), false);
  this.uniformButton_.addEventListener('mouseout', this.uniformMouseOut_.bind(this), false);

  // Create the three vertical bars to represent a uniform distribution.

  var node;
  for (var i = 0; i < 3; i++) {
    node = Blockly.utils.createSvgElement('rect', {
      'x': (nodeWidth * i) + (nodePad * (i + 1)) + paddingOfPattern,
      'y': paddingOfPattern,
      'width': nodeWidth, 'height': nodeHeight,
      'rx': nodePad, 'ry': nodePad,
      'fill': fill
    }, button); 
    node.addEventListener('mouseover', this.uniformMouseOver_.bind(this), false);
    node.addEventListener('mouseout', this.uniformMouseOut_.bind(this), false);

  }
  // Create the horizontal line underneath the vertical bars.
  node = Blockly.utils.createSvgElement('rect', {
    'x': paddingOfPattern,
    'y': nodeHeight + nodePad + paddingOfPattern,
    'width': Blockly.FieldSlider.BUTTON_WIDTH - paddingOfPattern * 2,
    'height': 1,
    'fill': fill
  }, button);
  node.addEventListener('mouseover', this.uniformMouseOver_.bind(this), false);
  node.addEventListener('mouseout', this.uniformMouseOut_.bind(this), false);

  var leftMost = Blockly.FieldSlider.BUTTON_WIDTH + Blockly.FieldSlider.BUTTON_PAD;
  // Create the random distribution button.
  var sliderHeights = [30, 80, 60];

  var randomFill;
  if (this.randomMode_){
    randomFill = '#FFFFFF';
  } else {
    randomFill = this.sourceBlock_.getColourTertiary();
  }

  this.randomButton_ = Blockly.utils.createSvgElement('rect', {
    'x': leftMost,
    'y': 0,
    'width': Blockly.FieldSlider.BUTTON_WIDTH,
    'height': Blockly.FieldSlider.BUTTON_HEIGHT,
    'fill': randomFill,
    'rx': nodePad, 'ry': nodePad
  }, button);

  this.randomButton_.addEventListener('mouseover', this.randomMouseOver_.bind(this), false);
  this.randomButton_.addEventListener('mouseout', this.randomMouseOut_.bind(this), false);

  
  for (var i = 0; i < 3; i++) {
    node = Blockly.utils.createSvgElement('rect', {
      'x': leftMost + (nodeWidth * i) + (nodePad * (i + 1)) + paddingOfPattern,
      'y': nodeHeight * (1 - sliderHeights[i] / 100.0) + paddingOfPattern,
      'width': nodeWidth,
      'height': nodeHeight * (sliderHeights[i] / 100.0),
      'rx': nodePad, 'ry': nodePad,
      'fill': fill
    }, button);
    node.addEventListener('mouseover', this.randomMouseOver_.bind(this), false);
    node.addEventListener('mouseout', this.randomMouseOut_.bind(this), false);
  }

  node = Blockly.utils.createSvgElement('rect', {
    'x': leftMost + paddingOfPattern,
    'y': nodeHeight + nodePad + paddingOfPattern,
    'width': Blockly.FieldSlider.BUTTON_WIDTH - paddingOfPattern * 2,
    'height': 1,
    'fill': fill
  }, button);
  node.addEventListener('mouseover', this.randomMouseOver_.bind(this), false);
  node.addEventListener('mouseout', this.randomMouseOut_.bind(this), false);
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
    if (this.randomMode_) {
      this.setValue(this.sliders_.toString() + '|' + newArray.join('~') + '|random');
    } else {
      this.setValue(this.sliders_.toString() + '|' + newArray.join('~'));
    }
  };
}

/**
 * Redraw the slider with the current value.
 * @private
 */
Blockly.FieldSlider.prototype.updateSlider_ = function() {
  var nodeSize = Blockly.FieldSlider.SLIDER_NODE_WIDTH;
  var nodePad = Blockly.FieldSlider.SLIDER_NODE_PAD;


  let numSliders = this.sliders_.length;
  var sliderSize = (nodeSize + nodePad) * numSliders;
  

  if (this.sliderStage_) {
    // This code to shift the dropdown in case of resize.
    var div = Blockly.DropDownDiv.getContentDiv();
    var divOldWidth = div.getBoundingClientRect().width;
    this.sliderStage_.setAttribute('width', sliderSize + 'px');
    var divLeft = Blockly.DropDownDiv.getLeft();
    divLeft = parseFloat(divLeft.slice(0, divLeft.length - 2));
    var divNewWidth = div.getBoundingClientRect().width;
    // If size has changed, shift dropdown to new correct location.
    if (divOldWidth !== divNewWidth) {
      var shiftBy = (divOldWidth - divNewWidth) / 2.0;
      Blockly.DropDownDiv.setLeft(divLeft + shiftBy);
    }
  } 
  if (this.whiteBackground_) {
    this.whiteBackground_.setAttribute('width', sliderSize + 'px');
  }
  

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
  
  var maxHeight = (Blockly.FieldSlider.THUMBNAIL_NODE_SIZE + Blockly.FieldSlider.THUMBNAIL_NODE_PAD) * 5;
  var newHeight = height / 100.0 * maxHeight; 
  
  if (this.sliderStage_) {
    this.sliderThumbNodes_[index].setAttribute('y', (maxHeight - newHeight)); 
    this.sliderThumbNodes_[index].setAttribute('height', newHeight);

    maxHeight = Blockly.FieldSlider.MAX_SLIDER_HEIGHT;
    newHeight = height / 100.0 * maxHeight;
    
    this.sliderTexts_[index].setAttribute('y', (Blockly.FieldSlider.SLIDER_STAGE_HEIGHT - newHeight - 10));
    this.sliderTexts_[index].innerHTML = Math.round(height) + '';
    var textWidth = this.sliderTexts_[index].getBoundingClientRect().width;
    this.sliderTexts_[index].setAttribute('x', x - (textWidth - Blockly.FieldSlider.SLIDER_NODE_WIDTH)/2);

    this.textboxes_[index].value = this.sliderStrings_[index];

    this.sliderRects_[index].setAttribute('y', (Blockly.FieldSlider.SLIDER_STAGE_HEIGHT - newHeight));
    this.sliderRects_[index].setAttribute('height', newHeight)

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
  var dy = e.clientY - bBox.top - (Blockly.FieldSlider.SLIDER_STAGE_HEIGHT - Blockly.FieldSlider.MAX_SLIDER_HEIGHT);
  
  this.sliderMoveWrapper_ =
    Blockly.bindEvent_(document.body, 'mousemove', this, this.onMouseMove);
  this.sliderReleaseWrapper_ =
    Blockly.bindEvent_(document.body, 'mouseup', this, this.onMouseUp);

  var sliderHit = parseInt(this.checkForSlider_(e));
  this.currentSlider_ = sliderHit;
  var newHeight = 100 * (Blockly.FieldSlider.MAX_SLIDER_HEIGHT - dy) / Blockly.FieldSlider.MAX_SLIDER_HEIGHT;
  
  if (newHeight < -5) {
    return;
  }

  if (newHeight > 110) {
    // Checks if the random distribution or uniform distribution buttons were hit.
    this.checkForButton_(e);
    return;
  }
  if (sliderHit > -1 && sliderHit < numSliders) {
    if (this.randomMode_) {this.sliderTexts_[sliderHit].setAttribute('visibility', 'visible');}
    this.setSliderNode_(sliderHit, newHeight);
    this.sliderRects_[sliderHit].style.fill = this.sourceBlock_.getColourTertiary();//'#91dfbf';
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
    this.sliderRects_[i].style.fill = '#65CEFF';
  }
  this.paintStyle_ = null;
  
  //this.sliderTexts_[this.currentSlider_].setAttribute('visibility', 'hidden');
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
  if (newHeight < -5 || newHeight > 110) {return;}
  this.setSliderNode_(sliderHit, newHeight);
};


/**
 * This listener attached to wastebin svgs and removes corresponding slider when called.
 */
Blockly.FieldSlider.prototype.removeSliderListener_ = function(e) {
  var sliderHit = parseInt(this.checkForSlider_(e));
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
  if (xDiv >= this.sliders_.length) {xDiv = this.sliders_.length - 1;}
  if (xDiv < 0) {xDiv = 0;}
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

/**
 * Click listener for the random button.
 */
Blockly.FieldSlider.prototype.setToRandom_ = function() {
  if (this.randomMode_) {
    this.randomButton_.setAttribute('fill', this.sourceBlock_.getColourTertiary());
    //this.randomMode_ = false;
    this.setValue(this.sliders_.toString() + '|' + this.sliderStrings_.join('~'));
  } else {
    this.randomButton_.setAttribute('fill', '#FFFFFF');
    //this.randomMode_ = true;
    this.setValue(this.sliders_.toString() + '|' + this.sliderStrings_.join('~') + '|random');
  }



  /*
  var sumOfArray = 0.0;
  var numSliders = this.sliders_.length;
  var newValue;
  var newArray = [];
  var newStrings = [];
  for (var i = 0; i < numSliders; i++) {
    newStrings.push(this.sliderStrings_[i]);
    newValue = Math.random();
    newArray.push(newValue);
    sumOfArray += newValue;
  }
  for (var i = 0; i < numSliders; i++) {
    newArray[i] = (newArray[i] / sumOfArray) * 100.0;
  }
  this.setValue(newArray.toString() + '|' + newStrings.join('~'));
  */
}









Blockly.FieldSlider.prototype.stageHoverMoveListener_ = function(e) {
  var sliderHit = this.checkForSlider_(e);
  var bBox = this.sliderStage_.getBoundingClientRect();
  var dy = e.clientY - bBox.top;
  var currentCursor = this.sliderStage_.getAttribute('cursor');
  var bottom = Blockly.FieldSlider.SLIDER_STAGE_HEIGHT;
  if (currentCursor === 'ns-resize') {
    if (dy <= Blockly.FieldSlider.BUTTON_HEIGHT || dy >= bottom) {
      this.sliderStage_.setAttribute('cursor', 'default');
      if (this.visibleSliderText_ !== null) {
        this.sliderTexts_[this.visibleSliderText_].setAttribute('visibility', 'hidden');
        this.visibleSliderText_ = null;
      }
    }
  } else if (currentCursor === 'default') {
    if (dy > Blockly.FieldSlider.BUTTON_HEIGHT && dy < bottom) {
      this.sliderStage_.setAttribute('cursor', 'ns-resize');
      if (!this.randomMode_) {
        this.sliderTexts_[sliderHit].setAttribute('visibility', 'visible');
        this.visibleSliderText_ = sliderHit;
      }
      
    }
  }

  if (sliderHit !== this.visibleSliderText_) {
    if (this.visibleSliderText_ !== null) {
      this.sliderTexts_[this.visibleSliderText_].setAttribute('visibility', 'hidden');
    }
    
    if (!this.randomMode_ && (dy > Blockly.FieldSlider.BUTTON_HEIGHT)) {
      this.visibleSliderText_ = sliderHit;   
      this.sliderTexts_[sliderHit].setAttribute('visibility', 'visible');
    } 
  }

}

Blockly.FieldSlider.prototype.stageMouseOut_ = function() {
  if (this.visibleSliderText_ !== null) {
    this.sliderTexts_[this.visibleSliderText_].setAttribute('visibility', 'hidden');
  }
  this.visibleSliderText_ = null;
}

Blockly.FieldSlider.prototype.buttonMouseOver_ = function() {
  this.addSliderButton_.setAttribute('fill', '#FFFFFF');
}
Blockly.FieldSlider.prototype.buttonMouseOut_ = function() {
  this.addSliderButton_.setAttribute('fill', this.sourceBlock_.getColourTertiary());
}

Blockly.FieldSlider.prototype.randomMouseOver_ = function() {
  this.randomButton_.setAttribute('fill', '#FFFFFF');
}
Blockly.FieldSlider.prototype.randomMouseOut_ = function() {
  if (!this.randomMode_) {
    this.randomButton_.setAttribute('fill', this.sourceBlock_.getColourTertiary());
  }
  
}

Blockly.FieldSlider.prototype.uniformMouseOver_ = function() {
  this.uniformButton_.setAttribute('fill', '#FFFFFF');
}
Blockly.FieldSlider.prototype.uniformMouseOut_ = function() {
  this.uniformButton_.setAttribute('fill', this.sourceBlock_.getColourTertiary());
}

Blockly.FieldSlider.prototype.toggleRandomMode_ = function() {
  if (!this.randomMode_) {
    
    for (var i = 0; i < Blockly.FieldSlider.MAX_SLIDER_NUMBER; i++) {
      if (this.sliderStage_) {
        this.sliderRects_[i].setAttribute('visibility', 'hidden');
        
      }
      if (this.sliderThumbNodes_.length === Blockly.FieldSlider.MAX_SLIDER_NUMBER) {
        this.sliderThumbNodes_[i].setAttribute('visibility', 'hidden');
      }
      
    }
    if (this.sliderStage_) {
      this.randomButton_.setAttribute('fill', '#FFFFFF');
    }
    
    this.randomMode_ = true;
  } else if (this.randomMode_) {
    
    for (var i = 0; i < Blockly.FieldSlider.MAX_SLIDER_NUMBER; i++) {
      if (this.sliderStage_) {
        this.sliderRects_[i].setAttribute('visibility', 'visible');
      }
      
      if (this.sliderThumbNodes_.length === Blockly.FieldSlider.MAX_SLIDER_NUMBER) {
        this.sliderThumbNodes_[i].setAttribute('visibility', 'visible');
      }
    }
    if (this.sliderStage_) {
      this.randomButton_.setAttribute('fill', this.sourceBlock_.getColourTertiary());
    }
    
    this.randomMode_ = false;
  }
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