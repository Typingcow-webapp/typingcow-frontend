/***************DOM SELECTORS***************/

const RANDOM_QUOTE_API_URL =
  "https://api.quotable.io/random?minLength=85&maxLength=185";
const mainContent = document.querySelector("main header");
const time = document.querySelector("#timer");
const text = document.getElementById("text");
const textArr = text.textContent.split("");
const correctText = document.getElementById("correct");
const wpm = [...document.querySelectorAll(".wpm")];
const rawWpm = document.querySelector(".raw-wpm");
const cpm = document.querySelectorAll(".cpm");
const acc = [...document.querySelectorAll(".acc")];
const results = document.getElementById("results");
const keys = [...document.querySelectorAll(".wrapper div")];
const logo = document.getElementById("logo");
const timeChoice = document.getElementById("time");
const leaderboardBtns = [...document.querySelectorAll(".leaderboardBtn")];
const multiplayerBtn = document.getElementById("multiplayerBtn");
const supportBtn = document.getElementById("supportBtn");
const settingsBtns = [...document.querySelectorAll(".settingsBtn")];
const profileBtns = [...document.querySelectorAll(".profileBtn")];
const leaderboard = document.getElementById("leaderboard");
const multiplayerPage = document.getElementById("multiplayer-page");
const support = document.getElementById("support");
const settings = document.getElementById("settings");
const profile = document.getElementById("profile");
const overlay = document.getElementById("overlay");
const mobileOverlay = document.getElementById("mobile-overlay");
const footer = document.querySelector("footer");
const userInput = document.getElementById("user-input");
const capslock = document.getElementById("capslock");
const userStats = document.getElementById("user-stats");
const username = document.querySelectorAll(".user-name");
const signOut = document.getElementById("sign-out");
const hamburgerMenuCheckbox = document.getElementById("checkbox");
const mobileNav = document.getElementById("mobile-navigation");
const guestText = document.getElementById("guest-text");
const themes = document.querySelectorAll("input[type='radio']");
const loginError = document.getElementById("login-error");
const signupError = document.getElementById("signup-error");
const winner = document.getElementById("winner");

const loadingText = document.getElementById("loading-text");

const socket = io("https://dry-thicket-18544.herokuapp.com", {
  transports: ["websocket", "polling"],
});

// const socket = io("http://localhost:3000", {
//   transports: ["websocket", "polling"],
// });

socket.on("init", handleInit);
socket.on("gameCode", handleGameCode);
socket.on("startGame", handleStartGame);
socket.on("unknownGame", handleUnknownGame);
socket.on("tooManyPlayers", handletooManyPlayers);
socket.on("displayPlayer1", handleDisplayPlayer1);
socket.on("displayPlayer2", handleDisplayPlayer2);
socket.on("displayPlayer2Globally", handledisplayPlayer2Globally);
socket.on("playerScores", handlePlayerScores);

const newGameBtn = document.getElementById("new-game-btn");
const joinGameBtn = document.getElementById("join-game-btn");
const gameCodeInput = document.getElementById("game-code-input");
const gameCodeDisplay = document.getElementById("game-code-display");
const player1 = document.getElementById("player-1");
const player2 = document.getElementById("player-2");

let gameCode_;
let timerIntervalId;

newGameBtn.addEventListener("click", () => {
  restart();

  socket.emit("newGame", localStorage.getItem("username"));

  document.querySelector(".game-code").style.display = "block";
  document.querySelector(".players-display").style.display = "block";

  userInput.setAttribute("disabled", "true");

  mainContent.style.display = "flex";
  footer.style.display = "flex";
  multiplayerPage.style.display = "none";
});

joinGameBtn.addEventListener("click", () => {
  gameCode_ = gameCodeInput.value;

  socket.emit("joinGame", gameCode_, localStorage.getItem("username"));

  document.querySelector(".players-display").style.display = "block";

  mainContent.style.display = "flex";
  footer.style.display = "flex";
  multiplayerPage.style.display = "none";
});

const backendURL = "https://dry-thicket-18544.herokuapp.com";
// const backendURL = "http://localhost:3000";

if (localStorage.getItem("theme") != undefined) {
  document.body.classList = localStorage.getItem("theme");
}

username.forEach((el) => {
  el.textContent = localStorage.getItem("username");
});

