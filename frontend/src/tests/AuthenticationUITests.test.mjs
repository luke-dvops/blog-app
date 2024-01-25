import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

const { Options } = chrome;

const chromeOptions = new Options();
chromeOptions.addArguments('--headless');

const appUrl = 'http://localhost:5173';
let driver;

//Login
describe('Testing Login UI', function () {
 

  before(async function () {
    this.timeout(10000);
    driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
  });


  it('should load the "Blog Market" title in the Login page', async function () {
    await driver.get(`${appUrl}/login`);
    const pageTitle = await driver.findElement(By.tagName('h1')).getText();
    expect(pageTitle).to.equal('Blog Market');
  });
  
  it('should load the Register button in the Login page', async function () {
    await driver.get(`${appUrl}/login`);
    const registerBtn = await driver.findElement(By.tagName('h3')).getText();
    expect(registerBtn).to.equal('Register');
  });


  
  it('should navigate to the Register page when the user taps on the "Register" button from the Login page', async function () {
    await driver.get(`${appUrl}/login`);

    // Find the element that represents the "Login" button
    const registerButton = await driver.findElement(By.linkText('Register'));

    // Click on the "Login" button
    await registerButton.click();

    // Wait for the page to load after navigation
    await driver.wait(until.urlIs(`${appUrl}/register`), 5000);

    // Check if the current URL matches the Login page URL
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.equal(`${appUrl}/register`);


  it('should load "Log in to your account"  in the Login page', async function () {
    await driver.get(`${appUrl}/login`);
    const loginTitle = await driver.findElement(By.tagName('label')).getText();
    expect(loginTitle).to.equal('Log in to your account');
  });


});


it('should load "Enter your email" placeholder text in the Login page', async function () {
  await driver.get(`${appUrl}/register`);
  const usernameInput = await driver.findElement(By.css('input[type="email"]'));
  const placeholderText = await usernameInput.getAttribute('placeholder');
  expect(placeholderText).to.equal('Enter your email');
});

it('should load "Enter your password" placeholder text in the Login page', async function () {
  await driver.get(`${appUrl}/register`);
  const usernameInput = await driver.findElement(By.css('input[type="password"]'));
  const placeholderText = await usernameInput.getAttribute('placeholder');
  expect(placeholderText).to.equal('Enter your password');
});

  it('should fill the Login form and submit successfully', async function () {
    await driver.get(`${appUrl}/login`);
    await driver.findElement(By.css('input[type="email"]')).sendKeys('luketan@gmail.com');
    await driver.findElement(By.css('input[type="password"]')).sendKeys('123456');
    await driver.findElement(By.css('button')).click();

    // Wait for the page to load after submission
    await driver.wait(until.urlIs(`${appUrl}/`), 5000);


  });


  it('should log in a user successfully and navigate to the home page', async function () {
    await driver.get(`${appUrl}/login`);

    // Find the email input field and enter a valid email
    await driver.findElement(By.css('input[type="email"]')).sendKeys('luketan@gmail.com');

    // Find the password input field and enter a valid password
    await driver.findElement(By.css('input[type="password"]')).sendKeys('123456');

    // Find the login button and click it
    await driver.findElement(By.css('button')).click();

    // Wait for the navigation to the home page
    await driver.wait(until.urlIs(`${appUrl}/`), 5000);

    // Validate that the navigation was successful by checking the current URL
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.equal(`${appUrl}/`);
});

  it('should load "New here?" prompt text in the Login page', async function () {
    await driver.get(`${appUrl}/login`);
    const newUserTitle = await driver.findElement(By.tagName('p')).getText();
    expect(newUserTitle).to.equal('New here?');
  });


  it('should display an error message when no username and password or both are provided', async function () {
    await driver.get(`${appUrl}/login`);
    await driver.findElement(By.css('button')).click();

    // Assuming there is an error message element on the page
    const errorMessageLocator = By.css('.text-red-500.text-sm');
    await driver.wait(until.elementLocated(errorMessageLocator), 5000);
    const errorMessage = await driver.findElement(errorMessageLocator).getText();
    expect(errorMessage).to.equal('Something went wrong, please enter correct email & password');
  });


  it('should display an error message when incorrect email or password is provided', async function () {
    await driver.get(`${appUrl}/login`);
    
    // Enter incorrect email and password (modify as per your application)
    await driver.findElement(By.css('input[type="email"]')).sendKeys('incorrectemail@example.com');
    await driver.findElement(By.css('input[type="password"]')).sendKeys('incorrectpassword');
    await driver.findElement(By.css('button')).click();
  
    // Assuming there is an error message element on the page
    const errorMessageLocator = By.css('.text-red-500.text-sm');
    await driver.wait(until.elementLocated(errorMessageLocator), 5000);
    
    // Retrieve and assert the error message
    const errorMessage = await driver.findElement(errorMessageLocator).getText();
    expect(errorMessage).to.equal('Something went wrong, please enter correct email & password');
  });

 
});





