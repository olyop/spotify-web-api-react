import { SpotifyWebApiClient } from "@oly_op/spotify-web-api";

import { SpotifyUser, SpotifyWebApiReactOptions } from "./types";

const USER_LOCAL_STORAGE_KEY = "spotify-web-api-react.authuser";

export async function getUser(client: SpotifyWebApiClient, options: SpotifyWebApiReactOptions) {
	if (!client.isAuthenticated) return null;

	if (retrieveStoredUser() !== null) return null;

	const data = await client.query<Record<string, unknown>>("GET", "me");

	const user = convertUserData(data, options);

	localStorage.setItem(USER_LOCAL_STORAGE_KEY, JSON.stringify(user));

	return user;
}

export function retrieveStoredUser() {
	const userJson = localStorage.getItem(USER_LOCAL_STORAGE_KEY);

	if (userJson === null) return null;

	return JSON.parse(userJson) as SpotifyUser;
}

export function deleteStoredUser() {
	localStorage.removeItem(USER_LOCAL_STORAGE_KEY);
}

export function convertUserData(data: Record<string, unknown>, options: SpotifyWebApiReactOptions) {
	const idData = data["id"];
	const nameData = data["display_name"];
	const emailAddressData = data["email"];
	const photoUrlData = data["images"];
	const spotifyUrlData = data["external_urls"];

	if (typeof idData !== "string") {
		throw new TypeError("No user ID found");
	}

	if (typeof nameData !== "string") {
		throw new TypeError("No user name found");
	}

	if (typeof emailAddressData !== "string") {
		throw new TypeError("No user email address found");
	}

	let photoUrl: string = options.defaultProfileImagePath;

	if (Array.isArray(photoUrlData)) {
		const photoUrlDataTyped = photoUrlData as Record<string, unknown>[];

		// check is not empty
		if (photoUrlDataTyped.length > 0) {
			const photoUrlImageData = photoUrlDataTyped[0];

			if (typeof photoUrlImageData === "object") {
				photoUrl = (photoUrlImageData as Record<string, string>)["url"] as string;
			}
		}
	}

	let spotifyUrl: string;

	if (typeof spotifyUrlData === "object") {
		const spotifyUrlItemData = (spotifyUrlData as Record<string, string>)["spotify"];

		if (typeof spotifyUrlItemData === "string") {
			spotifyUrl = spotifyUrlItemData;
		} else {
			throw new TypeError("No user Spotify URL found");
		}
	} else {
		throw new TypeError("No user Spotify URL found");
	}

	const user: SpotifyUser = {
		id: idData,
		name: nameData,
		emailAddress: emailAddressData,
		photoUrl,
		spotifyUrl,
	};

	return user;
}
