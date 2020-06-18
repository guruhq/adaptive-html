import {
    toArray
} from './utilityHelper';
import {
    cardTypes,
    isContainer,
    isContainerWithRequiredProperties
} from './adaptiveCardFilter';

function setOptions(obj, options) {
    Object.keys(options || {})
        .forEach(optionKey => {
            obj[optionKey] = options[optionKey];
        });
}

export function createCard(elements) {
    const card = {
        type: cardTypes.adaptiveCard,
        body: [],
        actions: [],
        version: '1.2'
    };
    let body = toArray(elements);

    // remove extra container wrapping for a single element that only has required properties (type, items)
    // otherwise leave the container wrap since there could be additional styling
    // https://adaptivecards.io/explorer/Container.html
    if (Array.isArray(elements) && elements.length === 1) {
        const singleElement = elements[0];
        if (isContainerWithRequiredProperties(singleElement)) {
            body = unwrap(singleElement);
        }
    }
    card.body = body;
    return card;
}

export function createTextBlock(text, options) {
    const textBlock = {
        type: cardTypes.textBlock,
        text: text || '',
        wrap: true
    };
    setOptions(textBlock, options);
    return textBlock;
}

export function createHeadingTextBlock(text, depth) {
    let weight = 'bolder';
    let size = 'default';
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
        size,
        weight
    });
}

export function createImage(url, options) {
    const image = {
        type: cardTypes.image,
        url: url
    };
    setOptions(image, options);
    return image;
}

export function createColumn(content, options) {
    const column = {
      type: cardTypes.column,
      items: content
    };
    setOptions(column, options);
    return column;
}

export function createColumnSet(columns, options) {
    const columnSet = {
      type: cardTypes.columnSet,
      columns: columns
    };
    setOptions(columnSet, options);
    return columnSet;
} 

export function createRichTextBlock(content, options) {
    const richTextBlock = {
        type: cardTypes.richTextBlock,
        inlines: content
    };
    setOptions(richTextBlock, options);
    return richTextBlock;
};

export function createTextRun(content, options) {
    const textRun = {
        type: cardTypes.textRun,
        text: content
    };
    setOptions(textRun, options);
    return textRun;
};

// Wrap adaptive card elements in a container
export function wrap(elements, options) {
    elements = toArray(elements);
    /* Don't wrap only a container in a container */
    if (elements.length === 1 &&
        isContainer(elements[0])) {
        return elements[0];
    }
    let container = {
        type: cardTypes.container,
        items: elements
    };
    setOptions(container, options);
    return container;
}

// Returns the list of elements within a container
// If the item passed in is not a container, it is simply returned
export function unwrap(container) {
    if (!isContainer(container)) {
        return toArray(container);
    }
    return (container.items || []); 
}

export default {
    createHeadingTextBlock,
    createTextBlock,
    createImage,
    createColumn,
    createColumnSet,
    createRichTextBlock,
    createTextRun,
    createCard,
    wrap,
    unwrap
};