import {
    toArray
} from './utilityHelper';

const supportedCardVersions = [
    '1.0'
];

function getBlocks(cardCollection, types) {
    types = toArray(types);
    cardCollection = toArray(cardCollection);
    return cardCollection.filter(card => types.some(type => isCardType(card, type)));
}

function isCardType(card, type) {
    if (!card) {
        return false;
    }
    var cardType = (card.type || '').toLowerCase();
    type = (type || '').toLowerCase();
    return cardType === type;
}

export const cardTypes = Object.freeze({
    textBlock: "TextBlock",
    container: "Container",
    image: "Image",
    adaptiveCard: "AdaptiveCard",
    column: "Column",
    columnSet: "ColumnSet"
});

export function isTextBlock(card) {
    return isCardType(card, cardTypes.textBlock);
}

export function isContainer(card) {
    return isCardType(card, cardTypes.container);
}

export function isImage(card) {
    return isCardType(card, cardTypes.image);
}

export function isColumn(card) {
    return isCardType(card, cardTypes.column);
}

export function isColumnSet(card) {
    return isCardType(card, cardTypes.columnSet);
}

export function isAdaptiveCard(card) {
    return isCardType(card, cardTypes.adaptiveCard);
}

export function isCardElement(card) {
    return isTextBlock(card) ||
           isImage(card) ||
           isContainer(card) ||
           isColumn(card) ||
           isColumnSet(card);
}

export function getTextBlocks(cardCollection) {
    return getBlocks(cardCollection, cardTypes.textBlock);
}

export function getNonTextBlocks(cardCollection) {
    return getBlocks(cardCollection, [cardTypes.image, cardTypes.container]);
}

export function getTextBlocksAsString(cardCollection) {
    return getTextBlocks(cardCollection)
        .map(textBlock => textBlock.text)
        .join(' ')
        .replace(/ +/g, ' ')
        .trim();
}

export default {
    isTextBlock,
    isContainer,
    isImage,
    isColumn,
    isColumnSet,
    isAdaptiveCard,
    isCardElement,
    getTextBlocks,
    getTextBlocksAsString,
    getNonTextBlocks,
    cardTypes
};