import { useState, useEffect } from 'react'
import './App.css'
import { Col, Container, Row, Collapse, Button,
        Card, CardBody, CardTitle, CardSubtitle, CardText,
        } from 'reactstrap';
import GroupBox from './Dashboard/GroupBox';
import FormPreview, {FormPreviewProps} from './Dashboard/FormPreview';

interface Group {
  name: string;
	category: string;
	description: string;
	members: string [];
}

const serverUrl = 'http://localhost:5001/';

function App() {
  const [serverText, setServerText] = useState('yet to access server');
  const [groups, setGroups] = useState(Array<Group>);
  const [forms, setForms] = useState(Array<FormPreviewProps>);

  ////////// TODO: FETCH FROM SERVER //////////
  useEffect(() => {setGroups(
    [
      {
        name: "The MUPPets",
        category: "SWEN-732 Project Groups",
        description: "We are the team behind the Multi-User Party Planner, a.k.a. \"M.U.P.P.\"!",
        members: ["Shahmir Khan", "Christian Ashley", "JoJo Kaler", "Andrew Bradbury", "Tyler Jaafari"]
      }
    ]
  ); }, []);

  useEffect(() => {setForms(
    [
      {
        name: "Sample Form 1",
        category: "Sample Forms",
        summary: "A template form to help you get started!"
      }
    ]
  ); }, []);

  /////////////////////////////////////////////

  function printGroupMembers(memberList: string []) {
    let members = "";

    for(let i = 0; i < memberList.length; i++) {
      members += memberList[i];
      if(i < memberList.length - 1) {
        members += ", ";
      }
    }
    
    return members;
  }

  const groupBoxes = groups.map(group => 
    <Row>
      <GroupBox
        id={0}
        name={group.name}
        category={group.category}
        description={group.description}
        members={group.members}/>
    </Row>
  );

  const formList = forms.map(form =>
    <Row>
      <FormPreview
        name={form.name}
        category={form.category}
        summary={form.summary}/>
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
        <h1>Multi-User Project Planner</h1>
        <Row className='flex align'>
          <Col>
            <Card>
              <CardBody>
                <p>
                  Plan your next event by splitting your participants into the right groups.
                </p>
                <p>
                  Communication with port <code>5001</code> server: {serverText}
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            {groupBoxes}
          </Col>
          <Col>
            {formList}
          </Col>
        </Row>
        
      </Container>
    </>
  )
}

export default App
