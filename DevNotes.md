Dev Notes
=========================

Goals
-------------------------

Hopes are to create a basic javascript chess interface which can do (some of) the following:

	. Determine which moves are legal
	. Allows games to finish and be restarted
	. Multiple boards? (why?)
	. User can increase canvas size.
	. Records and displays move history
	. Allows users to set up their own initial game layout
	. Allows reverting back to a point in the game history
	. Can read .pgn files and write .pgn files

This list will be updated as time goes on. 
The tasks which seem more ambitious are kept at the bottom and are much less likely to be completed


To-dos and notes to self
-------------------------

Draw function only needs to be called when the board changes:
	. A move is made
	. A square is highlighted

Look into using the built in mouse over element listeners for square highlighting instead of my home-made ones.

I dislike my method of mouseover-highlighting, it causes too much needless redrawing, disabling it for now.

Drawing pieces currently uses hardcoded numbers which is non-ideal.

A bit inconsistent in choice of function arguments: sometimes using (gvector) some times using (gx,gy) etc. Clean this up.

Doubt there'll be any issues, but be sure to check everything runs smoothly in different browsers.


Where to begin next time
-------------------------
