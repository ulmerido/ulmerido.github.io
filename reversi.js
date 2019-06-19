//  @ts-check
const ePawnImageSrc =
{
  Black: "piece-1.gif",
  White: "piece-2.gif",
  Empty: "piece-0.gif",
};

const ePawnType =
{
  Black: "Black",
  White: "White",
  Tie: "Tie",
  Empty: "*",
}

class Player 
{
  constructor()
  {
    this.score = 2;
    this.twoPawns = 1;
    this.average = 0;
    this.averageGames = 0;
    this.roundTimePlayer = [];
    this.roundTimePlayerGames = [];
    this.StrategyScore = 0;

  }
}

class Stats 
{
  constructor()
  {
    this.Player1 = new Player();
    this.Player2 = new Player();
    this.roundsNum = 0;
  }

  initStats()
  {
    this.Player1.average = 0;
    this.Player2.average = 0;
    this.roundsNum = 0;
    this.Player1.score = 2;
    this.Player2.score = 2;
    this.Player1.twoPawns = 1;
    this.Player2.twoPawns = 1;
    this.Player1.roundTimePlayer = [];
    this.Player2.roundTimePlayer = [];
    this.Player1.averageGames = 0;
    this.Player2.averageGames = 0;
    this.Player1.roundTimePlayerGames = [];
    this.Player2.roundTimePlayerGames = [];
    document.getElementById("minutes").innerHTML = "00";
    document.getElementById("seconds").innerHTML = "00";
  }

}

const kCorner = 99;
const kAroundCorner = -8;
const kEdge = 32
const kInner = 0;
const k_Inifinity = 99999;
// Game Strategy score mechanism
let col1 = [kCorner, kAroundCorner, kEdge, kEdge, kEdge, kEdge, kAroundCorner, kCorner];
let col2 = [kAroundCorner, kAroundCorner, kInner, kInner, kInner, kInner, kAroundCorner, kAroundCorner];
let col3 = [kEdge, kInner, kInner, kInner, kInner, kInner, kInner, kEdge];
let col4 = [kEdge, kInner, kInner, kInner, kInner, kInner, kInner, kEdge];
let gRatingMatrixSize8 = new Array(8);
gRatingMatrixSize8[0] = col1;
gRatingMatrixSize8[1] = col2;
gRatingMatrixSize8[2] = col3;
gRatingMatrixSize8[3] = col4;
gRatingMatrixSize8[4] = col4;
gRatingMatrixSize8[5] = col3;
gRatingMatrixSize8[6] = col2;
gRatingMatrixSize8[7] = col1;
//

let col10 = [kCorner, kAroundCorner, kEdge, kEdge, kEdge, kEdge, kEdge, kEdge, kAroundCorner, kCorner];
let col20 = [kAroundCorner, kAroundCorner, kInner, kInner, kInner, kInner, kInner, kInner, kAroundCorner, kAroundCorner];
let col30 = [kEdge, kInner, kInner, kInner, kInner, kInner, kInner, kInner, kInner, kEdge];
let col40 = [kEdge, kInner, kInner, kInner, kInner, kInner, kInner, kInner, kInner, kEdge];
let gRatingMatrixSize10 = new Array(10);
gRatingMatrixSize10[0] = col10;
gRatingMatrixSize10[1] = col20;
gRatingMatrixSize10[2] = col30;
gRatingMatrixSize10[3] = col40;
gRatingMatrixSize10[4] = col40;
gRatingMatrixSize10[5] = col40;
gRatingMatrixSize10[6] = col40;
gRatingMatrixSize10[7] = col30;
gRatingMatrixSize10[8] = col20;
gRatingMatrixSize10[9] = col10;
//
let gDepth = 4;
let gameStatus = false;
let anotherMatch = false;

class GameMaster
{
  constructor(i_Size)
  {
    this.k_Size = i_Size;
    this.Board;
    this._createGameBoard();
    this.m_Stats = new Stats();
    this._initBoardPawns()
    this.PlayerTurnType = ePawnType.White;
    this.matrixPossibilities = [];
    this.strategyScoreAdd = 0;
  };

