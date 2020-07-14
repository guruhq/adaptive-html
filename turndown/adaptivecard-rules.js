import {
    wrap,
    unwrap,
    createTextBlock,
    createHeadingTextBlock,
    createColumn,
    createColumnSet,
    createImage,
    createTextRun,
    createRichTextBlock
} from '../lib/adaptiveCardHelper';
import {
    getTextBlocksAsString,
    getNonTextBlocks,
    isTextBlock,
    cardTypes
} from '../lib/adaptiveCardFilter';
import {
    toArray
} from '../lib/utilityHelper';
import {
    isVoid,
    hasVoid,
    lineBreakRegex,
    carriageReturnTabRegex
} from './utilities';

const rules = {};

rules.blank = {
    filter: function (node) {
        return (
            ['a', 'th', 'td'].indexOf(node.nodeName.toLowerCase()) === -1 &&
            /^\s*$/i.test(node.textContent) &&
            !isVoid(node) &&
            !hasVoid(node)
        );
    },
    replacement: function (content, node) {
        if (node.textContent) {
            return handleTextEffects(content, function () {
                return node.textContent;
            });
        }
        return null;
    }
};

rules.text = {
    filter: function (node) {
        return node.nodeType === 3;
    },
    replacement: function (content, node) {
        return handleTextEffects(content, function () {
            return node.nodeValue;
        });
    }
};

rules.lineBreak = {
    filter: 'br',
    replacement: function (content) {
        return handleTextEffects(content, function (text) {
            return '  \n';
        });
    }
};

rules.heading = {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement: function (content, node) {
        var hLevel = Number(node.nodeName.charAt(1));
        var hText = getTextBlocksAsString(content);
        var hNonText = getNonTextBlocks(content);
        return wrap([
            createHeadingTextBlock(hText, hLevel)
        ].concat(hNonText));
    }
};

rules.list = {
    filter: ['ul', 'ol'],
    // content = array of listitem containers
    replacement: function (listItemContainers, node) {
        var isOrdered = node.nodeName.toLowerCase() === 'ol';
        var startIndex = parseInt(node.getAttribute('start'), 10) || 1; // only applicable to ordered lists
        var blocks = (listItemContainers || []).map((listItemContainer, listItemIndex) => {
            var listItemElems = unwrap(listItemContainer);
            var firstListItemElem = listItemElems[0];
            if (firstListItemElem && isTextBlock(firstListItemElem)) {
                let firstListItemPrefix = isOrdered ? `${startIndex + listItemIndex}. ` : `- `;
                firstListItemElem.text = firstListItemPrefix + firstListItemElem.text;
            }
            return listItemElems;
        }).reduce((prevBlocks, listItemBlocks) => {
            return prevBlocks.concat(listItemBlocks);
        }, []);
        return wrap(blocks);
    }
};

rules.listItem = {
    filter: 'li',
    replacement: function (content) {
        var currText = '';
        var blocks = (content || []).reduce((prevBlocks, currBlock) => {
            var cardType = currBlock.type;
            switch (cardType) {
                case cardTypes.textBlock:
                    currText += ` ${currBlock.text
                        .replace(lineBreakRegex, '  \n\t')
                        .trim()}`;
                    break;
                case cardTypes.container:
                    let nestedListElems = unwrap(currBlock);
                    nestedListElems
                        .forEach(nestedListElem => {
                            if (isTextBlock(nestedListElem)) {
                                currText += `\r\t${nestedListElem.text
                                    .replace(carriageReturnTabRegex, '\r\t\t')
                                    .replace(lineBreakRegex, '  \n\t')}`;
                            } else {
                                prevBlocks.push(nestedListElem);
                            }
                        });
                    break;
                case cardTypes.image:
                    prevBlocks.push(currBlock);
                    break;
                default:
                    console.error(`Unsupported card type: ${cardType} ${currBlock}`);
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
    filter: function (node) {
        return (
            node.nodeName.toLowerCase() === 'a' &&
            node.getAttribute('href')
        );
    },
    replacement: function (content, node) {
        var href = node.getAttribute('href');
        return handleTextEffects(content, function (text) {
            return `[${text}](${href})`;
        });
    }
};

rules.emphasis = {
    filter: ['em', 'i'],
    replacement: function (content, node) {
        return handleTextEffects(content, function (text) {
            return `_${text}_`;
        });
    }
};

rules.strong = {
    filter: ['strong', 'b'],
    replacement: function (content, node) {
        return handleTextEffects(content, function (text) {
            return `**${text}**`;
        });
    }
};

rules.iframe = {
    filter: 'iframe',
    replacement: function (content, node) {
        let fallbackText = 'To view this embedded content, please open this Card in the Guru app.';
        const guruContentAttribute = node.getAttribute('data-ghq-card-content-type') || '';

        if (guruContentAttribute === "VIDEO") {
            fallbackText = 'To view this video content, please open this Card in the Guru app.';
        }

        return wrap(createTextBlock(fallbackText), { style: 'attention' });
    }
}

rules.image = {
    filter: 'img',
    replacement: function (content, node) {
        const alt = node.getAttribute('alt') || '';
        const src = node.getAttribute('src') || '';
        return createImage(src, {
            altText: alt
        });
    }
};

rules.tableSection = {
    filter: ['thead', 'tbody', 'tfoot'],
    replacement: function replacement(content, node) {
        const fallbackText = 'To view this table content, please open this Card in the Guru app.';
        const maxColumns = 3;
        const maxCellCharacters = 100;
        const rows = content.length;
        const columns = (content[0] || { items: []}).items.length;

        if (columns > maxColumns) {
            return wrap(createTextBlock(fallbackText), { style: 'attention' });
        }

        for (var i = 0; i < rows; i++) {
            let items = content[i].items || [];
            if (items.some((item) => (item.text || '').length > maxCellCharacters))  {
              return wrap(createTextBlock(fallbackText), { style: 'attention' });
            }
        }
  
        //transform into columns
        let columnSet = [];
        let columnBlocks = [];
        for (var i = 0; i < columns; i++) {
            for (var j = 0; j < rows; j++) {
                columnBlocks = columnBlocks.concat(toArray(content[j].items[i]));
            }
            columnSet = columnSet.concat(createColumn(columnBlocks, { style: 'emphasis' }));
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
        const guruContentAttribute = node.getAttribute('data-ghq-card-content-type');
        const text = content[0].text || '';

        switch (guruContentAttribute) {
            case 'CODE_SNIPPET':
                return createRichTextBlock(
                    toArray(createTextRun(text, {
                        fontType: 'monospace',
                        highlight: true,
                        wrap: true
                    })));
            case 'CODE_BLOCK_LINE':
                const items = createRichTextBlock(
                    toArray(createTextRun(text, {
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
rules.default = {
    filter: () => true,
    replacement: function (content, node) {
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
        text,
        nonText
    };
}

export default rules;