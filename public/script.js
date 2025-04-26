document.addEventListener('DOMContentLoaded', function() {
  const searchButton = document.getElementById('searchButton');
  const movieSearch = document.getElementById('movieSearch');
  const result = document.getElementById('result');

  searchButton.addEventListener('click', searchMovie);
  movieSearch.addEventListener('keypress', function(e) {
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
                  const titleAndYear = `${movieTitle.replace(/(^\w|\s\w)(\S*)/g, (_,m1,m2) => m1.toUpperCase()+m2.toLowerCase())} (${data.year})`;
                  const posterHTML = `<img src="${data.poster}" alt="${movieTitle} poster" style="max-width: 200px;">`;
                  const directorHTML = `<p><strong>Director:</strong> ${data.director}</p>`;
                  const genresHTML = `<p><strong>Genres:</strong> ${data.genres}</p>`;
                  const actorsHTML = `<p><strong>Actors:</strong> ${data.actors}</p>`;
                  const plotHTML = `<p><strong>Plot:</strong> ${data.plot}</p>`;
                  const blogPostHTML = `<h3>Blog Post:</h3><p>${data.blogPost}</p>`;
                  const saveButtonHTML = `<button id="saveButton">Kaydet</button>`;

                  result.innerHTML = `<h2>${titleAndYear}</h2>${posterHTML}${directorHTML}${genresHTML}${actorsHTML}${plotHTML}${blogPostHTML}${saveButtonHTML}`;

                  document.getElementById('saveButton').addEventListener('click', function() {
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

  function loadSavedBlogs() {
      const container = document.getElementById('blogsList');
      const saved = JSON.parse(localStorage.getItem('savedMovies') || '[]');

      if (saved.length === 0) {
          container.innerHTML = 'Henüz blog kaydı yok.';
          return;
      }

      container.innerHTML = saved.map(movie => `
          <div style="border-bottom: 1px solid #ccc; padding: 10px;">
              <h3>${movie.title} (${movie.year})</h3>
              <p>${movie.blogPost}</p>
          </div>
      `).join('');
  }

  function loadSavedMovies() {
      const container = document.getElementById('moviesList');
      const saved = JSON.parse(localStorage.getItem('savedMovies') || '[]');

      if (saved.length === 0) {
          container.innerHTML = 'Henüz film kaydı yok.';
          return;
      }

      container.innerHTML = saved.map(movie => `
          <div style="display:flex; gap:10px; align-items:center; border-bottom:1px solid #ccc; padding:10px;">
              <img src="${movie.poster}" alt="${movie.title} poster" style="width:100px;">
              <div>
                  <h4>${movie.title} (${movie.year})</h4>
                  <p><strong>Yönetmen:</strong> ${movie.director}</p>
              </div>
          </div>
      `).join('');
  }

  function showPage(id) {
      const pages = document.querySelectorAll('.page');
      pages.forEach(p => p.style.display = 'none');
      document.getElementById(id).style.display = 'block';

      if (id === 'myBlogsPage') loadSavedBlogs();
      if (id === 'myMoviesPage') loadSavedMovies();
  }

  window.showPage = showPage; // Bu satır şart! showPage fonksiyonunu global yapıyor.
});
