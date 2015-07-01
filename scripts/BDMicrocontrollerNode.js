var BDMicrocontrollerNode;

BDMicrocontrollerNode = function () {
    this.partnumber = partnumber;
    this.bdnode;
    this.micropackage;
    this.microWidth = 55;
    this.microHeight = 115;
    this.microAnchorPattern;

    var deleteMicro = true;
    if (diagram.bdMicro != null)
        deleteMicro = confirm("This will clear the whole diagram  \r\n      and restart it with a new microcontroller");
    if (deleteMicro === false) {
        return;
    }
    //new node
    diagram.clearAll();
    this.bdnode = new MindFusion.Diagramming.ShapeNode(diagram);
    this.bdnode.setShape("Rectangle");
    this.bdnode.setImageLocation("images/_img_" + microPackage + ".png");
    this.bdnode.setId("micro");
    this.bdnode.setBounds(new Rect(60, 40, microWidth, microHeight));
    this.bdnode.getImage(); //??
    this.bdnode.setImageAlign(ImageAlign.Stretch);
    this.bdnode.setAnchorPattern(microAnchorPattern);
    diagram.addItem(bdnode);
    this.olinks = bdnode.getOutgoingLinks();
    this.ilinks = bdnode.getIncomingLinks();
    if (microPackage === "xplained")
        this.newXplained();
    return bdMicro;

    function makeAnchorPattern() {
        var length = packagesjson.packages.package.length; //number of diff micros
        this.microAnchorPattern = new AnchorPattern([]);
        for (index = 0; index < length; index++) {
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
                    pt.setTag(this.microPins[pin][0]);
                    this.microAnchorPattern.points.push(pt);
                }
            }
        }

    }
}
function newXplained() {
    //new LED
    var ledB5 = diagram.getFactory().createShapeNode(new Rect(140, 50, 20, 10));
    ledB5.setText("led_");
    ledB5.setId("led") //same as in SysDes
    ledB5.setImageLocation("images/_img_led.png");
    ledB5.setShape("Rectangle");
    ledB5.setAllowOutgoingLinks(false);
    ledB5.setBrush("Red");
    ledB5.setTextAlignment(Alignment.Center);
    ledB5.setLineAlignment(Alignment.Far);

    var ap = createAnchorPoint(0, 50, true, false, MarkStyle.Rectangle, blue, 2, "led")
    var pat = new AnchorPattern([ap]);
    ledB5.setAnchorPattern(pat);

    var ledB5link = diagram.getFactory().createDiagramLink(bdMicro, ledB5);
    ledB5link.setOriginAnchor(19);

    //new tactsw
    var swB7 = diagram.getFactory().createShapeNode(new Rect(100, 180, 20, 20));
    swB7.setText("tactSw_"); //use 'text' from XML file
    swB7.setAllowIncomingLinks(false); //default for binaryinputs
    swB7.setId("tact_switch__"); //use 'type' in XML file
    swB7.setImageLocation("images/_img_tact.png"); //'use 'image' from XML file
    swB7.setShape("Rectangle");
    swB7.setTextAlignment(Alignment.Center); //center of line
    swB7.setLineAlignment(Alignment.Far); //bottom line

    var swB7link = diagram.getFactory().createDiagramLink(swB7, bdMicro);
    swB7link.setDestinationAnchor(20);
    swB7link.route();
}
