"use client";

import React, {useEffect, useState} from 'react'

import Head from "next/head";
import CakeComponent from "@/app/cake/CakeComponent";
import {AgeInput} from "@/app/age/AgeInput";

export type CandlePositions = {
    x: number,
    y: number
}
//TODO: set the candles in the right space
export default function Home() {
    const [age, setAge] = useState(0);
    const [candlePosition, setCandlePosition] = useState<CandlePositions[]>([{
        x: 0,
        y: 0
    }]);
    const [isSoundDetected, setIsSoundDetected] = React.useState(false);

//setting the dimensions for the candles on the cake

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

    //listening to the audio
    useEffect(() => {
        startListening();
    }, []);

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);

            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            function detectBlow() {
                analyser.getByteFrequencyData(dataArray);
                const volume =
                    dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

                if (volume > 30 && !isSoundDetected) {
                    // Trigger candle blowing out
                    setIsSoundDetected(true);
                }
            }

            // Check for blowing sound at intervals
            setInterval(detectBlow, 100);
        } catch (err) {
            console.error("Error accessing microphone:", err);
        }
    };


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


        </>
    );
}


//Review project drafts
// import {FaStar, FaStarHalfAlt} from "react-icons/fa";
// import {CiStar} from "react-icons/ci";

{/*<FaStar/>*/
}
{/*<FaStarHalfAlt/>*/
}
{/*<CiStar/>*/
}

