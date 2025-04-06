import { useState } from 'react'
import { useMUPP } from '../useMUPP';
import './App.css'
import { Col, Container, Row } from 'reactstrap';

function App() {
  const [endpoint, setEndpoint] = useState('/')
  const [serverText, setServerText] = useState('yet to access server');
  useMUPP(endpoint, (data: object) => {
    setServerText(JSON.stringify(data))
  })

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
      <button onClick={e => {
        e.preventDefault()
        setEndpoint('/forms/000b16eb-9909-41b5-a138-2138f548fc65')
      }}></button>
      
    </>
  )
}

export default App
