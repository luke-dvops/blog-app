import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, queryByText } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // Import userEvent
import { BrowserRouter as Router } from 'react-router-dom'
import Login from '../pages/Login';
import Register from '../pages/Register'; // Import your Register component
import { UserContext } from '../context/UserContext'; // Mock UserContext
import axios from 'axios';
import {useNavigate } from 'react-router-dom';
import Menu from '../components/Menu'; 
import { createMemoryHistory } from 'history';

jest.mock('axios');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  default: {
    Consumer: ({ children }) => children({ user: null, setUser: () => {} }), // Mock Consumer
    Provider: ({ children }) => children, // Mock Provider
  },
}));

beforeAll(async () => {
  jest.setTimeout(10000);

});


jest.mock('axios'); // Mock axios post method
//Login
describe('Testing Login UI', () => {

  test('should load the "Blog Market" title in the Login page', () => {
    render(
      <Router> {/* Wrap the Login component with BrowserRouter */}
        <Login />
      </Router>
    );

    // Use a custom text matcher to make the search more flexible
    const pageTitle = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'a' && content.includes('Blog Market');
    });

    expect(pageTitle).toBeInTheDocument();
  });


  test('should load the "Register" button in the Login page', async () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    // Use getAllByText to find all elements with the text "Register"
    const registerBtns = screen.getAllByText((content, element) => {
      return element.tagName.toLowerCase() === 'a' && content.includes('Register');
    });

    // Check if any of the elements meet the criteria
    expect(registerBtns.length).toBeGreaterThan(0);
  });



  test('should navigate to the Register page when the user taps on the "Register" button from the Login page', async () => {
    // Render the Login component wrapped with BrowserRouter
    render(
      <Router>
        <Login />
      </Router>
    );

    // Find all elements with the text "Register"
    const registerButtons = screen.queryAllByText('Register');

    // Select the appropriate Register button based on your UI
    // For example, if you want to select the first one:
    const registerButton = registerButtons[0];

    // Simulate a click event on the Register button
    fireEvent.click(registerButton);

    // Assert that the page navigated to the Register route
    expect(window.location.pathname).toBe('/register');
  });


  test('should load "Log in to your account" in the Login page', () => {
    // Render the Login component wrapped with BrowserRouter
    render(
      <Router>
        <Login />
      </Router>
    );

    // Find the element containing the login title
    const loginTitleElement = screen.getByText('Log in to your account');

    // Assert that the login title is present in the document
    expect(loginTitleElement).toBeInTheDocument();
  });


  test('should load "Enter your email" placeholder text in the Login page', () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    // Find the input element by its type and assert the placeholder text
    const emailInput = screen.getByPlaceholderText('Enter your email');
    expect(emailInput).toBeInTheDocument();
  });


  test('should load "Enter your password" placeholder text in the Login page', () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    // Find the input element by its type and assert the placeholder text
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    expect(passwordInput).toBeInTheDocument();
  });



  test('should handle login and navigate to home', async () => {
    // Mock setUser function
    const setUserMock = jest.fn();

    // Mock UserContext value
    const mockUserContextValue = { setUser: setUserMock };

    // Render the Login component with mocked context value and Router
    const { getByPlaceholderText, getByText } = render(
      <Router>
        <UserContext.Provider value={mockUserContextValue}>
          <Login />
        </UserContext.Provider>
      </Router>
    );

    // Mock user credentials
    const email = 'test@example.com';
    const password = 'password123';

    // Simulate user input
    fireEvent.change(getByPlaceholderText('Enter your email'), { target: { value: email } });
    fireEvent.change(getByPlaceholderText('Enter your password'), { target: { value: password } });

    // Mock successful login response
    const mockResponse = {
      data: {
        _id: '65b3514e73962f9d8e6fc501',
        email: 'test@example.com',
        password: '$2b$10$TYCXFN.Kp1U4JnoWs9k/3O9P6Ug.uYU7zZDqkXurZ6WGHacbhdSFK',
        username: 'testuser',
      },
    };

    axios.post.mockResolvedValueOnce(mockResponse);

    // Click on login button
    fireEvent.click(getByText('Log in'));

    // Wait for the login process to complete
    await waitFor(() => {
      // Assert that setUser is called with the correct data
      expect(setUserMock).toHaveBeenCalledWith(mockResponse.data);
    });
  });



  test('should display an error message when no username and password or both are provided', async () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    // Find the login button and click it
    const loginButton = screen.getByRole('button', { name: /Log in/i });
    fireEvent.click(loginButton);

    // Find the error message element and assert its content
    const errorMessage = await screen.findByText(/Something went wrong, please enter correct email & password/i);
    expect(errorMessage).toBeInTheDocument();
  });



  test('should display an error message when incorrect email or password is provided', async () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    // Find the email input field by its type and enter an incorrect email
    const emailInput = screen.getByRole('textbox', { type: 'email' });
    userEvent.type(emailInput, 'incorrectemail@example.com');

    // Find the password input field by its type and enter an incorrect password
    const passwordInput = screen.getByRole('textbox', { type: 'password' });
    userEvent.type(passwordInput, 'incorrectpassword');

    // Mock axios post request to simulate unsuccessful login attempt
    axios.post.mockRejectedValueOnce(new Error('Invalid credentials'));

    // Find the login button and click it
    const loginButton = screen.getByRole('button', { name: 'Log in' });
    userEvent.click(loginButton);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Something went wrong, please enter correct email & password')).toBeInTheDocument();
    });
  });
});





