import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Palette,
  Highlighter,
  RemoveFormatting,
  Undo2,
  Redo2,
  Eye,
  Edit3,
  HelpCircle,
} from "lucide-react";

interface ToolbarTool {
  id: string;
  name: string;
  description: string;
  shortcut: string;
  icon: React.ReactNode;
  category: "format" | "heading" | "list" | "align" | "insert" | "color" | "history";
  action: (currentText: string, selStart: number, selEnd: number) => { newText: string; newSel: [number, number] };
}

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  helpText?: string;
}

export default function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Write content here...",
  rows = 8,
  className = "",
  helpText,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [hoveredTool, setHoveredTool] = useState<ToolbarTool | null>(null);
  const [history, setHistory] = useState<string[]>([value || ""]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [activeColorPicker, setActiveColorPicker] = useState<"text" | "highlight" | null>(null);

  // Sync external value changes into history if new
  useEffect(() => {
    if (value !== history[historyIndex]) {
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), value]);
      setHistoryIndex((prev) => prev + 1);
    }
  }, [value]);

  const pushHistory = (newVal: string) => {
    const updated = [...history.slice(0, historyIndex + 1), newVal];
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
    onChange(newVal);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      onChange(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      onChange(history[newIdx]);
    }
  };

  // 24 Full Toolbar Specifications with Microcopy, Descriptions & Shortcuts
  const tools: ToolbarTool[] = [
    // 1. Bold
    {
      id: "bold",
      name: "Bold",
      description: "Applies heavy font weight to emphasize crucial keywords or terms.",
      shortcut: "Ctrl+B",
      icon: <Bold className="w-3.5 h-3.5" />,
      category: "format",
      action: (text, start, end) => {
        const sel = text.substring(start, end) || "bold text";
        const newText = text.substring(0, start) + `**${sel}**` + text.substring(end);
        return { newText, newSel: [start + 2, start + 2 + sel.length] };
      },
    },
    // 2. Italic
    {
      id: "italic",
      name: "Italic",
      description: "Slants selected text for citations, foreign terms, or secondary emphasis.",
      shortcut: "Ctrl+I",
      icon: <Italic className="w-3.5 h-3.5" />,
      category: "format",
      action: (text, start, end) => {
        const sel = text.substring(start, end) || "italicized text";
        const newText = text.substring(0, start) + `*${sel}*` + text.substring(end);
        return { newText, newSel: [start + 1, start + 1 + sel.length] };
      },
    },
    // 3. Underline
    {
      id: "underline",
      name: "Underline",
      description: "Renders a clean horizontal line beneath selected text for visual priority.",
      shortcut: "Ctrl+U",
      icon: <Underline className="w-3.5 h-3.5" />,
      category: "format",
      action: (text, start, end) => {
        const sel = text.substring(start, end) || "underlined text";
        const newText = text.substring(0, start) + `<u>${sel}</u>` + text.substring(end);
        return { newText, newSel: [start + 3, start + 3 + sel.length] };
      },
    },
    // 4. Strikethrough
    {
      id: "strikethrough",
      name: "Strikethrough",
      description: "Draws a line through text to indicate retracted or outdated information.",
      shortcut: "Ctrl+Shift+X",
      icon: <Strikethrough className="w-3.5 h-3.5" />,
      category: "format",
      action: (text, start, end) => {
        const sel = text.substring(start, end) || "struck text";
        const newText = text.substring(0, start) + `~~${sel}~~` + text.substring(end);
        return { newText, newSel: [start + 2, start + 2 + sel.length] };
      },
    },

    // 5. Heading 1
    {
      id: "h1",
      name: "Heading 1",
      description: "Primary section heading. Used for main titles and campus announcements.",
      shortcut: "Ctrl+Alt+1",
      icon: <Heading1 className="w-3.5 h-3.5" />,
      category: "heading",
      action: (text, start, end) => {
        const sel = text.substring(start, end) || "Main Heading";
        const newText = text.substring(0, start) + `\n# ${sel}\n` + text.substring(end);
        return { newText, newSel: [start + 3, start + 3 + sel.length] };
      },
    },
    // 6. Heading 2
    {
      id: "h2",
      name: "Heading 2",
      description: "Secondary section heading for major subdivisions and categories.",
      shortcut: "Ctrl+Alt+2",
      icon: <Heading2 className="w-3.5 h-3.5" />,
      category: "heading",
      action: (text, start, end) => {
        const sel = text.substring(start, end) || "Subsection Heading";
        const newText = text.substring(0, start) + `\n## ${sel}\n` + text.substring(end);
        return { newText, newSel: [start + 4, start + 4 + sel.length] };
      },
    },
    // 7. Heading 3
    {
      id: "h3",
      name: "Heading 3",
      description: "Tertiary heading for minor sub-topics, points, and step titles.",
      shortcut: "Ctrl+Alt+3",
      icon: <Heading3 className="w-3.5 h-3.5" />,
      category: "heading",
      action: (text, start, end) => {
        const sel = text.substring(start, end) || "Sub-topic Heading";
        const newText = text.substring(0, start) + `\n### ${sel}\n` + text.substring(end);
        return { newText, newSel: [start + 5, start + 5 + sel.length] };
      },
    },
    // 8. Paragraph / Normal
    {
      id: "paragraph",
      name: "Normal Text",
      description: "Standard body paragraph with standard line-height and letter tracking.",
      shortcut: "Ctrl+Alt+0",
      icon: <Pilcrow className="w-3.5 h-3.5" />,
      category: "heading",
      action: (text, start, end) => {
        const sel = text.substring(start, end) || "Standard paragraph text.";
        const newText = text.substring(0, start) + `\n\n${sel}\n\n` + text.substring(end);
        return { newText, newSel: [start + 2, start + 2 + sel.length] };
      },
    },

    // 9. Bullet List
    {
      id: "bullet-list",
      name: "Bullet List",
      description: "Organizes unordered points into clean, scannable bullet items.",
      shortcut: "Ctrl+Shift+8",
      icon: <List className="w-3.5 h-3.5" />,
      category: "list",
      action: (text, start, end) => {
        const sel = text.substring(start, end);
        const lines = sel ? sel.split("\n") : ["Item 1", "Item 2", "Item 3"];
        const formatted = lines.map((l) => `- ${l.replace(/^[-*•\d.]+\s*/, "")}`).join("\n");
        const newText = text.substring(0, start) + `\n${formatted}\n` + text.substring(end);
        return { newText, newSel: [start + 1, start + 1 + formatted.length] };
      },
    },
    // 10. Numbered List
    {
      id: "numbered-list",
      name: "Numbered List",
      description: "Creates an ordered sequence of numbered items for step-by-step guidance.",
      shortcut: "Ctrl+Shift+7",
      icon: <ListOrdered className="w-3.5 h-3.5" />,
      category: "list",
      action: (text, start, end) => {
        const sel = text.substring(start, end);
        const lines = sel ? sel.split("\n") : ["First step", "Second step", "Third step"];
        const formatted = lines.map((l, i) => `${i + 1}. ${l.replace(/^[-*•\d.]+\s*/, "")}`).join("\n");
        const newText = text.substring(0, start) + `\n${formatted}\n` + text.substring(end);
        return { newText, newSel: [start + 1, start + 1 + formatted.length] };
      },
    },
    // 11. Blockquote
    {
      id: "quote",
      name: "Blockquote",
      description: "Formats highlighted quote callout with an elegant vertical border accent.",
      shortcut: "Ctrl+Shift+9",
      icon: <Quote className="w-3.5 h-3.5" />,
      category: "list",
      action: (text, start, end) => {
        const sel = text.substring(start, end) || "Official campus quote or executive statement.";
        const formatted = sel.split("\n").map((l) => `> ${l}`).join("\n");
        const newText = text.substring(0, start) + `\n${formatted}\n` + text.substring(end);
        return { newText, newSel: [start + 1, start + 1 + formatted.length] };
      },
    },
    // 12. Monospace Code
    {
      id: "code",
      name: "Inline Code",
      description: "Highlights technical keywords, tracking codes, or URLs in monospace font.",
      shortcut: "Ctrl+E",
      icon: <Code className="w-3.5 h-3.5" />,
      category: "list",
      action: (text, start, end) => {
        const sel = text.substring(start, end) || "FSU-COMP-XXXXXX";
        const newText = text.substring(0, start) + `\`${sel}\`` + text.substring(end);
        return { newText, newSel: [start + 1, start + 1 + sel.length] };
      },
    },

    // 13. Align Left
    {
      id: "align-left",
      name: "Align Left",
      description: "Flushes paragraph lines to the left margin. Standard western layout format.",
      shortcut: "Ctrl+Shift+L",
      icon: <AlignLeft className="w-3.5 h-3.5" />,
      category: "align",
      action: (text, start, end) => {
        const sel = text.substring(start, end) || "Left-aligned content";
        const newText = text.substring(0, start) + `<div align="left">\n${sel}\n</div>` + text.substring(end);
        return { newText, newSel: [start + 19, start + 19 + sel.length] };
      },
    },
    // 14. Align Center
    {
      id: "align-center",
      name: "Align Center",
      description: "Centers text horizontally for banners, hero announcements, and certs.",
      shortcut: "Ctrl+Shift+E",
      icon: <AlignCenter className="w-3.5 h-3.5" />,
      category: "align",
      action: (text, start, end) => {
        const sel = text.substring(start, end) || "Center-aligned notice";
        const newText = text.substring(0, start) + `<div align="center">\n${sel}\n</div>` + text.substring(end);
        return { newText, newSel: [start + 21, start + 21 + sel.length] };
      },
    },
    // 15. Align Right
    {
      id: "align-right",
      name: "Align Right",
      description: "Aligns text to the right margin. Useful for dates, signatories, and disclaimers.",
      shortcut: "Ctrl+Shift+R",
      icon: <AlignRight className="w-3.5 h-3.5" />,
      category: "align",
      action: (text, start, end) => {
        const sel = text.substring(start, end) || "Right-aligned date & signatory";
        const newText = text.substring(0, start) + `<div align="right">\n${sel}\n</div>` + text.substring(end);
        return { newText, newSel: [start + 20, start + 20 + sel.length] };
      },
    },
    // 16. Justify
    {
      id: "align-justify",
      name: "Justify",
      description: "Distributes spacing evenly between words to produce clean flush edges.",
      shortcut: "Ctrl+Shift+J",
      icon: <AlignJustify className="w-3.5 h-3.5" />,
      category: "align",
      action: (text, start, end) => {
        const sel = text.substring(start, end) || "Justified editorial copy.";
        const newText = text.substring(0, start) + `<div align="justify">\n${sel}\n</div>` + text.substring(end);
        return { newText, newSel: [start + 22, start + 22 + sel.length] };
      },
    },

    // 17. Insert Link
    {
      id: "link",
      name: "Hyperlink",
      description: "Inserts a clickable web hyperlink to reference external forms or FWU pages.",
      shortcut: "Ctrl+K",
      icon: <LinkIcon className="w-3.5 h-3.5" />,
      category: "insert",
      action: (text, start, end) => {
        const sel = text.substring(start, end) || "Link Title";
        const url = prompt("Enter destination URL:", "https://") || "https://";
        const newText = text.substring(0, start) + `[${sel}](${url})` + text.substring(end);
        return { newText, newSel: [start + 1, start + 1 + sel.length] };
      },
    },
    // 18. Insert Image
    {
      id: "image",
      name: "Insert Image",
      description: "Embeds an image into content with descriptive alternative text.",
      shortcut: "Ctrl+Shift+I",
      icon: <ImageIcon className="w-3.5 h-3.5" />,
      category: "insert",
      action: (text, start, end) => {
        const url = prompt("Enter Image URL or Data URL:", "https://") || "";
        if (!url) return { newText: text, newSel: [start, end] };
        const alt = prompt("Enter short description / caption:", "Campus Notice Photo") || "Image";
        const insert = `\n![${alt}](${url})\n`;
        const newText = text.substring(0, start) + insert + text.substring(end);
        return { newText, newSel: [start + insert.length, start + insert.length] };
      },
    },
    // 19. Horizontal Divider
    {
      id: "hr",
      name: "Horizontal Rule",
      description: "Inserts a clean thematic divider line to separate distinct content topics.",
      shortcut: "Ctrl+Shift+H",
      icon: <Minus className="w-3.5 h-3.5" />,
      category: "insert",
      action: (text, start, end) => {
        const insert = "\n\n---\n\n";
        const newText = text.substring(0, start) + insert + text.substring(end);
        return { newText, newSel: [start + insert.length, start + insert.length] };
      },
    },

    // 20. Text Color
    {
      id: "text-color",
      name: "Text Color",
      description: "Applies official campus brand color accents (Blue 950, Crimson, Emerald, Amber).",
      shortcut: "Ctrl+Shift+C",
      icon: <Palette className="w-3.5 h-3.5 text-blue-900" />,
      category: "color",
      action: (text, start, end) => {
        const sel = text.substring(start, end) || "colored text";
        const color = prompt("Select color (blue, red, green, amber):", "blue") || "blue";
        const colorMap: Record<string, string> = {
          blue: "#1e3a8a",
          red: "#b91c1c",
          green: "#047857",
          amber: "#d97706",
        };
        const hex = colorMap[color.toLowerCase()] || color;
        const newText = text.substring(0, start) + `<span style="color: ${hex}">${sel}</span>` + text.substring(end);
        return { newText, newSel: [start + 22, start + 22 + sel.length] };
      },
    },
    // 21. Background Highlight
    {
      id: "highlight",
      name: "Highlight Color",
      description: "Applies background highlight color to draw attention to deadlines or alerts.",
      shortcut: "Ctrl+Shift+M",
      icon: <Highlighter className="w-3.5 h-3.5 text-amber-500" />,
      category: "color",
      action: (text, start, end) => {
        const sel = text.substring(start, end) || "highlighted phrase";
        const newText = text.substring(0, start) + `<mark style="background-color: #fef08a; padding: 2px 4px; border-radius: 4px;">${sel}</mark>` + text.substring(end);
        return { newText, newSel: [start + 84, start + 84 + sel.length] };
      },
    },
    // 22. Clear Formatting
    {
      id: "clear-formatting",
      name: "Clear Formatting",
      description: "Strips all markdown tags, styling, and HTML elements back to raw text.",
      shortcut: "Ctrl+\\",
      icon: <RemoveFormatting className="w-3.5 h-3.5" />,
      category: "color",
      action: (text, start, end) => {
        const sel = text.substring(start, end);
        if (!sel) return { newText: text, newSel: [start, end] };
        // Strip tags
        const stripped = sel
          .replace(/<[^>]*>/g, "")
          .replace(/[*_~`#>-]/g, "")
          .trim();
        const newText = text.substring(0, start) + stripped + text.substring(end);
        return { newText, newSel: [start, start + stripped.length] };
      },
    },

    // 23. Undo
    {
      id: "undo",
      name: "Undo",
      description: "Reverts the previous editorial adjustment or text insertion.",
      shortcut: "Ctrl+Z",
      icon: <Undo2 className="w-3.5 h-3.5" />,
      category: "history",
      action: (text) => {
        handleUndo();
        return { newText: text, newSel: [0, 0] };
      },
    },
    // 24. Redo
    {
      id: "redo",
      name: "Redo",
      description: "Reapplies a previously undone modification or styling change.",
      shortcut: "Ctrl+Y",
      icon: <Redo2 className="w-3.5 h-3.5" />,
      category: "history",
      action: (text) => {
        handleRedo();
        return { newText: text, newSel: [0, 0] };
      },
    },
  ];

  const handleToolClick = (tool: ToolbarTool) => {
    if (tool.id === "undo") {
      handleUndo();
      return;
    }
    if (tool.id === "redo") {
      handleRedo();
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const currentText = textarea.value || "";

    const { newText, newSel } = tool.action(currentText, start, end);
    pushHistory(newText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newSel[0], newSel[1]);
      }
    }, 10);
  };

  // Keyboard shortcut listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    if (!isCtrlOrCmd) return;

    const key = e.key.toLowerCase();

    // Map shortcuts
    if (key === "b") {
      e.preventDefault();
      const t = tools.find((x) => x.id === "bold");
      if (t) handleToolClick(t);
    } else if (key === "i" && !e.shiftKey) {
      e.preventDefault();
      const t = tools.find((x) => x.id === "italic");
      if (t) handleToolClick(t);
    } else if (key === "u") {
      e.preventDefault();
      const t = tools.find((x) => x.id === "underline");
      if (t) handleToolClick(t);
    } else if (key === "k") {
      e.preventDefault();
      const t = tools.find((x) => x.id === "link");
      if (t) handleToolClick(t);
    } else if (key === "e" && !e.shiftKey) {
      e.preventDefault();
      const t = tools.find((x) => x.id === "code");
      if (t) handleToolClick(t);
    } else if (key === "z" && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    } else if (key === "y" || (key === "z" && e.shiftKey)) {
      e.preventDefault();
      handleRedo();
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {label}
          </label>
        )}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
              activeTab === "edit"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
              activeTab === "preview"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-blue-900 focus-within:border-transparent transition-all">
        {/* Full 24-Item Toolbar */}
        <div className="bg-slate-50/90 border-b border-slate-200 p-1.5 flex flex-wrap items-center gap-1">
          {/* Format Group */}
          <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-200">
            {tools.slice(0, 4).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleToolClick(t)}
                onMouseEnter={() => setHoveredTool(t)}
                onMouseLeave={() => setHoveredTool(null)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-200/80 transition cursor-pointer active:scale-95"
                title={`${t.name} (${t.shortcut})`}
              >
                {t.icon}
              </button>
            ))}
          </div>

          {/* Headings Group */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
            {tools.slice(4, 8).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleToolClick(t)}
                onMouseEnter={() => setHoveredTool(t)}
                onMouseLeave={() => setHoveredTool(null)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-200/80 transition cursor-pointer active:scale-95"
                title={`${t.name} (${t.shortcut})`}
              >
                {t.icon}
              </button>
            ))}
          </div>

          {/* Lists Group */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
            {tools.slice(8, 12).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleToolClick(t)}
                onMouseEnter={() => setHoveredTool(t)}
                onMouseLeave={() => setHoveredTool(null)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-200/80 transition cursor-pointer active:scale-95"
                title={`${t.name} (${t.shortcut})`}
              >
                {t.icon}
              </button>
            ))}
          </div>

          {/* Alignments Group */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
            {tools.slice(12, 16).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleToolClick(t)}
                onMouseEnter={() => setHoveredTool(t)}
                onMouseLeave={() => setHoveredTool(null)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-200/80 transition cursor-pointer active:scale-95"
                title={`${t.name} (${t.shortcut})`}
              >
                {t.icon}
              </button>
            ))}
          </div>

          {/* Inserts Group */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
            {tools.slice(16, 19).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleToolClick(t)}
                onMouseEnter={() => setHoveredTool(t)}
                onMouseLeave={() => setHoveredTool(null)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-200/80 transition cursor-pointer active:scale-95"
                title={`${t.name} (${t.shortcut})`}
              >
                {t.icon}
              </button>
            ))}
          </div>

          {/* Color & Clear Formatting */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
            {tools.slice(19, 22).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleToolClick(t)}
                onMouseEnter={() => setHoveredTool(t)}
                onMouseLeave={() => setHoveredTool(null)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-200/80 transition cursor-pointer active:scale-95"
                title={`${t.name} (${t.shortcut})`}
              >
                {t.icon}
              </button>
            ))}
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 pl-1.5 ml-auto">
            {tools.slice(22, 24).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleToolClick(t)}
                onMouseEnter={() => setHoveredTool(t)}
                onMouseLeave={() => setHoveredTool(null)}
                disabled={t.id === "undo" ? historyIndex <= 0 : historyIndex >= history.length - 1}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-200/80 transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                title={`${t.name} (${t.shortcut})`}
              >
                {t.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Microcopy & Shortcut Status Bar */}
        <div className="bg-slate-100/60 px-3 py-1.5 border-b border-slate-200/80 text-[11px] flex items-center justify-between min-h-[28px]">
          {hoveredTool ? (
            <div className="flex items-center gap-2 text-slate-700 animate-fadeIn">
              <span className="font-bold text-slate-900">{hoveredTool.name}:</span>
              <span className="text-slate-600">{hoveredTool.description}</span>
              <span className="px-1.5 py-0.2 bg-white rounded border border-slate-300 font-mono text-[10px] text-blue-900 font-bold ml-1">
                {hoveredTool.shortcut}
              </span>
            </div>
          ) : (
            <span className="text-slate-400 italic">
              Hover over any of the 24 tools to view its function description and keyboard shortcut.
            </span>
          )}
          <span className="text-slate-400 text-[10px] font-mono">
            {value ? value.length : 0} chars
          </span>
        </div>

        {/* Editor vs Live Preview */}
        {activeTab === "edit" ? (
          <textarea
            ref={textareaRef}
            rows={rows}
            value={value}
            onChange={(e) => pushHistory(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full p-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans focus:outline-none resize-y min-h-[140px]"
          />
        ) : (
          <div className="p-4 prose prose-sm max-w-none text-xs sm:text-sm text-slate-800 min-h-[140px] max-h-[400px] overflow-y-auto leading-relaxed bg-slate-50/30 whitespace-pre-line">
            {value ? (
              <div dangerouslySetInnerHTML={{ __html: value.replace(/\n/g, "<br/>") }} />
            ) : (
              <span className="text-slate-400 italic">No content to preview yet.</span>
            )}
          </div>
        )}
      </div>

      {helpText && <p className="text-[11px] text-slate-500">{helpText}</p>}
    </div>
  );
}
