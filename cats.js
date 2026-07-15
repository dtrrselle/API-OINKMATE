/* =====================================================
   CATS.JS - Cat Facts Generator Logic
   Handles: fetching facts, updating UI, copy to clipboard,
            loading state, and error handling.
   ===================================================== */

// -----------------------------------------------------
// 1. GRAB REFERENCES TO HTML ELEMENTS
// -----------------------------------------------------
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const factText = document.getElementById("factText");
const factLength = document.getElementById("factLength");

const statusMessage = document.getElementById("statusMessage");
const statusSpinner = document.getElementById("statusSpinner");
const statusText = document.getElementById("statusText");

// Mobile navigation toggle elements
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

// The API endpoint we will fetch cat facts from
const API_URL = "https://catfact.ninja/fact";

// -----------------------------------------------------
// 2. MOBILE NAVIGATION MENU TOGGLE
// -----------------------------------------------------
// When the hamburger icon is clicked, show/hide the nav links
navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

// -----------------------------------------------------
// 3. HELPER FUNCTION: Show a status message
//    type can be "loading", "error", or "success"
// -----------------------------------------------------
function showStatus(type, message) {
  // Reset any previous status classes first
  statusMessage.classList.remove("loading", "error", "success");
  statusMessage.classList.add(type, "show");

  // Only show the spinner when we're in the loading state
  statusSpinner.style.display = type === "loading" ? "inline-block" : "none";

  statusText.textContent = message;
}

// Hides the status message box completely
function hideStatus() {
  statusMessage.classList.remove("show", "loading", "error", "success");
}

// -----------------------------------------------------
// 4. MAIN FUNCTION: Fetch a random cat fact from the API
// -----------------------------------------------------
async function fetchCatFact() {
  // Disable the button while fetching to prevent duplicate clicks
  generateBtn.disabled = true;
  copyBtn.disabled = true;

  // Show a loading message to the user
  showStatus("loading", "Fetching a new cat fact...");

  try {
    // Use fetch with GET request (GET is the default method)
    const response = await fetch(API_URL, {
      method: "GET",
    });

    // If the server responds with an error status code, throw an error
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    // Parse the JSON body of the response
    const data = await response.json();

    // The API returns an object like: { fact: "...", length: 41 }
    const fact = data.fact;

    // Update the card with the new fact and its character length
    factText.textContent = fact;
    factLength.textContent = fact.length;

    // Hide the loading/error message since the fetch succeeded
    hideStatus();
  } catch (error) {
    // Something went wrong (network issue, server error, etc.)
    console.error("Error fetching cat fact:", error);
    showStatus(
      "error",
      "Oops! Couldn't fetch a cat fact right now. Please try again."
    );
  } finally {
    // Re-enable the buttons whether the fetch succeeded or failed
    generateBtn.disabled = false;
    copyBtn.disabled = false;
  }
}

// -----------------------------------------------------
// 5. COPY THE CURRENT FACT TO THE CLIPBOARD
// -----------------------------------------------------
async function copyFact() {
  const currentFact = factText.textContent.trim();

  // Guard clause: don't try to copy if there's no real fact yet
  if (
    !currentFact ||
    currentFact === 'Click "Generate New Fact" to fetch a random cat fact!'
  ) {
    showStatus("error", "There's no fact to copy yet. Generate one first!");
    return;
  }

  try {
    // navigator.clipboard.writeText() is the modern way to copy text
    await navigator.clipboard.writeText(currentFact);
    showStatus("success", "Fact copied to clipboard!");

    // Automatically hide the success message after a couple seconds
    setTimeout(hideStatus, 2000);
  } catch (error) {
    console.error("Error copying fact:", error);
    showStatus("error", "Could not copy the fact. Please try manually.");
  }
}

// -----------------------------------------------------
// 6. EVENT LISTENERS FOR BUTTON CLICKS
// -----------------------------------------------------
generateBtn.addEventListener("click", fetchCatFact);
copyBtn.addEventListener("click", copyFact);

// -----------------------------------------------------
// 7. AUTOMATICALLY LOAD A FACT WHEN THE PAGE LOADS
// -----------------------------------------------------
document.addEventListener("DOMContentLoaded", fetchCatFact);