import { useState } from "react"
import { Col, Nav, Row, TabContent, TabPane } from "reactstrap"
import NavTab from "../NavTab/NavTab";


export default function LoginSignup() {
  const [activeTab, setActiveTab] = useState(1);

  const changeTab = (tabId: number) => {
    if(tabId === activeTab)
      return;

    setActiveTab(tabId);
  }

  return <>
  <Nav tabs>
    <NavTab
      id={1}
      activeId={activeTab}
      onClick={() => changeTab(1)}
      label='Log In' />
    <NavTab
      id={2}
      activeId={activeTab}
      onClick={() => changeTab(2)}
      label='Register' />
  </Nav>
  <TabContent activeTab={activeTab}>
    <TabPane tabId={1}>
      <Row>
        <Col sm="12">
          <h4>
            Tab 1 Contents
          </h4>
        </Col>
      </Row>
    </TabPane>
    <TabPane tabId={2}>
      <Row>
        <Col sm="12">
          <h4>
            Tab 2 Contents
          </h4>
        </Col>
      </Row>
    </TabPane>
  </TabContent>
  </>
}