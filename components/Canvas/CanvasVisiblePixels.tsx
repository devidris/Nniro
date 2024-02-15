import { usePixelContext } from "#/context/PixelBoardContext";
import Cell from "./CanvasCell";

const CanvasVisibleCells = () => {
  const { visibleSegmentData, boardConfig } = usePixelContext();

//   console.log("visibleSegmentData", visibleSegmentData);

  return (
    <>
      {visibleSegmentData.map((cell, key) => (
        <Cell
          cell={cell}
          key={key}
          width={boardConfig.cellSize}
          height={boardConfig.cellSize}
          size={boardConfig.cellSize}
        />
      ))}
    </>
  );
};

export default CanvasVisibleCells;
