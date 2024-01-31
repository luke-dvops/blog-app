# Use the official Node.js 18 image as a base image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the server application files
COPY . .

# Expose port 5000
EXPOSE 5000

# Command to run the server
CMD ["npm", "run", "start"]
