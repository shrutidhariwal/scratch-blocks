/**
 * @license
 * Visual Blocks Editor
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
 * play-button.svg icon made by Freepik from www.flaticon.com
 * 
 */
/**
 * @fileoverview n-slider input field.
 * Displays n sliders and n+1 markov views.
 * @author Bhuvan Singla (bhuvansingla2000@gmail.com)
 */

'use strict';

goog.provide('Blockly.FieldMarkov');

goog.require('Blockly.DropDownDiv');


/**
 * Class for a markov field.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldMarkov = function(markov) {
  Blockly.FieldMarkov.superClass_.constructor.call(this, markov);
  this.addArgType('markov');
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
   * Current markov string value.
   * @type {String}
   * @private
   */
  this.markovValue_ = '';

  /**
   * Type of dice
   * @type {String}
   * @private
   */
  this.diceType_ = '';

  /**
   * Array of costumes' image data
   * @type {Array}
   * @private
   */
  this.costumeData_ = [];

  /**
   * Array of sounds' audio data
   * @type {Array}
   * @private
   */
  this.soundData_ = [];

  /**
   * Currently selected markov view. Defaults to original distribution view.
   * @type {String}
   * @private
   */
  this.currentView_ = '~';

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

goog.inherits(Blockly.FieldMarkov, Blockly.Field);

/**
 * Construct a FieldMarkov from a JSON arg object.
 * @param {!Object} options A JSON object with options (slider).
 * @returns {!Blockly.FieldMarkov} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldMarkov.fromJson = function(options) {
  return new Blockly.FieldMarkov(options['markov']);
};

/**
 * Fixed size of the slider thumbnail in the input field, in px.
 * @type {number}
 * @const
 */
Blockly.FieldMarkov.THUMBNAIL_SIZE = 26;

/**
 * Fixed width of each slider thumbnail node, in px.
 * @type {number}
 * @const
 */
Blockly.FieldMarkov.THUMBNAIL_NODE_SIZE = 4;

/**
 * Fixed padding for each slider thumbnail node, in px.
 * @type {number}
 * @const
 */
Blockly.FieldMarkov.THUMBNAIL_NODE_PAD = 1;

/**
 * Fixed size of arrow icon in drop down menu, in px.
 * @type {number}
 * @const
 */
Blockly.FieldMarkov.ARROW_SIZE = 12;

/**
 * Fixed width of each slider, in px.
 * @type {number}
 * @const
 */
Blockly.FieldMarkov.SLIDER_NODE_WIDTH = 18;

/**
 * Fixed corner radius for sliders, in px.
 * @type {number}
 * @const
 */
Blockly.FieldMarkov.SLIDER_NODE_RADIUS = 4;

/**
 * Fixed padding for sliders, in px.
 * @type {number}
 * @const
 */
Blockly.FieldMarkov.SLIDER_NODE_PAD = 20;

/**
 * Fixed maximum slider height, in px.
 * @type {number}
 * @const
 */
Blockly.FieldMarkov.MAX_SLIDER_HEIGHT = 135;

/**
 * Fixed height of the div that will contain the sliders.
 * @type {number}
 * @const
 */
Blockly.FieldMarkov.SLIDER_STAGE_HEIGHT = 180 - 17 //145;//140;


/**
 * Maximum number of sliders that can exist.
 * @type {number}
 * @const
 */
Blockly.FieldMarkov.MAX_SLIDER_NUMBER = 30;

/**
 * Width of the buttons in the menu.
 * @type {number}
 * @const
 */
Blockly.FieldMarkov.BUTTON_WIDTH = 24;

/**
 * Height of the buttons in the menu.
 * @type {number}
 * @const
 */
Blockly.FieldMarkov.BUTTON_HEIGHT = 19;

/**
 * Padding between the buttons.
 * @type {number}
 * @const
 */
Blockly.FieldMarkov.BUTTON_PAD = 8;

/**
 * Height of margin under the slider rectangles, for space to contain
 * input boxes and buttons.
 * @type {number}
 * @const
 */
Blockly.FieldMarkov.BOTTOM_MARGIN = 45;

/**
 * Height of the input boxes.
 * @type {number}
 * @const
 */
Blockly.FieldMarkov.INPUT_BOX_HEIGHT = 20;

/**
 * Width of the input boxes.
 * @type {number}
 * @const
 */
Blockly.FieldMarkov.INPUT_BOX_WIDTH = 30;

/**
 * Path to the waste bin icon.
 * @type {string}
 * @const
 */
Blockly.FieldMarkov.WASTEBIN_SVG_PATH = 'icons/waste-bin.svg';

/**
 * Path to the play button icon.
 * @type {string}
 * @const
 */
Blockly.FieldMarkov.PLAY_BUTTON_SVG_PATH = 'icons/play-button.svg';

/**
 * Size of the waste bin icon.
 * @type {number}
 * @const
 */
Blockly.FieldMarkov.WASTEBIN_SIZE = 13;

/**
 * Margin between input boxes and wastebin
 * @type {number}
 * @const
 */
Blockly.FieldMarkov.WASTEBIN_MARGIN = 5;

Blockly.FieldMarkov.VIEWBUTTON_HEIGHT = 25;

Blockly.FieldMarkov.PAD = 5;

/**
 * Called when the field is placed on a block.
 */
