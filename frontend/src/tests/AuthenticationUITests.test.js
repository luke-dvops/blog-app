import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // Import userEvent
import { BrowserRouter as Router } from 'react-router-dom'
import Login from '../pages/Login';
import Register from '../pages/Register'; // Import your Register component
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome.js');

const { Options } = chrome;

const chromeOptions = new Options();
chromeOptions.addArguments('--headless');

const appUrl = 'http://localhost:5173';
let driver;


beforeAll(async () => {
  jest.setTimeout(10000);
  driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
});

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

  test('should fill the Login form and submit successfully', () => {
    render(
      <Router>
        <Login />
      </Router>
    );


    // Find input fields and submit button, and simulate user interaction
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: 'Log in' });

    // Fill in the login form
    userEvent.type(emailInput, 'luketankl@gmail.com');
    userEvent.type(passwordInput, '123456');

    // Submit the form
    userEvent.click(submitButton);

    // Assert any necessary post-submit behavior
    // For example, you can assert that a certain element appears on the page after successful login
  });


  test('should log in a user successfully and navigate to the home page', () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    // Find input fields and submit button, and simulate user interaction
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: 'Log in' });

    // Fill in the login form
    userEvent.type(emailInput, 'luketankl@gmail.com');
    userEvent.type(passwordInput, '123456');

    // Submit the form
    userEvent.click(submitButton);

    // Wait for navigation to the home page (if asynchronous navigation is used)
    // You can wait for elements to be present or for the URL to change
    // For example:
    // await screen.findByText('Welcome, Luketankl!'); // Assuming this text appears on the home page

    // Assert any necessary post-submit behavior
    // For example, you can assert that a certain element appears on the page after successful login
  });

  test('should load "New here?" prompt text in the Login page', () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    // Find the element containing the "New here?" prompt text
    const newHereText = screen.getByText('New here?');

    // Assert that the element is present in the document
    expect(newHereText).toBeInTheDocument();
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
  let driver;

  beforeAll(async () => {
    jest.setTimeout(10000);
    driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
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
  render(
    <Router>
      <Register />
    </Router>
  );

  // Find input elements and button
  const usernameInput = screen.getByPlaceholderText('Enter your username');
  const emailInput = screen.getByPlaceholderText('Enter your email');
  const passwordInput = screen.getByPlaceholderText('Enter your password');
  const registerButton = screen.getByRole('button', { name: 'Register' });



  
    // Fill in the login form
    userEvent.type(usernameInput, 'uniqueusername');
    userEvent.type(emailInput, 'testuser@example.com');
    userEvent.type(passwordInput, 'testpassword');

    // Submit the form
      userEvent.click(registerButton);
  // Wait for navigation to login page
  await waitFor(() => {
    expect(window.location.pathname).toEqual('/login');
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

  it('should display an error message for unsuccessful registration with existing username', async function () {
    await driver.get(`${appUrl}/register`);

    // Try to register with the same username used in the previous test case
    await driver.findElement(By.css('input[type="text"]')).sendKeys('uniqueusername');
    await driver.findElement(By.css('input[type="email"]')).sendKeys('anotheruser@example.com');
    await driver.findElement(By.css('input[type="password"]')).sendKeys('anotherpassword');
    await driver.findElement(By.css('button')).click();

    // Assuming there is an error message element on the page
    const errorMessageLocator = By.css('.text-red-500.text-sm');
    await driver.wait(until.elementLocated(errorMessageLocator), 5000);

    // Retrieve and assert the error message
    const errorMessage = await driver.findElement(errorMessageLocator).getText();
    expect(errorMessage).toEqual('Username is already in use, please choose a new username.');
  });


  it('should display an error message for unsuccessful registration with existing email', async function () {
    await driver.get(`${appUrl}/register`);
    
    // Try to register with the same email used in the previous test case
    await driver.findElement(By.css('input[type="text"]')).sendKeys('anotheruniqueusername2');
    await driver.findElement(By.css('input[type="email"]')).sendKeys('testuser@example.com');
    await driver.findElement(By.css('input[type="password"]')).sendKeys('anotherpassword');
    await driver.findElement(By.css('button')).click();

    // Assuming there is an error message element on the page
    const errorMessageLocator = By.css('.text-red-500.text-sm');
    await driver.wait(until.elementLocated(errorMessageLocator), 5000);
    
    // Retrieve and assert the error message
    const errorMessage = await driver.findElement(errorMessageLocator).getText();
    expect(errorMessage).toEqual('Email is already in use. Please use a different email address.');
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


afterAll(async () => {
  await driver.quit();
  jest.setTimeout(() => {
    console.log("Terminating the test suite.");
    process.exit();
  }, 2000);
});


