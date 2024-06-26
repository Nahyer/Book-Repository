import { useRef, useState,useReducer, useEffect, useCallback} from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import Pagination from "./Pagination";

export interface Book {
    id: number;
	title: string;
	author: string;
	year: number;
	pages: number;
	read: boolean;
}

interface TEditBook{
	edited: boolean;
	id: number;
}

const FormInput = () => {
    const reducer = (state: Book[], action: any) => {
        switch (action.type) {
            case 'ADD_BOOK':
                    return [...state, action.payload];
        
            case 'REMOVE_BOOK':
                return state.filter((book) => book.id !== action.payload);

            case 'UPDATE_BOOK':
                return state.map((book) => {
                    book.id === action.payload.id ? {...book,...action.payload}: book;
                });
				
            default:
                return state;
        }
    };
	const addBook = (book: Book) => {	
        dispatch({ type: 'ADD_BOOK', payload: book });
    }
    const removeBook = (id:number) => {
        dispatch({ type: 'REMOVE_BOOK', payload: id });
    }
    // const updateBook = (book: Book) => {
    //     dispatch({ type: 'UPDATE_BOOK', payload: book });
    // }

	const [bookForm, setBookForm] = useState({ id: 0, title: '', author: '', year: 0, pages: 0, read: false });
	const [localBooks,setStoredBooks] = useLocalStorage('books', []);
    const [books, dispatch] = useReducer(reducer, localBooks);
	useEffect(() => {
        setStoredBooks(books);
    }, [books]);


	const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

	const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
	const [formDisplay, setFormDisplay] = useState('none');
	const [editBook, setEditBook] = useState<TEditBook>({edited: false, id: 0});
    const booksPerPage = 5;
	 
	useEffect(() => {
        setFilteredBooks(
            books.filter(book => book.title.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, books]) 

    // const [isEditing, setIsEditing] = useState(false);
	// const startEdit = (book: Book) => {
	// 	setBookForm(book);
	// 	setIsEditing(true);
	//   };
	

	const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);


	const paginate = useCallback((pageNumber:number) => setCurrentPage(pageNumber), []);
	

	const titleRef = useRef<HTMLInputElement>(null);
	const authorRef = useRef<HTMLInputElement>(null);
	const yearRef = useRef<HTMLInputElement>(null);
	const pagesRef = useRef<HTMLInputElement>(null);
	const readRef = useRef<HTMLInputElement>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, checked, type } = e.target;
		setBookForm((prev) => ({
		  ...prev,
		  [name]: type === 'checkbox' ? checked : value
		}));
		console.log(e.target);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (titleRef.current &&authorRef.current &&yearRef.current &&pagesRef.current &&readRef.current
		) {
            const newBook = {
                // id: editBook.edited ? Number(id.current.value) : books.length + 1,
                id:  books.length + 1,
                title: titleRef.current.value,
                author: authorRef.current.value,
                year: parseInt(yearRef.current.value),
                pages: parseInt(pagesRef.current.value),
                read: readRef.current.checked
            };

			// const actionType = editBook.edited ? 'UPDATE_BOOK' : 'ADD_BOOK';
			// dispatch({ type: actionType, payload: { ...bookForm, id: editBook.edited ? bookForm.id : books.length+1 } });
			setBookForm({ id: 0, title: '', author: '', year: 0, pages: 0, read: false });
			setEditBook({ edited: false, id: 0})
			console.log(bookForm);
			addBook(newBook);
			console.log(newBook);
			if (titleRef.current) titleRef.current.value = '';
			if (authorRef.current) authorRef.current.value = '';
			if (yearRef.current) yearRef.current.value = '';
			if (pagesRef.current) pagesRef.current.value = '';
			if (readRef.current) readRef.current.checked = false;
			setFormDisplay('none')
		}
	};

	const handleSuubmit = () => {
		console.log('submitted');
	}

	return (
		<>
			<div>
				<h2>BOOKREPO .inc</h2>
				<button onClick={()=> setFormDisplay('block')}>AddBook</button>
				<form style={{display: formDisplay}}>
					<div>
						<label htmlFor='title'>Title:</label>
						<input type='text' id='title' name='title' ref={titleRef} />
					</div>
					<div>
						<label htmlFor='author'>Author:</label>
						<input type='text' id='author' name='author' ref={authorRef} />
					</div>
					<div>
						<label htmlFor='year'>Publication Year:</label>
						<input type='number' id='year' name='year' ref={yearRef} />
					</div>
					<div>
						<label htmlFor='pages'>Pages:</label>
						<input type='number' id='pages' name='pages' ref={pagesRef}  />
					</div>
					<div>
						<label htmlFor='read'>Read:</label>
						<input type='checkbox' id='read' name='read' ref={readRef} />
					</div>
					<button onClick={handleSubmit} type='submit'>
						Submit
					</button>
				</form>
			</div>
			<input
                type="text"
                placeholder="Search by title"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
			<div>
				<h1>Books</h1>
				<table>
					<thead>
					<tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th> Publication Year</th>
					<th>Pages</th>
					<th>Read</th>
                    <th>Actions</th>
				
                </tr>
					</thead>
					<tbody>
					{currentBooks .map((book, index) => (
						<tr key={index} >
							
								<td>{book.title}</td>
								<td>Author: {book.author}</td>
								<td>{book.year}</td>
								<td> {book.pages}</td>
								<td>{book.read ? "Yes" : "No"}</td>
								<td>
									<button onClick={()=>removeBook(book.id)}>✖️</button>
									<button onClick={()=>setEditBook({edited:!editBook.edited,id:book.id})}>✏️</button>
									{editBook.edited && editBook.id === book.id && (
							<form>
								<input type="hidden" name="bookId" id="id" value={book.id} onChange={handleChange}/>
								<div>
									<label htmlFor='title'>Title:</label>
									<input type='text' id='title' name='title' value={book.title} onChange={handleChange}/>
								</div>
								<div>
									<label htmlFor='author'>Author:</label>
									<input type='text' id='author' name='author'  value={book.author}  onChange={handleChange}/>
								</div>
								<div>
									<label htmlFor='year'>Publication Year:</label>
									<input type='number' id='year' name='year'  onChange={handleChange}/>
								</div>
								<div>
									<label htmlFor='pages'>Pages:</label>
									<input type='number' id='pages' name='pages' value={book.pages}   onChange={handleChange}/>
								</div>
								<div>
									<label htmlFor='read'>Read:</label>
									<input type='checkbox' id='read' name='read' value={book.title}  onChange={handleChange}/>
								</div>
								<button onSubmit={handleSuubmit} type='submit'>
									Edit
								</button>
							</form>
						)}
								</td>								
						</tr>
						
					))}
					</tbody>
				</table>
			</div>
			
            <Pagination booksPerPage={booksPerPage} totalBooks={filteredBooks.length} paginate={paginate} />
		</>
	);
};

export default FormInput;
