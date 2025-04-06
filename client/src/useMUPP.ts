import { useEffect } from "react"

export function useMUPP(endpoint: string, update: CallableFunction, req_body: BodyInit | null = null ) {

  useEffect(() => {
      const ac = new AbortController()
  
      fetch(`http://localhost:5001${endpoint}`, {
        signal: ac.signal,
        body: req_body,
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          // if (!res.ok) return 'Failed to get response'
          return res.json() 
        })
        .then((data: unknown) => update(data))
        .catch(e => {
          console.error(e)
          update('Something broke')
        })
  
      return () => ac.abort()
    }, [endpoint, update, req_body])
}