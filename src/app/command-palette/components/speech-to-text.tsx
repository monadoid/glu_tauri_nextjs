"use client";

import React, { useState, useRef } from "react";

function AudioRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [transcription, setTranscription] = useState("");
    const chunksRef = useRef([]); // Holds recorded audio chunks

    const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROK_API_KEY;

    // Start recording
    const startRecording = async () => {
        try {
            // Ask for microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);

            // Clear any old chunks
            chunksRef.current = [];

            // Push incoming data to our chunks array
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            // When the recording stops, create a blob from the chunks
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                setAudioBlob(blob);
            };

            // Start recording
            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setTranscription(""); // Reset any old transcription
        } catch (error) {
            console.error("Error starting recording:", error);
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
            setMediaRecorder(null);
        }
    };

    // Send the recorded blob to Groq for transcription
    const sendRecordingForTranscription = async () => {
        if (!audioBlob) {
            alert("No recording found. Please record something first!");
            return;
        }

        try {
            // Build form data
            const formData = new FormData();
            // 'file' is required param name by the Groq (OpenAI-compatible) endpoint
            formData.append("file", audioBlob, "recording.webm");

            // Required: model name to use for transcription
            formData.append("model", "whisper-large-v3-turbo");

            // Optional parameters
            // formData.append("prompt", "Some context for specialized words");
            // formData.append("response_format", "json"); // default is json
            // formData.append("language", "en");
            // formData.append("temperature", 0);

            const response = await fetch(
                "https://api.groq.com/openai/v1/audio/transcriptions",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${GROQ_API_KEY}`, // Provide your Groq API key
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error(`Transcription request failed: ${response.status}`);
            }

            // Groq returns JSON with { text: "Transcribed text here" } by default
            const data = await response.json();
            setTranscription(data.text);
        } catch (error) {
            console.error("Error sending transcription request:", error);
            alert("There was an error transcribing your audio. Check console.");
        }
    };

    return (
        <div className="w-full bg-white">
            <h1>Audio Recorder</h1>

            <div style={{ marginBottom: "1rem" }}>
                {!isRecording && (
                    <button onClick={startRecording}>Start Recording</button>
                )}
                {isRecording && <button onClick={stopRecording}>Stop Recording</button>}
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <button onClick={sendRecordingForTranscription} disabled={!audioBlob}>
                    Send to Groq
                </button>
            </div>

            {transcription && (
                <div>
                    <h3>Transcription:</h3>
                    <p>{transcription}</p>
                </div>
            )}
        </div>
    );
}

export default AudioRecorder;