// Register 
describe('Testing Register UI', () => {


  beforeAll(async () => {
    jest.setTimeout(10000);

  });

  test('should load "Blog Market" title the Register page', async () => {
    render(
      <Router>
        <Register />
      </Router>
    );


    // Find the page title element and assert its text content
    const pageTitle = screen.getByRole('heading', { name: 'Blog Market' });
    expect(pageTitle).toBeInTheDocument();
  });





  test('should load "Create an account" in the Register page', async () => {
    render(
      <Router>
        <Register />
      </Router>
    ); // Render the Register component

    // Find the label element containing the text "Create an account"
    const registerLabel = screen.getByText('Create an account');
    expect(registerLabel).toBeInTheDocument();
  });


  test('should load the "Login" button in the Register page', async () => {
    render(
      <Router>
        <Register/>
      </Router>
    );

    // Use getAllByText to find all elements with the text "Login"
    const loginBtns = screen.getAllByText((content, element) => {
      return element.tagName.toLowerCase() === 'a' && content.includes('Login');
    });

    // Check if any of the elements meet the criteria
    expect(loginBtns.length).toBeGreaterThan(0);
  });

  
test('should navigate to the Login page when the user taps on the "Login" button from the Register page', async () => {
  render(
    <Router>
      <Register />
    </Router>
  );

  // Use queryAllByText to find all elements containing the text "Login"
  const loginButtons = screen.queryAllByText('Login');

  // Check if any of the elements meet the criteria
  expect(loginButtons.length).toBeGreaterThan(0);

  // Click on the first "Login" button found
  fireEvent.click(loginButtons[0]);

  // Check if the current URL matches the Login page URL
  expect(window.location.pathname).toBe('/login');
});


 
test('should load "Enter your username" placeholder text in the Register page', async () => {
  render(
    <Router>
      <Register />
    </Router>
  );

  // Find the input element by its placeholder text
  const usernameInput = screen.getByPlaceholderText('Enter your username');

  // Check if the placeholder text matches
  expect(usernameInput).toBeInTheDocument();
});

  
test('should load "Enter your email" placeholder text in the Register page', async () => {
  render(
    <Router>
      <Register />
    </Router>
  );

  // Find the input element by its placeholder text
  const emailInput = screen.getByPlaceholderText('Enter your email');

  // Check if the placeholder text matches
  expect(emailInput).toBeInTheDocument();
});

test('should load "Enter your password" placeholder text in the Register page', async () => {
  render(
    <Router>
      <Register />
    </Router>
  );

  // Find the input element by its placeholder text
  const passwordInput = screen.getByPlaceholderText('Enter your password');

  // Check if the placeholder text matches
  expect(passwordInput).toBeInTheDocument();
});


test('should register a new user successfully and navigate to login page', async () => {
   // Mock useNavigate
   const mockNavigate = jest.fn();
   useNavigate.mockReturnValue(mockNavigate);
  
  // Render the Register component
  const { getByPlaceholderText, getByRole } = render(
    <Router>
      <Register />
    </Router>
  );

  // Mock user credentials
  const username = 'uniqueusername';
  const email = 'test@example.com';
  const password = 'password123';

  // Simulate user input
  fireEvent.change(getByPlaceholderText('Enter your username'), { target: { value: username } });
  fireEvent.change(getByPlaceholderText('Enter your email'), { target: { value: email } });
  fireEvent.change(getByPlaceholderText('Enter your password'), { target: { value: password } });

  // Mock successful registration response
  const mockResponse = {
    data: {
      _id: '65b507a3ed6055b91f0e3d02',
      username: 'uniqueusername',
      email: 'testuser@example.com',
      password: 'testpassword',
    },
  };

  // Mock axios requests
  axios.get.mockResolvedValueOnce({ data: { exists: false } }); // Mock username check
  axios.get.mockResolvedValueOnce({ data: { exists: false } }); // Mock email check
  axios.post.mockResolvedValueOnce(mockResponse); // Mock registration

  const registerButton = getByRole('button', { name: 'Register' });

  // Submit the form
  fireEvent.click(registerButton);

  // Wait for the registration process to complete
  await waitFor(() => {
    // Assert that the component navigates to the login page after successful registration
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
 
test('should display an error message for unsuccessful registration', async () => {
  render(
    <Router>
      <Register />
    </Router>
  );

  // Find the register button
  const registerButton = screen.getByRole('button', { name: 'Register' });

  // Click on the register button without providing any information
  userEvent.click(registerButton);

  // Assuming there is an error message element on the page
  const errorMessage = await screen.findByText('please enter correct username, email, & password');
  expect(errorMessage).toBeInTheDocument();
});
test('should display an error message for unsuccessful registration with existing username', async () => {
  // Mock axios to return existing username response for check-username
  axios.get.mockResolvedValueOnce({ data: { exists: true } });

  // Render the Register component within a Router
  const { getByPlaceholderText, getByRole, findByText } = render(
      <Router>
          <Register />
      </Router>
  );

  // Simulate user input
  fireEvent.change(getByPlaceholderText('Enter your username'), { target: { value: 'existingusername' } });
  fireEvent.change(getByPlaceholderText('Enter your email'), { target: { value: 'newuser@example.com' } });
  fireEvent.change(getByPlaceholderText('Enter your password'), { target: { value: 'newpassword' } });

  // Click the register button
  fireEvent.click(getByRole('button', { name: 'Register' }));

  // Wait for the error message related to username to appear
  const errorMessage = await findByText(/Username is already in use, please choose a new username./i); // Using a case-insensitive regex matcher
  expect(errorMessage).toBeInTheDocument();
});
  


  test('should display an error message for unsuccessful registration with existing email', async () => {
    // Mock axios to return existing email response for check-email
    axios.get.mockResolvedValueOnce({ data: { exists: false } });

    // Mock axios to return non-existing username response for check-username
    axios.get.mockResolvedValueOnce({ data: { exists: true } });

    // Render the Register component within a Router
    const { getByPlaceholderText, getByRole, findByText } = render(
        <Router>
            <Register />
        </Router>
    );

    // Simulate user input
    fireEvent.change(getByPlaceholderText('Enter your username'), { target: { value: 'luk333' } });
    fireEvent.change(getByPlaceholderText('Enter your email'), { target: { value: 'testuser@example.com' } });
    fireEvent.change(getByPlaceholderText('Enter your password'), { target: { value: 'anotherpassword' } });

    // Click the register button
    fireEvent.click(getByRole('button', { name: 'Register' }));

    // Wait for the error message related to email to appear
    const errorMessage = await findByText(/Email is already in use\. Please use a different email address\./i); // Using a case-insensitive regex matcher
    expect(errorMessage).toBeInTheDocument();
});
  
test('should load "Already have an account?" prompt text in the Register page', () => {
  render(
    <Router>
      <Register />
    </Router>
  );

  // Find the element containing the prompt text
  const promptText = screen.getByText('Already have an account?');

  // Assert that the prompt text is present
  expect(promptText).toBeInTheDocument();
});


});





//Logout


describe('Menu component', () => {
  test('should logout and navigate to login page', async () => {
    // Mock setUser function
    const setUser = jest.fn();

    // Mock useNavigate function
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    // Mock UserContext value
    const user = { id: '123', username: 'testuser' };

    // Render the Menu component
    const { getByTestId } = render(
      <Router>
        <UserContext.Provider value={{ user, setUser }}>
          <Menu />
        </UserContext.Provider>
      </Router>
    );
    
    // Simulate clicking on the Logout button
    fireEvent.click(getByTestId('logout-trigger'));
    
    // Wait for logout to complete
    await waitFor(() => {
   
    
      // Assert navigate is called with "/login"
      expect(mockNavigate).toHaveBeenCalledWith('/login');
         // Assert setUser is called with null
         expect(setUser).toHaveBeenCalledWith(null);
    });

  
  });


  test('should not logout and not navigate to login page if logout fails', async () => {
    // Mock setUser function
    const setUser = jest.fn();

    // Mock UserContext value
    const user = { id: '123', username: 'testuser' };

     // Mock console.log
     console.log = jest.fn();
     
    // Render the Menu component
    const { getByTestId } = render(
      <Router>
        <UserContext.Provider value={{ user, setUser }}>
          <Menu />
        </UserContext.Provider>
      </Router>
    );

    // Mock the axios get method to simulate a failed logout
    axios.get.mockRejectedValue(new Error('Logout failed'));

    // Simulate clicking on the Logout button
    fireEvent.click(getByTestId('logout-trigger'));

    // Wait for logout to complete
    await waitFor(() => {
      // Assert setUser is not called
      expect(setUser).not.toHaveBeenCalled();

      // Assert console.log is called with the error message
      expect(console.log).toHaveBeenCalledWith(expect.any(Error))
    });
  });

});


afterAll(async () => {
  jest.setTimeout(() => {
    console.log("Terminating the test suite.");
    process.exit();
  }, 2000);
});