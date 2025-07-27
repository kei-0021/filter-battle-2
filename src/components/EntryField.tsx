import React, { ChangeEvent, KeyboardEvent } from "react";

type EntryFieldProps = {
  keyword: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onNextTheme: () => void;
  error: string;
  submitted: boolean;
  allSubmitted: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  inputHeight: number;
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
};

export const EntryField: React.FC<EntryFieldProps> = ({
  keyword,
  onChange,
  onKeyDown,
  onSubmit,
  onNextTheme,
  error,
  submitted,
  allSubmitted,
  inputRef,
  inputHeight,
  onCompositionStart,
  onCompositionEnd,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: "200px",
        height: inputHeight,
        background: "#1e1e1e",
        padding: "1rem 2rem",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.7)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        maxWidth: "700px",
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
        gap: "0.3rem",
        userSelect: "none",
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input
          ref={inputRef}
          type="text"
          value={keyword}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          placeholder="回答を記入"
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            fontSize: "1.1rem",
            borderRadius: "6px",
            border: "none",
            outline: "none",
            backgroundColor: "#333",
            color: "#fff",
          }}
          disabled={submitted}
        />
        <div
          style={{
            color: "#aaa",
            fontSize: "0.9rem",
            marginTop: "0.2rem",
            textAlign: "right",
          }}
        >
          {keyword.length} / 200
        </div>
        {!submitted && (
          <button
            onClick={onSubmit}
            disabled={!keyword.trim() || !!error || submitted}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1.1rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor:
                !keyword.trim() || !!error || submitted ? "#888" : "#6bffb0",
              color: "#000",
              cursor:
                !keyword.trim() || !!error || submitted
                  ? "not-allowed"
                  : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            提出
          </button>
        )}
        {submitted && (
          <button
            onClick={onNextTheme}
            disabled={!allSubmitted}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: allSubmitted ? "#007bff" : "#555",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              cursor: allSubmitted ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
            }}
          >
            次のテーマへ
          </button>
        )}
      </div>
    </div>
  );
};