Blockly.FieldMarkov.prototype.init = function() {
  if (this.fieldGroup_) {
    // markov menu has already been initialized once.
    return;
  }
  // Create the window on the block that the user can click to show the dropdown menu.
  this.fieldGroup_ = Blockly.utils.createSvgElement('g', {}, null);
  this.size_.width = Blockly.FieldMarkov.THUMBNAIL_SIZE + Blockly.FieldMarkov.ARROW_SIZE + (Blockly.BlockSvg.DROPDOWN_ARROW_PADDING * 1.5);
  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);

  // Create the arrow in the thumbnail.
  var thumbX = Blockly.BlockSvg.DROPDOWN_ARROW_PADDING / 2;
  var thumbY = (this.size_.height - Blockly.FieldMarkov.THUMBNAIL_SIZE) / 2;
  this.thumbnail_ = Blockly.utils.createSvgElement('g', {
    'transform': 'translate(' + thumbX + ', ' + thumbY + ')',
    'pointer-events': 'bounding-box', 'cursor': 'pointer'
  }, this.fieldGroup_);
  this.sliderThumbNodes_ = [];
  var nodeSize = Blockly.FieldMarkov.THUMBNAIL_NODE_SIZE;
  var nodePad = Blockly.FieldMarkov.THUMBNAIL_NODE_PAD;

  var maxHeight = ((nodeSize + nodePad)) * 5;
  var newHeight;

  for (var i = 0; i < Blockly.FieldMarkov.MAX_SLIDER_NUMBER; i++) {
    if (i >= this.sliders_.length) {
      newHeight = 0.0;
    } else {
      newHeight = this.sliders_[i] / 100 * maxHeight;
    }
    var attr = {
      'x': ((nodeSize + nodePad) * i) + nodePad,
      'y': (maxHeight - newHeight),
      'width': nodeSize, 'height': newHeight,
      'rx': nodePad, 'ry': nodePad,
      'fill': '#FFFFFF'
    };
    this.sliderThumbNodes_.push(
        Blockly.utils.createSvgElement('rect', attr, i < 6 ? this.thumbnail_ : null)
    );

    this.thumbnail_.style.cursor = 'default';
  }

  if (!this.arrow_) {
    var arrowX = Blockly.FieldMarkov.THUMBNAIL_SIZE +
      Blockly.BlockSvg.DROPDOWN_ARROW_PADDING * 1.5;
    var arrowY = (this.size_.height - Blockly.FieldMarkov.ARROW_SIZE) / 2;
    this.arrow_ = Blockly.utils.createSvgElement('image', {
      'height': Blockly.FieldMarkov.ARROW_SIZE + 'px',
      'width': Blockly.FieldMarkov.ARROW_SIZE + 'px',
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
 * Set the value for this markov menu. Furthermore, report this new value to the scratch-vm.
 * All changes to the value of this menu go through this function.
 * @param {String} markovValue the new value of the sliders to be 
 * reported to Blockly in string format.
 * @override
 */
Blockly.FieldMarkov.prototype.setValue = function(markovValue) {
  if (!markovValue) {
    return;
  }
  var splitted = markovValue.split('|||');
  var markovStrings = splitted[0].split('||');
  for (var k = 0; k < markovStrings.length; k++) {
    var newArray = markovStrings[k].split('|');
    if (newArray[1] == this.currentView_) {
      var sliders = newArray[0];
    }
  }
  var strings = splitted[1];
  var diceType = splitted[2];

  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.Change(
        this.sourceBlock_, 'field', this.name, this.markovValue_, markovValue));
  }
  // Set the new value of this.sliders_ only after changing the field in the block
  // in order to have atomicity. This is the only place where this.sliders_ is mutated.
  this.markovValue_ = markovValue;
  this.sliders_ = JSON.parse("[" + sliders + "]");
  this.sliderStrings_ = strings.split('~');
  this.diceType_ = diceType;
  switch(this.diceType_) {
    case 'costume':
      this.costumeData_ = splitted[3].split('~');
      break;
    case 'sound':
      this.soundData_ = splitted[3].split('~');
      break;
  }
  this.updateSlider_();
};

/**
 * Get the value from this markov menu.
 * @return {String} Current markov distribution.
 */
Blockly.FieldMarkov.prototype.getValue = function() {
  return this.markovValue_;
};

/**
 * Show the drop-down menu for editing this field.
 * Draw the sliders.
 * @private
 */
Blockly.FieldMarkov.prototype.showEditor_ = function() {
  // If there is an existing drop-down someone else owns, hide it immediately and clear it.
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();

  var div = Blockly.DropDownDiv.getContentDiv();

  var numSliders = this.sliders_.length;
  var sliderSize = (Blockly.FieldMarkov.SLIDER_NODE_WIDTH + Blockly.FieldMarkov.SLIDER_NODE_PAD) * numSliders;

  Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': '18px',
    'width': '15px'
  }, div);

  //Div for markov distribution buttons.
  var markovDiv = document.createElement('div');
  markovDiv.style.display = 'inline-block';
  markovDiv.style.overflow = 'auto';
  markovDiv.style.maxHeight = '180px';
  markovDiv.style.marginBottom = '20px';
  markovDiv.id = 'chanceExtension';
  div.appendChild(markovDiv);

  var height = ((Blockly.FieldMarkov.INPUT_BOX_HEIGHT + Blockly.FieldMarkov.PAD) * (numSliders + 1));
  if(this.diceType_ === 'costume' || this.diceType_ === 'sound'){
    height += Blockly.FieldMarkov.INPUT_BOX_WIDTH;
  }
  var markovViews = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': height + 'px',
    'width': Blockly.FieldMarkov.INPUT_BOX_WIDTH + (Blockly.FieldMarkov.PAD * 2)
  }, markovDiv);

  //Add markov view buttons
  for (var i = -1; i < this.sliderStrings_.length; i++) {
    var color = (i == this.sliderStrings_.indexOf(this.currentView_)) ? '#ffffff': this.sourceBlock_.getColourTertiary();
    var markovViewBoxContainer = Blockly.utils.createSvgElement('rect', {
      'height': Blockly.FieldMarkov.INPUT_BOX_HEIGHT + 2,
      'width': Blockly.FieldMarkov.INPUT_BOX_WIDTH,
      'rx': Blockly.FieldMarkov.SLIDER_NODE_RADIUS,
      'ry': Blockly.FieldMarkov.SLIDER_NODE_RADIUS,
      'fill': color,
      'id': i,
      'x': 0,
      'y': (i + 1) * (Blockly.FieldMarkov.INPUT_BOX_HEIGHT + Blockly.FieldMarkov.PAD),
    }, markovViews);
    
    var addButtonText = Blockly.utils.createSvgElement('foreignObject', {
      'height': Blockly.FieldMarkov.INPUT_BOX_HEIGHT + 2,
      'width': Blockly.FieldMarkov.INPUT_BOX_WIDTH - 4,
      // 'x': Blockly.FieldMarkov.INPUT_BOX_HEIGHT / 2 + 0.5,
      'x': 2,
      'y': (i + 1) * (Blockly.FieldMarkov.INPUT_BOX_HEIGHT + Blockly.FieldMarkov.PAD),
      'fill': '#91dfbf',
      'id': i
    }, markovViews);
    
    var text = document.createElement('p');
    text.id = i;
    text.style.fontSize = '12px';
    text.style.color = '#91dfbf';
    text.style.margin = 0;
    text.style.textAlign = 'center';
    text.style.wordBreak = 'break-all';
    text.title = (i == -1) ? '~' : this.sliderStrings_[i];
    text.innerHTML = (i == -1) ? '~' : this.sliderStrings_[i];
    text.addEventListener('click', this.changeViewListener_.bind(this), false);
    addButtonText.appendChild(text);
    markovViewBoxContainer.addEventListener('click', this.changeViewListener_.bind(this), false);
  }
  
  //Blockly.FieldMarkov.SLIDER_STAGE_HEIGHT = (Blockly.FieldMarkov.INPUT_BOX_HEIGHT + Blockly.FieldMarkov.PAD) * (numSliders + 1) + Blockly.FieldMarkov.BUTTON_HEIGHT + (Blockly.FieldMarkov.WASTEBIN_MARGIN / 2); 
  var mainDiv = document.createElement('div');
  mainDiv.style.display = 'inline-block';
  div.appendChild(mainDiv);
  var buttonsDiv = document.createElement('div');
  buttonsDiv.style.height = Blockly.FieldMarkov.BUTTON_HEIGHT + 'px';
  buttonsDiv.style.marginLeft = '6px';
  buttonsDiv.style.maxWidth = '230px';
  buttonsDiv.style.overflow = 'hidden';
  mainDiv.appendChild(buttonsDiv);
  var buttonDiv = Blockly.utils.createSvgElement('svg', {
    'x': '0px',
    'y': '0px',
    'width': '70px'
  }, buttonsDiv);
  this.createUniformRandomButtons(buttonDiv);
  var sliderStageDiv = document.createElement('div');
  sliderStageDiv.style.display = 'inline-block';
  sliderStageDiv.style.overflow = 'auto';
  sliderStageDiv.style.maxWidth = '230px';
  sliderStageDiv.style.marginLeft = '6px';
  sliderStageDiv.id = 'chanceExtension';
  mainDiv.appendChild(sliderStageDiv);
  
  // var height = ((Blockly.FieldMarkov.INPUT_BOX_HEIGHT + Blockly.FieldMarkov.PAD) * (numSliders + 1) + Blockly.FieldMarkov.BOTTOM_MARGIN + Blockly.FieldMarkov.BUTTON_HEIGHT);
  // if (this.diceType_ === 'costume' || this.diceType_ === 'sound'){
  //   height += Blockly.FieldMarkov.INPUT_BOX_WIDTH;
  // }
  if (this.diceType_ === 'costume' || this.diceType_ === 'sound') {
    height = Blockly.FieldMarkov.SLIDER_STAGE_HEIGHT + Blockly.FieldMarkov.BOTTOM_MARGIN - 15 + Blockly.FieldMarkov.INPUT_BOX_WIDTH + Blockly.FieldMarkov.WASTEBIN_MARGIN;
  } else {
    height = Blockly.FieldMarkov.SLIDER_STAGE_HEIGHT + Blockly.FieldMarkov.BOTTOM_MARGIN - 15;
  }
  this.sliderStage_ = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': height,
    'width': sliderSize + 'px',
    'cursor': 'ns-resize'
  }, sliderStageDiv);
  
  this.sliderStage_.addEventListener('mousemove', this.stageHoverMoveListener_.bind(this), false);
  this.sliderStage_.addEventListener('mouseleave', this.stageMouseOut_.bind(this), false);

  this.sliderRects_ = [];
  this.textboxes_ = [];
  this.sliderTexts_ = [];

  // Div that will contain the uniform distribution and random distribution buttons.
  // var buttonDiv = Blockly.utils.createSvgElement('svg', {
  //   'x': '0px',
  //   'y': '0px'
  // }, this.sliderStage_);
  // this.createUniformRandomButtons(buttonDiv);

  this.whiteBackground_ = Blockly.utils.createSvgElement('rect', {
    //'x': '0px', 'y': Blockly.FieldMarkov.BUTTON_HEIGHT + (Blockly.FieldMarkov.WASTEBIN_MARGIN / 2) + 'px',
    'x': '0px', 'y': (Blockly.FieldMarkov.WASTEBIN_MARGIN / 2) + 'px',
    'width': sliderSize + 'px',
    //'height': (Blockly.FieldMarkov.SLIDER_STAGE_HEIGHT - Blockly.FieldMarkov.BUTTON_HEIGHT) + 'px',
    'height': Blockly.FieldMarkov.SLIDER_STAGE_HEIGHT + 'px',
    'rx': Blockly.FieldMarkov.SLIDER_NODE_RADIUS,
    'ry': Blockly.FieldMarkov.SLIDER_NODE_RADIUS,
    'fill': '#FFFFFF'
  }, this.sliderStage_);

  // Add the slider rectangles.
  for (var i = 0; i < Blockly.FieldMarkov.MAX_SLIDER_NUMBER; i++) {
    var x = (Blockly.FieldMarkov.SLIDER_NODE_WIDTH * i) +
      (Blockly.FieldMarkov.SLIDER_NODE_PAD * (i + 0.5));

    
      if(this.diceType_ === 'costume'){
        Blockly.utils.createSvgElement('rect', {
          'x': x + (Blockly.FieldMarkov.SLIDER_NODE_WIDTH - Blockly.FieldMarkov.INPUT_BOX_WIDTH) / 2, 
          'y': Blockly.FieldMarkov.SLIDER_STAGE_HEIGHT + Blockly.FieldMarkov.WASTEBIN_MARGIN * 1,
          'width': Blockly.FieldMarkov.INPUT_BOX_WIDTH + 'px', 
          'height': Blockly.FieldMarkov.INPUT_BOX_WIDTH + 'px',
          'rx': Blockly.FieldMarkov.SLIDER_NODE_RADIUS,
          'ry': Blockly.FieldMarkov.SLIDER_NODE_RADIUS,
          'fill': '#FFFFFF'
        }, this.sliderStage_);
        var img = Blockly.utils.createSvgElement('image',
          {
            'width': Blockly.FieldMarkov.INPUT_BOX_WIDTH - 6,
            'height': Blockly.FieldMarkov.INPUT_BOX_WIDTH -6,
            'x': x + (Blockly.FieldMarkov.SLIDER_NODE_WIDTH - Blockly.FieldMarkov.INPUT_BOX_WIDTH) / 2 + 3,
            'y': Blockly.FieldMarkov.SLIDER_STAGE_HEIGHT + Blockly.FieldMarkov.WASTEBIN_MARGIN * 1 + 3
          }, this.sliderStage_);
        img.setAttributeNS(
          'http://www.w3.org/1999/xlink',
          'xlink:href',
          "data:image/svg+xml;base64," + this.costumeData_[i]
        );
      }
  
      if (this.diceType_ === 'sound') {
        var playButton = Blockly.utils.createSvgElement('image',
          {
            'width': Blockly.FieldMarkov.INPUT_BOX_WIDTH - 2,
            'height': Blockly.FieldMarkov.INPUT_BOX_WIDTH - 2,
            'x': x + (Blockly.FieldMarkov.SLIDER_NODE_WIDTH - Blockly.FieldMarkov.INPUT_BOX_WIDTH) / 2 + 1,
            'y': Blockly.FieldMarkov.SLIDER_STAGE_HEIGHT + Blockly.FieldMarkov.INPUT_BOX_HEIGHT + Blockly.FieldMarkov.WASTEBIN_MARGIN * 2 + 1,
            'id': i
          }, this.sliderStage_);
        playButton.setAttributeNS(
          'http://www.w3.org/1999/xlink',
          'xlink:href',
          Blockly.mainWorkspace.options.pathToMedia + Blockly.FieldMarkov.PLAY_BUTTON_SVG_PATH
        );
        playButton.addEventListener('click', this.playButtonListener_.bind(this), false);
      }

      if(this.diceType_ === 'costume'){
        //var text_y = (Blockly.FieldMarkov.INPUT_BOX_HEIGHT + Blockly.FieldMarkov.PAD) * (numSliders + 1) + Blockly.FieldMarkov.WASTEBIN_MARGIN + Blockly.FieldMarkov.INPUT_BOX_HEIGHT + Blockly.FieldMarkov.INPUT_BOX_WIDTH + Blockly.FieldMarkov.WASTEBIN_MARGIN + 'px';
        var text_y = Blockly.FieldMarkov.SLIDER_STAGE_HEIGHT + Blockly.FieldMarkov.WASTEBIN_MARGIN + Blockly.FieldMarkov.INPUT_BOX_WIDTH + Blockly.FieldMarkov.WASTEBIN_MARGIN + 'px';
      }
      else{
        var text_y = Blockly.FieldMarkov.SLIDER_STAGE_HEIGHT + Blockly.FieldMarkov.WASTEBIN_MARGIN;
        //var text_y = (Blockly.FieldMarkov.INPUT_BOX_HEIGHT + Blockly.FieldMarkov.PAD) * (numSliders + 1) + Blockly.FieldMarkov.WASTEBIN_MARGIN + Blockly.FieldMarkov.INPUT_BOX_HEIGHT
      }
    // Add the svg containers for the textboxes.
    var textBoxContainer = Blockly.utils.createSvgElement('foreignObject', {
      'height': Blockly.FieldMarkov.INPUT_BOX_HEIGHT + 2,
      'width': Blockly.FieldMarkov.INPUT_BOX_WIDTH,
      'x': x - ((Blockly.FieldMarkov.INPUT_BOX_WIDTH - Blockly.FieldMarkov.SLIDER_NODE_WIDTH) / 2),
      'y': text_y
    }, this.sliderStage_);

    // Put the textboxes into the containers.
    var textbox = document.createElement('input');
    textbox.style.width = Blockly.FieldMarkov.INPUT_BOX_WIDTH + 'px';
    textbox.style.height = Blockly.FieldMarkov.INPUT_BOX_HEIGHT + 'px';
    textbox.style.border = 'none';
    textbox.style.outline = 'none';
    textbox.style.color = '#91dfbf';
    textbox.style.backgroundColor = this.sourceBlock_.getColourTertiary();
    textbox.readOnly = true;

    if (i >= this.sliderStrings_.length) {
      textbox.defaultValue = '';
    } else {
      textbox.setAttribute("title", this.sliderStrings_[i]);
      textbox.defaultValue = this.sliderStrings_[i];
    }
    textbox.style.borderRadius = '5px';
    textbox.style.textAlign = 'center';
    textBoxContainer.appendChild(textbox);
    this.textboxes_.push(textbox);

    // Add the slider rectangles.
    // var y = 45;
    var y = sliderSize - Blockly.FieldMarkov.SLIDER_NODE_WIDTH;
    var attr = {
      'x': x + 'px', 'y': y + 'px',
      'width': Blockly.FieldMarkov.SLIDER_NODE_WIDTH,
      //'height': Blockly.FieldMarkov.MAX_SLIDER_HEIGHT,
      // 'height': (Blockly.FieldMarkov.INPUT_BOX_HEIGHT + Blockly.FieldMarkov.PAD) * (numSliders + 1) - 28,
      'height': Blockly.FieldMarkov.MAX_SLIDER_HEIGHT,
      'rx': Blockly.FieldMarkov.SLIDER_NODE_RADIUS,
      'ry': Blockly.FieldMarkov.SLIDER_NODE_RADIUS,
      'fill': '#65CEFF'
    };
    var newSliderRect = Blockly.utils.createSvgElement('rect', attr, this.sliderStage_);
    this.sliderStage_.appendChild(newSliderRect);
    this.sliderRects_.push(newSliderRect);

    // Create the text elements that will show up on top of the sliders and will display the current value when user clicks on the slider.
    attr = {
      'x': x + 'px', 'y': y + 'px',
      'rx': Blockly.FieldMarkov.SLIDER_NODE_RADIUS,
      'ry': Blockly.FieldMarkov.SLIDER_NODE_RADIUS,
      'visibility': 'hidden',
      'fill': '#000000',
      'font-size': '12'
    };
    var newSliderText = Blockly.utils.createSvgElement('text', attr, this.sliderStage_);
    this.sliderTexts_.push(newSliderText);
  }

  Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': Blockly.FieldMarkov.BOTTOM_MARGIN - Blockly.FieldMarkov.WASTEBIN_MARGIN - 1 + 'px',
    'width': (Blockly.FieldMarkov.INPUT_BOX_HEIGHT + Blockly.FieldMarkov.WASTEBIN_MARGIN) + 'px'
  }, div);

  Blockly.DropDownDiv.setColour(this.sourceBlock_.getColour(),
      this.sourceBlock_.getColourTertiary());
  Blockly.DropDownDiv.setCategory(this.sourceBlock_.getCategory());
  Blockly.DropDownDiv.showPositionedByBlock(this, this.sourceBlock_);

  this.sliderTouchWrapper_ =
    Blockly.bindEvent_(this.sliderStage_, 'mousedown', this, this.onMouseDown);

  // Update the slider for the current value
  this.updateSlider_();

};

