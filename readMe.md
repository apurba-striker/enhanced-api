# Enhanced API Authentication Backend for a Social Media App

The Backend API offers an advanced authentication solution tailored for users, managing login and registration routes seamlessly. Notably, users have the option to register using their Google credentials, enhancing accessibility and convenience. Both user details and account information are securely stored in a MongoDB database, ensuring data integrity and reliability.

One standout feature is the capability for users to toggle between public and private visibility settings, controlling access to their account information. Additionally, users can log in as either an admin or a regular user. Admin privileges grant full access to all user profiles, while regular users are limited to viewing only public accounts.

Furthermore, users retain the flexibility to update their user details and account information at any time, empowering them with control over their personal data. Prior to accessing protected routes such as 'myProfile' or 'dashboard', a thorough authorization check is performed, ensuring security and privacy are maintained throughout the user experience. This comprehensive approach guarantees a robust and user-centric authentication system.

Note :- Change routes like "/dahboard" ,"/" as one's liking. 

# Steps to run
1. Fork the folder
2. Run npm install
3. Run nodemon index.js

# Schema Structure
The Backend API operates based on three main database collections, each with specific structures expected from the frontend:

### User_Details: This collection stores user-specific information. It includes fields such as:

1. user_id: An automatically generated unique identifier for each user.
2. name: The user's name, stored as a string.
3. email: The user's email address, stored as a string.
4. phone: The user's phone number, stored as a string.
5. password: The user's encrypted password, stored as a string (hashed using bcrypt).
6. user_type: Specifies whether the user is an admin or a normal user, stored as a string.

### Account_Details: This collection holds details related to user accounts. It includes fields like:

1. account_id: Corresponds to the user_id from the User_Details collection, ensuring a link between user and account details.
2. name: The name associated with the account, stored as a string.
3. email: The email associated with the account, stored as a string.
4. phone: The phone number associated with the account, stored as a string.
5. bio: A brief biography or description associated with the account, stored as a string.
6. password: The encrypted password associated with the account, stored as a string (hashed using bcrypt).
7. visibility: Indicates whether the account is set to public or private, stored as a string.

It's important to note that passwords are encrypted using bcrypt to ensure secure storage and authentication processes. These structured collections enable the Backend API to efficiently manage user and account information while maintaining security and integrity.

# API Endpoints

The Backend API offers the following routes and functionalities:

1. GET "/auth/google": Initiates Google sign-up process.

2. GET "/auth/google/dashboard": Callback URL for Google sign-up authentication.

3. GET "/": Home Page route, customizable to suit specific needs.

4. GET "/dashboard": Dashboard page route, customizable to fit user requirements.

5. POST "/register": Allows registration by accepting fields like name, email, phone, password, and user_type. Creates a new user and account if not previously registered.

6. POST "/login": Enables login for already registered users using email and password.

7. GET "/myProfile": Requires user authentication to access their own profile.

8. PATCH "/edit": Requires user authentication to edit their account and user details.

9. GET "/user/:id": Requires user authentication to access a profile by its ID provided in the request parameters.

10. GET "/allProfile": Requires user authentication and returns a list of profile IDs to the frontend.

11. GET "/logout": Logs the user out.


