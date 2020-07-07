'use strict';

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function toArray(x) {
  if (Array.isArray(x)) {
    return x;
  }

  return x ? [x] : [];
}

function getBlocks(cardCollection, types) {
  types = toArray(types);
  cardCollection = toArray(cardCollection);
  return cardCollection.filter(function (card) {
    return types.some(function (type) {
      return isCardType(card, type);
    });
  });
}

function isCardType(card, type) {
  if (!card) {
    return false;
  }

  var cardType = (card.type || '').toLowerCase();
  type = (type || '').toLowerCase();
  return cardType === type;
}

var cardTypes = Object.freeze({
  textBlock: "TextBlock",
  container: "Container",
  image: "Image",
  adaptiveCard: "AdaptiveCard",
  column: "Column",
  columnSet: "ColumnSet",
  richTextBlock: "RichTextBlock",
  textRun: "TextRun"
});
function isTextBlock(card) {
  return isCardType(card, cardTypes.textBlock);
}
function isContainer(card) {
  return isCardType(card, cardTypes.container);
}
function isImage(card) {
  return isCardType(card, cardTypes.image);
}
function isColumn(card) {
  return isCardType(card, cardTypes.column);
}
function isColumnSet(card) {
  return isCardType(card, cardTypes.columnSet);
}
function isRichTextBlock(card) {
  return isCardType(card, cardTypes.richTextBlock);
}
function isTextRun(card) {
  return isCardType(card, cardTypes.textRun);
}
function isCardElement(card) {
  return isTextBlock(card) || isImage(card) || isContainer(card) || isColumn(card) || isColumnSet(card) || isRichTextBlock(card) || isTextRun(card);
}
function getTextBlocks(cardCollection) {
  return getBlocks(cardCollection, cardTypes.textBlock);
}
function getNonTextBlocks(cardCollection) {
  return getBlocks(cardCollection, [cardTypes.image, cardTypes.container]);
}
function getTextBlocksAsString(cardCollection) {
  return getTextBlocks(cardCollection).map(function (textBlock) {
    return textBlock.text;
  }).join(' ').replace(/ +/g, ' ').trim();
} // container has the only two required properties (type, items)
// https://adaptivecards.io/explorer/Container.html

function isContainerWithRequiredProperties(element) {
  return isContainer(element) && Object.keys(element).length === 2 && Array.isArray(element.items);
}

function setOptions(obj, options) {
  Object.keys(options || {}).forEach(function (optionKey) {
    obj[optionKey] = options[optionKey];
  });
}

function createCard(elements) {
  var card = {
    type: cardTypes.adaptiveCard,
    body: [],
    actions: [],
    version: '1.2'
  };
  var body = toArray(elements); // remove extra container wrapping for a single element that only has required properties (type, items)
  // otherwise leave the container wrap since there could be additional styling
  // https://adaptivecards.io/explorer/Container.html

  if (Array.isArray(elements) && elements.length === 1) {
    var singleElement = elements[0];

    if (isContainerWithRequiredProperties(singleElement)) {
      body = unwrap(singleElement);
    }
  }

  card.body = body;
  return card;
}
function createTextBlock(text, options) {
  var textBlock = {
    type: cardTypes.textBlock,
    text: text || '',
    wrap: true
  };
  setOptions(textBlock, options);
  return textBlock;
}
function createHeadingTextBlock(text, depth) {
  var weight = 'bolder';
  var size = 'default';

  switch (depth) {
    case 1:
      size = 'extraLarge';
      break;

    case 2:
      size = 'large';
      break;

    case 3:
      size = 'medium';
      break;

    case 4:
      size = 'medium';
      weight = 'default';
      break;

    case 5:
      size = 'default';
      break;

    case 6:
      size = 'small';
      break;
  }

  return createTextBlock(text, {
    size: size,
    weight: weight
  });
}
function createImage(url, options) {
  var image = {
    type: cardTypes.image,
    url: url
  };
  setOptions(image, options);
  return image;
}
function createColumn(content, options) {
  var column = {
    type: cardTypes.column,
    items: content
  };
  setOptions(column, options);
  return column;
}
function createColumnSet(columns, options) {
  var columnSet = {
    type: cardTypes.columnSet,
    columns: columns
  };
  setOptions(columnSet, options);
  return columnSet;
}
function createRichTextBlock(content, options) {
  var richTextBlock = {
    type: cardTypes.richTextBlock,
    inlines: content
  };
  setOptions(richTextBlock, options);
  return richTextBlock;
}
function createTextRun(content, options) {
  var textRun = {
    type: cardTypes.textRun,
    text: content
  };
  setOptions(textRun, options);
  return textRun;
}

