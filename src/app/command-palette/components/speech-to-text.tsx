"use client";

import React, { useState, useRef, useEffect } from "react";

// Add a new prop type for AudioRecorder
interface AudioRecorderProps {
    isRecording: boolean; // Parent will toggle this
    onTranscription?: (text: string) => void; // Fire once transcription is done
}

function AudioRecorder({ isRecording, onTranscription }: AudioRecorderProps) {
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [transcription, setTranscription] = useState("");
    const chunksRef = useRef<Blob[]>([]); // Holds recorded audio chunks

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
        } catch (error) {
            console.error("Error starting recording:", error);
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setMediaRecorder(null);
        }
    };

    // Handle isRecording changes
    useEffect(() => {
        // Recording just started
        if (isRecording) {
            void startRecording();
        } else {
            // Recording just ended
            stopRecording();
        }
    }, [isRecording]);

    // Whenever audioBlob changes (i.e. after stopping), auto-transcribe
    useEffect(() => {
        if (audioBlob) {
            void sendRecordingForTranscription();
        }
    }, [audioBlob]);

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

            // <-- Call the parent's callback if provided
            if (onTranscription) {
                onTranscription(data.text);
            }
        } catch (error) {
            console.error("Error sending transcription request:", error);
            alert("There was an error transcribing your audio. Check console.");
        }
    };

    return null; 
    // We no longer render UI here; the parent handles all UI (the single record button).
}

export default AudioRecorder;
