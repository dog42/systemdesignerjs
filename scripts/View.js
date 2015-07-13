var View = function ()
{
    //this.adcWindowsContainer;
    //this.adcChannels=[];
    return this;
}


View .prototype.InitLayout = function (){
    $('#splitNorth').jqxSplitter({
        width: "100%",
        height: "100%",
        theme: theme,
        orientation: 'horizontal',
        panels: [
            { size: '0%' },
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

    $('#delaySlider').jqxSlider({
        showButtons: false,
        min:0,
        max:2000,
        value: 1900,
        //mode: 'fixed',
        ticksFrequency:400,
        ticksPosition: 'bottom',
        showRange: true,
        height:"12px",
        width: '200px'
    });
    $('#jqxSlider').on('change', function (event) {
        var value = event.args.value;
    });

    this.adcWindowContainer = $('#adcWindowContainer');


    /**************************************************************************/
    // buttons    //from www.gieson.com/Library/projects/utilities/opensave/
    opensave.make({
        kind: "open",
        label: "Open diagram",
        width: 105,
        height: 24,
        buttonDiv: "openTextFieldButton",
        //dataID: 	"textFieldData"
        handler: (mf.openDiagramFile)
    });

    opensave.make({
        label: "Save diagram as",
        width: 105,
        height: 24,
        filename: "My Textarea Data.txt",
        buttonDiv: "saveTextFieldButton",
        //dataID: "textFieldData"
        handler: (mf.saveDiagramFile)
    });
}

View.prototype.showAdcWindow = function (adcChannel,node) {
    var windows = $.data(document.body, 'jqxwindows-list');
    //see if this window exists already
    if (windows !== undefined) {
        for (var i = 0; i < windows.length; i++) {
            if (windows[i][0].id.indexOf(adcChannel) > -1) {
                $('#adcWindow' + adcChannel).jqxWindow('open');
                return;
            }
        }
    }
    //window for this adcchannel not found so create it
    var an;
    for (var i = 0; i < mf.anaInputs.length; i++) {
        if (node.getId() === mf.anaInputs[i].type) {
            an=i;
        }
    }
    var headtext = node.getText() + "    "
                + mf.anaInputs[an].sliderminvalue + "-" + mf.anaInputs[an].slidermaxvalue
                + mf.anaInputs[an].sense;
    //var slidemin = parseInt(mf.anaInputs[an].sliderminvalue,10);
    //var slidemax = parseInt(mf.anaInputs[an].slidermaxvalue,10);
    var slideval = parseFloat(mf.anaInputs[an].initialvoltage,10);
    var minvoltage = parseFloat(mf.anaInputs[an].minvoltage, 10);
    var maxvoltage = parseFloat(mf.anaInputs[an].maxvoltage, 10);
    $(document.body).append(
        '<div id="adcWindow' + adcChannel + '">'
        +  '<div>'
            + '<div id="header">' + headtext + '</div>'
        +  '</div>'
        +  '<div id="adcSlider' + adcChannel + '">'
            + 'Channel ' + adcChannel
        + '</div>'
        + '</div>');
    //this.adcWindowsContainer = $('#adcWindowsContainer');
    $('#adcWindow' + adcChannel).jqxWindow({
        showCollapseButton: false,
        height: 55,
        width: 250,
        resizable: false,
        initContent: function () {
            $('#adcSlider' + adcChannel).jqxSlider({
                showButtons: false,
                min: minvoltage,
                max: maxvoltage,
                value: slideval,
                //mode: 'fixed',
                ticksFrequency: (maxvoltage - minvoltage) / 5,
                ticksPosition: 'bottom',
                showRange: true,
                height: "11px",
                width: '230px'
            });
            $('#adcSlider' + adcChannel).on('change', function (event) {mf.adcChangeEvent(event.args.value,node)})
            $('#adcWindow' + adcChannel).jqxWindow('focus');
        }
    });
    mf.adcChangeEvent(slideval, node);
    //this.adcChannels[adcChannel] = 0;
}



View.prototype.getRunDelay = function () {
    var val = $('#delaySlider').jqxSlider('value');
    val = 2000-val;
    //this.Message(val);
    if (val === 0)
        val = 1;
    return val;
}

View.prototype.DisplayCode = function () {
    codeEditor.setValue(myCodeMaker.code);
    codeEditor.gotoLine(1);
}

View.prototype.Message = function (msg,col) {
    var c = document.getElementById("messages");
    c.style.color = col;
    c.innerHTML = msg
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

function updateRegistersDisplay() {
    $("#regs-jqxgrid").jqxGrid('updatebounddata');
}
function updateMemoryDisplay() {
    $("#vars-jqxgrid").jqxGrid('updatebounddata');
}






/**************************************************************************/

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



/**************************************************************************/
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



//Regisers Grid events
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

/**************************************************************************/
//Vars grid

var vars =
{
    localdata: myMicrocontroller.getMemoryArr(),
    datatype: "array",
    datafields:
    [
        { name: 'scopename', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'valuehex', type: 'string' },
        { name: 'valuebin', type: 'string' },
        { name: 'valuedec', type: 'number' }
],
    sortcolumn: 'addrhex',
    sortdirection: 'desc'
};
var varsAdapter = new $.jqx.dataAdapter(vars);
$("#vars-jqxgrid").jqxGrid(
{
    width: 500,
    height: '100%',
    source: varsAdapter,
    columnsresize: true,
    sortable: true,
    columnsreorder: true,
    columns: [
        { text: 'Scope', datafield: 'scopename', width: 60 },
        { text: 'Type', datafield: 'type', width: 60 },
        { text: 'VarName', datafield: 'name', width: 70 },
        { text: 'Val', datafield: 'valuehex', width: 70 },
        { text: 'Val(bin)', datafield: 'valuebin', width: 95 },
        { text: 'Val(dec)', datafield: 'valuedec', width: 60 }
    ]
});



//Symbols
/*
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
*/