  nextTurn()
  {
    let noMoreMoves;
    this._updateStats();
    this._updateAverageTime();
    if (anotherMatch)
    {
      this._calcAnotherGame();
    }
    this._updateRounds();
    noMoreMoves = this._updateScore();
    this._update2Pawns();
    this._swapTurns();
    return noMoreMoves;
  };

  isValidMove(i, j)
  {

    let x, y;
    let valid = false;
    if (this.Board[i][j].Pawn === ePawnType.Empty)
    {
      for (x = -1; x < 2; x++)
      {
        for (y = -1; y < 2; y++)
        {
          if (((i + x >= 0) && (j + y >= 0)) && (i + x < this.k_Size) && (j + y < this.k_Size))
          {
            if (this.Board[i + x][j + y].Pawn !== ePawnType.Empty && (x !== 0 || y !== 0))
            {
              valid = true;
              break;
            }
          }
        }
      }
    }

    return valid;
  };

  getWinner(i_GameEnd)
  {
    let winner = null;

    if (i_GameEnd)
    {
      if (this.m_Stats.Player1.score > this.m_Stats.Player2.score)
      {
        winner = ePawnType.White;
      }
      else if (this.m_Stats.Player1.score < this.m_Stats.Player2.score)
      {
        winner = ePawnType.Black
      }
      else
      {
        winner = ePawnType.Tie;
      }
    }
    else
    {
      if (this.m_Stats.Player1.score === 0)
      {
        winner = ePawnType.Black;
      }
      else if (this.m_Stats.Player2.score === 0)
      {
        winner = ePawnType.White;
      }
    }

    return winner;
  };

  _swapTurns()
  {
    if (this.PlayerTurnType === ePawnType.White)
    {
      this.PlayerTurnType = ePawnType.Black;
    }
    else
    {
      this.PlayerTurnType = ePawnType.White;
    }
  };

  _update2Pawns()
  {
    if (this.m_Stats.Player1.score === 2)
    {
      this.m_Stats.Player1.twoPawns++;
    }
    if (this.m_Stats.Player2.score === 2)
    {
      this.m_Stats.Player2.twoPawns++;
    }
  };

  _updateRounds()
  {
    this.m_Stats.roundsNum++;
  };

  _updateAverageTime()
  {
    let sum = 0;
    if (this.PlayerTurnType === ePawnType.White)
    {
      this.m_Stats.Player1.roundTimePlayer.forEach((timeSlot) => { sum += timeSlot; });
      this.m_Stats.Player1.average = sum / this.m_Stats.Player1.roundTimePlayer.length;
    }
    else
    {
      this.m_Stats.Player2.roundTimePlayer.forEach((timeSlot) => { sum += timeSlot; });
      this.m_Stats.Player2.average = sum / this.m_Stats.Player2.roundTimePlayer.length;
    }
  };

  _calcAnotherGame() 
  {
    let sum = 0;
    if (this.PlayerTurnType === ePawnType.White)
    {
      sum = this.m_Stats.Player1.average;
      this.m_Stats.Player1.roundTimePlayerGames.forEach((timeSlot) => { sum += timeSlot; });
      this.m_Stats.Player1.averageGames = sum / (this.m_Stats.Player1.roundTimePlayerGames.length + 1);
    }
    else
    {
      sum = this.m_Stats.Player2.average;
      this.m_Stats.Player2.roundTimePlayerGames.forEach((timeSlot) => { sum += timeSlot; });
      this.m_Stats.Player2.averageGames = sum / (this.m_Stats.Player2.roundTimePlayerGames.length + 1);
    }
  };

