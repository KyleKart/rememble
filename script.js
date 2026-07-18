import { WORDS } from "./words.js";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let currentPage = 1;
let guessTotal = 1;
let nextLetter = 0;
const params = new URLSearchParams(window.location.search);
let id = params.get('id');

let rightGuessString;

if (id !== null && id < WORDS.length) {
  rightGuessString = WORDS[id];
} else {
  let randomIndex = Math.floor(Math.random() * WORDS.length);
  rightGuessString = WORDS[randomIndex];
  window.history.replaceState(null, null, `?id=${randomIndex}`);
  id = randomIndex;
}
console.log(rightGuessString);

function initBoard() {
  let board = document.getElementById("game-board");

  for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
    let row = document.createElement("div");
    row.className = "letter-row";

    for (let j = 0; j < 5; j++) {
      let box = document.createElement("div");
      box.className = "letter-box";
      row.appendChild(box);
    }

    board.appendChild(row);
  }
}

function shadeKeyBoard(letter, color) {
  for (const elem of document.getElementsByClassName("keyboard-button")) {
    if (elem.textContent === letter) {
      let oldColor = elem.style.backgroundColor;
      if (oldColor === "green") {
        return;
      }

      if (oldColor === "yellow" && color !== "green") {
        return;
      }

      elem.style.backgroundColor = color;
      break;
    }
  }
}

function deleteLetter() {
  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
  let box = row.children[nextLetter - 1];
  box.textContent = "";
  box.classList.remove("filled-box");
  currentGuess.pop();
  nextLetter -= 1;
}

function checkGuess() {
  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
  let guessString = "";
  let rightGuess = Array.from(rightGuessString);

  for (const val of currentGuess) {
    guessString += val;
  }

  if (guessString.length != 5) {
    alert("Not enough letters!");
    return;
  }

  if (!WORDS.includes(guessString)) {
    alert("Word not in list!");
    return;
  }

  guessTotal++;

  var letterColor = ["gray", "gray", "gray", "gray", "gray"];

  // check green
  for (let i = 0; i < 5; i++) {
    if (rightGuess[i] == currentGuess[i]) {
      letterColor[i] = "green";
      rightGuess[i] = "#";
    }
  }

  // check yellow
  for (let i = 0; i < 5; i++) {
    if (letterColor[i] == "green") continue;

    for (let j = 0; j < 5; j++) {
      if (rightGuess[j] == currentGuess[i]) {
        letterColor[i] = "yellow";
        rightGuess[j] = "#";
        break;
      }
    }
  }

  // render result
  for (let i = 0; i < 5; i++) {
    let box = row.children[i];
    let delay = 250 * i;

    setTimeout(() => {
      animateCSS(box, "flipInX");

      let color = letterColor[i];
      let letter = guessString.charAt(i);

      box.style.backgroundColor = color;

      const isExactMatch = guessString === rightGuessString;

      if (isExactMatch) {
        box.textContent = letter;
        const hideButtons = document.querySelectorAll('.hide-on-end');
        hideButtons.forEach(btn => {
          btn.classList.add('hidden');
        });
        const shareBtn = document.getElementById('share-quit-btn');
        shareBtn.textContent = "Share";
      } else {
        if (color === "gray") {
          box.textContent = letter;
        } else {
          box.textContent = "";
        }
      }

      shadeKeyBoard(letter, color);
    }, delay);
  }

  if (guessString === rightGuessString) {
    guessesRemaining = 0;
    return;
  } else {
    guessesRemaining -= 1;
    currentGuess = [];
    nextLetter = 0;

    if (guessesRemaining === 0) {
      setTimeout(() => {
        currentPage++;
    const counter = document.getElementById("page-counter");
    if (counter) {
        counter.textContent = `Page ${currentPage}`;
    }
        guessesRemaining = NUMBER_OF_GUESSES;
        currentGuess = [];
        nextLetter = 0;

        const rows = document.getElementsByClassName("letter-row");

        for (let row of rows) {
          for (let box of row.children) {
            box.textContent = "";
            box.style.backgroundColor = "";
            box.classList.remove("filled-box");
          }
        }

        for (const key of document.getElementsByClassName("keyboard-button")) {
          key.style.backgroundColor = "";
        }
      }, 1800);
    }
  }
}

function insertLetter(pressedKey) {
  if (nextLetter === 5) {
    return;
  }
  pressedKey = pressedKey.toLowerCase();

  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
  let box = row.children[nextLetter];
  animateCSS(box, "pulse");
  box.textContent = pressedKey;
  box.classList.add("filled-box");
  currentGuess.push(pressedKey);
  nextLetter += 1;
}

const animateCSS = (element, animation, prefix = "animate__") =>
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = element;
    node.style.setProperty("--animate-duration", "0.3s");

    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve("Animation ended");
    }

    node.addEventListener("animationend", handleAnimationEnd, { once: true });
  });

function getShareText() {
    const rows = document.getElementsByClassName("letter-row");
    let gridEmoji = "";

    const rowsToProcess = 6 - guessesRemaining; 

    for (let i = 0; i < rowsToProcess; i++) {
        for (let box of rows[i].children) {
            const color = box.style.backgroundColor;
            if (color === "green") gridEmoji += "🟩";
            else if (color === "yellow") gridEmoji += "🟨";
            else if (color === "gray") gridEmoji += "⬛";
        }
        gridEmoji += "\n";
    }

    return `Rememble ∞${id}
Page ${currentPage} - ${guessTotal} Total Guesses
${gridEmoji}
https://kylekart.github.io/rememble/?id=${id}`;
}

document.addEventListener("keyup", (e) => {

    let pressedKey = String(e.key);

  if (pressedKey === "Share") {
    const text = getShareText();
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
    return;
  }

  if (guessesRemaining === 0) {
    return;
  }

  if (pressedKey === "Backspace" && nextLetter !== 0) {
    deleteLetter();
    return;
  }

  if (pressedKey === "Enter") {
    checkGuess();
    return;
  }

  if (pressedKey === "Quit") {
    guessString = rightGuessString;
    alert(`The right word was: "${rightGuessString}"`);
    return;
  }

  let found = pressedKey.match(/[a-z]/gi);
  if (!found || found.length > 1) {
    return;
  } else {
    insertLetter(pressedKey);
  }
});

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
  const target = e.target;

  if (!target.classList.contains("keyboard-button")) {
    return;
  }
  let key = target.textContent;

  if (key === "Del") {
    key = "Backspace";
  }

  document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
});

initBoard();
