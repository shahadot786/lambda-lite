import { BrowserRouter, Routes, Route } from 'react-router-dom';
import JobSubmit from './pages/JobSubmit';
import JobStatus from './pages/JobStatus';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <h1 className="logo">⚡ Lambda Lite</h1>
          <p className="tagline">Distributed Task Executor</p>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<JobSubmit />} />
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
