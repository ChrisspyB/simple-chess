'use strict'

var allowBadHighlighting = false;
var move_highlighting = true;
var canvas = document.getElementById('canvasChess');
var ctx = canvas.getContext('2d'); 

var COLOR = {
	dark: 	{standard:'#5555aa',clicked:'#ffffaa',hovered:'#55aaaa'},
	light: 	{standard:'#aaaaff',clicked:'#ffffaa',hovered:'#aaffff'},
	white: 	'#ffffff',
	black: 	'#111111'
};
var PIECE = {
	pawn: 	0,
	king: 	1,
	queen: 	2,
	rook: 	3,
	bishop: 4,
	knight: 5
};
var DIRECTION = {
	none: 	0,
	hor: 	1,
	ver: 	2,
	eqdiag: 4, //Diagonal, where x = y
	opdiag: 8, //Diagonal, where x = -y
	knight: 16
};

var TEAM = {white:0, black:1, none:2};
var TURN = TEAM.white;

var SYMBOL = ['♟','♚','♛','♜','♝','♞'];

function knightMoveIndex(x,y){	var n = 0;
	// indicies are allocated in an anti-clockwise sense, starting with 1,2
	var n = undefined; 

	switch(x){
		case -2:
			if (y==1){ n = 7; }
			else if (y==-1){ n = 5; }
			break;
		case -1:
			if (y==2){ n = 6; }
			else if (y==-2){ n = 4; }
			break;
		case 1:
			if (y==2){ n = 0; }
			else if (y==-2){ n = 3; }
			break;
		case 2:
			if (y==1){ n = 1; }
			else if (y==-1){ n = 2; }
			break;
	}
	return n;
};


function GridVector(x,y){
	this.x = x;
	this.y = y;
};
GridVector.prototype.set = function(x,y){
	this.x = x;
	this.y = y;
};
GridVector.prototype.translate = function(dist,dir){
	if (dir == DIRECTION.hor){
		this.x += dist
	}
	else if (dir == DIRECTION.ver){
		this.y += dist
	}
	else if (dir == DIRECTION.eqdiag){
		this.x += dist;
		this.y += dist;
	}
	else if (dir == DIRECTION.opdiag){
		this.x += dist;
		this.y -= dist;
	}

	if (this.x < 0 ){ 	this.x = 0; } 
	else if (this.x>7){ this.x = 7; }
	if (this.y < 0 ){ 	this.y = 0; }
	else if (this.y>7){ this.y = 7;	}

	return;

};
GridVector.prototype.add = function(other) {
	this.x += other.x;
	this.y += other.y;
};
GridVector.prototype.mult = function(scaler) {
	this.x *= scaler;
	this.y *= scaler;
};
GridVector.prototype.copy = function() {
	return new GridVector(this.x,this.y);
};
GridVector.prototype.gridSeparation = function(other){
	// Returns number of squares between two GridVectors, and the relative direction
	// If separation is not vertical, horizontal or diagonal, returns undefined.
	var relX = other.x - this.x;
	var relY = other.y - this.y;
	if (relX == 0){
		return [relY, relY!=0 ? DIRECTION.ver: DIRECTION.none];
	}
	else if (relY == 0) {
		return [relX, DIRECTION.hor];
	}
	else if (relX == relY){
		return [relX, DIRECTION.eqdiag];
	}
	else if (relX == -relY){
		return [relX, DIRECTION.opdiag];
	}
	else if (Math.abs(relX) == 1 && Math.abs(relY) == 2 ||
			Math.abs(relY) == 1 && Math.abs(relX) == 2)
		return [knightMoveIndex(relX,relY),DIRECTION.knight];
	return [0,0]
};

GridVector.prototype.dirVector = function(dir) {
	var v = new GridVector(0,0);
	switch(dir){
		case DIRECTION.hor:
			v.x = 1;
			break;
		case DIRECTION.ver:
			v.y = 1;
			break;
		case DIRECTION.eqdiag:
			v.x = 1;
			v.y = 1;
			break;
		case DIRECTION.opdiag:
			v.x = 1;
			v.y = -1;
			break;
	}
	return v;
};

