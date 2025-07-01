import React, { useState } from "react";

const apiKey = import.meta.env.VITE_CHAT_API_KEY as string;

const BookCoverGenerator: React.FC = () => {
  const [input, setInput] = useState("");
  const [refinedText, setRefinedText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRefinedText("");
    setImageUrl("");
    setShowPopup(false);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, apiKey }),
      });
      if (!response.ok) throw new Error("AI 생성 실패");
      const data = await response.json();
      console.log("AI 북커버 imageUrl:", data.imageUrl);
      setRefinedText(data.refinedText);
      setImageUrl(data.imageUrl);
      setShowPopup(true);
    } catch (err) {
      alert("AI 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-cover-generator" style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2>AI 책 표지 생성기</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="책 내용을 입력하세요"
          rows={4}
          style={{ width: "100%", marginBottom: 12 }}
          required
        />
        <button type="submit" disabled={loading || !input}>
          {loading ? "생성 중..." : "AI로 표지 생성"}
        </button>
      </form>
      {refinedText && (
        <div style={{ marginTop: 24 }}>
          <h4>AI가 다듬은 책 소개</h4>
          <div style={{ background: "#f6f6f6", padding: 12, borderRadius: 6 }}>{refinedText}</div>
        </div>
      )}
      <div style={{ marginTop: 24 }}>
        <h4>AI가 생성한 책 표지</h4>
        {imageUrl ? (
          <img src={imageUrl} alt="AI Generated Book Cover" style={{ maxWidth: "100%", borderRadius: 8 }} />
        ) : (
          <img src="/placeholder.svg" alt="기본 표지" style={{ maxWidth: "100%", borderRadius: 8, opacity: 0.5 }} />
        )}
      </div>
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 40,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#222",
            color: "#fff",
            padding: "16px 32px",
            borderRadius: 8,
            zIndex: 1000,
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
            fontSize: 18,
            fontWeight: 500,
          }}
          onClick={() => setShowPopup(false)}
        >
          AI가 문체와 표현을 세련되게 다듬었습니다
        </div>
      )}
    </div>
  );
};

export default BookCoverGenerator;
