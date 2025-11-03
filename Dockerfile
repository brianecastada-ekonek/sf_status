# Use Node 20 (LTS)
FROM node:20

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the source code
COPY . .

# Expose the API port (change if your API uses another port)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
