# Use an official Node runtime as a parent image
FROM node:19-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Install Prisma CLI globally
RUN npm install -g prisma

# Bundle app source
COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run prisma generate
RUN npx prisma generate

# Run the app when the container launches
CMD ["node", "./bin/start.js"]
