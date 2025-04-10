import { useState } from "react"
import { Nav, TabContent, TabPane } from "reactstrap"
import NavTab from "../NavTab/NavTab";
import AuthForm from "./AuthForm/AuthForm";


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
      {/* Sign In Form */}
      <AuthForm 
        heading="Welcome Back"
        submitLabel="Sign In"
        formFields={
          [
            {
              name: "sign-in-username",
              label: "Username"
            },
            {
              name: "sign-in-password",
              label: "Password",
              type: 'password'
            }
          ]
        }
      />
    </TabPane>
    <TabPane tabId={2}>
      {/* Create Account Form */}
      <AuthForm 
        heading="Create an Account"
        submitLabel="Create Account"
        formFields={
          [
            {
              name: "sign-up-username",
              label: "Username"
            },
            {
              name: "sign-up-email",
              label: "Email",
              type: 'email'
            },
            {
              name: "sign-up-password",
              label: "Password",
              type:'password'
            },
            {
              name: "sign-up-confirm-password",
              label: "Password",
              type:'password'
            }
          ]
        }
      />
    </TabPane>
  </TabContent>
  </>
}