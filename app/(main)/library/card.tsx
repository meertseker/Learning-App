"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { setActiveCourse } from '@/db/queries';

type Props = {
    title: string;
    id: number;
    image_src: string;
    onClick: (id: number) => void;
    disabled?: boolean;
    active?: boolean;
};

const Card: React.FC<Props> = ({ title, id, image_src, onClick, disabled, active }) => {    
    const router = useRouter();
    const imageSource = image_src || '/placeholder-image.svg';

    const handleClick = async () => {
        if (!disabled) {
            try {
                await setActiveCourse(id);
                router.refresh(); // Refresh the page to show updated state
                onClick(id);
            } catch (error) {
                console.error("Error setting active course:", error);
            }
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className={`
                group relative w-full rounded-xl border-2 overflow-hidden
                transition-all duration-200
                ${active ? 'border-green-500 bg-green-50/50' : 'border-slate-200 hover:border-slate-300'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            disabled={disabled}
            aria-pressed={active}
        >
            <div className="aspect-[2/1.4] relative bg-slate-50 flex items-center justify-center">
                {active && (
                    <div className="absolute top-2 right-2 z-10 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg">
                        ✓
                    </div>
                )}
                {imageSource ? (
                    <Image 
                        src={imageSource}
                        alt={title}
                        height={300}
                        width={300}
                        className="object-contain p-4 mx-auto"
                        priority={false}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        No Image
                    </div>
                )}
            </div>
            <div className="p-3">
                <h3 className="font-semibold text-slate-700 line-clamp-2">
                    {title}
                </h3>
            </div>
        </motion.button>
    );
}

export default Card;