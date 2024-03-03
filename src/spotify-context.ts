import { createContext } from "react";

import { SpotifyContext as SpotifyContextType } from "./types";

export const SpotifyContext = createContext<SpotifyContextType>({} as SpotifyContextType);
