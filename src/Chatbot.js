import { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setInput("");  
    setLoading(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer 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`,
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            ...newMessages.map(msg => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
          ],
        }),
      });

      const data = await response.json();
      const botReply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";

      setMessages([...newMessages, { text: botReply, sender: "bot" }]);
    } catch (error) {
      setMessages([...newMessages, { text: "Error: Unable to fetch response.", sender: "bot" }]);
    }

    setLoading(false);
  };

  // Scroll to the bottom of the chat container when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div style={{
      maxWidth: "500px", margin: "0 auto", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
      background: "#ffffff", fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Om's Chatbot</h1>
      <div ref={chatContainerRef} style={{
  height: "400px", overflowY: "auto", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "10px", marginBottom: "20px",
  display: "flex", flexDirection: "column", justifyContent: "flex-start", flexGrow: 1
}}>
  {messages.map((msg, index) => (
    <div
      key={index}
      style={{
        padding: "12px", marginBottom: "12px", borderRadius: "12px", backgroundColor: msg.sender === "user" ? "#007bff" : "#e0e0e0",
        color: msg.sender === "user" ? "white" : "black", alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
        maxWidth: "80%", wordWrap: "break-word"
      }}
    >
      <ReactMarkdown>{msg.text}</ReactMarkdown>
    </div>
  ))}
  {loading && <p style={{ color: "#888", fontSize: "14px" }}>Thinking...</p>}
</div>


      <div style={{
        display: "flex", alignItems: "center", backgroundColor: "#f1f1f1", padding: "12px", borderRadius: "8px"
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          rows={3}
          style={{
            flex: "1", padding: "12px", marginRight: "10px", borderRadius: "12px", border: "1px solid #ccc", fontSize: "16px",
            outline: "none", transition: "border-color 0.3s ease", backgroundColor: "#fff", resize: "none"
          }}
          onFocus={(e) => e.target.style.borderColor = "#007bff"}
          onBlur={(e) => e.target.style.borderColor = "#ccc"}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            padding: "12px 24px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "12px", cursor: "pointer",
            fontSize: "16px", transition: "background-color 0.3s", outline: "none"
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#0056b3"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#007bff"}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
