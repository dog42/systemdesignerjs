var View = function ()
{
    return this;
}


View .prototype.InitLayout = function (){
    $('#splitNorth').jqxSplitter({
        width: "100%",
        height: "100%",
        theme: theme,
        orientation: 'horizontal',
        panels: [
            { size: '2%' },
            { size: '90%', min: '20%', collapsible: false }]
    });
    $('#splitterWest').jqxSplitter({
        width: '100%',
        theme: theme,
        panels: [
            { size: "15%" },
            { size: "85%", collapsible: false }]
    });
    $('#splitterSouthWest').jqxSplitter({
        width: '100%',
        orientation: 'horizontal',
        theme: theme,
        panels: [{ size: "55%", collapsible: false },
            { size: "45%" }]
    });
    $('#splitterEast').jqxSplitter({
        width: '100%',
        theme: theme,
        panels: [
            { size: "60%", collapsible: false },
            { size: "40%" }]
    });

    $("#tabsNW").jqxTabs({
        height: '100%',
        width: '100%',
        theme: theme,
        //animationType: 'fade',
        //contentTransitionDuration: 1000
    });
    $("#tabsSW").jqxTabs({
        height: '100%',
        width: '100%',
        animationType: 'fade',
        theme: theme,
        scrollable: true
    });
    $("#tabsCentre").jqxTabs({
        height: '100%',
        width: '100%',
        theme: theme
    });
    $("#tabsEast").jqxTabs({
        height: '100%',
        width: '100%',
        theme: theme
    });

    $("#step").jqxButton({ width: '50', height: '25', theme: theme });
    $("#run").jqxButton({ width: '50', height: '25', theme: theme });
    $("#stop").jqxButton({ width: '50', height: '25', theme: theme });
    $('#step').bind('click', function (event) {
        myController.Step();
    });
    $('#run').bind('click', function (event) {
        myController.Run();
    });
    $('#stop').bind('click', function (event) {
        myController.Stop();
    });

}

View.prototype.DisplayCode = function () {
    codeEditor.setValue(myCodeMaker.code);
    codeEditor.gotoLine(1);
}

View.prototype.Message = function (msg) {
    $("#tabsNW").jqxTabs("select", 3);
    outputtxt.value = msg
}
View.prototype.MessageAdd = function (msg) {
    $("#tabsNW").jqxTabs("select", 3);
    outputtxt.value += msg
}


//identify browser
var browser = (function () {
    var ua = navigator.userAgent, tem,
    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();





function Variables_SetVarValue(variable, newvalue) {
    //error check for bit > 7?
    for (var index = 0; index < Memory.length; index++) {
        if (variable === Memory[index].name) {
            Memory[index].valuedec = newvalue;
            $("#vars-jqxgrid").jqxGrid('updatebounddata');
            return true;
        }
    }
    return false; //cannot find variable
}



//Registers bindings
//www.jqwidgets.com/jquery-widgets-documentation/documentation/jqxdataadapter/jquery-data-adapter.htm

var regs =
{
    localdata: myMicrocontroller.getRegistersArr(),
    datatype: "array",
    datafields:
    [
        { name: 'name', type: 'string' },
        { name: 'addrhex', type: 'string' },
        { name: 'valuehex', type: 'string' },
        { name: 'valuebin', type: 'string' },
        { name: 'valuedec', type: 'number' },
        { name: 'description', type: 'number' }
    ],
    sortcolumn: 'addrhex',
    sortdirection: 'desc'
};

var regsAdapter = new $.jqx.dataAdapter(regs);


$("#regs-jqxgrid").jqxGrid(
{
    width: 500,
    height: '100%',
    source: regsAdapter,
    columnsresize: true,
    sortable: true,
    columnsreorder: true,
    columns: [
        { text: 'Addr', datafield: 'addrhex', width: 42 },
        { text: 'Name', datafield: 'name', width: 70 },
        { text: 'Val', datafield: 'valuehex', width: 42 },
        { text: 'Val(bin)', datafield: 'valuebin', width: 95 },
        { text: 'Val(dec)', datafield: 'valuedec', width: 40 },
        { text: 'Description', datafield: 'description', width: 240 }
    ]
});



//Grid events
$('#regs-jqxgrid').on('bindingcomplete', function (event) {
    var args = event.args;
    //update the outputs on the diagram with any PORT changes
    var regs = myMicrocontroller.Registers.registers
    var ports = myMicrocontroller.Ports;
    for (var i = 0; i < ports.length; i++) //for each port
    {
        var j = ports[i].index;
        var newval = regs[j].valuedec;
        var oldval = ports[i].value;
        var change = newval ^ oldval;
        if (regs[j].valuedec ^ ports[i].value > 0) { //see if any bit has changed
            ports[i].value = newval;//store the new val for next time around
            //for each bit that has changed
            for (var k = 0; k < 8; k++) {
                //var c = change & 1 << k;
                if ((change & 1 << k) > 0) {
                    var newbitval = (newval & 1 << k) >> k;
                    var portname = regs[j].name;
                    mf.updateOutput(portname, k, newbitval)
                }
            }
        }
    }
    //alert(event.args);
});

//$('#regs-jqxgrid').on('onvaluechanged', function (event) { //doesnt fire on binding changes
//    var args = event.args;
//    alert(event.args);
//});


function sort() {
    $("#regs-jqxgrid").jqxGrid('sortby', 'addrhex', 'desc');
}


//Symbols

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



//Functions
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
