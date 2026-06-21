import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Link,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';
import './NotebookViewer.css';

// Slider output convention: start#slider begins a block, end#slider ends it; frame#start / frame#end delimit frames
const SLIDER_SHEBANG = 'abhij2706.github.io:start#slider';
const SLIDER_END = 'abhij2706.github.io:end#slider';
const FRAME_START = 'abhij2706.github.io:frame#start';
const FRAME_END = 'abhij2706.github.io:frame#end';

const MINIMIZED_MARKER = 'abhij2706.github.io:minimized';

function parseMinimizedCode(sourceText) {
  const raw = typeof sourceText === 'string' ? sourceText : (Array.isArray(sourceText) ? sourceText.join('') : '');
  const lines = raw.split('\n');

  // Find first non-empty line
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i += 1;
  if (i >= lines.length) return { minimizedByDefault: false, code: raw };

  const first = lines[i].trim();
  const isHashComment = first.startsWith('#');
  const isSlashComment = first.startsWith('//');
  if (!isHashComment && !isSlashComment) return { minimizedByDefault: false, code: raw };

  const commentBody = isHashComment ? first.slice(1).trim() : first.slice(2).trim();
  if (commentBody !== MINIMIZED_MARKER) return { minimizedByDefault: false, code: raw };

  // Strip marker line
  const remaining = [...lines.slice(0, i), ...lines.slice(i + 1)].join('\n').replace(/^\n+/, '');
  return { minimizedByDefault: true, code: remaining };
}

function parseMinimizedPrefix(text) {
  const raw = joinOutputText(text);
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith(MINIMIZED_MARKER)) {
    return { minimizedByDefault: false, text: raw };
  }
  let rest = trimmed.slice(MINIMIZED_MARKER.length);
  if (rest.startsWith('\r\n')) rest = rest.slice(2);
  else if (rest.startsWith('\n')) rest = rest.slice(1);
  return { minimizedByDefault: true, text: rest };
}

function isMinimizedMarkerOnly(text) {
  return joinOutputText(text).trim() === MINIMIZED_MARKER;
}

function stripMinimizedFromOutput(output) {
  if (!output) return output;
  if (output.output_type === 'stream') {
    const { text } = parseMinimizedPrefix(output.text);
    return { ...output, text };
  }
  if (output.data?.['text/plain']) {
    const { text } = parseMinimizedPrefix(output.data['text/plain']);
    return { ...output, data: { ...output.data, 'text/plain': text } };
  }
  return output;
}

function CollapsibleOutput({ minimizedByDefault, label = 'Output', children }) {
  const [open, setOpen] = useState(!minimizedByDefault);
  const toggle = () => setOpen((v) => !v);

  return (
    <Box className="notebook-output" sx={{ marginBottom: 2 }}>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #ddd',
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: '#fafafa',
        }}
      >
        <Box
          onClick={toggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') toggle();
          }}
          sx={{
            padding: '0.5rem 1rem',
            borderBottom: open ? '1px solid #ddd' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          aria-expanded={open}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#666',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {label}
          </Typography>
          <Typography variant="caption" sx={{ color: '#888', fontSize: '0.8rem' }}>
            {open ? 'Click to hide' : 'Click to view'}
          </Typography>
        </Box>
        {open && <Box sx={{ p: 0.5 }}>{children}</Box>}
      </Paper>
    </Box>
  );
}