  _updateStats()
  {
    let time = new Date();

    if (this.PlayerTurnType == ePawnType.White)
    {
      let temp = time.getTime() - this.m_Stats.Player1.roundTimePlayer.pop();
      this.m_Stats.Player1.roundTimePlayer.push(temp / 1000);
      this.m_Stats.Player2.roundTimePlayer.push(time.getTime());
    }

    if (this.PlayerTurnType == ePawnType.Black)
    {
      let temp = time.getTime() - this.m_Stats.Player2.roundTimePlayer.pop();
      this.m_Stats.Player2.roundTimePlayer.push(temp / 1000);
      this.m_Stats.Player1.roundTimePlayer.push(time.getTime());
    }
  };

  boardFull()
  {
    let full = true;;
    for (let i = 0; i < this.k_Size; i++)
    {
      for (let j = 0; j < this.k_Size; j++)
      {
        if (this.Board[i][j].Pawn === ePawnType.Empty)
        {
          full = false;
        }
      }
    }

    return full;

  }

  _updateScore()
  {
    let counter1 = 0;
    let counter2 = 0;
    let full = true;

    for (let i = 0; i < this.k_Size; i++)
    {
      for (let j = 0; j < this.k_Size; j++)
      {
        if (this.Board[i][j].Pawn === ePawnType.Black)
        {
          counter2++;
        }
        if (this.Board[i][j].Pawn === ePawnType.White)
        {
          counter1++;
        }
        if (this.Board[i][j].Pawn === ePawnType.Empty)
        {
          full = false;
        }
      }
    }

    this.m_Stats.Player1.score = counter1;
    this.m_Stats.Player2.score = counter2;

    if (counter1 === 0 || counter2 === 0)
    {
      full = true;
    }

    return full;
  };

  _createGameBoard()
  {
    this.Board = new Array(this.k_Size);
    for (let i = 0; i < this.k_Size; i++)
    {
      this.Board[i] = new Array(this.k_Size);
      for (let j = 0; j < this.k_Size; j++)
      {
        this.Board[i][j] = { Cell: null, Pawn: null, Img: null };
        this.Board[i][j].Pawn = ePawnType.Empty;
      }
    }
  };

  _initBoardPawns()
  {
    let mid = this.k_Size / 2;
    this.Board[mid - 1][mid - 1].Pawn = ePawnType.Black;
    this.Board[mid][mid].Pawn = ePawnType.Black;
    this.Board[mid - 1][mid].Pawn = ePawnType.White;
    this.Board[mid][mid - 1].Pawn = ePawnType.White;
  };

  updateMatrixOfPossibilities(i, j)
  {
    let x, y;
    this.matrixPossibilities = Array(this.k_Size);
    for (x = 0; x < this.k_Size; x++)
    {
      this.matrixPossibilities[x] = Array(this.k_Size);
      for (y = 0; y < this.k_Size; y++)
      {
        this.matrixPossibilities[x][y] = this.Board[x][y].Pawn;
      }
    }

    for (x = -1; x < 2; x++)
    {
      for (y = -1; y < 2; y++)
      {
        if (x !== 0 || y !== 0)
        {
          this._addPoss(x, y, i, j);
        }
      }
    }

    this.matrixPossibilities[i][j] = this.PlayerTurnType;
    if (this.k_Size === 8)
    {
      this.strategyScoreAdd = gRatingMatrixSize8[i][j];
    }
    else if (this.k_Size == 10)
    {
      this.strategyScoreAdd = gRatingMatrixSize10[i][j];
    }
  };

  makeAMove()
  {
    for (let i = 0; i < this.k_Size; i++)
    {
      for (let j = 0; j < this.k_Size; j++)
      {
        if (this.matrixPossibilities[i][j] !== ePawnType.Empty)
        {
          this.Board[i][j].Pawn = this.matrixPossibilities[i][j];
        }
      }
    }

    if (this.PlayerTurnType === ePawnType.White)
    {
      this.m_Stats.Player1.StrategyScore += this.strategyScoreAdd;
    }
    else
    {
      this.m_Stats.Player2.StrategyScore += this.strategyScoreAdd;
    }
  };

