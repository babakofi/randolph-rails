/*
    Copyright 2008,2009
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Alfred Wassermann,
        Peter Wilfahrt

    This file is part of JSXGraph.

    JSXGraph is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JSXGraph is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with JSXGraph.  If not, see <http://www.gnu.org/licenses/>.
*/

/** 
 * @fileoverview In this file the geometry object Arc is defined. Arc stores all
 * style and functional properties that are required to draw an arc on a board.
 * @author graphjs
 * @version 0.1
 */
 
/**
 * Creates a new instance of Arc.
 * @class Arc stores all style and functional properties that are required
 * to draw an arc on a board.
 * @param {JXG.Board} board Reference to the board the arc is drawn on.
 * @param {JXG.Point} p1 Midpoint of the arc.
 * @param {JXG.Point} p2 Point defining the arcs radius
 * @param {JXG.Point} p3 This point defines the angle of the arcs section.
 * @param {String} id Unique identifier for this object.  If null or an empty string is given,
 * an unique id will be generated by Board
 * @param {String} name Not necessarily unique name, displayed on the board.  If null or an
 * empty string is given, an unique name will be generated.
 * @see JXG.Board#addArc
 * @constructor
 * @extends JXG.GeometryElement
 */
JXG.Arc = function (board, p1, p2, p3, id, name, withLabel, layer) {
    /* Call the constructor of GeometryElement */
    this.constructor();
    
    /**
     * Type of GeometryElement, value is OBJECT_TYPE_ARC.
     * @final
     * @type int
     */
    this.type = JXG.OBJECT_TYPE_ARC;
    
    /**
     * Class of the element, value is OBJECT_CLASS_CIRCLE.
     * @final
     * @type int
     */
    this.elementClass = JXG.OBJECT_CLASS_CIRCLE;

    /* Call init defined in GeometryElement to set board, id and name property */
    this.init(board, id, name);
    
    /**
     * Set the display layer.
     */
    if (layer == null) layer = board.options.layer['arc'];
    this.layer = layer;

    /**
     * Midpoint of the arc.
     * @type JXG.Point
     */
    this.midpoint = JXG.getReference(this.board, p1);
    /**
     * Point defining the arcs circle.
     * @type JXG.Point
     */
    this.point2 = JXG.getReference(this.board, p2);
    /**
     * The point defining the angle of the arc.
     * @type JXG.Point
     */
    this.point3 = JXG.getReference(this.board, p3);
    
    /**
     * This is just for the hasPoint() method. Precision for highlighting.
     * @type int
     */
    //this.r = this.board.options.precision.hasPoint;

    this.visProp['visible'] = true;
    
    this.visProp['firstArrow'] = this.board.options.arc.firstArrow;
    this.visProp['lastArrow'] = this.board.options.arc.lastArrow;
    
    this.visProp['fillColor'] = this.board.options.arc.fillColor;
    this.visProp['highlightFillColor'] = this.board.options.arc.highlightFillColor;
    this.visProp['strokeColor'] = this.board.options.arc.strokeColor;
    this.visProp['highlightStrokeColor'] = this.board.options.arc.highlightStrokeColor;     

    // create Label
    this.createLabel(withLabel,[0,0]);
    
    /* Register arc at board. */
    this.id = this.board.addArc(this);
    
    /* Add arc as child to defining points */
    this.midpoint.addChild(this);
    this.point2.addChild(this);
    this.point3.addChild(this);
};

JXG.Arc.prototype = new JXG.GeometryElement;

/**
 * Checks whether (x,y) is near the arc.
 * @param {int} x Coordinate in x direction, screen coordinates.
 * @param {int} y Coordinate in y direction, screen coordinates.
 * @return {bool} True if (x,y) is near the arc, False otherwise.
 */
