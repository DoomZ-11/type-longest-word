const wordPath = "longest-word.txt";
const tarChars = []

let curChar = 0;
let mistakes = 0;

const cursorState = {
    x: 0,
    y: 0,

    tarX: 0,
    tarY: 0
}

async function initializeMainText() {
    const element = document.getElementById("main-word");
    const data = await getTextByPath(wordPath);

    if (data === null) return; 

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < data.length; i++) {
        const span = document.createElement("span");
        span.textContent = data[i];
        span.classList.add("pending-char");

        fragment.appendChild(span);
        tarChars.push(span);
    }

    element.appendChild(fragment);
}

function getTextByPath(path) {
    return fetch(path)
        .then(path => path.text())
        .catch(err => { 
            console.log(err);
            return null;
        });
}

function handleInput() {
    document.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && curChar > 0) {
            curChar--;

            handleBackspace();
        }
        else if (e.key.length === 1 && curChar < tarChars.length) {
            handleChar(e.key);

            curChar++;
        }

        scrollCurCharIntoView();
        setCursorTarget();
        resetCursorBlink();
        updateCounter();
    });
}

function handleChar(char) {
    if (curChar >= tarChars.length) return;

    const tarChar = tarChars[curChar];
    const expected = tarChar.textContent;

    if (char === expected) {
        tarChar.classList.replace("pending-char", "correct-char");
    }
    else {
        tarChar.classList.replace("pending-char", "incorrect-char");

        mistakes++;
    }
}

function handleBackspace() {
    const tarChar = tarChars[curChar];

    if (tarChar.classList.contains("incorrect-char")) {
        mistakes--;
    }
    
    tarChar.classList.remove("correct-char");
    tarChar.classList.remove("incorrect-char");

    tarChar.classList.add("pending-char");
}

function lerpCursor() {
    const cursor = document.getElementById("cursor");
    const speed = 0.3;

    cursorState.x = lerp(
        cursorState.x,
        cursorState.tarX,
        speed
    );

    cursorState.y = lerp(
        cursorState.y,
        cursorState.tarY,
        speed
    );

    cursor.style.left = `${cursorState.x}px`;
    cursor.style.top = `${cursorState.y}px`;

    requestAnimationFrame(lerpCursor);
}

function setCursorTarget() {
    const cursor = document.getElementById("cursor");
    const tarChar = tarChars[curChar];

    if (!cursor || !tarChar) {
        cursor.style.height = 0;
        return;
    }

    const charRect = tarChar.getBoundingClientRect();
    const containerRect = document.querySelector(".text-container").getBoundingClientRect();

    cursorState.tarX = charRect.left - containerRect.left;
    cursorState.tarY = charRect.top - containerRect.top;

    cursor.style.height = `${charRect.height}px`;
}

function resetCursorBlink() {
    const cursor = document.getElementById("cursor");

    cursor.classList.remove("cursor-blink-animation");

    void cursor.offsetWidth;

    cursor.classList.add("cursor-blink-animation");
}

function scrollCurCharIntoView() {
    const element = tarChars[curChar];
    if (!element) return;

    element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
    });
}

function updateCounter() {
    const charCounter = document.getElementById("char-counter");
    const mistakeCounter = document.getElementById("mistake-counter");

    if (curChar > 0) {
        mistakeCounter.innerHTML = `${(roundTo((curChar - mistakes) / curChar, 4) * 100).toFixed(2)}% accuracy`;
    }
    else {
        mistakeCounter.innerHTML = ``;
    }

    if (curChar > 0) {
        charCounter.innerHTML = 
            `${curChar.toLocaleString('en-US')}/${tarChars.length.toLocaleString('en-US')}<br>` +
            `(${(roundTo(curChar / tarChars.length, 6) * 100).toFixed(4)}%)`;
    }
    else {
        charCounter.innerHTML = ``;
    }
}

function roundTo(num, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

async function main() {
    await initializeMainText();

    setCursorTarget();
    lerpCursor();

    handleInput();

    scrollCurCharIntoView();

    updateCounter();
}

document.addEventListener("DOMContentLoaded", main);