  _inBoundaries(x, y)
  {
    return (x >= 0) && (y >= 0) && (x < this.k_Size) && (y < this.k_Size);
  };

  _addPoss(colAdd, rowAdd, i, j)
  {
    let x = i;
    let y = j;
    let foundPawn = false;

    while (this._inBoundaries(x, y))
    {
      if (this.Board[x][y].Pawn === this.PlayerTurnType)
      {
        foundPawn = true;
        break;
      }
    
      y += colAdd;
      x += rowAdd;
      if(this._inBoundaries(x, y) && this.Board[x][y].Pawn === ePawnType.Empty)
      {
        foundPawn = false;
        break;
      }
    }

    if (foundPawn)
    {
      x = i;
      y = j;
      while (this._inBoundaries(x, y))
      {

        if (this.Board[x][y].Pawn === this.PlayerTurnType)
        {
          break;
        }
        else if (this.Board[x][y].Pawn !== ePawnType.Empty)
        {
          this.matrixPossibilities[x][y] = this.PlayerTurnType;
        }
        y += colAdd;
        x += rowAdd;
      }
    }
    else
    {

    }
  };
}
class AI
{

  constructor(i_Game)
  {
    this.game = i_Game;
  }

  _setDepth()
  {
    switch (this.game.k_Size)
    {
      case 6:
        gDepth = 5;
        break;
      case 8:
        gDepth = 4;
        break;
      case 10:
        gDepth = 2;
        break;
      case 12:
        gDepth = 1;
        break;
      case 14:
        gDepth = 1;
        break;
      case 16:
        gDepth = 1;
        break;
    }
  }

  makeAIMove()
  {
    let maxVal = -k_Inifinity;
    let minMaxVal;
    let saveX = -1, saveY = -1;
    let savedGame = this._saveGame();
    this._setDepth();
    for (let x = 0; x < this.game.k_Size; x++)
    {
      for (let y = 0; y < this.game.k_Size; y++)
      {
        if (this.game.isValidMove(x, y))
        {
          this.doAPossibileMove(x, y);
          minMaxVal = this.miniMax(x, y, gDepth, false, -k_Inifinity, k_Inifinity);
          if (minMaxVal > maxVal)
          {
            maxVal = minMaxVal;
            saveX = x;
            saveY = y;
          }

          this._restoreGame(savedGame);
        }
      }
    }

    if (saveX !== -1)
    {
      this.game.updateMatrixOfPossibilities(saveX, saveY);
      this.game.makeAMove(saveX, saveY);
    }
    else
    {
      console.log("NO VALIED MOVES");
    }
  }

  miniMax(i, j, depth, wantMax, alpha, beta)
  {
    let res = 0;
    let dif;
    let endGame = this.game.boardFull();
    if (depth === 0 || endGame)
    {
      dif = this.game.m_Stats.Player2.score - this.game.m_Stats.Player1.score;
      if (this.game.k_Size == 8)
      {
        res = this.game.m_Stats.Player2.StrategyScore - this.game.m_Stats.Player1.StrategyScore;
      }
      else
      {
        res = dif;
      }

      if (endGame ||this.game.m_Stats.Player1.score === 0)
      {
        if (dif > 0 || 0 === this.game.m_Stats.Player1.score)
        {
          res = k_Inifinity - 1;
        }
        else
        {
          res = -k_Inifinity + 1;
        }
      }
    }
    else 
    {
      if (wantMax)
      {
        res = this.doMax(depth, alpha, beta);
      }
      else
      {
        res = this.doMin(depth, alpha, beta);
      }
    }

    return res;
  }

  doMin(depth, alpha, beta)
  {
    let savedGame = this._saveGame();
    let MinEval = k_Inifinity;
    let sonValue, res = 0;
    for (let x = 0; x < this.game.k_Size; x++)
    {
      for (let y = 0; y < this.game.k_Size; y++)
      {
        if (this.game.isValidMove(x, y))
        {
          this.doAPossibileMove(x, y);
          sonValue = this.miniMax(x, y, depth - 1, true, alpha, beta);
          res = Math.min(MinEval, sonValue);
          this._restoreGame(savedGame);
          beta = Math.min(beta, sonValue);
          if (beta <= alpha)
          {
            break;
          }
        }
      }
    }

    return res;
  }

