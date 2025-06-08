import LoginForm from "@components/features/auth/login";
import Container from "@components/ui/container";

const Login = () => {
  return (
    <Container keyboardAware>
      <LoginForm />
    </Container>
  );
};

export default Login;
