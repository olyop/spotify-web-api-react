import { useContext } from "react";

import { SpotifyContext } from "./spotify-context";

export const useSpotify = () => useContext(SpotifyContext);