  doMax(depth, alpha, beta)
  {
    let savedGame = this._saveGame();
    let MaxVal = -k_Inifinity;
    let sonValue, res = 0;
    for (let x = 0; x < this.game.k_Size; x++)
    {
      for (let y = 0; y < this.game.k_Size; y++)
      {
        if (this.game.isValidMove(x, y))
        {
          this.doAPossibileMove(x, y);
          sonValue = this.miniMax(x, y, depth - 1, false, alpha, beta);
          res = Math.max(MaxVal, sonValue);
          alpha = Math.max(alpha, sonValue);
          this._restoreGame(savedGame);
          if (beta <= alpha)
          {
            break;
          }
        }
      }
    }

    return res;
  }

  doAPossibileMove(x, y)
  {
    this.game.updateMatrixOfPossibilities(x, y);
    this.game.makeAMove(x, y);
    this.game._swapTurns();
    this.game._updateScore();
  }

  _saveGame()
  {
    let savedGame =
    {
      board: new Array(this.game.k_Size),
      playerTurn: this.game.PlayerTurnType,
      score1: this.game.m_Stats.Player1.score,
      score2: this.game.m_Stats.Player2.score,
      StrategyScore1: this.game.m_Stats.Player1.StrategyScore,
      StrategyScore2: this.game.m_Stats.Player2.StrategyScore,
    }

    for (let x = 0; x < this.game.k_Size; x++)
    {
      savedGame.board[x] = new Array(this.game.k_Size);
      for (let y = 0; y < this.game.k_Size; y++)
      {
        savedGame.board[x][y] = this.game.Board[x][y].Pawn;
      }
    }

    return savedGame;
  }

  _restoreGame(savedGame)
  {
    for (let x = 0; x < this.game.k_Size; x++)
    {
      for (let y = 0; y < this.game.k_Size; y++)
      {
        this.game.Board[x][y].Pawn = savedGame.board[x][y];
      }
    }

    this.game.PlayerTurnType = savedGame.playerTurn;
    this.game.m_Stats.Player1.score = savedGame.score1;
    this.game.m_Stats.Player2.score = savedGame.score2;
    this.game.m_Stats.Player1.StrategyScore = savedGame.StrategyScore1;
    this.game.m_Stats.Player2.StrategyScore = savedGame.StrategyScore2;
  }

}

const kSquareSize = 30;
let mSize = 10;
let gAIMode = false;
let gTrainerMode = false;
let gTimer;
let mGameActive = false;
let mGame;
let gAI = new AI(mGame);
const kAIColor = ePawnType.Black;
let gModal = document.getElementById('myModal');
let gModalText = document.getElementById('myModalText');
let gSpan = document.getElementsByClassName("close")[0];
let gAnimateButton = function (e) 
{
  e.preventDefault;
  e.target.classList.remove('animate');
  e.target.classList.add('animate');
  setTimeout(function ()
  {
    e.target.classList.remove('animate');
  }, 700);
};

function _nextTurn()
{
  let gameEnd;
  let winner;
  gameEnd = mGame.nextTurn();
  _updateUIStats();
  winner = mGame.getWinner(gameEnd);
  _printBoard();
  if (gameEnd)
  {
    _endGameAsWinner(winner);
  }

}

function AITurn()
{
  gAI.makeAIMove();
  _printBoard();
}

function playerTurn(i, j)
{
  mGame.updateMatrixOfPossibilities(i, j);
  mGame.makeAMove();
  _printBoard();
}

function _setAverageGames() 
{
  mGame.m_Stats.Player1.roundTimePlayerGames.push(mGame.m_Stats.Player1.average);
  mGame.m_Stats.Player2.roundTimePlayerGames.push(mGame.m_Stats.Player2.average);
};

