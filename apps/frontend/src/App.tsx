import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import JobList from './pages/JobList';
import JobSubmit from './pages/JobSubmit';
import JobStatus from './pages/JobStatus';
import { ThemeProvider } from './components/theme-provider';
import { ThemeToggle } from './components/theme-toggle';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-border/40 backdrop-blur-sm">
      <Link
        to="/"
        className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${location.pathname === '/'
          ? 'bg-background text-foreground shadow-sm scale-[1.02]'
          : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
          }`}
      >
        Queue
      </Link>
      <Link
        to="/submit"
        className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${location.pathname === '/submit'
          ? 'bg-background text-foreground shadow-sm scale-[1.02]'
          : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
          }`}
      >
        Submit
      </Link>
    </nav>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="lambda-lite-theme">
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-10">
                <Link to="/" className="flex items-center space-x-2 transition-all hover:opacity-90 active:scale-95 shrink-0 text-foreground">
                  <span className="text-xl sm:text-2xl font-black tracking-tighter flex items-center gap-1">
                    <span className="text-primary italic">⚡</span>
                    <span className="hidden md:inline">LAMBDA<span className="text-primary">LITE</span></span>
                    <span className="md:hidden">LL</span>
                  </span>
                </Link>
                <div className="hidden sm:block">
                  <Navigation />
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="sm:hidden">
                  <Navigation />
                </div>
                <div className="h-8 w-[1px] bg-border/40 mx-2 hidden sm:block" />
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="flex-1 container mx-auto py-10 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out px-4 sm:px-6">
            <Routes>
              <Route path="/" element={<JobList />} />
              <Route path="/submit" element={<JobSubmit />} />
              <Route path="/job/:id" element={<JobStatus />} />
            </Routes>
          </main>

          <footer className="border-t border-border/20 bg-muted/20 py-12">
            <div className="container mx-auto flex flex-col items-center justify-between gap-6 md:flex-row px-4 sm:px-6">
              <div className="flex flex-col gap-2 text-center md:text-left">
                <p className="text-sm font-semibold tracking-tight">Lambda Lite Executor</p>
                <p className="text-xs text-muted-foreground/80 max-w-[300px]">
                  A high-performance distributed task execution platform built for the modern edge.
                </p>
              </div>
              <div className="flex flex-col gap-4 items-center md:items-end">
                <p className="text-xs text-muted-foreground/60 font-medium">
                  Built with Node.js, Docker, Redis, MongoDB & React
                </p>
                <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-bold">
                  © 2025 ALL RIGHTS RESERVED
                </p>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
