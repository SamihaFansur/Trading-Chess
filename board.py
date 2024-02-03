from piece import Bishop
from piece import King
from piece import Rook
from piece import Pawn
from piece import Queen
from piece import Knight
import time
import pygame


class Board:
    rect = (113, 113, 525, 525)
    startX = rect[0]
    startY = rect[1]
    def __init__(self, rows, cols):
        self.rows = rows
        self.cols = cols

        self.ready = False

        self.last = None

        self.copy = True
        self.init_piece_values()  # Initialize piece values



        self.board = [[0 for x in range(8)] for _ in range(rows)]


        # Black pieces
        self.board[0][0] = Rook(0, 0, "b", self.piece_values.get("b_rook", 0))
        self.board[0][1] = Knight(0, 1, "b", self.piece_values.get("b_knight", 0))
        self.board[0][2] = Bishop(0, 2, "b", self.piece_values.get("b_bishop", 0))
        self.board[0][3] = Queen(0, 3, "b", self.piece_values.get("b_queen", 0))
        self.board[0][4] = King(0, 4, "b", self.piece_values.get("b_king", 0))
        self.board[0][5] = Bishop(0, 5, "b", self.piece_values.get("b_bishop", 0))
        self.board[0][6] = Knight(0, 6, "b", self.piece_values.get("b_knight", 0))
        self.board[0][7] = Rook(0, 7, "b", self.piece_values.get("b_rook", 0))

        for i in range(8):
            self.board[1][i] = Pawn(1, i, "b", self.piece_values.get("b_pawn", 0))

        # White pieces
        self.board[7][0] = Rook(7, 0, "w", self.piece_values.get("w_rook", 10))
        self.board[7][1] = Knight(7, 1, "w", self.piece_values.get("w_knight", 10))
        self.board[7][2] = Bishop(7, 2, "w", self.piece_values.get("w_bishop", 10))
        self.board[7][3] = Queen(7, 3, "w", self.piece_values.get("w_queen", 10))
        self.board[7][4] = King(7, 4, "w", self.piece_values.get("w_king", 10))
        self.board[7][5] = Bishop(7, 5, "w", self.piece_values.get("w_bishop", 10))
        self.board[7][6] = Knight(7, 6, "w", self.piece_values.get("w_knight", 10))
        self.board[7][7] = Rook(7, 7, "w", self.piece_values.get("w_rook", 10))

        for i in range(8):
            self.board[6][i] = Pawn(6, i, "w", self.piece_values.get("w_pawn", 10))

        self.p1Name = "Player 1"
        self.p2Name = "Player 2"

        self.turn = "w"

        self.time1 = 900
        self.time2 = 900

        self.storedTime1 = 0
        self.storedTime2 = 0

        self.winner = None

        self.startTime = time.time()

    def init_piece_values(self):
        # Example initial values, you can set these based on your game design
        self.piece_values = {
            "b_knight": 3,
            "w_queen": 8,
            # ... add initial values for other pieces ...
        }

    def update_moves(self):
        for i in range(self.rows):
            for j in range(self.cols):
                if self.board[i][j] != 0:
                    self.board[i][j].update_valid_moves(self.board)

    def draw(self, win, color):
        if self.last and color == self.turn:
            y, x = self.last[0]
            y1, x1 = self.last[1]

            xx = (4 - x) +round(self.startX + (x * self.rect[2] / 8))
            yy = 3 + round(self.startY + (y * self.rect[3] / 8))
            pygame.draw.circle(win, (0,0,255), (xx+32, yy+30), 34, 4)
            xx1 = (4 - x) + round(self.startX + (x1 * self.rect[2] / 8))
            yy1 = 3+ round(self.startY + (y1 * self.rect[3] / 8))
            pygame.draw.circle(win, (0, 0, 255), (xx1 + 32, yy1 + 30), 34, 4)

        s = None
        for i in range(self.rows):
            for j in range(self.cols):
                if self.board[i][j] != 0:
                    self.board[i][j].draw(win, color)
                    if self.board[i][j].isSelected:
                        s = (i, j)


    def get_danger_moves(self, color):
        danger_moves = []
        for i in range(self.rows):
            for j in range(self.cols):
                if self.board[i][j] != 0:
                    if self.board[i][j].color != color:
                        for move in self.board[i][j].move_list:
                            danger_moves.append(move)

        return danger_moves

    def is_checked(self, color):
        self.update_moves()
        danger_moves = self.get_danger_moves(color)
        king_pos = (-1, -1)
        for i in range(self.rows):
            for j in range(self.cols):
                if self.board[i][j] != 0:
                    if self.board[i][j].king and self.board[i][j].color == color:
                        king_pos = (j, i)

        if king_pos in danger_moves:
            return True

        return False

    def select(self, col, row, color):
        changed = False
        prev = (-1, -1)
        for i in range(self.rows):
            for j in range(self.cols):
                if self.board[i][j] != 0:
                    if self.board[i][j].selected:
                        prev = (i, j)

        # if piece
        if self.board[row][col] == 0 and prev!=(-1,-1):
            moves = self.board[prev[0]][prev[1]].move_list
            if (col, row) in moves:
                changed = self.move(prev, (row, col), color)

        else:
            if prev == (-1,-1):
                self.reset_selected()
                if self.board[row][col] != 0:
                    self.board[row][col].selected = True
            else:
                if self.board[prev[0]][prev[1]].color != self.board[row][col].color:
                    # Change here: Check if the moving piece's value is >= the target piece's value
                    print(f"Attempting capture: {self.board[prev[0]][prev[1]]} (Value: {self.board[prev[0]][prev[1]].value}) -> {self.board[row][col]} (Value: {self.board[row][col].value})")

                    if self.board[prev[0]][prev[1]].value >= self.board[row][col].value:
                        print(f"Attempting capture: {self.board[prev[0]][prev[1]]} (Value: {self.board[prev[0]][prev[1]].value}) -> {self.board[row][col]} (Value: {self.board[row][col].value})")

                        moves = self.board[prev[0]][prev[1]].move_list
                        if (col, row) in moves:
                            changed = self.move(prev, (row, col), color)
                    else:
                        print(f"Cannot capture: {self.board[row][col]} has higher value than {self.board[prev[0]][prev[1]]}")

                else:
                    if self.board[row][col].color == color:
                        #castling
                        self.reset_selected()
                        if self.board[prev[0]][prev[1]].moved == False and self.board[prev[0]][prev[1]].rook and self.board[row][col].king and col != prev[1] and prev!=(-1,-1):
                            castle = True
                            if prev[1] < col:
                                for j in range(prev[1]+1, col):
                                    if self.board[row][j] != 0:
                                        castle = False

                                if castle:
                                    changed = self.move(prev, (row, 3), color)
                                    changed = self.move((row,col), (row, 2), color)
                                if not changed:
                                    self.board[row][col].selected = True

                            else:
                                for j in range(col+1,prev[1]):
                                    if self.board[row][j] != 0:
                                        castle = False

                                if castle:
                                    changed = self.move(prev, (row, 6), color)
                                    changed = self.move((row,col), (row, 5), color)
                                if not changed:
                                    self.board[row][col].selected = True
                            
                        else:
                            self.board[row][col].selected = True

        if changed:
            if self.turn == "w":
                self.turn = "b"
                self.reset_selected()
            else:
                self.turn = "w"
                self.reset_selected()

    def reset_selected(self):
        for i in range(self.rows):
            for j in range(self.cols):
                if self.board[i][j] != 0:
                    self.board[i][j].selected = False

    def check_mate(self, color):
        '''if self.is_checked(color):
            king = None
            for i in range(self.rows):
                for j in range(self.cols):
                    if self.board[i][j] != 0:
                        if self.board[i][j].king and self.board[i][j].color == color:
                            king = self.board[i][j]
            if king is not None:
                valid_moves = king.valid_moves(self.board)

                danger_moves = self.get_danger_moves(color)

                danger_count = 0

                for move in valid_moves:
                    if move in danger_moves:
                        danger_count += 1
                return danger_count == len(valid_moves)'''

        return False

    def move(self, start, end, color):
        checkedBefore = self.is_checked(color)
        changed = True
        nBoard = self.board[:]
        if nBoard[start[0]][start[1]].pawn:
            nBoard[start[0]][start[1]].first = False

        nBoard[start[0]][start[1]].change_pos((end[0], end[1]))
        nBoard[end[0]][end[1]] = nBoard[start[0]][start[1]]
        nBoard[start[0]][start[1]] = 0
        self.board = nBoard

        if self.is_checked(color) or (checkedBefore and self.is_checked(color)):
            changed = False
            nBoard = self.board[:]
            if nBoard[end[0]][end[1]].pawn:
                nBoard[end[0]][end[1]].first = True

            nBoard[end[0]][end[1]].change_pos((start[0], start[1]))
            nBoard[start[0]][start[1]] = nBoard[end[0]][end[1]]
            nBoard[end[0]][end[1]] = 0
            self.board = nBoard
        else:
            self.reset_selected()

        self.update_moves()
        if changed:
            self.last = [start, end]
            if self.turn == "w":
                self.storedTime1 += (time.time() - self.startTime)
            else:
                self.storedTime2 += (time.time() - self.startTime)
            self.startTime = time.time()

        return changed


    def update_piece_values(self, new_values):
        for row in self.board:
            for piece in row:
                if piece != 0:
                    key = f"{piece.color}_{type(piece).__name__.lower()}"
                    piece.value = new_values.get(key, piece.value)  # Update the value if the key exists in new_values

