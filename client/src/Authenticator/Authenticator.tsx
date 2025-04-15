import { useEffect, useState } from "react"
import { Button, Card, CardHeader, Nav, NavItem, TabContent, TabPane } from "reactstrap"
import NavTab from "../NavTab/NavTab";
import AuthForm from "./AuthForm/AuthForm";
import { handleSignIn, handleSignUp } from "../services/authService";

interface AuthenticatorProps {
  signOut: () => Promise<void>;
  children?: React.ReactNode;
}

export default function Authenticator({ signOut, children }: AuthenticatorProps) {
  const [activeTab, setActiveTab] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if(isAuthenticated === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  /**
  * Changes the active tab in the authentication UI.
  * @param tabId The ID of the tab to switch to.
  */
  const changeTab = (tabId: number) => {
    if (tabId === activeTab)
      return;

    setActiveTab(tabId);
  }

  const handleSuccessfulSignIn = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
  }

  const handleSuccessfulSignOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  }

  // render content based on authentication status
  // if user is authenticated, show sign out button and children components
  if (isAuthenticated) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 vw-100">
        <Nav className='navbar w-100 p-4 bg-secondary'>
          <NavItem className="ms-auto">
            <Button onClick={() =>
              signOut().then(handleSuccessfulSignOut)}
              color="secondary">
              Sign Out
            </Button>
          </NavItem>
        </Nav>
        <div className="flex-grow-1 d-flex flex-column">{ children } </div>
      </div>
    );
  }

  // if user is not authenticated, show sign in and sign up forms
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 vw-100">
    <Card className="w-50">
      <CardHeader className="p-2 m-2" tag='h2'>Welcome to MUPP</CardHeader>

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
            onSubmit={(formData) => {
              handleSignIn(formData).then(handleSuccessfulSignIn);
            }}
            formFields={
              [
                {
                  name: "sign-in-email",
                  label: "Email",
                  type: 'email',
                  required: true
                },
                {
                  name: "sign-in-password",
                  label: "Password",
                  type: 'password',
                  required: true
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
            onSubmit={(formData) => {
              handleSignUp(formData).then(handleSuccessfulSignIn);
            }}
            validate={(data) => {
              const errors: Record<string, string> = {};
          
              const password = data.get("sign-up-password")?.toString();
              const confirmPassword = data.get("sign-up-confirm-password")?.toString();
          
              if (password !== confirmPassword) {
                errors["sign-up-confirm-password"] = "Passwords do not match.";
              }
          
              return errors;
            }}
            formFields={
              [
                {
                  name: "sign-up-username",
                  label: "Username",
                  required: true
                },
                {
                  name: "sign-up-email",
                  label: "Email",
                  type: 'email',
                  required: true
                },
                {
                  name: "sign-up-password",
                  label: "Password",
                  type: 'password',
                  required: true
                },
                {
                  name: "sign-up-confirm-password",
                  label: "Confirm Password",
                  type: 'password',
                  required: true
                }
              ]
            }
          />
        </TabPane>
      </TabContent>
    </Card>
    </div>
  );
}