var View = function ()
{
    this.nodeContextMenu;
    //this.adcWindowsContainer;
    //this.adcChannels=[];
    return this;
}

View.prototype.InitDebug = function () {
    $("#codenode").jqxButton({ width: '50', height: '25', theme: theme });
    $('#codenode').bind('click', function (event) {
        View.showcodenode();
    });
    $("#readadc").jqxButton({ width: '50', height: '25', theme: theme });
    $('#readadc').bind('click', function (event) {
        myMicrocontroller.regChanged();
    });

}
View.prototype.showcodenode = function () {
    if (myMicrocontrollerNode.codeNode.getVisible())
        myMicrocontrollerNode.codeNode.setVisible(false);
    else
        myMicrocontrollerNode.codeNode.setVisible(true);
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
            { size: "300px" },
            { size: "85%", collapsible: false }]
    });
    $('#splitterSouthWest').jqxSplitter({
        width: '100%',
        orientation: 'horizontal',
        theme: theme,
        panels: [{ size: "100%", collapsible: false },
            { size: "0%" }]
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
        animationType: 'fade',
        //contentTransitionDuration: 1000
    });
    //$("#tabsSW").jqxTabs({
    //    height: '100%',
    //    width: '100%',
    //    animationType: 'fade',
    //    theme: theme,
    //    scrollable: true
    //});
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
        width: '120px'
    });
    $('#jqxSlider').on('change', function (event) {
        var value = event.args.value;
    });

    this.adcWindowContainer = $('#adcWindowContainer');

    this.nodeContextMenu = $("#node-jqxMenu").jqxMenu({ width: '100px', height: '140px', autoOpenPopup: false, mode: 'popup' });
    $('#node-jqxMenu').on('itemclick', function (event) {
        var choice = $(event.target).text()
        // get the clicked LI element.
        //var choice = event.args.innerText;
        switch (choice) {
            case "red":
                col = "#FF0000";
                break
            case "blue":
                col = "#0000FF";
                break
            case "yellow":
                col = "#FFFF00";
                break
            case "green":
                col = "#00FF00";
                break
            case "orange":
                col = "#FFA500";
                break

        }
        // currentNode.setBrush(col)
        currentNode.setTag(col)
    });


    /**************************************************************************/
    // buttons    //from www.gieson.com/Library/projects/utilities/opensave/
    opensave.make({
        kind: "open",
        label: "Open diagram",
        width: 105,
        height: 24,
        textColor: "#f4f4f4",
        textSize: 14,
        filename: "myproject.diag",
        swf: "scripts/opensave.swf",
        buttonDiv: "openDiagramButton",
        //dataID: 	"textFieldData"
        handler: (mf.openDiagramFromFile)
    });

    opensave.make({
        label: "Save diagram",
        width: 105,
        height: 24,
        textSize: 14,
        textColor: "#f7f7f7",
        swf: "scripts/opensave.swf",
        //filename: "myproject.json",
        buttonDiv: "saveDiagramButton",
        //dataID: "text"
        handler: (mf.saveDiagramFile)
    });

    opensave.make({
        label: "Save program.c",
        width: 105,
        height: 24,
        textSize: 14,
        textColor: "#f7f7f7",
        swf: "scripts/opensave.swf",
        //filename: "myproject.json",
        buttonDiv: "saveCCodeButton",
        //dataID: "text"
        handler: (mf.saveCCodeToFile)
    });


    //if (inIframe()) {//all works but autochange isnt working within coursebuilder
        //initially resize frame to match window
        //parentIframe = window.parent.document.getElementById('sysdes');
        resizeMe(parentIframe);
        //add listener to parent window for window resizing
        window.parent.addEventListener("resize",resizeMe) 
    //}
}
View.prototype.showAdcWindow = function (adcChannel, node) {
    //adcWindows are tagged to analog input channels, not to analog devices, not to pins
    //as channels do not always align with pins on a port (e.g. tiny45)
    //they are created when the adc device is first clicked
    //they are re-setup when reopened in case the device connected to that pin has changed
    //they also need to be hidden when the link has changed/been deleted
    var windows = $.data(document.body, 'jqxwindows-list');
    //details about the node
    var an;
    for (var i = 0; i < mf.anaInputDevices.length; i++) {
        if (node.getId() === mf.anaInputDevices[i].type) {
            an=i;
        }
    }
    var headtext = node.getText() + " ADC"+adcChannel+ " "
                + mf.anaInputDevices[an].sliderminvalue + "-" + mf.anaInputDevices[an].slidermaxvalue
                + mf.anaInputDevices[an].sense;
    //var slidemin = parseInt(mf.anaInputDevices[an].sliderminvalue,10);
    //var slidemax = parseInt(mf.anaInputDevices[an].slidermaxvalue,10);
    var slideval = parseFloat(mf.anaInputDevices[an].initialvoltage,10);
    var minvoltage = parseFloat(mf.anaInputDevices[an].minvoltage, 10);
    var maxvoltage = parseFloat(mf.anaInputDevices[an].maxvoltage, 10);

    //see if this window exists already
    var found = false;
    if (windows !== undefined) {
        for (var i = 0; i < windows.length; i++) {
            if (windows[i][0].id.indexOf(adcChannel) > -1) {
                found = true;
                $('#adcWindow' + adcChannel).jqxWindow('open');
            }
        }
    }
    if (!found) {
        //window for this adcchannel not found so create it
        $(document.body).append(
            '<div id="adcWindow' + adcChannel + '">'
            + '<div>'
                //+ '<div id="header">' + headtext + '</div>'
            + '</div>'
            + '<div id="adcSlider' + adcChannel + '">'
                + 'Channel ' + adcChannel
            + '</div>'
            + '</div>');
        //this.adcWindowsContainer = $('#adcWindowsContainer');
        //setup or re-setup the window and slider as per the device now connected to the pin
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
                    width: '225px'
                });
                $('#adcSlider' + adcChannel).on('change', function (event) {

                    myMicrocontroller.newAdcValue(event.args.value, adcChannel)
                    mf.displayAdcVoltage(event.args.value, adcChannel,maxvoltage)
                })
                $('#adcWindow' + adcChannel).jqxWindow('focus');
            }
        });
    }
    $('#adcWindow' + adcChannel).jqxWindow({
        title: headtext
    });
    $('#adcSlider' + adcChannel).jqxSlider({
        min: minvoltage,
        max: maxvoltage,
        value: slideval
    });
    myMicrocontroller.newAdcValue(slideval, adcChannel)
    mf.displayAdcVoltage(slideval, adcChannel)
    
}
View.prototype.closeAdcWindow = function (adcChannel) {
    try{
        $('#adcWindow' + adcChannel).jqxWindow('close');
    }
    catch (e) {
        var nowindow = e;
    }
}
View.prototype.getRunDelay = function () {
    var val = $('#delaySlider').jqxSlider('value');
    val = 2000-val;
    //this.Message(val);
    if (val === 0)
        val = 1;
    return val;
}
View.prototype.DisplayCode = function (code) {
    codeEditor.setValue(code);
    codeEditor.gotoLine(1);
}
View.prototype.Message = function (msg,col) {
    var c = document.getElementById("messages");
    c.style.color = col;
    c.innerHTML = msg
}

