
# Educational Video Platform

Welcome to the Educational Video Platform, a web application designed to provide users with access to approved educational video content. This platform allows users to sign up, sign in (as either a regular user or admin), watch videos, track their viewing habits, and upload educational content for approval. It also includes a personalized dashboard with visual progress tracking and an educational chatbot powered by the Groq API for resolving doubts.

## Features

### Authentication
- **Sign Up**: Users must register with their first name, last name, email, and password.
- **Sign In**: Existing users can log in with their email and password. There are two types of accounts:
  - **User**: Regular account with access to the main video page and personalized dashboard.
  - **Admin**: Special account with access to approve or reject uploaded videos.

### Main Page (User)
- Displays thumbnails of all approved videos.
- Clicking a video:
  - Increases its view count.
  - Tracks user history, including:
    - Total time spent watching videos.
    - Categories watched.
    - Monthly activity.
    - Percentage of each video completed.
    - Total videos watched.

### Personalized Dashboard (User)
- Visual representation of user progress using various graphs, based on:
  - Total watch time.
  - Categories viewed.
  - Monthly activity.
  - Video completion rates.
  - Total videos watched.

### Content Creation (User)
- Users can upload content with the following details:
  - Thumbnail image.
  - Video file.
  - Title.
  - Description.
  - Type.
  - Category.
- Uploaded content is sent to the admin for approval.

### Admin Panel
- Lists all unapproved videos uploaded by users.
- Admins manually verify content to ensure it is educational.
- Approve or reject videos based on the verification.

### Doubts Section (User)
- Integrated educational chatbot powered by the Groq API.
- Users can ask education-related doubts, and the chatbot provides relevant responses.

## Tech Stack
- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js
- **Database**: MongoDB
- **AI/Chatbot**: Groq API

## Folder Structure
main-project-

    frontend
  
    backend

## Getting Started

### Prerequisites
- **Node.js**: For running the backend and frontend.
- **npm or yarn**: For package management.
- **MongoDB**: Set up a local or cloud instance (e.g., MongoDB Atlas).
- **Groq API Key**: Obtain an API key from Groq for the chatbot functionality.
- **Cloudinary**: To post the videos and convert them to urls.
- **Web Browser**: For accessing the frontend.

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Srinidhi-4419/Edutech-platform
   cd Edutech-platform
2.**Set Up Backend**

    cd backend
    npm install
# Configure environment variables (e.g., MongoDB URI, Groq API key, JWT secret)
npm start or nodemon index.js

3. **Set up Frontend**
   
     cd frontend
   
     npm install
   
     npm run dev
   
## Access the Application
- Open your browser and navigate to `http://localhost:3000` (or the port specified in your frontend setup).

## Usage
- **Sign Up**: Create a new account with your details.
- **Sign In**: Log in as a user or admin.
- **Explore Videos**: Browse approved videos on the main page as a user.
- **Upload Content**: Submit educational videos for approval.
- **Track Progress**: View your personalized dashboard with visual analytics.
- **Ask Doubts**: Use the Groq-powered educational chatbot in the doubts section.
## Live website Url
[Link to Demo Video](https://frontend-9ox1wq4vb-kulkarnisrinidhi85-gmailcoms-projects.vercel.app)
Admin credentials- email:winners@gmail.com password:kings@4444

 ## Contributing
Contributions are welcome! Please fork this repository, make your changes, and submit a pull request.

## License
This project is licensed under the MIT License.