function Board(x,y, square_size){
	this.origin 	= {x:x,y:y}; // Position of top-left corner
	this.grid 		= []; // [r][c] = square at row r, column c. (top left = [0][0])
	this.clicked 	= [0,0]; 
	this.hovered 	= [0,0];
	this.sq_size 	= square_size;
	for (var r=0; r<8; r++){
		this.grid[r] = [];
		for(var c=0;c<8;c++){var dark = (r+c)%2 == 0 ? false : true;
			this.grid[r][c] = {r:r,c:c,dark:dark, piece:null, hovered:false, clicked:false};
		}
	}
};

Board.prototype.cartesianToGrid = function(x,y){
	var relX = x - this.origin.x;
	var relY = y - this.origin.y;
	var length = this.sq_size*8;
	if (relX>0 && relX<length && relY>0 && relY<length ) {
		return [Math.floor(relX/this.sq_size), Math.floor(relY/this.sq_size)];
	};

	return false
};
Board.prototype.gridToCartesian = function(grid_x,grid_y,returnCenter){
	// Returns the [x,y] of the top-left of a given square at grid_x,grid_y
	// If returnCenter === true, returns coordinates of center instead
	if (typeof returnCenter === 'undefined'){returnCenter = false; }

	var x  = this.origin.x + grid_x*this.sq_size;
	var y  = this.origin.y + grid_y*this.sq_size;

	if (returnCenter){
		x += this.sq_size/2;
		y += this.sq_size/2;
	}

	return {x:x,y:y};
};
Board.prototype.hoverSquare = function(mouse_x, mouse_y) {
	// highlight square...
	var coord = this.cartesianToGrid(mouse_x, mouse_y);
	var old_highlight;

	old_highlight = this.grid[this.hovered[0]][this.hovered[1]];
	
	if(!coord){
		old_highlight.hovered = false;
	}
	else{
		var new_highlight = this.grid[coord[0]][coord[1]];

		if (new_highlight!=old_highlight){

			old_highlight.hovered = false;
			new_highlight.hovered = true;
			this.hovered = [coord[0],coord[1]];

			this.drawSquare(new_highlight);
		}
	}

	this.drawSquare(old_highlight);
	return;
};
Board.prototype.clickSquare = function(mouse_x,mouse_y) {

	var coord = this.cartesianToGrid(mouse_x,mouse_y);
	var old_highlight = this.clicked.length===2 ? 
		this.grid[this.clicked[0]][this.clicked[1]] : false;

	if(coord){

		var new_highlight = this.grid[coord[0]][coord[1]];

		if (new_highlight.piece == null || new_highlight.piece.team != TURN ){
			if(old_highlight.piece != null){
				old_highlight.piece.attemptMove(coord[0],coord[1]);
			}

			return;
		}

		if (new_highlight!=old_highlight){
			new_highlight.clicked = true;
			this.clicked = [coord[0],coord[1]];
			this.drawSquare(new_highlight);
		}
		else{
			this.clicked=[];
		}
	}else{
		this.clicked = [];
	}

	if (old_highlight){
		old_highlight.clicked = false;		
		this.drawSquare(old_highlight);
	}

	return;
};
Board.prototype.deselect = function(){
	this.grid[this.clicked[0]][this.clicked[1]].clicked = false;
	this.clicked = [];
};

Board.prototype.drawSquare = function(sq){
	var colors = sq.dark ? COLOR.dark : COLOR.light;
	var x = this.origin.x+sq.r*this.sq_size;
	var y = this.origin.y+sq.c*this.sq_size;
	ctx.beginPath();
	ctx.rect(x,y,this.sq_size,this.sq_size);
	ctx.fillStyle = sq.clicked ? colors.clicked : sq.hovered ? colors.hovered : colors.standard;
	// Render piece here...
	ctx.fill();
	ctx.closePath();
	if(sq.piece != null){
		sq.piece.draw(x,y);
	}
};
Board.prototype.drawAll = function() {
	for (var i=0; i<8; i++){
		for(var j=0;j<8;j++){
			this.drawSquare(this.grid[i][j]);
		}
	}
};

