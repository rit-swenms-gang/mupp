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
import { Link } from 'react-router';


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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleFormModal = () => setformModal(!formModal);

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

  const [groupings, setGroupings] = useState<Record<string, any>>({});
  const fetchGroupings = async (formId: string) => {
    try {
      const cookies = getCookies();
      const res = await fetch(`${serverUrl}groupings/${formId}`, {
        method: 'GET',
        headers: {
          'Session-Key': cookies.session || ''
        }
      });
  
      if (res.ok) {
        const data = await res.json();
        setGroupings(prev => ({ ...prev, [formId]: data }));
      } else {
        console.error('Failed to fetch groupings:', await res.json());
      }
    } catch (err) {
      console.error('Error fetching groupings:', err);
    }
  };

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
            id: form.id,
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

  const [responses, setResponses] = useState<Record<string, any[]>>({});
  const fetchResponses = async (formId: string) => {
    try {
      const cookies = getCookies();
      const res = await fetch(`${serverUrl}responses/${formId}`, {
        method: 'GET',
        headers: {
          'Session-Key': cookies.session || ''
        }
      });
  
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched groupings for", formId, data);
        setResponses(prev => ({ ...prev, [formId]: data }));
      } else {
        console.error('Failed to fetch responses:', await res.json());
      }
    } catch (err) {
      console.error('Error fetching responses:', err);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);
  /////////////////////////

  function openEditForm(formId: unknown) {
    setformModal(true);
    if(formId == null) {
      
    }
  }

  async function deleteForm(formId: unknown) {
    try {
      const cookies = getCookies();
      const res = await fetch(`${serverUrl}form/${formId}`, {
        method: 'DELETE',
        headers: {
          'Session-Key': cookies.session || ''
        }
      });
  
      if (res.ok) {
        setForms(forms.filter(f => String(f.id) !== String(formId)));
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err) {
      console.error('Error deleting form:', err);
      alert('Network error while deleting form.');
    }
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
    <Card key={`${form.id}`} className="mb-4 shadow-sm mx-auto" style={{ maxWidth: '700px' }}>
      <CardBody>
        <h5 className="fw-bold text-center">Form {i + 1}</h5>
        <p className="text-muted text-center mb-1">{form.category}</p>
        <p className="text-center">{form.summary}</p>
        <div className="text-center mb-2">
          <Link
            to={`/form/${form.id}`}
            className="text-decoration-none text-primary"
          >
            Shareable Link →
          </Link>
        </div>
        <div className="text-center">
          <Button
            color="danger"
            size="sm"
            onClick={() => deleteForm(form.id)}
          >
            Delete Form
          </Button>
          <Button
            color="info"
            size="sm"
            className="ms-2"
            onClick={() => fetchResponses(String(form.id))}
          >
            Show Responses
          </Button>
          {groupings[String(form.id)] && (() => {
            const groupingsData = groupings[String(form.id)];
            const leaders = [];
            const participants = [];
  
            for (const [name, schedule] of Object.entries(groupingsData)) {
              if (Array.isArray(schedule[0])) {
                leaders.push({ name, schedule });
              } else {
                participants.push({ name, schedule });
              }
            }
  
            return (
              <div className="mt-3 text-start">
                <strong>Generated Groups:</strong>
  
                <h6 className="mt-3">Leaders:</h6>
                <ul className="list-unstyled">
                  {leaders.map(({ name, schedule }) => (
                    <li key={name} className="mb-3">
                      <strong>{name}</strong>
                      <ul className="ps-3">
                        {schedule.map((roundGroup, idx) => (
                          <li key={idx}>
                            Round {idx + 1}: {roundGroup.join(', ')}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
  
                <h6 className="mt-4">Participants:</h6>
                <ul className="list-unstyled">
                  {participants.map(({ name, schedule }) => (
                    <li key={name} className="mb-3">
                      <strong>{name}</strong>
                      <ul className="ps-3">
                        {schedule.map((leaderName, idx) => (
                          <li key={idx}>
                            {idx === 0 ? "Group leader order" : `Round ${idx + 1}`}: {leaderName || "—"}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
          <Button
            color="success"
            size="sm"
            className="ms-2"
            onClick={() => fetchGroupings(String(form.id))}
          >
            Generate Groupings
          </Button>
        </div>
  
        {responses[String(form.id)] && (
          <div className="mt-3 text-start">
            <strong>Responses:</strong>
            <ul className="list-unstyled">
              {responses[String(form.id)].map((resp, idx) => (
                <li key={idx} className="mb-3 p-2 border rounded">
                  {Object.entries(resp).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        )}
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
    <Authenticator onLogIn={() => setIsLoggedIn(true)} onLogOut={() => setIsLoggedIn(false)}>
      <div className="d-flex">
        <Container className="py-5">
          <h1 className="text-center display-4 mb-4">Multi-User Party Planner</h1>

          <Card className="mb-4 shadow-sm mx-auto" style={{ maxWidth: '800px' }}>
            <CardBody>
              <p className="lead mb-1 text-center">
                Plan your next event by splitting your participants into the right groups.
              </p>
            </CardBody>
          </Card>

          <h2 className="h4 text-center flex-column mt-5 mb-4">Project Groups</h2>
          <div className="d-flex flex-column align-items-center">{groupBoxes}</div>

          <h2 className="h4 text-center mt-5 mb-4">Created Forms</h2>
          <div className="d-flex flex-column align-items-center">
          {forms.length > 0 ? formList : (
            <Card body className="text-center text-muted">No forms created yet.</Card>
          )}
          </div>

          <div className="text-center mt-4">
            <Button color="primary" size="lg" onClick={openEditForm}>
              Create New Form
            </Button>
          </div>
        </Container>

        <Modal isOpen={formModal} toggle={toggleFormModal}>
          <ModalHeader toggle={toggleFormModal}>Edit Form</ModalHeader>
          <ModalBody>
            <FormBuilderPage onFormSaved={fetchForms}/>
          </ModalBody>
        </Modal>
      </div>
    </Authenticator>
  );
}

export default App
