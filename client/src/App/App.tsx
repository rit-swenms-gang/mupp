import { useState, useEffect } from 'react'
import './App.css'
import { Col, Container, Row } from 'reactstrap';

function App() {
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
      <Container>
        <Row className='flex align'>
          <Col>
            <h1>Welcome to MUPP: Multi-User Project Planner</h1>
            <div className='card'>
              <p>
                Plan your next event by splitting your participants into the right groups.
              </p>
              <p>
                Edit <code>src/App.tsx</code> and save to test HMR
              </p>
              <p>
                Communication with port <code>5001</code> server: {serverText}
              </p>
            </div>
          </Col>
          <Col>
            <div className='card'>
              <p>
                This is the placeholder for the log in form
              </p>
            </div>
          </Col>
        </Row>
      </Container>
      
      
    </>
  )
}

export default App
