import React, { createContext, useContext, useState } from "react";

interface RouteRestoredContextValue {
  isRestored: boolean;
  markRestored: () => void;
}

const RouteRestoredContext = createContext<RouteRestoredContextValue>({
  isRestored: false,
  markRestored: () => {},
});

export function RouteRestoredProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isRestored, setIsRestored] = useState(false);
  const markRestored = () => setIsRestored(true);

  return (
    <RouteRestoredContext.Provider value={{ isRestored, markRestored }}>
      {children}
    </RouteRestoredContext.Provider>
  );
}

export const useRouteRestored = () => useContext(RouteRestoredContext);
