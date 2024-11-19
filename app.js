const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const boldBtn = document.getElementById("boldBtn");
const italicBtn = document.getElementById("italicBtn");
const underlineBtn = document.getElementById("underlineBtn");
const fontDropdown = document.getElementById("fontDropdown");
const increaseFontBtn = document.getElementById("increaseFontBtn");
const decreaseFontBtn = document.getElementById("decreaseFontBtn");
const addTextBtn = document.getElementById("addTextBtn");
const editor = document.querySelector(".editor");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const leftAlignBtn = document.getElementById("leftAlignBtn");
const centerAlignBtn = document.getElementById("centerAlignBtn");
const rightAlignBtn = document.getElementById("rightAlignBtn");

let history = [];
let historyIndex = -1;

let activeTextBox = null;

function saveState() {
    history = history.slice(0, historyIndex + 1); 
    history.push(editor.innerHTML); 
    historyIndex++;
    localStorage.setItem("editorState", JSON.stringify(history)); 
}

window.onload = function() {
    const savedHistory = JSON.parse(localStorage.getItem("editorState"));
    if (savedHistory) {
        history = savedHistory;
        historyIndex = history.length - 1;
        editor.innerHTML = history[historyIndex];
        addEventListenersToTextBoxes();  
    } else {
        saveState(); 
    }
};

undoBtn.addEventListener("click", () => {
if (historyIndex > 0) {
    historyIndex--;
    editor.innerHTML = history[historyIndex];
    addEventListenersToTextBoxes();
}
});

redoBtn.addEventListener("click", () => {
if (historyIndex < history.length - 1) {
    historyIndex++;
    editor.innerHTML = history[historyIndex];
    addEventListenersToTextBoxes();
}
});

boldBtn.addEventListener("click", () => {
applyCommand("bold");
});

italicBtn.addEventListener("click", () => {
applyCommand("italic");
});

underlineBtn.addEventListener("click", () => {
applyCommand("underline");
});

fontDropdown.addEventListener("change", () => {
const font = fontDropdown.value;
applyCommand("fontName", font);
});

increaseFontBtn.addEventListener("click", () => {
adjustFontSize(1);
});

decreaseFontBtn.addEventListener("click", () => {
adjustFontSize(-1);
});

addTextBtn.addEventListener("click", () => {
const newDiv = document.createElement("div");
newDiv.contentEditable = true;
newDiv.className = "text-box empty"; 
newDiv.innerHTML = ''; 
newDiv.draggable = true;
newDiv.style.width = "100px"; 
newDiv.style.height = "50px"; 
const deleteIcon = document.createElement("img");
deleteIcon.src = "./assets/delete.png"; 
deleteIcon.className = "delete-icon";
newDiv.appendChild(deleteIcon);
editor.appendChild(newDiv);
newDiv.focus(); 
saveState();
makeDraggable(newDiv); 
addEventListenersToTextBoxes();
});

clearBtn.addEventListener("click", () => {
editor.innerHTML = '';
history = [];
historyIndex = -1;
localStorage.removeItem("editorState");
saveState();
});

saveBtn.addEventListener("click", () => {
    const pdfName = prompt("Enter PDF name:");
    if (pdfName) {
        // Import jsPDF from the window object
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const textElements = editor.querySelectorAll(".text-box");
        textElements.forEach((element, index) => {
            doc.text(element.innerText, 10, 10 + (index * 10));
        });

        doc.save(`${pdfName}.pdf`);
    }
});


leftAlignBtn.addEventListener("click", () => {
applyTextAlignment("left");
});

centerAlignBtn.addEventListener("click", () => {
applyTextAlignment("center");
});

rightAlignBtn.addEventListener("click", () => {
applyTextAlignment("right");
});

function applyTextAlignment(alignment) {
if (activeTextBox) {
    activeTextBox.style.textAlign = alignment;
    saveState();
}
}

function applyCommand(command, value = null) {
if (activeTextBox) {
    activeTextBox.focus();
    document.execCommand(command, false, value);
}
saveState();
}

// Helper to adjust font size
function adjustFontSize(delta) {
if (activeTextBox) {
    const currentSize = parseInt(window.getComputedStyle(activeTextBox).fontSize);
    const newSize = currentSize + delta;
    activeTextBox.style.fontSize = `${newSize}px`;
    saveState();
}
}

// Handle text box input
function handleTextBoxInput(box) {
if (box.innerHTML.trim() === '') {
    box.classList.add("empty");
} else {
    box.classList.remove("empty");
}
}

// Show delete icon for 2 seconds
function showDeleteIcon(box) {
const deleteIcon = box.querySelector(".delete-icon");
if (deleteIcon) {
    deleteIcon.style.display = "block";
    setTimeout(() => {
        deleteIcon.style.display = "none";
    }, 2000); // Hide after 2 seconds
}
}

// Handle delete icon click
document.addEventListener("click", (event) => {
if (event.target.classList.contains("delete-icon")) {
    event.target.parentElement.remove();
    saveState();
}
});

// Make the text box draggable
function makeDraggable(element) {
let offsetX, offsetY;

element.addEventListener('dragstart', (e) => {
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    element.style.cursor = 'grabbing';
});

element.addEventListener('dragend', (e) => {
    const editorRect = editor.getBoundingClientRect();
    const newX = e.clientX - editorRect.left - offsetX;
    const newY = e.clientY - editorRect.top - offsetY;

    // Ensure text box stays within the editor
    const editorWidth = editor.offsetWidth;
    const editorHeight = editor.offsetHeight;

    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;

    const constrainedX = Math.min(Math.max(0, newX), editorWidth - elementWidth);
    const constrainedY = Math.min(Math.max(0, newY), editorHeight - elementHeight);

    element.style.left = `${constrainedX}px`;
    element.style.top = `${constrainedY}px`;
    element.style.cursor = 'grab';
    saveState();
});

element.addEventListener('drag', (e) => {
    e.preventDefault(); 
});

element.addEventListener("click", () => {
    activeTextBox = element; 
    showDeleteIcon(element); 
});
}

function addEventListenersToTextBoxes() {
document.querySelectorAll(".text-box").forEach(box => {
    makeDraggable(box);
    box.addEventListener("click", () => {
        activeTextBox = box;
        showDeleteIcon(box);
    });
    box.addEventListener("input", () => {
        handleTextBoxInput(box);
    });
});
}
