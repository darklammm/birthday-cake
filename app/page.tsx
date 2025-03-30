"use client";

import React, {useEffect, useRef, useState} from 'react'

import Head from "next/head";
import CakeComponent from "@/app/cake/CakeComponent";
import {AgeInput} from "@/app/age/AgeInput";

export type CandlePositions = {
    x: number,
    y: number
} | null;

export default function Home() {
    const [age, setAge] = useState(0);
    const [candlePosition, setCandlePosition] = useState<CandlePositions[]>([]);
    const [isSoundDetected, setIsSoundDetected] = React.useState(false);
    // Use a ref to store the detection threshold so that it can be updated during calibration
    // and used in our detection function without having to re-run the effect.
    const thresholdRef = useRef(60);

    useEffect(() => {
        let detectionInterval: string | number | NodeJS.Timeout | undefined;

        const startListening = async () => {
            try {
                // Request microphone access with built-in noise suppression and echo cancellation.
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        noiseSuppression: true,
                        echoCancellation: true,
                    },
                });

                // Set up the Web Audio API
                const audioContext = new AudioContext();
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 2048;
                // Smoothing smooths out rapid fluctuations in the data.
                analyser.smoothingTimeConstant = 0.8;

                // Create a MediaStreamAudioSourceNode from the stream.
                const source = audioContext.createMediaStreamSource(stream);

                // Optional: Use a bandpass filter to focus on the frequency range where blowing might be most prominent.
                const filter = audioContext.createBiquadFilter();
                filter.type = "bandpass";
                filter.frequency.value = 2500; // center frequency (adjust as needed)
                filter.Q.value = 1; // determines the width of the band
                // Connect the source → filter → analyser.
                source.connect(filter);
                filter.connect(analyser);

                // Create a data array to hold frequency data.
                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                // Calibration: Measure ambient noise for a few seconds and set the detection threshold
                const calibrateAmbientNoise = () => {
                    const samples: number[] = [];
                    const calibrationDuration = 3000; // in milliseconds
                    const sampleInterval = 100; // sample every 100ms

                    const calibrationInterval = setInterval(() => {
                        analyser.getByteFrequencyData(dataArray);
                        // Calculate average volume from the frequency data
                        const volume =
                            dataArray.reduce((sum, value) => sum + value, 0) /
                            dataArray.length;
                        samples.push(volume);
                    }, sampleInterval);

                    setTimeout(() => {
                        clearInterval(calibrationInterval);
                        const ambientAverage =
                            samples.reduce((sum, value) => sum + value, 0) /
                            samples.length;
                        // Set the threshold to be the ambient average plus a delta (tweak the delta as needed)
                        const newThreshold = ambientAverage + 30;
                        thresholdRef.current = newThreshold;
                        console.log(
                            "Calibration complete. Ambient average:",
                            ambientAverage,
                            "Threshold set to:",
                            newThreshold
                        );
                    }, calibrationDuration);
                };

                // Run the calibration.
                calibrateAmbientNoise();

                // Debounce logic: Prevent multiple triggers by ensuring at least 1 second between detections.
                let lastDetectionTime = 0;

                function detectBlow() {
                    analyser.getByteFrequencyData(dataArray);
                    // Calculate the average volume across all frequency bins.
                    const volume =
                        dataArray.reduce((sum, value) => sum + value, 0) /
                        dataArray.length;
                    const now = Date.now();

                    // If the current volume exceeds the (calibrated) threshold and
                    // sufficient time has passed since the last detection, consider it a blow.
                    if (volume > thresholdRef.current && now - lastDetectionTime > 1000) {
                        setIsSoundDetected(true);
                        lastDetectionTime = now;
                        console.log("Blow detected at volume:", volume);
                        
                        // Reset the detection after a short delay
                        setTimeout(() => {
                            setIsSoundDetected(false);
                        }, 500); // Adjust timing as needed
                    }
                }

                // Check for a blow every 100ms.
                detectionInterval = setInterval(detectBlow, 100);
            } catch (err) {
                console.error("Error accessing microphone:", err);
            }
        };

        startListening();

        // Clean up the interval when the component unmounts.
        return () => {
            if (detectionInterval) clearInterval(detectionInterval);
        };
    }, []);

    useEffect(() => {
        console.log("isSoundDetected", isSoundDetected);
    }, [isSoundDetected]);

    useEffect(() => {
        const newCandleEntries = Array.from(
            {length: age - candlePosition.length},
            () => ({
                x: Math.random() * 230 + 10,
                y: Math.random() * 20,
            })
        );

        setCandlePosition((existingCandles) => [...existingCandles, ...newCandleEntries]);
    }, [age, candlePosition.length]);


    return (
        <>
            <Head>
                <title>Interactive Birthday Card</title>
                <meta name="description" content="Blow out candles on a virtual birthday card!"/>
            </Head>

            <main className="main">
                <AgeInput age={age} setAge={setAge} isSoundDetected={isSoundDetected}/>
                <CakeComponent isSoundDetected={isSoundDetected} elementPositions={candlePosition}/>
            </main>

            <footer className="text-center mt-4 p-2 ">
                Created by
                <a
                    href="https://github.com/darklammm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-brown-600 hover:text-brown-800"
                >
                    {" "} Anastasia Gridchina
                </a>
            </footer>
        </>
    );
}