/**
 * Create the "return to uniform" and "random distribution" buttons.
 */
Blockly.FieldMarkov.prototype.createUniformRandomButtons = function(button) {
  var paddingOfPattern = 2;
  var nodeWidth = (Blockly.FieldMarkov.BUTTON_WIDTH - paddingOfPattern * 2) / 4;
  var nodePad = (Blockly.FieldMarkov.BUTTON_WIDTH - paddingOfPattern * 2) / 16;
  var nodeHeight = (Blockly.FieldMarkov.BUTTON_HEIGHT - paddingOfPattern * 2) * 5 / 6;
  var fill = '#91dfbf';

  this.uniformButton_ = Blockly.utils.createSvgElement('rect', {
    'x': 0,
    'y': 0,
    'width': Blockly.FieldMarkov.BUTTON_WIDTH,
    'height': Blockly.FieldMarkov.BUTTON_HEIGHT,
    'fill': this.sourceBlock_.getColourTertiary(),
    'rx': nodePad,
    'ry': nodePad
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
    'width': Blockly.FieldMarkov.BUTTON_WIDTH - paddingOfPattern * 2,
    'height': 1,
    'fill': fill
  }, button);
  node.addEventListener('mouseover', this.uniformMouseOver_.bind(this), false);
  node.addEventListener('mouseout', this.uniformMouseOut_.bind(this), false);

  var leftMost = Blockly.FieldMarkov.BUTTON_WIDTH + Blockly.FieldMarkov.BUTTON_PAD;
  
  // Create the random distribution button.
  var sliderHeights = [30, 80, 60];

  this.randomButton_ = Blockly.utils.createSvgElement('rect', {
    'x': leftMost,
    'y': 0,
    'width': Blockly.FieldMarkov.BUTTON_WIDTH,
    'height': Blockly.FieldMarkov.BUTTON_HEIGHT,
    'fill': this.sourceBlock_.getColourTertiary(),
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
    'width': Blockly.FieldMarkov.BUTTON_WIDTH - paddingOfPattern * 2,
    'height': 1,
    'fill': fill
  }, button);
  node.addEventListener('mouseover', this.randomMouseOver_.bind(this), false);
  node.addEventListener('mouseout', this.randomMouseOut_.bind(this), false);
};

