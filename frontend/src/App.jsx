import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useSnippetStore } from './store/snippetStore';
import { ToastHost, toast } from './Toast';
import './App.css';

function App() {
  // Auth state
  const [isAuth, setIsAuth] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Explain UI state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSnippetId, setSelectedSnippetId] = useState(null);

  const { snippets, addSnippet, removeSnippet, loadSnippets } = useSnippetStore();

  // Resizable results panel
  const [panelWidth, setPanelWidth] = useState(380);
  const draggingRef = React.useRef(false);

  const startResize = () => {
    draggingRef.current = true;
    document.body.style.cursor = 'col-resize';
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return;
      const newWidth = window.innerWidth - e.clientX;
      setPanelWidth(Math.min(640, Math.max(280, newWidth)));
    };
    const onUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // Check authentication on mount
  useEffect(() => {
    axios
      .get('/api/snippets', { validateStatus: () => true })
      .then((res) => {
        if (res.status === 200) {
          setIsAuth(true);
          loadSnippets();
        }
      })
      .catch(() => {});
  }, []);

  const handleAuth = async () => {
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      await axios.post(endpoint, { username, password });
      setIsAuth(true);
      toast(authMode === 'login' ? 'Welcome back!' : 'Account created', 'success');
    } catch (e) {
      console.error('Auth API Error:', e);
      let errorMsg = e.message || 'Authentication error';
      if (e.response?.data) {
        errorMsg = typeof e.response.data === 'object' ? JSON.stringify(e.response.data) : e.response.data;
      }
      toast(errorMsg, 'error');
    }
  };

  const handleExplain = async () => {
    if (!code.trim()) return toast('Enter some code first', 'error');
    setLoading(true);
    try {
      const response = await axios.post('/api/explain', { code, language });
      const snippetData = { ...response.data, code, language };
      setResult(snippetData);
      addSnippet(snippetData);
      toast('Analysis complete', 'success');
    } catch (e) {
      toast(e.response?.data?.error || e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNewSnippet = () => {
    setCode('');
    setResult(null);
    setSelectedSnippetId(null);
  };

  const filteredSnippets = snippets.filter(
    (s) =>
      s.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.language.includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast('Copied to clipboard', 'success');
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (!isAuth) {
    return (
      <div className="auth-container">
        <ToastHost />
        <div className="auth-card">
          <div className="auth-logo">⚡</div>
          <h2>{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="auth-subtitle">
            {authMode === 'login' ? 'Log in to continue to Code Explainer' : 'Start explaining code with AI'}
          </p>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleAuth}>{authMode === 'login' ? 'Login' : 'Register'}</button>
          <p>
            {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <span className="link" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? 'Register' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <ToastHost />
      <header className="header">
        <h1>AI Code Explainer</h1>
      </header>

      <div className="main-layout">
        {/* Left Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Snippets</h2>
            <button className="new-snippet-btn" onClick={handleNewSnippet} title="New Snippet">
              ➕
            </button>
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search snippets..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="snippets-list">
            {filteredSnippets.length === 0 ? (
              <p className="empty-message">No snippets yet</p>
            ) : (
              filteredSnippets.map((snippet) => (
                <div
                  key={snippet.id}
                  className={`snippet-item ${selectedSnippetId === snippet.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedSnippetId(snippet.id);
                    setCode(snippet.code);
                    setLanguage(snippet.language);
                    setResult(snippet);
                  }}
                >
                  <div className="snippet-badge">{snippet.language === 'javascript' ? 'js' : snippet.language === 'python' ? 'py' : snippet.language}</div>
                  <div className="snippet-info">
                    <div className="snippet-title">{snippet.title ?? snippet.summary?.substring(0, 30)}{snippet.title ? '' : '...'}</div>
                    {snippet.created_at && (
                      <div className="snippet-time">{formatTimestamp(snippet.created_at)}</div>
                    )}
                  </div>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSnippet(snippet.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Center Panel */}
        <div className="editor-panel">
          <div className="editor-toolbar">
            <div className="language-selector">
              <label>Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </select>
            </div>
            <div className="editor-buttons">
              <button
                className="clear-btn"
                onClick={handleNewSnippet}
                title="Clear Editor"
              >
                Clear
              </button>
              <button
                onClick={handleExplain}
                disabled={loading}
                className="explain-btn"
              >
                {loading ? '⏳ Analyzing...' : '⚡ Explain'}
              </button>
            </div>
          </div>

          <div className="editor-container">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Fira Code', 'Courier New', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="resize-handle" onMouseDown={startResize} />
        <div className="explanation-panel" style={{ width: panelWidth }}>
          <div className="explanation-header">
            <h3>Analysis Result</h3>
          </div>

          {loading ? (
            <div className="explanation-content">
              <div className="skeleton-block" />
              <div className="skeleton-block" />
              <div className="skeleton-block short" />
            </div>
          ) : !result ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p>Your analysis will appear here</p>
              <span>Write some code and click Explain</span>
            </div>
          ) : (
            <div className="explanation-content">
              {/* Summary */}
              <div className="explanation-section">
                <h4>Summary</h4>
                <p>{result.summary}</p>
              </div>

              {/* Explanation */}
              <div className="explanation-section">
                <h4>Step-by-Step Explanation</h4>
                <p>{result.explanation}</p>
              </div>

              {/* Complexity */}
              <div className="explanation-section">
                <h4>Complexity Analysis</h4>
                <div className="complexity-grid">
                  <div className="complexity-item">
                    <span className="complexity-label">Time:</span>
                    <code>{result.time_complexity || result.timeComplexity}</code>
                  </div>
                  <div className="complexity-item">
                    <span className="complexity-label">Space:</span>
                    <code>{result.space_complexity || result.spaceComplexity}</code>
                  </div>
                </div>
              </div>

              {/* Optimized Code */}
              <div className="explanation-section">
                <div className="section-header">
                  <h4>Optimized Code</h4>
                  <button
                    className="copy-btn"
                    onClick={() =>
                      copyToClipboard(result.optimized_code || result.optimizedCode)
                    }
                    title="Copy Code"
                  >
                    📋
                  </button>
                </div>
                <SyntaxHighlighter
                  language={language === 'python' ? 'python' : 'javascript'}
                  style={vscDarkPlus}
                  customStyle={{ borderRadius: 8, fontSize: 12, margin: 0 }}
                >
                  {result.optimized_code || result.optimizedCode || ''}
                </SyntaxHighlighter>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