function wrap(elements, options) {
  elements = toArray(elements);
  /* Don't wrap only a container in a container */

  if (elements.length === 1 && isContainer(elements[0])) {
    return elements[0];
  }

  var container = {
    type: cardTypes.container,
    items: elements
  };
  setOptions(container, options);
  return container;
} // Returns the list of elements within a container
// If the item passed in is not a container, it is simply returned

function unwrap(container) {
  if (!isContainer(container)) {
    return toArray(container);
  }

  return container.items || [];
}

var blockElements = ['address', 'article', 'aside', 'audio', 'blockquote', 'body', 'canvas', 'center', 'dd', 'dir', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'html', 'isindex', 'li', 'main', 'menu', 'nav', 'noframes', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'];
function isBlock(node) {
  return blockElements.indexOf(node.nodeName.toLowerCase()) !== -1;
}
var voidElements = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr', 'span', 'iframe', 'div'];
function isVoid(node) {
  return voidElements.indexOf(node.nodeName.toLowerCase()) !== -1;
}
var lineBreakRegex = /  \n/g;
var carriageReturnTabRegex = /\r\t/g;
var voidSelector = voidElements.join();
function hasVoid(node) {
  return node.querySelector && node.querySelector(voidSelector);
}

var rules = {};
rules.blank = {
  filter: function filter(node) {
    return ['a', 'th', 'td'].indexOf(node.nodeName.toLowerCase()) === -1 && /^\s*$/i.test(node.textContent) && !isVoid(node) && !hasVoid(node);
  },
  replacement: function replacement(content, node) {
    if (node.textContent) {
      return handleTextEffects(content, function () {
        return node.textContent;
      });
    }

    return null;
  }
};
rules.text = {
  filter: function filter(node) {
    return node.nodeType === 3;
  },
  replacement: function replacement(content, node) {
    return handleTextEffects(content, function () {
      return node.nodeValue;
    });
  }
};
rules.lineBreak = {
  filter: 'br',
  replacement: function replacement(content) {
    return handleTextEffects(content, function (text) {
      return '  \n';
    });
  }
};
rules.heading = {
  filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  replacement: function replacement(content, node) {
    var hLevel = Number(node.nodeName.charAt(1));
    var hText = getTextBlocksAsString(content);
    var hNonText = getNonTextBlocks(content);
    return wrap([createHeadingTextBlock(hText, hLevel)].concat(hNonText));
  }
};
rules.list = {
  filter: ['ul', 'ol'],
  // content = array of listitem containers
  replacement: function replacement(listItemContainers, node) {
    var isOrdered = node.nodeName.toLowerCase() === 'ol';
    var startIndex = parseInt(node.getAttribute('start'), 10) || 1; // only applicable to ordered lists

    var blocks = (listItemContainers || []).map(function (listItemContainer, listItemIndex) {
      var listItemElems = unwrap(listItemContainer);
      var firstListItemElem = listItemElems[0];

      if (firstListItemElem && isTextBlock(firstListItemElem)) {
        var firstListItemPrefix = isOrdered ? "".concat(startIndex + listItemIndex, ". ") : "- ";
        firstListItemElem.text = firstListItemPrefix + firstListItemElem.text;
      }

      return listItemElems;
    }).reduce(function (prevBlocks, listItemBlocks) {
      return prevBlocks.concat(listItemBlocks);
    }, []);
    return wrap(blocks);
  }
};
rules.listItem = {
  filter: 'li',
  replacement: function replacement(content) {
    var currText = '';
    var blocks = (content || []).reduce(function (prevBlocks, currBlock) {
      var cardType = currBlock.type;

      switch (cardType) {
        case cardTypes.textBlock:
          currText += " ".concat(currBlock.text.replace(lineBreakRegex, '  \n\t').trim());
          break;

        case cardTypes.container:
          var nestedListElems = unwrap(currBlock);
          nestedListElems.forEach(function (nestedListElem) {
            if (isTextBlock(nestedListElem)) {
              currText += "\r\t".concat(nestedListElem.text.replace(carriageReturnTabRegex, '\r\t\t').replace(lineBreakRegex, '  \n\t'));
            } else {
              prevBlocks.push(nestedListElem);
            }
          });
          break;

        case cardTypes.image:
          prevBlocks.push(currBlock);
          break;

        default:
          console.error("Unsupported card type: ".concat(cardType, " ").concat(currBlock));
      }

      return prevBlocks;
    }, []);

    if (currText) {
      blocks.unshift(createTextBlock(currText.trim()));
    }

    return wrap(blocks);
  }
};
rules.inlineLink = {
  filter: function filter(node) {
    return node.nodeName.toLowerCase() === 'a' && node.getAttribute('href');
  },
  replacement: function replacement(content, node) {
    var href = node.getAttribute('href');
    return handleTextEffects(content, function (text) {
      return "[".concat(text, "](").concat(href, ")");
    });
  }
};
rules.emphasis = {
  filter: ['em', 'i'],
  replacement: function replacement(content, node) {
    return handleTextEffects(content, function (text) {
      return "_".concat(text, "_");
    });
  }
};
rules.strong = {
  filter: ['strong', 'b'],
  replacement: function replacement(content, node) {
    return handleTextEffects(content, function (text) {
      return "**".concat(text, "**");
    });
  }
};
rules.iframe = {
  filter: 'iframe',
  replacement: function replacement(content, node) {
    var fallbackText = 'To view this content, please open this card in the Guru app';
    return wrap(createTextBlock(fallbackText), {
      style: 'emphasis'
    });
  }
};
rules.image = {
  filter: 'img',
  replacement: function replacement(content, node) {
    var fallbackText = 'To view this image, please open this card in the Guru app';
    var alt = node.getAttribute('alt') || '';
    var src = node.getAttribute('src') || '';
    return createImage(src, {
      altText: alt,
      fallback: wrap(createTextBlock(fallbackText), {
        style: 'emphasis'
      })
    });
  }
};
rules.tableSection = {
  filter: ['thead', 'tbody', 'tfoot'],
  replacement: function replacement(content, node) {
    var fallbackText = 'To view this table content, please open this card in the Guru app';
    var maxColumns = 3;
    var maxCellCharacters = 100;
    var rows = content.length;
    var columns = (content[0] || {
      items: []
    }).items.length;

    if (columns > maxColumns) {
      return wrap(createTextBlock(fallbackText), {
        style: 'emphasis'
      });
    }

    for (var i = 0; i < rows; i++) {
      var items = content[i].items || [];

      if (items.some(function (item) {
        return (item.text || '').length > maxCellCharacters;
      })) {
        return wrap(createTextBlock(fallbackText), {
          style: 'emphasis'
        });
      }
    } //transform into columns


    var columnSet = [];
    var columnBlocks = [];

    for (var i = 0; i < columns; i++) {
      for (var j = 0; j < rows; j++) {
        columnBlocks = columnBlocks.concat(toArray(content[j].items[i]));
      }

      columnSet = columnSet.concat(createColumn(columnBlocks, {
        style: 'emphasis'
      }));
      columnBlocks = [];
    }

    return createColumnSet(columnSet);
  }
};
rules.tableRow = {
  filter: 'tr',
  replacement: function replacement(content, node) {
    return wrap(content);
  }
};
rules.tableCell = {
  filter: ['th', 'td'],
  replacement: function replacement(content, node) {
    return content;
  }
};
rules.table = {
  filter: 'table',
  replacement: function replacement(content, node) {
    return content;
  }
};
rules.code = {
  filter: 'code',
  replacement: function replacement(content, node) {
    var guruContentAttribute = node.getAttribute('data-ghq-card-content-type');
    var text = content[0].text || '';

    switch (guruContentAttribute) {
      case 'CODE_SNIPPET':
        return createRichTextBlock(toArray(createTextRun(text, {
          fontType: 'monospace',
          highlight: true,
          wrap: true
        })));

      case 'CODE_BLOCK_LINE':
        var items = createRichTextBlock(toArray(createTextRun(text, {
          fontType: 'monospace',
          wrap: true
        })));
        return wrap(items, {
          style: 'emphasis'
        });

      default:
        return wrap(content);
    }
  }
};
/* This must be the last rule */

rules["default"] = {
  filter: function filter() {
    return true;
  },
  replacement: function replacement(content, node) {
    if (node.isBlock) {
      return wrap(content);
    }

    return content;
  }
};

function handleTextEffects(contentCollection, textFunc) {
  var nonText = getNonTextBlocks(contentCollection) || [];
  var text = getTextBlocksAsString(contentCollection) || '';

  if (typeof textFunc === 'function') {
    text = textFunc(text);
  }

  return {
    text: text,
    nonText: nonText
  };
}

/**
 * Manages a collection of rules used to convert HTML to Adaptive Card JSON
 */
function Rules(rules) {
  this.rules = Object.assign({}, rules);
}

Rules.prototype.forNode = function (node) {
  return findRule(this.rules, node);
};

function findRule(rules, node) {
  var foundRule = null;
  (Object.keys(rules) || []).some(function (ruleKey) {
    if (filterValue(rules[ruleKey], node)) {
      foundRule = rules[ruleKey];
      return true;
    }

    return false;
  });
  return foundRule;
}

function filterValue(rule, node) {
  var filter = rule.filter;

  if (typeof filter === 'string') {
    return filter === node.nodeName.toLowerCase();
  } else if (Array.isArray(filter)) {
    return filter.indexOf(node.nodeName.toLowerCase()) > -1;
  } else if (typeof filter === 'function') {
    return filter.call(rule, node);
  }

  throw new TypeError('`filter` needs to be a string, array, or function');
}

/*!
 * The collapseWhitespace function is adapted from collapse-whitespace
 * by Luc Thevenard.
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Luc Thevenard <lucthevenard@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * collapseWhitespace(options) removes extraneous whitespace from an the given element.
 *
 * @param {Object} options
 */
function collapseWhitespace(options) {
  var element = options.element;
  var isBlock = options.isBlock;
  var isVoid = options.isVoid;

  var isPre = options.isPre || function (node) {
    return node.nodeName === 'PRE';
  };

  if (!element.firstChild || isPre(element)) return;
  var prevText = null;
  var prevVoid = false;
  var prev = null;
  var node = next(prev, element, isPre);

  while (node !== element) {
    if (node.nodeType === 3 || node.nodeType === 4) {
      // Node.TEXT_NODE or Node.CDATA_SECTION_NODE
      var text = node.data.replace(/[ \r\n\t]+/g, ' ');

      if ((!prevText || / $/.test(prevText.data)) && !prevVoid && text[0] === ' ') {
        text = text.substr(1);
      } // `text` might be empty at this point.


      if (!text) {
        node = remove(node);
        continue;
      }

      node.data = text;
      prevText = node;
    } else if (node.nodeType === 1) {
      // Node.ELEMENT_NODE
      if (isBlock(node) || node.nodeName === 'BR') {
        if (prevText) {
          prevText.data = prevText.data.replace(/ $/, '');
        }

        prevText = null;
        prevVoid = false;
      } else if (isVoid(node)) {
        // Avoid trimming space around non-block, non-BR void elements.
        prevText = null;
        prevVoid = true;
      }
    } else {
      node = remove(node);
      continue;
    }

    var nextNode = next(prev, node, isPre);
    prev = node;
    node = nextNode;
  }

  if (prevText) {
    prevText.data = prevText.data.replace(/ $/, '');

    if (!prevText.data) {
      remove(prevText);
    }
  }
}
/**
* remove(node) removes the given node from the DOM and returns the
* next node in the sequence.
*
* @param {Node} node
* @return {Node} node
*/


function remove(node) {
  var next = node.nextSibling || node.parentNode;
  node.parentNode.removeChild(node);
  return next;
}
/**
* next(prev, current, isPre) returns the next node in the sequence, given the
* current and previous nodes.
*
* @param {Node} prev
* @param {Node} current
* @param {Function} isPre
* @return {Node}
*/


function next(prev, current, isPre) {
  if (prev && prev.parentNode === current || isPre(current)) {
    return current.nextSibling || current.parentNode;
  }

  return current.firstChild || current.nextSibling || current.parentNode;
}

var _htmlParser;

function RootNode(input) {
  var root;

  if (typeof input === 'string') {
    var doc = htmlParser().parseFromString( // DOM parsers arrange elements in the <head> and <body>.
    // Wrapping in a custom element ensures elements are reliably arranged in
    // a single element.
    "<x-turndown id=\"turndown-root\">".concat(input, "</x-turndown>"), 'text/html');
    root = doc.getElementById('turndown-root');
  } else {
    root = input.cloneNode(true);
  }

  collapseWhitespace({
    element: root,
    isBlock: isBlock,
    isVoid: isVoid
  });
  return root;
}

function htmlParser() {
  _htmlParser = _htmlParser || new DOMParser();
  return _htmlParser;
}

function Node(node) {
  node.isBlock = isBlock(node);
  return node;
}

/*!
 * Code in files within the turndown folder is taken and modified from the Turndown
 * project created by Dom Christie (https://github.com/domchristie/turndown/)
 *
 * MIT License
 *
 * Original work Copyright (c) 2017 Dom Christie
 * Modified work Copyright (c) 2018 Richie Casto
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

function TurndownService() {
  this.rules = new Rules(rules);
}

TurndownService.prototype = {
  /**
   * The entry point for converting a string or DOM node to JSON
   * @public
   * @param {String|HTMLElement} input The string or DOM node to convert
   * @returns A Markdown representation of the input
   * @type String
   */
  turndown: function turndown(input) {
    if (!canConvert(input)) {
      throw new TypeError("".concat(input, " is not a string, or an element/document/fragment node."));
    }

    var cardElems = process.call(this, new RootNode(input));
    return createCard(cardElems);
  }
};
/**
 * Reduces a DOM node down to its Adaptive Card equivalent
 * @private
 * @param {HTMLElement} parentNode The node to convert
 * @returns An Adaptive Card representation of the node
 * @type String
 */

