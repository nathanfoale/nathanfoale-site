import React, { useState, useEffect } from "react";

export default function Builder() {
  const [prompt, setPrompt] = useState(
    "Create a portfolio for Nathan Foale who's a prompt developer and make it cyberpunk themed"
  );
  const [generatedHTML, setGeneratedHTML] = useState("");

  const generatePortfolio = async () => {
    try {
      const res = await fetch("http://localhost:4000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customPrompt: prompt }),
      });
      const data = await res.json();
      setGeneratedHTML(data.html);
      localStorage.setItem("generatedHTML", data.html);
    } catch (error) {
      alert("⚠️ Error generating portfolio.");
      console.error(error);
    }
  };

  const openFullscreen = () => {
    if (!generatedHTML) return alert("Please generate your portfolio first.");
    const newWindow = window.open("", "_blank");
    newWindow.document.write(generatedHTML);
    newWindow.document.close();
  };

  const downloadHTML = () => {
    const blob = new Blob([generatedHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio.html";
    a.click();
  };

  const copyHTML = () => {
    navigator.clipboard.writeText(generatedHTML).then(() =>
      alert("Copied HTML to clipboard!")
    );
  };

  useEffect(() => {
    const saved = localStorage.getItem("generatedHTML");
    if (saved) setGeneratedHTML(saved);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white font-mono">
      <header className="text-center py-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-neonGreen drop-shadow-lg tracking-wide">
          🧠 <span className="text-neonPink">Personal Portfolio Builder</span>
        </h1>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-xl shadow-xl mb-10">
          <h2 className="text-xl font-bold text-neonPink mb-2 flex items-center gap-2">
            💬 Describe Your Portfolio
          </h2>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Create a sleek AI developer portfolio with animated background and cyberpunk color scheme"
            rows={3}
            className="w-full bg-black text-neonGreen border border-neonGreen/40 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-neonPink resize-none"
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={generatePortfolio}
              className="bg-neonGreen hover:bg-green-400 text-black px-4 py-2 rounded font-bold"
            >
              ⚡ Generate
            </button>
            <button
              onClick={openFullscreen}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-semibold"
            >
              🔍 Fullscreen
            </button>
            <button
              onClick={copyHTML}
              className="bg-zinc-200 hover:bg-zinc-300 text-black px-4 py-2 rounded font-semibold"
            >
              📋 Copy
            </button>
            <button
              onClick={downloadHTML}
              className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded font-semibold"
            >
              💾 Download
            </button>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-bold text-neonPink mb-3">⚡ Live Preview</h2>
          <iframe
            title="preview"
            className="w-full h-[600px] rounded-lg bg-black border border-neonGreen"
            srcDoc={generatedHTML}
          />
        </div>
      </main>

      <style jsx="true">{`
        .text-neonPink {
          color: #ff00cc;
        }
        .text-neonGreen {
          color: #00ff99;
        }
      `}</style>
    </div>
  );
}