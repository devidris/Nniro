"use client"
import { PixelCell } from "#/context/PixelBoardContext";
import { Rect, Group, Image } from "react-konva";
import useImage from "use-image";

type CellProps = {
    cell: PixelCell,
    width: number,
    height: number,
    size: number
}

type CellImageProps = {
    img: string
}

const CellImage = ({ cell, width, height, size, img }: CellImageProps & CellProps) => {
    const [image] = useImage(img);
    
    return (
        <Image
            key={`${cell.id}-img`}
            id={`${cell.id}-img`}
            x={cell.x * (size)}
            y={cell.y * (size)}
            width={width}
            height={height}
            image={image}
            alt=''
            cellId={cell.id}
        />
    )
}

const Cell: React.FC<CellProps> = ({ cell, width, height, size }) => {
    return (
        <Group >
            {cell.image ? (
                <CellImage
                    cell={cell}
                    width={width}
                    height={height}
                    size={size}
                    img={cell.image}
                />
            ) : (
                <Rect
                    key={cell.id}
                    id={cell.id}
                    x={cell.x * (size)}
                    y={cell.y * (size)}
                    width={width}
                    height={height}
                    fill={cell.color}
                    cellId={cell.id}
                />
            )}
        </Group>
    );
};

export default Cell
