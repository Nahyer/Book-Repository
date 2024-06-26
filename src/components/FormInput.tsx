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

const FormInput = () => {
    const reducer = (state: Book[], action: any) => {
        switch (action.type) {
            case 'ADD_BOOK':
                    return [...state, action.payload];
        
            case 'REMOVE_BOOK':
                return state.filter((book) => book.id !== action.payload);

            case 'UPDATE_BOOK':
                return state.map((book) => {
                    if (book.id === action.payload.id) {
                        return { ...book, ...action.payload };
                    }
                    return book;
                });     
            default:
                return state;
        }
    };


	// const todoGetLocal = localStorage.getItem('Todo')
    // const initialState= todoGetLocal ? JSON.parse(todoGetLocal) : []
    const [books, dispatch] = useReducer(reducer,[], () => {
		const localData = localStorage.getItem('books');
		return localData ? JSON.parse(localData) : [];
	});
	const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

	const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
    const booksPerPage = 5;

	const [ setStoredBooks] = useLocalStorage('books', books);
    useEffect(() => {
        setStoredBooks(books);
    }, [books, setStoredBooks]);

	useEffect(() => {
        setFilteredBooks(
            books.filter(book => book.title.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, books]) 

    const addBook = (book: Book) => {	
        dispatch({ type: 'ADD_BOOK', payload: book });
    }
    const removeBook = (id:number) => {
        dispatch({ type: 'REMOVE_BOOK', payload: id });
    }
    const updateBook = (book: Book) => {
        dispatch({ type: 'UPDATE_BOOK', payload: book });
    }

	const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);


	const paginate = useCallback((pageNumber:number) => setCurrentPage(pageNumber), []);
	
	const titleRef = useRef<HTMLInputElement>(null);
	const authorRef = useRef<HTMLInputElement>(null);
	const yearRef = useRef<HTMLInputElement>(null);
	const pagesRef = useRef<HTMLInputElement>(null);
	const readRef = useRef<HTMLInputElement>(null);
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (
			titleRef.current &&
			authorRef.current &&
			yearRef.current &&
			pagesRef.current &&
			readRef.current
		) {
            const newBook = {
                id: books.length + 1,
                title: titleRef.current.value,
                author: authorRef.current.value,
                year: parseInt(yearRef.current.value),
                pages: parseInt(pagesRef.current.value),
                read: readRef.current.checked
            };
            addBook(newBook);
		}
	};


	return (
		<>
			<div>
				FormInput
				<form>
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
						<input type='number' id='pages' name='pages' ref={pagesRef} />
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
									<button onClick={()=>updateBook(book)}>✏️</button>
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
