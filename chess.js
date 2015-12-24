var canvas = document.getElementById('canvasChess');
var ctx = canvas.getContext('2d'); 

var COLOR = {
	dark:{standard:'#5555aa',clicked:'#aaaaaa',hovered:'#55aaaa'},
	light:{standard:'#aaaaff',clicked:'#ffffff',hovered:'#aaffff'}
};

var SQUARE_SIZE = 50;
var MOUSE_X = 0; // pos on canvas axes.
var MOUSE_Y = 0;
var board = new Board(10,10);

document.addEventListener('mousemove',mouseMoveHandler,false);
document.addEventListener('click',mouseClickHandler,false);

function Board(x,y){
	this.origin = {x:x,y:y}; //Where to place the top left of the board.
	this.grid = []; // [r][c] = square at row r, column c. (top left = [0][0])
	this.clicked = [0,0]; //indices of the last clicked grid piece.
	this.hovered = [0,0];
	for (var r=0; r<8; r++){
		this.grid[r] = [];
		for(var c=0;c<8;c++){
			var dark = (r+c)%2 == 0 ? false : true; 
			this.grid[r][c] = {r:r,c:c,dark:dark, piece:0, hovered:false, clicked:false};
		}
	}
};

Board.prototype.cartesianToGrid = function(x,y){
	var relX = x - this.origin.x;
	var relY = y - this.origin.y;
	var length = SQUARE_SIZE*8;
	if (relX>0 && relX<length && relY>0 && relY<length ) {
		return [Math.floor(relX/SQUARE_SIZE), Math.floor(relY/SQUARE_SIZE)];
	};

	return false
};
Board.prototype.highlightSquare = function(click) {
	// highlight square...
	coord = this.cartesianToGrid(MOUSE_X,MOUSE_Y);
	if (click){
		old_highlight = this.grid[this.clicked[0]][this.clicked[1]];
	}else{
		old_highlight = this.grid[this.hovered[0]][this.hovered[1]];
	}
	if(!coord){
		if (click){
			old_highlight.clicked = false;
		}else{
			old_highlight.hovered = false;
		}
	}
	else{
		new_highlight = this.grid[coord[0]][coord[1]];
		if (new_highlight!=old_highlight){

			if (click){
				old_highlight.clicked = false;
				new_highlight.clicked = true;
				this.clicked = [coord[0],coord[1]];
			}
			else{
				old_highlight.hovered = false;
				new_highlight.hovered = true;
				this.hovered = [coord[0],coord[1]];
			}

			this.drawSquare(new_highlight);
		}
	}

	this.drawSquare(old_highlight);
	return;
};

Board.prototype.drawSquare = function(sq){
	var colors = sq.dark ? COLOR.dark : COLOR.light;  
	ctx.beginPath();
	ctx.rect(this.origin.x+sq.r*SQUARE_SIZE,this.origin.y+sq.c*SQUARE_SIZE,SQUARE_SIZE,SQUARE_SIZE);
	ctx.fillStyle = sq.clicked ? colors.clicked : sq.hovered ? colors.hovered : colors.standard;
	// Render piece here...
	ctx.fill();
	ctx.closePath();
};
Board.prototype.drawAll = function() {
	for (var i=0; i<8; i++){
		for(var j=0;j<8;j++){
			this.drawSquare(this.grid[i][j]);
		}
	}
};

function mouseMoveHandler(e){
	var rect = canvas.getBoundingClientRect();
	MOUSE_X = e.clientX  - rect.left;
	MOUSE_Y = e.clientY - rect.top;
	board.highlightSquare(false);
};

function mouseClickHandler(e){
	board.highlightSquare(true);
};

function draw() {
	ctx.clearRect(0,0,canvas.width,canvas.height);
	board.drawAll();
};

draw();

