import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Homepage from './Homepage';
import Blog from './Blog';
import NotebookViewer from './NotebookViewer';

const RESUME_PDF_PATH = 'https://docs.google.com/document/d/1qhT4JxxFUdAOfkZKIKEdxQ_EyjMvRPhMe0PjkeTEJZ8/export?format=pdf';

// Full-page redirect to PDF so the document loads and browser back works correctly
const ResumeRedirect = () => {
  useEffect(() => {
    // Ensure "Back" from the PDF returns to homepage, even when landing directly on /resume or /portfolio.
    window.history.replaceState(null, '', '/');
    window.location.assign(RESUME_PDF_PATH);
  }, []);
  // If the browser opens the PDF in a new tab (or blocks navigation), don't leave the SPA tab blank.
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ margin: 0, marginBottom: 12, fontWeight: 700 }}>Opening resume…</h2>
        <p style={{ marginTop: 0, marginBottom: 12, color: '#444' }}>
          If it doesn’t open automatically, use the link below.
        </p>
        <p style={{ marginTop: 0, marginBottom: 24 }}>
          <a href={RESUME_PDF_PATH} target="_blank" rel="noreferrer">
            Open resume PDF
          </a>
        </p>
        <p style={{ margin: 0 }}>
          <a href="/">Back to homepage</a>
        </p>
      </div>
    </div>
  );
};

// Wrapper component to handle notebook path from URL
const NotebookViewerRoute = () => {
  const { notebookPath } = useParams();
  // Decode the path and construct the full path to the notebook file
  // Assuming notebooks are stored in the public folder
  const decodedPath = notebookPath ? decodeURIComponent(notebookPath) : '';
  const fullPath = decodedPath ? `/notebooks/${decodedPath}` : null;
  
  return <NotebookViewer notebookPath={fullPath} />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/portfolio" element={<ResumeRedirect />} />
          <Route path="/resume" element={<ResumeRedirect />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/notebook/:notebookPath" element={<NotebookViewerRoute />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
