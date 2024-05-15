import React, { Component } from 'react';
import './App.css';
import Calendar2 from "./components/Calendar2.js";
import Login from "./components/login.js"; // Make sure the file name matches exactly, including case sensitivity

class App extends Component {
  constructor(props) {
    super(props);
    // Initialize state directly from localStorage to maintain state across sessions
    this.state = {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'false'
    };
  }

  componentDidMount() {
    // Add event listener for storage changes
    window.addEventListener('storage', this.syncLogout);
  }

  componentWillUnmount() {
    // Remove event listener for storage changes
    window.removeEventListener('storage', this.syncLogout);
  }

  syncLogout = (event) => {
    // Sync logout across tabs when local storage is cleared
    if (event.key === 'logout') {
      console.log('Logged out from storage!');
      this.setState({ isAuthenticated: false });
    }
  }

  handleLoginSuccess = () => {
    localStorage.setItem('isAuthenticated', 'true');
    this.setState({ isAuthenticated: true });
  };

  handleLogout = () => {
    // Use a specific key for logout to coordinate across tabs
    localStorage.removeItem('isAuthenticated');
    localStorage.setItem('logout', Date.now()); // for syncing logout across tabs
    this.setState({ isAuthenticated: false });
  };

  render() {
    return (
      <div className="App">
        <h1>Calendar Scheduler App</h1>
        <button onClick={this.handleLogout} style={{ position: 'absolute', right: 10, top: 10 }}>
          Logout
        </button>
        {this.state.isAuthenticated ? (
          <Calendar2 isAuthenticated={this.state.isAuthenticated} onLogout={this.handleLogout} />
        ) : (
          <Login onLoginSuccess={this.handleLoginSuccess} />
        )}
      </div>
    );
  }
}

export default App;
