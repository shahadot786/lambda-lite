import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import JobList from './pages/JobList';
import JobSubmit from './pages/JobSubmit';
import JobStatus from './pages/JobStatus';
import './App.css';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="app-nav">
      <Link
        to="/"
        className={location.pathname === '/' ? 'active' : ''}
      >
        All Jobs
      </Link>
      <Link
        to="/submit"
        className={location.pathname === '/submit' ? 'active' : ''}
      >
        Submit Job
      </Link>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <h1 className="logo">⚡ Lambda Lite</h1>
          <p className="tagline">Distributed Task Executor</p>
          <Navigation />
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<JobList />} />
            <Route path="/submit" element={<JobSubmit />} />
            <Route path="/job/:id" element={<JobStatus />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>Built with Node.js, Docker, Redis, MongoDB, and React</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
