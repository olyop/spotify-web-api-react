import { SpotifyQueryHttpMethod, SpotifyQueryRequestData } from "@oly_op/spotify-web-api";
import { useEffect, useState } from "react";

import { useSpotify } from "./use-spotify";

export const useSpotifyQuery = <T extends Record<string, unknown>>(
	method: SpotifyQueryHttpMethod,
	path: string,
	requestData?: SpotifyQueryRequestData,
) => {
	const { client, isAuthenticated } = useSpotify();

	const [isCalled, setIsCalled] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<T | null>(null);

	const handleQuery = async () => {
		setLoading(true);
		setError(null);
		setData(null);

		try {
			const response = await client.query<T>(method, path, requestData);

			setData(response);
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Unknown error");
		} finally {
			setIsCalled(true);
			setLoading(false);
		}
	};

	useEffect(() => {
		if (isAuthenticated && !isCalled) {
			void handleQuery();
		}
	}, [isAuthenticated, isCalled]);

	return { loading, error, data } as const;
};
