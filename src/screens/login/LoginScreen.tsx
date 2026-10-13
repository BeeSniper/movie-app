import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function LoginScreen() {
  const { user, isLoading, logIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  if (isLoading || user) {
    return null;
  }

  function handleModeToggle() {
    setIsSignUp((prev) => !prev);
    setErrorMessage(null);
    setPassword('');
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setIsPending(true);

    try {
      const result = isSignUp
        ? await signUp(email, password)
        : await logIn(email, password);

      if (!result.ok) {
        setErrorMessage(result.message);
      } else {
        navigate('/');
      }
    } finally {
      setPassword('');
      setIsPending(false);
    }
  }

  return (
    <main className="login-screen">
      <div className="login-card">
        <h2>{isSignUp ? 'Sign up' : 'Log in'}</h2>

        {errorMessage && (
          <div className="auth-error-message" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
            />
          </div>

          <button
            type="submit"
            className="auth-submit-button"
            disabled={isPending}
          >
            {isPending
              ? isSignUp
                ? 'Signing up...'
                : 'Logging in...'
              : isSignUp
                ? 'Sign up'
                : 'Log in'}
          </button>
        </form>

        <div className="auth-switch-container">
          <button
            type="button"
            className="auth-switch-button"
            onClick={handleModeToggle}
          >
            {isSignUp
              ? 'Already have an account? Log in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </main>
  );
}
