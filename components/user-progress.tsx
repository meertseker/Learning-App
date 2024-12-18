import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { InfinityIcon } from "lucide-react";

type Props = {
    activeCourse: { imageSrc: string; title: string };
    hearts: number;
    points: number;
    hasActiveSubscription: boolean;
};

export const UserProgress = ({
    activeCourse,
    hearts, 
    points, 
    hasActiveSubscription 
}: Props) => {
    return (
        <div className="flex items-center justify-between gap-x-2 w-full">
            <Link href="/library">
                <div> 
                    <Button variant="ghost">
                        <Image
                            src={activeCourse.imageSrc}
                            alt={activeCourse.title}
                            className="rounded-md-border"
                            width={32} // Specify width
                            height={32} // Specify height
                        />
                    </Button>
                </div>
            </Link>
            <Link href = "/subscription">
                <Button variant = "ghost" className="text-orange-500">
                    <Image src = "/points.svg" height={28} width={28} alt="points" className="mr-2"/>
                    {points}
                </Button>

            </Link>
            <Link href = "/subscription">
                <Button variant = "ghost" className="text-rose-500">
                    <Image src = "/heart.svg" height={22} width={22} alt="hearts" className="mr-2"/>
                    {hasActiveSubscription ? <InfinityIcon className="h-4 w-4 stroke-[3]"/> : hearts}
                </Button>

            </Link>
        </div>
    );
};
