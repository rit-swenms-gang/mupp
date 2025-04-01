import { useState } from "react"
import { Nav, TabContent, TabPane } from "reactstrap"
import NavTab from "../NavTab/NavTab";
import LoginForm from "./LoginForm/LoginForm";
import RegisterForm from "./RegisterForm/RegisterForm";


export default function Authenticator() {
  const [activeTab, setActiveTab] = useState(1);

  const changeTab = (tabId: number) => {
    if(tabId === activeTab)
      return;

    setActiveTab(tabId);
  }

  return <>
  <Nav justified tabs>
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
      <LoginForm />
    </TabPane>
    <TabPane tabId={2}>
      <RegisterForm />
    </TabPane>
  </TabContent>
  </>
}