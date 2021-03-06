define(['utils'], function (utils) {
    var generateContent = function (_styles) {
        var stylesString = '', fontKey;
        stylesString += '<fonts count="' + _styles._fontsCount + '">';
        for (fontKey in _styles._fonts) {
            var font = JSON.parse(fontKey);
            stylesString += generateSingleContent(font);
        }
        stylesString += '</fonts>';
        return stylesString;
    };

    var generateSingleContent = function (font) {
        var stylesString = '<font>';
        stylesString += font.strike ? '<strike/>' : '';
        stylesString += font.italic ? '<i/>' : '';
        stylesString += font.bold ? '<b/>' : '';
        stylesString += font.underline ? '<u/>' : '';
        stylesString += font.size ? '<sz val="' + font.size + '"/>' : '';
        stylesString += font.color ? '<color rgb="'
            + font.color + '"/>' : '';
        stylesString += font.name ? '<name val="' + font.name + '"/>' : '';
        stylesString += font.family ? '<family val="'
            + font.family + '"/>' : '';
        stylesString += font.scheme ? '<scheme val="'
            + font.scheme + '"/>' : '';
        stylesString += '</font>';
        return stylesString;
    };

    var createFont = function (options) {
        var font = {};
        font.bold = !!options.bold;
        font.italic = !!options.italic;
        font.underline = !!options.underline;
        font.size = options.fontSize || false;
        font.color = options.fontColor || false;
        font.name = options.fontName || false;
        font.family = options.fontFamily || false;
        font.scheme = options.scheme || false;
        font.strike = !!options.strike;
        return font;
    };

    var searchFont = function (font, _styles) {
        return _styles._fonts[utils.stringify(font)];
    };

    var searchSavedFontsForUpdate = function (_styles, cellIndices) {
        var index = 0, fontCount = 0;
        var cellStyle;
        for (var index2 = 0; index2 < cellIndices.length; index2++) {
            var cellIndex = cellIndices[0];
            for (; index < _styles.styles.length; index++) {
                if (_styles.styles[index].cellIndices[cellIndex] !== undefined
                    || _styles.styles[index].cellIndices[cellIndex] !== null) {
                    cellStyle = _styles.styles[index];
                    fontCount++;
                    if (Object.keys(cellStyle.cellIndices).length
                        !== cellIndices.length
                        || fontCount > 1 || cellStyle._font === 0) {
                        return false;
                    }
                }
            }
        }
        if (!cellStyle)
            return false;
        return cellStyle._font;
    };

    var addFont = function (font, _styles) {
        var index = _styles._fontsCount++;
        _styles._fonts[utils.stringify(font)] = "" + index;
        return _styles._fonts[utils.stringify(font)];
    };

    var updateFont = function (font, savedFont, _styles) {
        mergeFont(font, savedFont, _styles, true);
        _styles._fonts[utils.stringify(font)] = savedFont;
        return savedFont;
    };

    var createTableFont = function (options, savedFont) {
        var font = createFont(options);
        if (savedFont) {
            for (var key in font) {
                if (font[key])
                    savedFont[key] = font[key];
            }
            return savedFont;
        }
        return font;
    };

    var mergeFont = function (font, savedFont, _styles, deleteSavedFont) {
        var savedFontDetails;
        for (var key in _styles._fonts) {
            if (_styles._fonts[key] === savedFont) {
                savedFontDetails = JSON.parse(key);
                break;
            }
        }
        if (deleteSavedFont) {
            delete _styles._fonts[utils.stringify(savedFontDetails)];
        }
        for (var key in font) {
            if (font[key])
                savedFontDetails[key] = font[key];
            font[key] = savedFontDetails[key];
        }
        return font;
    };

    var getFontCounts = function (font, _styles) {
        var count = 0, index;
        for (index = 0; index < _styles.styles.length; index++) {
            if (_styles.styles[index]._font === font) {
                count += Object.keys(_styles.styles[index].cellIndices).length;
                if (count > 1)
                    return count;
            }
        }
        return count;
    };

    var getFontForCells = function (_styles, options) {
        var newStyleCreated = false, font = createFont(options), fontIndex;
        var savedFont = _styles._fonts ? searchFont(font, _styles) : null;
        if (savedFont !== undefined && savedFont !== null) {
            fontIndex = savedFont;
        } else {
            newStyleCreated = true;
        }
        if (!fontIndex) {
            savedFont = searchSavedFontsForUpdate(_styles, options.cellIndices);
            if (savedFont !== false) {
                fontIndex = updateFont(font, savedFont, _styles);
            }
        }
        if (fontIndex === undefined || fontIndex === null)
            fontIndex = addFont(font, _styles);
        return {
            font: font,
            fontIndex: fontIndex,
            newStyleCreated: newStyleCreated
        };
    };

    var getFontForCell = function (_styles, options, cellStyle) {
        // Create Font Object
        var newStyleCreated = false, font = createFont(options), fontIndex;

        var savedFont = _styles._fonts ? searchFont(font, _styles) : null;

        if (savedFont !== undefined && savedFont !== null) {
            fontIndex = savedFont;
        } else {
            // Check if font can be updated
            newStyleCreated = true;
        }
        if (cellStyle && cellStyle._font) {
            var fontCount = getFontCounts(cellStyle._font, _styles);
            if (fontCount <= 1) {
                // Update font
                fontIndex = updateFont(font, cellStyle._font, _styles);
            } else {
                // Merge Font
                font = mergeFont(font, cellStyle._font, _styles);
                savedFont = searchFont(font, _styles);
                if (savedFont !== undefined && savedFont !== null) {
                    fontIndex = savedFont;
                } else {
                    fontIndex = null;
                    newStyleCreated = true;
                }
            }
        }
        if (fontIndex === undefined || fontIndex === null)
            fontIndex = addFont(font, _styles);

        return {
            font: font,
            fontIndex: fontIndex,
            newStyleCreated: newStyleCreated
        };
    };

    return {
        createTableFont: createTableFont,
        getFontForCell: getFontForCell,
        getFontForCells: getFontForCells,
        generateContent: generateContent,
        generateSingleContent: generateSingleContent
    };
});