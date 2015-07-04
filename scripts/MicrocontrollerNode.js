"use strict";
var MicrocontrollerNode;

MicrocontrollerNode = function (micro) {
    this.microcontroller = micro;
    this.partnumber = micro.microPartnumber;
    this.microPackage = micro.microPackage;
    this.microWidth;
    this.microHeight;
    this.microAnchorPattern;
    this.bdnode;

    //new node

    this.bdnode = new MindFusion.Diagramming.ShapeNode(diagram);
    this.bdnode.setShape("Rectangle");
    this.bdnode.setImageLocation("images/_img_micro_" + this.microPackage + ".png");
    this.bdnode.setId("micro");
    this.bdnode.getImage(); //??
    this.bdnode.setImageAlign(ImageAlign.Stretch);
    this.getPackageDetails();
    this.bdnode.setBounds(new Rect(60, 40, this.microWidth, this.microHeight));
    this.bdnode.setAnchorPattern(this.microAnchorPattern);
    diagram.addItem(this.bdnode);
    this.olinks = this.bdnode.getOutgoingLinks();
    this.ilinks = this.bdnode.getIncomingLinks();

    if (this.microPackage === "xplained")
        this.newXplained();
    return this.bdnode;
}
MicrocontrollerNode.prototype.readBinaryInputs = function () {
    //read all input pins and return an arr of their states [{PORT,PIN,STATE}]
}
MicrocontrollerNode.prototype.readAnalogInputs = function () {
    //read all input pins and return an arr of their states [{PORT,PIN,VALUE}]
}
MicrocontrollerNode.prototype.getPackageDetails = function () {
    var length = packagesjson.packages.package.length; //number of diff micros
    this.microAnchorPattern = new AnchorPattern([]);
    for (var index = 0; index < length; index++) {
        if (this.microPackage === packagesjson.packages.package[index].packname) {
            this.microWidth = packagesjson.packages.package[index].nodewidth;
            this.microHeight = packagesjson.packages.package[index].nodeheight;
            var x, y, i, o, ms, col, pt, pin;
            //create anchor points
            for (var point = 0; point < packagesjson.packages.package[index].anchorpoint.length; point++) {
                pin = packagesjson.packages.package[index].anchorpoint[point].pin - 1;
                x = packagesjson.packages.package[index].anchorpoint[point].x;
                y = packagesjson.packages.package[index].anchorpoint[point].y;
                i = packagesjson.packages.package[index].anchorpoint[point].i;
                o = packagesjson.packages.package[index].anchorpoint[point].o;
                ms = "MarkStyle." + packagesjson.packages.package[index].anchorpoint[point].ms;
                col = packagesjson.packages.package[index].anchorpoint[point].col.toLowerCase();
                col = col.substr(0, col.length);
                pt = new AnchorPoint(x, y, i, o, 4, col, 2)//, ms, col, 2, microPins[pin][0]);
                pt.setTag(this.microcontroller.microPins[pin][0]);
                this.microAnchorPattern.points.push(pt);
            }
        }
    }

}

MicrocontrollerNode.prototype.newXplained = function() {
    //new LED
    var ledB5 = diagram.getFactory().createShapeNode(new Rect(140, 50, 20, 10));
    ledB5.setText("led_0");
    ledB5.setId("led") //same as in SysDes
    ledB5.setImageLocation("images/_img_output_led.png");
    ledB5.setShape("Rectangle");
    ledB5.setAllowOutgoingLinks(false);
    ledB5.setBrush("Red");
    ledB5.setTextAlignment(Alignment.Center);
    ledB5.setLineAlignment(Alignment.Far);

    var ap = createAnchorPoint(0, 50, true, false, MarkStyle.Rectangle, blue, 2, "led")
    var pat = new AnchorPattern([ap]);
    ledB5.setAnchorPattern(pat);

    var ledB5link = diagram.getFactory().createDiagramLink(this.bdnode, ledB5);
    ledB5link.setOriginAnchor(19);

    //new tactsw
    var swB7 = diagram.getFactory().createSvgNode(new Rect(100, 180, 20, 20));
    var svg = new SvgContent();
    svg.parse("images/_img_input_binary_tactswitch.svg");
    swB7.setContent(svg);
    swB7.setText("tactSw_"); //use 'text' from XML file
    swB7.setAllowIncomingLinks(false); //default for binaryinputs
    swB7.setId("tact_binary__"); //use 'type' in XML file
   // swB7.setImageLocation("images/_img_input_binary_tactswitch.svg"); //'use 'image' from XML file
    swB7.setShape("Rectangle");
    swB7.setTextAlignment(Alignment.Center); //center of line
    swB7.setLineAlignment(Alignment.Far); //bottom line

    var swB7link = diagram.getFactory().createDiagramLink(swB7, this.bdnode);
    swB7link.setDestinationAnchor(20);
    swB7link.route();

    //set sw0 bit7 high
    this.microcontroller.Registers.setBitValue("PINB", 7, 1); 
}
