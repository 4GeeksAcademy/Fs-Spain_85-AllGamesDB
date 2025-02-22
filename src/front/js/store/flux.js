const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			user: null,
			token: localStorage.getItem("token") || null,
			videogames: [],
			tags: [],
			videogamesSearch: [],
			videogameSearchNameResult: [],
			numberOfPagesFromSearch: null,
			queryParams: {
				search: "",
				tags: [],
				min_rating: 0,
				max_rating: 100,
				min_price: 0,
				max_price: 100,
				release_after: "2000-01-01T00:00:00Z",
				release_before: "2025-12-31T23:59:59Z",
				order_by: "relevant:asc",
				per_page: 10
			},
			carousel: [],
			currentSearchPage: 1,
			message: null,
			specificVideogameSteamId: 0,
			logedIn: false,
			favouriteGames: [],
			selectedGame: {}
		},
		actions: {
			// exampleFunction: () => {
			// 	getActions().changeColor(0, "green");
			// },

			getMessage: async () => {
				try {
					const resp = await fetch(process.env.BACKEND_URL + "/api/hello");
					const data = await resp.json();
					setStore({ message: data.message });

					return data;
				} catch (error) {
					console.log("Error loading message from backend", error);
				}
			},

			// changeColor: (index, color) => {
			// 	const store = getStore();
			// 	const demo = store.demo.map((elm, i) => {
			// 		if (i === index) return { ...elm, background: color };
			// 		return elm;
			// 	});

			// 	setStore({ demo: demo });
			// },
			setSpecificVideogameSteamId: (game) => {
				const store = getStore();
				setStore({ ...store, selectedGame: game });
				console.log(store.selectedGame.app_id);

			},
			fetchGameDetails: async (appId) => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/steam/${appId}`);
					// console.log(response);
					if (!response.ok) throw new Error("Error en la respuesta de la API");
					const data = await response.json();
					// console.log(data);
					console.log(data[appId].data.name);
					let resultSteam = data[appId].data
					setStore({
						...store,
						selectedGame: {
							...store.selectedGame,
							shortDescription: resultSteam.short_description,
							screenshots: resultSteam.screenshots,
							movies: resultSteam.movies,
							image: resultSteam.header_image
						}
					})
					// console.log(store.selectedGame);

					return data[appId].data
				} catch (error) {
					console.error("Error al obtener los juegos:", error);
				}
			},

			fetchGames: async (page) => {
				if (page === undefined) page = 1;
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/games?page=${page}`);
					const data = await response.json()
					console.log(data);

					setStore({ videogames: data.result })

				} catch (error) {
					console.log(error)
				}
			},
			fetchTags: async () => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/tags/names`);
					const data = await response.json()
					// console.log(data);
					let tagNames = data.results.map((tag) => [tag.tag_name, tag.number_of_games])
					setStore({ tags: tagNames })
					console.log(getStore().tags);

				} catch (error) {
					console.log(error)
				}
			},

			fetchSearchGames: async (
				search = "",
				tags = [],
				min_rating = "",
				max_rating = "",
				min_price = "",
				max_price = "",
				release_after = "",
				release_before = "",
				page = null,
				per_page = 10,
				order_by = ""
			) => {
				try {
					const tagsString = tags.join(",");
					const params = new URLSearchParams({
						search,
						filter: tagsString,
						min_rating,
						max_rating,
						min_price,
						max_price,
						release_after,
						release_before,
						order_by,
						page: page || 1,
						per_page,
					});

					const filteredParams = Object.fromEntries(
						Object.entries(Object.fromEntries(params)).filter(([_, value]) => value !== "")
					);

					const queryParams = new URLSearchParams(filteredParams);

					const url = `${process.env.BACKEND_URL}/api/games?${queryParams.toString()}`;
					console.log("Fetching data from:", url);

					const response = await fetch(url);
					const data = await response.json();

					setStore({
						videogamesSearch: data.result,
						numberOfPagesFromSearch: data.total_pages
					});
				} catch (error) {
					console.log("Error fetching games:", error);
				}
			},
			handlePagination: (page) => {
				setStore({ currentSearchPage: page });

			},
			updateSearchParameters: async (page, activeTags, minPrice, maxPrice, minRating, maxRating, releaseAfter, releaseBefore, orderBy) => {
				let store = getStore()
				let actions = getActions()
				await setStore({
					...store,
					currentSearchPage: page,
					queryParams: {
						...store.queryParams,
						tags: activeTags,
						min_price: minPrice,
						max_price: maxPrice,
						min_rating: minRating,
						max_rating: maxRating,
						release_after: `${releaseAfter}-01-01T00:00:00Z`,
						release_before: `${releaseBefore}-12-31T23:59:59Z`,
						order_by: orderBy
					}
				})

				await actions.fetchSearchGames(
					store.queryParams.search,
					activeTags,
					minRating,
					maxRating,
					minPrice,
					maxPrice,
					`${releaseAfter}-01-01T00:00:00Z`,
					`${releaseBefore}-12-31T23:59:59Z`,
					store.currentSearchPage,
					store.queryParams.per_page,
					orderBy,
				);
			},
			queryGameName: async (gameName) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/search?filter=${gameName}`);
					const data = await response.json()
					console.log(data);
					setStore({ videogameSearchNameResult: data })
				} catch (error) {
					console.log(error);

				}
			},
			resetVideogameSearchNameResult: () => {
				setStore({ videogameSearchNameResult: [] })
			},

			getCarrouselInfo: async() => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/carrousel`);
					const data = await response.json()
					setStore({ carousel: data })
					console.log(getStore().carousel);
				} catch (error) {
					console.log(error);

				}
			},
			login: async (email, password) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/login`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ email, password })
					});


					if (!response.ok) throw new Error("Error en las credenciales");

					const data = await response.json();
					localStorage.setItem("token", data.token);
					setStore({ user: data.user, token: data.token, logedIn: true });

					return true;
				} catch (error) {
					console.error(error);
					return false;
				}
			},
			logout: () => {
				localStorage.removeItem("token");
				setStore({ user: null, 
					token: null, 
					logedIn: false,
					currentSearchPage: 1
				});//borra token cierra sesion, resetea la búsqueda
			},

			signup: async (email, password) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/signup`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ email, password }),
					});

					if (!response.ok) {
						const errorData = await response.json();
						console.error("Error en el registro:", errorData);
						return false;
					}

					const data = await response.json();
					console.log("Registro exitoso:", data);
					return true;
				} catch (error) {
					console.error("Error en la petición:", error);
					return false;
				}
			},
			fetchFavourites: async function fetchFavourites() {
				const store = getStore();
				let token = localStorage.getItem("token");
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/profile`, {
						method: "GET",
						headers: { Authorization: `Bearer ${token}` }
					});
					if (response.status != 200) return;
					const data = await response.json();
					if (data.favourites === null) {
						setStore({ ...store, favouriteGames: [] })
						return
					};
					// console.log(data.favourites);
					setStore({ ...store, favouriteGames: data.favourites })
					return
				} catch (error) {
					const store = getStore();
					console.log(error);
					setStore({ ...store, favouriteGames: [] })

					return
				}
			},
			addFavourite: async function addFavourite(newFavourite) {
				let token = localStorage.getItem("token");
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/profile/favourites`, {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json"
						},
						body: JSON.stringify({ game_id: newFavourite })
					})
					console.log(response);
					if (response.status == 422) {
						setStore({logedIn: false}),
						alert("Your session has expired, please, log in again.")
					}
					const data = await response.json();
					console.log(data);
					return
				} catch (error) {
					console.log(error);
					return
				}
			},
			deleteFavourite: async function deleteFavourite(favouriteToDelete) {
				let token = localStorage.getItem("token");
				try {
					const response = await fetch(`${process.env.BACKEND_URL}//api/profile/favourites`, {
						method: 'DELETE',
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json"
						},
						body: JSON.stringify({ game_id: favouriteToDelete })
					})
					console.log(response);
					if (response.status == 422) {
						setStore({logedIn: false}),
						alert("Your session has expired, please, log in again.")
					}
					const data = await response.json();
					console.log(data);
					return
				} catch (error) {
					console.log(error);
					return
				}
			},
			addLocalFavourite: function addLocalFavourite(game) {
				const store = getStore();
				let favouriteStandarized = { favourite_game: game }
				console.log("este es el nuevoooo", store.favouriteGames);
				setStore({ ...store, favouriteGames: [...store.favouriteGames, favouriteStandarized] })
			},
			deleteLocalFavourite: function deleteLocalFavourite(game) {
				const store = getStore();
				console.log("game", game);
				
				let resultantFavourites = store.favouriteGames.filter((favourite) => {
					console.log(favourite.favourite_game);
					
					return favourite.favourite_game.id !== game.id
				})
				setStore({ ...store, favouriteGames: resultantFavourites })
			},
		}
	};
};

export default getState;
