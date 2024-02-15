"use client";
import { PixelResponse } from "#/hooks/usePixel";
// import useAxiosAuth from "#/hooks/useAuthAxios";
import useSegmentPixels from "#/hooks/useSegmentPixels";
import { useQueryClient } from "@tanstack/react-query";
// import { useQuery } from "@tanstack/react-query";
// import axiosInstance from "#/lib/axiosInstance";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Socket, io } from "socket.io-client";
import { useDebounce } from "@uidotdev/usehooks";
import { useServerLog } from "#/hooks";

interface Point {
  x: number;
  y: number;
}

export type PixelCell = {
  id: string; // [x]-[y],
  x: number;
  y: number;
  color?: string;
  image?: string;
  userId: string;
  free?: boolean;
};

type Segment = {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

const initialSegment = {
  x1: 0,
  x2: 1000,
  y1: 0,
  y2: 1000,
};

type BoardConfig = {
  cellSize: number;
  boardSize: number;
  scaleBy: number;
  maxScale: number;
  minScale: number;
  scale: number;
};

type canvasesArr = {
  img: any;
  x: number;
  y: number;
};
interface PixelContextI {
  board: { [key: string]: PixelCell };
  visibleSegmentCoords: Segment;
  setVisibleSegment: (coords: Segment) => void;
  visibleSegmentData: PixelCell[];
  selected: PixelCell | null;
  setSelectedPixel: (cellId: string | null) => void;
  setBoardConfig: (config: Partial<BoardConfig>) => void;
  checkAllowedHiRes: ({ x2, x1, y2, y1 }: Segment) => boolean;
  checkAllowedLowRes: ({ x2, x1, y2, y1 }: Segment) => boolean;
  checkAllowedLowResToRender: ({ x2, x1, y2, y1 }: Segment) => boolean;
  mainImage: string | null;
  isLoading: boolean;
  boardConfig: BoardConfig;
  pickedImage: any;
  handlePickImage: any;
  // isLoadingCanva: boolean;
  // canvasesImg: canvasesArr[] | null;
  availbleImgsInLowRes: any;
  handleSelectBlock: (x: number, y: number) => void;
  canvasCell: { x: number; y: number };
  handleCanvasesLoading: (state: boolean) => void;
  canvasesLoading: boolean;
}

const initialContext: PixelContextI = {
  board: {},
  visibleSegmentCoords: initialSegment,
  setVisibleSegment: (coords: Segment) => {},
  visibleSegmentData: [],
  selected: null,
  setSelectedPixel: (cellId: string | null) => {},
  checkAllowedHiRes: ({ x2, x1, y2, y1 }: Segment) => {
    return false;
  },
  checkAllowedLowRes: ({ x2, x1, y2, y1 }: Segment) => {
    return false;
  },
  checkAllowedLowResToRender: ({ x2, x1, y2, y1 }: Segment) => {
    return false;
  },
  mainImage: null,
  isLoading: false,
  setBoardConfig: (config: Partial<BoardConfig>) => {},
  boardConfig: {
    // Pixel width and height
    cellSize: 1,
    boardSize: 1000,
    minScale: 1,
    maxScale: 100,
    scaleBy: 1.1,
    scale: 1,
  },
  pickedImage: null,
  handlePickImage: () => {},
  // isLoadingCanva: false,
  // canvasesImg: null,
  availbleImgsInLowRes: null,
  handleSelectBlock: (x: number, y: number) => {},
  canvasCell: { x: 0, y: 0 },
  handleCanvasesLoading: (state: boolean) => {},
  canvasesLoading: false,
};

const PixelContext = createContext<PixelContextI>(initialContext);

// const globalBoard = {};

// const generateVisibleGrid = ({ x1, y1, x2, y2 }: Segment) => {
//   const xMax = x2 > 1000 ? 1000 : x2;
//   const yMax = y2 > 1000 ? 1000 : y2;

//   const boardA: { [key: string]: PixelCell } = {};
//   for (let x = x1; x < xMax; x++) {
//     for (let y = y1; y < yMax; y++) {
//       const key = `${x}-${y}`;
//       boardA[key] = {
//         id: key,
//         x,
//         y,
//         color: "green",
//         image: `https://fakeimg.pl/100x100/?text=${x}-${y}&font=lobster`,
//         // image: `localhost:`,
//       };

//     }
//   }

//   return boardA;
// };

const usePixelContext = () => useContext(PixelContext);

const PixelContextProvider = ({ children }: { children: React.ReactNode }) => {
  const socetRef = useRef(null);
  // const axiosAuth = useAxiosAuth()
  const queryClient = useQueryClient();
  const [visibleSegmentCoordsState, setSegmentCoords] = useState<Segment>({
    x1: 0,
    x2: 1000,
    y1: 0,
    y2: 1000,
  });

  const [prevVisibleSegmentCoordsState, setPrevSegmentCoords] =
    useState<Segment>({
      x1: 0,
      x2: 1000,
      y1: 0,
      y2: 1000,
    });

  const [allowReRender, setAllowReRender] = useState(false);

  const handleChangeAllow = async (value: boolean) => {
    setAllowReRender(value);
  };

  const { sl } = useServerLog();

  function checkAllowedHiRes({ x2, x1, y2, y1 }: Segment) {
    const elements = (x2 - x1) * (y2 - y1);
    // sl(elements);
    if (elements < 9000) {
      return true;
    }

    return false;
  }

  function checkAllowedLowRes({ x2, x1, y2, y1 }: Segment) {
    const elements = (x2 - x1) * (y2 - y1);
    // console.log("outside", allowReRender);
    if (elements <= 100000 && elements >= 2001) {
      // console.log("inside", allowReRender);
      return true;
    }
    return false;
  }

  function checkAllowedLowResToRender({ x2, x1, y2, y1 }: Segment) {
    const elements = (x2 - x1) * (y2 - y1);
    if (elements < 50000) {
      return true;
    }

    return false;
  }

  const rectsArray: any[] = [];

  const countRects = () => {
    const rectTop = {
      x1: visibleSegmentCoordsState.x1,
      x2: visibleSegmentCoordsState.x2,
      y1: visibleSegmentCoordsState.y1,
      y2: prevVisibleSegmentCoordsState.y2,
    };

    const rectLeft = {
      x1: visibleSegmentCoordsState.x1,
      x2: prevVisibleSegmentCoordsState.x2,
      y1: prevVisibleSegmentCoordsState.y1,
      y2: prevVisibleSegmentCoordsState.y2,
    };

    const rectBot = {
      x1: visibleSegmentCoordsState.x1,
      x2: visibleSegmentCoordsState.x2,
      y1: prevVisibleSegmentCoordsState.y2,
      y2: visibleSegmentCoordsState.y2,
    };

    const rectRight = {
      x1: prevVisibleSegmentCoordsState.x2,
      x2: visibleSegmentCoordsState.x2,
      y1: prevVisibleSegmentCoordsState.y1,
      y2: prevVisibleSegmentCoordsState.y2,
    };

    rectsArray.push(rectTop, rectLeft, rectBot, rectRight);
  };

  const [zoomedOut, setZoomedOut] = useState(false);
  const [newRects, setNewRects] = useState<any>([]);

  const visibleSegmentCoords = useDebounce(visibleSegmentCoordsState, 50);

  const [canvasesLoading, setCanvasesLoading] = useState(false);

  const handleCanvasesLoading = (state: boolean) => {
    setCanvasesLoading(state);
  };

  useEffect(() => {
    if (
      visibleSegmentCoords.x1 < prevVisibleSegmentCoordsState.x1 ||
      visibleSegmentCoords.x2 > prevVisibleSegmentCoordsState.x2 ||
      visibleSegmentCoords.y1 < prevVisibleSegmentCoordsState.y1 ||
      visibleSegmentCoords.y2 > prevVisibleSegmentCoordsState.y2
    ) {
      countRects();
      setZoomedOut(true);
      setNewRects(rectsArray);
    } else {
      setZoomedOut(false);
    }
    setPrevSegmentCoords(visibleSegmentCoords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleSegmentCoords]);

  function getUniquePixelCells(
    arr1: PixelCell[],
    arr2: PixelCell[]
  ): PixelCell[] {
    const combinedArray = arr1.concat(arr2);

    const uniquePixelCells = Array.from(
      new Set(combinedArray.map((cell) => JSON.stringify(cell)))
    ).map((str) => JSON.parse(str) as PixelCell);

    return uniquePixelCells;
  }

  const [board, setBoard] = useState<PixelCell[]>([]);

  const { data: data, isFetching } = useSegmentPixels({
    ...visibleSegmentCoords,
    zoomedOut: zoomedOut,
    rectangles: newRects,
    enabled: checkAllowedHiRes(visibleSegmentCoords),
  });

  const reCountHiRes = async () => {
    if (data) {
      const concat = getUniquePixelCells(data, board);
      setBoard(concat);
    } else {
      setBoard(data);
    }
  };

  useEffect(() => {
    reCountHiRes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // useEffect(() => {
  //   if (data.length > 0 && data !== board) {
  //     setBoard(data);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [data]);

  const [canvasCell, setCanvaCell] = useState({ x: 0, y: 0 });

  const handleSelectBlock = (x: number, y: number) => {
    setCanvaCell({ x: x, y: y });
  };

  // sl(status)

  const [boardConfig, setConfig] = useState<BoardConfig>(
    initialContext.boardConfig
  );
  const [selected, setSelected] = useState<PixelCell | null>(null);

  const setVisibleSegment = (coords: Segment) => setSegmentCoords(coords);

  const setSelectedPixel = (cellId: string | null) => {
    if (!cellId) {
      return setSelected(null);
    }
    let cell;
    if (board) {
      cell = board.find((cell: any) => cell.id === cellId);
    }

    if (!cell) {
      const [x, y] = cellId.split("-");

      const generatedCell = {
        id: `${y}-${x}`,
        x: Number(x),
        y: Number(y),
        color: undefined,
        image: undefined,
      } as PixelCell;

      return setSelected(generatedCell);
    }

    setSelected(cell);
  };
  const [pickedImage, setPickedImage] = useState(null);

  const handlePickImage = (dataUrl = null) => {
    setPickedImage(dataUrl);
  };

  const updateConfig = (config: Partial<BoardConfig>) =>
    setConfig((p) => ({ ...p, ...config }));

  useEffect(() => {
    // conecting to websocet

    const pixelSocket = io("https://pixel-deploy-develop.up.railway.app");

    console.log(pixelSocket);
    // @ts-ignore
    socetRef.current = pixelSocket;

    pixelSocket.connect();
    pixelSocket.on("connect", () => {
      console.log("connected");
    });
    // load main imgae

    // set message listeners
    // listen single pixel updates
    pixelSocket.on("update pixel", (data: string) => {
      // const freshUpdate = JSON.parse(data ?? {})
      const [y, x] = data.split(" ");

      if (!x || !y) {
        return;
      }
      queryClient.invalidateQueries({ queryKey: [`${x}-${y}`] });
    });

    return () => {
      pixelSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roundDownToMultiple = (value: number) => {
    return 50 * Math.floor(value / 50);
  };

  const getCoords = async () => {
    if (!checkAllowedLowRes(visibleSegmentCoords)) return;
    const canvases: any[] = [];
    for (
      let i = roundDownToMultiple(visibleSegmentCoords.x1);
      i <= roundDownToMultiple(visibleSegmentCoords.x2);
      i += 50
    ) {
      for (
        let j = roundDownToMultiple(visibleSegmentCoords.y1);
        j <= roundDownToMultiple(visibleSegmentCoords.y2);
        j += 50
      ) {
        canvases.push({ x: i, y: j });
      }
    }
    return canvases;
  };

  function getUniqueObjects(arr1: Point[], arr2: Point[]): Point[] {
    const combinedArray = arr1.concat(arr2);

    const uniqueObjects = Array.from(
      new Set(combinedArray.map((obj) => JSON.stringify(obj)))
    ).map((str) => JSON.parse(str) as Point);

    return uniqueObjects;
  }

  const [newAvailable, setNewAbailable] = useState<any[] | undefined>([]);

  const reCountLowRes = async () => {
    const temp = await getCoords();
    if (temp && newAvailable) {
      const concat = getUniqueObjects(temp, newAvailable);
      setNewAbailable(concat);
    } else {
      setNewAbailable(temp);
    }
  };

  useEffect(() => {
    reCountLowRes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleSegmentCoords]);

  // const availbleImgsInLowRes = getCoords();

  const mainImageUrl = `${process.env.NEXT_PUBLIC_API}/pixels/init`;

  return (
    <PixelContext.Provider
      value={{
        visibleSegmentCoords: visibleSegmentCoordsState,
        board: {},
        setVisibleSegment,
        visibleSegmentData: board,
        selected,
        setSelectedPixel,
        checkAllowedHiRes,
        checkAllowedLowRes,
        checkAllowedLowResToRender,
        mainImage: mainImageUrl,
        isLoading: isFetching,
        boardConfig,
        setBoardConfig: updateConfig,
        pickedImage,
        handlePickImage,
        // isLoadingCanva: isLoading,
        // canvasesImg: canvases,
        availbleImgsInLowRes: newAvailable,
        handleSelectBlock,
        canvasCell,
        handleCanvasesLoading,
        canvasesLoading,
      }}
    >
      {children}
    </PixelContext.Provider>
  );
};

export { PixelContext, usePixelContext, PixelContextProvider };
