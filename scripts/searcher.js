/**
 * Requests Section
 */ 

async function getBooksData(title) {
    try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${title}&fields=key,title&limit=10`, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error(`${error}`);
        return error;
    }
}

async function getBook(key) {
    try {
        const response = await fetch(`https://openlibrary.org${key}.json`, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json(); 
    } catch (error) {
        console.error(`${error}`);
        return error;
    }
}

/**
 * Events Section
 */ 

const searchLine = document.querySelector('.search-view__line');

searchLine.addEventListener('input', (event) => {
    (async function() {
        const input = searchLine.value.replace(/\s+/g, '+');
        const result = await getBooksData(input);
        const books = [];

        result.docs.forEach((book) => {
            books.push([book.key, book.title]);
        });
        createListOfBooks(books);
    })();
});

function createListOfBooks(books) {
  const resultList = document.querySelector('.search-view__result-list');
  const newList = books.slice();

  while (resultList.firstChild) {
    resultList.removeChild(resultList.firstChild);
  }

  for (const book of newList) {
    const listItem = document.createElement('li');
    listItem.classList.add('search-view__result-item');
    listItem.textContent = book[1];
    listItem.addEventListener('mouseover', () => {
        const descriptionView = document.querySelector('.search-view__description-of-search-pick');
        (async function() {
            const bookDescription = await getBook(book[0]);
            // Инфа о книге уже извлечена, нужно допилить отображение и добавить каринку!!!
            console.log(bookDescription.description);
        })();
    });
    resultList.appendChild(listItem);
  }
}
