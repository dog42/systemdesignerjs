"use strict";

var codeFunctions = []
//name
//returntype (or macro)
//prototypelinenumber
//decllinenumber
//
function addFunction(n, rType, pLine, dLine) {
    //make 
}

var functions =
    {
        localdata: codeSymbols,
        datatype: "array",
        datafields:
            [
                { name: 'name', type: 'string' },
                { name: 'returntype', type: 'string' },
                { name: 'pline', type: 'number' },
                { name: 'dline', type: 'number' }
            ],
        sortcolumn: 'name',
        sortdirection: 'desc'
    }
var functionsAdapter = new $.jqx.dataAdapter(functions);

$("#func-jqxgrid").jqxGrid(
{
    width: 500,
    height: '100%',
    source: functionsAdapter,
    columnsresize: true,
    sortable: true,
    columns: [
        { text: 'ReturnType', datafield: 'returntype', width: 40 },
        { text: 'Name', datafield: 'name', width: 40 },
        { text: 'Protoline', datafield: 'pline', width: 95 },
        { text: 'Declline', datafield: 'dline', width: 95 }
]
});
