
        const ID = 324854
        const Token = "orozz1NNnlOphkdtzEr2i5sCg3XzvMAa"
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
  // Check if the request was successful (status code 200-299)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  // Parse the response body as JSON
  return response.json();
})
.then(data => {
  // Inside your getAllVerses().then(data => {...}) block:

console.log(data.results)
    // Check if 'results' exists and is an array (Standard Baserow structure)
    if (data.results && Array.isArray(data.results)) {
        displayVerses(data.results); // Pass the array of rows
    } else {
        console.error("API response structure is unexpected. Looking for data.results array.");
    }
})
.catch(error => {
  // Log any errors that occurred during the fetch operation
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
        // Check if the request was successful (status code 200-299)
        if (!response.ok) {
            // Throw an error if the response is not OK
            throw new Error(`HTTP error! Status: ${response.status} for search: ${versesearch}`);
        }
        // Return the parsed JSON body (this returns a new promise)
        return response.json();
    })
    .then(data => {
        // 3. Log the JSON data to the console if the fetch was successful
        console.log("Verse Data Received:", data);
        const rowData = {
        // Map the API fields to your Baserow table fields
        "Book": data.verses[0].book_name, 
        "Chapter": data.verses[0].chapter,
        "Verse": data.verses[0].verse,
        "Text": data.text,
        // Set 'Favorite' to true, as per your cURL example
        "Favorite": true 
    }
        fetch("https://api.baserow.io/api/database/rows/table/747569/?user_field_names=true", {
            method: "POST", // The cURL -X POST flag
        headers: {
            // The cURL -H "Authorization: ..." flag
            "Authorization": `Token ${Token}`, 
            // The cURL -H "Content-Type: ..." flag
            "Content-Type": "application/json" 
        },
    body: JSON.stringify(rowData)

    })
.then(response => {
        // Handle non-200 responses (e.g., 401 Unauthorized, 400 Bad Request)
        if (!response.ok) {
            // Read the error message from the response body for better debugging
            return response.json().then(error => {
                throw new Error(`HTTP error! Status: ${response.status}. Baserow Error: ${JSON.stringify(error)}`);
            });
        }
        // Parse the successful response (the newly created row data)
        return response.json();
    })
    .then(newRow => {
        console.log("✅ Row created successfully:", newRow);
    })
    .catch(error => {
        console.error("❌ Baserow Fetch Error:", error);
    });

        // Optional: You would typically update the DOM here, e.g.:
        // document.getElementById("output").textContent = data.text;
    })
    .catch(error => {
        // 4. Log any errors that occurred (network issues, API errors, etc.)
        console.error("Fetch Error:", error);
    });
} 
/**
 * Takes the 'results' array from the Baserow List Rows API and renders them.
 * @param {Array<Object>} versesArray - The array of verse row objects.
 */
function displayVerses(versesArray) {
    const versesContainer = document.getElementById("verses");
    
    // Clear the container before loading new results
    versesContainer.innerHTML = ''; 

    // 1. Iterate over the array of verse objects
    versesArray.forEach(verse => {
        var Favoritecontent =""
        if (verse.Favorite) {
            console.log ("verseisfavorited")
            Favoritecontent = "⭐"
            
        } else  {
            console.log ("verseisnotfavorited")
            
        }

        // --- A. Create the main card container ---
        const verseCard = document.createElement("div");
        verseCard.className = 'verse-card card'; 
        
        // Store the unique Row ID (verse.id) on the element itself.
        // This is vital for the future Update/Delete functionality.
        verseCard.dataset.rowId = verse.id; 

        // --- B. Create elements for content ---
        
        // 1. Title/Reference element (e.g., John 3:16)
        const referenceHeader = document.createElement("h4");
        // Access data using the Baserow field names: Book, Chapter, Verse
        referenceHeader.textContent = `${verse.Book} ${verse.Chapter}:${verse.Verse} ${Favoritecontent}`;
        
        // 2. Text element
        const verseTextParagraph = document.createElement("p");
        verseTextParagraph.textContent = verse.Text;
        
        // 3. Metadata element (Row ID)
        const metadataSmall = document.createElement("small");
        metadataSmall.textContent = `DB Row ID: ${verse.id}`;

        // --- C. Append all children to the parent card ---
        // This builds the structure in memory: <div class="verse-card">
        verseCard.appendChild(referenceHeader); // <h4>...</h4>
        verseCard.appendChild(verseTextParagraph); // <p>...</p>
        verseCard.appendChild(metadataSmall); // <small>...</small>
        
        // --- D. Append the complete card to the page container ---
        // This inserts the whole structure into the <div id="verses">
        versesContainer.appendChild(verseCard);
    });
}