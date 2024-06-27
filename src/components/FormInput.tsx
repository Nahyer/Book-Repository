import { useRef, useState,useReducer, useEffect, useCallback} from "react";
// import useLocalStorage from "../hooks/useLocalStorage";
import Pagination from "./Pagination";
import axios from "axios";


export interface Book {
	id?: number;
	title: string;
	author: string;
	year: number;
	pages: number;

}

interface TEditBook{
	edited: boolean;
	id: number|null;
}

const FormInput = () => {
    const reducer = (state: Book[], action: any): any=> {
        switch (action.type) {
			case 'GET_BOOKS':
				return action.payload;

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
	

		
    const [books, dispatch] = useReducer(reducer,[]);
	// const [localBooks,setStoredBooks] = useLocalStorage('books', []);

	useEffect(() => {
		getDB()
	},[])

	const getDB = async () => {
		try {
			const res = await axios.get('http://localhost:8000/api/books');
			if (!res.data) {
				throw new Error('Failed to fetch data');
			}
			dispatch({ type: 'GET_BOOKS', payload: res.data });
			console.log(res.data);
		} catch (error:any) {
			console.log(error.message);
		}
	}

	const createBook = async (book: Book) => {
		try {
			const res = await axios.post('http://localhost:8000/api/books/create', book, {
				headers: {
				  'Content-Type': 'application/json'
				}
			  });
			if (!res.data) {
				throw new Error('Failed to create book');
			}
			dispatch({ type: 'ADD_BOOK', payload: book });
			console.log(res.data);
		} catch (error:any) {
			console.log(error.response.data);
		}
	}

	const deleteBook = async (id: number) => {
		try {
			const res = await axios.delete(`http://localhost:8000/api/books/delete/${id}`);
			if (!res.data) {
				throw new Error('Failed to delete book');
			}
			dispatch({ type: 'REMOVE_BOOK', payload: id });
			console.log(res.data);
		} catch (error:any) {
			console.log(error.response.data);
		}
	}

	// const updateBook = async (book: Book) => {
	// 	try {
	// 		const res = await axios.put(`http://localhost:8000/api/books/update/${book.id}`, book, {
	// 			headers: {
	// 			  'Content-Type': 'application/json'
	// 			}
	// 		  });
	// 		if (!res.data) {
	// 			throw new Error('Failed to update book');
	// 		}
	// 		dispatch({ type: 'UPDATE_BOOK', payload: book });
	// 		console.log(res.data);
	// 	} catch (error:any) {
	// 		console.log(error.response.data);
	// 	}
	// }

	
	const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

	const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
	const [formDisplay, setFormDisplay] = useState('none');
	const [editBook, setEditBook] = useState<TEditBook>({edited: false, id: 0});
    const booksPerPage = 5;
	 
	useEffect(() => {
        setFilteredBooks(
            books.filter((book:any)=> book.title.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, books]) 

	const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);


	const paginate = useCallback((pageNumber:number) => setCurrentPage(pageNumber), []);
	

	const titleRef = useRef<HTMLInputElement>(null);
	const authorRef = useRef<HTMLInputElement>(null);
	const yearRef = useRef<HTMLInputElement>(null);
	const pagesRef = useRef<HTMLInputElement>(null);
	const readRef = useRef<HTMLInputElement>(null);

	const [bookForm, setBookForm] = useState<Book>({}as Book);


	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const fdata: Book = {
			...bookForm,
			[e.target.name]: e.target.value
		};
		editBook.id ?  fdata.id = editBook.id: fdata.id = 0; 
		setBookForm(fdata);
		// handleEdit(bookForm);
	};
	useEffect(() => {
		console.log(bookForm);
	}, [bookForm]);

	// const handleEdit = (book: Book) => {
		
	// 	dispatch({ type: 'UPDATE_BOOK', payload: book });
	// 	setEditBook({edited:!editBook.edited,id:null});
	// 	console.log(book);
	// }

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (titleRef.current &&authorRef.current &&yearRef.current &&pagesRef.current
		) {
            const newBook = {
                // id: editBook.edited ? Number(id.current.value) : books.length + 1,
                title: titleRef.current.value,
                author: authorRef.current.value,
                year: parseInt(yearRef.current.value),
                pages: parseInt(pagesRef.current.value)
            };
			createBook(newBook);

			if (titleRef.current) titleRef.current.value = '';
			if (authorRef.current) authorRef.current.value = '';
			if (yearRef.current) yearRef.current.value = '';
			if (pagesRef.current) pagesRef.current.value = '';
			if (readRef.current) readRef.current.checked = false;
			setFormDisplay('none')
		}
	};


	return (
		<>
			<div>
				<h2>BOOKREPO .inc</h2>
				<button onClick={()=> setFormDisplay('block')}>AddBook</button>
				<form style={{display: formDisplay}} onSubmit={handleSubmit}>
					<div>
						<label htmlFor='title'>Title: </label>
						<input type='text' id='title' name='title' ref={titleRef} />
					</div>
					<div>
						<label htmlFor='author'>Author: </label>
						<input type='text' id='author' name='author' ref={authorRef} />
					</div>
					<div>
						<label htmlFor='year'>Publication Year: </label>
						<input type='number' id='year' name='year' ref={yearRef} />
					</div>
					<div>
						<label htmlFor='pages'>Pages: </label>
						<input type='number' id='pages' name='pages' ref={pagesRef}  />
					</div>
					
					<button type='submit'>Submit</button>
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
						<th>Publication Year</th>
						<th>Pages</th>
						<th>Actions</th>
					</tr>
					</thead>
					<tbody>
					{currentBooks .map((book, index) => (
						<tr key={index} >
							
								<td>{editBook.edited && editBook.id === book.id  ?(
									<input type='text' id='title' name='title' placeholder={book.title} onChange={handleChange}/>
								):(book.title)
									}</td>
								<td>
								{editBook.edited && editBook.id === book.id  ?(
									<input type='text' id='author' name='author' placeholder={book.author} onChange={handleChange}/>
								):(book.author)
									}</td>
								<td>{editBook.edited && editBook.id === book.id  ?(
									<input type='number' id='year' name='year' placeholder={book.year.toString()} onChange={handleChange}/>
								):(book.year)
									}</td>
								<td>{editBook.edited && editBook.id === book.id  ?(
									<input type='number' id='pages' name='pages' placeholder={book.pages.toString()} onChange={handleChange}/>
								):(book.pages)
									}</td>
								
								<td>
									<button onClick={()=>book.id && deleteBook(book.id)}>✖️</button>
									<button onClick={()=>book.id && setEditBook({edited:!editBook.edited,id:book.id})}>✏️</button>
									
								</td>								
						</tr>
						
					))}
					</tbody>
				</table>
				{currentBooks.length === 0 && (
			<div>
			  No books found.
			</div>
		  )}
			</div>
			
            <Pagination booksPerPage={booksPerPage} totalBooks={filteredBooks.length} paginate={paginate} />
		</>
	);
};

export default FormInput;