function Piece(board, grid_x, grid_y, piece_index, team){
	this.board 		= board; // Board which this piece belongs to.
	this.gv 		= new GridVector(grid_x,grid_y);
	this.pos 		= board.gridToCartesian(grid_x,grid_y);
	this.type 		= piece_index;
	this.symbol 	= SYMBOL[piece_index];
	this.team		= team;
	this.directions = DIRECTION.none;
	this.genMoves	= false; // has this piece's moves been generated

	board.grid[grid_x][grid_y].piece = this;
};

Piece.prototype.move = function(grid_x, grid_y) {
	if(this instanceof Pawn){
		if (this.firstMove) {this.firstMove = false;}
	}
	this.board.deselect();

	this.board.grid[this.gv.x][this.gv.y].piece = null;
	this.board.drawSquare(this.board.grid[this.gv.x][this.gv.y])

	this.gv.set(grid_x,grid_y);
	
	this.board.grid[grid_x][grid_y].piece = this;
	this.board.drawSquare(this.board.grid[grid_x][grid_y]);
};
Piece.prototype.attemptMove = function(gx,gy) {
	var gv = new GridVector(gx,gy);
	if(this.canMoveTo(gv)){
		this.move(gx,gy);
	}


};
Piece.prototype.pathObstructed = function(dist,dir){
	if (dir == DIRECTION.knight) {
		return false;
	}

	var dir_v = GridVector.prototype.dirVector(dir);
	var sgn = dist>0 ? 1 : -1; 

	for (var i=1; i<=Math.abs(dist); i++){
		var gv = this.gv.copy();
		var di = dir_v.copy();
		di.mult( i * sgn );
		gv.add( di );

		if (this.board.grid[gv.x][gv.y].piece != null){
			if (this.board.grid[gv.x][gv.y].piece.team == this.team){
				return true;
			}
		}
	}
	return false;
};
Piece.prototype.canMoveTo = function(other) {
	if (this.board.grid[other.x][other.y].piece != null){
		if (this.board.grid[other.x][other.y].piece.team == this.team){
			return false;
		}
	}
	var gs = this.gv.gridSeparation(other);
	var dist = gs[0];
	var dir = gs[1];
	if (dir & this.directions && !this.pathObstructed(dist,dir)){

		return true;
	}

	return false;
};

Piece.prototype.draw = function(x,y) {
	ctx.font = '50px Arial';
	ctx.fillStyle =  this.team == TEAM.black ? COLOR.black : COLOR.white;
	ctx.fillText(this.symbol,x,y+45);
};

function Pawn(board, grid_x, grid_y, team){
	Piece.call(this, board, grid_x, grid_y, PIECE.pawn, team);
	this.firstMove = true;
}
Pawn.prototype = Object.create(Piece.prototype);
Pawn.prototype.constructor = Piece;
Pawn.prototype.pathObstructed = function(dist,dir){
	
	var dir_v = GridVector.prototype.dirVector(dir);
	var sgn = dist>0 ? 1 : -1; 

	for (var i=1; i<=Math.abs(dist); i++){
		var gv = this.gv.copy();
		var di = dir_v.copy();
		di.mult( i * sgn );
		gv.add( di );

		if (dir & (DIRECTION.eqdiag | DIRECTION.opdiag)){
			if (this.board.grid[gv.x][gv.y].piece != null){
				if(this.board.grid[gv.x][gv.y].piece.team != this.team){

					return false;
				}
			}
			return true;
		}
		else if (this.board.grid[gv.x][gv.y].piece != null) {
			return true
		}

	}
	return false;
};
Pawn.prototype.canMoveTo = function(other) {
	var gs = this.gv.gridSeparation(other);
	var dist = gs[0];
	var dir = gs[1];

	if (dir == DIRECTION.ver){
		if (((dist==-1 && this.team == TEAM.white) || 
			(dist== 1 && this.team == TEAM.black) || 
			(this.firstMove && (dist==-2 && this.team == TEAM.white) || 
			(dist== 2 && this.team == TEAM.black)) ) && 
			!this.pathObstructed(dist,dir) ){

				return true;
		}
	}
	else if (dir == DIRECTION.eqdiag){
		if (((dist==-1 && this.team == TEAM.white) || 
			(dist== 1 && this.team == TEAM.black)) && 
			!this.pathObstructed(dist,dir)){

				return true;
		}

	}
	else if (dir == DIRECTION.opdiag){
		if (((dist== 1 && this.team == TEAM.white) || 
			(dist==-1 && this.team == TEAM.black)) && 
			!this.pathObstructed(dist,dir)){

				return true;
		}
	}

	return false;
};

