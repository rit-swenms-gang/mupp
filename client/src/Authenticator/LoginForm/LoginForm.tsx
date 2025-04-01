import { Button, Card, CardHeader, Form, FormGroup, Input, Label } from 'reactstrap'

export default function LoginForm() {

  // TODO: 
  // - verify that email is valid
  // - send info to backend and get session key
  return (
    <Card>
      <CardHeader tag='h2'>Welcome Back</CardHeader>
      <Form onSubmit={() => alert(`Log in account`)}>
        <FormGroup floating>
          <Input
            id='email'
            name='email'
            placeholder='Email@example.com'
            type='email'
          />
          <Label for='email'>
            Email
          </Label>
        </FormGroup>
        <FormGroup floating>
          <Input
            id='password'
            name='password'
            placeholder='Password'
            type='password'
          />
          <Label for='password'>
            Password
          </Label>
        </FormGroup>
        <Button
          block
          type='submit'
        >
          Log In
        </Button>
      </Form>
    </Card>
  );
}