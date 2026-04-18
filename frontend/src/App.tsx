import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AuthorList } from './pages/AuthorList';
import { BooksList } from './pages/BooksList';
import { CreateAuthor } from './pages/CreateAuthor';
import { CreateBooks } from './pages/CreateBooks';
import { CreateReview } from './pages/CreateReview';
import { ReviewList } from './pages/ReviewList';

const PlaceHolder = () => (
  <div className="text-slate-500 text-sm">Placeholder for future pages</div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<PlaceHolder />} />
          <Route path="/authors" element={<AuthorList />} />
          <Route path="/authors/create" element={<CreateAuthor />} />
          <Route path="/books" element={<BooksList />} />
          <Route path="/books/create" element={<CreateBooks />} />
          <Route path="/reviews" element={<ReviewList />} />
          <Route path="/reviews/create" element={<CreateReview />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