if (localStorage.getItem("authenticated") === "true") {
  guestText.textContent = null;
}

userInput.focus();

/***************VARIABLES***************/

let keypressed = false;
let timeUp = false;
let selectedTime = 15;
let mistakes = 0;
let numCharsWritten = 0;
let wrong = false;
let once = false;
let clickedProfile = false;
let clickedLeaderboard = false;
let numOfChars = 0;
let allCorrect = true;
let correctLetter = true;

let playerNumber;

/***************FUNCTIONS***************/

function restart() {
  displayRandomQuote();

  keypressed = false;

  mainContent.style.display = "flex";
  footer.style.display = "flex";
  results.style.display = "none";
  leaderboard.style.display = "none";
  profile.style.display = "none";
  settings.style.display = "none";
  multiplayerPage.style.display = "none";
  overlay.style.display = "none";
  mobileOverlay.style.display = "none";

  if (timerIntervalId) {
    clearInterval(timerIntervalId);
  }

  time.textContent = "15";
  userInput.value = "";

  wpm.forEach((el) => (el.textContent = "0"));
  cpm.forEach((el) => (el.textContent = "0"));
  acc.forEach((el) => (el.textContent = "0%"));
  rawWpm.textContent = "0";

  document.querySelector(".game-code").style.display = "none";
  document.querySelector(".players-display").style.display = "none";
}

function handlePlayerScores(scores) {
  if (scores.length === 2) {
    if (
      scores[0]["player2"] &&
      +scores[0][Object.keys(scores[0])] > +scores[1][Object.keys(scores[1])]
    ) {
      winner.textContent = "Player 2 wins!";
    } else if (
      scores[0]["player1"] &&
      +scores[0][Object.keys(scores[0])] > +scores[1][Object.keys(scores[1])]
    ) {
      winner.textContent = "Player 1 wins!";
    } else if (
      scores[1]["player2"] &&
      +scores[1][Object.keys(scores[1])] > +scores[0][Object.keys(scores[0])]
    ) {
      winner.textContent = "Player 2 wins!";
    } else if (
      scores[1]["player1"] &&
      +scores[1][Object.keys(scores[1])] > +scores[0][Object.keys(scores[0])]
    ) {
      winner.textContent = "Player 1 wins!";
    } else {
      winner.textContent = "It's a tie!";
    }

    console.log(scores);
  }
}

function handledisplayPlayer2Globally(username) {
  player2.textContent = username;
}

function handleDisplayPlayer1(username) {
  player1.textContent = username;
}

function handleDisplayPlayer2(players, gameCode) {
  player1.textContent = players[gameCode][0];
  player2.textContent = players[gameCode][1];
}

function handleInit(number) {
  playerNumber = number;
}

function handleGameCode(gameCode) {
  gameCodeDisplay.textContent = gameCode;

  gameCode_ = gameCodeDisplay.textContent;
}

function handleStartGame() {
  userInput.focus();

  keypressed = true;
  startTimer();
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = "";
  gameCodeDisplay.textContent = "";
}

function handleUnknownGame() {
  reset();
  console.log("unknown game");
}

function handletooManyPlayers() {
  reset();
  console.log("Too many players");
}