function process(parentNode) {
  var _this = this;

  var currText = '';
  var blocks = Array.prototype.reduce.call(parentNode.childNodes || [], function (output, node) {
    var replacement = [];
    node = new Node(node);

    if (isValidNodetype(node)) {
      replacement = replacementForNode.call(_this, node);
    }

    replacement = replacement || []; // text nodes, em, i, b, strong, a tags will hit this

    if (_typeof(replacement) === 'object' && !isCardElement(replacement) && !Array.isArray(replacement)) {
      currText += replacement.text;

      if (replacement.nonText && replacement.nonText.length || !node.nextSibling) {
        output.push(createTextBlock(currText));
        currText = '';
      }

      replacement = replacement.nonText || [];
    } else if (currText) {
      // Collection detected, let's push this textblock first, then clear the text
      output.push(createTextBlock(currText));
      currText = '';
    }

    return output.concat(toArray(replacement));
  }, []);
  return blocks;
}
/**
 * Converts an element node to its Adaptive Card equivalent
 * @private
 * @param {HTMLElement} node The node to convert
 * @returns An Adaptive Card representation of the node
 * @type String
 */


function replacementForNode(node) {
  var rule = this.rules.forNode(node);
  var content = process.call(this, node); // get's internal content of node

  return rule.replacement(content, node);
}
/**
 * Determines whether an input can be converted
 * @private
 * @param {String|HTMLElement} input Describe this parameter
 * @returns Describe what it returns
 * @type String|Object|Array|Boolean|Number
 */


function canConvert(input) {
  return input != null && (typeof input === 'string' || input.nodeType && (input.nodeType === 1 || input.nodeType === 9 || input.nodeType === 11));
}

function isValidNodetype(node) {
  return !!(node && (node.nodeType === 3 || node.nodeType === 1));
}

var turndownService = new TurndownService();
/**
 * @param {(string | HTMLElement)} htmlStringOrElem
 * @returns {object} Adaptive Card JSON
 */

function toJSON(htmlStringOrElem) {
  return turndownService.turndown(htmlStringOrElem);
}

var index = {
  toJSON: toJSON
};

module.exports = index;
