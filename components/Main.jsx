import { useState, useEffect, useCallback, useRef } from "react";

export default function Main() {
    const [meme, setMeme] = useState({
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQApDrXtDgJix0lUafFfyfebFmA9DrbLmQ-1w&ss",
        texts: [
            { id: 1, content: "You have\n passed", x: 13, y: 10, dragging: false },
            { id: 2, content: "It's the\n Covid Test", x: 10, y: 60, dragging: false }
        ]
    });

    const [allMemes, setAllMemes] = useState([]);
    const canvasRef = useRef(null); // Reference to the canvas element

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

    const handleKeyDown = useCallback((event) => {
        const step = 2;
        setMeme(prevMeme => ({
            ...prevMeme,
            texts: prevMeme.texts.map(text =>
                text.dragging
                    ? {
                        ...text,
                        x: event.key === "ArrowLeft" ? text.x - step :
                            event.key === "ArrowRight" ? text.x + step : text.x,
                        y: event.key === "ArrowUp" ? text.y - step :
                            event.key === "ArrowDown" ? text.y + step : text.y
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

    function addText() {
        const newText = {
            id: meme.texts.length + 1,
            content: "",
            x: 20,
            y: 0,
            dragging: false
        };
        setMeme(prevMeme => ({
            ...prevMeme,
            texts: [...prevMeme.texts, newText]
        }));
    }

    function startDragging(id) {
        setMeme(prevMeme => ({
            ...prevMeme,
            texts: prevMeme.texts.map(text =>
                text.id === id ? { ...text, dragging: true } : { ...text, dragging: false }
            )
        }));
    }

    function downloadMeme() {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        
        const img = new Image();
        img.crossOrigin = "anonymous"; 
        img.src = meme.imageUrl;

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            meme.texts.forEach(text => {
                ctx.font = "30px Impact";
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.textAlign = "left";
                ctx.textBaseline = "top";

            
                const x = (text.x / 100) * canvas.width;
                const y = (text.y / 100) * canvas.height;

                ctx.strokeText(text.content, x, y);
                ctx.fillText(text.content, x, y);
            });

            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = "meme.png";
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
                <button onClick={downloadMeme}>Download Meme</button> 
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
                            cursor: "pointer",
                            whiteSpace: "pre-line", 
                        }}
                        onClick={() => startDragging(text.id)}>
                        {text.content}
                    </span>
                ))}
            </div>
            {/* Hidden canvas for generating the downloadable image */}
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </main>
    );
}