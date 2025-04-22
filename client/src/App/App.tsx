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
        const res = await fetch(serverUrl + 'forms', {
          method: 'GET',
          headers: {
            'Session-Key': cookies.session || ''
          }
        });
  
        if (res.ok) {
          const result = await res.json();
          const forms = result.rows || result;
  
          const loadedForms = forms.map((form: any, index: number) => {
            let parsedStructure;
            try {
              parsedStructure = typeof form.form_structure === 'string'
                ? JSON.parse(form.form_structure)
                : form.form_structure;
            } catch (e) {
              console.error('Failed to parse form_structure:', form.form_structure);
              parsedStructure = { entities: {} };
            }
          
            return {
              id: form.id, // <-- Add this line to fix the Shareable Link
              name: `Form ${index + 1}`,
              category: "Created Forms",
              summary: Object.values(parsedStructure.entities)
                .map((e: any) => e.attributes?.label || 'Unnamed')
                .join(', ')
            };
          });
  
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

  const formList = forms.map((form, i) => (
    <Card key={i} className="mb-4 shadow-sm mx-auto" style={{ maxWidth: '700px' }}>
      <CardBody>
        <h5 className="fw-bold text-center">Form {i + 1}</h5>
        <p className="text-muted text-center mb-1">{form.category}</p>
        <p className="text-center">{form.summary}</p>
        <div className="text-center">
          <a
            href={`http://localhost:5001/form/${form.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none text-primary"
          >
            Shareable Link →
          </a>
        </div>
      </CardBody>
    </Card>
  ));

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
      <div className="d-flex flex-column">
        {/* Top bar */}
        <div className="bg-dark text-white py-2 px-4 d-flex justify-content-between align-items-center">
          <span className="fw-semibold fs-5">MUPP Dashboard</span>
          <Button
            color="light"
            size="sm"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Sign Out
          </Button>
        </div>
  
        {/* Main content */}
        <Container className="py-5">
          <h1 className="text-center display-4 mb-4">Multi-User Project Planner</h1>
  
          <Card className="mb-4 shadow-sm mx-auto" style={{ maxWidth: '800px' }}>
            <CardBody>
              <p className="lead mb-1 text-center">
                Plan your next event by splitting your participants into the right groups.
              </p>
              <p className="text-center">
                Communication with port <code>5001</code> server: <strong>{serverText}</strong>
              </p>
            </CardBody>
          </Card>
  
          <h2 className="h4 text-center mt-5 mb-4">Project Groups</h2>
          <div className="d-flex flex-column align-items-center">{groupBoxes}</div>
  
          <h2 className="h4 text-center mt-5 mb-4">Created Forms</h2>
          <div className="d-flex flex-column align-items-center">
            {forms.length > 0 ? (
              forms.map((form, i) => (
                <Card key={i} className="mb-4 shadow-sm mx-auto" style={{ maxWidth: '700px' }}>
                  <CardBody>
                    <h5 className="fw-bold text-center">Form {i + 1}</h5>
                    <p className="text-muted text-center mb-1">{form.category}</p>
                    <p className="text-center">{form.summary}</p>
                    <div className="text-center">
                      <a
                        href={`http://localhost:5001/form/${form.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none text-primary"
                      >
                        Shareable Link →
                      </a>
                    </div>
                  </CardBody>
                </Card>
              ))
            ) : (
              <Card body className="text-center text-muted">No forms created yet.</Card>
            )}
          </div>
  
          <div className="text-center mt-4">
            <Button color="primary" size="lg" onClick={openEditForm}>
              Create New Form
            </Button>
          </div>
        </Container>
  
        {/* Form modal */}
        <Modal isOpen={formModal} toggle={toggleFormModal}>
          <ModalHeader toggle={toggleFormModal}>Edit Form</ModalHeader>
          <ModalBody>
            <FormBuilderPage />
          </ModalBody>
        </Modal>
      </div>
    </Authenticator>
  );
}

export default App
