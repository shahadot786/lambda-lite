import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import JobList from './pages/JobList';
import JobSubmit from './pages/JobSubmit';
import JobStatus from './pages/JobStatus';
import { ThemeProvider } from './components/theme-provider';
import { ThemeToggle } from './components/theme-toggle';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="flex gap-4 justify-center mt-6">
      <Link
        to="/"
        className={`px-6 py-2 rounded-md font-medium transition-colors ${location.pathname === '/'
            ? 'bg-white/20 text-white'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
          }`}
      >
        All Jobs
      </Link>
      <Link
        to="/submit"
        className={`px-6 py-2 rounded-md font-medium transition-colors ${location.pathname === '/submit'
            ? 'bg-white/20 text-white'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
          }`}
      >
        Submit Job
      </Link>
    </nav>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="lambda-lite-theme">
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-background">
          <header className="bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg">
            <div className="container mx-auto px-4 py-8 text-center relative">
              <div className="absolute right-4 top-4">
                <ThemeToggle />
              </div>
              <h1 className="text-4xl font-bold mb-2">⚡ Lambda Lite</h1>
              <p className="text-lg text-white/90">Distributed Task Executor</p>
              <Navigation />
            </div>
          </header>

          <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
            <Routes>
              <Route path="/" element={<JobList />} />
              <Route path="/submit" element={<JobSubmit />} />
              <Route path="/job/:id" element={<JobStatus />} />
            </Routes>
          </main>

          <footer className="bg-card border-t border-border py-6 text-center text-muted-foreground">
            <p>Built with Node.js, Docker, Redis, MongoDB, and React</p>
          </footer>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