JXG.Arc.prototype.hasPoint = function (x, y) { 
    var genauigkeit = this.board.options.precision.hasPoint/(this.board.stretchX);
    
    var checkPoint = new JXG.Coords(JXG.COORDS_BY_SCREEN, [x,y], this.board);
    var r = this.Radius();
    
    var dist = Math.sqrt(Math.pow(this.midpoint.coords.usrCoords[1]-checkPoint.usrCoords[1],2) + 
                         Math.pow(this.midpoint.coords.usrCoords[2]-checkPoint.usrCoords[2],2));
   
    var has = (Math.abs(dist-r) < genauigkeit);
    if(has) {
        var p = {};
        p.coords = new JXG.Coords(JXG.COORDS_BY_USER, 
                              [this.midpoint.coords.usrCoords[1], 
                               this.board.origin.usrCoords[2]/(this.board.stretchY)],
                              this.board);
        var angle1 = this.board.algebra.trueAngle(this.point2, this.midpoint, p);
        var angle2 = this.board.algebra.trueAngle(this.point3, this.midpoint, p);

        var xy = {};
        xy.coords = checkPoint;
        var angle3 = this.board.algebra.trueAngle(xy, this.midpoint, p); 
        if(angle1 >= angle2) {
            if(angle1 < angle3 || angle3 < angle2) {
                has = false;
            }
        }
        else {
            if(angle3 > angle1) {
                if(angle3 < angle2) {
                    has = false;
                }
            }
        }
    }
    return has;    
};

/**
 * Checks whether (x,y) is within the sector defined by the arc.
 * @param {int} x Coordinate in x direction, screen coordinates.
 * @param {int} y Coordinate in y direction, screen coordinates.
 * @return {bool} True if (x,y) is within the sector defined by the arc, False otherwise.
 */
JXG.Arc.prototype.hasPointSector = function (x, y) { 
    var genauigkeit = this.board.options.precision.hasPoint/(this.board.stretchX);
    
    var checkPoint = new JXG.Coords(JXG.COORDS_BY_SCREEN, [x,y], this.board);
    var r = this.Radius();
    
    var dist = Math.sqrt(Math.pow(this.midpoint.coords.usrCoords[1]-checkPoint.usrCoords[1],2) + 
                         Math.pow(this.midpoint.coords.usrCoords[2]-checkPoint.usrCoords[2],2));
   
    var has = (dist < r);
    if(has) {
        var p = {};
        p.coords = new JXG.Coords(JXG.COORDS_BY_USER, 
                              [this.midpoint.coords.usrCoords[1], 
                               this.board.origin.usrCoords[2]/(this.board.stretchY)],
                              this.board);
        var angle1 = this.board.algebra.trueAngle(this.point2, this.midpoint, p);
        var angle2 = this.board.algebra.trueAngle(this.point3, this.midpoint, p);

        var xy = {};
        xy.coords = checkPoint;
        var angle3 = this.board.algebra.trueAngle(xy, this.midpoint, p); 
        if(angle1 >= angle2) {
            if(angle1 < angle3 || angle3 < angle2) {
                has = false;
            }
        }
        else {
            if(angle3 > angle1) {
                if(angle3 < angle2) {
                    has = false;
                }
            }
        }
    }
    return has;    
};

/**
 * Calculates the arcs radius.
 * @type float
 * @return The arcs radius
 */
JXG.Arc.prototype.Radius = function() {
    return(Math.sqrt(Math.pow(this.midpoint.coords.usrCoords[1]-this.point2.coords.usrCoords[1],2) + Math.pow(this.midpoint.coords.usrCoords[2]-this.point2.coords.usrCoords[2],2)));
};

/**
  * @deprecated
  */
JXG.Arc.prototype.getRadius = function() {
    this.Radius();
};

/**
 * return TextAnchor
 */
JXG.Arc.prototype.getTextAnchor = function() {
    return this.midpoint.coords;
};

/**
 * return LabelAnchor
 */
