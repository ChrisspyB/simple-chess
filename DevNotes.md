Dev Notes
====================

Goals
---------------------


Hopes are to create a basic javascript chess interface which can do (some of) the following:

	. Determine which moves are legal
	. Allows games to finish and be restarted
	. User can increase canvas size.
	. Records and displays move history
	. Allows users to set up their own initial game layout
	. Allows reverting back to a point in the game history
	. Can read .pgn files and write .pgn files

This list will be updated as time goes on. 
The tasks which seem more ambitious are kept at the bottom and are much less likely to be completed


To-dos and notes to self
---------------------

Draw function only needs to be called when the board changes:
	. A move is made
	. A square is highlighted

Look into using the built in mouse over element listeners for square highlighting instead of my home-made ones.