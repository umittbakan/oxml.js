requirejs.config({
    baseUrl: '..',
    paths: {
        fileHandler: 'utils/fileHandler',
        jsZip: 'lib/jsZip.min',
        fileSaver: 'lib/fileSaver.min',
        oxml_content_types: 'oxml-content-types',
        oxml_rels: 'oxml-rels',
        oxml_sheet: 'oxml-sheet',
        oxml_workbook: 'oxml-workbook',
        oxml_xlsx: 'oxml-xlsx'
    }
});

requirejs(['fileSaver', 'oxml-xlsx'],
function   (fileSaver, oxmlXLSX) {
    console.log(fileSaver, oxmlXLSX);
    var file = oxml.createXLSX();
            // var sharedString = file._xlsx.workBook.createSharedString("Hello");
            var sheet2 = file.addSheet('sheet1');
            sheet2.updateValuesInMatrix([
                [null, 'Sale Price', 'Cost Price', 'Profit', 'Profit%'],
                [null, 10, 14], //{type: "formula", formula: "(B2 - A2)", value: 4}, {type: "formula", formula: "(C2 / A2) * 100", value: 40}]
                [null, 11, 14],
                'Total'
            ]);
            sheet2.updateSharedFormula('(C2 - B2)', 'D2', 'D3');
            sheet2.updateSharedFormula('(B2 + B3)', 'B4', 'D4');
            sheet2.updateSharedFormula('(D2 / B2) * 100', 'E2', 'E4');
            var sheet = file.addSheet('tst1');
            sheet.updateValuesInRow(0, [null, 22, undefined, 23, 28]);
            file.download('t.xlsx');
            console.log(file);
});