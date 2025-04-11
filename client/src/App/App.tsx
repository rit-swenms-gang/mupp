import { useState, useEffect } from 'react'
import './App.css'
import { Col, Container, Row, Collapse, Button,
        Card, CardBody, CardTitle, CardSubtitle, CardText,
        } from 'reactstrap';
import GroupBox from './Dashboard/GroupBox';

function App() {
  const [serverText, setServerText] = useState('yet to access server');
  const [groups, setGroups] = useState([{}]);

  useEffect(() => {setGroups(
    [
      {
        name: "The MUPPets",
        category: "SWEN-732 Project Groups",
        description: "We are the team behind the Multi-User Party Planner, a.k.a. \"M.U.P.P\"!",
        members: ["Shahmir Khan", "Christian Ashley", "JoJo Kaler", "Andrew Bradbury", "Tyler Jaafari"]
      }
    ]
  ); }, []);

  const [loginFormOpen, setLoginFormOpen] = useState(false);
  const toggleLoginForm = () => setLoginFormOpen(!loginFormOpen);

  const groupBoxes = groups.map(group => 
    <Row>
      <GroupBox
        name={group.name}
        category={group.category}
        description={group.description}
        members={group.members}/>
    </Row>
  );

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
          <h1>Multi-User Project Planner</h1>
          <Col>
            <Card>
              <CardBody>
                <p>
                  Plan your next event by splitting your participants into the right groups.
                </p>
                <p>
                  Edit <code>src/App.tsx</code> and save to test HMR
                </p>
                <p>
                  Communication with port <code>5001</code> server: {serverText}
                </p>
              </CardBody>
            </Card>
          </Col>
          <Col>
            <Button color="primary" onClick={toggleLoginForm}>
              Login
            </Button>
            <Collapse isOpen={loginFormOpen}>
              <Card>
                <CardBody>
                  This is the placeholder for the log in form
                </CardBody>
              </Card>
            </Collapse>
          </Col>
        </Row>
        
      </Container>
      
      
    </>
  )
}

export default App
