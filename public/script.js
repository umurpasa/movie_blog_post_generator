document.addEventListener('DOMContentLoaded', function () {
  const savedPage = localStorage.getItem('currentPage') || 'homePage';
  const openedMovieIndex = localStorage.getItem('openedMovieIndex');
  
  if (savedPage === 'myMoviesPage' && openedMovieIndex !== null) {
    showPage('myMoviesPage'); // Sayfa görünür olsun
    showMovieDetails(parseInt(openedMovieIndex));
  } else {
    showPage(savedPage);
  }
  

  const searchButton = document.getElementById('searchButton');
  const movieSearch = document.getElementById('movieSearch');
  const result = document.getElementById('result');

  searchButton.addEventListener('click', searchMovie);
  movieSearch.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      searchMovie();
    }
  });

  function searchMovie() {
    const movieTitle = movieSearch.value.trim();
    if (movieTitle) {
      result.innerHTML = 'Searching...';
      fetch('/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movieTitle }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.message) {
            result.innerHTML = data.message;
          } else {
            const titleAndYear = `${movieTitle.replace(/(^\w|\s\w)(\S*)/g, (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase())} (${data.year})`;
            const posterHTML = `<img src="${data.poster}" alt="${movieTitle} poster" style="max-width: 200px;">`;
            const directorHTML = `<p><strong>Director:</strong> ${data.director}</p>`;
            const genresHTML = `<p><strong>Genres:</strong> ${data.genres}</p>`;
            const actorsHTML = `<p><strong>Actors:</strong> ${data.actors}</p>`;
            const plotHTML = `<p><strong>Plot:</strong> ${data.plot}</p>`;
            const blogPostHTML = `<h3>Blog Post:</h3><p>${data.blogPost}</p>`;
            const saveButtonHTML = `<button id="saveButton">Kaydet</button>`;

            result.innerHTML = `<h2>${titleAndYear}</h2>${posterHTML}${directorHTML}${genresHTML}${actorsHTML}${plotHTML}${blogPostHTML}${saveButtonHTML}`;

            document.getElementById('saveButton').addEventListener('click', function () {
              const savedMovies = JSON.parse(localStorage.getItem('savedMovies') || '[]');

              // Aynı film daha önce kaydedildiyse ekleme
              const alreadySaved = savedMovies.some(movie => movie.title.toLowerCase() === movieTitle.toLowerCase());
              if (alreadySaved) {
                alert('Bu film zaten kaydedilmiş.');
                return;
              }

              savedMovies.push({
                title: movieTitle,
                year: data.year,
                director: data.director,
                genres: data.genres,
                actors: data.actors,
                plot: data.plot,
                blogPost: data.blogPost,
                poster: data.poster
              });
              localStorage.setItem('savedMovies', JSON.stringify(savedMovies));
              alert('Film ve blog yazısı kaydedildi!');
            });

          }
        })
        .catch(error => {
          console.error('Error:', error);
          result.innerHTML = 'An error occurred while searching. Please try again later.';
        });
    } else {
      result.innerHTML = 'Please enter a movie title';
    }
  }

  function loadSavedMovies() {
    const container = document.getElementById('moviesList');
    const saved = JSON.parse(localStorage.getItem('savedMovies') || '[]');

    if (saved.length === 0) {
      container.innerHTML = 'Henüz film kaydı yok.';
      return;
    }

    container.innerHTML = saved.map((movie, index) => `
        <div style="display:flex; gap:10px; align-items:center; border-bottom:1px solid #ccc; padding:10px; position:relative;">
            <img src="${movie.poster}" alt="${movie.title} poster" style="width:100px; cursor:pointer;" onclick="showMovieDetails(${index})">
            <div style="flex-grow:1; cursor:pointer;" onclick="showMovieDetails(${index})">
                <h4>${movie.title} (${movie.year})</h4>
                <p><strong>Yönetmen:</strong> ${movie.director}</p>
            </div>
            <button onclick="event.stopPropagation(); deleteSavedMovie(${index})" 
                    style="position:absolute; top:10px; right:10px;">Sil</button>
        </div>
    `).join('');
  }

  function showPage(id) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.style.display = 'none');
    document.getElementById(id).style.display = 'block';

    // localStorage'a kaydet
    localStorage.setItem('currentPage', id);

    if (id === 'myMoviesPage') loadSavedMovies();
  }


  window.showPage = showPage; // Bu satır şart! showPage fonksiyonunu global yapıyor.
});

window.showMovieDetails = function(index) {
  const saved = JSON.parse(localStorage.getItem('savedMovies') || '[]');
  const movie = saved[index];
  const container = document.getElementById('moviesList');

  // Açık olan filmi kaydet
  localStorage.setItem('openedMovieIndex', index);

  container.innerHTML = `
      <div style="text-align:center;">
          <h2>${movie.title} (${movie.year})</h2>
          <img src="${movie.poster}" alt="${movie.title} poster" style="max-width:300px; margin:20px 0;">
          <h3>Yönetmen: ${movie.director}</h3>
          <h4>Oyuncular: ${movie.actors}</h4>
          <p><strong>Plot:</strong> ${movie.plot}</p>
          <h3>Blog Yazısı:</h3>
          <p style="white-space: pre-wrap;">${movie.blogPost}</p>
          <button onclick="backToMovies()" style="margin-top:20px;">← Filmlerime Dön</button>
      </div>
  `;
};

window.backToMovies = function() {
  localStorage.removeItem('openedMovieIndex');
  showPage('myMoviesPage');
};


window.deleteSavedMovie = function (index) {
  const saved = JSON.parse(localStorage.getItem('savedMovies') || '[]');
  saved.splice(index, 1); // İlgili filmi listeden çıkar
  localStorage.setItem('savedMovies', JSON.stringify(saved)); // Güncellenmiş listeyi kaydet
  alert('Kayıt silindi!');
  // Sayfayı yeniden yükle
  const activePage = document.querySelector('.page[style*="block"]');
  if (activePage && activePage.id === 'myMoviesPage') loadSavedMovies();
};

