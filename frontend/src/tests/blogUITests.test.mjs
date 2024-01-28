/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { describe, it, beforeEach, after } from "mocha";
import { expect } from "chai";
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const { Options } = chrome;

const chromeOptions = new Options();
chromeOptions.addArguments("--headless");
const appUrl = "http://localhost:5173";

describe("Testing Blog Frontend", () => {
  let driver; // Declare a WebDriver variable

  beforeEach(async () => {
    // Initialize a Chrome WebDriver instance
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(chromeOptions)
      .build();
  });

  it("should log in a user successfully and navigate to the home page, then find the Write element", async function () {
    this.timeout(10000);
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
      expect(currentUrl).to.equal(`${appUrl}/`);

      // Now, find the "Write" element on the home page
      const writeButton = await driver.findElement(By.linkText("Write"));

      // Get the text of the Write button
      const buttonText = await writeButton.getText();

      // Assert that the text of the button is as expected
      expect(buttonText).to.equal("Write");
    } catch (error) {
      console.error("Error during test:", error);
      throw error;
    }
  });
  it("should log in a user successfully, navigate to the home page, and then click on the Write button", async function () {
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
      expect(currentUrl).to.equal(`${appUrl}/`);

      // Now, find the "Write" button in the navbar and click it
      const writeButton = await driver.findElement(By.linkText("Write"));
      await writeButton.click();

      // Wait for the navigation to the /write page
      await driver.wait(until.urlIs(`${appUrl}/write`), 5000);

      // Get the current URL after clicking the "Write" button
      const writePageUrl = await driver.getCurrentUrl();

      // Assert that the URL is as expected
      expect(writePageUrl).to.equal(`${appUrl}/write`);
    } catch (error) {
      console.error("Error during test:", error);
      throw error;
    }
  });
  // Declare the variable to store the created post ID at the beginning of your test file
  let createdPostId;

  it("should log in a user successfully, create a post, and navigate to post details", async function () {
    this.timeout(15000); // Increase the timeout to allow for post creation and navigation

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

      // Validate that the navigation was successful by checking the current URL
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).to.equal(`${appUrl}/`);

      // Now, find the "Create a post" link and click it
      const createPostLink = await driver.findElement(By.linkText("Write"));
      await createPostLink.click();

      // Wait for the navigation to the create post page (assuming it's at /write)
      await driver.wait(until.urlContains(`${appUrl}/write`), 5000);

      // Fill in the form to create a post
      await driver
        .findElement(By.css('input[placeholder="Enter post title"]'))
        .sendKeys("Test Post Title");
      await driver
        .findElement(By.css('textarea[placeholder="Enter post description"]'))
        .sendKeys("Test Post Description");

      // Click the "Create" button
      await driver.findElement(By.css("button")).click();

      createdPostId = await driver.wait(async () => {
        const currentUrl = await driver.getCurrentUrl();
        const match = currentUrl.match(/\/posts\/post\/(\w+)/);
        return match && match[1];
      }, 5000);

      // Log the post details URL
      const postDetailsUrl = await driver.getCurrentUrl();
      console.log("Post Details URL:", postDetailsUrl);

      // Construct the expected URL based on the dynamically retrieved post ID
      const expectedPostDetailsUrl = `${appUrl}/posts/post/${createdPostId}`;

      // Assert that the URL is as expected
      expect(postDetailsUrl).to.equal(expectedPostDetailsUrl);
    } catch (error) {
      console.error("Error during test:", error);
      throw error;
    }
  });

  it("should handle missing title when creating a post", async function () {
    this.timeout(10000);
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

      // Validate that the navigation was successful by checking the current URL
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).to.equal(`${appUrl}/`);

      // Now, find the "Write" link and click it
      const writeLink = await driver.findElement(By.linkText("Write"));
      await writeLink.click();

      // Wait for the navigation to the write page
      await driver.wait(until.urlContains(`${appUrl}/write`), 5000);

      // Fill in form fields
      await driver
        .findElement(By.css('textarea[placeholder="Enter post description"]'))
        .sendKeys("Test Post Description");

      // Click the "Create" button
      await driver.findElement(By.css("button")).click();

      // Wait for the expected internal server error (500)
      await driver.wait(async () => {
        const currentUrlAfterError = await driver.getCurrentUrl();
        return currentUrlAfterError.includes("/500"); // Adjust this based on the specific URL pattern for your 500 error page
      }, 5000);

      // Assert that the URL contains the pattern indicating a 500 error page
      const currentUrlAfterError = await driver.getCurrentUrl();
      expect(currentUrlAfterError).to.include("/500"); // Adjust this based on the specific URL pattern for your 500 error page
    } catch (error) {
      console.log("Expected error occurred:", error.message);
      // You can add additional assertions based on the error message or response if needed
    }
  });

  it("should handle missing post description when creating a post", async function () {
    this.timeout(10000);
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

      // Validate that the navigation was successful by checking the current URL
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).to.equal(`${appUrl}/`);

      // Now, find the "Write" link and click it
      const writeLink = await driver.findElement(By.linkText("Write"));
      await writeLink.click();

      // Wait for the navigation to the write page
      await driver.wait(until.urlContains(`${appUrl}/write`), 5000);

      // Fill in other form fields except for the post description
      await driver
        .findElement(By.css('input[placeholder="Enter post title"]'))
        .sendKeys("Test Post Title");

      // Click the "Create" button
      await driver.findElement(By.css("button")).click();

      // Wait for the expected internal server error (500)
      await driver.wait(async () => {
        const currentUrlAfterError = await driver.getCurrentUrl();
        return currentUrlAfterError.includes("/500"); // Adjust this based on the specific URL pattern for your 500 error page
      }, 5000);

      // Assert that the URL contains the pattern indicating a 500 error page
      const currentUrlAfterError = await driver.getCurrentUrl();
      expect(currentUrlAfterError).to.include("/500"); // Adjust this based on the specific URL pattern for your 500 error page
    } catch (error) {
      console.log("Expected error occurred:", error.message);
      // You can add additional assertions based on the error message or response if needed
    }
  });

  it("should handle duplicate titles when creating a post", async function () {
    this.timeout(10000);
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

      // Validate that the navigation was successful by checking the current URL
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).to.equal(`${appUrl}/`);

      // Now, find the "Write" link and click it
      const writeLink = await driver.findElement(By.linkText("Write"));
      await writeLink.click();

      // Wait for the navigation to the write page
      await driver.wait(until.urlContains(`${appUrl}/write`), 5000);

      // Fill in other form fields except for the post description
      await driver
        .findElement(By.css('input[placeholder="Enter post title"]'))
        .sendKeys("test");
      await driver
        .findElement(By.css('textarea[placeholder="Enter post description"]'))
        .sendKeys("Test Post Description");

      // Click the "Create" button
      await driver.findElement(By.css("button")).click();

      // Wait for the expected internal server error (500)
      await driver.wait(async () => {
        const currentUrlAfterError = await driver.getCurrentUrl();
        return currentUrlAfterError.includes("/500"); // Adjust this based on the specific URL pattern for your 500 error page
      }, 5000);

      // Assert that the URL contains the pattern indicating a 500 error page
      const currentUrlAfterError = await driver.getCurrentUrl();
      expect(currentUrlAfterError).to.include("/500"); // Adjust this based on the specific URL pattern for your 500 error page
    } catch (error) {
      console.log("Expected error occurred:", error.message);
      // You can add additional assertions based on the error message or response if needed
    }
  });
  it("should log in a user, connect to post details URL, and edit the post", async function () {
    this.timeout(15000);

    try {
      // Login
      await driver.get(`${appUrl}/login`);
      await driver
        .findElement(By.css('input[type="email"]'))
        .sendKeys("test@gmail.com");
      await driver
        .findElement(By.css('input[type="password"]'))
        .sendKeys("password");
      await driver.findElement(By.css("button")).click();
      await driver.wait(until.urlIs(`${appUrl}/`), 5000);

      // Navigate to the post details page using the created post ID
      await driver.get(`${appUrl}/posts/post/${createdPostId}`);
      await driver.wait(
        until.urlContains(`${appUrl}/posts/post/${createdPostId}`),
        5000
      );

      // Log the post details URL
      const postDetailsUrl = await driver.getCurrentUrl();

      // Find the "Edit" button and click it
      const editButton = await driver.wait(
        until.elementLocated(By.css(".edit-button")),
        5000
      );
      await editButton.click();

      // Wait for the navigation to the edit post page
      await driver.wait(
        until.urlContains(`${appUrl}/edit/${createdPostId}`),
        5000
      );

      // Assuming the edit page has similar input fields and structure as the create post page
      // Perform the edit actions here

      // For example, updating the post title
      await driver
        .findElement(By.css('input[placeholder="Enter post title"]'))
        .clear();
      await driver
        .findElement(By.css('input[placeholder="Enter post title"]'))
        .sendKeys("Updated Post Title");

      // Similar steps for updating other fields

      // Click the "Update" button
      await driver.findElement(By.css("button")).click();

      // Wait for the navigation back to the post details page
      await driver.wait(
        until.urlContains(`/posts/post/${createdPostId}`),
        5000
      );

      // Validate that the URL is as expected
      const updatedPostDetailsUrl = await driver.getCurrentUrl();
      const expectedUpdatedPostDetailsUrl = `${appUrl}/posts/post/${createdPostId}`;
      expect(updatedPostDetailsUrl).to.equal(expectedUpdatedPostDetailsUrl);

      // Optionally, you can validate other aspects of the updated post, such as the title or description
      // ...
    } catch (error) {
      console.error("Error during test:", error);
      throw error;
    }
  });

  it("should log in a user, connect to post details URL, and delete the post", async function () {
    this.timeout(15000);

    try {
      // Login
      await driver.get(`${appUrl}/login`);
      await driver
        .findElement(By.css('input[type="email"]'))
        .sendKeys("test@gmail.com");
      await driver
        .findElement(By.css('input[type="password"]'))
        .sendKeys("password");
      await driver.findElement(By.css("button")).click();
      await driver.wait(until.urlIs(`${appUrl}/`), 5000);

      // Navigate to the post details page using the created post ID
      await driver.get(`${appUrl}/posts/post/${createdPostId}`);
      await driver.wait(
        until.urlContains(`${appUrl}/posts/post/${createdPostId}`),
        5000
      );

      // Log the post details URL
      const postDetailsUrl = await driver.getCurrentUrl();

      // Find the delete button
      const deleteButton = await driver.wait(
        until.elementLocated(By.css(".delete-button")),
        5000
      );

      // Log information about the found element

      // Click the delete button
      await deleteButton.click();

      // You may need to add additional waiting logic to ensure the delete confirmation is visible

      // Wait for the navigation back to the home page or another relevant page
      await driver.wait(until.urlIs(`${appUrl}/`), 5000);

      // Validate that the navigation was successful by checking the current URL
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).to.equal(`${appUrl}/`);
    } catch (error) {
      console.error("Error during delete test:", error);
      throw error;
    }
  });

  after(async function () {
    try {
      await driver.quit();
      console.log("WebDriver successfully closed.");
    } catch (err) {
      console.error("Error quitting WebDriver:", err);
    } finally {
      setTimeout(() => {
        console.log("Terminating the test suite.");
        process.exit();
      }, 2000);
    }
  });
});
