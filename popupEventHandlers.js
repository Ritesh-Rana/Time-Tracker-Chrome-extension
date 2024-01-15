// popupEventHandlers.js

// Function to edit a specific entry
function editEntry(index) {
    const entriesContainer = document.getElementById("savedEntries");
    const entryDiv = entriesContainer.childNodes[index];
  
    if (entryDiv) {
      const textNode = entryDiv.childNodes[0];
      const editText = prompt("Edit the text:", textNode.textContent.trim());
  
      if (editText !== null) {
        // Update the text if the user didn't cancel
        textNode.textContent = `<strong>${index + 1}:</strong> ${editText} - `;
        editingIndex = index;
      }
    }
  }
  
  // Function to delete a specific entry
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
  