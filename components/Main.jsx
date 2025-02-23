import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function Main() {
    const [meme, setMeme] = useState({
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQApDrXtDgJix0lUafFfyfebFmA9DrbLmQ-1w&s",
        texts: [
            { id: 1, content: "You have\n passed", x: 50, y: 15, dragging: false },
            { id: 2, content: "It's the\n Covid Test", x: 50, y: 80, dragging: false }
        ]
    });

    const [allMemes, setAllMemes] = useState([]);
    const canvasRef = useRef(null);
    const { isSignedIn } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        fetch("https://api.imgflip.com/get_memes")
            .then(res => res.json())
            .then(data => setAllMemes(data.data.memes));
    }, []);


    function getMemeImage() {
        const randomNumber = Math.floor(Math.random() * allMemes.length);
        const newMemeUrl = allMemes[randomNumber].url;
        setMeme(prevMeme => ({
            ...prevMeme,
            imageUrl: newMemeUrl
        }));
    }

    function handleChange(event, id) {
        const { value } = event.currentTarget;
        setMeme(prevMeme => ({
            ...prevMeme,
            texts: prevMeme.texts.map(text =>
                text.id === id ? { ...text, content: value } : text
            )
        }));
    }

    function addText() {
        const newText = {
            id: meme.texts.length + 1,
            content: "",
            x: 50, 
            y: 50, 
            dragging: false
        };
        setMeme(prevMeme => ({
            ...prevMeme,
            texts: [...prevMeme.texts, newText]
        }));
    }

    const handleKeyDown = useCallback((event) => {
        const step = 2; 
        setMeme(prevMeme => ({
            ...prevMeme,
            texts: prevMeme.texts.map(text =>
                text.dragging
                    ? {
                        ...text,
                        x: event.key === "ArrowLeft" ? Math.max(0, text.x - step) : 
                            event.key === "ArrowRight" ? Math.min(100, text.x + step) : 
                            text.x,
                        y: event.key === "ArrowUp" ? Math.max(0, text.y - step) : 
                            event.key === "ArrowDown" ? Math.min(100, text.y + step) : 
                            text.y
                    }
                    : text
            )
        }));
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    function startDragging(id) {
        setMeme(prevMeme => ({
            ...prevMeme,
            texts: prevMeme.texts.map(text =>
                text.id === id ? { ...text, dragging: true } : { ...text, dragging: false }
            )
        }));
    }

    function downloadMeme(format) {
        if (!isSignedIn) {
            navigate("/login");
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = meme.imageUrl;

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);


            const fontSize = Math.floor(canvas.width / 8); 
            ctx.font = `${fontSize}px Impact`;
            ctx.textAlign = "center";
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = Math.floor(canvas.width / 100); 
            meme.texts.forEach(text => {
                const x = (text.x / 100) * canvas.width;
                const y = (text.y / 100) * canvas.height;

                const lines = text.content.split("\n");

                lines.forEach((line, index) => {
                    const lineHeight = fontSize * 1.2; 
                    const offsetY = y + index * lineHeight; 
                    ctx.strokeText(line, x, offsetY);
                    ctx.fillText(line, x, offsetY);
                });
            });

            let dataUrl;
            if (format === "png") {
                dataUrl = canvas.toDataURL("image/png");
            } else if (format === "jpg") {
                dataUrl = canvas.toDataURL("image/jpeg");
            } else if (format === "webp") {
                dataUrl = canvas.toDataURL("image/webp");
            }

            // Trigger the download
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `meme.${format}`;
            link.click();
        };
    }

    return (
        <main>
            <div className="form">
                {meme.texts.map((text, index) => (
                    <label key={text.id}>
                        Text {index + 1}
                        <textarea
                            placeholder={`Text ${index + 1}`}
                            value={text.content}
                            onChange={(e) => handleChange(e, text.id)}
                            rows={4}
                            cols={30}
                        />
                    </label>
                ))}
                <button onClick={addText}>Add Text</button>
                <button onClick={getMemeImage}>Get a new meme image 🖼</button>

                <select id="format">
                    <option value="png">PNG</option>
                    <option value="jpg">JPG</option>
                    <option value="webp">WebP</option>
                </select>
                <button onClick={() => downloadMeme(document.getElementById("format").value)}>Download Meme</button>
            </div>

            <div className="meme">
                <img src={meme.imageUrl} alt="Meme" />
                {meme.texts.map((text) => (
                    <span
                        key={text.id}
                        style={{
                            position: "absolute",
                            top: `${text.y}%`,
                            left: `${text.x}%`,
                            transform: "translate(-50%, -50%)", 
                            cursor: "pointer",
                            whiteSpace: "pre-line",
                            fontFamily: "Impact",
                            fontSize: "clamp(24px, 5vw, 48px)", 
                            color: "white",
                            textShadow: "2px 2px 0 black, -2px -2px 0 black, 2px -2px 0 black, -2px 2px 0 black",
                            textAlign: "center",
                            lineHeight: "1.2",
                        }}
                        onClick={() => startDragging(text.id)}
                    >
                        {text.content}
                    </span>
                ))}
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />
        </main>
    );
}