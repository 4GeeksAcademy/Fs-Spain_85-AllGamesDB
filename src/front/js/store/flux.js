const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			videogames: [],
			tags: [],
			videogamesSearch: [],
			videogameSearchNameResult: [],
			numberOfPagesFromSearch: null,
			queryParams:[],
			currentSearchPage: 1,
			message: null,
			specificVideogameSteamId: 0,
			selectedGame: {}
		},
		actions: {
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},

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

			changeColor: (index, color) => {
				const store = getStore();
				const demo = store.demo.map((elm, i) => {
					if (i === index) return { ...elm, background: color };
					return elm;
				});

				setStore({ demo: demo });
			},
			setSpecificVideogameSteamId: (game) => {
				const store = getStore();
				setStore({ ...store, selectedGame: game });
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
					console.log("AQUI", store.selectedGame);

					return data[appId].data





					// if (data) {
					// 	const gameData = data["730"].data;
					// 	setStore({
					// 		videogames: [{
					// 			id: gameData.steam_appid,
					// 			name: gameData.name,
					// 			image: gameData.header_image,
					// 			price: gameData.price_overview ? gameData.price_overview.final_formatted : "Gratis",
					// 		}]
					// 	});
					// } else {
					// 	console.error("La API no devolvió datos válidos.");
					// }
				} catch (error) {
					console.error("Error al obtener los juegos:", error);
				}
			},

			fetchGames: async (page) => {
				if(page === undefined) page = 1;
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

			fetchSearchGames: async (search = "", tags = "", min_rating = "", max_rating = "", min_price = "", max_price = "", release_after = "", release_before = "", page = null, per_page = 10, order_by = "") => {
				try {
					if(page === null) {
						page = getStore().currentSearchPage 
					}
					
					const params = new URLSearchParams({
						search,
						filter: tags,
						min_rating,
						max_rating,
						min_price,
						max_price,
						release_after,
						release_before,
						order_by,
						page,
						per_page,
					});

					const filteredParams = Object.fromEntries(
						Object.entries(params).filter(([_, value]) => value !== "")
					);
				
					const queryParams = new URLSearchParams(filteredParams);

					const response = await fetch(`${process.env.BACKEND_URL}/api/games?page=${page}${queryParams}`);
					console.log("Fetching data");
					
					const data = await response.json();
				
					setStore({ videogamesSearch: data.result, numberOfPagesFromSearch: data.total_pages });
				  } catch (error) {
					console.log(error);
				  }
				},
			handlePagination: (page) => {
				setStore({ currentSearchPage: page });
				
			},
			queryGameName: async(gameName) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/search?filter=${gameName}`);
					const data = await response.json()
					console.log(data);
					setStore({videogameSearchNameResult: data})
				} catch (error) {
					console.log(error);
					
				}
			},
			resetVideogameSearchNameResult: () => {
				setStore({videogameSearchNameResult: []})
			}
		}
	};
};

export default getState;
