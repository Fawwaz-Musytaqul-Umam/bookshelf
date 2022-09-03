const _books = [];
const RENDER_EVENT = "RENDER_BOOKS";
let bookIsCompleteValue = false;

document.addEventListener("DOMContentLoaded", function () {

    const form_SearchBook = document.getElementById("searchBook");
    form_SearchBook.addEventListener("input", function () {
        searchBooks();
    })
    
    const removeAllBooksFromInCompleteList = document.querySelector("#deleteAll_InCompleteBooks");
    const removeAllBooksFromCompleteList = document.querySelector("#deleteAll_CompleteBooks");
    
    removeAllBooksFromInCompleteList.addEventListener("click", function () {
        const inCompleteBooksList = document.getElementById("inCompleteBookList")
        if (inCompleteBooksList.innerHTML != '') {
            removeAllBooks(false);
        }
    })
    
    removeAllBooksFromCompleteList.addEventListener("click", function () {
        const completeBooksList = document.getElementById("completeBookList")
        if (completeBooksList.innerHTML != '') {
            removeAllBooks(true);
        }
    })

    const submitNewBook = document.querySelector("#inputNewBook");
    const inputCheckbox = document.querySelector("#inputBookIsComplete");

    inputCheckbox.addEventListener("change", function (event) {
        checkboxTriggerEvent(event)
    })

    submitNewBook.addEventListener("submit", function (event) {
        event.preventDefault();
        addBook()
        showNotificationBar();
    })

})


function checkboxTriggerEvent(event) {
    if (event.target.checked) bookIsCompleteValue = true;
    else bookIsCompleteValue = false;
}

function searchBooks() {
    const inputSearchBooks = document.getElementById("searchBookTitle").value.toLowerCase();
    const selectBookCategory = document.getElementById("selectCategory");

    const bookItem = document.querySelectorAll('.book_item');

    selectBookCategory.addEventListener("change", function (event) {
        for (const book of bookItem) {
            if (event.target.value == '') {
                book.style.display = "block";
            }
            else if (book.childNodes[3].childNodes[1].outerText == event.target.value) {
                book.style.display = "block";
            } else {
                book.style.display = "none";
            }
        }
    })

    for (const book of bookItem) {
        if (book.childNodes[0].innerText.toLowerCase().includes(inputSearchBooks)) {
            book.style.display = "block";
        } else {
            book.style.display = "none";
        }
    }

}

function removeAllBooks(targetBook_IsComplete) {
    let confirmAction = null;
    if (targetBook_IsComplete) {
        confirmAction = confirm("Apakah anda yakin, menghapus semua Buku yang sudah di baca ??")
    } else {
        confirmAction = confirm("Apakah anda yakin, menghapus semua Buku yang belum di baca ??")
    }

    if (confirmAction) {
        let index = 0;
        while (index < _books.length) {

            if (_books[index].isComplete === targetBook_IsComplete) _books.splice(index, 1);
            else ++index;

        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
};

function addBook() {
    let id = +new Date();
    const title = document.querySelector("#inputBookTitle").value;
    const author = document.querySelector("#inputBookAuthor").value;
    const year = document.querySelector("#inputBookYear").value;
    const category = document.querySelector("#inputBookCategory").value;

    const bookObject = generateBookObject(id, title, author, year, category, bookIsCompleteValue);
    _books.unshift(bookObject)

    addCategory()
    document.dispatchEvent(new Event(RENDER_EVENT))
}

let optionButtons = [];
function addCategory() {

    let optionElement = `<option value="${_books[0].category}">${_books[0].category}</option>`;
    optionButtons.push(optionElement)
    let newOptionButton = [...new Set(optionButtons)];

    let renderOptionButton = ''
    for (const button of newOptionButton) {
        renderOptionButton += button;
    }

    const optGroup = document.getElementById("optGroup");
    optGroup.innerHTML = renderOptionButton;
}

function generateBookObject(id, title, author, year, category, isComplete) {
    return { id, title, author, year, category, isComplete }
}

document.addEventListener(RENDER_EVENT, function () {
    const inCompleteBooksList = document.querySelector("#inCompleteBookList");
    const CompleteBooksList = document.querySelector("#completeBookList");

    inCompleteBooksList.innerHTML = '';
    CompleteBooksList.innerHTML = '';

    for (const bookObject of _books) {

        let bookElement = createBookElement(bookObject)

        if (!bookObject.isComplete) inCompleteBooksList.append(bookElement)
        else CompleteBooksList.append(bookElement)

    }
})

function showNotificationBar() {
    const notificationBar = document.querySelector('.notification-bar')
    notificationBar.style.display = 'flex';

    const closeNotificationBar = document.querySelector('#closeNotificationBar')
    closeNotificationBar.addEventListener("click", function () {
        notificationBar.style.display = 'none';
    })
}

function createBookContainer(bookObject) {
    const book_container = document.createElement("article");
    book_container.classList.add('book_item');

    const book_Title = document.createElement("h2");
    const book_Author = document.createElement("p");
    const book_Year = document.createElement("p");
    const book_Category = document.createElement("p");

    book_Title.innerText = bookObject.title;
    book_Author.innerHTML = `Penulis: <span>${bookObject.author}</span>`;
    book_Year.innerHTML = `Tahun: <span>${bookObject.year}</span>`;
    book_Category.innerHTML = `Kategori: <span>${bookObject.category}</span>`;

    book_container.append(book_Title, book_Author, book_Year, book_Category);
    return book_container;
}

function createBookElement(bookObject) {
    const book_container = createBookContainer(bookObject)
    const book_Action = document.createElement("div");
    const deleteBook_Button = document.createElement("button");

    book_Action.classList.add('action')
    deleteBook_Button.classList.add('delete-book_button')
    deleteBook_Button.innerText = "Hapus Buku ini"

    deleteBook_Button.addEventListener("click", function () {
        removeBookFromList(bookObject.id);
    })

    if (!bookObject.isComplete) {
        const doneBook_Button = document.createElement("button");
        doneBook_Button.classList.add('done-book_button');
        doneBook_Button.innerText = "Selesai dibaca";

        doneBook_Button.addEventListener("click", function name() {
            addBookToCompleteList(bookObject.id)
        })

        book_Action.append(doneBook_Button, deleteBook_Button);
    }
    else {
        const undoBook_Button = document.createElement("button");
        undoBook_Button.classList.add('undo-book_button');
        undoBook_Button.innerText = "Belum dibaca";

        undoBook_Button.addEventListener("click", function () {
            undoBookFromCompleteList(bookObject.id)
        })

        book_Action.append(undoBook_Button, deleteBook_Button);
    }

    book_container.append(book_Action);
    return book_container;
}

function findBookId(targetId) {
    for (const book of _books) {
        if (book.id === targetId) return book;
    }

    return 'NOT_FOUND';
}

function findBookIndex(targetId) {
    for (const index in _books) {
        if (_books[index].id === targetId) return index;
    }

    return 'NOT_FOUND';
}

function addBookToCompleteList(id) {
    const bookTarget = findBookId(id);
    if (bookTarget === 'NOT_FOUND') return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function undoBookFromCompleteList(id) {
    const bookTarget = findBookId(id);
    if (bookTarget === 'NOT_FOUND') return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function removeBookFromList(id) {
    const bookTarget = findBookIndex(id);

    if (bookTarget === 'NOT_FOUND') return;

    const confirmAction = confirm("Apakah anda yakin untuk menghapus buku ini ??")
    if (confirmAction) _books.splice(bookTarget, 1);


    document.dispatchEvent(new Event(RENDER_EVENT));
}