JXG.Arc.prototype.getLabelAnchor = function() {
    var angle = this.board.algebra.trueAngle(this.point2, this.midpoint, this.point3);
    var dx = 10/(this.board.stretchX);
    var dy = 10/(this.board.stretchY);
    
    var bxminusax = this.point2.coords.usrCoords[1] - this.midpoint.coords.usrCoords[1];
    var byminusay = this.point2.coords.usrCoords[2] - this.midpoint.coords.usrCoords[2];

    if(this.label.content != null) {                          
        this.label.content.relativeCoords = new JXG.Coords(JXG.COORDS_BY_USER, [0/(this.board.stretchX),0/(this.board.stretchY)],this.board);                      
    }  

    var coords = new JXG.Coords(JXG.COORDS_BY_USER, 
                          [this.midpoint.coords.usrCoords[1]+ Math.cos(angle*Math.PI/(2*180))*bxminusax - Math.sin(angle*Math.PI/(2*180))*byminusay, 
                           this.midpoint.coords.usrCoords[2]+ Math.sin(angle*Math.PI/(2*180))*bxminusax + Math.cos(angle*Math.PI/(2*180))*byminusay], 
                          this.board);

    var vecx = coords.usrCoords[1] - this.midpoint.coords.usrCoords[1];
    var vecy = coords.usrCoords[2] - this.midpoint.coords.usrCoords[2];
    
    var length = Math.sqrt(vecx*vecx+vecy*vecy);
    vecx = vecx*(length+dx)/length;
    vecy = vecy*(length+dy)/length;

    var coords2 = new JXG.Coords(JXG.COORDS_BY_USER, [this.midpoint.coords.usrCoords[1]+vecx,this.midpoint.coords.usrCoords[2]+vecy],this.board);
    
    return coords2;
};

/**
 * Uses the boards renderer to update the arc.
 * update() is not needed for arc.
 */
JXG.Arc.prototype.updateRenderer = function () {
    if (this.needsUpdate) { 
        this.board.renderer.updateArc(this);
        this.needsUpdate = false;
    }
    
    /* Update the label if visible. */
    if(this.hasLabel && this.label.content.visProp['visible'] && this.isReal) {
        //this.label.setCoordinates(this.coords);
        this.label.content.update();
        //this.board.renderer.updateLabel(this.label);
        this.board.renderer.updateText(this.label.content);
    }      
};

/**
 * Determines whether the arc has arrows at start or end of the arc.
 * @param {bool} firstArrow True if there is an arrow at the start of the arc, false otherwise.
 * @param {bool} lastArrow True if there is an arrow at the end of the arc, false otherwise.
 * Is stored at visProp['firstArrow'] and visProp['lastArrow']
 */
JXG.Arc.prototype.setArrow = function (firstArrow, lastArrow) {
    this.visProp['firstArrow'] = firstArrow;
    this.visProp['lastArrow'] = lastArrow;
     
    this.board.renderer.updateArc(this);
    
    if(this.hasLabel && this.label.content.visProp['visible']) {
        //this.label.setCoordinates(this.coords);
        this.label.content.update();
        //this.board.renderer.updateLabel(this.label);
        this.board.renderer.updateText(this.label.content);
    }     
};

/**
 * Creates a new arc.
 * @param {JXG.Board} board The board the arc is put on.
 * @param {Array} parents Array of three points defining the arc.
 * @param {Object} attributs Object containing properties for the element such as stroke-color and visibility. See @see JXG.GeometryElement#setProperty
 * @type JXG.Arc
 * @return Reference to the created arc object.
 */
JXG.createArc = function(board, parents, attributes) {
    var el;
    
    if (typeof attributes['withLabel'] == 'undefined') {
        attributes['withLabel'] = false;
    }    
    if (typeof attributes['layer'] == 'undefined') {
        attributes['layer'] = null;
    }
    // Alles 3 Punkte?
    if ( (JXG.isPoint(parents[0])) && (JXG.isPoint(parents[1])) && (JXG.isPoint(parents[2]))) {
        el = new JXG.Arc(board, parents[0], parents[1], parents[2], attributes['id'], attributes['name'],attributes['withLabel'],attributes['layer']);
    } // Ansonsten eine fette Exception um die Ohren hauen
    else
        throw new Error("JSXGraph: Can't create Arc with parent types '" + (typeof parents[0]) + "' and '" + (typeof parents[1]) + "' and '" + (typeof parents[2]) + "'.");

    return el;
};

JXG.JSXGraph.registerElement('arc', JXG.createArc);

/**
 * Creates a new semicircle. The semicircle is drawn clock-wise between the first and the second defining point.
 * @param {JXG.Board} board The board the semicircle is put on.
 * @param {Array} parents Array of two opposite points defining the semicircle.
 * @param {Object} attributs Object containing properties for the element such as stroke-color and visibility. See @see JXG.GeometryElement#setProperty
 * @type JXG.Arc
 * @return Reference to the created arc object.
 */
