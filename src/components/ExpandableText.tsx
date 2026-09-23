import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandableTextProps {
  text?: string;
  children?: React.ReactNode;
  maxLines?: number;
  className?: string;
  buttonClassName?: string;
  readMoreText?: string;
  readLessText?: string;
}

/**
 * ExpandableText: Automatically truncates text blocks exceeding maxLines (default: 11 lines)
 * and renders a clean "Read More" / "Show Less" expansion toggle button.
 */
export default function ExpandableText({
  text,
  children,
  maxLines = 11,
  className = "",
  buttonClassName = "",
  readMoreText = "Read More",
  readLessText = "Show Less",
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  const content = text || children;

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    // Check if element's content exceeds maxLines
    const checkOverflow = () => {
      // Calculate based on line-height or scrollHeight vs clientHeight
      const computedStyle = window.getComputedStyle(el);
      let lineHeight = parseFloat(computedStyle.lineHeight);
      if (isNaN(lineHeight)) {
        // Fallback approximation from font-size (typically 1.5 ratio)
        const fontSize = parseFloat(computedStyle.fontSize) || 14;
        lineHeight = fontSize * 1.5;
      }
      const maxHeight = lineHeight * maxLines;

      // Also count line breaks in text
      const rawText = typeof content === "string" ? content : el.innerText || "";
      const newlineCount = (rawText.match(/\n/g) || []).length;

      if (el.scrollHeight > maxHeight + 4 || newlineCount >= maxLines) {
        setIsOverflowing(true);
      } else {
        setIsOverflowing(false);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [content, maxLines]);

  return (
    <div className="relative">
      <div
        ref={textRef}
        style={
          !isExpanded && isOverflowing
            ? {
                display: "-webkit-box",
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : undefined
        }
        className={`${className} ${
          !isExpanded && isOverflowing ? "relative" : ""
        }`}
      >
        {text ? <span className="whitespace-pre-line leading-relaxed">{text}</span> : children}
      </div>

      {isOverflowing && (
        <div className="mt-2 pt-1 flex items-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className={`inline-flex items-center gap-1.5 text-xs font-bold text-red-700 hover:text-red-900 transition-colors cursor-pointer group py-1 ${buttonClassName}`}
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? readLessText : readMoreText}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
