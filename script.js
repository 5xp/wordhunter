function $(id) {
  return document.getElementById(id);
}

window.onload = function () {
  init();
};

// words from https://ia903406.us.archive.org/31/items/csw21/CSW21.txt
function init() {
  fetch("words.txt")
    .then(response => response.text())
    .then(data => {
      // make sure words are longer than 2 characters and uppercase
      wordList = data
        .split("\n")
        .filter(word => word.length > 2)
        .map(word => word.toUpperCase());
    });

  // set text area max length to gridSize^2
  $("textArea").setAttribute("maxlength", gridSize * gridSize);

  // create squares
  for (var i = 0; i < gridSize * gridSize; i++) {
    const div = document.createElement("div");
    div.className = "square";
    div.id = i;
    div.innerHTML = "_";
    $("grid").appendChild(div);
  }
}

function updateGrid(value) {
  const squares = document.getElementsByClassName("square");
  for (var i = 0; i < squares.length; i++) {
    const letter = value[i]?.toUpperCase() ?? "_";
    squares[i].innerHTML = letter;
    grid[Math.floor(i / gridSize)][i % gridSize].letter = letter;
  }

  if (value.length === gridSize * gridSize) {
    searchAll();
    // searchSpecific("AWAITS");

    // print all found words in order of decreasing length
    wordsFound.sort((a, b) => b.word.length - a.word.length);

    // remove duplicates
    wordsFound = wordsFound.filter((word, index) => {
      return index === 0 || word.word !== wordsFound[index - 1].word;
    });

    for (var i = 0; i < wordsFound.length; i++) {
      console.log(wordsFound[i]);
    }
    createWordElements();
  }
}

// word searching

var gridSize = 4;
var wordsFound = [];
var wordList = [];

class Word {
  constructor(word, letters) {
    this.word = word;
    this.letters = letters;
    wordsFound.push(this);
  }

  // when a word is focused, highlight the letters on grid
  highlight() {
    for (var i = 0; i < this.word.length; i++) {
      const squareElement = $(this.letters[i].x * gridSize + this.letters[i].y);
      squareElement.classList.add("highlighted");
      if (i === 0) {
        squareElement.classList.add("first");
      }
    }
  }

  // when a word is unfocused, remove highlight
  unhighlight() {
    for (var i = 0; i < this.word.length; i++) {
      const squareElement = $(this.letters[i].x * gridSize + this.letters[i].y);
      squareElement.classList.remove("highlighted");
      squareElement.classList.remove("first");
    }

    // // remove svg elements
    // const svg = document.getElementById("svg" + this.word);
    // svg.parentNode.removeChild(svg);
  }
}

class Square {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.letter = "_";
  }
}

// create 2 dimensional grid of square objects
var grid = [];
for (var i = 0; i < gridSize; i++) {
  grid[i] = [];
  for (var j = 0; j < gridSize; j++) {
    grid[i][j] = new Square(i, j);
  }
}

function searchAll() {
  for (var i = 0; i < wordList.length; i++) {
    searchFirstLetter(wordList[i]);
  }
}

function searchFirstLetter(word) {
  for (var i = 0; i < gridSize; i++) {
    for (var j = 0; j < gridSize; j++) {
      const candidate = grid[i][j];
      if (candidate.letter === word[0]) {
        return searchAdjacent(word, candidate);
      }
    }
  }
}

function searchSpecific(word) {
  for (var i = 0; i < gridSize; i++) {
    for (var j = 0; j < gridSize; j++) {
      const candidate = grid[i][j];
      if (candidate.letter === word[0]) {
        searchAdjacent(word, candidate);
      }
    }
  }
}

function searchAdjacent(word, square, visited = [], found = [square], index = 0) {
  if (!visited.includes(square)) {
    visited.push(square);
  }

  const x = square.x;
  const y = square.y;

  if (index === word.length - 1) {
    // make sure the word is actually correct
    const foundWord = found.map(square => square.letter).join("");
    if (foundWord === word) {
      new Word(word, found);
    }
    return;
  }

  for (var i = x - 1; i <= x + 1; i++) {
    for (var j = y - 1; j <= y + 1; j++) {
      if (i >= 0 && i < gridSize && j >= 0 && j < gridSize) {
        const candidate = grid[i][j];
        if (candidate.letter === word[index + 1] && !visited.includes(candidate)) {
          found = found.slice(0, index + 1);
          found.push(candidate);
          searchAdjacent(word, candidate, visited, found, index + 1);
        }
      }
    }
  }
}

// when words are found, create elements for them under discovered wrapper
function createWordElements() {
  for (var i = 0; i < wordsFound.length; i++) {
    const word = wordsFound[i];
    const wordElement = document.createElement("div");
    wordElement.innerText = word.word;
    wordElement.className = "word";

    // on hover, add focus class
    wordElement.addEventListener("mouseenter", function () {
      // unhighlight other words
      for (var i = 0; i < wordsFound.length; i++) {
        wordsFound[i].unhighlight();
      }
      const words = document.getElementsByClassName("word");
      for (var i = 0; i < words.length; i++) {
        words[i].classList.remove("focused");
      }
      wordElement.classList.add("focused");
      word.highlight();
    });

    // focus first word
    if (i === 0) {
      wordElement.classList.add("focused");
      wordElement.dispatchEvent(new MouseEvent("mouseenter"));
    }

    $("discovered").appendChild(wordElement);
  }
}
