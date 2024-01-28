/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event"; // Import userEvent
import { BrowserRouter as Router } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register"; // Import your Register component
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome.js");
import axios from 'axios'; // Import axios
import CreatePost from '../pages/CreatePost';


import { MemoryRouter } from 'react-router-dom'; 

const { Options } = chrome;

const chromeOptions = new Options();
chromeOptions.addArguments("--headless");

// Mock the dependencies
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const WrappedComponent = () => (
  <Router>
    <CreatePost />
  </Router>
);

const appUrl = "http://localhost:5173";
let driver;

beforeAll(async () => {
  jest.setTimeout(10000);
  driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();
});

//Login
describe("Testing Login UI", () => {
  test("should log in a user successfully and navigate to the home page, then find the Write element", async () => {
    try {
      await driver.get(`${appUrl}/login`);

      await driver
        .findElement(By.css('input[type="email"]'))
        .sendKeys("test@gmail.com");
      await driver
        .findElement(By.css('input[type="password"]'))
        .sendKeys("password");
      await driver.findElement(By.css("button")).click();

      await driver.wait(until.urlIs(`${appUrl}/`), 5000);
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toEqual(`${appUrl}/`);

      const writeButton = await driver.findElement(By.linkText("Write"));
      const buttonText = await writeButton.getText();

      expect(buttonText).toEqual("Write");
    } catch (error) {
      console.error("Error during test:", error);
      throw error;
    }
  });
  test("should log in a user successfully, navigate to the home page, and then click on the Write button", async () => {
    try {
      await driver.get(`${appUrl}/login`);

      // Find the email input field and enter a valid email
      await driver
        .findElement(By.css('input[type="email"]'))
        .sendKeys("test@gmail.com");

      // Find the password input field and enter a valid password
      await driver
        .findElement(By.css('input[type="password"]'))
        .sendKeys("password");

      // Find the login button and click it
      await driver.findElement(By.css("button")).click();

      // Wait for the navigation to the home page
      await driver.wait(until.urlIs(`${appUrl}/`), 5000);

      // Validate that the navigation was successful by checking the current URL
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toEqual(`${appUrl}/`);

      // Now, find the "Write" button in the navbar and click it
      const writeButton = await driver.findElement(By.linkText("Write"));
      await writeButton.click();

      // Wait for the navigation to the /write page
      await driver.wait(until.urlIs(`${appUrl}/write`), 5000);

      // Get the current URL after clicking the "Write" button
      const writePageUrl = await driver.getCurrentUrl();

      // Assert that the URL is as expected
      expect(writePageUrl).toEqual(`${appUrl}/write`);
    } catch (error) {
      console.error("Error during test:", error);
      throw error;
    }
  });

  test('should add a category', async () => {
    render(<MemoryRouter><CreatePost /></MemoryRouter>); // Render your CreatePost component
  
    // Simulate adding a category
    const categoryInput = screen.getByPlaceholderText('Enter post category');
    userEvent.type(categoryInput, 'New Category'); // Type a new category
  
    // Wait for the input element's value to update
    await waitFor(() => {
      expect(categoryInput).toHaveValue('New Category');
    });
  
    // Simulate clicking the "Add" button
    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);
  
    // Assert that the category is added
    expect(screen.getByText(/New Category/i)).toBeInTheDocument(); // Using a regular expression to match the text "New Category"
  });

  test('should delete a category', () => {
    render( <MemoryRouter> <CreatePost /> </MemoryRouter>); // Render your component

    // Simulate adding a category
    const categoryInput = screen.getByPlaceholderText('Enter post category');
    userEvent.type(categoryInput, 'New Category'); // Type a new category
    fireEvent.click(screen.getByText('Add')); // Click the button to add the category

  // Simulate deleting the category
  const deleteButton = screen.getByRole('button', {
    class: 'text-white bg-black rounded-full cursor-pointer p-1 text-sm',
  });
  fireEvent.click(deleteButton);


    // Assert that the category is deleted
    expect(screen.queryByText('New Category')).not.toBeInTheDocument();
  });

 

  test('should handle post creation with image upload', async () => {
    // Mock user data and axios response
    const mockUser = { username: 'testuser', _id: '123456' };
    const mockPostId = '789abc';
    const mockPostResponse = { data: { _id: mockPostId } };

    // Mock axios.post() to simulate successful post creation
    axios.post.mockResolvedValueOnce(mockPostResponse);

    render(<CreatePost />);

    // Simulate user interactions
    fireEvent.change(screen.getByPlaceholderText('Enter post title'), { target: { value: 'Test Post Title' } });
    // Simulate file upload
    // fireEvent.change(screen.getByTestId('file-input'), { target: { files: [new File(['image'], 'image.png', { type: 'image/png' })] } });
    fireEvent.change(screen.getByPlaceholderText('Enter post description'), { target: { value: 'Test Post Description' } });
    fireEvent.click(screen.getByText('Create'));

    // Wait for post creation
    await screen.findByText('Post Details');

    // Assert axios.post() is called with correct data
    expect(axios.post).toHaveBeenCalledWith(`${URL}/api/posts/create`, {
      title: 'Test Post Title',
      desc: 'Test Post Description',
      username: mockUser.username,
      userId: mockUser._id,
      categories: [],
    }, { withCredentials: true });

    // Assert navigation is performed to post details page
    expect(window.location.href).toEqual(`${appUrl}/posts/post/${mockPostId}`);
  });
  

  it("should handle internal server error (500) when creating a post with duplicate title", async () => {
    try {
      // Navigate to login page
      await driver.get(`${appUrl}/login`);

      // Find the email input field and enter a valid email
      await driver
        .findElement(By.css('input[type="email"]'))
        .sendKeys("test@gmail.com");

      // Find the password input field and enter a valid password
      await driver
        .findElement(By.css('input[type="password"]'))
        .sendKeys("password");

      // Find the login button and click it
      await driver.findElement(By.css("button")).click();

      // Wait for the navigation to the home page
      await driver.wait(until.urlIs(`${appUrl}/`), 5000);

      // Now, find the "Write" link and click it
      const writeLink = await driver.findElement(By.linkText("Write"));
      await writeLink.click();

      // Log the current URL after clicking "Write" link
      console.log(
        'Current URL after clicking "Write" link:',
        await driver.getCurrentUrl()
      );

      // Wait for the navigation to the write page
      await driver.wait(until.urlContains(`${appUrl}/write`), 10000);

      // Fill in form fields
      const postTitle = "Test Post Title";
      const postDescription = "Test Post Description";

      await driver
        .findElement(By.css('input[placeholder="Enter post title"]'))
        .sendKeys(postTitle);

      await driver
        .findElement(By.css('textarea[placeholder="Enter post description"]'))
        .sendKeys(postDescription);

      // Click the "Create" button
      await driver.findElement(By.css("button")).click();

      // Log the current URL after clicking "Create" button
      console.log(
        'Current URL after clicking "Create" button:',
        await driver.getCurrentUrl()
      );

      // Wait for the expected internal server error (500)
      await driver.wait(async () => {
        const currentUrlAfterError = await driver.getCurrentUrl();
        return currentUrlAfterError.includes("/500");
      }, 10000);

      // Assert that the URL contains the pattern indicating a 500 error page
      const currentUrlAfterError = await driver.getCurrentUrl();
      expect(currentUrlAfterError).toContain("/500");

      console.log("Test completed successfully.");
    } catch (error) {
      console.error("Expected error occurred:", error.message);
      throw error; // Re-throw the error to fail the test
    }
  }, 20000); // Increased timeout further for debugging purposes
});

afterAll(async () => {
  await driver.quit();
  jest.setTimeout(() => {
    console.log("Terminating the test suite.");
    process.exit();
  }, 2000);
});
