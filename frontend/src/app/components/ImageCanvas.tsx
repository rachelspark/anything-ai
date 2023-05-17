import Image, { StaticImageData } from "next/image";


export const ImageCanvas = ({
    imageUrl,
    alt,
    width,
    height,
    className,
    onClick,
}: {
    imageUrl: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
}) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (onClick) {
            onClick(e);
        }
    };

    return (
        <div className={`${className ? className : ""}`} onClick={(e) => handleClick(e)}>
            <Image src={imageUrl} alt={alt} width={width} height={height} />
        </div>
    );
};