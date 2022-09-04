const RENDER_EVENT = "RENDER_BOOKS";
const _books = [];
let optionButtonsValue = [];
let bookIsCompleteValue = false;

document.addEventListener("DOMContentLoaded", function () {

    if (isStorageExist()) {
        loadDataFromStorage();
    }

    const form_SearchBook = document.getElementById("searchBook");
    form_SearchBook.addEventListener("input", function () {
        searchBooks();
    })

    const removeAllBooksFromInCompleteList = document.querySelector("#deleteAll_InCompleteBooks");
    const removeAllBooksFromCompleteList = document.querySelector("#deleteAll_CompleteBooks");

    removeAllBooksFromInCompleteList.addEventListener("click", function () {
        const inCompleteBookList = document.getElementById("inCompleteBookList")
        if (inCompleteBookList.innerHTML != '') {
            removeAllBooks(false);
        }
    })

    removeAllBooksFromCompleteList.addEventListener("click", function () {
        const completeBookList = document.getElementById("completeBookList")
        if (completeBookList.innerHTML != '') {
            removeAllBooks(true);
        }
    })

    const inputCheckbox = document.querySelector("#inputBookIsComplete");
    const submitNewBook = document.querySelector("#inputNewBook");

    inputCheckbox.addEventListener("change", function (event) {
        checkboxTriggerEvent(event)
    })

    submitNewBook.addEventListener("submit", function (event) {
        event.preventDefault();
        addBook()
    })

})

function checkboxTriggerEvent(event) {
    if (event.target.checked) bookIsCompleteValue = true;
    else bookIsCompleteValue = false;
}

function addBook() {
    let id = +new Date();
    const title = document.querySelector("#inputBookTitle").value;
    const author = document.querySelector("#inputBookAuthor").value;
    const year = document.querySelector("#inputBookYear").value;
    const category = document.querySelector("#inputBookCategory").value;

    const bookObject = generateBookObject(id, title, author, year, category, bookIsCompleteValue);
    _books.unshift(bookObject)

    addCategory();
    saveData();
    showNotificationBar();
    document.dispatchEvent(new Event(RENDER_EVENT))
}

function generateBookObject(id, title, author, year, category, isComplete) {
    return { id, title, author, year, category, isComplete }
}

function addCategory() {
    optionButtonsValue.unshift(_books[0].category)
}

document.addEventListener(RENDER_EVENT, function () {
    const inCompleteBookList = document.querySelector("#inCompleteBookList");
    const completeBookList = document.querySelector("#completeBookList");

    inCompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    for (const bookObject of _books) {

        let bookElement = createBookElement(bookObject)

        if (!bookObject.isComplete) inCompleteBookList.append(bookElement)
        else completeBookList.append(bookElement)

    }

    if (_books.length == 0) {
        optionButtonsValue = [];
    }

    const optGroup = document.getElementById("optGroup");
    optGroup.innerHTML = '';

    let newOptionButton = [...new Set(optionButtonsValue)];

    for (const value of newOptionButton) {
        if (value != '') {
            const optionElement = document.createElement('option');
            optionElement.setAttribute("value", value);
            optionElement.innerHTML = value;
    
            optGroup.append(optionElement)
        }
    }

})

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

function createBookCore(bookObject) {
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
    const book_container = createBookCore(bookObject)
    const book_Action = document.createElement("div");
    const deleteBook_Button = document.createElement("button");

    book_Action.classList.add('action')
    deleteBook_Button.classList.add('delete-book_button')
    deleteBook_Button.innerText = "Hapus Buku ini";

    deleteBook_Button.addEventListener("click", function () {
        removeBookFromList(bookObject.id);
    })

    if (!bookObject.isComplete) {
        const done_Button = document.createElement("button");
        done_Button.classList.add('done-book_button');
        done_Button.innerText = "Selesai dibaca";

        done_Button.addEventListener("click", function name() {
            addBookToCompleteList(bookObject.id)
        })

        book_Action.append(done_Button, deleteBook_Button);
    }
    else {
        const undo_Button = document.createElement("button");
        undo_Button.classList.add('undo-book_button');
        undo_Button.innerText = "Belum dibaca";

        undo_Button.addEventListener("click", function () {
            undoBookFromCompleteList(bookObject.id)
        })

        book_Action.append(undo_Button, deleteBook_Button);
    }

    book_container.append(book_Action);
    return book_container;
}

function addBookToCompleteList(id) {
    const bookTarget = findBookId(id);
    if (bookTarget === 'TARGET_NOT_FOUND') return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData()
    showNotificationBar();
}

function undoBookFromCompleteList(id) {
    const bookTarget = findBookId(id);
    if (bookTarget === 'TARGET_NOT_FOUND') return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData()
    showNotificationBar();
}

function removeBookFromList(id) {
    const bookTarget = findBookIndex(id);

    if (bookTarget === 'TARGET_NOT_FOUND') return;

    const confirmAction = confirm("Apakah anda yakin untuk menghapus buku ini ??")
    if (confirmAction) _books.splice(bookTarget, 1);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData()
    showNotificationBar();
}

function findBookId(targetId) {
    for (const book of _books) {
        if (book.id === targetId) return book;
    }

    return 'TARGET_NOT_FOUND';
}

function findBookIndex(targetId) {
    for (const index in _books) {
        if (_books[index].id === targetId) return index;
    }

    return 'TARGET_NOT_FOUND';
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

            if (_books[index].isComplete === targetBook_IsComplete) {
                _books.splice(index, 1)
            }
            else ++index;

        }
        showNotificationBar();
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData()
};

const STORAGE_KEY = ['BOOKS', 'OPTION'];

function saveData() {
    if (isStorageExist()) {
        const books = JSON.stringify(_books);
        const option = JSON.stringify([...new Set(optionButtonsValue)]);

        localStorage.setItem(STORAGE_KEY[0], books);
        localStorage.setItem(STORAGE_KEY[1], option);

    }
}

function showNotificationBar() {
    const notificationBar = document.querySelector('.notification-bar')
    notificationBar.style.display = 'flex';

    const closeNotificationBar = document.querySelector('#closeNotificationBar')
    closeNotificationBar.addEventListener("click", function () {
        notificationBar.style.display = 'none';
    })
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData_Books = localStorage.getItem(STORAGE_KEY[0]);
    const serializedData_Option = localStorage.getItem(STORAGE_KEY[1]);

    let bookObject = JSON.parse(serializedData_Books);
    let optionObject = JSON.parse(serializedData_Option);

    if (bookObject !== null) {
        for (const book of bookObject) {
            _books.push(book);
        }
    }

    if (optionObject !== null) {
        for (const option of optionObject) {
            optionButtonsValue.unshift(option);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}