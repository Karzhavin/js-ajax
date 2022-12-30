async function getBooksData(title) {
    try {
        const response = await fetch(`http://openlibrary.org/search.json?title=${title}`);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Could not get products: ${error}`);
    }    
}

const searchLine = document.querySelector('.search-view__line');

searchLine.addEventListener('input', (event) => {
    (async function() {
        const input = searchLine.value.replace(/\s+/g, '+');
        const result = await getBooksData(input);
        const books = result.docs;
        console.log(books)
        
        books.reduce((result, books) => {
            // Исправить поля!!
            result[books.title] = {
                title: books.title, 
                author: books.author_name, 
                publishYear: books.publish_year,
            };
            return result;
        });
        console.log(result);
    })();
});