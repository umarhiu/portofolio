'use client';

import React, { useRef, useId, useEffect, useState, CSSProperties } from 'react';
import { animate, useMotionValue, AnimationPlaybackControls } from 'framer-motion';

/*
  Adapted from the "Etheral Shadows" component. Changes for this project:
  - Texture assets are served locally from /public (no framerusercontent hotlink).
  - The demo <h1> overlay was removed: this is a pure background layer.
  - Honors prefers-reduced-motion (disables the animated displacement).
  The public API (Component + props) is otherwise unchanged.
*/

const MASK_SRC = '/asset/hero/etheral-mask.png';
const NOISE_SRC = '/asset/hero/etheral-noise.png';

// Type definitions
interface ResponsiveImage {
    src: string;
    alt?: string;
    srcSet?: string;
}

interface AnimationConfig {
    preview?: boolean;
    scale: number;
    speed: number;
}

interface NoiseConfig {
    opacity: number;
    scale: number;
}

interface ShadowOverlayProps {
    type?: 'preset' | 'custom';
    presetIndex?: number;
    customImage?: ResponsiveImage;
    sizing?: 'fill' | 'stretch';
    color?: string;
    animation?: AnimationConfig;
    noise?: NoiseConfig;
    style?: CSSProperties;
    className?: string;
}

function mapRange(
    value: number,
    fromLow: number,
    fromHigh: number,
    toLow: number,
    toHigh: number
): number {
    if (fromLow === fromHigh) {
        return toLow;
    }
    const percentage = (value - fromLow) / (fromHigh - fromLow);
    return toLow + percentage * (toHigh - toLow);
}

const useInstanceId = (): string => {
    const id = useId();
    const cleanId = id.replace(/:/g, "");
    const instanceId = `shadowoverlay-${cleanId}`;
    return instanceId;
};

export function Component({
    sizing = 'fill',
    color = 'rgba(128, 128, 128, 1)',
    animation,
    noise,
    style,
    className
}: ShadowOverlayProps) {
    const id = useInstanceId();
    const feColorMatrixRef = useRef<SVGFEColorMatrixElement>(null);
    const hueRotateMotionValue = useMotionValue(180);
    const hueRotateAnimation = useRef<AnimationPlaybackControls | null>(null);

    // Disable the animated displacement under reduced-motion. Read on the client
    // only so server render and first paint stay in sync.
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
        const apply = () => setReduced(mql.matches);
        apply();
        mql.addEventListener('change', apply);
        return () => mql.removeEventListener('change', apply);
    }, []);

    const animationEnabled = !reduced && !!animation && animation.scale > 0;
    const displacementScale = animation ? mapRange(animation.scale, 1, 100, 20, 100) : 0;
    const animationDuration = animation ? mapRange(animation.speed, 1, 100, 1000, 50) : 1;

    useEffect(() => {
        if (feColorMatrixRef.current && animationEnabled) {
            if (hueRotateAnimation.current) {
                hueRotateAnimation.current.stop();
            }
            hueRotateMotionValue.set(0);
            hueRotateAnimation.current = animate(hueRotateMotionValue, 360, {
                duration: animationDuration / 25,
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 0,
                ease: "linear",
                delay: 0,
                onUpdate: (value: number) => {
                    if (feColorMatrixRef.current) {
                        feColorMatrixRef.current.setAttribute("values", String(value));
                    }
                }
            });

            return () => {
                if (hueRotateAnimation.current) {
                    hueRotateAnimation.current.stop();
                }
            };
        }
    }, [animationEnabled, animationDuration, hueRotateMotionValue]);

    return (
        <div
            className={className}
            style={{
                overflow: "hidden",
                position: "relative",
                width: "100%",
                height: "100%",
                ...style
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: -displacementScale,
                    filter: animationEnabled ? `url(#${id}) blur(4px)` : "none"
                }}
            >
                {animationEnabled && (
                    <svg style={{ position: "absolute" }}>
                        <defs>
                            <filter id={id}>
                                <feTurbulence
                                    result="undulation"
                                    numOctaves="2"
                                    baseFrequency={`${mapRange(animation!.scale, 0, 100, 0.001, 0.0005)},${mapRange(animation!.scale, 0, 100, 0.004, 0.002)}`}
                                    seed="0"
                                    type="turbulence"
                                />
                                <feColorMatrix
                                    ref={feColorMatrixRef}
                                    in="undulation"
                                    type="hueRotate"
                                    values="180"
                                />
                                <feColorMatrix
                                    in="dist"
                                    result="circulation"
                                    type="matrix"
                                    values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0"
                                />
                                <feDisplacementMap
                                    in="SourceGraphic"
                                    in2="circulation"
                                    scale={displacementScale}
                                    result="dist"
                                />
                                <feDisplacementMap
                                    in="dist"
                                    in2="undulation"
                                    scale={displacementScale}
                                    result="output"
                                />
                            </filter>
                        </defs>
                    </svg>
                )}
                <div
                    style={{
                        backgroundColor: color,
                        maskImage: `url('${MASK_SRC}')`,
                        WebkitMaskImage: `url('${MASK_SRC}')`,
                        maskSize: sizing === "stretch" ? "100% 100%" : "cover",
                        WebkitMaskSize: sizing === "stretch" ? "100% 100%" : "cover",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                        maskPosition: "center",
                        WebkitMaskPosition: "center",
                        width: "100%",
                        height: "100%"
                    }}
                />
            </div>

            {noise && noise.opacity > 0 && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url("${NOISE_SRC}")`,
                        backgroundSize: noise.scale * 200,
                        backgroundRepeat: "repeat",
                        opacity: noise.opacity / 2
                    }}
                />
            )}
        </div>
    );
}
