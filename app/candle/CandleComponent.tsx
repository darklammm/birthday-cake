import styles from './Candle.module.css';
import {motion} from "framer-motion";

import React from "react";
import {CandlePositions} from "@/app/page";

type CandleComponentProps = {
    elementPositions: CandlePositions[],
    isSoundDetected: boolean;
}

export const CandleComponent: React.FC<CandleComponentProps> = ({elementPositions, isSoundDetected}) => {

    const candleVariants = {
        hidden: {
            y: "-100vh",
            opacity: 0,
        },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 50,
                damping: 10,
                duration: 1.5,
            },
        },
    };
    return (
        <>
            {elementPositions.map((position, i) => (
                <motion.div
                    className={styles.candle}
                    style={{
                        position: "absolute",
                        left: `${position?.x}px`,
                        top: `${position?.y}px`,
                    }}
                    key={i}
                    initial="hidden"
                    animate="visible"
                    variants={candleVariants}

                >
                    <div className={styles.stick}></div>
                    <div className={`${styles.flame} ${isSoundDetected ? styles.hidden : ""}`}/>
                </motion.div>
            ))}
        </>
    )

}