function CodeCell({ code, language, outputs, minimizedByDefault, renderOutput }) {
  const [open, setOpen] = useState(!minimizedByDefault);

  return (
    <Box className="notebook-cell notebook-code" sx={{ marginBottom: 4 }}>
      <Paper
        elevation={0}
        sx={{
          backgroundColor: '#1e1e1e',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid #333',
        }}
      >
        <Box
          onClick={() => setOpen((v) => !v)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v);
          }}
          sx={{
            backgroundColor: '#252526',
            padding: '0.5rem 1rem',
            borderBottom: '1px solid #333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          aria-expanded={open}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#858585',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {language}
          </Typography>

          <Typography variant="caption" sx={{ color: '#c0c0c0', fontSize: '0.8rem' }}>
            {open ? 'Click to hide' : 'Click to view'}
          </Typography>
        </Box>

        {open && (
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1rem',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              backgroundColor: '#1e1e1e',
            }}
            showLineNumbers={false}
          >
            {code}
          </SyntaxHighlighter>
        )}
      </Paper>

      {/* Render outputs */}
      {outputs.length > 0 && (
        <Box sx={{ marginTop: 2 }}>
          {buildOutputRenderList(outputs).map((item, outputIndex) => {
            const content = item.kind === 'slider'
              ? <SliderOutput frames={item.frames} />
              : renderOutput(item.output);
            if (content == null) return null;

            return (
              <CollapsibleOutput
                key={outputIndex}
                minimizedByDefault={item.minimizedByDefault}
                label={item.kind === 'slider' ? 'Slider' : 'Output'}
              >
                {content}
              </CollapsibleOutput>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

function parseFramesFromBlock(blockContent) {
  const parts = blockContent.split(FRAME_START);
  const frames = [];
  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const endIdx = chunk.indexOf(FRAME_END);
    const content = endIdx >= 0 ? chunk.slice(0, endIdx).trim() : chunk.trim();
    frames.push(content);
  }
  return frames;
}

function joinOutputText(text) {
  return typeof text === 'string' ? text : (Array.isArray(text) ? text.join('') : '');
}

/**
 * Matplotlib plt.show() emits display_data between stream markers. Detect that
 * interleaved pattern starting at outputs[startIndex] and return image frames.
 */
function parseInterleavedSliderAt(outputs, startIndex) {
  const out = outputs[startIndex];
  if (!out || out.output_type !== 'stream') return null;
  const { text, minimizedByDefault } = parseMinimizedPrefix(out.text);
  if (!text.includes(SLIDER_SHEBANG) || !text.includes(FRAME_START)) return null;

  const frames = [];
  let i = startIndex + 1;

  const readImageFrame = () => {
    if (i >= outputs.length || outputs[i].output_type !== 'display_data') return false;
    const png = outputs[i].data?.['image/png'];
    if (!png) return false;
    frames.push({ type: 'image', data: png });
    i += 1;
    return true;
  };

  if (!readImageFrame()) return null;

  while (i < outputs.length) {
    if (outputs[i].output_type !== 'stream') return null;
    const streamText = joinOutputText(outputs[i].text);
    if (streamText.includes(SLIDER_END)) {
      return frames.length > 0 ? { frames, endIndex: i, minimizedByDefault } : null;
    }
    if (!streamText.includes(FRAME_START)) return null;
    i += 1;
    if (!readImageFrame()) return null;
  }

  return null;
}

/** Group cell outputs, merging interleaved image sliders into single slider items. */
function buildOutputRenderList(outputs) {
  const items = [];
  let i = 0;
  while (i < outputs.length) {
    let minimizedByDefault = false;
    if (outputs[i].output_type === 'stream' && isMinimizedMarkerOnly(outputs[i].text)) {
      minimizedByDefault = true;
      i += 1;
      if (i >= outputs.length) break;
    }

    const interleaved = parseInterleavedSliderAt(outputs, i);
    if (interleaved) {
      items.push({
        kind: 'slider',
        frames: interleaved.frames,
        minimizedByDefault: minimizedByDefault || interleaved.minimizedByDefault,
      });
      i = interleaved.endIndex + 1;
      continue;
    }

    const out = outputs[i];
    const { minimizedByDefault: prefixMinimized } = parseMinimizedPrefix(
      out.output_type === 'stream' ? out.text : out.data?.['text/plain'],
    );
    items.push({
      kind: 'output',
      output: stripMinimizedFromOutput(out),
      minimizedByDefault: minimizedByDefault || prefixMinimized,
    });
    i += 1;
  }
  return items;
}

/** If output contains slider(s), returns array of sliders (each slider = array of frame strings); otherwise null. */
function parseSliders(text) {
  const raw = typeof text === 'string' ? text : (Array.isArray(text) ? text.join('') : '');
  let remaining = raw;
  const sliders = [];
  while (remaining.includes(SLIDER_SHEBANG)) {
    const idx = remaining.indexOf(SLIDER_SHEBANG);
    const afterShebang = remaining.slice(idx + SLIDER_SHEBANG.length);
    const endIdx = afterShebang.indexOf(SLIDER_END);
    if (endIdx < 0) break;
    const blockContent = afterShebang.slice(0, endIdx);
    const frames = parseFramesFromBlock(blockContent);
    if (frames.length > 0) sliders.push(frames);
    remaining = afterShebang.slice(endIdx + SLIDER_END.length);
  }
  return sliders.length > 0 ? sliders : null;
}

function renderSliderFrame(frame) {
  if (typeof frame === 'string') return frame;
  if (frame?.type === 'image') {
    return (
      <Box
        component="img"
        src={`data:image/png;base64,${frame.data}`}
        alt="Notebook frame"
        sx={{
          maxWidth: 'none',
          width: 'auto',
          height: 'auto',
          borderRadius: 1,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'block',
        }}
      />
    );
  }
  return frame?.data ?? '';
}

/** Renders a list of frames as a step-through slider. */
function SliderOutput({ frames }) {
  const [index, setIndex] = useState(0);
  const n = frames.length;
  const current = frames[index];
  const isTextFrame = typeof current === 'string';
  return (
    <Box className="notebook-slider-output" sx={{ marginTop: 1, marginBottom: 2 }}>
      <Box
        component={isTextFrame ? 'pre' : 'div'}
        sx={{
          fontFamily: isTextFrame ? 'monospace' : 'inherit',
          fontSize: '0.9rem',
          lineHeight: 1.6,
          margin: 0,
          padding: isTextFrame ? 2 : 0,
          backgroundColor: isTextFrame ? '#f5f5f5' : 'transparent',
          borderRadius: 1,
          whiteSpace: isTextFrame ? 'pre' : 'normal',
          minWidth: 'fit-content',
          minHeight: 60,
          maxHeight: isTextFrame ? 400 : 600,
          overflow: 'auto',
        }}
      >
        {renderSliderFrame(current)}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '2.5rem' }}>
          {index + 1} / {n}
        </Typography>
        <Box
          component="input"
          type="range"
          min={0}
          max={Math.max(0, n - 1)}
          value={index}
          onChange={(e) => setIndex(Number(e.target.value))}
          aria-label="Frame"
          sx={{
            flex: 1,
            height: 6,
            cursor: 'pointer',
            accentColor: '#1e40af',
          }}
        />
      </Box>
    </Box>
  );
}

// Try to import the notebooks manifest (generated by script)
let notebooksManifest = null;
try {
  // eslint-disable-next-line import/no-unresolved
  notebooksManifest = require('./notebooks-manifest.json');
} catch (error) {
  console.warn('Notebooks manifest not found. Run "npm run generate-notebooks-manifest" to generate it.');
}

const NotebookViewer = ({ notebookPath }) => {
  const [notebook, setNotebook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNotebook = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the notebook file
        const response = await fetch(notebookPath);
        if (!response.ok) {
          throw new Error(`Failed to load notebook: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate it's a Jupyter notebook
        if (!data.cells || !Array.isArray(data.cells)) {
          throw new Error('Invalid notebook format: missing cells array');
        }
        
        setNotebook(data);
      } catch (err) {
        setError(err.message);
        console.error('Error loading notebook:', err);
      } finally {
        setLoading(false);
      }
    };

    if (notebookPath) {
      loadNotebook();
    }
  }, [notebookPath]);

  const renderOutput = (output) => {
    if (!output) return null;

    const outputType = output.output_type;
    const data = output.data || {};

    // Handle different output types
    if (outputType === 'stream') {
      const text = output.text || '';
      const streamText = Array.isArray(text) ? text.join('') : text;
      const { text: strippedText } = parseMinimizedPrefix(streamText);
      const sliders = parseSliders(strippedText);
      if (sliders) {
        return (
          <Box sx={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'auto', borderRadius: 1 }}>
            {sliders.map((frames, i) => (
              <SliderOutput key={i} frames={frames} />
            ))}
          </Box>
        );
      }
      return (
        <Box
          sx={{
            marginTop: 1,
            maxHeight: '400px',
            overflowY: 'auto',
            overflowX: 'auto',
            borderRadius: 1,
          }}
        >
          <Box
            component="pre"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              margin: 0,
              padding: 2,
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              whiteSpace: 'pre',
              minWidth: 'fit-content',
            }}
          >
            {strippedText}
          </Box>
        </Box>
      );
    }

    if (outputType === 'error') {
      const traceback = output.traceback || [];
      const errorName = output.ename || 'Error';
      const errorValue = output.evalue || '';
      
      return (
        <Box
          sx={{
            backgroundColor: '#fee',
            borderLeft: '4px solid #f44336',
            padding: 2,
            borderRadius: 1,
            marginTop: 1,
            maxHeight: '400px',
            overflowY: 'auto',
            overflowX: 'auto',
          }}
        >
          <Typography variant="subtitle2" sx={{ color: '#c62828', fontWeight: 600, mb: 1, fontFamily: "'Source Serif 4', serif" }}>
            {errorName}: {errorValue}
          </Typography>
          {traceback.length > 0 && (
            <Box
              component="pre"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                margin: 0,
                whiteSpace: 'pre',
                color: '#c62828',
                minWidth: 'fit-content',
              }}
            >
              {traceback.join('\n')}
            </Box>
          )}
        </Box>
      );
    }

    if (outputType === 'execute_result' || outputType === 'display_data') {
      // Handle images FIRST (prioritize over text/plain for matplotlib outputs)
      if (data['image/png']) {
        const imageData = data['image/png'];
        return (
          <Box 
            sx={{ 
              marginTop: 1, 
              textAlign: 'left',
              maxHeight: '600px',
              overflowY: 'auto',
              overflowX: 'auto',
              borderRadius: 1,
            }}
          >
            <img
              src={`data:image/png;base64,${imageData}`}
              alt="Notebook output"
              style={{
                maxWidth: 'none',
                width: 'auto',
                height: 'auto',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'block',
              }}
            />
          </Box>
        );
      }

      if (data['image/jpeg'] || data['image/jpg']) {
        const imageData = data['image/jpeg'] || data['image/jpg'];
        return (
          <Box 
            sx={{ 
              marginTop: 1, 
              textAlign: 'left',
              maxHeight: '600px',
              overflowY: 'auto',
              overflowX: 'auto',
              borderRadius: 1,
            }}
          >
            <img
              src={`data:image/jpeg;base64,${imageData}`}
              alt="Notebook output"
              style={{
                maxWidth: 'none',
                width: 'auto',
                height: 'auto',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'block',
              }}
            />
          </Box>
        );
      }

      // Handle HTML
      if (data['text/html']) {
        const html = Array.isArray(data['text/html']) 
          ? data['text/html'].join('') 
          : data['text/html'];
        return (
          <Box
            sx={{
              marginTop: 1,
              maxHeight: '600px',
              overflowY: 'auto',
              overflowX: 'auto',
              borderRadius: 1,
              '& img': {
                maxWidth: 'none',
                width: 'auto',
                height: 'auto',
                borderRadius: 1,
              },
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }

      // Handle text/plain (but skip matplotlib figure descriptions)
      if (data['text/plain']) {
        let text = Array.isArray(data['text/plain']) 
          ? data['text/plain'].join('') 
          : data['text/plain'];
        const { text: strippedText } = parseMinimizedPrefix(text);
        text = strippedText;
        
        // Skip matplotlib figure descriptions like "<Figure size 640x480 with 1 Axes>"
        if (typeof text === 'string' && text.trim().match(/^<Figure size \d+x\d+ with \d+ Axes>$/)) {
          return null; // Don't display matplotlib figure text when image is available
        }

        const sliders = parseSliders(text);
        if (sliders) {
          return (
            <Box sx={{ marginTop: 1, maxHeight: '400px', overflowY: 'auto', overflowX: 'auto', borderRadius: 1 }}>
              {sliders.map((frames, i) => (
                <SliderOutput key={i} frames={frames} />
              ))}
            </Box>
          );
        }
        
        return (
          <Box
            sx={{
              marginTop: 1,
              maxHeight: '400px',
              overflowY: 'auto',
              overflowX: 'auto',
              borderRadius: 1,
            }}
          >
            <Box
              component="pre"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                margin: 0,
                padding: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                whiteSpace: 'pre',
                minWidth: 'fit-content',
              }}
            >
              {text}
            </Box>
          </Box>
        );
      }

      // Handle LaTeX/Math
      if (data['text/latex']) {
        const latex = Array.isArray(data['text/latex']) 
          ? data['text/latex'].join('') 
          : data['text/latex'];
        return (
          <Box 
            sx={{ 
              marginTop: 1, 
              padding: 2, 
              backgroundColor: '#f5f5f5', 
              borderRadius: 1,
              maxHeight: '400px',
              overflowY: 'auto',
              overflowX: 'auto',
            }}
          >
            <ReactMarkdown 
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {`$$${latex}$$`}
            </ReactMarkdown>
          </Box>
        );
      }
    }

    return null;
  };

  const renderCell = (cell, index) => {
    const cellType = cell.cell_type;
    const source = cell.source || '';

    // Join source array if it's an array
    const sourceText = Array.isArray(source) ? source.join('') : source;

    if (cellType === 'markdown') {
      return (
        <Box
          key={index}
          className="notebook-cell notebook-markdown"
          sx={{
            marginBottom: 4,
            textAlign: 'left',
            '& p': {
              marginBottom: '1.5rem',
              lineHeight: 1.8,
              fontSize: '1.1rem',
              color: '#333',
              textAlign: 'left',
            },
            '& h1': {
              marginTop: '2rem',
              marginBottom: '1rem',
              fontSize: '2.5rem',
              fontWeight: 700,
              lineHeight: 1.2,
              textAlign: 'left',
            },
            '& h2': {
              marginTop: '2rem',
              marginBottom: '1rem',
              fontSize: '2rem',
              fontWeight: 600,
              lineHeight: 1.3,
              textAlign: 'left',
            },
            '& h3': {
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
              fontSize: '1.5rem',
              fontWeight: 600,
              lineHeight: 1.4,
              textAlign: 'left',
            },
            '& ul, & ol': {
              marginBottom: '1.5rem',
              paddingLeft: '2rem',
            },
            '& li': {
              marginBottom: '0.5rem',
              lineHeight: 1.8,
            },
            '& blockquote': {
              borderLeft: '4px solid #1e40af',
              paddingLeft: '1.5rem',
              marginLeft: 0,
              marginBottom: '1.5rem',
              fontStyle: 'italic',
              color: '#666',
            },
            '& code': {
              backgroundColor: '#f5f5f5',
              padding: '0.2em 0.4em',
              borderRadius: '3px',
              fontSize: '0.9em',
              fontFamily: 'monospace',
            },
            '& pre': {
              backgroundColor: '#f5f5f5',
              padding: '1rem',
              borderRadius: '8px',
              overflowX: 'auto',
              marginBottom: '1.5rem',
            },
            '& pre code': {
              backgroundColor: 'transparent',
              padding: 0,
            },
            '& table': {
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '1.5rem',
            },
            '& th, & td': {
              border: '1px solid #ddd',
              padding: '0.75rem',
              textAlign: 'left',
            },
            '& th': {
              backgroundColor: '#f5f5f5',
              fontWeight: 600,
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
              marginTop: '1rem',
              marginBottom: '1rem',
            },
            '& a': {
              color: '#1e40af',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
          }}
        >
          <ReactMarkdown 
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {sourceText}
          </ReactMarkdown>
        </Box>
      );
    }

    if (cellType === 'code') {
      const outputs = cell.outputs || [];
      const language = cell.metadata?.language || 'python';
      const { minimizedByDefault, code } = parseMinimizedCode(sourceText);

      return (
        <Box key={index}>
          <CodeCell
            code={code}
            language={language}
            outputs={outputs}
            minimizedByDefault={minimizedByDefault}
            renderOutput={renderOutput}
          />
        </Box>
      );
    }

    if (cellType === 'raw') {
      return (
        <Box
          key={index}
          className="notebook-cell notebook-raw"
          sx={{
            marginBottom: 4,
            padding: 2,
            backgroundColor: '#f9f9f9',
            borderRadius: 1,
            border: '1px solid #e0e0e0',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              marginBottom: 1,
              color: '#666',
              fontWeight: 600,
              fontFamily: "'Source Serif 4', serif",
            }}
          >
            Raw Cell
          </Typography>
          <Box
            component="pre"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {sourceText}
          </Box>
        </Box>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'left', position: 'relative' }}>
        <Link
          component={RouterLink}
          to="/blog"
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: '#1e40af',
            textDecoration: 'none',
            fontFamily: "'Source Serif 4', serif",
            fontSize: '1rem',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          ← Blog
        </Link>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary', fontFamily: "'Source Serif 4', serif" }}>
          Loading notebook...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8, position: 'relative' }}>
        <Link
          component={RouterLink}
          to="/blog"
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: '#1e40af',
            textDecoration: 'none',
            fontFamily: "'Source Serif 4', serif",
            fontSize: '1rem',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          ← Blog
        </Link>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom sx={{ fontFamily: "'Source Serif 4', serif" }}>
            Error loading notebook
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: "'Source Serif 4', serif" }}>{error}</Typography>
        </Alert>
      </Container>
    );
  }

  if (!notebook) {
    return (
      <Container maxWidth="md" sx={{ py: 8, position: 'relative' }}>
        <Link
          component={RouterLink}
          to="/blog"
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: '#1e40af',
            textDecoration: 'none',
            fontFamily: "'Source Serif 4', serif",
            fontSize: '1rem',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          ← Blog
        </Link>
        <Alert severity="info">
          <Typography sx={{ fontFamily: "'Source Serif 4', serif" }}>
            No notebook path provided. Please specify a notebook file to display.
          </Typography>
        </Alert>
      </Container>
    );
  }

  // Extract filename from notebookPath to look up override title
  const filename = notebookPath ? notebookPath.split('/').pop() : null;
  const notebookFromManifest = filename && notebooksManifest?.notebooks?.find(nb => nb.filename === filename);
  
  const metadata = notebook.metadata || {};
  // Use override title from manifest if available, otherwise fall back to notebook metadata
  const title = notebookFromManifest?.title || metadata.title || 'Notebook';

  return (
    <Container maxWidth="md" className="notebook-viewer" sx={{ py: { xs: 4, md: 6 }, textAlign: 'left', position: 'relative' }}>
      <Link
        component={RouterLink}
        to="/blog"
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          color: '#1e40af',
          textDecoration: 'none',
          fontFamily: "'Source Serif 4', serif",
          fontSize: '1rem',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        ← Blog
      </Link>
      <Box sx={{ mb: 6, mt: 6, pt: 2, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            marginBottom: 2,
            color: '#1e40af',
            lineHeight: 1.2,
            textAlign: 'center',
            fontFamily: "'Source Serif 4', serif",
          }}
        >
          {title}
        </Typography>
        {metadata.authors && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1, textAlign: 'center', fontFamily: "'Source Serif 4', serif" }}>
            {Array.isArray(metadata.authors) 
              ? metadata.authors.join(', ') 
              : metadata.authors}
          </Typography>
        )}
        {metadata.date && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontFamily: "'Source Serif 4', serif" }}>
            {new Date(metadata.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        )}
      </Box>

      <Box className="notebook-content" sx={{ textAlign: 'left' }}>
        {notebook.cells.map((cell, index) => renderCell(cell, index))}
      </Box>
    </Container>
  );
};

export default NotebookViewer;