const startTimer = () => {
  timerIntervalId = setInterval(() => {
    if (time.textContent !== "0") {
      time.textContent = +time.textContent - 1;
    } else {
      if (!once) {
        showResults();

        socket.emit("endGame", gameCode_, wpm[0].textContent, playerNumber);

        if (localStorage.getItem("authenticated") === "true") {
          fetch(`${backendURL}/api/user/result`, {
            method: "POST",
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              wpm: wpm[0].textContent,
              cpm: cpm[0].textContent,
              acc: acc[0].textContent,
              timer: `${selectedTime}s`,
            }),
          });

          fetch(`${backendURL}/api/user/pb`, {
            method: "GET",
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
              "Content-Type": "application/json",
            },
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.length === 0) {
                fetch(`${backendURL}/api/user/pb`, {
                  method: "POST",
                  headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    timer: `${selectedTime}s`,
                    wpm: wpm[0].textContent,
                    cpm: cpm[0].textContent,
                    acc: acc[0].textContent,
                  }),
                });
              } else {
                let removedTimer;
                let removedWpm;
                let removedCpm;
                let removedAcc;
                let alreadyExists = false;
                let shouldBeAdded = false;

                for (let i = 0; i < data.length; i++) {
                  if (data[i].timer === `${selectedTime}s`) {
                    alreadyExists = true;

                    if (+data[i].wpm < +wpm[0].textContent) {
                      removedTimer = data[i].timer;
                      removedWpm = data[i].wpm;
                      removedCpm = data[i].cpm;
                      removedAcc = data[i].acc;
                      shouldBeAdded = true;
                    }

                    break;
                  } else {
                    continue;
                  }
                }

                if (!alreadyExists) {
                  fetch(`${backendURL}/api/user/pb`, {
                    method: "POST",
                    headers: {
                      Authorization: "Bearer " + localStorage.getItem("token"),
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      timer: `${selectedTime}s`,
                      wpm: wpm[0].textContent,
                      cpm: cpm.textContent,
                      acc: acc[0].textContent,
                    }),
                  });
                } else if (shouldBeAdded) {
                  fetch(`${backendURL}/api/user/pb`, {
                    method: "DELETE",
                    headers: {
                      Authorization: "Bearer " + localStorage.getItem("token"),
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      timer: removedTimer,
                      wpm: removedWpm,
                      cpm: removedCpm,
                      acc: removedAcc,
                    }),
                  });

                  fetch(`${backendURL}/api/user/pb`, {
                    method: "POST",
                    headers: {
                      Authorization: "Bearer " + localStorage.getItem("token"),
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      timer: `${selectedTime}s`,
                      wpm: wpm[0].textContent,
                      cpm: cpm.textContent,
                      acc: acc[0].textContent,
                    }),
                  });
                }
              }
            });
        }

        once = true;
      }
    }
  }, 1000);
};

function formSubmit(event, method) {
  event.preventDefault();

  const url = `${backendURL}/api/${method}?username=${event.target[0].value}&password=${event.target[1].value}`;

  if (event.target.id === "register") {
    document.getElementById("login").children[1].focus();
  }

  event.target[0].value = null;
  event.target[1].value = null;

  return new Promise((res, req) => {
    fetch(url, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem("token", data.token);
        res(localStorage.getItem("token"));
      });
  });
}

const getUserStats = () => {
  return new Promise((res, req) => {
    fetch(`${backendURL}/api/user/result`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => res(data.user.results));
  });
};

const getUserPbs = () => {
  return new Promise((res, req) => {
    fetch(`${backendURL}/api/user/pb`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => res(data))
      .catch(() => {
        if (method === "signup") {
          signupError.style.display = "block";
        }
      });
  });
};

const getRandomQuote = () => {
  userInput.setAttribute("disabled", "true");
  loadingText.style.display = "block";
  text.style.display = "none";

  return fetch(RANDOM_QUOTE_API_URL)
    .then((response) => response.json())
    .then((data) => {
      loadingText.style.display = "none";
      text.style.display = "block";
      userInput.removeAttribute("disabled");

      userInput.focus();

      return data.content;
    });
};

const displayRandomQuote = async () => {
  const quote = await getRandomQuote();

  userInput.value = null;
  text.textContent = "";

  quote.split("").forEach((char) => {
    const span = document.createElement("span");

    span.innerText = char;

    text.appendChild(span);
  });
};

function showResults() {
  mainContent.style.display = "none";
  results.style.display = "flex";
  footer.style.display = "none";
}

displayRandomQuote();

/***************EVENT LISTENERS***************/

window.onload = () => {
  userInput.onpaste = (e) => e.preventDefault();
};

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.ctrlKey === true) {
    restart();
  }
});

themes.forEach((el) => {
  el.addEventListener("change", (e) => {
    localStorage.setItem("theme", e.target.id);
    document.body.classList = localStorage.getItem("theme");
  });
});

hamburgerMenuCheckbox.addEventListener("change", () => {
  mobileNav.classList.toggle("onscreen");
  mobileOverlay.classList.toggle("visible");
});

timeChoice.addEventListener("change", (e) => {
  selectedTime = +timeChoice.options[timeChoice.selectedIndex].value;
  time.textContent = selectedTime;
});

document
  .getElementById("register")
  .addEventListener("submit", (e) => formSubmit(e, "signup"));

