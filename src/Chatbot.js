import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "highlight.js/styles/github.css";

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
          messages: newMessages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })),
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

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Custom Code Block Renderer with Copy Button
  const CodeBlock = ({ children, className }) => {
    const language = className ? className.replace("language-", "") : "plaintext";
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(children).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    };

    return (
      <div style={{ position: "relative", borderRadius: "8px", overflow: "hidden" }}>
        <button
          onClick={handleCopy}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: copied ? "#4caf50" : "#007bff",
            color: "white",
            border: "none",
            padding: "4px 8px",
            fontSize: "12px",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "background 0.3s ease",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <SyntaxHighlighter language={language} style={oneDark}>
          {children}
        </SyntaxHighlighter>
      </div>
    );
  };

  return (
    <div style={{
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
      background: "linear-gradient(135deg, #eef2f3, #d9e8fc)",
      fontFamily: "Arial, sans-serif",
      height: "100vh",
      outline: "1px solid #ccc",
      boxSizing: "border-box"
    }}>
      <h1 style={{
        fontSize: "24px",
        marginBottom: "20px",
        color: "#333",
        textAlign: "center"
      }}>
        Om's Chatbot
      </h1>
      <p style={{ textAlign: "center", color: "#888", fontSize: "14px", marginBottom: "10px" }}>
  Disclaimer: Om's chatbot uses OpenRouter & DeepSeek R1 but doesn't guarantee accuracy.
</p>
      <div ref={chatContainerRef} style={{
        height: "400px",
        overflowY: "auto",
        padding: "15px",
        background: "linear-gradient(135deg, #f9f9f9, #e6ecf0)",
        borderRadius: "10px",
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        flexGrow: 1,
        boxShadow: "inset 0 2px 6px rgba(0, 0, 0, 0.1)"
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "12px",
            background: msg.sender === "user" 
              ? "linear-gradient(135deg,rgb(105, 79, 254),rgb(69, 200, 252))" 
              : "linear-gradient(135deg, #e0e0e0, #f1f1f1)",
            color: msg.sender === "user" ? "white" : "black",
            alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
            maxWidth: "80%",
            wordWrap: "break-word",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
          }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
              {msg.text}
            </ReactMarkdown>
          </div>
        ))}
        {loading && <p style={{ color: "#888", fontSize: "14px" }}>Thinking...</p>}
      </div>
      
      <div style={{
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #e6ecf0, #d4d9df)",
        padding: "12px",
        borderRadius: "8px",
        height: "40px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a message..."
          rows={3}
          style={{
            flex: "1",
            padding: "12px",
            marginRight: "10px",
            borderRadius: "12px",
            border: "1px solid #ccc",
            fontSize: "16px",
            outline: "none",
            height:"20px",
            transition: "border-color 0.3s ease",
            backgroundColor: "#fff",
            resize: "none",
            boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)"
          }}
          onFocus={(e) => (e.target.style.borderColor = "#4facfe")}
          onBlur={(e) => (e.target.style.borderColor = "#ccc")}
        />
        
        <button 
          onClick={sendMessage} 
          disabled={loading} 
          style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg,rgb(2, 59, 109),rgb(65, 92, 124))",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "16px",
            transition: "0.3s",
            outline: "none",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)"
          }} 
          onMouseEnter={(e) => (e.target.style.background = "linear-gradient(135deg, rgb(2, 59, 109),rgb(65, 92, 124))")}
          onMouseLeave={(e) => (e.target.style.background = "linear-gradient(135deg,rgb(38, 136, 223), #00f2fe)")}
        >
          Send
        </button>
      </div>
    </div>
    
  );
};

export default Chatbot;