function _updateUIStats()
{
  let player1 = document.getElementById("stats1-container");
  let player2 = document.getElementById("stats2-container");


  document.getElementById("average-player1").innerHTML = `${ mGame.m_Stats.Player1.average.toFixed(2) }`;
  document.getElementById("average-player2").innerHTML = `${ mGame.m_Stats.Player2.average.toFixed(2) }`;

  document.getElementById("2pawns-player1").innerHTML = `${ mGame.m_Stats.Player1.twoPawns }`;
  document.getElementById("2pawns-player2").innerHTML = `${ mGame.m_Stats.Player2.twoPawns }`;
  document.getElementById("score-player1").innerHTML = `${ mGame.m_Stats.Player1.score }`;
  document.getElementById("score-player2").innerHTML = `${ mGame.m_Stats.Player2.score }`;

  document.getElementById("averageGames-player1").innerHTML = `${ mGame.m_Stats.Player1.averageGames.toFixed(2) }`;
  document.getElementById("averageGames-player2").innerHTML = `${ mGame.m_Stats.Player2.averageGames.toFixed(2) }`;

  document.getElementById("rounds").innerHTML = `${ mGame.m_Stats.roundsNum }`;
  if (mGame.PlayerTurnType === ePawnType.Black)
  {
    player2.className = "current-player";
    player1.className = "notcurrent-player";
  }
  else
  {
    player1.className = "current-player";
    player2.className = "notcurrent-player";
  }

}

function onChange_TrainMode()
{
  if (gTrainerMode === false)
  {
    gTrainerMode = true;
  }
  else
  {
    gTrainerMode = false;
  }
}

function _createGameTable()
{
  let table = document.getElementById("myBoard");
  let html = "";

  for (let i = 0; i < mSize; i++)
  {
    html += "<tr>";
    for (let j = 0; j < mSize; j++)
    {
      if ((i % 2 === 0 && j % 2 === 0) || (i % 2 === 1 && j % 2 === 1))
      {
        html += `<td id=cell[${ j }][${ i }]><img id=img[${ j }][${ i }] class="dark" src="piece-0.gif" border=0 width=${ kSquareSize } height=${ kSquareSize }></img></td>`;
      }

      else
      {
        html += `<td id=cell[${ j }][${ i }]><img id=img[${ j }][${ i }] class="light" src="piece-0.gif" border=0 width=${ kSquareSize } height=${ kSquareSize }></img></td>`;
      }
    }

    html += "</tr>";
  }

  table.insertAdjacentHTML("afterbegin", html);
}

function _printBoard()
{
  for (let x = 0; x < mSize; x++)
  {
    for (let y = 0; y < mSize; y++)
    {
      _updateCellImage(x, y);
    }
  }
}

function _updateCellImage(i, j)
{
  switch (mGame.Board[i][j].Pawn)
  {
    case ePawnType.White:
      mGame.Board[i][j].Img.src = ePawnImageSrc.White;
      break;

    case ePawnType.Black:
      mGame.Board[i][j].Img.src = ePawnImageSrc.Black;
      break;

    case ePawnType.Empty:
      mGame.Board[i][j].Img.src = ePawnImageSrc.Empty;
      break;

  }

}

function onMouseClick_Cell(i, j)
{
  if (mGameActive)
  {
    if (mGame.isValidMove(i, j))
    {
      playerTurn(i,j);
      _nextTurn();
      if ((kAIColor === mGame.PlayerTurnType) && (gAIMode))
      {
        AITurn();
        _nextTurn();
      }
    }
  }
}

function onMouseLeave_Cell()
{
  if (mGameActive)
  {
    _printBoard();
  }
}

