import { useEffect, useState, useRef } from "react";

export function useOnScreen(ref: any) {
  const [isOnScreen, setIsOnScreen] = useState(false);

  useEffect(() => {
    if (ref.current) {
     setIsOnScreen(true)
    }
  }, [ref]);

  return isOnScreen;
}
