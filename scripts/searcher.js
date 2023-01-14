/* API Requests:
   ========================================================================== */

async function getBookData(title) {
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

/* Error:
   ========================================================================== */

function createError(text) {
	searchLine.blur();
	const bodyPage = document.querySelector('body');
	const ErrorView = document.createElement('div');
	ErrorView.classList.add('error-view');
	const ErrorViewSticker = document.createElement('div');
	ErrorViewSticker.classList.add('error-view__sticker');
	const ErrorHeading = document.createElement('h2');
	ErrorHeading.classList.add('error-view__heading');
	ErrorHeading.textContent = 'Error message:';
	const ErrorText = document.createElement('p');
	ErrorText.classList.add('error-view__text');
	ErrorText.textContent = text;
	const ErrorExitButton = document.createElement('button');
	ErrorExitButton.classList.add('error-view__exit-button');
	ErrorExitButton.textContent = 'close';
	ErrorExitButton.addEventListener('click', () => {
		bodyPage.removeChild(ErrorView);
	});
	ErrorViewSticker.appendChild(ErrorHeading);
	ErrorViewSticker.appendChild(ErrorText);
	ErrorViewSticker.appendChild(ErrorExitButton);
	ErrorView.appendChild(ErrorViewSticker);
	bodyPage.appendChild(ErrorView);
}

/* Events of Window Section:
   ========================================================================== */

const searchLine = document.querySelector('.search-view__line');
searchLine.focus();
const debouncedHandle = debounce(handleInput, 250);
searchLine.addEventListener('input', debouncedHandle);

/* Operations of Search Line:
   ========================================================================== */

/**
 * 1. Handle Input
 */

const resultList = document.querySelector('.search-view__result-list');

function handleInput() {
	(async function () {
		const input = searchLine.value.replace(/\s+/g, '+');
		if (input) {
			let result = {};
			try {
				result = await getBookData(input);
			} catch (error) {
				createError('An error occurred, please refresh the page!');
				console.log(error);
				return;
			}
			const books = [];
			result.docs.forEach((book) => {
				books.push([book.key, book.title]);
			});
			createListOfBooks(books);
			popUpState(true);
		} else {
			popUpState(false);
			while (resultList.firstChild) {
				resultList.removeChild(resultList.firstChild);
			}
		}
	})();
}

/**
 * 2. Create List:
 *
 * -- Fill in Result List
 */

function createListOfBooks(books) {
	const newList = books.slice();
	while (resultList.firstChild) {
		resultList.removeChild(resultList.firstChild);
	}
	if (localStorage.getItem('links') && localStorage.getItem('links') !== 'null') {
		let counter = 5;
		let searchHistory = JSON.parse(localStorage.getItem('links'));
		if (searchHistory.length > 5) {
			searchHistory = searchHistory.slice(-5);
		}
		for (let i = 0; i < searchHistory.length; i++) {
			searchHistory[i][1] = `- ${searchHistory[i][1]}`;
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

/**
 * -- Create One Point of List
 */

const detailedInformation = document.querySelector('.search-view__detailed-information');
const bookImage = document.querySelector('.search-view__item-image');
const bookTitle = document.querySelector('.search-view__item-title');
const bookDescription = document.querySelector('.search-view__item-description');

function createBookPoint(book) {
	const listItemLink = document.createElement('a');
	listItemLink.classList.add('search-view__result-item-link');
	listItemLink.href = `https://openlibrary.org${book[0]}`;
	listItemLink.target = '_blank';
	listItemLink.textContent = book[1];
	listItemLink.addEventListener('click', () => {
		if (localStorage.getItem('links') && localStorage.getItem('links') !== 'null') {
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
				} catch (error) {
					createError('Storage is full, please clear your history!');
					console.log('Storage is full.');
				}
				createHistoryList(linksArray);
				handleInput();
			}
		} else {
			localStorage.setItem('links', JSON.stringify([book]));
			createHistoryList([book]);
			handleInput();
		}
	});
	const listItem = document.createElement('li');
	listItem.classList.add('list__item');
	listItem.classList.add('search-view__result-item');
	listItem.appendChild(listItemLink);
	const debouncedFillInfo = debounce(fillDetailedInformation, 250);
	listItem.addEventListener('mouseover', debouncedFillInfo);
	function fillDetailedInformation() {
		detailedInformation.classList.add('search-view__detailed-information_visible');
		(async function () {
			let info = {};
			try {
				info = await getBookInfo(book[0]);
			} catch (error) {
				bookDescription.textContent = 'Book not found...';
				console.log(error);
				return;
			}
			// Проверяем данные, полученные с сервера, если какой-либо пункт отсутствует заменяем его заглушкой
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
 * 3. PopUp
 */

const popUp = document.querySelector('.search-view__pop-up');
const separator = document.querySelector('.search-view__separator');

function popUpState(toggle) {
	if (toggle) {
		separator.classList.add('search-view__separator_visible');
		popUp.classList.add('search-view__pop-up_visible');
	} else {
		separator.classList.remove('search-view__separator_visible');
		popUp.classList.remove('search-view__pop-up_visible');
	}
}

/**
 * debounce()
 */

function debounce(callee, timeoutMs) {
	return function perform(...args) {
		const previousCall = this.lastCall;
		this.lastCall = Date.now();
		if (previousCall && this.lastCall - previousCall <= timeoutMs) {
			clearTimeout(this.lastCallTimer);
		}
		this.lastCallTimer = setTimeout(() => callee(...args), timeoutMs);
	};
}

/* Operations of Search History:
   ========================================================================== */

const clearButton = document.querySelector('.search-history__clear-button');
clearButton.disabled = true;
clearButton.addEventListener('click', () => {
	localStorage.clear();
	createHistoryList('null');
});

/**
 * First Load of History
 */

if (localStorage.getItem('links')) {
	const searchHistory = JSON.parse(localStorage.getItem('links'));
	createHistoryList(searchHistory);
}

/**
 * Dynamic Update of History
 */

window.addEventListener('storage', () => {
	const newSearchHistory = JSON.parse(window.localStorage.getItem('links'));
	createHistoryList(newSearchHistory);
	handleInput();
});

/**
 * Create History List
 */

function createHistoryList(value) {
	clearButton.disabled = true;
	const searchHistoryContainer = document.querySelector('.search-history-list');
	while (searchHistoryContainer.firstChild) {
		searchHistoryContainer.removeChild(searchHistoryContainer.firstChild);
	}
	if (value && value !== 'null') {
		clearButton.disabled = false;
		let limitArray;
		if (value.length > 3) {
			limitArray = value.slice(-3);
		} else {
			limitArray = value;
		}
		limitArray.forEach((item) => {
			const historyLink = document.createElement('a');
			historyLink.href = `https://openlibrary.org${item[0]}`;
			historyLink.target = '_blank';
			historyLink.textContent = item[1];
			const historyItem = document.createElement('li');
			historyItem.classList.add('search-history-list__item');
			historyItem.appendChild(historyLink);
			searchHistoryContainer.appendChild(historyItem);
		});
	}
}