/**
 * Redraw the slider with the current value.
 * @private
 */
Blockly.FieldMarkov.prototype.updateSlider_ = function() {
  var nodeSize = Blockly.FieldMarkov.SLIDER_NODE_WIDTH;
  var nodePad = Blockly.FieldMarkov.SLIDER_NODE_PAD;

  var numSliders = this.sliders_.length;
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
 */
Blockly.FieldMarkov.prototype.fillSliderNode_ = function(height, index) {
  var pad = Blockly.FieldMarkov.SLIDER_NODE_PAD;
  var width = Blockly.FieldMarkov.SLIDER_NODE_WIDTH;
  var x = width * index + pad * (index + 0.5);

  var numSliders = this.sliders_.length;

  var maxHeight = (Blockly.FieldMarkov.THUMBNAIL_NODE_SIZE + Blockly.FieldMarkov.THUMBNAIL_NODE_PAD) * 5;
  var newHeight = height / 100.0 * maxHeight;

  if (this.sliderStage_) {
    this.sliderThumbNodes_[index].setAttribute('y', (maxHeight - newHeight));
    this.sliderThumbNodes_[index].setAttribute('height', newHeight);

    // maxHeight = (Blockly.FieldMarkov.INPUT_BOX_HEIGHT + Blockly.FieldMarkov.PAD) * (numSliders + 1) - 28;
    // newHeight = height / 100.0 * maxHeight;

    maxHeight = Blockly.FieldMarkov.MAX_SLIDER_HEIGHT;
    newHeight = height / 100.0 * maxHeight;

    this.sliderTexts_[index].setAttribute('y', (Blockly.FieldMarkov.SLIDER_STAGE_HEIGHT - newHeight - 10));
    this.sliderTexts_[index].innerHTML = Math.round(height) + '%';
    var textWidth = this.sliderTexts_[index].getBoundingClientRect().width;
    this.sliderTexts_[index].setAttribute('x', x - (textWidth - Blockly.FieldMarkov.SLIDER_NODE_WIDTH) / 2);

    this.textboxes_[index].value = this.sliderStrings_[index];

    this.sliderRects_[index].setAttribute('y', (Blockly.FieldMarkov.SLIDER_STAGE_HEIGHT - newHeight));
    this.sliderRects_[index].setAttribute('height', newHeight)

    // this.sliderTexts_[index].setAttribute('y', ((Blockly.FieldMarkov.INPUT_BOX_HEIGHT + Blockly.FieldMarkov.PAD) * (numSliders + 1) - newHeight - 10 + 17));
    // this.sliderTexts_[index].innerHTML = Math.round(height) + '%';
    // var textWidth = this.sliderTexts_[index].getBoundingClientRect().width;
    // this.sliderTexts_[index].setAttribute('x', x - (textWidth - Blockly.FieldMarkov.SLIDER_NODE_WIDTH) / 2);

    // this.textboxes_[index].value = this.sliderStrings_[index];

    // this.sliderRects_[index].setAttribute('y', ((Blockly.FieldMarkov.INPUT_BOX_HEIGHT + Blockly.FieldMarkov.PAD) * (numSliders + 1) - newHeight + 17));
    // this.sliderRects_[index].setAttribute('height', newHeight);

  }
};

Blockly.FieldMarkov.prototype.setSliderNode_ = function(sliderIndex, newHeight) {

  var numSliders = this.sliders_.length;
  if (sliderIndex === numSliders) {
    this.sliders_.push(0.0);
  }
  var slidersCopy = this.sliders_.slice(0);

  if (sliderIndex < 0 || sliderIndex > numSliders) return;
  if (newHeight < 0) {
    newHeight = 0;
  } else if (newHeight > 100) {
    newHeight = 100;
  }
  var heightDiff = this.sliders_[sliderIndex] - newHeight;
  var sumOfRest = 0;
  for (var i = 0; i < numSliders; i++) {
    if (i != sliderIndex) {
      sumOfRest += this.sliders_[i];
    }
  }
  for (var i = 0; i < numSliders; i++) {
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

  var newDist = '';
  var markovStrings = this.markovValue_.split('|||')[0].split('||');
  for (var k = 0; k < markovStrings.length; k++) {
    var newArray = markovStrings[k].split('|');
    if (newArray[1] == this.currentView_) {
      var sliders = slidersCopy.toString();
      newDist += sliders + '|' + newArray[1];
    }
    else {
      newDist += markovStrings[k];
    }
    if (k != markovStrings.length - 1) {
      newDist += '||';
    }
  }
  var newValue = [newDist, this.sliderStrings_.join('~'), this.diceType_];
  switch(this.diceType_){
    case 'costume':
      newValue.push(this.costumeData_.join('~'));
      break;
    case 'sound':
      newValue.push(this.soundData_.join('~'));
      break;
  }
  this.setValue(newValue.join('|||'));
};

/**
 * Takes in a mouse event and gives the new height to setSliderNode as a number between 0 and 100.
 * @param {!Event} e Mouse event.
 */
Blockly.FieldMarkov.prototype.onMouseDown = function(e) {
  var numSliders = this.sliders_.length;
  //Blockly.FieldMarkov.MAX_SLIDER_HEIGHT = (Blockly.FieldMarkov.INPUT_BOX_HEIGHT + Blockly.FieldMarkov.PAD) * (numSliders + 1) - 28;
  var bBox = this.sliderStage_.getBoundingClientRect();
  var dy = e.clientY - bBox.top - (Blockly.FieldMarkov.SLIDER_STAGE_HEIGHT - Blockly.FieldMarkov.MAX_SLIDER_HEIGHT);
  this.sliderMoveWrapper_ =
    Blockly.bindEvent_(document.body, 'mousemove', this, this.onMouseMove);
  this.sliderReleaseWrapper_ =
    Blockly.bindEvent_(document.body, 'mouseup', this, this.onMouseUp);

  var sliderHit = parseInt(this.checkForSlider_(e));
  this.currentSlider_ = sliderHit;
  var newHeight = 100 * (Blockly.FieldMarkov.MAX_SLIDER_HEIGHT - dy) / Blockly.FieldMarkov.MAX_SLIDER_HEIGHT;

  if (newHeight < -5) {
    return;
  }

  if (newHeight > 110) {
    // Checks if the random distribution or uniform distribution buttons were hit.
    this.checkForButton_(e);
    return;
  }
  if (sliderHit > -1 && sliderHit < numSliders) {
    this.setSliderNode_(sliderHit, newHeight);
    this.sliderRects_[sliderHit].style.fill = '#4FA5CF';
  } else {
    this.paintStyle_ = null;
  }
};


/**
 * Unbind mouse move event and clear the paint style.
 * @param {!Event} e Mouse move event.
 */
Blockly.FieldMarkov.prototype.onMouseUp = function() {
  Blockly.unbindEvent_(this.sliderMoveWrapper_);
  Blockly.unbindEvent_(this.sliderReleaseWrapper_);
  for (var i = 0; i < this.sliders_.length; i++) {
    this.sliderRects_[i].style.fill = '#65CEFF';
  }
  this.paintStyle_ = null;
  this.currentSlider_ = null;
};

/**
 * Toggle slider nodes on and off by dragging mouse.
 * @param {!Event} e Mouse move event.
 */
Blockly.FieldMarkov.prototype.onMouseMove = function(e) {
 // Blockly.FieldMarkov.MAX_SLIDER_HEIGHT = (Blockly.FieldMarkov.SLIDER_STAGE_HEIGHT - Blockly.FieldMarkov.BUTTON_HEIGHT);
  e.preventDefault();
  var bBox = this.sliderStage_.getBoundingClientRect();
  var dy = e.clientY - bBox.top - (Blockly.FieldMarkov.SLIDER_STAGE_HEIGHT - Blockly.FieldMarkov.MAX_SLIDER_HEIGHT);
  var sliderHit = this.currentSlider_;
  var newHeight = 100 * (Blockly.FieldMarkov.MAX_SLIDER_HEIGHT - dy) / Blockly.FieldMarkov.MAX_SLIDER_HEIGHT;
  if (newHeight < -5 || newHeight > 110) { return; }
  this.setSliderNode_(sliderHit, newHeight);
};

Blockly.FieldMarkov.prototype.changeViewListener_ = function(e) {
  document.getElementById(this.sliderStrings_.indexOf(this.currentView_)).setAttribute('fill', this.sourceBlock_.getColourTertiary());
  var id = e.target.id;
  this.currentView_ = (id > -1) ? this.sliderStrings_[id] : '~';
  document.getElementById(this.sliderStrings_.indexOf(this.currentView_)).setAttribute('fill', '#FFFFFF');
  this.setValue(this.markovValue_);
};

Blockly.FieldMarkov.prototype.playButtonListener_ = function(e) {
  var id = e.target.id;
  var sound = new Audio("data:audio/wav;base64," + this.soundData_[id]);
  sound.play();
}

/**
 * Check if mouse coordinates collide with a slider node.
 * @param {!Event} e Mouse move event.
 * @return {number} The matching slider node or -1 for none.
 */
Blockly.FieldMarkov.prototype.checkForSlider_ = function(e) {
  var bBox = this.sliderStage_.getBoundingClientRect();
  var nodeSize = Blockly.FieldMarkov.SLIDER_NODE_WIDTH;
  var nodePad = Blockly.FieldMarkov.SLIDER_NODE_PAD;
  var dx = e.clientX - bBox.left;
  var xDiv = Math.trunc((dx) / (nodeSize + nodePad));
  if (xDiv >= this.sliders_.length) { xDiv = this.sliders_.length - 1; }
  if (xDiv < 0) { xDiv = 0; }
  return xDiv;
};

Blockly.FieldMarkov.prototype.checkForButton_ = function(e) {
  var bBox = this.sliderStage_.getBoundingClientRect();
  var dx = e.clientX - bBox.left;
  var dy = e.clientY - bBox.top;
  var width = Blockly.FieldMarkov.BUTTON_WIDTH;
  var height = Blockly.FieldMarkov.BUTTON_HEIGHT;
  var pad = Blockly.FieldMarkov.BUTTON_PAD;
  if (dy <= height) {
    if (dx <= width) {
      this.setToUniform_();
    } else if (dx >= (width + pad) && dx <= (2 * width + pad)) {
      this.setToRandom_();
    }
  }
};

Blockly.FieldMarkov.prototype.setToUniform_ = function() {
  var currentValue = this.sliders_.length;
  var arrayValue = 100.0 / currentValue;
  var newArray = [];
  var newStrings = [];
  for (var i = 0; i < currentValue; i++) {
    newArray.push(arrayValue);
    newStrings.push(this.sliderStrings_[i]);
  }

  var newDist = '';
  var markovStrings = this.markovValue_.split('|||')[0].split('||');
  for (var k = 0; k < markovStrings.length; k++) {
    var newA = markovStrings[k].split('|');
    if (newA[1] == this.currentView_) {
      newDist += newArray.toString() + '|' + newA[1];
    }
    else {
      newDist += markovStrings[k];
    }
    if (k != markovStrings.length - 1) {
      newDist += '||';
    }
  }

  var newValue = [newDist, this.sliderStrings_.join('~'), this.diceType_];
  switch(this.diceType_){
    case 'costume':
      newValue.push(this.costumeData_.join('~'));
      break;
    case 'sound':
      newValue.push(this.soundData_.join('~'));
      break;
  }
  this.setValue(newValue.join('|||'));
};

Blockly.FieldMarkov.prototype.setToRandom_ = function() {
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
  var newDist = '';
  var markovStrings = this.markovValue_.split('|||')[0].split('||');
  for (var k = 0; k < markovStrings.length; k++) {
    var newA = markovStrings[k].split('|');
    if (newA[1] == this.currentView_) {
      newDist += newArray.toString() + '|' + newA[1];
    }
    else {
      newDist += markovStrings[k];
    }
    if (k != markovStrings.length - 1) {
      newDist += '||';
    }
  }

  var newValue = [newDist, this.sliderStrings_.join('~'), this.diceType_];
  switch(this.diceType_){
    case 'costume':
      newValue.push(this.costumeData_.join('~'));
      break;
    case 'sound':
      newValue.push(this.soundData_.join('~'));
      break;
  }
  this.setValue(newValue.join('|||'));
};



Blockly.FieldMarkov.prototype.stageHoverMoveListener_ = function(e) {
  var numSliders = this.sliders_.length;
  var sliderHit = this.checkForSlider_(e);
  var bBox = this.sliderStage_.getBoundingClientRect();
  var dy = e.clientY - bBox.top;
  var currentCursor = this.sliderStage_.getAttribute('cursor');
  var bottom = (Blockly.FieldMarkov.INPUT_BOX_HEIGHT + Blockly.FieldMarkov.PAD) *
            (numSliders + 1) + Blockly.FieldMarkov.BUTTON_HEIGHT + (Blockly.FieldMarkov.WASTEBIN_MARGIN / 2);

  // Change the cursor type depending on where the cursor is on the stage.
  if (currentCursor === 'ns-resize') {
    if (dy <= Blockly.FieldMarkov.BUTTON_HEIGHT || dy >= bottom) {
      this.sliderStage_.setAttribute('cursor', 'default');
    }
  } else if (currentCursor === 'default') {
    if (dy > Blockly.FieldMarkov.BUTTON_HEIGHT && dy < bottom) {
      this.sliderStage_.setAttribute('cursor', 'ns-resize');
    }
  }

  // If the slider the mouse is currently hovering over has changed, then change the slider that is currently visible.
  if (sliderHit !== this.visibleSliderText_) {
    if (this.visibleSliderText_ !== null) {
      this.sliderTexts_[this.visibleSliderText_].setAttribute('visibility', 'hidden');
    }
    this.visibleSliderText_ = sliderHit;
    this.sliderTexts_[sliderHit].setAttribute('visibility', 'visible');
  }

  // If the mouse is up in the button region, then hide the currently visible slider if there is any.
  if (dy < Blockly.FieldMarkov.BUTTON_HEIGHT) {
    if (this.visibleSliderText_ !== null) {
      this.sliderTexts_[this.visibleSliderText_].setAttribute('visibility', 'hidden');
    }
    this.visibleSliderText_ = null;
  }

};

Blockly.FieldMarkov.prototype.stageMouseOut_ = function() {
  if (this.visibleSliderText_ !== null) {
    this.sliderTexts_[this.visibleSliderText_].setAttribute('visibility', 'hidden');
  }
  this.visibleSliderText_ = null;
};

Blockly.FieldMarkov.prototype.buttonMouseOver_ = function() {
  this.addSliderButton_.setAttribute('fill', '#FFFFFF');
};
Blockly.FieldMarkov.prototype.buttonMouseOut_ = function() {
  this.addSliderButton_.setAttribute('fill', this.sourceBlock_.getColourTertiary());
};

Blockly.FieldMarkov.prototype.randomMouseOver_ = function() {
  this.randomButton_.setAttribute('fill', '#FFFFFF');
};
Blockly.FieldMarkov.prototype.randomMouseOut_ = function() {
  this.randomButton_.setAttribute('fill', this.sourceBlock_.getColourTertiary());
};

Blockly.FieldMarkov.prototype.uniformMouseOver_ = function() {
  this.uniformButton_.setAttribute('fill', '#FFFFFF');
};
Blockly.FieldMarkov.prototype.uniformMouseOut_ = function() {
  this.uniformButton_.setAttribute('fill', this.sourceBlock_.getColourTertiary());
};


/**
 * Clean up this FieldMarkov, as well as the inherited Field.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldMarkov.prototype.dispose_ = function() {
  var thisField = this;
  return function() {
    Blockly.FieldMarkov.superClass_.dispose_.call(thisField)();
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

Blockly.Field.register('field_markov', Blockly.FieldMarkov);
