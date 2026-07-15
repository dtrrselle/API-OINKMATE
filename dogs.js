/* ============================================================
   PET HUB — DOG BREEDS EXPLORER
   Fetches breed data from the Dog API (dogapi.dog) v2 endpoint,
   which returns data in JSON:API format:
     {
       data: [
         {
           id: "1",
           type: "breed",
           attributes: {
             name: "...",
             description: "...",
             life: { min: 10, max: 12 },
             temperament: "...",
             hypoallergenic: false,
             ...
           }
         },
         ...
       ]
     }
   ============================================================ */

// GET-only endpoint. page[size]=100 pulls a large batch in a single
// request so the search bar can filter across the full list on the
// client side without extra network calls.
const API_URL = 'https://dogapi.dog/api/v2/breeds?page[size]=100';

/* ============================================================
   ELEMENT REFERENCES
   ============================================================ */
const loader       = document.getElementById('loader');
const errorBox      = document.getElementById('errorBox');
const emptyBox      = document.getElementById('emptyBox');
const breedGrid     = document.getElementById('breedGrid');
const resultsCount  = document.getElementById('resultsCount');
const searchInput   = document.getElementById('searchInput');
const navToggle     = document.getElementById('navToggle');
const navLinks      = document.getElementById('navLinks');

// Holds every breed fetched from the API so the search bar
// can filter in-memory instead of re-fetching on every keystroke.
let allBreeds = [];

/* ============================================================
   MOBILE NAV TOGGLE
   ============================================================ */
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

/* ============================================================
   UI HELPER FUNCTIONS
   ============================================================ */

// Show/hide the loading indicator
function setLoading(isLoading){
  loader.classList.toggle('visible', isLoading);
}

// Show/hide the "API unavailable" error box
function setError(hasError){
  errorBox.classList.toggle('visible', hasError);
}

// Show/hide the "no results found" empty-state box
function setEmpty(isEmpty){
  emptyBox.classList.toggle('visible', isEmpty);
}

// Escape any characters that would otherwise be interpreted as HTML
// when a breed's text fields are inserted into the page.
function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

/* ============================================================
   BUILD A SINGLE BREED CARD (returns an HTML string)
   ============================================================ */
function buildCardHtml(breed){
  const name        = breed.name || 'Unknown breed';
  const description = breed.description || 'No description available for this breed yet.';

  // Life span comes as { min, max }; some breeds may be missing it
  const lifeSpan = breed.life && (breed.life.min || breed.life.max)
    ? `${breed.life.min ?? '?'} - ${breed.life.max ?? '?'} years`
    : 'Not available';

  // Temperament is optional per the requirements
  const temperament = breed.temperament ? breed.temperament : 'Not specified';

  return `
    <article class="breed-card">
      <h2 class="breed-name">${escapeHtml(name)}</h2>
      <p class="breed-desc">${escapeHtml(description)}</p>
      <div class="breed-meta">
        <div class="row">
          <span class="label">Life span</span>
          <span class="value">${escapeHtml(lifeSpan)}</span>
        </div>
        <div class="row">
          <span class="label">Temperament</span>
          <span class="value">${escapeHtml(temperament)}</span>
        </div>
      </div>
    </article>
  `;
}

/* ============================================================
   RENDER A LIST OF BREEDS INTO THE GRID
   ============================================================ */
function renderBreeds(breedList){
  // No matches — show the empty state and clear the grid
  if (breedList.length === 0){
    breedGrid.innerHTML = '';
    resultsCount.textContent = '';
    setEmpty(true);
    return;
  }

  setEmpty(false);
  resultsCount.textContent = `Showing ${breedList.length} breed${breedList.length === 1 ? '' : 's'}`;
  breedGrid.innerHTML = breedList.map(buildCardHtml).join('');
}

/* ============================================================
   FETCH ALL DOG BREEDS (GET request via async/await)
   ============================================================ */
async function fetchBreeds(){
  setError(false);   // clear any previous error
  setEmpty(false);    // clear any previous empty-state message
  setLoading(true);   // show spinner
  breedGrid.innerHTML = '';
  resultsCount.textContent = '';

  try {
    // Explicit GET request — no body, no other HTTP methods
    const response = await fetch(API_URL, { method: 'GET' });

    // Non-2xx responses don't throw automatically, so check manually
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const json = await response.json(); // JSON:API shaped payload

    if (!json.data || !Array.isArray(json.data)) {
      throw new Error('Unexpected response format from Dog API.');
    }

    // Flatten each JSON:API resource down to just its attributes,
    // plus the resource id in case it's ever needed later.
    allBreeds = json.data.map(resource => ({
      id: resource.id,
      ...resource.attributes
    }));

    renderBreeds(allBreeds);

  } catch (err) {
    // Covers network failures, non-2xx statuses, and bad JSON —
    // i.e. the "API unavailable" case from the requirements.
    console.error('Dog API error:', err);
    setError(true);
    allBreeds = [];
    resultsCount.textContent = '';

  } finally {
    setLoading(false); // always hide the spinner
  }
}

/* ============================================================
   FILTER BREEDS BY NAME AS THE USER TYPES
   ============================================================ */
function handleSearch(){
  const query = searchInput.value.trim().toLowerCase();

  // Empty query — show everything we already have in memory
  if (query === ''){
    renderBreeds(allBreeds);
    return;
  }

  const filtered = allBreeds.filter(breed =>
    (breed.name || '').toLowerCase().includes(query)
  );

  // renderBreeds() itself handles the "no results found" empty state
  renderBreeds(filtered);
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */
searchInput.addEventListener('input', handleSearch);

// Load the breed list as soon as the page is ready
document.addEventListener('DOMContentLoaded', fetchBreeds);