JXG.createSemicircle = function(board, parents, attributes) {
    var el, mp, idmp;
    
    if (typeof attributes['withLabel'] == 'undefined') {
        attributes['withLabel'] = false;
    }    
    if (typeof attributes['layer'] == 'undefined') {
        attributes['layer'] = null;
    }
    if(attributes['id'] != null) {
        idmp = attributes['id']+'_mp';
    }
    // Alles 2 Punkte?
    if ( (JXG.isPoint(parents[0])) && (JXG.isPoint(parents[1])) ) {
        mp = board.createElement('midpoint', [parents[0], parents[1]], {id:idmp, withLabel:false, visible:false});
        el = new JXG.Arc(board, mp, parents[1], parents[0], attributes['id'], attributes['name'],attributes['withLabel'],attributes['layer']);
    } // Ansonsten eine fette Exception um die Ohren hauen
    else
        throw new Error("JSXGraph: Can't create Semicircle with parent types '" + (typeof parents[0]) + "' and '" + (typeof parents[1]) + "'.");

    return el;
};

JXG.JSXGraph.registerElement('semicircle', JXG.createSemicircle);

/**
 * Creates a new circumcircle arc through three defining points.
 * @param {JXG.Board} board The board the arc is put on.
 * @param {Array} parents Array of three points defining the circumcircle arc.
 * @param {Object} attributs Object containing properties for the element such as stroke-color and visibility. See @see JXG.GeometryElement#setProperty
 * @type JXG.Arc
 * @return Reference to the created arc object.
 */
JXG.createCircumcircleArc = function(board, parents, attributes) {
    var el, mp, idmp, det;
    
    if (typeof attributes['withLabel'] == 'undefined') {
        attributes['withLabel'] = false;
    }    
    if (typeof attributes['layer'] == 'undefined') {
        attributes['layer'] = null;
    }
    if(attributes['id'] != null) {
        idmp = attributes['id']+'_mp';
    }
    
    // Alles 3 Punkte?
    if ( (JXG.isPoint(parents[0])) && (JXG.isPoint(parents[1])) && (JXG.isPoint(parents[2]))) {
        mp = board.createElement('circumcirclemidpoint',[parents[0], parents[1], parents[2]], {id:idmp, withLabel:false, visible:false});
        det = (parents[0].coords.usrCoords[1]-parents[2].coords.usrCoords[1])*(parents[0].coords.usrCoords[2]-parents[1].coords.usrCoords[2]) -
              (parents[0].coords.usrCoords[2]-parents[2].coords.usrCoords[2])*(parents[0].coords.usrCoords[1]-parents[1].coords.usrCoords[1]);
        if(det < 0) {
            el = new JXG.Arc(board, mp, parents[0], parents[2], attributes['id'], attributes['name'],attributes['withLabel'],attributes['layer']);
        }
        else {
            el = new JXG.Arc(board, mp, parents[2], parents[0], attributes['id'], attributes['name'],attributes['withLabel'],attributes['layer']);         
        }
        
        el.update = function() {
            var determinante;
            if(this.traced) {
                this.cloneToBackground(true);
            }
            determinante = (parents[0].coords.usrCoords[1]-parents[2].coords.usrCoords[1])*(parents[0].coords.usrCoords[2]-parents[1].coords.usrCoords[2]) -
                           (parents[0].coords.usrCoords[2]-parents[2].coords.usrCoords[2])*(parents[0].coords.usrCoords[1]-parents[1].coords.usrCoords[1]);
            if(determinante < 0) {
                this.point2 = parents[0];
                this.point3 = parents[2];
            }
            else {
                this.point2 = parents[2];
                this.point3 = parents[0];
            }
        };
    } // Ansonsten eine fette Exception um die Ohren hauen
    else
        throw new Error("JSXGraph: create Circumcircle Arc with parent types '" + (typeof parents[0]) + "' and '" + (typeof parents[1]) + "' and '" + (typeof parents[2]) + "'.");


    return el;
};

JXG.JSXGraph.registerElement('circumcirclearc', JXG.createCircumcircleArc);
