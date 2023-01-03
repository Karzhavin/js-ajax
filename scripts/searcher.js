/**
 * Requests Section
 */ 

async function getBooksData(title) {
    try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${title}&fields=*&limit=10`, {
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

async function getBookInfo(key) {
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
searchLine.focus();

searchLine.addEventListener('input', (event) => {
    (async function() {
        const input = searchLine.value.replace(/\s+/g, '+');
        const result = await getBooksData(input);
        console.log(result);
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
    listItem.classList.add('list__item');
    listItem.classList.add('search-view__result-item');
    listItem.textContent = book[1];
    listItem.addEventListener('mouseover', () => {
        (async function() {
            const image = document.querySelector('.search-view__item-image');
            const title = document.querySelector('.search-view__item-title');
            const author = document.querySelector('.search-view__item-author');
            const year = document.querySelector('.search-view__item-year');
            const description = document.querySelector('.search-view__item-description');

            const info = await getBookInfo(book[0]);

            console.log(info);

            if (info.covers) {
                image.src = `https://covers.openlibrary.org/b/id/${info.covers[0]}-M.jpg`;
            }
            
            title.textContent = info.title;
            description.textContent = info.description;
        })();
    });
    resultList.appendChild(listItem);
  }
}
