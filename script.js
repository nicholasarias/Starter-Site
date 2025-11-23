const ID = 324854
const Token = "orozz1NNnlOphkdtzEr2i5sCg3XzvMAa"

// The function responsible for fetching all verses and updating the display
function getAllVerses(){
    console.log("start")
    console.log("db id "+ID)
    console.log("auth token " +Token)
    fetch("https://api.baserow.io/api/database/rows/table/747569/?user_field_names=true", {
        method: "GET",
        headers: {
            "Authorization": "Token " + Token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data.results)
        if (data.results && Array.isArray(data.results)) {
            displayVerses(data.results); 
        } else {
            console.error("API response structure is unexpected. Looking for data.results array.");
        }
    })
    .catch(error => {
        console.error("Fetch Error:", error);
    });
}

function getverse() {
    // 1. Get the verse search query from the input field
    var versesearch = document.getElementById("lookupInput").value;
    
    // Log the search term for debugging purposes
    console.log("Searching for:", versesearch); 
    
    // 2. Perform the fetch request
    fetch(`https://bible-api.com/${encodeURIComponent(versesearch)}?translation=asv`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} for search: ${versesearch}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Verse Data Received:", data);
        const rowData = {
            "Book": data.verses[0].book_name, 
            "Chapter": data.verses[0].chapter,
            "Verse": data.verses[0].verse,
            "Text": data.text,
            "Favorite": true 
        }
        fetch("https://api.baserow.io/api/database/rows/table/747569/?user_field_names=true", {
            method: "POST",
        headers: {
            "Authorization": `Token ${Token}`, 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify(rowData)

        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error(`HTTP error! Status: ${response.status}. Baserow Error: ${JSON.stringify(error)}`);
                });
            }
            return response.json();
        })
        .then(newRow => {
            console.log("✅ Row created successfully:", newRow);
            // After creating a new row, reload the list to show the new item
            getAllVerses(); 
        })
        .catch(error => {
            console.error("❌ Baserow Fetch Error:", error);
        });
    })
    .catch(error => {
        console.error("Fetch Error:", error);
    });
} 

/**
 * Executes the DELETE operation against the Baserow API for a specific row ID.
 * @param {string} rowId - The unique ID of the row to delete.
 */
function deleteVerse(event) {
    // 1. Prevent any default form action (if the button was inside a form)
    event.preventDefault(); 
    
    // 2. Find the Row ID from the nearest parent verse-card
    const deleteButton = event.target;
    // .closest finds the nearest ancestor element matching the selector
    const verseCard = deleteButton.closest('.verse-card'); 
    const rowIdToDelete = verseCard ? verseCard.dataset.rowId : null;

    if (!rowIdToDelete) {
        console.error("Could not find Row ID to delete.");
        return;
    }

    console.log(`Attempting to delete row ID: ${rowIdToDelete}`);

    // 3. Construct the DELETE fetch request
    fetch(`https://api.baserow.io/api/database/rows/table/747569/${rowIdToDelete}/`, {
        method: "DELETE",
        headers: {
            "Authorization": "Token " + Token
        }
    })
    .then(response => {
        // A successful DELETE usually returns an HTTP 204 No Content status
        if (response.status === 204) {
            console.log(`✅ Successfully deleted row ID: ${rowIdToDelete}`);
            // 4. Refresh the display by calling the Read function
            // This is the clean way to "refresh" the list without reloading the page.
            getAllVerses(); 
        } else if (response.status === 404) {
             console.error(`❌ Delete Error: Row ID ${rowIdToDelete} not found.`);
        }
        else {
            // Handle other error statuses
            throw new Error(`HTTP error! Status: ${response.status} during deletion.`);
        }
    })
    .catch(error => {
        console.error("❌ Delete Fetch Error:", error);
    });
}


/**
 * Takes the 'results' array from the Baserow List Rows API and renders them,
 * adding a delete button to each card.
 * @param {Array<Object>} versesArray - The array of verse row objects.
 */
function displayVerses(versesArray) {
    const versesContainer = document.getElementById("verses");
    
    // Clear the container before loading new results
    versesContainer.innerHTML = ''; 

    // 1. Iterate over the array of verse objects
    versesArray.forEach(verse => {
        // Logic for displaying favorite status
        var Favoritecontent = verse.Favorite ? "⭐" : "";

        // --- A. Create the main card container ---
        const verseCard = document.createElement("div");
        verseCard.className = 'verse-card card'; 
        verseCard.dataset.rowId = verse.id; 

        // --- B. Create elements for content ---
        
        // 1. Title/Reference element (e.g., John 3:16)
        const referenceHeader = document.createElement("h4");
        referenceHeader.textContent = `${verse.Book} ${verse.Chapter}:${verse.Verse} ${Favoritecontent}`;
        
        // 2. Text element
        const verseTextParagraph = document.createElement("p");
        verseTextParagraph.textContent = verse.Text;
        
        // 3. Metadata element (Row ID)
        const metadataSmall = document.createElement("small");
        metadataSmall.textContent = `DB Row ID: ${verse.id}`;
        
        // 4. DELETE BUTTON: New element for the delete operation
        const deleteButton = document.createElement("button");
        deleteButton.textContent = '❌ Delete';
        deleteButton.className = 'delete-btn';
        
        // Add the event listener that calls the new deleteVerse function
        deleteButton.addEventListener('click', deleteVerse);

        // --- C. Append all children to the parent card ---
        verseCard.appendChild(referenceHeader);
        verseCard.appendChild(verseTextParagraph);
        verseCard.appendChild(metadataSmall);
        verseCard.appendChild(deleteButton); // Append the delete button
        
        // --- D. Append the complete card to the page container ---
        versesContainer.appendChild(verseCard);
    });
}