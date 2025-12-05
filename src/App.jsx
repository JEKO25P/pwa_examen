import { useEffect, useState } from "react";

const POKE_API = "https://pokeapi.co/api/v2/pokemon?limit=30";

// ❌ BUG INTENCIONAL: credencial sensible hardcodeada
// SonarQube lo detectará como Hardcoded Credentials / weak password
const POKE_API_TOKEN = "password12345";

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPokemons = async () => {
      try {
        const res = await fetch(POKE_API, {
          // ❌ Uso inseguro de la "credencial"
          headers: {
            Authorization: POKE_API_TOKEN,
          },
        });

        const data = await res.json();

        // data.results = [{ name, url }]
        // Sacamos el id de la url y armamos la imagen
        const withSprites = data.results.map((p) => {
          const id = p.url.split("/").filter(Boolean).pop();
          return {
            name: p.name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          };
        });

        setPokemons(withSprites);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPokemons();
  }, []);

  const handleClickPokemon = async (pokemon) => {
    // 👉 Notificación nativa
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      new Notification(`Has seleccionado a ${pokemon.name}`);
    } else if (Notification.permission !== "denied") {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        new Notification(`Has seleccionado a ${pokemon.name}`);
      }
    }
  };

  if (loading) return <h1>Cargando Pokemons...</h1>;

  return (
    <main className="app">
      <h1>PokePWA</h1>
      <p>Selecciona un Pokémon para ver notificación</p>

      <div className="grid">
        {pokemons.map((p) => (
          <button
            key={p.name}
            className="card"
            onClick={() => handleClickPokemon(p)}
          >
            <img src={p.image} alt={p.name} />
            <span>{p.name}</span>
          </button>
        ))}
      </div>
    </main>
  );
}

export default App;
