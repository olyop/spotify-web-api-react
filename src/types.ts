import {
	SpotifyOAuthConfiguration,
	SpotifyWebApiClient,
	SpotifyWebApiClientLogInOut,
	SpotifyWebApiClientState,
} from "@oly_op/spotify-web-api";

export interface SpotifyWebApiReactOptions extends SpotifyOAuthConfiguration {
	defaultProfileImagePath: string;
}

export interface SpotifyUser extends Record<string, string> {
	id: string;
	name: string;
	photoUrl: string;
	spotifyUrl: string;
	emailAddress: string;
}

export type SpotifyContextIs = boolean | null;
export type SpotifyWebApiReactContextUser = SpotifyUser | null;

export interface SpotifyContext extends SpotifyWebApiClientState, SpotifyWebApiClientLogInOut {
	client: SpotifyWebApiClient;
	user: SpotifyWebApiReactContextUser;
}

export interface SpotifyReactProviderProps {
	options: SpotifyWebApiReactOptions;
}
