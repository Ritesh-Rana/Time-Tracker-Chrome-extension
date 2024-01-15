let timerInterval;
let timerSeconds = 0;
let editingIndex = -1; // Track the index of the entry being edited

// Check if the timer is already running
chrome.storage.local.get("timerRunning", function (result) {
  if (result.timerRunning) {
    startTimer();
  }
});

// Check if there are saved entries and display them
chrome.storage.local.get("entries", function (result) {
  const entries = result.entries || [];
  displaySavedEntries(entries);
});

document.getElementById("startButton").addEventListener("click", startTimer);
document.getElementById("stopButton").addEventListener("click", stopTimer);
document.getElementById("saveButton").addEventListener("click", saveEntry);
document.getElementById("clearButton").addEventListener("click", clearAllData);

function startTimer() {
  if (!timerInterval) {
    timerInterval = setInterval(function () {
      timerSeconds++;
      updateTimerDisplay();
    }, 1000);
    chrome.storage.local.set({ "timerRunning": true });
  }
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  chrome.storage.local.set({ "timerRunning": false });
}

function resetTimer() {
  timerSeconds = 0;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const hours = Math.floor(timerSeconds / 3600);
  const minutes = Math.floor((timerSeconds % 3600) / 60);
  const seconds = timerSeconds % 60;
  document.getElementById("timerDisplay").innerText = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(number) {
  return number < 10 ? "0" + number : number;
}

function saveEntry() {
  const textInput = document.getElementById("textInput").value;
  const timerValue = document.getElementById("timerDisplay").innerText;

  if (editingIndex === -1) {
    // If not editing, save a new entry
    saveData(textInput, timerValue);
  } else {
    // If editing, update the existing entry
    updateData(editingIndex, textInput, timerValue);
    editingIndex = -1; // Reset editing index after updating
  }

  resetTimer();
}

function displaySavedEntries(entries) {
  const savedEntriesContainer = document.getElementById("savedEntries");
  savedEntriesContainer.innerHTML = "";

  entries.forEach((entry, index) => {
    const entryElement = document.createElement("div");
    entryElement.className = "saved-entry";
    entryElement.innerHTML = `<strong>${index + 1}:</strong> ${entry.text} - ${entry.time}
                              <button class="edit" data-id=${index}>Edit</button>
                              <button class="delete" data-id=${index}>Delete</button>`;
    savedEntriesContainer.appendChild(entryElement);
  });
  const deleteButtons = document.getElementsByClassName("delete");
  const editButtons = document.getElementsByClassName("edit");
  
  // Adding event listeners to delete buttons
  for (let i = 0; i < deleteButtons.length; i++) {
    console.log(deleteButtons[i]);
    deleteButtons[i].addEventListener("click", function() {
      deleteEntry(i);
    });
  }
  
  // Adding event listeners to edit buttons
  for (let i = 0; i < editButtons.length; i++) {
    editButtons[i].addEventListener("click", function() {
      editEntry(i);
    });
  }
  
}
function editEntry(index) {
  const entriesContainer = document.getElementById("savedEntries");
  const entryDiv = entriesContainer.childNodes[index];

  if (entryDiv) {
    const textNode = entryDiv.childNodes[0];
    const currentText = textNode.textContent.trim();

    // Create an input field for editing
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.value = currentText;

    // Replace the text node with the input field
    entryDiv.replaceChild(inputField, textNode);

    // Focus on the input field
    inputField.focus();

    // Add an event listener to handle the editing
    inputField.addEventListener("blur", function () {
      const editText = inputField.value.trim();

      if (editText !== "") {
        // Update the text if it's not empty
        textNode.innerHTML = `<strong>${index + 1}:</strong> ${editText} - `;
        editingIndex = index;
      } else {
        // Restore the previous text if the user entered an empty value
        textNode.innerHTML = `<strong>${index + 1}:</strong> ${currentText} - `;
      }
    });
  }
}


function deleteEntry(index) {
  const entriesContainer = document.getElementById("savedEntries");
  const entryDiv = entriesContainer.childNodes[index];

  if (entryDiv && confirm("Are you sure you want to delete this entry?")) {
    // Remove the entry if the user confirms
    entryDiv.remove();
    chrome.storage.local.get("entries", function (result) {
      const entries = result.entries || [];
      entries.splice(index, 1);
      chrome.storage.local.set({ "entries": entries });
      displaySavedEntries(entries);
    });
  }
}

function clearAllData() {
  chrome.storage.local.remove(["entries", "timerRunning"], function () {
    const savedEntriesContainer = document.getElementById("savedEntries");
    savedEntriesContainer.innerHTML = "";
    resetTimer();
    stopTimer();

  });
}

function saveData(text, time) {
  chrome.storage.local.get("entries", function (result) {
    const entries = result.entries || [];
    entries.push({ text, time });
    chrome.storage.local.set({ "entries": entries });
    displaySavedEntries(entries);
    stopTimer();
  });
}

function updateData(index, text, time) {
  chrome.storage.local.get("entries", function (result) {
    const entries = result.entries || [];
    entries[index] = { text, time };
    chrome.storage.local.set({ "entries": entries });
    displaySavedEntries(entries);
  });
}