function _linkBoardToHTML()
{
  for (let i = 0; i < mSize; i++)
  {
    for (let j = 0; j < mSize; j++)
    {
      mGame.Board[i][j].Cell = document.getElementById(`cell[${ i }][${ j }]`);
      mGame.Board[i][j].Img = document.getElementById(`img[${ i }][${ j }]`);
      mGame.Board[i][j].Cell.addEventListener('mouseleave', function () { onMouseLeave_Cell(); });
      mGame.Board[i][j].Cell.addEventListener('mouseenter', function () { onMouseEnter_Cell(i, j); });
      mGame.Board[i][j].Cell.addEventListener('click', function () { onMouseClick_Cell(i, j); });
    }
  }
}

function _initBoard()
{
  _createGameTable();
  mGame = new GameMaster(mSize);
  gAI = new AI(mGame);
  _linkBoardToHTML();
  _printBoard();
}

function onMouseEnter_Cell(i, j)
{
  if (mGameActive)
  {
    if (mGame.isValidMove(i, j))
    {

      mGame.Board[i][j].Img.src = _getPlayerTurnImage();
      if (gTrainerMode)
      {
        mGame.updateMatrixOfPossibilities(i, j);
        for (let x = 0; x < mSize; x++)
        {
          for (let y = 0; y < mSize; y++)
          {
            if (mGame.matrixPossibilities[x][y] !== ePawnType.Empty)
            {
              switch (mGame.matrixPossibilities[x][y])
              {
                case ePawnType.White:
                  mGame.Board[x][y].Img.src = ePawnImageSrc.White;
                  break;

                case ePawnType.Black:
                  mGame.Board[x][y].Img.src = ePawnImageSrc.Black;
                  break;

                case ePawnType.Empty:
                  mGame.Board[x][y].Img.src = ePawnImageSrc.Empty;
                  break;
              }
            }
          }
        }
      }
    }
  }
}

function _getPlayerTurnImage()
{
  let res = null;
  switch (mGame.PlayerTurnType)
  {
    case ePawnType.Black:
      res = ePawnImageSrc.Black;
      break;
    case ePawnType.White:
      res = ePawnImageSrc.White;
      break;
  }
  return res;
}

function _erasePrevBoard()
{
  let table = document.getElementById("myBoard");
  table.removeChild(table.childNodes[0]);
}

function onClick_Start()
{
  _startGame();
}

function _startGame() 
{
  _erasePrevBoard();
  _initBoard();
  mGameActive = true;
  _updateUIStats();
  _startTimer();
  gameStatus = true;
  document.getElementById("average-player1").innerHTML = `${ mGame.m_Stats.Player1.average.toFixed(2) }`;
  document.getElementById("average-player2").innerHTML = `${ mGame.m_Stats.Player2.average.toFixed(2) }`;
  document.getElementById("stop").disabled = false;
  document.getElementById("selected-size").className = "select-selected-off";

  let temp = new Date();
  if (mGame.PlayerTurnType === ePawnType.White)
  {
    mGame.m_Stats.Player1.roundTimePlayer.push(temp.getTime());
  }
  else
  {
    mGame.m_Stats.Player2.roundTimePlayer.push(temp.getTime());
  }

};

function _startTimer()
{
  // @ts-ignore
  document.getElementById("start").disabled = true;
  let minutesLabel = document.getElementById("minutes");
  let secondsLabel = document.getElementById("seconds");
  let totalSeconds = 0;
  let timer = setInterval(setTime, 1000);
  gTimer = timer;

  function setTime()
  {
    ++totalSeconds;
    secondsLabel.innerHTML = _pad(totalSeconds % 60);
    // @ts-ignore
    minutesLabel.innerHTML = _pad(parseInt(totalSeconds / 60));
  }
};

function _pad(val)
{
  let valString = val + "";
  let res = "";
  if (valString.length < 2)
  {
    res = "0" + valString;
  }
  else
  {
    res = valString;
  }

  return res;
}

function _endGameAsWinner(winner)
{
  _showWinner(winner);
  _setAverageGames();
  _endGame();
  anotherMatch = true;
  // @ts-ignore
  document.getElementById("stop").disabled = true;
  let table = document.getElementById("myBoard");
  table.className = "game-off";
  mGameActive = false;

}

