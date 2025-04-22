import { useState, useEffect } from 'react'
import './App.css'
import { Col, Container, Row,
        Card, CardBody,
        Button,
        Modal,
        ModalHeader,
        ModalBody
        } from 'reactstrap';
import GroupBox from './Dashboard/GroupBox';
import FormPreview, {FormPreviewProps} from './Dashboard/FormPreview';
import EditDropdown from './Dashboard/EditDropdown';
import Authenticator from '../Authenticator/Authenticator';
import FormPage from '../forms/FormPage';
import { getCookies } from '../services/auth';
import FormBuilderPage from '../forms/FormBuilder';


interface Group {
  id: number
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
  const [formModal, setformModal] = useState(false);

  const toggleFormModal = () => setformModal(!formModal);

  ////////// TODO: FETCH FROM SERVER //////////

  useEffect(() => {setGroups(
    [
      {
        id: 0,
        name: "The MUPPets",
        category: "SWEN-732 Project Groups",
        description: "We are the team behind the Multi-User Party Planner, a.k.a. \"M.U.P.P.\"!",
        members: ["Shahmir Khan", "Christian Ashley", "JoJo Kaler", "Andrew Bradbury", "Tyler Jaafari"]
      }
    ]
  ); }, []);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const cookies = getCookies();
        //pass the session-key?
        const res = await fetch(serverUrl + 'forms', {
          method: 'GET',
          headers: {
            'Session-Key': cookies.session || '' 
          }
        });

        if(res.ok) {
          const data = await res.json();
          const loadedForms = data.map((form: any) => ({
            name: `Form ${form.id}`,
            category: "Created Forms",
            summary: Object.values(form.form_structure.entities).map((e: any) => e.attributes.label).join(', ')
          }));
          setForms(loadedForms);
        } else {
          console.error('Error: Failed to fetch forms from the server:', await res.json());
        }
      } catch (err) {
        console.error('Error: Failed to fetch forms from the server', err);
      }
    };
    fetchForms();
  }, []);

  /////////////////////////////////////////////

  function openEditForm(formId: unknown) {
    // TODO: open the edit form page/modal
    setformModal(true);
    if(formId == null) {
      
    }
  }

  function deleteForm(formId: unknown) {
    let newFormList = [];
    for(const f in forms) {
      if(forms[f].name != formId) {
        newFormList.push(forms[f]);
      }
    }
    setForms(newFormList);

    // TODO: delete the form on the server
    console.log(formId)
  }

  const groupBoxes = groups.map(group => 
    <Row key={group.id}>
      <GroupBox
        id={group.id}
        name={group.name}
        category={group.category}
        description={group.description}
        members={group.members}/>
    </Row>
  );

  const formList = forms.map((form, i) =>
    <Card key={i}>
      <Row>
        <Col>
          <FormPreview
            name={form.name}
            category={form.category}
            summary={form.summary}/>
        </Col>
        <Col>
          <EditDropdown formId={form.name} editAction={openEditForm} deleteAction={deleteForm}/>
        </Col>
      </Row>
    </Card>
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
    <Authenticator>
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
          <Row>
            <Col>
              {formList}
            </Col>
          </Row>
          <Row>
            <Button onClick={openEditForm}>Create New Form</Button>
          </Row>
        </Row>
        
      </Container>
      <Modal isOpen={formModal} toggle={toggleFormModal}>
        <ModalHeader toggle={toggleFormModal}>Edit Form</ModalHeader>
        <ModalBody>
          <FormBuilderPage />
          <FormPage toggleModal={toggleFormModal}/>
        </ModalBody>
      </Modal>
    </Authenticator>
  )
}

export default App
