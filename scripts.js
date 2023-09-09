class Game {
	// Properties
	appElement
	#board
	#player1
	#player2
	#currentPlayer
	#history
	#gameAnalyst

	// Constructor
	constructor(player1Name, player2Name) {
		// Get or create appElement
		let appElement

		appElement = document.querySelector('main#app')
		if (!appElement) {
			appElement = document.createElement("main")
			appElement.id = "app"
			document.body.appendChild(appElement)
		}

		this.appElement = appElement

		// Create players
		this.#player1 = new Player(player1Name, "X")
		this.#player2 = new Player(player2Name, "O")
		this.#currentPlayer = this.#player1

		// Create board
		let boardElement = document.createElement("div")
		boardElement.classList.add("board")
		this.#board = new Board(boardElement, this)

		// Create history array
		this.#history = []

		// Create game analyst
		this.#gameAnalyst = new GameAnalyst()

		// Render board
		this.#board.renderBoard()
	}

	// Methods
	getCurrentPlayer() {
		return this.#currentPlayer
	}

	setCurrentPlayer(player) {
		this.#currentPlayer = player
	}

	getPlayer1() {
		return this.#player1
	}

	getPlayer2() {
		return this.#player2
	}

	getHistory() {
		return this.#history
	}

	getGameAnalyst() {
		return this.#gameAnalyst
	}

	addToHistory(winner) {
		// Validate winner is null, "X", or "O"
		if (winner !== null && winner !== "X" && winner !== "O") {
			throw new Error("Invalid winner")
		}

		this.#history.push(winner)
	}

	switchCurrentPlayer() {
		this.setCurrentPlayer(this.getCurrentPlayer() === this.getPlayer1() ? this.getPlayer2() : this.getPlayer1())
	}
}

class Player {
	// Properties
	#name
	#symbol

	// Constructor
	constructor(name, symbol) {
		this.setName(name)
		this.setSymbol(symbol)
	}

	// Methods
	getName() {
		return this.#name
	}

	setName(name) {
		// Validate name (not falsy, only contains upper/lower case letters, numbers, spaces, and special)
		if (!name | !name.match(/^[a-zA-Z0-9\s\W]+$/)) {
			throw new Error("Invalid name")
		}

		this.#name = name
	}

	getSymbol() {
		return this.#symbol
	}

	setSymbol(symbol) {
		// Validate symbol is "X" or "O"
		if (symbol !== "X" && symbol !== "O") {
			throw new Error("Invalid symbol")
		}

		this.#symbol = symbol
	}
}

class GameAnalyst {
	// Methods
	checkForWinner(board) {
		let boxes = board.getBoxes()

		// Check rows
		for (let row of boxes) {
			let winner = this.#checkRow(row)
			if (winner) {
				return winner
			}
		}

		// Check columns
		for (let col = 0; col < 3; col++) {
			let column = [boxes[0][col], boxes[1][col], boxes[2][col]]
			let winner = this.#checkRow(column)
			if (winner) {
				return winner
			}
		}

		// Check diagonals
		let diagonal1 = [boxes[0][0], boxes[1][1], boxes[2][2]]
		let diagonal2 = [boxes[0][2], boxes[1][1], boxes[2][0]]
		let winner = this.#checkRow(diagonal1)
		if (winner) {
			return winner
		}
		winner = this.#checkRow(diagonal2)
		if (winner) {
			return winner
		}

		// Check for draw
		if (this.#checkForDraw(board)) {
			return "draw"
		}

		// No winner
		return null
	}

	#checkRow(row) {
		let owner = row[0].getOwner()
		if (owner !== null && row[1].getOwner() === owner && row[2].getOwner() === owner) {
			return owner
		}

		return null
	}

	#checkForDraw(board) {
		let boxes = board.getBoxes()

		for (let row of boxes) {
			for (let box of row) {
				if (!box.hasOwner()) {
					return false
				}
			}
		}

		return true
	}
}


class Board {
	// Properties
	boardElement
	#boxes
	#game

	// Constructor
	constructor(boardElement, game) {
		this.boardElement = boardElement

		this.setBoxes([
			[new Box(), new Box(), new Box()],
			[new Box(), new Box(), new Box()],
			[new Box(), new Box(), new Box()]
		])

		this.#game = game
	}

	// Methods
	getBoxes() {
		return this.#boxes
	}
	
	setBoxes(boxes) {
		this.#boxes = boxes
	}

	getBox(row, col) {
		return this.#boxes[row][col]
	}

	setBox(row, col, newOwner) {
		this.#boxes[row][col].setOwner(newOwner.getSymbol())
	}

	renderBoard() {
		this.boardElement.innerHTML = ""

		for (let row of this.#boxes) {
			for (let box of row) {
				let boxElement = document.createElement("button")
				boxElement.classList.add("box")
				boxElement.innerHTML = box.getOwner() ?? ""

				boxElement.addEventListener("click", () => {
					// Check if box is already owned
					if (box.hasOwner()) {
						return
					}

					// Set box owner
					this.setBox(this.#boxes.indexOf(row), row.indexOf(box), this.#game.getCurrentPlayer())
					boxElement.innerHTML = this.#game.getCurrentPlayer().getSymbol()

					// Check for winner
					let winner = this.#game.getGameAnalyst().checkForWinner(this)
					if (winner) {
						this.#game.addToHistory(winner)
						this.#game.setCurrentPlayer(this.#game.getPlayer1())
						
						// Reset board
						this.setBoxes([
							[new Box(), new Box(), new Box()],
							[new Box(), new Box(), new Box()],
							[new Box(), new Box(), new Box()]
						])
						return
					}

					// Switch current player
					this.#game.switchCurrentPlayer()

					// Render board
					this.renderBoard()
				})

				this.boardElement.appendChild(boxElement)
			}
		}

		this.#game.appElement.appendChild(this.boardElement)
	}
}

class Box {
	// Properties
	#owner

	// Constructor
	constructor() {
		this.setOwner(null)
	}

	// Methods
	getOwner() {
		return this.#owner
	}

	setOwner(owner) {
		// Validate owner is null, "X", or "O"
		if (owner !== null && owner !== "X" && owner !== "O") {
			throw new Error("Invalid owner")
		}

		this.#owner = owner
	}

	hasOwner() {
		return this.#owner !== null
	}
}

const game = new Game("Player1", "Player2")