// Register 
describe('Testing Register UI', function () {
  let driver;

  before(async function () {
    this.timeout(10000);
    driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
  });


  it('should load the Register page', async function () {
    await driver.get(`${appUrl}/register`);
    const pageTitle = await driver.findElement(By.tagName('h1')).getText();
    expect(pageTitle).to.equal('Blog Market');
  });


  
  it('should load the "Blog Market" title in the Login page', async function () {
    await driver.get(`${appUrl}/register`);
    const pageTitle = await driver.findElement(By.tagName('h1')).getText();
    expect(pageTitle).to.equal('Blog Market');
  });


  it('should load "Create an account"  in the Register page', async function () {
    await driver.get(`${appUrl}/register`);
    const registerTitle = await driver.findElement(By.tagName('label')).getText();
    expect(registerTitle).to.equal('Create an account');
  });


  
  it('should load the Login button in the Register page', async function () {
    await driver.get(`${appUrl}/register`);
    const loginBtn = await driver.findElement(By.tagName('h3')).getText();
    expect(loginBtn).to.equal('Login');
  });

  it('should navigate to the Login page when the user taps on the "Login" button from the Register page', async function () {
    await driver.get(`${appUrl}/register`);

    // Find the element that represents the "Login" button
    const loginButton = await driver.findElement(By.linkText('Login'));

    // Click on the "Login" button
    await loginButton.click();

    // Wait for the page to load after navigation
    await driver.wait(until.urlIs(`${appUrl}/login`), 5000);

    // Check if the current URL matches the Login page URL
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.equal(`${appUrl}/login`);
});

  it('should load "Enter your username" placeholder text in the Register page', async function () {
    await driver.get(`${appUrl}/register`);
    const usernameInput = await driver.findElement(By.css('input[type="text"]'));
    const placeholderText = await usernameInput.getAttribute('placeholder');
    expect(placeholderText).to.equal('Enter your username');
});

it('should load "Enter your email" placeholder text in the Register page', async function () {
    await driver.get(`${appUrl}/register`);
    const emailInput = await driver.findElement(By.css('input[type="email"]'));
    const placeholderText = await emailInput.getAttribute('placeholder');
    expect(placeholderText).to.equal('Enter your email');
});

it('should load "Enter your password" placeholder text in the Register page', async function () {
    await driver.get(`${appUrl}/register`);
    const passwordInput = await driver.findElement(By.css('input[type="password"]'));
    const placeholderText = await passwordInput.getAttribute('placeholder');
    expect(placeholderText).to.equal('Enter your password');
});


  it('should register a new user successfully and navigate to login page', async function () {
    await driver.get(`${appUrl}/register`);
    await driver.findElement(By.css('input[type="text"]')).sendKeys('uniqueusername');
    await driver.findElement(By.css('input[type="email"]')).sendKeys('testuser@example.com');
    await driver.findElement(By.css('input[type="password"]')).sendKeys('testpassword');
    await driver.findElement(By.css('button')).click();

    // Wait for the page to load after registration
    await driver.wait(until.urlIs(`${appUrl}/login`), 5000);


       // Check if the current URL matches the Login page URL
       const currentUrl = await driver.getCurrentUrl();
       expect(currentUrl).to.equal(`${appUrl}/login`);
  });

  it('should display an error message for unsuccessful registration', async function () {
    await driver.get(`${appUrl}/register`);
    // Attempt to register without providing any information
    await driver.findElement(By.css('button')).click();

    // Assuming there is an error message element on the page
    const errorMessageLocator = By.css('.text-red-500.text-sm');
    await driver.wait(until.elementLocated(errorMessageLocator), 5000);
    const errorMessage = await driver.findElement(errorMessageLocator).getText();
    expect(errorMessage).to.equal('please enter correct username, email, & password');
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
    expect(errorMessage).to.equal('Username is already in use. Please choose a new username.');
  });


  it('should display an error message for unsuccessful registration with existing email', async function () {
    await driver.get(`${appUrl}/register`);
    
    // Try to register with the same email used in the previous test case
    await driver.findElement(By.css('input[type="text"]')).sendKeys('anotheruniqueusername');
    await driver.findElement(By.css('input[type="email"]')).sendKeys('testuser@example.com');
    await driver.findElement(By.css('input[type="password"]')).sendKeys('anotherpassword');
    await driver.findElement(By.css('button')).click();

    // Assuming there is an error message element on the page
    const errorMessageLocator = By.css('.text-red-500.text-sm');
    await driver.wait(until.elementLocated(errorMessageLocator), 5000);
    
    // Retrieve and assert the error message
    const errorMessage = await driver.findElement(errorMessageLocator).getText();
    expect(errorMessage).to.equal('Email is already in use. Please use a different email address.');
});

it('should load "Already have an account?" prompt text in the Register page', async function () {
  await driver.get(`${appUrl}/register`);
  const existingUserTitle = await driver.findElement(By.tagName('p')).getText();
  expect(existingUserTitle).to.equal('Already have an account?');
});


  
});



after(async function () {
  await driver.quit();
  setTimeout(() => {
    console.log("Terminating the test suite.");
    process.exit();
  }, 2000);
});

