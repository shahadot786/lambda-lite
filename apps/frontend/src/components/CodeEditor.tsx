import Editor, { loader } from '@monaco-editor/react';
import { useTheme } from './theme-provider';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
}

// Define custom themes
loader.init().then((monaco) => {
  monaco.editor.defineTheme('lambda-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#020817', // Matching dark background
      'editor.lineHighlightBackground': '#1e293b',
      'editor.selectionBackground': '#3b82f644',
      'editorLineNumber.foreground': '#64748b',
      'editorLineNumber.activeForeground': '#3b82f6',
    },
  });

  monaco.editor.defineTheme('lambda-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#ffffff', // Matching light background
      'editor.lineHighlightBackground': '#f1f5f9',
      'editor.selectionBackground': '#3b82f622',
      'editorLineNumber.foreground': '#94a3b8',
      'editorLineNumber.activeForeground': '#3b82f6',
    },
  });
});

export default function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  height = '400px',
}: CodeEditorProps) {
  const { theme } = useTheme();

  const getMonacoTheme = () => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'lambda-dark'
        : 'lambda-light';
    }
    return theme === 'dark' ? 'lambda-dark' : 'lambda-light';
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border/40 shadow-inner">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(value) => onChange(value || '')}
        theme={getMonacoTheme()}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          padding: { top: 16, bottom: 16 },
          fontFamily: '"JetBrains Mono", "Consolas", "Monaco", "monospace"',
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          roundedSelection: true,
        }}
      />
    </div>
  );
}
