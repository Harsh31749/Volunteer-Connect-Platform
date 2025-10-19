const GoogleAuth = () => {
  const handleLogin = () => {
    // Redirect user to your backend auth route
    window.location.href = 'http://localhost:5000/auth/google';  // Adjust port if needed
  };

  return (
    <button
      onClick={handleLogin}
      style={{
        width: '100%',
        padding: '10px 0',
        border: '1px solid #ddd',
        borderRadius: '6px',
        backgroundColor: '#fff',
        fontWeight: 'bold',
        color: '#4285F4',
        cursor: 'pointer',
      }}
    >
      <i className="fab fa-google" style={{ marginRight: '8px' }}></i> Sign in with Google
    </button>
  );
};

export default GoogleAuth;
