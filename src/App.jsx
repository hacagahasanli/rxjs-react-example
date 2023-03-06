import { useEffect, useState } from 'react';
import { BehaviorSubject, from } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, mergeMap } from 'rxjs/operators';

const liStyle = { color: "white", fontSize: "1rem", marginTop: ".8rem", width: "max-content" }
const inputStyle = { width: "13rem", height: "2rem" }
const divStyle = { width: "100%", minHeight: "100%", color: "white", fontSize: '4rem', display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }

const getPokemonByName = async name => {
  const { results: allPokemons } = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000")
    .then(res => res.json())
  const result = allPokemons?.filter(pokemon => pokemon?.name?.includes(name))
  return result
}

const searchSubject = new BehaviorSubject('')
const searchResultObservable = searchSubject.pipe(
  filter(val => val.length > 1),
  debounceTime(750),
  distinctUntilChanged(),
  mergeMap(val => from(getPokemonByName(val)))
)

const useObservable = (observable, setter) => {
  useEffect(() => {
    let subscription = observable.subscribe(result => setter(result))
    return () => subscription?.unsubscribe()
  }, [observable, setter])
}

const App = () => {
  const [search, setSearch] = useState("")
  const [results, setResults] = useState([])
  useObservable(searchResultObservable, setResults)

  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setSearch(newValue);
    searchSubject.next(newValue)
  }

  return (
    <div style={divStyle}>
      <input
        type="text"
        placeholder='Search'
        value={search}
        onChange={handleSearchChange}
        style={inputStyle}
      />
      {results?.map(({ name }) => <li style={liStyle} key={name}>{name}</li>)}
    </div>
  )
}


export default App
