# Dockerfile
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 5000

# Set the environment to production by default
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "prod"]

# End of Dockerfile