import { LocalStorageProvider, SpotifyOptions, SpotifyWebApiClient, StorageProvider } from "@oly_op/spotify-web-api";
import { FC, PropsWithChildren, createElement, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { SpotifyContext } from "./spotify-context";
import { SpotifyContext as SpotifyContextType, SpotifyReactProviderProps, SpotifyUser } from "./types";
import { deleteStoredUser, getUser, retrieveStoredUser } from "./user";

export { useSpotify } from "./use-spotify";

export { useSpotifyQuery } from "./use-spotify-query";

export const SpotifyWebApiReactProvider: FC<PropsWithChildren<SpotifyReactProviderProps>> = ({ options, children }) => {
	const [searchParams, setSearchParams] = useSearchParams();

	const authorizationCode = searchParams.get("code");

	const { defaultProfileImagePath, ...otherApiOptions } = options;

	const storageProviderRef = useRef<StorageProvider>(new LocalStorageProvider());

	const initialIsAuthenticated = SpotifyWebApiClient.isAuthenticatedInitial(storageProviderRef.current);
	const initialIsLoading = SpotifyWebApiClient.isLoadingInitial(authorizationCode);

	const [error, setError] = useState<Error | null>(null);
	const [isLoading, setIsLoading] = useState(initialIsLoading);
	const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);

	const apiOptions: SpotifyOptions = {
		...otherApiOptions,
		authorizationCode,
		storageProvider: storageProviderRef.current,
		onErrorChange: setError,
		onLoadingChange: setIsLoading,
		onAuthenticatedChange: setIsAuthenticated,
	};

	const clientRef = useRef<SpotifyWebApiClient>(new SpotifyWebApiClient(apiOptions));

	const [user, setUser] = useState<SpotifyUser | null>(retrieveStoredUser());

	const login = () => {
		clientRef.current.login();
	};

	const logout = () => {
		deleteStoredUser();
		setUser(null);

		clientRef.current.logout();

		window.location.reload();
	};

	const handleUser = async () => {
		const userValue = await getUser(clientRef.current, options);

		if (userValue !== null) {
			setUser(userValue);
		}
	};

	const handleAuthorizationCode = () => {
		if (searchParams.has("code")) {
			setSearchParams(prevState => {
				prevState.delete("code");
				return prevState;
			});
		}
	};

	useEffect(() => {
		if (isAuthenticated && user === null) {
			void handleUser();
		}
	}, [isAuthenticated]);

	useEffect(() => {
		if (authorizationCode) {
			handleAuthorizationCode();
		}
	}, [authorizationCode]);

	const contextValue: SpotifyContextType = useMemo(
		() => ({
			client: clientRef.current,
			isAuthenticated,
			isLoading,
			error,
			login,
			logout,
			user,
		}),
		[isAuthenticated, isLoading, error, user],
	);

	return <SpotifyContext.Provider value={contextValue}>{children}</SpotifyContext.Provider>;
};