function updateRegistersDisplay() {
    $("#regs-jqxgrid").jqxGrid('updatebounddata');
}
function updateMemoryDisplay() {
    $("#vars-jqxgrid").jqxGrid('updatebounddata');
}

//get the size of the window holding the iframe that this is in
//stackoverflow.com/questions/325273/make-iframe-to-fit-100-of-containers-remaining-height
var parentIframe
var buffer = 10; //scroll bar buffer 10 seems to be enough

function pageY(elem) {
    return elem.offsetParent ? (elem.offsetTop + pageY(elem.offsetParent)) : elem.offsetTop;
}
function inIframe() {
    try {
        document.getElementById("msg").innerText = window.self !== window.top
        return window.self !== window.top;
    } catch (e) {
        document.getElementById("msg").innerText = "err:true"
        return true;
    }
}
function resizeMe() {



    if (inIframe()) {
        var height = $(window.top).height()-30
        var fr = window.parent.document.getElementById('sysdes')
        var doc = fr
        //height = doc.height;
        window.parent.document.getElementById('sysdes').height = height
        document.getElementById("file").innerText = "win-inframeheight-10:" + height //+ " sysdesheight:" +window.parent.document.getElementById('sysdes').height
    } else {//when not in a frame why is the document resizing already?
    var height = window.innerHeight - 30;
    document.getElementById("file").innerText = "win-innerheight-10:" + height //+ " sysdesheight:" +window.parent.document.getElementById('sysdes').height
    }
    //var height = window.parent.document.documentElement.clientHeight;
    //height -= pageY(window.parent.document.getElementById('sysdes')) + buffer;
   // height = (height < 0) ? 0 : height;
    //window.parent.document.getElementById('sysdes').style.height = height + 'px'
    //iframe.style.height = height + 'px';
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



//Registers Grid events
$('#regs-jqxgrid').on('bindingcomplete', function (event) {
    var args = event.args;
    //tell th emicro thatsomething has changed
    myMicrocontroller.regChanged();
    //var regs = myMicrocontroller.Registers.registers
    //for (var i = 0; i < regs.length; i++) {

    //}
    ////update the outputs on the diagram with any PORT changes
    //var ports = myMicrocontroller.Ports;
    //for (var i = 0; i < ports.length; i++) //check if a port has changed
    //{
    //    var j = ports[i].index;
    //    var newval = regs[j].valuedec;
    //    var oldval = ports[i].value;
    //    var change = newval ^ oldval;
    //    if (regs[j].valuedec ^ ports[i].value > 0) { //see if any bit has changed
    //        ports[i].value = newval;//store the new val for next time around
    //        //for each bit that has changed
    //        for (var k = 0; k < 8; k++) {
    //            //var c = change & 1 << k;
    //            if ((change & 1 << k) > 0) {
    //                var newbitval = (newval & 1 << k) >> k;
    //                var portname = regs[j].name;
    //                mf.updateOutput(portname, k, newbitval) //?? only id DDRX.Y is 1 (output)
    //            }
    //        }
    //    }
    //}
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