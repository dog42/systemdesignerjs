"use strict";

var codeSymbols = []
//name
//value (or macro)
//tokens[]

function addSymbol(n,m)
{
    //make value into tokens if needed
}

var symbols = 
    {
        localdata: codeSymbols,
        datatype: "array",
        datafields:
            [
                { name: 'name', type: 'string' },
                { name: 'value', type: 'number' },
                { name: 'tokens', type: 'string' }
            ],
        sortcolumn: 'name',
        sortdirection: 'desc'
    }
var symbolsAdapter = new $.jqx.dataAdapter(symbols);

$("#symb-jqxgrid").jqxGrid(
{
    width: 500,
    height: '100%',
    source: symbolsAdapter,
    columnsresize: true,
    sortable: true,
    columns: [
        { text: 'Name', datafield: 'name', width: 40 },
        { text: 'Value', datafield: 'value', width: 40 },
        { text: 'Tokens', datafield: 'tokens', width: 95 }
    ]
});