document.getElementById("login").addEventListener("submit", async (e) => {
  const url = `${backendURL}/api/user/profile`;
  const token = await formSubmit(e, "login");

  fetch(url, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("authenticated", "true");

      username.forEach((el) => {
        el.textContent = localStorage.getItem("username");
      });

      guestText.textContent = "";

      profile.style.display = "none";
      overlay.style.display = "none";
    })
    .catch((err) => {
      loginError.style.display = "block";
    });
});

signOut.addEventListener("click", () => {
  fetch(`${backendURL}/api/logout`, {
    method: "GET",
  });

  localStorage.removeItem("username");
  localStorage.removeItem("token");
  localStorage.removeItem("authenticated");

  username.textContent = null;

  window.location.reload();
});

supportBtn.addEventListener("click", () => {
  support.style.display = "flex";
  overlay.style.display = "block";
});

leaderboardBtns.forEach((el) => {
  el.addEventListener("click", (e) => {
    if (
      e.target.parentElement.parentElement === mobileNav ||
      e.target.parentElement.parentElement.parentElement === mobileNav
    ) {
      mobileNav.classList.remove("onscreen");
      mobileOverlay.classList.remove("visible");
    }

    if (localStorage.getItem("authenticated") !== "true") {
      profile.style.display = "flex";
      overlay.style.display = "block";
    } else {
      leaderboard.style.display = "flex";
      overlay.style.display = "block";

      if (!clickedLeaderboard) {
        fetch(`${backendURL}/api/user/leaderboard`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            let userPbs = [];
            let rank = 1;

            data.forEach((user) => {
              let fifteenSecs;

              user.pb.forEach((el, index) => {
                if (el.timer === "15s") {
                  fifteenSecs = index;
                }
              });

              if (user.pb[fifteenSecs] != undefined) {
                userPbs.push({ username: user.username, pb: +user.pb[0].wpm });
              }
            });

            userPbs = userPbs.sort((a, b) => b.pb - a.pb);

            userPbs.forEach((el) => {
              const tableRow = document.createElement("tr");
              const username = document.createElement("td");
              const pb = document.createElement("td");
              let userRank = document.createElement("td");

              username.textContent = el.username;
              pb.textContent = el.pb;
              userRank.textContent = rank;

              rank++;

              tableRow.appendChild(userRank);
              tableRow.appendChild(username);
              tableRow.appendChild(pb);

              leaderboard.children[0].children[1].appendChild(tableRow);
            });
          });

        clickedLeaderboard = true;
      }
    }
  });
});

multiplayerBtn.addEventListener("click", () => {
  if (localStorage.getItem("authenticated") !== "true") {
    profile.style.display = "flex";
    overlay.style.display = "block";
  } else {
    mainContent.style.display = "none";
    results.style.display = "none";
    footer.style.display = "none";
    multiplayerPage.style.display = "flex";
  }
});

settingsBtns.forEach((el) => {
  el.addEventListener("click", (e) => {
    if (
      e.target.parentElement.parentElement === mobileNav ||
      e.target.parentElement.parentElement.parentElement === mobileNav
    ) {
      mobileNav.classList.remove("onscreen");
      mobileOverlay.classList.remove("visible");
    }

    if (localStorage.getItem("authenticated") !== "true") {
      profile.style.display = "flex";
      overlay.style.display = "block";
    } else {
      settings.style.display = "flex";
      overlay.style.display = "block";
    }
  });
});