function _endGame()
{
  gameStatus = false;
  // @ts-ignore
  document.getElementById("start").disabled = false;
  document.getElementById("selected-size").className = "select-selected";
  clearInterval(gTimer);
}

function _modifyBoardSize(size)
{
  mSize = size;
}

function onClick_Stop()
{
  if (mGame.PlayerTurnType === ePawnType.White)
  {
    _endGameAsWinner(ePawnType.Black);
  }
  else if (mGame.PlayerTurnType === ePawnType.Black)
  {
    _endGameAsWinner(ePawnType.White);
  }
}

function _showWinner(winner)
{
  gModal.style.display = "block";
  if (winner === ePawnType.Tie)
  {
    gModalText.innerHTML = "There is a Tie";
  }
  else
  {
    gModalText.innerHTML = `The Winner is: The ${ winner } Player`;
  }
}

function _initBubblyButtons()
{
  let bubblyButtons = document.getElementsByClassName("bubbly-button");

  for (let i = 0; i < bubblyButtons.length; i++) 
  {
    bubblyButtons[i].addEventListener('click', gAnimateButton, false);
  }
}

function _initListButtons()
{
  let x, i, j, selElement, a, b, c;
  x = document.getElementsByClassName("custom-select");
  for (i = 0; i < x.length; i++) 
  {
    selElement = x[i].getElementsByTagName("select")[0];
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    a.id = "selected-size";
    a.innerHTML = selElement.options[selElement.selectedIndex].innerHTML;
    x[i].appendChild(a);
    b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide");
    b.setAttribute("id", "size-options");


    for (j = 0; j < selElement.length; j++) 
    {
      /*for each option in the original select element,
      create a new DIV that will act as an option item:*/
      c = document.createElement("DIV");
      c.innerHTML = selElement.options[j].innerHTML;
      c.id = selElement.options[j].value;
      c.addEventListener("click", function (e) 
      {
        /*when an item is clicked, update the original select box,
        and the selected item:*/
        let y, i, k, s, h;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        h = this.parentNode.previousSibling;
        _modifyBoardSize(this.id);
        for (i = 0; i < s.length; i++) 
        {
          if (s.options[i].innerHTML == this.innerHTML) 
          {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;
            y = this.parentNode.getElementsByClassName("same-as-selected");
            for (k = 0; k < y.length; k++)
            {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }

        h.click();
      });
      b.appendChild(c);
    }

    x[i].appendChild(b);
    a.addEventListener("click", function (e) 
    {
      /*when the select box is clicked, close any other select boxes,
      and open/close the current select box:*/
      if (!gameStatus)
      {
        e.stopPropagation();
        _closeAllSelect(this);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
      }
    });
  }

}

function onClick_Document(i_Element)
{
  _closeAllSelect(i_Element);
}

function _closeAllSelect(i_Element) 
{
  let x, y, i, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  for (i = 0; i < y.length; i++)
  {
    if (i_Element == y[i])
    {
      arrNo.push(i)
    }
    else 
    {
      y[i].classList.remove("select-arrow-active");
    }
  }

  for (i = 0; i < x.length; i++) 
  {
    if (arrNo.indexOf(i)) 
    {
      x[i].classList.add("select-hide");
    }
  }
}

function onChange_AI()
{
  gAIMode = !gAIMode;
}

function Run()
{
  _initBoard();
  document.getElementById('trainer').onchange = function () { onChange_TrainMode(); };
  document.getElementById('start').onclick = function () { onClick_Start(); };
  document.getElementById('stop').onclick = function () { onClick_Stop(); };
  document.getElementById('AI').onchange = function () { onChange_AI(); };

  gSpan.onclick = function () { gModal.style.display = "none"; };
  window.onclick = function (event) { if (event.target == gModal) { gModal.style.display = "none"; } };
  _initBubblyButtons();
  _initListButtons();
  document.addEventListener("click", onClick_Document);
}

Run();