function King(board, grid_x, grid_y, team){
	Piece.call(this, board, grid_x, grid_y, PIECE.king, team);
	this.directions = DIRECTION.ver | DIRECTION.hor | 
		DIRECTION.opdiag | DIRECTION.eqdiag;
};
King.prototype = Object.create(Piece.prototype);
King.prototype.constructor = Piece;

King.prototype.canMoveTo = function(other) {
	var gs = this.gv.gridSeparation(other);
	var dist = gs[0];
	var dir = gs[1];

	if (dir & this.directions){

		if (Math.abs(dist)==1 && !this.pathObstructed(dist,dir)){

			return true;
		}
	}
	return false;
};
function Queen(board, grid_x, grid_y, team){
	Piece.call(this, board, grid_x, grid_y, PIECE.queen, team);
	this.directions = DIRECTION.ver | DIRECTION.hor | 
		DIRECTION.opdiag | DIRECTION.eqdiag;
};
Queen.prototype = Object.create(Piece.prototype);
Queen.prototype.constructor = Piece;

function Knight(board, grid_x, grid_y, team){
	Piece.call(this, board, grid_x, grid_y, PIECE.knight, team);
	this.directions = DIRECTION.knight
};
Knight.prototype = Object.create(Piece.prototype);
Knight.prototype.constructor = Piece;

function Bishop(board, grid_x, grid_y, team){
	Piece.call(this, board, grid_x, grid_y, PIECE.bishop, team);
	this.directions = DIRECTION.opdiag | DIRECTION.eqdiag;
};
Bishop.prototype = Object.create(Piece.prototype);
Bishop.prototype.constructor = Piece;

function Rook(board, grid_x, grid_y, team){
	Piece.call(this, board, grid_x, grid_y, PIECE.rook, team);
	this.directions = DIRECTION.ver | DIRECTION.hor;
};
Rook.prototype = Object.create(Piece.prototype);
Rook.prototype.constructor = Piece;


function initialSetup(some_params_here){
	var board  	= new Board(10,10,50);
	var p1		= new Pawn(board,4,4,TEAM.black);
	var r1		= new Rook(board,3,4,TEAM.black);
	var b1		= new Bishop(board,5,4,TEAM.black);
	var k1		= new King(board,6,4,TEAM.black);
	var n1		= new Knight(board,2,4,TEAM.black);
	var q1		= new Queen(board,1,4,TEAM.black);

	var p2		= new Pawn(board,4,6,TEAM.white);
	var r2		= new Rook(board,3,6,TEAM.white);
	var b2		= new Bishop(board,5,6,TEAM.white);
	var k2		= new King(board,6,6,TEAM.white);
	var n2		= new Knight(board,2,6,TEAM.white);
	var q2		= new Queen(board,1,6,TEAM.white);

	document.addEventListener('click',function(event){
		var rect = canvas.getBoundingClientRect();
		var mouse_x = event.clientX  - rect.left;
		var mouse_y = event.clientY - rect.top;
		board.clickSquare(mouse_x,mouse_y);
	});

	if (allowBadHighlighting){
		document.addEventListener('mousemove',function(event){
		var rect = canvas.getBoundingClientRect();
		var mouse_x = event.clientX  - rect.left;
		var mouse_y = event.clientY - rect.top;
		board.hoverSquare(mouse_x,mouse_y);
		});
	}

	board.drawAll();
};


initialSetup(42);