profileBtns.forEach((el) => {
  el.addEventListener("click", async (e) => {
    if (
      e.target.parentElement.parentElement === mobileNav ||
      e.target.parentElement.parentElement.parentElement === mobileNav
    ) {
      mobileNav.classList.remove("onscreen");
      mobileOverlay.classList.remove("visible");
    }

    if (localStorage.getItem("authenticated") !== "true") {
      profile.style.display = "flex";
      overlay.style.display = "block";
    } else {
      if (!clickedProfile) {
        mainContent.style.display = "none";
        results.style.display = "none";
        footer.style.display = "none";
        userStats.style.display = "flex";
        signOut.style.display = "block";
        document.querySelector("nav > ul").style.display = "none";

        const userPbs = await getUserPbs();

        userPbs.forEach((el) => {
          const tableRow = document.createElement("tr");

          const timer = document.createElement("td");
          const wpm = document.createElement("td");
          const cpm = document.createElement("td");
          const acc = document.createElement("td");

          timer.textContent = el.timer;
          wpm.textContent = el.wpm;
          cpm.textContent = el.cpm;
          acc.textContent = el.acc;

          tableRow.appendChild(timer);
          tableRow.appendChild(wpm);
          tableRow.appendChild(cpm);
          tableRow.appendChild(acc);

          document.querySelector("#user-pbs tbody").appendChild(tableRow);
        });

        const userResults = await getUserStats();

        userResults.forEach((el) => {
          const tableRow = document.createElement("tr");

          const wpm = document.createElement("td");
          const cpm = document.createElement("td");
          const acc = document.createElement("td");
          const timer = document.createElement("td");

          wpm.textContent = el.wpm;
          cpm.textContent = el.cpm;
          acc.textContent = el.acc;
          timer.textContent = el.timer;

          tableRow.appendChild(wpm);
          tableRow.appendChild(cpm);
          tableRow.appendChild(acc);
          tableRow.appendChild(timer);

          document.querySelector("#all-results tbody").prepend(tableRow);
        });

        clickedProfile = true;
      }
    }
  });
});

overlay.addEventListener("click", () => {
  leaderboard.style.display = "none";
  settings.style.display = "none";
  profile.style.display = "none";
  support.style.display = "none";
  overlay.style.display = "none";
});

userInput.addEventListener("input", (e) => {
  timeChoice.setAttribute("disabled", "true");

  const quoteArr = text.querySelectorAll("span");
  const userInputArr = userInput.value.split("");

  let finished = false;

  if (e.inputType === "deleteContentBackward") {
    numOfChars--;
  } else {
    numOfChars++;
    numCharsWritten++;
  }

  quoteArr.forEach((char, index, arr) => {
    // if (
    //   userInputArr[index] !== char.textContent &&
    //   userInputArr[index] != null &&
    //   userInputArr[index + 1] == null
    // ) {
    //   mistakes++;
    // }

    if (userInputArr[index] == null) {
      char.classList.remove("correct");
      char.classList.remove("incorrect");
    } else if (userInputArr[index] === char.textContent) {
      char.classList.add("correct");
      char.classList.remove("incorrect");
    } else {
      char.classList.add("incorrect");
      char.classList.remove("correct");

      // Check if the mistake is in the current letter

      if (userInputArr[index] !== char && userInputArr[index + 1] == null) {
        console.log("last letter mistake");

        allCorrect = false;
      }
    }

    if (userInputArr[arr.length - 1] != null) finished = true;
  });

  if (numOfChars === 5 && e.inputType !== "deleteContentBackward") {
    rawWpm.textContent = +rawWpm.textContent + 1 * (60 / +selectedTime);

    if (allCorrect) {
      wpm.forEach((el) => {
        el.textContent = +el.textContent + 1 * (60 / +selectedTime);
      });

      cpm.forEach((el) => {
        el.textContent = +el.textContent + 5 * (60 / +selectedTime);
      });
    } else {
      mistakes++;
    }

    if ((numCharsWritten - mistakes) * (100 / numCharsWritten) < 0) {
      acc.forEach((el) => (el.textContent = "0.00%"));
    } else if ((numCharsWritten - mistakes) * (100 / numCharsWritten) > 100) {
      acc.forEach((el) => (el.textContent = "100.00%"));
    } else {
      acc.forEach((el) => {
        el.textContent = `${(
          (numCharsWritten - mistakes) *
          (100 / numCharsWritten)
        ).toFixed(2)}%`;
      });
    }

    // console.log(numCharsWritten);

    allCorrect = true;
  }

  if (numOfChars === 5) {
    numOfChars = 0;
  }

  if (!keypressed) {
    startTimer();

    keypressed = true;
  }

  if (finished) displayRandomQuote();
});

document.addEventListener("keydown", (e) => {
  keys.forEach((key) => {
    if (e.key.toLowerCase() === key.id) {
      key.classList.add("pressed");
    }
  });
});

document.addEventListener("keyup", (e) => {
  if (e.getModifierState("CapsLock")) {
    capslock.style.visibility = "visible";
  } else {
    capslock.style.visibility = "hidden";
  }

  keys.forEach((key) => {
    if (e.key.toLowerCase() === key.id) {
      key.classList.remove("pressed");
    }
  });
});

logo.addEventListener("click", () => {
  restart();
});
