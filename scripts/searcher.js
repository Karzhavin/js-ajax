/**
 * Requests Section
 */ 

async function getBooksData(title) {
    const response = await fetch(`https://openlibrary.org/search.json?q=${title}&fields=key,title&limit=10`, {
        method: 'GET',
    });
    if (response.ok) {
        return response.json();
    }
    const error = {
        status: response.status,
        customError: 'Houston, we have a problem!',
    };
    throw error;
}

async function getBookInfo(key) {
    const response = await fetch(`https://openlibrary.org${key}.json`, {
        method: 'GET',
    });
    if (response.ok) {
        return response.json();
    }
    const error = {
        status: response.status,
        customError: 'Not found!',
    };
    throw error;
}

/**
 * Events Section
 */ 

const searchLine = document.querySelector('.search-view__line');
const separator = document.querySelector('.search-view__separator');
const popUp = document.querySelector('.search-view__pop-up');
searchLine.focus();

function handleInput() {
    // Добавляем черту, разделяющую запрос и результаты поиска, в зависимости от состояния строки
    // ввода 
    if (searchLine.value) {
        separator.classList.add('search-view__separator_visible');
        popUp.classList.add('search-view__pop-up_visible');
    } else {
        separator.classList.remove('search-view__separator_visible');
        popUp.classList.remove('search-view__pop-up_visible');
    }
    (async function() {
        const input = searchLine.value.replace(/\s+/g, '+');
        let result = {};
        try {
            result = await getBooksData(input);
        } catch (error) {
            console.log(error);
            return;
        }
        const books = [];

        result.docs.forEach((book) => {
            books.push([book.key, book.title]);
        });
        createListOfBooks(books);
    })();
}

const debouncedHandle = debounce(handleInput, 250)

searchLine.addEventListener('input', debouncedHandle);

const resultList = document.querySelector('.search-view__result-list');
const detailedInformation = document.querySelector('.search-view__detailed-information');

const bookImage = document.querySelector('.search-view__item-image');
const bookTitle = document.querySelector('.search-view__item-title');
// const bookAuthor = document.querySelector('.search-view__item-author');
// const bookYear = document.querySelector('.search-view__item-year');
const bookDescription = document.querySelector('.search-view__item-description');

function createListOfBooks(books) {
    const newList = books.slice();

    // Стираем предыдущий вывод результатов поиска
  
    while (resultList.firstChild) {
      resultList.removeChild(resultList.firstChild);
    }

    // Просматриваем localStorage на наличие записанных поисковых запросов

    if (localStorage.getItem('links')) {
        let counter = 5;
        let searchHistory = JSON.parse(localStorage.getItem('links'));
        if (searchHistory.length > 5) {
            searchHistory = searchHistory.slice(-5);
        }
        for (let i = 0; i < searchHistory.length; i++) {
            createBookPoint(searchHistory[i]);
            counter -= 1;
            if (counter === 0) {
                break;
            }
        }
        counter += 5;
        for (let j = 0; j < newList.length; j++) {
            createBookPoint(newList[j]);
            counter -= 1;
            if (counter === 0) {
                break;
            }
        }
    } else {
        for (const book of newList) {
            createBookPoint(book);
        }
    }
}

function createBookPoint(book) {
    const listItemLink = document.createElement('a');
    listItemLink.classList.add('search-view__result-item-link');
    listItemLink.href = `https://openlibrary.org${book[0]}`;
    listItemLink.target = '_blank';
    listItemLink.textContent = book[1];
    // Отслеживаем переходы по ссылкам и сохраняем в localStorage
    listItemLink.addEventListener('click', () => {
        if (localStorage.getItem('links')) {
            const linksArray = JSON.parse(localStorage.getItem('links'));
            let newLink = true;
            for (let i = 0; i < linksArray.length; i++) {
                if (linksArray[i][0] === book[0]) {
                    newLink = false;
                    break;
                }
            }
            if (newLink) {
                linksArray.push(book);
                try {
                    localStorage.setItem('links', JSON.stringify(linksArray));
                    createHistoryList(linksArray);
                } catch (error) {
                    console.log(`Clear your history!`);
                }
            }
        } else {
            localStorage.setItem('links', JSON.stringify([book]));
            createHistoryList([book]);
        }
    });

    const listItem = document.createElement('li');
    listItem.classList.add('list__item');
    listItem.classList.add('search-view__result-item');
    listItem.appendChild(listItemLink);
    const debouncedFillInfo = debounce(fillDetailedInformation, 250)
    listItem.addEventListener('mouseover', debouncedFillInfo);
    function fillDetailedInformation() {
        detailedInformation.classList.add('search-view__detailed-information_visible');
        (async function() {
            let info = {};
            try {
                info = await getBookInfo(book[0]);
            } catch (error) {
                console.log(error);
                return;
            }
            // Проверяем данные, полученные с сервера, если какой-либо пункт отсутствует заменяем
            // его заглушкой
            if (info.covers) {
                bookImage.src = `https://covers.openlibrary.org/b/id/${info.covers[0]}-M.jpg`;
            } else {
                bookImage.src = 'styles/blocks/search-view/none_image.png';
            }
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
    } 
    listItem.addEventListener('mouseout', () => {
        detailedInformation.classList.remove('search-view__detailed-information_visible');
    });
    resultList.appendChild(listItem);
}

/**
 * localStorage
 */

if (localStorage.getItem('links')) {
    const searchHistory = JSON.parse(localStorage.getItem('links'));
    createHistoryList(searchHistory);
}

function createHistoryList(array) {
    const searchHistoryContainer = document.querySelector('.search-history-list');

    while (searchHistoryContainer.firstChild) {
        searchHistoryContainer.removeChild(searchHistoryContainer.firstChild);
    }

    const lastThree = array.slice(-3);

    lastThree.forEach((item) => {
        const historyLink = document.createElement('a');
        historyLink.href = `https://openlibrary.org${item[0]}`;
        historyLink.target = '_blank';
        historyLink.textContent = item[1];

        const historyItem = document.createElement('li');
        historyItem.classList.add('search-history-list__item');
        // listItem.classList.add('search-view__result-item');
        historyItem.appendChild(historyLink);
        searchHistoryContainer.appendChild(historyItem);
    });
}

/**
 * debounce()
 */

function debounce(callee, timeoutMs) {
    return function perform(...args) {

      let previousCall = this.lastCall
      this.lastCall = Date.now()

      if (previousCall && this.lastCall - previousCall <= timeoutMs) {
        clearTimeout(this.lastCallTimer)
      }
  
      this.lastCallTimer = setTimeout(() => callee(...args), timeoutMs)
    }
  }
  