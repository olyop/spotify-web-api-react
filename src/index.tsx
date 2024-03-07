import { IndexedDbProvider, LocalStorageProvider, SpotifyWebApiClient, StorageProvider } from "@oly_op/spotify-web-api";
import { CacheProvider } from "@oly_op/spotify-web-api/dist/types";
import { FC, PropsWithChildren, createElement, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { SpotifyContext } from "./spotify-context";
import {
	SpotifyContext as SpotifyContextType,
	SpotifyReactProviderProps,
	SpotifyUser,
	SpotifyWebApiReactContextUser,
	SpotifyWebApiReactOptions,
} from "./types";
import { deleteStoredUser, getUser, retrieveStoredUser } from "./user";

export { useSpotify } from "./use-spotify";
export { useSpotifyQuery } from "./use-spotify-query";

export const SpotifyWebApiReactProvider: FC<PropsWithChildren<SpotifyReactProviderProps>> = ({
	client,
	options,
	children,
}) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [loading, setLoading] = useState(true);

	const authorizationCode = searchParams.get("code");

	const handleDatabaseReady = () => {
		setLoading(false);
	};

	const storageProviderRef = useRef<StorageProvider>(new LocalStorageProvider());

	const cacheProviderRef = useRef<CacheProvider>(
		new IndexedDbProvider("spotify-web-api", "cache", handleDatabaseReady),
	);

	const initialIsAuthenticated = SpotifyWebApiClient.isAuthenticatedInitial(storageProviderRef.current);

	const [error, setError] = useState<Error | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);

	const clientRef = useRef<SpotifyWebApiClient>(client);

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
		const userValue = await getUser(clientRef.current, options?.defaultProfileImagePath);

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
		if (loading) {
			client.setOptions({
				shouldAutoLogin: false,
				onAuthenticatedChange: setIsAuthenticated,
				onErrorChange: setError,
				storageProvider: storageProviderRef.current,
				cacheProvider: cacheProviderRef.current,
			});
		} else if (user === null) {
			void handleUser();
		}
	}, [user, loading]);

	useEffect(() => {
		if (authorizationCode) {
			handleAuthorizationCode();
		}
	}, [authorizationCode]);

	const contextValue: SpotifyContextType = useMemo(
		() => ({
			client: clientRef.current,
			isAuthenticated,
			loading,
			error,
			login,
			logout,
			user,
		}),
		[isAuthenticated, error, user],
	);

	return <SpotifyContext.Provider value={contextValue}>{children}</SpotifyContext.Provider>;
};

export {
	SpotifyContext as SpotifyContextType,
	SpotifyReactProviderProps,
	SpotifyUser,
	SpotifyWebApiReactContextUser,
	SpotifyWebApiReactOptions,
};
