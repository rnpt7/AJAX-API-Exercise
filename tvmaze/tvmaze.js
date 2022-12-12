"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const $episodesList = $("#episodes-list");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const res = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);
  console.log(res);

  return res.data.map((result) => {
    const show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image
        ? show.image.original
        : "https://tinyurl.com/tv-missing",
      rating: show.rating.average != null ? show.rating.average : "",
      ended: show.ended != null ? show.ended : "Currently Airing",
    };
  });
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="${show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <h5 class="text-secondary">${show.rating}</h5>
             <div><small>${show.summary} ${show.ended}</small></div>
             <button class="btn btn-outline-dark btn-sm  Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );
    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);

  return res.data.map((ep) => ({
    id: ep.id,
    name: ep.name,
    season: ep.season,
    number: ep.number,
  }));
}

/** Create episodes list with given list */

function populateEpisodes(episodes) {
  $episodesList.empty();

  for (let episode of episodes) {
    const $ep = $(
      `<li> ${episode.name} (S${episode.season}, E${episode.number})</li>`
    );
    $episodesList.append($ep);
  }
  $episodesArea.show();
}

/** Get episodes for show on button click */

async function searchForEpisodesAndDisplay(evt) {
  const episodes = await getEpisodesOfShow(
    $(evt.target).closest(".Show").data("show-id")
  );
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", searchForEpisodesAndDisplay);
