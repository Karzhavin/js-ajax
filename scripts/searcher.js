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

async function getBookInfo(key) {
    try {
        const response = await fetch(`https://openlibrary.org${key}.json`, {
            method: 'GET',
        });
        console.log(response);
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
const separator = document.querySelector('.search-view__separator');
const popUp = document.querySelector('.search-view__pop-up');
searchLine.focus();

searchLine.addEventListener('input', () => {
    if (searchLine.value) {
        separator.classList.add('search-view__separator_visible');
        popUp.classList.add('search-view__pop-up_visible');
    } else {
        separator.classList.remove('search-view__separator_visible');
        popUp.classList.remove('search-view__pop-up_visible');
    }
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

const resultList = document.querySelector('.search-view__result-list');
const detailedInformation = document.querySelector('.search-view__detailed-information');

const bookImage = document.querySelector('.search-view__item-image');
const bookTitle = document.querySelector('.search-view__item-title');
const bookAuthor = document.querySelector('.search-view__item-author');
const bookYear = document.querySelector('.search-view__item-year');
const bookDescription = document.querySelector('.search-view__item-description');

function createListOfBooks(books) {
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
        detailedInformation.classList.add('search-view__detailed-information_visible');
        (async function() {
            const info = await getBookInfo(book[0]);
            if (info.covers) {
                bookImage.src = `https://covers.openlibrary.org/b/id/${info.covers[0]}-M.jpg`;
            } else {
                bookImage.src = 'styles/blocks/search-view/none_image.png';
            }
            console.log(info);
            if (info.title) {
                bookTitle.textContent = info.title;
            } else {
                bookTitle.textContent = 'none title';
            }
            if (info.description) {
                if (typeof info.description === 'object') {
                    bookDescription.textContent = info.description.value;
                } else {
                    bookDescription.textContent = info.description;
                }
            } else {
                bookDescription.textContent = 'none description';
            }
        })();
    });
    listItem.addEventListener('mouseout', () => {
        detailedInformation.classList.remove('search-view__detailed-information_visible');
    });
    resultList.appendChild(listItem);
  }
}
