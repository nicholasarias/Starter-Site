// Fake Login Sliding Panel
const fakeLogin = document.getElementById("fakeLogin");
const loginTab = document.getElementById("loginTab");
const closeBtn = document.getElementById("closeLogin");

loginTab.addEventListener("click", () => {
    fakeLogin.style.right = "20px";
});

closeBtn.addEventListener("click", () => {
    fakeLogin.style.right = "-300px";
});


// Back-End Bible Verse Lookup
const lookupBtn = document.getElementById("lookupBtn");
const lookupInput = document.getElementById("lookupInput");
const lookupResult = document.getElementById("lookupResult");

lookupBtn.addEventListener("click", () => {
    let ref = lookupInput.value.trim();
    if (!ref) {
        lookupResult.innerHTML = "Please enter a verse.";
        return;
    }
    fetchVerse(ref);
});

function fetchVerse(reference) {
    let url = `http://localhost:3000/api/verse?ref=${encodeURIComponent(reference)}`;
    lookupResult.innerHTML = "Loading verse...";

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                lookupResult.innerHTML = "Verse not found.";
            } else {
                lookupResult.innerHTML = `
                    <h3>${data.reference}</h3>
                    <p>${data.text}</p>
                `;
            }
        })
        .catch(err => {
            lookupResult.innerHTML = "Error fetching verse.";
            console.error(err);
        });
}

// CRUD Webhook
function submitverse() {
    const Uverse = document.getElementById("verseInput").value;

    fetch('https://n8n.deviatedsystems.com/webhook/15e6c70d-d5f1-4ef3-8f6e-500f10f013c2', {
        method: 'POST',
        headers: { 'verse': Uverse }
    })
    .then(res => res.json())
    .then(res => console.log(res))
    .catch(err => console.error(err));
}

document.getElementById("submitVerseBtn").onclick = submitverse;

// LOAD and DISPLAY VERSES
document.getElementById("loadVersesBtn").onclick = displayVerses;

function displayVerses() {
    fetch('https://n8n.deviatedsystems.com/webhook/15e6c70d-d5f1-4ef3-8f6e-500f10f013c2')
        .then(res => res.json())
        .then(data => renderVerses(data));
}

function renderVerses(verses) {
    let div = document.getElementById("verses");
    div.innerHTML = "";

    verses.forEach(verse => {
        let box = document.createElement("div");

        box.style.border = "1px solid black";
        box.style.borderRadius = "5px";
        box.style.padding = "10px";
        box.style.marginBottom = "10px";

        box.innerHTML = `
            <h3>${verse.Name}${verse.Favorite ? " ⭐" : ""}</h3>
            <p>${verse.VerseContent}</p>
            <hr>
            <p><em>${verse.Ai_Explain}</em></p>
        `;

        // FAVORITE BUTTON
        if (!verse.Favorite) {
            let favBtn = document.createElement("button");
            favBtn.innerText = "Favorite";
            favBtn.onclick = () => favoriteVerse(verse.id);
            box.appendChild(favBtn);
        } else {
            let removeFavBtn = document.createElement("button");
            removeFavBtn.innerText = "Remove Favorite";
            removeFavBtn.onclick = () => deleteFavoriteVerse(verse.id);
            box.appendChild(removeFavBtn);
        }

        // DELETE BUTTON
        let delBtn = document.createElement("button");
        delBtn.innerText = "Delete";
        delBtn.onclick = () => deleteVerse(verse.id);
        box.appendChild(delBtn);

        div.appendChild(box);
    });
}

// DELETE Verse
function deleteVerse(id) {
    fetch('https://n8n.deviatedsystems.com/webhook/15e6c70d-d5f1-4ef3-8f6e-500f10f013c2', {
        method: 'DELETE',
        headers: { 'verseId': id }
    })
    .then(res => res.json())
    .then(() => displayVerses());
}

// Add Favorite
function favoriteVerse(id) {
    fetch('https://n8n.deviatedsystems.com/webhook/15e6c70d-d5f1-4ef3-8f6e-500f10f013c3', {
        method: 'POST',
        headers: { 'verseId': id, 'favorite': true }
    })
    .then(res => res.json())
    .then(() => displayVerses());
}

// Remove Favorite
function deleteFavoriteVerse(id) {
    fetch('https://n8n.deviatedsystems.com/webhook/15e6c70d-d5f1-4ef3-8f6e-500f10f013c3', {
        method: 'POST',
        headers: { 'verseId': id, 'favorite': false }
    })
    .then(res => res.json())
    .then(() => displayVerses());
}
