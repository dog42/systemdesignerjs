"use strict";
var MicrocontrollerNode;

MicrocontrollerNode = function (micro) {
    this.microcontroller = micro;
    this.partnumber = micro.microPartnumber;
    this.microPackage = micro.microPackage;
    this.microWidth;
    this.microHeight;
    this.microAnchorPattern;

    this.Node = new MindFusion.Diagramming.ShapeNode(diagram);
    this.Node.setShape("Rectangle");
    this.Node.setImageLocation("images/_img_micro_" + this.microPackage + ".png");
    this.Node.setId("micro");
    this.Node.getImage(); //??
    this.Node.setImageAlign(ImageAlign.Stretch);
    this.getPackageDetails();
    this.Node.setBounds(new Rect(60, 40, this.microWidth, this.microHeight));
    this.Node.setAnchorPattern(this.microAnchorPattern);
    diagram.addItem(this.Node);

    this.olinks = this.Node.getOutgoingLinks();
    this.ilinks = this.Node.getIncomingLinks();

    if (this.microPackage === "xplained")
        this.newXplained();
    //return this.Node;
}
MicrocontrollerNode.prototype.readBinaryInputs = function () {
    //read all input pins and return an arr of their states [{PORT,PIN,STATE}]
}
MicrocontrollerNode.prototype.readAnalogInputs = function () {
    //read all input pins and return an arr of their states [{PORT,PIN,VALUE}]
}
MicrocontrollerNode.prototype.getPackageDetails = function () {
    var length = mf.packages.length; //number of diff micros
    this.microAnchorPattern = new AnchorPattern([]);
    for (var index = 0; index < length; index++) {
        if (this.microPackage === mf.packages[index].packname) {
            this.microWidth = mf.packages[index].nodewidth;
            this.microHeight = mf.packages[index].nodeheight;
            var x, y, i, o, ms, col, pt, pin;
            //create anchor points
            for (var point = 0; point < mf.packages[index].anchorpoint.length; point++) {
                pin = mf.packages[index].anchorpoint[point].pin - 1;
                x = mf.packages[index].anchorpoint[point].x;
                y = mf.packages[index].anchorpoint[point].y;
                i = mf.packages[index].anchorpoint[point].i;
                o = mf.packages[index].anchorpoint[point].o;
                ms = "MarkStyle." + mf.packages[index].anchorpoint[point].ms;
                col = mf.packages[index].anchorpoint[point].col.toLowerCase();
                col = col.substr(0, col.length);
                pt = new AnchorPoint(x, y, i, o, 4, col, 2)//, ms, col, 2, microPins[pin][0]);
                pt.setTag(this.microcontroller.microPins[pin][0]);
                this.microAnchorPattern.points.push(pt);
            }
        }
    }

}
MicrocontrollerNode.prototype.getMicroAnchorTag = function (link) {
    //returns e.g. C.3, no matter whether incoming or outgoing link
    if (this.Node === null)
        return;
    var apt;
    if (link.getDestination().getId() === "micro") {
        apt = link.getDestinationAnchor();
    }
    if (link.getOrigin().getId() === "micro") //from micro
    {
        apt = link.getOriginAnchor();
    }
    var pts = this.Node.getAnchorPattern().getPoints();
    var c = pts[apt].getTag();
    return c;
}
MicrocontrollerNode.prototype.makeLinkTag = function (link) {
    link.setTag(this.getMicroAnchorTag(link));
}
MicrocontrollerNode.prototype.newXplained = function () {
    //new LED
    var ledB5 = mf.makeLED(140, 50)
    ledB5.setText("led_B5");

    var ledB5link = diagram.getFactory().createDiagramLink(this.Node, ledB5);
    ledB5link.setOriginAnchor(19);
    ledB5link.route();
    this.makeLinkTag(ledB5link);
    //new tactsw
    var swB7 = diagram.getFactory().createSvgNode(new Rect(100, 180, 20, 20));
    var svg = new SvgContent();
    svg.parse("images/_img_input_binary_tactswitch.svg");
    swB7.setContent(svg);
    swB7.setText("tactSw_B7"); //use 'text' from XML file
    swB7.setAllowIncomingLinks(false); //default for binaryinputs
    swB7.setId("tact_binary__"); //use 'type' in XML file
   // swB7.setImageLocation("images/_img_input_binary_tactswitch.svg"); //'use 'image' from XML file
    swB7.setShape("Rectangle");
    swB7.setTextAlignment(Alignment.Center); //center of line
    swB7.setLineAlignment(Alignment.Far); //bottom line

    var swB7link = diagram.getFactory().createDiagramLink(swB7, this.Node);
    swB7link.setDestinationAnchor(20);
    swB7link.setStrokeThickness(2);
    swB7link.setStroke(red)
    swB7link.route();
    this.makeLinkTag(swB7link);
    swB7link.setText("1")
    //set sw0 bit7 high
    this.microcontroller.Registers.writeRegBit("PINB", 7, 1); 
}
