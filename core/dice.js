/**
 * @fileoverview Utility functions to handle custom dice objects.
 * @author Ersin Arioglu (ersin.arioglu@gmail.com)
 * made this with lots of hard work, blood, sweat, tears and stack overflow.
 */
'use strict';

/**
 * @name Blockly.Dice
 * @namespace
 */
goog.provide('Blockly.Dice');

goog.require('Blockly.Blocks');
goog.require('Blockly.constants');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Field');
goog.require('Blockly.Names');
goog.require('Blockly.Workspace');


Blockly.Dice.createDiceDefCallback_ = function(workspace) {
  Blockly.Dice.externalDiceDefCallback(
      Blockly.Dice.newDiceMutation(),
      Blockly.Dice.createDiceCallbackFactory_(workspace)
  );
};

/**
 * Function to get all dice blocks stored in the environment.
 * @param {!Blockly.Workspace} root Root workspace.
 */
Blockly.Dice.allDice = function(root) {
  var blocks = root.getAllBlocks();
  return blocks;
};
