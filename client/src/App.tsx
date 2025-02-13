import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [serverText, setServerText] = useState('yet to access server');

  useEffect(() => {
    const ac = new AbortController()
    setServerText('Calling server')

    fetch('http://localhost:5001', {
      signal: ac.signal
    })
      .then(res => {
        if (!res.ok) return 'Failed to get response'
        return res.json() 
      })
      .then(text => setServerText(JSON.stringify(text)))
      .catch(e => {
        console.error(e)
        setServerText('Something broke')
      })

    return () => ac.abort()
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <p>
          Communication with port <code>5001</code> server: {serverText}
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
